import type { FastifyInstance, preHandlerAsyncHookHandler } from 'fastify';

import { AppError } from '../../shared/errors/app-error.js';
import { getDeviceId, parseRequest, successEnvelope } from '../../shared/http/http-helpers.js';
import { VerifyPinRequestSchema } from '../../shared/schemas/api-schemas.js';
import type { CommandCatalogPort } from '../commands/command-catalog.js';
import type { ConfirmationTokenService } from './confirmation-token-service.js';
import type { PinVerifierPort } from './pin-verifier.js';

interface SecurityRouteDependencies {
  readonly commandCatalog: CommandCatalogPort;
  readonly confirmations: ConfirmationTokenService;
  readonly pinVerifier: PinVerifierPort;
  readonly requireOwner: preHandlerAsyncHookHandler;
}

export function registerSecurityRoutes(
  app: FastifyInstance,
  { commandCatalog, confirmations, pinVerifier, requireOwner }: SecurityRouteDependencies,
): void {
  app.post(
    '/api/security/verify-pin',
    {
      config: {
        rateLimit: {
          max: 5,
          timeWindow: '1 minute',
        },
      },
      preHandler: requireOwner,
    },
    async (request) => {
      const body = parseRequest(VerifyPinRequestSchema, request.body);
      const command = commandCatalog.getById(body.commandId);

      if (!['sensitive', 'critical'].includes(command.risk) || !command.enabled) {
        throw new AppError(
          400,
          'PIN_NOT_APPLICABLE',
          'Este comando não aceita confirmação por PIN.',
        );
      }

      if (!(await pinVerifier.verify(body.pin))) {
        throw new AppError(
          401,
          'AUTHENTICATION_FAILED',
          'Não foi possível confirmar a identidade.',
        );
      }

      return successEnvelope(confirmations.issue(getDeviceId(request), command.id), request);
    },
  );
}

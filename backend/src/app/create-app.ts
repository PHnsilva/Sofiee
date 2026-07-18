import { randomUUID } from 'node:crypto';

import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import Fastify, {
  type FastifyInstance,
  type FastifyRequest,
  type preHandlerAsyncHookHandler,
} from 'fastify';

import { AssistantService } from '../modules/assistant/assistant-service.js';
import { registerAssistantRoutes } from '../modules/assistant/assistant-routes.js';
import { StaticCommandCatalog } from '../modules/commands/command-catalog.js';
import { CommandExecutionService } from '../modules/commands/command-execution-service.js';
import { CommandRouter } from '../modules/commands/command-router.js';
import { StaticPersonalityRepository } from '../modules/personalities/personality-repository.js';
import { createModelProvider } from '../modules/providers/create-model-provider.js';
import type { ModelProviderPort } from '../modules/providers/model-provider-port.js';
import { AccessKeyAuthenticator } from '../modules/security/access-key-authenticator.js';
import { CommandPolicy } from '../modules/security/command-policy.js';
import { ConfirmationTokenService } from '../modules/security/confirmation-token-service.js';
import { Argon2PinVerifier, type PinVerifierPort } from '../modules/security/pin-verifier.js';
import { registerSecurityRoutes } from '../modules/security/security-routes.js';
import { registerSystemRoutes } from '../modules/system/system-routes.js';
import type { AppConfig } from '../shared/config/environment.js';
import {
  loadPublicConfiguration,
  type PublicConfiguration,
} from '../shared/config/public-configuration.js';
import { AppError } from '../shared/errors/app-error.js';
import { parseRequest } from '../shared/http/http-helpers.js';
import { DeviceIdSchema } from '../shared/schemas/api-schemas.js';

interface CreateAppOptions {
  readonly config: AppConfig;
  readonly logger?: boolean;
  readonly modelProvider?: ModelProviderPort;
  readonly pinVerifier?: PinVerifierPort;
  readonly publicConfiguration?: PublicConfiguration;
}

function authorizationHeader(request: FastifyRequest): string | undefined {
  const value = request.headers.authorization;
  return typeof value === 'string' ? value : undefined;
}

interface ErrorDetails {
  readonly code?: string;
  readonly name?: string;
  readonly statusCode?: number;
}

function errorDetails(error: unknown): ErrorDetails {
  if (typeof error !== 'object' || error === null) {
    return {};
  }
  const candidate = error as Record<string, unknown>;
  return {
    ...(typeof candidate.code === 'string' ? { code: candidate.code } : {}),
    ...(typeof candidate.name === 'string' ? { name: candidate.name } : {}),
    ...(typeof candidate.statusCode === 'number' ? { statusCode: candidate.statusCode } : {}),
  };
}

export async function createApp(options: CreateAppOptions): Promise<FastifyInstance> {
  const { config } = options;
  const app = Fastify({
    bodyLimit: 16 * 1_024,
    genReqId: () => `req_${randomUUID()}`,
    logger:
      options.logger === false
        ? false
        : {
            level: config.logLevel,
            redact: {
              censor: '[REDACTED]',
              paths: [
                'req.headers.authorization',
                'request.headers.authorization',
                'body.pin',
                'body.confirmationToken',
              ],
            },
          },
    requestTimeout: config.requestTimeoutMs + 5_000,
    trustProxy: true,
  });

  await app.register(helmet, {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'none'"],
        frameAncestors: ["'none'"],
      },
    },
    crossOriginResourcePolicy: { policy: 'same-site' },
  });

  await app.register(cors, {
    allowedHeaders: ['Authorization', 'Content-Type', 'X-Device-Id', 'X-Request-Id'],
    credentials: false,
    methods: ['GET', 'POST', 'OPTIONS'],
    origin(origin, callback) {
      if (origin === undefined || config.allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }
      callback(
        new AppError(403, 'ORIGIN_NOT_ALLOWED', 'A origem da requisição não é permitida.'),
        false,
      );
    },
    strictPreflight: true,
  });

  await app.register(rateLimit, {
    max: config.rateLimitMax,
    timeWindow: '1 minute',
  });

  const publicConfiguration = options.publicConfiguration ?? loadPublicConfiguration();
  const personalities = new StaticPersonalityRepository(publicConfiguration.personalities);
  const commandCatalog = new StaticCommandCatalog(publicConfiguration.commands);
  const commandRouter = new CommandRouter(commandCatalog, personalities.list());
  const modelProvider = options.modelProvider ?? createModelProvider(config);
  const confirmations = new ConfirmationTokenService(config.authSigningSecret);
  const pinVerifier = options.pinVerifier ?? new Argon2PinVerifier(config.ownerPinHash);
  const policy = new CommandPolicy(confirmations);
  const commandExecution = new CommandExecutionService(commandCatalog, personalities, policy);
  const assistant = new AssistantService(
    commandRouter,
    commandExecution,
    modelProvider,
    personalities,
  );
  const accessKeyAuthenticator = new AccessKeyAuthenticator(config.ownerAccessKey);

  const requireOwner: preHandlerAsyncHookHandler = (request) => {
    if (!accessKeyAuthenticator.isAuthorized(authorizationHeader(request))) {
      throw new AppError(401, 'UNAUTHORIZED', 'Autenticação obrigatória.');
    }
    parseRequest(DeviceIdSchema, request.headers['x-device-id']);
    return Promise.resolve();
  };

  registerSystemRoutes(app, { modelProvider, publicConfiguration });
  registerAssistantRoutes(app, { assistant, commandExecution, requireOwner });
  registerSecurityRoutes(app, { commandCatalog, confirmations, pinVerifier, requireOwner });

  app.setNotFoundHandler((request, reply) =>
    reply.status(404).send({
      error: { code: 'NOT_FOUND', message: 'Rota não encontrada.' },
      requestId: request.id,
    }),
  );

  app.setErrorHandler((error, request, reply) => {
    const details = errorDetails(error);
    let statusCode = 500;
    let code = 'INTERNAL_ERROR';
    let message = 'Ocorreu um erro interno.';

    if (error instanceof AppError) {
      statusCode = error.statusCode;
      code = error.code;
      message = error.message;
    } else if (details.statusCode === 429) {
      statusCode = 429;
      code = 'RATE_LIMITED';
      message = 'Muitas requisições. Tente novamente em instantes.';
    } else if (details.code === 'FST_ERR_CTP_BODY_TOO_LARGE') {
      statusCode = 413;
      code = 'PAYLOAD_TOO_LARGE';
      message = 'O corpo da requisição excede o limite permitido.';
    } else if (
      details.statusCode !== undefined &&
      details.statusCode >= 400 &&
      details.statusCode < 500
    ) {
      statusCode = details.statusCode;
      code = 'INVALID_REQUEST';
      message = 'A requisição não pôde ser processada.';
    }

    if (statusCode >= 500) {
      request.log.error(
        { errorCode: details.code ?? 'UNKNOWN', errorName: details.name ?? 'UnknownError' },
        'Unhandled request error',
      );
    }

    return reply.status(statusCode).send({
      error: { code, message },
      requestId: request.id,
    });
  });

  return app;
}

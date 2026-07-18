import type { FastifyInstance } from 'fastify';

import type { PublicConfiguration } from '../../shared/config/public-configuration.js';
import { successEnvelope } from '../../shared/http/http-helpers.js';
import type { ModelProviderPort } from '../providers/model-provider-port.js';

interface SystemRouteDependencies {
  readonly modelProvider: ModelProviderPort;
  readonly publicConfiguration: PublicConfiguration;
}

export function registerSystemRoutes(
  app: FastifyInstance,
  { modelProvider, publicConfiguration }: SystemRouteDependencies,
): void {
  app.get('/api/health', (request) =>
    successEnvelope(
      {
        service: 'sofiie-api',
        status: 'ok',
        timestamp: new Date().toISOString(),
        version: '0.1.0',
      },
      request,
    ),
  );

  app.get('/api/config', (request) =>
    successEnvelope(
      {
        capabilities: {
          conversationHistory: false,
          desktopBridge: true,
          pinConfirmation: true,
          speakerVerification: false,
          voiceInput: 'browser',
          voiceOutput: 'browser',
        },
        defaultPersonalityId: 'focused',
        expressions: publicConfiguration.expressions,
        maxMessageLength: 1_000,
        provider: modelProvider.id,
        version: '0.1.0',
      },
      request,
    ),
  );

  app.get('/api/personalities', (request) =>
    successEnvelope({ personalities: publicConfiguration.personalities }, request),
  );

  app.get('/api/commands', (request) =>
    successEnvelope({ commands: publicConfiguration.commands }, request),
  );
}

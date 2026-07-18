import type { FastifyInstance, preHandlerAsyncHookHandler } from 'fastify';

import {
  AssistantResponseSchema,
  ChatRequestSchema,
  CommandExecutionRequestSchema,
} from '../../shared/schemas/api-schemas.js';
import { getDeviceId, parseRequest, successEnvelope } from '../../shared/http/http-helpers.js';
import type { CommandExecutionService } from '../commands/command-execution-service.js';
import type { AssistantService } from './assistant-service.js';

interface AssistantRouteDependencies {
  readonly assistant: AssistantService;
  readonly commandExecution: CommandExecutionService;
  readonly requireOwner: preHandlerAsyncHookHandler;
}

export function registerAssistantRoutes(
  app: FastifyInstance,
  { assistant, commandExecution, requireOwner }: AssistantRouteDependencies,
): void {
  app.post('/api/chat', { preHandler: requireOwner }, async (request) => {
    const body = parseRequest(ChatRequestSchema, request.body);
    const response = await assistant.respond(getDeviceId(request), body);
    return successEnvelope(AssistantResponseSchema.parse(response), request);
  });

  app.post('/api/commands/execute', { preHandler: requireOwner }, (request) => {
    const body = parseRequest(CommandExecutionRequestSchema, request.body);
    const response = commandExecution.executeById(getDeviceId(request), body);
    return successEnvelope(AssistantResponseSchema.parse(response), request);
  });
}

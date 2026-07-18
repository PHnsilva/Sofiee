import type { AssistantResponse, ChatRequest } from '../../shared/schemas/api-schemas.js';
import type { CommandExecutionService } from '../commands/command-execution-service.js';
import type { CommandRouter } from '../commands/command-router.js';
import type { ModelProviderPort } from '../providers/model-provider-port.js';
import type { PersonalityRepositoryPort } from '../personalities/personality-repository.js';

export class AssistantService {
  constructor(
    private readonly commandRouter: CommandRouter,
    private readonly commandExecution: CommandExecutionService,
    private readonly modelProvider: ModelProviderPort,
    private readonly personalities: PersonalityRepositoryPort,
  ) {}

  async respond(deviceId: string, request: ChatRequest): Promise<AssistantResponse> {
    const personality = this.personalities.getById(request.personalityId);
    const resolved = this.commandRouter.resolve(request.message);

    if (resolved !== undefined) {
      return this.commandExecution.execute({
        args: resolved.args,
        command: resolved.command,
        deviceId,
        request: {
          ...(resolved.args === undefined ? {} : { args: resolved.args }),
          commandId: resolved.command.id,
          mode: request.mode,
          personalityId: request.personalityId,
        },
      });
    }

    const reply = await this.modelProvider.generate({ message: request.message, personality });
    return {
      action: null,
      command: null,
      expression: 'success',
      provider: this.modelProvider.id,
      reply,
      requiresConfirmation: false,
      source: 'model',
    };
  }
}

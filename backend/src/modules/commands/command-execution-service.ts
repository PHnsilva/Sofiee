import type {
  AssistantAction,
  AssistantResponse,
  CommandArguments,
  CommandExecutionRequest,
} from '../../shared/schemas/api-schemas.js';
import type { PersonalityRepositoryPort } from '../personalities/personality-repository.js';
import type { CommandDefinition } from './command.js';
import type { CommandCatalogPort } from './command-catalog.js';
import type { CommandPolicy } from '../security/command-policy.js';

interface ExecuteOptions {
  readonly args: CommandArguments | undefined;
  readonly command: CommandDefinition;
  readonly deviceId: string;
  readonly request: CommandExecutionRequest;
}

export class CommandExecutionService {
  constructor(
    private readonly commandCatalog: CommandCatalogPort,
    private readonly personalities: PersonalityRepositoryPort,
    private readonly policy: CommandPolicy,
  ) {}

  executeById(deviceId: string, request: CommandExecutionRequest): AssistantResponse {
    return this.execute({
      args: request.args,
      command: this.commandCatalog.getById(request.commandId),
      deviceId,
      request,
    });
  }

  execute({ args, command, deviceId, request }: ExecuteOptions): AssistantResponse {
    const personality = this.personalities.getById(request.personalityId);
    const decision = this.policy.evaluate(command, personality, deviceId, request);

    if (decision === 'confirmation_required') {
      return this.#response(
        command,
        args,
        'Confirme este comando com o PIN do proprietário para continuar.',
        'warning',
        null,
        true,
      );
    }

    switch (command.intent) {
      case 'change_personality': {
        const targetId = args?.personalityId;
        if (targetId === undefined) {
          return this.#response(
            command,
            args,
            'Informe uma personalidade: focada, amigável, sarcástica ou calma.',
            'warning',
          );
        }
        const target = this.personalities.getById(targetId);
        return this.#response(
          command,
          args,
          `Personalidade alterada para ${target.name}.`,
          'success',
          { personalityId: target.id, type: 'client.set_personality' },
        );
      }
      case 'enable_car_mode':
        return this.#response(command, args, 'Modo carro ativado.', 'success', {
          enabled: true,
          type: 'client.set_car_mode',
        });
      case 'disable_car_mode':
        return this.#response(command, args, 'Modo carro desativado.', 'success', {
          enabled: false,
          type: 'client.set_car_mode',
        });
      case 'open_vscode':
        return this.#desktopAppResponse(command, args, 'VS Code', 'vscode');
      case 'open_spotify':
        return this.#desktopAppResponse(command, args, 'Spotify', 'spotify');
      case 'open_browser':
        return this.#desktopAppResponse(command, args, 'navegador', 'browser');
      case 'open_project':
        return this.#response(
          command,
          args,
          'Solicitação para abrir o projeto configurado autorizada.',
          'success',
          { type: 'desktop.open_project' },
        );
      case 'git_status':
        return this.#response(
          command,
          args,
          'Consulta do Git autorizada para o projeto configurado.',
          'success',
          { type: 'desktop.git_status' },
        );
      case 'backend_health':
        return this.#response(command, args, 'Backend online e pronto.', 'success');
      case 'repeat_last':
        return this.#response(command, args, '', 'speaking', { type: 'client.repeat_last' });
      case 'clear_session':
        return this.#response(command, args, 'Sessão atual limpa.', 'success', {
          type: 'client.clear_session',
        });
      case 'list_commands': {
        const available = this.commandCatalog
          .list()
          .filter(
            (item) =>
              item.enabled &&
              personality.allowedCommandCategories.includes(item.category) &&
              (request.mode !== 'car' || item.availableInCar),
          )
          .map(({ name }) => name);
        return this.#response(
          command,
          args,
          `Comandos disponíveis: ${available.join(', ')}.`,
          'success',
        );
      }
      case 'git_push':
        // The catalog keeps this risk visible, but policy rejects it because it is disabled.
        return this.#response(
          command,
          args,
          personality.errorResponses[0] ?? 'Comando indisponível.',
          'error',
        );
      default:
        return this.#response(
          command,
          args,
          personality.errorResponses[0] ?? 'Comando não implementado.',
          'error',
        );
    }
  }

  #desktopAppResponse(
    command: CommandDefinition,
    args: CommandArguments | undefined,
    label: string,
    appId: 'vscode' | 'spotify' | 'browser',
  ): AssistantResponse {
    return this.#response(command, args, `Solicitação para abrir ${label} autorizada.`, 'success', {
      appId,
      type: 'desktop.open_app',
    });
  }

  #response(
    command: CommandDefinition,
    args: CommandArguments | undefined,
    reply: string,
    expression: AssistantResponse['expression'],
    action: AssistantAction | null = null,
    requiresConfirmation = false,
  ): AssistantResponse {
    return {
      action,
      command: {
        ...(args === undefined ? {} : { args }),
        id: command.id,
        risk: command.risk,
      },
      expression,
      provider: 'deterministic',
      reply,
      requiresConfirmation,
      source: 'command',
    };
  }
}

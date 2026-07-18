import { AppError } from '../../shared/errors/app-error.js';
import type { AssistantMode, CommandExecutionRequest } from '../../shared/schemas/api-schemas.js';
import type { CommandDefinition } from '../commands/command.js';
import type { Personality } from '../personalities/personality.js';
import type { ConfirmationTokenService } from './confirmation-token-service.js';

export type PolicyDecision = 'allowed' | 'confirmation_required';

export class CommandPolicy {
  constructor(private readonly confirmations: ConfirmationTokenService) {}

  evaluate(
    command: CommandDefinition,
    personality: Personality,
    deviceId: string,
    request: CommandExecutionRequest,
  ): PolicyDecision {
    this.#enforceMode(command, request.mode);

    if (!personality.allowedCommandCategories.includes(command.category)) {
      throw new AppError(
        403,
        'COMMAND_NOT_ALLOWED',
        'A personalidade atual não permite esta categoria de comando.',
      );
    }

    if (!command.enabled) {
      throw new AppError(409, 'COMMAND_DISABLED', 'Este comando não está disponível no MVP.');
    }

    if (command.risk === 'sensitive' || command.risk === 'critical') {
      const confirmationIsValid = this.confirmations.verify(
        request.confirmationToken,
        deviceId,
        command.id,
      );
      if (!confirmationIsValid) {
        return 'confirmation_required';
      }
    }

    if (command.risk === 'critical' && request.explicitConfirmation !== true) {
      return 'confirmation_required';
    }

    return 'allowed';
  }

  #enforceMode(command: CommandDefinition, mode: AssistantMode): void {
    if (mode !== 'car') {
      return;
    }

    if (command.risk === 'critical') {
      throw new AppError(
        403,
        'CAR_MODE_CRITICAL_BLOCKED',
        'Comandos críticos são bloqueados no modo carro.',
      );
    }

    if (!command.availableInCar) {
      throw new AppError(
        403,
        'COMMAND_UNAVAILABLE_IN_CAR',
        'Este comando não está disponível no modo carro.',
      );
    }
  }
}

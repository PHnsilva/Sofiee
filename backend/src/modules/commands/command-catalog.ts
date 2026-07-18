import { AppError } from '../../shared/errors/app-error.js';
import type { CommandDefinition } from './command.js';

export interface CommandCatalogPort {
  getById(id: string): CommandDefinition;
  list(): readonly CommandDefinition[];
}

export class StaticCommandCatalog implements CommandCatalogPort {
  readonly #commandsById: ReadonlyMap<string, CommandDefinition>;

  constructor(private readonly commands: readonly CommandDefinition[]) {
    this.#commandsById = new Map(commands.map((command) => [command.id, command]));
  }

  getById(id: string): CommandDefinition {
    const command = this.#commandsById.get(id);
    if (command === undefined) {
      throw new AppError(404, 'COMMAND_NOT_FOUND', 'O comando solicitado não existe.');
    }
    return command;
  }

  list(): readonly CommandDefinition[] {
    return this.commands;
  }
}

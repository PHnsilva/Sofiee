import type { CommandArguments } from '../../shared/schemas/api-schemas.js';
import type { Personality } from '../personalities/personality.js';
import type { CommandDefinition } from './command.js';
import type { CommandCatalogPort } from './command-catalog.js';
import { normalizeIntentText } from './normalize-intent.js';

export interface ResolvedCommand {
  readonly args: CommandArguments | undefined;
  readonly command: CommandDefinition;
  readonly normalizedInput: string;
}

interface PhraseCandidate {
  readonly command: CommandDefinition;
  readonly phrase: string;
}

export class CommandRouter {
  readonly #phrases: readonly PhraseCandidate[];

  constructor(
    commandCatalog: CommandCatalogPort,
    private readonly personalities: readonly Personality[],
  ) {
    this.#phrases = commandCatalog
      .list()
      .flatMap((command) =>
        command.phrases.map((phrase) => ({ command, phrase: normalizeIntentText(phrase) })),
      )
      .sort((left, right) => right.phrase.length - left.phrase.length);
  }

  resolve(input: string): ResolvedCommand | undefined {
    const normalizedInput = normalizeIntentText(input);
    const candidate = this.#phrases.find(({ phrase }) =>
      [normalizedInput === phrase, normalizedInput.startsWith(`${phrase} `)].some(Boolean),
    );

    if (candidate === undefined) {
      return undefined;
    }

    const args =
      candidate.command.intent === 'change_personality'
        ? this.#resolvePersonalityArguments(normalizedInput)
        : undefined;

    return {
      args,
      command: candidate.command,
      normalizedInput,
    };
  }

  #resolvePersonalityArguments(normalizedInput: string): CommandArguments | undefined {
    const personality = this.personalities.find(({ id, name }) => {
      const aliases = [normalizeIntentText(id), normalizeIntentText(name)];
      return aliases.some(
        (alias) =>
          normalizedInput === alias ||
          normalizedInput.startsWith(`${alias} `) ||
          normalizedInput.endsWith(` ${alias}`),
      );
    });

    return personality === undefined ? undefined : { personalityId: personality.id };
  }
}

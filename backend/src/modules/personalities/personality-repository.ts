import { AppError } from '../../shared/errors/app-error.js';
import type { Personality } from './personality.js';

export interface PersonalityRepositoryPort {
  getById(id: string): Personality;
  list(): readonly Personality[];
}

export class StaticPersonalityRepository implements PersonalityRepositoryPort {
  readonly #personalitiesById: ReadonlyMap<string, Personality>;

  constructor(private readonly personalities: readonly Personality[]) {
    this.#personalitiesById = new Map(
      personalities.map((personality) => [personality.id, personality]),
    );
  }

  getById(id: string): Personality {
    const personality = this.#personalitiesById.get(id);
    if (personality === undefined) {
      throw new AppError(404, 'PERSONALITY_NOT_FOUND', 'A personalidade solicitada não existe.');
    }
    return personality;
  }

  list(): readonly Personality[] {
    return this.personalities;
  }
}

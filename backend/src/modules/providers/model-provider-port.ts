import type { Personality } from '../personalities/personality.js';

export interface ModelRequest {
  readonly message: string;
  readonly personality: Personality;
}

export interface ModelProviderPort {
  readonly id: string;
  generate(request: ModelRequest): Promise<string>;
}

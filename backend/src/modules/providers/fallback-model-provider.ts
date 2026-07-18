import type { ModelProviderPort, ModelRequest } from './model-provider-port.js';

export class FallbackModelProvider implements ModelProviderPort {
  readonly id: string;

  constructor(
    private readonly primary: ModelProviderPort,
    private readonly fallback: ModelProviderPort,
  ) {
    this.id = primary.id;
  }

  async generate(request: ModelRequest): Promise<string> {
    try {
      return await this.primary.generate(request);
    } catch {
      return this.fallback.generate(request);
    }
  }
}

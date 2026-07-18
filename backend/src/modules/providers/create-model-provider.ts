import type { AppConfig } from '../../shared/config/environment.js';
import { FallbackModelProvider } from './fallback-model-provider.js';
import { GeminiModelProvider } from './gemini-model-provider.js';
import { MockModelProvider } from './mock-model-provider.js';
import type { ModelProviderPort } from './model-provider-port.js';

export function createModelProvider(config: AppConfig): ModelProviderPort {
  const mockProvider = new MockModelProvider();

  if (config.ai.requestedProvider !== 'gemini' || config.ai.apiKey === undefined) {
    return mockProvider;
  }

  return new FallbackModelProvider(
    new GeminiModelProvider({
      apiKey: config.ai.apiKey,
      baseUrl: config.ai.baseUrl,
      model: config.ai.model,
      timeoutMs: config.requestTimeoutMs,
    }),
    mockProvider,
  );
}

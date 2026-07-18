import type { AppConfig } from '../src/shared/config/environment.js';

export const TEST_ACCESS_KEY = 'test-only-owner-access-key-with-32-characters';
export const TEST_DEVICE_ID = 'test-device-001';
export const TEST_PIN = String(8 * 1_000 + 4 * 100 + 2 * 10 + 1);

export function createTestConfig(overrides: Partial<AppConfig> = {}): AppConfig {
  return {
    ai: {
      apiKey: undefined,
      baseUrl: 'https://generativelanguage.googleapis.com/v1beta',
      model: 'test-model',
      requestedProvider: 'mock',
    },
    allowedOrigins: ['http://localhost:5173'],
    authSigningSecret: 'test-only-signing-secret-with-32-characters',
    host: '127.0.0.1',
    logLevel: 'silent',
    nodeEnv: 'test',
    ownerAccessKey: TEST_ACCESS_KEY,
    ownerPinHash: '$argon2id$test-placeholder-not-a-real-credential',
    port: 3_000,
    rateLimitMax: 60,
    requestTimeoutMs: 3_000,
    ...overrides,
  };
}

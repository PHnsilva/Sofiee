import { describe, expect, it } from 'vitest';

import { parseEnvironment } from '../src/shared/config/environment.js';
import { loadPublicConfiguration } from '../src/shared/config/public-configuration.js';

const validEnvironment: NodeJS.ProcessEnv = {
  ALLOWED_ORIGINS: 'http://localhost:5173',
  AUTH_SIGNING_SECRET: 'test-only-signing-secret-with-32-characters',
  NODE_ENV: 'test',
  OWNER_ACCESS_KEY: 'test-only-owner-access-key-with-32-characters',
  OWNER_PIN_HASH: '$argon2id$test-placeholder-not-a-real-credential',
};

describe('configuration', () => {
  it('loads the complete versioned public configuration', () => {
    const config = loadPublicConfiguration();
    expect(config.personalities.map(({ id }) => id)).toEqual([
      'focused',
      'friendly',
      'sarcastic',
      'calm',
    ]);
    expect(config.expressions).toHaveLength(8);
    expect(config.commands.some(({ risk }) => risk === 'critical')).toBe(true);
  });

  it('rejects wildcard CORS and placeholder secrets', () => {
    expect(() => parseEnvironment({ ...validEnvironment, ALLOWED_ORIGINS: '*' })).toThrow();
    expect(() =>
      parseEnvironment({
        ...validEnvironment,
        OWNER_ACCESS_KEY: 'replace-with-a-long-placeholder-secret',
      }),
    ).toThrow();
  });

  it('allows Gemini selection without a key so the provider factory can fall back to mock', () => {
    const config = parseEnvironment({ ...validEnvironment, AI_PROVIDER: 'gemini' });
    expect(config.ai.requestedProvider).toBe('gemini');
    expect(config.ai.apiKey).toBeUndefined();
  });
});

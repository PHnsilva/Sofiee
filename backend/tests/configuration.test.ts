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
  it('rejects a signing secret reused as the owner access key without leaking it', () => {
    const sharedSecret = validEnvironment.OWNER_ACCESS_KEY;
    expect(() =>
      parseEnvironment({ ...validEnvironment, AUTH_SIGNING_SECRET: sharedSecret }),
    ).toThrow('OWNER_ACCESS_KEY and AUTH_SIGNING_SECRET must be different.');
    try {
      parseEnvironment({ ...validEnvironment, AUTH_SIGNING_SECRET: sharedSecret });
    } catch (error) {
      expect(String(error)).not.toContain(sharedSecret);
    }
  });

  it('defaults to no trusted proxies and accepts explicit IPv4 and IPv6 ranges', () => {
    expect(parseEnvironment(validEnvironment).trustedProxyCidrs).toEqual([]);
    expect(
      parseEnvironment({
        ...validEnvironment,
        TRUSTED_PROXY_CIDRS: ' 127.0.0.1, 10.20.0.0/16, ::1, fd00::/64 ',
      }).trustedProxyCidrs,
    ).toEqual(['127.0.0.1', '10.20.0.0/16', '::1', 'fd00::/64']);
  });

  it.each([
    'true',
    '*',
    '1',
    '0.0.0.0/0',
    '::/0',
    '10.0.0.1/33',
    '::1/129',
    'proxy.example',
    '10.0.0.1/',
    '10.0.0.1/8/2',
    ',127.0.0.1',
    '127.0.0.1,',
    '127.0.0.1,,10.20.0.0/16',
  ])('rejects unsafe or malformed proxy configuration: %s', (proxy) => {
    expect(() => parseEnvironment({ ...validEnvironment, TRUSTED_PROXY_CIDRS: proxy })).toThrow(
      'TRUSTED_PROXY_CIDRS',
    );
  });

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

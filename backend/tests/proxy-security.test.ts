import type { FastifyInstance } from 'fastify';
import { afterEach, describe, expect, it } from 'vitest';

import { createApp } from '../src/app/create-app.js';
import { createTestConfig, TEST_ACCESS_KEY, TEST_DEVICE_ID } from './test-config.js';

describe('proxy trust and rate limiting', () => {
  let app: FastifyInstance | undefined;

  afterEach(async () => {
    await app?.close();
  });

  async function start(trustedProxyCidrs: readonly string[] = []): Promise<FastifyInstance> {
    app = await createApp({
      config: createTestConfig({ rateLimitMax: 10, trustedProxyCidrs }),
      logger: false,
      pinVerifier: { verify: () => Promise.resolve(false) },
    });
    return app;
  }

  it.each([
    { name: 'no trusted proxies', cidrs: [] },
    { name: 'explicit ingress range', cidrs: ['10.20.0.0/16'] },
  ])('does not let an untrusted peer bypass the PIN limit with $name', async ({ cidrs }) => {
    const server = await start(cidrs);
    const statuses: number[] = [];
    for (let index = 0; index < 6; index += 1) {
      const response = await server.inject({
        headers: {
          authorization: `Bearer ${TEST_ACCESS_KEY}`,
          'x-device-id': TEST_DEVICE_ID,
          'x-forwarded-for': `203.0.113.${index + 1}`,
        },
        method: 'POST',
        payload: { commandId: 'desktop.git_status', pin: '0000' },
        remoteAddress: '198.51.100.10',
        url: '/api/security/verify-pin',
      });
      statuses.push(response.statusCode);
    }
    expect(statuses).toEqual([401, 401, 401, 401, 401, 429]);
  });

  it('uses the nearest untrusted address, ignoring forged prefixes through a trusted proxy', async () => {
    const server = await start(['10.20.0.0/16']);
    for (let index = 0; index < 11; index += 1) {
      const response = await server.inject({
        headers: { 'x-forwarded-for': `203.0.113.${index + 1}, 198.51.100.7` },
        remoteAddress: '10.20.1.2',
        url: '/api/health',
      });
      expect(response.statusCode).toBe(index < 10 ? 200 : 429);
    }
  });

  it('keeps different clients behind a trusted ingress in separate rate limit buckets', async () => {
    const server = await start(['10.20.0.0/16']);
    for (let index = 0; index < 11; index += 1) {
      const response = await server.inject({
        headers: { 'x-forwarded-for': `198.51.100.${index + 1}` },
        remoteAddress: '10.20.1.2',
        url: '/api/health',
      });
      expect(response.statusCode).toBe(200);
    }
  });
});

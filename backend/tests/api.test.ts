import type { FastifyInstance } from 'fastify';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { createApp } from '../src/app/create-app.js';
import type { AssistantResponse } from '../src/shared/schemas/api-schemas.js';
import type { PinVerifierPort } from '../src/modules/security/pin-verifier.js';
import { createTestConfig, TEST_ACCESS_KEY, TEST_DEVICE_ID, TEST_PIN } from './test-config.js';

interface DataEnvelope<T> {
  readonly data: T;
  readonly requestId: string;
}

interface ErrorEnvelope {
  readonly error: { readonly code: string; readonly message: string };
  readonly requestId: string;
}

const pinVerifier: PinVerifierPort = {
  verify: (pin) => Promise.resolve(pin === TEST_PIN),
};

describe('HTTP API', () => {
  let app: FastifyInstance;

  const ownerHeaders = {
    authorization: `Bearer ${TEST_ACCESS_KEY}`,
    'x-device-id': TEST_DEVICE_ID,
  };

  beforeEach(async () => {
    app = await createApp({ config: createTestConfig(), logger: false, pinVerifier });
  });

  afterEach(async () => {
    await app.close();
  });

  it('exposes health and public configuration without leaking secrets', async () => {
    const health = await app.inject({ method: 'GET', url: '/api/health' });
    expect(health.statusCode).toBe(200);
    expect(health.headers['x-content-type-options']).toBe('nosniff');
    expect(health.json<DataEnvelope<{ status: string }>>().data.status).toBe('ok');

    const config = await app.inject({ method: 'GET', url: '/api/config' });
    const serialized = config.body;
    expect(config.statusCode).toBe(200);
    expect(serialized).not.toContain(TEST_ACCESS_KEY);
    expect(serialized).not.toContain('AUTH_SIGNING_SECRET');
    expect(serialized).not.toContain('OWNER_PIN_HASH');
  });

  it('publishes four personalities and the explicit command catalog', async () => {
    const personalities = await app.inject({ method: 'GET', url: '/api/personalities' });
    const commands = await app.inject({ method: 'GET', url: '/api/commands' });
    expect(
      personalities.json<DataEnvelope<{ personalities: unknown[] }>>().data.personalities,
    ).toHaveLength(4);
    expect(
      commands.json<DataEnvelope<{ commands: unknown[] }>>().data.commands.length,
    ).toBeGreaterThan(8);
  });

  it('requires both the bearer key and a valid device identifier', async () => {
    const noAuth = await app.inject({
      method: 'POST',
      payload: { message: 'Olá' },
      url: '/api/chat',
    });
    expect(noAuth.statusCode).toBe(401);

    const noDevice = await app.inject({
      headers: { authorization: `Bearer ${TEST_ACCESS_KEY}` },
      method: 'POST',
      payload: { message: 'Olá' },
      url: '/api/chat',
    });
    expect(noDevice.statusCode).toBe(400);
  });

  it('routes general conversation through the mock provider', async () => {
    const response = await app.inject({
      headers: ownerHeaders,
      method: 'POST',
      payload: { message: 'Qual é a capital do Brasil?', personalityId: 'friendly' },
      url: '/api/chat',
    });
    const body = response.json<DataEnvelope<AssistantResponse>>();
    expect(response.statusCode).toBe(200);
    expect(body.data.source).toBe('model');
    expect(body.data.provider).toBe('mock');
    expect(body.data.action).toBeNull();
  });

  it('resolves deterministic commands before calling a model', async () => {
    const response = await app.inject({
      headers: ownerHeaders,
      method: 'POST',
      payload: { message: 'Por favor, listar comandos', personalityId: 'focused' },
      url: '/api/chat',
    });
    const body = response.json<DataEnvelope<AssistantResponse>>();
    expect(body.data.source).toBe('command');
    expect(body.data.provider).toBe('deterministic');
    expect(body.data.command?.id).toBe('system.list_commands');
  });

  it('requires PIN confirmation for a sensitive command and binds proof to the device', async () => {
    const preview = await app.inject({
      headers: ownerHeaders,
      method: 'POST',
      payload: { message: 'git status', mode: 'desktop', personalityId: 'focused' },
      url: '/api/chat',
    });
    expect(preview.json<DataEnvelope<AssistantResponse>>().data.requiresConfirmation).toBe(true);

    const verification = await app.inject({
      headers: ownerHeaders,
      method: 'POST',
      payload: { commandId: 'desktop.git_status', pin: TEST_PIN },
      url: '/api/security/verify-pin',
    });
    const token = verification.json<DataEnvelope<{ token: string }>>().data.token;
    expect(verification.statusCode).toBe(200);

    const wrongDevice = await app.inject({
      headers: { ...ownerHeaders, 'x-device-id': 'another-device-002' },
      method: 'POST',
      payload: {
        commandId: 'desktop.git_status',
        confirmationToken: token,
        mode: 'desktop',
        personalityId: 'focused',
      },
      url: '/api/commands/execute',
    });
    expect(wrongDevice.json<DataEnvelope<AssistantResponse>>().data.requiresConfirmation).toBe(
      true,
    );

    const execution = await app.inject({
      headers: ownerHeaders,
      method: 'POST',
      payload: {
        commandId: 'desktop.git_status',
        confirmationToken: token,
        mode: 'desktop',
        personalityId: 'focused',
      },
      url: '/api/commands/execute',
    });
    const action = execution.json<DataEnvelope<AssistantResponse>>().data.action;
    expect(action).toEqual({ type: 'desktop.git_status' });
  });

  it('rejects client claims of voice verification through strict request schemas', async () => {
    const response = await app.inject({
      headers: ownerHeaders,
      method: 'POST',
      payload: {
        commandId: 'desktop.git_status',
        pin: TEST_PIN,
        voiceVerified: true,
      },
      url: '/api/security/verify-pin',
    });
    expect(response.statusCode).toBe(400);
    expect(response.json<ErrorEnvelope>().error.code).toBe('INVALID_REQUEST');
  });

  it('blocks critical commands in car mode before considering availability', async () => {
    const response = await app.inject({
      headers: ownerHeaders,
      method: 'POST',
      payload: {
        commandId: 'desktop.git_push',
        mode: 'car',
        personalityId: 'focused',
      },
      url: '/api/commands/execute',
    });
    expect(response.statusCode).toBe(403);
    expect(response.json<ErrorEnvelope>().error.code).toBe('CAR_MODE_CRITICAL_BLOCKED');
  });

  it('enforces strict CORS and limits repeated PIN attempts', async () => {
    const cors = await app.inject({
      headers: { origin: 'https://untrusted.example' },
      method: 'GET',
      url: '/api/config',
    });
    expect(cors.statusCode).toBe(403);

    const attempts = [];
    for (let index = 0; index < 6; index += 1) {
      attempts.push(
        await app.inject({
          headers: ownerHeaders,
          method: 'POST',
          payload: { commandId: 'desktop.git_status', pin: String(index + 1).padStart(4, '0') },
          url: '/api/security/verify-pin',
        }),
      );
    }
    expect(attempts.at(-1)?.statusCode).toBe(429);
  });
});

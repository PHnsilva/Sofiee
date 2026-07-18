import { createHmac, randomUUID, timingSafeEqual } from 'node:crypto';

import { z } from 'zod';

import { CommandIdSchema, DeviceIdSchema } from '../../shared/schemas/api-schemas.js';

const ConfirmationPayloadSchema = z
  .object({
    commandId: CommandIdSchema,
    deviceId: DeviceIdSchema,
    expiresAt: z.number().int().positive(),
    issuedAt: z.number().int().positive(),
    nonce: z.string().uuid(),
    purpose: z.literal('pin-confirmation'),
  })
  .strict();

interface ConfirmationToken {
  readonly expiresAt: string;
  readonly token: string;
}

export class ConfirmationTokenService {
  constructor(
    private readonly signingSecret: string,
    private readonly lifetimeMs = 60_000,
  ) {}

  issue(deviceId: string, commandId: string, now = Date.now()): ConfirmationToken {
    const payload = ConfirmationPayloadSchema.parse({
      commandId,
      deviceId,
      expiresAt: now + this.lifetimeMs,
      issuedAt: now,
      nonce: randomUUID(),
      purpose: 'pin-confirmation',
    });
    const encodedPayload = Buffer.from(JSON.stringify(payload), 'utf8').toString('base64url');
    const signature = this.#sign(encodedPayload);

    return {
      expiresAt: new Date(payload.expiresAt).toISOString(),
      token: `${encodedPayload}.${signature}`,
    };
  }

  verify(
    token: string | undefined,
    deviceId: string,
    commandId: string,
    now = Date.now(),
  ): boolean {
    if (token === undefined) {
      return false;
    }

    const [encodedPayload, suppliedSignature, extra] = token.split('.');
    if (encodedPayload === undefined || suppliedSignature === undefined || extra !== undefined) {
      return false;
    }

    const expectedSignature = Buffer.from(this.#sign(encodedPayload), 'base64url');
    let suppliedSignatureBuffer: Buffer;
    try {
      suppliedSignatureBuffer = Buffer.from(suppliedSignature, 'base64url');
    } catch {
      return false;
    }

    if (
      suppliedSignatureBuffer.length !== expectedSignature.length ||
      !timingSafeEqual(expectedSignature, suppliedSignatureBuffer)
    ) {
      return false;
    }

    try {
      const parsed = ConfirmationPayloadSchema.parse(
        JSON.parse(Buffer.from(encodedPayload, 'base64url').toString('utf8')) as unknown,
      );
      return (
        parsed.deviceId === deviceId &&
        parsed.commandId === commandId &&
        parsed.expiresAt >= now &&
        parsed.issuedAt <= now + 5_000
      );
    } catch {
      return false;
    }
  }

  #sign(encodedPayload: string): string {
    return createHmac('sha256', this.signingSecret).update(encodedPayload).digest('base64url');
  }
}

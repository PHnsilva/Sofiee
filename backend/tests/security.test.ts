import { randomInt } from 'node:crypto';

import argon2 from 'argon2';
import { describe, expect, it } from 'vitest';

import { AccessKeyAuthenticator } from '../src/modules/security/access-key-authenticator.js';
import { ConfirmationTokenService } from '../src/modules/security/confirmation-token-service.js';
import { Argon2PinVerifier } from '../src/modules/security/pin-verifier.js';
import { TEST_ACCESS_KEY, TEST_DEVICE_ID } from './test-config.js';

describe('security adapters', () => {
  it('compares bearer credentials without exposing the expected value', () => {
    const authenticator = new AccessKeyAuthenticator(TEST_ACCESS_KEY);
    expect(authenticator.isAuthorized(`Bearer ${TEST_ACCESS_KEY}`)).toBe(true);
    expect(authenticator.isAuthorized('Bearer incorrect-but-sufficiently-long-value')).toBe(false);
    expect(authenticator.isAuthorized(undefined)).toBe(false);
  });

  it('binds a short-lived confirmation to a device and command', () => {
    const service = new ConfirmationTokenService(
      'test-only-signing-secret-with-32-characters',
      1_000,
    );
    const now = Date.now();
    const issued = service.issue(TEST_DEVICE_ID, 'desktop.git_status', now);

    expect(service.verify(issued.token, TEST_DEVICE_ID, 'desktop.git_status', now + 500)).toBe(
      true,
    );
    expect(service.verify(issued.token, TEST_DEVICE_ID, 'desktop.open_project', now + 500)).toBe(
      false,
    );
    expect(service.verify(issued.token, TEST_DEVICE_ID, 'desktop.git_status', now + 1_001)).toBe(
      false,
    );
    expect(
      service.verify(`${issued.token}tampered`, TEST_DEVICE_ID, 'desktop.git_status', now),
    ).toBe(false);
  });

  it('verifies only the PIN represented by an Argon2id hash', async () => {
    const pin = randomInt(1_000, 10_000).toString();
    const hash = await argon2.hash(pin, { type: argon2.argon2id });
    const verifier = new Argon2PinVerifier(hash);

    expect(await verifier.verify(pin)).toBe(true);
    expect(await verifier.verify(`${pin}0`)).toBe(false);
  });
});

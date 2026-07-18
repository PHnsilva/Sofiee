import argon2 from 'argon2';

export interface PinVerifierPort {
  verify(pin: string): Promise<boolean>;
}

export class Argon2PinVerifier implements PinVerifierPort {
  constructor(private readonly pinHash: string) {}

  async verify(pin: string): Promise<boolean> {
    try {
      return await argon2.verify(this.pinHash, pin);
    } catch {
      return false;
    }
  }
}

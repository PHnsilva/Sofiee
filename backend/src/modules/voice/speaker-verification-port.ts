export interface SpeakerVerificationResult {
  readonly available: boolean;
  readonly verified: boolean;
}

export interface SpeakerVerificationPort {
  verify(): Promise<SpeakerVerificationResult>;
}

export class DisabledSpeakerVerificationAdapter implements SpeakerVerificationPort {
  verify(): Promise<SpeakerVerificationResult> {
    return Promise.resolve({ available: false, verified: false });
  }
}

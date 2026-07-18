import { createHash, timingSafeEqual } from 'node:crypto';

export class AccessKeyAuthenticator {
  readonly #expectedDigest: Buffer;

  constructor(accessKey: string) {
    this.#expectedDigest = createHash('sha256').update(accessKey, 'utf8').digest();
  }

  isAuthorized(authorizationHeader: string | undefined): boolean {
    if (authorizationHeader === undefined || !authorizationHeader.startsWith('Bearer ')) {
      return false;
    }

    const suppliedKey = authorizationHeader.slice('Bearer '.length);
    const suppliedDigest = createHash('sha256').update(suppliedKey, 'utf8').digest();
    return timingSafeEqual(this.#expectedDigest, suppliedDigest);
  }
}

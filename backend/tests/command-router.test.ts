import { describe, expect, it } from 'vitest';

import { StaticCommandCatalog } from '../src/modules/commands/command-catalog.js';
import { CommandRouter } from '../src/modules/commands/command-router.js';
import { loadPublicConfiguration } from '../src/shared/config/public-configuration.js';

const configuration = loadPublicConfiguration();
const router = new CommandRouter(
  new StaticCommandCatalog(configuration.commands),
  configuration.personalities,
);

describe('CommandRouter', () => {
  it('normalizes accents and chooses the longest matching phrase', () => {
    expect(router.resolve('Sofiie, por favor, desativar modo carro')?.command.id).toBe(
      'system.car_off',
    );
  });

  it('extracts a normalized personality argument', () => {
    expect(router.resolve('Mudar personalidade para sarcástica')?.args).toEqual({
      personalityId: 'sarcastic',
    });
  });

  it('does not treat a general question as a command', () => {
    expect(router.resolve('Como funciona a fotossíntese?')).toBeUndefined();
  });

  it('does not execute a negated command phrase', () => {
    expect(router.resolve('não abrir Spotify')).toBeUndefined();
  });
});

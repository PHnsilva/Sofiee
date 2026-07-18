import { readFileSync } from 'node:fs';

import { z } from 'zod';

import { CommandDefinitionSchema, type CommandDefinition } from '../../modules/commands/command.js';
import { PersonalitySchema, type Personality } from '../../modules/personalities/personality.js';
import { ExpressionSchema, RiskLevelSchema } from '../schemas/api-schemas.js';

const PersonalityFileSchema = z
  .object({
    personalities: z.array(PersonalitySchema).min(4),
    version: z.number().int().positive(),
  })
  .strict();

const CommandFileSchema = z
  .object({
    commands: z.array(CommandDefinitionSchema).min(1),
    riskLevels: z.array(RiskLevelSchema).length(4),
    version: z.number().int().positive(),
  })
  .strict();

const ExpressionFileSchema = z
  .object({
    expressions: z
      .array(
        z
          .object({
            id: ExpressionSchema,
            label: z.string().min(1).max(60),
          })
          .strict(),
      )
      .length(8),
    version: z.number().int().positive(),
  })
  .strict();

const CONFIG_ROOT = new URL('../../../../config/', import.meta.url);

function parseJsonFile<T>(filename: string, schema: z.ZodType<T>): T {
  const raw = readFileSync(new URL(filename, CONFIG_ROOT), 'utf8');
  return schema.parse(JSON.parse(raw) as unknown);
}

export interface PublicConfiguration {
  readonly commands: readonly CommandDefinition[];
  readonly expressions: ReadonlyArray<{ id: z.infer<typeof ExpressionSchema>; label: string }>;
  readonly personalities: readonly Personality[];
}

export function loadPublicConfiguration(): PublicConfiguration {
  const personalityFile = parseJsonFile('personalities.json', PersonalityFileSchema);
  const commandFile = parseJsonFile('commands.json', CommandFileSchema);
  const expressionFile = parseJsonFile('expressions.json', ExpressionFileSchema);

  const personalityIds = new Set(personalityFile.personalities.map(({ id }) => id));
  const commandIds = new Set(commandFile.commands.map(({ id }) => id));
  const expressionIds = new Set(expressionFile.expressions.map(({ id }) => id));

  if (personalityIds.size !== personalityFile.personalities.length) {
    throw new Error('Personality IDs must be unique.');
  }
  if (commandIds.size !== commandFile.commands.length) {
    throw new Error('Command IDs must be unique.');
  }
  if (expressionIds.size !== expressionFile.expressions.length) {
    throw new Error('Expression IDs must be unique.');
  }

  return {
    commands: commandFile.commands,
    expressions: expressionFile.expressions,
    personalities: personalityFile.personalities,
  };
}

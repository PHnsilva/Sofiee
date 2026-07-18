import { z } from 'zod';

import { ExpressionSchema, PersonalityIdSchema } from '../../shared/schemas/api-schemas.js';

export const VoiceConfigurationSchema = z
  .object({
    lang: z.string().min(2).max(20),
    name: z.string().min(1).max(100).nullable(),
    pitch: z.number().min(0).max(2),
    rate: z.number().min(0.5).max(2),
    volume: z.number().min(0).max(1),
  })
  .strict();

export const PersonalitySchema = z
  .object({
    allowedCommandCategories: z.array(z.string().min(1).max(40)).min(1),
    defaultExpression: ExpressionSchema,
    errorResponses: z.array(z.string().min(1).max(300)).min(1),
    greetings: z.array(z.string().min(1).max(300)).min(1),
    id: PersonalityIdSchema,
    name: z.string().min(1).max(80),
    responseStyle: z.string().min(1).max(300),
    successResponses: z.array(z.string().min(1).max(300)).min(1),
    systemPrompt: z.string().min(1).max(1_000),
    voice: VoiceConfigurationSchema,
  })
  .strict();

export type Personality = z.infer<typeof PersonalitySchema>;

import { z } from 'zod';

import { CommandIdSchema, RiskLevelSchema } from '../../shared/schemas/api-schemas.js';

export const CommandDefinitionSchema = z
  .object({
    availableInCar: z.boolean(),
    category: z.string().min(1).max(40),
    description: z.string().min(1).max(300),
    enabled: z.boolean(),
    id: CommandIdSchema,
    intent: z
      .string()
      .min(1)
      .max(80)
      .regex(/^[a-z][a-z0-9_]*$/),
    name: z.string().min(1).max(100),
    phrases: z.array(z.string().min(1).max(100)).min(1),
    requiresDesktop: z.boolean(),
    risk: RiskLevelSchema,
  })
  .strict();

export type CommandDefinition = z.infer<typeof CommandDefinitionSchema>;

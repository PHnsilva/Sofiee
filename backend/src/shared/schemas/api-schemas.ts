import { z } from 'zod';

export const AssistantModeSchema = z.enum(['web', 'mobile', 'desktop', 'car']);
export type AssistantMode = z.infer<typeof AssistantModeSchema>;

export const ExpressionSchema = z.enum([
  'idle',
  'listening',
  'processing',
  'speaking',
  'success',
  'warning',
  'error',
  'sleeping',
]);
export type Expression = z.infer<typeof ExpressionSchema>;

export const RiskLevelSchema = z.enum(['public', 'private', 'sensitive', 'critical']);
export type RiskLevel = z.infer<typeof RiskLevelSchema>;

export const PersonalityIdSchema = z
  .string()
  .trim()
  .min(1)
  .max(40)
  .regex(/^[a-z][a-z0-9_-]*$/);
export const CommandIdSchema = z
  .string()
  .trim()
  .min(1)
  .max(80)
  .regex(/^[a-z][a-z0-9_.-]*$/);
export const DeviceIdSchema = z
  .string()
  .trim()
  .min(8)
  .max(80)
  .regex(/^[a-zA-Z0-9_-]+$/);

export const ChatRequestSchema = z
  .object({
    message: z.string().trim().min(1).max(1_000),
    mode: AssistantModeSchema.default('web'),
    personalityId: PersonalityIdSchema.default('focused'),
  })
  .strict();
export type ChatRequest = z.infer<typeof ChatRequestSchema>;

export const CommandArgumentsSchema = z
  .object({
    personalityId: PersonalityIdSchema.optional(),
  })
  .strict();
export type CommandArguments = z.infer<typeof CommandArgumentsSchema>;

export const CommandExecutionRequestSchema = z
  .object({
    args: CommandArgumentsSchema.optional(),
    commandId: CommandIdSchema,
    confirmationToken: z.string().min(20).max(2_048).optional(),
    explicitConfirmation: z.boolean().optional(),
    mode: AssistantModeSchema.default('web'),
    personalityId: PersonalityIdSchema.default('focused'),
  })
  .strict();
export type CommandExecutionRequest = z.infer<typeof CommandExecutionRequestSchema>;

export const VerifyPinRequestSchema = z
  .object({
    commandId: CommandIdSchema,
    pin: z.string().regex(/^\d{4,12}$/),
  })
  .strict();
export type VerifyPinRequest = z.infer<typeof VerifyPinRequestSchema>;

const ClientActionSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('client.repeat_last') }).strict(),
  z.object({ type: z.literal('client.clear_session') }).strict(),
  z
    .object({
      personalityId: PersonalityIdSchema,
      type: z.literal('client.set_personality'),
    })
    .strict(),
  z.object({ enabled: z.boolean(), type: z.literal('client.set_car_mode') }).strict(),
]);

const DesktopActionSchema = z.discriminatedUnion('type', [
  z
    .object({
      appId: z.enum(['vscode', 'spotify', 'browser']),
      type: z.literal('desktop.open_app'),
    })
    .strict(),
  z.object({ type: z.literal('desktop.open_project') }).strict(),
  z.object({ type: z.literal('desktop.git_status') }).strict(),
]);

export const AssistantActionSchema = z.union([ClientActionSchema, DesktopActionSchema]);
export type AssistantAction = z.infer<typeof AssistantActionSchema>;

export const AssistantResponseSchema = z
  .object({
    action: AssistantActionSchema.nullable(),
    command: z
      .object({
        args: CommandArgumentsSchema.optional(),
        id: CommandIdSchema,
        risk: RiskLevelSchema,
      })
      .strict()
      .nullable(),
    expression: ExpressionSchema,
    provider: z.string().min(1),
    reply: z.string().max(4_000),
    requiresConfirmation: z.boolean(),
    source: z.enum(['command', 'model']),
  })
  .strict();
export type AssistantResponse = z.infer<typeof AssistantResponseSchema>;

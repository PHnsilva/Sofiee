import { z } from 'zod';

const placeholderPattern = /^(replace-|generate-|change-me)/i;

const SecretSchema = z
  .string()
  .min(32)
  .max(512)
  .refine((value) => !placeholderPattern.test(value), 'A real secret is required.');

const EnvironmentSchema = z
  .object({
    AI_PROVIDER: z.enum(['mock', 'gemini']).default('mock'),
    ALLOWED_ORIGINS: z.string().default('http://localhost:5173,http://127.0.0.1:5173'),
    AUTH_SIGNING_SECRET: SecretSchema,
    GEMINI_API_KEY: z.string().max(512).optional(),
    GEMINI_BASE_URL: z.string().url().default('https://generativelanguage.googleapis.com/v1beta'),
    GEMINI_MODEL: z.string().min(1).max(100).default('gemini-2.5-flash'),
    HOST: z.string().min(1).default('0.0.0.0'),
    LOG_LEVEL: z
      .enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent'])
      .default('info'),
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    OWNER_ACCESS_KEY: SecretSchema,
    OWNER_PIN_HASH: z.string().startsWith('$argon2id$').max(512),
    PORT: z.coerce.number().int().min(1).max(65_535).default(3_000),
    RATE_LIMIT_MAX: z.coerce.number().int().min(10).max(1_000).default(60),
    REQUEST_TIMEOUT_MS: z.coerce.number().int().min(1_000).max(120_000).default(30_000),
  })
  .passthrough();

export interface AppConfig {
  readonly ai: {
    readonly apiKey: string | undefined;
    readonly baseUrl: string;
    readonly model: string;
    readonly requestedProvider: 'mock' | 'gemini';
  };
  readonly allowedOrigins: readonly string[];
  readonly authSigningSecret: string;
  readonly host: string;
  readonly logLevel: 'fatal' | 'error' | 'warn' | 'info' | 'debug' | 'trace' | 'silent';
  readonly nodeEnv: 'development' | 'test' | 'production';
  readonly ownerAccessKey: string;
  readonly ownerPinHash: string;
  readonly port: number;
  readonly rateLimitMax: number;
  readonly requestTimeoutMs: number;
}

export function parseEnvironment(environment: NodeJS.ProcessEnv): AppConfig {
  const parsed = EnvironmentSchema.parse(environment);
  const allowedOrigins = parsed.ALLOWED_ORIGINS.split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  if (allowedOrigins.length === 0 || allowedOrigins.some((origin) => origin === '*')) {
    throw new Error('ALLOWED_ORIGINS must contain explicit origins.');
  }

  for (const origin of allowedOrigins) {
    const url = new URL(origin);
    if (!['http:', 'https:'].includes(url.protocol) || url.origin !== origin) {
      throw new Error(`Invalid CORS origin: ${origin}`);
    }
  }

  if (parsed.NODE_ENV === 'production' && environment.ALLOWED_ORIGINS === undefined) {
    throw new Error('ALLOWED_ORIGINS is required in production.');
  }

  return {
    ai: {
      apiKey: parsed.GEMINI_API_KEY?.trim() || undefined,
      baseUrl: parsed.GEMINI_BASE_URL.replace(/\/$/, ''),
      model: parsed.GEMINI_MODEL,
      requestedProvider: parsed.AI_PROVIDER,
    },
    allowedOrigins,
    authSigningSecret: parsed.AUTH_SIGNING_SECRET,
    host: parsed.HOST,
    logLevel: parsed.LOG_LEVEL,
    nodeEnv: parsed.NODE_ENV,
    ownerAccessKey: parsed.OWNER_ACCESS_KEY,
    ownerPinHash: parsed.OWNER_PIN_HASH,
    port: parsed.PORT,
    rateLimitMax: parsed.RATE_LIMIT_MAX,
    requestTimeoutMs: parsed.REQUEST_TIMEOUT_MS,
  };
}

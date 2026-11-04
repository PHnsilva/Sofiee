import type { FastifyRequest } from 'fastify';
import type { z } from 'zod';

import { AppError } from '../errors/app-error.js';
import { DeviceIdSchema } from '../schemas/api-schemas.js';

export function parseRequest<TSchema extends z.ZodType>(
  schema: TSchema,
  value: unknown,
): z.output<TSchema> {
  const parsed = schema.safeParse(value);
  if (!parsed.success) {
    throw new AppError(400, 'INVALID_REQUEST', 'A requisição contém dados inválidos.');
  }
  return parsed.data;
}

export function getDeviceId(request: FastifyRequest): string {
  return parseRequest(DeviceIdSchema, request.headers['x-device-id']);
}

export function successEnvelope<T>(
  data: T,
  request: FastifyRequest,
): { data: T; requestId: string } {
  return { data, requestId: request.id };
}

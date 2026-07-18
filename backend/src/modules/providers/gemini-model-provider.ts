import { z } from 'zod';

import { AppError } from '../../shared/errors/app-error.js';
import type { ModelProviderPort, ModelRequest } from './model-provider-port.js';

const GeminiResponseSchema = z
  .object({
    candidates: z
      .array(
        z
          .object({
            content: z
              .object({
                parts: z.array(z.object({ text: z.string() }).passthrough()).min(1),
              })
              .passthrough(),
          })
          .passthrough(),
      )
      .min(1),
  })
  .passthrough();

interface GeminiModelProviderOptions {
  readonly apiKey: string;
  readonly baseUrl: string;
  readonly model: string;
  readonly timeoutMs: number;
}

export class GeminiModelProvider implements ModelProviderPort {
  readonly id = 'gemini';

  constructor(private readonly options: GeminiModelProviderOptions) {}

  async generate({ message, personality }: ModelRequest): Promise<string> {
    const response = await fetch(
      `${this.options.baseUrl}/models/${encodeURIComponent(this.options.model)}:generateContent`,
      {
        body: JSON.stringify({
          contents: [{ parts: [{ text: message }], role: 'user' }],
          generationConfig: {
            maxOutputTokens: 512,
            temperature: 0.5,
          },
          systemInstruction: {
            parts: [
              {
                text: `${personality.systemPrompt}\nEstilo: ${personality.responseStyle}\nNunca proponha comandos, ações de dispositivo ou estados visuais. Responda apenas com texto.`,
              },
            ],
          },
        }),
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': this.options.apiKey,
        },
        method: 'POST',
        signal: AbortSignal.timeout(this.options.timeoutMs),
      },
    );

    if (!response.ok) {
      throw new AppError(
        502,
        'MODEL_PROVIDER_ERROR',
        'O provedor de IA não respondeu corretamente.',
      );
    }

    const parsed = GeminiResponseSchema.safeParse(await response.json());
    const reply = parsed.success
      ? parsed.data.candidates[0]?.content.parts
          .map(({ text }) => text)
          .join('')
          .trim()
      : undefined;

    if (reply === undefined || reply.length === 0) {
      throw new AppError(
        502,
        'MODEL_RESPONSE_INVALID',
        'O provedor retornou uma resposta inválida.',
      );
    }

    return reply.slice(0, 4_000);
  }
}

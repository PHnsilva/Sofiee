import type {
  AssistantMode,
  AssistantResponse,
  CommandArguments,
  CommandDefinition,
  Personality,
  PublicAppConfig,
} from './types.js';

interface ApiEnvelope<T> {
  readonly data: T;
  readonly requestId: string;
}

interface ErrorPayload {
  readonly error?: { readonly code?: string; readonly message?: string };
}

interface ExecuteCommandInput {
  readonly args?: CommandArguments;
  readonly commandId: string;
  readonly confirmationToken?: string;
  readonly explicitConfirmation?: boolean;
  readonly mode: AssistantMode;
  readonly personalityId: string;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

export class ApiError extends Error {
  constructor(
    readonly code: string,
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export class ApiClient {
  #accessKey: string | undefined;

  constructor(
    private readonly baseUrl: string,
    private readonly deviceId: string,
  ) {}

  get hasAccessKey(): boolean {
    return this.#accessKey !== undefined;
  }

  setAccessKey(value: string | undefined): void {
    this.#accessKey = value?.trim() || undefined;
  }

  async waitForHealth(onState: (state: 'waking' | 'online' | 'offline') => void): Promise<void> {
    onState('waking');
    for (let attempt = 0; attempt < 5; attempt += 1) {
      try {
        await this.#request<unknown>('/api/health', { timeoutMs: 8_000 });
        onState('online');
        return;
      } catch {
        if (attempt === 4) {
          onState('offline');
          throw new ApiError('SERVER_UNAVAILABLE', 'O servidor não respondeu.', 0);
        }
        await new Promise((resolve) => window.setTimeout(resolve, 1_500 + attempt * 1_000));
      }
    }
  }

  getConfig(): Promise<PublicAppConfig> {
    return this.#request<PublicAppConfig>('/api/config');
  }

  getPersonalities(): Promise<readonly Personality[]> {
    return this.#request<{ personalities: readonly Personality[] }>('/api/personalities').then(
      ({ personalities }) => personalities,
    );
  }

  getCommands(): Promise<readonly CommandDefinition[]> {
    return this.#request<{ commands: readonly CommandDefinition[] }>('/api/commands').then(
      ({ commands }) => commands,
    );
  }

  chat(message: string, personalityId: string, mode: AssistantMode): Promise<AssistantResponse> {
    return this.#authorizedRequest<AssistantResponse>('/api/chat', {
      body: JSON.stringify({ message, mode, personalityId }),
      method: 'POST',
      timeoutMs: 50_000,
    });
  }

  executeCommand(input: ExecuteCommandInput): Promise<AssistantResponse> {
    return this.#authorizedRequest<AssistantResponse>('/api/commands/execute', {
      body: JSON.stringify(input),
      method: 'POST',
    });
  }

  async verifyPin(commandId: string, pin: string): Promise<{ expiresAt: string; token: string }> {
    return this.#authorizedRequest<{ expiresAt: string; token: string }>(
      '/api/security/verify-pin',
      {
        body: JSON.stringify({ commandId, pin }),
        method: 'POST',
      },
    );
  }

  async validateAccess(): Promise<void> {
    await this.executeCommand({
      commandId: 'system.health',
      mode: 'web',
      personalityId: 'focused',
    });
  }

  #authorizedRequest<T>(path: string, options: RequestInit & { timeoutMs?: number }): Promise<T> {
    if (this.#accessKey === undefined) {
      return Promise.reject(
        new ApiError('ACCESS_KEY_REQUIRED', 'Chave de acesso obrigatória.', 401),
      );
    }
    return this.#request<T>(path, {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${this.#accessKey}`,
        'X-Device-Id': this.deviceId,
      },
    });
  }

  async #request<T>(path: string, options: RequestInit & { timeoutMs?: number } = {}): Promise<T> {
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), options.timeoutMs ?? 15_000);

    try {
      const response = await fetch(`${this.baseUrl}${path}`, {
        ...options,
        headers: {
          Accept: 'application/json',
          ...(options.body === undefined ? {} : { 'Content-Type': 'application/json' }),
          ...options.headers,
        },
        signal: controller.signal,
      });
      const payload: unknown = await response.json();

      if (!response.ok) {
        const errorPayload = isRecord(payload) ? (payload as ErrorPayload) : {};
        throw new ApiError(
          errorPayload.error?.code ?? 'REQUEST_FAILED',
          errorPayload.error?.message ?? 'A requisição falhou.',
          response.status,
        );
      }

      if (!isRecord(payload) || !('data' in payload)) {
        throw new ApiError('INVALID_RESPONSE', 'O servidor retornou dados inválidos.', 502);
      }
      return (payload as unknown as ApiEnvelope<T>).data;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      if (error instanceof DOMException && error.name === 'AbortError') {
        throw new ApiError('REQUEST_TIMEOUT', 'O servidor ainda está acordando.', 0);
      }
      throw new ApiError('NETWORK_ERROR', 'Não foi possível alcançar o servidor.', 0);
    } finally {
      window.clearTimeout(timeout);
    }
  }
}

const configuredBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim();
export const API_BASE_URL = (configuredBaseUrl || 'http://localhost:3000').replace(/\/$/, '');

import type { ModelProviderPort, ModelRequest } from './model-provider-port.js';

export class MockModelProvider implements ModelProviderPort {
  readonly id = 'mock';

  generate({ message, personality }: ModelRequest): Promise<string> {
    const normalized = message.toLocaleLowerCase('pt-BR');

    if (/^(oi|ola|olá|bom dia|boa tarde|boa noite)\b/.test(normalized)) {
      return Promise.resolve(personality.greetings[0] ?? 'Olá. Como posso ajudar?');
    }

    return Promise.resolve(
      `Estou operando com o provedor mock. Entendi sua pergunta sobre “${message}”. Configure o Gemini no backend para respostas gerais com um modelo externo.`,
    );
  }
}

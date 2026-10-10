# Sofiie API

API Node.js, TypeScript e Fastify da Sofiie. É um monólito modular stateless, sem banco, sessões persistentes ou histórico de conversa. A API resolve comandos determinísticos, aplica política de risco e usa um provedor de texto somente quando não existe comando correspondente.

Ela nunca abre aplicativos ou executa Git no servidor. Ações locais são respostas estruturadas para a bridge Tauri.

## Módulos

```text
src/
├── app/create-app.ts                 # composição e plugins Fastify
├── modules/
│   ├── assistant/                    # orquestra interação e rotas
│   ├── commands/                     # catálogo, parser e executor
│   ├── personalities/                # repositório de configuração
│   ├── providers/                    # port, mock, Gemini e fallback
│   ├── security/                     # bearer, PIN, HMAC, policy e rotas
│   ├── system/                       # health e configuração pública
│   └── voice/                        # SpeakerVerificationPort desativado
├── shared/                           # env, JSON, erros, HTTP e schemas
└── server.ts
```

Routes validam e formatam HTTP. Serviços de aplicação dependem de ports ou modelos internos. SDKs/HTTP externos ficam em providers. Configuração é validada antes do listen.

## Configuração

Copie `backend/.env.example` para `backend/.env` e substitua todos os placeholders.

| Variável              | Obrigatória | Padrão             | Descrição                            |
| --------------------- | ----------- | ------------------ | ------------------------------------ |
| `OWNER_ACCESS_KEY`    | sim         | -                  | bearer key, 32 a 512 caracteres      |
| `OWNER_PIN_HASH`      | sim         | -                  | hash Argon2id                        |
| `AUTH_SIGNING_SECRET` | sim         | -                  | HMAC, 32 a 512 caracteres            |
| `ALLOWED_ORIGINS`     | produção    | localhost em dev   | origens exatas separadas por vírgula |
| `NODE_ENV`            | não         | `development`      | ambiente                             |
| `HOST`                | não         | `0.0.0.0`          | endereço de bind                     |
| `PORT`                | não         | `3000`             | porta HTTP                           |
| `AI_PROVIDER`         | não         | `mock`             | `mock` ou `gemini`                   |
| `GEMINI_API_KEY`      | Gemini      | -                  | chave exclusiva do backend           |
| `GEMINI_MODEL`        | não         | `gemini-2.5-flash` | modelo                               |
| `GEMINI_BASE_URL`     | não         | API Google v1beta  | endpoint compatível                  |
| `REQUEST_TIMEOUT_MS`  | não         | `30000`            | timeout externo                      |
| `RATE_LIMIT_MAX`      | não         | `60`               | requests globais por minuto          |
| `LOG_LEVEL`           | não         | `info`             | nível Pino                           |

`OWNER_ACCESS_KEY` e `AUTH_SIGNING_SECRET` devem ser valores aleatórios diferentes. Valores iniciados por `replace-`, `generate-` ou `change-me` são rejeitados.

Gere o hash do PIN:

```bash
npm run security:hash-pin --workspace backend -- SEU_PIN_NUMERICO
```

Nenhuma chave é enviada por endpoint ou incluída no frontend. Se Gemini for selecionado sem chave, `createModelProvider` escolhe mock. Falha/timeout do Gemini também retorna pelo mock sem expor erro do provedor ao browser.

## Execução

Na raiz:

```bash
npm ci
npm run dev:backend
```

O `dotenv` carrega `backend/.env` quando o processo é iniciado nesse workspace. Produção:

```bash
npm run build --workspace backend
npm run start --workspace backend
```

O servidor escuta `0.0.0.0` e usa `process.env.PORT`, inclusive no Render.

## Autenticação

Rotas protegidas exigem:

```http
Authorization: Bearer <OWNER_ACCESS_KEY>
X-Device-Id: <identificador-logico-8-a-80-caracteres>
```

A chave é convertida em digest SHA-256 e comparada com `timingSafeEqual`. O ID lógico não é prova por si só; ele vincula confirmações ao dispositivo que já apresentou a bearer key.

Comandos `sensitive` e `critical` passam por `POST /api/security/verify-pin`. O PIN é verificado contra `OWNER_PIN_HASH` por Argon2id e gera uma prova HMAC de 60 segundos vinculada a `deviceId` e `commandId`. A prova não contém PIN e é reenviada em `confirmationToken`.

Comandos críticos também exigem `explicitConfirmation: true` e são sempre bloqueados em `mode: "car"`. O único crítico no catálogo, Git push, permanece desativado e não possui ação na bridge.

`SpeakerVerificationPort` está implementado por `DisabledSpeakerVerificationAdapter`, que sempre retorna `{ available: false, verified: false }`. Schemas strict rejeitam `voiceVerified` fornecido pelo cliente.

## Endpoints

| Método | Rota                       | Proteção                     |
| ------ | -------------------------- | ---------------------------- |
| `GET`  | `/api/health`              | pública                      |
| `GET`  | `/api/config`              | pública                      |
| `GET`  | `/api/personalities`       | pública                      |
| `GET`  | `/api/commands`            | pública                      |
| `POST` | `/api/chat`                | bearer + dispositivo         |
| `POST` | `/api/commands/execute`    | bearer + dispositivo         |
| `POST` | `/api/security/verify-pin` | bearer + dispositivo + 5/min |

### Chat

```json
{
  "message": "abrir Spotify",
  "personalityId": "focused",
  "mode": "desktop"
}
```

`mode` aceita `web`, `mobile`, `desktop` ou `car`. O parser normaliza caixa, acentos e pontuação, compara o catálogo uma única vez e sempre roda antes do provedor.

Resposta com ação:

```json
{
  "data": {
    "action": { "type": "desktop.open_app", "appId": "spotify" },
    "command": { "id": "desktop.open_spotify", "risk": "private" },
    "expression": "success",
    "provider": "deterministic",
    "reply": "Solicitação para abrir Spotify autorizada.",
    "requiresConfirmation": false,
    "source": "command"
  },
  "requestId": "req_uuid"
}
```

O backend pode retornar somente estas ações:

- `client.repeat_last`;
- `client.clear_session`;
- `client.set_personality`;
- `client.set_car_mode`;
- `desktop.open_app` com `vscode`, `spotify` ou `browser`;
- `desktop.open_project`;
- `desktop.git_status`.

### Confirmação por PIN

```json
{
  "commandId": "desktop.git_status",
  "pin": "<PIN_NUMERICO>"
}
```

Resposta:

```json
{
  "data": {
    "token": "<PROVA_ASSINADA>",
    "expiresAt": "2026-07-18T20:01:00.000Z"
  },
  "requestId": "req_uuid"
}
```

Execução confirmada:

```json
{
  "commandId": "desktop.git_status",
  "personalityId": "focused",
  "mode": "desktop",
  "confirmationToken": "<PROVA_ASSINADA>"
}
```

## Erros e limites

Erro estruturado:

```json
{
  "error": {
    "code": "INVALID_REQUEST",
    "message": "A requisição contém dados inválidos."
  },
  "requestId": "req_uuid"
}
```

- payload máximo: 16 KiB;
- texto de chat: 1 a 1000 caracteres;
- resposta de modelo: máximo 4000 caracteres;
- rate limit global configurável por minuto;
- PIN: cinco tentativas por minuto;
- CORS: origens exatas, sem wildcard ou credenciais;
- Helmet: CSP de API, anti-frame e demais headers;
- erros 5xx não retornam stack.

Pino não registra bodies por padrão e possui redaction para Authorization, PIN e confirmation token. A aplicação nunca registra áudio, voiceprint ou chave de provedor.

## Configuração pública

Os arquivos em `../config` são validados por Zod na inicialização:

- `personalities.json`: quatro personalidades e vozes;
- `commands.json`: intenções, frases, categorias e riscos;
- `expressions.json`: oito estados visuais.

IDs duplicados, schemas inválidos ou expressões ausentes impedem a inicialização. Esses arquivos contêm somente dados públicos versionados.

## Stateless e reinícios

Não existe banco, sessão, token armazenado, arquivo de runtime ou histórico. Reinício perde somente:

- contadores de rate limit em memória;
- caches descartáveis das bibliotecas.

Provas de confirmação são assinadas e continuam verificáveis enquanto não expirarem e o segredo não mudar. Conversas nunca existem no backend além da duração de uma request.

## Testes e qualidade

```bash
npm run lint --workspace backend
npm run typecheck --workspace backend
npm test --workspace backend
npm run build --workspace backend
```

Vitest cobre API, headers, auth, CORS, rate limits, Argon2id, binding/expiração de prova, schemas strict, roteamento com acentos, mock, comando sensível e bloqueio crítico no carro.

## Render

O serviço `sofiie-api` em `../render.yaml` usa:

- runtime Node;
- plano Free;
- build pelo npm workspace;
- `npm run start --workspace backend`;
- health check `/api/health`;
- `HOST=0.0.0.0` e porta fornecida pelo Render;
- segredos como variáveis `sync: false`;
- nenhum disco e nenhum banco.

O filesystem do Render é efêmero, mas a API não depende dele. Cold starts são tratados pelo frontend com estado e retries de health check.

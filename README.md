# Sofiie

Assistente pessoal de um único proprietário, com interface por texto e voz, personalidades públicas configuráveis, olhos animados e ações locais controladas por uma bridge desktop. O MVP é cloud-first: conversa e comandos de nuvem continuam disponíveis quando o PC do proprietário está desligado; ações locais exigem o aplicativo Tauri naquele dispositivo.

## Estado atual

O código do MVP inclui as capacidades abaixo. A execução com Gemini, a publicação e as ações nativas dependem da configuração e do ambiente; a presença do código não confirma que esses serviços estejam disponíveis.

- frontend vanilla TypeScript, responsivo para telefone, desktop e modo carro;
- PWA com manifest e service worker;
- olhos animados por estado determinístico;
- texto, push-to-talk e text-to-speech com fallback para texto;
- personalidades `focused`, `friendly`, `sarcastic` e `calm` em JSON versionado;
- comandos determinísticos resolvidos antes de qualquer modelo;
- provedor mock sem credenciais e adaptador Gemini substituível;
- API Fastify stateless, sem banco e sem histórico de conversa;
- bearer key, PIN Argon2id, confirmação curta assinada e política de risco;
- bridge Tauri com allowlist para VS Code, Spotify, navegador, projeto configurado e Git status;
- Blueprint para Render Free com Web Service e Static Site.

Não existem banco, React, Docker, microserviços, shell arbitrário, autenticação de terceiros ou persistência de conversas.

## Arquitetura

```text
frontend web/PWA ─┐
                  ├── HTTPS ── backend Fastify stateless ── mock ou Gemini
frontend no Tauri ┘                    │
       │                               └── ações locais estruturadas
       └── comando Rust allowlisted no dispositivo
```

O backend é um monólito modular com limites leves de ports and adapters:

- `assistant`: orquestra comando ou provedor;
- `commands`: catálogo, normalização, parsing e execução;
- `personalities`: repositório de configuração pública;
- `providers`: porta de modelo, mock, Gemini e fallback;
- `security`: bearer key, Argon2id, provas HMAC e política de risco;
- `voice`: porta de verificação de locutor desativada;
- `shared`: configuração, schemas, erros e envelope HTTP.

Modelos produzem somente texto. Ações e expressões nunca são aceitas do modelo.

## Estrutura

```text
.
├── backend/                 # API Node.js + TypeScript + Fastify
│   ├── src/
│   ├── tests/
│   └── .env.example
├── frontend/                # PWA vanilla TypeScript + CSS
│   ├── src/
│   └── public/
├── desktop/                 # Aplicativo e bridge Tauri 2
│   └── src-tauri/
├── config/                  # personalidades, comandos e expressões públicas
├── render.yaml              # Render Blueprint
└── package.json             # npm workspaces
```

Detalhes específicos: [backend/README.md](backend/README.md), [frontend/README.md](frontend/README.md) e [desktop/README.md](desktop/README.md).

## Instalação local

Pré-requisitos: Node.js 20.19 ou superior na série 20, ou 22.12 ou superior na série 22, e npm 10. O intervalo declarado na raiz é `>=20.19.0 <23`; as versões mínimas acima também atendem ao Vite do lockfile. Somente o desktop exige Rust e os pré-requisitos do Tauri 2.

```bash
git clone https://github.com/PHnsilva/Sofiie.git
cd Sofiie
npm ci
cp backend/.env.example backend/.env
```

No PowerShell, use `Copy-Item backend/.env.example backend/.env` em vez de `cp`.

Gere valores reais e diferentes para `OWNER_ACCESS_KEY` e `AUTH_SIGNING_SECRET`:

```bash
node -e "console.log(require('node:crypto').randomBytes(32).toString('base64url'))"
```

Gere o hash do PIN sem gravar o PIN no repositório:

```bash
npm run security:hash-pin --workspace backend -- SEU_PIN_NUMERICO
```

Substitua `SEU_PIN_NUMERICO` pelo PIN escolhido; o argumento pode ficar no histórico do terminal. Coloque somente o hash em `OWNER_PIN_HASH`. Placeholders do exemplo são rejeitados na inicialização.

Inicie a API e o frontend em terminais separados:

```bash
npm run dev:backend
npm run dev:frontend
```

- API: `http://localhost:3000`
- interface: `http://localhost:5173`

Abra o botão de chave na interface e informe `OWNER_ACCESS_KEY`. A chave permanece somente na memória da página.

Para desktop:

```powershell
$env:SOFIIE_PROJECT_PATH = "C:\caminho\para\um\projeto"
npm run dev --workspace desktop
```

`SOFIIE_PROJECT_PATH` é lido somente pela bridge local. O frontend nunca fornece caminhos ou argumentos de processo.

## Comandos

O catálogo real está em `config/commands.json` e em `GET /api/commands`.

| Capacidade                          | Risco       | Resultado                              |
| ----------------------------------- | ----------- | -------------------------------------- |
| alterar personalidade               | `public`    | preferência local atualizada           |
| ativar/desativar modo carro         | `public`    | modo e política local atualizados      |
| verificar backend                   | `public`    | resposta determinística                |
| repetir última resposta             | `public`    | usa apenas memória da página           |
| limpar sessão                       | `public`    | descarta estado efêmero da página      |
| listar comandos                     | `public`    | lista filtrada pelo contexto           |
| abrir VS Code, Spotify ou navegador | `private`   | ação allowlisted para Tauri            |
| abrir projeto configurado           | `sensitive` | bearer + dispositivo + PIN             |
| consultar Git status                | `sensitive` | bearer + dispositivo + PIN             |
| Git push                            | `critical`  | desativado no MVP e bloqueado no carro |

## API

| Método | Endpoint                   | Acesso                                        |
| ------ | -------------------------- | --------------------------------------------- |
| `GET`  | `/api/health`              | público                                       |
| `GET`  | `/api/config`              | público                                       |
| `GET`  | `/api/personalities`       | público                                       |
| `GET`  | `/api/commands`            | público                                       |
| `POST` | `/api/chat`                | bearer + `X-Device-Id`                        |
| `POST` | `/api/commands/execute`    | bearer + `X-Device-Id`                        |
| `POST` | `/api/security/verify-pin` | bearer + `X-Device-Id`, rate limit específico |

Sucesso usa `{ "data": ..., "requestId": "..." }`. Erro usa `{ "error": { "code": "...", "message": "..." }, "requestId": "..." }`.

## Ambiente

| Variável              | Obrigatória | Uso                                        |
| --------------------- | ----------- | ------------------------------------------ |
| `OWNER_ACCESS_KEY`    | sim         | segredo bearer de pelo menos 32 caracteres |
| `OWNER_PIN_HASH`      | sim         | hash Argon2id do PIN                       |
| `AUTH_SIGNING_SECRET` | sim         | HMAC; deve ser diferente da bearer key     |
| `ALLOWED_ORIGINS`     | produção    | origens CORS exatas separadas por vírgula  |
| `NODE_ENV`            | não         | `development`, `test` ou `production`      |
| `HOST`                | não         | padrão `0.0.0.0`                           |
| `PORT`                | não         | padrão `3000`; Render fornece o valor      |
| `AI_PROVIDER`         | não         | `mock` (padrão) ou `gemini`                |
| `GEMINI_API_KEY`      | Gemini      | usada exclusivamente no backend            |
| `GEMINI_MODEL`        | não         | padrão `gemini-2.5-flash`                  |
| `GEMINI_BASE_URL`     | não         | endpoint compatível do Gemini              |
| `REQUEST_TIMEOUT_MS`  | não         | timeout externo                            |
| `RATE_LIMIT_MAX`      | não         | limite global por minuto                   |
| `LOG_LEVEL`           | não         | nível Pino                                 |
| `VITE_API_BASE_URL`   | frontend    | URL pública da API; nunca é segredo        |
| `SOFIIE_PROJECT_PATH` | desktop     | pasta local fixa autorizada                |

Se `AI_PROVIDER=gemini` não tiver chave, a aplicação continua com mock.

## Segurança

- bearer key comparada por digest SHA-256 e `timingSafeEqual`;
- PIN verificado por Argon2id;
- confirmação HMAC expira em 60 segundos e é vinculada ao dispositivo e comando;
- PIN limitado a cinco tentativas por minuto, além do rate limit global;
- CORS com origens exatas, Helmet, CSP no site e corpo máximo de 16 KiB;
- schemas Zod fechados rejeitam campos desconhecidos, inclusive `voiceVerified`;
- `SpeakerVerificationPort` existe, mas informa indisponível e nunca autoriza ações;
- comandos críticos são bloqueados no modo carro;
- logs não incluem bearer key, PIN ou token de confirmação;
- a bridge não aceita shell, caminho, URL ou argumentos livres.

A confirmação stateless pode ser reutilizada para o mesmo comando/dispositivo durante 60 segundos. Essa janela curta é uma limitação consciente do MVP sem armazenamento compartilhado.

## Persistência

Não há banco nem filesystem de runtime. Reiniciar o backend perde apenas rate limits em memória e caches descartáveis; nenhuma conversa, sessão ou confirmação é armazenada no servidor.

Recarregar o frontend perde bearer key, última resposta e comando aguardando PIN. Persistem somente personalidade, modo carro, voz ligada/desligada e ID lógico aleatório do dispositivo.

## Qualidade

```bash
npm run format:check
npm run lint
npm run lint:desktop
npm run typecheck
npm test
npm run test:desktop
npm run build
npm run build:desktop
```

Os testes cobrem contratos HTTP, segurança, CORS, rate limiting, Argon2id, provas assinadas, parsing determinístico, fallback mock, bloqueio crítico no modo carro e rejeição de ações fora da allowlist desktop.

## Render Free

O `render.yaml` cria `sofiie-api` como Web Service Node Free com health check `/api/health` e `sofiie-web` como Static Site com headers de segurança.

1. publique o repositório sem arquivos `.env`;
2. no Render, escolha **New > Blueprint** e conecte o repositório;
3. informe os valores `sync: false`: `OWNER_ACCESS_KEY`, `OWNER_PIN_HASH`, `AUTH_SIGNING_SECRET`, `ALLOWED_ORIGINS` e `VITE_API_BASE_URL`;
4. use a origem HTTPS exata do site em `ALLOWED_ORIGINS`, por exemplo `https://sofiie-web.onrender.com`;
5. use a URL HTTPS exata da API em `VITE_API_BASE_URL`, por exemplo `https://sofiie-api.onrender.com`;
6. opcionalmente adicione `GEMINI_API_KEY` e altere `AI_PROVIDER` para `gemini`;
7. sincronize o Blueprint e confirme `GET /api/health`.

Se o Render alterar um nome já ocupado, atualize as duas URLs e redeploy o Static Site. O backend usa `0.0.0.0` e `process.env.PORT`.

No plano Free, o serviço pode adormecer por inatividade. O frontend mostra **Acordando servidor** e repete o health check. O filesystem efêmero não contém estado necessário.

## Limitações

- Web Speech depende do navegador e do sistema operacional;
- não há biometria nem autenticação real por locutor;
- bearer keys não têm revogação individual sem troca do segredo;
- confirmações não são single-use entre múltiplas instâncias;
- o mock não substitui conhecimento geral de um modelo externo;
- ações desktop exigem o Tauri aberto e aplicativos instalados;
- Git status é somente leitura; commit, push, delete e instalação não existem;
- não há histórico, memória permanente, lembretes ou múltiplos usuários.

## Contribuição

Abra uma branch e um pull request com escopo e verificações. Preserve o contrato das ações locais e não publique chaves, PINs ou arquivos `.env`. Os comandos web e nativos têm pré-requisitos distintos; informe quais verificações executou.

## Licença

Ainda não existe arquivo `LICENSE`; portanto não há permissão explícita de reutilização, modificação ou distribuição.

# Sofiie Web

Frontend vanilla TypeScript da Sofiie. É uma PWA responsiva, sem framework e sem credenciais embutidas no bundle.

## Funcionalidade implementada

- olhos CSS com estados `idle`, `listening`, `processing`, `speaking`, `success`, `warning`, `error` e `sleeping`;
- chat por texto;
- push-to-talk com Web Speech API;
- síntese de voz com interrupção da escuta durante a fala;
- seletor de personalidade e modo carro;
- estado de conexão e tentativa de cold start;
- confirmação por PIN para comandos sensíveis;
- ações estruturadas enviadas à bridge Tauri quando disponível;
- manifest e service worker para instalação PWA e cache do shell.

Chrome/Edge oferecem o suporte mais amplo à Web Speech API. Quando STT ou TTS não existe, texto continua funcionando. Permissão de microfone negada produz aviso e não bloqueia o chat.

## Dados locais

`localStorage` contém somente ID lógico aleatório do dispositivo, personalidade, modo carro e preferência de síntese. A bearer key fica apenas em memória e desaparece ao recarregar/fechar a página. A última resposta também existe apenas em memória. PIN, mensagens e respostas não são persistidos.

## Execução

Na raiz do repositório:

```bash
npm ci
npm run dev:frontend
```

URL: `http://localhost:5173`. Por padrão a API é `http://localhost:3000`. Para outra API:

```bash
cp frontend/.env.example frontend/.env
```

Edite somente `VITE_API_BASE_URL`. Essa variável é pública; nunca coloque chaves nela.

## Qualidade

```bash
npm run lint --workspace frontend
npm run typecheck --workspace frontend
npm test --workspace frontend
npm run build --workspace frontend
```

O conteúdo de produção fica em `frontend/dist` e é publicado como Render Static Site.

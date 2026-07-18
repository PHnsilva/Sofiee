# Sofiie Desktop

Aplicativo Tauri 2 que reutiliza o frontend vanilla em `../frontend` e adiciona uma bridge local mínima.

## Ações permitidas

- abrir VS Code;
- abrir Spotify;
- abrir o navegador padrão em uma URL fixa;
- abrir a pasta definida por `SOFIIE_PROJECT_PATH`;
- executar `git status --short --branch` somente nessa pasta.

A bridge recebe uma união fechada de ações. Ela não recebe comandos, executáveis, URLs, argumentos Git ou caminhos arbitrários do frontend. Operações destrutivas de filesystem e Git não existem neste MVP.

## Pré-requisitos

- os [pré-requisitos do Tauri 2](https://v2.tauri.app/start/prerequisites/), incluindo Rust;
- backend Sofiie em execução;
- `SOFIIE_PROJECT_PATH` definido no ambiente para os comandos de projeto.

## Execução

Na raiz do repositório:

```powershell
$env:SOFIIE_PROJECT_PATH = "C:\caminho\para\um\projeto"
npm run dev --workspace desktop
```

Build nativo:

```powershell
npm run build:desktop
```

Validação da bridge:

```powershell
npm run lint:desktop
npm run test:desktop
```

O build web usado pelo Tauri é produzido por `frontend`; a chave bearer continua apenas na memória da WebView durante a sessão.

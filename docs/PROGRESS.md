# Progresso do Sofiie

## 31/10/2026: Sprint 1, configuração e dependências

Issue: [#2](https://github.com/PHnsilva/Sofiie/issues/2). Branch: `fix/2026-10-31-security-config`. Base: `origin/main`, `f4fa50e`.
PR: [#3](https://github.com/PHnsilva/Sofiie/pull/3), aberto para revisão em `main`.

### Implementado

- Inicialização rejeita bearer key e segredo HMAC iguais, sem expor os valores.
- Confiança irrestrita de proxy removida. `TRUSTED_PROXY_CIDRS` aceita somente IPs/CIDRs explícitos; vazio ignora cabeçalhos encaminhados. Redes universais `/0` e configuração inválida são rejeitadas.
- Atualizações compatíveis no lockfile para Fastify, plugins de segurança, roteamento, tratamento de URI, Vite e dependências transitivas de ferramentas, sem atualização principal automática.
- Guia de configuração de proxy e consequências para rate limiting em `SECURITY_CONFIGURATION.md`.
- Regressões para segredo reutilizado, configuração IPv4/IPv6 e limites de requisição diante de cabeçalhos forjados, inclusive cadeia de proxies.

### Verificado

- Com Node 22/npm 10: instalação limpa, 37 testes (35 backend e 2 frontend), lint, checagem TypeScript, builds de API e web, Prettier com fim de linha automático e `git diff --check` passaram.
- O PR não apresenta verificações de CI registradas. A validação acima foi local; não houve deploy nem teste em produção.

### Aguardando revisão

Implementado e validado localmente. O PR #3 está aberto para revisão humana; o PR #1, somente de documentação, foi preservado.

### Integrado

Não. Aguardando decisão de revisão; nenhuma alteração foi integrada em `main`.

### Aceito

Não. O aceite depende da revisão humana e da validação do ambiente implantado.

### Limitações e pendências

- A auditoria de dependências ainda aponta Vitest/tinypool/mocker nas ferramentas de desenvolvimento e Zod em runtime. As correções sugeridas exigem migrações principais; devem ser tratadas com regressão específica, sem declarar o sistema livre de vulnerabilidades. Não expor servidores de teste/desenvolvimento publicamente.
- A topologia e os CIDRs de ingresso da hospedagem não foram confirmados. Com configuração vazia atrás de proxy, clientes compartilham o limite por IP do proxy até configuração validada.
- Limites são por instância em memória, sem garantia distribuída.
- A proteção da autorização na bridge nativa ainda está pendente e é a próxima prioridade. Nenhuma ação local foi executada nesta entrega.
- MCP está planejado para as sprints 2/3, ainda não implementado. Backend continua monólito; REST externo e IPC Tauri permanecem. Não há microserviços que exijam gRPC.

### Próxima entrega

Reforçar a autorização na bridge Tauri, rejeitando ações sensíveis sem prova válida antes da execução. Não duplicar este incremento nem o PR #1. Prosseguir com as migrações de dependências restantes sem adiar a proteção nativa.

# Trabalho de agentes no Sofiie

- Leia README, READMEs dos workspaces, a issue concreta e `docs/KANBAN.md` antes de editar. Consulte PRs, comentários, branches e HEAD atuais pelo MCP do GitHub.
- O repositório é `PHnsilva/Sofiie`. A cópia local de referência está em `D:\Dev\Projetos\Sofiie`; preserve código, downloads e caches no D: quando possível. Node/npm do host não substituem as versões declaradas no projeto.
- Issues seguem o contrato de contexto/evidência, resultado, escopo, aceite, validação e dependências direcionais do Sofiie Agents. Use o template de entrega; refine o conteúdo antes de iniciar.
- Prefira MCP do GitHub para issues, arquivos e PRs. Veja `docs/AGENT_WORKFLOW.md`. Ausência de ferramenta de Projects não autoriza fingir que um quadro foi atualizado.
- Uma entrega em implementação por vez. Ready exige escopo verificável e pré-requisitos disponíveis. Bloqueios registram motivo, quem resolve, próxima ação e condição de liberação.
- Preserve a branch de PR existente ao continuá-lo. Novas entregas usam `tipo/numero-resumo`, commits lógicos e PR com diff restrito. Dependência de PR aberto exige base explícita e ordem de integração.
- O usuário pediu progresso diário às 6h de America/Sao_Paulo, começando em 02/11/2026, com registro e PR para revisão no fim de semana. O agendamento precisa ser confirmado no aplicativo; este arquivo não o ativa.
- PR descreve problema, comportamento resultante, issue, dependências, validações reais e limites. Não criar PR vazio para cumprir frequência. Se houver bloqueio, registrar e avançar trabalho independente autorizado.
- Não fazer autoaprovação, auto-merge, commit direto em main ou implantação sem aprovação específica. PR aberto, CI verde, integrado e aceito são estados distintos.
- Preserve monólito modular, comandos determinísticos, modelo limitado a texto e bridge com allowlist. Não habilitar shell arbitrário nem aceitar ação sugerida por modelo como autorização.
- Gasto adicional autorizado: R$ 0. Não contratar APIs, serviços ou planos. Não publicar chaves, PIN, conversas pessoais ou arquivos `.env`.
- Validar no runtime declarado: formatação, lint, tipos, testes e build proporcionais à mudança. Mudança de desktop exige fronteiras Rust/Tauri e Windows real; interface exige teclado e inspeção em desktop/celular. Distinguir mocks de integração e não repetir resultado antigo como atual.
- Deixe a retomada reproduzível: issue, branch/PR, SHA, implementado, validado, em revisão, integrado, aceito, bloqueio e próxima ação.

## Prioridade aprovada para as próximas retomadas

- Ler `docs/DAILY_PLAN.md` e a decisão de hosts/clientes antes de selecionar a próxima entrega. Priorizar especializações aplicáveis ao Sofiie/Velumbra e seus contratos/avaliações, respeitando dependências e as alterações do proprietário no Kanban. Não criar servidores MCP nos consumidores.
- O cronograma no aplicativo é uma configuração separada; registrar seu identificador e conferir o próximo disparo antes de declarar a rotina ativa.

<!-- BEGIN GOVERNANCE 2026-11-06 -->
## Regras obrigatórias de implementação e contribuição

Leia `docs/CONTRIBUTION_POLICY.md` antes de criar issues ou implementar. A instrução atual do proprietário exige issue definida → branch → alteração/validação → PR. Somente Pedro (PHnsilva) revisa e aprova PRs e dá aceite das issues; agentes não aprovam, não fazem merge/auto-merge nem deploy por conta própria. Preserve trabalho e PRs existentes.

Issues usam o formulário Entrega verificável, com requisitos/resultado, escopo, aceite, evidências, dependências direcionais, sprint e tamanho: PP=1, P=2, M=4, L=8. Aplique exatamente uma label `size:*` correspondente. No ciclo inicial são no máximo 5 sprints de entrega + 1 de validação extra e mudanças, cada uma de até uma semana; definir todas as issues do ciclo antes da implementação, após resolver dúvidas de escopo/RF/RNF/arquitetura com Pedro. Não substituir o plano existente por suposição.

Rotina ativa exige 1 L equivalente por dia por projeto, sem inflar estimativas ou alegar avanço inexistente; implementação validada e PR pronto para revisão não equivalem a aceite. Respeite pausas, datas e prioridades mais recentes. Custo adicional autorizado permanece zero. Trabalhar apenas no C:, nunca no D:.
<!-- END GOVERNANCE 2026-11-06 -->

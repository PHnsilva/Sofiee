# Kanban do Sofiie

[Abrir o quadro oficial](https://github.com/users/PHnsilva/projects/6/views/1) · [Issues](https://github.com/PHnsilva/Sofiie/issues)

## Estado conferido em 01/11/2026

O Project #6 foi vinculado a `PHnsilva/Sofiie` e recebeu 8 issues abertas reais, sem duplicar PRs como entregas. Foram salvos campos Status, Prioridade, Área e Bloqueio e visões de Kanban, backlog/dependências e revisão/validação. Issues e Project são a fonte operacional; esta documentação não replica seu estado em tempo real.

A GitHub CLI foi autenticada pelo proprietário no D: e permite operar o quadro em segundo plano. O MCP do GitHub atende às operações disponíveis de repositório/issues/PRs. Não depende de manter o Edge em primeiro plano.

## Objetivo e decisões de produto

Assistente virtual para conversar por texto e voz e integrar ações controladas em desktop, mobile e softwares de carro, incluindo cenários de Spotify e Maps. Isso é o objetivo informado pelo proprietário, não uma declaração de suporte já implementado.

Escopos e sprints serão discutidos com Pedro um projeto por vez, com Velumbra por último. Nenhum compromisso semanal, prazo final, esforço ou atribuição humana foi inventado. Prioridades iniciais organizam o trabalho já conhecido e serão revisadas nessa conversa.

## Fluxo

| Fase | Critério |
| --- | --- |
| Backlog | Necessidade registrada; podem faltar refinamento ou decisões. |
| Pronto | Escopo, aceite e validação claros; pré-requisitos disponíveis. |
| Em andamento | Entrega selecionada; limite inicial de uma implementação por projeto. |
| Em revisão | PR/artefato concreto e evidências disponíveis para Pedro revisar. |
| Em validação | Revisão realizada; falta aceite no ambiente ou experiência alvo. |
| Concluído | Critérios, integração e aceite humano comprovados. |

Bloqueios preservam a fase e registram motivo, quem resolve, próxima ação e evidência de desbloqueio. O número da issue não define ordem técnica. Agrupamento/subissue não substitui dependência.

Automações de fechar issue, mover por vínculo de PR e mover por merge foram retiradas para preservar o fluxo de revisão/aceite. Fechamento manual de issue aceita pode atualizar o quadro; não usar movimento de cartão como prova de conclusão. Não há autoaprovação ou auto-merge.

## Contratos e dependências iniciais

| Issue | Pré-requisitos/decisões |
| --- | --- |
| [#2](https://github.com/PHnsilva/Sofiie/issues/2) | Sem bloqueio técnico registrado; consultar o contrato atual da issue. |
| [#4](https://github.com/PHnsilva/Sofiie/issues/4) | Sem bloqueio técnico registrado; consultar o contrato atual da issue. |
| [#5](https://github.com/PHnsilva/Sofiie/issues/5) | Sem bloqueio técnico registrado; consultar o contrato atual da issue. |
| [#6](https://github.com/PHnsilva/Sofiie/issues/6) | Bloqueada por #2, #5. Consumir a base de segurança e preparar runtime compatível. |
| [#7](https://github.com/PHnsilva/Sofiie/issues/7) | Bloqueada por #5. Definir o primeiro resultado de produto com Pedro após as conexões. |
| [#8](https://github.com/PHnsilva/Sofiie/issues/8) | Bloqueada por #2, #5. Definir integração desktop/mobile/carro e preparar ambiente. |
| [#9](https://github.com/PHnsilva/Sofiie/issues/9) | Decidir necessidade e contrato de memória antes de persistir. |
| [#10](https://github.com/PHnsilva/Sofiie/issues/10) | Definir papéis MCP e reutilização do servidor existente antes de implementar. |

Dependências técnicas foram registradas nativamente no GitHub quando há consumo real de um pré-requisito. O campo Bloqueio destaca também decisões/impedimentos externos. As issues seguem contexto/evidência, resultado esperado, escopo, critérios de aceite, validação e dependências; o template ajuda na captura e não substitui refinamento.

Tipo usa a família `type:*` como alternativa explícita enquanto o tipo nativo não estiver configurado. Área, prioridade, tipo, marco e esforço têm propósitos distintos. Marcos existentes não são automaticamente sprints.

## MCP e retomada

MCP não exige outro repositório ou um servidor em cada aplicação. Um sistema consumidor pode usar apenas um cliente; expor ferramentas exige um servidor/adaptador somente quando houver capacidade e consumidor definidos. O Sofiie Agents já tem servidor stdio. A interface MCP fica na arquitetura do Sofiie Agents; sistemas consumidores usam cliente quando necessário. Não será criado servidor próprio no Sofiie/Velumbra nesta organização; os rascunhos separados de contexto do Sofiie/Velumbra foram retirados antes de publicação.

Consultar [AGENTS.md](../AGENTS.md) e [operação por MCP/CLI](AGENT_WORKFLOW.md). A cópia local fica em `D:\Dev\Projetos\Sofiie`; inventariar SDKs antes de baixar novamente e manter custo adicional zero.

Pedido de rotina: diariamente às 6h de America/Sao_Paulo, a partir de 02/11/2026, com avanço verificável, registro e PR para revisão no fim de semana. O cadastro dos novos chats e das automações é etapa posterior; este documento não o ativa.

## Bases de revisão preservadas

[PR #1](https://github.com/PHnsilva/Sofiie/pull/1) de READMEs e [PR #3](https://github.com/PHnsilva/Sofiie/pull/3) de segurança permanecem independentes e abertos. A issue #2 foi refinada, sem reimplementar a correção. #5 prepara ambiente compatível; #6 trata a auditoria remanescente na base de segurança.

Foi encontrado Node 24.19/npm 11 no D:. O produto declara Node >=20.19 <23/npm 10; nenhuma validação do produto em runtime incompatível é anunciada nesta organização.

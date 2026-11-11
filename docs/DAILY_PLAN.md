# Retomada vigente

Ler [EXECUTION_PLAN.md](EXECUTION_PLAN.md), [DELIVERY_PLAN.md](DELIVERY_PLAN.md) e [WEEKLY_EXECUTION.md](WEEKLY_EXECUTION.md). Estas são as instruções atuais de execução e dependências, substituindo prioridades e armazenamento históricos abaixo.

# Retomada diária e fonte operacional

Leia AGENTS, REQUIREMENTS, ARCHITECTURE_PLAN, DELIVERY_PLAN, TRACEABILITY e a issue/PR atual. O quadro vivo, comentários e instruções mais recentes de Pedro prevalecem sobre fotografias antigas.

Meta mínima: 1 L equivalente (8 unidades) por dia deste projeto quando a rotina estiver ativa. Na rotina dos cinco agentes, a meta vale individualmente, totalizando 40 unidades; um projeto não compensa outro. Registrar bloqueios e continuar trabalho independente autorizado sem inventar progresso.

**Implementação pausada até 21/11/2026.** Premium confirmado; Mac ausente e validação iPhone/CarPlay permitida para depois. Não reativar rotina por ler este arquivo.

Uma implementação por projeto de cada vez. Usar issue definida e branch/PR; validar critérios e distinguir produzido, testado, integrado e aceito. Somente Pedro revisa/aprova PRs e aceita issues. Respeitar agenda efetiva do aplicativo e pausas. Este documento não cria/reativa rotina.

Tudo no C:, incluindo ferramentas, modelos, dependências, downloads, caches e artefatos; D: é biblioteca de jogos. Custos adicionais não estão autorizados. Não publicar dados pessoais, credenciais ou reserva privada.

SlothGeo é outro projeto com início só em 21/11/2026, não um sexto agente desta rotina. Não antecipar sua implementação/backlog de produto.

Execução semanal: ler [WEEKLY_EXECUTION.md](WEEKLY_EXECUTION.md). Espera de revisão/merge não deve impedir PRs dependentes sobre artefatos já disponíveis e tecnicamente validados, com base/ordem explícitas.

<details>
<summary>Registro anterior preservado — histórico, não operacional</summary>

# Plano diário — Sofiie

## Objetivo do próximo ciclo

Tornar a base executável/reproduzível após a formatação e preparar o consumo dos especialistas como host com cliente MCP. O produto oferece texto/voz e execução de ações programadas; o raciocínio especializado deve ser delegado por contrato, sem dar ao modelo autoridade direta sobre o dispositivo.

## Fila inicial, revista com o estado vivo

1. [#5 Ambiente](https://github.com/PHnsilva/Sofiie/issues/5): inventariar instalações e preparar runtime compatível. O Node 24 encontrado não atende ao intervalo declarado pelo produto.
2. [#2 Segurança](https://github.com/PHnsilva/Sofiie/issues/2), [PR #3](https://github.com/PHnsilva/Sofiie/pull/3) e [#6 Dependências](https://github.com/PHnsilva/Sofiie/issues/6): conferir HEAD e evidências atuais antes de construir integração sobre a base.
3. [#10 Decisão MCP](https://github.com/PHnsilva/Sofiie/issues/10): a decisão de host/cliente foi aprovada; preservar o registro para revisão. O contrato do serviço está em [Agents #15](https://github.com/PHnsilva/sofiie-agents/issues/15).
4. [#12 Cliente MCP](https://github.com/PHnsilva/Sofiie/issues/12): preparar/implementar adaptador conforme pré-requisitos, SDK/runtime e topologia reais. Resultado do especialista é validado antes de qualquer ação permitida; PIN, confirmação, allowlist e modo carro permanecem no produto.

## Saída do ciclo de preparação

Ambiente e regressão de base reproduzíveis; fronteira entre assistente, cliente MCP, especialistas e executor descrita; cenários negativos e configuração mínima definidos para revisar. A integração final exige servidor/ferramenta especializada executável e conexão comprovada, não apenas mock ou handoff.

Web/voz, desktop, mobile/carro e memória têm entregas e critérios próprios. As metas detalhadas e datas dos sprints serão discutidas com Pedro; não declarar Android Auto, CarPlay, Spotify ou Maps suportados apenas porque há uma intenção ou esquema de comando.

## Rotina acordada

Executar diariamente às 6h de America/Sao_Paulo, a partir de 02/11/2026, no mesmo chat do projeto. Hoje, 01/11, organizar e documentar; não antecipar implementação de produto. O registro deste arquivo não cria a automação: conferir o agendamento efetivo no aplicativo.

Cada retomada lê AGENTS, README, issue e PRs atuais, considera as mudanças de Pedro no Kanban e seleciona uma entrega pequena e desbloqueada. Preservar branches/autoria e trabalho em andamento. Preferir MCP do GitHub para operações suportadas e CLI para Projects, sem depender do Edge. Uma implementação por projeto de cada vez.

Progresso significa resultado novo e verificável: código/contrato/evidência que satisfaz um critério ou resolve uma decisão necessária. Registrar data/fuso, issue, branch/PR e SHA, o que mudou, como foi validado, limites, bloqueios e próximo passo. Não criar PR vazio nem repetir diagnóstico como avanço. Abrir PR quando houver alteração concreta; ao continuar uma entrega, preservar seu PR e documentar o incremento diário.

Revisão/aceite por Pedro no fim de semana, inclusive quando o dia da rotina cair no fim de semana. Não fazer autoaprovação, auto-merge ou deploy. Em PR empilhado declarar a base e a ordem; não trabalhar sobre dependência aberta como se estivesse aceita.

Trabalhar no D:, inventariar antes de baixar ferramentas/modelos, respeitar versões e registrar limitações do disco lento. Gasto adicional R$ 0. Não publicar chaves, conversas reais ou casos de reserva. Com bloqueio, registrar motivo, quem resolve, próxima ação e evidência de desbloqueio; avançar uma parte independente autorizada.

## Uso de especializações e MCP

Sofiie e Velumbra serão hosts com clientes MCP dentro de suas arquiteturas. Sofiie Agents mantém o servidor como adaptador de seu núcleo e o cliente de saída já existente; a conexão de saída só é usada com necessidade e peer definidos. Não criar novos servidores/repositórios para os consumidores, nem conectar o Agents a um servidor de produto inexistente.

O servidor atual do Agents usa stdio e o modo padrão handoff não executa inferência. Backend remoto do Sofiie/Vercel não alcança um processo no PC por stdio. A topologia e o transporte devem ser definidos/validados antes da integração final, sem contratar hospedagem. Um cliente de teste, SDK instalado ou PR aberto não comprova interpretação especializada em produção.

Priorizar especialistas e avaliações que ajudem nos dois produtos. Primeiro, contrato de entrada/saída, contexto, limites e rubrica; depois baseline real e melhoria comparada. Reutilizar perfis adequados e propor especialização nova apenas por lacuna demonstrada. Não chamar mudança de prompt, roteamento ou mock de treinamento de pesos ou ganho medido.

</details>

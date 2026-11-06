# Arquitetura e fronteiras do ciclo

Preservar monólito Fastify/TypeScript, frontend e bridge Tauri existentes. Host com clientes MCP dos quatro agentes; local stdio só no mesmo ambiente, backend remoto exige transporte/implantação acessível autenticada. Preferir integrações oficiais e intenções/links suportados, sem controle irrestrito do sistema. Spotify Premium confirmado. Sem Mac: a preparação iOS/CarPlay e seus testes de contrato não comprovam build/aceite nativo, que pode ocorrer depois por autorização de Pedro.

## Execução e capacidades

Escolher dependências/modelos após inventário, licença, compatibilidade e medição. Operações estruturadas que não exigem modelo devem funcionar sem inferência desnecessária. Um adaptador de modelo local compartilhável não exige cinco modelos carregados, e servidor MCP não substitui o raciocínio/domínio. Não usar nuvem paga como fallback silencioso.

A implementação deve manter contratos de entradas/saídas/erros e limites de tempo/memória. Contexto, documentos e respostas de ferramentas/modelos são dados não confiáveis; não concedem acesso a disco/rede/contas ou execução. O consumidor mantém as decisões de autorização.

Para integração, primeiro contrato e ferramenta implementada, depois cliente/servidor reais e cenários negativos. Teste entre componentes do próprio repo não prova comunicação com outro agente. Versão/retorno mock não comprova homologação.

## Dados, avaliação e treinamento

Registrar proveniência e finalidade. Separar desenvolvimento, regressão e reserva; curar exemplos sanitizados/licenciados. Medir versão atual e candidata com resultados por caso e recursos. Melhorar instruções/ferramentas/conhecimento não altera pesos. Treino de pesos depende de modelo/licença, dados e capacidade, com protocolo de comparação reservado e aceite humano. Sem benefício demonstrado, manter a decisão de não treinar e suas condições de revisão.

Referência para organização de especialidades: https://learn.chatgpt.com/docs/agent-configuration/subagents . A inspiração é delimitar responsabilidade, instruções, ferramentas e contexto por papel; não é uso de API paga nem comprovação de especialistas treinados. Avaliação: https://developers.openai.com/api/docs/guides/evaluation-best-practices .

Execução semanal: ler [WEEKLY_EXECUTION.md](WEEKLY_EXECUTION.md). Espera de revisão/merge não deve impedir PRs dependentes sobre artefatos já disponíveis e tecnicamente validados, com base/ordem explícitas.

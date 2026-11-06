# Plano de entrega — cinco sprints + validação extra

Cada sprint dura até uma semana de execução deste projeto. S1–S5 entregam funcionalidades e S6 concentra validação extra/mudanças; verificar desde S1. Números de sprint são locais: uma dependência entre projetos pode exigir espera e não se resolve apenas porque ambos estão na mesma S2. Início/pausas vigentes prevalecem; não há datas finais garantidas por documentação.

| Sprint | Objetivo                           | Unidades estimadas | Média diária para até 7 dias |
| ------ | ---------------------------------- | ------------------ | ---------------------------- |
| S1     | Ambiente, segurança e planejamento | 28                 | 4.0                          |
| S2     | Texto/voz e clientes de agentes    | 36                 | 5.14                         |
| S3     | Windows, Maps e Spotify            | 32                 | 4.57                         |
| S4     | Android e experiência no carro     | 32                 | 4.57                         |
| S5     | iPhone/CarPlay e operação          | 28                 | 4.0                          |
| S6     | Validação extra e mudanças         | 24                 | 3.43                         |

A soma abaixo inclui entregas ainda em revisão, para rastrear o escopo total; não é esforço restante certificado. Conferir o que já foi produzido e aceito antes de selecionar nova implementação. A meta diária é 1 L equivalente por projeto ativo; não recontar issue/PR/agrupador como a mesma entrega.

## S1 — Ambiente, segurança e planejamento

| Issue                                                     | Entrega                                                                  | Tamanho | Bloqueada por                                             |
| --------------------------------------------------------- | ------------------------------------------------------------------------ | ------- | --------------------------------------------------------- |
| [Sofiee#15](https://github.com/PHnsilva/Sofiee/issues/15) | Padronizar issues, tamanhos e contribuição com aceite exclusivo de Pedro | P (2)   | Sem pré-requisito técnico anterior                        |
| [Sofiee#16](https://github.com/PHnsilva/Sofiee/issues/16) | Documentar RF/RNF e ciclo sem antecipar implementação pausada            | M (4)   | Sem pré-requisito técnico anterior                        |
| [Sofiee#4](https://github.com/PHnsilva/Sofiee/issues/4)   | Organizar backlog, Kanban e retomada com sprints e tamanhos              | P (2)   | [Sofiee#16](https://github.com/PHnsilva/Sofiee/issues/16) |
| [Sofiee#5](https://github.com/PHnsilva/Sofiee/issues/5)   | Reproduzir instalação e checks no Windows com runtime compatível         | M (4)   | [Sofiee#16](https://github.com/PHnsilva/Sofiee/issues/16) |
| [Sofiee#2](https://github.com/PHnsilva/Sofiee/issues/2)   | Proteger configuração e identificação de IP da API                       | L (8)   | [Sofiee#5](https://github.com/PHnsilva/Sofiee/issues/5)   |
| [Sofiee#6](https://github.com/PHnsilva/Sofiee/issues/6)   | Resolver ou justificar dependências na base de segurança                 | M (4)   | [Sofiee#2](https://github.com/PHnsilva/Sofiee/issues/2)   |
| [Sofiee#10](https://github.com/PHnsilva/Sofiee/issues/10) | Definir topologia dos quatro clientes MCP e disponibilidade local/nuvem  | M (4)   | [Sofiee#16](https://github.com/PHnsilva/Sofiee/issues/16) |

## S2 — Texto/voz e clientes de agentes

| Issue                                                     | Entrega                                                             | Tamanho | Bloqueada por                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| --------------------------------------------------------- | ------------------------------------------------------------------- | ------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [Sofiee#12](https://github.com/PHnsilva/Sofiee/issues/12) | Integrar clientes MCP dos quatro agentes com contratos versionados  | L (8)   | [Sofiee#10](https://github.com/PHnsilva/Sofiee/issues/10), [Sofiee#2](https://github.com/PHnsilva/Sofiee/issues/2), [sofiee-agent-communication#8](https://github.com/PHnsilva/sofiee-agent-communication/issues/8), [sofiee-agent-calculation#8](https://github.com/PHnsilva/sofiee-agent-calculation/issues/8), [sofiee-agent-search#8](https://github.com/PHnsilva/sofiee-agent-search/issues/8), [sofiee-agent-validation#8](https://github.com/PHnsilva/sofiee-agent-validation/issues/8) |
| [Sofiee#7](https://github.com/PHnsilva/Sofiee/issues/7)   | Validar conversa completa por texto e voz no produto                | L (8)   | [Sofiee#5](https://github.com/PHnsilva/Sofiee/issues/5), [Sofiee#12](https://github.com/PHnsilva/Sofiee/issues/12), [sofiee-agent-communication#19](https://github.com/PHnsilva/sofiee-agent-communication/issues/19)                                                                                                                                                                                                                                                                          |
| [Sofiee#17](https://github.com/PHnsilva/Sofiee/issues/17) | Conectar cálculo, busca filtrada e validação ao fluxo do assistente | L (8)   | [Sofiee#12](https://github.com/PHnsilva/Sofiee/issues/12), [Sofiee#7](https://github.com/PHnsilva/Sofiee/issues/7)                                                                                                                                                                                                                                                                                                                                                                             |
| [Sofiee#18](https://github.com/PHnsilva/Sofiee/issues/18) | Validar planos antes da execução com confirmação e allowlist        | L (8)   | [Sofiee#2](https://github.com/PHnsilva/Sofiee/issues/2), [Sofiee#12](https://github.com/PHnsilva/Sofiee/issues/12)                                                                                                                                                                                                                                                                                                                                                                             |
| [Sofiee#19](https://github.com/PHnsilva/Sofiee/issues/19) | Preservar personalidades, estados e acessibilidade do produto       | M (4)   | [Sofiee#7](https://github.com/PHnsilva/Sofiee/issues/7)                                                                                                                                                                                                                                                                                                                                                                                                                                        |

## S3 — Windows, Maps e Spotify

| Issue                                                     | Entrega                                                         | Tamanho | Bloqueada por                                             |
| --------------------------------------------------------- | --------------------------------------------------------------- | ------- | --------------------------------------------------------- |
| [Sofiee#20](https://github.com/PHnsilva/Sofiee/issues/20) | Definir operações Maps por plataforma e mecanismos suportados   | M (4)   | [Sofiee#18](https://github.com/PHnsilva/Sofiee/issues/18) |
| [Sofiee#21](https://github.com/PHnsilva/Sofiee/issues/21) | Implementar e validar abertura/navegação Maps no Windows        | L (8)   | [Sofiee#20](https://github.com/PHnsilva/Sofiee/issues/20) |
| [Sofiee#22](https://github.com/PHnsilva/Sofiee/issues/22) | Definir autenticação e capacidades Spotify por dispositivo      | M (4)   | [Sofiee#18](https://github.com/PHnsilva/Sofiee/issues/18) |
| [Sofiee#23](https://github.com/PHnsilva/Sofiee/issues/23) | Implementar busca e controles Spotify com dispositivo explícito | L (8)   | [Sofiee#22](https://github.com/PHnsilva/Sofiee/issues/22) |
| [Sofiee#8](https://github.com/PHnsilva/Sofiee/issues/8)   | Homologar bridge e ações permitidas no Windows                  | L (8)   | [Sofiee#18](https://github.com/PHnsilva/Sofiee/issues/18) |

## S4 — Android e experiência no carro

| Issue                                                     | Entrega                                                                  | Tamanho | Bloqueada por                                                                                                                                                                 |
| --------------------------------------------------------- | ------------------------------------------------------------------------ | ------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [Sofiee#24](https://github.com/PHnsilva/Sofiee/issues/24) | Implementar adaptadores Android para Maps, Spotify e comunicação         | L (8)   | [Sofiee#20](https://github.com/PHnsilva/Sofiee/issues/20), [Sofiee#22](https://github.com/PHnsilva/Sofiee/issues/22), [Sofiee#7](https://github.com/PHnsilva/Sofiee/issues/7) |
| [Sofiee#25](https://github.com/PHnsilva/Sofiee/issues/25) | Aplicar política de interação segura em modo carro                       | L (8)   | [Sofiee#24](https://github.com/PHnsilva/Sofiee/issues/24), [Sofiee#18](https://github.com/PHnsilva/Sofiee/issues/18)                                                          |
| [Sofiee#26](https://github.com/PHnsilva/Sofiee/issues/26) | Preparar e homologar integração Android Auto suportada                   | L (8)   | [Sofiee#25](https://github.com/PHnsilva/Sofiee/issues/25)                                                                                                                     |
| [Sofiee#27](https://github.com/PHnsilva/Sofiee/issues/27) | Implementar estado de sessão e preferências conforme o contrato definido | M (4)   | [Sofiee#7](https://github.com/PHnsilva/Sofiee/issues/7), [Sofiee#9](https://github.com/PHnsilva/Sofiee/issues/9)                                                              |
| [Sofiee#9](https://github.com/PHnsilva/Sofiee/issues/9)   | Definir contrato de histórico e memória antes da persistência            | M (4)   | [Sofiee#7](https://github.com/PHnsilva/Sofiee/issues/7)                                                                                                                       |

## S5 — iPhone/CarPlay e operação

| Issue                                                     | Entrega                                                       | Tamanho | Bloqueada por                                                                                                                                                                   |
| --------------------------------------------------------- | ------------------------------------------------------------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [Sofiee#28](https://github.com/PHnsilva/Sofiee/issues/28) | Preparar adaptadores iPhone e plano de build/validação nativa | L (8)   | [Sofiee#20](https://github.com/PHnsilva/Sofiee/issues/20), [Sofiee#22](https://github.com/PHnsilva/Sofiee/issues/22), [Sofiee#18](https://github.com/PHnsilva/Sofiee/issues/18) |
| [Sofiee#29](https://github.com/PHnsilva/Sofiee/issues/29) | Preparar integração CarPlay e dependência de entitlement      | L (8)   | [Sofiee#28](https://github.com/PHnsilva/Sofiee/issues/28), [Sofiee#25](https://github.com/PHnsilva/Sofiee/issues/25)                                                            |
| [Sofiee#30](https://github.com/PHnsilva/Sofiee/issues/30) | Tratar agentes locais/remotos e disponibilidade do PC         | L (8)   | [Sofiee#12](https://github.com/PHnsilva/Sofiee/issues/12)                                                                                                                       |
| [Sofiee#31](https://github.com/PHnsilva/Sofiee/issues/31) | Registrar resultados e falhas de ações com privacidade        | M (4)   | [Sofiee#30](https://github.com/PHnsilva/Sofiee/issues/30)                                                                                                                       |

## S6 — Validação extra e mudanças

| Issue                                                     | Entrega                                                                | Tamanho | Bloqueada por                                                                                                                                                                 |
| --------------------------------------------------------- | ---------------------------------------------------------------------- | ------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [Sofiee#32](https://github.com/PHnsilva/Sofiee/issues/32) | Executar regressão integrada das plataformas disponíveis               | L (8)   | [Sofiee#8](https://github.com/PHnsilva/Sofiee/issues/8), [Sofiee#23](https://github.com/PHnsilva/Sofiee/issues/23), [Sofiee#26](https://github.com/PHnsilva/Sofiee/issues/26) |
| [Sofiee#33](https://github.com/PHnsilva/Sofiee/issues/33) | Validar permissões, autenticação e injeção nos fluxos completos        | L (8)   | [Sofiee#31](https://github.com/PHnsilva/Sofiee/issues/31)                                                                                                                     |
| [Sofiee#34](https://github.com/PHnsilva/Sofiee/issues/34) | Registrar e executar homologação iPhone/CarPlay quando houver ambiente | M (4)   | [Sofiee#28](https://github.com/PHnsilva/Sofiee/issues/28), [Sofiee#29](https://github.com/PHnsilva/Sofiee/issues/29)                                                          |
| [Sofiee#35](https://github.com/PHnsilva/Sofiee/issues/35) | Entregar documentação e aceite por plataforma                          | M (4)   | [Sofiee#32](https://github.com/PHnsilva/Sofiee/issues/32), [Sofiee#33](https://github.com/PHnsilva/Sofiee/issues/33)                                                          |

## Continuidade e revisão

Antes de cada entrega, ler a issue, dependências, PRs/comentários e quadro vivo. PR aberto não equivale a aceite; pode fornecer pré-requisito técnico provisório conforme WEEKLY_EXECUTION.md. Preservar artefatos corretos e branches já em revisão. Somente Pedro revisa/aprova PRs, aceita e fecha as issues. Sprints e estimativas são planejamento, não declaração de conclusão.

Para agentes, depois do ciclo inicial continua o aperfeiçoamento por evidências: novas falhas/casos geram backlog real. Preparação/decisão de treino de pesos não é treino executado. Não prometer treinamento diário automático nem autopromover versão/lesson.

Execução semanal: ler [WEEKLY_EXECUTION.md](WEEKLY_EXECUTION.md). Espera de revisão/merge não deve impedir PRs dependentes sobre artefatos já disponíveis e tecnicamente validados, com base/ordem explícitas.

# Requisitos e escopo vigente — ciclo inicial

Assistente pessoal por texto/voz e consumidor dos quatro agentes, com ações permitidas em Windows, Android, iPhone e carro.

Definido a partir das decisões de Pedro até 06/11/2026. Documento de planejamento; não comprova implementação, treinamento, revisão ou aceite. As alterações são propostas no PR de organização, sem merge por agente.

## Requisitos funcionais

| ID  | Resultado exigido                                                                                                                     |
| --- | ------------------------------------------------------------------------------------------------------------------------------------- |
| F01 | Preservar interface textual/voz, personalidades, olhos/estados e comandos determinísticos existentes.                                 |
| F02 | Consumir Comunicação, Cálculo, Busca e Validação por contratos MCP e validar resultados antes de ações.                               |
| F03 | Manter autorização, PIN/confirmação, allowlist e política de risco no produto, inclusive modo carro.                                  |
| F04 | Executar ações permitidas no Windows por bridge e adaptadores sem shell arbitrário.                                                   |
| F05 | Pesquisar destino e iniciar navegação no Google Maps pelos mecanismos suportados em cada plataforma.                                  |
| F06 | Buscar música, tocar/pausar, trocar faixa e volume no Spotify conforme permissões e suporte de dispositivo.                           |
| F07 | Oferecer uso no Android com voz e integrações permitidas e preparar experiência Android Auto compatível.                              |
| F08 | Preparar integração nativa iPhone/CarPlay nos mecanismos permitidos, mantendo validação real pendente de Mac/dispositivo/entitlement. |
| F09 | Definir sessão, histórico e preferência com minimização de dados e persistência apenas conforme requisito.                            |
| F10 | Tratar agentes/aplicativos indisponíveis e diferença de disponibilidade local/nuvem sem executar propostas não validadas.             |

## Requisitos não funcionais

| ID  | Critério                                                                                                                                                                                                                                                                                                              |
| --- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| N01 | Contribuição rastreável por issue/branch/PR; somente Pedro revisa/aprova PRs e aceita issues, sem merge/auto-merge/deploy de agentes. Durante a semana, dependência tecnicamente disponível em branch/PR validado pode ser consumida provisoriamente em PR empilhado; revisão/aceite/merge ficam com Pedro no sábado. |
| N02 | Contratos versionados, entradas/saídas validadas e erros explícitos; dados externos nunca concedem permissões.                                                                                                                                                                                                        |
| N03 | Sem serviço pago obrigatório, faturamento ou fallback remoto automático; executar ferramentas/caches no C: e respeitar pausas.                                                                                                                                                                                        |
| N04 | Testes de sucesso/erro e avaliações reais reproduzíveis; registrar versões e distinguir mock, execução e aceite humano.                                                                                                                                                                                               |
| N05 | Minimização de dados, credenciais fora do Git, acesso mínimo e retenção/exclusão definidas; não publicar dados reais de usuários.                                                                                                                                                                                     |
| N06 | Limites de entrada, memória, concorrência e tempo configuráveis, cancelamento e falha fechada; medir desempenho no hardware disponível.                                                                                                                                                                               |
| N07 | Documentação operacional coerente com código e evidências; disponibilidade ou qualidade não podem ser inferidas de um perfil ou schema.                                                                                                                                                                               |
| N08 | Até cinco sprints de entrega + uma de validação/mudanças, cada uma até uma semana; estimativas PP/P/M/L=1/2/4/8 e meta mínima de 8 unidades/dia por projeto ativo.                                                                                                                                                    |

## Fora do ciclo

- Retomar implementação antes de 21/11/2026.
- Serviços pagos/faturamento sem autorização.
- Prometer controle idêntico em todas as plataformas.
- Marcar iPhone/CarPlay homologados sem execução real.

## Verificação e aceite

Cada requisito é rastreado em TRACEABILITY.md, com critérios concretos no corpo das issues. Dados conhecidos/sintéticos e ferramentas determinísticas verificam resultados quando possível; comportamento generativo exige casos separados e revisão apropriada. Não usar um teste de roteamento, presença de perfil ou metadado para alegar competência ou treino. Não declarar cobertura completa quando há pendência de ambiente/fonte.

A meta de 8 unidades/dia é um mínimo desejado por projeto ativo, não um teto de esforço nem uma medição de inteligência. A duração semanal é o objetivo do plano; a capacidade real e os bloqueios precisam ser observados e reportados. Não fabricar tarefa/estimativa/aceite para cumprir calendário.

Spotify Premium confirmado por Pedro; Mac ausente. É autorizado preparar o trabalho agora e validar iPhone/CarPlay depois, quando houver ambiente/entitlement. A implementação continua pausada até 21/11/2026; planejamento não reativa a rotina.

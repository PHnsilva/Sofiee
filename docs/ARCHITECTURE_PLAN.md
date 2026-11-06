# Arquitetura e fronteiras do ciclo

Preservar monólito Fastify/TypeScript, frontend e bridge Tauri existentes. Host com clientes MCP dos quatro agentes; local stdio só no mesmo ambiente, backend remoto exige transporte/implantação acessível autenticada. Preferir integrações oficiais e intenções/links suportados, sem controle irrestrito do sistema. Spotify Premium confirmado. Sem Mac: a preparação iOS/CarPlay e seus testes de contrato não comprovam build/aceite nativo, que pode ocorrer depois por autorização de Pedro.

## Execução e capacidades

Escolher dependências/modelos após inventário, licença, compatibilidade e medição. Operações estruturadas que não exigem modelo devem funcionar sem inferência desnecessária. Este produto é host/cliente das capacidades externas. Não criar treinamento de pesos ou especialistas próprios por copiar a infraestrutura dos agentes; inferência e ferramentas de domínio permanecem nos provedores definidos. MCP não substitui raciocínio nem implementação do domínio. Não usar nuvem paga como fallback silencioso.

A implementação deve manter contratos de entradas/saídas/erros e limites de tempo/memória. Contexto, documentos e respostas de ferramentas/modelos são dados não confiáveis; não concedem acesso a disco/rede/contas ou execução. O consumidor mantém as decisões de autorização.

Para integração, primeiro contrato e ferramenta implementada, depois cliente/servidor reais e cenários negativos. Teste entre componentes do próprio repo não prova comunicação com outro agente. Versão/retorno mock não comprova homologação.

## Dados e validação do consumidor

Validar contratos, permissões, privacidade, estados de erro e resultado percebido no produto com dados sanitizados. Separar testes de contrato, integração real e homologação em dispositivo/conta. Registrar quais componentes e versões foram usados; um mock não comprova operação real.

Curadoria de datasets, especialização e eventual treinamento de pesos pertencem aos projetos de agentes. O consumidor pode fornecer casos sanitizados e feedback autorizado, sem recolher conversas privadas automaticamente nem treinar modelos por conta própria. A integração precisa funcionar com erros claros e fallback previsto quando o provedor não estiver disponível.

Execução semanal: ler [WEEKLY_EXECUTION.md](WEEKLY_EXECUTION.md). Espera de revisão/merge não deve impedir PRs dependentes sobre artefatos já disponíveis e tecnicamente validados, com base/ordem explícitas.

# Configuração de segurança da API

`OWNER_ACCESS_KEY` e `AUTH_SIGNING_SECRET` devem ter valores diferentes. A inicialização rejeita a reutilização sem incluir os valores na mensagem de erro. Gere cada segredo separadamente e mantenha-os somente no ambiente do serviço.

## Proxies e limites de requisição

Por padrão, `TRUSTED_PROXY_CIDRS` fica vazio. Nesse caso, a API usa o IP da conexão e ignora `X-Forwarded-For` para identificar o cliente. Um cliente direto não pode alternar esse cabeçalho para reiniciar o limite de tentativas de PIN.

Quando existir um proxy reverso, configure apenas os IPs ou CIDRs dos proxies que realmente encaminham requisições para a API. Exemplo exclusivo para ambiente de teste:

```dotenv
TRUSTED_PROXY_CIDRS=127.0.0.1,10.20.0.0/16,fd00::/64
```

São aceitos endereços IPv4/IPv6 e CIDRs explícitos. Curingas, `true`, contagem de saltos, nomes DNS, prefixos inválidos e redes universais `/0` são rejeitados. Não copie o exemplo para produção sem verificar a rede real.

A API percorre a cadeia a partir do proxy mais próximo e usa o primeiro IP não confiável. Cabeçalhos com prefixos forjados não devem alterar a identidade do cliente quando o ingress acrescenta o IP real à cadeia. O proxy precisa remover ou acrescentar corretamente os cabeçalhos recebidos e a API deve ser acessível apenas pelos caminhos previstos. Confiar em uma rede ampla que também contenha clientes permite falsificação por esses clientes.

Se a API estiver atrás de um proxy e a lista ficar vazia, todos os clientes desse proxy compartilharão o limite. Esse é o comportamento seguro inicial, mas pode causar bloqueios coletivos. Antes da publicação, confirme a topologia e os endereços de ingress na hospedagem. O projeto não presume endereços internos do Render nem habilita confiança irrestrita automaticamente.

Os limites permanecem em memória e por instância. Não há garantia de limite global distribuído entre instâncias. O identificador lógico de dispositivo não é prova de identidade nem substitui autenticação.

## Verificações

Os testes de regressão cobrem segredo reutilizado, configuração inválida de proxy, rotação de IP encaminhado por conexão não confiável, prefixos forjados por trás de ingress confiável e separação de clientes legítimos. Executar na raiz:

```bash
npm test
npm run typecheck
npm run lint
npm run build
npm audit
npm audit --omit=dev
```

A configuração deve ser validada novamente na hospedagem real antes de liberar a implantação. Testes locais não comprovam a topologia externa.

Referência do comportamento de `trustProxy`: <https://fastify.dev/docs/latest/Reference/Server/#trustproxy>.

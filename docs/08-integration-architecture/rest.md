---
id: rest
title: REST
sidebar_position: 1
description: O estilo padrão de integração síncrona — o que ele de fato propõe, e o que quase todo mundo chama de REST sem ser.
doc_type: concept
level: 5
difficulty: intermediário
status: complete
objective: >
  Ao terminar, o leitor projeta APIs HTTP que usam a semântica do protocolo em
  vez de tunelar chamadas de método sobre ele.
prerequisites: [integration-architecture]
related: [graphql, grpc, integration-contracts]
canonical_for: [REST, recurso, verbo HTTP, HATEOAS]
content_version: 1
last_reviewed: 2026-08-27
---

# REST

## Visão Geral

REST é um estilo arquitetural baseado em **recursos** identificados por URL,
manipulados por um conjunto fixo de verbos, com semântica definida pelo próprio
HTTP.

Quase nenhuma API chamada de REST é REST no sentido original — a maioria é
"HTTP com JSON", o que é legítimo e não é a mesma coisa.

A distinção importa menos como pureza e mais pelo que se perde ao ignorá-la:
cache, idempotência, tratamento uniforme de erro e evolução — tudo isso o
protocolo já oferece, de graça, para quem usa sua semântica.

## Problema

O padrão mais comum em APIs HTTP é tunelar chamadas de método:

```text
POST /criarPedido
POST /buscarPedidoPorId
POST /cancelarPedido
```

Isso funciona, e joga fora o que o protocolo dá. Tudo é `POST`, então nada é
cacheável nem seguro de repetir. Erros viram `200` com um campo `sucesso: false`,
então nenhum intermediário — proxy, gateway, cliente — entende o que aconteceu.

O resultado é uma API que precisa reimplementar, em convenção própria, coisas que
o HTTP já resolve.

## Conceitos Centrais

### Recurso, não operação

A modelagem central: a URL identifica **coisas**, e o verbo diz o que se faz com
elas.

```text
GET    /pedidos/123          obter
PUT    /pedidos/123          substituir
PATCH  /pedidos/123          alterar parcialmente
DELETE /pedidos/123          remover
POST   /pedidos              criar
```

A pergunta que orienta: se isto fosse um documento, qual seria seu endereço?

Ações que não cabem em substantivo — cancelar, aprovar, reprocessar — costumam
revelar um recurso escondido. "Cancelar pedido" pode ser
`POST /pedidos/123/cancelamento`: o cancelamento é uma coisa, com data, motivo e
autor.

Isso não é jogo de palavras. O cancelamento como recurso tem identidade, pode ser
consultado e auditado — o que a operação `POST /cancelarPedido` não tem.

### Segurança e idempotência vêm do verbo

A propriedade mais útil e a mais ignorada:

```text
GET, HEAD    seguro e idempotente   — não altera; pode repetir, cachear, pré-buscar
PUT, DELETE  idempotente            — repetir tem o mesmo efeito
POST         nenhum dos dois        — repetir cria de novo
PATCH        nenhum dos dois        — depende do que se envia
```

Isso não é convenção decorativa: proxies, navegadores, clientes e malhas de
serviço **agem** sobre essas garantias. Um `GET` que altera estado será repetido
por uma pré-busca. Um `POST` sem chave de idempotência será duplicado por uma
retentativa.

Ver [idempotência](../06-distributed-systems/idempotency.md).

### Código de status é parte do contrato

```text
200/201/204   sucesso, com ou sem corpo
400           a requisição está errada — não adianta repetir
401/403       não autenticado / não autorizado
404           não existe
409           conflito de estado
422           sintaxe válida, semântica inválida
429           excesso de requisições — repita depois
5xx           erro do servidor — repetir pode funcionar
```

A divisão entre 4xx e 5xx é o que permite ao cliente decidir se
[repete](../06-distributed-systems/retries.md). Uma API que devolve `200` com
erro no corpo tira essa decisão de quem chama, e obriga cada cliente a
reimplementar a classificação.

### O que quase ninguém faz: hipermídia

No REST original, a resposta traz os links das próximas ações possíveis, e o
cliente navega por eles em vez de construir URLs.

A promessa é desacoplar o cliente da estrutura de endereços e comunicar
transições de estado — um pedido pago traz o link de estorno; um pendente, não.

A adoção é baixíssima, e vale ser honesto sobre por quê: a maioria dos clientes
é escrita contra uma especificação e não ganha nada em descobrir links em tempo
de execução. O custo aparece imediatamente, o benefício raramente.

Onde ela paga: APIs públicas de vida longa, com muitos clientes que o provedor
não controla.

### Versão: prefira não

Ver [evolução de esquema](schema-evolution.md). Adicionar campo é livre;
adicionar recurso é livre. A maior parte da evolução de uma API HTTP cabe em
mudança compatível.

Versionar na URL é a forma mais comum e a mais visível — e cada versão viva é
código a manter.

### Paginação, filtro e ordenação são contrato

Coleções grandes precisam de paginação, e a escolha tem consequência:

**Por deslocamento** — simples, e a página muda se registros são inseridos
durante a navegação.

**Por cursor** — estável sob inserção, e não permite pular para uma página
arbitrária.

Qualquer que seja, ela precisa estar no contrato — inclusive o limite máximo e o
que acontece ao pedir mais.

## Modelo Mental

**REST é usar a semântica do HTTP, não passar por cima dela.** Cada garantia
ignorada é uma que você vai reimplementar pior.

## Quando Usar

- O cliente precisa da resposta para continuar.
- O modelo é naturalmente de recursos com ciclo de vida.
- Consumidores diversos, incluindo navegadores.
- Cache de HTTP tem valor.
- API pública, onde ferramental universal importa.
- Simplicidade operacional pesa mais que eficiência de transporte.

## Quando Não Usar

**Quando a consequência é assíncrona.** Ver
[integração por mensageria](messaging-integration.md).

**Quando o cliente precisa de campos muito variáveis.** Ver
[GraphQL](graphql.md).

**Comunicação interna de altíssima frequência.** Ver [gRPC](grpc.md) — o custo de
serialização e de conexão pesa.

**Fluxos bidirecionais ou de longa duração.**

**Transferência de grandes volumes em lote.** Ver
[integração em lote](batch-integration.md).

**Quando a operação não é sobre um recurso.** Forçar substantivo em cálculos e
buscas complexas produz modelagem torturada — ali um endpoint de operação é mais
honesto.

## Alternativas

- **[GraphQL](graphql.md)** — quando o consumo é variável.
- **[gRPC](grpc.md)** — interno, alta frequência, contrato forte.
- **[Mensageria](messaging-integration.md)** — assíncrono.
- **[Webhooks](webhooks.md)** — para notificar em vez de ser consultado.

## Trade-offs

| REST | gRPC |
|---|---|
| Ferramental universal | Precisa de suporte |
| Legível por humanos | Binário |
| Cache de HTTP | Não nativo |
| Contrato frequentemente frouxo | Forte por definição |
| Mais bytes | Compacto |

| REST | GraphQL |
|---|---|
| Resposta fixa por recurso | Cliente escolhe |
| Cache simples | Difícil |
| Várias chamadas para compor | Uma |
| Custo previsível | Consulta pode ser cara |

## Modos de Falha

**Tudo via `POST`.** Nada é cacheável nem seguro de repetir.

**`200` com erro no corpo.** O cliente não sabe se repete.

**`GET` com efeito colateral.** Pré-busca dispara a ação.

**Sem chave de idempotência em criação.** Retentativa duplica.

**Coleção sem paginação.** Uma consulta devolve tudo e derruba os dois lados.

**Sequência de chamadas em laço.** O cliente faz N requisições para montar uma
tela — o problema que motiva [GraphQL](graphql.md).

## Erros Comuns

**Modelar operações em vez de recursos.**

**Não usar os códigos de status.**

**Não oferecer chave de idempotência em `POST`.**

**Versionar por reflexo.**

**Paginação fora do contrato.**

**Expor o modelo interno do banco como recurso.** O recurso é parte do contrato
público; o modelo interno precisa poder mudar.

## Exemplo Real

Uma operadora de logística expunha uma API HTTP com 40 endpoints, todos `POST`,
todos devolvendo `200` com `{sucesso: bool, erro: string}`.

Quatro consequências, todas descobertas separadamente:

**Retentativas duplicando remessas.** O cliente móvel repetia em falha de rede.
Como tudo era `POST` sem chave de idempotência, cada repetição criava uma remessa
nova. Cerca de 300 remessas duplicadas por mês, tratadas manualmente pelo
suporte.

**Nenhum cache.** A consulta de status de remessa era o endpoint mais chamado —
40% do tráfego — e não podia ser cacheada por ser `POST`. O banco absorvia tudo.

**Classificação de erro na aplicação.** Cada um dos onze clientes tinha sua
própria lógica para decidir se o texto do campo `erro` era retentável. Três
estavam errados, e repetiam indefinidamente em erros permanentes.

**Gateway inútil.** O gateway não conseguia aplicar limite de taxa por tipo de
operação, nem cachear, nem reportar taxa de erro — porque tudo era `POST` com
`200`.

A migração foi feita em paralelo, com a API antiga mantida por catorze meses.

**Consultas viraram `GET`** com cache de 30 segundos. O tráfego ao banco caiu 60%.

**Códigos de status reais.** Os clientes deletaram a classificação própria e
passaram a usar 4xx contra 5xx.

**Chave de idempotência** obrigatória em criação. As duplicatas foram a zero.

**Recursos em vez de operações.** `POST /remessas/{id}/cancelamento` substituiu
`POST /cancelarRemessa`. O cancelamento passou a ser consultável, o que resolveu
uma demanda antiga de auditoria que ninguém tinha ligado a isso.

O que se registrou depois: nenhuma das quatro correções era sobre pureza de estilo.
Cada uma removeu código que existia só para compensar uma garantia do protocolo
que estava sendo desperdiçada.

## Conceitos Relacionados

- [GraphQL](graphql.md) e [gRPC](grpc.md) — as alternativas síncronas.
- [Contratos de Integração](integration-contracts.md).
- [Idempotência](../06-distributed-systems/idempotency.md).
- [API Gateways](api-gateways.md).

## Exercício Prático

Pegue a API do seu time e conte quantos endpoints são `POST`. Para cada um,
pergunte: isto altera estado?

Os que não alteram deveriam ser `GET` — e cada um é cache e retentativa segura
que você está deixando na mesa.

## Perguntas de Entrevista

- Por que a distinção entre 4xx e 5xx importa para o cliente?
- O que se perde ao fazer tudo por `POST`?
- Como modelar "cancelar pedido" como recurso, e o que se ganha com isso?

## Para Aprofundar

- Fielding, Roy. *Architectural Styles and the Design of Network-based Software
  Architectures*. Tese de doutorado, 2000.
- Richardson, Leonard; Amundsen, Mike. *RESTful Web APIs*. O'Reilly, 2013.
- Allamaraju, Subbu. *RESTful Web Services Cookbook*. O'Reilly, 2010.

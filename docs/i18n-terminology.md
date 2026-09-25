---
id: i18n-terminology
title: Política Terminológica
sidebar_position: 90
description: Como cada termo técnico é tratado entre português e inglês, e quais regras o CI aplica.
doc_type: reference
level: 0
difficulty: iniciante
status: complete
objective: >
  Ao terminar, quem escreve ou traduz sabe qual forma usar para cada termo e
  quais decisões o linter cobra automaticamente.
prerequisites: []
related: []
canonical_for: []
terminology_exempt: ["CQRS", "aggregate root", "anti-corruption layer", "availability", "backpressure", "blue/green", "bottleneck", "boundary", "bounded context", "canary", "cohesion", "commit", "constraint", "coupling", "dead-letter queue", "deploy", "deployment", "event sourcing", "event-driven", "eventual consistency", "fault tolerance", "feature flag", "latency", "layer", "load balancing", "maintainability", "redundancy", "reliability", "requirement", "scalability", "service mesh", "sharding", "sidecar", "strangler fig", "strong consistency", "technical debt", "throughput", "trade-off", "ubiquitous language"]
content_version: 2
last_reviewed: 2026-08-26
---

# Política Terminológica

Tradução técnica inconsistente destrói material de arquitetura. Um documento que
alterna entre "acoplamento" e "coupling" obriga o leitor a decidir, a cada
ocorrência, se os dois termos significam a mesma coisa.

Esta página é **gerada** a partir de `scripts/terminology.json`, que é também a
fonte que o linter usa. O CI cobra as Categorias A e B; a C e os nomes próprios
são orientação — entram no linter apenas como máscara, para não gerar falso
positivo, e não reprovam ninguém.

:::info Gerado automaticamente

Não edite esta página. Altere `scripts/terminology.json` e rode
`npm run terminology`.

:::

## Como ler as tabelas

A coluna **Regra** indica se o linter aplica a decisão automaticamente:

- **✅ aplicado** — violar falha o build.
- **— orientação** — documentado, não automatizado. São os casos em que a
  decisão depende de contexto e a automação produziria falso positivo.

Um documento pode declarar `terminology_exempt` no front matter para sair da
regra num caso justificado — citação literal, por exemplo. O termo se declara
como aparece na primeira coluna da tabela, sempre em inglês:
`terminology_exempt: ["coupling"]` isenta o par coupling/acoplamento;
`["acoplamento"]` não isenta nada.

## Categoria A — Traduzir sempre

Termos com equivalente estabelecido em português técnico. O documento usa a
forma em português como termo de trabalho.

A forma em inglês é permitida como glosa colada à forma em português —
*"acoplamento (coupling)"* — e a convenção do acervo é escrevê-la uma única vez,
na primeira ocorrência. O linter cobra a colagem, não a contagem: cada ocorrência
do termo em inglês precisa cair a até 40 caracteres de uma ocorrência da forma em
português. Uma ocorrência solta falha o build mesmo sendo a única.

| Inglês | Português | Regra |
|---|---|---|
| coupling | acoplamento | ✅ aplicado |
| cohesion | coesão | ✅ aplicado |
| availability | disponibilidade | ✅ aplicado |
| reliability | confiabilidade | ✅ aplicado |
| scalability | escalabilidade | ✅ aplicado |
| maintainability | manutenibilidade | ✅ aplicado |
| layer | camada | ✅ aplicado |
| eventual consistency | consistência eventual | ✅ aplicado |
| strong consistency | consistência forte | ✅ aplicado |
| technical debt | dívida técnica | ✅ aplicado |
| bottleneck | gargalo | ✅ aplicado |
| constraint | restrição | ✅ aplicado |
| deployment | implantação | ✅ aplicado |
| requirement | requisito | ✅ aplicado |
| boundary | fronteira | ✅ aplicado |
| throughput | vazão | — orientação |
| latency | latência | ✅ aplicado |
| redundancy | redundância | ✅ aplicado |
| fault tolerance | tolerância a falhas | ✅ aplicado |
| load balancing | balanceamento de carga | ✅ aplicado |

## Categoria B — Manter em inglês

Termos em que traduzir prejudica o reconhecimento ou não há equivalente aceito.
A coluna de traduções recusadas lista as formas que o linter rejeita.

| Termo | Traduções recusadas | Regra |
|---|---|---|
| trade-off | compromisso técnico · contrapartida | ✅ aplicado |
| bounded context | contexto limitado · contexto delimitado | ✅ aplicado |
| ubiquitous language | linguagem onipresente | ✅ aplicado |
| aggregate root | raiz do agregado | — orientação |
| event sourcing | fonte de eventos · obtenção de eventos | ✅ aplicado |
| sharding | estilhaçamento | ✅ aplicado |
| backpressure | contrapressão | ✅ aplicado |
| feature flag | sinalizador de recurso · bandeira de recurso | ✅ aplicado |
| service mesh | malha de serviços | ✅ aplicado |
| sidecar | carro lateral | ✅ aplicado |
| canary | canário | ✅ aplicado |
| blue/green | azul/verde | ✅ aplicado |
| strangler fig | figueira estranguladora | ✅ aplicado |
| CQRS | — | — orientação |
| deploy | — | — orientação |
| commit | — | — orientação |
| anti-corruption layer | camada anticorrupção · camada de anticorrupção | ✅ aplicado |
| dead-letter queue | — | — orientação |
| event-driven | — | — orientação |

## Categoria C — Inglês com glosa

Termos que permanecem em inglês, com a glosa em português na primeira ocorrência
de cada documento e apenas o termo em inglês depois.

| Termo | Glosa sugerida |
|---|---|
| circuit breaker | disjuntor |
| bulkhead | anteparo |
| poison message | mensagem envenenada |
| hotspot | ponto quente |

## Nomes próprios

Nunca traduzidos, em nenhum contexto:

`Strategy` · `Observer` · `Factory Method` · `Abstract Factory` · `Builder` · `Prototype` · `Singleton` · `Adapter` · `Bridge` · `Composite` · `Decorator` · `Facade` · `Flyweight` · `Proxy` · `Chain of Responsibility` · `Command` · `Iterator` · `Mediator` · `Memento` · `State` · `Template Method` · `Visitor` · `Ports and Adapters` · `Pipes and Filters` · `Strangler Fig` · `Clean Architecture` · `Space-Based Architecture` · `Team Topologies`

## A regra que não cabe em tabela

**Sem meio-termo dentro de um documento.** Escolhido um vocabulário, ele vale do
início ao fim. O linter detecta alternância entre a forma em português e a forma
em inglês fora da janela de glosa, e falha.

Isso vale também no sentido inverso: um documento em inglês que contenha o termo
em português é rejeitado.

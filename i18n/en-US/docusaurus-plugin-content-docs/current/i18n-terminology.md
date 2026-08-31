---
id: i18n-terminology
title: Terminology Policy
sidebar_position: 90
description: How each technical term is handled between Portuguese and English, and which rules CI enforces.
doc_type: reference
level: 0
difficulty: beginner
status: complete
objective: >
  By the end, whoever writes or translates knows which form to use for each term
  and which decisions the linter enforces automatically.
prerequisites: []
related: []
canonical_for: []
terminology_exempt: ["CQRS", "aggregate root", "anti-corruption layer", "availability", "backpressure", "blue/green", "bottleneck", "boundary", "bounded context", "canary", "cohesion", "commit", "constraint", "coupling", "dead-letter queue", "deployment", "event sourcing", "event-driven", "eventual consistency", "fault tolerance", "feature flag", "latency", "layer", "load balancing", "maintainability", "redundancy", "reliability", "requirement", "scalability", "service mesh", "sharding", "sidecar", "strangler fig", "strong consistency", "technical debt", "throughput", "trade-off", "ubiquitous language"]
translated_from_version: 1
last_reviewed: 2026-08-26
---

# Terminology Policy

Inconsistent technical translation destroys architecture material. A document
that alternates between "acoplamento" and "coupling" forces the reader to
decide, at each occurrence, whether the two terms mean the same thing.

This page is **generated** from `scripts/terminology.json`, which is also the
source the linter uses. What is here is exactly what CI enforces.

:::info Generated automatically

Do not edit this page. Change `scripts/terminology.json` and run
`npm run terminology`.

:::

## How to read the tables

The **Rule** column indicates whether the linter enforces the decision
automatically:

- **✅ enforced** — violating it fails the build.
- **— guidance** — documented, not automated. These are the cases where the
  decision depends on context and automation would produce false positives.

A document can declare `terminology_exempt: [term]` in its front matter to opt
out of the rule in a justified case — a literal quotation, for example.

## Category A — Always translate

Terms with an established equivalent in technical Portuguese. The document uses
the Portuguese form as the working term.

The English form is allowed **once**, as a first-occurrence gloss:
*"acoplamento (coupling)"*. After that, only the Portuguese form.

| English | Portuguese | Rule |
|---|---|---|
| coupling | acoplamento | ✅ enforced |
| cohesion | coesão | ✅ enforced |
| availability | disponibilidade | ✅ enforced |
| reliability | confiabilidade | ✅ enforced |
| scalability | escalabilidade | ✅ enforced |
| maintainability | manutenibilidade | ✅ enforced |
| layer | camada | ✅ enforced |
| eventual consistency | consistência eventual | ✅ enforced |
| strong consistency | consistência forte | ✅ enforced |
| technical debt | dívida técnica | ✅ enforced |
| bottleneck | gargalo | ✅ enforced |
| constraint | restrição | ✅ enforced |
| deployment | implantação | ✅ enforced |
| requirement | requisito | ✅ enforced |
| boundary | fronteira | ✅ enforced |
| throughput | vazão | — guidance |
| latency | latência | ✅ enforced |
| redundancy | redundância | ✅ enforced |
| fault tolerance | tolerância a falhas | ✅ enforced |
| load balancing | balanceamento de carga | ✅ enforced |

## Category B — Keep in English

Terms where translating harms recognition or where no accepted equivalent
exists. The refused-translations column lists the forms the linter rejects.

| Term | Refused translations | Rule |
|---|---|---|
| trade-off | compromisso técnico · contrapartida | ✅ enforced |
| bounded context | contexto limitado · contexto delimitado | ✅ enforced |
| ubiquitous language | linguagem onipresente | ✅ enforced |
| aggregate root | raiz do agregado | — guidance |
| event sourcing | fonte de eventos · obtenção de eventos | ✅ enforced |
| sharding | estilhaçamento | ✅ enforced |
| backpressure | contrapressão | ✅ enforced |
| feature flag | sinalizador de recurso · bandeira de recurso | ✅ enforced |
| service mesh | malha de serviços | ✅ enforced |
| sidecar | carro lateral | ✅ enforced |
| canary | canário | ✅ enforced |
| blue/green | azul/verde | ✅ enforced |
| strangler fig | figueira estranguladora | ✅ enforced |
| CQRS | — | — guidance |
| commit | — | — guidance |
| anti-corruption layer | camada anticorrupção · camada de anticorrupção | ✅ enforced |
| dead-letter queue | — | — guidance |
| event-driven | — | — guidance |

## Category C — English with a gloss

Terms that stay in English, with the Portuguese gloss on the first occurrence in
each document and only the English term afterward.

| Term | Suggested gloss |
|---|---|
| circuit breaker | disjuntor |
| bulkhead | anteparo |
| poison message | mensagem envenenada |
| dead-letter queue | fila de mensagens mortas |
| hotspot | ponto quente |

## Proper names

Never translated, in any context:

`Strategy` · `Observer` · `Factory Method` · `Abstract Factory` · `Builder` · `Prototype` · `Singleton` · `Adapter` · `Bridge` · `Composite` · `Decorator` · `Facade` · `Flyweight` · `Proxy` · `Chain of Responsibility` · `Command` · `Iterator` · `Mediator` · `Memento` · `State` · `Template Method` · `Visitor` · `Ports and Adapters` · `Pipes and Filters` · `Strangler Fig` · `Clean Architecture` · `Space-Based Architecture` · `Team Topologies`

## The rule that does not fit in a table

**No middle ground inside a document.** Once a vocabulary is chosen, it holds
from beginning to end. The linter detects alternation between the Portuguese
form and the English form outside the gloss window, and fails.

That holds in the inverse direction too: a document in English containing the
Portuguese term is rejected.

# Roadmap

Estado de cada documento do percurso e da sua tradução.
A especificação completa está em [SPEC.md](SPEC.md).

As tabelas abaixo são **geradas** a partir do front matter dos documentos.
Não edite à mão — rode `npm run roadmap`.

<!-- BEGIN:GENERATED — não edite à mão; rode `npm run roadmap` -->
## Panorama

**446 de 446 documentos planejados escritos (100%).**

O denominador é o escopo definido em [SPEC.md §14](SPEC.md), não a contagem
de arquivos existentes. Uma seção em 0% ainda não teve seus tópicos escritos,
mas já tem índice publicado explicando o que virá.

| Seção | Nível | Escritos | Progresso |
|---|---|---:|---|
| `(raiz)` | — | 5 / 5 | `██████████` 100% |
| `01-fundamentals` | 01 | 24 / 24 | `██████████` 100% |
| `02-software-design` | 02 | 24 / 24 | `██████████` 100% |
| `03-design-patterns` | 02 | 31 / 31 | `██████████` 100% |
| `04-domain-driven-design` | 02 | 20 / 20 | `██████████` 100% |
| `05-system-design` | 03 | 25 / 25 | `██████████` 100% |
| `06-distributed-systems` | 04 | 39 / 39 | `██████████` 100% |
| `07-data-architecture` | 05 | 22 / 22 | `██████████` 100% |
| `08-integration-architecture` | 05 | 15 / 15 | `██████████` 100% |
| `09-cloud-architecture` | 05 | 19 / 19 | `██████████` 100% |
| `10-security` | 05 | 18 / 18 | `██████████` 100% |
| `11-scalability` | 05 | 14 / 14 | `██████████` 100% |
| `12-reliability` | 05 | 19 / 19 | `██████████` 100% |
| `13-observability` | 05 | 12 / 12 | `██████████` 100% |
| `14-devops-and-platform` | 05 | 14 / 14 | `██████████` 100% |
| `15-enterprise-architecture` | 06 | 21 / 21 | `██████████` 100% |
| `16-legacy-modernization` | 06 | 14 / 14 | `██████████` 100% |
| `17-architecture-documentation` | 05 | 14 / 14 | `██████████` 100% |
| `18-architecture-decisions` | 05 | 15 / 15 | `██████████` 100% |
| `19-architecture-governance` | 06 | 11 / 11 | `██████████` 100% |
| `20-trade-offs` | 05 | 16 / 16 | `██████████` 100% |
| `21-case-studies` | Transv. | 15 / 15 | `██████████` 100% |
| `22-system-design-interviews` | Transv. | 14 / 14 | `██████████` 100% |
| `23-architecture-leadership` | 07 | 25 / 25 | `██████████` 100% |

## Legenda

**Estado do conteúdo:** ⬜ não iniciado · 🟨 em progresso · 🟩 completo

**Tradução (en-US):** ⬜ não traduzido · 🟨 defasado · 🟩 em dia · ❌ inconsistente

## Detalhe por nível

### Nível 01 — Fundamentos

| Estado | Documento | Tipo | Dificuldade | Pré-requisitos | en-US |
|:-:|---|---|---|---|:-:|
| 🟩 | [Abstração](docs/01-fundamentals/abstraction.md) | concept | iniciante | `separation-of-concerns` | 🟩 |
| 🟩 | [Arquitetura como Conjunto de Decisões](docs/01-fundamentals/architecture-as-decisions.md) | foundation | intermediário | `architecture-principles` | 🟩 |
| 🟩 | [Características Arquiteturais](docs/01-fundamentals/architecture-characteristics.md) | foundation | intermediário | `quality-attributes` | 🟩 |
| 🟩 | [Evolução da Arquitetura](docs/01-fundamentals/architecture-evolution.md) | foundation | intermediário | `architecture-as-decisions` | 🟩 |
| 🟩 | [Princípios de Arquitetura](docs/01-fundamentals/architecture-principles.md) | concept | intermediário | `architecture-characteristics` | 🟩 |
| 🟩 | [Arquitetura vs. Design](docs/01-fundamentals/architecture-vs-design.md) | foundation | iniciante | `what-is-software-architecture` | 🟩 |
| 🟩 | [Arquitetura vs. Implementação](docs/01-fundamentals/architecture-vs-implementation.md) | foundation | iniciante | `architecture-vs-design` | 🟩 |
| 🟩 | [Contexto de Negócio](docs/01-fundamentals/business-context.md) | foundation | iniciante | `what-is-software-architecture` | 🟩 |
| 🟩 | [Coesão](docs/01-fundamentals/cohesion.md) | concept | iniciante | `coupling` | 🟩 |
| 🟩 | [Complexidade](docs/01-fundamentals/complexity.md) | concept | intermediário | `abstraction` | 🟩 |
| 🟩 | [Restrições](docs/01-fundamentals/constraints.md) | foundation | iniciante | `quality-attributes` | 🟩 |
| 🟩 | [Acoplamento](docs/01-fundamentals/coupling.md) | concept | iniciante | `modularity` | 🟩 |
| 🟩 | [Gestão de Dependências](docs/01-fundamentals/dependency-management.md) | concept | intermediário | `coupling` | 🟩 |
| 🟩 | [Exercício 01 — Recuar até o Problema](docs/01-fundamentals/exercises/01-recuar-ate-o-problema.md) | exercise | iniciante | `problem-space` | ⬜ |
| 🟩 | [Requisitos Funcionais](docs/01-fundamentals/functional-requirements.md) | foundation | iniciante | `problem-space` | 🟩 |
| 🟩 | [Fundamentos](docs/01-fundamentals/index.md) | index | iniciante | — | 🟩 |
| 🟩 | [Modularidade](docs/01-fundamentals/modularity.md) | concept | iniciante | `architecture-vs-design` | 🟩 |
| 🟩 | [Requisitos Não-Funcionais](docs/01-fundamentals/non-functional-requirements.md) | foundation | iniciante | `functional-requirements` | 🟩 |
| 🟩 | [Espaço do Problema](docs/01-fundamentals/problem-space.md) | foundation | iniciante | `business-context` | 🟩 |
| 🟩 | [Atributos de Qualidade](docs/01-fundamentals/quality-attributes.md) | foundation | iniciante | `non-functional-requirements` | 🟩 |
| 🟩 | [Separação de Responsabilidades](docs/01-fundamentals/separation-of-concerns.md) | concept | iniciante | `modularity` | 🟩 |
| 🟩 | [Espaço da Solução](docs/01-fundamentals/solution-space.md) | foundation | iniciante | `problem-space` | 🟩 |
| 🟩 | [Dívida Técnica](docs/01-fundamentals/technical-debt.md) | concept | intermediário | `complexity` | 🟩 |
| 🟩 | [O que é Arquitetura de Software](docs/01-fundamentals/what-is-software-architecture.md) | foundation | iniciante | — | 🟩 |

### Nível 02 — Design de Software

| Estado | Documento | Tipo | Dificuldade | Pré-requisitos | en-US |
|:-:|---|---|---|---|:-:|
| 🟩 | [Fronteiras](docs/02-software-design/boundaries.md) | concept | intermediário | `interfaces` | 🟩 |
| 🟩 | [Clean Architecture](docs/02-software-design/clean-architecture.md) | pattern | intermediário | `onion-architecture` | 🟩 |
| 🟩 | [Clean Code](docs/02-software-design/clean-code.md) | concept | iniciante | `fundamentals` | 🟩 |
| 🟩 | [Code Smells](docs/02-software-design/code-smells.md) | concept | intermediário | `clean-code` | 🟩 |
| 🟩 | [Design de Componentes](docs/02-software-design/component-design.md) | concept | avançado | `package-design` | 🟩 |
| 🟩 | [Composição vs. Herança](docs/02-software-design/composition-vs-inheritance.md) | concept | intermediário | `encapsulation` | 🟩 |
| 🟩 | [Direção de Dependência](docs/02-software-design/dependency-direction.md) | concept | intermediário | `dependency-inversion` | 🟩 |
| 🟩 | [Inversão de Dependência](docs/02-software-design/dependency-inversion.md) | concept | intermediário | `interfaces` | 🟩 |
| 🟩 | [Heurísticas de Design](docs/02-software-design/design-heuristics.md) | foundation | intermediário | `clean-code` | 🟩 |
| 🟩 | [DRY](docs/02-software-design/dry.md) | concept | iniciante | `fundamentals` | 🟩 |
| 🟩 | [Encapsulamento](docs/02-software-design/encapsulation.md) | concept | iniciante | `fundamentals` | 🟩 |
| 🟩 | [Exercício 02 — Sistema de Biblioteca](docs/02-software-design/exercises/02-library-system.md) | exercise | iniciante | `modular-design` | ⬜ |
| 🟩 | [Arquitetura Hexagonal](docs/02-software-design/hexagonal-architecture.md) | pattern | intermediário | `ports-and-adapters` | 🟩 |
| 🟩 | [Design de Software](docs/02-software-design/index.md) | index | iniciante | `fundamentals` | 🟩 |
| 🟩 | [Interfaces](docs/02-software-design/interfaces.md) | concept | intermediário | `encapsulation` | 🟩 |
| 🟩 | [KISS](docs/02-software-design/kiss.md) | concept | iniciante | `fundamentals` | 🟩 |
| 🟩 | [Camadas](docs/02-software-design/layering.md) | concept | intermediário | `boundaries` | 🟩 |
| 🟩 | [Design Modular](docs/02-software-design/modular-design.md) | concept | intermediário | `layering` | 🟩 |
| 🟩 | [Arquitetura Onion](docs/02-software-design/onion-architecture.md) | pattern | intermediário | `hexagonal-architecture` | 🟩 |
| 🟩 | [Design de Pacotes](docs/02-software-design/package-design.md) | concept | avançado | `modular-design` | 🟩 |
| 🟩 | [Ports and Adapters](docs/02-software-design/ports-and-adapters.md) | pattern | intermediário | `dependency-inversion` | 🟩 |
| 🟩 | [Refatoração](docs/02-software-design/refactoring.md) | concept | intermediário | `code-smells` | 🟩 |
| 🟩 | [SOLID](docs/02-software-design/solid.md) | concept | intermediário | `fundamentals` | 🟩 |
| 🟩 | [YAGNI](docs/02-software-design/yagni.md) | concept | iniciante | `fundamentals` | 🟩 |
| 🟩 | [Abstract Factory](docs/03-design-patterns/abstract-factory.md) | pattern | intermediário | `factory-method` | 🟩 |
| 🟩 | [Adapter](docs/03-design-patterns/adapter.md) | pattern | iniciante | `design-patterns` | 🟩 |
| 🟩 | [Bridge](docs/03-design-patterns/bridge.md) | pattern | avançado | `adapter` | 🟩 |
| 🟩 | [Builder](docs/03-design-patterns/builder.md) | pattern | iniciante | `design-patterns` | 🟩 |
| 🟩 | [Chain of Responsibility](docs/03-design-patterns/chain-of-responsibility.md) | pattern | intermediário | `design-patterns` | 🟩 |
| 🟩 | [Command](docs/03-design-patterns/command.md) | pattern | intermediário | `design-patterns` | 🟩 |
| 🟩 | [Composite](docs/03-design-patterns/composite.md) | pattern | intermediário | `design-patterns` | 🟩 |
| 🟩 | [CQRS](docs/03-design-patterns/cqrs.md) | pattern | avançado | `event-driven` | 🟩 |
| 🟩 | [Decorator](docs/03-design-patterns/decorator.md) | pattern | intermediário | `composite` | 🟩 |
| 🟩 | [Arquitetura Orientada a Eventos](docs/03-design-patterns/event-driven.md) | pattern | avançado | `microservices` | 🟩 |
| 🟩 | [Event Sourcing](docs/03-design-patterns/event-sourcing.md) | pattern | avançado | `cqrs` | 🟩 |
| 🟩 | [Facade](docs/03-design-patterns/facade.md) | pattern | iniciante | `design-patterns` | 🟩 |
| 🟩 | [Factory Method](docs/03-design-patterns/factory-method.md) | pattern | intermediário | `design-patterns` | 🟩 |
| 🟩 | [Flyweight](docs/03-design-patterns/flyweight.md) | pattern | avançado | `design-patterns` | 🟩 |
| 🟩 | [Design Patterns](docs/03-design-patterns/index.md) | index | intermediário | `software-design` | 🟩 |
| 🟩 | [Iterator](docs/03-design-patterns/iterator.md) | pattern | iniciante | `design-patterns` | 🟩 |
| 🟩 | [Mediator](docs/03-design-patterns/mediator.md) | pattern | intermediário | `observer` | 🟩 |
| 🟩 | [Memento](docs/03-design-patterns/memento.md) | pattern | intermediário | `command` | 🟩 |
| 🟩 | [Microsserviços](docs/03-design-patterns/microservices.md) | pattern | avançado | `modular-monolith` | 🟩 |
| 🟩 | [Monolito Modular](docs/03-design-patterns/modular-monolith.md) | pattern | intermediário | `design-patterns` | 🟩 |
| 🟩 | [Observer](docs/03-design-patterns/observer.md) | pattern | intermediário | `design-patterns` | 🟩 |
| 🟩 | [Pipes and Filters](docs/03-design-patterns/pipes-and-filters.md) | pattern | intermediário | `design-patterns` | 🟩 |
| 🟩 | [Prototype](docs/03-design-patterns/prototype.md) | pattern | intermediário | `design-patterns` | 🟩 |
| 🟩 | [Proxy](docs/03-design-patterns/proxy.md) | pattern | intermediário | `decorator` | 🟩 |
| 🟩 | [Singleton](docs/03-design-patterns/singleton.md) | pattern | iniciante | `design-patterns` | 🟩 |
| 🟩 | [SOA](docs/03-design-patterns/soa.md) | pattern | intermediário | `microservices` | 🟩 |
| 🟩 | [Space-Based Architecture](docs/03-design-patterns/space-based-architecture.md) | pattern | avançado | `microservices` | 🟩 |
| 🟩 | [State](docs/03-design-patterns/state.md) | pattern | intermediário | `strategy` | 🟩 |
| 🟩 | [Strategy](docs/03-design-patterns/strategy.md) | pattern | iniciante | `design-patterns` | 🟩 |
| 🟩 | [Template Method](docs/03-design-patterns/template-method.md) | pattern | iniciante | `design-patterns` | 🟩 |
| 🟩 | [Visitor](docs/03-design-patterns/visitor.md) | pattern | avançado | `composite` | 🟩 |
| 🟩 | [Aggregate](docs/04-domain-driven-design/aggregate.md) | pattern | avançado | `entity`, `value-object` | ⬜ |
| 🟩 | [Anti-Corruption Layer](docs/04-domain-driven-design/anti-corruption-layer.md) | pattern | intermediário | `context-mapping` | ⬜ |
| 🟩 | [Application Service](docs/04-domain-driven-design/application-service.md) | pattern | intermediário | `domain-service` | ⬜ |
| 🟩 | [Bounded Context](docs/04-domain-driven-design/bounded-context.md) | concept | intermediário | `subdomain`, `ubiquitous-language` | 🟩 |
| 🟩 | [Context Mapping](docs/04-domain-driven-design/context-mapping.md) | concept | avançado | `bounded-context` | ⬜ |
| 🟩 | [Core Domain](docs/04-domain-driven-design/core-domain.md) | foundation | intermediário | `subdomain` | ⬜ |
| 🟩 | [Domain Event](docs/04-domain-driven-design/domain-event.md) | pattern | avançado | `aggregate` | ⬜ |
| 🟩 | [Domain Service](docs/04-domain-driven-design/domain-service.md) | pattern | intermediário | `aggregate` | ⬜ |
| 🟩 | [Domínio](docs/04-domain-driven-design/domain.md) | foundation | iniciante | `domain-driven-design` | ⬜ |
| 🟩 | [Entity](docs/04-domain-driven-design/entity.md) | pattern | intermediário | `ubiquitous-language` | 🟩 |
| 🟩 | [Factory](docs/04-domain-driven-design/factory.md) | pattern | intermediário | `aggregate` | ⬜ |
| 🟩 | [Generic Domain](docs/04-domain-driven-design/generic-domain.md) | foundation | iniciante | `subdomain` | ⬜ |
| 🟩 | [Domain-Driven Design](docs/04-domain-driven-design/index.md) | index | intermediário | `software-design` | 🟩 |
| 🟩 | [Repository](docs/04-domain-driven-design/repository.md) | pattern | intermediário | `aggregate` | ⬜ |
| 🟩 | [DDD Estratégico](docs/04-domain-driven-design/strategic-ddd.md) | foundation | avançado | `bounded-context`, `context-mapping` | ⬜ |
| 🟩 | [Subdomínio](docs/04-domain-driven-design/subdomain.md) | foundation | iniciante | `domain` | ⬜ |
| 🟩 | [Supporting Domain](docs/04-domain-driven-design/supporting-domain.md) | foundation | iniciante | `subdomain` | ⬜ |
| 🟩 | [DDD Tático](docs/04-domain-driven-design/tactical-ddd.md) | foundation | avançado | `aggregate`, `repository` | ⬜ |
| 🟩 | [Ubiquitous Language](docs/04-domain-driven-design/ubiquitous-language.md) | concept | intermediário | `domain` | 🟩 |
| 🟩 | [Value Object](docs/04-domain-driven-design/value-object.md) | pattern | iniciante | `entity` | ⬜ |

### Nível 03 — Design de Sistemas

| Estado | Documento | Tipo | Dificuldade | Pré-requisitos | en-US |
|:-:|---|---|---|---|:-:|
| 🟩 | [APIs](docs/05-system-design/apis.md) | concept | intermediário | `services` | ⬜ |
| 🟩 | [Autenticação](docs/05-system-design/authentication.md) | concept | intermediário | `state-management` | ⬜ |
| 🟩 | [Autorização](docs/05-system-design/authorization.md) | concept | intermediário | `authentication` | ⬜ |
| 🟩 | [Processamento em Background](docs/05-system-design/background-processing.md) | concept | intermediário | `queues` | ⬜ |
| 🟩 | [Análise de Gargalos](docs/05-system-design/bottleneck-analysis.md) | concept | intermediário | `capacity-planning` | ⬜ |
| 🟩 | [Cache](docs/05-system-design/caching.md) | concept | intermediário | `state-management` | ⬜ |
| 🟩 | [Planejamento de Capacidade](docs/05-system-design/capacity-planning.md) | concept | intermediário | `components` | ⬜ |
| 🟩 | [CDN](docs/05-system-design/cdn.md) | concept | iniciante | `caching` | ⬜ |
| 🟩 | [Componentes](docs/05-system-design/components.md) | concept | intermediário | `system-decomposition` | ⬜ |
| 🟩 | [Configuração](docs/05-system-design/configuration.md) | concept | iniciante | `components` | ⬜ |
| 🟩 | [Exercício 03 — Backend de E-commerce](docs/05-system-design/exercises/03-ecommerce-backend.md) | exercise | intermediário | `system-decomposition` | ⬜ |
| 🟩 | [Armazenamento de Arquivos](docs/05-system-design/file-storage.md) | concept | iniciante | `state-management` | ⬜ |
| 🟩 | [Design de Sistemas](docs/05-system-design/index.md) | index | intermediário | `design-patterns`, `domain-driven-design` | ⬜ |
| 🟩 | [Balanceamento de Carga](docs/05-system-design/load-balancing.md) | concept | intermediário | `stateless-vs-stateful` | ⬜ |
| 🟩 | [Paginação](docs/05-system-design/pagination.md) | concept | iniciante | `apis` | ⬜ |
| 🟩 | [Filas](docs/05-system-design/queues.md) | concept | intermediário | `request-response` | ⬜ |
| 🟩 | [Rate Limiting](docs/05-system-design/rate-limiting.md) | concept | intermediário | `load-balancing` | ⬜ |
| 🟩 | [Request/Response](docs/05-system-design/request-response.md) | concept | intermediário | `apis` | ⬜ |
| 🟩 | [Estratégias Básicas de Escalabilidade](docs/05-system-design/scalability-basics.md) | concept | intermediário | `bottleneck-analysis` | ⬜ |
| 🟩 | [Busca](docs/05-system-design/search.md) | concept | intermediário | `pagination` | ⬜ |
| 🟩 | [Fronteiras de Serviço](docs/05-system-design/service-boundaries.md) | concept | avançado | `services` | ⬜ |
| 🟩 | [Serviços](docs/05-system-design/services.md) | concept | intermediário | `components` | ⬜ |
| 🟩 | [Gestão de Estado](docs/05-system-design/state-management.md) | concept | intermediário | `components` | ⬜ |
| 🟩 | [Sem Estado vs. Com Estado](docs/05-system-design/stateless-vs-stateful.md) | concept | intermediário | `state-management` | ⬜ |
| 🟩 | [Decomposição de Sistemas](docs/05-system-design/system-decomposition.md) | concept | intermediário | `system-design` | ⬜ |

### Nível 04 — Sistemas Distribuídos

| Estado | Documento | Tipo | Dificuldade | Pré-requisitos | en-US |
|:-:|---|---|---|---|:-:|
| 🟩 | [Disponibilidade](docs/06-distributed-systems/availability.md) | concept | intermediário | `partial-failure` | ⬜ |
| 🟩 | [Backoff](docs/06-distributed-systems/backoff.md) | concept | intermediário | `retries` | ⬜ |
| 🟩 | [Backpressure](docs/06-distributed-systems/backpressure.md) | concept | avançado | `messaging` | ⬜ |
| 🟩 | [CAP](docs/06-distributed-systems/cap.md) | foundation | avançado | `consistency`, `availability` | ⬜ |
| 🟩 | [Relógio e Tempo](docs/06-distributed-systems/clock-and-time.md) | concept | avançado | `distributed-fundamentals` | ⬜ |
| 🟩 | [Resolução de Conflitos](docs/06-distributed-systems/conflict-resolution.md) | concept | avançado | `eventual-consistency` | ⬜ |
| 🟩 | [Consenso](docs/06-distributed-systems/consensus.md) | concept | avançado | `leader-election` | ⬜ |
| 🟩 | [Consistência](docs/06-distributed-systems/consistency.md) | concept | avançado | `partial-failure` | ⬜ |
| 🟩 | [Dead-Letter Queues](docs/06-distributed-systems/dead-letter-queues.md) | concept | intermediário | `poison-messages` | ⬜ |
| 🟩 | [Garantias de Entrega](docs/06-distributed-systems/delivery-guarantees.md) | concept | avançado | `messaging`, `idempotency` | ⬜ |
| 🟩 | [CQRS Distribuído](docs/06-distributed-systems/distributed-cqrs.md) | pattern | avançado | `event-driven-systems` | ⬜ |
| 🟩 | [Event Sourcing Distribuído](docs/06-distributed-systems/distributed-event-sourcing.md) | pattern | avançado | `event-driven-systems` | ⬜ |
| 🟩 | [Fundamentos de Sistemas Distribuídos](docs/06-distributed-systems/distributed-fundamentals.md) | foundation | avançado | `system-design` | ⬜ |
| 🟩 | [Locks Distribuídos](docs/06-distributed-systems/distributed-locks.md) | concept | avançado | `consensus` | ⬜ |
| 🟩 | [Transações Distribuídas](docs/06-distributed-systems/distributed-transactions.md) | pattern | avançado | `distributed-fundamentals`, `partial-failure` | ⬜ |
| 🟩 | [Mensagens Duplicadas](docs/06-distributed-systems/duplicate-messages.md) | concept | intermediário | `delivery-guarantees`, `idempotency` | ⬜ |
| 🟩 | [Sistemas Orientados a Eventos](docs/06-distributed-systems/event-driven-systems.md) | concept | avançado | `messaging` | ⬜ |
| 🟩 | [Consistência Eventual](docs/06-distributed-systems/eventual-consistency.md) | concept | avançado | `consistency` | ⬜ |
| 🟩 | [Exercício 04 — Escalar o E-commerce](docs/06-distributed-systems/exercises/04-scaling-ecommerce.md) | exercise | intermediário | `03-ecommerce-backend` | ⬜ |
| 🟩 | [Exercício 05 — Introduzir Processamento Assíncrono](docs/06-distributed-systems/exercises/05-async-processing.md) | exercise | avançado | `04-scaling-ecommerce` | ⬜ |
| 🟩 | [Exercício 06 — Lidar com Falhas Parciais](docs/06-distributed-systems/exercises/06-partial-failure.md) | exercise | avançado | `05-async-processing` | ⬜ |
| 🟩 | [Detecção de Falha](docs/06-distributed-systems/failure-detection.md) | concept | avançado | `network-failure` | ⬜ |
| 🟩 | [Idempotência](docs/06-distributed-systems/idempotency.md) | concept | avançado | `partial-failure` | ⬜ |
| 🟩 | [Sistemas Distribuídos](docs/06-distributed-systems/index.md) | index | avançado | `system-design` | ⬜ |
| 🟩 | [Latência](docs/06-distributed-systems/latency.md) | concept | intermediário | `distributed-fundamentals` | ⬜ |
| 🟩 | [Eleição de Líder](docs/06-distributed-systems/leader-election.md) | concept | avançado | `replication` | ⬜ |
| 🟩 | [Mensageria](docs/06-distributed-systems/messaging.md) | concept | avançado | `partial-failure` | ⬜ |
| 🟩 | [Falha de Rede](docs/06-distributed-systems/network-failure.md) | concept | avançado | `distributed-fundamentals` | ⬜ |
| 🟩 | [Ordenação](docs/06-distributed-systems/ordering.md) | concept | avançado | `messaging` | ⬜ |
| 🟩 | [PACELC](docs/06-distributed-systems/pacelc.md) | foundation | avançado | `cap` | ⬜ |
| 🟩 | [Falha Parcial](docs/06-distributed-systems/partial-failure.md) | concept | avançado | `network-failure` | ⬜ |
| 🟩 | [Particionamento](docs/06-distributed-systems/partitioning.md) | concept | avançado | `replication` | ⬜ |
| 🟩 | [Poison Messages](docs/06-distributed-systems/poison-messages.md) | concept | intermediário | `messaging` | ⬜ |
| 🟩 | [Replicação](docs/06-distributed-systems/replication.md) | concept | avançado | `consistency` | ⬜ |
| 🟩 | [Retries](docs/06-distributed-systems/retries.md) | concept | intermediário | `timeouts`, `idempotency` | ⬜ |
| 🟩 | [Sagas](docs/06-distributed-systems/sagas.md) | pattern | avançado | `distributed-transactions` | ⬜ |
| 🟩 | [Sharding](docs/06-distributed-systems/sharding.md) | concept | avançado | `partitioning` | ⬜ |
| 🟩 | [Consistência Forte](docs/06-distributed-systems/strong-consistency.md) | concept | avançado | `consistency` | ⬜ |
| 🟩 | [Timeouts](docs/06-distributed-systems/timeouts.md) | concept | intermediário | `latency` | ⬜ |

### Nível 05 — Arquitetura

| Estado | Documento | Tipo | Dificuldade | Pré-requisitos | en-US |
|:-:|---|---|---|---|:-:|
| 🟩 | [Armazenamento Colunar](docs/07-data-architecture/column-stores.md) | concept | intermediário | `olap` | ⬜ |
| 🟩 | [Consistência de Dados](docs/07-data-architecture/data-consistency.md) | concept | avançado | `transactions` | ⬜ |
| 🟩 | [Data Lakehouses](docs/07-data-architecture/data-lakehouses.md) | concept | avançado | `data-lakes` | ⬜ |
| 🟩 | [Data Lakes](docs/07-data-architecture/data-lakes.md) | concept | intermediário | `data-warehouses` | ⬜ |
| 🟩 | [Ciclo de Vida do Dado](docs/07-data-architecture/data-lifecycle.md) | concept | intermediário | `data-architecture` | ⬜ |
| 🟩 | [Modelagem de Dados](docs/07-data-architecture/data-modeling.md) | concept | intermediário | `data-architecture` | ⬜ |
| 🟩 | [Propriedade do Dado](docs/07-data-architecture/data-ownership.md) | concept | avançado | `data-architecture` | ⬜ |
| 🟩 | [Particionamento de Dados](docs/07-data-architecture/data-partitioning.md) | concept | intermediário | `data-architecture` | ⬜ |
| 🟩 | [Replicação de Dados](docs/07-data-architecture/data-replication.md) | concept | intermediário | `data-architecture` | ⬜ |
| 🟩 | [Data Warehouses](docs/07-data-architecture/data-warehouses.md) | concept | intermediário | `olap` | ⬜ |
| 🟩 | [Desnormalização](docs/07-data-architecture/denormalization.md) | concept | intermediário | `normalization` | ⬜ |
| 🟩 | [Bancos de Documentos](docs/07-data-architecture/document-databases.md) | concept | intermediário | `nosql` | ⬜ |
| 🟩 | [Bancos de Grafo](docs/07-data-architecture/graph-databases.md) | concept | intermediário | `nosql` | ⬜ |
| 🟩 | [Arquitetura de Dados](docs/07-data-architecture/index.md) | index | avançado | `distributed-systems` | ⬜ |
| 🟩 | [Indexação](docs/07-data-architecture/indexing.md) | concept | intermediário | `data-architecture` | ⬜ |
| 🟩 | [Bancos Chave-Valor](docs/07-data-architecture/key-value-databases.md) | concept | intermediário | `nosql` | ⬜ |
| 🟩 | [Normalização](docs/07-data-architecture/normalization.md) | concept | intermediário | `data-modeling` | ⬜ |
| 🟩 | [NoSQL](docs/07-data-architecture/nosql.md) | concept | intermediário | `relational-databases` | ⬜ |
| 🟩 | [OLAP](docs/07-data-architecture/olap.md) | concept | intermediário | `oltp` | ⬜ |
| 🟩 | [OLTP](docs/07-data-architecture/oltp.md) | concept | intermediário | `data-architecture` | ⬜ |
| 🟩 | [Bancos Relacionais](docs/07-data-architecture/relational-databases.md) | concept | intermediário | `data-architecture` | ⬜ |
| 🟩 | [Transações](docs/07-data-architecture/transactions.md) | concept | intermediário | `relational-databases` | ⬜ |
| 🟩 | [API Gateways](docs/08-integration-architecture/api-gateways.md) | pattern | intermediário | `rest` | ⬜ |
| 🟩 | [Integração em Lote](docs/08-integration-architecture/batch-integration.md) | concept | intermediário | `integration-architecture` | ⬜ |
| 🟩 | [Enterprise Integration Patterns](docs/08-integration-architecture/enterprise-integration-patterns.md) | reference | intermediário | `messaging-integration` | ⬜ |
| 🟩 | [Integração Orientada a Eventos](docs/08-integration-architecture/event-driven-integration.md) | concept | avançado | `messaging-integration` | ⬜ |
| 🟩 | [Integração por Arquivo](docs/08-integration-architecture/file-integration.md) | concept | intermediário | `batch-integration` | ⬜ |
| 🟩 | [GraphQL](docs/08-integration-architecture/graphql.md) | concept | avançado | `rest` | ⬜ |
| 🟩 | [gRPC](docs/08-integration-architecture/grpc.md) | concept | avançado | `rest` | ⬜ |
| 🟩 | [Arquitetura de Integração](docs/08-integration-architecture/index.md) | index | avançado | `distributed-systems` | ⬜ |
| 🟩 | [Anti-Corruption Layer na Integração](docs/08-integration-architecture/integration-anti-corruption.md) | pattern | avançado | `integration-contracts` | ⬜ |
| 🟩 | [Contratos de Integração](docs/08-integration-architecture/integration-contracts.md) | concept | avançado | `integration-architecture` | ⬜ |
| 🟩 | [Integração por Mensageria](docs/08-integration-architecture/messaging-integration.md) | concept | avançado | `integration-architecture` | ⬜ |
| 🟩 | [REST](docs/08-integration-architecture/rest.md) | concept | intermediário | `integration-architecture` | ⬜ |
| 🟩 | [Evolução de Esquema](docs/08-integration-architecture/schema-evolution.md) | concept | avançado | `integration-contracts` | ⬜ |
| 🟩 | [Malha de Serviço](docs/08-integration-architecture/service-mesh.md) | pattern | avançado | `api-gateways` | ⬜ |
| 🟩 | [Webhooks](docs/08-integration-architecture/webhooks.md) | pattern | intermediário | `integration-architecture` | ⬜ |
| 🟩 | [Zonas de Disponibilidade](docs/09-cloud-architecture/availability-zones.md) | concept | intermediário | `regions` | ⬜ |
| 🟩 | [Computação em Nuvem](docs/09-cloud-architecture/cloud-compute.md) | concept | intermediário | `iaas` | ⬜ |
| 🟩 | [Identidade em Nuvem](docs/09-cloud-architecture/cloud-identity.md) | concept | avançado | `cloud-architecture` | ⬜ |
| 🟩 | [Cloud Native](docs/09-cloud-architecture/cloud-native.md) | concept | intermediário | `containers` | ⬜ |
| 🟩 | [Rede em Nuvem](docs/09-cloud-architecture/cloud-networking.md) | concept | avançado | `cloud-architecture` | ⬜ |
| 🟩 | [Armazenamento em Nuvem](docs/09-cloud-architecture/cloud-storage.md) | concept | intermediário | `cloud-architecture` | ⬜ |
| 🟩 | [Contêineres](docs/09-cloud-architecture/containers.md) | concept | intermediário | `cloud-architecture` | ⬜ |
| 🟩 | [Arquitetura de Custo](docs/09-cloud-architecture/cost-architecture.md) | concept | avançado | `cloud-architecture` | ⬜ |
| 🟩 | [Recuperação de Desastre](docs/09-cloud-architecture/disaster-recovery.md) | concept | avançado | `regions` | ⬜ |
| 🟩 | [IaaS](docs/09-cloud-architecture/iaas.md) | concept | intermediário | `cloud-architecture` | ⬜ |
| 🟩 | [Arquitetura em Nuvem](docs/09-cloud-architecture/index.md) | index | avançado | `distributed-systems` | ⬜ |
| 🟩 | [Kubernetes](docs/09-cloud-architecture/kubernetes.md) | concept | avançado | `containers` | ⬜ |
| 🟩 | [Serviços Gerenciados](docs/09-cloud-architecture/managed-services.md) | concept | intermediário | `cloud-architecture` | ⬜ |
| 🟩 | [Multi-Região](docs/09-cloud-architecture/multi-region.md) | pattern | avançado | `regions` | ⬜ |
| 🟩 | [PaaS](docs/09-cloud-architecture/paas.md) | concept | intermediário | `iaas` | ⬜ |
| 🟩 | [Regiões](docs/09-cloud-architecture/regions.md) | concept | intermediário | `cloud-architecture` | ⬜ |
| 🟩 | [SaaS](docs/09-cloud-architecture/saas.md) | concept | intermediário | `paas` | ⬜ |
| 🟩 | [Serverless](docs/09-cloud-architecture/serverless.md) | concept | avançado | `managed-services` | ⬜ |
| 🟩 | [Dependência de Fornecedor](docs/09-cloud-architecture/vendor-lock-in.md) | tradeoff | avançado | `managed-services` | ⬜ |
| 🟩 | [Auditabilidade](docs/10-security/auditability.md) | concept | intermediário | `security` | ⬜ |
| 🟩 | [Modelos de Autorização](docs/10-security/authz-models.md) | tradeoff | avançado | `identity` | ⬜ |
| 🟩 | [Proteção de Dados](docs/10-security/data-protection.md) | concept | avançado | `security` | ⬜ |
| 🟩 | [Criptografia](docs/10-security/encryption.md) | concept | avançado | `security` | ⬜ |
| 🟩 | [Identidade](docs/10-security/identity.md) | concept | intermediário | `security` | ⬜ |
| 🟩 | [Arquitetura de Segurança](docs/10-security/index.md) | index | avançado | `system-design` | ⬜ |
| 🟩 | [JWT](docs/10-security/jwt.md) | concept | avançado | `oauth2` | ⬜ |
| 🟩 | [Gestão de Chaves](docs/10-security/key-management.md) | concept | avançado | `encryption` | ⬜ |
| 🟩 | [Menor Privilégio](docs/10-security/least-privilege.md) | concept | intermediário | `security` | ⬜ |
| 🟩 | [Segurança de Rede](docs/10-security/network-security.md) | concept | intermediário | `security` | ⬜ |
| 🟩 | [OAuth 2.0](docs/10-security/oauth2.md) | concept | avançado | `identity` | ⬜ |
| 🟩 | [OpenID Connect](docs/10-security/oidc.md) | concept | avançado | `oauth2` | ⬜ |
| 🟩 | [Segredos](docs/10-security/secrets.md) | concept | intermediário | `security` | ⬜ |
| 🟩 | [Fronteiras Seguras](docs/10-security/secure-boundaries.md) | concept | avançado | `threat-modeling` | ⬜ |
| 🟩 | [Modos de Falha de Segurança](docs/10-security/security-failure-modes.md) | concept | avançado | `secure-boundaries` | ⬜ |
| 🟩 | [Confiança na Cadeia de Suprimentos](docs/10-security/supply-chain-trust.md) | concept | avançado | `security` | ⬜ |
| 🟩 | [Modelagem de Ameaças](docs/10-security/threat-modeling.md) | concept | avançado | `security` | ⬜ |
| 🟩 | [Confiança Zero](docs/10-security/zero-trust.md) | concept | avançado | `secure-boundaries` | ⬜ |
| 🟩 | [Processamento Assíncrono](docs/11-scalability/async-processing.md) | concept | intermediário | `scalability` | ⬜ |
| 🟩 | [Escala de Banco de Dados](docs/11-scalability/database-scaling.md) | concept | avançado | `scalability` | ⬜ |
| 🟩 | [Escala Horizontal](docs/11-scalability/horizontal-scaling.md) | concept | avançado | `vertical-scaling` | ⬜ |
| 🟩 | [Pontos Quentes](docs/11-scalability/hotspots.md) | concept | avançado | `scalability` | ⬜ |
| 🟩 | [Escalabilidade](docs/11-scalability/index.md) | index | avançado | `system-design` | ⬜ |
| 🟩 | [Desempenho versus Escalabilidade](docs/11-scalability/performance-vs-scalability.md) | tradeoff | intermediário | `scalability` | ⬜ |
| 🟩 | [Escala Dirigida por Fila](docs/11-scalability/queue-based-scaling.md) | pattern | avançado | `async-processing` | ⬜ |
| 🟩 | [Cache para Escala](docs/11-scalability/scaling-cache.md) | concept | avançado | `scalability` | ⬜ |
| 🟩 | [Planejamento de Capacidade para Escala](docs/11-scalability/scaling-capacity-planning.md) | concept | avançado | `performance-vs-scalability` | ⬜ |
| 🟩 | [Balanceamento para Escala](docs/11-scalability/scaling-load-balancing.md) | concept | intermediário | `horizontal-scaling` | ⬜ |
| 🟩 | [Particionamento para Escala](docs/11-scalability/scaling-partitioning.md) | concept | avançado | `scaling-replication` | ⬜ |
| 🟩 | [Replicação para Escala](docs/11-scalability/scaling-replication.md) | concept | intermediário | `scalability` | ⬜ |
| 🟩 | [Ausência de Estado](docs/11-scalability/statelessness.md) | concept | intermediário | `horizontal-scaling` | ⬜ |
| 🟩 | [Escala Vertical](docs/11-scalability/vertical-scaling.md) | concept | intermediário | `scalability` | ⬜ |
| 🟩 | [Métricas de Disponibilidade](docs/12-reliability/availability-metrics.md) | concept | intermediário | `reliability` | ⬜ |
| 🟩 | [Bulkheads](docs/12-reliability/bulkheads.md) | pattern | intermediário | `reliability` | ⬜ |
| 🟩 | [Engenharia do Caos](docs/12-reliability/chaos-engineering.md) | concept | avançado | `reliability` | ⬜ |
| 🟩 | [Circuit Breakers](docs/12-reliability/circuit-breakers.md) | pattern | intermediário | `retry-storms` | ⬜ |
| 🟩 | [Planejamento de Recuperação](docs/12-reliability/disaster-recovery-planning.md) | concept | avançado | `rto` | ⬜ |
| 🟩 | [Exercício 07 — Disponibilidade Multi-região](docs/12-reliability/exercises/07-multi-region.md) | exercise | avançado | `06-partial-failure` | ⬜ |
| 🟩 | [Failover](docs/12-reliability/failover.md) | concept | avançado | `redundancy` | ⬜ |
| 🟩 | [Tolerância a Falhas](docs/12-reliability/fault-tolerance.md) | concept | avançado | `reliability-basics` | ⬜ |
| 🟩 | [Degradação Graciosa](docs/12-reliability/graceful-degradation.md) | pattern | intermediário | `reliability` | ⬜ |
| 🟩 | [Confiabilidade](docs/12-reliability/index.md) | index | avançado | `distributed-systems` | ⬜ |
| 🟩 | [Redundância](docs/12-reliability/redundancy.md) | concept | intermediário | `reliability` | ⬜ |
| 🟩 | [Fundamentos de Confiabilidade](docs/12-reliability/reliability-basics.md) | foundation | intermediário | `reliability` | ⬜ |
| 🟩 | [Resiliência](docs/12-reliability/resilience.md) | concept | avançado | `fault-tolerance` | ⬜ |
| 🟩 | [Tempestades de Retentativa](docs/12-reliability/retry-storms.md) | concept | avançado | `reliability` | ⬜ |
| 🟩 | [RPO](docs/12-reliability/rpo.md) | foundation | intermediário | `reliability` | ⬜ |
| 🟩 | [RTO](docs/12-reliability/rto.md) | foundation | intermediário | `reliability` | ⬜ |
| 🟩 | [SLA](docs/12-reliability/sla.md) | concept | intermediário | `slo` | ⬜ |
| 🟩 | [SLI](docs/12-reliability/sli.md) | concept | intermediário | `reliability` | ⬜ |
| 🟩 | [SLO](docs/12-reliability/slo.md) | concept | avançado | `sli` | ⬜ |
| 🟩 | [Alertas](docs/13-observability/alerting.md) | concept | avançado | `golden-signals` | ⬜ |
| 🟩 | [Identificadores de Correlação](docs/13-observability/correlation-ids.md) | pattern | intermediário | `observability` | ⬜ |
| 🟩 | [Painéis](docs/13-observability/dashboards.md) | concept | intermediário | `golden-signals` | ⬜ |
| 🟩 | [Depurabilidade](docs/13-observability/debuggability.md) | concept | avançado | `observability` | ⬜ |
| 🟩 | [Rastreamento Distribuído](docs/13-observability/distributed-tracing.md) | concept | avançado | `traces` | ⬜ |
| 🟩 | [Sinais Dourados](docs/13-observability/golden-signals.md) | concept | intermediário | `observability` | ⬜ |
| 🟩 | [Observabilidade](docs/13-observability/index.md) | index | avançado | `distributed-systems` | ⬜ |
| 🟩 | [Logs](docs/13-observability/logs.md) | concept | intermediário | `observability` | ⬜ |
| 🟩 | [Métricas](docs/13-observability/metrics.md) | concept | intermediário | `observability` | ⬜ |
| 🟩 | [Conceitos de SRE](docs/13-observability/sre-concepts.md) | concept | avançado | `observability` | ⬜ |
| 🟩 | [Telemetria](docs/13-observability/telemetry.md) | concept | avançado | `observability` | ⬜ |
| 🟩 | [Traces](docs/13-observability/traces.md) | concept | intermediário | `observability` | ⬜ |
| 🟩 | [Blue-Green](docs/14-devops-and-platform/blue-green.md) | pattern | intermediário | `deployment-strategies` | ⬜ |
| 🟩 | [Canary](docs/14-devops-and-platform/canary.md) | pattern | avançado | `deployment-strategies` | ⬜ |
| 🟩 | [Integração e Entrega Contínuas](docs/14-devops-and-platform/ci-cd.md) | concept | intermediário | `devops-and-platform` | ⬜ |
| 🟩 | [Contêineres na Entrega](docs/14-devops-and-platform/containers-in-delivery.md) | concept | intermediário | `ci-cd` | ⬜ |
| 🟩 | [Estratégias de Implantação](docs/14-devops-and-platform/deployment-strategies.md) | tradeoff | intermediário | `ci-cd` | ⬜ |
| 🟩 | [Gestão de Ambientes](docs/14-devops-and-platform/environment-management.md) | concept | intermediário | `infrastructure-as-code` | ⬜ |
| 🟩 | [Feature Flags](docs/14-devops-and-platform/feature-flags.md) | pattern | intermediário | `ci-cd` | ⬜ |
| 🟩 | [DevOps e Plataforma](docs/14-devops-and-platform/index.md) | index | avançado | `observability` | ⬜ |
| 🟩 | [Infraestrutura como Código](docs/14-devops-and-platform/infrastructure-as-code.md) | concept | intermediário | `devops-and-platform` | ⬜ |
| 🟩 | [Plataformas Internas](docs/14-devops-and-platform/internal-developer-platforms.md) | concept | avançado | `platform-engineering` | ⬜ |
| 🟩 | [Engenharia de Plataforma](docs/14-devops-and-platform/platform-engineering.md) | concept | avançado | `devops-and-platform` | ⬜ |
| 🟩 | [Gestão de Releases](docs/14-devops-and-platform/release-management.md) | concept | intermediário | `ci-cd` | ⬜ |
| 🟩 | [Implantação em Ondas](docs/14-devops-and-platform/rolling-deployments.md) | pattern | intermediário | `deployment-strategies` | ⬜ |
| 🟩 | [Segurança da Esteira](docs/14-devops-and-platform/supply-chain-security.md) | concept | avançado | `ci-cd` | ⬜ |
| 🟩 | [Descrições de Arquitetura](docs/17-architecture-documentation/architecture-descriptions.md) | concept | avançado | `architecture-views` | ⬜ |
| 🟩 | [Visões de Arquitetura](docs/17-architecture-documentation/architecture-views.md) | concept | avançado | `c4-model` | ⬜ |
| 🟩 | [Modelo C4](docs/17-architecture-documentation/c4-model.md) | concept | intermediário | `documentation-principles` | ⬜ |
| 🟩 | [Diagramas de Componente](docs/17-architecture-documentation/component-diagrams.md) | concept | intermediário | `container-diagrams` | ⬜ |
| 🟩 | [Diagramas de Contêiner](docs/17-architecture-documentation/container-diagrams.md) | concept | intermediário | `c4-model` | ⬜ |
| 🟩 | [Diagramas de Contexto](docs/17-architecture-documentation/context-diagrams.md) | concept | iniciante | `c4-model` | ⬜ |
| 🟩 | [Diagramas de Fluxo de Dados](docs/17-architecture-documentation/data-flow-diagrams.md) | concept | intermediário | `container-diagrams` | ⬜ |
| 🟩 | [Diagramas de Implantação](docs/17-architecture-documentation/deployment-diagrams.md) | concept | intermediário | `container-diagrams` | ⬜ |
| 🟩 | [Qualidade de Diagrama](docs/17-architecture-documentation/diagram-quality.md) | concept | intermediário | `documentation-principles` | ⬜ |
| 🟩 | [Princípios de Documentação](docs/17-architecture-documentation/documentation-principles.md) | concept | intermediário | `architecture-documentation` | ⬜ |
| 🟩 | [Padrões de Documentação](docs/17-architecture-documentation/documentation-standards.md) | concept | intermediário | `documentation-principles` | ⬜ |
| 🟩 | [Documentação de Arquitetura](docs/17-architecture-documentation/index.md) | index | intermediário | `system-design` | ⬜ |
| 🟩 | [Documentação Viva](docs/17-architecture-documentation/living-documentation.md) | concept | avançado | `documentation-principles` | ⬜ |
| 🟩 | [Diagramas de Sequência](docs/17-architecture-documentation/sequence-diagrams.md) | concept | intermediário | `container-diagrams` | ⬜ |
| 🟩 | [ADR-001 — Adotar Monólito Modular](docs/18-architecture-decisions/adr-001-modular-monolith.md) | adr | intermediário | `adr-structure` | ⬜ |
| 🟩 | [ADR-002 — Processamento Assíncrono da Confirmação](docs/18-architecture-decisions/adr-002-async-processing.md) | adr | intermediário | `adr-structure` | ⬜ |
| 🟩 | [ADR-003 — PostgreSQL como Banco Primário Único](docs/18-architecture-decisions/adr-003-postgresql.md) | adr | intermediário | `adr-structure` | ⬜ |
| 🟩 | [ADR-004 — Adotar Kafka para Eventos de Domínio](docs/18-architecture-decisions/adr-004-kafka.md) | adr | avançado | `superseding-decisions` | ⬜ |
| 🟩 | [ADR-005 — Portas e Adaptadores nos Módulos de Domínio](docs/18-architecture-decisions/adr-005-hexagonal.md) | adr | avançado | `adr-structure` | ⬜ |
| 🟩 | [Alternativas Consideradas](docs/18-architecture-decisions/adr-alternatives.md) | concept | intermediário | `adr-structure` | ⬜ |
| 🟩 | [Consequências](docs/18-architecture-decisions/adr-consequences.md) | concept | intermediário | `adr-structure` | ⬜ |
| 🟩 | [Contexto da Decisão](docs/18-architecture-decisions/adr-context.md) | concept | intermediário | `adr-structure` | ⬜ |
| 🟩 | [A Decisão](docs/18-architecture-decisions/adr-decision.md) | concept | intermediário | `adr-structure` | ⬜ |
| 🟩 | [Status do ADR](docs/18-architecture-decisions/adr-status.md) | concept | intermediário | `adr-structure` | ⬜ |
| 🟩 | [Estrutura do ADR](docs/18-architecture-decisions/adr-structure.md) | concept | iniciante | `what-is-an-adr` | ⬜ |
| 🟩 | [Decisões de Arquitetura](docs/18-architecture-decisions/index.md) | index | intermediário | `architecture-documentation` | ⬜ |
| 🟩 | [Superação de Decisões](docs/18-architecture-decisions/superseding-decisions.md) | concept | avançado | `adr-status` | ⬜ |
| 🟩 | [O Que É um ADR](docs/18-architecture-decisions/what-is-an-adr.md) | foundation | iniciante | `architecture-documentation` | ⬜ |
| 🟩 | [Por Que ADRs Importam](docs/18-architecture-decisions/why-adrs-matter.md) | foundation | iniciante | `what-is-an-adr` | ⬜ |
| 🟩 | [Abstração vs. Complexidade](docs/20-trade-offs/abstraction-vs-complexity.md) | tradeoff | avançado | `abstraction` | ⬜ |
| 🟩 | [Build vs. Buy](docs/20-trade-offs/build-vs-buy.md) | tradeoff | intermediário | `saas` | ⬜ |
| 🟩 | [Centralização vs. Descentralização](docs/20-trade-offs/centralization-vs-decentralization.md) | tradeoff | avançado | `governance-basics` | ⬜ |
| 🟩 | [Nativo de Nuvem vs. Portável](docs/20-trade-offs/cloud-native-vs-portable.md) | tradeoff | avançado | `vendor-lock-in` | ⬜ |
| 🟩 | [Consistência vs. Disponibilidade](docs/20-trade-offs/consistency-vs-availability.md) | tradeoff | avançado | `cap` | ⬜ |
| 🟩 | [Custo vs. Confiabilidade](docs/20-trade-offs/cost-vs-reliability.md) | tradeoff | avançado | `reliability-basics` | ⬜ |
| 🟩 | [Acoplamento vs. Duplicação](docs/20-trade-offs/coupling-vs-duplication.md) | tradeoff | intermediário | `coupling` | ⬜ |
| 🟩 | [Trade-offs](docs/20-trade-offs/index.md) | index | avançado | `distributed-systems` | ⬜ |
| 🟩 | [Gerenciado vs. Autogerido](docs/20-trade-offs/managed-vs-self-hosted.md) | tradeoff | intermediário | `managed-services` | ⬜ |
| 🟩 | [Monólito vs. Microsserviços](docs/20-trade-offs/monolith-vs-microservices.md) | tradeoff | avançado | `microservices` | ⬜ |
| 🟩 | [Desempenho vs. Manutenibilidade](docs/20-trade-offs/performance-vs-maintainability.md) | tradeoff | intermediário | `complexity` | ⬜ |
| 🟩 | [Simplicidade vs. Flexibilidade](docs/20-trade-offs/simplicity-vs-flexibility.md) | tradeoff | intermediário | `complexity` | ⬜ |
| 🟩 | [Velocidade vs. Qualidade](docs/20-trade-offs/speed-vs-quality.md) | tradeoff | intermediário | `technical-debt` | ⬜ |
| 🟩 | [SQL vs. NoSQL](docs/20-trade-offs/sql-vs-nosql.md) | tradeoff | intermediário | `nosql` | ⬜ |
| 🟩 | [Consistência Forte vs. Eventual](docs/20-trade-offs/strong-vs-eventual-consistency.md) | tradeoff | avançado | `eventual-consistency` | ⬜ |
| 🟩 | [Síncrono vs. Assíncrono](docs/20-trade-offs/sync-vs-async.md) | tradeoff | avançado | `messaging` | ⬜ |

### Nível 06 — Arquitetura Corporativa

| Estado | Documento | Tipo | Dificuldade | Pré-requisitos | en-US |
|:-:|---|---|---|---|:-:|
| 🟩 | [Arquitetura de Aplicação](docs/15-enterprise-architecture/application-architecture.md) | concept | avançado | `business-capabilities` | ⬜ |
| 🟩 | [Portfólio de Aplicações](docs/15-enterprise-architecture/application-portfolios.md) | concept | avançado | `business-capabilities` | ⬜ |
| 🟩 | [Níveis de Arquitetura](docs/15-enterprise-architecture/architecture-levels.md) | concept | avançado | `enterprise-architecture` | ⬜ |
| 🟩 | [Revisão de Arquitetura](docs/15-enterprise-architecture/architecture-review.md) | concept | avançado | `architecture-levels` | ⬜ |
| 🟩 | [Roteiros de Arquitetura](docs/15-enterprise-architecture/architecture-roadmaps.md) | concept | avançado | `transition-architecture` | ⬜ |
| 🟩 | [Arquitetura de Negócio](docs/15-enterprise-architecture/business-architecture.md) | concept | avançado | `enterprise-architecture` | ⬜ |
| 🟩 | [Capacidades de Negócio](docs/15-enterprise-architecture/business-capabilities.md) | concept | avançado | `enterprise-architecture` | ⬜ |
| 🟩 | [Mapeamento de Capacidades](docs/15-enterprise-architecture/capability-mapping.md) | concept | avançado | `business-capabilities` | ⬜ |
| 🟩 | [Arquitetura do Estado Atual](docs/15-enterprise-architecture/current-state-architecture.md) | concept | avançado | `enterprise-architecture` | ⬜ |
| 🟩 | [Fundamentos de Arquitetura Corporativa](docs/15-enterprise-architecture/enterprise-architecture-basics.md) | foundation | avançado | `enterprise-architecture` | ⬜ |
| 🟩 | [Arquitetura de Dados Corporativa](docs/15-enterprise-architecture/enterprise-data-architecture.md) | concept | avançado | `enterprise-architecture` | ⬜ |
| 🟩 | [Governança Corporativa](docs/15-enterprise-architecture/enterprise-governance.md) | concept | avançado | `architecture-levels` | ⬜ |
| 🟩 | [Princípios Corporativos](docs/15-enterprise-architecture/enterprise-principles.md) | concept | avançado | `enterprise-architecture` | ⬜ |
| 🟩 | [Arquitetura Corporativa](docs/15-enterprise-architecture/index.md) | index | avançado | `devops-and-platform` | ⬜ |
| 🟩 | [Paisagens de Integração](docs/15-enterprise-architecture/integration-landscapes.md) | concept | avançado | `application-portfolios` | ⬜ |
| 🟩 | [Padrões](docs/15-enterprise-architecture/standards.md) | concept | intermediário | `enterprise-principles` | ⬜ |
| 🟩 | [Arquitetura Alvo](docs/15-enterprise-architecture/target-architecture.md) | concept | avançado | `current-state-architecture` | ⬜ |
| 🟩 | [Estratégia Técnica](docs/15-enterprise-architecture/technical-strategy.md) | concept | avançado | `enterprise-architecture` | ⬜ |
| 🟩 | [Arquitetura de Tecnologia](docs/15-enterprise-architecture/technology-architecture.md) | concept | avançado | `enterprise-architecture` | ⬜ |
| 🟩 | [Radar Tecnológico](docs/15-enterprise-architecture/technology-radar.md) | pattern | intermediário | `enterprise-architecture` | ⬜ |
| 🟩 | [Arquitetura de Transição](docs/15-enterprise-architecture/transition-architecture.md) | concept | avançado | `target-architecture` | ⬜ |
| 🟩 | [Migração de Dados](docs/16-legacy-modernization/data-migration.md) | concept | avançado | `legacy-modernization` | ⬜ |
| 🟩 | [Exercício 08 — Modernizar um Legado](docs/16-legacy-modernization/exercises/08-modernize-legacy.md) | exercise | avançado | `migration-strategies` | ⬜ |
| 🟩 | [Modernização Incremental](docs/16-legacy-modernization/incremental-modernization.md) | concept | avançado | `migration-strategies` | ⬜ |
| 🟩 | [Modernização de Legado](docs/16-legacy-modernization/index.md) | index | avançado | `enterprise-architecture` | ⬜ |
| 🟩 | [Refatoração de Legado](docs/16-legacy-modernization/legacy-refactoring.md) | concept | avançado | `legacy-systems` | ⬜ |
| 🟩 | [Sistemas Legados](docs/16-legacy-modernization/legacy-systems.md) | foundation | avançado | `legacy-modernization` | ⬜ |
| 🟩 | [Estratégias de Migração](docs/16-legacy-modernization/migration-strategies.md) | tradeoff | avançado | `modernization-drivers` | ⬜ |
| 🟩 | [Motivadores de Modernização](docs/16-legacy-modernization/modernization-drivers.md) | concept | avançado | `legacy-modernization` | ⬜ |
| 🟩 | [Risco de Modernização](docs/16-legacy-modernization/modernization-risk.md) | concept | avançado | `migration-strategies` | ⬜ |
| 🟩 | [Restrições Organizacionais](docs/16-legacy-modernization/organizational-constraints.md) | concept | avançado | `legacy-modernization` | ⬜ |
| 🟩 | [Reconstrução](docs/16-legacy-modernization/rebuilding.md) | concept | avançado | `migration-strategies` | ⬜ |
| 🟩 | [Substituição](docs/16-legacy-modernization/replacing.md) | concept | avançado | `migration-strategies` | ⬜ |
| 🟩 | [Replataforma](docs/16-legacy-modernization/replatforming.md) | concept | intermediário | `migration-strategies` | ⬜ |
| 🟩 | [Strangler Fig](docs/16-legacy-modernization/strangler-fig.md) | pattern | avançado | `legacy-modernization` | ⬜ |
| 🟩 | [Conformidade](docs/19-architecture-governance/compliance.md) | concept | avançado | `governance-standards` | ⬜ |
| 🟩 | [Exceções](docs/19-architecture-governance/exceptions.md) | concept | avançado | `governance-standards` | ⬜ |
| 🟩 | [Governança Federada](docs/19-architecture-governance/federated-governance.md) | concept | avançado | `governance-basics` | ⬜ |
| 🟩 | [Funções de Aptidão como Governança](docs/19-architecture-governance/fitness-functions-governance.md) | concept | avançado | `governance-basics` | ⬜ |
| 🟩 | [Fundamentos de Governança](docs/19-architecture-governance/governance-basics.md) | concept | avançado | `enterprise-governance` | ⬜ |
| 🟩 | [Patologias de Governança](docs/19-architecture-governance/governance-pathologies.md) | concept | avançado | `governance-basics` | ⬜ |
| 🟩 | [Princípios em Operação](docs/19-architecture-governance/governance-principles.md) | concept | avançado | `governance-basics` | ⬜ |
| 🟩 | [Revisão como Instrumento](docs/19-architecture-governance/governance-review.md) | concept | avançado | `governance-basics` | ⬜ |
| 🟩 | [Padrões em Operação](docs/19-architecture-governance/governance-standards.md) | concept | avançado | `governance-principles` | ⬜ |
| 🟩 | [Governança de Arquitetura](docs/19-architecture-governance/index.md) | index | avançado | `enterprise-architecture` | ⬜ |
| 🟩 | [Medição de Governança](docs/19-architecture-governance/measuring-governance.md) | concept | avançado | `governance-basics` | ⬜ |

### Nível 07 — Liderança em Arquitetura

| Estado | Documento | Tipo | Dificuldade | Pré-requisitos | en-US |
|:-:|---|---|---|---|:-:|
| 🟩 | [Fundamentos de Liderança em Arquitetura](docs/23-architecture-leadership/architecture-leadership-basics.md) | concept | avançado | `architecture-governance` | ⬜ |
| 🟩 | [Propriedade de Arquitetura](docs/23-architecture-leadership/architecture-ownership.md) | concept | avançado | `team-topologies` | ⬜ |
| 🟩 | [Apresentações de Arquitetura](docs/23-architecture-leadership/architecture-presentations.md) | concept | avançado | `communication` | ⬜ |
| 🟩 | [Visão de Arquitetura](docs/23-architecture-leadership/architecture-vision.md) | concept | avançado | `architecture-leadership-basics` | ⬜ |
| 🟩 | [Comunicação de Arquitetura](docs/23-architecture-leadership/communication.md) | concept | avançado | `architecture-leadership-basics` | ⬜ |
| 🟩 | [Lei de Conway](docs/23-architecture-leadership/conways-law.md) | concept | avançado | `architecture-leadership-basics` | ⬜ |
| 🟩 | [Gestão de Custo](docs/23-architecture-leadership/cost-management.md) | concept | avançado | `risk-management` | ⬜ |
| 🟩 | [Arquitetura entre Times](docs/23-architecture-leadership/cross-team-architecture.md) | concept | avançado | `architecture-leadership-basics` | ⬜ |
| 🟩 | [Tomada de Decisão](docs/23-architecture-leadership/decision-making.md) | concept | avançado | `architecture-leadership-basics` | ⬜ |
| 🟩 | [Arquitetura Evolutiva](docs/23-architecture-leadership/evolutionary-architecture.md) | concept | avançado | `architecture-leadership-basics` | ⬜ |
| 🟩 | [Exercício 09 — Apresentar e Defender](docs/23-architecture-leadership/exercises/09-present-and-defend.md) | exercise | avançado | `communication` | ⬜ |
| 🟩 | [Funções de Aptidão](docs/23-architecture-leadership/fitness-functions.md) | concept | avançado | `evolutionary-architecture` | ⬜ |
| 🟩 | [Liderança em Arquitetura](docs/23-architecture-leadership/index.md) | index | avançado | `architecture-governance`, `enterprise-architecture` | ⬜ |
| 🟩 | [Governança sob a Ótica de Quem Estabelece](docs/23-architecture-leadership/leadership-governance.md) | concept | avançado | `architecture-leadership-basics` | ⬜ |
| 🟩 | [Princípios sob a Ótica de Quem Escreve](docs/23-architecture-leadership/leadership-principles.md) | concept | avançado | `architecture-vision` | ⬜ |
| 🟩 | [Padrões sob a Ótica de Quem Estabelece](docs/23-architecture-leadership/leadership-standards.md) | concept | avançado | `leadership-principles` | ⬜ |
| 🟩 | [Medição de Resultados de Arquitetura](docs/23-architecture-leadership/measuring-architecture-outcomes.md) | concept | avançado | `fitness-functions` | ⬜ |
| 🟩 | [Negociação de Trade-offs](docs/23-architecture-leadership/negotiating-tradeoffs.md) | concept | avançado | `decision-making` | ⬜ |
| 🟩 | [Arquitetura Organizacional](docs/23-architecture-leadership/organizational-architecture.md) | concept | avançado | `conways-law` | ⬜ |
| 🟩 | [Gestão de Risco](docs/23-architecture-leadership/risk-management.md) | concept | avançado | `decision-making` | ⬜ |
| 🟩 | [Gestão de Interessados](docs/23-architecture-leadership/stakeholder-management.md) | concept | avançado | `architecture-leadership-basics` | ⬜ |
| 🟩 | [Topologias de Time](docs/23-architecture-leadership/team-topologies.md) | concept | avançado | `conways-law` | ⬜ |
| 🟩 | [Influência Técnica](docs/23-architecture-leadership/technical-influence.md) | concept | avançado | `architecture-leadership-basics` | ⬜ |
| 🟩 | [Roadmaps Técnicos](docs/23-architecture-leadership/technical-roadmaps.md) | concept | avançado | `technical-strategy-leadership` | ⬜ |
| 🟩 | [Estratégia Técnica na Liderança](docs/23-architecture-leadership/technical-strategy-leadership.md) | concept | avançado | `architecture-vision` | ⬜ |

### Transversal

| Estado | Documento | Tipo | Dificuldade | Pré-requisitos | en-US |
|:-:|---|---|---|---|:-:|
| 🟩 | [Case: Núcleo Bancário Digital](docs/21-case-studies/banking.md) | case-study | avançado | `trade-offs` | ⬜ |
| 🟩 | [Case: E-commerce Omnicanal](docs/21-case-studies/ecommerce.md) | case-study | avançado | `trade-offs` | ⬜ |
| 🟩 | [Case: Delivery de Comida](docs/21-case-studies/food-delivery.md) | case-study | avançado | `trade-offs` | ⬜ |
| 🟩 | [Case: Plataforma de Saúde](docs/21-case-studies/healthcare.md) | case-study | avançado | `trade-offs` | ⬜ |
| 🟩 | [Case: Processamento de Eventos de Alto Volume](docs/21-case-studies/high-volume-events.md) | case-study | avançado | `trade-offs` | ⬜ |
| 🟩 | [Case Studies](docs/21-case-studies/index.md) | index | avançado | `system-design`, `distributed-systems` | ⬜ |
| 🟩 | [Case: Modernização de Legado](docs/21-case-studies/legacy-modernization-case.md) | case-study | avançado | `trade-offs` | ⬜ |
| 🟩 | [Case: Logística e Malha de Entregas](docs/21-case-studies/logistics.md) | case-study | avançado | `trade-offs` | ⬜ |
| 🟩 | [Case: Plataforma de Mensageria](docs/21-case-studies/messaging-platform.md) | case-study | avançado | `trade-offs` | ⬜ |
| 🟩 | [Case: Sistema Corporativo Multi-inquilino](docs/21-case-studies/multi-tenant-enterprise.md) | case-study | avançado | `trade-offs` | ⬜ |
| 🟩 | [Case: Plataforma de Pagamentos](docs/21-case-studies/payments.md) | case-study | avançado | `trade-offs` | ⬜ |
| 🟩 | [Case: Transporte por Aplicativo](docs/21-case-studies/ride-sharing.md) | case-study | avançado | `trade-offs` | ⬜ |
| 🟩 | [Case: Plataforma SaaS](docs/21-case-studies/saas-platform.md) | case-study | avançado | `trade-offs` | ⬜ |
| 🟩 | [Case: Rede Social](docs/21-case-studies/social-network.md) | case-study | avançado | `trade-offs` | ⬜ |
| 🟩 | [Case: Streaming de Vídeo](docs/21-case-studies/video-streaming.md) | case-study | avançado | `trade-offs` | ⬜ |
| 🟩 | [Cálculo de Guardanapo](docs/22-system-design-interviews/back-of-envelope.md) | concept | intermediário | `capacity-estimation` | ⬜ |
| 🟩 | [Identificação de Gargalo](docs/22-system-design-interviews/bottleneck-identification.md) | concept | intermediário | `high-level-architecture` | ⬜ |
| 🟩 | [Estimativa em Entrevista](docs/22-system-design-interviews/capacity-estimation.md) | concept | intermediário | `functional-vs-nonfunctional` | ⬜ |
| 🟩 | [Comunicação de Trade-offs](docs/22-system-design-interviews/communicating-tradeoffs.md) | concept | intermediário | `high-level-architecture` | ⬜ |
| 🟩 | [Tratamento de Falhas na Entrevista](docs/22-system-design-interviews/failure-handling.md) | concept | intermediário | `high-level-architecture` | ⬜ |
| 🟩 | [Requisitos Funcionais vs. Não Funcionais](docs/22-system-design-interviews/functional-vs-nonfunctional.md) | concept | intermediário | `requirement-clarification` | ⬜ |
| 🟩 | [Arquitetura de Alto Nível](docs/22-system-design-interviews/high-level-architecture.md) | concept | intermediário | `interview-data-modeling` | ⬜ |
| 🟩 | [Entrevistas de System Design](docs/22-system-design-interviews/index.md) | index | intermediário | `system-design` | ⬜ |
| 🟩 | [Desenho de API na Entrevista](docs/22-system-design-interviews/interview-api-design.md) | concept | intermediário | `functional-vs-nonfunctional` | ⬜ |
| 🟩 | [Erros Comuns](docs/22-system-design-interviews/interview-common-mistakes.md) | concept | intermediário | `interview-structure` | ⬜ |
| 🟩 | [Modelagem de Dados na Entrevista](docs/22-system-design-interviews/interview-data-modeling.md) | concept | intermediário | `interview-api-design` | ⬜ |
| 🟩 | [Escala na Entrevista](docs/22-system-design-interviews/interview-scaling.md) | concept | intermediário | `bottleneck-identification` | ⬜ |
| 🟩 | [Estrutura da Entrevista](docs/22-system-design-interviews/interview-structure.md) | concept | intermediário | `requirement-clarification` | ⬜ |
| 🟩 | [Clarificação de Requisitos](docs/22-system-design-interviews/requirement-clarification.md) | concept | intermediário | `system-design` | ⬜ |
| 🟩 | [Glossário](docs/glossary.md) | reference | iniciante | — | 🟩 |
| 🟩 | [Como Usar](docs/how-to-use.md) | index | iniciante | — | 🟩 |
| 🟩 | [Política Terminológica](docs/i18n-terminology.md) | reference | iniciante | — | ⬜ |
| 🟩 | [Comece aqui](docs/intro.md) | index | iniciante | — | 🟩 |
| 🟩 | [Modelo de Maturidade](docs/maturity-model.md) | reference | iniciante | — | 🟩 |

<!-- END:GENERATED -->

## Fases

Cada fase entrega um site publicável e útil por si só. Ver
[SPEC.md §15](SPEC.md) para o plano completo.

| Fase | Entrega | Estado |
|---|---|:-:|
| **F0** | Scaffold Docusaurus, i18n, Mermaid, busca, CI, validadores, deploy | 🟩 |
| **F1** | README, ROADMAP, CONTRIBUTING, glossário, modelo de maturidade, política terminológica, 23 índices de seção, sidebar por nível | 🟩 |
| **F2** | Níveis 01–02: fundamentos, design de software, padrões, DDD | 🟩 |
| **F3** | Níveis 03–04: design de sistemas, sistemas distribuídos | 🟩 |
| **F4** | Nível 05: as onze disciplinas de arquitetura + ADRs didáticos | 🟩 |
| **F5** | Níveis 06–07: corporativo, legado, governança, liderança | 🟩 |
| **F6** | Case studies, entrevistas, exercícios de revisão de arquitetura | 🟩 |
| **F7** | Tradução en-US na ordem de prioridade da spec | 🟨 em curso |
| **F8** | Revisão cruzada: contradições, duplicações, densidade, verificação factual | 🟨 parcial |

F7 é progressiva por decisão de projeto: ⬜ é estado válido, e a contagem por
documento está na tabela de paridade acima. F8 teve a passagem mecânica —
contradições, duplicação de exemplos, links, densidade — mas o checklist de
[SPEC.md §13.3](SPEC.md) exige revisão humana, que não foi feita.

Dentro de cada fase, a ordem segue o grafo de pré-requisitos: um tópico não é
escrito antes dos seus pré-requisitos, porque escrever fora de ordem produz
redefinição e duplicação.

## Ferramentas

```bash
npm test          # testes dos validadores
npm run validate  # os cinco validadores de conteúdo
npm run roadmap   # regenera as tabelas acima
npm run build     # build nas duas locales
```

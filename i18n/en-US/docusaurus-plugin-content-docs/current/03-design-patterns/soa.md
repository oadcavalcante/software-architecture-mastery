---
id: soa
title: SOA
sidebar_position: 31
description: Business services with centralized integration — the lineage that precedes microservices.
doc_type: pattern
level: 2
difficulty: intermediate
status: complete
objective: >
  By the end, the reader distinguishes SOA from microservices and recognizes what
  centralizing the integration buys and charges.
prerequisites: [microservices]
related: [microservices, event-driven, integration-architecture]
canonical_for: [SOA, service-oriented architecture, ESB]
translated_from_version: 1
last_reviewed: 2026-08-31
---

# SOA

## Overview

SOA — *Service-Oriented Architecture* — organizes the enterprise into reusable business
services, with formal contracts and integration mediated by a central bus.

It is the direct lineage of [microservices](/03-design-patterns/microservices.md), and
understanding it helps explain why microservices make certain choices — several of them in
reaction to what went wrong here.

## Problem

A large company has dozens of systems that need to integrate. Without discipline, that
produces point-to-point integrations: N systems generate up to N² connection points, each
with its own format, with no contract and no visibility.

Changing one system breaks others in unpredictable ways, and nobody can draw the whole
integration landscape.

SOA proposes: expose business capabilities as services with a formal contract, and route
all integration through a bus that translates, routes and orchestrates.

## Core Concepts

### A business service, not a technical one

The unit in SOA is a complete business capability — "customer management", "order
processing" — and not a technical component.

Services tend to be large and to correspond to areas of the organization.

### The service bus

The ESB is the characteristic element: a central component through which integration
passes, responsible for routing, format transformation, orchestration, protocol and
policy.

The intent is good — concentrating integration complexity in one specialized place, rather
than spreading it.

### What went wrong

The ESB became the problem it was meant to solve, through a predictable mechanism.

**Logic concentration.** Routing becomes a business conditional; transformation becomes a
rule; orchestration becomes a process. Business rules migrate into the bus because it is
where the systems meet.

**Organizational bottleneck.** Every integration requires the ESB team. Changes come to
depend on a queue.

**Single point of failure.** Everything passes through it.

**Inverted coupling.** The services become decoupled from each other and all coupled to
the bus.

Microservices react directly to that with the principle of **dumb pipes, smart
endpoints**: the intelligence lives in the services; the channel only transports.

### SOA and microservices

| | SOA | Microservices |
|---|---|---|
| Granularity | Broad business capability | Bounded context |
| Integration | Central ESB | Point-to-point or a simple queue |
| Intelligence | In the bus | In the services |
| Data | Frequently shared | Per service |
| Governance | Centralized | Federated |
| Reuse | An explicit goal | A consequence, not a goal |
| Deployment | Frequently coordinated | Independent |

The reuse row is the most underrated: SOA pursued reuse as a goal, and that produced
generic services that served everyone badly. Microservices prioritize autonomy over reuse
— a deliberate inversion.

## When to Use

- Integration among many heterogeneous systems, including legacy that will not change.
- Protocol and format transformation is genuinely necessary — systems speaking
  incompatible languages.
- There is a requirement for centralized governance, frequently regulatory.
- The organization already has a bus and a team that operates it.

## When Not to Use

**For new systems with autonomous teams.** The centralization becomes a bottleneck.

**When the bus would accumulate business rules.** It is the predictable degeneration.

**When release autonomy matters.** Centralized coordination prevents it.

**As a path to microservices.** They are models with opposite integration philosophies;
migrating from one to the other is more rewrite than evolution.

**When "ESB" is adopted as a solution to coupling.** Coupling does not disappear — it
moves.

## Alternatives

- **[Microservices](/03-design-patterns/microservices.md)** — for new systems with
  autonomous teams.
- **An API gateway** — routing and policy with no orchestration or business
  transformation. It captures part of the ESB's value without the degeneration.
- **[Event-driven architecture](/03-design-patterns/event-driven.md)** — a simple channel,
  intelligence at the endpoints.
- **An anti-corruption layer per consumer** — each system translates what it consumes,
  rather than one central translator. See
  [DDD](/04-domain-driven-design/index.md).

## Trade-offs

| SOA with an ESB | Decentralized integration |
|---|---|
| Integration landscape visible in one place | Emergent |
| Transformation and protocol concentrated | Replicated |
| Governance and policy centralized | Federated |
| The bus becomes a bottleneck | No central bottleneck |
| Single point of failure | Isolated failure |
| A specialized team is necessary | Each team looks after its own |

## Failure Modes

**ESB with business logic.** The dominant mode.

**A queue of changes at the bus team.** Integrations take months.

**Generic services that serve badly.** A consequence of pursuing reuse.

**Data shared between services.** Coupling with no contract.

**An impossible canonical contract.** The attempt to define a single model for the whole
company — a "canonical customer" — consumes years and does not converge, because customer
means different things in different areas. See
[bounded context](/04-domain-driven-design/bounded-context.md).

## Common Mistakes

**Putting business rules in the bus.**

**Pursuing a single canonical model.**

**Treating SOA as an old version of microservices.** The integration philosophies are
opposite.

**Adopting an ESB to solve coupling.**

## Where it appears in practice

**Large companies with extensive legacy.** Banks, insurers and telecom operators, where
there are decades-old systems that will not be rewritten.

**Sectors with regulatory governance.** Where centralized integration traceability is a
requirement.

**Scenarios with heterogeneous protocols.** Systems speaking proprietary formats that need
real translation.

The legacy case is what keeps SOA relevant: when half the systems cannot be altered,
somebody has to translate — and a central translation component is a legitimate answer.
The mistake is when it starts deciding rather than merely translating.

## Real-World Example

An insurer with 40 years of systems adopted an ESB to integrate a mainframe, Delphi
systems, web platforms and external partners.

For the first three years, it worked as intended: the bus translated formats, routed, and
the integration landscape became visible for the first time.

The degeneration took five years. Eligibility rules migrated into the bus — because the
decision depended on data from three systems, and the ESB was where all three met. Then
commission rules. Then premium calculation.

In the end, the ESB had more business logic than any individual system, and the team
operating it had an eight-month queue.

The fix was not migrating to microservices — the legacy systems were still there. It was
returning the rules to their owners: eligibility went back to underwriting, commissions to
the broker system, premium to actuarial.

The bus remained, reduced to what it should always have been: protocol translation and
routing. With no business conditionals.

The team's queue dropped to weeks.

The pattern was not wrong for that context. What failed was not having an explicit rule
about what may and may not live in the bus — and that is a governance decision, not a
technology one.

## Related Concepts

- [Microservices](/03-design-patterns/microservices.md) — the reaction to this model.
- [Event-Driven Architecture](/03-design-patterns/event-driven.md) — dumb pipes, smart
  endpoints.
- [Integration](/08-integration-architecture/index.md) — API gateway and service mesh.
- [Legacy Modernization](/16-legacy-modernization/index.md).

## Practical Exercise

If your company has an integration bus, examine what is inside it.

Classify each element: is it format translation, routing, or a business decision? The ones
in the third category belong to some system — identify which.

## Interview Questions

- What is the philosophical difference between SOA and microservices regarding
  integration?
- Why do ESBs degenerate, and what is the mechanism?
- Why does the single canonical model usually fail?

## Further Exploration

- Hohpe, Gregor; Woolf, Bobby. *Enterprise Integration Patterns*. Addison-Wesley, 2003.
- Newman, Sam. *Building Microservices*. 2nd ed., O'Reilly, 2021 — the comparison with
  SOA.
- Erl, Thomas. *SOA: Principles of Service Design*. Prentice Hall, 2007.

---
id: microservices
title: Microservices
sidebar_position: 25
description: Independently deployable services — what you buy, what you pay, and the prerequisites.
doc_type: pattern
level: 2
difficulty: advanced
status: complete
objective: >
  By the end, the reader evaluates microservices from the operational isolation
  required and the organizational prerequisites.
prerequisites: [modular-monolith]
related: [modular-monolith, event-driven, soa]
canonical_for: [microservices]
translated_from_version: 4
last_reviewed: 2026-08-31
---

# Microservices

## Overview

Microservices organize an application as a set of small services, each independently
deployable, with its own data, communicating over the network.

The property that defines the style is **independent deployability**. Everything else —
small size, heterogeneous technology, one team per service — is either a consequence or
an accessory.

## Problem

A large system with many teams faces specific problems.

Teams block each other at release: one team's risky change holds up everyone's launch.

One component needs disproportionate resources, and scaling the whole application to
serve it is wasteful.

A failure anywhere brings everything down.

And one part needs different technology for a legitimate reason.

Microservices solve all four. The cost is replacing function calls with the network — and
thereby inheriting the whole of [Level 04](/06-distributed-systems/index.md).

## Core Concepts

### What you buy and what you pay

| Buy | Pay |
|---|---|
| Independent deployment | One pipeline and one artifact per service |
| Scaling per service | Latency and partial failure on every call |
| Failure isolation | Distributed data coordination |
| Team autonomy | Versioned public contracts |
| Heterogeneous technology | Heterogeneous operations |
| Boundary enforced by the network | Refactoring a boundary becomes a migration |

The last row of both columns is the most underestimated. The network enforces the
boundary for free — which is a real advantage. And it turns moving the boundary into a
data migration, which is the disadvantage that decides.

### The prerequisites

Microservices require capabilities that have to exist **beforehand**, not afterwards:

**Automated, independent deployment.** If deploying requires manual coordination, more
services multiply the problem.

**Distributed observability.** Correlated tracing across services. Without it, diagnosing
an incident means correlating logs by hand.

**On-demand provisioning.** Creating a service cannot depend on a ticket that takes
weeks.

**Teams with real autonomy.** If decisions remain centralized, the technical autonomy
does not materialize.

Adopting without those prerequisites produces the costs without the benefits.

### Size is a consequence

"Micro" is the most misleading adjective in the name. There is no correct size.

The criterion is the business boundary — a
[bounded context](/04-domain-driven-design/bounded-context.md) — and the size is whatever that
produces. Services that are too small generate coupling through chained calls, which is
the distributed monolith.

### Data per service

The rule, as an end state: **each service owns its data, and nobody else accesses it
directly.** During a decomposition, a shared database is a legitimate transitional step —
with a declared deadline and owner. What is not legitimate is reaching the end state with
it.

Sharing a database between services produces all the coupling of a monolith, with all the
cost of distribution, and with no contract — you pay for the network and do not gain the
independence it was supposed to buy.

The consequence is that consistency between services becomes eventual, and transactions
become [sagas](/06-distributed-systems/sagas.md).

## When to Use

- Several teams need to deliver without release coordination.
- There is a proven requirement for independent scaling.
- Failure isolation between parts is a requirement.
- The domain boundaries have already proven stable.
- The four operational prerequisites exist.

## When Not to Use

**When the domain is not yet understood.** A wrong boundary between services is the most
expensive fix there is. Start as a
[modular monolith](/03-design-patterns/modular-monolith.md).

**With a small team.** Below a few dozen people, the operational cost per person is
disproportionate.

**Without the operational prerequisites.**

**To obtain logical isolation.** Modules deliver that.

**When strong consistency between parts is a requirement.** Distributed transactions are
expensive and sagas change the business semantics — which has to be accepted by the
business, not decided by engineering.

**For reputation.** The decision is made before the question that would justify it, and
afterwards the question is no longer asked — because answering it now would mean admitting
the answer was already given.

## Alternatives

- **[Modular monolith](/03-design-patterns/modular-monolith.md)** — the correct default.
- **Selective extraction** — a modular monolith with the few services that have a reason.
  The most common arrangement in mature systems.
- **[SOA](/03-design-patterns/soa.md)** — larger services, with centralized integration.
- **Serverless per function** — even finer granularity, with costs of its own.

## Trade-offs

See the table in "what you buy and what you pay". The general axis is **autonomy versus
operational and data complexity**.

The inflection point is usually in the number of teams, not the size of the code: large
systems with few teams rarely need it; medium systems with many teams frequently do.

## Failure Modes

**Distributed monolith.** Services always deployed together and whose mutual unavailability
brings everything down. The cost of distribution, none of the benefit.

**Shared database.** Coupling with no contract.

**Synchronous cascade.** A request crosses seven services; one failing brings down the
chain. See [circuit breakers](/12-reliability/circuit-breakers.md).

**Excessive granularity.** More services than the team can operate.

**Absence of tracing.** Diagnosis impossible.

**Unversioned contracts.** One change breaks consumers with no warning.

## Common Mistakes

**Adopting before knowing the boundaries.**

**Sharing a database.**

**Confusing size with the criterion.**

**Ignoring the cost of distributed data.** It is greater than that of distributed code,
and receives less attention.

**Having no consistency strategy.** Sagas and compensation have to be designed, not
discovered in production.

## Where it appears in practice

**Large commerce and streaming platforms.** Where the scale and the number of teams make
the cost justifiable.

**Reversal accounts.** Several public cases of consolidating services motivated by
operational cost — which are as instructive as the adoption ones.

**Systems with regulatory boundaries.** Where parts need isolation by external
requirement, not by technical choice.

What the case literature consistently shows: the successful adoptions started from
existing systems whose boundaries were already known, not from new projects. See
[MonolithFirst](/03-design-patterns/modular-monolith.md).

## Real-World Example

A payments platform extracted three services from a modular monolith, over two years,
each for a reason recorded in an ADR.

**Fraud detection** — a scaling requirement: it consumes ten times more CPU than the rest,
in peaks independent of transaction volume.

**Reconciliation** — an isolation requirement: it processes large files and had already
exhausted the main process's memory twice.

**Customer portal** — an organizational requirement: a separate team, with its own release
cycle and a lower availability requirement.

The rest — authorization, capture, refund, registration — stayed in the modular monolith,
because it shares transactions and changes together.

Four years later, that division has not changed. No other service was extracted, because
no other module presented one of the three reasons.

What the team avoided was treating extraction as a direction — each service needed its own
justification, and the absence of one kept the module where it was.

## Related Concepts

- [Modular Monolith](/03-design-patterns/modular-monolith.md) — the starting point.
- [Event-Driven Architecture](/03-design-patterns/event-driven.md) — asynchronous
  communication between services.
- [Distributed Systems](/06-distributed-systems/index.md) — what you inherit.
- [SOA](/03-design-patterns/soa.md) — the earlier lineage.

## Practical Exercise

For each service in your system — or each candidate module — answer: which of the reasons
justifies the separation? Scaling, failure isolation, team autonomy, or regulation?

The ones with no specific answer are candidates for consolidation.

## Interview Questions

- What is the property that defines microservices?
- Which prerequisites have to exist before adoption?
- What is a distributed monolith and how do you recognize one?

## Further Exploration

- Newman, Sam. *Building Microservices*. 2nd ed., O'Reilly, 2021.
- Newman, Sam. *Monolith to Microservices*. O'Reilly, 2019.
- Fowler, Martin. *MicroservicePrerequisites*, 2014.
- Richardson, Chris. *Microservices Patterns*. Manning, 2018.

---
id: adr-001-modular-monolith
title: "ADR-001 — Adopt a Modular Monolith"
sidebar_position: 10
description: A complete ADR example — choosing a modular monolith over microservices, with the conditions that would invert the decision.
doc_type: adr
level: 5
difficulty: intermediate
status: complete
objective: >
  By the end, the reader recognizes how context, alternatives and a warning signal combine
  in a real ADR for a structural decision.
prerequisites: [adr-structure]
related: [adr-context, adr-alternatives, adr-consequences]
canonical_for: []
translated_from_version: 1
last_reviewed: 2026-08-31
---

# ADR-001 — Adopt a Modular Monolith Instead of Microservices

:::note Teaching example

This and the four following ADRs describe decisions in a fictional system — **Verano**, a
food delivery ordering platform. They form a coherent sequence over three years, and they
exist to show the reasoning, not to serve as a technology template.

:::

| | |
|---|---|
| Status | accepted on 2023-02-14 |
| System | Verano — ordering platform |
| Authors | platform team |
| Deciders | tech lead, engineering manager |
| Consulted | the three product teams |

## Context

We are building the platform from scratch. The current operation runs on a third-party
system that will be shut down in 18 months, at the end of the contract — the date is
contractual and is not negotiable.

Forces in play, in February 2023:

```text
team                      12 engineers, 1 with operational experience
                          in distributed systems
domain                    a single one — food ordering, with catalog,
                          cart, payment, delivery
current volume            ~25 orders/s at peak, 3/s on average
commercial projection     ~120 orders/s at peak in 24 months
                          (a sales projection, not a measurement)
deadline                  18 months until the current system is shut down
on-call                   doesn't exist yet; it will be created during the project
```

Constraints:

- **A contractual deadline of August 2024**, with a penalty for extending the current
  contract.
- **No internal deployment platform.** Each deployable unit would require a pipeline,
  monitoring and on-call built by us.
- The team has no operational experience with distributed systems, and the deadline does
  not allow learning under pressure.

What we didn't know: whether the commercial projection of 120 orders/s would be confirmed,
and how the domain would actually divide — none of us had operated this business before.

## Decision

We will build Verano as a **modular monolith**: a single deployable unit, organized into
modules with explicit boundaries — catalog, cart, order, payment and delivery.

Each module has its own database schema and is only accessed by the others through declared
public interfaces. Direct access to another module's tables is forbidden and verified in
the pipeline.

**We will not** adopt microservices this cycle. **We will not** create separate deployable
units, except for background processing, if necessary.

This decision applies to the Verano platform. Integrations with external systems are not
affected.

## Alternatives Considered

**Microservices from the start.** Discarded because it would require building a pipeline,
monitoring, tracing and on-call for N services before delivering any functionality —
estimated at 4 to 5 months of the 18 available, with a team that has no distributed
operational experience.

*Would win again if:* the deadline were longer than 30 months, or the team already had an
internal platform and operational experience.

**A monolith with no modularization.** Discarded because the growth projection and the
likely division of the domain would make later extraction very expensive. The cost of
modularization is low now and high later.

*Would win again if:* the system were disposable or had an expected life of less than two
years.

**Separate services for payment and delivery only**, keeping the rest together. Discarded
for a specific reason: those are precisely the two modules with the greatest boundary
uncertainty, and separating them early would fix a division we don't know is right.

*Would win again if:* those modules' boundaries become stable and their coupling with the
rest turns out to be low in practice.

**Keep the current system and renegotiate the contract.** Discarded — the vendor has stated
they will not renew under any conditions.

## Consequences

**Positive (immediate).** One pipeline, one deployable, one on-call rotation. The team
delivers functionality from week one instead of building infrastructure. Local transactions
between modules, with no eventual consistency to manage.

**Positive (long-term).** The module boundaries, if maintained, make later extraction
viable — a module with its own schema and a declared interface is a natural candidate to
become a service.

**Negative (immediate).** Coupled deployment: any change ships the whole system. An error
in one module can bring all of them down.

**Negative (long-term).** Scaling per component is impossible — if the catalog needs more
capacity, we scale everything. Above a certain team size, the single deployment becomes a
coordination bottleneck.

**Neutral.** We need discipline and automated verification to maintain the boundaries. The
pipeline gains a step to check dependencies between modules.

**Risk accepted.** The module boundaries may erode. A modular monolith with no verification
becomes an ordinary monolith in 12 to 18 months — this is the most likely failure mode of
this decision.

## Warning Signal

We will know this decision needs revisiting if:

- the team exceeds **30 engineers** and deployment coordination becomes a recurring
  complaint;
- the module boundary check accumulates **more than 5 permanent exceptions**;
- any single module requires capacity **above 3× that of the others**;
- deployment time exceeds **20 minutes**.

## Review — 2024-09-10

A block added 19 months later, with no change to the original text.

The system went into production in July 2024, a month before the deadline. Observed peak
volume: 41 orders/s — well below the commercial projection of 120.

Of the four warning-signal conditions, none was met. The team is at 17 engineers; the
boundary check has 2 exceptions, both with a deadline; deployment time is 11 minutes.

Boundary erosion, flagged as the main risk, did not materialize — we attribute that to the
automated verification, which rejected 34 cross-access attempts over the period.

One unforeseen cost: the single database became a contention point in schema migrations.
Migrations from different modules have to be coordinated, which was not in the ADR.

Decision kept.

## What to notice in this example

The context records **numbers and their origins** — including that the projection of 120
orders/s came from sales and not from a measurement, which the 2024 review showed to be
relevant.

The alternatives carry the **reversal condition**, and one of them was discarded because of
boundary uncertainty, not because of a technical argument against the option.

The consequences separate **horizons** and name the accepted cost, including the most
likely failure mode.

The warning signal is **measurable**, and that is why the 2024 review could be objective.

## Related Concepts

- [Context](/18-architecture-decisions/adr-context.md),
  [Alternatives](/18-architecture-decisions/adr-alternatives.md),
  [Consequences](/18-architecture-decisions/adr-consequences.md).
- [Modular Monolith](/03-design-patterns/modular-monolith.md).
- [ADR-004](/18-architecture-decisions/adr-004-kafka.md) — the decision that came when the
  volume grew.

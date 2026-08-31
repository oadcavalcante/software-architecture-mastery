---
id: adr-002-async-processing
title: "ADR-002 — Asynchronous Order Confirmation"
sidebar_position: 11
description: An example of a superseded ADR — asynchronous with a queue in the database itself, and the recorded condition that triggered its replacement.
doc_type: adr
level: 5
difficulty: intermediate
status: complete
objective: >
  By the end, the reader sees how a deliberately simple decision records the condition that
  will replace it, and how that condition is later verified.
prerequisites: [adr-structure]
related: [adr-alternatives, superseding-decisions, adr-status]
canonical_for: []
translated_from_version: 2
last_reviewed: 2026-08-31
---

# ADR-002 — Process Order Confirmation Asynchronously

:::note Teaching example

The second of five ADRs from the fictional **Verano** system. This is the example of a
**superseded** decision — see [ADR-004](/18-architecture-decisions/adr-004-kafka.md).

:::

| | |
|---|---|
| Status | **superseded by [ADR-004](/18-architecture-decisions/adr-004-kafka.md)** on 2025-07-31 |
| | accepted on 2023-05-22 |
| System | Verano — ordering platform |
| Authors | platform team |
| Deciders | tech lead |

## Context

In May 2023, order creation is fully synchronous: the customer waits for payment
authorization and inventory reservation before receiving confirmation.

Measurements over the last eight weeks:

```text
p50 of order creation               340 ms
p99                                 4.2 s
p99.9                               11 s
payment partner availability
  (12 months)                       98.7%
our measured availability           98.4%
contractual requirement             99.5%
```

The partner's downtime propagates directly to us — 78% of our minutes down in 2023 were
caused by them.

Constraints:

- We are in a [modular monolith](/18-architecture-decisions/adr-001-modular-monolith.md)
  with PostgreSQL, with no messaging infrastructure and no operational experience with it.
- A team of 12 people, with the August 2024 deadline still in force.
- On-call was created two months ago and is still maturing.

What we didn't know: what the real order volume would be in 2025. The commercial projection
pointed to a 120/s peak; the volume observed at the time was 25/s.

## Decision

We will process order confirmation **asynchronously**, using a **queue implemented as a
table in PostgreSQL itself**.

The flow becomes: the order is written as `pending` in the same transaction that enqueues
the confirmation task; the customer gets an immediate response; a background process
authorizes the payment, reserves inventory and moves the order to `confirmed` or
`declined`; the customer is notified.

**We will not** adopt a dedicated messaging system at this time. **We will not** make other
operations asynchronous — catalog browsing, cart and delivery tracking remain synchronous.

## Alternatives Considered

**Keep it synchronous, with retries and a circuit breaker.** Discarded because it does not
solve the propagation of downtime: with the partner down, the order cannot be accepted at
all. The contractual requirement of 99.5% is not reachable that way.

*Would win again if:* the partner's availability rises above a sustained 99.9%.

**Adopt Kafka.** Discarded on operational cost: a cluster to operate, monitor and maintain,
with a team that has no experience and a tight deadline. The current volume doesn't justify
it — 25 orders/s fit comfortably in a table.

*Would win again if:* the volume exceeds ~200 messages/s in a sustained way, or if more than
three independent consumers of the same events appear, or if we need retention and
reprocessing of history.

**The provider's managed queue service.** Discarded for a specific reason: it doesn't offer
a transactional write together with the order, which would require an outbox anyway — and,
having the outbox, the table already solves it.

*Would win again if:* we need delivery between systems, rather than within ours.

## Consequences

**Positive (immediate).** The partner's downtime stops taking order creation down with it.
The p99 of the customer response drops to the 200 ms range. The transaction that writes the
order and the task is local — no risk of an order with no task or a task with no order.

**Positive (long-term).** The outbox pattern becomes established and reusable.

**Negative (immediate).** The customer receives confirmation later, not in the response —
which requires a product change: an "order processing" screen and a notification. A declined
payment now arrives as a notification, not as a form error.

**Negative (long-term).** The queue table grows and requires cleanup. Polling the database
consumes connections. There is no retention and no reprocessing — a processed task is gone.

**Neutral.** One background process to operate, with its own alarm.

**Risk accepted.** A queue in the database has a throughput ceiling. We estimate it
comfortably handles up to ~200 messages/s with the current configuration, and we did not go
beyond that in testing.

## Warning Signal

- A queue backlog above **2 minutes** recurrently.
- Sustained throughput above **150 messages/s**.
- More than **three distinct consumers** needing the same events.
- Database connection contention attributed to queue polling.

## Superseded — 2025-07-31

In July 2025, all four warning-signal conditions had been met. See
[ADR-004](/18-architecture-decisions/adr-004-kafka.md) for the decision that replaces this
one.

This document remains the correct record of the 2023 decision: for a context of 25 orders/s,
a team with no messaging experience and a contractual deadline in force, the queue in the
database was the appropriate choice. It sustained the system for 26 months.

## What to notice in this example

The "adopt Kafka" alternative was discarded with **three numeric reversal conditions**. Two
years later, those were what triggered the review — the decision needed no new judgment,
only measurement.

The ADR explicitly records that the queue in the database **was not tested above 200
messages/s**. That is a declared uncertainty, and it is honest.

The negative consequences include a **product** change, not just a technical one.
Architectural decisions frequently look like that, and omitting it produces surprises.

The status shows the mechanics of superseding: a bidirectional reference, the original text
intact, and a note explaining that the decision was right for its own context. See
[superseding](/18-architecture-decisions/superseding-decisions.md).

## Related Concepts

- [Status](/18-architecture-decisions/adr-status.md) and
  [Superseding](/18-architecture-decisions/superseding-decisions.md).
- [Alternatives](/18-architecture-decisions/adr-alternatives.md) — the reversal condition in
  action.
- [Background Processing](/05-system-design/background-processing.md).
- [ADR-004](/18-architecture-decisions/adr-004-kafka.md) — the successor.

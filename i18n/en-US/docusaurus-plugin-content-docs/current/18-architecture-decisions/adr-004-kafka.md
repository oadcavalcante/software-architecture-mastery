---
id: adr-004-kafka
title: "ADR-004 — Adopt Kafka for Domain Events"
sidebar_position: 13
description: An example of an ADR that supersedes another — with what changed in the context recorded explicitly.
doc_type: adr
level: 5
difficulty: advanced
status: complete
objective: >
  By the end, the reader sees how a successor ADR records what changed since its
  predecessor, instead of merely asserting the new decision.
prerequisites: [superseding-decisions]
related: [superseding-decisions, adr-context, adr-consequences]
canonical_for: []
translated_from_version: 2
last_reviewed: 2026-08-31
---

# ADR-004 — Adopt Kafka for Domain Events

:::note Teaching example

The fourth of five ADRs from the fictional **Verano** system. This one supersedes
[ADR-002](/18-architecture-decisions/adr-002-async-processing.md), and exists to show the
mechanics of [superseding](/18-architecture-decisions/superseding-decisions.md).

:::

| | |
|---|---|
| Status | accepted on 2025-07-31 — **supersedes [ADR-002](/18-architecture-decisions/adr-002-async-processing.md)** |
| System | Verano — ordering platform |
| Authors | platform team |
| Deciders | tech lead, engineering manager |
| Consulted | orders, delivery, data and fraud teams |

## Context

### What ADR-002 decided, and under what premises

In May 2023, we decided to process order confirmation asynchronously using a queue in a
PostgreSQL table. The recorded premises were:

```text
volume                    25 orders/s at peak
consumers of the events   1 (the confirmation process)
team                      12 people, with no messaging experience
deadline                  contractual, August 2024
```

And the recorded reversal conditions were: sustained throughput above 150 messages/s, more
than three consumers of the same events, a recurring backlog above 2 minutes, or connection
contention attributed to polling.

### What changed by July 2025

```text
order volume                   41/s at peak in 2024, 190/s in 2025
messages in the queue          ~310/s at peak (each order generates multiple events)
consumers of the same
  events                       5 — confirmation, delivery, fraud,
                               analytics, notification
recurring backlog              observed on 14 of the last 90 days,
                               with a peak of 9 minutes
connection contention          confirmed: polling consumes on average
                               22% of the connection limit
team                           31 engineers, 4 with operational
                               experience in Kafka
internal platform              exists since 2024, with a standardized
                               pipeline and monitoring
```

**All four reversal conditions were met** — the one on the number of consumers, which
required more than three, was exceeded by 2.

Current constraints:

- The data team needs to reprocess event history, which the queue in a table doesn't allow:
  a processed task is removed.
- The fraud team needs to consume the same events without interfering with confirmation;
  today that is done by reading the queue table directly, which is improper coupling.
- There is budget and operational capacity that did not exist in 2023.

## Decision

We will adopt **Kafka** as the domain event bus for the Verano platform.

Order, payment and delivery events start being published to Kafka topics. Writing remains
transactional through an **outbox** in PostgreSQL, with publication afterwards — the queue
in a table stops being the delivery mechanism and becomes only the outbox.

**We will not** use Kafka for request-response communication: queries between modules stay
synchronous. **We will not** migrate background processing of internal tasks — scheduled
jobs and maintenance routines stay in a table.

This decision applies to Verano's domain events. Integrations with external systems remain
over HTTP and webhooks.

## Alternatives Considered

**Keep the queue in a table, optimized.** Discarded because two limitations are structural
and not a matter of configuration: there is no retention and no reprocessing, and multiple
independent consumers would require replicating the table per consumer. The connection
contention could be mitigated; the rest could not.

*Would win again if:* the number of consumers returned to one and the reprocessing
requirement disappeared — which is not plausible.

**The provider's managed messaging service.** Discarded on a specific criterion: it doesn't
offer long retention with reprocessing by offset, which is the data team's requirement. It
would cost less operationally and doesn't meet the main case.

*Would win again if:* the reprocessing requirement is met by other means, for example a
separate event store.

**Kafka managed by a third party** instead of operated by us. **This option nearly won.**
Discarded on cost: the quote for the projected volume came to ~3.2× the estimated cost of
operating it ourselves, allowing for 0.5 engineer/month of operational effort. The team
today has 4 people with experience, which was not true in 2023.

*Would win again if:* the real operational effort exceeds 1.5 engineer/month, or if the cost
difference drops below 1.5×.

## Consequences

**Positive (immediate).** Independent consumers, with no coupling between them.
Configurable retention with reprocessing by offset. Database connection contention is
eliminated.

**Positive (long-term).** The events become a queryable asset, not merely a delivery
mechanism.

**Negative (immediate).** A cluster to operate, with its own on-call. Ordering guaranteed
only per partition, which requires choosing the partition key carefully. Debugging
asynchronous flows becomes harder and requires distributed tracing.

**Negative (long-term).** The event schemas become **public contracts**. Changing them will
require versioning and a coexistence period — today an event is changed with a migration.

**Neutral.** The outbox continues to exist; what changes is the publication destination.

**What becomes harder to change.** Once the five consumers are on Kafka, going back requires
coordinating five teams. We estimate reversal at 4 to 6 months, against the 3 weeks that
adopting ADR-002 took.

## Warning Signal

- Operational effort above **1.5 engineer/month** for two quarters — triggers reassessment
  of managed Kafka.
- More than **two incidents per quarter** with a root cause in the cluster.
- Fewer than **three active consumers** in 12 months — the reuse premise was not confirmed.
- Consumer lag above **1 minute** recurrently.

## What to notice in this example

The context has a structure of its own as a successor: **what the predecessor decided, under
what premises, and what changed**. Without that, the decision would look like the preference
of whoever arrived later. See
[superseding](/18-architecture-decisions/superseding-decisions.md).

ADR-002's reversal conditions were **verified by measurement**, not judged. The review
became a verification.

The alternative that nearly won — managed Kafka — is recorded as such, with the number that
knocked it down and the condition that would bring it back. See
[alternatives](/18-architecture-decisions/adr-alternatives.md).

The consequences name **what becomes harder to change**, with a reversal estimate. It is
reversibility recorded as a consequence.

## Related Concepts

- [Superseding](/18-architecture-decisions/superseding-decisions.md),
  [Context](/18-architecture-decisions/adr-context.md).
- [ADR-002](/18-architecture-decisions/adr-002-async-processing.md) — the predecessor.
- [Messaging](/06-distributed-systems/messaging.md).
- [Delivery Guarantees](/06-distributed-systems/delivery-guarantees.md).

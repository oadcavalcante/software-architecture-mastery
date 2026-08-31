---
id: consistency
title: Consistency
sidebar_position: 9
description: What a read can observe — a spectrum of guarantees, not a switch.
doc_type: concept
level: 4
difficulty: advanced
status: complete
objective: >
  By the end, the reader names the consistency guarantee each operation requires
  instead of treating the subject as binary.
prerequisites: [partial-failure]
related: [eventual-consistency, strong-consistency, cap]
canonical_for: []
translated_from_version: 1
last_reviewed: 2026-08-31
---

# Consistency

## Overview

Consistency, in distributed systems, is the guarantee about **what a read can observe** in
relation to the writes that preceded it.

The question "is this system consistent?" has no answer, because consistency is not a switch. It
is a **spectrum of guarantees**, and each operation in a system can require a different one.

## Problem

With one copy of the data, the question does not exist: the read sees the last write.

With replicas — and replicas exist for availability and for scale — the write reaches them at
different moments. A read can land on a replica that has not received it yet.

The user changes their own name, the screen reloads, and the old name appears. That is not a code
defect: it is the consequence of reading from a lagging replica.

The discussion usually degenerates into "we want strong consistency" — with nobody having
established **for which operations**, and with the cost in latency and availability never put on
the table.

## Core Concepts

### The spectrum, from strongest to weakest

**Linearizability.** The system behaves as if there were a single copy and every operation
happened instantaneously, in an order that respects real time. It is the strongest guarantee and
the most expensive — it requires coordination on every operation.

**Serializability.** Concurrent transactions produce the same result as some sequential execution.
It is about transactions; linearizability is about individual operations. The two together give
*strict serializability*.

**Causal consistency.** Operations related by cause and effect are seen in the correct order by
everyone; independent operations can be seen in different orders. It is the most useful middle
ground and the least known.

**[Eventual consistency](/06-distributed-systems/eventual-consistency.md).** In the absence of new
writes, all replicas converge. It does not say **when**, and it is that omission that has to be
handled in the application.

### The session guarantees

Between strong and eventual there are guarantees that solve most of the problems users perceive,
at a much lower cost:

**Read your own writes.** Whoever wrote sees what they wrote. It solves the case of the name that
does not update — which is the most common complaint about eventual consistency.

**Monotonic reads.** Once you have seen a value, you will not see an earlier one. It prevents the
"the data appeared and vanished" effect when switching between replicas.

**Monotonic writes.** Your writes are applied in the order you made them.

Those three are rarely discussed and solve almost all the perception of inconsistency — because
the user notices their own inconsistency, and tolerates other people's.

### Per operation, not per system

The correct decision is per operation:

| Operation | Required guarantee |
|---|---|
| Account debit | Linearizable |
| Unique seat reservation | Linearizable |
| User profile after editing | Read your own writes |
| View counter | Eventual |
| Product catalog | Eventual, seconds |
| Balance shown on a statement | Depends on what the business promises |

The last line is the most instructive: the answer comes from the business, not from engineering.

### Consistency costs latency even with no failure

The point [PACELC](/06-distributed-systems/pacelc.md) formalizes and
[CAP](/06-distributed-systems/cap.md) omits: guaranteeing strong consistency requires coordination
between replicas, and coordination costs network round trips.

That holds **all the time**, not only during a partition. In a multi-region configuration, a
linearizable write pays the inter-region latency — tens or hundreds of milliseconds — on every
operation.

Partitions are rare. Latency is permanent.

## Mental Model

**"Consistent with respect to what, observed by whom, under what acceptable delay?"**

The question without those three complements has no answer.

## When to Use

Strong consistency when:

- The data controls a finite resource — stock, a seat, a balance.
- An irreversible decision depends on the value read.
- There is a regulatory requirement for instantaneous accuracy.
- The cost of being wrong exceeds the cost of the latency.

## When Not to Use

**As the default for everything.** It costs latency on every operation, and most data does not
need it.

**Without asking the business.** "How much delay is acceptable for this data?" is a business
question, and the answer is usually more generous than engineering assumes.

**When session guarantees solve it.** "Read your own writes" costs a fraction and eliminates the
main complaint.

**Between bounded contexts.** Strong consistency between contexts couples them transactionally and
undoes the boundary. See
[bounded context](/04-domain-driven-design/bounded-context.md).

## Alternatives

- **Session guarantees** — the underestimated middle ground.
- **Causal consistency** — when the order between related operations matters, but the global order
  does not.
- **Reading from the primary for critical operations** — strong consistency where it matters, a
  replica for the rest.
- **Accept and reconcile** — let it diverge and fix it through a process.

## Trade-offs

| Strong consistency | Eventual |
|---|---|
| The read is always current | It can be lagging |
| Coordination on every operation | None |
| Higher latency, always | Lower |
| Unavailable under a partition | Available |
| Simple mental model | The application has to handle it |
| Limited write scaling | Scales better |

The fifth line is a real and rarely cited cost: eventual consistency pushes complexity into the
application, which has to deal with stale data, conflicts and convergence.

## Failure Modes

**A lagging read after your own write.** The most common complaint, and the easiest to solve.

**Data that appears and vanishes.** Reads alternating between replicas with different lags.

**A decision made on stale data.** Authorizing a purchase with an outdated balance.

**Strong consistency assumed and not provided.** The code presumes the read sees the write, and the
database is configured to read from a replica.

**Replication lag not monitored.** Nobody knows how stale the data can be.

## Common Mistakes

**Treating it as binary.**

**Not asking the business for the acceptable delay.**

**Not knowing which guarantees the database actually offers.** The configured isolation level is
rarely what its name suggests.

**Ignoring session guarantees.**

**Not measuring replication lag.**

## Real-World Example

An e-commerce system moved reads to replicas to relieve the primary.

Two classes of complaint appeared in one week.

**A just-created order did not appear** in the listing. The user completed the purchase, went to
"my orders", and saw the list without the order. On reload, it sometimes appeared.

**Stock sold beyond availability.** The availability check read from the replica; with replication
lag at peak hours, products with one unit were sold up to four times.

Both causes are the same, and the fixes were different.

For the first case, the required guarantee was **read your own writes** — not global strong
consistency. The implementation: after a write, that user's reads go to the primary for a period.
Low cost, complaint eliminated.

For the second, the required guarantee was **linearizability**, because stock controls a finite
resource and the decision is irreversible. The check and the reservation went back to the primary,
in a transaction.

The recorded conclusion: the move to replicas was not wrong — 90% of the reads stayed on them. The
error was treating all reads as equivalent.

And the conversation that paid off most was with the business: asking about the acceptable delay
per type of data, it turned out that the catalog tolerated minutes, reviews tolerated hours, and
only stock and the user's own orders needed a guarantee.

## Related Concepts

- [Eventual Consistency](/06-distributed-systems/eventual-consistency.md) and
  [Strong Consistency](/06-distributed-systems/strong-consistency.md) — the ends of the spectrum.
- [CAP](/06-distributed-systems/cap.md) and [PACELC](/06-distributed-systems/pacelc.md) — the
  theoretical limits.
- [Replication](/06-distributed-systems/replication.md) — where the divergence comes from.
- [Conflict Resolution](/06-distributed-systems/conflict-resolution.md).

## Practical Exercise

List your system's most important read operations and, for each one, answer: how much delay is
acceptable?

Then check where each one reads from today, and what the real replication lag is at peak. The
intersection of "does not tolerate delay" with "reads from a replica" is the next incident.

## Interview Questions

- Why does "is the system consistent?" have no answer?
- What are session guarantees and why do they solve most of the complaints?
- Why does strong consistency cost latency even with no partition?

## Further Reading

- Kleppmann, Martin. *Designing Data-Intensive Applications*. O'Reilly, 2017 — chapters 5 and 9.
- Bailis, Peter et al. *Highly Available Transactions*, 2013.
- Viotti, Paolo; Vukolić, Marko. *Consistency in Non-Transactional Distributed Storage Systems*.
  ACM Computing Surveys, 2016 — the full map of the spectrum.

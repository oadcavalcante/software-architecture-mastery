---
id: strong-vs-eventual-consistency
title: Strong vs. Eventual Consistency
sidebar_position: 12
description: The inconsistency window is a business requirement — and it needs a number.
doc_type: tradeoff
level: 5
difficulty: advanced
status: complete
objective: >
  By the end, the reader defines the tolerable inconsistency window per operation and designs
  what happens inside it.
prerequisites: [eventual-consistency]
related: [consistency-vs-availability, sync-vs-async, sql-vs-nosql]
canonical_for: []
translated_from_version: 1
last_reviewed: 2026-08-31
---

# Strong vs. Eventual Consistency

## Overview

The pair is a neighbor of [consistency vs. availability](/20-trade-offs/consistency-vs-availability.md)
and different from it. There, the choice appears during a partition. Here, it appears **every
day**, in normal operation:

```text
strong consistency     every read sees the last write — at the cost of
                       coordination, and therefore of latency
eventual consistency   replicas converge after some time — with no
                       coordination on the write path
```

```text
real axis   how much divergence time does this operation tolerate, and what
            happens to whoever reads inside that window?
```

The word "eventual" hides what decides: **eventual when?** A window of 50 milliseconds and one
of 6 hours are completely different decisions, and the same word describes both.

## Problem

"We are eventually consistent" is used as if it were a design. It is not — it is the absence of
three decisions:

```text
what the acceptable window is, in a unit of time
what the user sees inside it
what happens if convergence does not occur
```

Without the first, there is no way to monitor or alarm. Without the second, the user sees
incoherent states with no explanation. Without the third, permanent divergences go unnoticed.

The symmetric error is applying strong consistency to everything, paying for coordination in
operations that tolerated seconds of delay — which shows up as latency on every read and as
unavailability when a replica goes down.

## Core Concepts

### The window is a requirement, with a number

```text
bank balance shown to the account holder     < 1 s
like counter                                 < 30 s
search result after publication              < 5 min
management report                            < 24 h
stock on the storefront                      < 2 min
delivery position on the map                 < 10 s
```

With a number, the window becomes an alarm: divergence above the limit is an incident, not
"that's just how it is".

Without a number, there is no way to distinguish normal operation from a replication failure —
which is exactly how permanent divergences survive for months.

### Read-your-own-writes

The most important guarantee in practice, and the cheapest to provide:

```text
the user updates their profile and sees the old value   → perceived as a defect
the user posts and does not see the post                → repeats the action
the user pays and the balance did not change            → calls support
```

Eventual consistency between different users is usually invisible. Eventual consistency for the
user's **own** writes is immediately perceived as an error.

The usual solution does not require strong consistency: route that user's reads to the primary
replica for a short window, or serve the just-written value from the session.

### Intermediate guarantees

Between the two extremes there is a spectrum that solves most cases:

```text
read-your-own-writes    the author sees what they wrote
monotonic reads         you never see a state earlier than one already seen
writes in order         a session's writes are applied in order
prefix consistency      you see a consistent state, possibly an old one
```

The second avoids the most disconcerting effect of replication: the value "going back in time"
when switching replicas.

See [consistency](/06-distributed-systems/consistency.md).

### The cost of coordination is daily

```text
strong consistency across zones      tens of milliseconds per operation
across regions                       hundreds
write quorum                         latency of the slowest node in the quorum
```

This is paid on **every** operation, every day — not only during failures. It is the reason
PACELC is more relevant day to day than CAP. See
[PACELC](/06-distributed-systems/pacelc.md).

### Convergence must be observable

```text
replication lag metric, per replica
alarm above the declared window
detection of permanent divergence, not only of lag
reconciliation process, with a record
```

The third item is the most forgotten: high lag is detectable by a metric; permanent divergence —
a lost write — does not show up as lag. It requires periodic comparison.

See [observability](/13-observability/index.md).

### The product has to participate

Well-done eventual consistency is visible to the user, deliberately:

```text
"updated 2 minutes ago"
"processing — updating shortly"
values marked as approximate
action blocked until confirmation, when critical
```

Hiding the inconsistency produces the worst experience: the user sees numbers that do not add up
and concludes the system is wrong — which, from their point of view, it is.

### Signs of the wrong choice

```text
eventual and should not be
  users reporting incoherent values
  support with "the number doesn't add up" tickets
  recurring manual data fixes
  divergence discovered by a customer, not by monitoring
  window not declared

strong and should not be
  write latency dominated by coordination
  one replica being unavailable taking down writes
  low-value operations paying the cost of the critical ones
  slow reads on data nobody needs to see up to date
```

### Cost of changing your mind

```text
strong → eventual   moderate: requires designing the window, reconciliation and product
eventual → strong   expensive: the accumulated history may be divergent,
                    and the migration has to reconcile it first
```

The asymmetry favors **starting strong in the operations with the highest error cost**, and
relaxing with evidence. Relaxing is a design decision; hardening is a design decision plus a
migration of data of unknown quality.

## Mental Model

**Eventual when?** Without a number, it is not a design — it is the absence of a decision.

## When to Use

Prefer **strong consistency** when:

- The value is money, a balance, unique stock or a limit.
- An irreversible decision depends on the read.
- There is a regulatory requirement about the state.
- Reconciliation would be manual.

Prefer **eventual consistency** when:

- The tolerable window is known and larger than the replication latency.
- The data is read-dominant and aggregated.
- Scale or geographic distribution makes coordination expensive.
- The product can communicate the update in progress.

## When Not to Use

**Without declaring the window** in a unit of time.

**Without guaranteeing read-your-own-writes.**

**Without monitoring convergence** and detecting permanent divergence.

**Strong everywhere**, paying for coordination where it is not needed.

**Hiding the inconsistency from the user.**

## Alternatives

- **Intermediate guarantees** — read-your-own-writes and monotonic reads solve most of the
  perception of error.
- **Strong per operation** — coordination only where the cost of the error justifies it.
- **Read from the primary for critical cases** — keeps the replica for the rest.
- **Reservation with confirmation** — accept fast, confirm right after, expire if not confirmed.

The first is the most cost-effective and the least used.

## Trade-offs

| Strong consistency | Eventual |
|---|---|
| No divergence | Lower write latency |
| Coordination on every operation | Scale and distribution |
| Unavailable if a replica goes down | Available |
| No window design | Requires window, product and monitoring |

| Strong everywhere | Strong per operation |
|---|---|
| Simple to reason about | Fitted to the cost of the error |
| Expensive in latency | More design |
| One mode | Several, each explicit |

## Failure Modes

**Window not declared.** Impossible to alarm.

**No read-your-own-writes.** Perceived as a defect.

**Invisible permanent divergence.** Lag is measured; a lost write is not.

**Hidden inconsistency.** The user concludes the system is wrong.

**Strong in low-value operations.** Latency paid with no return.

**Improvised reconciliation.** Growing operational cost.

## Common Mistakes

**Saying "eventually consistent" with no number.** Without the window declared and measured,
nobody knows whether "eventual" means a hundred milliseconds or ten minutes — and the
difference decides whether the requirement is met.

**Not handling the case of the writer themselves.** Someone who just saved and does not see the
change reports data loss. It is the most visible case and the cheapest to solve, with reads
directed to the primary.

**Monitoring lag and not divergence.** Lag measures replication working; it does not detect the
records that diverged and will never converge on their own.

**Not communicating the state to the user.** Showing stale data as definitive transfers to the
person an uncertainty they have no way to resolve.

**Applying a single mode to the whole system.** Consistency is a per-flow choice: a balance
requires strong, a view counter does not. A single mode either overpays or takes risks where it
cannot.

## Real-World Example

A digital wallet with 4 million users operated with read replicas in three regions and eventual
consistency on all queries, with no declared window.

Twelve months of operation:

```text
"my balance is wrong" support tickets            ~2,400/month
manual data fixes                                ~40/month
largest divergence detected                      one record, 11 days
average replication lag                          180 ms
p99 lag                                          2.4 s
maximum lag observed                             47 min (incident)
```

The investigation separated the tickets by cause:

```text
read-your-own-writes (the user performed the
  operation and saw the old value)               ~1,900 (79%)
divergence between screens in the app            ~380 (16%)
real divergence, with a lost write               ~120 (5%)
```

Four fifths of the tickets were not a problem of eventual consistency as such — they were the
simplest and cheapest case to solve.

What was designed:

**Window declared per data type:**

```text
balance after the user's own operation     immediate (read from the primary)
balance in a general query                 < 2 s
statement                                  < 5 s
reports and aggregates                     < 5 min
```

**Read-your-own-writes**, implemented with routing to the primary for 10 seconds after any write
in the session. It resolved 79% of the tickets with two weeks of work.

**Strong consistency** on debit and limit-checking operations — the ones that decide whether a
transaction can occur. Measured cost: +34 ms on the p99 of those operations, accepted.

**Monotonic reads** across screens, pinning the replica per session. It resolved the 16%.

**Permanent divergence detection**, with a daily comparison between the primary and the replicas
over a sample and over all records changed in the last 24 h. It is what found the lost-write
cases, including the 11-day one.

**Communication in the product**: general query values carry an indication of the update time;
during lag above the window, the app shows a notice.

**Alarm per window**: lag above the declared value per data type raises an incident.

Results after 9 months:

```text
"my balance is wrong" tickets                    ~190/month
manual fixes                                     ~3/month
permanent divergences detected                   11, all in < 24 h
p99 latency of the balance query                 unchanged
p99 latency of debit                             +34 ms
```

What the team learned: the problem described as "eventual consistency" was, in 79% of cases, the
absence of an intermediate guarantee that costs little. The discussion had been framed as
"strong versus eventual" for two years, and the answer was in neither extreme.

And the second finding was the 11-day divergence: it existed because monitoring measured **lag**,
and a lost write does not produce lag — it produces silence.

## Related Concepts

- [Eventual Consistency](/06-distributed-systems/eventual-consistency.md) and
  [Strong Consistency](/06-distributed-systems/strong-consistency.md).
- [Consistency vs. Availability](/20-trade-offs/consistency-vs-availability.md).
- [PACELC](/06-distributed-systems/pacelc.md).
- [Synchronous vs. Asynchronous](/20-trade-offs/sync-vs-async.md).

## Practical Exercise

List the data your system replicates and write, for each one, the tolerable inconsistency window
in seconds.

The ones you cannot fill in are the ones with no requirement — and therefore no way to be
monitored.

## Interview Questions

- Why is "eventually consistent" with no number not a design?
- Why does read-your-own-writes solve most of the perception of error?
- Why does monitoring replication lag not detect permanent divergence?

## Further Reading

- Kleppmann, Martin. *Designing Data-Intensive Applications*. O'Reilly, 2017.
- Vogels, Werner. *Eventually Consistent*. ACM Queue, 2008.
- Bailis, Peter; Ghodsi, Ali. *Eventual Consistency Today*. ACM Queue, 2013.

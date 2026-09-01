---
id: 04-scaling-ecommerce
title: "Exercise 04 — Scaling the E-commerce System"
sidebar_position: 1
description: The same system, 40 times bigger — and the exercise 03 decision becomes the constraint.
doc_type: exercise
level: 4
difficulty: intermediate
status: complete
objective: >
  By the end, the reader identifies which resource saturates first and distinguishes a wrong decision
  from a decision whose shelf life has expired.
prerequisites: [03-ecommerce-backend]
related: [latency, availability, partitioning, hotspots]
canonical_for: []
translated_from_version: 2
last_reviewed: 2026-08-31
---

# Exercise 04 — Scaling the E-commerce System

:::info A continuation

This exercise uses the system you designed in
[exercise 03](/05-system-design/exercises/03-ecommerce-backend.md). Re-read the three decisions you
recorded as hard to reverse before carrying on.

:::

## Context

Two years have passed. **Ponta** has grown more than forecast:

```text
                            exercise 03         today
orders/day                  ~1,200              ~48,000
campaign peak               ~4,000/day          ~190,000/day
instantaneous peak          —                   ~140/s
catalog                     22 thousand SKUs    310 thousand SKUs
visits/day                  —                   ~2.4 million
team                        6 engineers         31 engineers
```

The system is the same. It works — and three things have started to show up:

```text
checkout p95                          from 900 ms to 4.2 s
cumulative unavailability, 12 months  26 hours
                                      (78% during acquirer
                                      instability)
sales lost in campaigns from
  database connection exhaustion      3 episodes, ~$420k
```

## Requirements

The same as exercise 03. No new features.

## Constraints

```text
no window          the store runs 24×7; there is no downtime period
deadline           the next big campaign is in five months
team               31 engineers, but only 4 with operational
                   experience in distributed systems
budget             approved, and the cost per order cannot go up
                   more than 15%
compatibility      the mobile app in the field has versions up to
                   14 months old
```

## Your Task

Produce, in up to 90 minutes:

1. **Which resource saturates first**, with the reasoning that leads to it.
2. **What saturates next** after you fix the first. And after that.
3. The fixes, **in the order you would make them**, with the trigger for each.
4. **Which of your exercise 03 decisions** you would change today — and which you would keep.
5. What you are **not** going to do now, and the number that would change your mind.

Item 4 is the heart of this exercise.

## Questions You Should Be Asking

```text
140 orders/s at peak. how many reads per second?
what is the read-to-write ratio?
is the 4.2 s p95 our code or waiting on the acquirer?
were the 26 hours our system's or propagated?
was the connection exhaustion from order volume or from
  connections stuck waiting on an external response?
does the catalog's hot set fit in memory?
```

The fifth is the one that solves the exercise. The three measurements — latency, unavailability and
connections — all point to the same place, and it is not volume.

## Assessment Criteria

Your answer is good if:

- **You identified that the bottleneck is the synchronous call to the acquirer**, not the volume. The
  three symptoms converge: latency that is waiting, unavailability that is propagated, and stuck
  connections.
- **You calculated the read/write ratio.** 2.4 million visits against 48 thousand orders is about 50 to
  1 in orders alone; counting browsing, far more. That settles that the read fix is caching, not
  partitioning.
- **You did not propose partitioning the database.** 140 writes per second fit comfortably; partitioning
  would solve a problem that doesn't exist and would create a distributed transaction in the core
  operation.
- **You recognized that the exercise 03 decision was not an error.** It was correct for 1,200 orders/day
  and it expired. Treating it as an error leads to wrong conclusions about how to decide.
- **You declared what you are not going to do**, with the number that would change the decision.

Your answer is weak if it starts with "let's migrate to microservices" with no symptom pointing at
deployment coupling.

## Discussion

:::details Open after trying

**The three symptoms are one symptom.** The synchronous call to the acquirer, inside the transaction, is
causing all three:

```text
latency          the 4.2 s p95 is dominated by waiting; the time
                 in your code hasn't changed
availability     the acquirer's 99.5% × the rest ≈ what you
                 observed; 78% of the outages were theirs
connections      each order holds a database connection while it
                 waits on the acquirer; during a campaign, the pool
                 runs out — and the database stops serving even
                 those who are only browsing
```

The third is the most instructive and the least obvious: the transaction held open during the external
call turns a slow dependency into a total outage. See
[timeouts](/06-distributed-systems/timeouts.md) and [partial failure](/06-distributed-systems/partial-failure.md).

**The fix, in order:**

```text
1. take the external call out of the transaction
   → resolves the connection exhaustion; costs days
2. an aggressive timeout and a circuit breaker on the acquirer
   → resolves the propagation of partial unavailability
3. caching on the catalog and the storefront
   → resolves the reads, which are 50× the writes
4. read replicas
   → only after the cache, and only if the hit rate isn't enough
```

No partitioning. No splitting into services. All four fixes keep the architecture and change where the
waiting happens.

**What you are not going to do, and the trigger:**

```text
partition the writes           when it passes ~3,000 orders/s
                               sustained
split into services            when different teams need to
                               deploy independently, and the deploy
                               queue is measured
multi-region                   exercise 07
```

**The exercise 03 decision was not an error.** It was correct for 1,200 orders a day, and that exercise's
brief said a seven-month deadline and six people with no platform. An asynchronous architecture there
would have cost the deadline and probably the commercial date.

What was missing was not the decision — it was **recording the trigger**. If the exercise 03 ADR had
said "reassess when the peak passes 20 orders/s or when propagated unavailability passes 4 h/year", the
fix would have started before the three campaign episodes.

That is the difference between a decision with a shelf life and a decision that expired without anybody
noticing. See
[alternatives in an ADR](/18-architecture-decisions/adr-alternatives.md).

**Item 1 of the fix is exercise 05.** Taking the call out of the transaction looks like a small technical
change and it isn't: it creates an intermediate state, and an intermediate state is product work.

:::

## Related Concepts

- [Exercise 03](/05-system-design/exercises/03-ecommerce-backend.md).
- [Timeouts](/06-distributed-systems/timeouts.md) and [Partial Failure](/06-distributed-systems/partial-failure.md).
- [Availability](/06-distributed-systems/availability.md).
- [Bottleneck Identification](/22-system-design-interviews/bottleneck-identification.md).

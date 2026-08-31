---
id: failure-handling
title: Failure Handling in the Interview
sidebar_position: 10
description: "Walk through each component and answer: what happens if it goes down, and what the user sees."
doc_type: concept
level: 0
difficulty: intermediate
status: complete
objective: >
  By the end, the reader walks through a design stating each component's failure mode and the
  degradation chosen for each one.
prerequisites: [high-level-architecture]
related: [interview-scaling, bottleneck-identification, communicating-tradeoffs]
canonical_for: []
translated_from_version: 1
last_reviewed: 2026-08-31
---

# Failure Handling in the Interview

## Overview

"What happens if the database goes down?" is one of the most frequent questions in system design
interviews, and one of those that most separates candidates.

The weak answer is "we have a replica". The strong answer walks through the effect:

```text
"the primary database goes down. Promoting the replica takes ~30 seconds,
 during which writes fail and reads keep going through the
 replicas.

 In that period, link creation returns an explicit error and
 redirects keep working from the cache — which is the
 operation that matters.

 If the outage goes beyond a few minutes, the cache starts to expire
 and redirects degrade progressively."
```

The difference is not knowledge of mechanisms. It is having walked the effect through to the user.

## Problem

Three error patterns.

**Redundancy as the only answer.** Every component has a replica, and no failure mode is described.
Redundancy reduces the probability of failure, it does not eliminate the effect when it occurs — and
the question is about the effect.

**Ignoring partial failure.** The candidate considers only "up" or "down", and not the intermediate
states: slow, responding with errors, responding wrongly, responding sometimes. In distributed
systems, those states are more common than a complete outage. See
[partial failure](/06-distributed-systems/partial-failure.md).

**Undesigned degradation.** "The system keeps working" — but how, and with what? A system that
degrades without a design does not degrade: it fails in unforeseen ways.

## Core Concepts

### Walk the design, component by component

The method is mechanical and effective:

```text
for each box in the design:
  if it goes down, what stops working?
  what keeps working?
  what does the user see?
  how long until it recovers?
  is there a designed alternative?
```

Walking through five boxes takes two minutes and covers most of what the interview wants to
evaluate. Doing it proactively, without waiting for the question, is a strong move.

### Partial failure is the common case

```text
complete       the component does not respond
slow           responds beyond the deadline — worse than not responding,
               because it consumes the caller's resources
intermittent   responds sometimes
degraded       responds with stale or incomplete data
byzantine      responds wrongly, with no error indication
```

The "slow" case deserves emphasis in an interview: a slow dependency exhausts the caller's
connections and memory, and takes down a system that would survive it being completely down. It is
the argument for aggressive timeouts and circuit breakers.

The mechanism is worth stating, because it is counterintuitive. When a dependency responds in 2
seconds instead of 20 milliseconds, each in-flight request occupies a connection and a thread of
execution a hundred times longer. Under constant load, the number of concurrent requests in the
caller grows until the pool is exhausted — and from then on it stops serving everything, including
what does not depend on that call.

That is how a localized failure becomes a total one, and it is why "no timeout" is an architectural
defect and not a configuration detail.

### Name the degradation of each component

```text
component          if it goes down, the system...
cache              goes to the database; latency rises, it works
read replica       reads from the primary; latency rises
primary            writes fail; reads keep working
queue              events pile up; processing is delayed
external service   trips the circuit breaker; uses a fallback or refuses
                   explicitly
search index       search unavailable; navigation works
```

A table like that, said out loud in a minute, covers the entire reliability phase and is more
informative than any discussion of mechanisms.

### Distinguish what can degrade from what cannot

```text
can degrade     search, recommendation, analytics, notification
cannot          the system's core operation
```

Recognizing that there is a core with no possible degradation is mature. In a payment system, there
is no degraded mode for authorization: either the ledger records it, or the operation is refused.
See the [payments case study](/21-case-studies/payments.md).

Saying "there is no degradation here; the operation fails explicitly and the user is informed" is a
better answer than inventing an alternative path that would create inconsistency.

The temptation to always offer an alternative path is strong, because "the system keeps working"
sounds better than "the system refuses". But accepting an operation that cannot be completed
correctly trades a visible, short unavailability for an invisible, indefinite inconsistency — and
the second is usually far more expensive to resolve, because nobody knows when it started or how
many records it affected.

### The mechanisms, with the condition of use

```text
timeout           always; with no timeout, a slow dependency takes down
                  the caller
retry             for transient failures, with exponential backoff
                  and a limit; never for a non-idempotent operation
                  with no key
circuit breaker   when the dependency has sustained failure; avoids
                  wasting resources and gives it time to recover
bulkhead          isolate resources per dependency, so that one
                  does not consume everything
fallback          cached data, a default value, reduced
                  functionality
explicit refusal  when there is no correct alternative
```

Citing the mechanism is common; citing the condition is what demonstrates understanding. "Retry with
exponential backoff, but only for idempotent operations — for resource creation, I need an
idempotency key before I can retry" is an answer few give.

See [idempotency](/06-distributed-systems/idempotency.md) and
[retries](/06-distributed-systems/retries.md).

### Beware of retries that amplify

```text
"I'll retry three times with exponential backoff. But if the
 dependency is degraded from overload, retrying
 multiplies the load by three exactly when it is
 worst — hence the circuit breaker: above an error
 rate, I stop trying."
```

Recognizing that retries can make the problem worse is one of the most reliable signals of
operational experience.

The same reasoning applies to synchronized retries: if every client retries after exactly the same
interval, they produce waves of load instead of a smooth distribution. That is why exponential
backoff comes with random jitter — without it, the mechanism that should relieve the dependency
bombards it in regular pulses.

### What the user sees

The most forgotten and most valued part:

```text
"during the queue's unavailability, the order keeps being
 accepted and the user sees 'processing'. If it goes beyond 10 minutes,
 they get a notification with a new deadline.

 Without that, they stare at a screen that does not change and resubmit —
 which creates a duplicate."
```

Connecting the technical failure to what the person on the other side experiences is what
distinguishes someone who has operated a system in production.

And that connection frequently reveals work that was not anticipated. A flow that gains an
intermediate state needs a screen, copy, a notification and a support path for "where is my order?"
— none of that is infrastructure code, and all of it is a direct consequence of the architectural
decision. Mentioning that the consequence exists demonstrates that the candidate understands where
the system ends.

## Mental Model

**Walk the boxes and tell what the user sees.** Partial failure is more common than an outage, and
not everything can degrade.

## When to Use

- After the design and the scaling, proactively.
- Walking component by component.
- Stating the degradation and what the user sees.

## When Not to Use

**Answering only "there's a replica".**

**Considering only a complete outage.**

**Inventing degradation** where it would create inconsistency.

**Citing mechanisms** without the condition of use.

**Without saying what the user sees.**

## Alternatives

- **Pick the three most critical components** and detail only those, when time is tight.
- **Start from a scenario** — "and what if the whole region goes down?" — instead of walking through
  components.
- **Ask which failure interests** the interviewer.

## Trade-offs

| Walk through everything | Detail the critical ones |
|---|---|
| Full coverage | Depth where it matters |
| Consumes time | May leave a gap |

| Degrade | Refuse explicitly |
|---|---|
| Keeps serving | No risk of inconsistency |
| Risk of wrong data | User blocked |

## Failure Modes

**Redundancy as the answer.** Does not describe the effect.

**Only complete outage.** Ignores the most common case.

**Invented degradation.** Creates inconsistency.

**Unbounded retries.** Amplifies the overload.

**No timeout.** A slow dependency takes down the caller.

**Not telling what the user sees.**

## Common Mistakes

**Not mentioning a timeout** on any call.

**Retrying a non-idempotent operation** with no key.

**Forgetting the "slow" case**, which is the most dangerous.

**Not identifying the core** that cannot degrade.

**Proposing a fallback that returns wrong data** without indicating it to the user.

## Interview Example

**Context.** URL shortener: load balancer, service, cache, database, analytics queue.

**Proactive walkthrough, in two minutes:**

```text
"I'll walk the design.

 Cache down: the redirects go to the database. 12 thousand per
 second instead of 600 — the database cannot take it. So the
 total loss of the cache is a serious incident, not a smooth
 degradation. I mitigate with a partitioned cache, so the loss is
 partial, and with rate limiting on the database so it does not
 go down too.

 Primary database down: writes fail, reads keep going
 through the replicas and the cache. Link creation returns an
 explicit error; redirects work. That is acceptable,
 because redirecting is the critical operation.

 Replica down: reads go to the primary. Latency rises,
 it works.

 Analytics queue down: click events are lost or
 pile up, depending on the design. Since analytics tolerates
 delay and small loss, piling up is enough — and the
 redirect is not affected, because emitting the event
 is asynchronous and does not block.

 Load balancer down: nothing works. It is the single point; I mitigate
 with redundancy and DNS routing."
```

**The question that usually follows is about the slow case:**

```text
"And what if the cache gets slow instead of going down?"

"That is the worst case. A cache response in 2 seconds instead
 of 1 millisecond exhausts the service's connection pool,
 and the service stops serving everything — including
 requests that do not even depend on the cache.

 I handle it with an aggressive timeout: 50 ms for the cache. If it blows,
 I go to the database. And with a circuit breaker: if the timeout rate exceeds
 a threshold, I stop querying the cache for a few seconds,
 which gives it time to recover instead of continuing to
 receive 12 thousand requests per second while it is unwell."
```

**Likely follow-up question:** "and what if a whole region goes down?"

The correct answer recognizes that this is a cost decision, not a technical one: multi-region
replication solves it, costs more, and the availability requirement is what decides whether it is
worth it. Stating the trade-off instead of proposing the most robust solution is the mature answer.
See [cost vs. reliability](/20-trade-offs/cost-vs-reliability.md).

## Related Concepts

- [Partial Failure](/06-distributed-systems/partial-failure.md).
- [Circuit Breakers](/12-reliability/circuit-breakers.md).
- [Graceful Degradation](/12-reliability/graceful-degradation.md).
- [Communicating Trade-offs](/22-system-design-interviews/communicating-tradeoffs.md).

## Practical Exercise

Take a design and write, for each component, one line: what stops, what keeps working, and what the
user sees.

Then mark which components have no possible degradation. If they all have one, you probably invented
some.

## Interview Questions

- Why is the "slow" case more dangerous than a complete outage?
- Why can retries make an overload worse?
- How do you identify what in a system cannot degrade?

## Further Reading

- Nygard, Michael. *Release It!*. 2nd ed. Pragmatic Bookshelf, 2018.
- Beyer, Betsy et al. *Site Reliability Engineering*. O'Reilly, 2016.
- Kleppmann, Martin. *Designing Data-Intensive Applications*. O'Reilly, 2017.

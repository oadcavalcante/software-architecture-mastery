---
id: sync-vs-async
title: Synchronous vs. Asynchronous
sidebar_position: 9
description: Async buys availability with intermediate state — and intermediate state is product work.
doc_type: tradeoff
level: 5
difficulty: advanced
status: complete
objective: >
  By the end, the reader chooses the communication mode by the need for an immediate answer
  and by the cost of compounded unavailability.
prerequisites: [messaging]
related: [consistency-vs-availability, monolith-vs-microservices, strong-vs-eventual-consistency]
canonical_for: []
translated_from_version: 2
last_reviewed: 2026-08-31
---

# Synchronous vs. Asynchronous

## Overview

Synchronous communication is simple to write, simple to debug and fragile under composition.
Asynchronous is resilient and transfers complexity to the product and to operations.

```text
real axis   does the caller need the answer to proceed, and what does it cost
            to be unavailable when the dependency is down?
```

The first half eliminates most cases: if the answer is needed **now** for the user to decide,
async is not an option. The second decides the rest — and involves a number that is rarely
calculated: the compounded availability of a chain of calls.

## Problem

Each synchronous call multiplies unavailability:

```text
service A 99.9% × B 99.9% × C 99.9% × D 99.9%
= 99.6% → about 35 hours per year down
```

Four dependencies, each of them good, produce a bad result. And the effect is invisible while
each team looks only at its own number.

See [availability](/06-distributed-systems/availability.md).

Latency compounds in a similar way, and worse: means add up, but percentiles **don't**. A
chain's p99 is not the worst link's — the chance of some link falling into its own tail grows
with the number of links, and the chain's tail ends up worse than any of them in isolation. See
[latency](/06-distributed-systems/latency.md).

```text
A 20 ms + B 40 ms + C 80 ms + D 30 ms = 170 ms on the happy path
at p99, with one degraded link                  > 2 s
```

The opposite error: making asynchronous what needs an answer. A user who needs to know whether
the payment was accepted is not served by "processing, we'll let you know" — unless the
product is redesigned for that, which is real work.

## Core Concepts

### The primary test: is the answer needed now?

```text
check balance before rendering the screen        yes → synchronous
authorize payment at checkout                    yes, generally
send confirmation email                          no → asynchronous
update the search index                          no
recompute recommendations                        no
reserve a unique item in an auction              yes
generate a monthly report                        no
```

The question is about the **user or the calling process**, not about the technical design. If
there is a decision that depends on the answer, it has to arrive.

### Async creates intermediate state, and it is work

```text
order "processing"           screen, communication, expectation
completion notification      channel, delivery, idempotency
failure after acceptance     how does the customer find out? what do they do?
status lookup                endpoint, screen, support
timeout                      what happens to an order pending for 3 days?
```

None of these is infrastructure code — they are all product. Ignoring them is the most common
error in adopting async: the architecture changes, the product does not, and the user is left
with no answer.

See [eventual consistency](/06-distributed-systems/eventual-consistency.md).

### Async breaks availability coupling

The main gain, in numbers:

```text
synchronous   A depends on B being online now
              A becomes unavailable when B goes down
asynchronous  A accepts, records, and B processes when it comes back
              A stays available
```

This is decisive when the dependency is external and less reliable than the system — a partner
with 98.7% availability cannot be in the synchronous path of a system with a 99.9%
requirement.

### It also breaks scale coupling

```text
synchronous   the caller's peak becomes a peak on the callee
asynchronous  the queue absorbs it; the consumer processes at its own pace
```

This lets you size processing by the average instead of by the peak, with a direct effect on
cost — and it is frequently the strongest economic argument in favor.

See [asynchronous processing](/11-scalability/async-processing.md).

### The operational cost is real

```text
queue                  one more component to operate, monitor, size
backlog                alarm, cause, action
unprocessable messages destination, policy, reprocessing
ordering               guaranteed only per partition, if guaranteed
duplication            the consumer must be idempotent
debugging              requires correlation and distributed tracing
```

The idempotency item is mandatory and frequently forgotten: practically every messaging system
delivers at least once, which means duplicates. See
[idempotency](/06-distributed-systems/idempotency.md).

### The hybrid is the common arrangement

Few systems are entirely one mode:

```text
synchronous acceptance, asynchronous processing
  the user gets a receipt confirmation right away
  completion comes later

synchronous reads, asynchronous writes
  fast queries, queued writes

synchronous with a short deadline and an async fallback
  tries to answer in 300 ms; beyond that, accepts and notifies
```

The third pattern captures most of the benefit of both sides and is underused.

### Signs of the wrong choice

```text
too synchronous
  compounded unavailability above the requirement
  p99 dominated by one dependency
  the caller's peak taking down the callee
  a secondary service failure blocking the main operation

too asynchronous
  user not knowing the state of what they asked for
  volume of support tickets asking "where is my order?"
  flows with pending state with no deadline and no expiry
  status lookups implemented as polling loops
  debugging dominated by correlating messages
```

The "support tickets asking about state" sign is the most reliable in the second group: it
directly measures the cost of poorly designed intermediate state.

### Cost of changing your mind

```text
synchronous → asynchronous   expensive: requires changing the product, not just the code
asynchronous → synchronous   expensive in another way: reintroduces availability
                             and scale coupling
```

The asymmetry here is small, and what decides is the exposed surface: if the contract with the
consumer already promises an immediate answer, changing it requires coordinating whoever
consumes it.

That favors deciding early and explicitly, and recording the chosen mode as part of the
contract — not as an implementation detail.

## Mental Model

**Is the answer needed now?** If not, async buys availability and scale — at the price of an
intermediate state that is product work.

## When to Use

Prefer **synchronous** when:

- The answer is needed for the caller to proceed.
- The flow is short — one or two dependencies.
- The dependencies are reliable and fast.
- The operation is a query.
- The product does not accommodate intermediate state.

Prefer **asynchronous** when:

- The answer can come later.
- The dependency is external or less reliable.
- There is a large gap between peak and average.
- There are several consumers of the same event.
- The operation is slow by nature.

## When Not to Use

**Async without designing the intermediate state.**

**Async without idempotency in the consumer.**

**Synchronous in long chains**, without computing compounded availability.

**Synchronous with an external dependency** less reliable than the requirement.

**Async for a simple query** — the complexity does not pay off.

## Alternatives

- **Synchronous acceptance with asynchronous processing** — the most common hybrid and
  frequently the right one.
- **Short deadline with an async fallback** — answers fast when it can, accepts when it
  cannot.
- **Cache with asynchronous refresh** — synchronous read over data maintained in the
  background.
- **Circuit breaker with a degraded response** — keeps it synchronous and handles the failure.
  See [circuit breakers](/12-reliability/circuit-breakers.md).

The last is the cheapest alternative when the problem is only resilience and not scale.

## Trade-offs

| Synchronous | Asynchronous |
|---|---|
| Immediate answer | Availability preserved |
| Simple to debug | Absorbs peaks |
| Compounded unavailability | Intermediate state to design |
| Latency adds up | Lower perceived latency |
| No extra infrastructure | Queue to operate |

| Sync acceptance + async processing | Fully asynchronous |
|---|---|
| User gets confirmation | Even less coupling |
| Still needs notification | No immediate answer |
| Better experience | Technically simpler |

## Failure Modes

**Long synchronous chain.** Compounded availability below the requirement.

**Intermediate state not designed.** User does not know what happened.

**Non-idempotent consumer.** Duplicates become duplicated effects.

**Pending items with no expiry.** State that never resolves.

**Polling loops.** Status lookup implemented as load.

**Silent failure after acceptance.** The worst case: the system accepted and did not deliver.

## Common Mistakes

**Not computing the compounded availability** of a chain. Five synchronous dependencies at 99.9% deliver 99.5% to the user — and each individual number looked acceptable in isolation.

**Adopting async without changing the product.** The intermediate state has to exist in the interface and in the business vocabulary. Hiding it transfers the ambiguity to support.

**Forgetting idempotency.** At-least-once delivery is the default, and with no protection each redelivery repeats the effect.

**Not setting a deadline for pending state.** With no expiry, records stay pending forever and nobody knows whether they are still being processed or died.

**Making a query asynchronous.** Whoever asks needs the answer now; asynchrony is for work, not for reads.

## Real-World Example

An insurance company had a fully synchronous policy issuance flow, crossing six services —
registration, risk analysis, external bureau, pricing, issuance and notification.

Numbers over 12 months:

```text
individual availability of the 5 internal services   99.9% to 99.95%
availability of the external bureau                  98.4%
observed compounded availability                     98.1%
contractual requirement                              99.5%
issuance p99                                         7.2 s
p99.9                                                24 s
issuances lost to timeout                            ~3,200/month
```

The external bureau alone accounted for 84% of the unavailability.

The change was hybrid, not a full swing to asynchronous:

**Synchronous acceptance.** The proposal is validated and accepted in under 400 ms, with a
protocol number. The customer receives a receipt confirmation immediately.

**Asynchronous analysis.** Risk, bureau and pricing moved to the background, with retries and
exponential backoff when the bureau is down.

**Synchronous lookup kept** where the answer is needed: basic eligibility checking, which uses
only internal data.

**Intermediate state designed as product**, not as a detail:

```text
tracking screen with states named in customer language
declared deadline: "answer within 2 hours; 90% in under 5 minutes"
notification by email and in the app
maximum deadline of 24 h, with escalation to a human agent
reason for refusal explained, not just "not approved"
```

**Idempotent consumers** keyed by protocol.

**Backlog alarm** with automatic hardening: above 30 minutes of queue, new proposals get an
extended-deadline notice.

Results after 10 months:

```text
availability of the acceptance flow                  99.93%
issuances lost to timeout                            ~40/month
time to final answer, p50                            90 s
p90                                                  4 min
p99                                                  38 min
support tickets asking about state                   peaks in the first 2 months,
                                                     stabilizing at -60% after
                                                     adjustments to the tracking screen
```

The support tickets are the data point the team highlights. In the first two months they
**rose** — the intermediate state existed and the communication was not clear enough. The fix
was product-side: state names in customer language, an explicit deadline and proactive
notification.

The later assessment points out: the technical part of the migration took six weeks. The
product part — screens, copy, deadlines, escalation, refusal messaging — took four months and
had not been estimated. It is the real cost of making a flow asynchronous, and it is what the
decision must anticipate.

## Related Concepts

- [Messaging](/06-distributed-systems/messaging.md) and
  [Idempotency](/06-distributed-systems/idempotency.md).
- [Availability](/06-distributed-systems/availability.md) — the composition.
- [Strong vs. Eventual Consistency](/20-trade-offs/strong-vs-eventual-consistency.md).
- [Asynchronous Processing](/11-scalability/async-processing.md).

## Practical Exercise

Pick a flow in your system and multiply the availability of every synchronous dependency on
the path.

Compare it with the requirement. The difference is what the chain costs, and it is almost
never calculated.

## Interview Questions

- Why do four dependencies at 99.9% not produce 99.9%?
- Why is making a flow asynchronous mostly product work?
- When is the hybrid "synchronous acceptance, asynchronous processing" preferable to both
  extremes?

## Further Reading

- Hohpe, Gregor; Woolf, Bobby. *Enterprise Integration Patterns*. Addison-Wesley, 2003.
- Kleppmann, Martin. *Designing Data-Intensive Applications*. O'Reilly, 2017.
- Newman, Sam. *Building Microservices*. 2nd ed. O'Reilly, 2021.

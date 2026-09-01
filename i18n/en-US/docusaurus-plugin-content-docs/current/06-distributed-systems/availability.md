---
id: availability
title: Availability
sidebar_position: 10
description: The fraction of time the system responds correctly — and what the number hides.
doc_type: concept
level: 4
difficulty: intermediate
status: complete
objective: >
  By the end, the reader expresses availability with a declared window and criterion,
  and understands how it composes across components.
prerequisites: [partial-failure]
related: [cap, consistency, reliability-basics]
canonical_for: []
translated_from_version: 1
last_reviewed: 2026-08-31
---

# Availability

## Overview

Availability is the fraction of time the system responds correctly.

The number — "four nines" — is cited frequently and means little without three complements: **in
what window**, **measured from where**, and **what counts as a correct response**.

## Problem

"Our system has 99.9% availability" can mean very different things.

**The window changes everything.** 99.9% per month allows 43 minutes of unavailability; per year,
8.8 hours. The same number, an order of magnitude apart.

**The measurement point changes everything.** Measured at the server, the network does not count.
Measured at the client, it does — and that is what the user experiences.

**The criterion changes everything.** Does responding `500` quickly count as available? And
responding correctly in 30 seconds? A system that responds to everything with an error has 100%
"response" and 0% usefulness.

Without all three, the number is decorative.

## Core Concepts

### The table that decides the conversation

| Availability | Per month | Per year |
|---|---|---|
| 99% | 7.2 h | 3.65 days |
| 99.9% | 43 min | 8.8 h |
| 99.95% | 22 min | 4.4 h |
| 99.99% | 4.3 min | 53 min |
| 99.999% | 26 s | 5.3 min |

Each additional nine costs disproportionately more. The difference between 99.9% and 99.99% is not
10% more effort — it is frequently multi-zone redundancy, the absence of a maintenance window,
zero-downtime deployment and an operational response in minutes.

Presenting that table before asking "how many nines do you need?" changes the answer. Without it,
the answer is always the larger number.

### Availability composes multiplicatively

Components in series multiply:

```text
5 services in a chain, each at 99.9%
  → 0.999⁵ = 99.5%
  → from 43 min to 3.6 h per month
```

That is the quantitative argument against long chains of synchronous calls. See
[services](/05-system-design/services.md).

Redundant components in parallel add nines:

```text
2 independent instances at 99% each
  → 1 - (0.01)² = 99.99%
```

The word that carries that second calculation is **independent**. Two instances in the same zone,
on the same database, with the same dependency, fail together — and the multiplication does not
hold.

### Correlation is what breaks redundancy

Redundancy only delivers the gain if the failures are independent.

Common correlated failures: the same availability zone, the same database, the same code version
with the same defect, the same wrong configuration, the same external dependency, the same
certificate expiring.

Three instances with an identical code defect have the availability of one.

### Availability is not reliability

A system can be available and return wrong results. See
[reliability](/12-reliability/index.md).

A system that responds `200` with stale data is available by the metric and failing by its purpose.

### Partial availability is the common case

Systems are rarely entirely down. The usual case is a degraded feature, an affected region, a
fraction of users.

Measuring availability as a binary hides that. The better metric is the **rate of successful
requests** — which captures partial degradation and is what an
[SLI](/12-reliability/sli.md) formalizes.

### Measure from the client's side

The availability the server reports and the one the user experiences are different numbers, and the
difference is usually large.

A server metric does not see a DNS failure, an intermediate network failure, an edge failure, a
load balancer failure, or a request that never arrived. A system can record 99.99% successful
responses while a fraction of users cannot even open a connection.

The number that matters to the business is the client's. Obtaining it requires instrumentation in
the browser or the app, or external probing from the regions where the users are.

When the two numbers persistently diverge, the difference is the map of what is broken outside your
perimeter — and it is precisely the part nobody is watching.

## Mental Model

**Availability is a promise with a deadline and a criterion.** Without both, it is a number that
obliges nothing.

## When to Use

- When negotiating a requirement with the business, with the table in hand.
- When sizing redundancy.
- When evaluating the cost of a chain of synchronous calls.
- When establishing an [SLO](/12-reliability/slo.md).

## When Not to Use

**As an isolated number.** With no window and criterion, it means nothing.

**Chasing nines with no cost on the table.** The conversation has to include what each nine
requires.

**Presuming independence between replicas.** Check the correlation.

**As a binary metric.** Partial degradation is the common case.

**Promising availability higher than the dependencies'.** A system cannot be more available than the
product of its synchronous dependencies.

## Alternatives

To improve perceived availability without adding infrastructure nines:

- **Graceful degradation** — respond partially instead of failing.
- **Asynchronous** — accept and process later, instead of depending on the destination's
  availability.
- **Cache** — serve stale data when the origin is down.
- **Reduce synchronous dependencies** — the one that pays off most, and the least considered.

## Trade-offs

| More nines | Fewer |
|---|---|
| Less unavailability | More |
| The cost grows non-linearly | Low |
| Redundancy and operational complexity | Simplicity |
| Frequently requires sacrificing consistency | Consistency preserved |

The last line refers back to [CAP](/06-distributed-systems/cap.md): under a partition, availability
and consistency do not coexist.

## Failure Modes

**Correlated redundancy.** Replicas that fail together.

**A long chain.** Availability multiplied downwards.

**Availability measured in the wrong place.** The dashboard shows 99.99% and users cannot get in.

**Invisible degradation.** A binary metric does not capture it.

**An unaccounted external dependency.** The system promises more than the provider it uses.

## Common Mistakes

**Citing nines with no window.**

**Not presenting the cost before asking for the requirement.**

**Presuming independence.**

**Measuring only at the server.**

**Not counting the dependencies.** The promised availability has to fit within the product of the
synchronous dependencies.

## Real-World Example

A company promised 99.95% in a contract — 22 minutes per month.

The architecture had redundancy: three application instances, two database instances, all with
health checks and failover.

Over eight months, three incidents consumed 4 hours — far above what was promised, with contractual
consequences.

The analysis of all three showed the same pattern: **none was an instance failure**.

The first was an expired TLS certificate, present on all three instances.

The second was a wrong configuration deployed to all three simultaneously.

The third was the unavailability of an external authentication provider, called synchronously on
every request — and whose contractual availability was 99.9%, lower than what the company promised
its own customers.

The redundancy protected against the failure mode that was not happening.

The fixes attacked the correlation, not the number of instances.

Certificates got an alert 30 days in advance and automated renewal.

Deployment became gradual — one instance at a time, with a check between them — instead of
simultaneous.

And the call to the authentication provider got a validated-token cache and degradation: with the
provider down, already-established sessions keep working, and only new logins fail.

That last change alone altered the arithmetic: the system stopped depending synchronously on a
provider less available than itself.

## Related Concepts

- [CAP](/06-distributed-systems/cap.md) — the choice under a partition.
- [Consistency](/06-distributed-systems/consistency.md) — what is traded.
- [Reliability](/12-reliability/index.md) — SLI, SLO and degradation.
- [Replication](/06-distributed-systems/replication.md) — the redundancy mechanism.

## Practical Exercise

Compute your system's theoretical availability: multiply the availability of every dependency on
the synchronous path of a request.

Compare with what you promise. If the promise is higher, it has no backing.

## Interview Questions

- What is missing from "99.9% availability" for it to mean something?
- Why does redundancy not always multiply availability?
- Why is a chain of five services less available than each of them?

## Further Reading

- Beyer, Betsy et al. *Site Reliability Engineering*. O'Reilly, 2016.
- Treynor, Ben et al. *The Calculus of Service Availability*. ACM Queue, 2017.

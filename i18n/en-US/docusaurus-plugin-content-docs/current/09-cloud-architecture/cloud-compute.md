---
id: cloud-compute
title: Cloud Compute
sidebar_position: 13
description: Choosing and sizing capacity — families, purchase models and the scaling that is almost never fast enough.
doc_type: concept
level: 5
difficulty: intermediate
status: complete
objective: >
  By the end, the reader sizes based on measurement and chooses a purchase model
  by the load profile.
prerequisites: [iaas]
related: [iaas, cost-architecture, containers]
canonical_for: []
translated_from_version: 1
last_reviewed: 2026-08-31
---

# Cloud Compute

## Overview

Compute is where the code runs, and the choice has three independent dimensions: which machine **family**,
which **size**, and under which **purchase model**.

All three affect cost and performance in different ways, and getting any one wrong costs monthly.

The fourth decision — **scaling** — is what separates a system that responds to peaks from one that goes
down in them.

## Problem

Typical sizing is done out of caution: a comfortable size is chosen, with headroom, and never revisited.

The result is the industry norm: instances with utilization between 5% and 15%, paid for in full.

On the other side, undersizing leads to saturation under load — and auto scaling, which should solve it, is
usually slower than the peak.

Both come from the same absence: nobody measured.

## Core Concepts

### Family before size

Machines are optimized for different profiles:

```text
general purpose     a balance between CPU and memory
CPU-optimized       more processing per unit of memory
memory-optimized    more memory — databases, caches
I/O-optimized       fast local disk
with an accelerator specialized parallel processing
```

Choosing the wrong family is more expensive than choosing the wrong size: an application that needs memory,
in a general-purpose family, is forced to move up in size — paying for CPU it does not use — until it has
enough memory.

The guiding question: **which resource saturates first?** Measuring that before choosing resolves most of
the waste.

### Processor architecture is money left on the table

Instances with alternative-architecture processors usually deliver a better performance-to-price ratio for
common workloads — web services, applications in interpreted languages or with a virtual machine.

The barrier is binary and container image compatibility, which today is much smaller than it was.

It is one of the best-return changes available, and it usually goes untested because it requires a
different build cycle.

### The purchase models

```text
on demand      full price, no commitment, always available
commitment     a discount for a 1 to 3 year reservation, for stable load
interruptible  much cheaper, can be reclaimed with short notice
```

The practical rule that works:

**A stable base load** → a commitment. The part that always runs deserves the discount.

**Predictable variation** → on demand.

**Interruption-tolerant load** → interruptible: batch processing, transcoding, tests, model training.

Interruptible capacity is underused. Genuinely reprocessable workloads can run at a fraction of the price,
and the requirement — tolerating interruption with short notice — is the same as any system well designed
for the cloud.

### Scaling is not instantaneous

The time between the metric firing and the capacity serving traffic:

```text
metric detection           30 to 120 s (aggregation window)
provisioning               30 to 90 s
application startup        10 s to several minutes
health check               15 to 60 s
```

Total: frequently 2 to 5 minutes. Many peaks last less than that.

The ways to improve it:

**A pre-built image** with everything installed, instead of configuring at startup.

**Fast application startup.**

**Scaling on a leading metric** — queue depth, connections — instead of CPU, which reacts late.

**Scheduled scaling** for predictable peaks. It is the most effective technique and the least used: if the
peak is every Monday at 9 a.m., do not wait for the metric.

**Capacity headroom** to absorb the interval.

### Sizing requires a percentile, not an average

An instance at 20% average CPU can be at 95% at peaks. Resizing by the average produces saturation.

Correct sizing looks at the high percentile and the duration of the peaks — and considers whether scaling
covers the rest.

### Restarting needs to be routine

Instances vanish: provider maintenance, hardware failure, interruptible capacity reclaimed.

That requires graceful shutdown — stop accepting new requests, finish the ones in flight, leave the load
balancing — and no important state on a local disk.

Applications that do not do this lose requests on every scaling event, not only on failures.

## Mental Model

**Size by the resource that saturates, buy by the load profile, and scale before you need to.** The three
decisions are independent.

## When to Use

- **A commitment** for the base load that always runs.
- **On demand** for variation.
- **Interruptible** for interruption-tolerant processing.
- **Scheduled scaling** for predictable peaks.
- **Metric-based scaling** for unpredictable variation.

## When Not to Use

**Sizing out of caution.**

**A commitment before the load stabilizes.**

**Interruptible for load that does not tolerate interruption.**

**Relying on scaling for peaks of seconds.**

**Scaling on CPU** when a better leading metric exists.

**With no scaling ceiling.** A defect generates load and the bill follows.

## Alternatives

- **[Containers](/09-cloud-architecture/containers.md)** — better density, faster scaling.
- **[Serverless](/09-cloud-architecture/serverless.md)** — with no capacity to manage.
- **Vertical scaling** — a bigger instance instead of more instances; simple, with a ceiling and a restart.
- **A queue with workers** — it absorbs the peak without scaling, when the operation is asynchronous. See
  [messaging](/06-distributed-systems/messaging.md).

The last deserves emphasis: for many peaks, the right answer is not more capacity — it is not needing to
process everything at that instant.

## Trade-offs

| A bigger instance | More instances |
|---|---|
| Simple | Failure distribution |
| The largest size's ceiling | Scales beyond |
| A restart to change | No interruption |
| No coordination | State needs to go elsewhere |

| Commitment | On demand | Interruptible |
|---|---|---|
| Cheaper | Full price | Very cheap |
| A long commitment | None | It can be reclaimed |
| Stable load | Variable | Tolerant |

## Failure Modes

**Scaling too slow** for the peak.

**Oscillation.** It goes up and down repeatedly from a badly configured threshold.

**No ceiling.** Cost explodes with a defect.

**Capacity unavailable.** The region does not have the requested type at that moment.

**Interruptible capacity reclaimed** on a load that did not tolerate it.

**No graceful shutdown.** Requests lost on every event.

**A wasted commitment.** The load changed and the reservation no longer serves.

## Common Mistakes

**Not measuring before sizing.** With no CPU and memory usage profile, the sizing comes from a guess — and
the guess errs upward, because erring upward does not generate an incident.

**Sizing by the average.** The system needs to serve the peak. Sizing by the average produces degradation
exactly when there are more users.

**Not testing an alternative processor architecture.** ARM instances usually cost far less per unit of
work, and for workloads in interpreted languages or with a portable runtime the migration is an image
change.

**Scaling on CPU only.** Services limited by network waiting or by queue depth show no CPU pressure, and
auto scaling does not fire while latency rises.

**Not using scheduled scaling** for known peaks. Reactive scaling responds after the queue has already
grown. When the peak has a set time, bringing capacity up beforehand eliminates the degradation window.

**Not implementing graceful shutdown.** Without draining connections and finishing the work in flight,
every scale-down and every deployment discards in-flight requests — which appear as intermittent errors
with no apparent cause.

## Real-World Example

A ticketing platform had the classic problem: sales open at a set time, and traffic multiplies by 200 in
seconds.

Auto scaling on CPU was the strategy, and it failed every time. The peak arrived, CPU rose, the scaling
started — and five minutes later, when the capacity was ready, most of the tickets had already been sold or
the users had already given up.

The changes:

**Scheduled scaling.** Sales openings are known days in advance. The capacity came to be provisioned 20
minutes beforehand. That alone solved most of the problem, and required no new technology.

**A queue for the purchase.** The purchase confirmation became asynchronous, with a queue. The peak came to
be absorbed by the queue instead of requiring proportional capacity. See
[messaging](/06-distributed-systems/messaging.md).

**A leading metric.** For unforeseen traffic, the scaling came to look at queue depth and the number of
connections, which react before CPU.

**A pre-built image.** Startup time fell from 3 minutes to 25 seconds.

**The correct family.** The measurement showed that the application saturated memory, not CPU. Moving to a
memory-optimized family allowed halving the size with the same performance.

**Revised purchase models.** The base load on a one-year commitment; report processing and PDF ticket
generation moved to interruptible capacity.

Combined result: the system came to handle the openings with no degradation, and the monthly cost fell 38%
— despite the peak capacity having increased.

The recorded lesson: they had been trying to solve it with scaling threshold adjustments for over a year.
The answer was not in the scaling — it was in not depending on it for a scheduled event.

## Related Concepts

- [IaaS](/09-cloud-architecture/iaas.md) — the model.
- [Containers](/09-cloud-architecture/containers.md) — the packaging alternative.
- [Serverless](/09-cloud-architecture/serverless.md).
- [Cost Architecture](/09-cloud-architecture/cost-architecture.md).

## Practical Exercise

Take your production instances and compare, for each one: CPU and memory utilization at the 95th
percentile over the last 30 days.

The higher resource is what should guide the family. If both are below 30%, you are paying for capacity you
do not use.

## Interview Questions

- Why does choosing the wrong family cost more than the wrong size?
- Why does CPU-based scaling react late?
- When is scheduled scaling better than automatic?

## Further Reading

- The major providers' instance type documentation.
- Storment, J.R.; Fuller, Mike. *Cloud FinOps*. 2nd ed. O'Reilly, 2023.
- Beyer, Betsy et al. *Site Reliability Engineering*. O'Reilly, 2016.

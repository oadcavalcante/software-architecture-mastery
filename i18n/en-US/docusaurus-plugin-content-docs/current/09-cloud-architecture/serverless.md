---
id: serverless
title: Serverless
sidebar_position: 6
description: Not managing capacity — what you gain, and the four costs the initial presentation omits.
doc_type: concept
level: 5
difficulty: advanced
status: complete
objective: >
  By the end, the reader identifies the workloads where serverless pays off and
  recognizes the constraints it imposes on the design.
prerequisites: [managed-services]
related: [managed-services, containers, cost-architecture]
canonical_for: []
translated_from_version: 1
last_reviewed: 2026-08-31
---

# Serverless

## Overview

Serverless is the model in which you neither provision nor manage capacity: you write the code, the
provider executes it when there is demand, and charges for what ran.

The name is misleading — there are servers, you just do not see them. What characterizes the model is
**scaling to zero** and **charging by usage**.

It solves one specific class of problem well. And it imposes design constraints the initial presentation
does not mention, and that are the cause of most of the regret.

## Problem

An application with irregular load — occasional peaks, long idle periods — wastes in the traditional model:
the capacity stays on, waiting.

Sizing for the peak pays for idleness; sizing for the average fails at the peak. And auto scaling takes
minutes, which is longer than many peaks last.

Serverless removes the decision: there is no capacity to size.

## Core Concepts

### Scaling to zero is what defines it

With no requests, nothing runs and nothing is charged. With a thousand simultaneous requests, a thousand
executions happen.

That is qualitatively different from auto scaling, which adjusts a number of instances with a delay of
minutes. Here the response is immediate and the granularity is the request.

The economic effect is large in sporadic workloads: a process that runs once an hour for 200 milliseconds
costs almost nothing.

### The four costs

**A cold start.** When there is no instance ready, the first request pays for the initialization — from
tens of milliseconds to several seconds, depending on the language and the package size. In sporadic load,
a relevant fraction of requests pays that.

**The absence of state.** Each execution can be on a different instance. There is no memory between
requests, no reliable persistent connection, and no guaranteed local cache. See
[stateless](/05-system-design/stateless-vs-stateful.md).

**Hard limits.** A maximum execution time, maximum memory, package size, payload size. An operation that
exceeds any one of them simply does not run.

**Database connections.** Each concurrent execution can open a connection. A thousand simultaneous
executions against a relational database exhaust the connection limit — and that is the most common failure
mode of serverless with a traditional database. The solution is a connection pooler, which is
infrastructure back again.

All four are structural, not defects to be fixed.

### The economic inversion point

Serverless is cheap at low and irregular load, and expensive at high and constant load.

```text
sporadic load    serverless costs a fraction
constant load    serverless costs several times more
```

The reason: you pay a premium for not managing capacity. With high and predictable utilization, a reserved
instance is far cheaper per unit of work.

There is an inversion point, and it should be calculated before adoption. Systems that grow from sporadic
to constant cross that point without noticing. See
[cost architecture](/09-cloud-architecture/cost-architecture.md).

### What it does well

**Event-driven processing.** Reacting to an uploaded file, a message, a webhook.

**Scheduled tasks.** They replace a machine kept on to run something once a minute.

**Glue between services.** Small transformations between managed components.

**Genuinely sporadic workloads.** Internal forms, operations tooling.

**Unpredictable and short peaks.**

### What it does badly

**Requests with very low and constant latency.** The cold start makes it impossible to guarantee high
percentiles.

**Long processes.** The execution limit cuts them off.

**Persistent connections.** Streams, long-lived connections.

**High constant volume.** Cost.

**Memory- or CPU-intensive workloads** that exceed the limits.

### Serverless is not only functions

The term has grown: "serverless" databases, queues and storage follow the same logic of charging by usage
and having no capacity to manage.

Frequently those pieces pay off more than functions do — a database that scales to zero in a test
environment saves more than migrating code.

### It couples strongly

The execution model, the triggers, the event format and the permissions are provider-specific. Leaving
means rewriting the integration layer.

That is acceptable and needs to be chosen. See [vendor lock-in](/09-cloud-architecture/vendor-lock-in.md).

## Mental Model

**Serverless trades control and latency predictability for not managing capacity.** It is worth it when
capacity is the problem; it is not when latency is.

## When to Use

- Sporadic or highly variable load.
- Event-driven processing.
- Scheduled tasks.
- Short and unpredictable peaks.
- Prototypes and internal tools.
- Development environments that can scale to zero.

## When Not to Use

**Low and predictable latency as a requirement.**

**High and constant load.** Cost.

**Long processes.**

**Persistent connections or streams.**

**Against a relational database with no connection pooler.**

**When the design requires local state.**

**As an architectural default.** It is a tool for one load profile.

## Alternatives

- **[Containers](/09-cloud-architecture/containers.md) with auto scaling** — no cold start, no execution
  limit, with capacity to manage.
- **Containers that scale to zero** — platforms that combine the two models; frequently the right middle
  ground.
- **A small always-on instance** — for low but constant load, it is usually cheaper and more predictable.
- **A queue with workers** — for long-running asynchronous processing.

## Trade-offs

| Serverless | A container |
|---|---|
| No capacity to manage | To be sized |
| Scales to zero | A minimum kept on |
| A cold start | None |
| An execution limit | No practical limit |
| Expensive at constant load | Cheap |
| Coupling to the provider | Portable |
| No local state | State possible |

## Failure Modes

**A cold start at the high percentile.** The average is good and the tail is terrible.

**Database connections exhausted.**

**An execution limit cutting off the processing** — frequently with partially processed data.

**Cost exploding with growth.**

**Limited concurrency.** The provider's quota blocks the peak.

**An invocation loop.** A function that writes where it itself listens. The bill grows until somebody
notices.

**Difficult debugging.** With no persistent process to inspect.

## Common Mistakes

**Adopting it as the system's default.** It shines in intermittent load and unpredictable peaks. In a
constant-traffic service, it costs more than a reserved instance and adds limits the instance does not
have.

**Not calculating the cost inversion point.** There is a volume above which paying per invocation is more
expensive than keeping capacity on. That number is calculable in an afternoon, and it is rarely calculated.

**Connecting directly to the relational database.** Each concurrent invocation attempts its own connection,
and a thousand invocations exhaust the database's limit. A connection pooler between the two is required.

**Ignoring the cold start in the latency requirements.** The first invocation after idleness pays the whole
initialization. At high percentiles that appears as a long tail, and the p99 requirement is where it hurts.

**Not defining a concurrency ceiling or a cost alert.** The scale is practically unlimited, which means an
accidental loop scales along with it — and the limit becomes the credit card.

**Assuming state between invocations.** The environment is sometimes reused, which makes a global variable
appear to work in testing. In production, under concurrency, it leaks data from one request to another.

## Real-World Example

A media company adopted serverless for processing user-uploaded images: resizing, generating thumbnails,
extracting metadata.

An ideal case — event-driven, sporadic, short. The cost fell to around an eighth of what it was with
dedicated machines idle most of the time.

The success motivated migrating the main API too. There all four costs appeared:

**Cold starts.** The API had a 200 ms requirement at the 95th percentile. With cold starts of 1.2 to 2.8
seconds affecting between 3% and 8% of requests during low-traffic hours, the percentile blew past the
limit. Provisioned capacity solved it — and it is charged by time kept on, that is, it eliminates the
saving that motivated the migration.

**Database connections.** At a peak of 2,000 concurrent executions, the database hit the connection limit
and started refusing. A connection pooler was added — one more component to operate.

**Inverted cost.** The API had high and reasonably constant load. The monthly cost came out 3.4 times
higher than that of the previous instances.

**Debugging.** Investigating an intermittent defect became substantially harder with no persistent process
to inspect.

After seven months, the API went back to containers with auto scaling. The image processing remains
serverless to this day, and continues to be the right choice for that workload.

What the team learned: the mistake was not adopting serverless — it was generalizing from a case where it
was perfect. The two workloads have opposite profiles, and the difference was visible in the traffic data
before the migration. Nobody looked.

## Related Concepts

- [Managed Services](/09-cloud-architecture/managed-services.md) — the previous degree.
- [Containers](/09-cloud-architecture/containers.md) — the alternative.
- [Cost Architecture](/09-cloud-architecture/cost-architecture.md) — the inversion point.
- [Vendor Lock-In](/09-cloud-architecture/vendor-lock-in.md).

## Practical Exercise

Take a workload you consider a serverless candidate and plot the traffic per hour over a week.

If the graph is reasonably flat, serverless will cost more. If it has long valleys and short peaks, it is a
candidate.

## Interview Questions

- What are the model's four structural costs?
- Why does it get expensive at constant load?
- Why does serverless with a relational database require a connection pooler?

## Further Reading

- Roberts, Mike. *Serverless Architectures*. martinfowler.com, 2018.
- Sbarski, Peter. *Serverless Architectures on AWS*. 2nd ed. Manning, 2022.
- Jonas, Eric et al. *Cloud Programming Simplified: A Berkeley View on Serverless Computing*, 2019.

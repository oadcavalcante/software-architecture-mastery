---
id: distributed-tracing
title: Distributed Tracing
sidebar_position: 4
description: "Following a request through dozens of services: propagation, sampling and the cost."
doc_type: concept
level: 5
difficulty: advanced
status: complete
objective: >
  By the end, the reader implements complete propagation and chooses a sampling
  strategy that preserves what matters.
prerequisites: [traces]
related: [traces, correlation-ids, telemetry]
canonical_for: []
translated_from_version: 4
last_reviewed: 2026-08-31
---

# Distributed Tracing

## Overview

Distributed tracing is [traces](/13-observability/traces.md) crossing processes: the request enters a
service, calls others, passes through queues, and that whole path forms a single tree.

Two specific problems appear when you cross boundaries: **propagating the context** across every hop, and
**sampling**, because tracing everything is too expensive.

The sampling choice is the most consequential decision, and the most frequently made badly.

## Problem

In an architecture with dozens of services, one request can generate hundreds of spans. With thousands of
requests per second, the tracing data volume exceeds that of any other signal.

Tracing 100% is expensive: collection, network, storage, querying.

Tracing 1% at random is cheap and useless at the moment that matters: the request that failed probably was
not sampled.

The answer is not choosing between the two extremes.

## Core Concepts

### Propagation: the context travels

```text
the trace identifier   the same for the whole operation
the span identifier    the current span, which becomes the next one's parent
the sampling decision  whether this trace is being collected
```

The third part is essential and frequently forgotten: the decision needs to be **propagated**, not retaken.
If each service decides independently, the result is fragmented traces: some spans collected, others not,
and the tree incomplete.

The standardized propagation format (a header with a defined structure) resolved interoperability between
libraries and vendors. Using it is the default choice; an older proprietary format is only justified when
integrating with a system that understands nothing else.

### The hops that break

```text
HTTP                a header — simple, it works
gRPC                metadata — simple
a queue             message attributes — it needs to be explicit
a database          does not propagate — the span ends at the call
batch processing    the relationship with the origin is lost
a browser           requires client-side instrumentation
a third-party system  depends on their support
```

The queue is where most implementations break, and it is where the information would be most valuable,
because the asynchronous operation is the hardest to reconstruct manually.

See [correlation identifiers](/13-observability/correlation-ids.md).

And there is a modeling decision with queues: is the consumption a child span of the producer (which
produces very long traces) or a new trace linked by reference? The second is usually more useful
operationally.

### Sampling: the three strategies

**Head-based.** The decision is made at the entry, before knowing what will happen. Cheap, simple, and
blind: it does not know whether the request will fail or be slow.

**Tail-based.** The decision is made at the end, after knowing the outcome. It allows keeping 100% of the
errors and slow requests, and a fraction of the rest.

**Adaptive.** The rate adjusts to the volume: rare routes are sampled more, frequent routes less,
preserving coverage of all of them.

Tail-based sampling is the one that resolves the real problem, and it costs: every span needs to be
collected and held temporarily until the decision, which requires a collector with memory and the ability
to gather spans of the same trace coming from different services.

The usual combination in mature systems: head-based with a generous rate for the common volume, plus a rule
that forces the collection of errors and of marked requests.

### Force the collection when it matters

Regardless of the strategy, three cases take priority over ordinary traffic (with a rate cap, because in
the incident where errors spike, collecting 100% of them saturates the collector exactly when it is needed):

```text
errors                    always, up to the cap
latency above the limit   always, up to the cap
a marked request          a header that forces collection
```

The third is what most shortens the path to the trace of a specific case: it allows support, or a test, to generate a fully traced
request, with no dependence on luck.

### The cost needs to be sized

```text
span volume = requests/s × spans per request
1,000 req/s × 40 spans = 40,000 spans/s
```

Each span carries a name, timings, attributes and a status. At high volume, that is the system's largest
telemetry signal.

See [telemetry](/13-observability/telemetry.md). The levers: the sampling rate, span granularity, the
number of attributes, retention.

And the retention can be tiered: error and slow traces for longer, the normal ones for less.

### With no complete coverage, the value drops

A trace that crosses eight services and stops at the third (because the fourth does not propagate) shows
less than it appears: the tree looks complete and it is truncated.

That is worse than having no trace, because it induces wrong conclusions: the time "disappears" at the
point where the instrumentation ends, and the suspicion falls on the wrong service.

The adoption needs to be coordinated. Instrumenting half the services delivers far less than half the
value.

## Mental Model

**Propagate always, sample with judgment.** The sampling decision travels with the context; collecting
errors is not optional.

## When to Use

- An architecture with multiple services.
- Distributed latency investigation.
- Mapping real dependencies.
- Inherited systems with no flow documentation.
- Before decomposing a monolith, to know what calls what.

## When Not to Use

**In a single-component system.** With no process boundary there is no context to propagate; local
[traces](/13-observability/traces.md) or profiling show the same path with no collector, header or
coordinated sampling.

**With few hops, all synchronous.** Two or three services called inline, with no queue in the path:
[correlation identifiers](/13-observability/correlation-ids.md) in the logs, with each stage's duration,
reconstruct the request, and a stateful collector does not pay for itself.

**When the chain runs mostly through components you do not control**: third-party APIs, uninstrumented
clients. The trace stops at the first foreign boundary and produces exactly the truncated tree described
above; latency metrics per external dependency give the signal without pretending to be complete.

**When the telemetry budget fits neither the full collection tail-based sampling requires nor a head-based
rate high enough to catch the rare.** A low blind rate reproduces the Real-World Example below: the
instrumentation is paid for and the trace of the request that failed does not exist.

## Alternatives

- **[Correlation identifiers](/13-observability/correlation-ids.md)**: the minimal subset, far cheaper,
  with no structure and no timings.
- **[Logs](/13-observability/logs.md) with per-stage duration**: it covers part of the value.
- **[Metrics](/13-observability/metrics.md) per service pair**: they show a trend between components,
  with no individual view.
- **A service mesh**: it instruments the calls between services with no code change, covering the
  boundaries. See [service mesh](/08-integration-architecture/service-mesh.md).

The last is a cheap way of getting boundary coverage quickly, with the limitation of not seeing inside the
services.

## Trade-offs

| Tail-based sampling | Head-based |
|---|---|
| Keeps what matters | Decides blindly |
| A collector with memory and state | Simple |
| The cost of full collection | Reduced at the source |

| A high rate | Low |
|---|---|
| Broad coverage | Narrow coverage |
| Cost proportional to volume | Contained cost |
| Finds the rare | Misses the rare |

## Failure Modes

**A truncated trace.** One service does not propagate.

**The sampling decision retaken.** Fragmented traces.

**An error not sampled.** The case that matters was not collected.

**Cost exceeding the forecast.**

**Attribute cardinality.** The same problems as [metrics](/13-observability/metrics.md), applied to spans.

**A saturated collector.** Spans silently dropped.

**Divergent clocks.** Spans from different services with inconsistent timings. See
[clock and time](/06-distributed-systems/clock-and-time.md).

## Common Mistakes

**Not propagating through queues.**

**Not forcing the collection of errors.**

**Instrumenting partially and stopping.**

**Not propagating the sampling decision.**

**Not offering a way to force the collection** of a specific request.

**Not monitoring spans dropped** by the collector.

**Not sizing the cost** before turning collection on.

## Real-World Example

A mobility platform instrumented distributed tracing across 22 services, with random sampling at 1%.

For six months, the tool was considered useless by the team. The reason appeared in a retrospective:
whenever somebody investigated a specific problem, the corresponding trace did not exist, because 99% were
not collected.

The reformulation:

**Tail-based sampling**, with explicit rules: 100% of errors, 100% above the 99th latency percentile, 100%
of rare routes, and 2% of the rest.

The cost did not stay the same: storage grew about threefold (from 1% to somewhere between 3% and 5% of
traces) and collection became full up to the decision. The numbers closed by shortening the retention of
normal traces. The usefulness changed completely: the traces that existed became the ones somebody wanted
to see.

**A force-collection header**, used by support and by the integration tests. A customer reporting a problem
can have the next attempt fully traced.

**Propagation through queues**, which did not exist. Three of the 22 services were reached only by message,
and appeared disconnected. With the propagation, the tree became complete.

**The sampling decision propagated.** Before, each service decided on its own, which produced traces with
holes that looked like instrumentation problems.

Two immediate findings after the change:

**A circular dependency.** The pricing service called the routing one, which under certain conditions
called pricing. It had existed for two years and explained latency spikes nobody had diagnosed.

**Divergent clocks.** Spans from one service appeared to start before their parent started: the child
"began" before it was called. The investigation
found drift of up to 800 ms on two instances. See [clock and time](/06-distributed-systems/clock-and-time.md).

The recorded lesson: the tool had been installed and correct for six months. The sampling choice (made
with no discussion, at the default value) made it useless.

## Related Concepts

- [Traces](/13-observability/traces.md): the fundamentals.
- [Correlation Identifiers](/13-observability/correlation-ids.md): the minimal subset.
- [Telemetry](/13-observability/telemetry.md): the cost.
- [Debuggability](/13-observability/debuggability.md).

## Practical Exercise

If you use distributed tracing, check the sampling strategy and ask: are errors always collected?

Then take an operation that passes through a queue and see whether the trace crosses it. In most
implementations, it stops there.

## Interview Questions

- Why does the sampling decision need to be propagated?
- What is the difference between head-based and tail-based sampling, and what does each one cost?
- Why can partial coverage be worse than none?

## Further Reading

- Sigelman, Benjamin et al. *Dapper, a Large-Scale Distributed Systems Tracing
  Infrastructure*. Google, 2010.
- W3C Trace Context — the propagation format.
- Majors, Charity et al. *Observability Engineering*. O'Reilly, 2022.

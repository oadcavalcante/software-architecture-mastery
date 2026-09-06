---
id: traces
title: Traces
sidebar_position: 3
description: A request's anatomy — where it went and where it spent the time.
doc_type: concept
level: 5
difficulty: intermediate
status: complete
objective: >
  By the end, the reader instruments spans at a useful granularity and reads a trace
  to localize where the time was spent.
prerequisites: [observability]
related: [distributed-tracing, logs, metrics]
canonical_for: []
translated_from_version: 1
last_reviewed: 2026-08-31
---

# Traces

## Overview

A trace is the record of a request's path: where it went, in what order, and how much time it spent at each
stage.

It is composed of **spans** — units of work with a start, an end and a parent-child relationship — that
form a tree.

What it answers and the other signals do not: **where the time went**. Metrics say the request took 3
seconds; logs say it failed; the trace shows that 2.7 seconds were in a call to a service nobody suspected.

## Problem

A slow request crosses eight services. Each one has latency metrics, and all of them look normal.

The reason: the slowness is in a combination — a call that is normally fast, executed dozens of times; or a
dependency that responds well on average and badly for that type of input.

With no trace, the investigation is by elimination, service by service. With a trace, it is a
visualization.

## Core Concepts

### A span is the unit

```text
span
  name           what it represents — "check_stock"
  start and end  duration
  parent         which span it came from
  attributes     context — route, outcome, size, identifiers
  events         milestones inside the span
  status         success or error
```

The span tree shows the structure: what happened in sequence, what happened in parallel, and where the
waits are.

A span with no attributes is nearly useless — it says something took 200 ms, without saying what. The
attributes are what allow answering "why was **this** execution slow?".

### Granularity: neither too much nor too little

```text
too coarse    one span per service → you know which service, not what inside it
too fine      one span per function → thousands of spans, high cost, noise
appropriate   one span per meaningful operation
```

The practical criterion: one span for each thing that can be slow or fail independently.

```text
yes   a network call, a database query, a disk operation,
      heavy processing, acquiring a lock
no    in-memory validation, object mapping, a simple loop
```

The rule that works well: instrument the boundaries — everything that leaves the process — and the
expensive internal operations. The rest goes in as an attribute or an event on the parent span.

### Reading a trace: look for the gaps

The reading pattern that localizes problems quickly:

```text
a long span whose children sum to almost all of it  → the time is in the children, go down
a long span whose children sum to little           → the time is in it — processing,
                                                     waiting for a lock, an internal queue
many short, sequential sibling spans               → the N+1 problem
empty gaps between spans                           → uninstrumented waiting
```

The second line is the most informative: a gap between the children's sum and the parent's duration
indicates time spent on something that was not instrumented — frequently waiting for a resource, garbage
collection, or serialization.

The third reveals the N+1 problem visually, in a way no metric reveals. See
[GraphQL](/08-integration-architecture/graphql.md) and
[document databases](/07-data-architecture/document-databases.md).

### Traces and logs complement each other

```text
a trace   structure and time — where
a log     context and reason — what and why
```

Mature practice connects them: the logs carry the trace and span identifiers, and the tool allows jumping
from one to the other.

That eliminates the investigation's most tedious step — finding the logs corresponding to the trace you are
looking at. See [correlation identifiers](/13-observability/correlation-ids.md).

And, in the inverse direction, spans can carry events — timestamped records inside the span — that replace
progress logs.

### Automatic instrumentation covers most of it

Automatic instrumentation libraries create spans for common operations — HTTP calls, database queries,
queue publishing — with no code change.

That covers a good part of the value at a very low cost, and it is the right starting point.

What it does **not** do: name spans with business meaning, add domain attributes, and instrument expensive
internal operations.

The usual combination: automatic for the boundaries, manual for what matters in the domain.

### The error needs to mark the span

A span with an error status, with the exception as an event, makes failed traces findable by query.

Without that, finding "traces where something went wrong" requires inspecting each one — which nullifies
much of the usefulness.

And the status needs to propagate: a child span with an error should mark the parent, so the failure is
visible at the top of the tree.

## Mental Model

**The trace shows where the time went.** Metrics say how much, logs say why, the trace says where.

## When to Use

- Requests that cross multiple components.
- Latency investigation.
- Identifying undocumented dependencies.
- Detecting N+1 problems.
- Understanding inherited systems.

## When Not to Use

**A span per function.** Cost and noise.

**With no attributes.** A span with no context answers little.

**As a substitute for metrics** for trends.

**As a substitute for logs** for detailed context.

**Without marking errors.**

**In a single-component system**, where a local profiler resolves it better.

## Alternatives

- **A profiler** — to understand where the time goes **inside** a process. A trace shows between
  components; a profiler shows inside.
- **[Logs](/13-observability/logs.md) with per-stage duration** — the canonical event with stage timings
  covers part of the value, with no tree structure.
- **[Metrics](/13-observability/metrics.md) per dependency** — they show a trend per call, with no link to
  the individual request.
- **Continuous profiling** — stack sampling in production; it complements traces for the time inside the
  process.

## Trade-offs

| Traces | Logs |
|---|---|
| Structure and time | Context and reason |
| A tree visualization | Lines |
| Sampling is common | Frequently complete |
| A cost per span | Per line |

| Automatic instrumentation | Manual |
|---|---|
| No code change | Requires work |
| Technical names | Business meaning |
| Covers boundaries | Covers what matters |

## Failure Modes

**An incomplete trace.** One service in the chain does not propagate the context.

**Spans with no attributes.**

**The wrong granularity.** Too coarse to localize, too fine to read.

**Errors not marked.**

**Unexplained gaps.** Time between spans with no instrumentation.

**High cost from too many spans.**

**Traces with no link to logs.** Investigation across two disconnected tools.

## Common Mistakes

**Instrumenting trivial internal functions.**

**Not adding domain attributes.**

**Not marking the error status.**

**Not connecting traces to logs.**

**Depending only on automatic instrumentation.**

**Not instrumenting waits** — locks, internal queues, acquiring a connection.

## Real-World Example

A healthcare platform had a screen that took 4 seconds to load. The metrics of every service involved
showed normal latencies.

Instrumenting with traces took a week and showed the problem in the first trace inspected:

The request generated **147 spans**. The screen queried a patient's list of tests and, for each test,
fetched the corresponding laboratory — a classic N+1 problem, invisible in the metrics because each
individual call took 22 ms.

```text
query_tests          45 ms
  fetch_laboratory   22 ms   ×  146 times  = 3,212 ms
```

No metric would reveal that: the laboratories service's latency was 22 ms, excellent. The problem was the
number of calls.

The fix was a batch query: from 147 spans to 3, and from 4 seconds to 180 ms.

The instrumentation revealed three more things in the same week:

**An undocumented dependency.** One service called a legacy system nobody on the current team knew existed.

**A duplicated call.** Two layers queried the same data independently, from an incomplete refactoring
history.

**Waiting for a lock.** A 400 ms gap in a span with no children corresponded to acquiring a database
connection — the pool was undersized. See [database scaling](/11-scalability/database-scaling.md).

None of the three appeared in metrics or logs. All three were visible on the first day of tracing.

What the team records: they had mature metrics and logs, and they spent months investigating the slowness
by elimination. The trace answered in minutes because it showed the structure, which was exactly the
information that was missing.

## Related Concepts

- [Distributed Tracing](/13-observability/distributed-tracing.md) — the propagation and the sampling.
- [Logs](/13-observability/logs.md) and [Metrics](/13-observability/metrics.md) — the complements.
- [Correlation Identifiers](/13-observability/correlation-ids.md).
- [Debuggability](/13-observability/debuggability.md).

## Practical Exercise

Instrument a route in your system with traces and inspect a real trace.

Look for gaps between the parent span's duration and the children's sum — they point at time spent where
nobody is looking.

## Interview Questions

- What do traces answer that metrics and logs do not?
- How does a trace reveal the N+1 problem?
- What does a gap between parent and children indicate?

## Further Reading

- Sigelman, Benjamin et al. *Dapper, a Large-Scale Distributed Systems Tracing
  Infrastructure*. Google, 2010.
- Majors, Charity et al. *Observability Engineering*. O'Reilly, 2022.
- OpenTelemetry — the traces specification.

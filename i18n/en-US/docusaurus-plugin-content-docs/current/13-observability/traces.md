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
translated_from_version: 2
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

The third reveals the N+1 problem visually, without anyone having to foresee the question.
The per-dependency latency metric does not show it — each call is fast —; a metric of
downstream calls per request would, if someone had created it beforehand. See
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

**In a single-process system.** If the request never leaves the process except to reach
the database, a local profiler shows where the time goes at higher resolution and without
the collection, propagation and storage infrastructure a trace requires.

**With no budget for the volume.** Spans per request times requests per second give the
order of magnitude: 20 spans at 2,000 req/s are 40 thousand spans per second, over 3 billion
a day before sampling. If there is no sampling and retention decision that fits the budget,
full collection becomes the largest observability bill — see
[telemetry](/13-observability/telemetry.md) for the cost levers and
[distributed tracing](/13-observability/distributed-tracing.md) for sampling.

**On a very high-frequency hot path.** In an inner loop that runs millions of times per
second, creating and exporting a span costs on the same order as the useful work; there the
right instrument is an aggregated counter or continuous profiling.

**As a substitute for metrics** for trends and alerting: with sampling, the trace does not
count every event, and rates and percentiles computed over the sample are distorted.

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

**Instrumenting trivial internal functions.** A span per function multiplies volume and
cost, and the tree becomes unreadable: the span that matters is lost among hundreds of 1 ms
ones.

**Not adding domain attributes.** Without customer type, batch size or resource
identifier, you cannot separate the slow execution from the fast one within the same route
— the trace says it took long, not what sets it apart.

**Not marking the error status.** There is no query for "traces that failed"; finding the
failure becomes manual inspection, trace by trace.

**Not connecting traces to logs.** The trace identifier does not appear in the log, and the
investigation goes back to matching two tools by timestamp.

**Depending only on automatic instrumentation.** Spans end up with technical names — "GET",
"SELECT" — and the expensive business operation that crosses no boundary stays invisible.

**Not instrumenting waits** — locks, internal queues, acquiring a connection. The time shows
up as a gap in the parent, and whoever reads the trace has to guess what fills it.

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

The metrics the team had would not reveal that: the laboratories service's latency was 22 ms, excellent.
The problem was the number of calls, and nobody measured downstream calls per request.

The fix was a batch query: from 147 spans to 3, and from 4 seconds to about 800 ms. The ~740 ms outside
the N+1 loop remained — and part of it was the wait described just below.

The instrumentation revealed three more things in the same week:

**An undocumented dependency.** One service called a legacy system nobody on the current team knew existed.

**A duplicated call.** Two layers queried the same data independently, from an incomplete refactoring
history.

**Waiting for a lock.** A 400 ms gap in a span with no children corresponded to acquiring a database
connection — the pool was undersized. See [database scaling](/11-scalability/database-scaling.md).

None of the three appeared in the metrics and logs the team had. The third would have shown up in a
connection-pool saturation metric — one of the [golden signals](/13-observability/golden-signals.md) —, but
it did not exist; all three were visible on the first day of tracing, without anyone needing to know what
to look for.

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
- OpenTelemetry Authors. *OpenTelemetry Specification — Tracing API*, v1.0. CNCF, 2021.

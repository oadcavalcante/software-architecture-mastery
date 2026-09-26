---
id: debuggability
title: Debuggability
sidebar_position: 11
description: Answering questions nobody anticipated — the property you design into the system, not into the tool.
doc_type: concept
level: 5
difficulty: advanced
status: complete
objective: >
  By the end, the reader designs systems that emit enough context to investigate the
  unanticipated.
prerequisites: [observability]
related: [logs, traces, correlation-ids]
canonical_for: []
translated_from_version: 2
last_reviewed: 2026-08-31
---

# Debuggability

## Overview

Debuggability is the ability to answer questions about the system's behavior that **nobody anticipated**.

It is the practical difference between monitoring and observability, and it is a property of the
**system**, not of the tool: a system that emits no context does not become investigable because somebody
bought a platform.

The test: during an incident, can you formulate a new question and get the answer in minutes? Or can you
only query what was already anticipated?

## Problem

Typical instrumentation anticipates questions: error rate per service, latency per route, resource usage.

Those questions cover the anticipated incidents — which, being anticipated, have already been mitigated.
See [resilience](/12-reliability/resilience.md).

The incidents that cause damage come from unanticipated combinations, and the questions they require are
specific:

```text
"are orders from enterprise plan customers, in the southern region, with more than 5 items,
 failing since yesterday's deployment?"
```

No dashboard answers that. Either the system emits the data that allows building that query, or the
investigation stops.

## Core Concepts

### High cardinality is the requirement

The property that allows specific questions: being able to filter and group by fields with many distinct
values.

```text
low cardinality    route, status, region, version — few values
high cardinality   user, order, session, device, amount — many
```

[Metrics](/13-observability/metrics.md) pay per time series, and each distinct label value creates a
series: with high cardinality, the cost grows without bound until the system stops responding. The
constant cost that makes them cheap comes precisely from refusing those fields. See the cardinality cost
there.

That means debuggability comes from [logs](/13-observability/logs.md) and
[traces](/13-observability/traces.md), not from metrics. A system with excellent metrics and poor logs
detects problems and does not investigate them.

And it is not enough for the fields to exist: they need to be **queryable** — indexed, or in a system that
allows filtering by them without scanning everything.

### Broad context per event

The opposite of minimal instrumentation: each unit of work emits an event with **many** fields.

```text
identifiers    correlation, trace, request
who            user, organization, plan, role
what           route, operation, affected resource
outcome        success or error, specific reason
how much       total duration and per dependency, sizes, counts
where          instance, region, zone, code version
how it arrived client, app version, source
decisions      which code path, which rules applied
```

See [logs](/13-observability/logs.md) — the canonical event. Thirty or forty fields per event looks
excessive until the first investigation where the right question depends on the field nobody collected.

That context has a price, and it scales with traffic, not with the number of questions: a 40-field event
takes on the order of 1 to 2 KB, and at a thousand requests per second that is close to 130 GB per day
before any index. The order of cuts matters: first outcome-based sampling — keep every error and slow
execution, sample the successes —, then tiered retention; cutting fields or shortening hot retention
comes last, because those are exactly the failure modes below. See
[telemetry](/13-observability/telemetry.md) — the cost of observability and its levers.

The criterion is not "will this be useful?" — it is "could this distinguish this execution from another?".

### Exploring without knowing what to look for

Investigating an unanticipated problem follows a pattern:

```text
1. observe the symptom
2. formulate a hypothesis
3. test with a query
4. refine or discard
5. repeat
```

That requires being able to query arbitrarily — group by any field, compare groups, find what distinguishes
the problematic executions from the normal ones.

Tools that only display pre-configured graphs do not support that cycle. And the cycle needs to be
**fast**: if each query takes five minutes, the investigation dies from friction.

### Emit version and configuration

Two fields that resolve a high fraction of investigations and are frequently missing:

**The code version.** It allows comparing behavior between versions, and correlating with deployments.

**The effective configuration.** Which timeout value, which feature is active, which experiment variant.

With them, the question "did this start after yesterday's deployment?" becomes a query. Without them, it
becomes archaeology.

See [dashboards](/13-observability/dashboards.md) — annotating deployments resolves the version visually;
having the field resolves it analytically.

### Debuggability is designed, not bought

What the system needs to do, and no tool does for it:

```text
propagate context           see correlation identifiers
emit rich events            with the fields that distinguish executions
record decisions            which path, why
expose internal state       diagnostic endpoints, when safe
mark errors precisely       a specific reason, not "it failed"
```

The third item is the most neglected: a system that makes decisions — choosing a route, applying a rule,
selecting a variant — and does not record which one was made is opaque by construction.

### Debugging in production is not optional

Test environments do not reproduce load, data, concurrency or the real dependencies.

A fraction of problems only exists in production, and some only exist for a subset of users, under
conditions nobody can recreate.

That means the investigation tools need to work **in production**, safely:

```text
querying events             with no impact on the application
per-request debugging       activatable by header. See logs
continuous profiling        low-impact sampling
diagnostic endpoints        protected, with sanitized data
```

## Mental Model

**Events are a table; each new question is a group-by on a column.** You can only group by a column that
existed when the row was written. Metrics are that table already aggregated, with the columns chosen before
the question. The tool is the query engine; the table's schema is decided by whoever writes the code.

## When to Use

- Distributed systems with many interactions.
- Where recent incidents required questions no existing dashboard answered — the sign that the
  unanticipated ones are already the majority.
- Where investigation time has a cost.
- Systems with many customers and heterogeneous behaviors.

## When Not to Use

**A small system with few paths.** An internal tool with a few dozen users is investigated by reading the
whole log or reproducing locally; maintaining an event schema and queryable storage costs more than the
few investigations it speeds up.

**A deterministic, re-runnable batch.** If the input is preserved and the run repeats its result, running
it again under a debugger answers the question — a rich event per item pays storage for an answer the
re-run already gives.

**A hot path at extreme volume.** Where the operation costs microseconds and happens millions of times per
second, one event per operation costs more than the operation; metrics and aggressive sampling belong
there, and the rich context stays at the edge that calls it.

**When the field that distinguishes executions is sensitive data.** If it can be neither emitted nor
pseudonymized, the event does not carry it, and investigating that axis goes through controlled access to
the source data. See [data protection](/10-security/data-protection.md).

## Alternatives

There is no alternative — there are degrees:

- **Minimal correlation** — the minimum viable, far better than nothing.
- **A canonical event** — the largest capability jump per unit of effort.
- **Distributed tracing** — for structure and timing.
- **Continuous profiling** — for the time inside the process.

## Trade-offs

| High debuggability | Minimal instrumentation |
|---|---|
| New questions answered | Only the anticipated ones |
| Higher telemetry cost | Lower |
| Investigation in minutes | Hours or impossible |
| Requires emission discipline | None |

| High cardinality | Low |
|---|---|
| Filters by any field | Only the anticipated ones |
| Logs and traces | Metrics |
| A cost per event | Constant |

## Failure Modes

**A missing field.** The right question cannot be answered.

**A slow query.** The investigation dies from friction.

**Context lost on an asynchronous hop.**

**A decision not recorded.** You do not know why the system did what it did.

**Only investigable in a test environment**, where the problem does not happen.

**Sensitive data collected** to gain context.

**Short retention.** The problem was discovered after the data expired.

## Common Mistakes

**Depending on metrics** to investigate individual cases.

**Events with few fields.** Recording only the identifier and the error message to contain logging cost:
in the first investigation by segment there is no field to group by, and every hypothesis becomes manual
reading of cases — the three months of the example below.

**Not recording version and configuration.** Counting on the deployment time to infer the version: with a
gradual rollout, two versions coexist for hours, and the time no longer separates one from the other.

**Not recording the decisions made.**

**Having no way to activate detail per request.**

**Buying a tool expecting it to resolve** what the system does not emit.

## Real-World Example

A subscriptions platform had a problem that resisted for three months: around 0.3% of renewals failed, with
no apparent pattern.

The metrics showed the failure rate and nothing else. The logs recorded "failed to renew subscription" with
the subscription's identifier, and nothing else.

Each investigation attempt followed the same path: take some cases, look at the data manually, find no
pattern, give up.

The change that resolved it was not about tooling:

**A canonical event** for the renewal, with 31 fields, among them: plan, amount, payment method, country, currency,
days since the last renewal, attempt number, payment provider used, active experiment variant, code
version, region.

Two weeks after instrumenting, the first exploratory query found:

```text
group failures by payment provider and currency
  → 94% of the failures: provider B, currency different from the account's
```

The problem: subscriptions with a currency different from the account's default configuration, processed by
provider B, failed because of a rounding error in the conversion.

That was 0.3% of the total and 100% of a specific subset — invisible in any aggregation that did not
separate by provider and currency simultaneously.

No metric with that combination existed, and creating every possible combination would have exploded the
cardinality. See [metrics](/13-observability/metrics.md).

Two other findings came from the same instrumentation, in the following weeks:

**An experiment variant.** A variant active for 5% of users caused elevated latency — the experiment field
turned that into a query.

**An app version.** An old mobile app version sent a field in a different format, causing silent failures.
The client version field revealed the correlation immediately.

The recorded lesson: three months of investigation with no result, resolved in two weeks — not by a new
tool, but by the system starting to emit the fields that distinguish one execution from another.

## Related Concepts

- [Logs](/13-observability/logs.md) — the canonical event.
- [Traces](/13-observability/traces.md) — the structure.
- [Correlation Identifiers](/13-observability/correlation-ids.md).
- [Metrics](/13-observability/metrics.md) — what it does not do.

## Practical Exercise

Take your system's last incident and list the questions that were asked during the investigation.

For each one, check: did the data to answer it exist? The ones that did not point at the fields missing
from your instrumentation.

## Interview Questions

- Why is debuggability a property of the system, not of the tool?
- Why is high cardinality the central requirement?
- Why does recording the decisions made matter?

## Further Reading

- Majors, Charity et al. *Observability Engineering*. O'Reilly, 2022.
- Sridharan, Cindy. *Distributed Systems Observability*. O'Reilly, 2018.
- Beyer, Betsy et al. *Site Reliability Engineering*. O'Reilly, 2016.

---
id: logs
title: Logs
sidebar_position: 1
description: The most flexible signal and the most expensive — structured, with context, and sampled when necessary.
doc_type: concept
level: 5
difficulty: intermediate
status: complete
objective: >
  By the end, the reader emits structured logs with sufficient context and controls
  the cost without losing investigation capability.
prerequisites: [observability]
related: [metrics, traces, correlation-ids]
canonical_for: []
translated_from_version: 1
last_reviewed: 2026-08-31
---

# Logs

## Overview

Logs are records of discrete events: something happened, here is the context.

They are the most **flexible** signal — they hold any information, and they allow answering questions
nobody anticipated. And the most **expensive** — the volume grows with the traffic, and the storage and
query costs follow.

The tension between those two properties organizes every decision in this area.

## Problem

Two opposite failures, both common.

**Too much logging.** Every function records entry and exit. The volume makes querying slow and expensive,
and the relevant information gets buried in noise.

**Too little logging.** During the incident, you discover the log has the error message and no context:
which user, which order, which amount, which code path.

The answer is not a middle ground of volume. It is changing the shape: fewer lines, each with far more
context.

## Core Concepts

### Structured, not text

```text
text         2026-08-28 14:32:11 ERROR Failed to process order 4471 for customer 892
structured   {"level":"error","event":"order_failed","order_id":"4471",
              "customer_id":"892","correlation":"a3f...","reason":"insufficient_stock",
              "duration_ms":234}
```

The difference is not aesthetic. The structured one allows querying by field — every insufficient stock
error for customer 892 in the last hour — with no dependence on regular expressions over free text.

And it survives changes: adding a field does not break existing queries; rewording a text message breaks
all of them.

Structured logs are the prerequisite for everything else on this page.

### One canonical event per request

The technique that resolves the tension between volume and context:

Instead of dozens of lines throughout the processing, **one line per unit of work**, emitted at the end,
with all the accumulated context.

```text
scattered   12 lines: "starting", "querying customer", "customer ok",
            "checking stock", ... "completed"
canonical   1 line with: correlation, user, route, outcome, total duration,
            duration per stage, decisions made, dependencies called,
            code version, instance
```

The volume falls by an order of magnitude, and the investigation capability **increases** — because each
line answers "what happened in this request?" on its own, with no need to gather fragments.

It is the highest-impact change a team can make to its logs.

### Enough context to investigate without the code

The test: can somebody who did not write the code understand what happened, just by reading the log?

What needs to be there:

```text
the correlation identifier   see correlation-ids
business identifiers         order, customer, account — with no personal data
the outcome and the reason   not only "it failed"
duration                     total, and per relevant stage
version and instance         which code, where
relevant input               what caused this path
```

The **reason** field is the most valuable and the most absent. "Failed to process order" says nothing;
"insufficient stock for item 88, 2 available, 5 requested" resolves the investigation on its own.

### Levels: fewer than it seems necessary

```text
error   something failed and somebody needs to know
warn    something unexpected, handled, that may indicate a problem
info    relevant business events — the canonical one goes here
debug   detail for investigation, off by default
```

Two recurring problems:

**An error that is not an error.** A handled, expected exception recorded as an error. That pollutes the
error metric and trains the team to ignore it.

**Debug on in production.** The volume explodes, the cost explodes, and the signal is lost.

The practice that works: debug switchable **per request** or per user, with no redeployment — which allows
investigating a specific case without paying for the full volume.

### Never record sensitive data

Logs circulate widely: third-party systems, broad access inside the company, long retention.

```text
never    a password, a token, a key, a card number, a full document number
careful  a name, an email, an address, health data
```

See [data protection](/10-security/data-protection.md) and [secrets](/10-security/secrets.md).

The filtering needs to happen **at the source** — in the logging library, not in later processing. Data
that left the process has already leaked.

And the most common case: logging the complete body of failing requests. It is convenient for debugging and
it is where the sensitive data appears.

### The cost requires a decision

Log volume grows with the traffic, and the cost is collection, transport, indexing and querying.

The ways to control it, in order of preference:

**A canonical event** instead of scattered lines — it reduces volume with no loss of information.

**Intelligent sampling.** Recording 100% of errors and slow requests, and a fraction of the fast successful
ones. It preserves what matters.

**Tiered retention.** Seven days in queryable storage, ninety in cold.

**Cardinality under control.** A field with millions of distinct values makes indexing expensive.

Uniform sampling — recording 10% of everything — is the worst choice: it removes errors proportionally, and
they are rare and are what you want to investigate.

## Mental Model

**Fewer lines, more context per line.** A canonical event with thirty fields is worth more than thirty
lines with one field each.

## When to Use

- Discrete events that need rich context.
- Investigating individual cases.
- Auditing and compliance.
- Errors, with the context that explains them.
- Relevant business decisions.

## When Not to Use

**To measure a trend.** Use [metrics](/13-observability/metrics.md) — counting log lines is expensive and
imprecise.

**To measure aggregate latency.** Metrics do it better.

**Unstructured text.**

**Recording every function's entry and exit.**

**With sensitive data.**

**Debug on by default in production.**

**Uniform sampling.**

## Alternatives

- **[Metrics](/13-observability/metrics.md)** — for aggregation and trend, at a constant cost.
- **[Traces](/13-observability/traces.md)** — to understand a request's path and timing.
- **An audit event** — when the requirement is proof, not diagnosis. See
  [auditability](/10-security/auditability.md).
- **Tail-based sampling** — deciding to keep after knowing the outcome, preserving the interesting cases.

## Trade-offs

| Logs | Metrics |
|---|---|
| Rich context per event | Aggregated |
| Unanticipated questions | Only the instrumented ones |
| Cost grows with traffic | Constant cost |
| Slower querying | Fast |
| High cardinality possible | Limited |

| A canonical event | Scattered lines |
|---|---|
| One line answers everything | Gathering fragments |
| Low volume | High |
| Loses the step by step | Preserves it |

## Failure Modes

**Volume making querying unviable.**

**Insufficient context.** "Error processing" with no what and no why.

**Sensitive data recorded.**

**Cardinality blowing up the indexing cost.**

**Sampling removing the errors.**

**Retention too short.** The incident was discovered after the logs expired.

**Synchronous logging blocking the application.** Writing a log cannot be on the critical path.

## Common Mistakes

**Free-text logs.** They are neither queryable nor aggregatable; answering "how many times did this happen
for customer X" becomes a regular expression over gigabytes.

**Not using a canonical event.** Twenty lines scattered per request force you to reconstruct what happened.
One wide line per request, with everything that matters, answers most questions on its own.

**Logging with no structured reason.** With no cause field, grouping failures by reason requires
interpreting a message — and the message changes when somebody edits the text.

**Not filtering sensitive data at the source.** Once sent, the data is in the logging system for the
retention period, with broader access than the source system's. Filtering afterward does not undo it.

**Sampling uniformly.** Uniform sampling discards errors in the same proportion as successes — and it is
the errors you want to investigate. Errors deserve full sampling.

**Using logs to measure a trend.** Counting lines to know the error rate is expensive and imprecise. A log
answers about one case; a metric answers about the set.

## Real-World Example

An e-commerce platform spent a significant fraction of its infrastructure budget on logs — the second
largest item on the bill.

The volume was billions of lines per day, and queries during incidents took minutes.

The analysis showed the pattern: each request generated between 15 and 40 lines, most of them progress —
"starting", "stage completed", "calling service X".

The reformulation:

**A canonical event.** One line per request, emitted at the end, with 34 fields: correlation, user, route,
outcome, reason, total duration and duration per dependency, version, instance, relevant decisions.

The volume fell **92%**. And investigation queries got simpler, because each line answered on its own.

**Sampling by outcome.** 100% of errors, 100% of requests above the 99th latency percentile, 5% of the fast
successful ones. That removed another 70% of what remained, with no interesting case lost.

**Debug per request.** A header on the request activates detailed logging for it alone. It allows
investigating a specific case without turning debug on globally.

**Filtering at the source.** The audit found authentication tokens and customers' document numbers in error
logs, which recorded the request's complete body. The filtering came to happen in the library, with an
allowed-field list instead of a blocked one.

**Tiered retention.** 14 days queryable, 1 year in cold storage.

Result: the log cost reduced by around 85%, and the average query time during investigation went from 4
minutes to 15 seconds.

In retrospect: the expectation was having to choose between cost and investigation capability. The
canonical event improved both — because the problem was not volume of information, it was volume of lines
with little information each.

## Related Concepts

- [Metrics](/13-observability/metrics.md) — for trends.
- [Traces](/13-observability/traces.md) — for the path.
- [Correlation Identifiers](/13-observability/correlation-ids.md) — what connects them.
- [Debuggability](/13-observability/debuggability.md).

## Practical Exercise

Count how many log lines a typical request in your system generates.

Then take one of those error lines and ask: can somebody who did not write the code understand what
happened?

## Interview Questions

- Why does the canonical event reduce volume and increase investigation capability?
- Why is uniform sampling the worst choice?
- Why does sensitive data filtering need to happen at the source?

## Further Reading

- Majors, Charity et al. *Observability Engineering*. O'Reilly, 2022 — canonical events.
- Beyer, Betsy et al. *Site Reliability Engineering*. O'Reilly, 2016.
- OpenTelemetry — the logs specification.

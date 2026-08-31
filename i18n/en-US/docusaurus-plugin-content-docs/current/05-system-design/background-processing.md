---
id: background-processing
title: Background Processing
sidebar_position: 12
description: Work that happens outside the request — and how the user knows it finished.
doc_type: concept
level: 3
difficulty: intermediate
status: complete
objective: >
  By the end, the reader moves work outside the request without losing traceability
  or visibility of the result for the user.
prerequisites: [queues]
related: [queues, request-response, observability]
canonical_for: []
translated_from_version: 1
last_reviewed: 2026-08-31
---

# Background Processing

## Overview

Background processing is work executed outside the request cycle: generating a report,
processing a file, sending a thousand emails, reconciling data.

Moving work outside the request is the easy part. The part that decides whether the solution
works is **how the user and the operator know what happened**.

## Problem

An HTTP request has a practical limit of a few seconds: proxies time out, connections drop,
users give up, and the connection consumes resources the whole time.

Long work inside the request produces three known failures: a timeout midway, with no way to
know whether it completed; connections exhausted by waiting; and no way to resume what
stopped.

Moving it to the background solves all three — and creates a new problem: the work now happens
in a place nobody is watching.

## Core Concepts

### The contract with the user changes

Synchronously, the response is the result. Asynchronously, the response is **an
acknowledgment**.

The pattern that works:

```text
POST /reports            → 202 Accepted
                           { id: "abc", status: "processing" }

GET  /reports/abc        → { status: "processing", progress: 40 }
                         → { status: "completed", url: "..." }
                         → { status: "failed", error: "..." }
```

Three elements are mandatory: an identifier, a queryable state, and a representation of
failure. Without the third, work that fails simply never finishes from the user's point of
view.

### Notify instead of polling

Repeated polling works and wastes. Alternatives, depending on the case:

**Webhook** — the system notifies when it finishes. Requires the consumer to have an
endpoint.

**Persistent connection** — WebSocket or server-sent events. Good for a UI, and it creates
connection state. See
[stateless vs. stateful](/05-system-design/stateless-vs-stateful.md).

**Asynchronous notification** — email or a message. Suitable for long work, of minutes or
hours.

**Polling with a growing interval** — the simplest and frequently sufficient.

### The three triggers

**By event.** Something happened and triggers the work. It is the most common case and the
one most aligned with [queues](/05-system-design/queues.md).

**Scheduled.** Runs at defined times. The classic error here is implementing the schedule in
the service's memory — with several instances, each one fires.

**Continuous.** A consumer that keeps reading a queue.

For scheduling, the rule: **the scheduler has to be external to the service**, or there has
to be coordination via a distributed lock. A `setInterval` loop inside a service with four
instances executes four times.

### Idempotency and resumption

All background work can be executed twice — through a retry, through duplication in the
queue, through a restart midway.

For long work, resumption matters: processing 100 thousand records and failing at 80 thousand
should not start over from zero. Marking progress allows resumption — and requires the work to
be divisible.

### Observability is mandatory

The work happens far from the user. With no instrumentation, nobody knows it failed.

The minimum: start and end logs with a correlated identifier, a duration metric, success and
failure metrics, and an alert for work that does not run within the expected window.

The last is the most forgotten: scheduled work that **stops running** generates no error at
all. Silence is the symptom, and only an absence alert detects it.

## Mental Model

**Background work is a promise.** Whoever makes the promise has to give the user a way to know
whether it was kept — and the operator a way to know whether it was not.

## When to Use

- The work takes more than a few seconds.
- The user does not need the result immediately.
- The work can fail and be retried.
- You need to limit the pace — processing a thousand items without overloading an external
  service.
- The work is scheduled.

## When Not to Use

**When the user needs the result now.** Asynchrony makes nothing faster; it changes when you
respond.

**For short work.** Moving a 50 ms operation to the background adds infrastructure and
coordination latency.

**With no queryable state.** Work triggered with no way to follow it leaves the user in the
dark.

**With no observability.** Silent failure is the normal mode of poorly instrumented background
work.

**When ordering between jobs matters and there is no mechanism.** Two concurrent jobs on the
same data produce an unpredictable result.

## Alternatives

- **Synchronous** — for short work.
- **Streaming response** — returning partial results while processing, when the protocol
  allows.
- **Precomputation** — if the result is predictable, compute it before it is requested.
- **Reduce the work** — the least considered alternative: a report that takes ten minutes is
  frequently processing data nobody looks at.

## Trade-offs

| Background | Synchronous |
|---|---|
| No duration limit | Limited by the timeout |
| Retry and resumption | Starts over |
| Controllable pace | Burst |
| Two-step contract | Direct response |
| Needs queryable state | Nothing to maintain |
| Silent failure if poorly instrumented | Error visible to the user |

## Failure Modes

**Silent failure.** Nobody knows it did not run.

**Duplicated scheduling.** Multiple instances firing the same job.

**Work that never finishes.** With no timeout, a stuck job occupies a worker indefinitely.

**No failure state.** The user checks and sees "processing" forever.

**Backlog.** Jobs come in faster than they go out.

**Loss on restart.** Work in memory, with no durable queue.

## Common Mistakes

**Scheduling in the service's memory.** It vanishes on every restart and executes N times when
there are N instances — both problems appear precisely when the system grows or is deployed
more frequently.

**Not exposing a queryable state.** With no place to ask "did that job run?", the only way to
answer is to search the logs, and support comes to depend on whoever has access to them.

**Not alerting on absence of execution.** Monitoring usually watches for errors; a job that
simply stopped being triggered generates no error at all, and the discovery comes through the
effect — the report nobody received.

**Not setting a job timeout.** A stuck execution holds resources indefinitely and blocks the
following ones, turning an isolated failure into a stalled queue.

**Assuming the job runs once.** Restarts, rescheduling and overlap with the previous execution
happen. Without idempotency, each of them duplicates the effect.

## Real-World Example

An e-commerce system generated the monthly closing report inside an HTTP request. With growth,
it went from 40 seconds to 4 minutes, and the proxy timed out at 60 seconds.

The solution was to move it to the background. The first version had three problems.

**The user did not know.** The screen said "report requested" and nothing else. People clicked
several times, generating four identical reports.

**The monthly schedule duplicated.** The automatic trigger was an in-memory loop, and the
service had three instances. On the first of every month, three reports were generated
simultaneously, saturating the database.

**Failures were invisible.** Over three months, the February report was not generated — a data
error made it fail — and nobody noticed until accounting asked in April.

The fixes.

The response became a `202` with an identifier. The screen polls the state and shows progress,
and the button is disabled while one is in progress — which solved the duplication by clicking.

The schedule left the service for an external scheduler, which publishes a message to the
queue. One trigger, one consumer picks it up.

And the instrumentation: success and failure metrics, an alert if the monthly report does not
complete by 6 a.m. on the first. That alert detected two failures the following year, both
fixed the same day.

The third problem was the most expensive and the least visible. Moving work to the background
with no absence alert trades a noisy failure for a silent one.

## Related Concepts

- [Queues](/05-system-design/queues.md) — the delivery mechanism.
- [Request/Response](/05-system-design/request-response.md) — the model you leave behind.
- [Observability](/13-observability/index.md) — how to know what happened.
- [Reliability](/12-reliability/index.md) — retries and resumption.

## Practical Exercise

List your system's background jobs. For each one: is there an alert if it does **not** run? Can
the user query the state, including failure? Is it safe to execute twice?

The absence alert is the one almost nobody has, and it is the one that detects the worst kind
of failure.

## Interview Questions

- How does the contract with the user change when moving work to the background?
- Why is scheduling in the service's memory a problem?
- Which background-work failure is the hardest to detect?

## Further Reading

- Nygard, Michael. *Release It!* 2nd ed., 2018.
- Beyer, Betsy et al. *Site Reliability Engineering*. O'Reilly, 2016 — absence alerts.

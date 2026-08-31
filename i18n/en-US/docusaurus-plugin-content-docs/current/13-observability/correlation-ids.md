---
id: correlation-ids
title: Correlation Identifiers
sidebar_position: 5
description: The section's cheapest technique — and the prerequisite for investigating anything in a distributed system.
doc_type: pattern
level: 5
difficulty: intermediate
status: complete
objective: >
  By the end, the reader propagates identifiers across every hop, including the
  asynchronous ones, and includes them in every signal emitted.
prerequisites: [observability]
related: [distributed-tracing, logs, debuggability]
canonical_for: []
translated_from_version: 1
last_reviewed: 2026-08-31
---

# Correlation Identifiers

## Overview

A correlation identifier is a unique value generated at a request's entry point and **propagated** through
every component that takes part in serving it.

With it, you can gather every log, every message and every event belonging to the same operation — even if
they passed through twelve services and three queues.

It is this section's lowest-cost, highest-return technique. And it is the prerequisite for almost
everything: with no correlation, distributed system logs are collections of fragments nobody can assemble.

## Problem

A user reports that their order failed at 2:32 p.m.

With no correlation, the investigation goes like this: search the order service's logs for something at
that time; find candidates; search the payment service for nearby logs; try to match by time and by user
identifier; repeat for each service in the chain.

That takes hours, frequently does not conclude, and gets worse with volume — at peak hours, there are
hundreds of operations per second and nothing distinguishes one from another.

With correlation, it is one query.

## Core Concepts

### Generate at the edge, propagate everywhere

```text
1. the identifier is generated at the entry — the gateway, the balancer or the first service
2. it travels on every subsequent call
3. it appears in every log, high-cardinality metric and event emitted
4. it goes back to the client in the response
```

Step 4 is frequently forgotten and has high practical value: the user reporting a problem can supply the
identifier, and the investigation starts directly at the right point.

Many products display that value in error messages for that reason.

### Accept the caller's identifier

If the caller already has an identifier — because the call is part of a larger operation — it should be
reused, not replaced.

That allows correlating across organizational boundaries: a partner who sends their identifier makes the
operation traceable on both sides.

The rule: accept it if it comes; generate it if it does not. And, for safety, validate the format — an
identifier coming from outside enters logs and queries, and it is worth treating as untrusted input.

### The asynchronous hops are where the propagation breaks

Propagating on HTTP calls is simple: a header. The problem appears on the other paths:

```text
a message in a queue    the identifier goes in the message's metadata
a scheduled task        there is no originating request — generate a new one, and record the cause
batch processing        one identifier per run, plus one per item
a received webhook      the partner's identifier, if any, plus yours
background work         it inherits from whatever triggered it
```

The queue case is the most important and the most frequently omitted: the investigation chain breaks
exactly at the point where it would be hardest to reconstruct manually. See
[messaging integration](/08-integration-architecture/messaging-integration.md).

### One identifier is not enough

Mature practice uses more than one, with different purposes:

```text
a request identifier      unique per individual request
a correlation identifier  the same for the whole business operation
a session identifier      groups the user's journey
a user identifier         allows seeing everything from one person
```

The distinction between the first two matters: one business operation can involve several requests — a
retry, a subsequent asynchronous call. The request one separates them; the correlation one gathers them.

See [distributed tracing](/13-observability/distributed-tracing.md), which formalizes that with traces and
spans.

### It needs to be in everything emitted

An identifier propagated and not recorded is useless. It needs to appear:

```text
in every application log
in errors returned to the client
in published messages
in the gateway's and the balancer's access logs
in audit events
```

That is easier to guarantee through infrastructure than through discipline: a context that follows the
execution and a logging library that includes it automatically eliminate the forgetting.

Teams that depend on each developer remembering to include it have partial coverage — and the missing part
is always the one that is missed.

### Do not put sensitive data in it

The identifier circulates widely: logs, third-party systems, error messages shown to the user, support
tickets.

Using the customer's document number or email as the identifier spreads personal data across all that
surface. See [data protection](/10-security/data-protection.md).

The identifier should be opaque and meaningless.

## Mental Model

**The identifier is the thread that stitches the fragments together.** Without it, each service tells a
separate story.

## When to Use

- Any system with more than one component.
- Asynchronous communication through a queue or events.
- Integration with external systems.
- Where there is incident investigation.
- Where there is an audit requirement.

## When Not to Use

**As a business identifier.** It is operational, it is not a domain key.

**Containing personal data.**

**Generated in each service.** That produces identifiers that correlate nothing.

**Propagated only on synchronous calls.** The chain breaks at the first queue.

**Depending on discipline** instead of infrastructure.

**Without validating** the format of identifiers received from outside.

## Alternatives

- **[Distributed tracing](/13-observability/distributed-tracing.md)** — the complete version, with the
  call structure and timings. Correlation is its minimal subset.
- **Correlation by time and user** — what you do with no identifier. Slow, imprecise and unviable at
  volume.
- **A business identifier** — an order number, for example. It works for investigating that domain, and it
  does not cover what happens before it exists.

## Trade-offs

| With correlation | Without |
|---|---|
| Investigation in minutes | Hours or impossible |
| Minimal propagation cost | None |
| One field in every log | Smaller logs |
| Requires discipline or infrastructure | Nothing |

| One identifier | Several |
|---|---|
| Simple | Distinguishes a request from an operation |
| Does not separate retries | Separates them |

## Failure Modes

**A break at the queue.** The identifier does not go in the message.

**Generated instead of propagated.** Each service creates its own.

**Absent from some logs.** The chain has holes.

**Sensitive data in the identifier.**

**Not returned to the client.** The user cannot say which operation failed.

**An inconsistent format.** Each service uses a different header name.

**Lost in internal asynchronous processing.** Background work loses the context.

## Common Mistakes

**Propagating only over HTTP.**

**Not including it in logs automatically.**

**Using business data as the identifier.**

**Not standardizing the header name** across services.

**Not returning it to the client.**

**Not recording the cause** of work triggered with no originating request.

## Real-World Example

An insurance platform took, on average, 4 hours to investigate a customer-reported problem.

The purchase flow passed through seven services and two queues. The logs existed, with good detail, and
they did not connect.

The typical investigation: take the approximate time the customer gave, search each service, try to match
by time and by the customer's document number — which appeared in some logs and not in others.

Implementing correlation took three weeks:

**Generation at the gateway**, accepting an external identifier when present.

**A context propagated automatically** by a shared library, including the queue hops — the identifier came
to travel in the message's metadata.

**Automatic inclusion in the logs**, without depending on the developer remembering.

**Return to the client** in every response, and display in error messages.

The average investigation time fell from 4 hours to 12 minutes.

Three problems appeared during the adoption:

**Divergent header names.** Three services used different names, inherited from independent
implementations. Standardizing required a period of accepting all of them.

**Background work with no context.** Processes triggered by a scheduler had no originating request. The
solution was generating an identifier per run and explicitly recording what originated it.

**The customer's document number used as correlation** in two services — which spread personal data through
logs and through a third party's system. Replaced by an opaque identifier.

Three weeks of work eliminated, on their own, the largest source of time spent on investigation. No tool
was bought.

## Related Concepts

- [Distributed Tracing](/13-observability/distributed-tracing.md) — the complete version.
- [Logs](/13-observability/logs.md) — where the identifier needs to appear.
- [Debuggability](/13-observability/debuggability.md).
- [Auditability](/10-security/auditability.md).

## Practical Exercise

Take an error reported by a user and try to reconstruct the request's complete path through your logs.

How long it takes — and how much you can reconstruct — is the measure of your current correlation.

## Interview Questions

- Why does the propagation break most frequently on the asynchronous hops?
- What is the difference between a request identifier and a correlation identifier?
- Why should the identifier not contain business data?

## Further Reading

- Sigelman, Benjamin et al. *Dapper, a Large-Scale Distributed Systems Tracing Infrastructure*. Google,
  2010.
- W3C Trace Context — the propagation specification.
- Majors, Charity et al. *Observability Engineering*. O'Reilly, 2022.

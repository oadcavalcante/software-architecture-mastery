---
id: sequence-diagrams
title: Sequence Diagrams
sidebar_position: 7
description: Order in time — the diagram that explains behavior, not structure.
doc_type: concept
level: 5
difficulty: intermediate
status: complete
objective: >
  By the end, the reader uses sequence diagrams to explain flows that structures don't
  explain, without trying to document the whole system with them.
prerequisites: [container-diagrams]
related: [container-diagrams, data-flow-diagrams, diagram-quality]
canonical_for: []
translated_from_version: 1
last_reviewed: 2026-08-31
---

# Sequence Diagrams

## Overview

Structural diagrams show **what exists**. Sequence diagrams show **what happens, in what
order**.

That is the essential difference, and it defines the use: a sequence diagram documents a
**scenario** — a specific path through the system, from start to finish.

It is the best artifact available for explaining distributed behavior, and the worst for
describing an entire system.

## Problem

The container diagram shows that six pieces and twenty arrows exist. It doesn't answer:

```text
what happens when an order is created?
in what order do those calls occur?
what is synchronous and what is asynchronous?
where is the transaction?
what happens if payment fails in the middle?
```

Arrows in a structural diagram are **possible relationships**. A real flow traverses a
subset of them, in a specific order, with semantics the arrow does not carry.

In distributed systems, that gap is large: order, synchrony and partial failure handling
are exactly what makes the behavior difficult.

## Core Concepts

### One diagram, one scenario

```text
"order creation with payment approved"   ← a scenario
"order creation"                         ← still vague
"everything the orders system does"      ← not a scenario
```

The scenario needs a name that describes a path, including the outcome when it matters.

Exception scenarios deserve their own diagrams: "payment declined" and "payment approved"
follow paths different enough not to fit in the same drawing with conditionals.

### Participants are containers, not classes

The level of abstraction has to be explicit, and the most useful is usually the
[container](/17-architecture-documentation/container-diagrams.md) level:

```text
Portal → Orders API → Payment Service → Queue → Inventory Service
```

A sequence diagram between classes exists and serves another purpose — discussing code,
not architecture. Mixing the two in the same drawing produces the same mixed-levels
problem described in the [C4 model](/17-architecture-documentation/c4-model.md).

### Synchronous, asynchronous and response

The notation carries a distinction structural diagrams lose:

```text
solid arrow      synchronous call — the caller waits
dashed arrow     response
open arrow       asynchronous message — the sender moves on
```

That matters because the difference defines composed availability and accumulated latency.
See [messaging](/06-distributed-systems/messaging.md).

A flow with five chained synchronous calls is visually obvious in a sequence diagram, and
invisible in a structural one.

### What to do about failure

Here is this diagram's greatest value in distributed systems: it makes the **unhappy path**
drawable.

```text
what happens if the third call fails?
what has already been committed by then?
who compensates?
what does the customer receive?
```

A sequence diagram of the failure path frequently reveals that nobody knew the answer. See
[distributed transactions](/06-distributed-systems/distributed-transactions.md) and
[sagas](/06-distributed-systems/sagas.md).

### Notation in text

Sequence diagrams are the case where describing in text and generating works particularly
well:

```text
Portal ->> API: create order
API ->> Payment: authorize
Payment -->> API: approved
API -) Queue: order confirmed
API -->> Portal: 201
```

The text is legible on its own, versions well, and the automatic layout for sequences is
good — unlike that for structural diagrams. See
[living documentation](/17-architecture-documentation/living-documentation.md).

### They age per scenario

A sequence diagram's half-life is that of the flow it describes, and business flows change
slowly compared to code structure.

That makes them surprisingly durable — provided they describe the flow at container level
and not at implementation level.

### Accumulated latency becomes visible

A useful side effect: with times annotated on the messages, the diagram becomes a latency
estimate for the flow.

```text
Portal → API             5 ms
API → Authorization     80 ms   synchronous
API → Fraud check      120 ms   synchronous
API → Database          10 ms
                       ————————
                       215 ms before the first response
```

That makes discussable what was previously abstract: the two synchronous calls in the
middle account for 93% of the time, and the question "can either of them be
asynchronous?" now has a number next to it. See
[latency](/06-distributed-systems/latency.md).

## Mental Model

**One path, in time.** Structure says what exists; sequence says what happens.

## When to Use

- For flows that cross more than two containers.
- To explain asynchronous behavior.
- To document the failure path and the compensation.
- In design reviews, to discuss order and synchrony.
- When onboarding people into complex business flows.

## When Not to Use

**To describe the system.** It describes one path.

**With dozens of messages** — past twelve, readability is lost.

**With nested conditionals.** Two scenarios, two diagrams.

**For trivial two-call flows** — a sentence resolves it.

**At class level**, when the conversation is architectural.

## Alternatives

- **A numbered description in text** — for simple flows, faster to write and read.
- **[Data flow](/17-architecture-documentation/data-flow-diagrams.md)** — when the question is about the data, not
  the order.
- **A state diagram** — when the object has a lifecycle, not a path.
- **Distributed tracing** — it shows the real sequence, not the intended one. See
  [tracing](/13-observability/distributed-tracing.md).

The last deserves a note: a trace sample is a sequence diagram generated from real
behavior, and it frequently contradicts the drawn one.

## Trade-offs

| Sequence | Structural |
|---|---|
| Behavior | Structure |
| One scenario | The system |
| Shows order and synchrony | Only relationships |
| Several diagrams | One |

| Drawn | Real trace |
|---|---|
| Shows the intent | Shows what occurs |
| Legible and curated | Noisy |
| Can be wrong | Cannot be |

## Failure Modes

**A vague scenario.** "Order creation" with no outcome.

**Too many messages.** Illegible.

**Nested conditionals.** Two scenarios squeezed together.

**Only the happy path.** The failure path is what needed drawing.

**Mixed level.** Containers and classes together.

## Common Mistakes

**Documenting only the success case.** The happy path is usually obvious; the diagram's value is in showing timeouts, compensation and partial failure.

**Not distinguishing synchronous from asynchronous.** It is the information that changes the understanding of coupling and failure propagation, and it disappears when every arrow looks the same.

**Trying to cover the system with one giant sequence diagram.** It serves one specific flow. Expanded to everything, it stops being legible and stops answering any question.

**Descending to method level in an architectural discussion.** The implementation detail drowns the structural decision the conversation needed to make.

**Not comparing with the real trace.** The diagram describes the intended flow; the distributed trace shows what happens. The divergence between the two is the most useful finding.

## Real-World Example

A payments platform had a checkout flow that crossed seven services. The existing
documentation was a container diagram and a prose description.

Recurring incidents: orders charged with no confirmation, and orders confirmed with no
charge. About 40 cases a month, handled manually.

The team drew the flow as a sequence, starting with the happy path. It was correct and
revealed nothing.

Then they drew the failure paths — one diagram for each point at which a call could fail.
There were seven diagrams, and three of them could not be completed, because nobody knew
what happened:

```text
failure after authorizing payment, before writing the order   → nobody knew
failure publishing to the queue, after writing the order      → nobody knew
timeout on authorization with a late response                 → nobody knew
```

The three corresponded exactly to the patterns in the incidents.

What came out of the exercise:

**Explicit compensation** for the first case: authorization reversed when the write fails,
with a record. See
[sagas](/06-distributed-systems/sagas.md).

**Transactional publishing** for the second — write and event in the same transaction, with
publication afterwards from the table. See
[delivery guarantees](/06-distributed-systems/delivery-guarantees.md).

**Idempotency** on authorization for the third, with a key per order. See
[idempotency](/06-distributed-systems/idempotency.md).

And a practice that stuck: **every new critical flow needs a sequence diagram of the
failure path before being implemented.** The question "draw what happens if this call
fails" became part of the design review.

Incidents dropped from ~40 to under 3 a month within four months.

A detail the team records: the happy-path diagram, which already existed informally in
everyone's head, had no discovery value at all. The entire value came from the diagrams
they could not finish.

## Related Concepts

- [Container Diagrams](/17-architecture-documentation/container-diagrams.md) — the level of the participants.
- [Data Flow](/17-architecture-documentation/data-flow-diagrams.md) — the data-centered alternative.
- [Distributed Tracing](/13-observability/distributed-tracing.md) — the real sequence.
- [Sagas](/06-distributed-systems/sagas.md).

## Practical Exercise

Pick a flow in your system that crosses three or more services and draw the failure path
of each call.

If any diagram can't be finished, you have found a design gap, not a documentation gap.

## Interview Questions

- What does a sequence diagram show that a structural one does not?
- Why is the failure path worth more than the happy path?
- How does distributed tracing relate to this diagram?

## Further Reading

- Fowler, Martin. *UML Distilled*. 3rd ed. Addison-Wesley, 2003.
- Newman, Sam. *Building Microservices*. 2nd ed. O'Reilly, 2021.
- Kleppmann, Martin. *Designing Data-Intensive Applications*. O'Reilly, 2017.

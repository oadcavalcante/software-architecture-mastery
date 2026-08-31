---
id: reliability-basics
title: Reliability Fundamentals
sidebar_position: 2
description: What reliability is, what it is not, and why it is a property of the system, not of the parts.
doc_type: foundation
level: 5
difficulty: intermediate
status: complete
objective: >
  By the end, the reader distinguishes reliability from availability and reasons
  about failure as the normal case.
prerequisites: [reliability]
related: [availability-metrics, fault-tolerance, resilience]
canonical_for: []
translated_from_version: 1
last_reviewed: 2026-08-31
---

# Reliability Fundamentals

## Overview

Reliability is a system's ability to **keep delivering correct service** over time, even when parts of it
fail.

The definition contains two things that distinguish it from availability:

**Correct.** A system that responds fast and returns wrong data is not reliable, however available it may
be.

**Over time.** Reliability is a sustained property, not an instantaneous state.

## Why This Matters

Confusing reliability with availability leads to investing in the wrong place.

A system can be 99.99% available and barely reliable: it responds, and a fraction of the responses is
wrong. No availability metric captures that, and it is the kind of problem that erodes user trust faster
than unavailability.

And there is a design consequence: chasing availability with no correctness leads to degradations that
produce the wrong result — serving stale data where it cannot be stale, accepting an operation without
verifying what needed to be verified. See
[graceful degradation](/12-reliability/graceful-degradation.md).

## Core Concepts

### Fault, error and failure are different things

The classic terminology, which organizes the reasoning:

```text
fault    the cause — a defect in the code, a disk with a problem
error    the incorrect state the fault produces — a wrong value in memory
failure  the service delivered incorrectly — the user sees the problem
```

The chain does not always complete: a fault may never be activated; an error may be detected and corrected
before becoming a failure.

Reliability work acts at all three points:

```text
prevent faults    review, tests, types, verification
tolerate errors   redundancy, integrity checks, validation
contain failures  degradation, isolation, fast recovery
```

Most engineering effort goes to the first. The greatest return is usually in the third, because it works
for faults nobody anticipated.

### The system's reliability is not the parts'

A system can be more reliable than its components — if it tolerates their failure. And it can be less, if
any one's failure takes it down.

```text
with no tolerance   reliability = the product of the parts → always lower
with tolerance      reliability > any individual part
```

That is architecture's contribution: turning fallible components into a system that does not fail with
them. See [fault tolerance](/12-reliability/fault-tolerance.md).

The converse is the most common failure mode in distributed systems: dozens of individually good services,
composing a system worse than any of them, because nothing tolerates anything's failure.

### Failure is the normal case

At sufficient scale, something is always failing: a disk, an instance, a connection, a dependency.

That changes the design posture: instead of "what do we do if it fails", the question is "what do we do
**when** it fails" — and the answer needs to be in the design, not in the emergency procedure.

See [partial failure](/06-distributed-systems/partial-failure.md).

### The failure categories

Recognizing them guides the type of protection:

```text
crash            the component stops responding — the easiest to handle
omission         responds to some requests, not to others
timing           responds outside the deadline — the most damaging in practice
wrong response   returns an incorrect result — the hardest to detect
byzantine        arbitrary behavior, possibly malicious
```

The difficulty grows down the list. Redundancy handles the first well; the fourth requires semantic
verification — comparing results, validating invariants — which rarely exists.

And the third is the one that causes the most incidents: dependencies rarely stop, they get slow. See
[circuit breakers](/12-reliability/circuit-breakers.md).

### Complexity is reliability's enemy

More components, more interactions, more failure modes.

That creates a real tension with this section's techniques: redundancy, failover, circuit breakers and
bulkheads add complexity — and complexity adds failure.

A system with four badly configured protection layers can be less reliable than a simple, well-operated
one.

The criterion: each mechanism needs to be exercised and observable. A mechanism that is not verified is
complexity with no benefit. See [chaos engineering](/12-reliability/chaos-engineering.md).

### Operations are part of it

Reliability is not only a property of the software. It depends on:

```text
deployment       gradual, reversible
observability    detecting before the user does
procedures       rehearsed, up to date
people           sustainable on-call, distributed knowledge
```

A technically good system, operated by an exhausted team with no procedures, is less reliable than a
mediocre system that is well operated.

That is the component architecture influences indirectly — and that appears in most post-mortems.

## Common Mistakes

**Confusing reliability with availability.** Responding fast and wrong is not reliable.

**Investing only in prevention.** The unanticipated faults still exist.

**Presuming crash failures.** Timing failures are more common and more damaging.

**Adding mechanisms without exercising them.** Complexity with no benefit.

**Ignoring the operational component.**

**Treating failure as an exception.** At scale, it is routine.

## Real-World Example

A credit analysis platform had 99.97% availability and a problem no metric captured.

A bureau query service had a rare race condition: under high concurrency, it occasionally associated one
query's response with the wrong request.

The result: around 1 in 4,000 analyses received another person's credit history. The system responded fast,
with a success code, and the data was wrong.

That lasted fourteen months. It was discovered when a customer contested a denial and the audit compared
the data.

No availability indicator changed during the whole period — because there was no error, there was an
incorrect response.

The fixes:

**Correlation verification.** Every response came to carry the request's identifier, verified before use.
The race condition stopped being silent.

**Invariant validation.** Semantic checks — the response's document number matches the one queried, the
date of birth is plausible — applied before processing.

**A correctness indicator**, alongside the availability ones: the proportion of analyses with consistent
data, verified by sampling against the source.

**An audit trail** with the raw data received, allowing a reconstruction of what happened. See
[auditability](/10-security/auditability.md).

And, at the source, the race condition was fixed — which was the simplest work of the five.

The learning that stuck: they measured availability at four points and correctness at none. By the numbers,
the system was among the company's most reliable.

## Related Concepts

- [Availability Metrics](/12-reliability/availability-metrics.md).
- [Fault Tolerance](/12-reliability/fault-tolerance.md).
- [Resilience](/12-reliability/resilience.md).
- [Partial Failure](/06-distributed-systems/partial-failure.md).

## Practical Exercise

Ask, about your system: is there any metric that would detect it starting to return wrong responses, while
keeping the latency and the success code?

If there is not, you measure availability and not reliability.

## Interview Questions

- What is the difference between reliability and availability?
- What is the difference between a fault, an error and a failure, and how is each one handled?
- Why is a timing failure more damaging than a crash failure?

## Further Reading

- Avizienis, Algirdas et al. *Basic Concepts and Taxonomy of Dependable and Secure Computing*. IEEE TDSC,
  2004.
- Beyer, Betsy et al. *Site Reliability Engineering*. O'Reilly, 2016.
- Nygard, Michael. *Release It!*. 2nd ed. Pragmatic Bookshelf, 2018.

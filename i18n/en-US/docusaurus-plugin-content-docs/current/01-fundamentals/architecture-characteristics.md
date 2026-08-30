---
id: architecture-characteristics
title: Architecture Characteristics
sidebar_position: 19
description: The formulation that treats quality attributes as what the architecture must explicitly support.
doc_type: foundation
level: 1
difficulty: intermediate
status: complete
objective: >
  By the end, the reader selects a small number of driving architecture
  characteristics and knows why the list has to be short.
prerequisites: [quality-attributes]
related: [architecture-principles, architecture-as-decisions]
canonical_for: [architecture characteristics]
translated_from_version: 1
last_reviewed: 2026-08-30
---

# Architecture Characteristics

## Overview

Architecture characteristics are the
[quality attributes](quality-attributes.md) the architecture must explicitly
support — the ones that actually drive structural decisions.

The distinction from the older term is not one of meaning but of use: "quality
attributes" is a taxonomy; "architecture characteristics" is a selection. The
question changes from "which attributes exist?" to **"which three or four decide
this architecture?"**.

## The Problem

A system has dozens of relevant quality attributes. An architecture cannot be
driven by dozens of things.

Teams that try produce an architecture document listing fifteen characteristics as
important, and an architecture that in practice was decided by two or three —
without anyone having stated which.

The consequence is that subsequent decisions lose their criterion. Faced with a
choice between two options, there is nothing to consult. Each person applies the
characteristic they consider most relevant, and the system ends up internally
inconsistent: one part optimized for latency, another for cost, without that
divergence ever having been decided.

## Core Concepts

### Few, explicit, ranked

The practice that works: **pick at most three to five driving characteristics,
ranked**.

Three to five is not an arbitrary number. It is roughly what a team can hold in
mind while deciding, and it is small enough to force the choice — which is the
point. A list of fifteen obliges nobody to give anything up.

The ranking matters more than the list. When two characteristics conflict — and
they will — the order is what resolves it without a new meeting.

### Explicit and implicit

Some characteristics are stated by the business: availability, latency, capacity.

Others are implicit and nobody asks for them because they are presumed: security,
maintainability, deployability. Not asked for does not mean not required — it means
nobody will warn you when they are missing, until they are missing.

A gathering that captures only the explicit ones produces systems that are fast and
unavailable, or available and impossible to change.

### Every extra characteristic has a cost

Each characteristic added to the list constrains the solution space and adds
complexity.

That means the question when considering adding another one is not "is this
desirable?" — almost everything is. It is **"what am I willing to sacrifice for
it?"**. If the answer is "nothing", the characteristic does not go on the list; it
is a wish.

### Characteristics change with the context

The driving characteristics of a system in its first year — speed of change, low
cost — are rarely the ones of its fifth — availability, maintainability.

Reviewing the list periodically is what stops the architecture from staying
optimized for what used to matter. See
[architecture evolution](architecture-evolution.md).

## Why This Matters

**Because it is the criterion that resolves subsequent decisions.** With three
ranked characteristics, a choice between two options has an answer: which serves
the first one better? Without them, the choice becomes preference.

**Because the selection is a business decision, and a short list forces the
conversation.** Asking "which matters more: latency or cost?" produces a useful
answer. Asking "which attributes matter?" produces a list of everything.

**Because it makes the architecture assessable.** An architecture can be judged
against three stated characteristics. Against fifteen, it always meets some and
fails others, and there is no verdict.

## Common Mistakes

**Listing too many.** The central mistake. Fifteen prioritized characteristics is
zero prioritized characteristics.

**Not ranking them.** An unordered list resolves no conflict, and conflict is
exactly where the list would need to serve.

**Forgetting the implicit ones.** Security and maintainability are almost never
asked for and almost always required.

**Confusing them with functional requirements.** "Process payments" is not an
architecture characteristic; it is what the system does. "Process payments with a
guarantee of no duplication under failure" contains one.

**Defining them once and never revisiting.** The list ages along with the business
context, and the misalignment is silent.

**Choosing characteristics nobody measures.** A characteristic without
instrumentation is aspirational, and it degrades without warning.

## Real-World Example

Two architectures at the same company, decided with different lists.

**Authentication service.** Driving characteristics, in order: availability,
security, latency. Direct consequences: multi-zone replication, no local state,
aggressive caching of public keys, and a deliberate refusal of a real-time audit
feature that would have added a synchronous dependency.

**Management reporting service.** Driving characteristics: cost, maintainability,
correctness. Consequences: a single instance, nightly batch processing, no
redundancy, and use of a managed service that is more expensive per transaction but
far cheaper to operate.

The two architectures share no structural decision. Neither is better — each
answers its own list.

Worth noting: the second team initially proposed multi-zone replication, "for
consistency with the company standard". The question that ended the discussion was
which characteristic that served — and the answer, availability, was not on their
list. The report could be a day late with no consequence.

The short list did not prevent a bad decision by authority. It prevented one by
criterion.

## Related Concepts

- [Quality Attributes](quality-attributes.md) — the taxonomy the characteristics
  are selected from.
- [Architecture Principles](architecture-principles.md) — how characteristics
  become guidance for distributed decisions.
- [Trade-offs](../20-trade-offs/index.md) — what happens when two characteristics
  conflict.

## Practical Exercise

Pick a system you work on and write down the three driving architecture
characteristics, ranked.

Then find three structural decisions in the system and check: is each one
consistent with the order you wrote?

Where it is not, either the decision is wrong or the list is not the real one. Both
findings are valuable.

## Interview Questions

- How many architecture characteristics should a system have, and why?
- How do you decide the order between them?
- Which characteristics are required even when nobody asks for them?

## Further Exploration

- Ford, Neal; Richards, Mark. *Fundamentals of Software Architecture*. O'Reilly,
  2020 — the formulation and the selection practice.
- Bass, Len; Clements, Paul; Kazman, Rick. *Software Architecture in Practice*.
  4th ed., 2021 — quality attribute scenarios.

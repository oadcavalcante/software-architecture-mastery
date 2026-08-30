---
id: abstraction
title: Abstraction
sidebar_position: 15
description: Exposing what matters and hiding the rest — and why a bad abstraction is worse than none.
doc_type: concept
level: 1
difficulty: beginner
status: complete
objective: >
  By the end, the reader judges whether an abstraction reduces or adds
  complexity, and recognizes premature abstraction before paying for it.
prerequisites: [separation-of-concerns]
related: [complexity, coupling, modularity]
canonical_for: [abstraction]
translated_from_version: 1
last_reviewed: 2026-08-29
---

# Abstraction

## Overview

Abstraction is a representation that exposes what matters for a purpose and hides
the rest.

The criterion that separates a good abstraction from a bad one is single and
verifiable: **a good abstraction reduces what you need to know.** If using the
abstraction requires understanding what it hides, it added a layer without
removing one.

## Problem

Abstraction is the most powerful and most misapplied tool in software design,
because its cost is immediate and its benefit is hypothetical.

The cost is one more indirection: somebody will have to navigate it to understand
the flow. The benefit is the possibility of swapping the implementation — which
only materializes if the swap happens.

Teams apply abstraction reflexively, and the result is the recognizable pattern of
interfaces with one implementation, layers that merely forward calls, and generic
configuration for variation that never occurred. All the cost, none of the
benefit.

And there is a worse case: the wrong abstraction. An abstraction that does not
match the domain forces whoever uses it to fight it, and is more expensive to
remove than never creating it would have been — because now there is code
depending on it.

## Core Concepts

### The abstraction test

An abstraction is justified when whoever uses it can work **without knowing**
what is on the other side.

If the consumer needs to know the repository uses SQL in order to write the query
correctly, or that the queue is Kafka in order to handle ordering, the abstraction
is not hiding — it is merely interposing.

### Abstractions leak

Every abstraction leaks to some degree. The question is how much and where.

A repository hides the persistence technology until performance matters — then the
difference between one query and five becomes visible and the consumer needs to
know. A file system abstracts the disk until latency matters.

That does not invalidate the abstraction. It means it has to be chosen knowing
where it will leak, and that abstractions whose leak occurs in the common case are
not worth it.

### Premature abstraction is worse than duplication

An abstraction created from two similar cases frequently captures the coincidence
rather than the concept. When the third case arrives and does not fit, there are
two bad options: distort the third to make it fit, or parameterize the abstraction
until it becomes unreadable configuration.

The safer path is to wait. Duplicating two or three times is cheap and reversible;
the wrong abstraction is expensive and sticky.

### The right level of abstraction

An abstraction should sit at a consistent level. An interface that mixes
high-level operations (`processOrder`) with low-level details (`openConnection`)
forces the consumer to reason at two levels at once — which is the opposite of
what abstraction does.

## Mental Model

**An abstraction is a promise that you do not need to look at the other side.**

Every time someone has to look, the promise was broken. Counting how often that
happens is the practical measure of the abstraction's quality.

## When to Use

- When there are **multiple real implementations**, now or with reasonable
  certainty in the near future.
- When the hidden detail is genuinely irrelevant to the consumer.
- When the abstraction corresponds to a domain concept rather than a technical
  convenience.
- When it is needed for testing — replacing an external dependency is a legitimate
  reason and frequently the only one.
- When the concept has repeated three or more times and its shape has stabilized.

## When Not to Use

**When there is one implementation and no second on the horizon.** The most common
case. An interface with a single implementer is one more file and zero
flexibility.

**When the abstraction requires the consumer to know the other side.** See the test
above. An abstraction that leaks in the common case is not an abstraction.

**From two similar cases.** Wait for the third. Similarity between two cases is
frequently coincidence.

**When the domain is not yet understood.** Abstracting early freezes a provisional
model, and undoing it later is more expensive than having avoided it.

**When it adds a level without removing one.** A layer that merely forwards calls
to another is pure indirection. The test: if removing it forces no consumer to
learn anything new, it was not hiding anything.

## Alternatives

- **Temporary duplication** — cheap, reversible, and informative: the differences
  between the copies reveal what the real concept is.
- **A function instead of an interface** — when what varies is simple behaviour,
  passing a function is lighter than a hierarchy.
- **Parameterization** — when the variation is in values, not behaviour.
- **Deferring** — the most underrated alternative. An abstraction not created costs
  nothing and remains available.

## Trade-offs

The axis is **future flexibility versus present complexity**.

| More abstraction | Less abstraction |
|---|---|
| Swapping implementations is viable | Swapping requires touching consumers |
| The consumer does not see the detail | The detail is visible, sometimes usefully |
| Testing in isolation is possible | Testing carries the real dependency |
| One more level to navigate | Direct flow |
| Risk of capturing the wrong concept | No risk of a wrong abstraction |
| Cost paid now, benefit maybe | Cost paid if and when needed |

The decisive asymmetry: the cost of the abstraction is certain and immediate; the
benefit is uncertain and future. That shifts the burden of proof onto whoever
wants to abstract.

## Failure Modes

**A leaking abstraction.** The consumer needs to know what is hidden in order to
use it correctly. Common in repositories that hide SQL until the moment
performance matters.

**An abstraction of one.** An interface with one implementation, created out of
habit. Cost without benefit.

**The wrong abstraction captured early.** Every new case has to be twisted to fit.
The symptom is the proliferation of boolean parameters and special cases.

**An anaemic layer.** It exists for symmetry and merely forwards. It raises the
cost of navigation and hides nothing.

**Speculative generality.** An abstraction built for imagined requirements. It
usually guesses the axis of variation wrong, and the real requirement does not fit
when it arrives.

## Real-World Example

A team created `PaymentGateway` as an interface, with `StripeGateway` as the only
implementation, "so we can switch providers".

Three years later, the provider had never been switched. But the cost was greater
than the extra interface.

The interface exposed `charge(amount, token)`. Stripe supports delayed capture,
instalments and idempotency keys — none of which fitted that signature. Every
feature added over the three years required a decision: widen the interface (which
tied it to Stripe anyway) or bypass it (which hollowed it out).

The team did both, at different times. In the end, the interface had eleven
methods, all modelled on Stripe, and two places in the code accessed the Stripe
client directly because the interface could not accommodate them.

The abstraction would not have allowed a provider switch — it was Stripe under a
different name.

What would have worked: use the Stripe client directly, and introduce the
abstraction on the day a second provider appeared, with knowledge of both to model
it. The cost of doing that later would have been lower than the cost paid over
three years.

## Related Concepts

- [Complexity](complexity.md) — what abstraction is supposed to reduce.
- [Coupling](coupling.md) — what it redistributes.
- [Modularity](modularity.md) — where it materializes boundaries.

## Practical Exercise

List the interfaces in your system that have exactly one implementation.

For each, answer: is there a second implementation planned with a date? Is it
needed for testing? If the answer is no to both, count how many files and how much
navigation it costs.

Then pick one and remove it. Observe whether anything actually got worse.

## Interview Questions

- How do you know whether an abstraction is paying for itself?
- What is premature abstraction and why is it worse than duplication?
- When is an interface with a single implementation justified?

## Further Exploration

- Ousterhout, John. *A Philosophy of Software Design*. Yaknyam Press, 2018 — the
  concept of deep versus shallow modules.
- Spolsky, Joel. *The Law of Leaky Abstractions*, 2002.
- Hunt, Andrew; Thomas, David. *The Pragmatic Programmer*. 2nd ed., 2019 — on DRY
  as duplication of knowledge, not of text.

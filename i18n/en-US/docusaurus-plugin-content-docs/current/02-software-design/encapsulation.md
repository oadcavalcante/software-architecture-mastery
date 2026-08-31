---
id: encapsulation
title: Encapsulation
sidebar_position: 5
description: Hiding what can change — and why getters and setters on everything is the opposite of that.
doc_type: concept
level: 2
difficulty: beginner
status: complete
objective: >
  By the end, the reader assesses encapsulation by what the consumer needs to
  know, and recognizes structures that expose state under the appearance of an
  object.
prerequisites: [fundamentals]
related: [interfaces, boundaries, solid]
canonical_for: [encapsulation, information hiding]
translated_from_version: 1
last_reviewed: 2026-08-31
---

# Encapsulation

## Overview

Encapsulation is hiding decisions that can change behind an interface that does
not.

Parnas's formulation — *information hiding* — is more precise than the version
usually taught: it is not about making fields private. It is about deciding **what
the rest of the system does not need to know**, and making sure it does not.

## Problem

The dominant pattern in object-oriented code is the class with private fields and
a pair of accessors for each one.

That encapsulates nothing. A private field with public getter and setter is a
public field with three extra lines. Every decision about the internal
representation stays visible: the type, the cardinality, whether it can be null,
the very fact that the field exists.

The symptom that gives it away: whoever uses the class needs to know the call
order, or needs to validate before calling, or needs to combine several accessors
to perform one operation that makes sense in the domain. The knowledge about the
object lives outside it.

## Core Concepts

### Hide decisions, not data

The right question is not "which fields should be private?". It is **"which
decisions do I want to be able to change without telling anyone?"**

If the answer includes "the amount is stored in cents as an integer", then the
consumer cannot see that integer. If it does, switching to decimal breaks
everyone.

### The object exposes operations, not state

An encapsulated object offers what **makes sense to do with it**, not what it
contains.

```text
exposed as state             exposed as operation
────────────────────         ────────────────────
order.getStatus()            order.canBeCancelled()
order.setStatus(X)           order.cancel(reason)
order.getItems().add(i)      order.addItem(i)
```

The right column lets the object guarantee its invariants. The left one spreads
that responsibility across every caller — and one forgetting is enough.

### An invariant is what justifies it

An object with no invariant to protect does not need encapsulation. A data
structure that merely carries values — a DTO, a configuration record — can and
should be transparent.

Encapsulating what has no rule to protect is ceremony.

### Leaking by reference

Returning a mutable internal collection undoes encapsulation silently: the caller
can change it, and the class loses control over its own invariant with nothing in
the code signalling it.

The same holds for returning the persistence object, the framework's type, or
anything that ties the consumer to an internal decision.

## Mental Model

**What do I want to be able to change tomorrow without telling anyone?** That goes
inside. The rest is the contract.

## When to Use

- When the object has an invariant — a rule that must always hold.
- When the internal representation may change and there are consumers.
- When there is a sequence of operations that has to be respected.
- When the object belongs to the domain and has behaviour of its own.

## When Not to Use

**In transport structures.** DTO, API payload, configuration record. They exist to
carry data; hiding what they carry is friction with no gain.

**When there is no invariant.** An object with five independent fields and no rule
between them gains nothing from being encapsulated.

**In analysis code or scripts.** Where the lifetime is short and there is a single
consumer.

**When the encapsulation forces the consumer to fight.** If every legitimate use
requires a sequence of three calls to get what direct access would give, the
boundary is in the wrong place. The symptom is the consumer recreating the
internal state on the outside.

## Alternatives

- **An immutable type** — if the object does not change, exposing the values is
  safe and the invariant is guaranteed at construction.
- **A transparent record** — for data with no rule.
- **A value object** — encapsulates meaning without hiding value. See
  [DDD](/04-domain-driven-design/index.md).

## Trade-offs

| More encapsulation | Less |
|---|---|
| Invariant guaranteed in one place | Every caller has to respect it |
| Internal representation replaceable | An internal change breaks consumers |
| The API expresses the domain | The API expresses the structure |
| More methods to design and maintain | Direct access, less code |
| Risk of forcing artificial paths | The consumer does what it needs |

## Failure Modes

**Anemic object.** Only data and accessors; the logic that should be inside is
spread across services. Each service reimplements part of the invariant.

**Leak by mutable collection.** `getItems()` returns the internal list.

**Facade encapsulation.** Private fields, public accessors for all of them.

**Implicit sequence.** The consumer has to call `prepare()` before `execute()`, and
nothing prevents the reverse.

## Common Mistakes

**Confusing it with private fields.** The root of it.

**Generating accessors automatically for everything.** The tooling makes exactly
the wrong practice the easy one.

**Encapsulating DTOs.** Ceremony with no invariant.

**Returning mutable structures.** The most common leak and the least noticed.

**Thinking encapsulation is about security.** It is about cost of change. A private
field protects against nobody — it protects against dependency.

## Real-World Example

A `Subscription` class with `getStatus()`, `setStatus()`, `getEndDate()` and
`setEndDate()`.

The rule "a cancelled subscription cannot have its end date changed" existed — in
four different services, each checking before calling the setter. One of them did
not check.

The bug: a batch correction process changed the end date of cancelled
subscriptions, and billing went back to charging them.

The fix was not adding the check in the fourth place. It was moving the rule
inside: `subscription.extend(newDate)` throws if the status is cancelled, and the
setter stopped existing.

After that the rule held by construction, and the fifth service — written a year
later by someone else — had no way to get it wrong.

The detail that matters: the class had had private fields all along.
Encapsulation was absent even with every field private.

## Encapsulation at module scale

The same reasoning applies above the class, and that is where it pays most.

An encapsulated module publishes a narrow contract and hides everything else: its
entities, its persistence schema, its external dependencies, its internal
structure.

The symptom of an unencapsulated module is the same as that of an unencapsulated
class, at another scale: whoever uses it needs to know how it works inside. A
billing module that exposes `Invoice` with all its fields and relations forces
consumers to understand the billing model, and ties that model to them.

The practical difference between the two scales is the mechanism. In a class,
language visibility is enough. In a module, an explicit mechanism is needed —
declared module, architecture test, dependency analysis — because most languages
do not enforce package boundaries strongly enough.

See [modular design](/02-software-design/modular-design.md) for the contract and
[boundaries](/02-software-design/boundaries.md) for the mechanisms.

## Related Concepts

- [Interfaces](/02-software-design/interfaces.md) — the contract encapsulation
  exposes.
- [Abstraction](/01-fundamentals/abstraction.md) — the general principle.
- [Boundaries](/02-software-design/boundaries.md) — encapsulation at a larger
  scale.

## The anemic object and why it persists

The most common failure mode of encapsulation has its own name: the anemic domain
model. Entities reduced to fields and accessors, with all the logic in service
classes that manipulate them from outside.

It is worth understanding why it persists, because that changes how to fix it.

The first reason is tooling. Code generators, object-relational mappers and
serialization libraries have historically required a no-argument constructor and
accessors for every field. The path of least resistance produces the anemic
structure, and resisting it requires extra configuration that not every team knows
about.

The second is conceptual. Separating data from behaviour is intuitive for anyone
coming from procedural programming, and the result works — the system does what it
should. The cost does not show up as a defect; it shows up as a business rule
duplicated across several services, and as bugs where one of the places forgot to
check something.

The third is organizational. When the service is written by one person and the
entity by another, putting the rule in the service avoids a conversation. The
structure of the code comes to reflect the structure of the team's communication,
which is Conway's law operating at small scale.

The fix does not start by moving methods. It starts by listing the rules that
should always hold about the entity, and checking in how many places each one is
applied today. The numbers tend to be convincing on their own.

## Practical Exercise

Pick a domain class in your system and list the rules that should always hold
about it.

For each rule, find where it is checked. If it is outside the class, count in how
many places — and check whether all of them check.

The missing places are bugs that have not happened yet.

## Interview Questions

- What is the difference between encapsulation and private fields?
- What is an anemic object and why is it a problem?
- When should you not encapsulate?

## Further Exploration

- Parnas, David. *On the Criteria To Be Used in Decomposing Systems into Modules*.
  CACM, 1972.
- Ousterhout, John. *A Philosophy of Software Design*. Yaknyam Press, 2018 — deep
  modules.
- Fowler, Martin. *AnemicDomainModel*, 2003.

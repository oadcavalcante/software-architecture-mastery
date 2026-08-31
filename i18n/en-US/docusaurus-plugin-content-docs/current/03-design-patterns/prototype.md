---
id: prototype
title: Prototype
sidebar_position: 4
description: Creating by copying rather than by construction — and why it almost disappeared.
doc_type: pattern
level: 2
difficulty: intermediate
status: complete
objective: >
  By the end, the reader recognizes the few cases where creating by copying beats
  constructing, and the risks of a shallow copy.
prerequisites: [design-patterns]
related: [factory-method, memento, flyweight]
canonical_for: [prototype, cloning]
translated_from_version: 1
last_reviewed: 2026-08-31
---

# Prototype

## Overview

Prototype creates new objects by **copying** an existing instance, rather than
constructing them from scratch.

It is the GoF pattern that appears least in modern code, and it is worth understanding
why — as much as the cases where it is still the right answer.

## Problem

Constructing an object is expensive or complicated, and an instance in the desired state
already exists.

Three original situations:

Costly construction — the object requires a database query, a heavy computation or
reading a file, and you already have one ready.

Complex configuration — the object has thirty tuned parameters, and creating a variant
requires repeating the twenty-nine identical ones.

Type unknown at compile time — you need another object "like this one", without knowing
the concrete class.

## Core Concepts

### The cloning operation

The object knows how to copy itself. `clone()` returns an independent instance with the
same state.

The question that decides the implementation: **shallow or deep copy?**

A shallow copy duplicates the references — the original and the copy point at the same
inner objects. Altering a sub-object through the copy alters the original.

A deep copy duplicates recursively. It is correct and expensive, and it has to deal with
reference cycles.

Most of this pattern's defects come from a shallow copy where a deep one was expected.
And the right choice depends on the object: immutable parts can be shared safely; mutable
ones cannot.

### Why it almost disappeared

Three reasons.

**Immutability.** Immutable objects do not need cloning — they can be shared. Where
cloning would be used, an operation that returns a new instance with one field changed is
used instead.

**Cheap construction.** The premise that constructing is expensive rarely holds today.

**Serialization and generic copying.** Libraries perform deep copies without requiring
each class to implement cloning.

### The contract risk

An inherited cloning operation is treacherous: a subclass that adds a mutable field and
does not override the cloning produces copies that share that field. Nothing warns. It is
a [Liskov](/02-software-design/solid.md) violation the compiler does not detect.

## When to Use

- Construction is demonstrably expensive and there is a ready instance.
- Variants of an extensive configuration have to be created, changing few fields.
- The concrete type is not known, and only a reference instance is available.
- In graphical editors and modelling systems, where duplicating an element is a domain
  operation.

## When Not to Use

**When the object is immutable.** Share it. There is nothing to copy.

**When constructing is cheap.** The common case.

**When the deep copy is complex or ambiguous.** If the object holds references to
resources, connections or external identity, "copying" has no obvious meaning — and a
copy with the same identifier is a defect.

**When a copying library exists.** Implementing cloning by hand in each class is
maintenance that goes stale with every new field.

**For objects with identity.** A domain entity with an identifier should not be cloned
without handling the identifier — and forgetting that produces two entities with the same
identity.

## Alternatives

- **Immutability with derivation operations** — `order.withDiscount(x)` returns a new
  instance. It replaces the pattern in most cases.
- **[Builder](/03-design-patterns/builder.md) from an existing one** — construct a variant
  explicitly.
- **Copy by serialization** — generic, slower, with no per-class code.
- **An explicit copy function** — with no hierarchy, and the behaviour visible.

## Trade-offs

| Prototype | Construct from scratch |
|---|---|
| Avoids expensive construction | Pays for the construction |
| A variant in a few lines | Repeat the configuration |
| Independent of the concrete type | Needs to know the type |
| Risk of an inappropriate shallow copy | No such risk |
| Cloning to maintain per class | Nothing to maintain |
| Ambiguous semantics with resources | Explicit |

## Failure Modes

**Shallow copy where a deep one was expected.** The characteristic defect. It appears far
from the cloning and is hard to trace.

**A subclass that forgets to extend the cloning.** A new field silently shared.

**Duplicated identity.** An entity cloned with the same identifier.

**Reference cycle in the deep copy.** Infinite recursion, or an implementation that
handles cycles and nobody reviews.

## Common Mistakes

**Cloning an object with identity.** It needs explicit handling.

**Assuming the cloning is deep.** Check.

**Implementing by hand what a library does.** Maintenance that goes stale.

**Using cloning where immutability would do.** It is the alternative that removes the need
for the pattern.

## Real-World Example

A diagram editor needed to duplicate elements. An element has geometry, style, text,
connections and metadata — and duplicating is a domain operation, with a clear meaning for
the user.

The first implementation used a shallow copy. The defect appeared two weeks later:
changing the style of a duplicated element changed the original, because both pointed at
the same style object.

The fix was not making the copy deep everywhere. It was separating what is shareable from
what is not: style became immutable and came to be shared deliberately — which also
reduced memory, in the spirit of [Flyweight](/03-design-patterns/flyweight.md). Geometry
and text came to be copied. Connections are not copied, because a duplicated element
starts disconnected — which is the domain's rule.

The lesson is there: "deep copy" is not the right answer by default. The answer is
deciding, field by field, what duplication means in the domain.

## Where it appears in practice

**JavaScript.** The language is prototype-based: objects inherit directly from other
objects. It is the most literal example of the pattern, built into the semantics.

**Graphical editors and modelling tools.** Duplicating an element is a domain operation,
and the pattern models that directly.

**Configuration objects.** Starting from a default profile and deriving variants by
changing a few fields.

**Test frameworks.** A well-built reference object from which per-scenario variations are
derived — which is conceptually what the test builder solves, by another route.

In languages with support for immutability, the last case migrated to derivation
operations: `config.with(timeout: 30)` returns a new instance with no explicit cloning.
That is Prototype with another syntax and without the shallow-copy risk — which explains
why the named pattern disappeared while the idea remained.

## Related Concepts

- [Factory Method](/03-design-patterns/factory-method.md) — creation by construction.
- [Memento](/03-design-patterns/memento.md) — state capture, with a different purpose.
- [Flyweight](/03-design-patterns/flyweight.md) — deliberate sharing instead of copying.

## Practical Exercise

Look for cloning or copying operations in your system. For each, check field by field: is
the copy shallow or deep? Is that correct for that field?

Then ask, for each cloned object: does it have identity? If so, what happens to the
identifier in the copy?

## Interview Questions

- What is the difference between a shallow and a deep copy, and what is the risk of each?
- Why does this pattern appear so little in modern code?
- What happens when you clone an entity with an identifier?

## Further Exploration

- Gamma, Erich et al. *Design Patterns*. Addison-Wesley, 1994.
- Bloch, Joshua. *Effective Java*. 3rd ed., 2018 — on the problems of inherited cloning.

---
id: flyweight
title: Flyweight
sidebar_position: 11
description: Sharing common state across many objects — a memory optimization, with everything that implies.
doc_type: pattern
level: 2
difficulty: advanced
status: complete
objective: >
  By the end, the reader recognizes when Flyweight pays off and why it is an
  optimization that needs measurement first.
prerequisites: [design-patterns]
related: [prototype, proxy, singleton]
canonical_for: [flyweight, intrinsic state, extrinsic state]
translated_from_version: 1
last_reviewed: 2026-08-31
---

# Flyweight

## Overview

Flyweight reduces memory consumption by sharing common state across many similar
objects.

It is explicitly an **optimization**, and the only one in the GoF catalogue that is.
That changes how it should be treated: applying it without measuring first is the
mistake by definition.

## Problem

The system needs a very large number of objects, and memory does not accommodate them.

The original example is a text editor that represents each character as an object. A
document with a million characters would have a million objects, each with a font, size,
colour and position.

The observation that resolves it: **most of the state is repeated.** Thousands of
characters share the same font and size; what differs is the position and the character
itself.

## Core Concepts

### Intrinsic and extrinsic state

The separation that defines the pattern.

**Intrinsic** — independent of context, shareable. The font, the size, the colour. It
lives inside the flyweight.

**Extrinsic** — depends on the context, not shareable. The position, the index. It stays
outside and is passed as a parameter to the operations.

```text
before:  1,000,000 objects × (font + size + colour + position)
after:   50 flyweights × (font + size + colour)
       + 1,000,000 positions
```

The gain exists when the intrinsic part is large and the number of distinct combinations
is small.

### Flyweights have to be immutable

If a flyweight is shared by thousands of contexts, altering it affects all of them.
Immutability is not a recommendation here — it is a requirement.

### The hidden cost

Three costs the discussion of the pattern tends to omit.

**Indirection.** The extrinsic state becomes a parameter in every operation, which
pollutes the signatures.

**Lookup cost.** The factory that returns flyweights keeps a map. For objects that are
very cheap to create, the lookup can cost more than the creation.

**Reasoning complexity.** An object that only makes sense with external context is
harder to understand and to debug.

## When to Use

- The number of objects is very large — on the order of hundreds of thousands or more.
- Memory has been **measured** and is a real bottleneck.
- Most of the state is repeated and can be separated.
- The flyweights can be immutable.

## When Not to Use

**Without measurement.** The central mistake. Applying it in anticipation is
[premature optimization](/02-software-design/yagni.md) with a structural cost.

**When the number of objects is moderate.** A few thousand objects do not justify the
complexity on any modern platform.

**When the shareable state is small.** If the intrinsic part is one field and the
extrinsic part is ten, there is nothing to save.

**When the objects have to be mutable.** The sharing becomes a defect.

**When the language or platform already does it.** Many platforms intern strings and
cache small numbers automatically. Reimplementing is duplicated work.

## Alternatives

- **Value-oriented data structures** — arrays of primitives instead of objects, where
  the platform allows.
- **Interning** — reusing identical immutable instances, which is simplified Flyweight
  and frequently sufficient.
- **On-demand loading** — not keeping everything in memory.
- **Doing nothing** — if measurement did not point at memory as the bottleneck.

## Trade-offs

| Flyweight | Independent objects |
|---|---|
| Far less memory | Memory proportional to the count |
| Immutable state, safe to share | Each object is its own |
| Signatures polluted by extrinsic state | Clean signatures |
| Lookup cost in the factory | Direct creation |
| Harder reasoning | Self-contained object |

## Failure Modes

**Mutable flyweight.** Altering one affects thousands of contexts, and the defect
appears far away.

**Factory that grows without bound.** The flyweight map becomes a memory leak itself, if
the combinations are not genuinely few.

**Forgotten extrinsic state.** An operation uses the wrong context, and the result is
subtly incorrect.

**A gain that does not materialize.** The intrinsic part was smaller than assumed.

## Common Mistakes

**Applying it without measuring.** The mistake that defines the pattern.

**Sharing a mutable object.**

**Reimplementing what the platform already does.**

**Splitting intrinsic and extrinsic badly.** Putting something context-dependent into
the intrinsic part produces defects that are hard to trace.

## Where it appears in practice

**String interning.** The JVM keeps a pool of literals; identical strings share the same
instance. It is Flyweight built into the platform.

**Small number caching.** Java and Python keep single instances for integers in a small
range, for the same reason.

**Text rendering engines.** Glyphs and font information shared across millions of
characters — the original case.

**Game engines.** Textures, meshes and materials shared across thousands of instances;
only the transform and state are per instance.

In the first two, the pattern belongs to the platform and the programmer benefits
without knowing. In the last two, it is applied deliberately and always after a memory
profile — which is the correct order.

## Real-World Example

A mapping system rendered up to 400 thousand points of interest simultaneously. Each
point was an object with an icon, colour, size, label and coordinate.

The memory profile showed 1.2 GB in those objects alone, with garbage collection pauses
over a second.

Analysing the data revealed that there were **37 distinct combinations** of icon, colour
and size, among the 400 thousand points.

Separating the style — intrinsic, 37 instances — from the coordinate and label —
extrinsic — brought memory down to 180 MB and the pauses down to tens of milliseconds.

Two points that matter more than the gain. First: the decision was only possible because
someone **counted the distinct combinations** before implementing. Had there been 40
thousand, the pattern would have gained nothing.

Second: the signatures got worse. `draw(style, coordinate, label)` is less readable than
`point.draw()`, and the team accepted that consciously, recording the reason. It is the
pattern's trade-off, and it was paid.

## Related Concepts

- [Prototype](/03-design-patterns/prototype.md) — copying instead of sharing.
- [Singleton](/03-design-patterns/singleton.md) — a single instance, different purpose.
- [Proxy](/03-design-patterns/proxy.md) — frequently used for on-demand loading, an
  alternative to this pattern.

## Practical Exercise

If your system keeps many similar objects in memory, count how many distinct
combinations of attributes actually exist.

The ratio between the number of objects and the number of combinations is the potential
gain. Below an order of magnitude, it probably is not worth it.

## Interview Questions

- What is the difference between intrinsic and extrinsic state?
- Why do flyweights have to be immutable?
- What has to be true before applying this pattern?

## Further Exploration

- Gamma, Erich et al. *Design Patterns*. Addison-Wesley, 1994.

---
id: composition-vs-inheritance
title: Composition vs. Inheritance
sidebar_position: 10
description: Two forms of reuse with opposite costs — and why inheritance charges in the wrong place.
doc_type: concept
level: 2
difficulty: intermediate
status: complete
objective: >
  By the end, the reader chooses between composition and inheritance by the kind
  of relationship between the types, and recognizes hierarchies that break
  substitutability.
prerequisites: [encapsulation]
related: [solid, interfaces, code-smells]
canonical_for: [composition, inheritance, composition over inheritance]
translated_from_version: 1
last_reviewed: 2026-08-31
---

# Composition vs. Inheritance

## Overview

Inheritance and composition are two ways of reusing behaviour. The classic advice —
*prefer composition over inheritance* — is good and is frequently applied without
the criterion that makes it useful.

The criterion: **inheritance declares that one type is substitutable for another.
Composition declares that one type uses another.** If the substitutability is not
true, inheritance is wrong regardless of how much code it saves.

## Problem

Inheritance is attractive because it saves typing. A subclass gets everything from
the superclass for free, and the saving is immediate and visible.

The cost is neither immediate nor visible, and it comes in three forms.

**Total coupling.** The subclass depends on the superclass's implementation, not
just its interface. Internal changes in the superclass break subclasses — what
Gamma et al. call breaking encapsulation between classes.

**Axis rigidity.** A hierarchy commits to one axis of variation. If a second axis
appears later, the hierarchy explodes combinatorially or becomes a parallel
hierarchy.

**Silent violation of substitutability.** A subclass that restricts what the
superclass allows compiles, passes the tests, and breaks in production when it
arrives through an unforeseen path. It is the **L** of
[SOLID](/02-software-design/solid.md).

## Core Concepts

### The substitutability test

Before inheriting, answer: **everywhere the superclass is accepted, does the
subclass work without the caller knowing the difference?**

If the answer has exceptions, inheritance is wrong. It is not a matter of style.

The classic example: `Square` inheriting from `Rectangle`. Mathematically a square
is a rectangle. In code, `rectangle.setWidth(5)` followed by
`rectangle.setHeight(3)` produces area 15 for a rectangle and surprising behaviour
for a square. The mathematical relation does not survive mutability.

### Composition solves multiple axes

Inheritance ties you to one axis. Composition lets you combine.

```text
inheritance — 2 axes, 6 classes         composition — 2 axes, 5 pieces
──────────────────────────────          ──────────────────────────────
UrgentEmailNotifier                     Notifier(channel, priority)
NormalEmailNotifier                       channels:   Email, SMS, Push
UrgentSmsNotifier                         priorities: Urgent, Normal
NormalSmsNotifier
UrgentPushNotifier
NormalPushNotifier
```

With three axes, the hierarchy would have eighteen classes; the composition, eight
pieces. It is the difference between multiplicative and additive growth.

### Where inheritance wins

Inheritance is not always wrong. It is the right choice when:

- The relationship is genuinely subtyping, verified by the test above.
- The hierarchy is shallow — one level — and closed.
- The superclass is abstract and exists to define a contract, not to share
  implementation.

The last case is the most defensible: inheriting from an interface or a pure
abstract class is a contract declaration, and brings no coupling to implementation.

### Implementation inheritance versus interface inheritance

The distinction that dissolves much of the debate.

**Interface inheritance** — implementing a contract — is cheap and safe.
**Implementation inheritance** — inheriting code — is where the three costs appear.

The advice "prefer composition" is, in practice, "prefer composition over
implementation inheritance".

## Mental Model

**"Is a" versus "uses a" is insufficient.** The better question is: *can the caller
treat me as the base type with no caveats whatsoever?* If there is a caveat,
compose.

## When to Use

**Inheritance** when:
- Substitutability is true without exception.
- The hierarchy is shallow and the set of subtypes is known and closed.
- The superclass is abstract and defines a contract.
- The framework requires it — many do, and resisting costs more than accepting.

**Composition** for the rest, which is most cases.

## When Not to Use

**Inheritance to reuse code with no type relationship.** The dominant mistake. If
the only reason is to get the methods, compose.

**Inheritance in a deep hierarchy.** Each level multiplies the coupling to
implementation and the difficulty of tracing where a behaviour comes from.

**Inheritance with more than one axis of variation.** It explodes combinatorially.

**Composition when it produces blind delegation.** If the composing class merely
forwards twenty methods to the inner object, it is not composing — it is imitating
inheritance with more code. There, either inheritance was adequate, or the boundary
is wrong.

**Composition taken to the extreme.** A system where every behaviour is an injected
object can become as hard to follow as a deep hierarchy.

## Alternatives

- **First-class functions** — when what varies is a simple behaviour, passing a
  function is lighter than either.
- **Traits or mixins** — in languages that offer them, they sit between the two.
- **Duplication** — for two cases with superficial similarity, see
  [DRY](/02-software-design/dry.md).

## Trade-offs

| Inheritance | Composition |
|---|---|
| Less code to write | More explicit code |
| Automatic reuse | Manual delegation |
| Coupled to the base's implementation | Coupled only to the interface |
| One axis of variation | Combinable axes |
| Relationship fixed at compile time | Configurable at runtime |
| Risk of breaking substitutability | No such risk |

## Failure Modes

**Explosive hierarchy.** A second axis of variation appears and the number of
classes multiplies.

**Refusing subclass.** Overrides a method to throw — a declared Liskov violation.

**Fragile base class problem.** An internal change in the superclass breaks
subclasses that were never touched.

**Inheritance for convenience.** `UserService extends BaseService` just to get a
logging method.

**Blind delegation.** Composition that forwards everything, adding nothing.

## Real-World Example

A reporting system had `ReportBase` with `fetchData()`, `format()` and `send()`,
and eleven subclasses.

When the need arose to send the same report by email and by API, the hierarchy did
not accommodate it: sending was tied to the report type. The solution adopted was a
`deliveryType` parameter in `send()`, with a `switch`.

Six months later, formats: PDF, CSV, XLSX. A second `switch`.

In the end, `ReportBase` had 300 lines, two `switch` statements, and the eleven
subclasses overrode between one and five methods each, in ways nobody could predict
without reading all of them.

The reformulation by composition:

```text
Report(dataSource, formatter, deliveryChannel)

  sources:     11 implementations — the real variation
  formatters:   3
  channels:     2
```

Sixteen pieces instead of eleven classes with two embedded `switch` statements. And
new combinations became configuration, not code.

The detail that matters: the eleven data sources remained eleven implementations of
an interface. Contract inheritance stayed. What left was implementation
inheritance.

## A decision table

Facing a concrete choice, four questions in order:

| Question | If yes | If no |
|---|---|---|
| Does substitutability hold without exception? | continue | **compose** |
| Is there more than one axis of variation? | **compose** | continue |
| Do you want to inherit contract or implementation? | contract: **inherit** | implementation: continue |
| Is the hierarchy shallow and closed? | **inherit** | **compose** |

The first question eliminates most cases. The third is the one that saves most:
inheriting from an interface or a pure abstract class is safe; inheriting code is
not.

One edge case worth naming: **frameworks that require inheritance.** Extending a
framework base class to get its behaviour is implementation inheritance with all
its costs, and frequently there is no alternative. The mitigation is to keep that
class thin — let it be an adapter that delegates to your own code, rather than the
place where the logic lives.

## Related Concepts

- [SOLID](/02-software-design/solid.md) — the Liskov substitution principle.
- [Encapsulation](/02-software-design/encapsulation.md) — what implementation
  inheritance breaks.
- [Interfaces](/02-software-design/interfaces.md) — contract inheritance.
- [Code Smells](/02-software-design/code-smells.md) — how to recognize problematic
  hierarchies.

## Practical Exercise

Find the deepest hierarchy in your system. For each subclass, apply the
substitutability test: is there any place that accepts the base and would break
with this subclass?

Then count the axes of variation the hierarchy tries to accommodate. More than one
is a sign that composition would serve better.

## Interview Questions

- When is inheritance the correct choice?
- What is the fragile base class problem?
- How can a Liskov violation get past the compiler and the tests?

## Further Exploration

- Gamma, Erich et al. *Design Patterns*. Addison-Wesley, 1994 — the original
  formulation of "prefer composition over inheritance".
- Liskov, Barbara; Wing, Jeannette. *A Behavioral Notion of Subtyping*. TOPLAS,
  1994.
- Bloch, Joshua. *Effective Java*. 3rd ed., 2018 — "favor composition over
  inheritance".

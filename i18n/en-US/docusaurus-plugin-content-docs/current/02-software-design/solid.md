---
id: solid
title: SOLID
sidebar_position: 1
description: Five object-oriented design principles — what each one solves and the range in which it applies.
doc_type: concept
level: 2
difficulty: intermediate
status: complete
objective: >
  By the end, the reader applies each SOLID principle from the problem it solves,
  and recognizes the cases where following it makes the code worse.
prerequisites: [fundamentals]
related: [dependency-inversion, interfaces, encapsulation]
canonical_for: [SOLID, single responsibility principle, open-closed principle, Liskov substitution, interface segregation]
translated_from_version: 1
last_reviewed: 2026-08-31
---

# SOLID

## Overview

SOLID is an acronym for five object-oriented design principles, gathered by Robert
Martin from earlier work.

Their value is real and smaller than the reputation suggests. They are heuristics
with a range of application — not laws. Applied by reflex, they produce code with
more indirection and no less coupling.

## Problem

Object-oriented code degrades in predictable ways: classes that accumulate
responsibilities, hierarchies where the subclass breaks the superclass's contract,
wide interfaces that force empty implementations, and high-level modules tied to
low-level details.

Each SOLID principle names one of those degradations and proposes a direction. That
is the useful way to read them: **five diagnoses, not five rules.**

The problem with the usual teaching is that the principles arrive as commandments,
without the symptom that motivates them. The result is preventive application —
interfaces created to satisfy the D, classes fragmented to satisfy the S — in code
that had none of the symptoms.

## Core Concepts

### S — Single Responsibility

> A class should have one, and only one, reason to change.

The correct formulation is about **reason for change**, not about "doing only one
thing". The wrong reading leads to fragmenting code with no criterion; the right
one points directly at
[separation of concerns](/01-fundamentals/separation-of-concerns.md).

Martin later refined it: the reason for change is an *actor* — whoever requests
the change. A class that changes at the request of the tax team and the reporting
team has two actors and should be two classes.

**Symptom:** the class shows up in commits from different teams, for unrelated
reasons.

### O — Open-Closed

> Open for extension, closed for modification.

It should be possible to add behaviour without altering existing code.

**Symptom:** each new case requires one more branch in a `switch` that already has
twelve, and the `switch` is replicated in four places.

The caveat that is almost never stated: applying the principle requires guessing
**which axis will vary**. Guessing wrong produces an abstraction that has to be
dismantled to accommodate the real variation. That is why it works best applied
after the variation has appeared two or three times.

### L — Liskov Substitution

> Subtypes must be substitutable for their base types without breaking the
> program.

It is the only one of the five that is a theorem rather than a heuristic: a
subclass that strengthens the precondition or weakens the postcondition breaks code
that worked.

**Symptom:** `if (x instanceof Y)` scattered around, or a subclass that throws in a
method the superclass promises to implement.

The classic example — `Square` inheriting from `Rectangle` — is useful because it
shows that the violation can be invisible to the compiler and obvious in
behaviour.

### I — Interface Segregation

> No client should be forced to depend on methods it does not use.

Wide interfaces couple implementers to irrelevant behaviour.

**Symptom:** implementations with methods that throw `UnsupportedOperation`.

### D — Dependency Inversion

> High-level modules should not depend on low-level modules; both should depend on
> abstractions.

It is the most architectural of the five and the subject of
[dependency inversion](/02-software-design/dependency-inversion.md), where the
detail most often got wrong — which side the interface lives on — is covered.

**Symptom:** the business rule imports the database driver.

## Mental Model

**Each principle is the name of a symptom.** Facing code, look for the symptom
before the principle. If the symptom is not there, the principle does not apply.

## When to Use

- When the corresponding symptom is present and observable.
- When the variation the principle would absorb has already occurred two or three
  times.
- In long-lived code that changes frequently.
- When the cost of the indirection is lower than the cost of the recurring change.

## When Not to Use

**Preventively, with no symptom.** The dominant mistake. Applying the O without
knowing which axis varies produces the wrong abstraction; applying the D where
there is one implementation produces one more file.

**In throwaway or stable code.** Prototypes, scripts, and modules that have not
changed in two years. The principle is an investment in future change.

**When the S fragments what changes together.** Two classes that always appear in
the same commit have one reason for change, not two. Separating them violates the
idea itself.

**When the result hurts readability without reducing cost of change.** If following
a flow now requires nine files and no change got cheaper, the principles were
applied against their own purpose.

**Outside object orientation, without translation.** In functional code, several of
the principles have no direct application — the problem they solve no longer exists
in the same form.

## Alternatives

- **The four rules of simple design** (Beck) — passes the tests, reveals intent, no
  duplication, fewest elements. Leaner and less prone to mechanical application.
- **Coupling and cohesion heuristics** — more fundamental; SOLID can be read as
  five corollaries of them.
- **Data-oriented design** — in performance contexts, the OO principles are
  frequently the problem.

## Trade-offs

The axis is **flexibility for anticipated change versus immediate simplicity**.

| Apply | Do not apply |
|---|---|
| Change along the anticipated axis is cheap | Change requires altering existing code |
| Parts testable in isolation | Tests carry more context |
| More types, more indirection | Direct, readable flow |
| Cost paid now | Cost paid if the change comes |
| Risk of predicting the wrong axis | No wrong abstraction to undo |

## Failure Modes

**Fragmentation from misreading S.** Dozens of one-method classes that always
change together.

**Abstraction on the wrong axis from O.** The real variation is not the anticipated
one; each new case twists the abstraction.

**Silent L violation.** Compiles, passes unit tests, breaks in production when the
subtype arrives through an unforeseen path.

**Interface of one from D.** See [abstraction](/01-fundamentals/abstraction.md).

## Common Mistakes

**Reading S as "do only one thing".** The formulation is about reason for change.

**Treating the five as a mandatory package.** They are independent, with different
ranges of application. D is architectural; I is local.

**Applying before the symptom.** The mistake that encompasses all the others.

**Using SOLID as an appeal to authority in review.** "That violates SRP" is not an
argument until you point at which change gets more expensive because of it.

**Thinking SOLID solves architecture.** They are class design principles. A system
can be SOLID in every file and have bad architecture.

## Real-World Example

A `FinancialReport` class with 400 lines, which fetched data, applied tax rules,
formatted a PDF and sent it by email.

Mechanical application of S would produce four classes. What the **actor** analysis
produced was different: fetching data and applying tax rules always changed
together, requested by the same team and for the same regulatory reason. Formatting
changed at the request of design. Sending, on a change of provider.

Three classes, not four. And the most valuable was the formatting one, which became
changeable without risk of touching the tax calculation — which mattered because
whoever changed formatting did not know the tax rules.

The contrast: in the same system, an earlier attempt had applied O by creating a
`CalculationStrategy` hierarchy to "support new report types". In three years, no
new type appeared. The hierarchy had one implementation and was removed.

## Related Concepts

- [Separation of Concerns](/01-fundamentals/separation-of-concerns.md) — the
  principle S is a case of.
- [Dependency Inversion](/02-software-design/dependency-inversion.md) — the D, in
  detail.
- [Interfaces](/02-software-design/interfaces.md) — the I, in detail.
- [Design Heuristics](/02-software-design/design-heuristics.md) — leaner
  alternatives.

## Practical Exercise

Pick the largest class in your system. For each method, identify **who requests
changes to it** — which team, which role.

Group by actor. The groups are the classes that should exist.

Compare with the division you would make by applying "do only one thing". Where the
two diverge, the division by actor is usually the right one.

## Interview Questions

- What is the correct formulation of the Single Responsibility Principle?
- Why is Open-Closed hard to apply in advance?
- Give an example of a Liskov violation the compiler does not catch.

## Further Exploration

- Martin, Robert C. *Clean Architecture*. Prentice Hall, 2017 — the five
  principles with the revised actor-based formulation of SRP.
- Liskov, Barbara; Wing, Jeannette. *A Behavioral Notion of Subtyping*. TOPLAS,
  1994 — the formal result behind the L.
- Meyer, Bertrand. *Object-Oriented Software Construction*, 1988 — origin of
  Open-Closed.

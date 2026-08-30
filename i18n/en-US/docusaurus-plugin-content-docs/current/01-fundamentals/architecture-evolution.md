---
id: architecture-evolution
title: Architecture Evolution
sidebar_position: 22
description: No architecture is final — the question is whether it changes deliberately or by accumulation.
doc_type: foundation
level: 1
difficulty: intermediate
status: complete
objective: >
  By the end, the reader recognizes the signals that an architecture needs to
  change and designs so that change is possible without a rewrite.
prerequisites: [architecture-as-decisions]
related: [technical-debt, legacy-modernization]
canonical_for: [architecture evolution, evolutionary architecture]
translated_from_version: 1
last_reviewed: 2026-08-30
---

# Architecture Evolution

## Overview

No architecture is final. Business context changes, volume changes, teams change,
technology changes, and what was adequate stops being so.

The question is not whether the architecture will change. It is whether it will
change **by decision** or **by accumulation** — and the second is the default path
when nobody chooses the first.

## The Problem

Architectures are treated as if they had a correct state to reach. The design is
done, the system is built, and from then on architectural changes are seen as
correcting a mistake.

That produces two pathologies.

The first is resistance to change. Since changing the architecture would mean
admitting the original was wrong, the structure is preserved well past its
validity, and the system accumulates workarounds.

The second is the rewrite. When the distance between the architecture and the need
grows too large to ignore, the proposal is to start over — which is the most
expensive and riskiest way to evolve, and the one that fails most.

The path that works is the middle one and the least practised: continuous,
incremental change, decided from observed signals.

## Core Concepts

### The decision was right; the context changed

The distinction that defuses the resistance.

An architecture chosen for six engineers and a thousand users was not wrong when it
was chosen. It stopped serving when the team reached sixty and the users a million.

Framing the change as correcting a mistake makes the conversation political.
Framing it as a response to a change of context makes it technical — and that is
the correct formulation, provided the
[record of decisions](architecture-as-decisions.md) exists to support it.

### Signals that it needs to change

Observable signals, not impressions:

- Simple changes touch a growing number of modules.
- The time between deciding a feature and delivering it grows without the scope
  growing.
- Incidents recur at the same structural point.
- One component concentrates the team's merge conflicts.
- Operations requires more and more people for the same volume.
- A driving architecture characteristic has stopped being met and nobody can point
  to a local fix.

The last is the most decisive, and the one that requires having the
[characteristics](architecture-characteristics.md) stated in order to be noticed.

### Designing to be changed

The property that matters is not guessing the future — nobody guesses. It is that
changing is possible without rewriting.

Three things produce that, and all three have already appeared in this level:

**Enforced boundaries**, so a change can be contained. See
[architecture vs. implementation](architecture-vs-implementation.md).

**Recorded decisions**, so you know what you are changing and why.

**Automated verification** of the properties that matter, so degradation is visible
before it becomes structural. This is the fitness function idea, which returns in
[Level 07](../23-architecture-leadership/index.md).

### Incremental evolution beats a rewrite

Rewrites fail for structural reasons, not from poor execution: the old system keeps
evolving during the rewrite, the undocumented rules only surface when the new one
gets them wrong in production, and the value only arrives at the end — when the
budget has run out.

Incremental change delivers value before it is complete and can be reversed at any
point. It is the subject of
[legacy modernization](../16-legacy-modernization/index.md), and the main pattern is
the strangler fig.

## Why This Matters

**Because the alternative happens on its own.** An architecture that is not evolved
deliberately evolves by accumulating workarounds — which is evolution too, just
without direction.

**Because it changes what you optimize for in the initial design.** If the
architecture is going to change, the valuable property is not being right — it is
being cheap to change. That shifts the priority towards boundaries and
reversibility, and away from completeness.

**Because it makes the conversation possible.** "The context changed, and these are
the signals" is a discussable proposal. "The architecture is wrong" is an
accusation.

## Common Mistakes

**Treating the architecture as definitive.** It produces resistance and, in the
limit, a rewrite.

**Proposing a rewrite as the first answer.** It is the most expensive option and
the one that fails most. It deserves to be the last considered, not the first.

**Evolving with no signal.** Changing architecture out of fashion, preference or
aesthetic discomfort is cost with no return. The signals above are the criterion.

**Not measuring.** Without instrumentation, degradation is noticed late and as a
feeling rather than a fact — and a feeling does not sustain an investment proposal.

**Changing everything at once.** Even when the direction is right, the change has to
be sliced into steps that deliver value and can be reversed.

**Confusing evolution with accumulating workarounds.** Each individual workaround is
cheap; the set of them is what prevents real evolution.

## Real-World Example

A scheduling system started as a monolith with a single database, for a team of
five. The choice was correct and was recorded with that reason.

Over four years: the team reached thirty people across four squads; volume grew
fortyfold; and one of the squads began serving corporate customers with a
contractual availability requirement the others did not have.

The signals appeared in order. First, merge conflicts concentrated in two modules.
Then, delivery time growing without scope growing. Finally, the corporate squad
unable to meet its SLA because a deployment from another squad took everything
down.

The third signal is what decided it: a driving characteristic — availability for
one segment — had stopped being met, and there was no local fix.

The response was not a migration to microservices. It was extracting **one**
service: the corporate flow, which had a distinct requirement and a boundary
already stable in the commit history.

Eighteen months later, a second service was extracted by the same criterion. The
other two squads remain in the monolith, and there is no plan to take them out — no
signal indicates they should leave.

What is good about this architecture is not its shape. It is that the shape changed
twice, each time for a specific signal, and can change again.

## Related Concepts

- [Architecture as a Set of Decisions](architecture-as-decisions.md) — what makes
  reassessment possible.
- [Technical Debt](technical-debt.md) — what accumulates when evolution does not
  happen.
- [Legacy Modernization](../16-legacy-modernization/index.md) — evolution in
  systems that cannot stop.
- [Architecture Leadership](../23-architecture-leadership/index.md) — evolutionary
  architecture and fitness functions.

## Practical Exercise

List your system's main architectural decisions and, next to each, the context in
which it was made: team size, volume, constraints.

Compare with today's context.

Where the distance is large, check whether there is an observable signal that the
decision stopped serving — or whether it remains adequate despite the change of
context. Both answers happen, and telling them apart is the exercise.

## Interview Questions

- How do you know an architecture needs to change?
- Why do complete rewrites fail so frequently?
- What makes an architecture easy to evolve?

## Further Exploration

- Ford, Neal; Parsons, Rebecca; Kua, Patrick. *Building Evolutionary
  Architectures*. O'Reilly, 2017.
- Feathers, Michael. *Working Effectively with Legacy Code*. Prentice Hall, 2004.
- Fowler, Martin. *StranglerFigApplication*, 2004.

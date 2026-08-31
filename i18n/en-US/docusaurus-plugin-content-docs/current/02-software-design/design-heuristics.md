---
id: design-heuristics
title: Design Heuristics
sidebar_position: 18
description: Rules of thumb that guide without prescribing — and why a heuristic is the right format for design.
doc_type: foundation
level: 2
difficulty: intermediate
status: complete
objective: >
  By the end, the reader has a set of applicable heuristics and understands why
  design is guided by heuristics rather than rules.
prerequisites: [clean-code]
related: [solid, kiss, design-patterns]
canonical_for: [design heuristics]
translated_from_version: 1
last_reviewed: 2026-08-31
---

# Design Heuristics

## Overview

A heuristic is a rule of thumb that works in most cases and acknowledges
exceptions. It is the appropriate format for software design, and the reason is
structural: design depends on context that a rule cannot capture.

## The Problem

Design principles frequently arrive as rules: "a class should have one
responsibility", "functions should be short", "prefer composition over
inheritance".

Rules have two bad properties in this domain.

**They admit no exception without becoming hypocrisy.** When the case does not fit
— and cases frequently do not — the team works around it silently. The rule stops
being discussable, which is worse than not having it.

**They hide the reasoning.** Whoever follows a rule does not learn to decide.
Facing a new situation, they have nothing.

A heuristic solves both. It comes with the force of its argument made explicit,
which allows weighing it against other considerations — and the exercise of
weighing is what develops judgement.

## Core Concepts

### The four rules of simple design

Formulated by Kent Beck, in priority order:

1. **Passes all the tests.**
2. **Reveals intent.**
3. **Contains no duplication.**
4. **Has the fewest elements.**

The order is the part that matters. When 3 and 4 conflict with 2, intent wins —
which legitimizes duplication that makes the code clearer. It is the leanest version
of everything [SOLID](/02-software-design/solid.md) and
[Clean Code](/02-software-design/clean-code.md) try to capture.

### An operational set

Heuristics that appear repeatedly in this material, gathered:

**Things that change together stay together.** The heuristic with the widest reach.
It guides [modularity](/01-fundamentals/modularity.md),
[cohesion](/01-fundamentals/cohesion.md),
[boundaries](/02-software-design/boundaries.md) and
[DRY](/02-software-design/dry.md).

**Depend in the direction of stability.** See
[dependency direction](/02-software-design/dependency-direction.md).

**Prefer the option that is cheapest to abandon.** When two alternatives tie,
reversibility decides.

**Wait for the third occurrence.** Before abstracting. Two do not distinguish
coincidence from concept.

**Duplication is cheaper than the wrong abstraction.** The corollary of the
previous one.

**Account for both sides.** Every decision adds and removes complexity.

**Choose the lowest boundary level that solves it.** Module before package, package
before process.

**If you need a conjunction to name it, it is probably two things.** The quick
cohesion test.

**Name by the domain, not by the implementation.**

**If you cannot write the test that verifies it, it is not a requirement.**

### Heuristics conflict

That is not a defect, it is their nature. "Don't duplicate" conflicts with "don't
abstract early". "Reduce coupling" conflicts with "don't duplicate knowledge".

The conflict is where judgement happens, and it is why design cannot be reduced to
an algorithm. A set of heuristics that never conflicts is a set that does not cover
the space.

## Why This Matters

**Because it develops judgement rather than compliance.** Whoever understands the
argument behind a heuristic decides well in a new situation. Whoever memorized the
rule does not.

**Because it makes the discussion possible.** Two conflicting heuristics produce a
conversation about which force is stronger in this case. Two conflicting rules
produce deadlock.

**Because it is the format the principles actually have.** Every design principle
has exceptions. Presenting them as rules is imprecise, and the imprecision shows up
at the first application.

## Common Mistakes

**Treating a heuristic as a rule.** Loses the exception and the reasoning.

**Collecting heuristics without understanding the arguments.** It becomes a list of
slogans.

**Thinking the conflict between them is a problem to solve.** It is where the work
is.

**Applying without checking the context.** Every heuristic has a range. "Wait for
the third occurrence" does not apply when the third is a regulatory obligation with
a deadline.

**Using it as an appeal to authority.** "That violates principle X" is not a
critique until you point at the concrete cost.

## Real-World Example

A code review stalled between two positions, both defensible.

*Position A:* the validation logic is duplicated in two modules — extract it into a
common module. Heuristic invoked: don't duplicate knowledge.

*Position B:* the two modules belong to different contexts and will diverge — keep
them separate. Heuristic invoked: duplication is cheaper than the wrong
abstraction.

Neither is wrong. The deadlock was resolved by a third heuristic: *things that
change together stay together* — reformulated as an empirical question.

The history answered it: over the previous fourteen months, the two validations had
been changed five times, always separately, and at the request of different areas.

Position B won, and the duplication was annotated with the reason — so that the next
person would not "fix" it.

What resolved it was not electing the strongest heuristic. It was finding the one
that could be checked against data.

## Related Concepts

- [KISS](/02-software-design/kiss.md) and [YAGNI](/02-software-design/yagni.md) —
  two heuristics in detail.
- [SOLID](/02-software-design/solid.md) — five heuristics frequently read as rules.
- [Clean Code](/02-software-design/clean-code.md) — the local set.
- [Trade-offs](/20-trade-offs/index.md) — what to do when two conflict.

## Practical Exercise

Write down the five heuristics you actually use when making design decisions. Not
the ones you think you should use — the ones you use.

For each, write the argument behind it and a case where it does not apply.

The ones you cannot justify are memorized rules. The ones with no exception are
probably badly formulated.

## Interview Questions

- What is the difference between a heuristic and a rule in design?
- Name two heuristics that conflict and say how you decide between them.
- Which heuristic do you use most often, and what is the argument behind it?

## Further Exploration

- Beck, Kent. *Extreme Programming Explained*. 2nd ed., Addison-Wesley, 2004 — the
  four rules of simple design.
- Ousterhout, John. *A Philosophy of Software Design*. Yaknyam Press, 2018.
- Riel, Arthur. *Object-Oriented Design Heuristics*. Addison-Wesley, 1996 — the
  classic catalogue.

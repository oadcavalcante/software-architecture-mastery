---
id: refactoring
title: Refactoring
sidebar_position: 17
description: Changing the structure without changing behaviour — and what separates refactoring from a disguised rewrite.
doc_type: concept
level: 2
difficulty: intermediate
status: complete
objective: >
  By the end, the reader carries out refactoring in verifiable steps and knows when
  to stop — the part that is almost never defined.
prerequisites: [code-smells]
related: [technical-debt, clean-code, legacy-modernization]
canonical_for: [refactoring]
translated_from_version: 1
last_reviewed: 2026-08-31
---

# Refactoring

## Overview

Refactoring is altering the internal structure of code **without altering its
observable behaviour**.

The clause after "without" is the entire definition. If behaviour changes, it is not
refactoring — it is a change of functionality, and the two should not happen in the
same commit.

## Problem

The word is used to describe any structural change, including rewrites that change
behaviour. That destroys the property that makes refactoring safe.

Refactoring is safe because **behaviour is the net**. If it does not change, the
existing tests verify the change. When behaviour and structure change together, and
a test fails, nobody knows which of the two caused it.

The second problem is the absence of a stopping criterion. "Let's refactor this"
rarely defines when it is done, and refactoring with no declared end consumes time
until someone interrupts it under deadline pressure — frequently midway, which is
the worst possible state.

## Core Concepts

### Small, verifiable steps

The practice that distinguishes refactoring from rewriting: each step is small
enough for the tests to run between them.

```text
❌ refactor for three days → run the tests → 40 failures → where?
✅ extract method → tests → rename → tests → move → tests
```

The value is not psychological. With small steps, the step that broke it is always
the last one, and undoing costs minutes.

### Tests are a prerequisite, not a consequence

Refactoring code without tests is not refactoring — it is structural change in the
hope that nothing breaks.

When the tests do not exist, the order is: write characterization tests that capture
the **current** behaviour, including what looks wrong, and only then refactor.
Incorrect behaviour is fixed afterwards, in a separate commit.

### The stopping criterion

The question that has to be answered before starting: **what needs to be true for us
to stop?**

Useful answers are verifiable:

- "The tax calculation rule can be changed without touching persistence."
- "This module can be tested without a database."
- "The cycle between these two packages no longer exists."

Useless answers: "the code is better", "it's cleaner".

### Preparatory refactoring

The highest-return form, and the least practised: refactoring **before**
implementing, to make the implementation simple.

Kent Beck: *"for each desired change, make the change easy, then make the easy
change"*.

That has a decisive practical advantage: the refactoring gains a concrete
justification and a natural scope. It ends when the feature becomes easy to add.

### Refactoring is not a project

"Refactoring sprint" and "technical debt quarter" treat as a project what works
better as a continuous practice, tied to real changes.

Refactoring disconnected from need has no stopping or prioritization criterion, and
it competes with delivery — a competition it loses at the first surprise.

## Mental Model

**Two hats, never at the same time:** I am changing structure, or I am changing
behaviour. If you do not know which, stop.

## When to Use

- Before adding a feature to code that resists — preparatory refactoring.
- When a smell has high interest: code in the path of many changes.
- When understanding code for the first time — renaming as you learn is a record of
  knowledge.
- After delivering, to clean up what was done under pressure, while the context is
  still fresh.

## When Not to Use

**Without tests.** Write the characterization tests first.

**Together with a behaviour change.** Separate commits, always.

**In stable code nobody touches.** Zero interest.

**Near a critical deadline.** Not because refactoring is risky, but because stopping
midway leaves the code worse than at the start.

**When the problem is architectural.** A boundary in the wrong place is not fixed by
extracting a method. See
[legacy modernization](/16-legacy-modernization/index.md).

**With no declared stopping criterion.** See above.

## Alternatives

- **Rewrite the module** — when the current structure does not admit incremental
  steps. It is riskier and is sometimes the answer.
- **Strangler fig** — incremental replacement from the outside, when the interior
  does not allow safe change.
- **Accept and isolate** — encapsulate the problematic code behind a good interface,
  without touching the interior.
- **Do nothing** — when the interest is low.

## Trade-offs

| Refactor | Leave as is |
|---|---|
| Future changes cheaper | No cost now |
| Understandable code | Knowledge stays tacit |
| Time that does not become features | Time on delivery |
| Risk of introducing a defect | No change risk |
| Merge conflicts with parallel work | No conflict |

The last is underestimated: a broad refactoring in parallel with other work streams
produces conflicts that cost more than the refactoring.

## Failure Modes

**Interrupted refactoring.** Half the system in the new structure, half in the old,
and nobody knows which is the convention.

**Refactoring that changes behaviour unnoticed.** With no tests, the defect appears
weeks later and nobody connects it to the structural change.

**Endless refactoring.** Absence of a stopping criterion.

**Refactoring as avoidance.** Restructuring instead of solving the hard problem.

## Common Mistakes

**Mixing it with a functionality change.** The most frequent mistake and the most
expensive.

**Refactoring without a net.** Tests first.

**Not declaring when it ends.** An invitation not to finish.

**Choosing by what annoys, not by what costs.** See
[code smells](/02-software-design/code-smells.md).

**Treating it as an event instead of a practice.** Continuous refactoring, tied to
real changes, pays more than dedicated quarters.

## Real-World Example

A team needed to add a new discount type. The estimated implementation was two days,
but the calculation lived in a 600-line class with seven discount types interwoven
by nested conditionals.

Two proposals: implement one more branch — half a day, and the class goes to 700
lines — or refactor first.

The preparatory refactoring was defined with an explicit stopping criterion: *adding
a discount type must require one new class and no changes to the existing ones.*

It took four days. Each step with the tests running: characterize the current
behaviour, extract each type into a class, replace the conditional with selection,
and finally add the new type.

The new discount took two hours.

What makes the case instructive is not the saving — four days to save half a day does
not add up. It is what came afterwards: over the next fourteen months five more
types were added, each in about two hours. The refactoring paid for itself on the
third.

The stopping criterion is what allowed declaring it done on the fourth day, instead
of going on improving.

## Refactoring in a team

Broad refactoring in parallel with other work streams produces merge conflicts that
frequently cost more than the refactoring saves.

Four practices that reduce that:

**Announce beforehand, with scope and deadline.** Whoever is working in the area
needs to know, to decide whether to wait or to hurry.

**Prefer many small commits to one large one.** Each integrated quickly. A
refactoring branch left open for two weeks accumulates divergence nobody can resolve
with confidence.

**Separate moving from altering.** A commit that only moves files is trivial to
review and to rebase; one that moves and alters is impossible to assess.

**Refactor what you are already touching.** The boy scout rule — leave it better than
you found it — distributes the refactoring across whoever already has the context,
and avoids conflict by construction.

The point those four share: refactoring is cheaper when it is continuous and local,
and more expensive when it is a coordinated event. The temptation to organize a big
effort comes from wanting to do it all at once, and it is usually the worse option.

## Related Concepts

- [Code Smells](/02-software-design/code-smells.md) — what indicates where to
  refactor.
- [Technical Debt](/01-fundamentals/technical-debt.md) — how to prioritize.
- [Clean Code](/02-software-design/clean-code.md) — the local target.
- [Legacy Modernization](/16-legacy-modernization/index.md) — when the problem is
  bigger than refactoring.

## Practical Exercise

Pick the next feature you will implement in code that resists.

Before starting, write the stopping criterion for the preparatory refactoring: what
needs to be true for the feature to become easy?

Refactor to that criterion, and stop. Then implement.

Compare the total time with your estimate of implementing directly.

## Interview Questions

- What is the precise definition of refactoring?
- How do you refactor code without tests?
- How do you define when a refactoring is finished?

## Further Exploration

- Fowler, Martin. *Refactoring*. 2nd ed., Addison-Wesley, 2018.
- Feathers, Michael. *Working Effectively with Legacy Code*. Prentice Hall, 2004 —
  characterization tests.
- Beck, Kent. *Tidy First?* O'Reilly, 2023 — refactoring in small steps.

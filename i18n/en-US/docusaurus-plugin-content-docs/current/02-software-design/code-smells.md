---
id: code-smells
title: Code Smells
sidebar_position: 16
description: Signs that something deserves attention — not defects, and not a list of prohibitions.
doc_type: concept
level: 2
difficulty: intermediate
status: complete
objective: >
  By the end, the reader uses smells as a diagnosis prioritized by real cost, and
  not as a compliance checklist.
prerequisites: [clean-code]
related: [refactoring, technical-debt, dry]
canonical_for: [code smell]
translated_from_version: 1
last_reviewed: 2026-08-31
---

# Code Smells

## Overview

A code smell is a characteristic of the code that **suggests** a deeper problem. The
word chosen by Kent Beck and Martin Fowler is deliberate: a smell, not a defect. It
indicates where to look, not what to fix.

## Problem

Smells are treated in two wrong ways, opposite to each other.

**As prohibitions.** Static analysis tools list violations and teams treat the list
as a backlog to zero out. That produces refactoring with no criterion: stable, ugly
code gets fixed while code on the critical path stays.

**As ignorable opinion.** "It's just a smell" discards the signal before
investigating.

The correct use is in between: **a smell is a hypothesis**. It points at a place and
suggests a cause; the investigation decides whether there is a problem and whether
it is worth fixing.

## Core Concepts

### The smells that matter most in architecture

Fowler's list is long. These are the ones that signal structural rather than local
problems:

**Feature envy.** A method uses more data from another class than from its own.
Suggests the behaviour is on the wrong side of the boundary.

**Shotgun surgery.** One change requires small alterations in many places. Signals
low [cohesion](/01-fundamentals/cohesion.md): the concept is scattered.

**Divergent change.** One class changes for independent reasons. The opposite of the
previous one, and it signals mixed responsibilities.

**Inappropriate intimacy.** Two classes know each other's internal details.
[Coupling](/01-fundamentals/coupling.md) in the wrong place.

**Primitive obsession.** Domain concepts represented by primitive types. `String
taxId` instead of `TaxId`. It scatters validation and allows silent swaps.

**Speculative generality.** Abstraction for a need that never arrived. See
[YAGNI](/02-software-design/yagni.md).

**Long parameter list.** Frequently signals that a concept has no name — the
parameters that always travel together are an object.

### The prioritization criterion

A smell in code nobody has touched in two years costs zero. The same smell in the
path of every change costs on every change.

Correct prioritization crosses two dimensions: **severity of the smell** and
**frequency of change of that file**. The second is extractable from version history
and is almost never consulted.

That is the application of [technical debt](/01-fundamentals/technical-debt.md)
interest at the code level.

### Structural smells do not show up in tooling

Static analyzers detect the local kind well: long method, cyclomatic complexity,
textual duplication.

They detect the structural kind poorly: shotgun surgery and divergent change are
properties of the **history**, not of the code at an instant. Finding them requires
looking at how the repository changed over time — which is what history analysis
tools do.

## Mental Model

**A smell is a question, not an answer.** "Why does this method use so much of
another class?" The answer may be "because it is in the wrong place" or "because
that is how it is".

## When to Use

- When investigating why an area of the system is expensive to change.
- In code review, as shared vocabulary for pointing at something.
- When prioritizing refactoring, crossed with frequency of change.
- When assessing inherited code, to map where the risks are.

## When Not to Use

**As a backlog to zero out.** It produces refactoring with no return.

**As an automatic verdict.** An 80-line method can be the clearest way to express a
sequence with no branching.

**In stable code.** A smell with no interest is debt with no running cost.

**As an argument without investigation.** "That's feature envy" is not a critique
until you show what becomes more expensive because of it.

**Against third-party or generated code.** It is not yours to fix.

## Alternatives

- **History metrics** — files that change frequently and change together say more
  than any isolated smell.
- **Measuring real effort** — how long a typical change takes in that area.
- **Asking whoever maintains it** — the people working on the code know where it
  hurts, and are rarely asked that question.

## Trade-offs

| Act on smells | Ignore |
|---|---|
| Code easier to change | No refactoring effort |
| Common vocabulary in review | No debate about style |
| Risk of refactoring what does not pay | No change risk |
| Cost of changing now | Cost accumulates if there is interest |

## Failure Modes

**Smell hunting with no prioritization.** Quarters spent on the most visible code,
not the most expensive.

**Tooling as authority.** The tool's complexity threshold becomes law.

**Smell fixed, cause kept.** Extracting an 80-line method into eight does not resolve
mixed responsibilities; it merely distributes them.

**False positive treated as true.** A long parameter list in an immutable value
object's constructor is usually appropriate.

## Common Mistakes

**Not crossing with frequency of change.** The dominant prioritization mistake.

**Confusing a smell with a bug.** A smell breaks nothing; it makes change more
expensive.

**Using it as compliance.** It becomes theatre.

**Ignoring structural smells.** They are the ones that cost most and the ones tools
cannot see.

## Real-World Example

A team had 340 violations flagged by the static analyzer. The quarter's goal was to
zero them out.

By the end, 310 were fixed. Feature delivery time did not change.

The later analysis crossed the violations with the history: 280 of them were in files
changed fewer than twice in the year. The interest was close to zero.

The remaining 30 were in four files that appeared in 60% of the commits. None of them
was the worst-scoring one in the tool — the problems there were shotgun surgery and
inappropriate intimacy, which the analyzer does not detect.

The following quarter dealt with those four files only. Average delivery time dropped
measurably.

The difference between the two quarters was not effort. It was looking at the history
before choosing.

## From symptom to structural cause

Local smells frequently point at boundary problems. The translation:

| Smell | Likely structural cause |
|---|---|
| Feature envy | Behaviour on the wrong side of the boundary |
| Shotgun surgery | Concept scattered; low cohesion |
| Divergent change | Mixed responsibilities; one module with two actors |
| Inappropriate intimacy | Nominal boundary, not enforced |
| Primitive obsession | Domain concept with no type of its own |
| Long parameter list | A missing value object |
| Data clumps | The same parameters always together are a concept |
| Middle man | Anemic layer that only forwards |
| Speculative generality | Abstraction created before the third case |

The right column is what is worth fixing. Fixing the left one without the right
produces the same problem in a different shape — the 80-line method becomes eight of
ten lines, and the responsibilities remain mixed.

## Related Concepts

- [Refactoring](/02-software-design/refactoring.md) — how to fix safely.
- [Technical Debt](/01-fundamentals/technical-debt.md) — interest and
  prioritization.
- [Cohesion](/01-fundamentals/cohesion.md) and
  [Coupling](/01-fundamentals/coupling.md) — what the structural smells signal.
- [Clean Code](/02-software-design/clean-code.md) — the local side.

## The smells worth discussing in review

Not every smell deserves a comment in a pull request. Most of a review's value comes
from pointing at three of them, and the rest is noise that trains the author to
ignore comments.

**Primitive obsession in a domain concept.** When an identifier, a tax document or a
monetary value shows up as plain text or a number, the cost spreads: validation comes
to exist everywhere the value is received, and nothing prevents two different
identifiers from being swapped for each other in a call. It is the smell with the
best ratio of fixing effort to return, because the fix is creating a type and the
benefit applies to all future code.

**Feature envy that crosses a module boundary.** Inside a module, it is a question of
organization. Across modules, it is a sign that the boundary is in the wrong place —
and a wrong boundary costs on every change, not just in that method.

**A name that lies.** A method called `validate` that also persists is the most
expensive defect on this list, because it destroys trust in every other name in the
system. Readers come to need to check each call, and reading stops paying off.

The other smells are better handled as material for planned refactoring, prioritized
by frequency of change, rather than as one-off review comments. Pointing them out one
by one in the pull request consumes the author's attention without changing the
structure that causes them.

## Practical Exercise

Extract from your repository the list of files most changed over the last six
months. Take the top ten.

For each, look for structural smells: does it change for independent reasons? Does it
always change together with one specific other file?

Compare that list with your static analyzer's. The overlap tends to be small, and the
first list is the one that matters.

## Interview Questions

- Why "smell" and not "defect"?
- How do you prioritize which smell to fix?
- Which smells can a static analysis tool not detect?

## Further Exploration

- Fowler, Martin. *Refactoring*. 2nd ed., Addison-Wesley, 2018 — the smell catalogue.
- Tornhill, Adam. *Software Design X-Rays*. Pragmatic Bookshelf, 2018 — smells
  detected from history.

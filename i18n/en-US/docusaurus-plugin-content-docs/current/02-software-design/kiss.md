---
id: kiss
title: KISS
sidebar_position: 3
description: Prefer the simplest solution that solves the problem — and what "simple" means in a verifiable way.
doc_type: concept
level: 2
difficulty: beginner
status: complete
objective: >
  By the end, the reader assesses simplicity by the number of interleaved parts
  and recognizes when the simple solution is insufficient, not merely
  uncomfortable.
prerequisites: [fundamentals]
related: [yagni, dry, design-heuristics]
canonical_for: [KISS, simplicity]
translated_from_version: 1
last_reviewed: 2026-08-31
---

# KISS

## Overview

KISS — *Keep It Simple, Stupid* — advises preferring the simplest solution that
solves the problem.

As a slogan it is useless: nobody argues for complicating on purpose. What makes
the principle operational is having a definition of "simple" that can be verified
rather than felt.

## Problem

"Simple" is used to mean two different things, and the confusion between them is
why the principle rarely decides anything.

**Easy** is what is familiar. A tool you have used for five years feels easy; an
unknown one feels hard. It is a property of the person.

**Simple**, in the sense that matters, is having few interleaved parts. Rich Hickey
recovers the etymology: *simplex* is "one fold"; the opposite is *complex*,
"braided together". It is a property of the thing.

The two diverge frequently. A familiar ORM can be complex — it brings caching, lazy
loading, session management and SQL generation braided together. Raw SQL can be
simple and uncomfortable.

When a team says "let's keep it simple" and picks what it already knows, it picked
easy, not simple. Sometimes that is the right call — familiarity reduces execution
risk — but it is a different decision, and worth making knowingly.

## Core Concepts

### The operational measure

Three questions that replace impressions:

1. **How many parts** does the reader need to understand to modify this safely?
2. **How many execution paths** are there? Each boolean flag doubles the number.
3. **How many things change** if I change one?

The third is the most revealing, and it is the same as
[coupling](/01-fundamentals/coupling.md). Complexity and coupling are not distinct
concepts up close — they are the same phenomenon measured from different angles.

### Simple is not less code

Short, dense code can interleave more than long, explicit code. A one-line
expression with four chained operations has more interdependent parts than four
named lines.

Counting lines is the wrong metric. Counting what has to be held in mind
simultaneously is the right one.

### Simple is local or global

A decision can simplify one part and complicate the whole. Extracting a service
simplifies each side and adds network, deployment and partial failure to the
whole.

See [complexity](/01-fundamentals/complexity.md): the mistake is accounting for
only one side.

## Mental Model

**Simple is what has few interleaved parts. Easy is what you already know.** When
you choose easy over simple, say that is what you are doing.

## When to Use

- Always as the default: start with the simplest option and add mechanism when it
  demonstrates insufficiency.
- When two solutions meet the requirements and one has fewer parts.
- When the team is small or has turnover — each extra part costs on each new
  person.
- When the requirement may still change: fewer parts is less to undo.

## When Not to Use

**When the simple solution does not meet a stated requirement.** Simplicity is not
an excuse for missing an SLO. If the requirement demands replication, a single
instance is not simple — it is inadequate.

**When "simple" means leaving essential complexity to the operator.** A system with
little logic and a forty-step manual procedure book is not simple; it exported the
complexity.

**When the problem is genuinely complex.** Essential complexity does not disappear
by preference. See [complexity](/01-fundamentals/complexity.md).

**When easy is the disguised criterion.** Choosing the familiar can be right, but
the argument is execution-risk reduction, not simplicity.

## Alternatives

- **The four rules of simple design** (Beck), which give a verifiable criterion.
- **YAGNI** — the same spirit applied to features rather than structure.
- **Explicit complexity accounting** — listing what the decision adds and removes.

## Trade-offs

| Simpler | More mechanism |
|---|---|
| Less to understand | Covers more cases |
| Fewer failure modes | Absorbs anticipated variation |
| Change requires altering code | Change is configuration |
| May not meet a real requirement | Cost paid even without need |

## Failure Modes

**Simplicity that becomes insufficiency.** The simple option was kept past the
point where it stopped meeting the need.

**Apparent simplicity.** Little code, many implicit dependencies.

**Exported complexity.** The system is simple and the operation is complex.

## Common Mistakes

**Confusing simple with easy.** The root of it.

**Using KISS as an argument for not doing what is necessary.** "Let's keep it
simple" is frequently used to avoid work the requirement demands.

**Measuring simplicity in lines.** Density is not simplicity.

**Applying it only to code.** Operations, deployment and the data model have
complexity too, and frequently more.

## Real-World Example

A team needed to schedule recurring tasks. Two proposals.

**A** — Introduce a workflow orchestrator. Familiar to two engineers who had used
it before.

**B** — A schedule table and a process that queries it every minute.

Counting parts: A brought an additional service, its own database, a workflow
definition language, a permissions model and one more component on call. B brought
a table and a loop.

A was easier for two of the eight engineers. B was simpler for all of them.

The team chose B, with a recorded condition: *if a need arises for dependencies
between tasks, conditional branching or reprocessing of history, A starts to win*.

Two years later, the condition has not materialized. The table has 40 lines of code
and nobody thinks about it.

What would have made the decision wrong: if the real requirement had included
dependencies between tasks from the start. There B would not be simple — it would
be insufficient, and would have become a badly built orchestrator by accumulation.

## The simplicity nobody counts

The simplicity discussion almost always stops at the code. The three dimensions
usually left out weigh more in the total cost.

**Operational simplicity.** How many things have to be up for the system to work?
How many alerts exist? How many people can diagnose an incident at three in the
morning? An elegant architecture that requires specialist knowledge to operate is
not simple — it moved the complexity somewhere it costs more.

**Deployment simplicity.** How many steps, how much coordination between
components, how long until you can roll back. A system whose rollback requires
three people and a runbook has complexity that appears in no code metric.

**Cognitive simplicity of entry.** How long a new person takes to make their first
change safely. It is the most honest of the three, because it does not depend on
whoever is already adapted to the system — and it is the only one that degrades
silently as the team gets used to things.

All three degrade without showing up in code review, which is where most teams look
for simplicity.

## Related Concepts

- [Complexity](/01-fundamentals/complexity.md) — the accounting of both sides.
- [YAGNI](/02-software-design/yagni.md) — the same principle applied to features.
- [Design Heuristics](/02-software-design/design-heuristics.md) — verifiable
  criteria.

## Practical Exercise

Take a component of your system and count: how many parts does the reader need to
know to change it? How many execution paths? How many things change if one changes?

Then do the same count for the most direct alternative that would solve the same
problem today. The difference is the price of the flexibility you are paying for.

## Interview Questions

- What is the difference between simple and easy?
- How do you measure simplicity in a way two people would agree on?
- When is the simple solution the wrong one?

## Further Exploration

- Hickey, Rich. *Simple Made Easy*, Strange Loop 2011.
- Ousterhout, John. *A Philosophy of Software Design*. Yaknyam Press, 2018.
- Beck, Kent. *Extreme Programming Explained*. 2nd ed., 2004 — the four rules of
  simple design.

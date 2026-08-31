---
id: dry
title: DRY
sidebar_position: 2
description: Don't repeat knowledge — and why the common reading, about repeating text, does more damage than duplication.
doc_type: concept
level: 2
difficulty: beginner
status: complete
objective: >
  By the end, the reader distinguishes duplication of knowledge from textual
  coincidence and knows when duplicating is the correct decision.
prerequisites: [fundamentals]
related: [kiss, yagni, code-smells]
canonical_for: [DRY, knowledge duplication]
translated_from_version: 1
last_reviewed: 2026-08-31
---

# DRY

## Overview

DRY — *Don't Repeat Yourself* — is formulated by Hunt and Thomas as:

> Every piece of knowledge must have a single, unambiguous, authoritative
> representation within a system.

The word doing the work is **knowledge**. It is not about text. Two identical
snippets representing independent decisions do not violate DRY; one snippet
representing the same rule written twice does, even if the wording differs.

## Problem

The popular reading — "don't repeat code" — does more damage than the duplication
it means to avoid.

The pattern is recognizable. Someone notices two similar snippets and extracts a
common function. Months later, one of the two cases needs to change. The function
gains a boolean parameter. Then another. In the end it has five configuration
parameters, no caller uses the same combination, and nobody can change it without
checking every use.

What happened: the two snippets were **coincidentally alike**, not the same
decision. Unifying them coupled two things that needed to evolve separately.

Sandi Metz's rule sums it up: **duplication is far cheaper than the wrong
abstraction.**

## Core Concepts

### Knowledge, not text

Two questions separate the cases:

1. If this rule changes, do both places change together, always?
2. Is there a single business decision behind the two?

Two "yes" answers indicate duplication of knowledge — unify. Any "no" indicates
coincidence — leave them apart.

| Situation | Verdict |
|---|---|
| A tax rate in two calculations | Knowledge duplication — unify |
| Two email format validations | Duplication — unify |
| Two structures with the same five fields, in different contexts | Coincidence — leave |
| Two retry routines with the same shape, for different services | Probably coincidence |

The third case is the most deceptive. `OrderDTO` and `OrderEntity` with identical
fields look like duplication. They are not: one represents the external contract,
the other the internal model, and they will diverge at the first API change.

### The rule of three

Wait for the third occurrence before abstracting.

Two occurrences do not distinguish coincidence from knowledge — the similarity may
be accidental. The third reveals the real shape, and what varies between the three
is exactly what the abstraction needs to parameterize.

### DRY crosses boundaries at a cost

Unifying knowledge inside one module is cheap. Unifying across modules creates
coupling; across services, it creates a shared library, which couples the release
cycles of different teams.

That is why one of the recurring trade-offs is
[coupling versus duplication](/20-trade-offs/index.md), and why mature teams
frequently **choose to duplicate** across bounded contexts.

## Where knowledge duplication hides

Code duplication is visible: tools detect it. Knowledge duplication frequently has
no line in common, and it is the kind that causes silent bugs.

**Between code and database.** A uniqueness constraint in the schema and a
validation in the application express the same rule. When the rule changes, both
have to change — and it is common for one to be left behind.

**Between code and configuration.** A default value in the code and another in the
configuration file. Nobody knows which wins until the incident.

**Between code and documentation.** A rule described in the operator's manual and
implemented subtly differently.

**Between services.** Two services replicating the same business validation, each
on its own, because sharing would couple the teams. Here duplication may be the
correct decision — but it has to be deliberate and noted, not accidental.

**Between code and test.** A test that reimplements the logic it checks always
passes, including when both are wrong for the same reason.

The common pattern: the further apart the two places, the less visible the
duplication and the greater the chance they diverge without anyone noticing.

## Mental Model

**Ask whether the two places change for the same reason.** It is the same question
as [cohesion](/01-fundamentals/cohesion.md) and
[separation of concerns](/01-fundamentals/separation-of-concerns.md), applied to
duplication.

## When to Use

- When the same business rule is written in more than one place.
- When forgetting to update one of the places would produce a silent bug.
- When the third occurrence has appeared and the shape has stabilized.
- Inside a single module, where the cost of unifying is low.

## When Not to Use

**When the similarity is coincidence.** The most common case and the most expensive
to get wrong.

**Across bounded contexts.** Two representations of "customer" in different
contexts should diverge. Unifying them produces a model that serves neither well.

**When unifying requires configuration parameters.** Each boolean added to an
extracted function is evidence that the cases were not the same.

**Across services, via a shared library.** The cost is release coupling between
teams. Sometimes it is worth it; frequently it is not, and it is almost never
accounted for.

**With only two occurrences.** Wait for the third.

## Alternatives

- **Deliberate, annotated duplication** — duplicate, with a comment saying why and
  which condition would lead to unifying.
- **Extract only what is stable** — unify the invariant core and leave the edges
  duplicated.
- **A shared contract without shared code** — publish a schema instead of a
  library.

## Trade-offs

| Unify | Duplicate |
|---|---|
| One source of truth | Each side evolves freely |
| Consistent change by construction | Risk of diverging unnoticed |
| Less code | More code |
| Coupling between the uses | Independence |
| High cost if the abstraction is wrong | Low cost to reverse |

The decisive asymmetry: undoing duplication is easy; undoing the wrong abstraction
is expensive, because others already depend on it.

## Failure Modes

**Abstraction with configuration parameters.** The most reliable sign of improper
unification.

**Shared library as a bottleneck.** Every change to it requires coordinating
releases across several teams.

**Silent divergence.** The opposite case: real knowledge duplication, one side
updated, the other not, and nothing warns.

**Unification by structural similarity.** Two things with the same shape and
different meanings.

## Common Mistakes

**Reading DRY as "don't repeat code".** The root of everything.

**Extracting at the second occurrence.** Too early to distinguish.

**Treating `OrderDTO` and `OrderEntity` as duplication.** They are different layers
with different reasons for change.

**Applying DRY across bounded contexts.** It is where the cost is highest and the
benefit lowest.

**Not annotating deliberate duplication.** Without a record, the next developer
"fixes" it.

## Real-World Example

A system had discount calculation in two places: in the cart, to show the customer,
and at checkout, to charge.

A refactoring unified the two into `DiscountCalculator`. Correct: it was the same
business rule, and a divergence between displayed and charged would be a serious
bug.

In the same system, another refactoring unified the delivery address validation
with the billing address one — same structure, same fields.

Eleven months later, the billing address started accepting a PO box and the
delivery address did not. The validating function gained
`allowsPostBox: boolean`. Then billing started accepting foreign addresses:
`allowsInternational: boolean`. In the end, four parameters and no two callers with
the same combination.

Separating them would have been trivial at the first divergence. At the fourth, it
required understanding every combination in use.

The two cases looked textually alike. Only one was duplicated knowledge.

## Related Concepts

- [Cohesion](/01-fundamentals/cohesion.md) — the same question about reason for
  change.
- [Abstraction](/01-fundamentals/abstraction.md) — the cost of abstracting early.
- [Coupling vs. Duplication](/20-trade-offs/index.md) — the trade-off in detail.
- [Code Smells](/02-software-design/code-smells.md) — how to recognize the
  symptoms.

## Practical Exercise

Find a function in your system with three or more boolean parameters.

List the callers and the combinations each one uses. If no combination repeats, the
function unified cases that were not the same.

Then answer: would splitting it into distinct functions produce duplication of
knowledge or only of text?

## Interview Questions

- What is the correct formulation of DRY?
- How do you distinguish knowledge duplication from coincidence?
- Why is "duplication cheaper than the wrong abstraction"?

## Further Exploration

- Hunt, Andrew; Thomas, David. *The Pragmatic Programmer*. 2nd ed.,
  Addison-Wesley, 2019 — the original formulation.
- Metz, Sandi. *The Wrong Abstraction*, 2016.

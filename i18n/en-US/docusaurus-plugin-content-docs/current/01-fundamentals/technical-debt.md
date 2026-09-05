---
id: technical-debt
title: Technical Debt
sidebar_position: 18
description: Future cost taken on consciously — and why almost everything given that name is not debt.
doc_type: concept
level: 1
difficulty: intermediate
status: complete
objective: >
  By the end, the reader distinguishes deliberate debt from poor work and decides
  when to pay based on the observed interest.
prerequisites: [complexity]
related: [architecture-evolution, dependency-management]
canonical_for: [technical debt]
translated_from_version: 2
last_reviewed: 2026-08-30
---

# Technical Debt

## Overview

Technical debt is the future cost taken on by choosing a faster solution now
instead of the adequate one.

The metaphor is Ward Cunningham's and has a part that is almost always lost: debt
presupposes a **conscious decision** and an **intention to pay**. Without both, it
is not debt — it is poor work, which is a different thing and is treated
differently.

## Problem

"Technical debt" has become the name for everything that is bad in the code. That
destroys the concept's usefulness in two ways.

First, it makes the problem non-actionable. If debt covers everything from a
deliberate two-week shortcut to a system built without understanding the domain,
no decision about the whole is possible.

Second, and worse: the name lends legitimacy. Debt is a respectable financial
decision. Calling what was done out of ignorance "debt" turns a capability problem
into a strategic choice nobody made.

The question that separates the cases: **did someone decide this knowing the
cost?** If yes, it is debt. If not, it is something else — and that something else
is not paid off by refactoring, it is resolved by learning.

## Core Concepts

### The quadrant

Martin Fowler classifies debt on two axes: deliberate or inadvertent, prudent or
reckless.

| | Prudent | Reckless |
|---|---|---|
| **Deliberate** | "We ship now and refactor later — we know the cost" | "We don't have time for design" |
| **Inadvertent** | "Now that we're done, we know how it should have been" | "What's layered design?" |

Only the top-left quadrant is debt in the useful sense. The bottom-right is a lack
of competence. The top-right is recklessness. The bottom-left is learning — and it
is inevitable and healthy.

Treating all four with the same word prevents treating each with the correct
response.

### Interest

The cost of debt is not the effort of fixing it. It is the **interest**: the extra
cost of every change while it exists.

That changes the decision about when to pay. Debt in code nobody touches has zero
interest — it is debt with no running cost, and paying it is pure expense. Debt in
the path of every change has high interest and pays back quickly.

The operational question is not "is this bad?" but **"how much is this costing us
per month?"**. An ugly, stable module loses to a mediocre one on the critical path.

### Architectural debt

Debt at the code level is local and paid off by refactoring. Architectural debt — a
boundary in the wrong place, an inadequate data model, a structural coupling — is
not paid off incrementally with the same ease.

Its interest is also higher: it affects every change that crosses the wrong
boundary, not just whoever touches that file.

It is the kind that matters most in architecture and the one that appears least in
teams' debt lists, because it is not visible in code metrics.

### Deliberate debt needs a record

Debt taken on and not recorded is indistinguishable, six months later, from poor
work. Nobody remembers it was a decision, nobody knows what the alternative was,
and the condition under which it was to be paid is lost.

The minimum record: what was done, what would have been done with more time, and
**under what condition it is worth paying**. That belongs in an
[ADR](/18-architecture-decisions/what-is-an-adr.md) when the debt is architectural.

## Mental Model

**Technical debt is a financing decision.** You borrow time now and pay it back
with interest later.

Like any financing decision, it can be sensible. Bringing a launch forward to
validate a market may be worth months of interest. What is not sensible is
borrowing without knowing the rate.

## When to Use

Taking on debt deliberately makes sense when:

- **The missing information is worth more than the cost.** Building the right thing
  requires knowing what will be used; a shortcut that produces that learning pays
  for itself.
- **There is a window with an external consequence.** An event, a regulatory
  obligation, a competitor.
- **The code can be thrown away.** Debt in something that will probably be
  discarded never comes due.
- **The interest is low and known.** A shortcut in a peripheral, stable module.

## When Not to Use

**When there is no plan or condition for paying.** Debt with no intention to pay is
just a bad decision with a better name.

**In the foundation.** Debt in the data model, in the main boundaries or in the
public contract has interest that grows with the system and is the most expensive
to pay. A shortcut there rarely pays off.

**When "later" is structurally unlikely.** If the team has never had room to pay
earlier debt, taking on more is not financing — it is accumulation.

**When the correct alternative costs barely more.** If doing it right costs two
extra days, there is no debt to discuss.

## Alternatives

- **Reduce the scope** — deliver less, done well. Frequently better than delivering
  everything with a shortcut, and rarely considered.
- **Discard explicitly** — build knowing it will be thrown away, without pretending
  it becomes production.
- **Negotiate the deadline** — the alternative engineering exercises least.

## Trade-offs

The axis is **speed now versus cost of change later**.

| Take on the debt | Do the adequate thing |
|---|---|
| Ships sooner | Ships later |
| Learns from real usage earlier | Builds on assumption |
| Interest on every future change | No interest |
| Risk of never paying | Full cost paid now |
| Can be discarded with no loss | The investment may be wasted |

Note the symmetry: doing the adequate thing can also be waste, if what was built
well ends up discarded. Neither side is free.

## Failure Modes

**Debt that becomes permanent.** "Later" never arrives. The system is built on top
of the shortcut, and removing it comes to require touching everything that came
afterwards.

**Compound interest.** Each new feature works around the debt instead of fixing it,
and the workaround becomes debt too. The cost grows at an accelerating rate.

**Invisible debt.** Not recorded, not measured, noticed only as "the system is slow
to change" — with no identifiable cause.

**Refactoring without a criterion.** Paying the wrong debt. Teams spend quarters
improving low-interest code because it was the most visible or the most
uncomfortable.

## Common Mistakes

**Calling everything technical debt.** It dissolves the concept and legitimizes
what was done out of ignorance.

**Prioritizing by what is most annoying.** The ugliest code is rarely the most
expensive. Prioritize by what appears in the path of frequent changes — the commit
history tells you that better than impressions do.

**Asking for "a technical debt sprint".** It treats the symptom. Without
understanding why the debt accumulates, it comes back at the same rate.

**Not recording the decision.** Without a record, debt becomes a mystery in six
months.

**Taking on debt in the foundation.** It is where interest is highest and payment
most expensive.

## Real-World Example

A team needed to ship recurring billing in six weeks for a commercial window. The
adequate model required a subscription state machine, retry handling and
reconciliation — estimated at eleven weeks.

The debt taken on: a simple status field, no history, with the billing attempt in a
scheduled job with no structured retry.

**What was done differently from the usual:** they recorded an ADR with what was
done, what would have been done, and the payment condition — *"when volume passes 5
thousand active subscriptions or when the billing failure rate requires per-attempt
analysis"*.

Fourteen months later, the second condition materialized. The team had the record,
the alternative already sketched, and the argument ready for prioritizing. The
conversation with product took one meeting instead of a quarter of negotiation.

The contrast is worth more than the case: the same system had eight other known
"debts", none recorded. None of them was paid, and nobody could say which was the
most expensive.

The difference was not in the quality of the original decision. It was in the
record.

## Related Concepts

- [Complexity](/01-fundamentals/complexity.md) — the form accumulated debt takes.
- [Architecture Evolution](/01-fundamentals/architecture-evolution.md) — how the system changes over
  time.
- [ADRs](/18-architecture-decisions/what-is-an-adr.md) — where deliberate debt is
  recorded.

## Practical Exercise

List what your team calls technical debt. Classify each item into the four
quadrants.

For the deliberate ones, is there a record of the decision and of the payment
condition?

For all of them, estimate the interest: how many times in the last six months did
someone pay an extra cost because of it? The zero-interest ones can stay.

## Interview Questions

- What distinguishes technical debt from badly written code?
- How do you prioritize what to pay?
- When is taking on debt deliberately the correct decision?

## Further Exploration

- Cunningham, Ward. *The WyCash Portfolio Management System*, OOPSLA 1992 — the
  original metaphor.
- Fowler, Martin. *Technical Debt Quadrant*, 2009.
- Tornhill, Adam. *Software Design X-Rays*. Pragmatic Bookshelf, 2018 — measuring
  interest from change history.

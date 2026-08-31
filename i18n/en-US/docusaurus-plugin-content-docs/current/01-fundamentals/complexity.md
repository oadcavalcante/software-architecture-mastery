---
id: complexity
title: Complexity
sidebar_position: 17
description: Essential complexity comes from the problem; accidental complexity from our choices — and only one of them is removable.
doc_type: concept
level: 1
difficulty: intermediate
status: complete
objective: >
  By the end, the reader distinguishes essential from accidental complexity and
  judges whether a decision reduces it or merely relocates it.
prerequisites: [abstraction]
related: [technical-debt, modularity]
canonical_for: [complexity, essential complexity, accidental complexity]
translated_from_version: 1
last_reviewed: 2026-08-29
---

# Complexity

## Overview

Complexity is what makes a system hard to understand and hard to change.

The distinction that organizes the subject, formulated by Fred Brooks in 1986:
**essential complexity** comes from the problem and cannot be eliminated;
**accidental complexity** comes from how we chose to solve it, and can be.

Much of architectural work is reducing the second without pretending the first
does not exist.

## Problem

Complexity is not noticed while it accumulates. Every decision that adds it is
locally defensible: one more configuration option, one more layer, one more
special case, one more service.

The effect is compound, not additive. Two independent configuration flags produce
four possible combinations; ten produce a thousand. Nobody decides to create a
thousand paths — they appear.

The late symptom is characteristic: simple changes take weeks, nobody can predict
the effect of an alteration, and new people take months to become productive. At
that point the complexity is structural and reducing it is a project.

## Core Concepts

### Essential and accidental

**Essential** is the complexity of the problem. A payroll system is complex
because labour legislation is complex. No technical choice removes that; the most
you can do is not add more.

**Accidental** is what we introduce: an unnecessary framework, an abstraction that
does not pay for itself, configuration for variation that does not exist, a
separate service without a reason, speculative generality.

The practical test: *if I solved this problem from scratch, with full knowledge,
would this part exist?* If not, it is accidental.

### Complexity relocates

The most common reasoning error about complexity is believing it was removed when
it merely moved.

Extracting a service reduces the complexity of the code on each side and adds
complexity in networking, deployment, observability and partial failure.
Introducing a queue removes temporal coupling and adds ordering, duplication and
dead letters.

None of those trades is wrong. The error is accounting for only one side — which
produces the pattern of decisions that appear to simplify and complicate.

### Where complexity hurts

Complexity in an isolated place is tolerable. Scattered complexity is what kills.

Ousterhout puts it well: the worst symptom is **distributed cognitive load** —
when understanding one part requires knowing many others. A dense, self-contained
module is preferable to ten simple modules whose interaction is unpredictable.

That means reducing complexity is not always dividing. Sometimes it is
concentrating.

### Accidental complexity has a half-life

A decision that adds accidental complexity is rarely reversed. It becomes part of
the system, gains code that depends on it, and the cost of removing it grows.

That is why the moment to resist is at introduction, not later.

## Mental Model

**Every architectural decision adds or removes complexity. Account for both
sides.**

For any proposal: what does it remove, what does it add, and is the balance
positive given the context? Whoever proposes usually states only the first term.

## When to Use

Adding complexity is justified when:

- It reduces exposed essential complexity — an abstraction that genuinely hides.
- It is required by a real, stated quality requirement — replication for
  contracted availability.
- It replaces greater complexity — a mature framework instead of equivalent
  in-house code.
- The cost of not adding it is greater and already observable, not hypothetical.

## When Not to Use

**When the benefit is hypothetical.** "We'll need this when we scale" is the
standard formulation of accidental complexity. With no date and no number, there
is no requirement.

**When it merely relocates.** If the proposal removes complexity from one place
and adds an equivalent amount elsewhere, the balance is the cost of the
transition.

**When the team cannot operate the result.** A correct architecture that demands
competence the team does not have is accidental complexity by definition — it
exists by choice, not because of the problem.

**When the simple alternative has not yet failed.** The correct order is to use
the simple option until it demonstrates insufficiency. Anticipating the failure of
the simple option is guessing with a cost.

## Alternatives

- **Not doing it** — always an option, with measurable cost and benefit.
- **Doing it manually** — automating a rare process can cost more than performing
  it by hand.
- **Deferring** — keeping the option open without paying for it now.
- **Removing something** — reducing scope instead of adding mechanism. It is the
  least considered alternative and frequently the best.

## Trade-offs

The axis is **capability versus cognitive and operational cost**.

| More mechanism | Less mechanism |
|---|---|
| Covers more cases | Covers the common case |
| Absorbs anticipated changes | Change requires altering code |
| More parts to understand and operate | The system fits in your head |
| More failure modes | Fewer things that break |
| Cost paid now | Cost paid if needed |

## Failure Modes

**Combinatorial explosion of configuration.** Each flag doubles the state space.
With ten flags, nobody tests all combinations and some have never been executed.

**Distributed complexity.** No part is complex; the whole is incomprehensible
because the interactions are documented nowhere.

**An abstraction that does not hide.** It adds a level without reducing what you
need to know. See [abstraction](abstraction.md).

**Invisible operational complexity.** The architecture is elegant on the diagram
and requires three people to operate. The cost does not appear in the code.

**A framework larger than the problem.** The tool brings complexity of its own
greater than that of the problem it solves.

## Common Mistakes

**Confusing simple with easy.** Easy is familiar; simple is having few
intertwined parts. A familiar tool can be complex; an unfamiliar one can be
simple.

**Justifying complexity with future scale.** Without a number and a date, it is
guesswork. And we guess badly: the scale that arrives rarely has the shape
predicted.

**Accounting only for what the decision removes.** See above. It is the most
common bias in architectural proposals.

**Ignoring operational complexity.** It appears neither in the code nor in the
diagram, and is frequently the largest component of total cost.

**Believing more small parts is always simpler.** Ten simple services with
unpredictable interactions are more complex than one dense module.

## Real-World Example

A team proposed extracting report processing into a separate service, arguing it
would isolate load.

Accounting for both sides:

*Removes* — the report load leaves the main process, and deploying reports no
longer requires deploying the rest.

*Adds* — one more pipeline, one more set of alerts, authentication between
services, handling unavailability of the report service, either a copy of the data
or remote access to it, and one more thing on call.

The balance depended on a question nobody had asked: how much of the load was
reporting?

The measurement answered 4%, concentrated in two unindexed queries.

With the indexes fixed, the load dropped to 0.3% and the proposal lost its
rationale. The cost of the separate service — permanent, operational, spread
across the whole team — would have been paid to solve a problem that one migration
solved.

What is worth keeping is not that extracting a service is bad. It is that the
decision was being made with one side of the ledger, and measuring cost an
afternoon.

## Related Concepts

- [Abstraction](abstraction.md) — the tool that reduces or adds complexity.
- [Technical Debt](technical-debt.md) — accumulated accidental complexity.
- [Trade-offs](/20-trade-offs/index.md) — the accounting of both sides.

## Practical Exercise

List five mechanisms in your system — a queue, a cache, an abstraction layer, a
flag, a separate service.

For each: what problem does it solve? Is that problem observable today or was it
anticipated? If we removed it, what would concretely break?

The ones you cannot answer with an observable problem are candidates for
accidental complexity.

## Interview Questions

- What is the difference between essential and accidental complexity?
- How do you judge whether a decision reduces complexity or merely relocates it?
- Give an example of a decision that seemed to simplify and complicated.

## Further Exploration

- Brooks, Fred. *No Silver Bullet*, 1986 — the essential/accidental distinction.
- Ousterhout, John. *A Philosophy of Software Design*. Yaknyam Press, 2018.
- Moseley, Ben; Marks, Peter. *Out of the Tar Pit*, 2006 — complexity arising from
  state.

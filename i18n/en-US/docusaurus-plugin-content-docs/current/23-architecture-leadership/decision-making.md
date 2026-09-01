---
id: decision-making
title: Decision-Making
sidebar_position: 4
description: Deciding with insufficient information is the norm — and deferring has a cost nobody accounts for.
doc_type: concept
level: 7
difficulty: advanced
status: complete
objective: >
  By the end, the reader decides under uncertainty using reversibility and the cost of deferring
  as criteria, and records the condition that would change the decision.
prerequisites: [architecture-leadership-basics]
related: [negotiating-tradeoffs, risk-management, cross-team-architecture]
canonical_for: []
translated_from_version: 1
last_reviewed: 2026-08-31
---

# Decision-Making

## Overview

Architectural decisions are made with insufficient information. That is not an anomaly to fix — it
is the normal condition, and the role requires operating within it.

```text
waiting for more information   invisible cost: time, blocked work,
                               opportunity
deciding now                   visible cost: the risk of being wrong
```

The asymmetry in visibility is what produces the wrong behavior. A decision error is attributed to
whoever decided; a month lost waiting for information is attributed to nobody.

That is why the useful criterion is not "do I have enough information?" — it is **"is the cost of
deferring greater than the risk of being wrong?"**.

## Problem

Two opposite patterns.

**Paralysis.** The decision waits for an analysis, which waits for a data point, which waits for a
survey. Meanwhile, teams proceed with divergent approaches, and the decision that would have been
easy in January becomes expensive in September because three systems have already been built.

**A hasty decision on something irreversible.** The opposite: deciding quickly on something
expensive to undo, without the analysis the consequence justified.

Both errors come from the same failure: **not distinguishing decisions by the cost of reversal**.
Applying the same rigor to everything produces slowness on the small decisions and carelessness on
the big ones.

## Core Concepts

### Reversibility decides the rigor

```text
reversible in days          decide fast, with little analysis
costly to reverse           analyze, and record the review condition
irreversible in practice    analyze deeply, involve whoever owns
                            the risk, and consider a path
                            that preserves the option
```

Jeff Bezos called the two ends one-way and two-way door decisions. The useful observation is not
the taxonomy — it is that most decisions are two-way doors and get one-way door treatment.

See [context in an ADR](/18-architecture-decisions/adr-context.md).

### The cost of deferring is calculable

It is almost never calculated, and it is frequently large:

```text
how many people are blocked by this decision?
for how long?
what is being built meanwhile, and will have to change?
what is the market window, if any?
does the cost of reversal grow with time?
```

The last question is the most important. Architectural boundary decisions get exponentially more
expensive to make as code is built on top of their absence.

```text
deciding the boundary now        one discussion
deciding in six months           one discussion + migrating three systems
```

### Declare the information that would decide it

When the decision is deferred, deferring it with no criterion is the error:

```text
bad    "let's wait until we have more clarity"
good   "I will decide when we have the partner's latency
       measurement, which comes out in two weeks. If it doesn't come
       by then, I decide on option X, which is the most conservative."
```

That turns deferral into a plan. And it forces the useful question: is the missing information
actually going to arrive, and would it change the decision?

Frequently the honest answer is no — the information wasn't coming, or wouldn't change anything —
and in that case the deferral is avoidance.

### Decide at the right level

```text
whoever has the context        decides better
whoever has the consequence    has to agree
whoever has the authority      does not necessarily have to decide
```

An architect who decides what a team should decide steals context and creates dependency. A team
that decides what crosses teams creates divergence.

See [federated governance](/19-architecture-governance/federated-governance.md).

### Record the review condition

```text
"we chose X. Reassess if the volume exceeds 3 thousand per second,
 or if the partner improves availability above 99.9%."
```

That changes the decision's nature: it stops being permanent and becomes conditional. The future
review becomes verifying a condition, and not a new discussion.

See [alternatives in an ADR](/18-architecture-decisions/adr-alternatives.md) and
[superseding](/18-architecture-decisions/superseding-decisions.md).

### Decisions that preserve options are worth more

Faced with real uncertainty, a decision that keeps paths open is worth more than the best bet:

```text
"we don't know whether the volume will grow 10× or stay flat.
 Instead of choosing the architecture for one of the scenarios, I choose
 the one that meets the current scenario and doesn't prevent the other — the cost
 of keeping the option is low, and the information arrives in six months."
```

That is different from deferring: the decision is made, and it is chosen for preserving flexibility
where uncertainty is high. See
[simplicity vs. flexibility](/20-trade-offs/simplicity-vs-flexibility.md).

### Not deciding is a decision

And it is usually the worst one, because it is made by omission:

```text
"we didn't decide on the communication standard between services"
result: each team chose, and now there are four
```

The state that results from the absence of a decision is rarely neutral. Recognizing that — "if we
don't decide, this is what will happen" — frequently resolves the paralysis, because it makes
visible that the alternative to the risk of being wrong is not safety, it is another outcome.

## Mental Model

**Is the cost of deferring greater than the risk of being wrong?** If so, decide with what you
have, declare the premises and record the condition that would change the decision.

## When to Use

- Whenever there is a pending decision with people blocked.
- Classifying by reversibility first.
- With the deciding information declared, when deferral is justified.

## When Not to Use

**With the same rigor for everything.**

**Deferring with no criterion** — "when we have clarity" is not a plan.

**Deciding what someone else should decide.**

**With no review condition.**

**Ignoring that not deciding produces an outcome.**

## Alternatives

- **A temporary decision with a date** — choosing for three months and reassessing, when the
  uncertainty is genuine and the cost of reversal is low.
- **A pilot** — deciding with evidence instead of with analysis.
- **Delegating** — when whoever has the context can decide.
- **The least-regret decision** — the one that produces the least bad worst outcome, under high
  uncertainty.

The last is useful when the scenarios are very different and none is clearly likely.

## Trade-offs

| Deciding early | Waiting for information |
|---|---|
| Unblocks | Less risk of error |
| Risk of being wrong | Invisible cost of delay |
| Reversible if small | Divergence accumulates |

| High rigor | Proportional rigor |
|---|---|
| Fewer errors on big decisions | Speed on small ones |
| Generalized slowness | Requires classifying |

## Failure Modes

**Paralysis.** Divergence accumulates while you wait.

**Uniform rigor.** Slow on the small, careless on the big.

**Deferral with no criterion.** Disguised avoidance.

**A decision at the wrong level.** Context or consequence misaligned.

**No review condition.** The decision becomes permanent.

**Omission treated as neutrality.**

## Common Mistakes

**Not calculating the cost of deferring.**

**Not asking whether the missing information would change the decision.**

**Applying a heavy process** to reversible decisions.

**Deciding alone** what crosses teams.

**Not recording** premises and the review condition.

## Real-World Example

A financial services company had a decision pending for seven months: which asynchronous
communication standard to adopt between services. Three technical options were on the table, and
the comparative analysis was redone every two months with new data.

Meanwhile:

```text
teams that needed asynchronous communication            6
that decided on their own and implemented               4
distinct technologies in production                     3
integration adapters built                              7
```

The decision that would have been about one technology in January became a migration of four
systems in August.

What unblocked it was a question asked in a quarterly review: **"what information do we still not
have that would change the choice?"**

The honest answer was: none. The three options had been evaluated exhaustively, and the difference
between them was small compared with the cost of continuing without deciding. The analysis was
being redone because deciding felt risky, not because information was missing.

The decision was made in a 40-minute meeting, with three elements recorded:

```text
choice         the option with the most internal experience, not the
               technically superior one by a narrow margin
premises       volume below 20 thousand messages/s; no
               need for historical reprocessing
review
  condition    reassess if the volume exceeds 20 thousand/s or if
               a reprocessing requirement appears
```

And migrating the three divergent systems was funded centrally, with a nine-month deadline.

What the organization changed in its decision process:

**Mandatory classification by reversibility.** Decisions reversible in days came to be made by the
team, with no formal analysis. The irreversible ones kept the complete process.

**The cost of deferring calculated** for every decision pending more than 30 days: how many people
are blocked, what is being built on top of the decision's absence, and how the cost of reversal
grows.

**The standard question** — "what missing information would change the choice?" — built into the
reviews. When the answer is "none", the decision is made in that same meeting.

**Temporary decisions permitted.** For cases of genuine uncertainty, choosing for a fixed period
and reassessing became a legitimate option, instead of deferring.

Eighteen months later:

```text
average time for pending architectural decisions from 11 weeks to 3
decisions reversed for having been premature     2
estimated cost of those two reversals            ~$68 thousand
estimated cost of the previous paralysis, in the
  asynchronous communication case                ~$420 thousand
```

The last pair of numbers became the internal argument for the change: two wrong decisions cost a
sixth of what one deferred decision had cost.

The recorded lesson: the question "what information would change the choice?" is the cheapest
instrument in the set. It takes seconds and, most of the time, the honest answer reveals that the
deferral was not about information.

## Related Concepts

- [Negotiating Trade-offs](/23-architecture-leadership/negotiating-tradeoffs.md).
- [Risk Management](/23-architecture-leadership/risk-management.md).
- [Context in an ADR](/18-architecture-decisions/adr-context.md) — reversibility.
- [Superseding](/18-architecture-decisions/superseding-decisions.md).

## Practical Exercise

List the pending architectural decisions in your context and, for each one, answer: how many people
are blocked, and what missing information would change the choice.

The ones with no answer to the second question can be decided today.

## Interview Questions

- Why is the cost of deferring systematically underestimated?
- Why do most decisions get the rigor of an irreversible decision?
- Why does "not deciding" produce an outcome, and not neutrality?

## Further Reading

- Bezos, Jeff. *2015 letter to shareholders* — one-way and two-way door decisions.
- Kahneman, Daniel. *Thinking, Fast and Slow*. Farrar, Straus and Giroux, 2011.
- Ford, Neal et al. *Fundamentals of Software Architecture*. O'Reilly, 2020.

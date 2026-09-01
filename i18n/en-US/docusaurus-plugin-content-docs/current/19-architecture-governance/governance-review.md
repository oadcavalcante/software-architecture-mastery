---
id: governance-review
title: Review as an Instrument
sidebar_position: 2
description: Early with no veto, or late with no effect — a review only works at one of the two moments.
doc_type: concept
level: 6
difficulty: advanced
status: complete
objective: >
  By the end, the reader runs reviews that improve decisions instead of approving them, with
  a defined agenda, moment and output.
prerequisites: [governance-basics]
related: [governance-basics, governance-pathologies, exceptions]
canonical_for: []
translated_from_version: 1
last_reviewed: 2026-08-31
---

# Review as an Instrument

## Overview

Architecture review is the most used governance mechanism and the most frequently badly
designed. The flaw is almost always in **when** it happens, not in who takes part or in what
is discussed.

```text
early, with no veto power     improves the decision
late, with veto power         approves the inevitable
late, with no veto power      ritual
early, with veto power        nobody brings anything early
```

Only the first combination has any effect. And it is the least chosen, because it looks like
the weakest — a review with no formal authority sounds like a review with no consequence.

Practice shows the opposite: the authority to veto is what pushes the review to the end,
where there is nothing left to improve.

See [architecture review](/15-enterprise-architecture/architecture-review.md) for the
formats; here the focus is review as an instrument of governance.

## Problem

A review with veto power creates incentives that hollow it out:

```text
the team avoids bringing it early    an incomplete design may be rejected
brings it when it is finished        when changing is expensive
prepares for approval                presents the solution, not the problem
omits the real doubts                a doubt becomes ammunition
the reviewer inherits the cost of no and therefore almost never says no
```

The result is a meeting in which everyone knows the decision has already been made, and whose
output is minutes.

There is a second, opposite problem: the review with no agenda. It becomes an open
conversation about the whole design, consumes two hours, generates thirty comments of unequal
weight, and the team leaves without knowing what is blocking and what is preference.

## Core Concepts

### Early means before there is code

```text
far too late   the design is implemented
too late       the design is detailed and internally approved
good           there is a direction and two or three real doubts
better still   there is the problem and a sketch
```

The highest-value review happens when the team still **has doubts**. A genuine doubt is the
sign that there is room for influence.

That requires bringing something incomplete to be safe — which is incompatible with a veto.

### Advice, not a gate

```text
gate     decides whether you may proceed
advice   improves the decision of whoever proceeds
```

In the advice model, the decision stays with the team, and the record that the guidance was
given stays with the review. If the team takes a different path, that is legitimate and gets
recorded — in the [ADR](/18-architecture-decisions/what-is-an-adr.md), with the objection preserved.

That record is what replaces formal authority: there is no veto, and there is memory.

And there is a consequence for accountability: whoever decides against the guidance owns the
outcome, which is a stronger incentive than approval.

### A small gate is still necessary

Advice doesn't cover everything. A small set of decisions needs real approval:

```text
regulatory implications
a data format consumed by other teams
an irreversible financial commitment above a threshold
exposure of a new public surface
```

Four classes, not fourteen. Keeping that list short is what makes the gate respected when it
appears.

### An agenda instead of an open conversation

A review with no agenda spends its time on what is easy to comment on, not on what is
important.

```text
what the problem is, with numbers
what decision is being made
what alternatives were considered
what the most expensive consequence is
what the team would like to discuss
```

The last line is the most productive and the most forgotten: asking the team where they have
doubts concentrates the review on the highest-return point.

See [alternatives](/18-architecture-decisions/adr-alternatives.md).

### The output of a review

A review has to produce something beyond conversation:

```text
what is blocking          few items, explicit
what is a recommendation  most of it
what is preference        named as such, and discardable
what was left open        with an owner and a deadline
```

Separating the first three categories solves the most common problem with reviews: comments
of unequal weight presented with the same emphasis, leaving the team with no prioritization
criterion.

And recording that separation is what makes it possible to assess the review afterwards — see
[measurement](/19-architecture-governance/measuring-governance.md).

### Who takes part

```text
whoever decides           the team, always
whoever has the history   architects, people with relevant scars
whoever owns the risk     security, operations, data — where applicable
whoever consumes          affected teams, when there is a contract between them
```

A small group works better. A review with nine people produces comments of education, not of
judgment — every participant feels the need to contribute.

Three to five is the range where a discussion is still a discussion.

### Asynchronous review

An underused format: the design is written, circulated, commented on in writing, and the
meeting only happens if there is disagreement.

```text
better for   distributed organizations, decisions with a lot of context
worse for    open exploration, deep disagreement
effect       it filters: only what needs a conversation becomes a meeting
```

Writing forces clarity, and written comments are quotable later. The cost is latency — and
for architectural decisions, two days of latency is rarely the bottleneck.

## Mental Model

**Early and with no veto.** The authority to say no is what pushes the review to the moment
when there is nothing left to improve.

## When to Use

- Early, while the design is malleable and the team has doubts.
- With an agenda, and with the team setting part of it.
- As advice, with a gate only for a few classes of decision.
- Asynchronously when the context is extensive.

## When Not to Use

**As a gate for everything.**

**After implementation.**

**With no agenda.**

**With a large group.**

**Without separating blocking from recommendation.**

**As the only governance mechanism** — review doesn't scale, and it is corrective by nature.

## Alternatives

- **[Fitness functions](/19-architecture-governance/fitness-functions-governance.md)** — for
  what is verifiable, cheaper and more reliable.
- **Voluntary consultation** — with no formal agenda, on the team's request.
- **Peer review between teams** — with no central role, with a dissemination effect.
- **A template** — when the decision is recurring, the review becomes redundant.

The second has a useful property: the volume of voluntary consultations is a direct indicator
that the mechanism is perceived as useful.

## Trade-offs

| Advice | Gate |
|---|---|
| Brought early | Brought late |
| Improves the decision | Approves what is done |
| No guarantee | With authority |
| Scales better | Becomes a queue |

| Synchronous | Asynchronous |
|---|---|
| Live discussion | Written, quotable |
| Expensive in calendar terms | Greater latency |
| Good for disagreement | Good for extensive context |

## Failure Modes

**A veto that pushes it late.**

**A very high approval rate.** A sign that only the inevitable arrives.

**Comments of unequal weight.** The team doesn't know what is mandatory.

**A large group.** Comments of education.

**No record of the disagreement.** When the risk materializes, nobody knows it was foreseen.

**A queue.** The mechanism becomes the bottleneck it was supposed to prevent.

## Common Mistakes

**Asking for "the finished design"** to review.

**Not asking the team where they have doubts.**

**Mixing preference with blocking.**

**Not recording when the team took a different path.**

**Measuring the review by the number of sessions**, rather than by its effect on decisions.

## Real-World Example

A health technology company had mandatory architecture reviews before implementation started.
Format: a 45-minute presentation, eight fixed participants, a decision to approve or request
adjustments.

A 14-month measurement:

```text
reviews held                                   96
approved in the first session                  81
average time between request and session   11 days
comments recorded per session                  22 on average
comments that produced a change               2.4 on average
cases where the design was already
  implemented on arriving at the review        37 (39%)
```

The 37 cases were investigated. The pattern in the interviews was consistent: teams
implemented beforehand because **the review had the power to block**, and arriving with
something working reduced the chance of a block.

And the 22 comments per session created another problem: no team knew which ones were
mandatory. Three teams reported implementing every comment as a precaution, including style
preferences.

The redesign:

**Review becomes advice** for most decisions. No approval, no blocking.

**Four classes with a real gate**: regulatory implications — relevant in a health data
context — a data format between teams, a financial commitment above a threshold, and new
public exposure.

**A 30-minute session with three participants**, chosen for relevance and not for seniority.

**An agenda with a team item**: half the time is dedicated to the doubts the team brought.

**Comments classified** as blocking, recommendation and preference, with preference
explicitly marked as discardable.

**A record of divergence**: when the team takes a different path from the one recommended,
that goes into the ADR, with the recommendation and the reason for diverging.

Sixteen months later:

```text
voluntary consultations                       188
reviews with a gate                            29
average time to a session                       2 days
designs already implemented on arrival          3 (10% of the 29)
blocking comments per session                 0.7 on average
recorded divergence cases                      14
cases where the divergence proved
  right, assessed afterwards                    9
```

The 9 cases where the team was right against the recommendation were used internally as an
argument for keeping the model. The recorded conclusion: whoever has the context of the
problem is right more often than whoever has the historical context — and the advice model is
the only one that lets you discover that.

A side effect: the voluntary attendance rate gave the architecture group information the
mandatory review never provided. By being approached early, it came to know what was being
built before it was built.

## Related Concepts

- [Governance Basics](/19-architecture-governance/governance-basics.md) — the intervention
  point.
- [Architecture Review](/15-enterprise-architecture/architecture-review.md) — formats.
- [Pathologies](/19-architecture-governance/governance-pathologies.md) — the committee that
  approves everything.
- [Decision](/18-architecture-decisions/adr-decision.md) — recording the divergence.

## Practical Exercise

Measure your context's review approval rate over the last 12 months.

Above 90%, the review is only receiving the inevitable — and the diagnosis is about the
moment it happens, not about who takes part.

## Interview Questions

- Why does veto power push the review to the end of the design?
- What replaces formal authority in an advice model?
- Why does separating blocking from preference change teams' behavior?

## Further Reading

- Ford, Neal et al. *Building Evolutionary Architectures*. 2nd ed. O'Reilly, 2022.
- Skelton, Matthew; Pais, Manuel. *Team Topologies*. IT Revolution, 2019.
- Woods, Eoin. *Democratising Software Architecture*. IEEE Software, 2016.

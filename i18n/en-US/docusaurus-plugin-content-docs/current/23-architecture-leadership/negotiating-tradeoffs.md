---
id: negotiating-tradeoffs
title: Negotiating Trade-offs
sidebar_position: 8
description: Negotiating interests, not positions — and discovering that technical disagreement is rarely technical.
doc_type: concept
level: 7
difficulty: advanced
status: complete
objective: >
  By the end, the reader takes an architectural disagreement through to an agreement, separating
  positions from interests and creating options that weren't on the table.
prerequisites: [decision-making]
related: [decision-making, stakeholder-management, cross-team-architecture]
canonical_for: []
translated_from_version: 2
last_reviewed: 2026-08-31
---

# Negotiating Trade-offs

## Overview

Two competent people look at the same problem and reach opposite conclusions. That is normal, and
the reason is almost never unequal knowledge — it is that they are optimizing different things.

```text
position   "we need to use Kafka"
interest   "I need my team not to be hostage to the payments team
           every time the format changes"
```

Debating positions produces deadlock. Discovering interests frequently reveals that there is an
option serving both sides that nobody had proposed — because each was defending their own.

That is an architect's central contribution to a disagreement between teams: not deciding who is
right, but structuring the conversation until the better option appears.

## Problem

The deadlock pattern:

```text
team A argues for X
team B argues for Y
the discussion repeats across three meetings
someone escalates
a manager decides with no technical context
both teams execute without conviction
```

What never happened at any point: someone asking why each team argues for what they argue for.

And there is a second, quieter pattern: the disagreement that is not expressed. A team disagrees,
doesn't say so, and simply doesn't adopt. That is worse than deadlock, because there is nothing to
resolve — only an invisible non-compliance discovered months later.

## Core Concepts

### Positions hide interests

```text
position    what the person says they want
interest    why they want it
```

Asking "why does this matter to you?" is the highest-return intervention in a technical
disagreement. It usually reveals constraints the other side didn't know about:

```text
"I argue for the shared database because my team has two
 people and can't operate another store"

"I argue for the separate service because our regulatory requirement
 demands access segregation, and today we can't demonstrate it"
```

Neither is about the technology in dispute. And both interests can be met by options neither
position contemplated.

### Separate the people from the problem

Prolonged technical disagreement easily turns personal, and from there the discussion stops being
about the system.

```text
"team A is being stubborn"           it is already about people
"team A has a constraint the
 proposal doesn't meet"              it is still about the problem
```

The architect's role includes keeping the conversation in the second formulation — which sometimes
requires explicitly naming that it has drifted.

### Criteria before options

The move that unblocks most deadlocks:

```text
1. what criteria will we evaluate on?
2. what is each one's weight?
3. only then: what are the options?
```

Defining criteria before comparing options removes the bias of defending your own proposal, because
nobody yet knows which one wins. Defining criteria afterwards produces criteria chosen to favor a
conclusion — which both sides do without noticing.

See [alternatives in an ADR](/18-architecture-decisions/adr-alternatives.md).

### Create options that weren't on the table

```text
position A    shared database
position B    separate databases
new option    separate databases, with the platform team operating
              both — which meets A's capacity constraint
              and B's segregation constraint
```

Discussions between two positions tend to produce a victory or a bad compromise. The third option,
built from the interests, is usually better than both — and it only appears once the interests are
on the table.

### Use objective criteria, not authority

```text
weak     "I have more experience, and this is how it's done"
strong   "let's measure: which of the two meets the latency
         requirement under real load? we can test in two
         weeks"
```

When a measurement is possible and both sides agreed beforehand on what to measure, under what load
and which threshold decides, it ends the discussion in a way no argument does; agreed after the
result, the measurement only opens a new discussion about the metric. And when there is none, agreement on criteria is the substitute — because it shifts the discussion from "who is
right" to "what better meets what we agreed on".

### Not every disagreement gets resolved

And that is acceptable, provided the decision is made and the divergence recorded:

```text
"we decided X. Team B argued for Y, because of the concern about
 operating cost. We accept that risk, with a review in
 6 months and the trigger being operating effort exceeding
 half an engineer."
```

Recording that does three things: it preserves the argument of whoever disagreed; it gives the
dissenting team the recognition of having been heard, which drastically reduces silent
non-compliance; and it creates an objective review trigger instead of a new discussion.

See [decision in an ADR](/18-architecture-decisions/adr-decision.md).

### A temporary decision resolves many deadlocks

```text
"let's go with X for six months, measuring Y. If team B's
 concern is confirmed, we change."
```

When the disagreement is about a prediction — "this will get expensive to operate", "this won't
scale" — and the prediction is testable, deciding temporarily with measurement turns an opinion
debate into an experiment.

That only works when reversal is genuinely cheap. Promising reversibility that doesn't exist is
worse than deciding for good. How to classify a decision by its cost of reversal is in
[Decision-Making](/23-architecture-leadership/decision-making.md#reversibility-decides-the-rigor);
what belongs here is the negotiating use: the contested prediction becomes the reversal criterion.

### Escalating is legitimate and expensive

```text
when       the risk is high, the deadline is real, and persuasion
           has failed
cost       the teams learn that disagreeing outsources the decision
           and start escalating more
```

Escalating is not a failure — it is an instrument. What degrades an organization is escalating as
the first resort, because that removes from the teams the practice of resolving their own
disagreements.

## Mental Model

**Ask why, define criteria before options, and create the third alternative.** Technical
disagreement is rarely about the technology.

## When to Use

- In any recurring disagreement between teams.
- Before escalating.
- When two competent proposals reach opposite conclusions.

## When Not to Use

**When the criterion is already given.** A regulatory, contractual or security constraint does
not go into a negotiation of weights; negotiating opens the door to trading it for speed. Only how
to meet it is negotiated.

**During an ongoing incident.** Whoever commands the response decides, in minutes. Negotiation
comes afterwards, in the incident analysis, if the decision made under pressure has to become
permanent.

**When the decision is reversible in days.** An hour of conversation with two teams costs more than
getting it wrong and correcting it; decide and revert if needed, as in
[Decision-Making](/23-architecture-leadership/decision-making.md#reversibility-decides-the-rigor).

**When the consequence falls almost entirely on one side.** There are not two interests to
reconcile, there is an owner; delegate the decision to them instead of negotiating (see
Alternatives).

## Alternatives

- **Measure** — when the disagreement is about a testable prediction, the experiment decides.
- **A parallel pilot** — two teams, two approaches, evaluation afterwards; expensive and
  conclusive.
- **Delegate the decision** to whoever bears the consequence.
- **Defer with a trigger** — when the deciding information is going to arrive.

The third is frequently the correct answer and is rarely considered: if the consequence falls mostly
on one side, the decision is probably theirs.

## Trade-offs

| Seeking agreement | Deciding with divergence |
|---|---|
| Slow, may not converge | Fast, comes out on the date |
| Convinced adoption | Risk of non-compliance, mitigated by recording the objection |
| Builds the relationship | Wears down whoever lost |

| Measure | Decide by analysis |
|---|---|
| Costs weeks | Fast |
| Conclusive, if the threshold was agreed beforehand | Contestable, inconclusive if the positions are firm |

## Failure Modes

**A debate of positions.** A deadlock that repeats.

**Criteria chosen afterwards.** Each side picks the ones that favor them.

**Personalized disagreement.** It stops being about the system.

**Premature escalation.** The teams stop resolving things.

**Silent disagreement.** Nothing to resolve, invisible non-compliance.

**Erased divergence.** Whoever disagreed is not acknowledged.

## Common Mistakes

**Not asking why.** The discussion stays confined to the two positions, and the outcome becomes
one side's victory or a bad compromise.

**Proposing the third option before** knowing the interests. It is read as the architect's
position, and the deadlock gains a third trench instead of a way out — besides the option probably
not meeting the constraint nobody has revealed yet.

**Using experience as an argument** where a measurement is possible. The losing side yields to
authority, not to data, and reopens the discussion at the first sign of trouble.

**Not recording** the objection of whoever lost. The argument is lost, and whoever disagreed stops
disagreeing out loud and simply doesn't adopt.

**Escalating** before trying to structure the conversation. The manager decides without the
interests on the table, and the teams learn that the next disagreement also goes upstairs.

## Real-World Example

An e-commerce company had a disagreement stuck for four months between the catalog team and the
platform team about where the search index would live.

```text
catalog     "the index has to be ours; it is part of the domain and
            we need to evolve it fast"
platform    "search indexes should belong to the platform; we already operate
            two and we are not going to operate a third different model"
```

Three meetings, no progress, and the architecture group was called in to "decide".

Instead of deciding, it ran a one-hour conversation with a single opening question for each side:
**why does this matter to you?**

```text
catalog     real interest: every search schema change
            took 3 weeks because it depended on the platform's queue
            — and the product roadmap required frequent changes
platform    real interest: the team had 5 people and already operated
            two different search engines; a third,
            with a distinct operating model, was unsustainable
```

Neither interest was about ownership. One was about speed of change; the other, about operational
load.

**Criteria defined before the options**, with weights agreed by both teams:

```text
time for a schema change by the catalog team         35%
additional operational load on the platform          30%
consistency with the rest of the organization        20%
infrastructure cost                                  15%
```

**Options generated afterwards, including two that weren't on the table:**

```text
A  index operated by catalog, with its own model
B  index operated by the platform, with a change queue
C  index operated by the platform, with schema self-service
   for the domain teams
D  index operated by catalog, using the same engine
   and the same operating model as the platform
```

C and D had not been considered in four months of discussion, because each side was defending its
own position.

Evaluating against the agreed criteria, scored 1 to 5:

```text
                     time   load   consist.  cost    total
weights               35%    30%     20%      15%
A                      4      1       1        3     2.35
B                      1      5       5        4     3.45
C                      5      4       5        3     4.40
D                      4      4       4        2     3.70
```

C won by almost a point over B and 0.7 over D: it reduced change time
to hours — better even than option A — and added no new operating model to the platform.

The cost: the platform had to build the schema self-service, about six weeks. The funding came from
the architecture budget, which removed the capacity objection.

Results after eight months:

```text
time for a schema change            from 3 weeks to 4 hours
search engines operated             2 (unchanged)
other teams that adopted the
  self-service                      4
```

The four teams that adopted it afterwards are the result nobody predicted: a solution built to
resolve a disagreement became a platform capability.

What the architecture group records: the two new options, C and D, were obvious in hindsight and
invisible for four months. They only appeared once the conversation shifted from "who is right" to
"what does each of you need" — and the question that produced that shift took thirty seconds.

## Related Concepts

- [Decision-Making](/23-architecture-leadership/decision-making.md).
- [Stakeholder Management](/23-architecture-leadership/stakeholder-management.md).
- [Cross-Team Architecture](/23-architecture-leadership/cross-team-architecture.md).
- [Trade-offs](/20-trade-offs/index.md).

## Practical Exercise

Take a technical disagreement in progress and write, for each side, the position and the interest
behind it.

Then try to build an option that meets both interests. If it exists, it wasn't on the table — and
it is probably better than the two.

## Interview Questions

- Why does defining criteria before options remove bias?
- Why does the third option only appear once the interests are explicit?
- Why does recording the divergence reduce silent non-compliance?

## Further Reading

- Fisher, Roger; Ury, William. *Getting to Yes*. 3rd ed. Penguin, 2011.
- Hohpe, Gregor. *The Software Architect Elevator*. O'Reilly, 2020.
- Larson, Will. *Staff Engineer*. Self-published, 2021.

---
id: architecture-review
title: Architecture Review
sidebar_position: 13
description: How to look at decisions without becoming a committee that approves the inevitable.
doc_type: concept
level: 6
difficulty: advanced
status: complete
objective: >
  By the end, the reader designs a review that happens early, with criteria, and improves
  the decision instead of merely authorizing it.
prerequisites: [architecture-levels]
related: [architecture-levels, enterprise-governance, enterprise-principles]
canonical_for: []
translated_from_version: 1
last_reviewed: 2026-08-31
---

# Architecture Review

## Overview

An architecture review is looking at a decision before it is implemented, with the goal of
**improving it**.

The word that decides the outcome is *improving*. Reviews that exist to authorize produce
the familiar pattern: a meeting at the end of the process, in which the proposal is
already finished, implementation has already started, and the only viable answer is yes.

## Problem

The traditional review arrives late and has the wrong incentive.

**Late.** By the time the proposal is presented, the design work has already been done.
Changing means throwing away effort, and the inertia is large.

**Wrong incentive.** If the review can say no, whoever proposes optimizes for getting the
yes — presenting the minimum, avoiding uncertainties, and defending instead of
discussing.

The result is the worst of both worlds: a process that consumes time and does not improve
decisions.

## Core Concepts

### Early is worth more than complete

```text
review at the start   the proposal is an idea, still malleable
                      questions change the design
review at the end     the proposal is a plan, with work invested
                      questions become an obstacle
```

A thirty-minute conversation while the idea is being formed is worth more than a
two-hour formal review after it is finished.

That changes the format: instead of an event at the end, a consultation available
throughout. Whoever is designing seeks out whoever has broad context, and the
conversation happens while changing is still cheap.

### Consultation instead of approval

The change in stance that fixes the incentive:

```text
approval       the reviewer decides, the proposer persuades
consultation   the proposer decides, the reviewer offers perspective
```

In the second, responsibility stays with the team — which is correct, because they have
the context. And the reviewer stops being an obstacle to overcome and becomes a resource
to use.

That requires a record: the decision is the team's, and what was discussed is documented,
with what was considered and discarded. See
[architecture decisions](/18-architecture-decisions/index.md).

For the few decisions that genuinely require approval — broad reach, expensive rollback —
it remains. See
[architecture levels](/15-enterprise-architecture/architecture-levels.md).

### What the review should look for

A list that keeps the review from becoming personal preference:

```text
alternatives      were they considered? why this one?
premises          what has to be true? was it verified?
boundaries        who owns what? explicit contracts?
reversibility     if it is wrong, how much does it cost to go back?
operation         who operates it? how do you know it is working?
reach             does it affect other teams? do they know?
```

The second line is the most productive: most bad decisions come from unverified premises,
not from bad reasoning.

And the fourth calibrates the rigor: a reversible decision does not deserve the same
scrutiny as one that fixes the data model for ten years.

### Questions, not opinions

The difference between a review that helps and one that creates friction:

```text
opinion    "I would use events here"
question   "what happens if this service is down for an hour?"
```

The question exposes a consequence the team evaluates. The opinion asks the team to
defend its choice against someone else's preference.

That does not mean the reviewer has no position — it means the position is presented as a
consequence, not as a preference.

### Who reviews

```text
peers            other teams that solved similar problems
architects       the panoramic view, precedents
specialists      security, data, operations, as the case requires
the team itself  structured self-review catches a lot
```

The last is underrated: a list of questions applied by the team itself, before any
external review, resolves most cases and drastically reduces the volume that needs
someone else.

And the first produces the best signal: peer review distributes knowledge in both
directions.

### The outcome has to be recorded

A review that ends in a conversation is lost. The record:

```text
what was decided
which alternatives were considered
what premises support it
what was left open
who took part
```

That serves the future decision — someone with a similar problem finds the precedent —
and the review itself, because the history reveals patterns: if the same questions come
up repeatedly, they should become a principle, a standard or a paved road.

### Reviewers need something at stake

A design detail that changes behavior: reviewers who do not suffer the consequences of a
decision tend to be more conservative than the problem justifies.

```text
reviewer with nothing at stake   optimizes to avoid risk — refuses the unusual
reviewer with something at stake weighs risk against the cost of not doing it
```

That does not mean only whoever builds can review. It means the review has to include
someone who bears the outcome — typically the team itself, whose decision it remains.

It is another argument in favor of consultation over approval: in a consultation, whoever
decides is whoever will live with the decision, and the outside opinion comes in as
information.

And there is a second-order effect: permanent reviewers, who only review, lose touch with
practical constraints over time. Rotating who reviews — bringing in people who are
building — keeps the review anchored in reality.

## Mental Model

**A review improves the decision; it does not make it.** Early, by consultation, with
questions.

## When to Use

- Decisions with reach beyond the team.
- Decisions that are hard to reverse.
- When the team asks — voluntary consultation is the best signal.
- New patterns, which may become precedent.

## When Not to Use

**At the end of the process**, as authorization.

**For local, reversible decisions.**

**As a veto with no alternative.**

**Without criteria**, leaving room for personal preference.

**Without a record.**

**With participants who lack the context** to contribute.

## Alternatives

- **Structured self-review** — a list of questions applied by the team.
- **Peer review** — another team, with no hierarchy.
- **Informal consultation** — a conversation, with no process.
- **After-the-fact review** — for reversible decisions, look at patterns quarterly.
- **Paved road** — remove the decision instead of reviewing it.

The last is the most effective: if the same decision is reviewed thirty times, it should
have a built-in default answer.

## Trade-offs

| Early | Late |
|---|---|
| Cheap to change | Work invested |
| Incomplete proposal | Complete information |
| Conversation | Presentation |

| Consultation | Approval |
|---|---|
| Responsibility with the team | With the reviewer |
| No incentive to hide | Optimized for the yes |
| Less control | More |

## Failure Modes

**Rubber stamp.** Approves everything, with waiting.

**Veto with no alternative.** Says no, doesn't help.

**Personal preference.** With no criteria, it becomes the reviewer's taste.

**Too late.** Implementation has already started.

**No record.** The learning is lost.

**High volume.** Everything goes through, and nothing gets real attention.

**Reviewers without context.** Generic questions, unproductive discussion.

## Common Mistakes

**Reviewing at the end.** When the code is finished, changing the decision costs a rewrite, and the review becomes a rubber stamp. The useful moment is while the options are still open.

**Approving instead of consulting.** A review as a gate transfers responsibility to the reviewer and produces submission instead of discussion. As consulting, it improves the decision of whoever answers for it.

**Having no written criteria.** With no published criteria, the review looks arbitrary and depends on who was in the room — which makes it impossible to prepare for.

**Not recording.** The conclusion is lost and the same discussion comes back in six months, with different people and frequently with the opposite outcome.

**Reviewing local decisions.** Reviewing what crosses no boundary consumes the forum's time and teaches teams to avoid it.

**Not turning a recurring pattern** into a paved road. If the same question arrives five times, the answer should be a documented standard — the sixth wouldn't need a meeting.

## Real-World Example

A services company had a weekly architecture committee, mandatory for any new system or
structural change.

The twelve-month numbers:

```text
proposals reviewed      184
approved                179  (97%)
rejected                  5
average wait          19 days
design changes           11  (6% of proposals)
```

In 97% of cases, the committee was waiting. In 6%, it improved something.

And the interviews revealed the induced behavior: teams presented the minimum, avoided
mentioning uncertainties, and treated the session as a defense.

The rework:

**Mandatory self-review.** A list of ten questions — alternatives, premises, boundaries,
reversibility, operation, reach — filled in by the team before anything else.

That alone caught most of what the committee caught, and earlier.

**Voluntary consultation.** Architects available to talk during design, with no process.
It became the most used format — about three conversations a week, initiated by the
teams.

**Approval only for broad reach and expensive rollback.** About one a month.

**Peer review** for the middle ground: another team looks, with no hierarchy.

**A public record** of every decision, searchable.

**Quarterly review of patterns.** The questions that came up repeatedly became three
principles and two paved roads — removing the need to review them individually.

Result in one year: average wait from 19 days to 2, and the number of design changes
prompted by review rose from 11 to 47 — because the conversation started happening while
changing was still cheap.

The recorded conclusion: the committee was not useless, it was expensive for what it
delivered. And the format — a presentation for approval — produced exactly the behavior
that kept the review from working.

## Related Concepts

- [Architecture Levels](/15-enterprise-architecture/architecture-levels.md) — what deserves review.
- [Enterprise Governance](/15-enterprise-architecture/enterprise-governance.md).
- [Enterprise Principles](/15-enterprise-architecture/enterprise-principles.md) — the criteria.
- [Architecture Decisions](/18-architecture-decisions/index.md) — the record.

## Practical Exercise

Measure, in your review process: how many proposals were rejected, how many changed
design, and what the average wait is.

If the change rate is low and the wait is high, the review is happening too late.

## Interview Questions

- Why does a late review have the wrong incentive?
- What is the practical difference between consultation and approval?
- Why do questions work better than opinions?

## Further Reading

- Fowler, Martin. *Who Needs an Architect?*. IEEE Software, 2003.
- Hohpe, Gregor. *The Software Architect Elevator*. O'Reilly, 2020.
- Skelton, Matthew; Pais, Manuel. *Team Topologies*. IT Revolution, 2019.

---
id: architecture-roadmaps
title: Architecture Roadmaps
sidebar_position: 19
description: What to do and when — and why a roadmap without intermediate delivery doesn't survive.
doc_type: concept
level: 6
difficulty: advanced
status: complete
objective: >
  By the end, the reader builds roadmaps with intermediate deliveries and a horizon
  proportional to predictability.
prerequisites: [transition-architecture]
related: [transition-architecture, technical-strategy, target-architecture]
canonical_for: []
content_version: 1
translated_from_version: 1
last_reviewed: 2026-08-31
---

# Architecture Roadmaps

## Overview

An architecture roadmap arranges in time what
[strategy](/15-enterprise-architecture/technical-strategy.md) chose and what the
[transition](/15-enterprise-architecture/transition-architecture.md) described.

It answers: **what do we do first, and what depends on what.**

And it fails in a characteristic way: an eighteen-month schedule with chained
dependencies, in which value only appears at the end — and which does not survive the
first shift in priority.

## Problem

The traditional roadmap inherits the project format: phases, milestones, dates,
dependencies.

That presupposes the plan will be executed as written. In practice:

```text
priorities change
premises turn out to be wrong
things learned during execution change the design
people come and go
```

A roadmap that has to be executed in full to deliver anything is a roadmap that will be
interrupted midway, leaving invested work with no return.

## Core Concepts

### Intermediate deliveries, not phases

```text
phases        preparation → build → migration → shutdown
              value only at the end
deliveries    each step delivers something usable
              stopping at any point leaves the organization better off
```

See [transition architecture](/15-enterprise-architecture/transition-architecture.md) — it is the same principle,
expressed in time.

The question that tests each roadmap item: **if we stop here, is what was delivered worth
what was spent?**

If the answer is no, the sequence needs to be reordered — by value, not by technical
dependency.

### Precision decreasing with the horizon

```text
next 3 months     concrete items, with an owner and an estimate
3 to 9 months     direction, at coarse granularity
beyond 9 months   themes, with no date commitment
```

A roadmap with the same level of detail across the whole horizon conveys a precision that
does not exist — and creates the expectation that distant dates are commitments.

The format that communicates honestly is the one that shows uncertainty growing with
distance.

### Dates or sequence

```text
with dates     necessary when there is an external dependency —
               a contract, regulation, a business event
without dates  sequence and dependency, with no calendar commitment
```

The second form is more honest for architecture work, whose duration is genuinely
uncertain.

And when dates are necessary, they should come with a confidence interval: "between March
and June" communicates better than "April", and avoids the conversation about being late.

### The roadmap has to show what is not in it

An item someone expects and that is not in the roadmap creates friction when discovered
late.

Making the absences explicit — "this is not planned for the next 18 months" — is what
turns an implicit expectation into a conversation. See
[technical strategy](/15-enterprise-architecture/technical-strategy.md).

### Dependency between teams is what blocks

Architecture roadmaps frequently cross teams, and dependency is where delays accumulate:

```text
team A depends on team B, which depends on team C
each with its own priorities
the roadmap item sits blocked in someone else's queue
```

What reduces it:

**Reorder to minimize dependency.** Prefer items one team completes alone.

**Make the request explicit early.** The team being depended on needs advance notice in
order to prioritize.

**Accept temporary duplication.** Sometimes it is cheaper to duplicate than to wait.

See [integration landscapes](/15-enterprise-architecture/integration-landscapes.md) — roadmap dependency reflects
structural dependency.

### Review with evidence

```text
monthly     progress, obstacles
quarterly   does the sequence still make sense? what have we learned?
biannually  does the strategy still hold?
```

The quarterly review is the one that matters: it is where what execution taught feeds
back into the plan.

A roadmap executed without review is a twelve-month plan executed with information from
twelve months ago.

### It communicates before it plans

The most valuable use of a roadmap is not internal. It is **communication**: with the
business, with other teams, with whoever depends on it.

That changes the format: a roadmap only engineering understands fails at its main use.
Items expressed in terms of capability and outcome — not technology — are what allows the
conversation to happen.

## Mental Model

**Each item delivers value on its own.** A roadmap that only delivers at the end does not
survive the first shift in priority.

## When to Use

- After defining strategy and transition.
- To communicate direction to the business.
- To coordinate work across teams.
- In modernization programs.

## When Not to Use

**With value only at the end.**

**With uniform precision** across the whole horizon.

**With dates where uncertainty is high.**

**Without showing what is not planned.**

**Without a quarterly review.**

**In technical vocabulary**, when the audience is the business.

## Alternatives

- **Sequence without dates** — dependency and order, with no calendar.
- **Themes per quarter** — direction with no specific items.
- **Outcome roadmap** — expressed in capabilities enabled, not in work.
- **Continuously prioritized flow** — no roadmap, with a continuously reviewed queue.

The last one works well for continuous-improvement work, and badly for programs with
dependencies between teams.

## Trade-offs

The choice between dates and sequence depends on whether there is an external dependency.
When there isn't, sequence communicates better: it conveys order without creating a
commitment the uncertainty cannot sustain.

| With dates | Without dates |
|---|---|
| External coordination possible | Less false commitment |
| Deadline pressure and lateness conversations | Less predictable for third parties |
| Requires an estimate that may not exist | Accepts the uncertainty |
| Useful with regulation or a contract | Useful in exploratory work |

And the horizon has the same trade-off between usefulness and honesty:

| Long horizon | Short |
|---|---|
| Direction visible to whoever depends on it | Actionable now |
| Low precision, frequent review | High |
| Allows planning dependencies | Reacts better to change |
| Risk of becoming a commitment | Without that risk |

## Failure Modes

**Value only at the end.** Interrupted, nothing was delivered.

**False precision.** Distant dates treated as commitments.

**Dependency between teams.** Blocked by someone else's queue.

**No review.** Executed with old information.

**Technical vocabulary.** The business cannot participate.

**Implicit absences.** Unmet expectations discovered late.

## Common Mistakes

**Ordering by technical dependency.** It produces a roadmap in which nothing delivers value until the end — and projects like that get cancelled midway, having delivered nothing.

**Uniform detail.** The next quarter can be detailed; the third year cannot be known. Detailing everything equally gives false precision to what is speculation.

**Not making explicit what is left out.** A roadmap with no list of what will not be done makes every area assume its priority is included, and the disappointment arrives together with the complaint.

**Not reviewing quarterly.** Context changes faster than the roadmap's horizon. Without review, it stops describing current intent and becomes a historical document nobody consults.

**Not expressing it in outcomes.** "Migrate to Kubernetes" is not an outcome; "reduce the time to stand up a new service from two weeks to one day" is — and it admits more than one path.

**Not negotiating cross-team dependencies early.** A dependency discovered during execution becomes waiting, because the other team has already committed its quarter to something else.

## Real-World Example

A retail company had a 24-month modernization roadmap, with four phases and chained
dependencies.

At 14 months, a shift in business priority interrupted the program. The tally:

```text
phase 1 — infrastructure     complete
phase 2 — service extraction 60%
phase 3 — data migration     not started
phase 4 — shutdown           not started
```

Value delivered to the business: none. The infrastructure and the partial services
changed nothing observable, and the old system kept operating in full.

Fourteen months of work with no defensible return.

The rework, two years later, changed the structure:

**Sequence by value.** Each roadmap item delivers something usable. The first was
extracting the catalog — not because it was technically simpler, but because it unblocked
a business capability that had been awaited for two years.

**Decreasing horizon.** Three months with items and owners; nine months with direction;
beyond that, themes.

**No dates beyond the first quarter.** Sequence and dependency, with estimates as ranges.

**Expressed in capabilities.** "Allow catalog changes without a release" instead of
"extract the catalog service".

That changed the conversation with the business: the items became prioritizable by
whoever understands the value.

**Explicit absences.** A section of the roadmap listed what was **not** planned, with the
reason. It avoided three discussions that would have happened late.

**Quarterly review** with reordering allowed.

Over the following 18 months, the program was interrupted twice by shifts in priority —
and resumed both times. Each interruption left a defensible state, and resuming lost no
work.

The lesson that stuck: the previous roadmap was technically correct in its dependency
sequence. It was ordered the way that makes sense for building, and not the way that
makes sense for surviving.

## Related Concepts

- [Technical Strategy](/15-enterprise-architecture/technical-strategy.md) — what to prioritize.
- [Transition Architecture](/15-enterprise-architecture/transition-architecture.md) — the states.
- [Target Architecture](/15-enterprise-architecture/target-architecture.md).
- [Business Capabilities](/15-enterprise-architecture/business-capabilities.md) — the vocabulary.

## Practical Exercise

Take your team's roadmap and test each item: if the program stops right after it, is what
was delivered defensible?

The items that fail the test need to be reordered or re-divided.

## Interview Questions

- Why order by value instead of by technical dependency?
- Why should precision decrease with the horizon?
- Why make explicit what is not in the roadmap?

## Further Reading

- Rumelt, Richard. *Good Strategy Bad Strategy*. Crown Business, 2011.
- Highsmith, Jim. *Agile Project Management*. 2nd ed. Addison-Wesley, 2009.
- Open Group. *TOGAF Standard* — migration planning.

---
id: incremental-modernization
title: Incremental Modernization
sidebar_position: 4
description: Delivering value in slices that survive interruptions — the discipline that makes modernization finish.
doc_type: concept
level: 6
difficulty: advanced
status: complete
objective: >
  By the end, the reader divides modernization into defensible increments and avoids the
  program that only delivers at the end.
prerequisites: [migration-strategies]
related: [strangler-fig, organizational-constraints, transition-architecture]
canonical_for: []
translated_from_version: 1
last_reviewed: 2026-08-31
---

# Incremental Modernization

## Overview

Incremental modernization is dividing the work into slices that **deliver value on their
own**, so that stopping at any point leaves the organization better off than before.

It is the discipline that makes modernization programs finish — because most of them are
interrupted, and the difference between one interrupted with value and one interrupted
without value is how it was divided.

See [organizational constraints](/16-legacy-modernization/organizational-constraints.md).

## Problem

The typical modernization program is sequenced by **technical dependency**:

```text
1. infrastructure
2. data layer
3. domain services
4. interface
5. migration
6. shutdown
```

That is the logical order for building, and it concentrates all the value at the end.

A program like that, interrupted at step 3, produced infrastructure and a data layer that
do nothing — wasted work.

## Core Concepts

### The slice has to pass three tests

```text
delivers value   someone is measurably better off
is operable      it works in production, it is not a construction site
is defensible    if it stops here, the investment is justified
```

The third is the most demanding and the one that makes the difference. It forces ordering
by value, and not by technical convenience.

See [transition architecture](/15-enterprise-architecture/transition-architecture.md).

And it has an uncomfortable consequence: the order that delivers value early is
frequently more laborious than the natural build order — because it requires making
something work partially that would be simpler to do whole.

That additional cost is the insurance premium against interruption, and it pays for
itself in most cases.

### Vertical, not horizontal

```text
horizontal   an entire layer at a time — infrastructure, then data, then...
vertical     a complete feature, crossing every layer
```

The vertical slice delivers something usable. The horizontal one does not.

And there is a secondary gain: the vertical slice exercises the complete path early,
revealing integration, data and deployment problems at the start, when fixing them is
cheap.

### Opportunistic modernization

An approach with no dedicated program: **modernize what you touch**.

```text
a product change needs to alter module X
  → the opportunity is taken to refactor X
  → the marginal cost is small; the work was already being done there
```

That has three valuable properties:

**It doesn't compete for budget.** It happens inside the product work.

**It focuses on what matters.** The modules that change are the ones causing cost; the
ones that don't change don't bother anyone.

**It survives shifts in priority.** There is no program to cancel.

The limit: it does not solve structural problems that require coordinated change. See
[migration strategies](/16-legacy-modernization/migration-strategies.md).

The combination that works: opportunistic for the continuous, a dedicated program for the
structural.

### The boy scout rule has a limit

"Leave the code better than you found it" works for small improvements and fails for
structural changes — which require coordination and do not fit inside an incidental
change.

And there is a risk: unbounded opportunistic refactoring turns a small change into a
large one, with a difficult review and greater risk.

The balance: localized improvements inside the change; structural changes as their own,
planned work.

### Measure progress by what was delivered

```text
bad    "40% of the code migrated"
good   "3 of the 8 critical features operating on the new system"
       "the monthly release became weekly for module X"
       "time to launch a new product dropped from 3 months to 3 weeks"
```

The first metric is internal and communicates nothing to whoever sponsors it. The others
are verifiable and sustain support.

And the first has an additional problem: it grows even when value does not — 40% of the
code migrated may be 0% of the value, if it is the wrong part.

### Slices small enough to fit

A slice that takes eight months is not incremental — it is a small project with the same
problems as the big one.

```text
practical target   4 to 8 weeks per slice
```

That forces finer division, which is work — and it is what keeps the delivery and
learning cycle short.

And it fits within the proportion agreed with product. See
[organizational constraints](/16-legacy-modernization/organizational-constraints.md).

### The first slice is more expensive, and that has to be in the estimate

A predictable pattern: the first slice builds the infrastructure all the others reuse.

```text
slice 1    7 weeks — includes interception, pipeline, telemetry, data migration
slice 2    3 weeks
slice 3    2 weeks
```

Estimating the first one from the average of the others produces a delay right at the
start — the worst possible moment, because it erodes confidence before any value has been
delivered.

Communicating it in advance changes the reading: "the first slice takes three times as
long as the following ones, because it builds the path" is a prediction that gets
confirmed, and not a delay.

And there is a choice embedded in it: how much infrastructure to build in the first
slice. Building too much delays the first value; building too little makes each following
slice carry foundation work.

The practical balance: only what is needed for the first slice to work in production, and
the rest as the following ones require.

## Mental Model

**Each slice delivers value on its own.** Interruption is likely; the division is the
insurance against it.

## When to Use

- Any modernization lasting more than a few months.
- Where priority can change.
- When support has to be sustained over time.
- Where the product cannot stop.

## When Not to Use

**Sequencing by technical dependency.** Nothing is useful until the end, and projects like that get interrupted before delivering.

**With horizontal slices.** They force both architectures to coexist across every feature at the same time.

**With slices that are too long.** The slice becomes a big project and recovers every risk the increment was avoiding.

**Measuring progress by percentage of code.** It hides that the complexity is concentrated in what's left, and the number gives false confidence.

**Opportunistic for structural changes.** Improving what you touch never reaches a wrong boundary or an inadequate data model.

**With no limit on incidental refactoring.** With no ceiling, a one-line fix becomes a week and the team loses the predictability that sustained the strategy.

## Alternatives

- **A dedicated program with milestones** — faster, more vulnerable.
- **Purely opportunistic modernization** — no program, slower, more resilient.
- **Freeze and build alongside** — the old one stops evolving. See
  [rebuilding](/16-legacy-modernization/rebuilding.md).
- **Containment** — isolate instead of modernizing.

## Trade-offs

| Incremental | Program with milestones |
|---|---|
| Value early and continuous | Concentrated at the end |
| Survives interruption | Wastes it |
| Prolonged coexistence | Less |
| More division work | Natural order |

| Opportunistic | Dedicated |
|---|---|
| Doesn't compete for budget | Competes |
| Slow | Fast |
| Doesn't solve the structural | Solves it |

## Failure Modes

**A slice with no value.** Interrupted, nothing was delivered.

**Sequencing by technical dependency.**

**Long slices.** The same problems as the big program.

**Progress measured internally.** The sponsor sees no advance.

**Unbounded opportunistic refactoring.** Small changes become large ones.

**Coexistence that never ends.** See
[strangler fig](/16-legacy-modernization/strangler-fig.md).

## Common Mistakes

**Ordering by technical convenience.** Starting with what is easy to extract produces visible progress with no business value, and the support runs out before the hard part begins.

**Slicing horizontally.** Migrating one layer at a time forces both architectures to talk to each other across every feature, and none of them is finished until the end.

**Not testing each slice against the defensibility criterion.** If the slice doesn't deliver something that stands on its own, it cannot be interrupted — and interruption is the most likely scenario.

**Communicating progress as a percentage of code.** "40% migrated" says nothing to the business and hides that the remaining 60% contains all the complexity. Progress is communicated in capability delivered.

**Using the opportunistic approach for a structural problem.** Improving what you touch fixes neither a wrong boundary nor an inadequate data model; those require directed work.

**Not limiting the slice size.** A slice that is too long becomes a big project again with every risk the increment existed to avoid.

## Real-World Example

A telecommunications company was modernizing its service provisioning system.

The original plan, by layers:

```text
phase 1  new infrastructure                    4 months
phase 2  data layer                            5 months
phase 3  domain services                       8 months
phase 4  interfaces                            4 months
phase 5  migration and cutover                 3 months
```

Twenty-four months, with the first value in month 24.

The rework, before starting, divided by feature:

```text
slice 1  residential broadband provisioning    7 weeks
slice 2  plan change                           5 weeks
slice 3  telephony provisioning                6 weeks
slice 4  enterprise services                   8 weeks
...
slice 11 special cases and shutdown            9 weeks
```

Each slice crossed every layer for one feature, and went into production via
[strangler fig](/16-legacy-modernization/strangler-fig.md).

The first slice took 7 weeks — more than planned, because it built the minimum
infrastructure along the way. The following ones sped up, reusing it.

Two things happened during the 22 months:

**An interruption in month 9.** A regulatory priority consumed the team for four months.
The program stopped with 4 of the 11 slices complete — and all four were in production,
delivering value. Nothing was lost.

**A scope change in month 15.** An acquisition brought in a system covering part of what
slices 8 and 9 would do. They were removed from the plan — and nothing already done had
to be undone.

Under the original plan, both events would have been fatal: the interruption in month 9
would have caught the program in phase 2, with nothing delivered; the scope change in
month 15 would have invalidated work from the earlier phases.

The detail the team highlights: the first slice cost about 60% more than it would have if
the infrastructure had been built beforehand, in isolation. That was the premium paid —
and it paid off twice, in both events.

## Related Concepts

- [Strangler Fig](/16-legacy-modernization/strangler-fig.md) — the mechanism.
- [Transition Architecture](/15-enterprise-architecture/transition-architecture.md).
- [Organizational Constraints](/16-legacy-modernization/organizational-constraints.md).
- [Migration Strategies](/16-legacy-modernization/migration-strategies.md).

## Practical Exercise

Take the modernization plan in your context and test each phase: if the program stops
right after it, is what was delivered justified?

The phases that fail the test need to be re-divided by feature, not by layer.

## Interview Questions

- Which three tests does a slice have to pass?
- Why does slicing vertically cost more and pay off?
- What is the limit of opportunistic modernization?

## Further Reading

- Newman, Sam. *Monolith to Microservices*. O'Reilly, 2019.
- Feathers, Michael. *Working Effectively with Legacy Code*. Prentice Hall, 2004.
- Humble, Jez; Farley, David. *Continuous Delivery*. Addison-Wesley, 2010.

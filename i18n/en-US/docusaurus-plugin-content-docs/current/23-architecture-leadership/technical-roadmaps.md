---
id: technical-roadmaps
title: Technical Roadmaps
sidebar_position: 14
description: Sequencing technical investment so that each stage delivers value and the plan survives changes of priority.
doc_type: concept
level: 7
difficulty: advanced
status: complete
objective: >
  By the end, the reader sequences technical work by value delivered and by reversibility, with
  each phase ending in a stable state.
prerequisites: [technical-strategy-leadership]
related: [technical-strategy-leadership, architecture-vision, risk-management]
canonical_for: []
translated_from_version: 2
last_reviewed: 2026-08-31
---

# Technical Roadmaps

## Overview

A technical roadmap sequences investment in architecture. The hard part is not choosing what to do —
the strategy already chose. It is choosing **the order**.

```text
the wrong order   nothing delivers value until the end, and the plan
                  is cancelled halfway
the right order   each phase delivers something, and the plan survives
                  changes of priority
```

And there is a constraint that the typical format, described below, does not respect and that
decides whether the roadmap survives: **each phase has to end in a state where the work can stop without leaving anything
half-done.**

Over a 12-to-24-month horizon, the risk that usually ends a technical project is not lack of merit:
it is a change of priority, a change of leadership or a budget freeze — and, when it materializes,
what remains is whatever was finished.

## Problem

The typical technical roadmap:

```text
phase 1  foundation: infrastructure, platform, framework
phase 2  migration of the first systems
phase 3  migration of the rest
phase 4  decommissioning the old
```

Twelve to twenty-four months, with value delivered only from phase 2 or 3 onward. If the plan is
interrupted in phase 1 — which happens often — the result is unused infrastructure and no benefit.

And there is the opposite sequencing error: starting with the most valuable without building the
base, which produces one first delivery and a growing cost in the ones that follow.

The error common to both: sequencing by technical logic instead of by value and risk.

## Core Concepts

### Sequence by value delivered early

```text
wrong criterion   "what has to come first technically"
right criterion   "what delivers an observable result soonest,
                  given what is technically possible"
```

Frequently the answer is a **new** capability, and not a migration — because it has no regression to
avoid and it produces a visible result. See the
[e-commerce case study](/21-case-studies/ecommerce.md), where the first phase was the capability
that did not exist.

### Each phase ends stable

It is the [intermediate delivery](/15-enterprise-architecture/architecture-roadmaps.md) test applied to the phase of a technical roadmap:

```text
"at the end of phase 2, if the project stops, what's left?"
```

If the answer is "a half-done system", the phase is badly designed. Reorganizing it to end in a
consistent state costs some effort and buys survival.

That discipline produces better plans even when the interruption doesn't happen: it forces
decomposition into units that make sense in isolation. See the
[legacy modernization case study](/21-case-studies/legacy-modernization-case.md).

### The first phase pays for the following ones, when possible

```text
a phase 1 that cuts cost    finances the rest and reduces
                            dependence on approval
a phase 1 that spends       requires sponsorship to hold
                            across the whole plan
```

It isn't always possible, and when it is, it changes the project's politics: a plan that is
self-sustaining from the fourth month on does not have to be re-approved. See the
[delivery case study](/21-case-studies/food-delivery.md).

### Milestones, not precise dates

```text
fragile   "migration completed on March 14"
robust    "migration completed when the three critical systems
          are on the new one, with equivalence proven"
```

When to use dates and how precision decreases with the horizon is covered in
[architecture roadmaps](/15-enterprise-architecture/architecture-roadmaps.md). What belongs to the technical roadmap is the milestone by
condition: it survives delay and can be verified by someone who did not take part in the plan.

### Declare what each phase does not do

```text
"phase 1 does not migrate any historical data, and does not
 decommission anything in the old system"
```

It is the rule of [showing what is not on the roadmap](/15-enterprise-architecture/architecture-roadmaps.md) applied to the phase: it lets the
phase be assessed by what it promised. See [communication](/23-architecture-leadership/communication.md).

### A technical roadmap competes with product

That is the reality the format has to accommodate: there is only one engineering capacity, and each
item on the technical roadmap is an item product does not get.

```text
presented in isolation    it looks reasonable, and is approved with no real slack
presented together        prioritization is done with the right information
```

Technical roadmaps approved without that conversation are undone in execution, when delivery
pressure arrives — and the undoing happens by omission, without anybody deciding it.

See [technical strategy](/23-architecture-leadership/technical-strategy-leadership.md).

### Review by evidence, not by calendar

```text
"phase 2 is complete. Does what we learned change the rest of the plan?"
```

Long technical plans are built with information that execution corrects. Reviewing at the end of
each phase, with what was learned, produces a better plan than executing the original to the end.

What does not work is reviewing by calendar with no new evidence — that turns into recurring
replanning and wears sponsorship down.

## Mental Model

**Order by value delivered early, and make each phase end stable.** Over 12 to 24 months, treat the
interruption as the case to plan for, not as the exception; the question is what is left when it comes.

## When to Use

- After the strategy, to sequence investment.
- Over 12-to-24-month horizons.
- With milestones by condition, not by date.

## When Not to Use

**Diffuse debt, with no single architectural target.** When the work is a sum of local improvements —
outdated dependencies, flaky tests, confusing modules — there is no sequence to optimize; a fixed
percentage of capacity solves it with less ceremony.

**Work that fits in a quarter.** Phasing exists to survive changes of priority across many months;
over a horizon in which priority is unlikely to change, phases with stopping criteria are planning
cost with no return, and the backlog is enough.

**An organization that already runs a single queue with product.** If technical and product items
are already prioritized together, a separate technical roadmap recreates the budget split the single
queue eliminated.

**A destination still in dispute.** The roadmap orders what the strategy chose; sequencing before the
choice is made anticipates the decision through the order of the phases. The
[technical strategy](/23-architecture-leadership/technical-strategy-leadership.md) comes first.

## Alternatives

- **Continuous work with no roadmap** — allocating a fixed percentage of capacity to technical
  improvement, with no long-term plan. Simple and effective for diffuse debt.
- **A roadmap integrated with the product one** — a single plan, with technical and product items in
  the same queue. It is the most honest form and the hardest to get.
- **Slicing by capability** instead of by phase — each delivery is a complete capability.

The second is the best when the organization allows it: it eliminates the fiction that there are two
capacity budgets.

## Trade-offs

| Value early | Foundation first |
|---|---|
| Survives interruption | Less rework |
| May require temporary work | Nothing delivered for months |

| Milestones by condition | Dates |
|---|---|
| Survives delay | Predictable for whoever plans |
| Hard to coordinate with others | Fiction over a long horizon |

## Failure Modes

**An unused foundation.** Interrupted in phase 1.

**A phase that ends half-done.** Nothing usable.

**Precise dates over a long horizon.** Credibility eroded.

**Presented in isolation.** Undone in execution.

**No review by evidence.** Executes a plan made with less information.

## Common Mistakes

**Sequencing by technical dependency** without considering value. The plan is written by whoever
knows the architecture, and to that person the dependency graph looks like the natural order; the
consequence is a phase 1 with no visible delivery when the first budget cut arrives.

**Not asking** what is left if the plan stops. The question sounds pessimistic in a presentation
seeking approval and gets left out; the cost only shows up at the interruption, when the phase can no
longer be reorganized.

**Promising dates** that depend on future decisions. The sponsor asks for a date and it is the date
that unlocks approval; when it slips, the conversation becomes the delay, not what was delivered.

**Not discussing** the competition with the product roadmap. Presented in isolation, the plan is
approved faster and with a larger allocation on paper; the real allocation erodes without an explicit
decision when delivery pressure arrives.

**Not declaring** each phase's negative scope. Whoever writes it knows what was left out and assumes
everyone knows; the delivered phase ends up judged by what nobody promised.

## Real-World Example

A services company with 120 engineers had two technical roadmaps cancelled in three years. Both
followed the same structure: foundation, migration, decommissioning.

```text
roadmap 1 (2022)   cancelled in month 9, in phase 1
                   result: platform built, no
                   system migrated, ~$620k spent
roadmap 2 (2023)   cancelled in month 7, in phase 1
                   result: an internal framework, unused
```

Both cancellations came from a change in commercial priority, not from a technical problem. And in
both, what was left was unusable.

The third roadmap was built with two new rules:

**Each phase has to end in a usable state.** The question "what's left if we stop here?" now had to
be answered in writing for each phase, and the answer had to be something with value.

**The first phase has to deliver an observable result within four months.**

That forced the sequence to be inverted. Instead of building the complete platform first, the plan
came out like this:

```text
phase 1 (4 months)   one system migrated, with the minimum slice of
                     platform it requires
                     if it stops here: one system on the new model,
                     working, with a measured benefit

phase 2 (5 months)   three systems, the platform extended with
                     what they required
                     if it stops here: four systems migrated

phase 3 (6 months)   the remaining eleven, one at a time, with the
                     platform already matured by real use
                     if it stops here: fifteen of fifteen, with
                     the old one still running

phase 4 (4 months)   decommissioning and history migration
```

The platform came to be built **pulled by the migration**, and not ahead of it. That produced some
rework — three platform components were redone when they were generalized in phase 2 — estimated at
around six weeks.

The roadmap was presented alongside the product one, in a single prioritization, with total capacity
visible. That reduced the approved allocation from 30% to 22%, and the reduction was treated as
information: 22% agreed and sustained is worth more than 30% approved and eroded.

Results:

```text
phase 1 completed in month 4     measured benefit: -34% in that
                                 system's lead time
actual allocation across the plan  21% (agreed: 22%)
plan interrupted?                yes — in month 11, for 3 months,
                                 by a commercial priority
what was left at the interruption  six systems migrated (four
                                 from phases 1 and 2, two from
                                 phase 3), working, with a benefit
plan resumed                     yes, in month 14
completion                       month 22 (forecast: 19)
platform rework                  ~6 weeks, forecast and accepted
```

The three-month interruption happened — as in the two previous roadmaps. The difference is that this
time it cancelled nothing: the work stopped in a usable state, and resuming was possible. It fell in
the middle of phase 3, and the rule held inside the phase too: each system was migrated as a unit
that ends stable, and in month 11 none was half-done.

The team's reading: the six weeks of rework from building the platform on demand were the price of
the plan's survival, and it was cheap. The two previous roadmaps had avoided rework and lost
everything.

## Related Concepts

- [Technical Strategy](/23-architecture-leadership/technical-strategy-leadership.md).
- [Architecture Vision](/23-architecture-leadership/architecture-vision.md).
- [Architecture Roadmaps](/15-enterprise-architecture/architecture-roadmaps.md).
- [Risk Management](/23-architecture-leadership/risk-management.md).

## Practical Exercise

Take a technical plan in progress and answer, for each phase: what is left if the work stops at the
end of it?

The phases whose answer is "nothing usable" are the ones that will cost everything if the priority
changes — and, in a plan longer than a year, a change of priority is the case to plan for, not the exception.

## Interview Questions

- Why does sequencing by technical logic usually produce plans that die?
- Why can building the platform on demand be worth the rework?
- Why do milestones by condition survive better than dates over a long horizon?

## Further Reading

- Rumelt, Richard. *Good Strategy Bad Strategy*. Crown Business, 2011.
- Newman, Sam. *Monolith to Microservices*. O'Reilly, 2019.
- Larson, Will. *An Elegant Puzzle: Systems of Engineering Management*. Stripe
  Press, 2019.

---
id: technical-strategy-leadership
title: Technical Strategy in Leadership
sidebar_position: 2
description: Diagnosis, direction and sacrifice — and the part almost no technical strategy has.
doc_type: concept
level: 7
difficulty: advanced
status: complete
objective: >
  By the end, the reader formulates technical strategy with an honest diagnosis and explicit
  sacrifices, tied to a business bet.
prerequisites: [architecture-vision]
related: [architecture-vision, technical-roadmaps, cost-management]
canonical_for: []
translated_from_version: 2
last_reviewed: 2026-08-31
---

# Technical Strategy in Leadership

## Overview

Technical strategy is the choice of where to invest engineering capacity, and — more importantly —
where **not** to invest it.

```text
diagnosis    what the real problem is, with evidence
direction    what we are going to do about it
sacrifice    what we will stop doing in order to manage it
```

Why the diagnosis must be specific and the sacrifice must be named is defined in
[technical strategy](/15-enterprise-architecture/technical-strategy.md). This document starts
from that formulation and covers what architectural leadership has to do for it to survive the
year: the conversation with whoever loses in the sacrifice, the tie to a business bet, measuring
actual allocation, and the annual review.

## Problem

The typical technical strategy:

```text
"We will modernize the platform, improve observability,
 reduce technical debt, increase test coverage,
 adopt continuous delivery practices and strengthen security."
```

Six fronts, no sacrifice, no numbers. That doesn't guide prioritization, which is a strategy's only
use — when everything is a priority, prioritization goes back to being done by whoever shouts
loudest.

And there is a second problem: technical strategy disconnected from business strategy. A
modernization proposal not tied to any business bet competes for budget at a permanent disadvantage,
and loses — correctly, from the point of view of whoever decides.

## Core Concepts

### An honest diagnosis comes first

```text
weak     "we have technical debt"
strong   "69% of engineering capacity is in maintenance.
         The measured cause is that 11 of the 26 clients run
         different versions of the product, due to code-level
         customizations."
```

A diagnosis that bothers nobody is usually not a diagnosis — it is a description. And one that
points at the cause instead of the symptom is what makes the direction derivable.

See [measuring outcomes](/23-architecture-leadership/measuring-architecture-outcomes.md).

### Few fronts

```text
one to three fronts   the organization can execute
four or more          attention splits, and most do not
                      finish before the next cycle (in the
                      Real-World Example, 1.3 of 6 advanced)
```

The limit is not capacity — it is attention. An organization executes multiple simultaneous
initiatives; it does not sustain multiple changes of direction.

Choosing one front and finishing it produces more than starting five.

### Explicit sacrifice, named

```text
"We will invest in reducing lead time. That means the
 multi-region migration waits until 2028, and that we will not
 attack infrastructure cost this year — it will grow
 by around 12%."
```

Naming makes the choice real, because it now has a visible cost. For leadership, the effect that
matters is the second one: it protects the strategy. when someone proposes the multi-region migration in March, the
answer already exists and doesn't have to be negotiated again.

A strategy with no declared sacrifices is renegotiated at every meeting.

### Tie it to a business bet

```text
disconnected   "we're going to modernize the inventory system"
connected      "the omnichannel operation, approved for 2027, is not
               viable on top of the current inventory system. Modernizing it
               is a prerequisite, and the deadline is dictated by it."
```

That changes the proposal's category: from a technical improvement to a prerequisite of an
already-approved bet. See
[communication](/23-architecture-leadership/communication.md).

When there is no business bet to tie it to, the uncomfortable question is worth asking: does the
technical initiative justify itself on its own? Sometimes yes — regulatory risk, knowledge risk,
growing cost. Frequently not.

### A two-to-three-year horizon, revisited annually

```text
under 1 year      that's a roadmap, not a strategy
5 years or more   the premises don't survive
2 to 3 years      long enough to change something structural,
                  short enough to be credible
```

And the annual review has to be real: check whether the diagnosis still holds, whether the direction
produced results, and whether the sacrifices were sustained.

### Execution is the test

```text
capacity allocated to the strategic front   is the number that reveals
                                            whether the strategy is real
```

A strategy with three fronts and 6% of capacity allocated to them is not a strategy — it is an
intention. Measuring actual allocation, rather than planned allocation, is the most honest
assessment instrument.

And when actual allocation is low, the diagnosis is usually one of two: the sacrifice was not
actually made, or the strategy has no sponsorship.

### Strategy is choice, and choices are unpopular

A strategy that pleases every area probably chose nothing. Sacrificing means someone will not get
what they wanted — and that conversation is part of the work, not a side effect to avoid.

Having that conversation in advance, with whoever will be affected by the sacrifice, is what
prevents it from being silently undone at the first pressure.

## Mental Model

**A diagnosis with a number, one to three fronts, named sacrifices, and a tie to a business bet.**
Without sacrifice, it isn't strategy.

## When to Use

- In the annual planning cycle, or when the context changes materially.
- When engineering capacity is being consumed with no direction.
- Before any technical roadmap, which derives from it.

## When Not to Use

**When all of engineering fits in a single backlog prioritized by one person.** The sacrifice
already happens in the prioritization itself, in plain sight; a strategy document adds ceremony
without adding choice. Use a roadmap directly.

**When the business changes bets on a cycle shorter than the strategy's horizon** — a startup
before product-market fit, for example. A two-to-three-year strategy would be rewritten before it
produced results. Use an architecture vision and a quarterly roadmap.

**When there is no sponsor able to sustain the sacrifices.** The areas that lose escalate, and the
sacrifice falls at the first pressure; the document becomes a wish list under another name. Get
the sponsorship first, or restrict the choice to the scope you control.

## Alternatives

- **A vision with no strategy** — guiding decisions without allocating investment; works when there
  is no capacity to direct.
- **A roadmap directly** — sequencing deliveries without stating a strategy; works over a short
  horizon.
- **Strategy per area** — each team defines its own, with minimal coordination; scales better and
  produces less coherence.

## Trade-offs

| Few fronts | Many |
|---|---|
| Executes and finishes | Covers more |
| Leaves problems unattended | Few finish |

| Tied to the business | Autonomous |
|---|---|
| Competes well for budget | Independent of an external bet |
| Hostage to the business cycle | Hard to justify |

## Failure Modes

**A wish list.** Everything a priority, nothing prioritized.

**No sacrifice.** Renegotiated at every meeting.

**Disconnected from the business.** Loses the competition for budget.

**Low actual allocation.** Strategy on paper.

**Wrong horizon.** A disguised roadmap, or five-year fiction.

**Pleases everyone.** It chose nothing.

## Common Mistakes

**Diagnosing the symptom** instead of the cause. The direction attacks the symptom — more people
on maintenance, instead of eliminating the customizations — and the maintenance share does not
drop.

**Not declaring what is left behind.** Every new proposal is evaluated from scratch, and the
capacity reserved for the front is drained by them over the year.

**Not having the conversation** with whoever loses in the sacrifice. The objection shows up after
publication, at the first pressure, and the sacrifice is undone without anyone deciding to undo it.

**Not measuring** the capacity actually allocated. The strategy is judged by the plan, and the gap
between declared and actual — 9% against 30% in the Real-World Example — only shows up when the
results don't.

**Writing a strategy** where a roadmap would do. The cycle of diagnosis, sacrifices and
conversations takes weeks that a small team would spend delivering what the backlog already said.

## Real-World Example

A software company with 180 engineers published an annual technical strategy with six fronts. A
review of three cycles found:

```text
fronts declared per year                      6
fronts with measurable progress by year end   1.3 on average
capacity allocated to strategic fronts        9% (declared: 30%)
fronts repeated from the previous year        4 of 6, on average
```

Four fronts repeated every year is the symptom: they were never finished, and they reappeared.

The fourth cycle's rework:

**A single diagnosis, with a number.** Instead of six problems, one: 69% of capacity was in
maintenance, and the measured cause was version divergence between clients, produced by code-level
customizations.

**One front.** Eliminate the code-level customizations, moving variability into configuration. No
other strategic initiative in the cycle.

**Named sacrifices**, with their costs:

```text
cloud migration                         postponed to the following cycle
infrastructure cost reduction           not attacked; forecast of +14%
test coverage                           held at the current level
observability                           only the minimum for the front
```

Each sacrifice was discussed in advance with the affected area, and all four drew objections. Two
were sustained unchanged; two gained partial mitigation — the cost one got a limit ("+14% is the
ceiling; above that, we reopen it").

**A tie to the business.** The front was stated as a prerequisite of two commercial objectives:
reducing onboarding time for new clients, which was limiting growth; and enabling feature delivery
to all clients at the same time, which was a recurring commercial demand.

**Allocation declared and measured:** 25% of capacity, tracked quarterly.

Results at the end of the cycle:

```text
capacity actually allocated              23% (declared: 25%)
code-level customizations                from 412 to 61
clients on the current version           from 58% to 85%
capacity in maintenance                  from 69% to 51%
new client onboarding                    from ~7 months to 9 weeks
infrastructure cost                      +16% (forecast: +14%)
```

The next cycle could have two fronts, because the capacity freed from maintenance now existed —
which was the strongest argument for keeping the method.

The point the team underlines: the decision to have **one** front was the hardest to get approved
and the one that produced the result. The sacrifice conversations consumed six weeks before
publication, and they are what prevented the sacrifices from being undone in March — which was the
pattern of the previous cycles.

And the cost deviation — 16% against the 14% ceiling — triggered the agreed reopening. It took
one meeting: the excess came from the load of the new clients that shorter onboarding brought in,
and the decision was to accept the two points and keep the sacrifice until the next cycle. Having
declared the ceiling in advance turned the overrun into a decision with an owner and a date,
rather than into a crisis.

## Related Concepts

- [Technical Strategy](/15-enterprise-architecture/technical-strategy.md) — the formulation.
- [Architecture Vision](/23-architecture-leadership/architecture-vision.md).
- [Technical Roadmaps](/23-architecture-leadership/technical-roadmaps.md).
- [Cost Management](/23-architecture-leadership/cost-management.md).

## Practical Exercise

Take your context's technical strategy and look for the sacrifices. If there is no explicit one,
list what in fact stopped being done over the last year.

The difference between the two lists is the real strategy, taken by omission instead of by choice.

## Interview Questions

- Why is sacrifice what separates a strategy from a wish list?
- Why does a strategy with six fronts finish less than one with a single front?
- How does the actual allocation of capacity reveal whether the strategy is real?

## Further Reading

- Rumelt, Richard. *Good Strategy Bad Strategy*. Crown Business, 2011.
- Hohpe, Gregor. *The Software Architect Elevator*. O'Reilly, 2020.
- Larson, Will. *Staff Engineer*. Self-published, 2021.

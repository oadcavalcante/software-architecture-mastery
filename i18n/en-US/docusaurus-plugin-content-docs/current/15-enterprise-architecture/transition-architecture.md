---
id: transition-architecture
title: Transition Architecture
sidebar_position: 18
description: The intermediate states between what exists and what you want — the document most often missing.
doc_type: concept
level: 6
difficulty: advanced
status: complete
objective: >
  By the end, the reader defines viable intermediate states, each delivering value on its
  own.
prerequisites: [target-architecture]
related: [target-architecture, current-state-architecture, architecture-roadmaps]
canonical_for: []
content_version: 1
translated_from_version: 1
last_reviewed: 2026-08-31
---

# Transition Architecture

## Overview

The transition architecture describes the **intermediate states** between what exists and
what you want — each of them a system that works, not a construction site.

It is the piece most frequently missing. Organizations have a current state and a target
state, and between the two a blank space filled in with "we'll migrate along the way".

And it is where the work actually happens: most of the life of a modernization program is
spent in the intermediate states, not at the target.

## Problem

Without defined intermediate states, migration takes two bad forms.

**A single leap.** You build the new one in parallel for two years and switch all at once.
The risk is concentrated, validation happens late, and value only appears at the end — if
it appears.

**Drift.** You start migrating with no defined intermediate destination. Months later, the
system is half migrated, with both versions coexisting indefinitely, and nobody knows
whether to press on or go back.

The second is more common and more expensive: prolonged coexistence has a permanent cost,
and it becomes the final state by inertia.

## Core Concepts

### Each intermediate state has to be viable on its own

The criterion that defines a good intermediate state:

```text
it works            it is an operable system, not a construction site
delivers value      someone is better off because of it
is defensible       if the program stops here, it wasn't wasted
is reversible       or the cost of going back is known
```

The third line is the most important. Modernization programs get interrupted — priorities
change, budget changes, people change. An intermediate state that only makes sense as a
step in a complete plan becomes debt when the plan is abandoned.

And that changes the sequencing: instead of ordering by technical dependency, order by
value delivered — so that stopping at any point leaves the organization better off than
before.

### Coexistence is the rule, not the exception

During the transition, the old and the new coexist. That has to be designed:

```text
which is the source of truth at each moment
how the two sides stay coherent
who writes where
how traffic is split
when and how the old one is shut down
```

The first line is what causes the most damage when left implicit: two systems writing the
same data, with no defined source, produce divergence nobody detects. See
[data consistency](/07-data-architecture/data-consistency.md).

And the last is what most frequently does not happen: the old system stays on "as a
precaution", indefinitely, with the cost of maintaining both.

### Transition patterns

```text
strangler fig    the new one intercepts and takes over features gradually,
                 the old one shrinks until it can be shut down
dual write       write to both, read from one; switch the read when you trust it
shadow           the new one processes in parallel without responding, to compare
slice split      one segment of users, one region, one type of operation
```

See [legacy modernization](/16-legacy-modernization/index.md) for the full treatment.

The choice depends on risk and reversibility: shadow is the safest and the most expensive;
slice split is the one that delivers value earliest.

### Points of no return have to be explicit

Some steps cannot be undone:

```text
data migration with an irreversible transformation
shutting down the old system
a contract change with a third party
discarding the knowledge — people who leave
```

Each of these deserves an explicit decision, with verification beforehand: **is the new
one actually working, at real volume, for long enough?**

The characteristic mistake is shutting the old one down too early, because maintaining
both is expensive — and discovering later a use case only it served.

### The cost of the transition is greater than the sum of its parts

During coexistence, you pay for:

```text
operating both systems
keeping them synchronized
dealing with divergences
twice the work for changes that affect both
the cognitive load of two realities
```

This means **long transitions are expensive in a compounding way**, and that shortening
them has a high return.

And it means a transition plan has to include the cost of being in the middle — which is
frequently omitted from estimates, producing programs that cost far more than expected.

### Define the completion criterion

An intermediate state with no exit criterion becomes permanent.

```text
bad    "when we finish migrating"
good   "when 100% of traffic has been on the new one for 30 days with no incident,
        and no access to the old one has been logged for 60 days"
```

The second lets you shut down with confidence and gives a verifiable milestone. The first
produces indefinite coexistence.

## Mental Model

**Each intermediate state is a system that works and delivers value.** If stopping there
is waste, the state was poorly defined.

## When to Use

- Any migration that takes more than a few months.
- Modernizing systems in production.
- Replacing a vendor.
- Consolidation after an acquisition.
- Boundary changes between systems.

## When Not to Use

**A single leap** in critical systems.

**Without defining the source of truth** during coexistence.

**Without a completion criterion** for each state.

**Without a shutdown plan** for the old one.

**Ordering by technical dependency** instead of by value.

**Without accounting for the cost of coexistence.**

## Alternatives

- **Single leap** — legitimate for small systems, with viable rollback.
- **Parallel rewrite with a switch** — when the old system is impossible to intercept.
- **Freeze and build alongside** — the old one stops evolving, the new one grows.
- **Don't migrate** — a legitimate decision when the system serves and the cost of
  changing does not pay off.

The last one deserves serious consideration and is rarely considered.

## Trade-offs

| Many states | Few |
|---|---|
| Early value, distributed risk | Less coexistence |
| Prolonged coexistence | Bigger leap |
| Reversible at several points | Fewer points of return |

| Strangling | Parallel rewrite |
|---|---|
| Incremental value | Value at the end |
| Interception complexity | Clean build |
| Distributed risk | Concentrated |

## Failure Modes

**Permanent coexistence.** The old one is never shut down.

**Data divergence.** Two sources with no defined truth.

**A state that delivers no value.** If the program stops, it was waste.

**Premature shutdown.** A forgotten use case.

**Underestimated cost.** Coexistence never entered the math.

**A program interrupted midway.** With no defensible state.

## Common Mistakes

**Not defining intermediate states.** Without them the migration is a single leap, which delivers no value until the end and cannot be interrupted without total loss.

**Not defining the source of truth.** During coexistence, both systems hold the same data. Without declaring which one rules, each integration picks its own and divergence is inevitable.

**Having no completion criterion.** Without an objective condition for "done", the transition becomes a permanent state — and the company ends up operating and paying for both systems forever.

**Ordering by technical dependency.** It produces a sequence in which nothing is useful until the end, and the project is cancelled midway having delivered nothing.

**Not planning the shutdown.** The old system stays on "for safety", and the economic benefit of the modernization is never realized.

**Omitting the cost of coexistence.** Operating two systems and synchronizing them costs more than operating either one. That cost has to be in the math that justifies the transition.

## Real-World Example

A bank started replacing its customer record system — 18 years old, used by 23 systems.

The original plan: build the new one in parallel, migrate the data, and switch the 23
integrations over one weekend.

Estimate: 14 months. After 20 months, the new one was built and the switch never happened
— every attempt to schedule it found a system that wasn't ready, and the risk of
switching 23 integrations at once paralyzed the decision.

The rework defined intermediate states, ordered by value:

**State 1 — reads from the new one.** The new one started being populated by replication
from the old one, and the systems that only **read** the record migrated to it. Seven
systems, in three months.

Value delivered: the seven stopped overloading the old system, whose capacity was the
known bottleneck.

**State 2 — dual write.** New records started being written to both, with the old one as
the source of truth. This made it possible to validate the new one with real data,
comparing both sides continuously.

Three months of comparison revealed 14 business-rule divergences — cases the old system
handled in undocumented ways.

**State 3 — inverting the source of truth.** The new one became the source, and the old
one started receiving by replication. The writing systems migrated in waves, by
criticality — the least critical first.

**State 4 — shutdown.** After 90 days with no logged access to the old one, it was shut
down.

The completion criterion for each state was explicit, with verifiable metrics.

Total time: 16 months from the rework — more than the original 14, and with value
delivered from the third month on, and with no switchover weekend at all.

And two intermediate states would have been defensible as a stopping point: after state 1,
the capacity bottleneck was resolved; after state 2, the rule divergences were mapped.

The recorded lesson: the 20 months of the original plan produced no usable value. What
was blocking it was not technical — it was that the only moment of value was the last
one, and it was too risky for anyone to approve.

## Related Concepts

- [Target Architecture](/15-enterprise-architecture/target-architecture.md) — the destination.
- [Current State Architecture](/15-enterprise-architecture/current-state-architecture.md).
- [Architecture Roadmaps](/15-enterprise-architecture/architecture-roadmaps.md).
- [Legacy Modernization](/16-legacy-modernization/index.md).

## Practical Exercise

Take a migration underway in your context and ask: if it stops today, is what has been
delivered defensible?

If the answer is no, the current intermediate state was poorly defined — and the program
is vulnerable to the next shift in priority.

## Interview Questions

- What characterizes a good intermediate state?
- Why order by value instead of by technical dependency?
- Why is the cost of coexistence frequently omitted?

## Further Reading

- Fowler, Martin. *StranglerFigApplication*, 2004.
- Newman, Sam. *Monolith to Microservices*. O'Reilly, 2019.
- Open Group. *TOGAF Standard* — transition architectures.

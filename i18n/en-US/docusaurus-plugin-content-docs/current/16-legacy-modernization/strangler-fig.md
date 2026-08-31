---
id: strangler-fig
title: Strangler Fig
sidebar_position: 3
description: Replacing gradually with the old one in operation — the pattern that makes modernization viable.
doc_type: pattern
level: 6
difficulty: advanced
status: complete
objective: >
  By the end, the reader applies strangling with an appropriate interception point and a
  shutdown plan.
prerequisites: [legacy-modernization]
related: [incremental-modernization, migration-strategies, transition-architecture]
canonical_for: []
translated_from_version: 1
last_reviewed: 2026-08-31
---

# Strangler Fig

## Overview

The strangler fig pattern replaces a system **gradually**: a layer intercepts calls and
routes them — initially all to the old system, progressively more to the new one — until
the old one can be shut down.

The name comes from a plant that grows around a host tree until it replaces it.

It is the pattern that makes modernization viable, because it removes the condition that
makes rewrites fail: the need to finish everything before delivering anything.

## Problem

Replacement by complete rewrite has an unfavorable dynamic:

```text
the old system keeps evolving while the new one is being built
the new one chases a moving target
value only appears at the switchover
the switchover is a high-risk event
an interruption of the project wastes everything
```

See [rebuilding](/16-legacy-modernization/rebuilding.md).

The pattern inverts that: value appears from the first migrated feature onward, and the
risk is distributed across many small switchovers.

## Core Concepts

### The interception point decides viability

The routing layer has to exist somewhere:

```text
HTTP gateway or proxy   intercepts requests — the most common and the simplest
facade in the application  a module that decides where to delegate
event                   the new one consumes the same events as the old one
database                the new one reads the same store, temporarily
user interface          screens migrated one at a time
```

The choice depends on where it is possible to intercept **without modifying the old
system** — which is frequently the real constraint, because modifying it may be exactly
what you cannot do.

When there is no natural interception point, creating one is the project's first job —
and it is frequently underestimated.

### Choosing what to migrate first

Three criteria compete:

```text
value          the feature that solves the motive for the modernization
risk           the one that, if it breaks, causes the least damage
independence   the one with the fewest dependencies on the rest
```

The usual and good choice: **start with something small and independent, to validate the
path**, and go for the value right after.

The common mistake is starting with the easiest and staying there — migrating the
peripheral for months, without touching what motivated the project. That produces visible
progress and no value.

And the opposite mistake: starting with the most critical, without having validated the
interception, data migration and rollback mechanisms.

### The data is the hard part

Intercepting calls is mechanical. Deciding where the data lives, during coexistence, is
not.

```text
the old one is the source   the new one reads from there — simple, and couples to
                            the old schema
the new one is the source   the old one reads from there — requires changing the old one
dual write                  both write — divergence to manage
by slice                    each entity has a source, as the migration advances
```

See [data migration](/16-legacy-modernization/data-migration.md) and
[transition architecture](/15-enterprise-architecture/transition-architecture.md).

The last option is the one that usually works and the most laborious: the source of truth
changes per entity, as it is migrated, and the routing has to know that.

### Reversible at every step

The property that makes the pattern safe:

```text
migrated a feature → something went wrong → route it back
```

That requires the old system to stay **functional** throughout the transition — not
merely on, but able to take over.

And it requires the data to be compatible in both directions, which is the most limiting
constraint. If the new one writes something the old one doesn't understand, going back
stops being possible.

### The shutdown has to be planned from the start

The pattern's characteristic failure mode: coexistence becomes permanent.

```text
80% migrated, the remaining 20% are the hard cases
the main value has already been delivered
priority moves to something else
both systems remain, at double the cost
```

That is common and expensive. What avoids it:

**A completion criterion defined** at the start, for each slice.

**The hard cases mapped early**, so they are not a surprise at the end.

**Shutdown as a delivery**, with a date, and not as a natural consequence.

**Monitor what still uses the old one**, so the remaining slice is visible.

See [transition architecture](/15-enterprise-architecture/transition-architecture.md).

### The interception layer is temporary, and frequently isn't

It is built for the migration and tends to stay — becoming a permanent piece with routing
logic nobody understands afterwards.

Removing it at the end of the migration has to be in the plan, or it becomes the next
legacy system.

## Mental Model

**The new one grows around the old one until it replaces it.** Each step is reversible,
and the shutdown is a delivery, not a consequence.

## When to Use

- Replacing a production system that cannot stop.
- Where a complete rewrite is too risky.
- When value has to appear before the end.
- Where there is a viable interception point.
- When the old system will keep evolving during the transition.

## When Not to Use

**With no viable interception point**, and no ability to create one.

**With no shutdown plan.**

**When the system is small** and direct replacement is viable and cheap.

**Without data compatibility** in both directions.

**Migrating the peripheral indefinitely**, without touching what motivated it.

**When the old one will be discontinued for another reason** before the migration
finishes.

## Alternatives

- **[Rebuilding](/16-legacy-modernization/rebuilding.md)** — when the system is small or the behavior has to
  change radically.
- **[Refactoring](/16-legacy-modernization/legacy-refactoring.md)** — when the problem is internal, not one of
  replacement.
- **[Replatforming](/16-legacy-modernization/replatforming.md)** — when the problem is the infrastructure, not the
  code.
- **Permanent coexistence** — a legitimate decision when the remaining cases don't justify
  migrating, provided it is recorded.

## Trade-offs

| Strangling | Complete rewrite |
|---|---|
| Value from early on | Only at the end |
| Distributed risk | Concentrated at the switchover |
| Prolonged coexistence | No coexistence |
| An interception layer to maintain | None |
| Survives interruption | Wastes everything |

| Intercepting at the gateway | In the application |
|---|---|
| Doesn't modify the old one | Requires modifying it |
| Route granularity | Finer |

## Failure Modes

**Permanent coexistence.** The hard 20% never migrates.

**No interception point.** The project doesn't start.

**Migrating the peripheral.** Progress with no value.

**Going back is impossible.** The data has diverged.

**The interception layer becoming permanent.**

**The old one evolving faster than the migration.**

**Hard cases discovered at the end.**

## Common Mistakes

**Not planning the shutdown.** With no criterion and date for turning the old one off, the company operates and pays for both systems indefinitely — and the strategy delivers cost instead of savings.

**Starting with the easy part and staying there.** The simple parts go quickly and give a sense of progress; what's left is all the hard work, and the support has already been spent.

**Not mapping the hard cases early.** Discovering in month ten that a feature is not extractable changes the viability of the entire strategy — and it is information you can get in month one.

**Not maintaining data compatibility in both directions.** During coexistence, both systems read and write the same data. One-way compatibility makes it impossible to roll a slice back.

**Not monitoring what still uses the old one.** Without measuring the residual traffic, nobody knows whether a forgotten consumer remains — and the shutdown becomes a gamble.

**Not removing the interception layer at the end.** It was scaffolding; kept after the shutdown, it becomes permanent indirection nobody remembers the reason for.

## Real-World Example

A bank replaced its credit origination system — 16 years old, monolithic, with a
quarterly release — by strangling.

The interception point: an HTTP gateway in front, routing per endpoint.

The sequence:

**Slice 1 — proposal lookup.** Read-only, with no write risk. It validated the
interception mechanism, the routing and the observability. Three months.

**Slice 2 — credit simulation.** The feature that motivated the project: simulations took
40 seconds and the business wanted under 3. Delivered in month 7, with the main value
already captured.

**Slices 3 to 8 — the rest of origination**, by product type.

**Slice 9 — the hard cases.** Agreements with partner companies, with rules specific to
each agreement, some negotiated individually.

That last slice was mapped in month 4, not at the end — and the decision about it changed
the plan: of the 340 agreements, 290 followed three patterns, and 50 were unique.

The 290 were migrated. The 50 were **negotiated** — the customers moved to one of the
three patterns, with a commercial incentive. It was cheaper than implementing 50
exceptions in the new system.

That decision was only possible because the hard cases surfaced early, with time to
negotiate.

**Shutdown** in month 22, treated as a delivery with a date.

Two problems during execution:

**Dual write diverging.** For four months, proposals were written to both systems.
Divergences appeared in about 0.4% of cases — different rounding rules. The daily
reconciliation detected it, and the fix was fast because the divergence was visible. See
[data consistency](/07-data-architecture/data-consistency.md).

**The gateway becoming permanent.** By the end of the migration, the gateway had 200
routing rules. Removing it was treated as its own task, in month 24 — and it took
insistence, because "it's working".

What the team records: mapping the hard cases in month 4 was the decision that most
affected the outcome. It turned what would have been an end-of-project blocker into a
commercial negotiation with eighteen months' notice.

## Related Concepts

- [Incremental Modernization](/16-legacy-modernization/incremental-modernization.md) — the discipline.
- [Data Migration](/16-legacy-modernization/data-migration.md) — the hard part.
- [Transition Architecture](/15-enterprise-architecture/transition-architecture.md).
- [Anti-Corruption Layer](/08-integration-architecture/integration-anti-corruption.md).

## Practical Exercise

For a system you would consider replacing, identify where it would be possible to
intercept the calls without modifying it.

If there is no viable point, creating one is the first job — and it has to be in the
estimate.

## Interview Questions

- Why does the strangler fig remove the condition that makes rewrites fail?
- Why does mapping the hard cases early matter so much?
- Why does coexistence tend to become permanent?

## Further Reading

- Fowler, Martin. *StranglerFigApplication*, 2004.
- Newman, Sam. *Monolith to Microservices*. O'Reilly, 2019.
- Feathers, Michael. *Working Effectively with Legacy Code*. Prentice Hall, 2004.

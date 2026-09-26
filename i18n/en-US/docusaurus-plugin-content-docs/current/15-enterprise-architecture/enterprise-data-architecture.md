---
id: enterprise-data-architecture
title: Enterprise Data Architecture
sidebar_position: 4
description: Data that crosses systems — ownership, master data and the cost of not deciding.
doc_type: concept
level: 6
difficulty: advanced
status: complete
objective: >
  By the end, the reader defines data ownership and flow at the organizational level, and
  recognizes the cost of fragmentation.
prerequisites: [enterprise-architecture]
related: [integration-landscapes, application-architecture, data-ownership]
canonical_for: []
translated_from_version: 2
last_reviewed: 2026-08-31
---

# Enterprise Data Architecture

## Overview

The data fundamentals are in
[data architecture](/07-data-architecture/index.md). What matters here is what changes at
the organizational level: **data that crosses systems**.

The central decision is ownership — which system is the source of truth for each piece of
data — and it is, among all enterprise architecture decisions, the one with the widest
reach and the one least often made explicitly.

Without it, the same data exists in diverging versions in several places, and the
organization spends continuous effort reconciling.

## Problem

The fragmentation pattern emerges naturally:

```text
the sales system needs a customer record      → creates its own
the billing system needs one                  → creates its own
the support system needs one                  → creates its own
the customer portal needs one                 → creates its own
```

No team made a mistake. Each one needed the data and there was no source available.

The cost shows up later, and it is permanent:

```text
the same customer with different data in each system
reconciliation processes, with dedicated people
reports that don't match
the customer reports a change and it doesn't propagate
impossible to answer "how many customers do we have?"
```

## Core Concepts

### System of record

For each piece of data, one system is the **source of truth**. The others consume it.

```text
system of record   holds the data, accepts writes, is authoritative
consumer           reads, keeps a copy if needed, is never authoritative
```

This does not mean a single database — it means **single authority**. Copies may exist
for performance or autonomy; they are derived, and divergence is always resolved in favor
of the source.

See [data ownership](/07-data-architecture/data-ownership.md).

The decision of which system is the record for each entity is the core of this area, and
it frequently does not exist — systems established themselves as the source by historical
accident.

### Master data is the hard case

Some data is used by practically every system:

```text
customer
product
supplier
employee
organizational structure
```

These fragment the most, because every system needs them and none wants to depend on
another.

The approaches, in order of implementation and operating cost:

**Record by consensus.** An existing system is declared the source; the others migrate to
consume it. Cheap, and it depends on the chosen system being able to serve.

**Virtual consolidation.** An index that points to the records in the origin systems,
without moving data. Less invasive, and it does not resolve divergence.

**Dedicated service.** A system whose only function is to be the source. Costs a team,
and solves the problem well.

**Hub with synchronization.** A central system that reconciles and distributes. Complex,
and the reconciliation is never perfect.

The first is the one that most often works and the one least considered — because it
requires choosing an existing system, which creates political conflict.

### Fragmentation has a measurable cost

Making it visible is what unblocks the decision:

```text
people dedicated to reconciliation
time spent investigating divergences
rework caused by wrong data
integrations maintained only to synchronize
opportunities lost by not being able to answer questions
```

See [integration landscapes](/15-enterprise-architecture/integration-landscapes.md) — a high
fraction of an organization's integrations exists only to propagate data that is
duplicated.

### Flow matters as much as ownership

Beyond who owns it, what matters is **how the data circulates**:

```text
where it is born
who transforms it
who consumes it
with what latency
what quality is expected at each point
```

The flow map reveals problems the ownership map does not: transformations that lose
information, accumulated latencies that make the data useless at its destination, and
points where quality degrades.

### Quality needs an owner

Data without an owner has no quality. And "everyone is responsible" means no one is.

What works:

```text
owner per data set        one team answers
quality definition        what correct, complete, current mean
continuous measurement    not an annual audit
correction process        who fixes it, in how long
```

See [data consistency](/07-data-architecture/data-consistency.md) — periodic
reconciliation is the mechanism that makes quality verifiable.

### Analytical data needs ownership too

The same reasoning applies to analytical data: a warehouse fed by transformations with no
owner produces numbers no one can defend.

See [data warehouses](/07-data-architecture/data-warehouses.md) and
[data ownership](/07-data-architecture/data-ownership.md).

The idea of treating analytical data as a product, with an owner and a contract, solves
the same problem on the analytical side.

## Mental Model

**For each piece of data, one source of truth.** Copies are derived, and fragmentation
has a permanent cost that needs to be measured.

## When to Use

- Where the same data exists in several systems.
- Before integration or modernization programs.
- When reports don't match.
- After acquisitions.
- Where there is a regulatory requirement about data.

## When Not to Use

**An entity used by one system, or by systems of the same team.** There is no
organizational boundary to cross; ownership is settled inside the team, with no
enterprise decision.

**Measured divergence is low and carries no regulatory exposure.** If reconciliation
costs a fraction of a person and no mandatory report depends on the data, the
consolidation project costs more than it prevents.

**No candidate source can serve.** If the system with the best data cannot handle the
consumers' synchronous reads and cannot be strengthened, declaring it the source trades
divergence for unavailability. Fix the capacity first, or accept the fragmentation for
now.

**Data local to one system.** Not all data needs a single source — what only one system
uses belongs to it.

## Alternatives

- **Record by consensus** — declare an existing system as the source.
- **Dedicated master data service.**
- **Virtual consolidation** — an index without moving data.
- **Accept the fragmentation** — a legitimate decision when the cost of solving exceeds
  the cost of living with it, provided it is recorded.

The last one deserves serious consideration: consolidating master data is a multi-year
project, and it does not always pay off.

## Trade-offs

| Single source | Fragmented |
|---|---|
| Consistency | Divergence |
| Dependency between systems | Autonomy |
| Consolidation project | Continuous reconciliation cost |
| Answers global questions | Doesn't answer them |

| Dedicated service | Existing system as source |
|---|---|
| Politically neutral | Conflict |
| Costs a team | Cheap |
| Designed to serve | May not serve well |

The dependency in the first table is operational. The source becomes an availability
dependency for every consumer that writes or reads the data, and needs an SLO matching
the most demanding of them. Each consumer must decide what it does when the source is
down — refuse the operation, or proceed with its copy and accept stale data — and the
derived copies need an invalidation policy: time-based expiry, or a change event
published by the source.

## Failure Modes

**No defined source.** Permanent divergence.

**Hub without ownership.** Reconciles without resolving.

**A copy treated as authoritative.**

**Quality without an owner.**

**Consolidation without migrating the consumers.** The new source exists, and no one uses
it.

**Accumulated latency.** The data reaches its destination too old to be useful.

## Common Mistakes

**Not declaring a system of record.** Every system keeps considering itself the source,
and reconciliation becomes a permanent activity, with people dedicated to it.

**Confusing single authority with a single database.** The project turns into migrating
every system onto one store, the cost explodes, and the initiative dies before declaring
any source.

**Creating a hub as the solution.** Without deciding who owns each field, the hub becomes
one more divergent record — reconciliation now has ten sides instead of nine.

**Not measuring the cost of fragmentation.** Without a number, the ownership decision
loses every priority contest to new features.

**Not assigning a quality owner.** The source exists, but wrong data in it is propagated
with authority to every consumer.

**Consolidating everything** instead of choosing what matters. Effort spreads over data
only one system uses, and the master data that causes the divergence is left for later.

## Real-World Example

A healthcare network had patient data in nine systems. Each with its own record, fed
through different paths.

The cost, once measured:

```text
6 full-time people reconciling records
about 4% of visits with divergent data
impossible to answer how many unique patients the network served
one regulatory fine for inconsistent data in a report
```

Nine systems, and none was the source — each considered itself to be.

The chosen approach was record by consensus: the scheduling system, which already had the
most complete record and was the entry point for most patients, was declared the source.

This created conflict — three departments argued that their system should be the source —
and the decision was made with a stated criterion: where the data is born most often, and
where quality is highest.

Execution, in phases:

**Phase 1.** The other eight systems started reading from the source, keeping their own
records for writes — and every local write was also sent to the source. On conflict, the
source's value prevailed and the case went to a review queue. This alone reduced
divergences visible to the patient.

**Phase 2.** Writes were centralized. Each system, one at a time, stopped accepting
records and started redirecting to the source.

**Phase 3.** Local records were removed, leaving cached copies, explicitly derived.

Total execution time: 26 months, not counting the four months of negotiation that
preceded it.

Result: the 6 reconciliation people were reassigned, divergences dropped to under 0.2%,
and the question of how many unique patients came to have an answer.

And one decision in the opposite direction: each unit's scheduling data stayed local. It
is not shared, and consolidating it would have cost without benefit.

The recorded conclusion: the technical part was the smallest. The decision of which
system would be the source took four months of negotiation, and it was the prerequisite
for everything else.

## Related Concepts

- [Data Ownership](/07-data-architecture/data-ownership.md) — the fundamentals.
- [Integration Landscapes](/15-enterprise-architecture/integration-landscapes.md) — the cost of propagation.
- [Application Architecture](/15-enterprise-architecture/application-architecture.md).
- [Data Consistency](/07-data-architecture/data-consistency.md).

## Practical Exercise

Pick a central entity in your organization — customer, product — and list how many
systems it exists in.

Then ask, for each one: is this the source, or a copy? If more than one answers "source",
you have found the fragmentation.

## Interview Questions

- Why is single authority not a single database?
- Why is record by consensus often better than a central hub?
- Why is the decision of which system is the source political before it is technical?

## Further Reading

- Dehghani, Zhamak. *Data Mesh*. O'Reilly, 2022.
- Loshin, David. *Master Data Management*. Morgan Kaufmann, 2008.
- Kleppmann, Martin. *Designing Data-Intensive Applications*. O'Reilly, 2017.

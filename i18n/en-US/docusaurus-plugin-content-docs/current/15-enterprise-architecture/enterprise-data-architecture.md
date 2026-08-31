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
translated_from_version: 1
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

The approaches, in order of cost:

**Record by consensus.** An existing system is declared the source; the others migrate to
consume it. Cheap, and it depends on the chosen system being able to serve.

**Dedicated service.** A system whose only function is to be the source. Costs a team,
and solves the problem well.

**Virtual consolidation.** An index that points to the records in the origin systems,
without moving data. Less invasive, and it does not resolve divergence.

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

**Chasing a single database.** Single authority is not single storage.

**Creating a central hub** without resolving ownership.

**Without measuring the cost of fragmentation.**

**Without an owner per data set.**

**Consolidating everything.** Not all data needs a single source — data local to one
system belongs to it.

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

## Failure Modes

**No defined source.** Permanent divergence.

**Hub without ownership.** Reconciles without resolving.

**A copy treated as authoritative.**

**Quality without an owner.**

**Consolidation without migrating the consumers.** The new source exists, and no one uses
it.

**Accumulated latency.** The data reaches its destination too old to be useful.

## Common Mistakes

**Not declaring a system of record.**

**Confusing single authority with a single database.**

**Creating a hub as the solution.**

**Not measuring the cost of fragmentation.**

**Not assigning a quality owner.**

**Consolidating everything** instead of choosing what matters.

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

**Phase 1.** The nine systems started querying the source for reads, keeping their own
records for writes. This alone reduced divergences visible to the patient.

**Phase 2.** Writes were centralized. Each system, one at a time, stopped accepting
records and started redirecting to the source.

**Phase 3.** Local records were removed, leaving cached copies, explicitly derived.

Total time: 26 months.

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

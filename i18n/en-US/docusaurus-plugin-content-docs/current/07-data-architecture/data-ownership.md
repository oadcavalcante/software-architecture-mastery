---
id: data-ownership
title: Data Ownership
sidebar_position: 20
description: Who decides about each piece of data — the least technical decision in this section and the one that most determines teams' speed.
doc_type: concept
level: 5
difficulty: advanced
status: complete
objective: >
  By the end, the reader assigns data ownership so that teams can evolve in parallel,
  and recognizes the shared database as coupling.
prerequisites: [data-architecture]
related: [data-consistency, data-modeling, data-lifecycle]
canonical_for: []
translated_from_version: 1
last_reviewed: 2026-08-31
---

# Data Ownership

## Overview

Data ownership answers: for each set of data, **who decides about it** — who can change the schema, who
defines the meaning, who is responsible for the quality.

It is the least technical topic in this section and the one that most determines whether teams can work
in parallel or spend their time blocking each other.

When nobody is the owner, everybody is responsible for nothing, and the data rots by consensus.

## Problem

The most common pattern in systems that have grown: one shared database, several applications reading
and writing the same tables.

That looks efficient — no duplication, no integration, direct queries.

And it produces a coupling worse than code coupling, because it is invisible: no tool shows who depends
on that column. You find out by removing it and seeing what breaks.

The symptom: no schema change is possible without a meeting with four teams, and so the schema stops
changing.

## Core Concepts

### A shared database is a public interface with no contract

When several services read the same table, the schema has become an API — only with no versioning, no
documentation and nobody knowing who the consumers are.

Each column is a permanent commitment. Renaming breaks unknown consumers.

That is not an argument for splitting everything into separate databases — it is an argument for knowing
what is an interface and what is internal.

### One owner, many readers

The model that works:

**One service owns** the data set. Only it writes. It decides the schema.

**Others consume** through an explicit interface — an API, an event, or a published view with a
contract.

The decisive distinction: the owner can change the **internal model** freely, and change the **published
interface** with a compatibility process.

Without that separation, every internal detail becomes an accidental contract.

### The source of truth has to be single and declared

For each fact, exactly one place is authoritative.

Copies can exist — a cache, a projection, a warehouse — as long as it is clear that they are derived,
and that divergence is always resolved in favor of the source.

Systems with two authoritative sources for the same data produce the question that has no answer: "which
of the two is right?".

### Ownership is organizational, not technical

An owner has to be a team with the capacity to decide and to answer — not a name on a spreadsheet.

That means the division of data tends to follow the division of teams, and a division that does not
correspond to the organization does not hold. See
[bounded contexts](/04-domain-driven-design/bounded-context.md).

When the owning team has no autonomy or capacity, the ownership is nominal and the data deteriorates all
the same.

### A data contract makes the dependency explicit

What a contract has to say:

```text
schema             fields, types, whether they are required
meaning            what each field represents
guarantees         update frequency, maximum lag
quality            what the owner guarantees — uniqueness, completeness
compatibility      how changes are communicated and for how long they coexist
```

Without that, the consumer discovers the change when it breaks.

### Shared data requires an explicit decision

Some data is genuinely cross-cutting — the customer registry, the product table, the organizational
hierarchy.

The options, in order of practical preference:

**A clear owner** that publishes to the rest. It works when a natural team exists.

**A dedicated service** for the cross-cutting data. It costs a team.

**Replication with a single write owner.** Each consumer has its copy, updated by events.

**A shared database with explicit governance.** Acceptable when documented, with a change process — and
the worst option when it happens by omission.

### A data mesh takes the principle to analytics

The central idea: analytical data also has an owner — the team that generates the data is responsible
for publishing it with quality, as a product.

That undoes the bottleneck of a central data team responsible for integrating everything, and transfers
a real cost to the domain teams.

It works where there is maturity and a platform that reduces the friction. Adopted without that, it
produces published data sets with no quality and no maintenance.

## Mental Model

**With no declared owner, the data belongs to nobody.** And data that belongs to nobody does not evolve,
has no quality and blocks everyone.

## When to Use

Explicit ownership pays off whenever:

- More than one team touches the same data.
- Schema changes are blocked by coordination.
- There is doubt about which system has the right number.
- Nobody knows who consumes a table.
- Quality problems have no owner.

## When Not to Use

**Formalizing contracts between modules of the same application, with a single team.** Overhead with no
benefit.

**Splitting databases on principle.** The split solves organizational coupling; without it, it adds
cost.

**A nominal owner with no autonomy.** Worse than not having one, because it creates the impression of
governance.

**A data mesh with no platform.** It transfers cost without reducing friction.

**A contract with no change process.** It becomes outdated documentation.

## Alternatives

- **A shared database with governance** — documented, with a process.
- **A published view** — the owner exposes a stable view over the internal model; the consumers read only
  it. A cheap and underestimated middle ground.
- **Replication by events** — each consumer with its copy.
- **A central data team** — it works at a smaller scale.

## Trade-offs

| Single owner | Shared |
|---|---|
| Evolves with no coordination | Every change negotiated |
| Explicit interface | Invisible coupling |
| Quality with an owner | Diffuse |
| Integration to build | Direct queries |
| Controlled duplication | No duplication |

| Formal contract | Informal agreement |
|---|---|
| Predictable change | Breaks with no warning |
| Known consumers | Unknown |
| A process to maintain | None |

## Failure Modes

**A frozen schema.** No change gets through the necessary coordination.

**An unknown consumer broken.**

**Two sources of truth.** Nobody knows which one holds.

**Quality with no owner.** Everyone complains, nobody fixes.

**Writing from outside.** A script changes another domain's data.

**A nominal owner.** It exists on paper and decides nothing.

## Common Mistakes

**Not declaring owners.**

**Treating the database schema as an internal detail** when others read it.

**Allowing writes from outside the owner.**

**Not inventorying consumers.**

**Splitting databases without splitting responsibility.**

**Confusing "who stores it" with "who owns it".**

## Real-World Example

A financial services company had a central database with 340 tables, accessed by eleven applications
from seven teams.

The symptom that motivated the change: adding a field to the customers table took an average of eleven
weeks — the time to coordinate with every team that might be affected, with nobody knowing for sure which
they were.

The inventory revealed the picture:

**23 tables with no identifiable owner.** Created by projects that had ended.

**The customer registry** written by four different applications, each with its own validations. Three
phone formats coexisted.

**Nine tables with no consumer.** Nothing had read them for over a year.

**Two places with the customer's address**, updated through different paths, diverging in 6% of records.

The reorganization took two years and did not end in splitting databases:

**A declared owner** per table, with the decision recorded. Where there was no natural owner, the
discussion was escalated — and in four cases it revealed that the data belonged to a business process
with no defined owner, which was the real problem.

**Writes restricted to the owner**, through database permissions. It was the most unpopular change and
the most effective — it made the clandestine write paths visible, and there were fourteen.

**Published views** for consumers outside the owner, with a contract. The internal model came to be
changeable with no coordination.

**Tables with no consumer** removed, after six months of access monitoring.

**The customer registry** with a single writing service.

Result: adding a field went from eleven weeks to days, with no database moved anywhere.

The recorded lesson: the initial proposal was to split into separate databases per domain — a project
estimated at two and a half years. Declared ownership with published views delivered the same unblocking
with no migration.

The problem was one of responsibility, not of topology.

## Related Concepts

- [Data Consistency](/07-data-architecture/data-consistency.md) — the source of truth.
- [Data Modeling](/07-data-architecture/data-modeling.md).
- [Bounded Context](/04-domain-driven-design/bounded-context.md) — the corresponding boundary.
- [Data Lifecycle](/07-data-architecture/data-lifecycle.md).

## Practical Exercise

Pick the five most important tables in your system and ask, for each one: who can change the schema
without asking permission, and who consumes it?

Where the second answer is "I don't know", you have a contract nobody can honor.

## Interview Questions

- Why is a shared database a public interface with no contract?
- What is the difference between the internal model and the published interface?
- Why is data ownership an organizational decision?

## Further Reading

- Dehghani, Zhamak. *Data Mesh*. O'Reilly, 2022.
- Newman, Sam. *Building Microservices*. 2nd ed. O'Reilly, 2021 — chapter 4.
- Evans, Eric. *Domain-Driven Design*. Addison-Wesley, 2003.

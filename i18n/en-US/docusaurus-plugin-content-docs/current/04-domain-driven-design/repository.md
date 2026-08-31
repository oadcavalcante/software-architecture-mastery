---
id: repository
title: Repository
sidebar_position: 17
description: A collection of aggregates with the appearance of memory — and what separates a repository from a DAO.
doc_type: pattern
level: 2
difficulty: intermediate
status: complete
objective: >
  By the end, the reader designs repositories in the domain's vocabulary and
  recognizes when the pattern has degenerated into a data access layer.
prerequisites: [aggregate]
related: [aggregate, factory, dependency-inversion]
canonical_for: [repository]
translated_from_version: 1
last_reviewed: 2026-08-31
---

# Repository

## Overview

A repository offers access to aggregates with the appearance of an in-memory collection. The
domain asks for an aggregate and receives it; how it is persisted is not part of the
contract.

The difference between a repository and a data access layer is subtle in structure and
enormous in consequence.

## Problem

The domain needs aggregates that are persisted. If it knows SQL, an ORM or the schema, the
business rules become tied to the storage technology — and testing them requires a database.

The repository solves that by inverting the dependency: the interface belongs to the domain,
the implementation to infrastructure. See
[dependency inversion](/02-software-design/dependency-inversion.md).

## Core Concepts

### One repository per aggregate

The rule that most reduces the number of repositories: **only aggregate roots have
repositories.**

Internal objects are accessed through the root. An `OrderItemRepository` allows changing an
item without going through the order — which nullifies the invariant protection the
[aggregate](/04-domain-driven-design/aggregate.md) exists to provide.

### A repository is not a DAO

The distinction that decides whether the pattern is being used or merely named.

| | Repository | DAO |
|---|---|---|
| Vocabulary | The domain's | Persistence's |
| Unit | Aggregate | Table or row |
| Interface belongs to | The domain | Infrastructure |
| Returns | A complete aggregate | A record or projection |
| Methods | Few, specific | Generic: CRUD, search by any field |

```text
❌  findByStatusAndDateBetweenOrderByAmount(...)
✅  pendingOrdersFor(customer)
```

On the left, the method exposes the query's structure. On the right, it expresses a business
question.

A repository with thirty generic methods is a DAO under another name — and the domain stays
coupled to the way of querying.

### A repository does not serve screen reads

An expensive and common mistake: using the repository to feed listings and reports.

Repositories return complete aggregates, with all the invariants loaded. A screen showing
five fields of a hundred orders does not need a hundred aggregates — it needs a projection.

See [CQRS](/03-design-patterns/cqrs.md) level 2: reads go straight to the database, with a
query returning exactly what the screen needs.

Insisting on using the repository for reads is the origin of the large aggregate and of the
N+1 problem.

### The collection is a useful illusion

The in-memory collection metaphor guides the interface's design: `add`, `remove`, `findBy`.
Not `save`, `update`, `insert` — which are database vocabulary.

The illusion has limits: pagination, complex queries and performance eventually leak.
Recognizing where it leaks is part of using the pattern well.

## When to Use

- There are aggregates that have to be persisted and retrieved.
- The domain has to be testable without infrastructure.
- The persistence technology may change.
- The core domain justifies the ceremony.

## When Not to Use

**For screen reads.** Use a direct projection.

**In supporting or generic subdomains.** Direct database access is usually the correct answer
there. See [tactical DDD](/04-domain-driven-design/tactical-ddd.md).

**When the ORM already offers the abstraction.** Some ORMs implement the unit-of-work and
repository patterns; wrapping that in another repository adds a layer that hides nothing.

**When it becomes a DAO.** If the interface only has generic methods, it is not buying
decoupling.

**When there is no intention of swapping or of testing in isolation.** The pattern costs an
interface and a mapping; with neither benefit, it is ceremony.

## Alternatives

- **A read projection** — for screen queries.
- **Direct ORM access** — in simple subdomains.
- **A unit of work** — when transaction control is the main need.
- **A specialized query object** — one object per complex query, rather than one more method
  on the repository.

## Trade-offs

| Repository | Direct access |
|---|---|
| Domain testable without a database | Tests carry infrastructure |
| Domain vocabulary | Persistence's |
| Technology replaceable | Swapping touches the domain |
| An interface and mapping to maintain | Nothing extra |
| An illusion that leaks on performance | Full control of the query |
| One per aggregate, few methods | Free ad hoc queries |

## Failure Modes

**Repository that became a DAO.** Generic methods, persistence vocabulary.

**Repository for an internal object.** The aggregate's invariant stops being protected.

**Repository used for screen reads.** It loads complete aggregates unnecessarily; the origin
of N+1.

**Repository that returns the ORM's type.** The leak nullifies the decoupling.

**Repository with business rules.** A query filtering by an implicit rule — "valid orders" —
hides in data access something that belongs to the domain.

## Common Mistakes

**Creating one repository per entity.** Aggregate roots only.

**Generic query methods.**

**Using it for reads.**

**Leaving the interface in the infrastructure package.** It nullifies the inversion. See
[dependency inversion](/02-software-design/dependency-inversion.md).

## Real-World Example

A hospital management system had a `PatientRepository` with 47 methods: `findByName`,
`findByNameAndDateOfBirth`, `findActive`, `findWithOpenAdmission`,
`findForMonthlyReport`, and so on.

Three problems at once.

The patient search screen loaded complete aggregates — with admission and prescription
history — to display name, date of birth and record number. A search returning 200 patients
loaded tens of thousands of objects.

`findForMonthlyReport` contained, in the query, the rule for which patients count towards the
report — a business decision hidden in an SQL clause, which the compliance team could not
audit.

And any schema change touched all 47 methods.

The separation went in three directions.

The repository was left with four methods, in the domain's vocabulary: `findById`,
`findByRecordNumber`, `add`, `remove`. Only what the domain needs to operate on a patient.

The screen queries became projections: one query per screen, returning a type with the
displayed fields. The search dropped from 4 seconds to 60 milliseconds.

And the report's rule moved out of SQL into a domain service, where it could be tested and
audited.

What the team recorded: the repository had grown to 47 methods one at a time, and each
addition was reasonable. The problem was none of them — it was not having a criterion saying
what belongs in the repository and what does not.

## Related Concepts

- [Aggregate](/04-domain-driven-design/aggregate.md) — the unit the repository accesses.
- [Factory](/04-domain-driven-design/factory.md) — creation, in contrast to retrieval.
- [Dependency Inversion](/02-software-design/dependency-inversion.md).
- [CQRS](/03-design-patterns/cqrs.md) — reads by another route.

## Practical Exercise

Count the methods on your system's repositories. For each method, check: is it used by the
domain to operate, or by a screen to display?

The second kind belong in read projections.

Then check the vocabulary: do the names describe business questions or query structures?

## Interview Questions

- What is the difference between a repository and a DAO?
- Why do only aggregate roots have repositories?
- Why is using a repository for screen reads a problem?

## Further Exploration

- Evans, Eric. *Domain-Driven Design*. Addison-Wesley, 2003.
- Vernon, Vaughn. *Implementing Domain-Driven Design*. Addison-Wesley, 2013.
- Fowler, Martin. *Patterns of Enterprise Application Architecture*, 2002.

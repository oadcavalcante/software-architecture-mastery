---
id: data-consistency
title: Data Consistency
sidebar_position: 18
description: The word that means three different things — and how to know which one is being discussed.
doc_type: concept
level: 5
difficulty: advanced
status: complete
objective: >
  By the end, the reader distinguishes consistency as constraint, as isolation and as
  replication, and chooses the guarantee per operation.
prerequisites: [transactions]
related: [data-replication, transactions, data-ownership]
canonical_for: []
translated_from_version: 1
last_reviewed: 2026-08-31
---

# Data Consistency

## Overview

"Consistency" is used for three different things, and most of the confusing discussions about the topic
come from two people using distinct senses.

**Consistency as a constraint.** The model's declared rules hold — the C in ACID.

**Consistency as isolation.** Concurrent transactions do not interfere with each other.

**Consistency as replication.** Every copy shows the same value.

They are independent problems, with independent solutions. A system can have all three, one, or none.

## Problem

The question "is this system consistent?" has no answer, because it does not specify which sense.

A single-instance relational database has constraint and isolation consistency, and the replication one
does not apply.

A replicated system can have perfect isolation on each node and show different values depending on the
node queried.

A microservices architecture can have each service internally consistent and no guarantee between them.

Knowing which one is being discussed is the prerequisite for any decision.

## Core Concepts

### Constraint: the guarantee that holds for everyone

Foreign key, uniqueness, check, not-null. Declared in the store, they hold for every write — including
correction scripts and integrations nobody remembers.

The characteristic error is implementing those rules only in the application. It works while there is a
single write path, and fails silently on the day the second one appears.

Rule of thumb: if the rule is about the data, it belongs to the data. If it is about the process, it
belongs to the application.

### Isolation: within one store

It is the domain of [transactions](/07-data-architecture/transactions.md) and isolation levels.

The relevant point here: isolation is a guarantee **local to the store**. It says nothing about what
happens between two databases, between two services, or between the database and the search index.

### Replication: between copies

It is where [eventual consistency](/06-distributed-systems/eventual-consistency.md) and
[strong consistency](/06-distributed-systems/strong-consistency.md) live.

The practical decision is per operation, not per system: reading the balance before debiting requires
strong consistency; listing the history tolerates lag.

Systems that choose one guarantee for everything either overpay or take too much risk.

### Consistency between services is given by nobody

The least discussed case and the most common in practice.

When the order is in one service and the stock in another, no database guarantee covers the relationship
between them. Coherence has to be built — with [sagas](/06-distributed-systems/sagas.md), with events,
with reconciliation.

And it has to be **verified**, because every strategy eventually fails.

### Reconciliation is infrastructure, not a remedy

The control that almost never exists and should: a periodic process that compares two sources that
should agree and alerts on divergence.

The sum of the items against the order total. The count in the database against the count in the search
index. The balance against the sum of the movements.

Without that, the divergence is discovered by the customer, by an audit, or by chance — typically months
later, when fixing it is expensive and the cause has been forgotten.

A reconciliation costs hours to implement and is the difference between detecting in a day and detecting
in a year.

### The guarantee is chosen per operation

The table that summarizes the practical decision:

```text
operation                        required guarantee
debit a balance                  strong, with a lock or a relative operation
reserve stock                    strong, partition scope
list a customer's orders         session — read your own writes
monthly report                   eventual, hours of lag acceptable
catalog search                   eventual, minutes of lag
executive dashboard              eventual, with the update date visible
```

No line is "the system's consistency". They are all operational decisions.

## Mental Model

**"Consistent" is an incomplete question.** Consistent in which sense, for which operation, observed by
whom?

## When to Use

Strong guarantees where:

- The data controls a finite resource.
- An irreversible decision depends on the value.
- There is a regulatory requirement.
- The invariant involves more than one record.

Weak guarantees with reconciliation where:

- The lag is tolerable to the business.
- The operation is reversible or compensable.
- The scale requires it.

## When Not to Use

**Uniform strong consistency.** It pays on everything to protect little.

**Integrity rules only in the application.**

**Eventual consistency with no reconciliation.** Silent and permanent divergence.

**Eventual consistency without confirming with the business.** It is a product decision.

**Presuming a guarantee between services.** It does not exist by default.

**Discussing "consistency" without specifying the sense.**

## Alternatives

- **A local [transaction](/07-data-architecture/transactions.md)** — when the data fits in the same
  store, the guarantee comes for free.
- **Bringing the data together** — the service boundary may be in the wrong place.
- **A [saga](/06-distributed-systems/sagas.md) with compensation.**
- **Periodic reconciliation** — for rare and correctable divergences.
- **Session guarantees** — they solve the user's perception at a low cost.

## Trade-offs

| Strong | Eventual with reconciliation |
|---|---|
| No divergence | A divergence window |
| Coordination latency | Local writes |
| Limited scale | Scales |
| No extra process | Reconciliation to operate |
| Unavailable under a partition | Available |

| Constraint in the database | In the application |
|---|---|
| Holds for every writer | Only for whoever goes through the code |
| An error at write time | Discovered on read |
| Migration has to handle it | Flexible |

## Failure Modes

**Silent divergence between services.**

**An orphan reference.** With no foreign key, pointing to a deleted record.

**An aggregate divergent from the source.**

**A search index out of sync.** The record exists and does not appear in the search.

**A business rule violated by a script.** The validation was only in the application.

**Two screens showing different numbers.** Different sources, with no reconciliation.

## Common Mistakes

**Not declaring constraints in the store.** Validation only in the application fails when there is more
than one write path — another service, a migration, a manual correction. The constraint in the database
is the only one nobody circumvents by accident.

**Having no reconciliation.** Distributed systems diverge through partial failure, and the divergence
nobody looks for is only discovered by the customer. A periodic process that compares and reports is
cheap and is what turns an incident into a finding.

**Treating consistency as a global system property.** It is chosen per flow: a balance requires strong,
a view counter does not. Declaring it at the system level forces the most expensive everywhere or the
cheapest where it does not fit.

**Confusing the three senses in one discussion.** ACID's C, CAP's C and read consistency are distinct
things with the same name. Two people can agree on everything and appear to disagree, only for being in
different senses.

**Adopting eventual consistency with no business decision.** The window in which the data is wrong has a
consequence for someone, and whoever answers for it is who has to accept it.

## Real-World Example

A course platform had three sources that should agree about enrollments: the transactional database, the
catalog's search index and a per-class count aggregate shown in the interface.

Each one was updated by a different path, and no comparison existed.

Over two years, the divergences accumulated:

**The search index.** 3,400 enrollments did not appear in the search — events lost during deployments.
Students reported "I cannot find my course", and support reindexed case by case, without investigating
the cause.

**The per-class count.** It diverged in 8% of classes. Some appeared with available seats while full,
generating enrollments above the limit.

**Orphan references.** 900 enrollments pointing to deleted classes — there was no foreign key, because
the table had been created by a migration that omitted it.

None of those was detected by monitoring. They all came from complaints.

The fixes, in order of return:

**Daily reconciliation** comparing the three sources, with an alert. Half a day of work. It came to
detect in 24 hours what previously took months.

**A foreign key** declared, after cleaning up the orphans.

**A count computed on demand** for classes near the limit, and the aggregate kept only for approximate
display — an explicit decision about which number is authoritative.

**Periodic full reindexing**, accepting that events get lost.

What was recorded afterwards: the discussion that unblocked everything was separating the word's three
senses. Before that, the meetings alternated between transaction isolation, referential integrity and
index synchronization as if they were the same problem — and no decision came out.

## Related Concepts

- [Transactions](/07-data-architecture/transactions.md) — the isolation sense.
- [Data Replication](/07-data-architecture/data-replication.md) — the replication sense.
- [Consistency](/06-distributed-systems/consistency.md) — the full spectrum.
- [Data Ownership](/07-data-architecture/data-ownership.md) — who is the authoritative source.

## Practical Exercise

List the pairs of sources in your system that should agree about the same fact. For each pair, ask: is
there anything that compares the two?

Where there is not, write the comparison and run it once. The number that comes out is the real measure
of your consistency.

## Interview Questions

- What are the three senses of "consistency" and why does confusing them get in the way?
- Why do constraints belong to the store?
- What does a reconciliation detect that monitoring does not?

## Further Reading

- Kleppmann, Martin. *Designing Data-Intensive Applications*. O'Reilly, 2017 — chapters 5 and 7.
- Bailis, Peter et al. *Feral Concurrency Control*. SIGMOD, 2015.
- Helland, Pat. *Life Beyond Distributed Transactions*. CIDR, 2007.

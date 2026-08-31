---
id: transactions
title: Transactions
sidebar_position: 19
description: ACID and isolation levels — what each level allows to happen, and why the default is surprising.
doc_type: concept
level: 5
difficulty: intermediate
status: complete
objective: >
  By the end, the reader chooses an isolation level knowing which anomaly each one admits,
  instead of accepting the database's default.
prerequisites: [relational-databases]
related: [data-consistency, oltp, indexing]
canonical_for: []
translated_from_version: 1
last_reviewed: 2026-08-31
---

# Transactions

## Overview

A transaction groups operations so that either all of them happen or none does, and so that concurrent
operations do not interfere with each other in undesired ways.

The atomicity part is well understood. The **isolation** part is not — and it is where the hard defects
live: the ones that pass every test and appear only under real concurrency.

This document is about the second part.

## Problem

Nearly every developer knows a transaction guarantees "all or nothing".

Almost none knows which isolation level their database uses by default, nor which anomalies that level
allows.

The result: code written assuming total isolation, running at a level that admits several
interferences. The defects from that are intermittent, load-dependent and nearly impossible to
reproduce.

## Core Concepts

### ACID, with the letter that matters

**Atomicity.** All or nothing.

**Consistency.** The declared constraints remain valid. It is the least interesting letter — it
depends on what you declared.

**Isolation.** Concurrent transactions do not interfere. It is the letter that causes problems.

**Durability.** What was committed survives a failure.

### The anomalies, in order of severity

**Dirty read.** Reading data from a transaction that has not committed yet — and that can be undone.

**Non-repeatable read.** Reading the same record twice in the same transaction and getting different
values, because another transaction changed it between the reads.

**Phantom read.** Executing the same query twice and getting different sets of rows, because another
transaction inserted records that satisfy the filter.

**Lost update.** Two transactions read the same value, compute from it and write. The second overwrites
the first's effect.

**Write skew.** Two transactions read the same set, each checks a condition, and both write — producing
a state neither would have allowed on its own.

The last two cause the most real damage, and the last is the subtlest.

### The levels and what each one admits

```text
                        dirty   non-        phantom  lost
                        read    repeatable  read     update
read uncommitted        yes     yes         yes      yes
read committed          no      yes         yes      yes
repeatable read         no      no          varies   no
serializable            no      no          no       no
```

**Read committed** is the default in most databases. It allows non-repeatable reads, phantoms and lost
updates.

That means your database's default behavior admits lost updates — and it is the origin of the classic
"read balance, compute, write balance" defect.

### Write skew is the one that fools you

```text
rule: always at least one doctor on call
state: two doctors on call

transaction A                  transaction B
reads: 2 on call               reads: 2 on call
checks: ok, I can leave        checks: ok, I can leave
removes A from the rota        removes B from the rota
commits                        commits

result: zero doctors on call
```

Neither transaction read dirty data. Neither overwrote the other's write. Each checked the rule
correctly.

And the rule was violated. That is write skew, and only the serializable level prevents it — or an
explicit lock.

### An explicit lock is the practical way out

Serializable has a cost and not every database implements it the same way. In practice, the most used
pattern is reading with an explicit lock on critical operations:

```sql
SELECT balance FROM accounts WHERE id = ? FOR UPDATE
```

That serializes access to that record without raising the isolation of everything. It is the technique
that solves lost updates in business code.

The lock-free alternative is optimistic control: read the version, write checking that it has not
changed, retry if it did.

### A long transaction is the operational problem

An open transaction holds locks and prevents cleaning up old versions.

The characteristic error: opening a transaction, calling an external service, and committing
afterwards. If the service takes 30 seconds, the locks last 30 seconds.

The rule: no network call inside a transaction.

## Mental Model

**Isolation is a spectrum, and your database's default is far from the top.** Knowing which anomaly
each level admits is the difference between correct code and code that works most of the time.

## When to Use

- Multiple writes that have to be atomic.
- A read followed by a write based on what was read.
- Invariants involving more than one record.
- Any operation where a partial state is unacceptable.

## When Not to Use

**Serializable isolation for everything.** High cost and contention.

**A transaction involving an external call.**

**A transaction for a single read operation.** There is nothing to isolate.

**A long transaction for batch processing.** Split it into smaller batches.

**Relying on the database's default without knowing what it is.**

**A distributed transaction.** See
[distributed transactions](/06-distributed-systems/distributed-transactions.md) — another problem,
another cost.

## Alternatives

- **An explicit lock** — serializes the critical record without raising everything.
- **Optimistic version control** — no locking, with retries.
- **The database's atomic operation** — `UPDATE balance = balance - ?` avoids the whole
  read-compute-write cycle.
- **A uniqueness constraint** — lets the database reject the duplicate.

The third is the most underestimated: a good part of the lost update cases disappears by expressing
the change as a relative operation instead of an absolute value.

## Trade-offs

| High isolation | Low |
|---|---|
| Fewer anomalies | More |
| More contention | Less |
| Lower throughput | Higher |
| Simple reasoning | Requires care in the code |

| Pessimistic locking | Optimistic |
|---|---|
| No conflict | A retry on conflict |
| Blocks others | Does not block |
| Good under high contention | Good under low |
| Risk of deadlock | No deadlock |

## Failure Modes

**Lost update.** The read-compute-write cycle under concurrency.

**Write skew.** The invariant breaks with no classic anomaly.

**Deadlock.** Two transactions waiting on each other's locks.

**A long transaction.** It holds locks and prevents cleanup.

**Contention on a hot record.** Every operation serializes on a single record.

**Silent rollback.** The application does not check whether the commit succeeded.

## Common Mistakes

**Not knowing the default isolation level.**

**Reading, computing in the application and writing** with no lock and no version check.

**A network call inside the transaction.**

**Not handling deadlocks.** They happen; the code has to retry.

**Assuming a transaction solves concurrency.** It solves what the level covers.

**Confusing a local transaction with a distributed one.**

## Real-World Example

An internal credits system had the consumption operation implemented like this: read the balance,
check whether it is sufficient, subtract in the application, write the new value — all inside a
transaction.

The database used read committed, the default.

Under normal use, it worked. When a customer triggered several simultaneous operations — which happened
in automated integrations — the balance ended up wrong.

Two transactions read 100, both subtracted 30, both wrote 70. Two operations consumed 60 and the
balance dropped 30.

Customers with heavy integrations accumulated undue balance for eighteen months. The total reached the
hundreds of thousands.

The defect did not show up in testing because it required real concurrency on the same record.

The fixes, in order of application:

**A relative operation.** `UPDATE balances SET balance = balance - ? WHERE id = ? AND balance >= ?`,
checking how many rows were affected. That eliminates the read-compute-write cycle and the anomaly
with it. One line.

**A check constraint** guaranteeing a non-negative balance — the safety net in the store, valid for
every writer.

**A movement log** instead of just the balance, allowing auditing and reconciliation. That is what made
it possible to quantify the past loss.

What the team learned: the code was inside a transaction, and everyone believed they were protected by
that. The word "transaction" was read as "mutual exclusion", and it is not.

## Related Concepts

- [Data Consistency](/07-data-architecture/data-consistency.md) — the topic at the storage level.
- [OLTP](/07-data-architecture/oltp.md) — where contention appears.
- [Distributed Transactions](/06-distributed-systems/distributed-transactions.md).
- [Relational Databases](/07-data-architecture/relational-databases.md).

## Practical Exercise

Find out your database's default isolation level. Then look through the code for snippets that read a
value, compute in the application and write the result.

Each one is a lost update case waiting for sufficient concurrency.

## Interview Questions

- What does read committed allow to happen?
- What is write skew and why does it fool you?
- Why does expressing the change as a relative operation eliminate the anomaly?

## Further Reading

- Berenson, Hal et al. *A Critique of ANSI SQL Isolation Levels*. SIGMOD, 1995.
- Kleppmann, Martin. *Designing Data-Intensive Applications*. O'Reilly, 2017 — chapter 7.
- Bailis, Peter et al. *Highly Available Transactions*. VLDB, 2014.

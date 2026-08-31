---
id: indexing
title: Indexing
sidebar_position: 15
description: The cheapest and most neglected architectural decision — and why an extra index also costs.
doc_type: concept
level: 5
difficulty: intermediate
status: complete
objective: >
  By the end, the reader reads an execution plan, chooses indexes by the query pattern
  and recognizes the write cost each one imposes.
prerequisites: [data-architecture]
related: [oltp, relational-databases, denormalization]
canonical_for: []
translated_from_version: 1
last_reviewed: 2026-08-31
---

# Indexing

## Overview

An index is an auxiliary structure that allows finding records without scanning the whole table.

It is the highest-return decision in this section: an adequate index turns seconds into milliseconds,
costs one line of command and does not change the model.

And it is the most neglected — most performance problems attributed to scale are, in fact, a missing
index or the wrong index.

## Problem

With no index, finding records requires reading all of them. That is fast at a thousand rows and
unviable at a hundred million.

The characteristic symptom: the system works well at the start and degrades progressively as the data
grows, with no code change at all.

The common reaction — a bigger machine — works for a while and does not solve it, because the cost
grows with the volume, not with the capacity.

## Core Concepts

### The order of columns in a composite index decides everything

The point with the greatest practical impact and the most misunderstood.

An index on `(customer, date)` serves queries that filter by customer, and queries that filter by
customer and date. It **does not serve** queries that filter only by date.

The phone book analogy: sorted by surname and then first name, it finds "Silva, João" quickly. Finding
every "João" requires reading everything.

The rule: the leftmost column has to be in the condition. Creating `(date, customer)` when the queries
filter by customer is creating an index that will not be used — and that keeps costing on writes.

### Selectivity determines the benefit

An index helps when it greatly reduces the set of candidates.

An index on a tax ID: each value identifies one row. Excellent.

An index on a boolean active-status field: if 95% of the records are active, the index points to
nearly everything, and the database will prefer to scan.

That explains indexes that exist and are never used — and the solution for the low-selectivity case is
usually a partial index, covering only the interesting minority.

### Every index is a write cost

Each insert, update and delete has to maintain every index on the table.

A table with ten indexes pays ten updates per write. Under a heavy transactional workload, that
becomes the bottleneck.

The practical consequence: unused indexes are pure loss. Modern databases report usage statistics —
and an audit of those statistics usually finds indexes created years earlier, for queries that no
longer exist.

### A covering index avoids the second read

If the index contains every column the query asks for, the database answers without touching the
table.

```sql
-- index on (customer, date, amount)
SELECT amount FROM orders WHERE customer = ? AND date > ?
```

Every column is in the index. The table is not read.

It is a powerful optimization for critical queries, and covering too many columns turns the index into
a copy of the table, with the corresponding write cost.

### Reading the execution plan is the central skill

Every relational database shows how it intends to execute a query. Learning to read that replaces
guessing with diagnosis.

What to look for:

```text
full scan                        the index was not used — either it does not exist, or it does not serve
index scan                       the index was used
estimate vs. actual              a large divergence indicates outdated statistics
sort on disk                     insufficient memory to sort
nested loop with many iterations a join with no index on the other side
```

The divergence between estimated and actual rows is the most useful diagnosis: the optimizer decides
from the estimates, and stale statistics produce bad plans even with correct indexes.

### A function on the column nullifies the index

```sql
WHERE UPPER(name) = 'MARIA'        -- does not use the index on name
WHERE year(date) = 2025            -- does not use the index on date
WHERE date BETWEEN ? AND ?         -- uses it
```

Applying a function to the indexed column prevents using the index. The solution is rewriting the
condition, or creating an index on the expression.

It is the cause of a large fraction of slow queries in systems that "have all the necessary indexes".

## Mental Model

**An index trades write cost and space for read speed.** It speeds up what matches its column order,
and nothing else.

## When to Use

- Columns used in filters with good selectivity.
- Foreign keys — joins need an index on both sides.
- Columns used for frequent sorting.
- Uniqueness constraints.
- Critical queries that would benefit from covering.

## When Not to Use

**On a low-selectivity column.** Consider a partial index.

**On a small table.** Scanning a thousand rows is faster than consulting an index.

**On a table with very heavy writes and rare reads.** An audit log, telemetry.

**One index per slow query, without evaluating the set.** Indexes overlap; frequently one composite
replaces three simple ones.

**Without checking usage afterwards.** An unused index only costs.

## Alternatives

- **Rewrite the query.** Removing a function from the indexed column solves it with no new object.
- **Update the statistics.** A bad plan with a correct index.
- **Materialized view** — for repeated aggregations.
- **[Partitioning](/07-data-architecture/data-partitioning.md)** — it discards whole partitions before
  any index.
- **Inverted index** — for full-text search with relevance.

## Trade-offs

| More indexes | Fewer |
|---|---|
| Fast reads | Scans |
| More expensive writes | Cheap |
| Additional space | Less |
| The optimizer has more options | More predictable plans |
| Maintenance and rebuilds | Fewer operations |

| Covering index | Simple |
|---|---|
| No table read | A second read |
| Larger and more expensive on writes | Smaller |
| Benefits specific queries | More general |

## Failure Modes

**Wrong column order.** The index exists and is not used.

**A function on the column.** It nullifies it silently.

**Outdated statistics.** A bad plan despite correct indexes.

**Too many indexes.** Writes degrade.

**An unused index.** Cost with no return.

**Creation blocking the table.** On a large table, creating an index without the concurrent option
causes unavailability.

**Fragmentation.** Heavily updated indexes degrade and need rebuilding.

## Common Mistakes

**Not looking at the execution plan.**

**Creating an index for every slow query.**

**Not indexing a foreign key.** Joins and integrity checks become slow.

**Ignoring the column order.**

**Not auditing unused indexes.**

**Creating an index in production without the concurrent option.**

## Real-World Example

A support system had its history screen taking 12 seconds. The team concluded it needed a new
architecture — a cache, a read replica, maybe an analytical store.

The investigation took two hours and found three problems.

**An index in the wrong order.** There was an index on `(status, customer_id)`. The query filtered by
`customer_id` and sorted by date. The index was useless for it. Replaced by `(customer_id, date
DESC)`, the query dropped to 200 ms.

**A function on the column.** Another query used `WHERE DATE(created_at) = ?`, nullifying the index on
`created_at`. Rewritten as a range, it dropped from 8 seconds to 40 ms.

**A foreign key with no index.** The join with the agents table did a full scan on every row. One
index solved it.

Result: the screen went from 12 seconds to 350 ms, with no architectural change.

The full audit afterwards found something else: **of the 47 indexes in the database, 19 had never been
used** since the last restart, six months earlier. Removing them reduced write time by 22%.

In retrospect: the original architectural proposal would have cost about three months and would have
worked — masking the real problem and keeping the write cost of the 19 useless indexes.

The question that was missing was the simplest one available: "what does the execution plan say?".

## Related Concepts

- [OLTP](/07-data-architecture/oltp.md) — where indexes are decisive.
- [Relational Databases](/07-data-architecture/relational-databases.md).
- [Denormalization](/07-data-architecture/denormalization.md) — check the index first.
- [Data Partitioning](/07-data-architecture/data-partitioning.md) — complementary.

## Practical Exercise

Take the slowest query in your system and read the execution plan. Look for a full scan and a
divergence between estimated and actual rows.

Then list the never-used indexes. Each one is charging on every write without giving anything back.

## Interview Questions

- Why does the column order in a composite index matter?
- What is selectivity and how does it affect the decision?
- Why does applying a function to the column nullify the index?

## Further Reading

- Winand, Markus. *SQL Performance Explained*, 2012.
- Winand, Markus. [Use The Index, Luke!](https://use-the-index-luke.com)
- Kleppmann, Martin. *Designing Data-Intensive Applications*. O'Reilly, 2017 — chapter 3.

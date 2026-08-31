---
id: interview-data-modeling
title: Data Modeling in the Interview
sidebar_position: 6
description: Start with the access patterns, not with the entities — that is what decides the storage.
doc_type: concept
level: 0
difficulty: intermediate
status: complete
objective: >
  By the end, the reader derives the model and the storage choice from the access patterns, and
  justifies each one with a requirement.
prerequisites: [interview-api-design]
related: [interview-api-design, high-level-architecture, interview-scaling]
canonical_for: []
translated_from_version: 1
last_reviewed: 2026-08-31
---

# Data Modeling in the Interview

## Overview

Modeling in an interview has an order that traditional training inverts:

```text
traditional   entities → relationships → normalization → queries
interview     access patterns → a model that serves them → storage
```

The second order is the correct one because what decides the storage is not the nature of the data
— it is **how it is read and written**. Two applications with the same entities and different
access patterns call for different storage.

And there is a practical consequence for the interview: starting with the accesses produces a
justification for every decision, and it is the justification that is being evaluated.

## Problem

The common pattern:

```text
candidate   "I'll have a users table, a posts table,
            a follows table, and a reactions table"
```

It is correct and conveys nothing. That model serves any social network, of a thousand or a billion
users, with any latency requirement. It was not derived — it was remembered.

The interviewer's next question exposes the problem: "how do you assemble the feed?". If the model
was not thought through from that query, the answer is a join over millions of rows, and the
conversation goes somewhere bad.

The opposite error is choosing the storage before knowing the accesses:

```text
"I'll use a NoSQL database because it needs to scale"
```

Scale how many reads, in what way, with which queries? Without answering that, the choice is
preference.

## Core Concepts

### Start by listing the queries

```text
"what are this system's reads?"

1. assemble a user's feed                very high volume
2. see someone's profile and posts       high
3. count a post's reactions              very high, approximate
4. list who someone follows              low
5. search by content                     medium
```

Each of those is a model requirement. Number 1 is the one that sizes the system, and it is the one
that should guide the decisions — the rest accommodate.

And the writes, with their volumes:

```text
create a post        6 thousand/s
follow someone       a few thousand/s
react                ~30 thousand/s
```

### Derive the model from the dominant query

```text
dominant query   "posts from the people I follow, ordered, paginated"

model A   query posts filtering by followed authors
          → join over a large volume; slow at scale
model B   materialized list per user, maintained on write
          → read by key; fast
```

The choice between A and B is not about elegance — it is about the read-to-write ratio, and about
the distribution of followers. See the
[social network case study](/21-case-studies/social-network.md).

Doing that derivation out loud is the content of the evaluation.

What is sought is not that the candidate chooses B — which is the known answer for large social
networks — but that they show the calculation that leads to B and say under what condition A would
be better. A candidate who proposes the materialized list because they read that this is how it is
done, and cannot say from what read/write ratio it pays off, is reciting.

### Keys before fields

In an interview, the fields matter little; the **access keys** matter a lot.

```text
posts        primary key: (author_id, created_at)  or  post_id?
             the choice depends on which query dominates
feed         key: user_id, with an ordered list
follows      two directions? (follower, followed) and (followed, follower)?
             depends on which questions are asked
```

The last line is a typical example: "who I follow" and "who follows me" are different queries, and
serving both with a single index is not possible. Recognizing that and proposing both indexes is a
point.

And there is a detail that goes further: the two queries have very different volume profiles. "Who
I follow" is read when assembling the feed and has low cardinality; "who follows me" is read when
distributing a post and can have millions of rows for a large account. Mentioning that asymmetry
connects the model to the scale problem, and it is the kind of observation that moves the
conversation to the next level.

### Choose the storage with a justification

```text
relational          unforeseen queries, transactions, integrity
key-value           access by a known key, minimal latency
document            an aggregate read whole, variable attributes
wide-column         massive writes, reads by key range
graph               multi-hop traversal
search              text and faceted navigation
time series         metrics per window, aggregation
```

And the sentence that demonstrates maturity:

```text
"I'll use a relational database for the core, because the volume
 fits and we'll need unforeseen queries. The materialized feed
 goes to key-value storage, because the access is always by
 user identifier and latency matters. And search goes to a
 dedicated index."
```

Three storage systems, each with a reason. See
[SQL vs. NoSQL](/20-trade-offs/sql-vs-nosql.md).

### Beware of gratuitous polyglot persistence

The opposite of the previous error: proposing five storage systems because each is "the right one
for the case". Each one costs operations, skills and consistency between them.

```text
"I could use a graph database for the social part, but the queries
 are a single hop — who I follow, who follows me. A relational
 database with two indexes solves it, and it's one less storage
 system to operate."
```

Justifying why **not** to adopt something is worth as much as justifying why to adopt it. See
[managed vs. self-hosted](/20-trade-offs/managed-vs-self-hosted.md) for the operational cost.

### Partitioning: only when the number calls for it

Proposing a partition key is expected when the volume justifies it, and is an error when it does
not.

```text
"6 billion posts, 4 TB — a relational database partitioned by
 period handles it. The partition key would be the creation date,
 because the queries are always recent."

"The materialized feed is partitioned by user_id, because
 the access is always by user and that distributes evenly."
```

Choosing the wrong key is worse than not partitioning: partitioning posts by `author_id` when the
query is by date produces a scan of every partition.

The rule of thumb is that the partition key must appear in the filter clause of the dominant query.
If the query that dominates the volume does not filter by the chosen key, partitioning turns a
query that touched one index into one that touches every partition — making worse exactly what it
was supposed to improve.

### Distribution of hot data

A point that differentiates: mentioning that the access distribution is uneven and that this
creates hotspots.

```text
"accounts with millions of followers concentrate reads. If I
 partition by author, those partitions get hot. One way out
 is to treat large accounts differently."
```

See [hotspots](/11-scalability/hotspots.md).

## Mental Model

**List the queries first.** The model is derived from the dominant query, and the storage is derived
from the model — each one with a justification out loud.

## When to Use

- After the API, before or alongside the high-level design.
- Starting with the queries, not with the entities.
- With one justification per storage choice.

## When Not to Use

**Listing entities with no queries.**

**Choosing storage before the access patterns.**

**Detailing every field** — keys and relationships are enough.

**Proposing polyglot persistence** without justifying each storage system.

**Partitioning** volumes that do not call for it.

## Alternatives

- **Model only the dominant query** — when time is tight, it is the one that matters.
- **Describe the model in text** instead of drawing tables.
- **Leave it until after the design** — modeling when the bottleneck appears is legitimate and keeps
  the pace.

## Trade-offs

| Model early | Model on demand |
|---|---|
| Basis for the design | Every decision has context |
| May anticipate too much | Interrupts the flow |

| One storage system | Polyglot |
|---|---|
| Simple operations | The right tool per case |
| Compromise in some cases | Cost and consistency |

## Failure Modes

**Entities with no queries.** Generic model.

**Storage chosen by preference.**

**Wrong partition key.** A scan of every partition.

**Polyglot with no justification.**

**Ignoring hotspots** in an uneven distribution.

## Common Mistakes

**Starting with an entity diagram.**

**Not considering both directions** of a relationship.

**Proposing NoSQL for "scale"** with no number.

**Detailing column types.**

**Not mentioning indexes** where they decide the query's viability.

## Interview Example

**Problem.** "Design a seat reservation system for events."

**Queries, listed first:**

```text
reads
  map of available seats for a session      very high, at the on-sale
  detail of an event                        high
  my reservations                           low

writes
  reserve seats                             extreme peak at the on-sale
  confirm payment                           likewise
  release expired reservations              continuous
```

**The query that sizes the system:** the seat map at the start of the sale. A popular event has tens
of thousands of people querying the same map simultaneously.

**The write that sizes it:** reservation of the same seat by several people at the same time. It is
a contention problem, not a volume one.

**Derived model:**

```text
event      (id, name, date, venue)
session    (id, event_id, datetime)
seat       (id, session_id, section, row, number, price)
booking    (id, session_id, seat_id, user_id, state,
            expires_at, created_at)
           uniqueness constraint on (session_id, seat_id)
           for active bookings
```

**The justification, out loud:**

```text
"The uniqueness constraint in the database is the central
 decision. Reserving a seat is an operation that cannot be
 approximated: two seats sold for the same chair is an incident
 with people at the theater door.

 That rules out eventual consistency in that operation and calls
 for storage with transactions — I'll use relational.

 The seat map, which is the heavy read, does not need to be
 exact: a seat shown as available and already reserved
 produces an attempt that fails, which is acceptable. So it
 goes to a cache, with invalidation per event and a window of seconds."
```

**Partitioning:**

```text
"The contention is per session, not global. Partitioning by session_id
 distributes naturally: two different events do not compete.

 Within a popular session, the contention remains — and it is
 inherent to the problem. What you can do is reduce the transaction's
 duration and use reservations with a short expiry, so that
 seats do not stay locked."
```

**Likely follow-up question:** "and what if an event has 100 thousand seats and 2 million people in
the queue?"

The correct answer recognizes that the problem stops being a database one and becomes a **waiting
room** one: admitting users into the reservation system at a controlled rate, which turns an
impossible peak into a manageable load. Recognizing that the solution is outside the data model is
the point.

## Related Concepts

- [API Design](/22-system-design-interviews/interview-api-design.md).
- [SQL vs. NoSQL](/20-trade-offs/sql-vs-nosql.md).
- [Data Modeling](/07-data-architecture/data-modeling.md).
- [Hotspots](/11-scalability/hotspots.md).

## Practical Exercise

List the queries of a nested comments system and derive the model from them.

Then answer: which query would you serve badly with a normalized relational model, and what would
you change? The answer shows why the "queries first" order matters.

## Interview Questions

- Why list queries before entities?
- Why is the wrong partition key worse than not partitioning?
- When is proposing more than one type of storage justified?

## Further Reading

- Kleppmann, Martin. *Designing Data-Intensive Applications*. O'Reilly, 2017.
- Sadalage, Pramod; Fowler, Martin. *NoSQL Distilled*. Addison-Wesley, 2012.
- Xu, Alex. *System Design Interview*. Byte Code, 2020.

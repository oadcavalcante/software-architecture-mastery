---
id: graph-databases
title: Graph Databases
sidebar_position: 6
description: Relationships as first-class citizens — and why the use case is narrower than it seems.
doc_type: concept
level: 5
difficulty: intermediate
status: complete
objective: >
  By the end, the reader identifies whether the problem is deep traversal or merely
  related data, which are different things.
prerequisites: [nosql]
related: [relational-databases, data-modeling, nosql]
canonical_for: []
translated_from_version: 1
last_reviewed: 2026-08-31
---

# Graph Databases

## Overview

A graph database treats **connections** as a first-class structure: nodes, typed edges with properties,
and traversal as a primitive operation.

The gain appears in a specific situation: queries that traverse many levels of relationship, whose depth
is not known in advance.

Outside that — and "outside that" covers most systems that have related data — a relational database
solves it better.

## Problem

In a relational model, each level of relationship is a join. Two joins are trivial. Five start to hurt.
Variable depth — "everyone connected to this one, directly or indirectly" — is hard to express and
expensive to execute.

The cost grows multiplicatively with depth, because each join processes the previous one's result.

Graph databases solve that by storing the connections as pointers: walking from a node to its neighbors
is following references, with a cost proportional to the number of neighbors, not to the table's size.

## Core Concepts

### The advantage is about depth, not about relationships

This is the distinction that decides the choice, and the one most often confused.

**Having related data** — an order belongs to a customer, a product belongs to a category — is the normal
case and relational was made for it.

**Needing to traverse variable depth** — a referral chain, corporate ownership through layers, the path
between two people — is the graph case.

If all your queries have a known and small depth, you have related data, not a graph problem.

### The cost does not depend on the total size

In a relational join, the optimizer works over whole tables. In a graph, the traversal starts from one
node and visits only the reachable ones.

A three-level search from one person visits tens or hundreds of nodes, regardless of whether the graph
has a thousand or a hundred million.

It is the property that justifies the model when it is justified.

### The explosion still exists

The cost does not disappear — it changes shape. A traversal with no depth limit in a dense graph can
visit nearly everything.

Social networks are the example: four levels from one person reach a good part of the network. A depth
and result limit is not an optimization, it is a requirement.

### Modeling what is a node and what is an edge

The initial decision: is the relationship a simple edge, or is it an entity with properties?

A transaction between accounts can be an edge with an amount and a date, or it can be a node connected to
both accounts. The second form allows the transaction to have its own relationships.

Getting that wrong limits the possible questions, and redoing it requires remodeling the graph.

### Writing and scaling are the weak point

Graphs do not partition well. Cutting a graph into parts while minimizing the edges that cross the
boundary is a hard problem, and every traversal that crosses the boundary pays the network.

In practice, most graph databases scale vertically. That limits the size and is acceptable, because
genuinely large graphs are rare outside a few industries.

### A specialized graph alongside the main store

The most common design among successful implementations: keeping the system in the store appropriate to
the operation, and projecting only the relevant subgraph into a graph database.

It is not necessary — nor desirable — to move the whole system into a graph because one query needs
traversal.

## Mental Model

**A graph is for variable depth.** If your queries' depth is known and small, relational is better at
everything else.

## When to Use

- Traversal of variable or unknown depth.
- Finding a path between entities.
- Cycle or community detection.
- Recommendations based on connections.
- Analysis of corporate ownership, fraud, dependencies.
- The questions are about the structure of the connections, not about the nodes' data.

## When Not to Use

**When the queries have a fixed and small depth.** Joins solve it.

**For a general transactional workload.**

**For aggregation over large volumes.** See [columnar](/07-data-architecture/column-stores.md).

**When the write volume is high.**

**As the system's only store.** Project the relevant subgraph.

**When "we have many relationships" is the only justification.** Every system does.

## Alternatives

- **[Relational](/07-data-architecture/relational-databases.md) with a recursive query** — relational
  databases express recursive traversal; for moderate depth, it works well and avoids a technology.
- **A transitive closure table** — pre-computing the paths when the structure changes little.
- **Batch graph processing** — when the analysis is periodic, not interactive.
- **An adjacency column** — storing the neighbor list alongside the record.

The first deserves serious consideration before adopting a new technology: the recursive query covers a
good part of the moderate-depth cases.

## Trade-offs

| Graph | Relational |
|---|---|
| Variable-depth traversal | Fixed-depth joins |
| Cost independent of the total size | Depends on it |
| Horizontal scaling difficult | More options |
| Weak aggregation | Strong |
| Less mature tooling | Very mature |
| Modeling by connection | By entity |

## Failure Modes

**Traversal with no limit.** It visits half the graph and does not finish.

**A supernode.** A node with millions of edges — a popular category, a country — destroys the performance
of any traversal that passes through it.

**Wrong edge modeling.** It turns out the relationship needed its own properties.

**Write scale.** High ingestion degrades.

**A naively written query.** The language hides the cost, and an innocent query can be exponential.

The supernode is the most characteristic failure mode, and the most surprising: the graph works well
until a traversal touches a heavily connected node.

## Common Mistakes

**Adopting it because "the data is connected".**

**Not limiting depth and results.**

**Not handling supernodes** — which require specific modeling, like splitting the category into
subcategories.

**Migrating the whole system** instead of projecting the subgraph.

**Not testing with realistic volume and density.** A small graph hides every problem.

## Real-World Example

An insurer needed to detect organized fraud: groups of people connected by address, phone, bank account
or vehicle, filing related claims.

In the relational model, the query was of variable depth — "find everyone connected to this person by any
path of up to five steps". The existing implementation ran as a nightly batch and took 6 hours.

A graph database with the projected data — people, contacts, accounts, vehicles, claims — answered the
same question in 200 milliseconds, allowing a check at the moment the claim was filed.

The gain was real and brought two problems.

**Supernodes.** Certain phone numbers appeared in thousands of records — call centers, company numbers. A
traversal touching one of them connected half the database. The fix was flagging those nodes and
excluding them from traversal, with an explicit rule: contacts with more than 50 links are not evidence
of a connection.

**Exponential queries.** An analyst wrote a query with no depth limit that took down the server. A
mandatory limit and an execution deadline came into existence.

And a decision the team considers the most important: the graph **did not** become the source of truth.
The data stays in the transactional system, and the graph is rebuilt daily with the relevant subset.

That made it possible to change the graph's model three times in the first year, as the analysts
discovered which connections mattered — something impossible if it were the source of truth.

## Related Concepts

- [Relational Databases](/07-data-architecture/relational-databases.md) — the main comparison.
- [NoSQL](/07-data-architecture/nosql.md) — the category.
- [Data Modeling](/07-data-architecture/data-modeling.md).

## Practical Exercise

Take the query in your system with the most joins. Count the levels and ask: is the depth fixed?

If it is fixed, a graph will not help. If it varies with the data, you have a candidate — and the next
step is testing your current database's recursive query before adopting a new technology.

## Interview Questions

- What is the difference between having related data and having a graph problem?
- What is a supernode and why does it break performance?
- Why do graphs partition badly?

## Further Reading

- Robinson, Ian; Webber, Jim; Eifrem, Emil. *Graph Databases*. 2nd ed. O'Reilly, 2015.
- Sadalage, Pramod; Fowler, Martin. *NoSQL Distilled*. Addison-Wesley, 2012.
- Kleppmann, Martin. *Designing Data-Intensive Applications*. O'Reilly, 2017 — chapter 2.

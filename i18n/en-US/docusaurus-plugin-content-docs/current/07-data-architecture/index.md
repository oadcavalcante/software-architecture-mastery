---
id: data-architecture
title: Data Architecture
sidebar_position: 0
description: Where the data lives, who owns it and why that is the hardest decision to reverse.
doc_type: index
level: 5
difficulty: advanced
status: complete
objective: >
  By the end, the reader chooses a model and a store from the access pattern, and
  recognizes data ownership as an organizational decision.
prerequisites: [distributed-systems]
related: [integration-architecture, scalability, system-design]
canonical_for: []
translated_from_version: 1
last_reviewed: 2026-08-31
---

# Level 05 — Data Architecture

This section deals with the most expensive decision to reverse in any system.

## The problem this section addresses

Code gets rewritten. A badly designed service can be replaced in a few weeks, and the rest of the
system does not even notice if the contract was preserved.

Data does not. A badly modeled schema carries years of records that have to remain readable. A wrong
storage choice requires a migration with the system live. And the decision about **who owns which
data** determines, in practice, which teams can work in parallel and which spend their time blocking
each other.

That is why data architecture appears at this level and not earlier. It requires you to already
understand [partial failure](/06-distributed-systems/partial-failure.md) and
[consistency](/06-distributed-systems/consistency.md) — because nearly every decision here is a
choice about where to pay those costs.

## What you will find here

**The storage models.** Relational, document, key-value, columnar and graph. Presented by the access
pattern each one serves well, not by marketing category. The term "NoSQL" gets its own document
precisely so it can be taken apart: it groups technologies with nothing in common beyond not being
relational.

**Workloads.** OLTP and OLAP, and why confusing them is the origin of a good part of the performance
problems people try to solve with hardware.

**Analytical platforms.** Data warehouse, data lake and lakehouse — what each one solves, and what
happens when a lake becomes a dump with no catalog.

**Modeling.** Normalization and denormalization as a conscious and reversible decision, with the
criterion for when each one pays off. Indexing treated as an architectural decision, because the
wrong index is the most common cause of a slow query — and the one most frequently confused with a
need to scale.

**Data distribution.** Replication and partitioning seen from the storage angle, complementing the
treatment in [distributed systems](/06-distributed-systems/index.md). Transactions and consistency at
the database level: isolation levels and what each one allows to happen.

**Governance.** Data ownership and lifecycle — retention, archiving and erasure. The two least
technical topics in the section and the ones that most determine whether the system remains
sustainable in five years.

## Reading order

Start with **OLTP and OLAP**. The distinction organizes everything that follows, and choosing storage
without it is choosing in the dark.

Then **modeling**, **normalization** and **denormalization** — in that order, because denormalizing
without understanding what you are undoing produces a schema nobody can evolve.

**Indexing** can be read at any point and has the most immediate return for anyone with a system in
production right now.

Leave **data ownership** for last, and read it with your team's org chart in mind. It is the topic
where the right answer depends most on context and least on technology.

## By the end

You choose storage from the access pattern — how the data is written, how it is read, at what
frequency and in what volume — instead of by familiarity or reputation.

You can look at a slow query and distinguish an index problem from a model problem, a volume problem
and a concurrent load problem, which require different answers.

And you recognize when the problem is not technical: when two teams fight over the same data because
nobody decided whose it is.

## Continues in

[Integration Architecture](/08-integration-architecture/index.md), where the question becomes how that
data crosses system boundaries.

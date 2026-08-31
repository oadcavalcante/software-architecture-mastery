---
id: scalability
title: Scalability
sidebar_position: 0
description: Growing without the cost per unit growing with it — and why most problems attributed to scale are not scale problems.
doc_type: index
level: 5
difficulty: advanced
status: complete
objective: >
  By the end, the reader distinguishes a performance problem from a scale problem,
  and attacks the real bottleneck instead of adding capacity.
prerequisites: [system-design]
related: [distributed-systems, data-architecture, reliability]
canonical_for: []
translated_from_version: 1
last_reviewed: 2026-08-31
---

# Level 05 — Scalability

This section deals with growing without the cost growing in the same proportion.

## This section's problem

Scalability is the property of supporting more load **by adding resources**, with the cost per unit of work
staying stable or falling.

That is different from performance, and the confusion between the two is the origin of most misdirected
scale projects. A system can be fast and not scale; a slow system can scale perfectly.

The second problem is diagnosis. A large fraction of problems attributed to scale are not scale problems —
they are a [missing index](/07-data-architecture/indexing.md), a badly written query, mixed workloads, or
contention over a single resource.

Adding capacity to one of those spends money and does not solve it, because the bottleneck is not capacity.
And, worse, it usually hides the problem for a few months.

The third is that **scale has a structural limit**. A 5% serial fraction in the processing limits the gain
to 20 times, regardless of how many machines you add. Recognizing that changes the target: instead of
adding resources, removing the part that does not parallelize.

## What you will find here

**The two directions.** Vertical and horizontal scaling — with an explicit defense of the vertical one,
which is underestimated and solves more cases than the literature suggests.

**The prerequisite.** Statelessness, without which scaling horizontally does not work.

**The mechanisms.** Caching, partitioning, replication and balancing seen from the scale angle —
complementing the treatment in [system design](/05-system-design/index.md) and in
[distributed systems](/06-distributed-systems/index.md).

**Asynchronous processing and queues.** The two techniques that solve peaks without adding proportional
capacity. Frequently the right answer when intuition asks for more machines.

**Databases.** Most systems' real bottleneck, and the hardest thing to scale.

**Hotspots.** The failure mode that survives any amount of capacity — and that explains why "we have ten
replicas and it still went down".

**Capacity planning.** How to know when to scale, before the incident.

**Performance versus scalability.** The document that organizes the whole section, and that should be the
first for whoever has little time.

## Reading order

Start with **performance versus scalability**. Without that distinction, the rest becomes a catalog of
techniques with no criterion.

Then **hotspots**, which explains why additional capacity sometimes makes no difference at all.

**Vertical scaling** before **horizontal** — the order is deliberate, because the vertical one is the right
answer more often than imagined, and the horizontal one charges permanent complexity.

**Database scaling** can be read at any point and is the one with the most immediate return for whoever has
a system in production now.

## By the end

You distinguish a performance problem from a scale problem, and know which measurement answers that
question.

You can identify where the bottleneck is before deciding what to do, instead of adding capacity and
watching.

You recognize that asynchronous processing and queues solve peaks that capacity does not, and that a
hotspot is immune to any amount of machines.

And you can defend the decision **not** to scale horizontally when a bigger machine solves it — which
remains the right answer for most systems.

## Continues in

[Reliability](/12-reliability/index.md), where the question becomes what happens when the parts you
multiplied start to fail.

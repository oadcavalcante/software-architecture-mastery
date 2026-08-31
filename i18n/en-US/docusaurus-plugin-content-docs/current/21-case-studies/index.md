---
id: case-studies
title: Case Studies
sidebar_position: 0
description: Complete architectures, with the reasoning that leads to them and the options discarded.
doc_type: index
level: 0
difficulty: advanced
status: complete
objective: >
  By the end, the reader conducts a complete architectural analysis, from business context
  to evolution strategy, defending the options discarded.
prerequisites: [system-design, distributed-systems]
related: [trade-offs, system-design-interviews]
canonical_for: []
translated_from_version: 1
last_reviewed: 2026-08-31
---

# Case Studies

Fourteen complete architectures, each traced from business context through to evolution
strategy.

## The problem in this section

Concepts learned in isolation don't combine on their own. Someone can understand eventual
consistency, partitioning, idempotency and circuit breaking as topics, and still be unable to
design a system in which all four have to coexist under cost and schedule constraints.

A case study is where the combination happens — and where the conflicts appear. The decision
that improves availability worsens consistency. The one that reduces latency raises the cost.
The one that simplifies operations couples two domains that should evolve separately.

No isolated topic teaches you to resolve that, because in isolation those conflicts don't
exist.

## What you will find here

Fourteen domains with deliberately different constraint profiles:

**Transactional and high-consistency.** Banking system · payments platform.

**High volume and low latency.** Social network · video streaming · messaging ·
high-volume event processing.

**Real-time coordination.** Ride-sharing · food delivery · logistics.

**Complex domain and regulation.** Healthcare · multi-tenant enterprise system.

**Evolution.** E-commerce · SaaS · legacy modernization.

The diversity is deliberate: the same concept appears with different weight in each profile,
and it is by comparing them that you learn to read constraints.

## The structure of each case

```text
Business Context → Functional Requirements → Non-Functional Requirements
→ Constraints → Capacity Estimates → Architecture Options
→ Trade-off Analysis → Decision → Components → Data → Integration
→ Security → Scalability → Reliability → Observability
→ Deployment → Evolution Strategy
```

## The rule in this section

**No case presents an architecture as the answer.**

Each one lays out at least three genuinely viable options, with a weighted-criteria decision
matrix. And every discarded option declares **under what change of constraint it would start
winning** — if there is no such condition, it wasn't a real option, it was a straw man.

That requirement is what keeps the case from becoming retroactive justification of a choice
already made.

## Reading order

Start with **e-commerce**. It is the most familiar domain and the one requiring the least
business context, which leaves your attention free for the method.

Then choose by interest or by proximity to what you build. There is no mandatory progression
between them.

Read **payments platform** and **high-volume event processing** at some point, even outside
your domain: they are the ones that most exercise
[Level 04](/06-distributed-systems/index.md).

## How to use them

Read the context, requirements and constraints. **Stop before the options.** Sketch your
architecture in twenty minutes. Only then continue.

The value is not in agreeing with the text's decision — it is in discovering which constraint
you hadn't considered.

## By the end

You conduct a complete analysis on a new domain, and defend the options you discarded as well
as the one you chose.

## Related

[System Design Interviews](/22-system-design-interviews/index.md), which is the same
reasoning under time pressure.

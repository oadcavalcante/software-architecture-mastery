---
id: architecture-decisions
title: Architecture Decisions
sidebar_position: 0
description: Recording the why behind a decision, including the discarded alternatives and under what condition they would come back.
doc_type: index
level: 5
difficulty: intermediate
status: complete
objective: >
  By the end, the reader writes ADRs that preserve the context and let a decision be
  reassessed with information, rather than remade from scratch.
prerequisites: [architecture-documentation]
related: [trade-offs, architecture-governance, legacy-modernization]
canonical_for: []
translated_from_version: 1
last_reviewed: 2026-08-31
---

# Architecture Decisions

Diagrams record what the system is. ADRs record why it is that way — and that is the
information that is lost first.

## The problem in this section

Every codebase has decisions whose reason nobody remembers. Why is this service separate?
Why is this field denormalized? Why don't we use the obvious library?

Without the answer, two bad options remain. Keep the decision out of fear, without knowing
whether the reason still holds. Or reverse it unknowingly, and rediscover the original
reason by way of an incident.

The real cost is not the forgetting itself — it is that the decision stops being
reassessable. A decision whose context was recorded can be revisited when the context
changes. A decision with no context can only be obeyed or broken.

## What you will find here

**The format.** What an ADR is, why ADRs matter and the standard structure: context,
decision, alternatives, consequences and status.

**The parts that matter.** Context and alternatives are the two sections that carry almost
all the value, and the two that are usually written badly. Context has to include the
constraints in force at the time; alternatives have to include under what condition each
discarded option would win again.

**Lifecycle.** Status and superseding. An ADR is not deleted or edited when you change
your mind — it is superseded by another, preserving the history of the reasoning.

**Realistic examples.** Five complete ADRs from a fictional system, written to demonstrate
reasoning:

```text
ADR-001  Choose a Modular Monolith over Microservices
ADR-002  Introduce Asynchronous Processing
ADR-003  Choose PostgreSQL as the Primary Database
ADR-004  Introduce Kafka
ADR-005  Adopt Hexagonal Architecture
```

At least one of them appears with status `superseded`, to show the mechanics of
superseding — which is what most ADR examples omit.

**This repository's ADRs.** The project's own structural decisions, recorded in the same
format. The repository practices what it teaches.

## Reading order

Read the **structure** and then go straight to the examples. An ADR is a simple format;
what you learn is the pattern of reasoning, and that is learned by example.

Pay specific attention to each example's alternatives section. That is where the
architectural reasoning becomes visible.

## By the end

You write an ADR that someone can read in two years and understand not only what was
decided, but whether the reason still holds. You recognize when a decision deserves an ADR
— not every one does.

And you can supersede a decision of your own without erasing the record of having made it.

## Related

[Trade-offs](/20-trade-offs/index.md), which is the material the alternatives section is
made of.

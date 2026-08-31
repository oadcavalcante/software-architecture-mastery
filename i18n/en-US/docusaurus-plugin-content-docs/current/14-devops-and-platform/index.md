---
id: devops-and-platform
title: DevOps and Platform
sidebar_position: 0
description: Reducing the time between deciding and delivering, without trading speed for stability.
doc_type: index
level: 5
difficulty: advanced
status: complete
objective: >
  By the end, the reader designs the path from change to production with
  reversibility and with no organizational bottlenecks.
prerequisites: [observability]
related: [reliability, cloud-architecture, security]
canonical_for: []
translated_from_version: 1
last_reviewed: 2026-08-31
---

# Level 05 — DevOps and Platform

This section deals with the path between deciding on a change and it being in production.

## This section's problem

Architecture is usually discussed as the system's structure. But the **path of the change** — how long it
takes, how many people approve it, what can be reverted — is an architectural property like any other, and
frequently the one that limits the most.

A well-structured system with a deployment that takes three weeks delivers less than a mediocre system with
a fifteen-minute deployment.

And there is a belief the data contradicts: that speed and stability are opposed. The organizations that
deliver more frequently also fail less and recover faster — because the same practices produce both
results. Small batches are easier to test, to revert and to diagnose.

The second problem is organizational. A good part of the friction is not technical: it is approvals,
queues, dependencies between teams, a contended environment. Automating without addressing that moves the
bottleneck without removing it.

## What you will find here

**Continuous integration and delivery.** What each term actually means, and why most teams that say they
practice continuous integration do not.

**Infrastructure as code.** What changes when the environment is declared, and the drift that appears when
it is not.

**Containers in delivery.** The immutable artifact promoted between environments.

**Deployment strategies.** Blue-green, canary and rolling deployment — each with what it costs and what it
protects.

**Feature flags.** The separation between deploying and releasing, and the debt they accumulate.

**Environment management.** Parity, ephemeral environments and what their absence produces.

**Platform engineering.** The discipline that treats internal infrastructure as a product, and the internal
platforms nobody uses.

**Pipeline security.** The pipeline is a production environment, and it is treated as though it were not.

**Release management.** What remains of coordination when delivery is continuous.

## Reading order

Start with **continuous integration and delivery** — it defines the vocabulary the rest uses, and it undoes
the area's most common confusion.

Then **deployment strategies**, which organizes blue-green, canary and rolling as choices with criteria,
not as matters of taste.

**Feature flags** deserves special attention: it is the highest-impact technique and the one that
accumulates the most silent debt.

Leave **platform engineering** for the end. It reorganizes everything that came before into an
organizational decision.

## By the end

You treat the time between deciding and delivering as an architectural property, and you know where it is
being spent.

You can choose the deployment strategy from the change's risk, and not out of habit.

You recognize that reverting fast is worth more than getting it right on the first attempt, and you design
for that.

And you understand that an internal platform nobody wants to use is not a platform — it is one more
obstacle with good intentions.

## Continues in

[Architecture Documentation](/17-architecture-documentation/index.md), where the question becomes how the
knowledge about the system survives the people.

---
id: cloud-architecture
title: Cloud Architecture
sidebar_position: 0
description: Designing on infrastructure you rent — where cost becomes an architectural decision and failure becomes routine.
doc_type: index
level: 5
difficulty: advanced
status: complete
objective: >
  By the end, the reader designs for the guarantees the provider actually offers,
  and treats cost and dependency as explicit architectural decisions.
prerequisites: [distributed-systems]
related: [integration-architecture, scalability, reliability]
canonical_for: []
translated_from_version: 1
last_reviewed: 2026-08-31
---

# Level 05 — Cloud Architecture

This section deals with what changes when the infrastructure is rented and programmable.

## This section's problem

Cloud is frequently taught as a service catalog: this product does this, that one does that. That is vendor
training, not architecture.

What actually changes, from the point of view of whoever designs, is three things.

**Failure stops being the exception.** A machine can disappear at any moment, by the provider's decision.
That is not a risk to mitigate — it is the operating model, and the system needs to be designed for it. See
[partial failure](/06-distributed-systems/partial-failure.md).

**Cost becomes an architectural decision.** On your own infrastructure, the machine has already been
bought and the design choice does not change next month's bill. In the cloud, each call, each gigabyte
transferred and each second of execution appear on the invoice. A bad architectural decision has a monthly
and measurable price.

**The dependency is real and needs to be chosen.** Every managed service you adopt is work you will not do
and freedom you will not have. Pretending that trade does not exist — on either side — is what produces
both the suffering of reinventing what already exists and that of not being able to leave.

## What you will find here

**The service models.** IaaS, PaaS and SaaS by what each one transfers in responsibility, not by the
acronym. Managed services treated as the central decision they are.

**Packaging and orchestration.** Containers and Kubernetes — the latter with the question that precedes
adoption: what concrete problem does it solve that you have today?

**Serverless.** What it delivers, and the four costs the initial presentation omits.

**Geography.** Regions, availability zones and multi-region. The distinction between the first two is the
basis of almost every availability decision, and it is routinely confused.

**The building blocks.** Cloud networking, identity, storage and compute — each one by what changes
relative to the local equivalent.

**The decisions nobody makes until they hurt.** Cost architecture, disaster recovery and vendor lock-in.
They are the three documents that most change what you do on Monday.

**Cloud native.** The term, what it usefully designates, and what it became.

## Reading order

Start with **regions and availability zones**. Without that distinction, no availability decision makes
sense.

Then **managed services**, which is the section's central economic and architectural decision.

**Cost architecture** can be read at any point and is the one with the most immediate return for whoever
has a system in production now.

Leave **multi-region** and **disaster recovery** for the end, and read them together — they answer the same
question at very different prices.

## By the end

You design assuming any component can vanish, because in the cloud it can.

You can estimate the cost of an architectural decision before implementing it, and recognize when the
design is expensive for a structural reason — cross-zone transfer, excessive calls, data sitting with no
policy.

And you can discuss vendor lock-in without the two extremes: neither adopting everything without thinking,
nor abstracting everything for a portability that will never be used.

## Continues in

[Security Architecture](/10-security/index.md), where the boundaries the cloud made programmable need to be
defended.

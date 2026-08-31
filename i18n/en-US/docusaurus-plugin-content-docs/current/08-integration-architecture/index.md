---
id: integration-architecture
title: Integration Architecture
sidebar_position: 0
description: How systems talk across boundaries — and why the contract matters more than the protocol.
doc_type: index
level: 5
difficulty: advanced
status: complete
objective: >
  By the end, the reader chooses an integration style by the coupling they accept,
  and treats the contract and its evolution as the central problem.
prerequisites: [distributed-systems]
related: [data-architecture, cloud-architecture, system-design]
canonical_for: []
translated_from_version: 1
last_reviewed: 2026-08-31
---

# Level 05 — Integration Architecture

This section deals with what happens at the boundaries between systems.

## The problem this section addresses

The discussion about integration almost always starts wrong: "REST or gRPC?", "synchronous or
asynchronous?". Those are questions about the mechanism, and the mechanism is the easy part.

The hard problem is the **contract**: what one side promises the other, who can change what, and what
happens when someone changes it. An integration dies from a broken contract, not from a protocol choice.

The second hard problem is **coupling**. Every integration couples — the question is coupling in what. In
availability? In data format? In domain model? In deployment cadence?

Choosing the integration style is choosing which coupling you accept. That is the decision, and it comes
before the technology.

## What you will find here

**The synchronous styles.** REST, GraphQL and gRPC, compared by what each one assumes about the
consumer. GraphQL gets specific attention on what it transfers in cost from the client to the server —
which is the part omitted from the usual comparison.

**The asynchronous styles.** Integration through messaging and through events, resting on
[distributed systems](/06-distributed-systems/index.md). Webhooks treated as what they are: an
asynchronous integration in which the other side is a server you do not control.

**The styles nobody presents at conferences.** Batch and file integration — which move, today, more
corporate data than everything else combined, and which remain the right answer for a large class of
problems.

**The edge infrastructure.** API gateways and service meshes, with the question that precedes both: what
concrete problem does this solve that is not already solved?

**The classic patterns.** Enterprise Integration Patterns — the vocabulary that describes what routers,
translators and aggregators do, and that remains valid regardless of the fashionable technology.

**The section's core.** Integration contracts, schema evolution and the anti-corruption layer. If you
read only three documents from here, let it be those.

## Reading order

Start with **integration contracts**. It organizes everything else, and without it the protocol
documents become feature comparisons.

Then **schema evolution**, which is where real integrations break.

The styles can be read in any order, as needed. If you are deciding right now, read the pair you are
considering and go straight to the trade-offs.

Leave **service mesh** for last, and read it skeptically — it is this section's technology with the
largest distance between adoption and necessity.

## By the end

You stop choosing an integration by protocol and start choosing by coupling: what each side has to know
about the other, and what happens when one changes.

You can design a contract that allows evolving without coordinating deployments, and you recognize when
an integration is coupling domain models — the most expensive coupling and the least visible.

And you can defend batch integration when it is the right answer, which is more often than the
literature suggests.

## Continues in

[Cloud Architecture](/09-cloud-architecture/index.md), where those decisions start interacting with what
the platform offers and charges.

---
id: observability
title: Observability
sidebar_position: 0
description: Being able to answer questions you did not anticipate — the difference between monitoring and observability.
doc_type: index
level: 5
difficulty: advanced
status: complete
objective: >
  By the end, the reader instruments systems to answer new questions, not only to
  display known metrics.
prerequisites: [distributed-systems]
related: [reliability, scalability, devops-and-platform]
canonical_for: []
translated_from_version: 1
last_reviewed: 2026-08-31
---

# Level 05 — Observability

This section deals with knowing what is happening inside the system.

## This section's problem

Monitoring answers questions you anticipated: is the CPU high? Did the error rate rise? Is the disk full?

Observability is the ability to answer questions you did **not** anticipate: why did those 200 specific
requests, from customers on a specific plan, get slow at 2 p.m. yesterday?

The distinction is not semantic. It decides whether, during an incident, you can investigate — or only
confirm that something is wrong.

And it matters because the incidents that cause damage are precisely the unanticipated ones. See
[resilience](/12-reliability/resilience.md). If every scenario had been anticipated, it would have been
handled by a mechanism.

The second problem is economic. Telemetry costs — collection, transport, storage, querying — and the cost
grows faster than the system. Much of what is collected is never queried, and naive reduction removes
exactly what is missed in an investigation.

## What you will find here

**The three signals.** Logs, metrics and traces — what each one answers well, what it answers badly, and
why all three are necessary.

**Distributed tracing.** How to follow a request through dozens of services, with context propagation and
sampling.

**Correlation identifiers.** The section's cheapest technique and the prerequisite for almost everything.

**Telemetry.** Instrumentation, collection and the cost — treated as an architectural decision, because it
is.

**Alerting.** What deserves to wake somebody up, and why most existing alerts do not.

**Dashboards.** What they are for, and why the dashboard that serves an investigation is different from the
one that serves tracking.

**Golden signals.** The four measures that cover most problems.

**SRE concepts.** The vocabulary and practices that organize operations at scale.

**Debuggability.** The property you design into the system, not into the tool.

## Reading order

Start with **correlation identifiers**. Without them, the other signals do not connect, and investigation
in a distributed system becomes unviable.

Then **golden signals**, which give a concrete starting point for instrumenting.

**Logs**, **metrics** and **traces** form a block. Read all three before deciding where to invest.

**Alerting** deserves special attention if your team is on call — it is the document that most reduces
operational suffering.

Leave **debuggability** for the end. It reorganizes everything that came before into a design property.

## By the end

You instrument to answer questions that have not been asked yet, instead of to fill dashboards.

You can follow a request through the system and say where it spent time — with no manual log correlation.

You recognize that most of a typical system's alerts should not exist, and you know which criterion to
apply.

And you understand that observability is a property of the **system**, not of the tool: a system that emits
no context does not become observable because somebody bought a platform.

## Continues in

[DevOps and Platform](/14-devops-and-platform/index.md), where operations stop being reactive and come to
be designed.

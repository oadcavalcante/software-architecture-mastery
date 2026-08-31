---
id: cloud-native
title: Cloud Native
sidebar_position: 17
description: A term that designates something useful and became a badge — what it actually means, and what it came to hide.
doc_type: concept
level: 5
difficulty: intermediate
status: complete
objective: >
  By the end, the reader identifies the concrete properties the term designates,
  and does not confuse adopting tools with having them.
prerequisites: [containers]
related: [containers, kubernetes, vendor-lock-in]
canonical_for: []
translated_from_version: 1
last_reviewed: 2026-08-31
---

# Cloud Native

## Overview

"Cloud native" designates applications designed for the cloud's properties — elasticity, routine failure,
programmable infrastructure — instead of traditional applications transported there.

The idea behind it is useful and concrete. The term, however, was captured: it became a badge for a set of
tools, and "we are cloud native" came to mean "we use containers and Kubernetes".

This document separates the two, because adopting the tools without the properties is common and expensive.

## Problem

An application written for a physical server assumes things the cloud does not guarantee: that the process
lives indefinitely, that the local disk persists, that the IP address is stable, that the configuration is
in a file.

Taking it to the cloud without changing those assumptions produces a system that runs and takes advantage
of nothing: it does not scale, it does not survive instance replacement, and it still requires the same
manual operation.

It is the "as is" migration — legitimate as a first step, problematic as a destination.

## Core Concepts

### The properties, without the tools

What an application needs to **be**, independent of any technology:

**No state in the process.** Nothing important in memory between requests, nothing on a local disk. See
[stateless](/05-system-design/stateless-vs-stateful.md).

**Disposable.** It starts fast, shuts down gracefully, tolerates being killed at any moment.

**Configured by the environment**, not by a packaged file.

**Observable.** Logs on standard output, metrics exposed, tracing propagated. See
[observability](/13-observability/index.md).

**Tolerant of dependency failure.** Timeouts, retries, [backoff](/06-distributed-systems/backoff.md),
degradation.

**Horizontally scalable.** Adding instances increases capacity.

**Idempotent** where repetition is possible. See [idempotency](/06-distributed-systems/idempotency.md).

An application with those seven properties takes advantage of the cloud, running on a virtual machine, in a
container or in serverless. An application without them does not, even on Kubernetes.

### What the term came to hide

The confusion that costs dearly: treating the list of tools as if it were the list of properties.

Containers, orchestration, a service mesh and an automated pipeline are **means**. Adopting them without the
properties produces the worst of both worlds — the new platform's complexity, with the old application's
limitations.

The recognizable symptom: an application on Kubernetes that cannot have more than one replica, because it
keeps sessions in memory.

### An as-is migration is a stage, not a destination

Moving without changing is frequently the right decision: you leave the datacenter on schedule, the risk is
low, and the learning comes afterward.

The problem is stopping there. The modernization needs a plan with a deadline, or it does not happen — and
the environment accumulates cost and risk. See [IaaS](/09-cloud-architecture/iaas.md).

A sequence that works:

```text
1. move as is             leave the datacenter
2. externalize state      sessions, files, configuration
3. make it disposable     startup, graceful shutdown
4. observability          logs, metrics, tracing
5. scale horizontally
6. then, if it makes sense, containers and orchestration
```

Step 6 at the end is deliberate: it is the most visible and the least important.

### Not everything needs to be

An internal system used by twenty people, with predictable load and no availability requirement, gains
nothing from those properties.

Applying the whole list by principle is the same trap, from the other side.

The criterion: the properties pay off when there is elasticity to take advantage of, failure to tolerate,
or a deployment frequency to sustain.

## Mental Model

**Cloud native is a set of properties of the application, not of tools in the infrastructure.** The tools
help exercise them; they do not create them.

## When to Use

- The load varies and elasticity has value.
- Availability requires tolerating instance failure.
- The deployment frequency is high.
- Several teams need to evolve independently.
- The application will live for years and grow.

## When Not to Use

**As a badge.** "We are cloud native" is not a verifiable property.

**For small and stable internal systems.**

**Rewriting what works** with no concrete problem.

**Adopting tools before the properties.**

**As justification for microservices.** They are independent decisions; the first does not imply the
second.

**An as-is migration treated as a conclusion.**

## Alternatives

- **An as-is migration** — a legitimate first step.
- **Incremental modernization** — applying the properties in order of return.
- **Gradual strangulation** — replacing parts with new versions, keeping the legacy running. See
  [legacy modernization](/16-legacy-modernization/index.md).
- **Keeping it as is** — when the system is stable and the cost of changing does not pay off.

## Trade-offs

| With the properties | Without |
|---|---|
| Scales horizontally | Vertically, with a ceiling |
| Tolerates instance loss | Goes down with it |
| Deployment with no interruption | With a window |
| Diagnosis through observability | Through machine access |
| Adaptation work | None |

## Failure Modes

**Tools without properties.** Kubernetes with a single replica.

**State in memory preventing scaling.**

**Modernization postponed indefinitely** after the as-is migration.

**A rewrite by principle**, with no problem to solve.

**Complexity adopted with no need.**

**The term used as a decision criterion.** "That is not cloud native" is not an argument.

## Common Mistakes

**Confusing tools with properties.** Containers and an orchestrator make nothing elastic or resilient; they
allow it to be. A monolith with local state inside a container still has local state.

**Stopping at the as-is migration.** Moving to the cloud without changing anything trades capital cost for
operational cost, frequently higher, and buys no elasticity at all.

**Adopting orchestration before externalizing state.** The orchestrator presupposes that killing and
recreating instances is cheap. With local state, each recycle loses a session or a file, and the team
disables exactly what the orchestrator does that is useful.

**Applying it to every system indiscriminately.** An internal system with stable load has nothing to do
with elasticity, and pays the whole complexity for a benefit that does not exist in its case.

**Using the term instead of naming the concrete property.** "Cloud native" means different things to each
person in the room. Saying "no local state" or "horizontal scaling in minutes" is verifiable; the label is
not.

## Real-World Example

An insurance company ran a two-year program internally called "cloud native modernization". The scope:
moving 40 applications to Kubernetes.

At the program's end, all 40 were in containers, orchestrated, with automated pipelines. The program was
declared complete.

The assessment six months later showed:

**17 applications ran with a single replica**, because they kept sessions in memory. Scaling them
horizontally took them down.

**12 wrote to a local disk** — temporary files, reports, uploads. Each restart lost data, and the team had
configured persistent volumes to work around it, which pinned each pod to a node.

**9 read configuration from a file packaged in the image**, which required rebuilding and republishing the
image to change a value. Promotion between environments generated different images — breaking the guarantee
that what was tested is what runs.

**None had distributed tracing.** Diagnosing a problem between applications was still correlating logs
manually.

**Deployment time improved**, and the frequency did not: the applications were still deployed monthly,
because the bottleneck was the approval process, not the technology.

The infrastructure cost had risen 25%, from the added platform.

The second phase, reoriented, attacked the properties:

**Sessions externalized** in the 17. They came to scale for real.

**Files to object storage** in the 12. See [cloud storage](/09-cloud-architecture/cloud-storage.md).

**Configuration by environment** in the 9. The same image came to run in every environment.

**Observability** with propagated tracing.

And a decision in the opposite direction: **6 applications went back to virtual machines**. They were
stable internal systems, with predictable load and quarterly deployment. The orchestration delivered
nothing there and cost operations.

The learning that stuck: the program measured the wrong thing. The indicator was "applications migrated to
Kubernetes", and it reached 100% without a single property having been acquired.

If the indicator had been "applications that scale horizontally", the program would have finished at 23 of
40 — and it would have attacked the right problem from the start.

## Related Concepts

- [Containers](/09-cloud-architecture/containers.md) and [Kubernetes](/09-cloud-architecture/kubernetes.md)
  — the tools.
- [Vendor Lock-In](/09-cloud-architecture/vendor-lock-in.md).
- [Stateless](/05-system-design/stateless-vs-stateful.md) — the central property.
- [Legacy Modernization](/16-legacy-modernization/index.md).

## Practical Exercise

Take your system's most important application and check the seven properties, one by one.

The number you get says more about its cloud maturity than any list of adopted tools.

## Interview Questions

- What concrete properties does the term designate?
- Why is adopting orchestration before externalizing state problematic?
- Why is an "as-is migration" a legitimate stage and a bad destination?

## Further Reading

- Wiggins, Adam. *The Twelve-Factor App*, 2011.
- Burns, Brendan. *Designing Distributed Systems*. O'Reilly, 2018.
- Newman, Sam. *Monolith to Microservices*. O'Reilly, 2019.

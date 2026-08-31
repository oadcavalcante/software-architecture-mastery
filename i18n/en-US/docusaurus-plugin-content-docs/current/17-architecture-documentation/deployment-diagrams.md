---
id: deployment-diagrams
title: Deployment Diagrams
sidebar_position: 6
description: Where the software actually runs — the diagram that answers incident questions.
doc_type: concept
level: 5
difficulty: intermediate
status: complete
objective: >
  By the end, the reader knows how to map containers onto infrastructure and why this
  diagram is the most consulted during incidents.
prerequisites: [container-diagrams]
related: [container-diagrams, c4-model, living-documentation]
canonical_for: []
translated_from_version: 1
last_reviewed: 2026-08-31
---

# Deployment Diagrams

## Overview

A deployment diagram shows **where each container runs**: on which infrastructure nodes, in
how many instances, in which regions, with which network boundaries.

It answers a class of questions the other levels do not touch — and that come up precisely
at the moments when the cost of having no answer is high:

```text
what goes down if this zone goes down?
are those two services on the same machine?
where does external traffic come in?
where are the database replicas?
does that component cross the private network boundary?
```

## Problem

The [container](/17-architecture-documentation/container-diagrams.md) diagram is logical. It shows that an Orders API
exists. It does not show that it runs in six instances spread across three zones, behind a
load balancer, with the database in a single zone.

That difference matters at two moments:

**During an incident**, when the question is "what else is on that machine" or "which
zones does this failure affect".

**When assessing availability**, when the question is whether logical redundancy
corresponds to physical redundancy. See
[availability](/06-distributed-systems/availability.md).

The classic case: three instances of a service, all in the same zone. The container
diagram shows redundancy; the deployment diagram shows it is illusory.

## Core Concepts

### Nodes and mapping

A node is anything that hosts: a physical machine, a virtual machine, a runtime container,
an orchestrator node, a region, a zone, a managed service.

The diagram expresses **containment**:

```text
Region sa-east-1
  Zone a
    Orchestration node
      Orders API      × 2 instances
      Catalog API     × 2
  Zone b
    Orchestration node
      Orders API      × 2
  Managed service
    Orders Database (primary, zone a; replica, zone b)
```

The same container from the previous level appears here **as many times as it actually
exists** — that is the logical-to-physical mapping.

### One diagram per environment

Production, staging and development have different topologies, and a diagram trying to
cover all three describes none of them.

```text
production   real redundancy, several zones
staging      one instance of each, one zone
development  everything on one machine
```

See [environment management](/14-devops-and-platform/environment-management.md).

In practice, the production one is the one that pays off. The others are rarely worth
maintaining.

### Network boundaries are the most valuable content

What the deployment diagram shows and no other does:

```text
what is exposed to the internet
what is on the private network
where the entry points are
which paths cross boundaries
where encryption in transit ends
```

That makes it the reference artifact for security conversations. See
[threat modeling](/10-security/threat-modeling.md) — the deployment diagram is the natural
input for the exercise.

### It exposes false redundancy

The highest-return use: comparing intended redundancy with actual redundancy.

```text
"we have three instances"      → all in the same zone
"we have a database replica"   → replica in the same zone as the primary
"we have two load balancers"   → same region, with no regional plan
"the cache is redundant"       → one instance, with no persistence
```

Each of those was found in a real system by someone who drew the diagram and looked. See
[disaster recovery planning](/12-reliability/disaster-recovery-planning.md).

### It goes out of date — and the infrastructure is declared

The topology changes frequently, and there is a particularity: in modern environments, the
topology is **already declared** in infrastructure code.

That changes the maintenance equation. A hand-drawn diagram will diverge from what the
infrastructure code declares; a diagram derived from it cannot diverge.

See [infrastructure as code](/14-devops-and-platform/infrastructure-as-code.md) and
[living documentation](/17-architecture-documentation/living-documentation.md).

### Cost appears here and nowhere else

The deployment diagram is the only one that exposes multiplicity: six instances, three
replicas, two mirrored environments. And multiplicity is what the invoice measures.

```text
logical diagram    one box per service
physical diagram   how many instances, in how many zones, for how long
```

That makes it useful in a conversation that rarely has an artifact: the cost of the
architecture. A decision to be redundant across three zones is an availability decision
and a spending decision, and the same drawing supports both. See
[cost architecture](/09-cloud-architecture/cost-architecture.md).

The conversation becomes more concrete when the availability requirement appears next to
the topology: asking for 99.99% is asking for a specific topology, with a specific cost.
Without the drawing, the requirement is negotiated as an adjective — "it has to be highly
available" — and the topology is decided later, by whoever is implementing it, without
anyone having compared the two.

## Mental Model

**Where things actually run, and what goes down together.** It is the diagram you open
during an incident.

## When to Use

- For the production environment of any system with an availability requirement.
- When assessing whether the redundancy is real.
- As input for threat modeling.
- During incidents, to understand the blast radius.
- Before topology changes.

## When Not to Use

**Mixing environments** in a single diagram.

**For single-instance systems** with no availability requirement.

**With volatile detail** — instance names, addresses, versions change every week.

**Maintained by hand** when the infrastructure is declared in code.

**As a substitute** for the container diagram: it answers "where it runs", not "what it
does".

## Alternatives

- **Infrastructure code** — it is the source of truth; the diagram is the visualization.
- **The provider's console** — always current, and with no intent or grouping.
- **A diagram generated from the real state** — the most reliable option.
- **The container diagram** — when the question is logical.

## Trade-offs

| Deployment | Container |
|---|---|
| Where it runs | What it does |
| Changes frequently | More stable |
| Answers incidents | Answers changes |
| Per environment | A single one |

| Drawn | Derived from state |
|---|---|
| Shows the intent | Shows the real thing |
| Diverges | Cannot diverge |
| Legible grouping | Automatic |

## Failure Modes

**Mixed environments.** None described correctly.

**Apparent redundancy.** Three instances in the same zone.

**Volatile detail.** Out of date in days.

**Divergent from the infrastructure code.** Two sources of truth.

**Only exists for the old production.** The migration didn't update it.

## Common Mistakes

**Not showing the instance count.**

**Omitting zones and regions** — which is precisely what answers the blast radius.

**Not marking network boundaries.**

**Drawing by hand what the infrastructure already declares.**

**Not dating it.**

## Real-World Example

A financial services provider ran an availability review across twelve systems classified
as critical. The method was simple: draw each one's production deployment diagram and
compare it with the declared requirement.

The findings:

```text
systems with declared redundancy         12
with real cross-zone redundancy           7
with a database replica in another zone   5
with a regional failure plan              2
with the cache as a single point of failure  4
```

Two concrete cases:

**Authorization system.** Four instances, a load balancer, a 99.95% requirement. The four
instances were in the same zone — the scaling group had been configured with a single
subnet three years earlier, and never revisited. A zone failure would take the whole
service down.

**Reconciliation system.** A database with a replica configured, and the replica in the
same zone as the primary. The documented recovery procedure assumed the opposite.

Neither had a deployment diagram before the exercise. Both had correct container diagrams,
which showed redundancy — because logical redundancy was what they described.

What was decided:

**A deployment diagram mandatory** for critical systems, generated from the infrastructure
code, not drawn.

**An automated check** of zone distribution, as part of the pipeline: a scaling group with
a single subnet in a critical system fails the check. See
[infrastructure as code](/14-devops-and-platform/infrastructure-as-code.md).

**An annual review** of the correspondence between the availability requirement and the
real topology.

Both systems were fixed within three months. And eight months later there was a real zone
failure, lasting four hours: all twelve systems kept operating.

The lesson that stuck: the missing information was neither hard nor expensive. It was
available in the provider's console the whole time. What was missing was someone looking
at it **together**, in a drawing, with the requirement next to it.

## Related Concepts

- [Container Diagrams](/17-architecture-documentation/container-diagrams.md) — the logical level.
- [Availability](/06-distributed-systems/availability.md).
- [Infrastructure as Code](/14-devops-and-platform/infrastructure-as-code.md).
- [Threat Modeling](/10-security/threat-modeling.md).

## Practical Exercise

Draw the production deployment diagram of one of your team's systems, marking zones and
instance counts.

Then compare it with the declared availability requirement. The question: does a zone
failure take the system down?

## Interview Questions

- What question does the deployment diagram answer that the container one does not?
- How can a system have logical redundancy without real redundancy?
- Why derive this diagram from the infrastructure code?

## Further Reading

- Brown, Simon. *Software Architecture for Developers*. Leanpub, 2015.
- Beyer, Betsy et al. *Site Reliability Engineering*. O'Reilly, 2016.
- Morris, Kief. *Infrastructure as Code*. 2nd ed. O'Reilly, 2020.

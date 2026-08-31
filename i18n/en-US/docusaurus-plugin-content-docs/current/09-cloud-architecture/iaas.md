---
id: iaas
title: IaaS
sidebar_position: 1
description: Renting raw infrastructure — the model with the most control and the most work, and where it is still the answer.
doc_type: concept
level: 5
difficulty: intermediate
status: complete
objective: >
  By the end, the reader recognizes what IaaS transfers and what remains their
  responsibility, and avoids using it as a default out of habit.
prerequisites: [cloud-architecture]
related: [paas, managed-services, cloud-compute]
canonical_for: []
translated_from_version: 1
last_reviewed: 2026-08-31
---

# IaaS

## Overview

IaaS — infrastructure as a service — is renting the raw blocks: virtual machines, disks, networks,
addresses.

The provider takes care of the datacenter, the hardware and the virtualization layer. From the operating
system up, it is all yours.

It is the model with the most control and the most work. It remains the right answer for specific cases,
and it is frequently chosen out of habit when a higher model would solve it better.

## Problem

Before the cloud, capacity required buying hardware: a quote, a purchase, delivery, installation. Weeks or
months, with capital tied up and sizing done for the peak three years ahead.

IaaS turns that into an API call. Capacity in minutes, paid by usage, given back when it is no longer
needed.

That is the cloud's fundamental change, and every other model is built on top of it.

## Core Concepts

### The shared responsibility model

The question that organizes everything: **who takes care of what?**

```text
                      IaaS       PaaS       SaaS
application           you        you        vendor
data                  you        you        you*
runtime               you        vendor     vendor
operating system      you        vendor     vendor
virtualization        vendor     vendor     vendor
hardware and network  vendor     vendor     vendor
datacenter            vendor     vendor     vendor
```

The asterisk is important: **the data never stops being your responsibility**, in any model. Configuring
access, defining retention, ensuring compliance — that is not outsourced, and it is the origin of most
cloud exposure incidents.

### What remains yours in IaaS

It is worth enumerating, because the list is long and is usually underestimated:

**Operating system security patches.** Continuous and mandatory.

**Configuration and hardening.** Ports, unnecessary services, permissions.

**Monitoring and log collection.** Install, configure, maintain.

**Backup and tested restore.**

**High availability.** Distributing across zones, balancing, health checking.

**Scaling.** Configuring, tuning limits, testing.

**Failure recovery.** Replacing the instance that died.

Each item is recurring work. See [managed services](/09-cloud-architecture/managed-services.md) for the
economic comparison.

### Ephemeral by nature

The mental difference relative to a server of your own: the instance can disappear. The provider can
terminate it for maintenance, the hardware can fail, an interruptible instance can be reclaimed.

That requires treating instances as disposable: no important local state, no manual configuration,
everything reproducible from code.

An instance nobody can recreate from scratch is a liability.

### Infrastructure as code is not optional

Creating resources through the console is convenient and produces an environment nobody knows how to
rebuild.

Declaring the infrastructure in code gives versioning, review, reproducibility across environments and
recovery. It is what turns IaaS from "rented servers" into programmable infrastructure.

Without it, the model's main gain is lost.

### Where IaaS is still the answer

**Software that requires system control.** Kernel requirements, drivers, specific configuration.

**Licensing that requires a dedicated machine.**

**Legacy system migration.** Moving it as is is the fastest path out of a datacenter, and it is a
legitimate decision — as long as the modernization comes afterward, and is not postponed indefinitely.

**Very large scale with predictable load.** Where the price difference pays for a team.

**Compliance requirements** that demand demonstrable control of the layer.

### A dedicated instance is not the same thing as your own server

A difference that changes the operating model and goes unnoticed: even in IaaS, you do not control the
hardware.

The provider can migrate your instance between hosts, schedule maintenance that requires a restart, or
retire a machine generation with a deadline. You are notified, and you do not decide.

That means "we have full control" is true from the operating system layer up, and only from there up. The
layer below continues to be operated by a third party, with windows you accommodate rather than choose.

The practical consequence: even in IaaS, the application needs to tolerate a scheduled restart. Systems
migrated from a datacenter that assumed continuous machine availability discover this at the first
maintenance notification — typically with a few days' notice.

## Mental Model

**IaaS trades work for control.** If you are not using the control for something concrete, you are paying
the work for nothing.

## When to Use

- The application requires operating system control.
- Licensing or compliance requires it.
- The initial migration from your own environment.
- Large scale with predictable load and a team to operate it.
- No higher model meets the requirement.

## When Not to Use

**Out of habit.** Check whether a higher model solves it.

**With no infrastructure as code.**

**With no security patching process.**

**For components that exist as a managed service** — a database, a queue, a cache — with no specific
reason.

**With a small team** and no operational experience.

**Treating instances as permanent servers.**

## Alternatives

- **[PaaS](/09-cloud-architecture/paas.md)** — the provider takes care of the system and the runtime.
- **[Managed services](/09-cloud-architecture/managed-services.md)** — for the infrastructure components.
- **[Containers](/09-cloud-architecture/containers.md)** — consistent packaging on top of IaaS.
- **[Serverless](/09-cloud-architecture/serverless.md)** — with no capacity to manage.

## Trade-offs

| IaaS | Higher models |
|---|---|
| Full control | Limited |
| All the operational work | Less |
| A lower unit price | Higher |
| Any software | What the platform supports |
| Greater portability | Less |
| Slower delivery | Faster |

## Failure Modes

**A non-reproducible instance.** Configured by hand, nobody knows how to recreate it.

**Late patches.** Known vulnerabilities in production.

**State on a local disk lost.**

**A single zone by omission.** See [availability zones](/09-cloud-architecture/availability-zones.md).

**Orphan instances.** Created for a test and forgotten, billed forever.

**Permissive security groups.** Ports opened to the internet for convenience and never closed.

**A backup never restored.**

## Common Mistakes

**Creating resources through the console.**

**Not automating patching.**

**Keeping state on a local disk.**

**Not distributing across zones.**

**Choosing IaaS by reflex** when an equivalent managed service exists.

**Migrating the legacy as is and stopping there.**

## Real-World Example

A retail company migrated its datacenter to IaaS in four months — 60 virtual machines, replicating the
previous environment.

The migration was successful in its immediate goal: leaving the datacenter before the contract expired.

Two years later, the environment had problems the team classified as "we brought them along":

**Non-reproducible instances.** 41 of the 60 had been configured manually. An inventory revealed that
nobody knew how to recreate 12 of them from scratch.

**Patches.** 23 instances with outdated operating system versions, some out of support.

**A single zone.** All of them in one zone, because that was the default at creation. The migration had
replicated the datacenter's topology — which had a single building.

**Cost.** The bill was 30% higher than the previous datacenter's cost, because the machines were sized with
the same tied-up-capital headroom that made sense when the hardware was bought.

**Components that could be managed.** A self-managed database, queue and cache, with the corresponding
operational work.

The second phase, over a year:

**Infrastructure as code** for everything. The 12 irreproducible instances were the hardest — in two cases
they had to be rebuilt from reverse-engineering what was running.

**Database, queue and cache migrated** to managed services.

**Distribution across three zones.**

**Resizing** based on actual utilization. The bill fell 45%.

**Automated patching**, with instance replacement instead of in-place updating.

Migrating as is was the right decision for the deadline they had. The mistake was considering it finished —
the modernization plan existed on paper and went two years without priority, accumulating security risk and
cost.

## Related Concepts

- [PaaS](/09-cloud-architecture/paas.md) and [SaaS](/09-cloud-architecture/saas.md) — the other models.
- [Managed Services](/09-cloud-architecture/managed-services.md).
- [Cloud Compute](/09-cloud-architecture/cloud-compute.md).
- [Availability Zones](/09-cloud-architecture/availability-zones.md).

## Practical Exercise

Choose a production instance and ask: if it vanishes now, how long to recreate an identical one, from code?

If the answer involves somebody remembering what was installed, you have an instance that is not
reproducible.

## Interview Questions

- What does the shared responsibility model say about data?
- Why should instances be treated as disposable?
- In what cases is IaaS still the right choice?

## Further Reading

- Morris, Kief. *Infrastructure as Code*. 2nd ed. O'Reilly, 2020.
- Beyer, Betsy et al. *Site Reliability Engineering*. O'Reilly, 2016.
- The providers' shared responsibility model documentation.

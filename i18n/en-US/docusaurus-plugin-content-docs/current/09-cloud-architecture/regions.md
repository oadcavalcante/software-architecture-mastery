---
id: regions
title: Regions
sidebar_position: 8
description: The cloud's geographic unit — what it isolates, what it costs and why almost everything is regional.
doc_type: concept
level: 5
difficulty: intermediate
status: complete
objective: >
  By the end, the reader chooses a region by latency, regulation and cost, and
  knows what is isolated between regions and what is not.
prerequisites: [cloud-architecture]
related: [availability-zones, multi-region, cloud-networking]
canonical_for: []
translated_from_version: 1
last_reviewed: 2026-08-31
---

# Regions

## Overview

A region is a geographic area where the provider operates datacenters. São Paulo, Virginia, Frankfurt.

It is the **unit of failure isolation and of jurisdiction**: a regional failure should not cross into
another region, and data written in a region falls under that country's law.

Most cloud services are regional. Understanding what that implies — and which are the global exceptions —
is the basis of every availability and compliance decision.

## Problem

The region choice is usually made once, at the start, with no explicit criterion — typically "the closest
one" or "the console's default".

It is hard to reverse: migrating data and infrastructure between regions is a project, not a
configuration.

And it determines four things at once: latency to the users, the data's jurisdiction, cost, and which
services will be available.

## Core Concepts

### What the region isolates

A region is designed to fail alone. Power, network, cooling and control planes are separate.

That is what makes [multi-region](/09-cloud-architecture/multi-region.md) a continuity strategy: if an
entire region goes down — which happens — the other continues.

What is **not** isolated: the provider's global control plane, authentication, and the global services
listed below. A failure in those crosses regions, and it is exactly the kind of incident that takes down
customers who believed they were protected.

### Regional or global

```text
regional   compute, databases, object storage, queues, virtual networks
global     DNS, content delivery network, identity and access
           management, billing, the control plane
```

Global services are the coupling point between regions. They have high availability and they are not
infallible — several wide-reaching incidents were global service failures, not regional ones.

A multi-region architecture that depends on a global service to work has a single point geography does not
protect.

### Latency is geography, and it does not negotiate

```text
same city                    1 to 3 ms
same country, distant cities 10 to 30 ms
same continent               20 to 60 ms
intercontinental             100 to 250 ms
```

Those numbers come from the speed of light in fiber plus routing hops. No optimization reduces them.

The design consequence: an operation that makes five cross-region calls pays that value five times. See
[PACELC](/06-distributed-systems/pacelc.md) — strong consistency between distant regions is expensive by
physics, not by implementation.

### Cross-region transfer is billed

Inside the region, traffic is cheap or free. Between regions, it is charged per gigabyte, and to the
internet, more still.

That becomes an architectural decision: a service in one region querying a database in another generates a
continuous cost, proportional to the traffic. See
[cost architecture](/09-cloud-architecture/cost-architecture.md).

### Jurisdiction is not a legal detail

Data written in a region is subject to that country's laws. For personal data, that is usually a
requirement, not a preference.

And residency needs to be verified, not presumed: backups, replicas, application logs and supporting
services can leave the region without anybody having decided that.

### Not every region has everything

New services arrive first in the larger regions. Smaller regions can take years to receive a service, or
never receive it.

That bites late: the architecture was designed with a service that does not exist in the region regulation
requires, and the discovery happens during implementation.

Checking service availability by region is part of the choice, and it is the most skipped step.

### Quotas are per region

Resource limits are applied per region, and initial quotas are usually modest.

In an expansion to a new region, or in a recovery plan that promises to bring up capacity in another
region, the quota is what blocks it — and it only shows up at the moment you try.

## Mental Model

**The region is the unit of failure and of law.** Everything else — latency, cost, service availability —
follows from choosing it.

## When to Use

The region choice should be deliberate when:

- There is a data residency requirement.
- Latency to users matters.
- The transfer cost is significant.
- A specific service is necessary.
- There is a continuity plan in another region.

## When Not to Use

**Multiple regions with no need.** See [multi-region](/09-cloud-architecture/multi-region.md) — the cost is
high and most systems do not need it.

**Choosing by the console's default.**

**Assuming every service exists in every region.**

**Depending on a global service with no plan for its failure.**

**Frequent cross-region calls** on the critical path.

**Presuming data residency** without checking backups, replicas and logs.

## Alternatives

- **One region with several [availability zones](/09-cloud-architecture/availability-zones.md)** — the
  appropriate configuration for most systems.
- **A content delivery network** — it solves read latency with no multi-region.
- **A read replica in another region** — read proximity with centralized writes.
- **[Disaster recovery](/09-cloud-architecture/disaster-recovery.md) in another region** — reduced
  capacity, activated on demand.

## Trade-offs

| A single region | Multiple regions |
|---|---|
| Simple operation | Complex |
| No cross-region transfer | A continuous cost |
| Uniform latency | Close to the user |
| A regional failure takes everything down | Continuity |
| Cheap consistency | Expensive. See [PACELC](/06-distributed-systems/pacelc.md) |
| One jurisdiction | Several to manage |

## Failure Modes

**A complete regional failure.** It happens, and it is the scenario multi-region addresses.

**A global service failure.** It crosses regions.

**Data leaving the jurisdiction with nobody knowing.**

**A service unavailable in the required region.**

**A quota blocking expansion.** Discovered during the incident.

**An unexpected transfer cost.** A service talking across regions with nobody having noticed.

## Common Mistakes

**Choosing with no criterion.** The region is usually inherited from the first project. Latency to users,
data residency and price vary among them, and changing later is a migration.

**Not checking service availability by region.** New services arrive first in a few regions. An
architecture designed with a service unavailable in the chosen region needs to be redesigned or relocated.

**Not checking where the backups are.** A backup in the same region does not protect against regional loss,
and a backup in another region may violate a data residency requirement. Both checks are mandatory and
frequently neither is done.

**Assuming multi-region eliminates the single point.** The provider's global services — DNS, identity, the
control plane — remain shared across regions.

**Not requesting a quota increase in the secondary region** before needing it. Quotas are per region and
approval takes days. Asking during the disaster is too late.

**Ignoring the transfer cost in the design.** Cross-region traffic is billed and it is not cheap. An
architecture that queries data in the other region on every request pays that continuously.

## Real-World Example

A Brazilian healthcare company operated in a United States region, chosen at the project's start because it
was the default and had every service.

Three problems appeared, in increasing order of severity:

**Latency.** Each request paid around 130 ms round trip. The application made several calls per screen, and
the load time reached 2 seconds with the server responding in 40 ms. The diagnosis took a while because the
server's metrics looked excellent.

**Transfer cost.** After a partial migration to a Brazilian region, the two sides started talking to each
other. Cross-region transfer, not anticipated, added a significant monthly expense — and it grew with the
traffic, with nobody watching it.

**Jurisdiction.** A compliance review found that Brazilian patients' health data was stored outside the
country. Migrating to the São Paulo region became an obligation with a deadline.

The migration revealed two obstacles the team had not anticipated:

**Two services did not exist** in the Brazilian region. One was replaced by an alternative; the other
required an implementation of their own, with three months of work.

**Quotas.** The new region had low limits because the account was new there. The increase took eleven
business days between request and approval — in the middle of the migration schedule.

And a detail that almost slipped through: the **backups** were configured to replicate to a US region, by a
choice made years earlier for "geographic redundancy". Migrating the database would not have resolved the
compliance issue.

What the team learned: the original choice cost an eight-month migration. It was made in one afternoon,
with nobody having listed latency, jurisdiction, cost and service availability as criteria — because at the
time the system had three internal users and the region seemed irrelevant.

## Related Concepts

- [Availability Zones](/09-cloud-architecture/availability-zones.md) — the subdivision.
- [Multi-Region](/09-cloud-architecture/multi-region.md) — when to use more than one.
- [Disaster Recovery](/09-cloud-architecture/disaster-recovery.md).
- [Cost Architecture](/09-cloud-architecture/cost-architecture.md) — transfer.

## Practical Exercise

List where these are today: your primary database, your replicas, your backups, your application logs and
your user files.

If any of them is in a different region than you believe, you have a jurisdiction or cost problem nobody
decided on.

## Interview Questions

- What does a region isolate, and what does it not isolate?
- Why can a multi-region architecture still have a single point?
- Why does service availability by region need to be checked in advance?

## Further Reading

- The major providers' global infrastructure documentation.
- Beyer, Betsy et al. *Site Reliability Engineering*. O'Reilly, 2016.
- Kleppmann, Martin. *Designing Data-Intensive Applications*. O'Reilly, 2017.

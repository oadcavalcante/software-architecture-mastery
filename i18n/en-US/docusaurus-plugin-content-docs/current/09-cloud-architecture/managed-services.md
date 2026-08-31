---
id: managed-services
title: Managed Services
sidebar_position: 7
description: Buying operations instead of doing them — the cloud's central economic decision, and what it charges later.
doc_type: concept
level: 5
difficulty: intermediate
status: complete
objective: >
  By the end, the reader decides between managed and self-managed by comparing
  total cost of operation, not list price.
prerequisites: [cloud-architecture]
related: [vendor-lock-in, cost-architecture, serverless]
canonical_for: []
translated_from_version: 1
last_reviewed: 2026-08-31
---

# Managed Services

## Overview

A managed service is one where the provider operates the infrastructure for you: installs, updates,
replicates, backs up, monitors and recovers.

You pay more per unit of resource and stop doing the work.

It is the cloud's central economic decision, and it is usually made by the wrong criterion — comparing a
list price with the cost of a machine, instead of comparing **total cost of operation**.

## Problem

The intuitive comparison is misleading:

```text
managed database    $400/month
machine + database  $120/month
```

It looks three times more expensive. What the second line does not include: installation, configuration,
tuning, monitoring, version upgrades, security patching, backup configuration and testing, replicas, a
recovery plan, on-call, and the time for somebody to learn how to do all of that.

A fraction of a person dedicated to it costs more than the difference. And that is the honest comparison —
not price against price.

## Core Concepts

### What actually changes

**On-call.** Somebody needs to wake up at 3 a.m. when the database goes down. With a managed service, that
somebody is the provider's.

**Upgrades and patching.** The security pipeline for a self-managed database is continuous and mandatory
work. Postponing it accumulates risk.

**A tested backup.** Not the one that exists — the one that has been restored. See
[data replication](/07-data-architecture/data-replication.md).

**Deep knowledge.** Tuning a database under load requires specific experience most teams do not have and
should not need to have.

None of that shows up on the self-managed invoice, and all of it shows up on people's calendars.

### What you lose

Being specific, because the decision needs both sides:

**Version and configuration control.** The provider decides when to upgrade, and some options are simply
not exposed.

**Extensions and features.** A database extension you use may not be available.

**A maintenance window.** The provider restarts when it decides, within the window — and your application
needs to tolerate that.

**Deep diagnosis.** With no access to the machine, certain problems become a support ticket instead of an
investigation.

**Portability.** See [vendor lock-in](/09-cloud-architecture/vendor-lock-in.md).

### The question that decides

It is not "is it more expensive?". It is: **is this a competitive differentiator of ours?**

Operating a relational database differentiates almost no company. Operating the recommendation engine does.

Work that does not differentiate should be bought when it is buyable. That frees people for what only they
can do.

The honest exception: at very large scale, the price difference comes to pay for a dedicated team — and
then self-managing makes sense again, with the numbers on the table.

### Managed is not infallible

It reduces the work, not the responsibility:

**Backups need to be configured** and the restore tested. Several services have a short default retention.

**Multi-zone is usually optional.** See [availability zones](/09-cloud-architecture/availability-zones.md).

**Limits and quotas exist** and stop the application when reached.

**Modeling and queries remain yours.** A managed service does not fix a missing index. See
[indexing](/07-data-architecture/indexing.md).

**The provider has incidents.** And there is nothing you can do beyond waiting — which needs to be in the
plan.

### The degrees

```text
self-managed on a machine  full control, full work
managed                    the provider operates, you configure
serverless                 the provider operates and scales, you see no capacity
```

The third degree takes the logic to its extreme. See [serverless](/09-cloud-architecture/serverless.md).

The choice does not need to be uniform: a system can have a managed database, a managed cache and one
specialized self-managed component, because only that last one has a requirement the managed option does
not meet.

## Mental Model

**A managed service trades money and control for people's time.** If their time is worth more applied to
something else, the trade is good.

## When to Use

- The component is not a competitive differentiator.
- The team is small, or has no specific operational experience.
- 24-hour on-call is expensive or unviable.
- A compliance requirement the provider already meets.
- Delivery speed matters more than unit cost.
- The usage pattern fits what the service offers.

## When Not to Use

**When the component is the differentiator.**

**When the service does not meet a specific requirement** — a version, an extension, a configuration.

**At a scale where the difference pays for a team**, with the numbers verified.

**When the dependency is unacceptable.** See [vendor lock-in](/09-cloud-architecture/vendor-lock-in.md).

**Without checking backups, retention and multi-zone.**

**Assuming managed means no responsibility.**

## Alternatives

- **Self-managed** — full control, full work.
- **Managed by a third party** — not by the cloud provider; it reduces dependency on a single vendor while
  keeping the operational benefit.
- **[Serverless](/09-cloud-architecture/serverless.md)** — the next degree.
- **Open source with an operator** — on [Kubernetes](/09-cloud-architecture/kubernetes.md), it automates
  part of the operation without leaving your control. An intermediate cost, and somebody still needs to
  operate the operator.

## Trade-offs

| Managed | Self-managed |
|---|---|
| Less operational work | All the work |
| A higher per-unit price | Lower |
| Limited version and configuration | Full control |
| No on-call for it | On-call necessary |
| Vendor dependency | Portable |
| Diagnosis through support | Direct access |
| Faster delivery | Slower |

## Failure Modes

**A backup with a short default retention.** Discovered when needed.

**A single zone by default.**

**A quota reached.** The application stops.

**Maintenance restarting with no tolerance in the application.**

**A provider incident.** With no action possible.

**A discontinued version.** A forced migration on the provider's deadline.

**Cost growing silently.** See [cost architecture](/09-cloud-architecture/cost-architecture.md).

## Common Mistakes

**Comparing list price instead of total cost.**

**Not checking backup retention or testing the restore.**

**Not enabling multi-zone.**

**Not tolerating a restart in the application.**

**Self-managing by cost reflex**, without accounting for people's time.

**Managing everything by reflex**, without checking whether the service meets the requirement.

## Real-World Example

A technology company with 12 engineers self-managed a relational database, a cache, a queue and search on
virtual machines. The justification was cost: the infrastructure bill was around 40% of what it would be
with managed services.

The survey of what that consumed, done over a quarter:

**1.5 full-time-equivalent people** dedicated to operating those four components — upgrades, tuning,
incidents, backups.

**14 incidents** in the year, 9 of them related to those components.

**A database version two years out of date**, with pending security patches, because the upgrade required a
window that was never prioritized.

**A restore never tested.** The first attempt, made during the survey, failed — the documented procedure
was out of date.

The migration to managed services was done for three of the four components:

**The database, cache and queue** migrated. The infrastructure bill rose, and the total bill fell: the 1.5
people went back to the product, and the related incidents went from 9 to 1 the following year.

**Search stayed self-managed.** The available managed service did not support a relevance feature the
product used, and that was a real differentiator. A deliberate decision, recorded, with the operational
cost accepted.

Two problems in the migration:

**Backup retention.** The managed service's default was 7 days. The regulatory requirement was 5 years. It
was configured — and it was only noticed because somebody asked; the assumption was "the managed service
takes care of that".

**The maintenance window.** The provider restarted the instance during the window, and the application did
not tolerate reconnection. Three incidents until reconnection handling was implemented.

What the team records: the comparison that supported the previous decision — 40% of the price — was true
and irrelevant. Nobody had put the cost of the people on the same spreadsheet, because it was already paid.

## Related Concepts

- [Vendor Lock-In](/09-cloud-architecture/vendor-lock-in.md) — the other side.
- [Serverless](/09-cloud-architecture/serverless.md) — the next degree.
- [Cost Architecture](/09-cloud-architecture/cost-architecture.md).
- [Availability Zones](/09-cloud-architecture/availability-zones.md) — what to check.

## Practical Exercise

List the infrastructure components your team operates. For each one, estimate the hours per month spent on
maintenance, incidents and upgrades.

Multiply by the hourly cost. Compare with the price difference of the equivalent managed service. That is
the decision's number.

## Interview Questions

- Why is comparing list price misleading?
- What does a managed service still require of you?
- What is the question that decides between managing and buying?

## Further Reading

- Beyer, Betsy et al. *Site Reliability Engineering*. O'Reilly, 2016.
- Kim, Gene et al. *The DevOps Handbook*. IT Revolution, 2016.
- Forsgren, Nicole et al. *Accelerate*. IT Revolution, 2018.

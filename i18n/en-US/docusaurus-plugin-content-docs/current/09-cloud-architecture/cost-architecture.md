---
id: cost-architecture
title: Cost Architecture
sidebar_position: 14
description: In the cloud, the design has a monthly price — and it is a quality attribute like any other.
doc_type: concept
level: 5
difficulty: advanced
status: complete
objective: >
  By the end, the reader estimates the cost of an architectural decision before
  implementing it, and recognizes the structural forms of waste.
prerequisites: [cloud-architecture]
related: [managed-services, serverless, cloud-storage]
canonical_for: []
translated_from_version: 1
last_reviewed: 2026-08-31
---

# Cost Architecture

## Overview

On your own infrastructure, the machine has already been bought: an inefficient design consumes idle
capacity and does not change the bill.

In the cloud, each request, each gigabyte transferred, each second of execution and each byte stored appear
on next month's invoice.

That makes cost a **quality attribute** like latency or availability — something you design for, measure,
and that degrades when nobody is looking. See
[quality attributes](/01-fundamentals/quality-attributes.md).

## Problem

Cloud cost is treated as a finance matter: somebody looks at the invoice at the end of the month, finds it
high, and asks to "optimize".

The optimization that follows is usually tactical — shrinking an instance, deleting orphan volumes — and
recovers a fraction. The cost goes back to growing the next quarter.

Because most of the cost does not come from configuration. It comes from **architectural decisions**: how
many calls an operation makes, where the data travels, what is kept and for how long, how much capacity
stays on waiting.

Those decisions are made by engineers who do not see the invoice.

## Core Concepts

### The billed dimensions

```text
compute         per second or hour, by instance size
storage         per gigabyte-month, by access class
transfer        per gigabyte — between zones, between regions, to the internet
requests        per operation, in object storage, queues, functions
managed         per unit of provisioned capacity
operations      queries, invocations, health checks
```

The third and the fourth are the ones that surprise people, because they have no obvious equivalent on your
own infrastructure — and they are the ones that grow with traffic, invisibly.

### The metric that matters is cost per business unit

Total cost rises when the company grows, which is expected. What reveals a problem is **cost per
transaction**, per active user, per order processed.

If the total cost doubles and the number of orders doubles, everything is fine. If the cost doubles and
orders grow 20%, the architecture got worse.

That metric rarely exists, and without it there is no way to distinguish healthy growth from degradation.

### The structural forms of waste

The ones that appear in almost every environment, in order of frequency:

**Idle capacity outside business hours.** Development and test environments on 24 hours for 8 hours of use.
Two thirds wasted by definition.

**Oversizing.** Instances chosen out of caution and never revisited. The norm is utilization between 5% and
15%.

**Unnecessary transfer.** Traffic crossing zones for lack of routing preference. See
[availability zones](/09-cloud-architecture/availability-zones.md).

**Data with no retention policy.** Logs and backups accumulating indefinitely. See
[data lifecycle](/07-data-architecture/data-lifecycle.md).

**Orphan resources.** Volumes from deleted instances, reserved IP addresses, old images. Nobody sees them
because they have no owner.

**Excessive queries.** A screen that makes 40 calls instead of 3.

**The wrong storage class.** Cold data in immediate-access storage.

None of them is micro-optimization. All of them are architecture or discipline.

### Tagging is a prerequisite for everything

Without tagging resources by team, product and environment, there is no way to attribute cost — and with no
attribution, nobody is responsible.

The effect of making cost visible per team is usually greater than that of any technical optimization:
people who see their own number act on it.

Mandatory tagging at creation, with untagged resources blocked or flagged, is the foundation.

### Cost goes into the design, not into the review

The question to ask before implementing: **how much will this cost per month, at the expected volume?**

```text
1 million orders/month
  × 4 object storage calls per order
  = 4 million requests
  + cross-zone transfer if the design has no preference
```

A rough estimate, made in fifteen minutes, avoids discovering in production that a decision costs ten times
what was expected.

And it allows comparing alternatives by cost, alongside latency and complexity.

### Over-optimizing also costs

Honesty is worth it: engineering spends time, and time costs more than most small savings.

Chasing 5% in something that represents 2% of the invoice is negative work. The practical rule is to attack
what is at the top of the distribution — typically two or three items account for most of the bill.

## Mental Model

**In the cloud, the design has a monthly price.** Whoever designs without seeing the invoice designs with
one dimension less.

## When to Use

Cost should be an explicit criterion when:

- The volume is going to grow by orders of magnitude.
- The product's margin is sensitive to infrastructure cost.
- There are design alternatives with very different prices.
- The invoice is already material next to the revenue.
- One component grows faster than the business.

## When Not to Use

**As the dominant criterion in the discovery phase.** Before knowing whether the product works, optimizing
cost is optimizing what may not even exist.

**Sacrificing reliability.** Removing redundancy to save is trading predictable cost for risk.

**Micro-optimization without measuring the distribution.**

**Long-term capacity reservations** before the usage pattern stabilizes.

**Self-managing to save** without accounting for people's time. See
[managed services](/09-cloud-architecture/managed-services.md).

## Alternatives

To reduce cost without changing architecture:

- **Turning off what is not used** outside business hours — the one with the most immediate return.
- **Resizing** based on actual utilization.
- **A usage commitment** — reservation discounts, for stable capacity.
- **Interruptible capacity** — far cheaper, for tolerant workloads.
- **Storage classes** by access frequency.
- **Caching** — it reduces billed calls and latency at the same time.

## Trade-offs

| Optimized for cost | For performance |
|---|---|
| Less idle capacity | Headroom for peaks |
| Reactive scaling | Capacity ready |
| Colder storage | Immediate access |
| Less redundancy | More |
| More risk under peak | More predictable |

| Reserved | On demand | Interruptible |
|---|---|---|
| Cheaper with a commitment | Full price | Very cheap |
| A 1 to 3 year commitment | None | It can be taken back |
| For stable load | Variable | Tolerant of interruption |

## Failure Modes

**Cost per transaction growing with nobody noticing.**

**A surprise invoice.** A loop that queries excessively, a process that did not finish.

**Orphan resources accumulating.**

**Cross-zone transfer dominating the bill.**

**Infinite retention.** Years of logs nobody queries.

**Scaling with no ceiling.** A defect generates load and the bill follows.

**An optimization breaking reliability.**

## Common Mistakes

**Not tagging resources.** With no team, product and environment tags, the invoice is an aggregate number
nobody can attribute — and what has no owner does not get reduced.

**Not measuring cost per business unit.** Total cost always rises when the company grows. Cost per order or
per active user distinguishes healthy growth from waste, and it is the only number that sustains the
conversation.

**Treating cost as a finance matter.** The decisions that generate cost are architectural and happen months
before the invoice. Whoever chooses the architecture chooses the cost.

**Not estimating before implementing.** An order-of-magnitude estimate costs an hour and eliminates
unviable alternatives. Discovering afterward forces redoing what is already in production.

**Optimizing what is not at the top of the distribution.** Cost is concentrated in a few items.
Optimization work outside them consumes engineering time and does not change the invoice.

**Not defining a scaling ceiling or an anomaly alert.** Auto scaling with no limit turns a defect into an
infinite loop on an unexpected invoice, and the warning arrives at the month's close.

## Real-World Example

A video platform saw its cloud bill grow 180% in a year, while the user base grew 40%.

The analysis, done after tagging by product was implemented, found the distribution:

**Cross-zone transfer: 31% of the invoice.** The transcoding service read the files from a storage system
and the load balancers distributed with no zone preference. Most of the traffic crossed zones with no need.

**Storage of old videos: 24%.** Every video, from seven years, in immediate-access storage. The access
analysis showed that 88% of them had not been accessed in more than a year.

**Development environments: 12%.** Eleven environments on 24 hours, used during business hours.

**Oversized instances: 9%.** Average utilization of 11%.

**Orphan resources: 4%.** Volumes from instances deleted months earlier.

The fixes, and what each one returned:

**Zone preference in the routing** — a configuration, two days of work. It reduced transfer by around 70%.

**A lifecycle policy** moving videos with no access for 90 days to a cold class and, after a year, to
archival. It halved the storage cost, with the caveat that archival retrieval has latency — which required
handling in the application for rarely accessed videos.

**Automatic shutdown** of the environments outside business hours and on weekends.

**Resizing** based on 30 days of actual utilization.

**A weekly orphan sweep.**

Result: the invoice fell 44%, and the **cost per hour of video watched** — the metric that came to be
tracked — fell 61%.

The team's reading: no fix required changing the application's architecture. All of them were
infrastructure decisions made by omission, that nobody revisited because nobody owned the number.

Tagging by product, which came first, was what made everything else possible — and it was seen as
bureaucracy before that.

## Related Concepts

- [Managed Services](/09-cloud-architecture/managed-services.md) — the total cost comparison.
- [Serverless](/09-cloud-architecture/serverless.md) — another billing model.
- [Data Lifecycle](/07-data-architecture/data-lifecycle.md) — retention.
- [Availability Zones](/09-cloud-architecture/availability-zones.md) — transfer.

## Practical Exercise

Find the three largest items on your cloud invoice. For each one, ask: does it grow with the business or
faster than it?

Then calculate the cost per transaction for last month and for the same month a year earlier. That ratio's
trend says more than the absolute value.

## Interview Questions

- Why is cost a quality attribute in the cloud and not on your own infrastructure?
- Which metric reveals architectural degradation that total cost hides?
- Why does resource tagging precede any optimization?

## Further Reading

- Storment, J.R.; Fuller, Mike. *Cloud FinOps*. 2nd ed. O'Reilly, 2023.
- Fowler, Martin. *Cloud Cost Attribution*, 2021.
- The major providers' cost best practices documentation.

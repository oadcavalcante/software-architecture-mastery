---
id: cost-management
title: Cost Management
sidebar_position: 16
description: Cost is an architectural quality attribute — and the only one whoever decides budgets understands without translation.
doc_type: concept
level: 7
difficulty: advanced
status: complete
objective: >
  By the end, the reader treats cost as a design constraint, measures an economic unit and
  attributes cost to whoever can reduce it.
prerequisites: [risk-management]
related: [risk-management, technical-strategy-leadership, measuring-architecture-outcomes]
canonical_for: []
translated_from_version: 2
last_reviewed: 2026-08-31
---

# Cost Management

## Overview

Cost is an architectural quality attribute, at the same level as latency and availability. It is
frequently treated as someone else's concern, and that delegation is what produces systems that work
well and cost more than the revenue they generate.

```text
architectural decision       effect on cost
a cache                      cuts database reads, adds memory
a multi-region replica       multiplies infrastructure
data retention               grows linearly and forever
service granularity          each service has a fixed operating cost
data format                  volume × cost per byte, across the whole chain
```

None of those decisions is made by the finance department. All of them affect the bill, and most are
made without the effect being calculated.

## Problem

Two patterns.

**Cost invisible at the decision.** The architecture is chosen on technical criteria, and the cost
shows up on the invoice months later — when changing it is expensive. It is the same dynamic as in the
[streaming case study](/21-case-studies/video-streaming.md), where 96% of the cost was outside the
data center and the engineering effort was in the wrong place.

**Aggregate cost with no attribution.** The organization knows it spends $6 million a year on cloud
and doesn't know how much each system, each team or each transaction consumes. With no attribution,
nobody can reduce anything — because the information doesn't reach whoever makes the decision that
generates the cost.

```text
aggregate cost    nobody acts
cost per team     the team acts
cost per
  transaction     the product decision changes
```

## Core Concepts

### The economic unit is the number that matters

```text
total cost           grows with the business; tells you nothing
cost per unit        cost per order, per active user,
                     per gigabyte delivered, per transaction
```

The economic unit separates healthy growth from inefficiency. A total cost that grows 40% with a
volume that grew 60% is an improvement; the same growth with flat volume is a problem.

Choosing the right unit is the part that requires judgment: it has to be something the business
recognizes and engineering influences.

### Attribute the cost to whoever can reduce it

```text
a single invoice       nobody has an incentive
per team               the team sees it and acts
per service            the architectural decision has a visible
                       consequence
```

Attribution is the highest-return intervention in cost management, and it is infrastructural: it
requires consistent resource tagging, which is tedious to implement and transformative to operate.

The effect observed repeatedly: teams that start seeing their own cost cut it by between 20% and 40%
in the first months, with no directive at all — just by removing what was invisible waste.

### Cost enters the decision, not after it

```text
"option A costs around $8k/month; B, $22k/month.
 B has 30% better latency. The requirement is 200 ms, and A
 delivers 180 ms."
```

That is an architectural decision with complete information. Without the number, it is made on
technical preference and the cost shows up later.

Including a cost estimate in every significant architectural proposal is a cheap and rare practice.
See [ADRs](/18-architecture-decisions/what-is-an-adr).

### The human operating cost is the largest and the least counted

```text
infrastructure   is on the invoice, it is visible
people           is larger, and appears on no system's bill
```

A component that consumes half an engineer in operations costs more than most infrastructure line
items, and that comparison is almost never made. See
[managed vs. self-hosted](/20-trade-offs/managed-vs-self-hosted.md) and
[build vs. buy](/20-trade-offs/build-vs-buy.md).

Bringing personnel cost onto the same table as the invoice changes conclusions frequently.

### Cost has a curve, and it is rarely linear

```text
storage           grows and does not shrink; retention is perpetual debt
transfer          grows with use, and costs more between regions
per-unit
  licensing       grows with success
idle capacity     costs the same, used or not
```

The first item deserves emphasis: a retention decision made today generates cost every month,
forever, and nobody revisits it. Retention is the cost line that grows most silently.

### Optimizing cost is like optimizing performance

The same method applies, and the same error gets made:

```text
without measuring   you optimize what is known, not what weighs
with measurement    the distribution is usually very uneven
```

In almost every organization, a small fraction of the components accounts for most of the cost.
Optimizing the rest is wasted effort with the appearance of rigor. See
[performance vs. maintainability](/20-trade-offs/performance-vs-maintainability.md).

### Not every cost should be reduced

```text
cost that buys reliability in a critical system    should stay
cost of idle capacity for a predictable peak       should stay
cost of a managed service that frees people up     frequently
                                                   should stay
```

A cost reduction that increases risk or consumes engineering capacity can be negative on balance.
Declaring what will **not** be optimized is part of the management.

## Mental Model

**Cost is a design attribute, measured by an economic unit and attributed to whoever decides.**
With no attribution, nobody acts.

## When to Use

- As a criterion in every significant architectural decision.
- With attribution per team and per service.
- Measured by an economic unit, not as a total.

## When Not to Use

**As someone else's concern.**

**As an aggregate total**, with no attribution.

**Without including personnel cost.**

**Optimizing without measuring** the distribution.

**Reducing indiscriminately**, including what buys reliability.

## Alternatives

- **A budget per team** — each gets a ceiling and decides within it; simple and effective.
- **Cost as a fitness function** — an automated check that alerts when cost per unit exceeds a
  limit. See [fitness functions](/23-architecture-leadership/fitness-functions.md).
- **A periodic review of the largest line items** — attacking the 20% that account for 80%.
- **Not managing it** — legitimate as long as the cost is irrelevant against revenue.

The last deserves a note: managing cost has a cost of its own, and in organizations where the bill is
small against the margin, the attribution effort doesn't pay off.

## Trade-offs

| Cost as a design constraint | Optimize later |
|---|---|
| An informed decision | No friction in the decision |
| Requires estimating | Expensive change later |

| Detailed attribution | An aggregate invoice |
|---|---|
| Teams act | No implementation cost |
| Requires consistent tagging | Nobody acts |

## Failure Modes

**Cost invisible at the decision.** It shows up when changing is expensive.

**No attribution.** Information in the wrong place.

**Personnel cost ignored.** Wrong comparisons.

**Optimization with no measurement.** Effort in the wrong place.

**Infinite retention.** Perpetual debt taken on with no decision.

**A reduction that increases risk.** Negative on balance.

## Common Mistakes

**Not estimating cost** in architectural proposals. A proposal with no order of magnitude for the operating cost cannot be compared with the alternatives or approved by whoever pays.

**Comparing invoice with invoice**, without people. The cheapest option in infrastructure tends to be the most expensive in on-call and maintenance, and the comparison that ignores that chooses wrong.

**Not measuring the economic unit.** Total cost goes up when the company grows. Cost per order or per user is what distinguishes growth from waste.

**Not revisiting retention decisions.** "Keep everything forever" is a growing-cost decision made once and never re-examined.

**Treating every reduction as a gain.** Cutting cost at the expense of reliability or delivery speed transfers the expense to another line, where it isn't measured.

## Real-World Example

A technology company with 200 engineers spent $8.8 million a year on cloud, growing 31% a year against
revenue growth of 18%. The board asked for a 25% reduction.

The diagnosis started with attribution, which did not exist: the invoice arrived aggregated, and
nobody knew how much each system consumed.

**Consistent tagging** of every resource, by service and by team, implemented in seven weeks. The
result was immediate and unforeseen: the tagging revealed that **19% of the resources belonged to no
known system** — leftovers from experiments, forgotten environments, replicas from completed
migrations.

Those 19% were shut down in two waves, with a week of observation. Two complaints came in; the rest
was pure waste.

**Dashboards per team**, with the month's cost and the trend, with no target attached. Just visible.

Over the following three months, with no directive at all, the teams cut an additional 16% — sizing
instances correctly, adjusting log retention, shutting down test environments outside working hours.

**An economic unit defined**: cost per transaction processed. It came to be tracked monthly and broken
down by component.

The breakdown revealed the expected uneven distribution:

```text
application log storage                    31% of the cost
transfer between regions                    18%
idle capacity outside peak                  14%
the remaining 47 services                   37%
```

The application logs at 31% were the finding nobody expected: 400-day retention in hot storage,
defined in 2019 out of caution and never revisited. The review, done with security and compliance,
established 30 days hot and 400 cold.

```text
savings from that single change    $2.0 million/year
effort                             3 weeks
```

**A cost estimate in ADRs** became mandatory for proposals with an effect above $4k/month.

**An automated check** on cost per unit, with an alert when it grows more than 15% in a month with no
corresponding volume growth.

Results after 14 months:

```text
total cost                      from $8.8M to $5.8M (-34%)
cost per transaction            -47%
transaction volume              +22%
resources with no owner          0
architectural proposals with
  a cost estimate               100% above the threshold
```

The detail the team highlights: the highest-return intervention was no technical optimization at all —
it was making cost visible per team. The 16% the teams cut on their own, with no target and no
directive, came purely from showing the number to whoever could act on it.

And the application log line is the example of the pattern that repeats: a retention decision made
once, out of caution, costing almost $2 million a year five years later, without anyone having
revisited it.

## Related Concepts

- [Risk Management](/23-architecture-leadership/risk-management.md).
- [Cost vs. Reliability](/20-trade-offs/cost-vs-reliability.md).
- [Managed vs. Self-Hosted](/20-trade-offs/managed-vs-self-hosted.md).
- [Cost Architecture](/09-cloud-architecture/cost-architecture.md).

## Practical Exercise

Find out how much your system costs per month and divide it by the number of transactions it
processes.

Then ask how many people in the organization know that number. The answer usually explains why it
never improves.

## Interview Questions

- Why does an economic unit tell you more than total cost?
- Why does attributing cost per team reduce cost with no directive at all?
- Why are retention decisions the line that grows most silently?

## Further Reading

- Storment, J.R.; Fuller, Mike. *Cloud FinOps*. 2nd ed. O'Reilly, 2023.
- Hohpe, Gregor. *Cloud Strategy*. Architect Elevator, 2020.
- Beyer, Betsy et al. *Site Reliability Engineering*. O'Reilly, 2016.

---
id: slo
title: SLO
sidebar_position: 11
description: The agreed target — and the error budget, which turns reliability into an operational decision.
doc_type: concept
level: 5
difficulty: advanced
status: complete
objective: >
  By the end, the reader defines SLOs with the business and uses the error budget to
  decide between shipping and stabilizing.
prerequisites: [sli]
related: [sli, sla, availability-metrics]
canonical_for: []
translated_from_version: 1
last_reviewed: 2026-08-31
---

# SLO

## Overview

An SLO — service level objective — is the **target** for an [SLI](/12-reliability/sli.md): "99.9% of
checkout requests served in under 4 seconds, measured over 28 days".

It is the decision missing from most systems. With no target, "reliable" is an opinion, and every incident
looks equally serious.

And the SLO brings along the mechanism that makes it operational: the **error budget** — the amount of
failure the target permits. It turns reliability from an aspiration into a number that gets spent.

## Problem

With no defined target, two bad dynamics appear.

**Every incident is urgent.** There is no criterion to distinguish what requires interrupting the roadmap
from what can wait. The team reacts to everything, and the roadmap never advances.

**Or nothing is.** With no number, reliability competes with features without an argument of its own, and
always loses.

The SLO resolves both by giving a limit: above it, the system is good enough and the work goes to product;
below it, reliability has priority — and that was agreed beforehand, not negotiated during the crisis.

## Core Concepts

### The error budget is the mechanism

```text
an SLO of 99.9% over 28 days
  → 0.1% of failure permitted
  → around 40 minutes of unavailability in the period
  → that is the budget
```

The budget is meant to be **spent**. A system that stays at 99.99% when the target is 99.9% is
over-investing in reliability — resources that could be in product.

And the budget's consumption becomes an operational rule:

```text
budget remaining > 50%     → risk released, deploy frequently
budget between 10% and 50% → caution, review risky changes
budget exhausted           → freeze features, prioritize stability
```

That is the concept's most important practical contribution: a rule agreed in advance about when to stop
shipping and start fixing — which avoids the political discussion during the incident.

### The target comes from the business, with the cost on the table

Each additional nine costs disproportionately more:

```text
99%       3.7 days/year of unavailability   a simple architecture
99.9%     8.8 hours/year                    redundancy, automation
99.99%    53 minutes/year                   multi-zone, automated failover
99.999%   5 minutes/year                    multi-region, dedicated engineering
```

The correct conversation is not "we want the maximum". It is: "going from 99.9% to 99.99% costs X per year;
is the unavailability avoided worth Y?".

And there is a ceiling engineering does not control: **a system cannot be more available than its
synchronous dependencies**. Promising 99.99% while depending on an external service at 99.9% is impossible.

### One hundred percent is the wrong target

Chasing zero failure is expensive, impossible and counterproductive.

Impossible because dependencies fail — including the cloud provider, the user's network, DNS.

Counterproductive because the marginal effort to eliminate the last fraction of failure exceeds any value
delivered, and because an unreachable target stops guiding decisions — if it is never reached, the budget
never informs anything.

And there is a perverse effect: if the user experiences 99.9% because of their own network, raising the
service from 99.9% to 99.99% changes nothing they perceive.

### The window matters as much as the number

```text
99.9% over 24 hours   → 86 seconds of budget. One incident blows it.
99.9% over 28 days    → 40 minutes. It absorbs a medium incident.
99.9% over 90 days    → 2 hours. Too loose to react.
```

Too short a window makes the budget oscillate and lose signal value. Too long a one hides recent
degradation.

Twenty-eight days is the usual choice: it absorbs weekly variation and reacts within a useful time frame.

### Burn rate is the useful alert

Alerting when the budget runs out warns too late. The alert that works is about the **speed** at which it
is being consumed:

```text
burning 1× the expected   normal
burning 6×                the month's budget runs out in 5 days
burning 36×               it runs out in 20 hours — page somebody now
```

That replaces the threshold alert — "error rate above 1%" — which fires on irrelevant spikes and does not
fire on slow, sustained degradation.

And it allows graduating the response: high and fast burn wakes somebody; moderate and prolonged burn
becomes a prioritized task.

### An SLO is not an SLA

See [SLA](/12-reliability/sla.md). In short:

```text
SLO  an internal target, with no penalty, ambitious
SLA  a commitment to the customer, with a penalty, conservative
```

The SLO should be **stricter** than the SLA, with margin. If the two are equal, any miss of the target is
already a breach of contract.

## Mental Model

**The SLO defines how much failure is acceptable, and the budget is that amount in the form of a
balance.** It exists to be spent, not to be preserved.

## When to Use

- There are critical journeys with a defined [SLI](/12-reliability/sli.md).
- You need to decide between shipping and stabilizing.
- There is a contractual commitment to sustain.
- The reliability investment needs justification.
- Several teams need a common priority criterion.

## When Not to Use

**With no SLI that measures the experience.**

**One hundred percent as the target.**

**Defined by engineering alone.** It is a business decision.

**Promising more than the dependencies allow.**

**With no agreed rule** about what to do when the budget runs out. Then it becomes a decorative number.

**Too short a window.** The budget oscillates and loses signal.

## Alternatives

- **A threshold alert** — simpler, fires on noise and misses slow degradation.
- **Incident tracking** — count and duration, with no target. It describes the past, it does not guide a
  decision.
- **An SLO per service class** — different targets for journeys of different criticality. Frequently the
  right design.

## Trade-offs

| A strict SLO | A loose one |
|---|---|
| Less failure tolerated | More |
| High cost | Low |
| Frequent freezes | Rare |
| Little margin for risk | Plenty |

| A short window | A long one |
|---|---|
| Reacts fast | Absorbs variation |
| Oscillates | Stable |
| One incident blows it | Hides degradation |

## Failure Modes

**A budget with no consequence.** It runs out and nothing changes.

**An unreachable target.** It loses its guiding value.

**Too loose a target.** It is never missed, and real degradation does not show.

**Defined without the business.** Nobody respects the freeze.

**Equal to the SLA.** With no margin for error.

**An alert only on exhaustion.** It warns when there is nothing left to do.

**Too many SLOs.** Twenty targets nobody tracks.

## Common Mistakes

**Chasing one hundred percent.**

**Not agreeing on the freeze rule beforehand.**

**Alerting on a threshold instead of on burn rate.**

**Defining the target without checking the dependencies.**

**Not revising the target** when the business changes.

**Treating the budget as something to preserve.**

## Real-World Example

A logistics platform had a recurring tension between product and engineering: product asked for delivery
speed; engineering said the system was unstable.

Neither side had a number, and the discussion repeated every quarter with no resolution.

Introducing SLOs changed the format:

**Three journeys with an SLI and an SLO**, defined with the board:

```text
create a shipment      99.95% over 28 days, latency < 2s
track a shipment       99.9%,  latency < 1s
management report      99.0%,  latency < 30s
```

The targets were derived from impact: an hour without creating shipments halts the customers' operation;
tracking unavailable generates support calls; a late report is an inconvenience.

**An agreed budget rule**, signed by the board: an exhausted budget means freezing features for that
journey until 25% recovers.

**A burn rate alert**, at two levels: burn above 14 times wakes the on-call; above 3 times for six hours
generates a prioritized task.

What happened in the first six months:

**Tracking blew the budget twice.** The freeze happened — with no discussion, because the rule was agreed.
Both causes were the same: an external geolocation dependency with no circuit breaker. Once fixed, the
journey stabilized.

**Shipment creation stayed at 99.98%** — well above the target. That revealed over-investment: there was
redundancy and checking the target did not require. Part of the effort was reallocated.

**The management report stayed at 98.2%**, below the target — and the analysis showed nobody cared. The
target was renegotiated to 97%, and the team stopped treating failures there as urgent.

What the team learned: the most valuable effect was not technical. It was the quarterly discussion between
product and engineering ceasing to exist, because an agreed number came to answer the question.

And the third case — lowering a target — was the hardest to accept culturally, and the one that freed the
most capacity.

## Related Concepts

- [SLI](/12-reliability/sli.md) — what is measured.
- [SLA](/12-reliability/sla.md) — the external commitment.
- [Availability Metrics](/12-reliability/availability-metrics.md).
- [Chaos Engineering](/12-reliability/chaos-engineering.md) — it verifies whether the target holds.

## Practical Exercise

For your product's most critical journey, propose an SLO and calculate the error budget in minutes per
month.

Then ask the business: if we spend that entire budget in one month, is that acceptable? The answer
calibrates the target better than any technical discussion.

## Interview Questions

- Why does the error budget exist to be spent?
- Why is alerting on burn rate better than on a threshold?
- Why is one hundred percent the wrong target?

## Further Reading

- Beyer, Betsy et al. *Site Reliability Engineering*. O'Reilly, 2016 — chapters 3 and 4.
- Beyer, Betsy et al. *The Site Reliability Workbook*. O'Reilly, 2018 — chapters 2 to 5.
- Google. *SRE Workbook: Alerting on SLOs*.

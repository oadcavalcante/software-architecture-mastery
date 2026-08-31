---
id: cost-vs-reliability
title: Cost vs. Reliability
sidebar_position: 4
description: Each additional nine costs about an order of magnitude — and the last one almost never pays off.
doc_type: tradeoff
level: 5
difficulty: advanced
status: complete
objective: >
  By the end, the reader sets the reliability target from the cost of unavailability to the
  business, and not from aspiration.
prerequisites: [reliability-basics]
related: [consistency-vs-availability, managed-vs-self-hosted, speed-vs-quality]
canonical_for: []
translated_from_version: 1
last_reviewed: 2026-08-31
---

# Cost vs. Reliability

## Overview

Reliability has a price, and the price is not linear. Each additional nine of availability costs
approximately **an order of magnitude** more than the previous one.

```text
99%       3.65 days of unavailability per year   one instance, backups
99.9%     8.76 hours                             redundancy, monitoring, on-call
99.95%    4.38 hours                             multi-zone, recovery automation
99.99%    52.6 minutes                           multi-region, chaos testing, dedicated team
99.999%   5.26 minutes                           rare outside telecom and finance
```

```text
real axis   does the cost of a minute of unavailability, for this system,
            justify the cost of avoiding that minute?
```

The question is arithmetic, and is almost never asked. The target is chosen by aspiration — "we
want high availability" — and the cost shows up later, distributed across infrastructure,
on-call and complexity.

## Problem

Two symmetric failures.

**Uniform reliability.** All systems on the same target, regardless of what each one's outage
costs.

```text
checkout system            an outage costs ~$18,000/hour
internal admin dashboard   an outage costs ~$0 for 2 hours
same 99.95% target         same infrastructure and on-call cost
```

The dashboard consumes multi-zone redundancy, night on-call and paging alarms that wake people
up — for a system whose unavailability nobody notices before nine in the morning.

**A target with no backing.** The number in the contract or in the slide deck does not correspond
to what the architecture delivers, and nobody checked.

```text
declared target   99.95%
real topology     three instances in the same zone
```

See [deployment diagrams](/17-architecture-documentation/deployment-diagrams.md) — checking the
correspondence between target and topology is cheap and rarely done.

## Core Concepts

### The target derives from the cost of unavailability

```text
revenue lost per hour down
contractual penalty per minute beyond the agreement
cost of recovery and manual rework
reputation effect, when estimable
opportunity cost of the team during the incident
```

With that number, the target is derived, not chosen:

```text
cost of 1 h down    ~$18,000
99.9%  → 8.8 h/year → ~$158,000 of expected loss
99.95% → 4.4 h/year → ~$79,000
delta of loss avoided     ~$79,000/year
cost of raising the target ~$36,000/year
                          → worth it
```

And the same math, one nine higher:

```text
99.99% → 0.9 h/year → ~$15,800
delta                ~$63,000/year
cost of raising      ~$180,000/year
                     → not worth it
```

### The cost has three components, and the third is forgotten

```text
infrastructure   replicas, regions, idle capacity
engineering      automation, failure testing, tooling
operations       on-call, incident response, cognitive load
```

The third weighs the most and is the least budgeted. A 99.99% target implies response in
minutes, which implies on-call with a real rotation — and on-call has a financial cost, a
turnover cost and an attention cost.

See [platform engineering](/14-devops-and-platform/platform-engineering.md).

### Proportional reliability per component

Not every component of a system needs the same target:

```text
payment authorization    99.99%   without it, there is no sale
catalog                  99.9%    cache absorbs a short outage
recommendation           99%      degrades to a default list
reports                  99%      can wait
```

Designed degradation is what makes this possible: the system keeps selling with recommendations
down. See
[graceful degradation](/12-reliability/graceful-degradation.md).

Applying the most critical component's target to all of them multiplies the cost with no
proportional effect.

### The nine you cannot buy with money

Above a certain point, reliability stops being a matter of redundancy:

```text
99.9%     redundancy solves it
99.95%    redundancy + recovery automation
99.99%    + eliminating entire classes of human error
99.999%   + the change process becomes the bottleneck
```

At the last tier, the main cause of unavailability is **change** — deployments, configurations,
migrations. Getting there requires reducing the frequency of change or making it extremely safe,
and both have a cost in delivery speed.

See [speed vs. quality](/20-trade-offs/speed-vs-quality.md).

### Error budget

A useful inversion: instead of chasing the maximum, define how much unavailability is acceptable
and **spend** that budget.

```text
target 99.9%           43 min of unavailability per month
consumed in the month   12 min
balance                 31 min → there is room to risk changes
balance exhausted       → freeze changes until the next month
```

This turns reliability from an aspiration into a manageable resource, and resolves the tension
between shipping and stabilizing with a rule instead of with a discussion.

See [reliability](/12-reliability/reliability-basics.md).

### Signs of the wrong choice

```text
paying too much
  the same target for systems of different criticality
  multi-region redundancy in an internal system
  night on-call for a service nobody uses at night
  error budget never consumed — left over every month

paying too little
  incidents costing more than the investment in avoiding them
  manual recovery in a critical system
  declared target incompatible with the real topology
  error budget blown frequently
```

The "budget never consumed" sign is the most ignored: a system that goes months without spending
its budget is more reliable than it needs to be, and paying for it.

### Cost of changing your mind

```text
low → high   expensive and slow: requires changing topology, automation and operations
high → low   cheap to do, hard to approve
```

The asymmetry is organizational, not technical. Reducing a reliability target is technically
simple and politically difficult — nobody wants to sign off on the reduction.

That favors **starting at the target derived from the cost**, and not above it "for safety": the
surplus becomes permanent.

## Mental Model

**Derive the target from the cost of the outage.** Each nine costs ten times the previous one,
and the last one almost never pays for itself.

## When to Use

Invest in reliability when:

- The cost of unavailability exceeds the cost of avoiding it, with numbers.
- There is a contractual penalty or a regulatory requirement.
- Recovery would be manual or slow.
- The component is indispensable to the business's operation.

Accept less reliability when:

- The outage is absorbed by designed degradation.
- Usage is concentrated in business hours.
- The system is internal and waiting is tolerable.
- The error budget is consistently left over.

## When Not to Use

**With a uniform target** for all systems.

**With a target chosen by aspiration**, without the cost of the outage.

**Without checking** whether the topology delivers the declared target.

**Without counting the operational cost** — on-call is the most expensive component.

**Chasing nines** above what the business pays for.

## Alternatives

- **Designed degradation** — keeps the operation running with part of it down; frequently cheaper
  than redundancy.
- **Fast recovery instead of prevention** — reducing recovery time can be cheaper than reducing
  failure frequency.
- **Managed service** — transfers part of the operational cost. See
  [managed vs. self-hosted](/20-trade-offs/managed-vs-self-hosted.md).
- **Target per component** — instead of per system.

The second deserves emphasis: availability is a function of failure frequency **and** duration,
and reducing the duration is usually the cheap half of the math.

## Trade-offs

| High reliability | Low cost |
|---|---|
| Less loss per outage | Less infrastructure and on-call |
| Operational complexity | Higher risk of loss |
| Slower change | Freer change |

| Prevent failure | Recover fast |
|---|---|
| Fewer incidents | Short incidents |
| Expensive, with a ceiling | Cheaper per point gained |
| Redundancy | Automation and observability |

## Failure Modes

**Uniform target.** Irrelevant systems at critical-system cost.

**Target with no backing.** Declared and not delivered by the topology.

**Operational cost not budgeted.** On-call shows up later.

**Error budget left over.** Reliability paid for and not used.

**Chasing the nine above what the business pays for.**

**Target reduction blocked politically.** The surplus becomes permanent.

## Common Mistakes

**Choosing the target before computing the cost of the outage.**

**Ignoring degradation** as an alternative to redundancy.

**Not separating by component.**

**Not measuring the topology against the target.**

**Investing only in prevention**, ignoring recovery time.

## Real-World Example

A logistics company had 52 systems, all with a 99.95% target and 24×7 on-call, set three years
earlier as a single policy.

A review computed, system by system, the cost of an hour of unavailability:

```text
cost range per hour down            systems
above $10,000                         4
$1,000 to $10,000                     9
$100 to $1,000                       14
below $100                           25
```

Twenty-five systems — nearly half — had an unavailability cost below $100 per hour and consumed
multi-zone redundancy, paging alarms and night on-call.

The aggregate cost of keeping those 25 at the 99.95% target:

```text
redundant infrastructure          ~$220,000/year
attributable on-call              ~$180,000/year
engineering effort in
  automation and failure testing  ~2.5 full-time people
```

And the error budget of those 25 systems was left over every month, without exception, for two
years.

The reclassification:

**Four criticality tiers**, derived from the cost per hour, not from judgment:

```text
critical   99.99%   4 systems   multi-region, 24×7 on-call, chaos testing
high       99.9%    9 systems   multi-zone, 24×7 on-call
medium     99.5%   14 systems   multi-zone, extended-hours on-call
low        99%     25 systems   single zone, business-hours on-call
```

**Designed degradation** in the high-tier systems, which allowed keeping the effect for the user
with less redundancy — two of them started serving cached data with an age indication during
unavailability of the source.

**Investment redirected to recovery time** in the four critical ones, instead of to more
redundancy: recovery automation, tested restores and regional failure drills.

**Error budget published per system**, with automatic change freezes when exhausted.

**Automated verification** that the topology matches the target — a scaling group with a single
subnet in a high or critical tier system fails the pipeline.

Results after 15 months:

```text
infrastructure cost                           -34%
night on-call hours                           -61%
turnover in the operations team               from 22% to 9% per year
availability of the 4 critical systems        from 99.94% to 99.99%
incidents with revenue impact                 -40%
error budget consumed in the 25 low-tier
  systems                                     average of 38% per month
```

The data point the team highlights most: the critical systems became **more** reliable after the
change. The operations team's attention, previously spread across 52 systems with the same
alarm, came to be concentrated on the four that mattered.

The lesson that stuck: the single 99.95% policy had been created with good intentions — to keep
anyone from deciding badly. It did not prevent a bad decision; it prevented any decision, and the
cost showed up as useless redundancy and a worn-out on-call rotation.

## Related Concepts

- [Reliability](/12-reliability/reliability-basics.md) — the error budget.
- [Graceful Degradation](/12-reliability/graceful-degradation.md) — the cheap alternative.
- [Managed vs. Self-Hosted](/20-trade-offs/managed-vs-self-hosted.md).
- [Deployment Diagrams](/17-architecture-documentation/deployment-diagrams.md) — the backing
  check.

## Practical Exercise

Estimate the cost of an hour of unavailability for three systems in your context and compare it
with each one's reliability target.

If the three have the same target and costs of different orders of magnitude, two are at the
wrong tier.

## Interview Questions

- Why does each additional nine cost approximately an order of magnitude?
- Why is an error budget left over every month a sign of a problem?
- Why is reducing recovery time usually cheaper than reducing failure frequency?

## Further Reading

- Beyer, Betsy et al. *Site Reliability Engineering*. O'Reilly, 2016.
- Beyer, Betsy et al. *The Site Reliability Workbook*. O'Reilly, 2018.
- Allspaw, John. *Blameless PostMortems*. Etsy, 2012.

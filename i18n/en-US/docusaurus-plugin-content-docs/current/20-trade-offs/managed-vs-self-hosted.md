---
id: managed-vs-self-hosted
title: Managed vs. Self-Hosted
sidebar_position: 13
description: The math changes when the cost of on-call enters it — and it almost never does.
doc_type: tradeoff
level: 5
difficulty: intermediate
status: complete
objective: >
  By the end, the reader compares a managed service and running it yourself with the
  operational effort cost included, and knows when the price difference is justified.
prerequisites: [managed-services]
related: [build-vs-buy, cost-vs-reliability, cloud-native-vs-portable]
canonical_for: []
translated_from_version: 2
last_reviewed: 2026-08-31
---

# Managed vs. Self-Hosted

## Overview

The pair is the infrastructure version of [build vs. buy](/20-trade-offs/build-vs-buy.md), and it
has the same bias: the cost of your own work is systematically omitted from the comparison.

```text
real axis   is the premium charged by the managed service larger or smaller
            than the real cost of operating that thing with our team?
```

The premium is visible — it is on the invoice. The cost of operating is not: it is distributed
across on-call, upgrades, incidents, learning and diverted attention.

A useful reference number: managed services usually charge between 2× and 4× the cost of
equivalent infrastructure. The question is whether the operational effort avoided is worth that
difference — and, for small teams, it almost always is.

## Problem

The typical comparison compares different halves:

```text
managed      $840/month, on the invoice
self-hosted  $220/month of machines
```

What is missing from the right-hand side:

```text
initial setup and tuning
version and security upgrades
backups, and the restore test
monitoring, alarms and dashboards
on-call, including nights and weekends
incident response, with the time it consumes the next day
learning, and the cost of relearning when whoever knew it leaves
```

Converted into effort, this usually lands between 0.2 and 1 full-time person, depending on the
component — which at market rates exceeds the premium in most cases.

The symmetric error is adopting managed without evaluating limits: quotas, the absence of
necessary configurations, cost that grows non-linearly with volume, and difficulty of exit.

## Core Concepts

### Operational effort, measured

The honest math needs the number, not the impression:

```text
hours per month in routine maintenance
hours per incident × frequency
hours in upgrades per year
attributable on-call cost
initial learning time, amortized
```

Teams doing this measurement for the first time are usually surprised: components that "give no
trouble" consume 10 to 30 hours per month once the time is accounted for.

See [cost vs. reliability](/20-trade-offs/cost-vs-reliability.md).

### The premium buys reliability you would not build

Mature managed services make available, with no internal project, things a small team does not
build — several of them requiring configuration, as the canonical document records:

```text
automatic node recovery
continuous backup with point-in-time restore
upgrades with no downtime
multi-zone replication configured correctly
monitoring and alarms ready
a specialist team 24×7 behind it
```

Reproducing that in-house is a project, not a configuration. Comparing the price without
comparing what is delivered distorts the decision.

### When self-hosting wins

```text
scale large enough for the premium to exceed a dedicated team
a requirement the managed service does not meet — version, extension, configuration
a regulatory constraint on location or control
the skill already exists and is used for several components
the component is central to the product and control is strategic
```

The first case is real and has a threshold: above a certain volume, the 2× to 4× premium pays for
several engineers. But the threshold is higher than intuition suggests, and most organizations
never get there.

### The exit cost differs

```text
proprietary managed   proprietary interfaces; leaving requires rewriting
compatible managed    open protocol; leaving is a data migration
self-hosted           no exit cost, with a permanent operating cost
```

The middle distinction is important and frequently ignored: a managed service that speaks a
standard protocol has a much lower exit cost than one with a proprietary interface — even from
the same vendor.

See [vendor lock-in](/09-cloud-architecture/vendor-lock-in.md) and
[cloud-native vs. portable](/20-trade-offs/cloud-native-vs-portable.md).

### Cognitive load is a finite resource

```text
each self-hosted component consumes the team's attention
that attention is not available for the product
the effect is invisible and cumulative
```

A team of 8 people operating five infrastructure components has a significant fraction of its
capacity outside the product — and it is a fraction nobody budgets.

See [platform engineering](/14-devops-and-platform/platform-engineering.md).

### Signs of the wrong choice

```text
self-hosted and should not have
  recurring incidents with the component
  upgrades postponed out of fear
  restore never tested
  knowledge in one person only
  on-call worn out by something that is not the product
  attributable headcount cost higher than the premium

managed and should not have
  invoice growing faster than usage
  quotas or limits blocking the product
  a necessary configuration unavailable
  cost per unit far above that of operating it, at high scale
  a critical dependency with no exit plan
```

The "restore never tested" sign is the most serious in the first group: it indicates that the
backup is an assumption.

### Cost of changing your mind

```text
managed → self-hosted   moderate: the requirements are known,
                        and the migration is one of data
self-hosted → managed   moderate and frequently easier
```

The symmetry here is greater than in other pairs, which reduces the weight of reversibility in
the decision — **except** when the managed service is proprietary, in which case leaving requires
a rewrite and the asymmetry returns.

That gives a rule of thumb: prefer managed services with a standard protocol when they exist, and
the cost of changing your mind stops being a relevant factor.

## Mental Model

**Add up the operational effort in money.** The premium on the invoice is visible; the cost of
operating is distributed — and larger than it looks.

## When to Use

Prefer **managed** when:

- The team is small or does not have the skill.
- The component is not a product differentiator.
- The measured operational effort exceeds the premium.
- The reliability delivered is higher than what you would build.
- The protocol is standard, reducing the exit cost.

Prefer **self-hosted** when:

- Scale makes the premium larger than a dedicated team.
- There is a technical or regulatory requirement the managed service does not meet.
- The skill already exists and is used for several components.
- The component is central and control is strategic.

## When Not to Use

**Comparing the invoice with the price of machines.**

**Without measuring the operational effort.**

**Self-hosting without testing restores.**

**Adopting a proprietary managed service** for a critical dependency, with no exit plan.

**Without checking quotas and limits** before committing the product.

## Alternatives

- **Managed with a standard protocol** — reduces the exit cost to nearly zero.
- **Self-hosted on an internal platform** — if the platform exists, the marginal cost of the next
  component is lower.
- **Hybrid** — managed in production, self-hosted in development environments.
- **Managed by an independent third party** — neither the cloud provider nor you.

The third reduces cost significantly without affecting reliability where it matters.

## Trade-offs

| Managed | Self-hosted |
|---|---|
| No operational effort | No premium |
| Reliability ready | Full control |
| Vendor's limits | No limits |
| Predictable and growing cost | Headcount cost |
| Possible lock-in | Portable |

| Standard protocol | Proprietary |
|---|---|
| Cheap exit | Deeper integration |
| Fewer exclusive features | More capability |
| Reversible | Rewrite to leave |

## Failure Modes

**Operational effort omitted.** The comparison favors self-hosting by construction.

**Restore not tested.** The backup is a hypothesis.

**Knowledge in one person.** They leave, and the component is orphaned.

**Quotas discovered late.** The product stalls.

**Non-linear managed cost.** Grows faster than usage.

**Critical proprietary managed service.** No exit plan.

## Common Mistakes

**Not measuring hours spent** on the component.

**Comparing prices without comparing what is delivered.**

**Ignoring cognitive load** as a cost.

**Not checking whether a standard-protocol version exists.**

**Not re-evaluating when scale changes** — the threshold exists in both directions.

## Real-World Example

A logistics company with 26 engineers operated five infrastructure components in-house: a
relational database, a cache, messaging, a search engine and container orchestration.

The original decision, from 2020, had been made on cost: the equivalent managed services would
cost about 3.1× the price of the machines.

A measurement of operational effort, done in 2024 over three months with time logging:

```text
component            hours/month   incidents/year   night on-call/year
relational database        22            6                    9
messaging                  31           11                   14
search                     18            4                    5
cache                       6            2                    2
containers                 44            9                   12
                        ———————        ————                 ————
total                     121           32                   42
```

121 hours per month is about 0.75 full-time engineer, permanently. Added to the on-call cost and
the post-incident recovery time, the estimate landed at ~1.1 people.

And the comparison redone:

```text
cost of machines                        ~$7,600/month
attributable headcount cost             ~$10,400/month
total self-hosted cost                  ~$18,000/month
cost of the equivalent managed services ~$23,600/month
```

Managed was still more expensive — but by 1.3×, not by 3.1×. And the math did not include the
cost of incidents or the diverted attention.

The decision was selective, not uniform:

**Migrated to managed**: messaging and container orchestration — the two with the highest
operational effort and no requirement the managed service did not meet. Both with a standard
protocol, which kept the exit cost low.

**Kept self-hosted**: the relational database and search. The database by scale — the volume made
the premium high enough to justify the 22 hours — and search because of a specific language
extension the available managed services did not offer. Both decisions recorded in an ADR with a
reversal condition.

**Cache migrated** because it was cheap on both sides and not worth the attention.

**Restores tested quarterly** on the two components that stayed, with the procedure executed by
someone who is not the specialist — which revealed, on the first run, that the documented
procedure was out of date.

Results after 14 months:

```text
hours/month operating infrastructure         121 → 34
incidents/year                               32 → 11
night on-call/year                           42 → 13
total cost (machines + managed + headcount)  +6%
turnover in the platform team                from 3 departures/year to 0
```

The total cost rose 6%, and the decision was still considered right: 87 hours per month went back
to the product, and the reduction in night on-call was pointed out by the team as the change with
the greatest effect on quality of work.

The point the team underlines: the 2020 comparison was not wrong in the numbers it used. It was
incomplete — it compared invoice with invoice, and the work of operating appears on neither.

## Related Concepts

- [Managed Services](/09-cloud-architecture/managed-services.md).
- [Build vs. Buy](/20-trade-offs/build-vs-buy.md) — the same axis, applied to software.
- [Cloud-Native vs. Portable](/20-trade-offs/cloud-native-vs-portable.md).
- [Platform Engineering](/14-devops-and-platform/platform-engineering.md).

## Practical Exercise

Log, for one month, the hours your team spends operating one infrastructure component —
maintenance, incidents, upgrades, on-call.

Convert it into cost and add it to the price of the machines. Compare with the equivalent managed
service.

## Interview Questions

- Why is the usual comparison between managed and self-hosted incomplete?
- Why does a managed service with a standard protocol change the reversibility analysis?
- Under what condition does self-hosting win again?

## Further Reading

- Beyer, Betsy et al. *Site Reliability Engineering*. O'Reilly, 2016.
- Skelton, Matthew; Pais, Manuel. *Team Topologies*. IT Revolution, 2019.
- Morris, Kief. *Infrastructure as Code*. 2nd ed. O'Reilly, 2020.

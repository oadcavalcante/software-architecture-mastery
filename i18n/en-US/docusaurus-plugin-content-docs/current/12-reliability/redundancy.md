---
id: redundancy
title: Redundancy
sidebar_position: 5
description: More than one of everything — and correlation, which is what nullifies redundancy.
doc_type: concept
level: 5
difficulty: intermediate
status: complete
objective: >
  By the end, the reader evaluates redundancy by the copies' real independence, not
  by their number.
prerequisites: [reliability]
related: [failover, fault-tolerance, availability-metrics]
canonical_for: []
translated_from_version: 1
last_reviewed: 2026-08-31
---

# Redundancy

## Overview

Redundancy is having more than one: more than one instance, more than one node, more than one network path,
more than one provider.

The arithmetic is attractive. Two components at 99% availability each, if **independent**, give 99.99%
combined.

The word that decides everything is the emphasized one. Correlated failures — the ones that hit every copy
at the same time — nullify redundancy, and they are far more common than the arithmetic suggests.

## Problem

The combined availability calculation presupposes independence:

```text
P(both fail) = P(A fails) × P(B fails) = 0.01 × 0.01 = 0.0001
```

That only holds if A's failure has no relation to B's. In practice, the copies share almost everything:

```text
the same code           one defect takes all of them down
the same configuration  one wrong change takes all of them down
the same deployment     one bad version takes all of them down
the same dependency     it goes down, all of them stop
the same zone           power, network, cooling
the same certificate    it expires for all of them at the same instant
```

With a shared dependency, three copies are no better than one for that class of failure.

## Core Concepts

### Correlation is the variable that matters

The question to ask about any redundancy: **what would make every copy fail together?**

The list is usually longer than expected, and it is the map of what the redundancy does not protect.

```text
protected by N copies   hardware failure, instance failure, process failure
not protected           a code defect, wrong configuration,
                        an expired certificate, a common dependency,
                        quota exhaustion, human error
```

The second column contains the most common incidents in modern systems. Redundancy resolves the first and
does not touch the second.

### The forms of redundancy

```text
active-active    every copy serves; losing one reduces capacity
active-passive   one serves; the other takes over. See failover
N+1              capacity for N, with one extra copy
N+M              tolerates M simultaneous failures
```

**Active-active** has a decisive operational advantage: the standby copy is being exercised all the time.
In a passive configuration, the standby may have been broken for months with nobody knowing.

That is the practical reason to prefer active-active when possible — not resource utilization, but the fact
that the recovery path is the normal path.

### N+1 requires absorption capacity

Having one extra copy is not enough if the remaining ones cannot take the load.

```text
3 nodes at 80% utilization
  one goes down → the remaining two need 120% → they cannot take it
3 nodes at 60%
  one goes down → the remaining two go to 90% → they can
```

See [availability zones](/09-cloud-architecture/availability-zones.md) and
[capacity planning](/11-scalability/scaling-capacity-planning.md).

The headroom is part of the redundancy. Without it, the redundancy exists on the diagram and not in
operation.

### Diversity reduces correlation, and it costs

Different copies fail for different reasons:

```text
different zones           protects against datacenter failure
different regions         against a regional disaster
different providers       against provider failure
different implementations against a software defect
```

The last is the most effective against a code defect and the most expensive — maintaining two
implementations of the same system rarely justifies itself outside safety-critical contexts.

The first three are practicable, at increasing cost. See
[multi-region](/09-cloud-architecture/multi-region.md).

### Gradual deployment is redundancy in time

Against a code defect, spatial redundancy does not help. What helps is not deploying to everything at the
same time:

```text
phased deployment   a fraction receives the new version; observe; advance
canary deployment   a small amount of traffic on the new version
fast rollback       going back in minutes
```

That protects exactly the class of failure that causes the most incidents in mature systems, and it does
not appear in discussions about redundancy — because it is not about having more copies.

### Redundancy adds failure modes

Frankness is worth it: more copies mean more things to go wrong.

**Split brain.** Two copies consider themselves primary. See
[leader election](/06-distributed-systems/leader-election.md).

**Configuration divergence.** The copies stop being identical.

**Failover failure.** The switching mechanism does not work when triggered. See
[failover](/12-reliability/failover.md).

**Diagnostic complexity.** Inconsistent behavior between copies.

Badly implemented redundancy can be less available than a single, well-operated copy.

## Mental Model

**Redundancy protects against what is independent.** The list of what is shared is the list of what it does
not resolve.

## When to Use

- Hardware or instance failure is the main threat.
- Unavailability has a relevant cost.
- Service needs to be maintained during maintenance.
- There is an agreed availability requirement.
- The component is stateless — the redundancy is cheap.

## When Not to Use

**Without checking the correlation.**

**With no absorption capacity.**

**Active-passive without exercising** the standby copy.

**Against a code defect.** There the answer is gradual deployment.

**When the cost exceeds that of the unavailability.**

**With no tested switching mechanism.**

## Alternatives

- **Fast recovery** — instead of avoiding the failure, shortening the time to resume. Frequently cheaper
  and sufficient.
- **[Graceful degradation](/12-reliability/graceful-degradation.md)** — operating with less.
- **Gradual deployment** — against the most common class of failure.
- **Simplifying** — fewer components fail less. It is the least cited alternative and frequently the
  correct one.

## Trade-offs

| More redundancy | Less |
|---|---|
| Tolerates more failures | Fewer |
| Higher cost | Lower |
| More complexity | Less |
| More failure modes of its own | Fewer |
| Idle capacity | High utilization |

| Active-active | Active-passive |
|---|---|
| The standby is exercised | It may be broken |
| All capacity in use | Idle |
| No switch to execute | A failover to test |
| Coordination necessary | Simpler |

## Failure Modes

**A correlated failure.** Every copy goes down together.

**Insufficient capacity.** The remaining ones saturate.

**A broken standby.** Never exercised.

**Split brain.**

**Configuration divergence.**

**A shared certificate or credential expiring.**

**A shared quota exhausted.** Every copy competes for the same external limit.

## Common Mistakes

**Counting copies instead of assessing independence.** Three replicas in the same rack, in the same zone or
with the same configuration dependency fail together. What protects is independence, not the number.

**Not sizing for the loss.** Redundancy with no headroom changes the failure mode: instead of going down
right away, the system survives the loss and then saturates with the redistributed load.

**Not exercising the standby.** A passive component that never receives traffic accumulates silent defects
— divergent configuration, an expired certificate, an old version.

**Ignoring shared dependencies.** DNS, authentication, the control plane and the configuration system are
common to every copy, and they take all of them down at the same time.

**Not using gradual deployment.** The most frequent cause of unavailability is change, and redundancy does
not protect against bad code propagated to every replica simultaneously.

**Adding redundancy without testing the switching mechanism.** The extra copy is only worth it if the
switch to it works. With no exercise, you pay for double the infrastructure and keep the same risk.

## Real-World Example

A payments platform had redundancy at every layer: three application instances in three zones, a database
with a synchronous replica, two gateway providers.

In eighteen months, three incidents took the whole system down. None was a hardware failure.

**An expired certificate.** The internal certificate used between services expired. Every instance stopped
simultaneously, because they shared the same certificate with the same date. Duration: 90 minutes, until
somebody identified the cause.

**A wrong configuration.** A configuration change applied to the three zones at the same time contained an
error. All three instances failed to start. The redundancy did not protect, because the change was
simultaneous.

**A code defect.** A version with a memory leak was deployed to every instance. They degraded together,
over 40 minutes.

The fixes attacked the correlation, not the quantity:

**Staggered certificates.** Different expiration dates per zone, with proximity monitoring. An expiring
certificate came to degrade one zone, not the system.

**Phased configuration.** Configuration changes came to be applied zone by zone, with observation between
them — the same treatment given to code deployment.

**Canary deployment.** 5% of the traffic on the new version for 30 minutes, with metrics compared
automatically. The next memory leak was detected with 5% impact, not 100%.

**An inventory of shared dependencies.** An explicit survey of what the three zones have in common. It
found four more items: a shared external API quota, a configuration bucket, an internal name resolution
service and a single database credential.

And a decision in the opposite direction: the proposal to add a fourth zone was refused. The analysis
showed that none of the three incidents would have been avoided by it, and the cost would be significant.

The detail the team highlights: they had redundancy to spare and correlation everywhere. The question "what
would make the three zones go down together?" had never been asked — and the answer had seven items.

## Related Concepts

- [Failover](/12-reliability/failover.md) — the switching mechanism.
- [Fault Tolerance](/12-reliability/fault-tolerance.md).
- [Availability Zones](/09-cloud-architecture/availability-zones.md).
- [Availability](/06-distributed-systems/availability.md) — the arithmetic.

## Practical Exercise

Choose a redundant component in your system and list everything the copies share — code, configuration,
certificate, dependency, quota, credential, zone.

Each item on the list is a failure the redundancy does not cover.

## Interview Questions

- Why does the combined availability arithmetic frequently not hold?
- Why is active-active preferable to active-passive, beyond utilization?
- Against which class of failure does spatial redundancy not help?

## Further Reading

- Beyer, Betsy et al. *Site Reliability Engineering*. O'Reilly, 2016.
- Nygard, Michael. *Release It!*. 2nd ed. Pragmatic Bookshelf, 2018.
- Hamilton, James. *On Designing and Deploying Internet-Scale Services*. LISA, 2007.

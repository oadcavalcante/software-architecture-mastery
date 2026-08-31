---
id: resilience
title: Resilience
sidebar_position: 4
description: Absorbing the unexpected and adapting — what distinguishes resilience from fault tolerance.
doc_type: concept
level: 5
difficulty: advanced
status: complete
objective: >
  By the end, the reader distinguishes resilience from tolerance and recognizes the
  role of people and procedures.
prerequisites: [fault-tolerance]
related: [fault-tolerance, chaos-engineering, graceful-degradation]
canonical_for: []
translated_from_version: 1
last_reviewed: 2026-08-31
---

# Resilience

## Overview

Fault tolerance deals with **anticipated** failures: you identified the failure mode and built the
response.

Resilience is the ability to absorb the **unexpected** — what nobody anticipated, the improbable
combination, the failure in an unknown mode — and adapt.

The distinction is not academic. It changes where you invest: tolerance is engineering of mechanisms;
resilience includes people, procedures, margin and the ability to learn.

## Problem

Every tolerance mechanism covers an anticipated scenario. Serious incidents almost always come from
scenarios nobody anticipated — not because the team was negligent, but because the space of possible
combinations is too large to enumerate.

A system with ten well-built tolerance mechanisms will still face the situation none of them was designed
for.

What determines the outcome at that moment is not the list of mechanisms. It is the ability to perceive,
understand, decide and act under uncertainty — which is the practical definition of resilience.

## Core Concepts

### The four capabilities

```text
anticipate   recognizing what can go wrong before it happens
monitor      perceiving what is happening now
respond      acting under uncertainty, with incomplete information
learn        turning what happened into capability
```

Fault tolerance covers mainly the first, turned into a mechanism. The other three depend on people, tools
and process — and they are what decides the outcome in the unanticipated scenario.

### Room to maneuver

A system operating at the limit has nowhere to go when something unexpected happens.

```text
with no margin   utilization at 85%, no headroom, no alternative
with margin      capacity headroom, an alternative path, a feature that can be
                 turned off, time before impact
```

Margin is what gives **options** during the incident. It costs — idle capacity, alternative paths to
maintain — and it is what separates a system that degrades from one that collapses.

See [capacity planning](/11-scalability/scaling-capacity-planning.md) and
[graceful degradation](/12-reliability/graceful-degradation.md).

### Reversibility is worth more than being right

In an unknown scenario, the ability to **undo** quickly is worth more than the ability to decide correctly
on the first attempt.

```text
rollback in 2 minutes   allows trying, observing, trying again
rollback in 2 hours     each decision is final under pressure
```

That guides the investment: reversible deployment, per-feature switches, configuration changes with no
deployment, migrations with a way back.

It is the property that most reduces incident severity, and it appears in no architecture diagram.

### People are part of the system

In an unanticipated incident, the work is human: understanding what is happening, forming hypotheses,
deciding.

What sustains that:

```text
observability            allows answering unanticipated questions
distributed knowledge    it does not depend on one specific person
sustainable on-call      an exhausted person decides worse
rehearsed procedures     they reduce the cognitive load at the wrong moment
clear authority          who decides what, with no escalation
```

See [observability](/13-observability/index.md). The difference between monitoring and observability is
exactly that: the first answers anticipated questions, the second allows formulating new ones — which is
what the unknown scenario requires.

### Learning is the capability that compounds

An incident that generates no learning will be repeated.

What turns an incident into capability:

**Analysis with no search for a culprit.** If people fear consequences, the information does not appear —
and with no honest information there is no learning.

**A focus on conditions, not on individual error.** "Why did that action seem reasonable at the moment?"
teaches more than "who made the mistake".

**Actions with an owner and a deadline.** Analyses that end in observations change nothing.

**Near misses too.** What almost went wrong carries the same information, with none of the cost.

### Resilience is not the absence of failure

A resilient system fails — and absorbs, degrades, recovers and improves.

Chasing the absence of failure leads to fragility: systems optimized for the expected case, with no margin,
with no alternatives, that work perfectly until they meet the unexpected.

See [SLO](/12-reliability/slo.md) — the error budget is the formal expression of that idea: failure is
expected and budgeted.

## Mental Model

**Tolerance covers what you anticipated; resilience covers what you did not.** The second depends on
margin, reversibility and people.

## When to Use

Investing in resilience is justified when:

- The system is complex enough to produce unanticipated scenarios.
- The cost of serious incidents is high.
- There are dependencies and interactions hard to enumerate.
- The operation involves on-call people.

## When Not to Use

**As a substitute for tolerance.** The anticipated scenarios should be handled by a mechanism, not by
improvisation.

**With no observability.** You do not respond to what you cannot see.

**With no margin.** A system at the limit has no options.

**Incident analysis looking for a culprit.** It destroys the information.

**Investing only in mechanisms**, ignoring procedures and people.

## Alternatives

There is no alternative to resilience — there are different emphases:

- **More tolerance mechanisms** — they cover more anticipated scenarios, and not the unanticipated one.
- **Simplifying** — fewer interactions, fewer unexpected combinations. Frequently the most effective
  intervention.
- **Reducing the reach** — smaller, isolated systems fail together less.
- **Reversibility** — the best isolated return.

## Trade-offs

| With margin | At the limit |
|---|---|
| Options during the incident | None |
| Idle capacity | High utilization |
| A permanent cost | Lower |

| Reversible | Irreversible |
|---|---|
| Allows trying | Each decision is final |
| Requires design | Simpler |

## Failure Modes

**No margin.** The first surprise becomes a collapse.

**Slow rollback.** Decisions under pressure with no possibility of correction.

**Concentrated knowledge.** The person who knows is on vacation.

**Insufficient observability.** Nobody can understand what is happening.

**Analysis that looks for a culprit.** The learning does not happen.

**Actions with no owner.** The same incident repeats.

**Exhausted on-call.** Worse decisions at the moment they matter most.

## Common Mistakes

**Confusing it with fault tolerance.** Tolerance covers anticipated failures; resilience is about what was
not anticipated. A system can tolerate every anticipated failure and collapse on the first one nobody
imagined.

**Investing only in mechanisms.** A circuit breaker and retries are useful and insufficient: the ability to
respond well also depends on who operates, on what can be seen, and on how much time there is to react.

**Operating with no headroom.** A system and a team at the limit have no capacity to absorb a surprise.
Headroom is what turns the unforeseen into a controlled incident.

**Not prioritizing reversibility.** Being able to undo quickly is worth more than always being right,
because the error is certain and the recovery speed is what you control.

**Incident analyses with no tracked actions.** An analysis that does not become a prioritized task is
ritual: the same incident comes back, and the second analysis reaches the same conclusions.

**Ignoring near misses.** What almost went wrong carries the same information as the incident, with none of
the cost. Discarding it is giving up the cheapest learning there is.

## Real-World Example

A payments platform had serious investment in tolerance: circuit breakers, bulkheads, redundancy across
three zones, exercised failover.

A 4-hour incident came from a combination no mechanism covered.

The sequence: a configuration change increased a connection pool's size; that increased memory consumption
per instance; auto scaling, on adding instances during a peak, exhausted the subnet's address quota; the
new instances came up and failed; the balancer removed them and added others, in a cycle.

No tolerance mechanism applied — there was no component failing, there was an interaction between three
reasonable decisions.

What prolonged the incident:

**No margin.** The instances operated at 80%. There was no headroom to absorb while the problem was
investigated.

**Slow rollback.** The configuration change was baked into the image. Reverting required a new build and
deployment: 35 minutes.

**Concentrated knowledge.** The person who understood the network configuration was unavailable. It took 2
hours until somebody suspected the address quota.

**Insufficient observability.** There was no metric for available addresses in the subnet. The symptom —
instances failing at startup — did not point at the cause.

The fixes were about resilience, not tolerance:

**Margin.** The target utilization was reduced to 60%, giving room to absorb.

**Configuration outside the image**, changeable in seconds, with immediate rollback.

**Per-feature switches**, allowing load to be reduced with no deployment.

**Infrastructure resource metrics** — addresses, quotas, limits — that did not exist before.

**Monthly tabletop exercises**, discussing combined scenarios. The third exercise found two other couplings
nobody had noticed.

**Knowledge rotation**, with the network documentation reviewed by somebody who did not write it.

What the team records: the tolerance mechanisms are still correct and would not have helped. What would
have reduced the 4 hours to minutes was the fast rollback of the configuration — which cost two days to
implement.

## Related Concepts

- [Fault Tolerance](/12-reliability/fault-tolerance.md) — the anticipated.
- [Chaos Engineering](/12-reliability/chaos-engineering.md) — how to discover the unanticipated.
- [Graceful Degradation](/12-reliability/graceful-degradation.md) — margin in the form of features.
- [Observability](/13-observability/index.md).

## Practical Exercise

Measure how long it takes to roll back the last change deployed to your system — for real, timed.

That number is the lower bound on the duration of any incident caused by a change.

## Interview Questions

- What is the difference between fault tolerance and resilience?
- Why is reversibility worth more than being right in the unknown scenario?
- Why is blameless incident analysis a requirement, not a courtesy?

## Further Reading

- Hollnagel, Erik. *Resilience Engineering in Practice*. Ashgate, 2011.
- Woods, David. *Four Concepts for Resilience*. Reliability Engineering, 2015.
- Allspaw, John. *Blameless PostMortems and a Just Culture*, 2012.

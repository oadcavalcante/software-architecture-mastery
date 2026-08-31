---
id: measuring-governance
title: Measuring Governance
sidebar_position: 10
description: Measuring effect and friction — without both numbers, every mechanism looks justified.
doc_type: concept
level: 6
difficulty: advanced
status: complete
objective: >
  By the end, the reader measures the effect and cost of each governance mechanism, and uses
  both to decide whether to keep, adjust or remove it.
prerequisites: [governance-basics]
related: [governance-pathologies, compliance, governance-basics]
canonical_for: []
translated_from_version: 1
last_reviewed: 2026-08-31
---

# Measuring Governance

## Overview

Governance is the one area of engineering in which mechanisms are created with no measurement
at all and kept indefinitely with no evidence at all.

The reason is structural: a mechanism's **effect** is an event that didn't happen, and its
**cost** is spread across small delays nobody adds up. Both sides of the ledger are
invisible, and an invisible ledger always favors what already exists.

Measuring governance is making both sides visible:

```text
effect     what was prevented, how many times
friction   how much delay and effort it cost, in aggregate
```

Without both numbers, the discussion about keeping or removing is decided by whoever has more
authority — which is the definition of one of the
[pathologies](/19-architecture-governance/governance-pathologies.md).

## Problem

The typical argument in favor of a mechanism is counterfactual:

```text
"without this review, we would have serious problems"
```

The sentence is neither verifiable nor refutable. And it defeats any proposal to remove it,
because the burden of proof falls on whoever wants it removed.

On the other side, the cost:

```text
26 days of average waiting × 80 projects per year
= ~5.7 person-years of calendar time
```

That number exists and is almost never calculated. When it is, the discussion changes in
nature.

And there is a measurement trap specific to this area: measuring activity instead of effect.
Number of reviews held, standards published, committee sessions — all grow with the effort and
none tells you whether anything improved.

## Core Concepts

### Effect: what was prevented

```text
how many times the mechanism changed a decision in 12 months
how many times it detected something that would have caused damage
incidents in the risk class it addresses, before and after
divergences prevented, measurably
```

The first is the easiest and the most revealing. A review that changed no decision in a year
is producing no effect, regardless of how many sessions it held.

And it has to be recorded at the time — reconstructing it later is impossible. See
[review](/19-architecture-governance/governance-review.md), where separating blocking from
recommendation already produces that data.

### Friction: the aggregate cost

```text
average waiting time × volume
preparation effort per occurrence × volume
rework caused by a late decision
decisions deferred or not made because of the process cost
```

The last item is the most expensive and the only one not directly observable. It shows up in
a survey of the teams, with a specific question: **have you ever not proposed something
because of the process?**

### Measure the rate, not the total

```text
number of reviews held             grows with effort, informs nothing
approval rate with no changes      tells you whether the mechanism catches anything
number of standards published      activity
measured adoption rate             effect
committee sessions                 activity
decisions changed per session      effect
```

The left-hand column is what appears in governance reports. The right-hand one is what lets
you decide.

### Indicators that work

```text
approval rate with no changes        above 90% → it intervenes too late
average waiting time                  the direct cost
ratio of exceptions to silent deviations  how much non-compliance is invisible
measured adoption per standard        published versus followed
voluntary consultations               perceived usefulness
time between deviation and fix        detection effectiveness
mechanisms removed per year           is there a removal process?
```

The third is the most informative and the least used: comparing recorded exceptions with the
deviations a technical check would find measures governance visibility directly. See
[exceptions](/19-architecture-governance/exceptions.md).

The last is an indicator about the governance system, not about a mechanism — and it is the
best predictor of accumulation.

### The counterfactual can be tested

The argument "without this we would have problems" is testable by suspension:

```text
suspend it for a quarter
observe the risk class the mechanism addresses
compare with the previous period
```

That requires risk tolerance and is applicable only where the consequence of a failure is
recoverable — never for a regulatory requirement or a critical security control.

Where it is applicable, it produces evidence no analysis produces.

### Measure what the absence costs too

The symmetry matters. An organization that only measures friction concludes that all
governance should be removed.

```text
incidents caused by divergence between teams
integration rework
time spent re-deciding what was already decided
lessons rediscovered through incidents
operational cost of duplicated technologies
```

Those numbers justify governance as much as the previous ones condemn it, and an honest
decision needs both sets.

### Ask the teams, with a specific question

```text
bad    "does governance get in the way?"
good   "in the last 6 months, how many times did you wait more than a week
       for an architectural approval?"
good   "have you ever not proposed a change because of the process?"
good   "name a mechanism you consider useful, and why"
```

The last is the most informative. Mechanisms nobody can defend spontaneously are candidates
for review, and mechanisms cited by several teams deserve to be preserved when the cut
comes.

## Mental Model

**Effect and friction, both as numbers.** With only one, the discussion is decided by
authority.

## When to Use

- When creating any mechanism — define the measure beforehand.
- In a periodic review of the set.
- When there is diffuse complaining about bureaucracy.
- Before proposing removal.

## When Not to Use

**Measuring activity.**

**Only friction** — it leads to removing everything.

**Only effect** — it leads to keeping everything.

**With an untested counterfactual**, when the test would be viable.

**Without asking the teams.**

**Suspending a regulatory or critical security control** in order to test.

## Alternatives

- **Temporary suspension** — evidence instead of a measure.
- **A qualitative survey** — faster, less precise, frequently sufficient.
- **A sample audit** — to estimate effect where continuous measurement is expensive.
- **Delivery indicators** — cycle time and deployment frequency capture the aggregate
  friction without attributing it to a mechanism. See
  [continuous delivery](/14-devops-and-platform/ci-cd.md).

The last is useful as a general signal: if cycle time grows with no technical cause,
governance is a suspect.

## Trade-offs

| Measure | Don't measure |
|---|---|
| Decisions with evidence | No measurement cost |
| Instrumentation cost | Decisions by authority |
| Exposes the useless | Preserves the status quo |

| Suspend and observe | Analyze |
|---|---|
| Conclusive | No risk |
| Requires tolerance | Inconclusive |
| Fast | Open-ended |

## Failure Modes

**Measuring activity.** Numbers that grow with effort.

**Only one side of the ledger.** A predetermined conclusion.

**An untested counterfactual.** An irrefutable argument.

**Measurement with no consequence.** A report that changes nothing.

**Vague questions to the teams.** Vague answers.

**Not measuring the cost of absence.** Excessive removal.

## Common Mistakes

**Creating a mechanism without defining how to measure it.**

**Not recording when a review changed a decision** — data not collected at the time is lost.

**Comparing organizations** instead of comparing the same organization over time.

**Not adding up the friction** — each wait looks small in isolation.

**Not measuring mechanisms removed per year.**

## Real-World Example

An energy company with 220 engineers instituted governance measurement after a discussion
that had been repeating for two years: the architecture group defended the existing
mechanisms, the product teams asked for their removal, and neither side had a number.

What came to be measured, per mechanism:

```text
effect     decisions changed in 12 months, recorded at the time
           items detected that would have caused damage
friction   average waiting time × annual volume
           estimated preparation effort × volume
absence    incidents in the risk class addressed
```

After 12 months of collection, across 14 mechanisms:

```text
mechanism                       effect/yr    friction/yr    decision
security review                  19 items     ~40 days      keep
shared data review               11 dec.      ~55 days      keep
architecture committee            3 dec.     ~410 days      rework
new technology approval           7 dec.     ~120 days      narrow scope
monthly adherence report          0           ~90 days      remove
impact form                       1          ~180 days      remove
license check                    14 items      ~2 days      keep
... (7 others)
```

The contrast between the third and the last line was what changed the conversation. The
automated license check caught 14 items a year with almost no friction; the architecture
committee changed 3 decisions a year at a cost of more than a person-year of waiting.

Neither side of the earlier discussion had those numbers.

The decisions:

**Two mechanisms removed** — the monthly report, which nobody read, and the impact form,
whose only recorded effect in 12 months was flagging an error the pipeline would also have
caught.

**The committee reworked** into advice, with a gate on three classes. See
[review](/19-architecture-governance/governance-review.md).

**New technology approval** narrowed to technologies that enter the shared on-call rotation —
before it applied to any library.

**Seven mechanisms converted into automated checks**, chosen by their ratio of friction to
effect.

**A permanent rule**: no new mechanism is created without a prior definition of how its
effect will be measured, and none survives two years with no evidence of effect.

Eighteen months later:

```text
mechanisms                                   14 → 9
aggregate friction                           from ~900 to ~220 days/year
aggregate recorded effect                    from 55 to 71 items/year
incidents in the risk classes addressed       stable
cycle time for architectural projects        -38%
```

The effect **rose** while friction fell by 75%. The recorded explanation: the mechanisms
converted into automated checks catch more than their manual equivalents, because they run
every time.

The detail the team highlights: the two-year discussion ended in a single meeting, when the
table was presented. There was no new argument — there was a number.

## Related Concepts

- [Pathologies](/19-architecture-governance/governance-pathologies.md) — what measurement
  diagnoses.
- [Governance Basics](/19-architecture-governance/governance-basics.md) — the declared cost
  per mechanism.
- [Compliance](/19-architecture-governance/compliance.md) — measuring the state.
- [Exceptions](/19-architecture-governance/exceptions.md) — the ratio of exceptions to silent
  deviations.

## Practical Exercise

Pick a governance mechanism in your context and calculate the annual friction: average
waiting time multiplied by volume.

Then ask whoever operates it how many times it changed a decision in the last year. The two
numbers take less than an hour to obtain, and have almost never been obtained.

## Interview Questions

- Why is the argument "without this we would have problems" hard to refute, and how do you
  test it?
- What is the difference between measuring activity and measuring effect in governance?
- Why does measuring only friction lead to the wrong conclusion?

## Further Reading

- Forsgren, Nicole et al. *Accelerate*. IT Revolution, 2018.
- Ford, Neal et al. *Building Evolutionary Architectures*. 2nd ed. O'Reilly, 2022.
- Hubbard, Douglas. *How to Measure Anything*. 3rd ed. Wiley, 2014.

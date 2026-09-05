---
id: measuring-architecture-outcomes
title: Measuring Architecture Outcomes
sidebar_position: 23
description: Knowing whether the architecture is improving, instead of arguing that it is.
doc_type: concept
level: 7
difficulty: advanced
status: complete
objective: >
  By the end, the reader measures architectural outcomes by effect on the business and on delivery,
  not by activity or by compliance.
prerequisites: [fitness-functions]
related: [fitness-functions, evolutionary-architecture, cost-management]
canonical_for: []
translated_from_version: 2
last_reviewed: 2026-08-31
---

# Measuring Architecture Outcomes

## Overview

The difference between architectural leadership and senior opinion is the ability to answer one
question with evidence:

```text
"is the architecture improving?"
```

With no measurement, the answer is a narrative — and narratives are settled by whoever has more
authority, not by whoever is right. With measurement, the conversation changes in nature: it becomes
about the numbers, and disagreeing with them requires proposing others.

The problem is that architecture is almost always measured by **activity** — decisions made, ADRs
written, reviews held, standards published — and none of those tells you whether anything improved.

## Problem

The typical architecture report:

```text
23 ADRs written
41 design reviews held
6 standards published
3 modernization initiatives under way
```

Every one of those numbers grows with the group's effort and none answers whether the organization is
better off. They are, in essence, a measurement of how much work the group did.

And there is a second pattern: measuring compliance. "94% of systems follow standard X" tells you
about adherence, not about outcomes — the standard may be wrong, and 94% compliance with a wrong
standard is worse than 40%.

```text
activity      grows with effort
compliance    measures adherence, not effect
effect        measures what changed for the organization
```

## Core Concepts

### Measure effect, in four dimensions

```text
speed of change   time from decision to production
                  deployment frequency
                  build time
stability         change failure rate
                  time to recovery
                  incidents by class of cause
cost              cost per economic unit
                  capacity in maintenance versus in
                  new functionality
capability        onboarding time for a new person
                  integration time between teams
                  number of people able to change
                  each system
```

Those four cover most of what architecture affects, and none of them grows with the architecture
group's effort — which is exactly the desired property.

The first four speed and stability metrics are the software delivery ones consolidated by the
organizational performance research. See
[continuous delivery](/14-devops-and-platform/ci-cd.md).

### Tie each initiative to a number, beforehand

```text
"this initiative will reduce the time from decision to production
 from 18 to under 7 days, measured over changes in the orders
 domain, within 12 months"
```

Declaring the number **beforehand** does two things. It makes the initiative assessable, which is
uncomfortable and honest. And it forces the useful question at the proposal stage: if there is no
number that improves, why do it?

Initiatives with no declared number are assessed afterwards by narrative, and the narrative always
concludes it was a success.

### Measure before starting

```text
no baseline     impossible to demonstrate improvement
with a baseline the comparison is arithmetic
```

This is the most common and the most irreversible error: a 12-month initiative that did not measure
the initial state has no way to demonstrate a result, even having produced one.

And measuring beforehand has a second benefit: the initial number frequently contradicts the
perception that motivated the initiative, and the proposal changes before it costs money.

### Segment by what the architecture treats differently

```text
aggregate average   hides
segmented by
  domain, system
  or team           reveals
```

An average lead time of 8 days can hide three domains at 2 days and one at 30. The average triggers
nothing; the segmentation points at where to act.

See the [streaming case study](/21-case-studies/video-streaming.md), where segmenting by connection
quality revealed what the average was hiding: 22% of sessions occur below 5 Mbps, and in those the
abandonment rate in the first thirty seconds is 19%, against 3% in the rest.

### Architecture metrics come from what already exists

```text
repository history   change frequency, files per
                     change, modules that change together
pipeline             build time, deployment
                     frequency, failure rate
incidents            time to recovery, cause by class
invoice              cost per unit
internal survey      cognitive load, perceived autonomy
```

Almost none of that requires new instrumentation. The information exists and is not extracted — which
is a recurring observation throughout this path.

### Beware of what the metric incentivizes

```text
number of ADRs               → trivial ADRs
test coverage                → tests with no assertion
compliance with a standard   → compliance with a wrong standard
lead time                    → smaller batches, which is good,
                               and also cutting quality
```

Every published metric becomes a target. The usual mitigation is measuring in pairs that counterweigh
each other: speed with stability, cost with reliability, compliance with outcome.

Publishing delivery speed without the change failure rate produces exactly the behavior the
organization does not want.

### Cadence and audience

```text
continuous   speed, stability, cost — for the teams
quarterly    aggregate trend — for leadership
annual       effect of the strategic initiatives — for the board
```

The audience changes the framing, not the source. See
[communication](/23-architecture-leadership/communication.md).

### Not everything is measurable, and admitting it protects the metrics

```text
measurable       time, frequency, cost, rate
not measurable   whether the domain boundary is correct
                 whether the complexity is justified
                 whether the decision was the right one
```

Trying to quantify the unquantifiable produces bad metrics that discredit the good ones. Declaring
the limit — "this we assess by judgment, and here is the reasoning" — is more honest and more
defensible.

## Mental Model

**Measure effect, not activity.** Declare the number beforehand, measure the baseline, and segment by
what the architecture treats differently.

## When to Use

- Before any significant architectural initiative.
- Continuously, across the four dimensions.
- Segmented by domain or system, not as an average.

## When Not to Use

**Measuring activity.**

**With no baseline.**

**As an aggregate average.**

**With no counterweight metric.**

**Quantifying what requires judgment.**

**As a report** that changes no decision — if no prioritization changed because of the numbers in a
year, the report is pure cost and should be reduced or eliminated.

## Alternatives

- **Qualitative surveys with the teams** — faster, less precise, frequently enough for a diagnosis.
- **Peer assessment** — architects from another area reviewing; captures what metrics don't capture.
- **Delivery metrics only** — speed and stability cover a lot, and are cheap to obtain.

The third is the recommended starting point: four well-known numbers, taken from the pipeline,
already change the conversation.

## Trade-offs

| Many metrics | Few |
|---|---|
| Coverage | Focus and action |
| Dilution | Gaps |

| Publishing per team | Aggregate |
|---|---|
| Triggers whoever can act | No risk of unfair comparison |
| Risk of becoming a ranking | Nobody acts |

The second table hides a real tension: per-team metrics trigger action and can turn into competition.
The mitigation is publishing each team's trend against itself, not against the others.

## Failure Modes

**Measuring activity.** Grows with effort, tells you nothing.

**No baseline.** An undemonstrable result.

**An average that hides.** Nothing gets triggered.

**A metric with no counterweight.** Incentivizes the wrong behavior.

**A report with no consequence.** Cost with no use.

**Quantifying judgment.** Bad metrics discredit the good ones.

## Common Mistakes

**Reporting ADRs written** and reviews held.

**Not measuring before** starting.

**Publishing speed** without stability.

**Comparing teams against each other.**

**Not using** what the pipeline and the repository already produce.

## Real-World Example

A software company with 240 engineers had an architecture group that produced a quarterly report. It
contained the number of ADRs, reviews, standards published and initiatives under way.

In an annual planning meeting, the engineering director asked a question the group could not answer:
**"are we better off than two years ago?"**

The rework took six months and started by extracting what already existed:

```text
source                     metric obtained
pipeline                   build time, deployment
                           frequency, change failure rate
incident system            time to recovery, cause by class
repositories               time from first commit to production,
                           files and modules per change
cloud invoice              cost per transaction
human resources            onboarding time to first
                           delivery in production
```

None required new instrumentation. The extraction took three weeks.

The baseline, measured over the previous 24 months, produced an uncomfortable revelation:

```text
time from decision to production   from 14 to 19 days (worse)
deployment frequency               +40% (better)
change failure rate                from 9% to 14% (worse)
time to recovery                   from 2.1 h to 1.4 h (better)
cost per transaction               +23% (worse)
capacity in maintenance            from 58% to 66% (worse)
```

The organization was deploying more and getting worse in four of the six dimensions. The earlier
narrative — of constant progress — did not survive the numbers.

**Segmentation** revealed where:

```text
time from decision to production, by domain
  payments        6 days
  catalog         8 days
  billing        41 days
  contracts      38 days
```

Two domains concentrated the deterioration, and both were the ones depending on a common legacy
system.

**The technical strategy was redone** from that: a single front, attacking the legacy system that
blocked the two domains — instead of the previous five fronts, chosen by perception.

**Every initiative came to declare the number beforehand**, with a baseline and a target.

**Metrics in pairs.** Speed always published with the failure rate; cost always with availability.

**Publication per domain, against itself.** Each team sees its own trend, not the comparison with the
others.

Eighteen months later:

```text
time from decision to production   from 19 to 7 days
  billing                          from 41 to 11
  contracts                        from 38 to 9
change failure rate                from 14% to 6%
cost per transaction               -19%
capacity in maintenance            from 66% to 47%
onboarding time                    from 11 to 5 weeks
```

The quarterly report came to have six numbers and no activity count at all.

The team's reading: the baseline was the most uncomfortable part and the most valuable. It showed the
perception of progress was wrong, and the segmentation by domain pointed at the cause in one
afternoon — after two years of strategies built on perception.

And the director's question became the report's criterion of existence: any number that doesn't help
answer it was removed.

## Related Concepts

- [Fitness Functions](/23-architecture-leadership/fitness-functions.md).
- [Evolutionary Architecture](/23-architecture-leadership/evolutionary-architecture.md).
- [Cost Management](/23-architecture-leadership/cost-management.md).
- [Measuring Governance](/19-architecture-governance/measuring-governance.md).

## Practical Exercise

Extract from your pipeline and your incident system the four delivery metrics for the last 24 months,
and segment them by domain.

Then answer the question: are you better off than two years ago? If the answer surprises you, that is
the reason to measure.

## Interview Questions

- Why does counting ADRs and reviews not measure architecture?
- Why is the baseline irreversible if it isn't measured beforehand?
- Why do metrics need pairs that counterweigh each other?

## Further Reading

- Forsgren, Nicole et al. *Accelerate*. IT Revolution, 2018.
- Ford, Neal et al. *Building Evolutionary Architectures*. 2nd ed. O'Reilly, 2022.
- Hubbard, Douglas. *How to Measure Anything*. 3rd ed. Wiley, 2014.

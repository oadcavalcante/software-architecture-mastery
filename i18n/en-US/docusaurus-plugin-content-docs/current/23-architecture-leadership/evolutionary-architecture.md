---
id: evolutionary-architecture
title: Evolutionary Architecture
sidebar_position: 21
description: Designing for guided change — and choosing which dimensions will be protected.
doc_type: concept
level: 7
difficulty: advanced
status: complete
objective: >
  By the end, the reader chooses which architectural characteristics to protect over time and
  assembles the mechanism that preserves them.
prerequisites: [architecture-leadership-basics]
related: [fitness-functions, measuring-architecture-outcomes, technical-roadmaps]
canonical_for: []
translated_from_version: 1
last_reviewed: 2026-08-31
---

# Evolutionary Architecture

## Overview

No architecture stays correct. The premises that produced it — volume, team, market, regulation,
technology — change, and the design that was adequate stops being adequate.

The conventional response is to plan better: forecast more, design more flexibly, anticipate. It
fails because the relevant changes are precisely the ones that were not foreseen.

The alternative is different:

```text
not       designing for every possible change
but       designing so that changing is cheap, and protecting
          the characteristics that cannot be lost along the way
```

See [architecture evolution](/01-fundamentals/architecture-evolution.md) for the concept; here the
focus is on what leadership does so that evolution happens in a guided way rather than by drift.

## Problem

With no mechanism, the architecture changes by drift:

```text
each local decision is reasonable
the sum is not
nobody decided the boundaries would erode
they eroded
```

The pattern is the same one described in
[speed vs. quality](/20-trade-offs/speed-vs-quality.md): individually correct decisions producing an
aggregate result nobody chose.

And there is the opposite error: freezing the architecture. An organization that treats architectural
change as an exception accumulates a design ever further from the current problem, until the only way
out is a rewrite.

```text
drift     changes with no decision
frozen    doesn't change, and the distance grows
guided    changes with a decision, protecting what matters
```

## Core Concepts

### Choose the protected dimensions

It is not possible to protect everything. The question that structures the work:

```text
"which characteristics of this architecture cannot
 degrade, whatever happens?"
```

```text
examples of a protected dimension
  no service accesses another's database
  the build time stays under 10 minutes
  the checkout p99 latency stays under 300 ms
  no secret is written into code
  every service has a valid owner
```

A few — three to seven — and chosen by consequence. Each becomes a verification mechanism. See
[fitness functions](/23-architecture-leadership/fitness-functions.md).

What is not on the list is allowed to degrade, and that is a conscious choice rather than an
oversight.

### Cheap change is the central property

```text
evolutionary architecture is not the one that foresees changes
it is the one that makes changes cheap
```

What makes change cheap is known and is the same thing that makes software good: clear boundaries,
low coupling, tests that give confidence, automated deployment, and the ability to roll back.

None of that is specific to evolutionary architecture — what is specific is treating it as an
investment in the capacity to change, and not as hygiene.

See [continuous delivery](/14-devops-and-platform/ci-cd.md).

### Reversibility is worth more than prediction

```text
forecasting correctly    hard, and frequently impossible
rolling back cheaply     achievable, and covers being wrong
```

Faced with uncertainty, investing in the capacity to roll back yields more than investing in
analysis. A wrong and reversible decision costs days; the same wrong decision, irreversible, costs
the whole cycle.

That changes what you optimize for: instead of being right more often, being wrong more cheaply.

### Incremental change, always

```text
large and rare       concentrated risk, hard to reverse,
                     late learning
small and
  frequent           distributed risk, reversible, continuous
                     learning
```

That holds for architecture as much as for code. A migration done in slices, each reversible, is
slower in total and far safer — and it lets the plan survive interruptions. See
[technical roadmaps](/23-architecture-leadership/technical-roadmaps.md).

### Leave paths open where uncertainty is high

```text
where the future is known     optimize
where it is uncertain         preserve the option, if it's cheap
```

Preserving an option has a cost, and it has to be small to be worth it. See
[simplicity vs. flexibility](/20-trade-offs/simplicity-vs-flexibility.md) — the asymmetry is the
same: buying expensive optionality for an uncertain future rarely pays off.

What almost always pays off: isolating the uncertain dependency in an identifiable place, without
generalizing.

### Evolution requires measuring the current state

You cannot guide what you don't observe:

```text
coupling between modules, measured
build and deployment time
change frequency per area
areas that always change together
time between decision and production
```

The fourth line is the most revealing: components that always change together indicate a wrong
boundary, and that information is in the repository history without anyone extracting it.

See [measuring outcomes](/23-architecture-leadership/measuring-architecture-outcomes.md).

### Not everything should evolve

```text
evolves     what changes with the business
stable      published formats, contracts with external parties,
            foundations many consume
```

An organization that changes everything continuously imposes a keeping-up cost on everyone. Declaring
what is deliberately stable — and whose change requires a process — is as important as making the
rest malleable.

## Mental Model

**Protect few dimensions, make changing cheap, and roll back instead of forecasting.** Guided
evolution is the middle ground between drift and freezing.

## When to Use

- In long-lived systems, with uncertainty about the future.
- When the architecture has already drifted with no decision.
- When the cost of changing is the bottleneck, and not capacity.

## When Not to Use

**Protecting everything** — with no choice, no dimension is actually protected.

**As an excuse not to decide** — "we'll evolve" is no substitute for choosing.

**In disposable systems** — the investment doesn't pay off.

**Without measuring** the current state.

**Making everything malleable**, published contracts included.

## Alternatives

- **A stable architecture with periodic review** — adequate in domains that change little.
- **A planned rewrite** — in some cases, accepting that the system has a useful life and planning the
  replacement is cheaper than keeping it evolutionary.
- **Freeze and isolate** — keeping the system as it is, with clear boundaries, and building the new
  one alongside. See [strangler fig](/16-legacy-modernization/strangler-fig.md).

The second is underrated: not every system deserves the investment in evolvability, and recognizing
that is a valid economic decision.

## Trade-offs

| Evolutionary | Stable |
|---|---|
| Absorbs change | Less investment |
| Continuous cost of maintaining the capacity | The distance grows |
| Requires measurement | Simple |

| Many protected dimensions | Few |
|---|---|
| More guarantees | Sustainable verification |
| Cost of maintaining them | An explicit choice of what degrades |

## Failure Modes

**Drift.** It changes with no decision, and the aggregate was not chosen.

**Freezing.** The distance grows until the rewrite.

**Protecting everything.** No dimension actually protected.

**Investing in prediction** instead of reversibility.

**Large, rare change.** Concentrated risk.

**Published contracts treated as malleable.**

## Common Mistakes

**Not choosing** the dimensions to protect.

**Not measuring** coupling and change frequency.

**Confusing evolutionary with flexible** — anticipated flexibility is the opposite.

**Not using the repository history** as a source of evidence.

**Treating "we'll evolve"** as a decision.

## Real-World Example

A financial services company had a seven-year-old system with a problem that was hard to name:
nothing was wrong, and everything was slow to change.

A measurement over the repository history produced the first concrete evidence:

```text
average time from start to production for a change    18 days
files touched per change, median                      34
modules touched per change, median                     5
pairs of modules that change together in > 60%
  of cases                                            11
build time                                            47 minutes
```

The 11 pairs that always changed together were wrong boundaries — separate modules that in practice
were one. And the 47-minute build time was what made any change expensive, regardless of size.

The work was organized as guided evolution, not as a rewrite:

**Five protected dimensions**, chosen by consequence and verified automatically:

```text
build time under 10 minutes
no cyclic dependencies between modules
no module accessing another's data directly
domain test coverage above 70%
time between deployments under 3 days
```

Each became a check in the pipeline, introduced in warning mode and then blocking. See
[fitness functions](/23-architecture-leadership/fitness-functions.md).

**Boundaries corrected by evidence.** The 11 pairs that changed together were assessed: 7 were merged,
3 had their boundary redesigned, and 1 turned out to be a design coincidence.

**Build time attacked first**, because it multiplied the cost of every other change. From 47 to 8
minutes in six weeks.

**Incremental change as a rule.** No structural alteration in one block; everything in reversible
slices, with the system working at the end of each one.

**Continuous measurement** of the five dimensions and the change metrics, visible to everyone.

Results after 16 months:

```text
time from start to production        from 18 days to 4
files touched per change             from 34 to 11
modules per change                   from 5 to 2
pairs that always change together     1
build time                            7 minutes
protected dimensions violated         0 since blocking
```

No rewrite. The system is the same, with the same responsibilities — what changed was the cost of
altering it.

The detail the team highlights: the measurement over the repository history was the project's cheapest
and most informative instrument. It cost two days of work, had existed all along, and nobody had
extracted it — and the 11 pairs that changed together pointed at the wrong boundaries with a precision
no design analysis had achieved.

## Related Concepts

- [Architecture Evolution](/01-fundamentals/architecture-evolution.md).
- [Fitness Functions](/23-architecture-leadership/fitness-functions.md) — the mechanism.
- [Measuring Outcomes](/23-architecture-leadership/measuring-architecture-outcomes.md).
- [Simplicity vs. Flexibility](/20-trade-offs/simplicity-vs-flexibility.md).

## Practical Exercise

Extract from your repository history the pairs of modules that change together more than 60% of the
time.

Each pair is a boundary that may well be wrong — and that information has existed for years without
anyone looking at it.

## Interview Questions

- Why does investing in reversibility yield more than investing in prediction?
- Why does protecting everything mean protecting nothing?
- How does the repository history reveal wrong boundaries?

## Further Reading

- Ford, Neal et al. *Building Evolutionary Architectures*. 2nd ed. O'Reilly, 2022.
- Forsgren, Nicole et al. *Accelerate*. IT Revolution, 2018.
- Feathers, Michael. *Working Effectively with Legacy Code*. Prentice Hall, 2004.

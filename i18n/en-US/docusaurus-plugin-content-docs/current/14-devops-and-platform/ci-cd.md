---
id: ci-cd
title: Continuous Integration and Delivery
sidebar_position: 1
description: Three frequently confused terms — and why most teams do not practice the first.
doc_type: concept
level: 5
difficulty: intermediate
status: complete
objective: >
  By the end, the reader distinguishes continuous integration, delivery and
  deployment, and identifies what prevents each one in their context.
prerequisites: [devops-and-platform]
related: [deployment-strategies, feature-flags, environment-management]
canonical_for: []
translated_from_version: 1
last_reviewed: 2026-08-31
---

# Continuous Integration and Delivery

## Overview

Three terms, three different things:

```text
continuous integration  everybody integrates into the main branch at least daily,
                        with automated verification
continuous delivery     the main branch is always ready to go to production
continuous deployment   every change that passes goes to production automatically
```

The first is the hardest and the most frequently claimed without being practiced: having a pipeline that
runs tests on a long-lived branch **is not** continuous integration.

## Problem

Long-lived branches accumulate divergence. The longer they are separated, the harder the integration — and
the conflict is not only textual: it is semantic, between changes that assumed different states of the
code.

The practical consequence:

```text
daily integration     small conflicts, resolved in minutes
weekly integration    larger conflicts, a few hours
monthly integration   days of work, with defects introduced in the resolution
```

The cost grows non-linearly with the separation time. And it is paid all at once, at the end, when there is
no longer a way to estimate it.

## Core Concepts

### Continuous integration requires small batches

The practice, without mincing words: **every developer integrates into the main branch at least once a
day**.

That is incompatible with feature branches that live for weeks. And the immediate objection — "but the
feature is not ready" — has an answer:

**Integrating is not releasing.** Incomplete code can be in the main branch, as long as it is not
reachable. See [feature flags](/14-devops-and-platform/feature-flags.md).

**Splitting the change.** Most features can be delivered in slices that break nothing — structure first,
behavior afterward.

**The expand and contract pattern.** Add the new, migrate, remove the old — in three integrations, instead
of one large one.

Teams that cannot integrate daily usually have a task decomposition problem, not a tooling one.

### The pipeline is the mechanism, not the practice

A pipeline that runs tests is necessary and not sufficient. What characterizes the practice:

```text
frequent integration       daily, into the main branch
fast verification          minutes, not hours
the main branch always green  it broke, it gets fixed before anything else
no long-lived branch
```

The third line is what distinguishes teams that practice from those that have a tool: a main branch broken
for hours means nobody can integrate with confidence, and the practice collapses.

And the second matters more than it seems: a 40-minute pipeline discourages integrating frequently. Below
ten minutes, it stops being friction.

### Continuous delivery is about being ready

The main branch is always in a deployable state. The deployment itself can be manual, scheduled, or
dependent on a business decision.

What it requires:

```text
sufficient verification    confidence that what passed works
automated deployment       with no manual steps
tested rollback            going back in minutes
compatible migrations      the schema evolves without breaking the previous version
```

The last is the most forgotten and the one that most prevents it: a migration that requires code and
database to change together makes deployment a coordinated event, and rollback impossible.

See [schema evolution](/08-integration-architecture/schema-evolution.md).

### Continuous deployment is a decision, not the goal

Going to production automatically on every change requires high confidence in the automated verification —
and not every context accommodates it.

```text
it makes sense       a web product, small changes, fast rollback, good coverage
it does not          regulated software with mandatory approval
                     embedded systems
                     where rollback is expensive or impossible
```

Continuous delivery is the universal goal: always being ready. Deploying automatically is a choice about
what to do with that readiness.

Teams that chase continuous deployment without having continuous delivery are automating a path they do not
trust.

### Layered verification

A pipeline that runs everything on every change gets slow and discourages integration.

```text
before pushing      static analysis, unit tests — seconds
on integration      unit and contract tests — minutes
before production   integration and end-to-end, a critical subset — minutes
in production       smoke tests, canary, monitoring
```

The principle: fail as early and as cheaply as possible. And accept that part of the verification happens
**in production** — which changes the posture about reversibility.

See [canary](/14-devops-and-platform/canary.md).

### Flaky tests destroy the practice

A test that fails randomly trains the team to rerun instead of investigating. Once that habit is
established, the pipeline stops being a signal.

The treatment needs to be aggressive: a flaky test is removed or fixed, with a deadline. Keeping it
"because sometimes it catches something" costs more than it returns.

And the flakiness needs to be measured — the proportion of runs that fail and pass on a rerun — or it grows
with nobody noticing.

## Mental Model

**Integrating frequently makes each integration cheap.** The rest — delivery, deployment — is what you do
with a trustworthy main branch.

## When to Use

- Practically always, for the first two.
- Continuous deployment where rollback is fast and the verification is trustworthy.
- High priority when there are several teams in the same code.

## When Not to Use

**Calling a long-lived branch with a pipeline** continuous integration.

**Continuous deployment** with no tested rollback.

**A slow pipeline.** It discourages the practice it was supposed to enable.

**Living with flaky tests.**

**With no compatible migrations.** Deployment becomes a coordinated event.

**With manual approval on every change**, which is the real bottleneck in most cases.

## Alternatives

- **Delivery on a fixed cadence** — weekly or biweekly, with larger batches. Legitimate in regulated
  contexts.
- **Short-lived branches** — one to two days, integrated quickly. A practicable middle ground.
- **Trunk-based development with flags** — the form that sustains daily integration. See
  [feature flags](/14-devops-and-platform/feature-flags.md).

## Trade-offs

| Small batches | Large batches |
|---|---|
| Trivial conflicts | Costly |
| Easy to diagnose | Hard to isolate the cause |
| Precise rollback | Reverts everything |
| More deployments | Fewer events |

| Continuous deployment | With a human decision |
|---|---|
| The shortest time to production | Control |
| Requires trustworthy verification | Tolerates gaps |
| Rollback needs to be fast | More margin |

## Failure Modes

**The main branch broken for hours.** Nobody integrates.

**A slow pipeline.** Integration discouraged.

**Flaky tests.** The pipeline stops being a signal.

**Long-lived branches.** Semantic conflict on integration.

**A migration coupled to the code.** Coordinated deployment, impossible rollback.

**Approval as the bottleneck.** The automation is ready and the human queue is not.

**Insufficient verification.** Continuous deployment propagating a defect.

## Common Mistakes

**Confusing a pipeline with continuous integration.** Having an automated build is not integrating
continuously. Continuous integration is everybody merging into the trunk at least once a day; without that,
the pipeline only automates late integration.

**Feature branches of weeks.** The merge conflict grows with the time and with the number of open branches,
and integration becomes a risky event instead of routine.

**Tolerating flaky tests.** A test that fails sometimes teaches the team to rerun without looking — and
from then on the whole suite stops being a signal.

**Not measuring the pipeline's time.** Above ten or fifteen minutes, people stop waiting for the result and
start batching changes, which undoes the benefit of frequent integration.

**Not making migrations compatible.** A migration that breaks the previous version prevents rollback.
Expanding the schema, migrating and only then contracting is what preserves the emergency exit.

**Automating the deployment without automating the rollback.** Deploying fast and reverting manually
increases the exposure: the path to the error gets short and the path back stays long.

## Real-World Example

A financial services company claimed to practice continuous integration: there was a pipeline, automated
tests, and one-click deployment.

Measuring the real flow showed something else:

```text
average feature branch lifetime            17 days
pipeline time                              38 minutes
main branch broken                         around 6 hours per week
flaky test rate                            4% of runs
time between integration and production    11 days
```

17-day branches are not continuous integration. And the consequences appeared as "quality problems":

**Semantic conflicts.** Two features that assumed different states of the same module, integrated two weeks
apart. The textual conflict was resolved; the behavioral one went to production.

**Difficult diagnosis.** One deployment carried 11 days of changes from five people. When something broke,
isolating the cause took hours.

**Reverting everything.** Reverting meant undoing everybody's work.

The changes, in order:

**The pipeline from 38 to 7 minutes.** Parallelization, dependency caching, and moving the slow tests to a
later stage. That alone changed the behavior — people started integrating more.

**Flaky tests** measured and treated. Eleven were removed, four fixed. The rule became: it failed twice
with no code change, it leaves the pipeline within 48 hours.

**The main branch as an absolute priority.** It broke, whoever broke it fixes it or reverts, before
anything else. The broken time fell to under 20 minutes a week.

**Smaller slices.** Training on expand and contract, and use of
[feature flags](/14-devops-and-platform/feature-flags.md) to integrate incomplete code. The average branch
lifetime fell from 17 days to 1.4.

**Compatible migrations** made mandatory, verified in review.

Result in nine months: time between integration and production from 11 days to 4 hours, deployments from 2
per week to 31, and incidents caused by deployment cut in half.

The recorded conclusion: the tooling was correct from the start. What was missing was the practice — and
the change that unblocked the most was reducing the pipeline's time, which was seen as an infrastructure
detail.

## Related Concepts

- [Deployment Strategies](/14-devops-and-platform/deployment-strategies.md).
- [Feature Flags](/14-devops-and-platform/feature-flags.md) — what allows integrating without releasing.
- [Environment Management](/14-devops-and-platform/environment-management.md).
- [Schema Evolution](/08-integration-architecture/schema-evolution.md).

## Practical Exercise

Measure your team's average branch lifetime and your pipeline's time.

If the branches live more than two days, you do not practice continuous integration — and if the pipeline
takes more than ten minutes, that is probably the cause.

## Interview Questions

- What is the difference between continuous integration, delivery and deployment?
- Why does having a pipeline not mean practicing continuous integration?
- Why are compatible migrations a prerequisite for continuous delivery?

## Further Reading

- Humble, Jez; Farley, David. *Continuous Delivery*. Addison-Wesley, 2010.
- Forsgren, Nicole et al. *Accelerate*. IT Revolution, 2018.
- Fowler, Martin. *Continuous Integration*, 2006.

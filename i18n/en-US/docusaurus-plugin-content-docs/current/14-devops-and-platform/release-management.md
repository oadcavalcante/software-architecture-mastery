---
id: release-management
title: Release Management
sidebar_position: 13
description: What remains of coordination when delivery is continuous — and what should have stopped existing.
doc_type: concept
level: 5
difficulty: intermediate
status: complete
objective: >
  By the end, the reader distinguishes necessary coordination from inherited ceremony,
  and decouples release from deployment.
prerequisites: [ci-cd]
related: [ci-cd, feature-flags, deployment-strategies]
canonical_for: []
translated_from_version: 1
last_reviewed: 2026-08-31
---

# Release Management

## Overview

Release management is the coordination around what goes to users: what goes in, when, with what
communication, and what happens if it goes wrong.

With [continuous delivery](/14-devops-and-platform/ci-cd.md), much of the traditional coordination stops
making sense — and it frequently remains out of habit.

The work is separating the two: the **coordination that is still necessary** and the **ceremony inherited**
from a context where deploying was expensive and risky.

## Problem

The traditional process was designed for a world where deploying was an event: a maintenance window, a
large batch of changes, chained approvals, a manual rollback plan.

When the deployment comes to take minutes and the rollback to be automatic, that process still exists — and
it becomes the bottleneck.

The recognizable symptom: the pipeline takes 8 minutes, and the change takes 11 days to reach production.
None of those 11 days is technical.

## Core Concepts

### Deploying, releasing and announcing are different things

```text
deploying    the code is in production
releasing    users can use the feature
announcing   users know it exists
```

With no [feature flags](/14-devops-and-platform/feature-flags.md), all three happen together — and the
coordination has to happen at the moment of deployment, which is the most delicate technical moment.

With flags, they separate: the code goes to production when it is ready, the release happens when the
business decides, and the announcement when marketing wants.

That removes most of the coordination from the technical path — and it is the change that most simplifies
release management.

### What still needs coordination

Being specific, because the list is short:

```text
changes affecting several systems     the order matters
changes with an external counterpart  the partner needs to be ready
regulatory requirements               documented approval
communication to customers            visible changes, training
high-risk events                      critical business dates
large data migrations                 a window and a plan
```

Everything else — most changes — needs no coordination at all.

The mistake is applying the first list's process to everything.

### A freeze: when it makes sense and when it does not

Freezing changes during critical periods — Black Friday, fiscal close, elections — is a defensible practice
and frequently badly applied.

```text
it makes sense    a short window, a very high risk event, accumulated changes reviewed
it does not       a long freeze, which accumulates a large batch
                  → the unfreeze becomes the year's riskiest event
```

The paradox: the longer the freeze, the riskier the deployment that follows — because it carries weeks of
changes at once, exactly the opposite of small batches.

See [continuous integration](/14-devops-and-platform/ci-cd.md).

The alternative that works: instead of freezing, increasing the rigor — a mandatory canary, an additional
approval, lower-traffic windows. The changes stay small.

### Release notes derived, not written

A record of what changed is useful — for support, for the customer, for investigation.

And, written by hand, it goes stale. What sustains it:

```text
derived from the merged changes
with automatic categorization — fix, feature, internal
generated on each deployment
what is user-visible, separated from the internal
```

The last distinction matters: a customer does not want to read a hundred refactoring entries. The external
note is curated; the internal one is complete.

### Version when somebody depends

```text
a public API          explicit versioning, see schema evolution
a library             semantic versioning
an internal application  frequently unnecessary — the deployment identifier is enough
a mobile app          mandatory versioning, with old versions in circulation
```

The third line contradicts habit: a continuously deployed service does not benefit from version numbers.
What matters is the artifact's identifier and the deployment history.

The last case is the most restrictive: old mobile app versions stay in use for months, and the server needs
to support them. See [integration contracts](/08-integration-architecture/integration-contracts.md).

### The rollback plan needs to be the default

Instead of a plan per release, a mechanism:

```text
automated rollback, tested
a defined triggering criterion
clear authority — who decides
communication anticipated
```

See [deployment strategies](/14-devops-and-platform/deployment-strategies.md) and
[resilience](/12-reliability/resilience.md).

If each release needs a specific rollback plan, the rollback is not resolved — it is being improvised each
time.

### Who decides what goes together

An organizational decision that usually stays implicit: when several changes are ready, who decides what
goes into the same deployment?

Three models, with different implications:

**Each change on its own.** The deployment is triggered by the merge. No decision, no coordination. It is
the model continuous delivery presupposes, and the one that produces the smallest batches.

**Grouping by window.** Everything merged in the period goes together. It reduces the number of deployments
and increases the batch — with all the consequences for diagnosis and rollback.

**Curation.** Somebody decides each release's content. It makes sense when there is interdependence between
changes, and it is where the coordination usually accumulates unnecessarily.

The third model has a hidden cost: it creates a queue and a decider, and both become bottlenecks. When it
is adopted out of caution — and not from real interdependence — the result is a larger batch, a coarser
rollback and a harder diagnosis.

The question that decides: do those changes **need** to go together, or is it more comfortable that
somebody reviews the set?

## Mental Model

**Separate deploying from releasing, and the coordination leaves the technical path.** What remains of
coordination is small and specific.

## When to Use

- Changes that cross systems or organizations.
- Regulatory approval requirements.
- Communication to customers.
- Critical business events.
- Large data migrations.

## When Not to Use

**As a default process for every change.**

**A long freeze.**

**Hand-written release notes.**

**Versioning internal applications** with no external consumer.

**A rollback plan per release** instead of a mechanism.

**Chained approval** for low-risk changes.

## Alternatives

- **[Feature flags](/14-devops-and-platform/feature-flags.md)** — they separate release from deployment,
  removing most of the coordination.
- **[Canary](/14-devops-and-platform/canary.md)** — it reduces the risk with no human coordination.
- **Progressive release by segment** — internal, beta, general.
- **Approval by risk class** — only the risky goes through approval.

## Trade-offs

| Light coordination | A formal process |
|---|---|
| Fast delivery | Predictability |
| Less central visibility | Traceability |
| Trusts automation | Human verification |
| Small batches | Large |

| Freezing | Increasing rigor |
|---|---|
| No changes | Careful changes |
| An accumulated batch | Continuous flow |
| A risky unfreeze | No event |

## Failure Modes

**The process as a bottleneck.** Days of waiting for trivial changes.

**A freeze producing a large batch.**

**Out-of-date notes.**

**An improvised rollback.**

**Approval with no criterion.** Somebody signs without assessing, and the approval becomes ritual.

**Coordination for what does not need it.**

**Release coupled to deployment.** Every release becomes a technical event.

## Common Mistakes

**Applying the heavy process to everything.** Requiring the same approval for a text fix and for a schema
migration trains the team to treat the process as an obstacle — and to work around it precisely on the
changes that matter.

**Freezing for weeks.** The freeze accumulates changes and makes the first release afterward the largest
and riskiest of the year — the opposite of what the freeze intended.

**Not separating deploying from releasing.** When the two are the same thing, every code delivery is
exposure to the user, and the only way of controlling risk becomes not delivering.

**Writing release notes by hand.** They go stale in the first week. Generated from the commits and the
changes, they stay true with no effort.

**Not classifying changes by risk.** With no classification, either everything goes through the strictest
process, or nothing does. The distinction is what allows being fast on the trivial and careful on the
dangerous.

**Keeping approvals nobody actually assesses.** A rubber-stamped approval gives the impression of control
and provides none, besides diluting responsibility among those who signed without looking.

## Real-World Example

A financial services company had a release process inherited from the era of monthly deployments:

```text
a weekly approval committee
a release document filled in by hand
a specific rollback plan per release
a two-week freeze at quarterly closes
hand-written release notes
```

The pipeline took 9 minutes. The time between a change being ready and production was **11 days**.

The analysis showed where the time went: 8 of the 11 days were waiting for the committee and filling in
documents.

And the quarterly freeze produced the known effect: the unfreeze released two weeks of changes at once, and
three of the last four serious incidents had happened on those days.

The reformulation:

**Classification by risk**, declared by the author:

```text
low     no observable behavior change, reversible → automatic
medium  a behavior change → mandatory canary, no approval
high    a migration, an external contract, regulatory → approval
```

The committee came to see around 8% of the changes, and the discussion in it became substantive.

**Feature flags** to separate release from deployment. The changes came to go to production disabled, and
the release became a product decision — with no committee involved.

**Release notes derived** from the merged changes, with a separation between user-visible and internal.

**Rollback as a mechanism**, tested monthly, replacing the plan per release.

**The end of the freeze**, replaced by increased rigor: in the critical periods, everything goes through a
canary with an extended window and two-person approval. The changes kept flowing in small batches.

Result in eight months: time to production from 11 days to 5 hours, deployments from 3 per week to 40, and
incidents caused by deployment reduced by 55%.

And the committee, which was seen as bureaucracy, came to be valued — because it discussed only the changes
that deserved discussion.

The recorded lesson: the freeze was the most internally defended practice, with the argument of protecting
the critical periods. The data showed the opposite — it concentrated risk instead of reducing it.

## Related Concepts

- [Continuous Integration](/14-devops-and-platform/ci-cd.md).
- [Feature Flags](/14-devops-and-platform/feature-flags.md) — the central separation.
- [Deployment Strategies](/14-devops-and-platform/deployment-strategies.md).
- [Canary](/14-devops-and-platform/canary.md).

## Practical Exercise

Measure the time between "the change is ready" and "the change is in production", and separate how much is
technical and how much is waiting.

If the waiting dominates, the bottleneck is the process — and it was probably designed for a context that
no longer exists.

## Interview Questions

- Why does a long freeze increase the risk?
- How do flags remove coordination from the technical path?
- Why do internal applications frequently not need versioning?

## Further Reading

- Humble, Jez; Farley, David. *Continuous Delivery*. Addison-Wesley, 2010.
- Forsgren, Nicole et al. *Accelerate*. IT Revolution, 2018.
- Kim, Gene et al. *The DevOps Handbook*. IT Revolution, 2016.

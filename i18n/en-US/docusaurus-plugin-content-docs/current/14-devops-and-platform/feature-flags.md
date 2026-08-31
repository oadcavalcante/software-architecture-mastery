---
id: feature-flags
title: Feature Flags
sidebar_position: 8
description: Separating deploying from releasing — the highest-impact technique, and the one that accumulates the most debt.
doc_type: pattern
level: 5
difficulty: intermediate
status: complete
objective: >
  By the end, the reader uses flags with a defined type and lifecycle, and avoids the
  accumulation that makes the code incomprehensible.
prerequisites: [ci-cd]
related: [ci-cd, canary, release-management]
canonical_for: []
translated_from_version: 1
last_reviewed: 2026-08-31
---

# Feature Flags

## Overview

A feature flag is a condition that decides, at runtime, whether a behavior is active.

It separates two things that normally go together: **deploying** the code and **releasing** the feature.

That separation is this section's highest-impact technique — it enables continuous integration with
incomplete code, progressive release, rollback with no deployment, and experiments.

And it is the one that accumulates the most debt: each flag is one more branch in the code, and they do not
remove themselves.

## Problem

With no flags, deploying is releasing. That forces three bad things:

**Long-lived branches**, because incomplete code cannot go into the main branch. See
[continuous integration](/14-devops-and-platform/ci-cd.md).

**Rollback by deployment**, which takes minutes or more and undoes everything that came with it.

**Releasing to everybody at once**, with no possibility of exposing a fraction first.

Flags resolve all three. And they introduce a permanent cost that needs to be managed.

## Core Concepts

### The types, with different lifecycles

The distinction that avoids most of the problems:

```text
release       hides incomplete code until it is ready
              life: days to weeks → remove
operational   allows turning a feature off during an incident
              life: permanent → keep
experiment    compares variants
              life: weeks → remove after deciding
permission    enables per customer, plan or segment
              life: permanent → it is a business rule, not a flag
```

The release and experiment ones **have to be removed**. The operational and permission ones stay — and the
last, in fact, should be modeled as a business rule, not as a flag.

Mixing the four types in the same mechanism, with no distinction, is what produces the accumulation.

### Every temporary flag needs a deadline

A release flag with no removal date is never removed. That is not a discipline failure — it is the
predictable behavior of any item with no owner and no deadline.

What works:

```text
a mandatory expiration date at creation
an alert when it passes the deadline
a pipeline failure when it passes by a lot
a periodic review of the active ones
```

The third is aggressive and it is the one that works: a flag 90 days past its deadline breaks the build
until somebody decides to remove it or renew the deadline with a justification.

### The cost is combinatorial

Each flag doubles the code's possible paths.

```text
1 flag     2 states
5 flags    32 combinations
10 flags   1,024
```

That matters for three reasons: you do not test every combination; the behavior in production depends on a
configuration that is not in the code; and reading the code gets harder.

The practical consequence: flags should be **independent**. Two flags that interact — where one's behavior
depends on the other's state — are the origin of this technique's hardest defects.

### Evaluation requires context and cannot fail open

```text
evaluation      depends on who — user, organization, region, version
consistency     the same user should see the same result
default value   what happens if the flags service does not respond
performance     local evaluation, not a network call per check
```

The third item is the most consequential: if the flags service becomes unavailable and the default is
"active", an incomplete feature goes to production. See
[security failure modes](/10-security/security-failure-modes.md).

The safe default for release flags is **off**; for operational flags, it is the last known state.

And the evaluation needs to be local — the configuration is distributed and evaluated in memory, with
periodic refresh. A network call per check adds latency and a critical dependency on the hot path.

### A flag does not replace testing

A common temptation: "let's release it and see what happens".

Flags reduce the **reach** of the error, not its probability. A broken feature released to 1% of users
breaks for 1% of users.

They are complementary to verification, not alternatives. See [canary](/14-devops-and-platform/canary.md) —
the difference is that a canary compares metrics automatically and reverts, while a flag only exposes.

### Flag state is production configuration

Whoever can change a flag can change the system's behavior in production, immediately, with no code review.

That requires the same care as any production change:

```text
auditing      who changed what, when
permission    not everybody changes everything
review        for critical flags
propagation   how long until the change takes effect on every instance
```

The last is operationally important: during an incident, "I turned the flag off" and "the flag is off
everywhere" can be minutes apart.

## Mental Model

**A flag separates deploying from releasing, and it charges a branch in the code.** The temporary ones need
a deadline; the permanent ones need a justification.

## When to Use

- Integrating incomplete code into the main branch.
- Releasing progressively to fractions of users.
- Turning a feature off during an incident. See
  [graceful degradation](/12-reliability/graceful-degradation.md).
- Experimenting with variants.
- Migrating between implementations, with a way back.

## When Not to Use

**With no deadline**, for the temporary ones.

**For a permanent business rule.** That is modeling, not a flag.

**With interdependent flags.**

**With an active default** in case of a flags service failure.

**As a substitute for testing.**

**With evaluation by network call** on the hot path.

**With no auditing of changes.**

## Alternatives

- **Short-lived branches** — for small changes, integrating in a day does away with the flag.
- **[Canary](/14-devops-and-platform/canary.md)** — it exposes gradually with automatic metric comparison.
- **Configuration per environment** — when the difference is between environments, not between users.
- **A modeled business rule** — for what is permanent and depends on the plan or the profile.

## Trade-offs

| With flags | Without |
|---|---|
| Deploy without releasing | Coupled |
| Rollback in seconds | By deployment |
| Progressive release | All at once |
| Branches in the code | A single path |
| Debt to manage | None |
| Production configuration to govern | Less surface |

| Local evaluation | Remote |
|---|---|
| No latency | A call per check |
| Propagation delay | Immediate |
| No critical dependency | With one |

## Failure Modes

**Accumulation.** Hundreds of flags, nobody knows what they do.

**Interdependent flags.** Unpredictable behavior in certain combinations.

**An active default on failure.** An incomplete feature exposed.

**A change with no auditing.**

**Slow propagation during an incident.**

**Dead code behind a flag turned off for years.**

**Inconsistency.** The same user sees different behaviors between requests.

## Common Mistakes

**Not defining the type and deadline at creation.** A release flag and an operational flag have opposite
lifecycles. Without declaring which it is, they all become permanent.

**Not removing the temporary ones.** Each active flag doubles the code's possible paths. Twenty forgotten
flags produce a combination space no test covers.

**Using a flag for a business rule.** A rule in a configuration panel escapes review, testing and history —
and comes to change behavior with no trace.

**Not defining the default behavior under failure.** When the flags service becomes unavailable, the system
needs to know which path to take. With no declared default, the flags service's unavailability becomes the
product's unavailability.

**Letting flags interact.** Two flags that combine create a state nobody tested and that only appears for
the subset of users in both.

**Not auditing changes.** A changed flag is a behavior change in production. With no record of who changed
what and when, it disappears from the incident investigation.

## Real-World Example

A commerce platform adopted feature flags and, in three years, accumulated **740 active flags**.

The effects:

**Illegible code.** Some modules had five or six nested flag conditions. Reading them required consulting
the production configuration to know which path was active.

**A defect from interaction.** Two flags created by different teams, which worked on their own, produced an
invalid state when both were active — a situation occurring for 3% of users. It took six weeks to
diagnose.

**Dead code.** An audit found 310 flags turned off for more than a year, with the code for both paths still
present.

**No auditing.** A flag change during an incident was made by somebody who did not remember making it, and
the record did not exist.

The reformulation:

**Mandatory typing.** Each flag declares its type and, for the temporary ones, an expiration date.

**A build failure** for release flags more than 60 days past their deadline. That removed 280 flags in the
first four months — most through actual code removal, not through deadline renewal.

**Independence verified.** A review rule came to require that new flags not depend on other flags' state.
Legitimate cases of dependency became a single flag with more than two states.

**An off default** for release, the last known state for operational.

**Auditing of changes**, with permission by criticality.

**Local evaluation** with up to 30 seconds of propagation, replacing the network call that existed on the
checkout path.

In eighteen months, the 740 flags became **94** — of which 61 are permanent operational ones, with a
recorded justification.

The recorded lesson: the technique was never the problem, and it is still the most valuable one they
adopted. What was missing was the lifecycle — creating was easy and removing had no owner.

## Related Concepts

- [Continuous Integration](/14-devops-and-platform/ci-cd.md) — what flags enable.
- [Canary](/14-devops-and-platform/canary.md) — release with automatic comparison.
- [Release Management](/14-devops-and-platform/release-management.md).
- [Graceful Degradation](/12-reliability/graceful-degradation.md) — the operational flags.

## Practical Exercise

Count the active flags in your system and classify them by type.

Then check how many of the temporary ones are past their deadline — or, if there is no deadline, how long
the oldest one has existed.

## Interview Questions

- What are the four flag types, and which need to be removed?
- Why are interdependent flags dangerous?
- Why does the default behavior under a flags service failure matter?

## Further Reading

- Hodgson, Pete. *Feature Toggles*. martinfowler.com, 2017.
- Humble, Jez; Farley, David. *Continuous Delivery*. Addison-Wesley, 2010.
- Forsgren, Nicole et al. *Accelerate*. IT Revolution, 2018.

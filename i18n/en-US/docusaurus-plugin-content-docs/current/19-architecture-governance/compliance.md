---
id: compliance
title: Compliance
sidebar_position: 5
description: Continuously verifying what matters, instead of periodically auditing what is easy.
doc_type: concept
level: 6
difficulty: advanced
status: complete
objective: >
  By the end, the reader designs continuous compliance verification and can tell real
  compliance from demonstrable compliance.
prerequisites: [governance-standards]
related: [governance-standards, fitness-functions-governance, exceptions]
canonical_for: []
translated_from_version: 1
last_reviewed: 2026-08-31
---

# Compliance

## Overview

Compliance is the verification that reality matches what was decided — standards followed,
controls in place, regulatory requirements met.

The design of the verification decides almost everything:

```text
periodic audit          a periodic photograph, expensive, preparable
continuous verification a film, cheap per run, not preparable
```

The difference is not one of rigor. It is that the first measures a chosen moment, and the
second measures the real state. Systems prepared for an audit pass the audit; systems
verified continuously are either compliant, or the deviation shows up the same day.

And there is a trap specific to this area: what is easy to verify is not what matters most,
and what gets measured is the easy thing.

## Problem

The classic audit-based compliance cycle:

```text
month 1     an audit is announced for six weeks out
month 2     teams fix what they know will be looked at
month 3     audit: 94% compliance
months 4-11 silent drift
month 12    a new cycle
```

The 94% figure is true about month 3 and false about the year. What was measured was the
organization's ability to prepare, not its state.

And the second problem is one of selection. Verifying that a document exists is easy;
verifying that the control works is hard. Compliance programs migrate, over time, toward the
verifiable — and come to measure the existence of artifacts.

```text
easy to verify        the document exists, the field is filled in,
                      the policy was signed
hard and important    the control works, the data is protected,
                      the decision was made with the right information
```

## Core Concepts

### Continuous compliance

```text
verification run on every change, or daily
the result visible to the team, not only to audit
a deviation detected within hours
no preparation window
```

That changes the nature of the work: instead of a concentrated effort before the audit,
compliance becomes a maintained property — like a test that cannot break.

See [fitness functions](/19-architecture-governance/fitness-functions-governance.md), which
are the natural implementation.

### Verify the effect, not the artifact

```text
artifact   "a documented password policy exists"
effect     "no active account has a password outside the policy"

artifact   "the system has a recovery plan"
effect     "the restore was tested in the last 90 days, with a result"

artifact   "there is an architecture diagram"
effect     "the deployed services match the diagram"
```

The right-hand column is more expensive to build and it is the only one that informs.
Programs that only verify the left produce organizations with impeccable documentation and
nonexistent controls.

### Drift is the natural state

Systems in flux diverge from what is declared through the accumulation of small decisions,
without anyone deciding to diverge:

```text
a temporary exception that doesn't expire
a configuration adjusted during an incident and not reverted
a new service created outside the template
a dependency upgraded with a behavior change
```

Compliance is not a state you reach; it is a state **maintained against drift**. That implies
verification has to be as continuous as the change.

### Evidence has to be a by-product, not work

```text
bad    someone collects screenshots and fills in a spreadsheet
good   the verification records the result with a timestamp,
       and the record is the evidence
```

When producing evidence is manual work, it is produced close to the audit and describes the
moment of collection. When it is a by-product of automated verification, it describes the
entire period.

That also solves the cost: manual compliance programs consume effort proportional to the
number of systems, which doesn't scale.

### Compliance is not security

A distinction that avoids undue confidence:

```text
compliance   meets what was specified
security     resists whoever tries
```

A system can be 100% compliant and insecure, if the specification doesn't cover the real
threat. The reverse also happens: a secure system can fail compliance for not producing the
required evidence.

Treating compliance as proof of security is one of the most expensive errors in this area.
See [threat modeling](/10-security/threat-modeling.md).

### Not everything needs the same level

```text
regulatory requirement          mandatory verification, evidence retained
critical security control       continuous verification, alarm
important internal standard     verification with a report to the team
preference                      don't verify
```

Verifying everything with the same rigor produces noise, and noise makes the alerts that
matter get ignored. See [measurement](/19-architecture-governance/measuring-governance.md).

### The result has to reach whoever can act

A compliance report that goes to a committee and not to the team is information in the wrong
place.

```text
for the team     actionable, in the workflow, with what to do
for management   aggregated, trend, risk
for audit        evidence retained, with history
```

The three audiences need different cuts of the same data. The team's is the only one that
produces a fix.

## Mental Model

**Continuous, about effect, with automatic evidence.** If you can prepare for it, what you
measure is preparation.

## When to Use

- For regulatory requirements, always with evidence retained.
- For critical security controls, continuously.
- For standards at risk of drift.
- Wherever verification can be automated.

## When Not to Use

**By periodic audit only**, when change is continuous.

**Over artifacts**, when the effect is verifiable.

**For everything with the same rigor.**

**With manual evidence**, if an automated alternative exists.

**As proof of security.**

**Without reaching whoever can fix it.**

## Alternatives

- **[Fitness functions](/19-architecture-governance/fitness-functions-governance.md)** — the
  same mechanism, focused on an architectural property.
- **Preventive controls** — prevent rather than detect; better where applicable.
- **Sampling** — when full verification is infeasible, with a random and not a chosen
  sample.
- **Team attestation** — cheap, and worth exactly as much as the honesty and knowledge of
  whoever attests.

## Trade-offs

| Continuous | Periodic audit |
|---|---|
| Real state | A chosen moment |
| Not preparable | Preparable |
| High up-front cost | Recurring effort cost |
| Requires automation | Requires people |

| Verifying the effect | Verifying the artifact |
|---|---|
| Informs | Easy and cheap |
| Expensive to build | Scales trivially |
| Hard to game | Gameable |

## Failure Modes

**Preparing for the audit.** What gets measured is preparation.

**Migration toward the easy.** Document compliance.

**Drift between cycles.** Real compliance far below the measured figure.

**Manual evidence.** Expensive and dated.

**Noise.** Verifying everything makes what matters get ignored.

**Compliance confused with security.**

## Common Mistakes

**Measuring the existence of a document.**

**Not expiring exceptions**, which become permanent drift. See
[exceptions](/19-architecture-governance/exceptions.md).

**Reporting only upward.**

**Verifying only what is already automated**, without covering what matters and is hard.

**Not retaining historical evidence**, which forces reconstruction under pressure.

## Real-World Example

A digital bank had architectural compliance verified by a semiannual internal audit, sampling
20% of the systems.

The results were consistently good — between 91% and 96% over three years.

An incident changed the reading. A service with customer data was exposed for 11 days with
authentication disabled, after a configuration change made during an incident and never
reverted. The service had passed the audit four months earlier.

The investigation included a one-off check of all 210 systems, not sampled:

```text
compliance measured in the last audit (20% sample)      94%
real compliance, full verification                      61%
systems with an expired exception still in use          38
systems missing from the audit inventory                17
controls verified by document, not by effect            9 of 14
```

The 17 missing from the inventory were systems created after the last cycle — the inventory
was updated manually, before each audit.

The rework, over 14 months:

**A derived inventory**, not maintained: every deployed service automatically enters scope,
from the orchestrator. That eliminated the 17 at once.

**Continuous verification** of 11 of the 14 controls, run daily against the real state. The
remaining three — which required judgment — stayed on a quarterly manual review, with a
narrowed scope and a justified cost.

**From artifact to effect.** The 9 controls verified by document were rewritten: "a retention
policy exists" became "no store holds data beyond its declared retention period".

**Exceptions with automatic expiry.** An exception with no renewal becomes a deviation the
day after it lapses, with an alert to the system owner and to their manager. See
[exceptions](/19-architecture-governance/exceptions.md).

**A per-team dashboard**, with the daily verification result in the same place the team
watches the service — not in a separate compliance portal.

**Automatic evidence**, retained for 24 months, generated by the verification itself.

Results after 14 months:

```text
real compliance, measured daily              89%
average time between deviation and fix        2.4 days (before: up to 6 months)
systems missing from the inventory            0
expired exceptions in use                     0
audit preparation effort                     from ~600 h/year to ~40 h/year
```

In the retrospective: the 94% figure was never a lie — it was true about the sample and about
the day. The error was reading it as a statement about the organization.

And the figure that changed behavior most was not the compliance rate, but the time between
deviation and fix. It turned compliance from an event into a maintained property.

## Related Concepts

- [Standards](/19-architecture-governance/governance-standards.md) — what gets verified.
- [Fitness Functions](/19-architecture-governance/fitness-functions-governance.md) — the
  implementation.
- [Exceptions](/19-architecture-governance/exceptions.md) — the authorized deviation.
- [Auditability](/10-security/auditability.md).

## Practical Exercise

Pick a compliance control in your context and answer: does it verify an artifact or an
effect?

If it's an artifact, write the version that verifies the effect. The cost difference between
the two is what the organization saved by measuring the easy thing.

## Interview Questions

- Why can a high audit compliance rate coexist with low real compliance?
- Why should evidence be a by-product of the verification?
- Why is compliance not proof of security?

## Further Reading

- Kim, Gene et al. *The DevOps Handbook*. 2nd ed. IT Revolution, 2021.
- Ford, Neal et al. *Building Evolutionary Architectures*. 2nd ed. O'Reilly, 2022.
- Bird, Jim. *DevOpsSec*. O'Reilly, 2016.

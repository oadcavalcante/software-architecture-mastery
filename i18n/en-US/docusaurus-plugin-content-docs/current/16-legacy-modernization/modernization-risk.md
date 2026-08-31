---
id: modernization-risk
title: Modernization Risk
sidebar_position: 11
description: What goes wrong, and the controls that reduce the probability and the damage.
doc_type: concept
level: 6
difficulty: advanced
status: complete
objective: >
  By the end, the reader identifies the risks characteristic of modernization and applies
  the controls that address them.
prerequisites: [migration-strategies]
related: [organizational-constraints, data-migration, incremental-modernization]
canonical_for: []
translated_from_version: 1
last_reviewed: 2026-08-31
---

# Modernization Risk

## Overview

Modernization is one of the highest-risk activities in software engineering: it touches
systems that work, that sustain revenue, and that nobody fully understands.

The risks are known and recurring. And most of them have a control — what distinguishes
projects that succeed from those that don't is frequently knowing which ones to apply.

This document organizes the risks by nature, with the corresponding control.

## Problem

The typical risk register of a modernization project lists the generic:

```text
"schedule delay"
"resistance to change"
"technical complexity greater than estimated"
```

None of them points at a control. And they omit the risks specific to this activity,
which are different from those of a new build.

## Core Concepts

### Irreversible risks deserve separate treatment

The distinction that organizes prioritization:

```text
reversible     the project is late, costs more, delivers less
irreversible   data lost, knowledge lost, an obligation breached
```

The irreversible ones are few and deserve disproportionate control:

```text
data loss in the migration       → see data migration
knowledge loss                   → transfer before starting
premature shutdown of the old one → suspension period, access monitoring
a business rule lost             → characterization tests
a regulatory obligation breached → explicit requirement mapping
```

See [data migration](/16-legacy-modernization/data-migration.md) and
[legacy systems](/16-legacy-modernization/legacy-systems.md).

### The characteristic technical risks

```text
risk                          control
parity not achieved           characterization tests, comparison in production
unknown behavior              archaeology before deciding
data that doesn't fit         profiling before planning
hidden dependency             inventory by observation, not by interview
different performance         test with real volume, not synthetic
broken integration            verified contract, consumers mapped
```

The third and the fourth are the ones that most frequently show up as a surprise, and both
are detectable in advance by observation. See
[current state architecture](/15-enterprise-architecture/current-state-architecture.md).

### The execution risks

```text
scope growing            strict parity as the rule; improvements later
moving target            freeze the old one, or strangler fig
late value               defensible slices. See incremental modernization
permanent coexistence    completion criterion and shutdown date
estimate as a promise    a range, not a point; re-estimate per slice
```

The first is the most predictable: every modernization receives improvement requests, and
accepting them is the path of least resistance.

### The organizational risks

See [organizational constraints](/16-legacy-modernization/organizational-constraints.md).

```text
support evaporating      value early, multiple sponsors
knowledge leaving        transfer as the first stage
resistance               identify who loses, address it
product on hold          an agreed proportion
wrong team               whoever will operate it takes part in building it
```

These are the ones that most frequently determine the outcome, and the ones that least
often appear in technical projects' risk registers.

### Controls that apply in any modernization

Regardless of the strategy:

```text
comparison in production   the new one processes in parallel, without responding
reversibility per slice    every step has a way back
monitoring the old one     knowing who still uses it
data verification          multiple levels, not just count
rehearsal                  the cutover operation is repeated beforehand
suspension period          off, recoverable, before discarding
```

The first is the most valuable and the least used: making the new one process real
traffic, with no effect, and comparing. See
[deployment strategies](/14-devops-and-platform/deployment-strategies.md).

It turns "we believe it is equivalent" into evidence.

### The risk of not doing it also has to be recorded

The asymmetric comparison: the risk of modernizing is visible and concentrated; the risk
of not modernizing is diffuse and continuous.

```text
not doing it   degradation, a maintainer who leaves, an obligation unmet,
               a capability that cannot be delivered
```

See [modernization drivers](/16-legacy-modernization/modernization-drivers.md).

Recording both sides is what makes an informed decision possible — and it is what is
missing when the proposal is rejected for looking too risky.

### Some risks only appear over the complete cycle

Systems have cycles that do not manifest in weeks:

```text
monthly close
quarterly reporting
annual processes — tax filing, contract renewals
seasonality — end-of-year peak, harvest, school term
```

A new system validated over two months has exercised none of them.

The control: keep the old one able to take over until at least one complete cycle has
passed — and plan the shutdown around that, not around the project calendar.

### The risk register has to be revised with what you learn

Modernization is discovery work, and the risks change as the system is understood.

```text
at the start     hypothetical risks, based on what is assumed
after slice 1    real risks, based on what was found
```

The archaeology and the first slice produce information that substantially alters the
register: risks that looked serious turn out to be small, and risks nobody anticipated
appear.

The pattern that fails: the register is written at project approval and never touched
again. It describes the concerns of people who did not know the system.

What works: a review at each slice, with three questions:

```text
what did we discover that changes the assessment of a risk?
what new risk appeared?
which control turned out to be unnecessary?
```

The third matters as much as the others: controls that cost something and catch nothing
should go, or they make the project slower without reducing risk — and excess ceremony
discredits the controls that matter.

## Mental Model

**Separate the reversible from the irreversible.** The first costs; the second has no way
back, and deserves disproportionate control.

## When to Use

- Before starting any modernization program.
- In the program's periodic review.
- When deciding about shutting down the old system.
- When assessing whether the program should continue.

## When Not to Use

**A generic register**, with no associated control.

**Without separating reversible from irreversible.**

**Without recording the risk of not doing it.**

**Shutting the old one down before a complete cycle.**

**Relying on sample verification** for critical data.

**Ignoring the organizational risks** for being "outside the technical scope".

## Alternatives

Ways to reduce risk before any control:

- **Smaller scope.** Modernize the part that causes the problem. See
  [migration strategies](/16-legacy-modernization/migration-strategies.md).
- **Smaller slices.** They reduce exposure per step.
- **Containment instead of replacement** — isolate the legacy system, without touching
  it.
- **Defer** — when the conditions are not there.

## Trade-offs

| More controls | Fewer |
|---|---|
| Lower risk | Higher |
| Slower project | Fast |
| Verification cost | None |
| Verified confidence | Assumed |

| Shut down early | Keep in parallel |
|---|---|
| Lower cost | Doubled |
| No way back | Reversible |
| Cycles not exercised | Exercised |

## Failure Modes

**Data lost.**

**A business rule lost.** Discovered when someone complains.

**The old one shut down early.** A forgotten use case.

**A problem at the monthly close.** Outside the rollback window.

**The program interrupted with no value.**

**Knowledge leaving during the project.**

**Scope growing until it becomes unviable.**

## Common Mistakes

**A generic risk register.** "Risk of delay" applies to any project and suggests no mitigation at all. A useful risk is specific to the system and the migration at hand.

**Not separating the irreversible.** Reversible risks deserve experiments; irreversible ones deserve analysis. Treating both the same spends care in the wrong place and saves it where you can't.

**Not doing comparison in production.** Running the new system in parallel and comparing its outputs against the old one is the cheapest way to find divergence before it affects anyone.

**Not exercising a complete cycle before shutting down.** Monthly close, reconciliation and annual reports only appear in their own cycle — and that is where the forgotten rule reveals itself.

**Not recording the risk of not doing it.** The relevant comparison is against carrying on as is, and without that side the analysis shows only the cost of change.

**Treating organizational risk as out of scope.** Loss of sponsorship, reorganizations and the departure of whoever holds the knowledge bring down more modernizations than technical problems.

## Real-World Example

An energy company replaced its billing system. The program had a risk register, monthly
review, and was executed with technical competence.

It produced an incident that was expensive, and that was among the predictable risks of
this activity.

The new system went into production in March, with the old one kept in parallel for 60
days. In May, with everything stable, the old one was shut down.

In December, the annual reporting process failed.

The cause: a sector-charge apportionment rule, applied once a year, at the December close.
It existed in the old system, in a module that ran annually and that no test had
exercised — because the parallel period ran from March to May.

The old system was already off, and the machines decommissioned.

Recovery took seven weeks, with the rule reconstructed from regulatory documentation and
from previous years' results. The report to the regulator was delivered late.

The process changes afterwards:

**A complete cycle before shutting down.** No system is shut down before the new one has
exercised every cycle — monthly, quarterly, annual.

For the following program, that meant keeping the old one for 14 months instead of 2. The
cost was accepted.

**An inventory of periodic processes.** An explicit survey of everything that runs at a
frequency longer than monthly, with a date and an owner.

That survey, done retroactively, found four more annual processes in other systems that
nobody had mapped.

**A suspension period.** The old system spends 90 days off but recoverable, before
decommissioning.

**Comparison in production** throughout the parallel run, with the old one processing in
shadow after the cutover — which would have detected the December divergence with the old
one still available.

The detail the team highlights: the risk of "a periodic process not exercised" was not in
the register. It is specific to modernization, and it does not appear in generic project
risk lists — which was the template used.

## Related Concepts

- [Data Migration](/16-legacy-modernization/data-migration.md) — the main irreversible risk.
- [Organizational Constraints](/16-legacy-modernization/organizational-constraints.md).
- [Incremental Modernization](/16-legacy-modernization/incremental-modernization.md) — the structural control.
- [Reliability](/12-reliability/index.md).

## Practical Exercise

List the periodic processes of the system you intend to replace — monthly, quarterly,
annual.

The parallel period has to cover the longest of them. If it doesn't, the shutdown is a
gamble.

## Interview Questions

- How do you separate reversible from irreversible risk?
- Why is comparison in production the most valuable control?
- Why does the complete cycle have to be exercised before shutting down?

## Further Reading

- Feathers, Michael. *Working Effectively with Legacy Code*. Prentice Hall, 2004.
- Newman, Sam. *Monolith to Microservices*. O'Reilly, 2019.
- Nygard, Michael. *Release It!*. 2nd ed. Pragmatic Bookshelf, 2018.

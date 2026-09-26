---
id: disaster-recovery
title: Disaster Recovery
sidebar_position: 16
description: Getting back to operating after what should not happen — and why a plan nobody executed is not a plan.
doc_type: concept
level: 5
difficulty: advanced
status: complete
objective: >
  By the end, the reader defines time and loss objectives with the business, and
  chooses the strategy that meets them at the lowest cost.
prerequisites: [regions]
related: [multi-region, availability-zones, data-replication]
canonical_for: []
translated_from_version: 2
last_reviewed: 2026-08-31
---

# Disaster Recovery

## Overview

Disaster recovery is the set of decisions and procedures for getting back to operating after an event
normal redundancy does not cover: the loss of a region, data corruption, accidental deletion, an attack
that encrypts the data.

It is different from high availability. High availability keeps common failures from becoming
unavailability. Disaster recovery deals with what happens when that was not enough.

And it comes down to two numbers — which need to come from the business, not from engineering.

## Problem

Almost every company has backups. Far fewer companies can restore them when they need to.

The reasons repeat from one case to the next: the restore was never tested, the procedure is out of date, the backup
does not contain everything, or the restore takes too long to be useful.

The result is a plan that exists in a document and not in capability.

## Core Concepts

### The two numbers

**[RTO](/12-reliability/rto.md) — recovery time objective.** How long until you are operating again.

**[RPO](/12-reliability/rpo.md) — recovery point objective.** How much data can be lost.

```text
RPO ─────────────┤ disaster ├───────────── RTO
     data lost                downtime
```

Why both are priced business decisions rather than technical estimates is covered in each one's own
document. What matters here is what they buy in the cloud: each strategy below is a point on the trade
between continuous cost and the two numbers, and without them the choice among them is a guess.

### The strategies, by price

```text
                       typical RTO        typical RPO   cost
backups only           days               hours         very low
backups + automation   hours              minutes       low
pilot light            tens of minutes    minutes       medium
warm standby           minutes            seconds       high
active-active          seconds            ~zero         very high
```

**Pilot light** deserves attention: a minimal version of the environment stays on — the database
replicating, the network ready — and the compute capacity is created at activation. It costs a fraction of
a warm standby and delivers an RTO of tens of minutes.

It is the best cost-to-result ratio for most systems that need more than backups, and it is underused.

The price the table does not show: the standby environment drifts from production between one activation
and the next. Production gets a new image version, a configuration variable, a permission, and the standby
region does not; the account's instance quota in the target region stays at the default, sized for the
pilot and not for the load. The standby design only delivers the table's RTO if activation is exercised at
the same cadence as deployments — and if failing back to the origin region, which requires replicating
back the data written during the disaster, has been rehearsed too.

See [multi-region](/09-cloud-architecture/multi-region.md) for the higher designs.

### A backup is not replication

See [data replication](/07-data-architecture/data-replication.md). The distinction decides whether you
survive human error.

Replication copies everything, including the destructive command. A backup has history — it allows going
back to before the error.

The scenarios **only** the backup covers: accidental deletion, logical corruption, a defective migration,
and an attack that encrypts the data.

That last one deserves a note: such an attack typically goes for the backups first. That is why immutable
backups, or backups in a separate account with distinct credentials, stopped being excessive.

### The restore is what matters, not the backup

A backup that exists and does not restore is worse than none, because it produces false confidence.

What needs to be tested, periodically and for real:

**The complete restore works** — not just reading the file.

**How long it takes.** Restoring several terabytes can take longer than the RTO.

**What is included.** Databases, files, configuration, secrets, in-flight queues. Something is usually
missing.

**Who knows how to do it.** A procedure only one person knows is not a plan.

### The plan goes beyond data

The plan's scope — configuration, secrets, certificates, communication —, the triggering authority and the
order in which functions come back are covered in
[recovery planning](/12-reliability/disaster-recovery-planning.md). This document deals with the technical
strategy the plan triggers.

Two items of that scope change nature when recovery is to another region. **DNS**: a record with a one-day
time to live keeps clients pointed at the dead region for a day, however fast everything else comes up —
the time to live needs to fit in the RTO before the disaster. **External dependencies**: the payment
gateway or partner that allows calls by a list of source addresses refuses the new region until someone on
their side updates the list.

## Mental Model

**Each strategy is a continuous rent paid to shorten the two numbers — and what is rented only exists if
activation has been rehearsed.** Standby capacity that never received traffic is cost, not RTO.

## When to Use

Every system needs some strategy. The level depends on:

- The cost per hour of downtime.
- A regulatory requirement.
- Criticality to the business's operation.
- Contractual commitments.

## When Not to Use

**Warm standby or active-active when downtime does not pay for the capacity.** If the loss from an outage
of tens of minutes, multiplied by the expected frequency of region loss, falls below the annual difference
in continuous cost between pilot light and warm standby, the standby capacity buys an RTO the business
will not use.

**Backups only when the volume does not fit in the RTO.** Restoring 20 TB at 2 TB per hour takes ten
hours; with a four-hour RTO, no test makes the backup sufficient, and the strategy needs data already
replicated at the target.

**A multi-region strategy with no viable second target.** When data residency binds you to a single
region, or when a managed service the system depends on does not exist in the target region, the standby
design does not come up. Recovery becomes same-region, from an isolated backup, or at another provider —
with an RTO of a different order.

**A minutes-level RTO for a system with a manual fallback.** If the operation can run for a day on a manual
process, backups with restore automation serve, and any step above that is cost that does not pay for itself.

## Alternatives

- **Three [availability zones](/09-cloud-architecture/availability-zones.md)** — it covers most real
  failures and is not disaster recovery.
- **Backups with restore automation** — the minimum viable, and sufficient for many systems.
- **A pilot light** — the best cost-benefit ratio when the required RTO is in the tens of minutes and the
  cost of downtime does not pay for a warm standby.
- **A delayed replica** — cheap protection against human error. See
  [data replication](/07-data-architecture/data-replication.md).

## Trade-offs

| A low RTO | A high RTO |
|---|---|
| Standby capacity | Created on the spot |
| A continuous cost | Low |
| Less revenue lost | More |
| More complexity | Less |

| Backups | Replication |
|---|---|
| Covers human error | It does not |
| A slow restore | A fast promotion |
| Low cost | Duplicated capacity |
| An RPO of hours | Of seconds |

## Failure Modes

**A restore that fails.** Never tested.

**A restore too slow** for the RTO.

**An incomplete backup.** Configuration, a secret or a secondary database missing.

**Backups encrypted by an attack.** Accessible with the same credentials.

**Insufficient retention.** The corruption started before the oldest backup.

**Nobody knows how to execute it.**

**Undefined authority.** The first hour is lost deciding whether to trigger it.

**Activation that fails at the target.** Compute does not come up because of the account's quota in the
region, an outdated image or a permission that only exists at the origin. It shows up as an RTO of hours
in a strategy sold as tens of minutes.

**No way back.** The origin region recovers, but the data written at the target during the disaster has no
reverse replication configured, and the system is stuck in the standby region, sized for the pilot.

## Common Mistakes

**Not defining RTO and RPO with the business.** Without those two numbers, the strategy is chosen by
engineering intuition — which usually buys more than the business needs, or less than it tolerates.

**Not testing the restore.** The backup's existence says nothing about how long the restore takes or
whether what comes back is intact. A backup never restored is a hypothesis, not a plan.

**Not covering configuration and secrets.** The database comes back and the system does not start, because
variables, certificates and keys nobody included in the plan's scope are missing.

**Relying on replication against human error.** The replica reproduces the accidental deletion immediately.
Against error and against corruption, what protects is the backup with history.

**Not isolating the backups.** A backup accessible with the same credential as the main environment is
deleted along with it in a ransomware attack. A separate account and immutable retention are what make the
difference.

**Not prioritizing what comes back first.** With no defined order, the recovery tries to bring everything
up at once and jams on dependencies. The priority list needs to be decided beforehand, with the business.

## Real-World Example

A services company had daily backups of every database, 30-day retention, and a disaster recovery document
required by the audit.

The document had never been executed.

An attack that encrypted the data hit the environment. What was discovered, in the order it was discovered:

**The backups were in the same account**, accessible with the same credentials the attacker obtained. The
last 30 days' worth were encrypted along with everything else.

**A backup existed in another account**, made monthly by an old process nobody remembered. It was 26 days
old.

**The restore had never been tested.** The first attempt failed on a version incompatibility — the backup
was from an earlier database version, and the new environment did not accept it directly.

**Configuration was missing.** The application's secrets were in no backup. All of them had to be
regenerated and the integrations reconfigured.

**Nobody knew the procedure.** The person who had written the document had left the company 8 months
earlier.

Total time to partial operation: **9 days**. Data loss: 26 days of transactions, partially reconstructed
from partner systems and tax records.

Afterward:

**RTO and RPO defined with the board** — 4 hours and 15 minutes, respectively, for the essential functions.

**A pilot light** in another region, with continuous replication.

**Immutable backups** in a separate account, with credentials production does not have.

**A quarterly full restore test**, timed. The first took 11 hours; the fourth, 3 hours 20.

**Function prioritization.** Three essential functions defined to come back first.

**Triggering authority** defined in three names.

What was recorded afterward: they met the audit requirement — there were backups and there was a document.
The audit never asked for a test, and nobody offered one.

## Related Concepts

- [Multi-Region](/09-cloud-architecture/multi-region.md) — the low-RTO designs.
- [Availability Zones](/09-cloud-architecture/availability-zones.md).
- [Data Replication](/07-data-architecture/data-replication.md).
- [Recovery Planning](/12-reliability/disaster-recovery-planning.md) — the plan's scope, the triggering
  authority and the order of return.
- [RTO](/12-reliability/rto.md) and [RPO](/12-reliability/rpo.md) — the two numbers.
- [Reliability](/12-reliability/index.md).

## Practical Exercise

Find out when the last complete restore test of your system was — not the verification that the backup
exists, the actual restore.

Then ask somebody from the business: how much does each hour of downtime cost? If the two numbers do not
talk to each other, that is the gap.

## Interview Questions

- What do RTO and RPO mean, and who defines them?
- Why does replication not protect against human error or against an attack?
- Why do backups need to be isolated from production?

## Further Reading

- Beyer, Betsy et al. *Site Reliability Engineering*. O'Reilly, 2016.
- ISO 22301 — business continuity management.
- NIST SP 800-34 — contingency planning guide.

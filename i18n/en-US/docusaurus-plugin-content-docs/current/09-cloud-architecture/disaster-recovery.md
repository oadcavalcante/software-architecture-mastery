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
translated_from_version: 1
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

The reasons are always the same: the restore was never tested, the procedure is out of date, the backup
does not contain everything, or the restore takes too long to be useful.

The result is a plan that exists in a document and not in capability.

## Core Concepts

### The two numbers

**RTO — recovery time objective.** How long until you are operating again.

**RPO — recovery point objective.** How much data can be lost.

```text
RPO ─────────────┤ disaster ├───────────── RTO
     data lost                downtime
```

They are business decisions, with an associated cost, and they need to be defined by whoever pays the bill
for the downtime — not estimated by engineering.

The correct conversation is: "recovering in 4 hours costs X; in 15 minutes it costs 10X. How much is each
hour of downtime worth?"

Without those two numbers, any strategy is a guess.

### The strategies, by price

```text
                       typical RTO    typical RPO   cost
backups only           days           hours         very low
backups + automation   hours          minutes       low
pilot light            tens of min    minutes       medium
warm standby           minutes        seconds       high
active-active          seconds        ~zero         very high
```

**Pilot light** deserves attention: a minimal version of the environment stays on — the database
replicating, the network ready — and the compute capacity is created at activation. It costs a fraction of
a warm standby and delivers an RTO of tens of minutes.

It is the best cost-to-result ratio for most systems that need more than backups, and it is underused.

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

### The plan needs to cover what is not data

The list of what is usually missing:

**Configuration and secrets.** Where they are, and how to recover them.

**DNS.** Who changes it, with what propagation time.

**Certificates.**

**External dependencies.** SaaS, payment gateways — what happens if the source address changes.

**Communication.** Who notifies customers, who talks to the regulator.

**The decision.** Who has the authority to declare the disaster and trigger the plan. Without that defined,
the first hour is lost deciding whether it is time to trigger it.

### Degrading is a legitimate strategy

Not everything needs to come back at once. Defining which functions are essential allows restoring them
first and operating in reduced mode.

An e-commerce site that comes back accepting orders, with no recommendations and no history, is operating.
Waiting for everything to come back is frequently the wrong choice.

That prioritization needs to be decided beforehand — during the incident, nobody has the composure to
negotiate it.

## Mental Model

**A recovery plan nobody executed is documentation, not capability.** The test is the plan.

## When to Use

Every system needs some strategy. The level depends on:

- The cost per hour of downtime.
- A regulatory requirement.
- Criticality to the business's operation.
- Contractual commitments.

## When Not to Use

**Investing in a low RTO with no number from the business.**

**Active-active when a pilot light serves.**

**Relying on replication as protection against human error.**

**A documented plan with no exercise.**

**Covering only the data.** Configuration, DNS and secrets are left out.

**Backups accessible with the same credentials as production.**

## Alternatives

- **Three [availability zones](/09-cloud-architecture/availability-zones.md)** — it covers most real
  failures and is not disaster recovery.
- **Backups with restore automation** — the minimum viable, and sufficient for many systems.
- **A pilot light** — the best cost-benefit ratio in the intermediate range.
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

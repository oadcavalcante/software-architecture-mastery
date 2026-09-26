---
id: data-protection
title: Data Protection
sidebar_position: 14
description: The most effective control is not having the data — and what to do with what needs to exist.
doc_type: concept
level: 5
difficulty: advanced
status: complete
objective: >
  By the end, the reader reduces the data surface before protecting it, and
  classifies what remains to apply proportional control.
prerequisites: [security]
related: [encryption, auditability, data-lifecycle]
canonical_for: []
translated_from_version: 4
last_reviewed: 2026-08-31
---

# Data Protection

## Overview

The conversation about protecting data usually starts at encryption and access control. It should start
earlier:

**Does this data need to exist?**

Data that is not collected does not leak, does not need to be encrypted, does not go into a backup, does
not appear in a log, does not need to be deleted when somebody asks. For data no process uses, it is the control with the best ratio of risk eliminated to effort.

What remains after that question is what deserves protection — proportional to what it is.

## Problem

The default reflex is to collect and keep everything: it may be useful later, storage is cheap, and
removing feels like a loss.

The cost appears dispersed and is not attributed to the decision to collect:

Each sensitive field multiplies the compliance effort. Each copy is a surface to protect. Each piece of
personal data kept beyond what is necessary is regulatory exposure. And, in a leak, the extent of the
damage is exactly what was there.

## Core Concepts

### Minimization is the highest-return control

Four questions, in order:

**Do we need to collect it?** Many fields are collected "because the form had them".

**Do we need to keep it after using it?** A document verified at registration may not need to be retained.

**Do we need the complete value?** Frequently the last digits, the age range, the city are enough —
instead of the exact value.

**How long do we need it?** See [data lifecycle](/07-data-architecture/data-lifecycle.md).

Each "no" removes an entire problem instead of mitigating it.

### Classification makes the protection proportional

Protecting everything equally is expensive and produces the worst result: excess where it does not matter,
insufficiency where it does.

A simple classification resolves it — three or four levels are enough:

```text
public      may be disclosed
internal    should not leak, limited damage
sensitive   personal, financial, contractual data
critical    health, biometric, credentials, regulated data
```

And, for each level, defined controls: where it may be, who may access it, whether it needs field-level
encryption, whether it appears in a test environment, whether it is logged.

Without classification, the decision is made field by field, by whoever is implementing.

### Pseudonymization and anonymization are not the same thing

**Pseudonymizing** replaces direct identifiers with references, keeping the possibility of reversal with
additional information. The data is still personal, from a regulatory point of view — the risk is reduced,
not eliminated.

**Anonymizing** removes the possibility of reidentification. The data stops being personal.

Real anonymization is harder than it looks:

**Combination reidentifies.** A postal code, a date of birth and a sex individually identify a high
fraction of the population.

**Cross-referencing datasets.** Two separately anonymized datasets can reidentify when combined.

**Rare data identifies.** An unusual value points at one person.

"We removed the name" is not anonymization. Calling what is pseudonymized anonymized produces wrong
decisions about what may be shared.

### Tokenization takes the data out of the system

Replacing the sensitive value with a meaningless reference, keeping the original in a separate vault with
restricted access.

The gain: most of the system stops having the data. The systems that only need to reference it — to relate,
to display the last digits — work with the token, and the compliance scope shrinks drastically.

It is the standard technique for card data, and underused for document numbers and other identifiers.

The cost is operational. The vault sits on the path of every flow that needs the original value — issuing
an invoice, reporting to a regulator, verifying with the data subject: if it goes down, those flows go down
with it, and each detokenization adds a network call to the latency. The risk that was spread out
concentrates in a single target, which then demands the strictest access control and auditing in the
system. And the data already persisted has to be migrated — sweeping databases, replicas and extracts,
swapping values for tokens without breaking relationships —, a project in its own right.

### Production data in other environments

Test, development and analysis environments that receive a copy of production multiply
the places where personal data lives, and rarely carry production's controls: broader
access, no encryption, retention with no owner. For data protection, the question is
what real data each environment needs — and the usual answer is none.

The ways to get there — synthetic data, a masked subset that preserves relationships, a
small hand-crafted set — are in
[environment management](/14-devops-and-platform/environment-management.md#test-data-not-a-full-copy-of-production).
See [secrets](/10-security/secrets.md) — the same logic holds for credentials.

### Leakage through side paths

Data protected in the database frequently appears in places nobody classified:

```text
application logs    request bodies, error messages
error messages      returned to the user
exports             reports, spreadsheets, ad hoc extracts
backups             with weaker controls
metrics             labels with identifiers
third-party systems monitoring, analytics, support
notifications       email, text message, mobile push
```

The last is frequently forgotten: a notification with clinical or financial content appears on the phone's
lock screen.

Each of those needs to be treated as a destination for the data, and the classification needs to reach
them.

## Mental Model

**The safest data is the data that does not exist.** Protect what remains, proportionally to what it is.

## When to Use

- Systems that handle personal data.
- A regulatory requirement for protection or deletion.
- Data shared with third parties.
- Non-production environments that receive copies.
- Analysis over customer data.

## When Not to Use

**A tokenization vault for low-sensitivity or low-volume data.** The vault is an availability dependency
and a target to protect. For an internal identifier with no value outside the system, or for a few hundred
records where minimization settles it, running the vault costs more than the scope it removes — encrypting
the field or not keeping it is cheaper.

**Formal classification in a single-sensitivity system.** If all the system's data sits at one level — an
internal service with no personal data, or one that only holds health data —, four levels with per-level
controls is bureaucracy with no decision to make. A uniform control suited to that level is enough;
classification starts paying off when the second level appears.

**Anonymizing when the analysis needs the individual.** Anonymization that withstands cross-referencing
generalizes and suppresses until the granularity is gone — following a customer's journey, detecting fraud
by individual pattern. When that is the use that justifies keeping the data, pseudonymize with restricted
access to the mapping, and accept that the data is still personal.

**Synthetic data when the test depends on the anomalies of the real thing.** Legacy data migration,
debugging a defect that only occurs with the real dataset: the generator does not reproduce the distortions
the test exists to catch. There the path is a masked subset in an environment with production controls,
not the raw copy.

## Alternatives

- **Not collecting** — the definitive control.
- **Tokenization** — it shrinks the scope drastically; the vault stays inside it.
- **Aggregation** — keeping the summary, discarding the detail.
- **Processing without storing** — using the data in the request and not persisting it.
- **[Per-subject encryption](/10-security/encryption.md)** — it allows deletion by discarding a key.

## Trade-offs

| Minimizing | Keeping everything |
|---|---|
| A small surface | Large |
| Limited future analysis | Possible |
| Simple compliance | Complex |
| An irreversible decision | Flexible |

| Synthetic data in test | A production copy |
|---|---|
| No exposure | High |
| Generation effort | None |
| May not reflect real cases | Faithful |

## Failure Modes

**Sensitive data in an application log.**

**A production copy in a test environment.**

**Anonymization reversible by cross-referencing.**

**An uncontrolled export.** A spreadsheet with customer data on a personal computer.

**A third party receiving more than necessary.**

**A notification exposing content.**

**Incomplete deletion.** The data remains in copies and derivatives. See
[data lifecycle](/07-data-architecture/data-lifecycle.md).

## Common Mistakes

**Starting with encryption instead of minimization.** Data that was not collected does not leak, needs no
key and does not enter a deletion request. Encrypting is the second-best answer; not having it is the
first. And often the missing control was authorization — see [encryption](/10-security/encryption.md).

**Not classifying.** Without knowing which fields are personal or sensitive, the same control is applied to
everything — too expensive for what does not need it and too loose for what does.

**Copying production.** A staging database with real data multiplies the places where personal data exists,
with controls that, in practice, rarely match production's.

**Classifying without defining controls per level.** A label with no consequence does not change where
the data may be or who accesses it — it is inventory, not protection.

**Logging the request body.** It is the most common route of internal leakage: personal data and
credentials end up in the logging system, which has long retention and broader access.

**Confusing pseudonymization with anonymization.** Swapping the name for an identifier does not anonymize —
with a date of birth and a postal code, few attributes are enough to reidentify. Only truly anonymous data
leaves the regulatory scope.

**Not inventorying the data's destinations.** Without knowing where personal data flows — analytics,
support, third parties — there is no way to serve a deletion request or to respond to an incident.

## Real-World Example

A fintech received a data deletion request and discovered it did not know where the data was.

The inventory, done hastily, found customers' personal data in ten places — seven of which nobody had
listed:

```text
the production database    expected
replicas and backups       expected
the analytical warehouse   expected
application logs           request bodies, 1 year of retention
metrics                    the national ID number as a time series label
the staging environment    a production copy from 4 months earlier
analysis notebooks         extracts made by analysts
the support system         pasted into tickets
the email platform         names and amounts in templates
third-party monitoring     traces with request data
```

The last three were outside direct control.

And two aggravating findings:

**The national ID number as a metric label.** It generated one time series per customer, which besides
exposing data had blown up the monitoring platform's cost.

**Staging accessible to suppliers.** An environment with real customer data, with credentials shared with
two suppliers.

The reformulation started with minimization, not with protection:

**A collection review.** Eleven fields stopped being collected — including family members' data no process
used. Three fields came to be stored in reduced form: an income range instead of the amount, a city instead
of the complete address, the last digits instead of the complete document number where only the check
mattered.

**Tokenization** of the document number. A separate vault came to exist; the rest of the system works with
a token. That removed the field from the production database, the replicas and the warehouse.

**Classification** into four levels, with controls defined per level — including "may not appear in a log"
and "may not leave for a non-production environment".

**Synthetic data** in staging. The production copy was eliminated.

**Log and metric filtering** at the source, with an automated check.

**Revised contracts** with the third parties, restricting what is sent.

What the team learned: the deletion request that started everything came to be servable in two days. And
most of the gain came from the first stage — the eleven fields no process used stopped existing, and with them
every control they would have required in each of the ten places.

## Related Concepts

- [Encryption](/10-security/encryption.md) — the control for what remains.
- [Auditability](/10-security/auditability.md).
- [Data Lifecycle](/07-data-architecture/data-lifecycle.md) — retention and deletion.
- [Threat Modeling](/10-security/threat-modeling.md) — where "eliminate" appears as an answer.

## Practical Exercise

Choose a personal data field in your system and list **every** place it appears — including logs, metrics,
test environments, exports and third parties.

Then ask, for each one: does it need to be here?

## Interview Questions

- For data no process uses, why does minimizing pay off more than protecting?
- What is the difference between pseudonymizing and anonymizing?
- Why is copying production to test one of the most common exposures?

## Further Reading

- Brazil's General Data Protection Law (Lei 13.709/2018) — the principles of necessity and purpose.
- Sweeney, Latanya. *Simple Demographics Often Identify People Uniquely*, 2000.
- ENISA. *Data Pseudonymisation: Advanced Techniques and Use Cases*, 2021.

---
id: healthcare
title: "Case: Healthcare Platform"
sidebar_position: 10
description: An electronic health record for 340 units, where availability and privacy are requirements of life and of law.
doc_type: case-study
level: 0
difficulty: advanced
status: complete
objective: >
  By the end, the reader designs a system in which the data is sensitive by nature,
  interoperability is imposed and downtime has clinical consequences.
prerequisites: [trade-offs]
related: [multi-tenant-enterprise, banking, legacy-modernization-case]
canonical_for: []
translated_from_version: 1
last_reviewed: 2026-08-31
---

# Case: Healthcare Platform

:::note How to use this case

Read the context, requirements and constraints. **Stop before the architecture options** and
sketch your own in twenty minutes.

:::

## Business Context

**Vitalis** is a health insurer with its own network: 12 hospitals, 84 clinics and 244 points of
care — laboratories, imaging centers and urgent care units. It serves 2.8 million members.

The electronic health record is a system built in-house over 14 years. It works, and three
characteristics make it unsustainable:

**Availability.** The system had 41 hours of downtime last year. During one of them, a hospital
operated for 6 hours on paper records, and the subsequent reconciliation took three weeks.
Downtime in healthcare is not an inconvenience — it is clinical risk, because the physician loses
access to allergies, current medications and history.

**Fragmentation.** Every unit acquired over the years brought its own system. There are now 7
different health record systems, and the history of a patient who has been through three units
sits in three places, with no consolidation. Physicians report ordering tests that have already
been done because they cannot see the result.

**Regulation.** The data protection law and the national medical council's rules impose
requirements for consent, access traceability, a minimum retention of 20 years and digital
signature of clinical documents. The current system meets them partially, and the insurer
received an audit finding.

## Functional Requirements

For the **healthcare professional**: view a patient's consolidated record, with history from
every unit; record progress notes, prescriptions and test orders; digitally sign documents; and
access test results with images.

For the **patient**: view their own history and results; manage sharing consents; and schedule
appointments.

For the **unit**: manage schedule and occupancy; record admission, discharge and transfer; and
bill the insurer or external payers.

For the **insurer**: authorize procedures according to coverage; audit utilization; and report to
regulators.

And for the **platform**: interoperate with external systems through industry standards; ensure
every access to clinical data is logged and justifiable; and keep the record available even when
the unit loses connectivity.

The last requirement is the most constraining: a unit with no connection has to keep treating
patients.

## Non-Functional Requirements

```text
availability of record lookup               99.99%
availability of clinical recording          99.99%
operation with no unit connectivity         up to 8 h, with synchronization
p95 of a consolidated record lookup         < 1.2 s
p95 of opening an imaging study             < 4 s
RPO for a clinical record                   0
RTO                                         < 10 min
record retention                            20 years (legal minimum)
access trail retention                      20 years
traceability                                every access to clinical data
                                            logged with author, reason
                                            and patient
integrity                                   a clinical record signed and
                                            immutable after signature
```

RPO zero combined with 8 hours of offline operation is the system's central tension: they are
requirements that pull in opposite directions, and resolving them is the architecture problem.

## Constraints

```text
regulatory        data protection law, medical council resolutions, health
                  insurance regulator rules; digital signature with a
                  national PKI certificate for clinical documents;
                  20-year retention
interoperability  industry standards mandatory for exchange with
                  laboratories, external payers and the public
                  health system
legacy systems    7 different record systems, of which 3 have no
                  active vendor and 2 have no API
connectivity      units in regions with unstable links; three
                  of them on satellite connections
team              86 engineers; 14 with healthcare experience
migration         14 years of records, ~3.2 billion clinical
                  entries, with no possibility of loss or of
                  wrong interpretation
schedule          an audit finding with a 24-month deadline
                  for regulatory compliance
```

The migration constraint is the most delicate in this whole set of cases: a clinical record
migrated with the wrong interpretation — a dosage, an allergy — can cause harm.

That constraint changed the way of working, not just the schedule. Migrating clinical data is not
verified by row counts or checksums: it is verified clinically, by sampling, with healthcare
professionals reading migrated records alongside the originals. The team set aside 4% of the
project's total effort for that validation, and the number was treated as non-negotiable from the
first plan.

There is an architectural consequence: fields whose semantics cannot be determined with certainty
are not migrated as structured data. They are preserved as original text, marked as
uninterpreted, and shown to the professional as such. Losing structure is acceptable; inventing
wrong structure is not.

## Capacity Estimates

```text
members                             2.8 million
encounters/day                      ~94 thousand
simultaneous active professionals   ~7,200 at peak
record lookups/day                  ~1.4 million
lookups/s, peak                     ~180
clinical entries/day                ~640 thousand
entries/s, peak                     ~85
```

The transactional volume is low — 180 lookups per second. As in almost every case in this set, the
architecture is not decided by scale.

What sizes it is **storage** and **imaging**:

```text
clinical entries, 20 years          ~4.6 billion  →  ~9 TB
access trail, 20 years              ~11 billion   →  ~4 TB
imaging studies                     ~340 TB, growing ~62 TB/year
signed documents                    ~28 TB
```

Imaging studies dominate storage and have a particular access profile: 78% of them are never
accessed after the first 30 days, and the remaining 22% are consulted sporadically over years.

```text
image accesses, first 30 days          ~94% of all accesses
accesses after 1 year                  ~1.2%
```

That distribution is what justifies storage tiering, and on its own it accounts for a good share
of the possible savings.

It is worth noting how that number was obtained, because it wasn't available. The old system
didn't record imaging access in a queryable way — the information existed in application logs,
retained for 15 days. Reconstructing the distribution required three months of collection before
any architectural decision could be made on solid ground.

That is a pattern that repeats in old systems: the decision depends on a number nobody measured,
and measuring takes time. Starting the collection early — before knowing exactly what you are
going to decide — is what prevents choosing by intuition months later.

## Architecture Options

The axis is **where the record lives and how the unit operates without a connection**.

### Option A — Centralized with a read cache

A single central record; units keep a read cache of scheduled patients.

```text
consolidation     trivial — one place only
offline operation partial: reads yes, recording no
RPO               0, with synchronous replication
complexity        low
risk              a unit with no connection cannot record an encounter
```

### Option B — Centralized with local recording and synchronization

A central record; the unit records locally when offline and synchronizes afterwards.

```text
consolidation     good, with a synchronization window
offline operation complete
RPO               0 for the local record; synchronization can
                  delay central visibility
conflict          possible — two entries for the same patient
                  at different units during the partition
complexity        medium
```

### Option C — Federated per unit, with a central index

Each unit keeps its own record; a central index points to where each entry is, and consolidation
happens at read time.

```text
consolidation     expensive — queries N units on every read
offline operation complete and natural
availability      one unit down makes part of the history invisible
regulatory        harder — the access trail is distributed
complexity        high
```

## Trade-off Analysis

| Criterion | Weight | A — Central | B — Central + local | C — Federated |
|---|:-:|:-:|:-:|:-:|
| Continuity of care | 30% | 4 | 9 | 8 |
| History consolidation | 25% | 9 | 9 | 4 |
| Regulatory compliance | 20% | 9 | 8 | 4 |
| Complexity and risk | 15% | 8 | 6 | 3 |
| Team capability | 10% | 8 | 7 | 4 |
| **Weighted total** | | **7.3** | **8.2** | **5.3** |

**Sensitivity analysis.** With continuity at 45%, the totals become 6.3 / 8.6 / 6.1. With
compliance at 40%, they become 8.0 / 8.2 / 4.6 — Option B keeps a narrow advantage. Option C wins
in no scenario tested, and the reason is structural: it simultaneously hinders consolidation and
the access trail, which are the two stated problems.

## Decision

**Centralized with local recording and synchronization (Option B)**, with explicit conflict rules
and synchronization treated as part of the clinical flow, not as a technical detail.

**Under what condition each discarded option would win:**

**Option A would win if** every unit had reliable connectivity — which is true for 81% of them.
For those, local mode is a capability that is rarely exercised, and the cost of maintaining it is
justified only by the remaining 19% and by the risk of a central failure.

**Option C would win if** the units were independent organizations, with legal autonomy and their
own ownership of the data — the model of an accredited network, not of an owned network. The
condition is recorded: if Vitalis starts integrating external providers who own the record, the
federated model comes back on the table for that portion.

## Components

**Central Record.** The source of truth for the consolidated clinical record.

**Unit Node.** A local instance at each unit, with the record of the relevant patients and the
ability to record offline.

**Patient Identity Service.** Resolves identity across systems — the hardest problem in
consolidation.

**Consent Service.** Manages what the patient authorized to share, with whom and for how long.

**Access Trail Service.** Logs every access to clinical data, immutably.

**Signature Service.** Digital signature of clinical documents with a certificate.

**Image Repository.** Tiered storage of studies.

**Interoperability Gateway.** Translation between the internal model and industry standards.

**Procedure Authorization Service.** The insurer's coverage rules.

**Synchronizer.** Reconciliation between unit nodes and the center.

The **Patient Identity Service** deserves emphasis: consolidating records requires knowing that
the "José Silva" at one unit is the same person as the "J. Silva" at another. With 7 legacy
systems and records of varying quality, that is the migration's most dangerous source of error.

## Data

**Clinical entry.** Immutable after signature. A correction is a new entry referencing the
previous one, with the reason — never an alteration.

```text
entry      (id, patient_id, unit_id, professional_id, type,
            content, signed_at, signature, reference_id, reason)
```

That immutability is a regulatory requirement and it is also the property that makes
synchronization tractable: entries are only appended, never altered, which eliminates the hardest
class of conflict.

**Patient identity.** A master record with the identifiers from each source system, and a
confidence score for the link.

```text
link       (master_patient_id, source_system, source_id,
            confidence_score, confirmed_by, confirmed_at)
```

Links with a score below the threshold require human confirmation. During the migration, 11% of
records fell into that category — about 310 thousand cases reviewed by a team of 22 people over
14 months.

**Consent.** Versioned and dated. An access is evaluated against the consent in force at the
moment of access, and the trail records which version was applied.

**Access trail.** Append-only, immutable, retained for 20 years. Each entry records who accessed
it, which patient, which entry, when and under what justification.

The volume — 11 billion entries — is large and the access pattern is rare: the trail is queried in
audits and investigations, a few hundred times a month. Cold storage, with slow and cheap queries.

**Imaging.** Tiered by age and access.

```text
0 to 30 days       fast storage, in the unit's region
30 days to 1 year  standard storage
after 1 year       archive storage, retrieval in minutes
```

Retrieval in minutes for old studies was validated with the medical team: a study from three years
ago is not consulted in an emergency, and waiting 3 minutes is acceptable. That validation is what
enabled the tiering, and it reduced imaging storage cost by 61%.

## Integration

**Unit–center synchronization.** The core of the continuity design.

In normal operation, the unit node writes to the center synchronously and keeps a local copy. When
the connection drops, it switches to writing only locally, marking the entries as pending.

On reconnection, the pending entries are sent. Since entries are immutable and only appended,
there is no write conflict — the possible conflict is **clinical**: two professionals at different
units recording incompatible decisions about the same patient during the partition.

That case is rare and has explicit handling: when entries from different units about the same
patient in the same interval are detected during synchronization, both are preserved and an alert
is raised to the responsible professional, who decides. The system does **not** resolve clinical
conflicts automatically.

**Which patients stay on the local node.** Not all of them — that would be unviable. The node keeps
patients with an appointment scheduled in the next 7 days, inpatients, and those seen in the last
30 days. It covers 97% of encounters.

For the remaining 3% — a patient who arrives without an appointment at a unit with no connection —
the system operates with whatever the patient reports, records the limitation, and flags the entry
as produced without access to the history. It is a degradation with clinical consequences, and it
is communicated to the professional.

Flagging that entry as "produced without history" has later use: when the unit reconnects and the
complete history becomes available, the system compares what was recorded against what the record
holds — allergies, current medications, chronic conditions — and alerts the responsible
professional if there is an incompatibility.

That later alert is a safety net operations valued more than the team expected. Over 14 months, it
generated 62 alerts, of which 9 resulted in a change of clinical management. None of them would
have been detected without the flag — the entry would have looked normal.

**Interoperability.** The Gateway translates between the internal model and industry standards,
both to receive results from external laboratories and to send information to other payers and to
the public system.

Adopting the standard internally was considered and discarded: industry standards are designed for
exchange, not for operation, and modeling the internal record on them would have produced a more
complex and slower system. The Gateway isolates that translation. See
[anti-corruption layer](/08-integration-architecture/integration-anti-corruption.md).

## Security

```text
access to clinical data  by care relationship: a professional
                         accesses the record of whoever they treat
break-glass access       emergency access is permitted with a
                         mandatory justification and later review
trail                    immutable, 20 years, with sample review
consent                  granular by data type and by recipient
specially sensitive
  data                   mental health, HIV, genetics have additional
                         protection and more restricted access
patient                  accesses their own history, with strong authentication
imaging                  encrypted at rest; access under the same control
signature                national PKI certificate, with a timestamp
anonymization            for research and analysis, with an approved process
```

**Break-glass access with a justification** is the most important security decision. Blocking
access can cost a life; permitting it without control violates the law. The solution is to permit,
require a justification at the moment, and review afterwards.

The later review is what gives the control teeth: 100% of break-glass accesses are reviewed within
5 business days. In the first year, 340 accesses were reviewed and 11 led to an internal process.

## Scalability

The system has no scale problem in the usual sense. What it has is **geographic distribution**:
340 units, some with poor connectivity, needing low latency.

The answer is the unit node, which resolves latency and continuity with the same mechanism.
Looking up the record of a patient who is present is local; looking up a complete history goes to
the center.

Image storage scales by tier and by region: recent studies stay close to the unit that produced
them, because that is where they will be consulted.

## Reliability

If the **Central Record** becomes unavailable, every unit switches to local mode. Care continues
for the 97% of patients with local data. It is the system's most important degradation, and it is
rehearsed quarterly with a real connection cut at one unit at a time.

If a **Unit Node** fails, that unit operates against the center directly, with higher latency. If
both fail together, the unit falls back to the paper process — which still exists, documented and
trained.

If the **Consent Service** becomes unavailable, access is denied by default, except in an
emergency with a justification. Failing closed is the correct choice for clinical data.

If the **Image Repository** fails, the textual record remains accessible. Imaging studies become
unavailable, which is communicated explicitly.

If **Signature** fails, documents can be produced and remain pending signature, with a deadline.
It is a regulatory pendency, not a clinical one.

## Observability

```text
availability per unit, measured from the unit's point of view
time in local mode, per unit
entries pending synchronization, per unit and age
clinical conflicts detected during synchronization
break-glass accesses, and time to review
low-confidence identity links pending review
record lookup latency, local versus central
image retrieval rate per storage tier
```

Measuring availability **from the unit's point of view** is a deliberate choice: the number that
matters is not whether the center is up, it is whether the professional can treat patients. A unit
in local mode with healthy synchronization is available, even though disconnected.

That definition changed the internal perception of the problem: the old system's 41 hours of
downtime were, under the old metric, downtime of the center. Under the new metric, the relevant
number became hours of a unit unable to treat patients — and that is the real target.

## Deployment

Deployment per unit, in waves, starting with the smallest. The unit node is updated in a window
negotiated with each unit's operations, because the update requires the unit to be at low
activity.

The Central Record uses zero-downtime deployment, with a compatible schema in three steps. The
immutability of clinical entries helps: fields are added, never semantically altered.

No deployment at a unit with critically ill inpatients, verified automatically before the window.

That automatic verification is an example of a domain constraint becoming a pipeline rule: the
deployment system queries the unit's critical bed occupancy before releasing the window, and
blocks if there is a patient in a condition requiring continuous access to the record. It is an
unusual integration between the delivery platform and operational data, and it exists because the
alternative — depending on someone remembering to check — failed once.

The incident that caused it had no clinical consequence, and it was treated as if it had: the
subsequent analysis concluded that the control could not depend on human discipline in a process
executed dozens of times a month.

## Evolution Strategy

**Phase 1 (months 1–6): patient identity.** Building the master record and linking the 7 systems.
It is the foundation of everything, and it is done before any clinical data migration.

Result: 89% of links resolved automatically; 11% — 310 thousand cases — for human review, which
extended throughout the project.

**Phase 2 (months 5–12): central record and read consolidation.** The center starts aggregating
entries from the legacy systems, serving consolidated lookups. No writes change yet.

This phase delivered the most immediate clinical benefit: physicians started seeing the complete
history, and the rate of unnecessarily repeated tests dropped 23%.

**Phase 3 (months 11–18): recording in the center and unit nodes.** Writes migrate per unit, with
the local node from the start. The order is defined by criticality and connectivity: units with
worse connections first, because they benefit most from the local node.

**Phase 4 (months 17–22): consent, trail and signature.** Complete regulatory compliance, within
the finding's 24-month deadline.

**Phase 5 (months 20–30): legacy shutdown and historical migration.** The 3.2 billion historical
entries migrate last, with sample validation clinically reviewed.

**Conditions that would change the plan:**

```text
if the rate of low-confidence links stays above 5%
  after review
  → automatic consolidation is suspended; clinical risk
    outweighs the benefit

if Vitalis starts integrating external providers who
  own the record
  → the federated model (Option C) returns for that portion

if regulation requires data residency per state
  → the center has to be regionalized

if any legacy system with no vendor becomes
  inoperable before the migration
  → the phase order changes to prioritize extracting
    that archive
```

The last condition is not hypothetical: two of the seven systems run on unsupported platforms, and
extracting their data was brought forward as a precaution.

## Results

Numbers at the end of Phase 4, 22 months after the start:

```text
hours of a unit unable to treat patients      from ~41 h/year to 1.2 h/year
central availability                          99.97%
units operating in local mode, average time   4.1 h/month (concentrated
                                              in the 19% with poor connections)
unnecessarily repeated tests                  -31%
average time to look up the full history      from "it didn't exist" to 0.9 s
break-glass accesses reviewed                 100%, on average 2.3 days
audit finding                                 closed
image storage cost                            -61%
```

The first number is the project's result: the hours in which a unit cannot treat patients dropped
from 41 to 1.2 a year, and that did not come from making the center more available — it came from
making the unit able to operate without it.

## What this case teaches

**The metric has to measure what matters.** Central system availability and the ability to treat
patients are different things, and the project only became correct when the second became the
target. The architecture followed the metric.

**Immutability simplifies synchronization.** Entries that are only appended eliminate the hardest
class of conflict. The regulatory requirement for immutability, which looked like a constraint,
became the property that made offline operation tractable.

**Identity is consolidation's hardest problem.** Before any clinical data, it was necessary to
resolve who is who across seven systems. Getting that wrong doesn't produce a bug — it produces
one person's record mixed with another's.

**Fail closed, with a controlled exception.** An unavailable consent service denies access; an
emergency permits it with a justification and mandatory later review. The two rules together are
what reconciles data safety with patient safety.

## Related Concepts

- [Case: Multi-Tenant Enterprise](/21-case-studies/multi-tenant-enterprise.md).
- [Case: Legacy Modernization](/21-case-studies/legacy-modernization-case.md).
- [Data Protection](/10-security/data-protection.md).
- [Data Flow Diagrams](/17-architecture-documentation/data-flow-diagrams.md).

## Practical Exercise

Draw the synchronization flow of a unit that was offline for 6 hours and recorded 40 encounters.

Answer: what happens if, during that period, one of those patients was seen at another unit? Which
conflict does the system resolve on its own and which needs a human?

## Interview Questions

- Why was measuring central system availability the wrong metric?
- Why does the immutability required by regulation make offline operation easier?
- Why does the system not resolve clinical conflicts automatically?

## Further Reading

- Kleppmann, Martin. *Designing Data-Intensive Applications*. O'Reilly, 2017.
- HL7 International. *FHIR — Fast Healthcare Interoperability Resources*.
- National medical council. *Resolution on electronic health records*.

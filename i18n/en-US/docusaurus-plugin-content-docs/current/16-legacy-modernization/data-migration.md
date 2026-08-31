---
id: data-migration
title: Data Migration
sidebar_position: 10
description: The riskiest and most underestimated part — where mistakes are irreversible.
doc_type: concept
level: 6
difficulty: advanced
status: complete
objective: >
  By the end, the reader plans a migration with verification, reversibility and explicit
  handling of the data that doesn't fit.
prerequisites: [legacy-modernization]
related: [strangler-fig, migration-strategies, modernization-risk]
canonical_for: []
translated_from_version: 1
last_reviewed: 2026-08-31
---

# Data Migration

## Overview

Migrating data is the riskiest part of any modernization, and the most underestimated in
estimates.

The reason is asymmetric: defective code is fixed and redeployed; corrupted or lost data
frequently cannot be recovered.

And it exposes something no other part of the project exposes: **the real quality of the
existing data** — which is usually worse than anyone in the organization believes.

## Problem

The typical plan treats migration as an execution step: extract, transform, load.

What it doesn't anticipate:

```text
data that doesn't fit the new model
inconsistent records accumulated over years
rules that were never applied retroactively
duplicates nobody knew existed
fields used for purposes other than the documented one
history nobody knows whether still matters
```

Each of those becomes a business decision in the middle of a technical window — and that
is how weekend migrations become three-month projects.

## Core Concepts

### Data profiling comes first

Before designing the migration, measure what exists:

```text
volume per entity
value distribution per field
null fields, and in what proportion
values outside the expected domain
duplicates by business criteria
orphan records
impossible dates, negative values where they shouldn't be
```

That survey — profiling — is usually done after the migration fails. Done beforehand, it
turns surprises into planned decisions.

And its result is always uncomfortable: old systems accumulate data that violates the
rules the system supposedly enforced, because the rules were added later.

### The data that doesn't fit needs a business decision

A record that doesn't fit the new model has four possible destinations:

```text
transform     apply a rule that makes it valid
correct       fix it manually, case by case
discard       don't migrate it, with a record of what was left out
migrate as is the new model accommodates the case, with a flag
```

None of those is a technical decision. Discarding 4,000 inconsistent records is a
business decision, with implications — and it has to be made by whoever answers for the
data, in advance.

See [data ownership](/07-data-architecture/data-ownership.md).

The characteristic mistake: the technical team decides alone, during the window, under
time pressure.

### Verification at three levels

```text
count      the number of records matches
sum        the financial and aggregate totals match
sampling   individual records compared field by field
```

All three are necessary and insufficient in isolation:

**Count** does not detect a wrong transformation — the records are there, with wrong
values.

**Sum** detects an aggregate error and does not detect compensation — two errors that
cancel each other.

**Sampling** detects a transformation error and does not cover rare cases, which are
precisely the ones that break.

And there is a fourth, stronger verification: **run the same processing on both sides and
compare the result**. If the balance calculation produces the same number in both
systems, the migration is correct in what matters.

### The migration has to be repeatable

A migration that runs once, over a weekend, is a gamble.

```text
repeatable    executed as many times as needed, with the same result
idempotent    re-running doesn't duplicate
incremental   migrates only what changed since the last run
```

See [idempotency](/06-distributed-systems/idempotency.md).

Repeatability makes rehearsal possible: run the complete migration in a test environment,
verify, fix, repeat — until the real execution is routine, not an event.

Teams that rehearse the migration five times before the real one have a qualitatively
different success rate from those who run it once.

### The cutover has to be reversible

The moment the new system becomes the source of truth:

```text
before the cutover   the old one is the source; the new one is validated in parallel
the cutover          the source changes
after                the old one stays consistent for a period, for rollback
```

Keeping the old one updated after the cutover — by reverse replication — is what makes
going back possible. Without that, the cutover is irreversible from the first new write.

And the reversibility period has to be long enough for problems to appear: some only
manifest at month-end close.

### History requires an explicit decision

```text
migrate everything  expensive, and keeps access
migrate recent      cheap, and the history stays in the old one
archive             the old one becomes a read-only archive
discard             with a check against retention requirements
```

See [data lifecycle](/07-data-architecture/data-lifecycle.md).

Keeping the old system as a read-only archive is frequently the cheapest option — and it
collides with the goal of shutting the old one down, which has to be acknowledged.

### The migration reveals the real quality

A recurring observation: the migration is the first time anyone looks at the data as a
whole.

It finds problems that existed for years and had not been detected because no process
exercised them — duplicate customers, orphan records, impossible values.

That has two consequences: the estimate has to include time to deal with them, and the
discovery has value of its own, independently of the migration.

## Mental Model

**Corrupted data cannot be recovered.** Profile beforehand, rehearse many times, verify
at multiple levels, and keep the way back open.

## When to Use

Data migration appears in any system replacement. The practices here are necessary
whenever:

- The volume is large enough to prevent manual verification.
- The data sustains operations or a regulatory obligation.
- The target model differs from the source model.
- The cutover window is limited.

## When Not to Use

**Without prior profiling.** The data that doesn't fit shows up in the cutover window, when there is no time to decide what to do with it.

**Deciding the fate of inconsistent data during the window.** Those are business decisions made at three in the morning by people with no authority to make them.

**Without rehearsing.** The real duration is only known by measuring with real volume; without that, the agreed window is a guess.

**With verification by count only.** Swapped content with a matching count goes unnoticed, and the error is discovered by the customer.

**Without a rollback plan.** Without keeping the old system consistent, the cutover is irreversible — and the decision to press on gets made under pressure, with no alternative.

**Without an explicit decision about history.** Migrating everything costs an order of magnitude more and frequently wasn't necessary.

## Alternatives

- **Coexistence without migration** — the new one starts empty, and the old one remains
  the source of history. See [strangler fig](/16-legacy-modernization/strangler-fig.md).
- **On-demand migration** — the record is migrated when it is first accessed.
- **Keep the old one as an archive** — read-only, without migrating history.
- **Incremental migration by slice** — by customer, by region, by period.

The second is elegant and appropriate when access is sparse: most old data is never
accessed, and migrating it is wasted work.

## Trade-offs

| Migrate everything | Migrate recent |
|---|---|
| Uniform access | History in the old one |
| High cost | Low |
| The old one can be shut down | It has to stay |

| Single cutover | Incremental |
|---|---|
| Simple to reason about | Prolonged coexistence |
| Concentrated risk window | Distributed |
| Rollback of everything | Per slice |

## Failure Modes

**Data lost.** With no verification that would detect it.

**Wrong transformation.** The count matches, the values don't.

**Duplication from re-running.** Migration not idempotent.

**Window overrun.** The volume was larger than estimated.

**A business decision at 3am.** Records discarded with no authority.

**Irreversible cutover.** The old one stopped being updatable.

**A problem at month-end close.** Discovered after the rollback period.

## Common Mistakes

**Not profiling beforehand.** Real data always has values the new model doesn't accept — nulls where a field is mandatory, duplicates where there is uniqueness, free-form formats. Discovering that in the cutover window is what blows the deadline.

**Underestimating the data that doesn't fit.** The exceptional case is usually 2% of the volume and 60% of the effort, and every decision about it is a business one, not a technical one.

**Not rehearsing the complete migration.** With no rehearsal at real volume, nobody knows how long it takes — and the window agreed with the business is a guess.

**Verifying only the count.** A matching count with swapped content passes the check. You have to sum values, compare samples and reconcile totals by segment.

**Not keeping the old one updated after the cutover.** Without that, rollback ceases to exist: going back would mean losing everything done after the cutover.

**Not deciding about history.** Migrating ten years or two changes the effort by an order of magnitude, and it is a business decision — usually made by omission by engineering.

## Real-World Example

A health insurer migrated its member records — 4.2 million records, 19 years — to a new
system.

The original plan: migration over a weekend, with a 36-hour window.

The profiling, done three months in advance, found:

```text
records with no valid national ID number     34,000
members duplicated by national ID number     11,200
impossible dates of birth                     2,800
dependents with no policyholder               6,400
records with the notes field used
to store structured data                    180,000
addresses in free-form format, no standard 1,100,000
```

The last was the most serious: the new system required a structured address, and 26% of
the records didn't have one.

The decisions, made with the business over two months:

**Duplicates.** A consolidation rule defined by the records area, with 400 ambiguous cases
reviewed manually.

**No valid national ID number.** Migrated with a flag, with an update campaign directed at
the members. Not discarded — many were active members.

**Orphan dependents.** Investigated: 5,900 belonged to policyholders cancelled years
earlier; migrated as inactive. The other 500 were data errors and were corrected.

**The notes field.** An analyst discovered it contained, in about 40,000 cases,
information about waiting periods and contractual restrictions — data with legal
significance. An extractor was written to structure it.

**Addresses.** A normalization service, with the 3% that didn't normalize going to manual
review.

Execution:

**Seven complete rehearsals** in a test environment, timed. The first took 41 hours —
beyond the window. The parallelization adjustments brought the seventh down to 9 hours.

**Verification at four levels**, including running the premium calculation on both systems,
with record-by-record comparison.

**Reverse replication** for 60 days after the cutover, keeping the old one consistent.

**Month-end close** exercised in the test environment, with the migrated data — which
found two transformation problems no previous verification had caught.

The real migration took 8 hours and 40 minutes. No records lost, and rollback was never
needed.

The recorded conclusion: the three months of profiling and preparation were the project.
The execution was the easy part — and it would have been a disaster without them.

The notes field with legally significant information, on its own, would have produced a
significant liability had it been discarded as free text.

## Related Concepts

- [Strangler Fig](/16-legacy-modernization/strangler-fig.md) — the coexistence.
- [Migration Strategies](/16-legacy-modernization/migration-strategies.md).
- [Modernization Risk](/16-legacy-modernization/modernization-risk.md).
- [Data Consistency](/07-data-architecture/data-consistency.md).

## Practical Exercise

Pick a central entity in your system and do a simple profiling: how many records violate
the rules the system supposedly enforces?

The number is usually larger than any estimate — and it is the work a future migration
will face.

## Interview Questions

- Why is verification by count insufficient?
- Why does the data that doesn't fit require a business decision?
- What makes a cutover reversible?

## Further Reading

- Ambler, Scott; Sadalage, Pramod. *Refactoring Databases*. Addison-Wesley, 2006.
- Kleppmann, Martin. *Designing Data-Intensive Applications*. O'Reilly, 2017.
- Newman, Sam. *Monolith to Microservices*. O'Reilly, 2019.

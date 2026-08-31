---
id: adr-003-postgresql
title: "ADR-003 — PostgreSQL as the Single Primary Database"
sidebar_position: 12
description: An example ADR for a decision not to act — refusing a second database, with the cost of the discard named.
doc_type: adr
level: 5
difficulty: intermediate
status: complete
objective: >
  By the end, the reader sees how to record a decision not to adopt something, and why
  those are the ones most often lost without an ADR.
prerequisites: [adr-structure]
related: [adr-decision, adr-alternatives, adr-consequences]
canonical_for: []
translated_from_version: 1
last_reviewed: 2026-08-31
---

# ADR-003 — Keep PostgreSQL as the Single Primary Database

:::note Teaching example

The third of five ADRs from the fictional **Verano** system. This is an example of a
**decision not to act** — the kind that is invisible in the code and gets re-decided
repeatedly with no record.

:::

| | |
|---|---|
| Status | accepted on 2023-09-18 |
| System | Verano — ordering platform |
| Authors | platform team |
| Deciders | tech lead, engineer responsible for the catalog module |
| Consulted | catalog product team |

## Context

The catalog module has an open proposal: migrate to a document database. The motivation is
concrete and is not aesthetic preference.

The catalog models products with attributes that vary by category — a wine has a vintage
and a grape; a detergent has a volume and a fragrance. Today that is handled with a `jsonb`
column and attribute tables, and the team finds the model uncomfortable.

The situation in September 2023:

```text
products in the catalog          ~180 thousand
categories                       340
catalog queries                  ~800/s at peak
p99 of filtered search           210 ms
product requirement              under 300 ms
team                             14 engineers
                                 0 with operational experience in document databases
databases in production          1 (PostgreSQL)
```

Constraints:

- We are a single team, with one on-call rotation. Every new store is one more to operate,
  monitor, upgrade, back up and restore.
- There is no internal data platform; every new database requires tooling built by us.
- The latency requirement **is being met** with the current model.

What we didn't know: whether the variety of attributes would keep growing at the 2023 rate,
or would stabilize as the catalog matured.

## Decision

We will **keep PostgreSQL as the single primary database** for the whole Verano platform.

**We will not** adopt a document database for the catalog. The current model — typed
columns for what is common, `jsonb` with GIN indexes for what varies by category — stays.

This decision applies to primary storage. A cache and a dedicated search index are not
primary storage and are not affected by it.

## Alternatives Considered

**A document database for the catalog.** Discarded because the problem it would solve —
an uncomfortable model — is not causing measurable harm: the latency meets the requirement,
and there is no incident attributed to the model. The cost is concrete and immediate: one
more store to operate, with a team that has no experience.

*Would win again if:* the p99 of filtered search exceeds 300 ms and optimization in
PostgreSQL is exhausted, **or** if the catalog exceeds ~2 million products, **or** if a
second independent use case appears that also needs a document model.

**A dedicated search index for the catalog**, keeping PostgreSQL as the source of truth.
Discarded for now as unnecessary — the latency meets the requirement. But it is considered
the natural next option, and preferable to the document database, because it doesn't move
the source of truth.

*Would win again if:* faceted search becomes a product requirement, or the p99 exceeds
300 ms.

**Migrating the whole platform to a document database.** Discarded — orders and payments
require transactions and referential integrity we don't want to implement in the
application.

## Consequences

**Positive (immediate).** One store to operate. Transactions between modules stay local.
One competence to maintain in the team, not two. Backup, restore and upgrade with a single
procedure.

**Positive (long-term).** The pressure to optimize inside PostgreSQL produced knowledge that
applies to every module.

**Negative (immediate).** The catalog model stays uncomfortable. Attributes per category
require mapping code nobody enjoys maintaining, and the catalog team lives with a solution
they consider inferior.

**Negative (long-term).** If the catalog's scale grows far beyond what is expected, we will
do the migration under pressure instead of calmly.

**Neutral.** The decision needs reassessing — a review was recorded for 12 months out.

**Risk accepted.** We may be deferring a migration that will be more expensive later. The
bet is that the cost of operating two databases, now, is greater than the cost of the
deferral.

## Warning Signal

- p99 of filtered search above **300 ms** for two consecutive weeks.
- Catalog above **2 million products**.
- More than **three incidents per quarter** attributed to the catalog's data model.
- Development time on attribute mapping code above **10%** of the module's effort.

## Review — 2024-10-02

A block added 12 months later, with no change to the original text.

```text
products                    ~410 thousand
p99 of filtered search      260 ms
incidents attributed to
  the catalog model         1 in 12 months
effort on mapping           estimated at 6%
```

No condition met. Decision kept.

The catalog team reworked the attribute mapping in April 2024, which reduced the discomfort
without changing databases. Faceted search entered the product roadmap for 2025 — when that
is confirmed, the dedicated index alternative will be reassessed, and not the document
database one.

## What to notice in this example

The decision is **not to do something**. Without this ADR, the document database proposal
would come back every six months, with the same discussion — which is exactly the cost ADRs
avoid. See
[why ADRs matter](/18-architecture-decisions/why-adrs-matter.md).

The negative consequences include something uncomfortable to write: **the module's team
disagrees and will live with a solution they consider inferior**. Recording that is more
honest than presenting consensus. See
[decision](/18-architecture-decisions/adr-decision.md).

One of the alternatives was discarded **for now**, but explicitly marked as the natural next
option — which tells whoever comes later where the decision is heading.

The warning signal has four conditions, all measurable, and the 2024 review could be done
in minutes.

## Related Concepts

- [Decision](/18-architecture-decisions/adr-decision.md) — decisions not to act.
- [Consequences](/18-architecture-decisions/adr-consequences.md).
- [Relational Databases](/07-data-architecture/relational-databases.md).
- [Document Databases](/07-data-architecture/document-databases.md).

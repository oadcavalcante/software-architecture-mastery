---
id: data-modeling
title: Data Modeling
sidebar_position: 12
description: The hardest decision to reverse — and why it should start from the access pattern, not from the diagram.
doc_type: concept
level: 5
difficulty: intermediate
status: complete
objective: >
  By the end, the reader models from how the data will be used, and recognizes that
  the model carries the system's entire history.
prerequisites: [data-architecture]
related: [normalization, denormalization, data-ownership]
canonical_for: []
translated_from_version: 1
last_reviewed: 2026-08-31
---

# Data Modeling

## Overview

Modeling data is deciding which entities exist, which attributes they have, how they relate and where
the boundaries between them lie.

It is the most expensive decision to reverse in any system, because unlike code — which gets
rewritten — the model carries every record already written.

And it is frequently made early, with little information, by whoever has the least business context.

## Problem

Modeling usually happens in two bad ways.

**From the diagram outward.** Someone draws the domain's entities as they appear in the business
vocabulary, normalizes everything, and discovers later that the real queries require eight joins.

**From the screen inward.** Someone models exactly what the first screen needs, and discovers on the
second screen that the model does not serve.

The approach that works is neither: modeling from the **access pattern** — how the data is born, how
it changes and how it is read — while keeping the domain's vocabulary.

## Core Concepts

### Three levels, and the confusion between them

**Conceptual.** Which entities exist in the business and how they relate. No technology, no data
types. It is a conversation with whoever understands the domain.

**Logical.** Attributes, keys, cardinality, normalization. Still independent of the database.

**Physical.** Types, indexes, partitioning, performance decisions.

Jumping straight to the physical is common and produces models that reflect the tool's limitations
instead of the business. Stopping at the conceptual produces beautiful models that do not work.

### The access pattern decides

The questions that precede any diagram:

```text
how is the data created?      one at a time, in batches, by event
how is it read?               by key, by filter, by scan
how often?                    reads vs writes, order of magnitude
what changes?                 which attributes, how often
what has to be atomic?        which changes happen together
what is historical?           what has to be preserved
```

The fifth question is what defines aggregate boundaries. The sixth is the most forgotten and the one
that causes the most regret.

### Modeling time is the silent decision

Almost every model treats data as current state. And almost every business, sooner or later, asks
"how was it in March?".

Three approaches, with increasing costs:

**Current state only.** Simple, and the past is lost.

**A change history.** An audit table alongside. Cheap and it covers most needs.

**Temporal versioning.** Each record with a validity period. It allows reconstructing any moment, and
it complicates every query.

Deciding that after two years of operation means those two years of history do not exist. It is
unrecoverable — the only decision in this section that admits no retroactive correction.

### Identity: natural or surrogate

Using a business identifier — a tax ID, a product code — as the key looks economical and creates
coupling: when the business changes the code's rule, the whole model feels it.

The robust practice is a surrogate key as identity, and the business identifier as an attribute with
a uniqueness constraint — which can be changed without breaking references.

### Naming is modeling

An attribute called `status` with values the team interprets differently is a modeling defect, not a
documentation one.

The model's vocabulary should be the domain's, and the same term should mean the same thing
everywhere. See
[ubiquitous language](/04-domain-driven-design/ubiquitous-language.md).

### The model evolves, and migration is part of the design

No model survives intact. What distinguishes a sustainable model is not being right from the start —
it is being possible to change.

That means: avoiding tables so wide that any change is risky, avoiding keys that prevent
redistribution, and keeping a versioned migration trail from day one.

## Mental Model

**Model from how the data will be used, not from how it is described.** And decide about time before
you need it.

## When to Use

Explicit modeling pays off whenever:

- The data outlives the current system — nearly always.
- More than one team reads or writes.
- There is a history or auditing requirement.
- The volume will grow by orders of magnitude.

## When Not to Use

**Elaborate modeling for disposable data.** Cache, short-retention telemetry, a draft.

**Normalizing on principle.** See [normalization](/07-data-architecture/normalization.md) — it is a
decision, not a virtue.

**Modeling every domain entity before building.** The complete model designed in advance ages before
being used.

**A generic model** — "entity" and "attribute" tables that serve everything. They eliminate schema,
indexes and readability all at once.

The last is a persistent antipattern and worth naming: a model that serves anything serves nothing
well.

## Alternatives

- **Domain-driven modeling** — aggregates as the boundary. See
  [DDD](/04-domain-driven-design/index.md).
- **Dimensional modeling** — for analytics. See
  [data warehouse](/07-data-architecture/data-warehouses.md).
- **Schema on read** — storing raw and interpreting on read; suitable for exploratory ingestion, and
  see [data lake](/07-data-architecture/data-lakes.md) for the risks.

## Trade-offs

| Strict model | Flexible model |
|---|---|
| Guarantees in the store | Validation in the application |
| Planned evolution | Incremental |
| Unforeseen queries | Limited |
| Costly migration | Cheap |

| With history | Current state only |
|---|---|
| Reconstructs the past | Loses it |
| More complex queries | Direct |
| Larger volume | Smaller |
| Native auditing | Absent |

## Failure Modes

**No history when someone asks.** Unrecoverable.

**Wrong aggregate boundary.** Distributed transactions become routine.

**A natural key changing.** The business alters the rule and the references break.

**A table that is too wide.** Any schema change is a risky operation.

**Ambiguous vocabulary.** The same field means different things per service.

**A generic model.** No schema, no useful index, no readability.

## Common Mistakes

**Modeling from the screen.**

**Not deciding about time.**

**A natural key as identity.**

**Normalizing or denormalizing out of habit** instead of by access pattern.

**Not versioning migrations from the start.**

**Deferring the conversation with the business.** The conceptual model is not technical work.

## Real-World Example

A health plan management system modeled beneficiaries with current state: name, plan, tier,
dependents.

It worked for three years. Then the regulatory audit asked: "what was this beneficiary's tier in each
month of the last five years?".

The answer did not exist. Each tier change overwrote the previous one.

The partial reconstruction was done from application logs and billing files, with four months of
effort and an incomplete result. There was a fine.

The fix changed the model to temporal versioning on the attributes that matter — tier, plan and
amount — with a validity period. The rest stayed as current state.

Two observations the team recorded:

**Not everything had to be versioned.** The initial discussion considered temporalizing the whole
model, which would have complicated every query. Only three attributes had a real history
requirement.

**An audit table from the start would have been enough.** Full temporal versioning was not necessary
in 2022 — recording the changes would have sufficed. The cost would have been days, and the
information would exist.

The question "what might someone want to know about this record's past?" had not been asked.

## Related Concepts

- [Normalization](/07-data-architecture/normalization.md) and
  [Denormalization](/07-data-architecture/denormalization.md).
- [Data Ownership](/07-data-architecture/data-ownership.md) — who decides the model.
- [Data Lifecycle](/07-data-architecture/data-lifecycle.md) — retention and erasure.
- [DDD](/04-domain-driven-design/index.md) — aggregates as the boundary.

## Practical Exercise

For the three most important entities in your system, answer: if someone asks how this record looked
a year ago, can you answer?

Where you cannot, decide now whether that is acceptable. Two years from now the decision will no
longer be available.

## Interview Questions

- Why should the access pattern precede the diagram?
- What is the risk of using a business identifier as a key?
- Why does the decision about history admit no retroactive correction?

## Further Reading

- Fowler, Martin. *Patterns of Enterprise Application Architecture*. Addison-Wesley, 2002.
- Kleppmann, Martin. *Designing Data-Intensive Applications*. O'Reilly, 2017.
- Hay, David. *Data Model Patterns*. Dorset House, 1996.

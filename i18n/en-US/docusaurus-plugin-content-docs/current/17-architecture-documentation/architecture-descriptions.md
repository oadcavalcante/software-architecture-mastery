---
id: architecture-descriptions
title: Architecture Descriptions
sidebar_position: 10
description: The document that brings it all together — when it serves and when it's compliance theater.
doc_type: concept
level: 5
difficulty: advanced
status: complete
objective: >
  By the end, the reader knows how to produce a complete architecture description and how
  to recognize when it shouldn't exist.
prerequisites: [architecture-views]
related: [architecture-views, documentation-standards, documentation-principles]
canonical_for: []
translated_from_version: 1
last_reviewed: 2026-08-31
---

# Architecture Descriptions

## Overview

An architecture description is the **consolidated artifact** that brings a system's
[views](/17-architecture-documentation/architecture-views.md), decisions, constraints and rationale together in one
place.

It is the most complete form of architectural documentation, and the one with the worst
reputation — because most descriptions produced in the industry are written to satisfy a
process, not to be read.

The distinction between a useful description and compliance theater is observable: **the
useful one gets consulted**.

## Problem

Isolated diagrams answer specific questions and leave large gaps:

```text
why is the system like this, and not some other way?
what constraints shaped these choices?
what alternatives were discarded, and why?
what qualities does it need to have, with what numbers?
what is already known to be wrong?
```

No diagram answers those. The rationale is textual by nature, and it is what is lost most
when the people who decided leave.

At the same time, the traditional remedy — a large, formal document — fails for another
reason: it is written once, at the start, when the least is known, and never revised.

## Core Concepts

### What a description has to contain

Regardless of format:

```text
scope and context      what the system does and what is out of scope
stakeholders           who cares, about what
constraints            what is non-negotiable, and where it comes from
required qualities     with numbers, not adjectives
views                  the chosen representations
decisions              what was decided and why
risks and debt         what is known to be wrong
```

The last two are the most often missing and the most valuable. A description that only
asserts successes is not trustworthy.

See [quality attributes](/01-fundamentals/quality-attributes.md) for the qualities item —
"the system must be scalable" is not a requirement.

### arc42

arc42 is a twelve-section template, free and widely used:

```text
1  introduction and goals      7  deployment view
2  constraints                 8  cross-cutting concepts
3  context and scope           9  decisions
4  solution strategy          10  quality requirements
5  building block view        11  risks and technical debt
6  runtime view               12  glossary
```

The value lies less in the list and more in two properties: it **forces** the sections
people skip — constraints, decisions, risks, glossary — and it lets empty sections be
declared empty, which is information.

Section 11 is what most distinguishes an honest description from a compliance piece.

### ISO/IEC/IEEE 42010

The standard prescribes no format. It defines the vocabulary and the consistency rules:

```text
a description addresses identified stakeholders
each view is governed by a declared viewpoint
each viewpoint covers declared concerns
the rationale is part of the description
inconsistencies between views have to be recorded
```

The most useful item in practice is the last: the standard accepts that views will
diverge, and requires the divergence to be **recorded rather than hidden**.

### Rationale is the most durable content

Structure changes; the reason for having chosen a structure stays relevant even after the
structure changes — because it tells you whether the change contradicts a real constraint.

```text
"we chose X"                    ages
"we chose X because Y and Z"    keeps informing
"we discarded W because V"      avoids revisiting
```

This is the argument for [ADRs](/18-architecture-decisions/index.md), and the reason the
consolidated description should point at them instead of duplicating them.

### Write it afterwards, not beforehand

The pattern that works: the description is **written or revised after** the system exists,
describing what it is, with the decisions recorded along the way.

A description written before construction is a proposal, and it is worth something as such
— provided it is labeled that way and revised afterwards.

The classic anti-pattern is the document approved at the start of the project, filed away,
and never compared with what was built.

### One per system, not per project

Descriptions organized by project multiply and age: three projects in the same system
produce three documents, each describing one moment.

The description belongs to the **system**, has an owner, and is updated by any project that
affects it. See [documentation standards](/17-architecture-documentation/documentation-standards.md).

## Mental Model

**The document that answers "why", not just "what".** If it has no risks and no discarded
decisions, it is marketing.

## When to Use

- In long-lived systems, with team turnover.
- In regulated environments, where the description is required.
- When transferring a system between teams or vendors.
- In systems complex enough for the rationale to get lost.
- As a consolidation of documents that already exist, not as an initial effort.

## When Not to Use

**Before building**, as a document approved and filed away.

**Per project**, instead of per system.

**To satisfy a process**, with no identified reader.

**In small systems** — a well-made README is the description.

**Duplicating what already exists** in ADRs and diagrams, instead of pointing at them.

**With no owner and no review cadence** — it is born with a short shelf life.

## Alternatives

- **A set of ADRs** — the rationale, incremental, with no consolidated document.
- **A structured README** — for small systems, five sections suffice.
- **Standalone [views](/17-architecture-documentation/architecture-views.md)** — when only the structure matters.
- **A landing page with an index** — the description as an index to artifacts that already
  exist, with no content of its own.

The last is frequently the best: the consolidated description as **navigation**, not as a
repository of duplicated text.

## Trade-offs

| Consolidated description | Standalone ADRs |
|---|---|
| Complete view | Incremental |
| High maintenance cost | Low |
| One place to enter | Scattered |
| Ages as a block | Each one is dated |

| Formal template | Free format |
|---|---|
| Forces forgotten sections | Fitted |
| Comparable across systems | Shorter |
| Invites filling in out of duty | Invites omission |

## Failure Modes

**Written for approval.** Never compared with what was built.

**No risks and no debt.** A sign it isn't honest.

**Duplicating ADRs.** Two sources that diverge.

**Per project.** A proliferation of snapshots.

**Qualities with no numbers.** "Scalable", "secure", "reliable".

**No owner.** Nobody updates it.

## Common Mistakes

**Filling in every template section** for completeness, including those that don't apply —
instead of declaring them empty.

**Omitting discarded alternatives.**

**Writing it at the start and never revising it.**

**Not dating sections individually.**

**Consolidating by copying** instead of by reference.

## Real-World Example

A financial institution required a complete architecture description for every system
before it went into production, in a proprietary 40-page format.

A process review, prompted by an incident in which the existing description contradicted
the real system, measured:

```text
existing descriptions                              61
updated in the last 24 months                       9
with the risks section filled in                   14
with discarded alternatives recorded                7
with qualities expressed as numbers                11
consulted at least once in 12 months               17
```

The pattern was consistent: the descriptions were produced for the approval committee, and
the committee verified the existence of the sections, not the content. Sections were filled
with generic text that passed the check.

One sentence found in 23 of the 61 descriptions, word for word: "the system was designed to
meet the institution's performance and availability requirements".

The rework:

**The format replaced by arc42**, with explicit permission to declare sections not
applicable — which reduced the average length from 40 to 14 pages.

**Decisions moved into ADRs**, referenced by the description instead of copied. See
[architecture decisions](/18-architecture-decisions/index.md).

**A risks section mandatory and non-empty.** A description with no recorded risks is sent
back — the premise being that every system has some.

**Qualities with numbers.** Every quality requirement needs a metric and a source. See
[quality attributes](/01-fundamentals/quality-attributes.md).

**An annual review with a named owner**, not a single approval at entry.

**Sample verification**: every quarter, three descriptions are compared with the real
system by someone outside the team.

Eighteen months later: 54 descriptions updated in the last 12 months, 49 with real risks
recorded, and the consultation rate rose to 41 systems.

The recorded conclusion: the change with the greatest effect was not the format. It was
allowing sections to be declared empty. As long as filling in everything was mandatory,
generic text was the rational answer.

## Related Concepts

- [Architecture Views](/17-architecture-documentation/architecture-views.md) — the structural content.
- [Architecture Decisions](/18-architecture-decisions/index.md) — the rationale.
- [Documentation Standards](/17-architecture-documentation/documentation-standards.md) — the policy.
- [Documentation Principles](/17-architecture-documentation/documentation-principles.md).

## Practical Exercise

Take a system's architecture description in your team and check three things: are risks
recorded, are discarded alternatives recorded, and do the qualities have numbers?

If all three are missing, the description is a compliance piece.

## Interview Questions

- Why does the risks section distinguish an honest description from a formal one?
- Why does the description belong to the system and not to the project?
- What is the advantage of referencing ADRs instead of copying them?

## Further Reading

- ISO/IEC/IEEE 42010:2022 — *Architecture description*.
- Starke, Gernot; Hruschka, Peter. *arc42* — arc42.org.
- Clements, Paul et al. *Documenting Software Architectures*. 2nd ed. Addison-Wesley, 2010.

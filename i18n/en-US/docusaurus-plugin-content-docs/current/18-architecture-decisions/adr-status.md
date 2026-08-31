---
id: adr-status
title: ADR Status
sidebar_position: 8
description: The lifecycle of a recorded decision — and why the document is never edited.
doc_type: concept
level: 5
difficulty: intermediate
status: complete
objective: >
  By the end, the reader manages the ADR lifecycle without destroying the history of the
  reasoning.
prerequisites: [adr-structure]
related: [superseding-decisions, adr-structure, what-is-an-adr]
canonical_for: []
translated_from_version: 1
last_reviewed: 2026-08-31
---

# ADR Status

## Overview

Status is the only field in the ADR that changes after it is written, and the change is
always **additive**, never a rewrite.

```text
proposed           written, under discussion
accepted           in force
superseded by N    replaced, with a reference to the successor
deprecated         no longer holds, with no replacement
```

Behind that simple list is the property that gives the format its value: **an ADR records
an event, not a state.** A past event is not updatable, and that is why the document is
immutable.

Teams that don't understand this end up keeping ADRs "up to date" — and destroy exactly the
information that justified them.

## Problem

The natural impulse, when a decision changes, is to edit the existing ADR. It looks out of
date, and out of date looks wrong.

What is lost by editing:

```text
that the previous decision existed
why it made sense in its own context
what changed between one and the other
that the organization has already thought about this
```

The last is the most expensive. An edited ADR erases the evidence that the question has
already been analyzed, and the analysis starts over from scratch next time.

And there is a subtler loss: with no history, there is no way to calibrate judgment. A team
that cannot see its previous decisions and what happened to them doesn't learn from its own
pattern of error.

## Core Concepts

### Proposed

The ADR exists, the reasoning is written, the decision is still under discussion.

```text
serves to          discuss on the basis of a document, not a conversation
typical duration   days to two weeks
outcome            accepted, or deprecated without ever having held
```

That status is underused. Writing the ADR **before** deciding is what captures the
practice's most valuable effect — the decision that changes during the writing. See
[why ADRs matter](/18-architecture-decisions/why-adrs-matter.md).

A proposed ADR that is never accepted is not waste: it records that the option was
considered and why it didn't proceed.

### Accepted

The decision holds. With a date.

```text
Status: accepted on 2024-03-12
```

The acceptance date is distinct from the writing date, and distinguishing them matters when
the discussion was long.

Nothing else in the document changes from here on.

### Superseded

The decision was replaced by another:

```text
Status: superseded by ADR-047 on 2026-01-20
```

And the successor references its predecessor:

```text
Status: accepted on 2026-01-20 — supersedes ADR-014
```

The bidirectional reference is what makes the history navigable. See
[superseding](/18-architecture-decisions/superseding-decisions.md).

The superseded ADR **stays in the repository**, legible, with the original text intact. It
remains the correct record of a correct decision for its own context.

### Deprecated

The decision no longer holds, and no other one replaces it:

```text
Status: deprecated on 2025-08-04 — the recommendation service
        was decommissioned; the decision lost its subject.
```

Used when the subject of the decision disappeared — the system was shut down, the problem
ceased to exist, the requirement was removed.

The reason is mandatory. "Deprecated" with no explanation is worse than nothing: someone
finds the decision, sees it doesn't hold, and doesn't know whether it was replaced,
reversed or forgotten.

### Why not edit

```text
the ADR describes a moment       moments are not updated
the context was that moment's    editing it makes it false
the history is the value         without it, we re-decide
the evolution is information     seeing the sequence teaches
```

The acceptable exception: correcting a factual, typographic or link error, without altering
the reasoning. Corrections that change the meaning are not corrections — they are new
decisions.

### Intermediate statuses some teams use

```text
rejected      proposed and not accepted, kept as a record
under review  accepted, but being reassessed
conditional   accepted with a condition still to be confirmed
```

Each addition increases the set's cognitive load. `rejected` is the one that pays off most —
it preserves proposals that were analyzed and refused, which otherwise disappear.

`under review` is useful in large organizations, to signal that nothing should be built on
that decision at the moment.

### Status has to be visible in the index

A set of ADRs with no index showing status forces you to open files to know what holds:

```text
ADR-001  Use PostgreSQL as the primary database    accepted     2022-04-11
ADR-014  Process orders synchronously              superseded   2024-09-02
ADR-047  Process orders asynchronously             accepted     2024-09-02
ADR-032  Adopt a distributed cache                 deprecated   2025-08-04
```

Generated from the files, not maintained by hand. See
[living documentation](/17-architecture-documentation/living-documentation.md).

## Mental Model

**The ADR is an event, not a state.** Changing your mind produces a new document, never an
edit.

## When to Use

- In every ADR, with a date on each transition.
- With `proposed` before deciding, to capture the writing effect.
- With a generated index, showing status.

## When Not to Use

**Editing the text** when the decision changes.

**Deleting superseded ADRs.**

**With no date** on the transitions.

**With too many statuses** — each additional one has to pay for itself.

**With no reason on `deprecated`.**

**With no bidirectional reference** between the superseded one and its successor.

## Alternatives

- **Version control history** — it records the edits, and nobody consults a file's history
  to understand a decision.
- **One living document per topic**, with internal history — loses granularity and
  referenceability.
- **No status, only a date** — works in very small sets and fails as they grow.

The first deserves a note: version control technically preserves the history, and does not
make it accessible. "It's in the repository history" is, in practice, the same as not being
there.

## Trade-offs

| Immutable | Editable |
|---|---|
| Preserves the reasoning | Always reflects the current state |
| Requires reading the index | Direct reading |
| Navigable history | History lost |

| Few statuses | Many |
|---|---|
| Simple | More expressive |
| Less ambiguity | More load |
| Sufficient in most cases | Useful at scale |

## Failure Modes

**An edited ADR.** The context becomes false, the history disappears.

**Superseded with no reference.** Nobody finds the successor.

**Deprecated with no reason.** Worse than nothing.

**No index.** Nobody knows what holds.

**Deleted ADRs.** The organization loses the memory of having decided.

**Status stuck at `proposed`** indefinitely — a decision made in practice, with no formal
record.

## Common Mistakes

**Keeping ADRs up to date**, as if they were system documentation.

**Deleting the superseded one** for looking confusing.

**Not dating transitions.**

**Not referencing the predecessor** in the successor.

**Leaving the index manual**, which goes out of date.

## Real-World Example

A software company had been keeping ADRs for four years, with a practice that looked
reasonable: when a decision changed, the ADR was edited and a history line was appended at
the end.

One episode exposed the problem. A team proposed migrating a service from synchronous to
asynchronous communication. During the analysis, someone vaguely remembered that "this had
been discussed before".

The ADR found, from 2021, said the communication was asynchronous. The history at the end
had three lines:

```text
2021-05  created
2022-11  updated after a change of approach
2023-07  updated
```

The 2021 text had been replaced. The original decision — which was **synchronous**, with
specific reasons — had disappeared, and so had the reasons for the 2022 change.

Reconstruction, through the repository history, took two days and showed that the service
had been migrated to asynchronous in 2022 and **back to synchronous** in 2023, because of
event ordering problems the new proposal would reintroduce exactly.

Nobody involved in 2026 knew that.

What changed:

**Immutable ADRs.** No editing of reasoning, only factual corrections.

**Mandatory superseding** for a change of decision, with a bidirectional reference.

**Migration of the archive.** The 89 existing ADRs were examined; 23 had an editing
history. For those, the previous versions were recovered from version control and published
as ADRs of their own, superseded, with the original numbering preserved plus a suffix.
Three weeks of work.

**A generated index** from the files, with status, date and the superseding chain visible.

**A proposal rule**: significant decisions start as `proposed` and stay open for at least
three business days before acceptance.

An unforeseen effect of the migration: on recovering the old versions, three decisions
turned out to have gone back and forth — the same pattern as the case that prompted the
change. That became an internal calibration exercise.

The recorded conclusion: the practice of editing with a history line looked like it
preserved information. It preserved the record that something had changed, and erased what
it was — which is the part that matters.

## Related Concepts

- [Superseding](/18-architecture-decisions/superseding-decisions.md) — the mechanics.
- [ADR Structure](/18-architecture-decisions/adr-structure.md).
- [What an ADR Is](/18-architecture-decisions/what-is-an-adr.md) — immutability as a
  characteristic.
- [Living Documentation](/17-architecture-documentation/living-documentation.md) — the
  generated index.

## Practical Exercise

Check whether any of your team's ADRs has been edited after being accepted.

If so, recover the previous version from the repository history and compare. The difference
between the two is information that was accessible to no one.

## Interview Questions

- Why does an ADR record an event and not a state?
- Why does "it's in the repository history" not replace a superseded ADR?
- When is `deprecated` the correct status instead of `superseded`?

## Further Reading

- Nygard, Michael. *Documenting Architecture Decisions*. 2011.
- *MADR — Markdown Any Decision Records* — adr.github.io/madr.
- Keeling, Michael. *Design It!*. Pragmatic Bookshelf, 2017.

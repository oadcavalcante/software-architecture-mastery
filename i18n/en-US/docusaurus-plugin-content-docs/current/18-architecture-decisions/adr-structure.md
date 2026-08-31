---
id: adr-structure
title: ADR Structure
sidebar_position: 3
description: The five sections, what each carries, and why the short format is deliberate.
doc_type: concept
level: 5
difficulty: beginner
status: complete
objective: >
  By the end, the reader writes a complete ADR in the standard format and knows when to
  adapt it.
prerequisites: [what-is-an-adr]
related: [adr-context, adr-decision, adr-consequences, adr-status]
canonical_for: []
translated_from_version: 1
last_reviewed: 2026-08-31
---

# ADR Structure

## Overview

Nygard's original format has five parts:

```text
Title          short, declarative, with a number
Status         proposed, accepted, superseded, deprecated
Context        the forces in play at the time
Decision       what was decided, in the active voice
Consequences   what becomes true, good and bad
```

It fits on one page. That brevity is not thrift — it is what makes the practice
sustainable and what keeps the document from becoming a specification.

And there is an asymmetry of value between the sections that almost every beginner author
inverts: **context and alternatives carry almost everything; the decision itself is the
shortest and least interesting part.**

## Problem

With no structure, decision records become one of two things:

```text
a note that is too short   "we decided to use Postgres" — informs nothing
a document that is too long  twenty pages nobody writes or reads
```

And there is a third, subtler mode: the record that describes **what was done** instead of
**why**. It looks complete and carries none of the information that justifies the effort.

The structure solves all three, because each section forces a specific question that is
easy to skip.

## Core Concepts

### Title

Short, declarative, in the infinitive or in the form of a decision:

```text
good   "Use PostgreSQL as the primary database"
good   "Separate the billing service"
bad    "Database"                          — not a decision
bad    "Discussion about persistence"      — that's minutes
bad    "Decision 14"                       — informs nothing
```

The title is what appears in the index, and it is how someone finds the decision two years
later. It has to be legible out of context.

Numbering is sequential and permanent — numbers are not reused, even when an ADR is
deprecated.

### Status

One word, with a date:

```text
proposed         written, still under discussion
accepted         in force
superseded by N  replaced, with a reference
deprecated       no longer holds, with no replacement
```

It is the only field that changes after acceptance, and the change is always additive. See
[status](/18-architecture-decisions/adr-status.md).

### Context

The most important section and the most badly written. It records **the forces in play at
the time**:

```text
the current situation and what makes it unsatisfactory
the constraints in force — technical, schedule, team, contractual
what was known and what was not
the requirements the decision has to meet, with numbers
```

The test: can someone who wasn't there understand why the decision was necessary, and
under what conditions the answer could have been different? See
[context](/18-architecture-decisions/adr-context.md).

The characteristic mistake is writing the context as a generic introduction — "we are
building an orders system" — instead of recording the specific forces.

### Decision

Active voice, affirmative, short:

```text
"We will use PostgreSQL as the primary database for all services in the orders domain."
```

Not "it is proposed", not "it is recommended", not "it was evaluated". A decision recorded
in the passive or conditional voice is not a decision.

See [decision](/18-architecture-decisions/adr-decision.md).

It is common for this section to be three lines. That is correct — the volume is in the
context and the consequences.

### Consequences

What becomes true after the decision, **including what gets worse**:

```text
positive   what the decision enables
negative   the cost accepted
neutral    what changes without being better or worse
risks      what can go wrong, and the warning signal
```

A consequences section with only positive points is a sign of an ADR written to persuade,
not to record. See
[consequences](/18-architecture-decisions/adr-consequences.md).

### Alternatives — the addition that is worth it

Nygard's original format has no alternatives section. Practically every derived format
added one, because that is where the reasoning becomes visible.

```text
the option considered
why it was discarded
under what condition it would win again
```

The third line is what turns the ADR into an instrument for future revision. See
[alternatives](/18-architecture-decisions/adr-alternatives.md).

### Format variants

```text
Nygard          5 sections, minimal, the most used
MADR            markdown, with alternatives and explicit criteria
Y-Statement     one structured sentence: "in the context of X, facing Y,
                we decided Z, to achieve W, accepting V"
Tyree & Akerman more complete, with stakeholders and implications
```

The Y-Statement deserves a note: it fits in a sentence and forces the five elements. It is
a good format for smaller decisions that don't justify a document.

The choice between formats matters less than consistency: one format used across the whole
organization lets you read other systems' ADRs without relearning.

### Useful metadata

```text
date          mandatory — the context is always dated
authors       who decided, for anyone who wants to ask
deciders      when they differ from whoever wrote it
tags          for search
related       ADRs this one affects or that affect it
```

Authorship matters more than it seems: a two-year-old ADR with an identifiable author still
has a person to ask, if they are still in the organization.

## Mental Model

**Context and alternatives carry the value; the decision is the shortest line.** If the ADR
doesn't fit in two pages, it is probably several decisions.

## When to Use

- Whenever you write an ADR — the format is the common minimum.
- As a checklist: if a section is empty, something hasn't been thought through.
- When standardizing the practice across an organization.

## When Not to Use

**Adding sections for completeness** — every extra section reduces the chance the ADR gets
written.

**As a rigid template** — a small decision fits in a Y-Statement.

**With generic context** that would serve any decision.

**With the decision in the passive voice.**

**With no negative consequences.**

**Different formats per team**, which prevents cross-reading.

## Alternatives

- **Y-Statement** — one sentence, for smaller decisions.
- **MADR** — when the comparison criteria have to be explicit.
- **A format of your own** — legitimate, provided it is uniform and short.
- **A code comment** — for local decisions, a comment explaining the why is the right
  record.

The last is underused: not every decision deserves a file, and many deserve three lines of
comment next to the code they explain.

## Trade-offs

| Minimal format | Complete format |
|---|---|
| Written frequently | More informative |
| Fast to read | Slower |
| Omits criteria | Makes them explicit |
| Sustainable | Tends toward abandonment |

| A single template | Free format |
|---|---|
| Comparable across systems | Fitted to the decision |
| Invites filling in out of duty | Varies too much |
| Easy to index | Hard |

## Failure Modes

**Generic context.** The most important section becomes an introduction.

**A conditional decision.** "It is recommended to evaluate" is not a decision.

**Only positive consequences.** A persuasion ADR.

**No alternatives.** Assertion with no argument.

**Too long.** It doesn't get written, or it doesn't get read.

**No date.** The context loses its anchor.

**A vague title.** It isn't found later.

## Common Mistakes

**Writing the decision first** and the context as retroactive justification.

**Mixing several decisions** into one ADR.

**Describing implementation** instead of the decision.

**Omitting the reversal condition** in the alternatives.

**Numbering by date** instead of sequentially — it makes referencing harder.

## Real-World Example

A technology company with nine teams adopted ADRs without standardizing the format. Each
team chose its own.

Two years and 210 ADRs later, a review found:

```text
distinct formats in use                        6
ADRs with no alternatives section            134
with no negative consequences                157
with generic context                          89
with no date                                  41
with a non-descriptive title                  52
```

The practical problem was not the variety of formats — it was the systematic absence of the
same two things: alternatives and negative consequences. The teams using pure Nygard format
simply had no field for alternatives, and the others left it blank.

And the ADRs with no negative consequences were all readable as justification of a choice
already made.

The standardization adopted:

**MADR as the single format**, chosen for having alternatives and criteria as first-class
sections.

**Mandatory alternatives**, with the reversal condition made explicit. An ADR with no
alternative is sent back in review.

**At least one negative consequence.** The premise: every architectural decision has a
cost, and an ADR that doesn't name it hasn't thought about it.

**The Y-Statement authorized** for smaller decisions — which raised the volume, because
many decisions that didn't warrant a document started being recorded in one sentence.

**The title checked** by a simple rule: it has to start with a verb.

**A single index** across teams, generated from the repositories.

A year later, 168 new ADRs:

```text
with alternatives                             168
with at least one negative consequence        161
Y-Statements                                   57
consulted at least once                        38
```

Requiring one negative consequence was the rule with the greatest effect. It cost one line
and changed the nature of the document — from a persuasion piece to a record of an accepted
trade-off.

And the Y-Statement solved a problem nobody had named: medium-sized decisions, which didn't
warrant a document, previously weren't recorded at all.

## Related Concepts

- [Context](/18-architecture-decisions/adr-context.md) — the section that carries the value.
- [Decision](/18-architecture-decisions/adr-decision.md) — the shortest.
- [Alternatives](/18-architecture-decisions/adr-alternatives.md) — the essential addition.
- [Consequences](/18-architecture-decisions/adr-consequences.md) — where the cost is named.

## Practical Exercise

Take an existing ADR from your team and check three things: does the context cite specific
constraints, are there alternatives with a reversal condition, and is there at least one
negative consequence?

The absence of all three is the typical profile of an ADR written to justify rather than to
record.

## Interview Questions

- Why is the decision section usually the shortest?
- Why did the original format not have alternatives, and why did almost every derived
  format add them?
- When is a Y-Statement preferable to a document?

## Further Reading

- Nygard, Michael. *Documenting Architecture Decisions*. 2011.
- *MADR — Markdown Any Decision Records* — adr.github.io/madr.
- Zdun, Uwe et al. *Sustainable Architectural Design Decisions*. IEEE Software, 2013.

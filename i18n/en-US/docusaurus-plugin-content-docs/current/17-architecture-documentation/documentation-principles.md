---
id: documentation-principles
title: Documentation Principles
sidebar_position: 1
description: What decides whether documentation gets read — reader, purpose and the level of detail that survives.
doc_type: concept
level: 5
difficulty: intermediate
status: complete
objective: >
  By the end, the reader writes documentation with a defined reader and question, and
  discards what serves neither.
prerequisites: [architecture-documentation]
related: [living-documentation, architecture-views, diagram-quality]
canonical_for: []
translated_from_version: 2
last_reviewed: 2026-08-31
---

# Documentation Principles

## Overview

The question that decides whether a document gets read is not about content. It is: **who
will read it, and what question does that person have?**

Documentation written without that answer is written to "document" — and produces
artifacts nobody looks for, because they weren't made to answer anything.

The second criterion is temporal: the level of detail determines how long the document
survives. Fine detail ages in weeks; structure and reasons age in years.

## Problem

The failure pattern is recognizable:

```text
documentation produced at the end of the project
describing everything, at the same level of detail
stored in a document repository
with no owner
never consulted
```

Six months later it is wrong. A year later it is dangerous — because whoever finds it
assumes it describes the system.

And the typical reaction on realizing that is to produce more documentation, with more
rigor. The problem was not volume.

## Core Concepts

### Write for one reader with one question

Each document serves a combination of reader and question:

```text
reader                      typical question
someone joining the team    how does this system work, in broad strokes
whoever will change it      where do I touch, and what do I break
whoever operates it         what do I do when something goes wrong
whoever integrates          what is the contract, what are the guarantees
whoever decides investment  what does this do, what does it cost, what is the risk
audit                       who accesses what, how is it protected
```

A document that tries to serve everyone serves each of them badly. And most needs are
covered by few documents, if each one is written for one reader.

The test before writing: **who will look for this, and what does that person want to
know?** If there is no answer, don't write it.

### The detail determines the half-life

```text
level                       ages in
reasons and trade-offs      years — the decision's context doesn't change
boundaries and structure    a year — they change with large refactorings
internal components         months
implementation detail       weeks
```

That doesn't mean never documenting detail. It means knowing that documenting detail
creates a maintenance obligation — and deciding whether it is worth it.

The rule of thumb: **document by hand what ages slowly; derive what ages fast.** See
[living documentation](/17-architecture-documentation/living-documentation.md).

### The why is what only human writing captures

```text
what exists        derivable from the code and the infrastructure
how it connects    derivable from tracing and configuration
why it is like this  derivable from nothing
```

The third line is the highest-value content and the most frequently absent. A system can
be read; the reasons that produced it cannot.

```text
why this boundary, and not another
which alternatives were considered
which constraint led to this choice
what was tried and didn't work
```

See [architecture decisions](/18-architecture-decisions/index.md).

A three-line comment explaining why a strange fragment exists is worth more than a page
describing what it does — because what it does is right there, and the why is not.

### Close to the code, not in a separate repository

Documentation that lives far from the code diverges from it.

```text
in the repository       versioned together, reviewed together, found by whoever works there
in a separate tool      updated by someone who remembers
```

The practical criterion: **does the documentation change in the same commit as the change
that makes it out of date?** If not, it will diverge.

That doesn't prevent publishing it elsewhere — the source stays in the repository, and
the publication is derived.

### Documentation on demand

An alternative to preventive documentation: document when someone asks.

```text
someone asks             →  answer, and turn the answer into a document
the same question twice  →  the document justifies itself
nobody asks              →  there was no need
```

That guarantees a real reader and a real question, and avoids the cost of documenting
what nobody wants to know.

The limit: it fails for knowledge you only discover you need when it is too late — the
why behind a decision, after whoever made it has left. That kind has to be recorded at
the time, not on demand.

### Less, and correct

Documentation that is small and trustworthy is more useful than one that is extensive and
doubtful.

```text
trustworthy   people act on it
doubtful      people check the code — and the document becomes pure cost
```

And there is a contamination effect: one wrong document in a set reduces confidence in
all of them.

That favors the strategy of keeping little and keeping it well — with a visible review
date, and with what is not maintained removed rather than left behind.

### The cost of maintaining is the real cost

The calculation that is almost never made: documentation has a writing cost, which is
visible and one-off, and a maintenance cost, which is invisible and recurring.

```text
write          hours, once
maintain       minutes, many times, forever
don't maintain cost transferred to whoever reads it and gets it wrong
```

The third line is what most organizations choose without noticing. It appears in no plan,
and reappears as incidents, rework and distrust.

That gives a decision criterion before writing any document: **who will maintain this, and
with what trigger?** With no answer, the document is born with a short shelf life — and
the best thing to do is usually to write less.

## Mental Model

**One reader, one question.** The level of detail defines the half-life, and the why is
what only human writing captures.

## When to Use

- Before writing any architecture document.
- When reviewing existing documentation, to decide what to keep.
- When onboarding new people.
- When the same question keeps coming up.

## When Not to Use

**When nobody will own the maintenance of the detail you are about to write.** Every level
of detail creates a recurring obligation, and detail with no owner is what goes stale first —
and fastest, because it is what changes most.

**When the knowledge has not been discovered yet.** On-demand documentation has a limit: it
only records what someone has already asked. For what is discovered late — the reason behind
a constraint, what was tried and did not work — waiting for the question means losing the
answer along with the person who had it.

**When there is no answer to "who maintains this, and on what trigger".** Without both, the
document is born with an expiry date and nobody knows what it is. See
[documentation standards](/17-architecture-documentation/documentation-standards.md), which
covers the trigger and the owner.

**When what you were about to write is what the code already says.** There the text is not
redundant: it is a second source that will diverge, and the divergence costs more than the
absence.

## Alternatives

- **Readable code** — names and structure that make explaining what it does unnecessary.
- **Tests as specification** — they describe the behavior verifiably. See
  [legacy refactoring](/16-legacy-modernization/legacy-refactoring.md).
- **Decision records** — the why, in its own format.
- **Transfer sessions** — when the knowledge is tacit and writing doesn't capture it.

The last is underrated: some kinds of knowledge transfer better by shadowing than by
document.

## Trade-offs

| Extensive documentation | Lean |
|---|---|
| Covers more cases | Only the essential |
| High maintenance cost | Low |
| Ages as a whole | Sustainable |
| Hard to find the relevant part | Direct |

| Preventive | On demand |
|---|---|
| Ready when you need it | Written when someone asks |
| May not be necessary | Guaranteed reader |
| Covers what you discover late | Fails in that case |

## Failure Modes

**A document with no reader.** Produced and never consulted.

**Out of date and trusted.** Someone acts on wrong information.

**Too much detail.** It ages before it is useful.

**Far from the code, with no trigger that forces the update.** Nothing obliges whoever
changes the behaviour to touch the text, and the divergence only surfaces when someone
relies on it.

**Describes the what, not the why.** The code already said the what.

**Contamination.** One wrong document reduces confidence in the set.

## Common Mistakes

**Writing to "document".** A document with no question it answers and no identified reader is consulted by nobody, and still requires maintenance.

**Documenting everything at the same level.** What changes every week and what hasn't changed in three years deserve opposite treatments: one becomes an automated check, the other becomes text.

**Not dating it or naming an owner.** Without both, the reader doesn't know whether to trust it or whom to ask — and assumes it is current.

**Keeping documentation nobody trusts.** A knowingly wrong document is worse than no document, because it leads whoever didn't know it was wrong into a wrong decision.

**Not recording the why** behind decisions. The structure can be read in the code; the reason can be read nowhere, and it is what allows reassessment later.

**Not removing what has become obsolete.** Accumulated documentation dilutes what still holds, and the reader loses the ability to tell the difference.

## Real-World Example

A financial services company had 340 architecture documents in a corporate repository.

A usage audit measured twelve months of access:

```text
documents accessed more than 10 times    9
accessed between 1 and 10 times         31
never accessed                         300
```

The nine most accessed had common characteristics: they were short, they answered a
specific question, and four of them were context diagrams of critical systems.

The 300 never accessed were, for the most part, detailed specifications produced at the
end of projects.

The rework:

**The 300 were removed.** Not archived — removed, with the history preserved in version
control. Keeping them reduced confidence in the set.

**One document per system**, in that system's own repository, with a fixed structure:
context, containers, relevant decisions, and what operations needs to know.

**Derived diagrams** where possible: dependencies from tracing, topology from declared
infrastructure. See
[living documentation](/17-architecture-documentation/living-documentation.md).

**Decision records** for the why, in the repository. See
[architecture decisions](/18-architecture-decisions/index.md).

**A visible review date** on each document, with an alert past twelve months.

**Documentation on demand** as the rule: recurring questions become documents; one-off
questions become answers.

Eighteen months later:

```text
documents maintained                          78 (40 survivors, 38 written in the overhaul)
accessed more than 10 times in the year       61
share considered trustworthy (survey)         84%, against 22% before
```

Removing the 300 was the most controversial change and the most effective. The argument
that "it might be useful one day" had sustained the maintenance of a collection nobody
consulted and nobody trusted.

## Related Concepts

- [Living Documentation](/17-architecture-documentation/living-documentation.md) — how to maintain it.
- [Architecture Views](/17-architecture-documentation/architecture-views.md) — organizing by reader.
- [Diagram Quality](/17-architecture-documentation/diagram-quality.md).
- [Architecture Decisions](/18-architecture-decisions/index.md) — the why.

## Practical Exercise

Take your team's architecture documents and check how many were accessed in the last six
months.

Then ask, of each one: who is the reader, and what question does it answer? Those with no
answer are candidates for removal.

## Interview Questions

- Why does the level of detail determine the half-life?
- Why is out-of-date documentation worse than none?
- What does only human writing capture?

## Further Reading

- Brown, Simon. *Software Architecture for Developers*. Leanpub, 2015.
- Parnas, David; Clements, Paul. *A Rational Design Process: How and Why to Fake It*.
  IEEE TSE, vol. SE-12, no. 2, 1986.
- Hohpe, Gregor. *The Software Architect Elevator*. O'Reilly, 2020.

---
id: fundamentals
title: Foundation
sidebar_position: 0
description: The concepts that must exist before any serious conversation about architecture.
doc_type: index
level: 1
difficulty: beginner
status: complete
objective: >
  By the end, the reader can say what architecture decides, what it does not
  decide, and why an architectural decision differs from an implementation
  decision.
prerequisites: []
related: [software-design]
canonical_for: []
translated_from_version: 1
last_reviewed: 2026-08-29
---

# Level 01 — Foundation

This is the section that makes the rest of the path possible. It does not teach
you to design systems; it teaches the vocabulary and the criteria by which
systems are judged.

## The problem this section solves

Most material on architecture starts by presenting solutions: layers,
microservices, queues, caches. That produces a practitioner who recognizes shapes
but cannot choose between them, because they never learned to articulate what
they are trying to optimize.

Architecture is not a catalogue of structures. It is the activity of deciding
under constraint, knowing that every decision closes doors. To decide well, you
first need to name precisely what is at stake: what the system must do, how well
it must do it, what cannot be changed, and what the organization can sustain.

Without that vocabulary, architectural discussions become disputes of aesthetic
preference. With it, they become analysis.

## What you will find here

**What architecture is.** The distinction between architecture, design and
implementation — and why the boundary between them is contextual, not absolute.
Architecture as a set of decisions, not as a set of diagrams.

**What the system must do.** Functional requirements, non-functional
requirements, quality attributes and constraints. Why confusing these four is the
origin of a good share of wrong architectures.

**The structural properties.** Coupling, cohesion, modularity, abstraction and
separation of concerns. These are the measures by which you judge whether a
structure will withstand change.

**The cost of being wrong.** Complexity, dependency management and technical debt
— what accumulates when decisions are deferred or made without criteria.

**The context.** Business context, problem space and solution space. Architecture
that ignores the business optimizes the wrong thing with great competence.

**The temporal dimension.** Architecture principles, architectural
characteristics and evolution — because no decision is made only once.

## Reading order

Read in sidebar order. This is the only section of the path where the sequence
genuinely matters, because each concept is used to define the next.

If you have worked with systems for a few years, the temptation is to skip.
Resist it on three topics specifically: **quality attributes**, **constraints**
and **architecture as a set of decisions**. These are the ones most often present
as intuition and absent as vocabulary — and absent vocabulary is what prevents
you from defending a decision to someone who disagrees.

## By the end

You can take a system description and separate, without ambiguity, what is a
functional requirement, what is a quality attribute and what is a constraint. You
can point at unnecessary coupling and argue why it is expensive. You can explain
why one decision is architectural and another is not.

More importantly: you stop asking "what is the right architecture?" and start
asking "right for what, under which constraints?".

## Mistakes this section prevents

- Treating quality attributes as vague wishes instead of negotiated numbers.
- Confusing a constraint with a preference, and negotiating what is not
  negotiable.
- Calling architecture what is a code convention, and the reverse.
- Optimizing coupling without accounting for the duplication that replaces it.
- Discussing technology before establishing what has to be true.

## Continues in

[Level 02 — Software Design](../02-software-design/index.md), where these
concepts stop being vocabulary and become criteria for structuring code.

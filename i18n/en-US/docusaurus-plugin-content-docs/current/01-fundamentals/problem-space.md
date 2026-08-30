---
id: problem-space
title: Problem Space
sidebar_position: 5
description: What has to be true, before and independently of how it will be solved.
doc_type: foundation
level: 1
difficulty: beginner
status: complete
objective: >
  By the end, the reader separates the description of a problem from the solution
  implied in it, and recognizes when a discussion is about solutions with no
  agreement on the problem.
prerequisites: [business-context]
related: [solution-space, functional-requirements]
canonical_for: [problem space]
translated_from_version: 1
last_reviewed: 2026-08-30
---

# Problem Space

## Overview

The problem space is the set of things that have to be true for the need to be
met — expressed without reference to how it will be built.

Keeping that separation is harder than it sounds, because natural language
smuggles solutions in. "We need a queue" is already a solution. The corresponding
problem might be "processing must not block the response to the user", and a queue
is one of several ways to solve it.

## The Problem

Architecture discussions derail for one specific and recurring reason: people
debate solutions without having agreed on the problem.

The symptom is recognizable. Two people argue for different options with equal
conviction, the arguments never touch, and the discussion circles. Almost always,
each is solving a different problem and neither has noticed.

The root cause is that problems arrive already wrapped in a solution. The
stakeholder does not say "I need to know whether the order is late"; they say "I
need a dashboard". The team debates dashboard technology. Nobody asks what
decision will be made with that information — and the answer might be "cancel the
order", which suggests an alert, not a dashboard.

## Core Concepts

### The problem mentions no mechanism

A well-formed problem statement describes a desired state, a constraint or a
consequence. It mentions no technology, component or pattern.

| Statement with a solution baked in | Corresponding problem |
|---|---|
| "We need a cache" | "The same query is repeated 200×/s and takes 400 ms" |
| "We need microservices" | "Two teams block each other on every release" |
| "We need Kafka" | "We need to reprocess events from the last 7 days" |
| "We need a dashboard" | "Operators don't know which orders require action" |

The right column is useful because it admits more than one answer. The left has
already chosen, and hidden the choice inside the statement.

### Backing up to the problem

The technique is to ask "why" until the answer stops mentioning mechanism. In
practice, two or three iterations are enough.

```text
"We need a distributed cache."
    why?
"The catalogue query is slow."
    why is that a problem?
"The product page takes 2 s and conversion drops."
    ↓
Problem: the product page needs to respond under 500 ms
         so it doesn't cost conversion.
```

Once there, the solution space opens up: distributed cache, local cache, a better
index, denormalization, precomputation, or reducing what the page has to load.
Some of those are drastically cheaper than the original proposal.

The aim of backing up is not to reject the suggested solution. It frequently wins.
The aim is that it wins by comparison, rather than by having been said first.

### The problem has an owner; the solution has an author

Whoever has the problem is whoever suffers the consequence of it going unsolved —
usually on the business or operations side.

Whoever proposes the solution is whoever knows the technical space.

Confusing the two roles produces two known failures: the business specifying
mechanism ("use a queue"), and engineering deciding what matters ("we think
real-time isn't necessary"). The first closes the solution space too early; the
second changes the problem without authorization.

### Not every problem should be solved

Making the problem explicit also makes it possible not to solve it.

A problem whose cost of occurrence is low and whose solution is expensive is a
problem to accept. That conclusion is only reachable when the problem is stated
separately from the solution — while it stays wrapped, the discussion is about
which solution, never about whether any is worth it.

## Mental Model

**A problem is what has to be true. A solution is what we are going to build.**

A good test: if the statement survives a complete change of technology stack, it
is a problem. If it stops making sense, it is a solution.

"The page needs to respond under 500 ms" survives any stack. "We need Redis" does
not.

## Why This Matters

**Because the solution space can only be evaluated against a stated problem.**
Without one, comparing alternatives is impossible — there is no criterion. That is
why [case studies](../21-case-studies/index.md) start with context and
requirements, and only then list options.

**Because it surfaces disagreement early.** Two people who disagree about the
solution may agree about the problem, and then the conversation is productive. Or
they may disagree about the problem, and then discussing solutions is wasted time
until that surfaces. Stating the problem tells you which within minutes.

**Because it guards against the favourite solution.** Every team has a technology
it wants to use. A problem stated before the discussion is the cheapest defence
against a technology looking for a problem.

## Common Mistakes

**Accepting the stakeholder's statement as the problem.** It almost always arrives
as a solution. Backing up is not disrespect — it is the work.

**Backing up too far.** Taken to the extreme, every problem becomes "the company
needs to make money", which is true and useless. Stop at the level where the
problem is still specific enough to eliminate solutions.

**Confusing the problem with the symptom.** "The database is overloaded" is a
symptom. The problem might be an access pattern, a query without an index, or a
feature that should not exist. Treating a symptom as the problem leads to scaling
the database when fixing the query was the right move.

**Stating the problem after choosing the solution.** It happens often in
architecture documents: the problem section is written to justify the decision
already taken. It is recognizable because the problem as described has exactly one
possible solution.

## Real-World Example

A team receives: *"We need to migrate to microservices."*

Backing up: *why?* — "Our deploys are risky and slow."
*Why are they risky?* — "Any change requires regression-testing the whole system,
and the suite takes 40 minutes."
*Why does it require that?* — "We don't trust that a change in one module won't
break another."

The stated problem: **there is no confidence that a change is local.**

Against that statement, microservices is one of the solutions — and one of the
expensive ones. The alternatives become visible: enforce boundaries between
modules with automated checks, split the suite by module, raise coverage at the
coupling points, adopt gradual release.

The team chose to enforce boundaries first. Eighteen months later, it extracted
two services — the two modules whose boundaries had proven stable, and for
organizational reasons that only became clear over that interval.

Backing up did not prevent the migration. It prevented it from being done early,
all at once, and without knowing where the boundaries should fall.

## Related Concepts

- [Solution Space](solution-space.md) — the other side.
- [Business Context](business-context.md) — where problems come from.
- [Functional Requirements](functional-requirements.md) — the formalization of
  what the system has to do.

## Practical Exercise

Take the last three requests that reached your team. For each, write the statement
as it was received and back up to a statement with no mechanism in it.

Then list, for each backed-up problem, three possible solutions — including the
one originally asked for.

In how many cases is the requested solution still the best? In how many is there a
cheaper alternative nobody had considered?

## Interview Questions

- How do you respond to a stakeholder who asks for a specific technology?
- How do you tell the problem from the symptom?
- Have you ever concluded that a problem should not be solved? How did you get
  there?

## Further Exploration

- Gause, Donald; Weinberg, Gerald. *Are Your Lights On?* Dorset House, 1990 — the
  reference text on problem definition.
- Wiegers, Karl; Beatty, Joy. *Software Requirements*. 3rd ed., Microsoft Press,
  2013 — the chapters on elicitation.

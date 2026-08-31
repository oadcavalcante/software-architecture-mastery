---
id: architecture-vs-implementation
title: Architecture vs. Implementation
sidebar_position: 3
description: Why an architecture the code does not enforce does not exist, and what to do about it.
doc_type: foundation
level: 1
difficulty: beginner
status: complete
objective: >
  By the end, the reader recognizes the difference between intended and actual
  architecture, and knows which mechanisms make a boundary effective.
prerequisites: [architecture-vs-design]
related: [dependency-management, technical-debt]
canonical_for: [intended architecture, actual architecture, architectural drift]
translated_from_version: 1
last_reviewed: 2026-08-29
---

# Architecture vs. Implementation

## Overview

Every system has two architectures: the **intended** one, which lives in the
diagrams and in people's heads, and the **actual** one, which is the dependency
graph the code really has.

When the two diverge, the actual one wins. It is the one that determines the cost
of change, the one that propagates failures, and the one the next developer will
copy as a reference.

## The Problem

The pattern is familiar. The documentation describes three layers with separated
responsibilities and dependencies pointing inward. The code has a controller
importing the HTTP client of an external service, a domain entity carrying
serialization annotations, and a reporting module reading directly from the
tables of four other modules.

Nobody decided that. Each individual step was reasonable under schedule pressure,
and nothing prevented it. The intended architecture was never implemented — only
drawn.

The common diagnostic error is to call this indiscipline. It is not. It is the
predictable consequence of a boundary that exists as a verbal agreement rather
than as a verifiable constraint. **Every boundary that depends solely on memory
will be crossed.** It is a matter of time and turnover.

## Core Concepts

### Architectural drift

The gradual divergence between the intended and the actual architecture.

Drift rarely happens through one big decision. It happens by accumulation: a
shortcut here under deadline, an import there that is "only temporary", a
one-off exception that becomes precedent. Each step is small; the sum is
structural.

The characteristic signal is the remark "we don't really follow the architecture
here any more". When someone can say that, the drift is already known and
tolerated — which is the stage before it becomes invisible.

### Effective boundary versus nominal boundary

A **nominal** boundary lives in the diagram, in the documentation, or in a
directory convention. It constrains whoever remembers it and chooses to respect
it.

An **effective** boundary is enforced by something that fails when it is
violated. The code does not compile, the test breaks, CI refuses the merge.

The distinction is binary in practice: a nominal boundary is a suggestion with
the appearance of a rule.

### The mechanisms that make a boundary effective

Ordered by strength — the higher, the less it depends on human vigilance:

| Mechanism | Strength | Cost |
|---|---|---|
| Separate process or repository | Very high — violation is impossible | High: operations, versioning, latency |
| Language module with real visibility | High — it does not compile | Depends on what the language offers |
| Architecture test in CI | High — it does not merge | Low: maintaining the rule |
| Static dependency analysis | Medium to high | Low |
| Code review | Medium — depends on who reviews and on their attention | Continuous and human |
| Documented convention | Low | Apparently zero, actually high |

The table contains the main decision of this document: **boundaries that matter
deserve an automated mechanism.** Code review is a net whose holes vary in size,
and the size grows with schedule pressure — exactly when it most needs to work.

### The architecture test

The mechanism with the best effect-to-cost ratio for most teams: a test that
fails when a forbidden dependency appears.

```text
test: "domain does not depend on infrastructure"

  for each class in   com.example.domain
    no import of      com.example.infra
                      org.springframework
                      jakarta.persistence
```

It is cheap to write, runs in seconds, and converts the boundary from a verbal
agreement into a verifiable condition. When someone needs to violate it, they
have to change the test — which turns the violation into an explicit decision,
debatable in review, rather than an import that slips through.

That is the idea that reappears at Level 07 as a
[fitness function](/23-architecture-leadership/index.md).

## Mental Model

**The actual architecture of a system is its dependency graph.** Everything else
is commentary on it.

Faced with any claim about a system's architecture, the verification is always
the same: extract the real dependencies and compare. The tool varies by language;
the question does not.

## Why This Matters

**Because the actual architecture is the one that charges you.** The cost of
change, failure propagation and difficulty of testing all derive from the real
graph, not the intended one. A system documented as decoupled and implemented as
coupled has all the costs of coupling and none of its benefits.

**Because the code is the documentation the next developer reads.** Newcomers
learn the architecture by imitating what they find. If what they find violates
the diagram, the diagram has lost — and every new violation looks consistent with
what already exists.

**Because deciding a boundary without a mechanism is deciding half.** Choosing
that the domain does not depend on infrastructure and not enforcing it produces
the cost of the decision (indirection, more files) without the benefit (real
independence). It is the worst of both worlds, and it is common.

## Common Mistakes

**Trusting a directory convention as a boundary.** A folder called `domain`
prevents nothing. It signals intent, which is useful, and enforces absolutely
nothing.

**Believing code review is enough.** Review catches what the reviewer looks for,
on the day they are attentive, in a diff they can read in full. None of those
three conditions is reliable under deadline.

**Treating a violation as a personal failure.** If three different people crossed
the same boundary, the problem is not the three people. Either the boundary is in
the wrong place, or it has no mechanism. Both are design questions.

**Discovering drift only at the next big refactoring.** Without continuous
measurement, the divergence is discovered when someone attempts a large change
and fails — which is the most expensive possible moment to discover it.

**Enforcing too many boundaries.** The opposite mistake, and also real. Every
effective boundary has a cost: indirection, ceremony, friction. A system with
fifteen enforced boundaries where three would do is as dysfunctional as one with
none. Enforce the ones that matter — and having to choose which is precisely the
architectural work.

## Real-World Example

A team adopts Hexagonal Architecture on a new service. Diagrams, documentation, a
presentation to the department. Six months later, the service has eight use cases
and the promised directory structure.

A dependency analysis reveals: four of the eight use cases import the payment
service's HTTP client directly, bypassing the port that existed for it. The
entities carry ORM annotations. Two adapters import each other.

The system has the indirection of Hexagonal — ports, adapters, more files — and
does not have the property the indirection was supposed to buy: replacing the
payment client still touches the domain.

The team responded with two architecture tests, written in one afternoon: no
domain package imports `infra`, and no adapter imports another adapter. Both
failed immediately, with nineteen violations.

The instructive part: the nineteen were fixed in three weeks, and no new ones
appeared afterwards. The problem was never capability or discipline — it was the
absence of a signal. While violating was silent, violating happened.

## Related Concepts

- [Architecture vs. Design](/01-fundamentals/architecture-vs-design.md) — the previous boundary.
- [Dependency Management](/01-fundamentals/dependency-management.md) — the material the real graph
  is made of.
- [Technical Debt](/01-fundamentals/technical-debt.md) — how drift accumulates and charges
  interest.

## Practical Exercise

Pick a boundary your system claims to have — a layer, a module, a rule of "this
does not access that".

Write a test that fails if it is violated. Do not fix anything yet: run it and
count the violations.

Two questions: did the number surprise you? And, for each violation, is it a
shortcut to fix or a signal that the boundary is in the wrong place?

The second question is the more valuable one. Not every violation is a mistake by
whoever wrote it; some are the system telling you the boundary was badly drawn.

## Interview Questions

- How do you verify that the documented architecture is the one the system has?
- What do you do when you find a systematic violation of a boundary?
- Which mechanisms make an architectural boundary effective, and how do you
  choose among them?

## Further Exploration

- Ford, Neal; Parsons, Rebecca; Kua, Patrick. *Building Evolutionary
  Architectures*. O'Reilly, 2017 — fitness functions as a mechanism.
- Documentation for ArchUnit (Java) and equivalents such as `import-linter`
  (Python) and `dependency-cruiser` (TypeScript) — implementations of the
  architecture test.

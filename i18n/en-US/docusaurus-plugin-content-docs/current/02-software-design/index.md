---
id: software-design
title: Software Design
sidebar_position: 0
description: How to structure code and modules so the intended architecture survives contact with the implementation.
doc_type: index
level: 2
difficulty: beginner
status: complete
objective: >
  By the end, the reader knows how to structure modules and dependencies so that
  the architectural boundary drawn in the diagram actually exists in the code.
prerequisites: [fundamentals]
related: [design-patterns, domain-driven-design]
canonical_for: []
translated_from_version: 1
last_reviewed: 2026-08-30
---

# Level 02 — Software Design

Architecture that is not reflected in the code is fiction. This section is about
how to structure code so that architectural decisions have a real effect.

## The problem this section addresses

It is common to find systems whose documentation describes clean layers and
separated responsibilities, and whose code is a web where any change touches
seven files across four different modules. The architecture exists in the diagram
and does not exist in the repository.

That happens because an architectural boundary is not a drawn line — it is a
dependency constraint that has to be enforced and verified. If nothing stops the
billing module from importing the user repository directly, it will, and the
boundary disappears by the third sprint.

Software design is what turns architectural intent into executable structure. It
is also where most of the maintenance cost is decided.

## What you will find here

**Principles.** SOLID, DRY, KISS, YAGNI and the design heuristics. Treated as
tools with a range of application, not as commandments — including the cases where
applying them produces worse code.

**Structure.** Encapsulation, interfaces, boundaries, layering, modular design and
package design. How to decide what stays together and what stays apart.

**Dependencies.** Dependency inversion, dependency direction and composition
versus inheritance. This is the core of the section: the direction dependencies
point in determines what you can change without breaking things.

**Code architectures.** Clean Architecture, Hexagonal, Onion and Ports and
Adapters. Four names for the same central idea, with differences that matter less
than the literature suggests — and a cost the literature mentions little.

**Maintenance.** Refactoring and code smells. How to recognize structure that is
degrading before the cost becomes visible in the roadmap.

## Reading order

Start with **boundaries** and **dependency direction**. They are the two concepts
everything else depends on, and the ones that most change how you look at a
repository.

The four code architectures — Clean, Hexagonal, Onion, Ports and Adapters — can be
read as a block. They share the same thesis; reading all four in sequence makes
clear what is essential and what is a difference of vocabulary.

Leave **SOLID** for after boundaries, not before. SOLID read too early becomes a
memorized rule; read after understanding dependency direction, it becomes an
obvious consequence.

## By the end

You can look at a repository and say where the real boundaries are, which is not
necessarily where the directories are. You can justify why a dependency points one
way and not the other. You can apply Hexagonal knowing what it costs in
indirection and when that cost does not pay off.

And you can recognize the moment when abstraction stopped reducing complexity and
started adding it.

## Mistakes this section prevents

- Applying the whole of Clean Architecture to a system with one and a half use
  cases.
- Creating an interface with a single implementation and calling that decoupling.
- Using inheritance where composition would do, to save some typing.
- Treating DRY as a ban on duplicating text rather than a ban on duplicating
  knowledge — and coupling two modules that merely coincided.
- Refactoring structure without a criterion that says when to stop.

## Continues in

[Design Patterns](/03-design-patterns/index.md) for the recurring solutions, and
[Domain-Driven Design](/04-domain-driven-design/index.md) for when the complexity
of the domain, rather than of the technique, is what dictates the structure.

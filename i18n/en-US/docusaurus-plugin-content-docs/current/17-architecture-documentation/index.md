---
id: architecture-documentation
title: Architecture Documentation
sidebar_position: 0
description: How knowledge about the system survives its people — and why most documentation doesn't survive itself.
doc_type: index
level: 5
difficulty: intermediate
status: complete
objective: >
  By the end, the reader produces documentation with a defined reader, at a level of
  detail that is sustainable, and that ages slowly.
prerequisites: [system-design]
related: [architecture-decisions, enterprise-architecture, observability]
canonical_for: []
translated_from_version: 1
last_reviewed: 2026-08-31
---

# Level 05 — Architecture Documentation

This section is about how knowledge about the system survives its people.

## The problem in this section

Architecture documentation has a recurring problem: it gets produced, and it doesn't get
read.

The reasons are known. It is written with no defined reader — to "document", not for
anyone. It describes the system at a level of detail that ages in weeks. It sits
somewhere nobody visits. And nobody owns it.

The result is the worst of both worlds: production and maintenance cost, without the
benefit — and, worse, an out-of-date artifact that leads whoever trusts it into wrong
decisions.

The second problem is calibration. The reflex, on realizing documentation is missing, is
to document more. Frequently the right answer is to document **less**, and better: one
correct context diagram is worth more than forty pages nobody trusts.

The third is derivation. Much of what gets documented by hand can be derived from the
system — dependencies, topology, versions, contracts. What needs human writing is what
the machine doesn't know: **why** things are the way they are.

## What you will find here

**Principles.** What decides whether documentation gets read: reader, purpose, level of
detail, and where it lives.

**The C4 model.** The most practical approach to diagramming software, with the four
levels of zoom — and the guidance that the first two suffice in most cases.

**The diagrams.** Context, container, component, deployment, sequence and data flow —
each with what it answers and when it isn't worth it.

**Views and descriptions.** How to organize documentation by the reader's concern,
instead of by the system's structure.

**Standards and living documentation.** How to maintain it, derive it and keep it from
aging.

**Diagram quality.** What separates a diagram that communicates from one that clutters.

## Reading order

Start with **documentation principles** — it establishes the criteria the rest uses.

Then **the C4 model** and, within it, **context** and **container**. Those two diagrams
cover most of the real need.

**Diagram quality** can be read at any point and has the most immediate return for anyone
already producing diagrams.

Leave **living documentation** for last: it reorganizes everything before it around the
question of how this is maintained.

## By the end

You write for a specific reader, with a specific question — and discard what serves
neither.

You choose the level of detail by how long it will survive, and not by completeness.

You derive from the system what the machine knows, and reserve human writing for what it
doesn't — the reasons, the trade-offs, what was discarded and why.

And you recognize that out-of-date documentation is worse than none, because it is
trustworthy right up until the moment someone acts on it.

## Continues in

[Architecture Decisions](/18-architecture-decisions/index.md), where recording the **why**
takes a form of its own.

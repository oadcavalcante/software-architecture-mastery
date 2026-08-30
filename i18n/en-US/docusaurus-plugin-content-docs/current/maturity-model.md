---
id: maturity-model
title: Maturity Model
sidebar_position: 3
description: Six stages of architectural capability, defined by the decisions someone makes rather than the knowledge they can state.
doc_type: reference
level: 0
difficulty: beginner
status: complete
objective: >
  By the end, the reader identifies their current stage by the decisions they
  already make alone, and knows which capability the next one requires.
prerequisites: []
related: [architecture-leadership]
canonical_for: [architectural maturity, maturity model]
translated_from_version: 1
last_reviewed: 2026-08-29
---

# Maturity Model

Six stages of architectural capability. Each is defined by what a person
**decides alone**, not by what they can explain.

The distinction matters. Stated knowledge and capability diverge sharply in this
profession: it is common for someone to explain eventual consistency well and
never have decided, under pressure, whether a concrete case tolerates it.

## Two different axes

This model measures **capability**. The seven levels of the path organize
**content**. They are not the same thing and they do not advance together.

Reading Level 04 puts nobody at stage 4. Content is input; capability comes from
deciding, being wrong, recording why, and revisiting. The path shortens the
route — it does not replace it.

In practice, someone at stage 3 usually gains more from rereading Level 02
against their own system than from advancing to Level 05.

## The stages

### Stage 1 — Code-oriented

**Decides:** how to implement inside an already defined module.
**Horizon:** the current task.
**Negotiates with:** nobody — the scope arrives already cut.

Writes correct, readable code. Applies patterns when the problem is recognized.
Does not decide where boundaries sit.

**Transition signal:** starts noticing that the difficulty of a task comes from an
earlier structural decision, and can name it.

### Stage 2 — Design-oriented

**Decides:** module structure, interfaces and direction of dependency.
**Horizon:** the feature, a few weeks.
**Negotiates with:** their own team.

Draws boundaries inside a system. Justifies why a dependency points one way.
Recognizes structure degrading before the cost shows up in the roadmap.

**Transition signal:** starts hitting limits that are not about code — the
database, the queue, the deployment process.

### Stage 3 — System-oriented

**Decides:** components, contracts, storage and the topology of a system.
**Horizon:** the system, a few quarters.
**Negotiates with:** product and neighbouring teams.

Goes from requirements to a high-level architecture with capacity estimates.
Identifies the bottleneck before the system exists. Chooses between synchronous
and asynchronous with an argument.

**Transition signal:** starts making decisions whose cost lands on other teams,
and notices that a technical argument alone is not enough.

### Stage 4 — Architecture-oriented

**Decides:** trade-offs between quality attributes, under cost and schedule constraints.
**Horizon:** the system and its evolution, one to two years.
**Negotiates with:** technical leadership and business stakeholders.

Derives architecture from stated numbers — SLO, RTO, budget — rather than from
preference. Records decisions with the context that makes them revisable. Can say
no to complexity that does not pay for itself, including complexity they proposed
earlier.

**Transition signal:** begins to see duplication and incoherence **between**
systems, not inside one.

### Stage 5 — Enterprise-oriented

**Decides:** portfolio, capabilities, standards, and the route from current to target state.
**Horizon:** the set of systems, two to five years.
**Negotiates with:** whoever controls budget and priority.

Reads an application landscape and identifies duplicated capability. Builds
transition architectures in steps that deliver value on their own. Establishes
standards with an exception path.

**Transition signal:** notices that the dominant constraint has stopped being
technical and become organizational.

### Stage 6 — Strategy-oriented

**Decides:** technical direction, team structure, and where the organization invests capacity.
**Horizon:** the organization, years.
**Negotiates with:** company leadership.

Treats Conway's law as an instrument, not an observation: proposes organizational
change to make an architecture possible. Measures architectural outcomes instead
of arguing for them. Sustains coherence without centralizing decisions.

## How to use this

Locate yourself with one question: **what was the most consequential decision you
made alone in the past six months, and what kind of decision was it?**

The answer is usually one stage below what self-assessment suggests, because we
tend to measure ourselves by what we understand rather than by what we decide.

Two warnings. There is no merit in being at stage 6 — there is fit to a role; a
thirty-person company rarely needs one. And the stages are not exclusive: someone
at stage 5 still makes stage 2 decisions, and still needs to make them well.

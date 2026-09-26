---
id: architecture-governance
title: Architecture Governance
sidebar_position: 0
description: Maintaining coherence across teams without becoming an approval committee.
doc_type: index
level: 6
difficulty: advanced
status: complete
objective: >
  By the end, the reader designs governance mechanisms that guide distributed decisions
  instead of centralizing them.
prerequisites: [enterprise-architecture]
related: [architecture-decisions, architecture-leadership, security]
canonical_for: []
translated_from_version: 4
last_reviewed: 2026-08-31
---

# Architecture Governance

Governance is how an organization maintains architectural coherence across teams that
decide independently.

## The problem in this section

Governance has a deservedly bad reputation. In its degenerate form, it is a committee that
approves designs, adds three weeks to every project and produces apparent compliance with
decisions that were already made some other way.

But the absence of governance has its own cost: six ways of authenticating, four different
queues, security decisions made by people who lacked context, and nowhere for a lesson
learned expensively to be recorded for the next team.

The real problem is one of mechanism. Governance that works guides a decision at the moment
it is made, by whoever makes it. Governance that fails tries to inspect decisions
afterwards, by people who didn't make them.

## What you will find here

**Instruments.** Principles, standards and the forms of compliance, together with the
exception process, which is what separates living governance from bureaucracy. A standard
with no exception path is worked around silently.

**Review.** Architecture review as a conversation that improves the decision, not as a gate.
When to review, who takes part, and what it produces.

**Automation.** Fitness functions as executable governance. Automatically verifying the
property you want to preserve is cheaper and more reliable than inspecting a design.

**A distributed model.** Federated governance: when the decision stays with the team and
what remains central. Applicable to organizations past a certain size.

**Pathologies.** How governance becomes a bottleneck, and the signs that it already has.

**Measurement.** The effect and the friction of each mechanism: the two numbers without
which the decision to keep or remove falls to whoever has the most authority.

## A principle and a standard are not the same thing

Both guide decisions, but at different points of intervention, and treating them as the
same thing makes the mechanism miss the point: it prescribes where it should guide, or
guides where it should prescribe. A principle gives the criterion for the new
situation ("we prefer X over Y, because Z") and is weighed against other principles. A
standard closes the recurring situation ("use X") and, when it doesn't fit the case,
requires an explicit exception process.

The line-by-line comparison, with the axis of each row, is in
[Standards in Operation](/19-architecture-governance/governance-standards.md); the
criterion for what makes a principle decide anything, in
[Principles in Operation](/19-architecture-governance/governance-principles.md).

An organization that has only principles produces inconsistent decisions; one that has only
standards stalls at the first unforeseen case.

## Reading order

Start with **Governance Basics**, which fixes the mechanism and the point of
intervention, and is a prerequisite for most of the rest. Then **Principles in
Operation** and **Standards in Operation**, in that order.

Then **fitness functions**, which is the mechanism with the best ratio of effect to
friction.

Read **pathologies** and **Measuring Governance** last, and as a pair: one is the checklist
for the governance you have or are proposing, the other gives you the two numbers with
which you argue to keep, adjust or remove each mechanism.

## By the end

You design governance mechanisms proportional to the risk they address. You recognize when
a process has become ritual and can propose removing it.

And you can argue for team autonomy with a concrete proposal for how coherence will be
maintained. That is what makes the argument acceptable to whoever answers for the risk.

## Continues in

[Level 07 — Architecture Leadership](/23-architecture-leadership/index.md).

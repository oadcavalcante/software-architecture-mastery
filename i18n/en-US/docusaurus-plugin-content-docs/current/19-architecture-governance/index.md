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
translated_from_version: 1
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

**Instruments.** Principles, standards and the forms of compliance — together with the
exception process, which is what separates living governance from bureaucracy. A standard
with no exception path is worked around silently.

**Review.** Architecture review as a conversation that improves the decision, not as a gate.
When to review, who takes part, and what it produces.

**Automation.** Fitness functions as executable governance. Automatically verifying the
property you want to preserve is cheaper and more reliable than inspecting a design.

**A distributed model.** Federated governance — when the decision stays with the team and
what remains central. Applicable to organizations past a certain size.

**Pathologies.** How governance becomes a bottleneck, and the signs that it already has.

## A principle and a standard are not the same thing

Confusing the two is the most common cause of governance that doesn't work.

| | Principle | Standard |
|---|---|---|
| What it does | Guides judgment | Prescribes a choice |
| Format | "We prefer X over Y, because Z" | "Use X" |
| When it applies | A new, unforeseen situation | A recurring situation, already solved |
| Exception | Doesn't apply — a principle is weighed | Requires an explicit process |
| Typical failure | Too vague to decide anything | Too rigid for the real case |

An organization that has only principles produces inconsistent decisions; one that has only
standards stalls at the first unforeseen case. Both are necessary, and confusing them
produces the worst of both.

## Reading order

Start with **principles versus standards**, which is the central operational distinction:
principles guide judgment, standards prescribe. Confusing the two produces both rigidity
and vagueness.

Then **fitness functions**, which is the mechanism with the best ratio of effect to
friction.

Read **pathologies** last, as a checklist for the governance you have or are proposing.

## By the end

You design governance mechanisms proportional to the risk they address. You recognize when
a process has become ritual and can propose removing it.

And you can argue for team autonomy with a concrete proposal for how coherence will be
maintained — which is what makes the argument acceptable to whoever answers for the risk.

## Continues in

[Level 07 — Architecture Leadership](/23-architecture-leadership/index.md).

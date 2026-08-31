---
id: enterprise-architecture
title: Enterprise Architecture
sidebar_position: 0
description: Decisions that cross systems and teams — and why the discipline has the reputation it has.
doc_type: index
level: 6
difficulty: advanced
status: complete
objective: >
  By the end, the reader practices enterprise architecture as enabling decisions, not
  as control over them.
prerequisites: [devops-and-platform]
related: [legacy-modernization, architecture-governance, architecture-leadership]
canonical_for: []
translated_from_version: 1
last_reviewed: 2026-08-31
---

# Level 06 — Enterprise Architecture

This section deals with the decisions that cross systems, teams and years.

## This section's problem

Enterprise architecture has a bad reputation among engineers, and part of it is deserved.

The caricature exists because the pattern exists: architects distant from the code producing diagrams
nobody consults, committees that approve what has already been built, standards written by people who will
not use them, and a target state that ages before it is reached.

This material starts from acknowledging that. The discipline solves a real problem — decisions no isolated
team can make well —, and the traditional way of practicing it frequently creates more friction than value.

The real problem is this: in an organization with dozens of systems and teams, some decisions have a reach
greater than any team. Which system owns which data. How the systems integrate. What is common and what is
specific. Where to invest and what to retire.

With nobody looking at the whole, each team optimizes locally — and the aggregate result is worse than the
sum of the parts: data duplicated across six systems, four integrations doing the same thing in different
ways, and nobody able to answer what happens if that system goes down.

## What you will find here

**The fundamentals and the layers.** What the discipline is, and the four layers — business, application,
data, technology — that organize the conversation.

**Business capabilities.** The map that allows discussing systems without talking about systems, and that
is the section's most useful tool.

**The portfolio and the landscape.** The inventory of what exists: applications, integrations, and what
they cost.

**Principles and standards.** The rules that guide distributed decisions — and why most of them guide
nothing.

**Governance and review.** How decisions cross the organization without becoming a committee that approves
the inevitable.

**A technology radar.** The mechanism that replaces the list of approved technologies.

**Strategy and states.** The current state, the target state, the transition architecture and the roadmap —
with special attention to the third, which is what usually is missing.

**Architecture levels.** How the decisions are distributed among enterprise, solution and system.

## Reading order

Start with **fundamentals** and **architecture levels** — they delimit what belongs to this section and
what belongs to the earlier ones.

Then **business capabilities**, which is the tool with the greatest practical return.

**Current state**, **target state** and **transition architecture** form a block and should be read in
sequence. The third is what turns the intention into a path.

Leave **governance** and **architecture review** for the end, and read them as process design, not as a
power structure.

## By the end

You distinguish the decisions that belong to the team from the ones that cross the organization — and you
know that pushing the first upward is the most common cause of a bottleneck.

You can map business capabilities and use that map to discuss investment, duplication and risk without the
conversation becoming a dispute between systems.

You recognize that a target state with no transition architecture is an aspiration, and that a roadmap with
no intermediate delivery does not survive the first change of priority.

And you understand that the authority sustaining this work comes from usefulness, not from position — an
enterprise architect who can only block has one tool and no influence.

## Continues in

[Legacy Modernization](/16-legacy-modernization/index.md), where the current state meets the reality of
what already exists.

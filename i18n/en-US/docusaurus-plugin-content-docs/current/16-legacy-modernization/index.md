---
id: legacy-modernization
title: Legacy Modernization
sidebar_position: 0
description: Changing what is already in production, working, and sustaining the business — without stopping.
doc_type: index
level: 6
difficulty: advanced
status: complete
objective: >
  By the end, the reader chooses a modernization strategy from the real motive, and
  executes it incrementally with controlled risk.
prerequisites: [enterprise-architecture]
related: [enterprise-architecture, architecture-governance, architecture-leadership]
canonical_for: []
translated_from_version: 1
last_reviewed: 2026-08-31
---

# Level 06 — Legacy Modernization

This section is about changing what is already in production, working, and sustaining the
business.

## The problem in this section

Designing from scratch is the rare case. Most architecture work happens on top of systems
that already exist — that serve customers right now, that nobody fully understands, and
that cannot stop.

That changes the nature of the problem. In a new build, the difficulty is deciding. Here,
the difficulty is **changing without breaking** — and the system in production is the
constraint, not the starting point.

The second problem is one of motivation. "It's legacy" is not a reason to modernize. An
old system that is stable, cheap to operate and that nobody needs to change is doing its
job. Modernizing out of aesthetic discomfort is the most expensive way to deliver
nothing.

The question that precedes everything: **what exactly can't we do because of this
system?** If there is no concrete answer, there is no project.

The third is execution. Complete rewrites fail at a known rate, for structural reasons:
they compete with a system in motion, the knowledge embedded in the old code is lost, and
value only appears at the end — when there frequently is no support left.

## What you will find here

**What legacy is, and what motivates changing it.** The useful definition, and the
motives that sustain investment — separated from those that don't.

**Strangling.** The pattern that allows gradual replacement, with the old one in
operation.

**Incremental modernization.** The approach that survives interruptions.

**The strategies.** Replatform, refactor, rebuild, replace — each with the problem it
solves and what it costs.

**Data migration.** The riskiest and most underestimated part of any modernization.

**Risk.** What goes wrong, and the controls that reduce the probability and the damage.

**Organizational constraints.** The ones that decide the outcome more often than the
technical ones — concentrated knowledge, support that evaporates, misaligned incentives.

## Reading order

Start with **modernization drivers**. It establishes the criterion that separates
projects that justify themselves from discomfort with a strategy's name.

Then **migration strategies**, which organizes the options and the criterion for
choosing.

**Strangler fig** and **incremental modernization** form a block — the first is the
pattern, the second is the discipline of executing it.

**Data migration** deserves careful reading: it is where projects fail irreversibly.

And leave **organizational constraints** for last, reading it as the document that
explains why technically correct projects fail.

## By the end

You demand a concrete motive before proposing modernization, and you know how to defend
the decision **not** to modernize.

You choose between replatforming, refactoring, rebuilding and replacing from the problem,
and not from preference.

You execute in increments that deliver value on their own, so that an interruption does
not turn months of work into waste.

And you recognize that the decisive obstacles tend to be organizational — and that
ignoring them is the most common reason technically well-designed programs fail.

## Continues in

[Architecture Governance](/19-architecture-governance/index.md), where the question
becomes how to sustain decisions over time.

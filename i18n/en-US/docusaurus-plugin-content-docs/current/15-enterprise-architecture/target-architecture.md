---
id: target-architecture
title: Target Architecture
sidebar_position: 16
description: Where you want to get to — and why a three-year target rarely survives its second.
doc_type: concept
level: 6
difficulty: advanced
status: complete
objective: >
  By the end, the reader defines a target with an appropriate horizon, expressed in
  desired properties rather than in a detailed drawing.
prerequisites: [current-state-architecture]
related: [current-state-architecture, transition-architecture, architecture-roadmaps]
canonical_for: []
content_version: 1
translated_from_version: 1
last_reviewed: 2026-08-31
---

# Target Architecture

## Overview

The target architecture describes where the organization wants to get to — the structure
that would solve the problems the current state has.

It exists to give direction to distributed decisions: dozens of choices, made by
different teams, that together move the organization somewhere. Without a target, they
move in incompatible directions.

And it fails in a characteristic way: a detailed three-year drawing, reviewed annually,
never reached — because context changes faster than the plan.

## Problem

The traditional target is a complete drawing of the future state: every system, every
integration, the whole topology.

Two problems with that.

**It presupposes a stability that does not exist.** Acquisitions, market shifts, new
technologies, revised priorities — in three years, a good share of the premises changes.

**It does not guide today's decision.** A team facing a concrete choice cannot derive the
answer from a diagram of the end state.

## Core Concepts

### Properties, not a drawing

A useful target describes **how the system should behave**, not how it should be drawn:

```text
drawing      "we will have a customer service, an orders service, a billing service,
              integrated by events, with these contracts"
properties   "every piece of data has a single owner"
             "systems integrate through an explicit contract"
             "differentiating capabilities are built; the rest are bought"
             "no critical system depends on a single person"
```

Properties survive changes in context. A drawing does not.

And they guide today's decision: a team that has to choose how to integrate two systems
can derive the answer from "integration through an explicit contract". It cannot derive
it from an end-state diagram.

### The horizon has to fit within predictability

```text
12 to 18 months   what most organizations can usefully predict
2 to 3 years      direction, not a plan — in properties, not in systems
beyond that       a statement of intent
```

A three-year target as a detailed drawing is fiction with the appearance of a plan.

And the horizon varies with context: a company in a stable, regulated market plans
further out than one in a market in transformation.

The sign that the horizon is wrong: the annual review rewrites more than half of it.

### The target has to be derivable from the problem

A target that does not point at concrete problems in the current state is aesthetic
preference.

```text
current problem                            →  target property
customer record duplicated in seven systems →  data with a single owner
integrations by direct database access      →  explicit contract
critical system with one maintainer         →  distributed knowledge
34% of investment in a common capability    →  buy what doesn't differentiate
```

See [current state architecture](/15-enterprise-architecture/current-state-architecture.md).

That derivation is what makes the target defensible: each property has an associated
problem, and the cost of not solving it is known.

Targets that start with "we want microservices" or "we want to be cloud native" skip that
step — and cannot answer why.

### It does not have to be single

A single target for the whole organization forces uniformity where it makes no sense.

```text
differentiating capabilities   a more ambitious target, larger investment
supporting capabilities        a modest target — stable and cheap is enough
common capabilities            the target is to buy
```

See [business capabilities](/15-enterprise-architecture/business-capabilities.md).

This avoids the most common waste in modernization programs: applying the same standard
of technical excellence to systems that only need to work.

### It guides, it does not compel

A target used to refuse proposals becomes an obstacle. A target used to guide proposals
becomes a tool.

The practical difference:

```text
as an obstacle   "that isn't in the target, so no"
as guidance      "that moves us away from the target on this dimension; is it worth it?"
```

The second formulation allows the answer to be yes — with the consequence known and
recorded. And the accumulation of those decisions is information: if many proposals move
away from the target, the target may be wrong.

See [enterprise principles](/15-enterprise-architecture/enterprise-principles.md) — the same mechanism as the
exception log.

### Without a transition, it is aspiration

A target with no path is a statement that we would like things to be different.

See [transition architecture](/15-enterprise-architecture/transition-architecture.md). It is the document that turns
the target into work — and it is what is most frequently missing.

### The target has to be known by whoever decides day to day

A target that lives in a document few people consult does not guide the distributed
decisions it is supposed to guide — which is the reason it exists.

What makes it present:

```text
few properties, memorable
cited in reviews and in recorded decisions
visible where decisions happen — proposal templates, checklists
revisited when someone moves away from them
```

The third is the most effective: a question in the architecture proposal template — "does
this decision move toward or away from which target property?" — brings the target into
the conversation without requiring anyone to look it up.

And the fourth closes the loop: each recorded departure is an opportunity to check
whether the target is still right. See
[architecture decisions](/18-architecture-decisions/index.md).

A target nobody cites in concrete decisions, over the course of a year, is guiding
nothing — however well written it is.

## Mental Model

**The target describes desired properties, derived from concrete problems.** A detailed
three-year drawing is fiction.

## When to Use

- To give direction to distributed decisions.
- Before modernization programs.
- In medium-term investment decisions.
- After structural changes — an acquisition, a change of strategy.

## When Not to Use

**As a detailed long-term drawing.**

**Without derivation from current problems.**

**Single for the whole organization.**

**As a criterion for refusal.**

**Without a transition architecture.**

**Reviewed only annually**, in a context that changes fast.

## Alternatives

- **Principles** — they guide without describing an end state. See
  [enterprise principles](/15-enterprise-architecture/enterprise-principles.md).
- **Direction by property** — no formal target, only the properties to pursue.
- **Target per capability** — instead of a single organizational target.
- **Short-term roadmap** — what to do over the next six months, continuously reviewed.
  See [architecture roadmaps](/15-enterprise-architecture/architecture-roadmaps.md).

## Trade-offs

| Target in properties | In a drawing |
|---|---|
| Survives change | Ages |
| Guides today's decision | Distant from the concrete |
| Less precise | Specific |

| Long horizon | Short |
|---|---|
| Underlying direction | Actionable |
| Low precision | High |
| Frequent review needed | Less |

## Failure Modes

**An obsolete detailed drawing.**

**A target with no associated problem.** Aesthetic preference.

**Used to block.**

**Never reached.** Revised before getting close.

**Too uniform.** Technical excellence where working was enough.

**No path.** Aspiration with no defined work.

## Common Mistakes

**Drawing the end state.**

**Starting from the solution** — "we want microservices" — instead of the problem.

**A horizon that is too long.**

**One target for everything.**

**Not recording the departures.**

**Having no transition.**

## Real-World Example

A retail company produced a three-year target architecture: 40 microservices replacing
the monolith, integrated by events, with a detailed diagram of each boundary.

Eighteen months later:

**Two acquisitions** brought in systems the target had not anticipated.

**A change of strategy** — expansion into a new channel — shifted the priorities.

**Twelve of the 40 services** had been built. The boundaries of the other 28 no longer
made sense given what had been learned.

The target was abandoned, and the side effect was worse: the modernization program lost
credibility, and the next proposal met skepticism.

The rework, done a year later, changed the nature of the artifact:

**Properties derived from problems.** Five properties, each with the problem that gives
rise to it and the cost of not solving it:

```text
1. every piece of data with one owner  → today, records in 7 systems, a reconciliation
                                         team
2. integration by contract              → today, 23 direct accesses to another's database
3. common capabilities bought           → today, 34% of budget on non-differentiating ones
4. critical systems with 3+ people      → today, 4 systems with a single maintainer
5. independent deployment               → today, a monthly release coordinated across
                                         9 teams
```

**Differentiated targets per capability.** The differentiating capabilities — pricing and
recommendation — got an ambitious target. The supporting ones, a "stable and cheap"
target. The common ones, a target of buying.

**An 18-month horizon**, reviewed every six months.

**A departure log.** Proposals that move away from the target are accepted with a
recorded justification. In one year, 14 entries — and three of them, all about property
5, led to that property being revised: independent deployment made no sense for a set of
systems that shared a business cycle.

Two years later, four of the five properties had advanced substantially — and the fifth
had been corrected.

What the team records: the target in properties survived an acquisition and two shifts in
priority. The previous drawing had survived none.

## Related Concepts

- [Current State Architecture](/15-enterprise-architecture/current-state-architecture.md) — the starting point.
- [Transition Architecture](/15-enterprise-architecture/transition-architecture.md) — the path.
- [Architecture Roadmaps](/15-enterprise-architecture/architecture-roadmaps.md).
- [Business Capabilities](/15-enterprise-architecture/business-capabilities.md).

## Practical Exercise

Take your organization's target architecture and check, for each element of it: which
concrete problem of the current state does it solve?

The elements with no associated problem are preference, not target.

## Interview Questions

- Why do properties survive better than a drawing?
- Why doesn't the target have to be single?
- What does the departure log reveal?

## Further Reading

- Ross, Jeanne et al. *Enterprise Architecture as Strategy*. HBS Press, 2006.
- Open Group. *TOGAF Standard* — target architecture and gap analysis.
- Hohpe, Gregor. *The Software Architect Elevator*. O'Reilly, 2020.

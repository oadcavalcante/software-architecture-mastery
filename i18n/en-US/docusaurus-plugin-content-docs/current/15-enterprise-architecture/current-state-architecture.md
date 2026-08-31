---
id: current-state-architecture
title: Current State Architecture
sidebar_position: 17
description: What actually exists — and why the diagram from two years ago doesn't count.
doc_type: concept
level: 6
difficulty: advanced
status: complete
objective: >
  By the end, the reader maintains a view of the current state derived from reality, at
  the level of detail its use justifies.
prerequisites: [enterprise-architecture]
related: [target-architecture, transition-architecture, application-portfolios]
canonical_for: []
translated_from_version: 1
last_reviewed: 2026-08-31
---

# Current State Architecture

## Overview

The current state is the description of what exists: which systems, what they do, how
they integrate, who owns them, and what condition they are in.

It is the starting point of any plan — and it is, in most organizations, the most
outdated piece.

The problem is not laziness. It is that a hand-made description ages faster than anyone
can maintain it, and the effort to update it has no visible return until the moment it is
needed.

## Problem

The recurring pattern: a survey is done for a project, produces detailed diagrams, and is
filed away.

Six months later, it describes a system that has changed. A year later, it is misleading
— and misleading is worse than absent, because decisions get made on top of it.

And there is a prior problem: the traditional survey captures the declared topology, not
the real one. Informal integrations, direct access to another system's database,
processes running on a forgotten machine — none of that shows up in a diagram drawn in a
meeting.

## Core Concepts

### Derive, don't draw

The rule that decides whether the current state survives:

```text
derived   from the service catalog, from tracing, from declared infrastructure,
          from the pipeline, from cost metrics
drawn     by someone, in a meeting, from what they remember
```

See [distributed tracing](/13-observability/distributed-tracing.md) — the real dependency
map comes from there, not from interviews.

What is derived maintains itself. What is drawn ages.

Not everything can be derived — business capabilities, ownership, criticality require
human judgment. But the part that changes fastest — topology, dependencies, versions,
cost — can be.

### The detail has to be justified by its use

```text
inventory          what exists, who owns it, criticality — always useful
dependencies       who calls whom — useful for assessing impact
data flows         where information is born and circulates — useful for ownership
detailed diagram   of each system — useful only to whoever is going to touch it
```

The most common scoping error: trying to document everything at the same level of detail.
The result is a large effort that produces an artifact no one consults.

Fine detail belongs to the system's team, and lives next to the code. See
[architecture documentation](/17-architecture-documentation/index.md).

### Reality includes what nobody declared

A survey that only consults the teams misses:

```text
direct access to another system's database
scheduled jobs on ownerless machines
file-based integrations, built years ago
systems nobody knows exist
unknown consumers of an API
```

The way to find them is to observe, not to ask: database access logs, network traffic,
cloud resource catalog, cost per resource.

And the typical finding from that exercise is uncomfortable and valuable: a share of the
critical integrations is in no diagram at all.

### The state has to include health, not just topology

A map that shows what exists and not what condition it is in is of little use.

```text
technical     versions, debt, test coverage, incident frequency
operational   who maintains it, how many people know it, on-call
cost          how much it consumes
business      criticality, the capability it supports
```

The second line is usually the one that reveals the most immediate risk: a critical
system with a single maintainer is an exposure no technical metric captures.

See [business capabilities](/15-enterprise-architecture/business-capabilities.md) — crossing it with criticality is
what turns inventory into priority.

### Good enough, and current

A map that is 70% correct and updated weekly is worth more than one that is 95% correct
and eighteen months out of date.

This changes the quality criterion: instead of pursuing completeness, pursue
**freshness** — and accept that parts of the map will be approximate.

And accept explicit gaps: marking "we don't know" is more honest and more useful than
filling it in with a guess.

### It exists to decide, not to document

The value test: **what decision does this artifact help make?**

```text
where to invest                  → needs cost and criticality
what to retire                   → needs usage and dependencies
what breaks if I change this     → needs real dependencies
what the people risk is          → needs who maintains it
```

A survey that answers none of those questions was done for a process, not for a decision.

## Mental Model

**Derived and current is worth more than complete and old.** The current state exists to
decide, not to document.

## When to Use

- Before any modernization plan.
- To assess the impact of changes.
- In investment and retirement decisions.
- To identify knowledge concentration risk.
- After acquisitions, to understand what came along.

## When Not to Use

**Drawing by hand** what can be derived.

**With uniform detail** across all systems.

**Without including health and criticality.**

**Consulting only the teams**, without observing reality.

**As a project deliverable**, with no continuous use.

**Pursuing completeness** instead of freshness.

## Alternatives

- **Derived service catalog** — the minimal and most sustainable version. See
  [internal developer platforms](/14-devops-and-platform/internal-developer-platforms.md).
- **Dependency map from tracing** — automatic and real.
- **Cost inventory per system** — derived from resource tagging.
- **On-demand survey** — detail only the area that is going to be touched.

The last one is the most economical: instead of mapping everything, map deeply what is
about to change.

## Trade-offs

| Derived | Drawn |
|---|---|
| Always current | Ages |
| Limited to what is instrumented | Captures judgment |
| Low maintenance cost | High |
| Real topology | Declared topology |

| Complete | Focused |
|---|---|
| Broad coverage | Depth where it matters |
| Expensive to maintain | Sustainable |
| Ages as a whole | Renewed on demand |

## Failure Modes

**An outdated diagram used as truth.**

**Invisible informal integrations.**

**Excessive detail abandoned.**

**No health and no criticality.** An inventory that prioritizes nothing.

**A survey as a project.** Done once, never again.

**A guess filling a gap.** Worse than the declared gap.

## Common Mistakes

**Drawing instead of deriving.** A diagram made from memory describes the intended architecture. The current state comes out of cloud inventory, repositories, real traffic and billing.

**Consulting without observing.** People describe the main flows and forget the old integrations, the monthly reports and the direct database access — which are exactly what tends to break in a migration.

**Documenting everything at the same detail.** The effort dilutes and what matters is no more visible than the rest. Detail should follow criticality and the intent to change.

**Not including who maintains it.** A system with no identified owner is the most actionable finding in the whole survey, and it disappears when the map records only boxes and arrows.

**Treating it as a deliverable.** A snapshot of the current state goes stale in weeks. Either it is derived from live sources, or it is a document with a short shelf life.

**Not marking what you don't know.** An undeclared gap is read as the absence of a problem. Marking "we don't know who uses this" is information, and among the most useful kinds.

## Real-World Example

A healthcare company started a modernization program and began with a survey of the
current state. The initial approach: interviews with the teams, producing diagrams.

The survey took four months and produced 68 diagrams.

A modernization pilot, three months later, revealed the problem: on decommissioning a
system the diagrams showed as having no consumers, three processes broke.

The consumers were: a scheduled job on an ownerless virtual machine, a report reading
straight from the database, and a file-based integration built six years earlier.

None appeared in the diagrams, because nobody interviewed knew about them.

The rework changed the method:

**Dependencies by observation.** Database access logs, network traffic and distributed
tracing started feeding the map. That revealed 40% more integrations than the interviews.

**A catalog derived** from the pipeline and declared infrastructure: what exists, which
version, who publishes it.

**Cost per system**, derived from resource tagging. See
[cost architecture](/09-cloud-architecture/cost-architecture.md).

**Health and ownership** — the only dimensions filled in by hand, reviewed quarterly with
the teams. They require judgment and change slowly.

**Explicit gaps.** Systems with no identified owner were marked as such — and the list of
them became a task, rather than a blank space.

There were 14 ownerless systems, of which 4 nobody knew what they were for. Two were
decommissioned after three months of monitoring with no access.

**Detail on demand.** The 68 diagrams were discarded. Each modernization initiative
produces the detail for the area it will touch, at the moment it will touch it.

What the team records: the four months of interviews produced a description of what
people believed existed. Observation produced what existed — and the difference between
the two was exactly where the risks were.

## Related Concepts

- [Target Architecture](/15-enterprise-architecture/target-architecture.md) — the destination.
- [Transition Architecture](/15-enterprise-architecture/transition-architecture.md) — the path.
- [Application Portfolios](/15-enterprise-architecture/application-portfolios.md).
- [Integration Landscapes](/15-enterprise-architecture/integration-landscapes.md).

## Practical Exercise

Take a system your inventory shows as having no consumers and check the access logs for
who queried it in the last 30 days.

The difference between the declared and the observed is the measure of your current
state.

## Interview Questions

- Why is deriving worth more than drawing?
- What does observation find that an interview does not?
- Why is freshness worth more than completeness?

## Further Reading

- Ross, Jeanne et al. *Enterprise Architecture as Strategy*. HBS Press, 2006.
- Feathers, Michael. *Working Effectively with Legacy Code*. Prentice Hall, 2004.
- Hohpe, Gregor. *The Software Architect Elevator*. O'Reilly, 2020.

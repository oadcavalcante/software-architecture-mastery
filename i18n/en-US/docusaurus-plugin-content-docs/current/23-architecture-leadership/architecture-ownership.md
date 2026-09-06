---
id: architecture-ownership
title: Architecture Ownership
sidebar_position: 20
description: A component with no owner rots — and most organizations don't know how many they have.
doc_type: concept
level: 7
difficulty: advanced
status: complete
objective: >
  By the end, the reader establishes verifiable ownership of components and recognizes the orphans
  before they become an incident.
prerequisites: [team-topologies]
related: [team-topologies, organizational-architecture, leadership-governance]
canonical_for: []
translated_from_version: 2
last_reviewed: 2026-08-31
---

# Architecture Ownership

## Overview

Every software component needs an owner. With no owner, it isn't updated, isn't fixed, isn't measured
and isn't removed — and it goes on running, because software doesn't stop running for lack of care.

```text
with an owner   somebody is accountable for evolution, operation and decisions
with no owner   somebody shows up when it breaks, does the minimum, and disappears
```

The difference appears slowly. An orphan component works fine for months, accumulates out-of-date
dependencies, stops being understood, and becomes an incident nobody knows how to resolve.

And the most uncomfortable characteristic of the problem: most organizations don't know how many
orphans they have, because ownership is declared in a document and never verified.

## Problem

Orphans are born in predictable ways:

```text
a project ended            the team dissolves and the system stays
a person who left          it was theirs, not a team's
a shared component         everybody uses it, nobody maintains it
an internal library        created by someone, adopted by many
an incomplete migration    the new one has an owner, the old one doesn't
an acquisition             it came with the company that was bought
```

The shared component case is the most insidious: it has many users and nobody accountable, and each
user assumes another one takes care of it.

And there is a second problem, subtler than absence: **nominal ownership**. A document says team X is
the owner, and team X doesn't know that, or knows and has no capacity. That is worse than having no
owner, because it creates the illusion of coverage.

## Core Concepts

### An owner is a role, not a person or an abstract team

```text
"the platform team is the owner"    nobody in particular is accountable
"Ana is the owner"                  works until she leaves
"team X, maintainer role,
  currently Ana"                    survives departures
```

The third form is the one that works. The role belongs to the team; the occupancy is by name and kept
up to date. A person's departure triggers designating another, instead of creating a silent orphan.

### Ownership has four dimensions

```text
evolution   decides what changes, prioritizes, accepts contributions
operation   accountable for availability, on-call, incidents
security    accountable for vulnerabilities and compliance
decisions   decides the component's contracts and boundaries
```

They can be separated, and the separation has to be explicit. A component whose operation belongs to
one team and whose evolution belongs to another works — as long as both know it and the contract
between them exists.

What doesn't work is implicit separation, in which operation assumes evolution will fix it and
evolution assumes operation will work around it.

### Ownership has to be verifiable

```text
declared on a wiki           goes stale silently
declared in the repository   verifiable, versioned, reviewed
                             alongside the code
```

The pattern that works: a metadata file in the repository itself, with the team and the role, and an
automated check that fails when it points at a team that no longer exists or at a person who has left.

That turns orphans from invisible into detectable. See
[fitness functions](/23-architecture-leadership/fitness-functions.md).

### Every deployed component needs an owner

The rule that closes the problem:

```text
every deployed service has a declared and valid owner
every active repository has a declared and valid owner
a component with no owner is not deployed
a component whose owner ceases to exist raises an alert
```

The third item is what prevents new orphans from being created. The fourth is what detects the ones
that appear through organizational change — which is the most common origin.

### Shared components need a model

```text
single owner, contributions accepted   the most common and the simplest
                                       the owner reviews and accepts changes
                                       from other teams
federated                              a group of maintainers from
                                       different teams
platform                               a platform team as owner,
                                       with the component as a product
```

The first model — inner source — works well when the owner has the capacity to review. It fails when
the volume of contributions exceeds that capacity, and then it becomes a bottleneck.

What is not a model: "everyone is an owner". That means nobody is.

### Decommissioning is the owner's responsibility

```text
an unused component    should be removed
with no owner          nobody removes it
with an owner          removal is a decision, with a date
```

One of the invisible costs of orphans is that they never die. Systems accumulate components nobody
uses and everybody maintains — security updates, migrations, infrastructure cost — for want of someone
with the authority to switch them off.

### Capacity has to accompany ownership

Declaring a team as owner without giving it capacity produces nominal ownership.

```text
"team X owns 14 components, and has 6 people"
```

The ownership load is part of the team's cognitive load, and it has to be counted in sizing. See
[team topologies](/23-architecture-leadership/team-topologies.md).

When the load exceeds the capacity, the ways out are: transfer components, decommission components, or
grow the team. Ignoring it produces ownership that exists on paper.

## Mental Model

**An owner is a role, declared in the repository and verified automatically.** With no verification,
ownership goes stale and the orphans stay invisible.

## When to Use

- For every deployed component and every active repository.
- As an automated check, not as a document.
- With the four dimensions explicit when they are separated.

## When Not to Use

**Declared only in a document** — it goes stale with no signal.

**As "everyone is an owner".**

**With no matching capacity** — nominal ownership is worse than declared absence.

**With no model for shared components.**

**With no authority to decommission** — an owner who cannot remove is not an owner.

## Alternatives

- **Collective ownership with rotation** — works in small organizations with a strong culture.
- **A platform team as owner** of everything shared; concentrates and scales badly.
- **Aggressive archiving** — instead of finding an owner for doubtful components, switch them off and
  see who complains.

The third is radical, effective and frightening. It works well in environments with good
observability: switching off a component with no apparent use for a week reveals dependencies no
inventory reveals.

## Trade-offs

| A single owner | Federated |
|---|---|
| Clear accountability | Distributes the load |
| Becomes a bottleneck | Dilutes accountability |
| Fast decisions | More context |

| Verified ownership | Declared |
|---|---|
| Orphans detectable | No cost to build |
| Requires integration with the directory | Goes stale |

## Failure Modes

**A silent orphan.** It works until it becomes an incident.

**Nominal ownership.** The illusion of coverage.

**Shared with no model.** Everybody uses it, nobody maintains it.

**An owner with no capacity.** Ownership that isn't exercised.

**No authority to remove.** Components that never die.

**Declaration on a wiki.** It goes stale with no signal.

## Common Mistakes

**Not verifying** whether the declared owner still exists.

**Assigning an owner as a team**, with no named role.

**Not counting ownership** in cognitive load.

**Having no model** for internal libraries.

**Not dating** the decision to decommission.

## Real-World Example

A technology company with 320 engineers went through an incident that exposed the problem: a currency
conversion service, used by eleven systems, was unavailable for 6 hours. Nobody knew who was
accountable.

The investigation found it had been built by a team dissolved in 2022, and that the eleven consumers
had appeared afterwards — each assuming somebody took care of it.

A complete inventory, done afterwards, found:

```text
deployed services                              287
with an owner declared somewhere               198
with a declared and valid owner (team exists)  141
with an owner who acknowledges the ownership   109
with no identifiable owner at all               89
with no detectable use in the last 6 months     34
```

Eighty-nine orphans, and 34 components running with no use — consuming infrastructure, receiving
security updates, and occupying mental space.

The measures, over 8 months:

**A mandatory ownership file** in the repository of every component, with the team, the role and the
current occupant, integrated with the company's team directory.

**A daily automated check.** A component whose team has ceased to exist, or whose role occupant has
left, raises an alert to the area's manager and enters a resolution queue with a deadline.

**No new deployment without a valid owner.** The pipeline rejects it.

**The 34 unused ones were switched off**, in two waves, with a week of "observed shutdown" before
definitive removal. Three complaints came in, all from quarterly use the observability didn't capture —
those three were switched back on, with a designated owner.

**The 89 orphans** were handled individually:

```text
transferred to a team with capacity        41
decommissioned                             28
absorbed by the platform                   12
kept in frozen mode, with a nominal
  owner and no evolution planned            8
```

The 8 frozen ones are the honest category: components nobody wants to maintain, that are still used,
and whose replacement is on the roadmap. Declaring them as such is better than pretending active
ownership.

**Ownership load counted.** Each team came to have the number of components it maintains visible, and
three teams that were above 12 had components transferred.

**A model for shared ones**: internal libraries came to require a single owner with a contribution
model, and the ones that found no owner were discontinued with a migration deadline.

Results after 8 months:

```text
deployed services                          228 (from 287)
with a valid and acknowledged owner        228 (100%)
orphans                                    0
infrastructure cost                        -11%
incidents with no identifiable owner       from 7/year to 0
average time to reach whoever is
  accountable during an incident           from 47 min to 4 min
```

The last number is the one operations values most: 43 minutes saved per incident, simply from knowing
who to call.

The detail the team highlights: the 198 components with an owner "declared somewhere" gave the
impression that the organization had 69% coverage. The verification showed 38% — and the difference
between declaring and verifying is the whole difference between an inventory and a fiction.

## Related Concepts

- [Team Topologies](/23-architecture-leadership/team-topologies.md) — the ownership load.
- [Organizational Architecture](/23-architecture-leadership/organizational-architecture.md).
- [Fitness Functions](/23-architecture-leadership/fitness-functions.md) — the verification.
- [Standards](/19-architecture-governance/governance-standards.md).

## Practical Exercise

Pick five components of your system and ask who they belong to — first the document, then the people
it names.

The difference between the two answers is the measure of nominal ownership in your organization.

## Interview Questions

- Why does an owner have to be a role and not a person?
- Why is nominal ownership worse than declared absence?
- Why is an owner with no authority to decommission not an owner?

## Further Reading

- Skelton, Matthew; Pais, Manuel. *Team Topologies*. IT Revolution, 2019.
- Beyer, Betsy et al. *Site Reliability Engineering*. O'Reilly, 2016.
- Larson, Will. *An Elegant Puzzle: Systems of Engineering Management*. Stripe
  Press, 2019.

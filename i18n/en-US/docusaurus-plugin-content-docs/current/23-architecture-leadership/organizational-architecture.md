---
id: organizational-architecture
title: Organizational Architecture
sidebar_position: 17
description: Designing teams, boundaries and decision flows as part of designing the system.
doc_type: concept
level: 7
difficulty: advanced
status: complete
objective: >
  By the end, the reader proposes changes to organizational structure as part of an architectural
  proposal, with the cost of the transition declared.
prerequisites: [conways-law]
related: [conways-law, team-topologies, architecture-ownership]
canonical_for: []
translated_from_version: 1
last_reviewed: 2026-08-31
---

# Organizational Architecture

## Overview

If the organizational structure determines the possible architecture, then proposing architecture
without proposing organization is proposing half of it.

```text
incomplete proposal   "we'll split into five services by domain"
complete proposal     "we'll split into five services by domain,
                      with five owning teams, which requires moving 23
                      people and will cost around four months
                      of reduced productivity"
```

The second is harder to get approved and is the only one that describes what actually has to happen.
The first produces the result from the [previous level's](/23-architecture-leadership/conways-law.md)
case study: five services on paper and a coupled system in practice.

## Problem

Architects frequently treat the organization as a given — a constraint to work around, not a variable
to propose. That happens for three reasons, all understandable:

```text
it isn't the architect's remit
proposing a reorganization looks like a territorial incursion
the cost of reorganizing is high and visible
```

The result is a class of proposals that cannot work, and whose failure is attributed to execution.

The symmetric error exists and is rarer: proposing a reorganization as the first response to any
problem. Reorganizing costs months of productivity, unsettles people, and frequently resolves by luck
what a process change would resolve by design.

## Core Concepts

### The three structures that matter

```text
formal structure     who reports to whom; defines career and budget
work structure       who works with whom day to day
decision structure   who decides what, and who has to agree
```

The architecture reproduces the second, not the first. And the third is what determines speed.

That opens a frequently ignored possibility: **changing the work and decision structures without
touching the formal one**. It is far cheaper, requires no HR process, and resolves a good share of
cases.

```text
the same hierarchy, but
  the team now decides its technology without approval
  two teams now have a weekly joint ritual
  ownership of a component is transferred
  a person is assigned for three months to another context
```

### A team boundary is an architecture boundary

What defines a well-designed organizational boundary is the same thing that defines an architectural
boundary: **what changes together stays together**.

```text
good   a team per business domain; product changes
       are local
bad    a team per technical layer; every change crosses
bad    a team per project; the boundary disappears when
       the project ends, and the code is orphaned
```

The third case deserves attention because it is the most common in organizations that operate by
project: the system is left with no owner the day the project ends. See
[architecture ownership](/23-architecture-leadership/architecture-ownership.md).

### Autonomy requires three things

Autonomous teams are the declared goal of almost every reorganization, and it fails when any of the
three is missing:

```text
scope        the team has everything it needs to deliver
capability   the team has the necessary competences
authority    the team can decide within its scope
```

Giving scope with no capability produces a team that depends on others and cannot say so. Giving scope
and capability with no authority produces a team that knows what to do and has to ask permission —
which is the most cited frustration in internal engineering surveys.

And the platform is what makes all three viable without duplicating everything. See
[team topologies](/23-architecture-leadership/team-topologies.md).

### The cost of reorganizing is real and temporary

```text
productivity drop        3 to 6 months, typically 20% to 40%
loss of context          people changing domain
relationship cost        trust between people gets rebuilt
attrition risk           reorganizations trigger departures
```

Declaring that cost in a proposal is what makes it credible. A reorganization proposal that doesn't
mention the productivity drop will be discredited as soon as it happens — and it will happen.

Declared beforehand, the same drop is a forecast met, which increases credibility rather than reducing
it.

### Reorganizing has a repetition cost

```text
one reorganization every 3 years    absorbed
one a year                          people stop investing
                                    in context they know they'll lose
two a year                          organizational cynicism
```

That means reorganizations have to be few and well designed. An architect proposing a structural
change needs high confidence that the proposed boundary is the right one — because the next correction
will cost far more than the first.

See [bounded contexts](/04-domain-driven-design/bounded-context.md) — the domain boundary is the best
available evidence.

### Decision flows are designable

Less visible than the team structure, and sometimes more impactful:

```text
who decides technology within a team
who decides the contract between teams
who approves investment above a threshold
who resolves disagreement between teams
how long each decision takes
```

Mapping that frequently reveals that the slowness is neither technical nor about team structure — it
is about the number of people who have to agree. See
[governance](/23-architecture-leadership/leadership-governance.md).

### Geographic distribution is architecture

```text
the same city                boundaries can be fluid
time zones with overlap      boundaries need a contract
time zones with no overlap   boundaries need a rigid contract,
                             and collaboration is unworkable
```

Putting one domain under the responsibility of two teams in non-overlapping time zones is an
architectural decision, even if nobody records it as one. It will produce an internal boundary in that
domain, whether anybody designs it or not.

## Mental Model

**An architectural proposal with no organizational proposal is half a proposal.** And changing the
work structure is far cheaper than changing the formal one.

## When to Use

- Whenever the proposed architecture requires boundaries the current structure doesn't sustain.
- When diagnosing slowness with no lack of capacity.
- When proposing team autonomy.
- Before a large structural migration.

## When Not to Use

**As the first response** to any problem.

**Without declaring the cost** of the transition.

**With no high confidence in the boundary** — repeated reorganizations cost more than the first.

**Touching the formal structure** when the work structure would resolve it.

**With no sponsorship from engineering leadership** — proposing it alone is wasting capital.

## Alternatives

- **Changing the work structure** — rituals, temporary assignment, transferred ownership — without
  touching the formal one.
- **Changing the decision flow** — removing approvers, delegating limits — frequently more effective
  and cheaper.
- **Adapting the architecture** to what the structure supports.
- **Rotating people** — transfers context and creates communication where there was none.

The first two should always be considered before a formal reorganization, and rarely are.

## Trade-offs

| Reorganizing | Adapting the architecture |
|---|---|
| Sustainable boundaries | No transition cost |
| Costs months | Limited architecture |
| Requires sponsorship | The architect's own autonomy |

| Formal structure | Work structure |
|---|---|
| Aligns career and budget | Cheap and reversible |
| Expensive and slow | Can conflict with the formal one |

## Failure Modes

**Architecture proposed with no organization.** It doesn't materialize.

**A reorganization with no declared cost.** It loses credibility when the drop comes.

**Frequent reorganizations.** Cynicism and loss of context.

**Autonomy with no capability.** Teams that depend and cannot say so.

**Teams per project.** Orphaned systems at the end.

**Geographic boundary ignored.** An emergent split inside the domain.

## Common Mistakes

**Treating the organization as a given.**

**Proposing a formal reorganization** when the work structure would suffice.

**Not mapping the decision flow** before touching teams.

**Not declaring the productivity drop.**

**Reorganizing by model** instead of by diagnosis.

## Real-World Example

A media company with 210 engineers went through three reorganizations in four years. The recurring
complaint in internal surveys was "things change before they work".

A review of the history found the pattern:

```text
2022   reorganization by product      reason: slow delivery
2023   reorganization by layer        reason: lack of standardization
2024   reorganization by domain       reason: slow delivery
```

All three were motivated by symptoms and none by a diagnosis. And the 2023 one had undone exactly what
the 2022 one was trying to build.

Before the fourth, engineering leadership asked the architecture group for a diagnosis, with one
constraint: **the recommendation could not be to reorganize**, unless no alternative worked.

What the diagnosis found:

```text
team structure               reasonable — by domain, since 2024
work structure               nine stream-aligned teams depended on the
                             data team for any schema change
decision structure           a technology choice required approval
                             from a committee with a 3-week queue
                             any contract between teams required
                             approval from two managers
approval flow for
  investment above
  $40k                       six signatures, an average of 11 weeks
```

None of those problems was about team structure. All of them were about decision structure.

The changes, with no reorganization at all:

**Technology choice delegated** to the teams within a short list, with a recorded exception for going
outside it. The committee was abolished. See
[standards](/23-architecture-leadership/leadership-standards.md).

**Contracts between teams** stopped requiring managerial approval; they came to require only
registration and an automated compatibility check.

**Schema changes delegated.** The data team went from executor to enabler with a deadline: it
transferred modeling and quality competence to each domain team over seven months, and kept automated
verification as a service.

**Investment approval** reduced from six signatures to two below $200k.

Results after 10 months:

```text
average lead time                         -38%
investment approval time                  from 11 to 2 weeks
schema changes per team, per month        from 0.4 to 3.1
internal survey: "I can make the
  decisions in my scope"                  from 2.4 to 4.1 (scale of 5)
reorganizations                           0
```

The recorded conclusion: the three previous reorganizations had cost, together, around 14 months of
reduced productivity — and none of them touched the cause. The cause was in the decision flow, which
appears on no org chart and required moving nobody.

And the constraint imposed on the diagnosis — "it can't be reorganizing" — was what forced the search
elsewhere. It stuck as a practice: every reorganization proposal came to require a section showing
that changes to the work and decision structures were considered and why they don't suffice.

## Related Concepts

- [Conway's Law](/23-architecture-leadership/conways-law.md).
- [Team Topologies](/23-architecture-leadership/team-topologies.md).
- [Architecture Ownership](/23-architecture-leadership/architecture-ownership.md).
- [Governance](/23-architecture-leadership/leadership-governance.md) — the decision flow.

## Practical Exercise

Map, for a typical decision in your context, how many people have to agree and how long the process
takes.

Then ask how many of those approvals have actually denied anything in the last two years. The ones
that have never denied anything are friction with no function.

## Interview Questions

- Why is changing the work structure frequently better than reorganizing?
- What three things does a team's autonomy require?
- Why do repeated reorganizations cost more than the first?

## Further Reading

- Skelton, Matthew; Pais, Manuel. *Team Topologies*. IT Revolution, 2019.
- Hohpe, Gregor. *The Software Architect Elevator*. O'Reilly, 2020.
- Larson, Will. *An Elegant Puzzle: Systems of Engineering Management*. Stripe Press, 2019.

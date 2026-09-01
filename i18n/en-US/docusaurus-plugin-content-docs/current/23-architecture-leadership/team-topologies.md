---
id: team-topologies
title: Team Topologies
sidebar_position: 19
description: Four team types and three interaction modes — the vocabulary that makes organizational design discussable.
doc_type: concept
level: 7
difficulty: advanced
status: complete
objective: >
  By the end, the reader classifies teams by type and interaction, and recognizes when an
  organizational structure is producing avoidable coupling.
prerequisites: [conways-law]
related: [conways-law, organizational-architecture, architecture-ownership]
canonical_for: []
translated_from_version: 1
last_reviewed: 2026-08-31
---

# Team Topologies

## Overview

If architecture reproduces the communication structure, then designing teams is an architectural
activity — and it needs vocabulary, or it becomes improvisation.

*Team Topologies*, by Skelton and Pais, provides that vocabulary: four team types and three modes
of interaction between them.

```text
team types
  stream-aligned      delivers value end to end in a domain
  platform            provides self-service capability
  enabling            transfers competence, temporarily
  complicated
    subsystem         handles what requires rare specialization

interaction modes
  collaboration       intense joint work, temporary
  X-as-a-service      one consumes what the other offers, with a contract
  facilitating        one helps the other acquire capability
```

The model's value is not in the taxonomy. It is in making explicit something that is usually
implicit: **what is the interaction mode between two teams, and is it the right one for the
moment?**

## Problem

With no vocabulary, organizational design happens by accretion:

```text
a team is born for a project and stays
another is born by specialty and becomes a queue
a third fields requests from everyone and delivers nothing of its own
nobody can say what each one does in one sentence
```

And the most common symptom is **excessive cognitive load**: a team responsible for more things
than it can hold in mind. It doesn't fail visibly — it gets slow, error-prone, and resistant to
change. See
[platform engineering](/14-devops-and-platform/platform-engineering.md).

The second problem is the wrong interaction mode: two teams in permanent collaboration when they
should have a contract; or a team offering a service when the consumer doesn't yet know what to
ask for and would need collaboration.

## Core Concepts

### The stream-aligned team is the default

```text
aligned to a value stream: a domain, a product, a segment
delivers end to end, without depending on another team to finish
complete ownership of what it builds, including operating it
```

Most teams should be of this type. The other three exist to **reduce the cognitive load of the
stream-aligned teams**, and that is the metric that justifies each of them.

A platform team that doesn't reduce the stream-aligned teams' load is not fulfilling its function,
regardless of what it delivers.

### A platform team, not an infrastructure team

The distinction decides the outcome:

```text
infrastructure team   receives requests, executes, becomes a queue
platform team         offers self-service capability,
                      with a product, documentation and support
```

A platform's interaction mode is **X-as-a-service**: the stream-aligned team consumes it whenever
it wants, without asking. If it has to open a ticket and wait, the real mode is asymmetric
collaboration — and the bottleneck is inevitable.

See [centralization vs. decentralization](/20-trade-offs/centralization-vs-decentralization.md).

### An enabling team is temporary by definition

```text
purpose     transfer competence the stream-aligned team lacks
duration    weeks to a few months, per engagement
success     the stream-aligned team no longer needs it
failure     it becomes a permanent dependency
```

The mode is **facilitating**, and the defining characteristic is the exit date. An enabling team
working indefinitely with the same stream-aligned team has stopped enabling and started executing.

Quality, security and data teams frequently should be enabling and become executors — which
reproduces the queue the structure existed to avoid.

### The complicated subsystem is the exception

```text
justified when     the specialization is rare and deep
                   — a risk engine, numerical optimization,
                   signal processing
not justified      out of convenience, or because "it's complex"
```

This is the most misused type: any component can be called complicated, and the classification
becomes an excuse for a team that doesn't deliver value end to end.

The test: **is the specialization so rare that spreading it across the stream-aligned teams is
unviable?** If not, the competence should be distributed, possibly with a temporary enabling team.

### Cognitive load is the design limit

```text
intrinsic     the domain's essential difficulty
extraneous    what the tooling and the process add
              — it is what the platform should eliminate
germane       what shouldn't be there at all
```

The size of a team's scope is limited by the cognitive load it can bear, not by its execution
capacity. A team of eight people responsible for twelve services in distinct domains is not
overloaded with work — it is overloaded with context.

The symptom: the team's people cannot explain what the other components do.

### Interaction modes change over time

```text
collaboration   when the boundary is not yet known
                → intense, temporary, produces discovery
as-a-service    when the boundary has become clear
                → contract, autonomy, scale
facilitating    when competence is missing, not capacity
```

The most common error is **permanent collaboration**: two teams working together indefinitely
because the boundary between them was never established. Collaboration is expensive — it consumes
both teams' attention — and it should be treated as a phase, not a state.

The question that resolves it: "what needs to become clear for this to become a contract?"

### The model is a diagnostic tool

The most valuable use is not reorganizing everything according to the taxonomy. It is using it to
name what is wrong:

```text
"that team is a platform team in name and an infrastructure team in
 practice — it receives requests instead of offering self-service"

"those two teams have been collaborating for two years; either the
 boundary is wrong, or they should be one team"

"the security team is executing instead of enabling, and that is why
 it is a queue for eighteen teams"
```

Each of those sentences is actionable and would not be said without the vocabulary.

## Mental Model

**Stream-aligned teams deliver; the other three exist to reduce their load.** And the interaction
mode is a choice that should change when the boundary matures.

## When to Use

- When diagnosing why delivery is slow with no shortage of people.
- When proposing reorganization alongside architectural change.
- When assessing whether a central team has become a bottleneck.
- To name the interaction mode between two teams in conflict.

## When Not to Use

**As a complete reorganization** by adopting a model — the cost of reorganizing is high and the
model is better as a diagnosis.

**Classifying every team** — the taxonomy serves where it clarifies.

**Creating platform teams** with no product, documentation and self-service capability.

**Maintaining collaboration** as a permanent state.

**Calling complicated** what is merely unfamiliar.

## Alternatives

- **Teams by domain, with no formal taxonomy** — works well in small organizations.
- **Communities of practice** — to spread competence without creating an enabling team.
- **Rotating people** — transfers knowledge with no new structure, and it is cheap.

The third is underrated: moving one person for three months resolves many cases people would try
to solve with an enabling team.

## Trade-offs

| Autonomous stream-aligned teams | Specialized teams |
|---|---|
| End-to-end delivery | Technical depth |
| Duplicated competence | Concentration |
| Less coordination | A queue |

| Platform as a product | Infrastructure on demand |
|---|---|
| Self-service, scale | Handles unique cases |
| Up-front investment | Becomes a bottleneck |

## Failure Modes

**A platform that is a queue.** It receives requests instead of offering.

**A permanent enabling team.** It became an executor.

**Indefinite collaboration.** The boundary was never established.

**Excessive cognitive load.** A slow team with no shortage of capacity.

**A complicated subsystem out of convenience.**

**Stream-aligned teams that can't deliver on their own.**

## Common Mistakes

**Renaming teams without changing the interaction mode.**

**Creating a platform team** without treating it as a product.

**Not dating** an enabling team's engagement.

**Measuring load by headcount** instead of by context.

**Adopting the taxonomy** as an end in itself.

## Real-World Example

A logistics company with 190 engineers had 22 teams and a constant complaint: everything took long,
and nobody could say why. Engineering capacity had grown 40% in two years and delivery had not kept
up.

A mapping classified the 22 teams and the real interaction modes — not the declared ones:

```text
stream-aligned teams, delivering end to end             6
stream-aligned teams that depend on another to finish   9
platform teams in intent, a queue in practice           3
permanent enabling teams                                2
complicated subsystem, justified                        1
complicated subsystem, unjustified                      1
```

And the interaction modes, measured by dependency frequency:

```text
team pairs in declared collaboration              4
pairs collaborating in fact, undeclared          31
pairs with a functioning service contract         7
```

Thirty-one pairs collaborating in fact — each one representing recurring coordination with no
established boundary. That number explained the slowness better than any technical analysis.

The changes, over 12 months:

**Nine incomplete stream-aligned teams gained the missing competences.** In six cases that was done
by moving people from the central teams; in three, with temporary enabling teams and a declared
exit date.

**The three platform teams were reformulated as products:** each one came to have a product person,
documentation, and the metric of "how many teams use it without opening a ticket". Requests that
could not be met by self-service became roadmap items, not queues.

**The two permanent enabling teams** — security and data — moved to time-boxed engagements. Security
kept a permanent automated verification function, which is a service, and transferred design review
to the teams, as facilitating with a date.

**The unjustified complicated subsystem** — a team maintaining the pricing engine — was dissolved,
and the competence distributed between two stream-aligned teams, with six months of enablement.

**Undeclared collaborations** were handled case by case: 18 became service contracts with a declared
interface; 7 were resolved by merging teams; 6 remained as deliberate collaboration, with quarterly
review.

Results after 12 months:

```text
stream-aligned teams delivering end to end            14 (from 6)
pairs collaborating in fact                           11 (from 31)
average delivery time                                 -46%
platform use without opening a ticket                 from 12% to 84%
perceived cognitive load (internal survey)            from 3.1 to 4.2
                                                      on a scale of 5
engineers                                             190 (unchanged)
```

The last number is what leadership highlights: delivery capacity almost doubled with no hiring. The
bottleneck had never been capacity — it was coordination.

The detail the team highlights: measuring "collaborations in fact, undeclared" was the decisive
instrument. It is simple to obtain — counting recurring dependencies between teams over a quarter —
and no organization measured it.

## Related Concepts

- [Conway's Law](/23-architecture-leadership/conways-law.md).
- [Organizational Architecture](/23-architecture-leadership/organizational-architecture.md).
- [Architecture Ownership](/23-architecture-leadership/architecture-ownership.md).
- [Platform Engineering](/14-devops-and-platform/platform-engineering.md).

## Practical Exercise

Classify your organization's teams into the four types and list, for each pair that interacts
frequently, what the real mode is.

Count how many pairs are collaborating without that having been decided. That number usually
explains the slowness no technical analysis explains.

## Interview Questions

- Why do the three non-stream types exist to reduce cognitive load?
- What is the difference between a platform team and an infrastructure team?
- Why is permanent collaboration between two teams a sign of a problem?

## Further Reading

- Skelton, Matthew; Pais, Manuel. *Team Topologies*. IT Revolution, 2019.
- Conway, Melvin. *How Do Committees Invent?*. Datamation, 1968.
- Forsgren, Nicole et al. *Accelerate*. IT Revolution, 2018.

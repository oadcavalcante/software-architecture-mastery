---
id: federated-governance
title: Federated Governance
sidebar_position: 8
description: The decision stays with the team, coherence stays in the contract — and what remains central is little.
doc_type: concept
level: 6
difficulty: advanced
status: complete
objective: >
  By the end, the reader divides decisions between local and central by a criterion of
  externality, and not by hierarchy.
prerequisites: [governance-basics]
related: [governance-basics, governance-standards, governance-pathologies]
canonical_for: []
translated_from_version: 2
last_reviewed: 2026-08-31
---

# Federated Governance

## Overview

Federated governance distributes decision authority to the teams and keeps central only what
crosses boundaries.

The criterion that makes the model work is not the decision's hierarchical level. It is
**externality**: who bears the consequence.

```text
the consequence stays with the team   local decision
the consequence crosses a boundary    coordinated decision
the consequence is the organization's central decision
```

Applied honestly, that criterion leaves surprisingly little at the center — and it is exactly
that reduction that lets the model deliver speed without losing coherence.

## Problem

The two extremes fail in familiar ways.

**Centralization.** One group decides for everyone, with less context about each case and a
queue that grows with the number of teams. Decision quality drops with distance from the
problem, and speed drops with scale.

**Autonomy with no contract.** Each team decides everything. Six ways of authenticating, four
queue systems, fifteen event formats. The cost doesn't appear inside the teams — it appears
between them, in integration, in shared operations and in the on-call rotation.

```text
"each team chooses its own language"
→ 9 languages, 9 sets of internal libraries, an impossible on-call rotation
→ nobody decided that; it was the sum of nine reasonable local decisions
```

The problem with pure autonomy is that local decisions have effects that are not local, and
nothing in the model forces anyone to consider them.

## Core Concepts

### Externality as the criterion

```text
choice of test library              local consequence      → team
internal structure of the service   local                  → team
published event format              consumed by others     → contract
integration protocol                affects whoever integrates → contract
technology entering the shared
  on-call rotation                  affects whoever operates → central
regulatory requirement              affects the organization → central
```

The operational question: **if this decision goes wrong, who pays?** If the answer is "the
team", the decision is theirs.

That is more precise than "technical decisions for teams, strategic decisions for the
center", because apparently small decisions — the format of an event — have high
externality.

### The center governs interfaces, not implementations

```text
central   what crosses: contracts, formats, protocols, identity,
          observability requirements, regulatory requirements
local     how each team meets them
```

That division is the same one that separates a module's interface from its implementation,
applied to the organization. It preserves autonomy where it produces value — in the how — and
coherence where it is necessary — in what crosses.

See [integration contracts](/08-integration-architecture/integration-contracts.md).

### Representation, not imposition

The federated model needs a forum in which the teams take part in defining what is central:

```text
composition   team representatives, plus whoever owns cross-cutting risks
authority     defines what is central; does not decide what is local
cadence       periodic, with an agenda brought by the teams
```

When the central set is defined **by** those who comply with it, it gets adopted. When it is
defined for them, it gets worked around. See
[exceptions](/19-architecture-governance/exceptions.md).

### The platform is what makes the model viable

Without a platform, federation becomes duplication: each team builds its own authentication,
monitoring and pipeline, and the aggregate cost exceeds that of centralization.

```text
strong platform   the team chooses to use it, and using it is the easiest path
weak platform     the team chooses to build, and rebuilds what already exists
```

The platform is the mechanism by which the center exerts influence without exerting
authority. See
[platform engineering](/14-devops-and-platform/platform-engineering.md).

### Federation in data

The most discussed case of the model is data architecture: domains produce their data as a
product, with contracts and declared quality, and central governance defines what every data
product has to have — not what it contains.

```text
central   discovery format, quality requirements, access policy,
          contract standard
local     modeling, semantics, evolution, priorities
```

See [data ownership](/07-data-architecture/data-ownership.md).

### Where federation fails

```text
teams with very uneven maturity   the less mature produce expensive decisions
no platform                       duplication
no representation                 it becomes disguised centralization
no consequence                    contracts unmet and nothing happens
a small organization              coordination cost greater than the benefit
```

The first is the most underestimated. Federation presupposes that each team can decide well
within its scope, and that premise is not uniform. The usual response — train and support —
is slow; the alternative is to modulate the local scope by maturity, which is uncomfortable
and honest.

### The central set should shrink over time

A health signal for the model:

```text
year 1   many central rules, teams still calibrating
year 3   part of the rules became platform, and left the central set
year 5   the central set is small and stable
```

Rules that become a paved road stop needing to be rules. If the central set only grows, the
model is regressing toward centralization.

## Mental Model

**If it goes wrong, who pays?** That question divides local from central better than any org
chart.

## When to Use

- In organizations from a few teams up, with real autonomy.
- Where there is a platform able to sustain the easy path.
- When centralization has already become a measurable bottleneck.
- With team representation in defining what is central.

## When Not to Use

**With no platform.**

**With no representation** — it becomes centralization under another name.

**With very uneven maturity**, and no differentiated support.

**In small organizations.**

**With no consequence** for breaking a contract.

**With a growing central set** — a sign of regression.

## Alternatives

- **Centralized** — simpler, works up to a certain size.
- **A community of practice** — voluntary coherence, with no authority; works with a strong
  technical culture.
- **A platform with no formal governance** — the paved road as the only mechanism.
- **Partial federation** — central on security and data, local on the rest.

The last is the most common arrangement in practice, and frequently the right one.

## Trade-offs

| Federated | Centralized |
|---|---|
| Decisions close to the context | Coherence guaranteed |
| Scales with the number of teams | Becomes a queue |
| Requires a platform | Requires less |
| Local divergence | Uniformity |

| Small central set | Large |
|---|---|
| Real autonomy | Greater coherence |
| Requires trust | Requires verification |
| Fast | Predictable |

## Failure Modes

**No platform.** Expensive duplication.

**No representation.** Disguised centralization, worked around.

**A growing central set.** Regression.

**A contract with no consequence.** Ignored.

**Uneven maturity ignored.** Expensive decisions in the less prepared teams.

**Externality not assessed.** Local decisions with a global effect.

## Common Mistakes

**Dividing by hierarchy** instead of by externality.

**Calling federated** a model in which the center decides and the teams execute.

**Not investing in a platform** before distributing the decision.

**Not measuring whether the central set is growing.**

**Not treating event format as a high-externality decision** — the most common and the most
expensive mistake.

## Real-World Example

An e-commerce company with 26 teams moved from centralized to federated governance, motivated
by a decision queue that reached five weeks.

The first attempt failed within eight months. The design had been: "teams decide everything
technical; the center handles strategy".

What happened:

```text
distinct event formats for the same order concept              5
implementations of authentication between services             4
HTTP client libraries with their own retry policy              7
incidents caused by contract incompatibility                  11
average integration time between two teams          from 3 to 9 days
```

None of those decisions was wrong locally. All of them had externality the model didn't
consider, because the division was "technical versus strategic" — and event format is
technical.

The redesign, on the externality criterion:

**Central, short and explicit** — six items: event schema format and evolution, synchronous
integration protocol, identity and authentication between services, minimum observability
requirements, data retention and classification policy, and regulatory requirements.

**Local, everything else**: language, internal structure, exclusively-used database,
libraries, ways of working.

**An architecture council with representation**: seven people, five of them from product
teams, with annual rotation. The council's authority is to define **what is central**, and
not to decide what is local.

**A platform built first**: service templates with identity, observability and a standardized
HTTP client already configured; a schema registry with compatibility checking in the
pipeline. See
[schema evolution](/08-integration-architecture/schema-evolution.md).

**Contracts verified**, not trusted: a schema compatibility break fails the producer's build.

Two years later:

```text
items in the central set                      6 → 5
                                              (two became platform
                                              and left the set)
event formats for the same concept            1
incidents from contract incompatibility       0
average integration time between teams        2 days
average time for a local architectural decision  same day
template adoption in new services             91%
```

Two items leaving the central set is the figure the team highlights. Identity and
observability stopped being rules because they became a built-in default — no team has to
remember something that already comes configured.

And one item was added in the second year: an infrastructure cost policy, after three teams
made choices with a significant aggregate effect on the bill. The externality had not been
noticed before.

What the team learned: the first attempt did not fail from too much federation. It failed for
using the wrong criterion to divide — "technical versus strategic" puts on the local side
decisions whose consequences belong to everyone.

## Related Concepts

- [Governance Basics](/19-architecture-governance/governance-basics.md).
- [Platform Engineering](/14-devops-and-platform/platform-engineering.md) — what makes the
  model viable.
- [Integration Contracts](/08-integration-architecture/integration-contracts.md).
- [Data Ownership](/07-data-architecture/data-ownership.md).

## Practical Exercise

List five decisions the teams in your organization make on their own and, for each one,
answer: if it goes wrong, who pays?

The ones with an answer outside the team are decisions with unrecognized externality.

## Interview Questions

- Why is "technical versus strategic" a bad criterion for dividing decisions?
- Why does federation without a platform produce duplication?
- What does a central set that only grows mean?

## Further Reading

- Skelton, Matthew; Pais, Manuel. *Team Topologies*. IT Revolution, 2019.
- Dehghani, Zhamak. *Data Mesh*. O'Reilly, 2022.
- Ford, Neal et al. *Building Evolutionary Architectures*. 2nd ed. O'Reilly, 2022.

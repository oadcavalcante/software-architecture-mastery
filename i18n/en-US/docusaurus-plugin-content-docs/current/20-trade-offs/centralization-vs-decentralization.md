---
id: centralization-vs-decentralization
title: Centralization vs. Decentralization
sidebar_position: 7
description: The axis is the externality of the decision — and the cost of converging later, which is what decides.
doc_type: tradeoff
level: 5
difficulty: advanced
status: complete
objective: >
  By the end, the reader decides what to centralize by externality and cost of convergence,
  not by organizational comfort.
prerequisites: [governance-basics]
related: [federated-governance, monolith-vs-microservices, build-vs-buy]
canonical_for: []
translated_from_version: 1
last_reviewed: 2026-08-31
---

# Centralization vs. Decentralization

## Overview

The pair applies to almost everything: decisions, data, services, teams, tools, platform.

And in every case the axis is the same:

```text
real axis   who bears the consequence, and how much it costs to converge later
            if everyone decides for themselves
```

The first half decides the common case. The second decides the ties, and it is the one almost
nobody computes: accumulated divergence is cheap to create and expensive to undo, and that
asymmetry should weigh more than it does.

## Problem

The two extremes fail in known and opposite ways.

**Centralization.** One point decides, and the point becomes a queue. The quality of the decision
drops with distance from the context; the speed drops with the number of requesters.

```text
one data team serving 20 teams            a 6-week queue
one central authentication service        unavailability takes everything down
one architecture team deciding for
  all systems                             generic decisions
```

**Decentralization.** Everyone decides, and the sum has a cost nobody decided on:

```text
9 languages, each choice reasonable in isolation
6 ways of authenticating between services
15 formats for the same business concept
4 queue systems in the shared on-call rotation
```

None of those was decided. All of them accumulated.

The important point: **the cost of decentralization does not appear inside the teams**. It
appears between them — in integration, in the shared on-call, in hiring, in migration.

## Core Concepts

### Externality decides the common case

```text
the consequence stays in the team         → decentralize
the consequence crosses a boundary        → coordinate
the consequence belongs to the org        → centralize
```

See [federated governance](/19-architecture-governance/federated-governance.md), where this
criterion is developed for decisions.

The operational question is always the same: **if it goes wrong, who pays?**

And it is more precise than "technical versus strategic", because apparently small decisions have
high externality — the format of a published event is a technical decision with consequences for
every consumer.

### The cost of converging decides the ties

```text
diverge     cheap, incremental, made by one person in an afternoon
converge    expensive, coordinated, requires sponsorship and months
```

A language choice made by one team in a week can cost two years to reverse, when the organization
needs mobility between teams.

That means that, in a tie, **centralizing is the safer bet** — not because it is better, but
because it is reversible. Decentralizing later is easy; converging later is not.

The asymmetry is the opposite of that in several other pairs in this set, and for that reason it
is worth stating explicitly.

### Centralize what, exactly

The binary question is badly framed. Almost always the answer is to split it:

```text
centralize the interface, decentralize the implementation
centralize the standard, decentralize the choice within it
centralize the capability, decentralize the use
centralize the shared minimum, decentralize the rest
```

The third line is the platform model: a central team builds the capability, and teams use it
whenever they want, without asking. See
[platform engineering](/14-devops-and-platform/platform-engineering.md).

### Centralizing capability is different from centralizing decisions

```text
centralized decision     the team asks, waits, receives
centralized capability   the team uses it when it wants, without asking
```

The difference is enormous and frequently ignored. A data team that **serves requests** becomes a
queue; the same team building self-service tooling does not.

That makes it possible to obtain coherence without creating a coordination point — the most
desirable arrangement and the most expensive to build.

### Scale changes the answer

```text
3 teams     centralizing nearly everything is cheap and works
15 teams    centralization becomes a queue; coordinate interfaces
50 teams    federation with a strong platform is the only viable option
```

A centralization decision that is correct for 3 teams is wrong for 30, and organizations
frequently keep the arrangement out of inertia after growing.

The sign that the moment has passed: waiting time at the central point grows faster than the
number of teams.

### Signs of the wrong choice

```text
centralized too much
  a growing queue at the central point
  teams building alternatives to work around it
  generic decisions that serve no case
  the central team without context to decide well
  unavailability of the central service taking everything down

decentralized too much
  N ways of doing the same thing, without anyone having decided
  integration between teams costing more than the building
  shared on-call with unsustainable cognitive load
  mobility between teams impossible
  aggregate cost of licenses and operations growing with no proportional use
```

### Cost of changing your mind

```text
centralized → decentralized   relatively cheap: distribute what is already uniform
decentralized → centralized   expensive: converge N variants, with resistance
```

This asymmetry is why "centralize by default, decentralize with evidence" is better advice than
the inverse — in organizations already past the size at which a conversation settles it.

## Mental Model

**If it goes wrong, who pays?** And, in a tie: diverging is cheap, converging is not.

## When to Use

Centralize when:

- The consequence belongs to the organization — security, regulated data, identity.
- The cost of converging later is high.
- The capability requires specialization that does not fit in each team.
- The component enters the shared on-call rotation.
- The scale is still small.

Decentralize when:

- The consequence stays in the team.
- The local context genuinely varies.
- The central point is already a queue.
- The capability is available as self-service.
- The reversal is cheap.

## When Not to Use

**As a binary choice** — the answer almost always splits interface and implementation.

**Without computing the cost of converging.**

**Centralizing decisions** when centralizing capability was possible.

**Decentralizing with no platform** — it produces duplication, not autonomy.

**Keeping the arrangement after scale changed.**

## Alternatives

- **Platform** — central capability, decentralized use; the best arrangement when viable.
- **Federation** — local decision with a central contract. See
  [federated governance](/19-architecture-governance/federated-governance.md).
- **Temporary centralization** — build centrally and distribute when mature.
- **Short list** — instead of one central choice or total freedom, three approved options.

The last solves a good part of the technology cases: neither one language only, nor nine — three,
with the on-call and hiring cost declared.

## Trade-offs

| Centralized | Decentralized |
|---|---|
| Coherence | Local context |
| Concentrated specialization | Speed |
| Becomes a queue | Accumulated divergence |
| Single point of failure | No coordination |

| Centralize decisions | Centralize capability |
|---|---|
| Control | Coherence without a queue |
| Cheap to institute | Expensive to build |
| Creates dependency | Creates leverage |

## Failure Modes

**Queue at the central point.** The bottleneck that coherence costs.

**Accumulated divergence.** Nobody decided, and the cost belongs to everyone.

**Generic decision.** It serves no concrete case.

**Decentralization with no platform.** Each team rebuilds the same thing.

**Obsolete arrangement.** Correct for 3 teams, kept at 30.

**Central service as a single point of failure.**

## Common Mistakes

**Treating it as binary.**

**Not computing the cost of converging** before allowing divergence.

**Confusing centralizing decisions with centralizing capability.**

**Not revisiting the arrangement when scale changes.**

**Decentralizing as an answer to a queue**, without building the platform that replaces it.

## Real-World Example

A fintech company with 24 teams went through two arrangements in five years.

**Phase 1 — centralized (2021).** An architecture team decided technology, a data team served all
data requests, an infrastructure team provisioned resources.

```text
average time to provision a new environment      19 days
average turnaround on a data request             6 weeks
teams that built their own alternatives
  to work around the queue                       11 of 24
unapproved technologies in use                   estimated at 8
```

The workarounds were the relevant data point: centralization did not prevent divergence, it
merely made it invisible.

**Phase 2 — decentralized (2022).** The response was to remove the centralization: each team
decides its technology, provisions its resources and manages its data.

Eighteen months later:

```text
languages in production                          7
queue engines                                    4
ways of authenticating between services          5
average time to integrate two teams              from 4 to 12 days
infrastructure cost                              +52% (usage +18%)
mobility between teams                           practically nil
incidents in the shared on-call caused by
  technology unknown to the on-call engineer     23 in 12 months
```

No isolated decision had been wrong. The sum was.

**Phase 3 — central capability, local use (2024).** The third arrangement separated decisions from
capability:

**Self-service platform** for provisioning, pipelines, observability and identity. The team uses
it without asking; coherence comes from the paved road, not from approval.

**Short list of technologies**, with three languages and one queue engine, with the on-call and
hiring cost declared explicitly as the reason. Outside the list requires an
[exception](/19-architecture-governance/exceptions.md) with a deadline.

**Centralized interfaces, local implementations**: event format, synchronous protocol, identity
and observability requirements are central; everything else belongs to the team.

**Data team as a tooling builder**, not as a request handler.

Results after 20 months:

```text
time to provision a new environment              minutes (self-service)
time to integrate two teams                      3 days
languages in production                          4 (one being retired)
queue engines                                    1
infrastructure cost                              -21%, with usage +30%
incidents from unknown technology                 2
platform adoption in new services                93%
```

Converging from 7 languages to 4 took two years and is not finished — whereas diverging from 1 to
7 had taken eighteen months.

What the team records: that ratio — eighteen months to diverge, more than two years to converge
half the way — is the argument the organization now uses to evaluate any decentralization
proposal. The question is not whether the team can decide well; it is how much it costs to undo
the sum of good decisions.

## Related Concepts

- [Federated Governance](/19-architecture-governance/federated-governance.md).
- [Platform Engineering](/14-devops-and-platform/platform-engineering.md).
- [Monolith vs. Microservices](/20-trade-offs/monolith-vs-microservices.md) — the same axis,
  applied to structure.
- [Build vs. Buy](/20-trade-offs/build-vs-buy.md).

## Practical Exercise

Pick a decision the teams in your organization make independently and estimate the cost of
converging all the variants that exist today.

Compare it with the time it took for them to diverge. The ratio between the two numbers is usually
surprising.

## Interview Questions

- Why is centralizing capability different from centralizing decisions?
- Why does a tie favor centralizing, unlike other trade-offs?
- Why is a queue at the central point not solved simply by decentralizing?

## Further Reading

- Skelton, Matthew; Pais, Manuel. *Team Topologies*. IT Revolution, 2019.
- Hohpe, Gregor. *The Software Architect Elevator*. O'Reilly, 2020.
- Conway, Melvin. *How Do Committees Invent?*. Datamation, 1968.

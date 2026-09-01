---
id: cross-team-architecture
title: Cross-Team Architecture
sidebar_position: 10
description: Decisions that cross boundaries — where no team has authority and coordination is the product.
doc_type: concept
level: 7
difficulty: advanced
status: complete
objective: >
  By the end, the reader carries a decision that crosses teams through to adoption, with an explicit
  contract and dissent on record.
prerequisites: [architecture-leadership-basics]
related: [conways-law, technical-influence, negotiating-tradeoffs]
canonical_for: []
translated_from_version: 1
last_reviewed: 2026-08-31
---

# Cross-Team Architecture

## Overview

Most architectural decisions are local: a team decides, implements, and is accountable for the
result. Those decisions don't need an architect.

The work of architectural leadership starts with the decisions that **cross** boundaries — where no
team has authority over another, and where the consequence of deciding badly belongs to everyone.

```text
the format of a published event      affects every consumer
an integration protocol              affects whoever integrates
identity and authentication          affects the whole
ownership of a shared piece of data  affects whoever writes and whoever reads
the boundary between two domains     affects both teams
```

And there is a characteristic that defines this kind of decision: **it isn't made, it is adopted**. A
decision that crosses teams and is not followed by all of them does not exist.

## Problem

Three failure patterns, all common.

**Nobody decides.** The decision stays pending because none of the teams has authority and none wants
to take on the cost of coordinating. Each carries on with its own version, and the divergence
accumulates until it becomes an integration problem.

**Somebody decides and nobody adopts.** An architect or a team decides unilaterally, the others did
not take part, and the decision is silently ignored. See
[exceptions](/19-architecture-governance/exceptions.md) — invisible non-compliance is the usual form.

**It is decided by escalation.** The disagreement goes up to a common manager, who decides with no
technical context. The decision may even be a good one, and the cost is that the teams learn that
disagreeing is a way to outsource the decision — and start escalating more.

```text
the healthy pattern    the teams decide, with the architect helping
                       to structure the conversation
the pattern that
  degrades             the architect or the manager decides, and the teams
                       execute without conviction
```

## Core Concepts

### Only coordinate what needs coordinating

The criterion is externality: who bears the consequence.

```text
local consequence           the team decides, and the architect stays out
shared consequence          needs coordination
organizational consequence  needs a central decision
```

See [federated governance](/19-architecture-governance/federated-governance.md).

Coordinating local decisions is the error that turns architecture into bureaucracy. Every unnecessary
coordination consumes attention and reduces the teams' willingness to coordinate when it matters.

### Interfaces, not implementations

```text
coordinated   the contract between the teams: format, protocol,
              semantics, evolution policy
local         how each one meets the contract
```

That division is what allows coordination with little friction. Arguing about another team's internal
implementation consumes time, generates resistance and doesn't improve the result — the contract is
what matters to whoever is on the other side.

See [integration contracts](/08-integration-architecture/integration-contracts.md).

### Bring the teams in before proposing

The most common sequencing error:

```text
bad    the architect analyzes → proposes → presents to the teams → resistance
good   the architect structures the problem → the teams take part in the analysis
       → a joint proposal → adoption
```

The second sequence is slower and produces adoption. The first is faster and produces a decision that
exists only in the document.

The architect's role in the second sequence is different and harder: they structure the conversation,
bring the context the teams don't have — history, other systems, organizational constraints — and keep
the discussion on criteria rather than preferences.

### Record the dissent when it persists

Not every disagreement gets resolved. When it isn't:

```text
"team A argues for X, because of Y. Team B argues for Z, because
 of W. The decision was X, accepting the risk B pointed out,
 with a review in 6 months."
```

That does three things. It preserves the argument of whoever disagreed, which matters if the risk
materializes. It makes the decision revisable on evidence rather than on a new argument. And it gives
the dissenting team the acknowledgment that their position was considered — which significantly
reduces silent non-compliance.

See [the decision in an ADR](/18-architecture-decisions/adr-decision.md).

### Adoption has to be tracked

A decision that crosses teams doesn't end when it is made:

```text
decided       recorded
communicated  the teams know
adopted       new systems follow it
converged     old systems have migrated
```

Tracking progress along that scale is part of the work, and it is what distinguishes a decision from a
declaration. See
[standards](/23-architecture-leadership/leadership-standards.md).

And the tracking has an additional effect: it reveals when the decision is wrong. Low voluntary
adoption is usually information about the decision, not about the teams' discipline.

### The migration needs someone to pay for it

```text
"all teams must migrate to the new format"
```

That sentence, with no answer as to who pays for the effort, is aspiration. Teams have their own
priorities, and migrating for compliance competes with delivering value — and loses.

The ways out: fund the migration centrally, include it in each team's negotiated roadmap, or provide
tooling that makes it cheap. Without one of those, convergence doesn't happen.

### Coordination has a cost, and it should be visible

```text
a decision crossing 3 teams    a few meetings, weeks
crossing 8 teams               months, and the cost grows
                               more than linearly
```

That means reducing the need for coordination is frequently better than coordinating better. A
well-chosen architectural boundary eliminates the coordination; an efficient process only makes it
cheaper.

See [Conway's law](/23-architecture-leadership/conways-law.md) — when coordination is constant between
two teams, the boundary is probably in the wrong place.

## Mental Model

**Coordinate interfaces, not implementations; and bring the teams in before proposing.** A cross-team
decision isn't made, it is adopted.

## When to Use

- When the consequence crosses team boundaries.
- On formats, protocols, identity and data ownership.
- When two teams hold incompatible positions about a common boundary.

## When Not to Use

**For local decisions.**

**Proposing before involving.**

**Arguing about another team's implementation.**

**Without tracking adoption.**

**Without answering who pays for the migration.**

**Escalating** as a first resort — escalation teaches the teams to escalate.

## Alternatives

- **Reducing the need for coordination** by moving the boundary — the best solution when viable.
- **Autonomy with a verified contract** — each team decides within its scope, and compatibility is
  checked automatically.
- **One team absorbs the scope** — when two teams coordinate constantly, merging them may be the
  answer.
- **A central decision** — for the small set of items where autonomy makes no sense.

## Trade-offs

| Coordinating | Autonomy with a contract |
|---|---|
| Coherence | Speed |
| Cost grows with the number of teams | Divergence within the contract |
| Negotiated adoption | Automated verification |

| Deciding with the teams | Deciding and announcing |
|---|---|
| Real adoption | Fast |
| Slower | Silent non-compliance |

## Failure Modes

**Nobody decides.** Divergence accumulates.

**A decision with no adoption.** It exists only in the document.

**Frequent escalation.** The teams stop deciding.

**Coordinating local decisions.** Bureaucracy.

**A migration with no funding.** Convergence doesn't happen.

**Dissent erased.** Whoever disagreed isn't acknowledged, and doesn't comply, silently.

## Common Mistakes

**Proposing before involving.**

**Arguing about implementation** instead of the contract.

**Not measuring adoption.**

**Treating low adoption** as indiscipline instead of as information.

**Over-coordinating**, spending the teams' willingness.

## Real-World Example

A digital health company with nine product teams had a recurring problem: each team published domain
events in its own format. There were four different representations of the concept "patient" and three
of "encounter".

The cost was measurable:

```text
incidents from format incompatibility, 12 months    14
average integration time between two teams          9 days
translation adapters maintained                     23
```

The architecture group had already tried to solve it twice, both times through the wrong sequence:
analysis, proposal, presentation. Both times the proposal was technically good and adoption stayed
below 20%.

On the third attempt, the sequence changed:

**A shared diagnosis phase.** Instead of presenting a proposal, the architecture group presented the
numbers — the 14 incidents, the 23 adapters, the 9 days — and asked each team to describe its own
format and why it was that way.

That revealed something neither of the two previous proposals had captured: four of the nine teams had
real constraints the proposed formats did not meet — one from an integration with an external system,
two from a regulatory requirement, one from volume.

**A working group with one representative per team.** Seven weeks, with architecture structuring the
conversation and bringing the missing context.

**A decision about the interface, not the implementation.** The agreement defined the published event's
format, the semantics of the mandatory fields, and the compatible evolution policy. How each team
produces and consumes internally stayed out of scope.

**Dissent recorded.** Two teams argued for including more mandatory fields; the decision went to the
minimal set, with the objection recorded and a review planned in 12 months.

**A funded migration.** Engineering leadership allocated budget for the migration, and the architecture
group built a translation tool that covered 70% of the cases automatically.

**Adoption tracked publicly.** A dashboard showed, per team, how many events already followed the
agreed format. With no chasing — just visible.

Results after 14 months:

```text
adoption in new events                      100%
convergence of existing events               87%
translation adapters                         4 (from 23)
average integration time                     2 days
incidents from incompatibility               0
```

The team's reading: what changed between the second and third attempts was not the technical proposal —
the final format is 90% the same as the second attempt's, which was ignored. What changed was who took
part in getting there.

And the shared diagnosis phase was the most valuable step: presenting the cost in numbers, with no
solution, made the teams reach the conclusion on their own that something had to change. From there,
the conversation stopped being about whether there should be a standard and became about which one.

## Related Concepts

- [Technical Influence](/23-architecture-leadership/technical-influence.md).
- [Negotiating Trade-offs](/23-architecture-leadership/negotiating-tradeoffs.md).
- [Conway's Law](/23-architecture-leadership/conways-law.md).
- [Federated Governance](/19-architecture-governance/federated-governance.md).

## Practical Exercise

Identify a decision that crosses teams in your organization and has been pending for months.

Answer: who has the authority to make it? If the answer is "nobody", you have found the cause — and
the way out is to structure the conversation, not to escalate.

## Interview Questions

- Why is a cross-team decision not made, but adopted?
- Why does recording the dissent reduce silent non-compliance?
- Why is low voluntary adoption information about the decision?

## Further Reading

- Skelton, Matthew; Pais, Manuel. *Team Topologies*. IT Revolution, 2019.
- Hohpe, Gregor. *The Software Architect Elevator*. O'Reilly, 2020.
- Fisher, Roger; Ury, William. *Getting to Yes*. 3rd ed. Penguin, 2011.

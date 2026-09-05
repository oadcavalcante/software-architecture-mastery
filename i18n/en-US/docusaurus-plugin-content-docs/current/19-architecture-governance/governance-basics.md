---
id: governance-basics
title: Governance Basics
sidebar_position: 1
description: Guiding the decision at the moment it is made, rather than inspecting it afterwards.
doc_type: concept
level: 6
difficulty: advanced
status: complete
objective: >
  By the end, the reader chooses a governance mechanism's intervention point from the risk
  it addresses, and not from the org chart.
prerequisites: [enterprise-governance]
related: [governance-review, fitness-functions-governance, governance-pathologies]
canonical_for: []
translated_from_version: 2
last_reviewed: 2026-08-31
---

# Governance Basics

## Overview

Architecture governance is the set of mechanisms by which an organization maintains
coherence between decisions made by different people, at different times, without direct
coordination.

The definition contains the whole problem: **the decisions are distributed, and coherence is
wanted**. Centralizing the decisions solves coherence and destroys speed. Decentralizing
with no mechanism solves speed and destroys coherence.

What distinguishes governance that works is one structural choice: **where it intervenes**.

```text
before the decision   guides whoever decides, at the moment they decide
during                accompanies, with whoever has the context
after                 inspects what has already been done
```

Almost all bad governance intervenes at the third point. Almost all good governance
intervenes at the first.

See [enterprise governance](/15-enterprise-architecture/enterprise-governance.md) for the
flow design at organizational scale; here the focus is the mechanism itself.

## Problem

The degeneration is predictable, and this is one of its most common forms — the catalog of
the others is in
[governance pathologies](/19-architecture-governance/governance-pathologies.md). Someone
identifies a real problem — six ways of authenticating, four different queues, a security
decision made without context. The institutional response is to create a checkpoint.

```text
month 1    "designs go through the committee before implementation"
month 4    the committee's queue is three weeks long
month 8    teams bring already implemented designs, for formal approval
month 14   the committee approves 97% of what it receives
month 20   nobody can explain what the committee prevents
```

The committee did not fail out of incompetence. It failed because it intervenes **after**
the decision has been made, and the only lever left at that point is saying no to work
already done — which is too expensive to use, and therefore isn't used.

And there is a symmetrical and less visible cost: with no mechanism at all, each team
rediscovers the same lessons, and the expensive ones are rediscovered through incidents.

## Core Concepts

### Governance is a coordination-cost problem

Every organization faces the same tension:

```text
full autonomy       high speed, high divergence, high rework
full coordination   high coherence, low speed, decisions far from the context
```

Neither extreme works, and the optimum is not the middle — it varies by **class of
decision**. A decision that affects only one team should belong to it; one that fixes a data
format consumed by twelve systems cannot.

The common mistake is applying the same degree of coordination to every decision. That
produces either a bottleneck on everything, or divergence in everything.

See [architecture levels](/15-enterprise-architecture/architecture-levels.md).

### Intervention point

The same objective can be pursued at very different moments, at very different costs:

```text
objective: "every exposed service requires authentication"

in the environment   the mesh rejects unauthenticated traffic — impossible to get wrong
in the template      the service is born with authentication configured
in the pipeline      the check fails if it is missing
in review            someone notices and comments
in the committee     someone notices weeks later
in the audit         someone notices months later
```

The options are ordered by increasing cost and decreasing effectiveness, and the difference
between the first two and the rest is not marginal — but those two are not equivalent to
each other. The **environment** prevents: what does not go through the control does not
happen, with the caveats of whatever escapes the proxy. The **template** prevents nothing;
it makes the right thing the default path, and the residue is measured — in the Real-World
Example, the 6% of new services that did not go through it.

Choosing the earliest viable point is where the cost per decision falls fastest: every step
to the right in that list multiplies the number of times somebody has to spend attention.

### Prevent, detect, correct

```text
prevent   the wrong path doesn't exist    template, platform, environment
detect    the error shows up fast         pipeline check, fitness function
correct   the error is found and remedied review, audit, incident
```

Mature governance has all three, in proportion: most of it prevented, some detected, a small
fraction corrected. Degenerate governance has almost everything at the third level — which
is the most expensive and the latest.

See [platform engineering](/14-devops-and-platform/platform-engineering.md): the paved road
is preventive governance under another name.

### Proportional to risk

```text
a decision reversible in an afternoon   no mechanism
a decision costly to reverse            guidance available, a record
a decision irreversible in practice     review beforehand, with whoever owns the risk
a decision with regulatory risk         mandatory verification
```

Applying the heaviest mechanism to low-risk decisions is the pattern that kills governance:
it consumes the organization's patience on cases that don't matter, and the patience runs
out exactly when an important case appears.

### Governance needs an owner and a declared cost

A mechanism with no owner is neither adjusted nor removed. And a mechanism with no measured
cost looks free, which makes the organization accumulate mechanisms indefinitely.

```text
what does this mechanism prevent?
how many times did it catch something in the last 12 months?
how much delay does it add, on average?
who answers for it?
what would happen if it were removed?
```

The fourth and fifth questions are the ones that rarely have an answer. See
[measurement](/19-architecture-governance/measuring-governance.md).

### Guiding is different from approving

```text
approve   decides for someone else, after the work, with less context
guide     helps whoever decides, before the work, with more experience
```

The difference appears in the information asymmetry: whoever approves has less context about
the specific problem and more about the organization's history. Using that second advantage
as advice is useful; using it as a veto wastes the first.

See [review](/19-architecture-governance/governance-review.md).

### Governance applies to itself too

A mechanism is an architectural decision: it has a context, alternatives, consequences and a
validity.

Recording it as an [ADR](/18-architecture-decisions/what-is-an-adr.md), with a warning signal and
periodic review, is what keeps mechanisms created for a 2021 problem from still charging a
toll in 2026 over a problem that no longer exists.

## Mental Model

**Move the intervention as early as possible.** In the limit, governance disappears into
the platform — and a wrong path that doesn't exist doesn't need inspecting.

## When to Use

- When independent decisions produce divergence with a measurable cost.
- When there is regulatory or security risk that cannot be delegated.
- When expensive lessons are being rediscovered by different teams.
- When the organization grows past the size where everyone knows each other.

## When Not to Use

**Uniformly for every decision.**

**As a design approval committee.**

**With no owner and no measured cost.**

**In small organizations**, where a conversation resolves it — a formal mechanism is pure
cost.

**For problems the platform would solve better.**

**With no review deadline** — mechanisms are permanent by default.

## Alternatives

- **A platform and templates** — governance built in, with no process.
- **[Fitness functions](/19-architecture-governance/fitness-functions-governance.md)** —
  continuous, automatic verification.
- **A community of practice** — coherence through voluntary convergence, with no authority.
- **Nothing, with records** — only ADRs, letting the coherence emerge.

The first is almost always superior where applicable, and the third works better than
expected in organizations with a strong technical culture.

## Trade-offs

| Early intervention | Late |
|---|---|
| Cheap and effective | Expensive and weak |
| Requires investment in a platform | Requires only a process |
| Hard to work around | Workaroundable |

| Autonomy | Coordination |
|---|---|
| Speed, local context | Coherence, reuse |
| Divergence | Bottleneck |
| Rework across teams | Decisions far from the problem |

## Failure Modes

**Late intervention.** The only lever is vetoing finished work, and it isn't used.

**A uniform mechanism.** It consumes patience on irrelevant cases.

**No owner.** It is never adjusted or removed.

**No measured cost.** The organization accumulates mechanisms.

**Apparent compliance.** Approving decisions that are already implemented.

**Governance with no validity.** It solves a problem from five years ago.

## Common Mistakes

**Creating a committee** as the first response to a coherence problem.

**Not asking what the earliest intervention point would be.**

**Confusing governance with authority** — the mechanism is the means, not the power.

**Not measuring the friction** the mechanism introduces.

**Not recording the mechanism as a decision**, with a review condition.

## Real-World Example

A financial services company with 340 engineers had an architecture committee that reviewed
every project above an effort threshold. The queue was 2 to 4 weeks.

A review of the mechanism itself, done at the request of the engineering leadership,
measured 18 months of operation:

```text
projects submitted                            214
approved with no changes                      186 (87%)
approved with minor changes                    21
substantively changed                           5
rejected                                        2
average waiting time                       17 days
aggregate waiting time              ~10 person-years of calendar time
```

The five cases with substantive changes were examined one by one. In four of them, the
problem raised was one of **security** or of **shared data format**. In none of the five was
the question about the system's internal design.

And the two rejected had been implemented anyway, with an exception granted afterwards.

The rework was done on the intervention-point criterion:

**Security moved into the environment.** Authentication between services became enforced by
the mesh; a service with no valid identity receives no traffic. It stopped being a review
matter. See [zero trust](/10-security/zero-trust.md).

**Shared formats moved into the pipeline.** Event schemas and API contracts came to be
automatically verified against the central registry, with a compatibility break failing the
build. See
[schema evolution](/08-integration-architecture/schema-evolution.md).

**The committee abolished**, replaced by two mechanisms:

- **Voluntary consultation**, with no queue and no approval — any team can request an hour
  with two architects, early, while the design is still malleable.
- **Mandatory review only for three classes**: decisions that fix a data format consumed by
  others, decisions with regulatory implications, and irreversible cost decisions above a
  threshold.

**Service templates** with authentication, monitoring, tracing and a retry policy already
configured. See
[platform engineering](/14-devops-and-platform/platform-engineering.md).

Twenty months later:

```text
decisions under mandatory review           31 (against 214)
average waiting time                        3 days
voluntary consultations                    142
incidents caused by data format
  divergence                                0 (against 7 in the previous period)
template adoption in new services           94%
```

The figure the team considers decisive: voluntary consultations exceeded the volume of
mandatory reviews fourfold. Teams seek guidance when it is cheap, early and carries no veto.

The reading the team takes from this: the committee was never the problem. The problem was
that it intervened at the one point where the only available action was too expensive to
take.

## Related Concepts

- [Enterprise Governance](/15-enterprise-architecture/enterprise-governance.md) — the flow
  at scale.
- [Fitness Functions](/19-architecture-governance/fitness-functions-governance.md) — the
  automated intervention.
- [Pathologies](/19-architecture-governance/governance-pathologies.md) — the modes of
  degeneration.
- [Platform Engineering](/14-devops-and-platform/platform-engineering.md).

## Practical Exercise

Take a governance mechanism in your context and ask: what is the earliest intervention point
at which this objective could be pursued?

If the answer is "in the environment" or "in the template", the current mechanism is too
expensive.

## Interview Questions

- Why is a committee that approves 90% of what it receives not working?
- What is the difference between preventive, detective and corrective governance?
- Why is applying the same mechanism to every decision the most expensive mistake?

## Further Reading

- Ford, Neal et al. *Building Evolutionary Architectures*. 2nd ed. O'Reilly, 2022.
- Skelton, Matthew; Pais, Manuel. *Team Topologies*. IT Revolution, 2019.
- Forsgren, Nicole et al. *Accelerate*. IT Revolution, 2018.

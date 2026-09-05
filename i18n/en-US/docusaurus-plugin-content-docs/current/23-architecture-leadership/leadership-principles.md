---
id: leadership-principles
title: Principles from the Writer's Perspective
sidebar_position: 12
description: Formulating principles that eliminate options — and removing them when they become consensus.
doc_type: concept
level: 7
difficulty: advanced
status: complete
objective: >
  By the end, the reader formulates principles derived from real decisions, with implications and
  precedence, and knows when to retire them.
prerequisites: [architecture-vision]
related: [architecture-vision, leadership-standards, leadership-governance]
canonical_for: []
translated_from_version: 3
last_reviewed: 2026-08-31
---

# Principles from the Writer's Perspective

## Overview

The [previous level](/19-architecture-governance/governance-principles.md) covers how principles
operate at the moment of decision. This one covers whoever **writes** them — and the writing work
has three problems of its own:

```text
1. where the principles come from
2. how to know whether they work
3. when to remove them
```

The first is the most decisive. Principles formulated in a workshop, out of what the organization
would like to be, almost always become slogans. Principles **derived from decisions that have
already been made** describe the organization's real criteria — and for that reason they are
recognized and used.

## Problem

The typical creation process:

```text
a two-day workshop with the leadership
brainstorming about values and direction
consolidation into nine principles
publication on the internal portal
```

The predictable result: statements nobody would contest — "we prioritize quality", "we seek
simplicity" — none of which eliminates an option in any real decision.

The problem is not the workshop. It is the source: the organization was asked what it would like to
be, and not what it actually uses to decide.

And there is a second problem, on the other side: principles that worked and became consensus, and
that go on occupying space in a list nobody can remember in full.

## Core Concepts

### Derive them from precedents

The method that produces usable principles:

```text
1. read the last fifty recorded architectural decisions
2. look for the criteria that appear repeatedly
3. state each one as a claim that eliminates options
4. validate against decisions you did not use to derive them
```

That produces principles that describe what the organization already does — and the practical
difference is enormous: they are recognized immediately, and the discussion becomes about whether
the criterion is right, not about whether it is the criterion.

See [ADRs](/18-architecture-decisions/what-is-an-adr.md).

When the decision archive doesn't exist, building it comes before writing principles.

### Apply the inverse test

```text
formulate the opposite
if it is absurd, it's a slogan
if it is a defensible position, it's a principle
```

```text
"we seek simplicity"                        absurd inverse
"we prefer buying to building, except
 where the capability differentiates the
 business"                                  defensible inverse
```

Every real principle gives up something good. If nothing is being given up, there is no choice. See
[enterprise principles](/15-enterprise-architecture/enterprise-principles.md).

### Implications, not just the statement

```text
principle      "what the platform offers, teams don't rebuild"

implications   every proposal to build something the platform
               covers has to be justified in writing
               platform gaps become items on its roadmap,
               not parallel builds
               the platform commits to a response time
```

The third implication is what makes the principle fair: it imposes an obligation on both sides. A
principle that only constrains the teams and doesn't commit the platform will be worked around, and
rightly so.

### Precedence between conflicting principles

```text
"teams decide their own technology"
"we minimize the number of technologies in operation"
```

Both defensible, and opposed. With no rule, each decision becomes a power struggle.

```text
by domain    autonomy wins for internal choices;
             standardization wins on the shared surface
by risk      the greater the shared risk, the more weight
             to coherence
```

Defining the precedence is the writer's responsibility, and it is the part the workshop normally does
not do — because it requires choosing, and the workshop seeks consensus.

### Five to eight, at most

The limit is memory, not rigor. Principles that have to be looked up don't guide the decisions they
exist to guide, because those decisions happen without anyone looking anything up.

If the list has fifteen, it is an audit reference, not a decision instrument.

### Measure citation in real decisions

```text
a principle cited in ADRs and reviews    it's operating
never cited                              it isn't
```

That measurement is cheap — a search of the decision archive — and it is the only honest test. A
well-written principle nobody cites in a year is not working, regardless of the quality of the
writing.

### Retire what became consensus

Counterintuitive and important: a principle nobody contests any more has stopped eliminating options,
and for that reason has stopped being a principle.

```text
"we prefer managed services to components we operate ourselves"
  → in 2020, it eliminated options and generated discussion
  → in 2026, it is consensus; it became a description, not a choice
```

Removing it frees space on the list for a principle that still decides something. The usual path is
to promote it to an automatically verified standard, where applicable. See
[standards](/23-architecture-leadership/leadership-standards.md).

### An annual review, with one question

```text
"do the conditions that produced this principle still hold?"
```

Principles are decisions about how to decide, and they age like any decision. A principle formulated
for an organization of six teams can be actively harmful in one of thirty.

## Mental Model

**Derive from precedents, test by the inverse, and retire what became consensus.** Five to eight,
with implications and precedence.

## When to Use

- When independent decisions need common criteria.
- Deriving from the decision archive, not from a workshop.
- With implications and a precedence rule.

## When Not to Use

**Formulated in a workshop** out of aspiration.

**Without passing the inverse test.**

**Without implications.**

**Without precedence** among those that conflict.

**In numbers above eight.**

**Without measuring citation** in real decisions.

## Alternatives

- **An ADR archive** — concrete precedents teach the criteria better than abstractions, and
  organizations with a good archive need fewer principles.
- **A short vision** — three to five statements covering the essentials. See
  [architecture vision](/23-architecture-leadership/architecture-vision.md).
- **Standards** — when the decision is recurring and the outcome predictable.
- **Nothing** — in small teams, shared criteria are tacit and work.

## Trade-offs

| Derived from precedents | Formulated from aspiration |
|---|---|
| Recognized and used | Describes the desired |
| Requires a decision archive | Fast to produce |
| Describes what is already done | May describe nothing |

| Few principles | Many |
|---|---|
| Remembered | Cover more cases |
| Require choosing | Avoid choosing |

## Failure Modes

**A slogan.** Nobody defends the inverse.

**No implication.** Cited by both sides of any argument.

**Conflict with no precedence.** Resolved by power.

**A long list.** It isn't remembered.

**Consensus kept on the list.** Occupies space without deciding anything.

**Never reviewed.** Governs with premises from another era.

## Common Mistakes

**Formulating in a workshop** without looking at the real decisions.

**Not declaring implications** that commit the writer.

**Not measuring citation.**

**Not removing** what became consensus.

**Writing a principle** where a standard would do.

## Real-World Example

A health technology company had no published architectural principles, and engineering leadership
wanted to create some. The initial proposal was the usual one: a two-day workshop with the
architects and tech leads.

The architecture group proposed a different method, with a simple argument: the organization had
already been deciding somehow, for four years, and those decisions were on record.

**Reading the ADRs.** The 96 decision records from the last three years were read, and the criteria
cited in each one were tabulated.

```text
criterion cited                                    ADRs
"we can't depend on the site's connection"          31
"clinical data cannot be altered"                   27
"whoever operates it has to be able to debug at 3am" 19
"the team that builds is the one on call"           17
"we prefer buying where we aren't differentiated"   11
other criteria, with fewer than 5 citations          —
```

The five criteria added up to 105 citations across the 96 decisions — several ADRs cited more than
one.

**The inverse test** applied to the five: the first four passed comfortably; the fifth was contested
internally, because the organization had built three systems the market offered. The discussion that
followed was productive, and the principle was kept with an additional implication: every proposal to
build has to name the differentiator in writing.

**Implications**, a minimum of two per principle, with at least one imposing an obligation on the
writers. For the on-call principle, the obligation fell on leadership: no team takes on on-call
responsibility without the platform that makes it sustainable.

**Precedence declared** between the two that conflicted — team autonomy and buy over build — resolved
by domain.

The result was a one-page document, with five statements, published in three weeks rather than a
two-day workshop.

Twelve months later:

```text
citations in new ADRs                         44 of 51
engineers who could cite at least three       83%
principles contested internally                1 — the buy one,
                                              kept after discussion
principles added                               0
```

The recorded conclusion: the five principles were news to nobody. They described the criteria the
organization already used, stated memorably — and that is why they were recognized immediately,
instead of having to be sold.

And the two-day workshop, which would have produced aspirations, would have cost eight people for two
days. Reading the ADRs cost one person for three days.

## Related Concepts

- [Principles in Operation](/19-architecture-governance/governance-principles.md).
- [Enterprise Principles](/15-enterprise-architecture/enterprise-principles.md).
- [Architecture Vision](/23-architecture-leadership/architecture-vision.md).
- [Standards](/23-architecture-leadership/leadership-standards.md).

## Practical Exercise

Read the last thirty recorded architectural decisions in your organization and extract the criteria
that appear more than three times.

Compare that with the published list of principles. The difference between the two is the distance
between what the organization says and what it uses.

## Interview Questions

- Why do principles derived from precedents work better than those formulated in a workshop?
- Why should a principle that became consensus be removed?
- Why do the implications have to commit whoever wrote the principle?

## Further Reading

- Rumelt, Richard. *Good Strategy Bad Strategy*. Crown Business, 2011.
- Ford, Neal et al. *Fundamentals of Software Architecture*. O'Reilly, 2020.
- Hohpe, Gregor. *The Software Architect Elevator*. O'Reilly, 2020.

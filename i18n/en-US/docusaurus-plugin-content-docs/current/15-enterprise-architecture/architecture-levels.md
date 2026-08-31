---
id: architecture-levels
title: Architecture Levels
sidebar_position: 20
description: Which decisions belong to whom — and why pushing them upward is the most common cause of a bottleneck.
doc_type: concept
level: 6
difficulty: advanced
status: complete
objective: >
  By the end, the reader allocates decisions to the appropriate level and recognizes
  when a decision is in the wrong place.
prerequisites: [enterprise-architecture]
related: [enterprise-governance, architecture-review, enterprise-principles]
canonical_for: []
translated_from_version: 1
last_reviewed: 2026-08-31
---

# Architecture Levels

## Overview

Architectural decisions happen at different reaches:

```text
enterprise   crosses the organization — holds for years, many systems
solution     one business problem, a few systems — months to years
system       one system, one team — weeks to months
component    inside the system — days to weeks
```

The question that organizes this section: **which decision belongs to which level?**

Getting that wrong produces the two characteristic problems: local decisions made in committee — a
bottleneck — and wide-reaching decisions made by an isolated team — divergence.

## Problem

In a growing organization, the allocation of decisions usually evolves by reaction to incidents.

A team chooses a technology badly; a list of approved technologies is created. Two integrations diverge; an
integration committee is created. A system ends up with no owner; an approval process is created.

Each response is reasonable in isolation. The aggregate is an organization in which trivial decisions go
up, and the time between deciding and building stretches.

And the side effect is worse: teams that do not decide stop thinking architecturally, and the quality of
local decisions falls — which generates more incidents, which generate more centralization.

## Core Concepts

### The criterion: reach and the cost of reverting

Two questions allocate the decision:

```text
how many parts does it affect?     one team, a few, the whole organization
how much does changing your mind cost?  days, months, years
```

```text
wide reach + expensive rollback    → enterprise
wide reach + cheap rollback        → a recommendation, not a rule
local reach + expensive rollback   → the system's, with review
local reach + cheap rollback       → the team's, with no ceremony
```

The bottom-right quadrant contains **most** of the decisions, and it is where centralization usually
intrudes — at a high cost and with zero benefit.

And the top-right quadrant deserves attention: a wide-reaching but easily reversible decision does not need
a rule. It needs visibility and a paved road. See
[platform engineering](/14-devops-and-platform/platform-engineering.md).

### What belongs to each level

```text
enterprise   who owns which data
             permitted integration styles
             the identity and access model
             what is bought and what is built
             where the organization invests and what it retires

solution     decomposing a business problem into systems
             the contracts between them
             where the state lives
             the migration strategy

system       the internal data model
             the system's architectural style
             the storage choice, within what is permitted
             the testing and deployment strategy

component    code structure, patterns, libraries
```

The enterprise level's first line — data ownership — is the widest-reaching decision and the least
explicitly made. See [data ownership](/07-data-architecture/data-ownership.md).

### One-way and two-way door decisions

The distinction that calibrates the rigor:

```text
one-way door   hard or impossible to reverse
               a database choice with years of data, a public contract, a service boundary
two-way door   reversible at a low cost
               a library, code structure, an internal tool
```

Applying the same process to both is the mistake. Two-way door decisions should be made fast, by whoever is
closest, and revisited if they go wrong.

One-way door decisions deserve time, written alternatives and more than one head.

The symptom that the process is miscalibrated: the average decision time is the same for choosing a library
and for choosing an enterprise data model.

### The solution level is what usually is missing

Organizations usually have enterprise architecture and system architecture, and nothing between them.

The result: an initiative involving five systems has nobody responsible for the whole's coherence. Each
team does its part well, and the boundaries end up badly resolved — improvised contracts, duplicated data,
overlapping responsibilities.

That level does not require a job title. It requires somebody to be responsible for the decomposition and
the boundaries, with time allocated for it.

### Pushing down is the healthy pattern

The correct direction of movement: decisions go down whenever possible.

```text
up      when the reach is genuinely wide and the rollback is expensive
down    in everything else
```

And the mechanism that allows going down without losing coherence is not approval — it is a **paved road**:
the standard built into what the team already uses, so that the right choice is the easiest one. See
[internal developer platforms](/14-devops-and-platform/internal-developer-platforms.md).

A rule that needs to be verified by a committee is a rule that was not operationalized.

### Whoever decides is not whoever knows most

An organizational design mistake: allocating the decision to whoever has the most seniority, instead of to
whoever has the most context.

The enterprise architect knows more about the overview; the team knows more about the concrete problem.
System decisions made by people who do not live with the system tend to ignore constraints that only appear
in practice.

The model that works: the higher level defines **constraints and criteria**; the lower level decides
**within** them.

## Mental Model

**Reach and the cost of reverting allocate the decision.** Most of them belong to the team, and the
organizational tendency is to pull them upward.

## When to Use

- When designing a governance process.
- When deciding what requires review.
- When decision time becomes a complaint.
- When defining architects' role in the organization.

## When Not to Use

**Applying the same rigor to every decision.**

**Centralizing two-way door decisions.**

**With no solution level**, on initiatives that cross systems.

**Allocating by seniority** instead of by context.

**Creating a rule** where a paved road would resolve it.

## Alternatives

- **A paved road** — the built-in standard, instead of a verified rule.
- **Principles** — they guide without deciding. See
  [enterprise principles](/15-enterprise-architecture/enterprise-principles.md).
- **Consultation instead of approval** — the team decides, with an opinion available.
- **Review after the fact** — for reversible decisions, reviewing afterward is cheaper than approving
  beforehand.

## Trade-offs

| A centralized decision | Distributed |
|---|---|
| Coherence between teams | Divergence |
| A bottleneck | Speed |
| Broad context | Deep context |
| Less experimentation | More |

| Uniform rigor | Calibrated by reversibility |
|---|---|
| Simple to operate | Requires judgment |
| Slow for the trivial | Fast where it can be |

## Failure Modes

**A committee approving the trivial.**

**A wide-reaching decision made in isolation.** Divergence discovered late.

**The absence of the solution level.** Badly resolved boundaries.

**Teams that stop thinking.** The centralization removes the practice.

**A rule with no operationalization.** It depends on somebody checking.

**Approval as ritual.** Signed with no assessment.

## Common Mistakes

**Escalating reversible decisions.**

**Not distinguishing one-way from two-way doors.**

**Having nobody responsible for large initiatives' coherence.**

**Creating a rule instead of a paved road.**

**Deciding by seniority.**

**Not reviewing the allocation** when the organization changes size.

## Real-World Example

A services company grew from 40 to 200 engineers in three years. The architecture process followed by
accumulation:

```text
a weekly architecture committee, with 14 items on average
a list of approved technologies, with 60 entries
mandatory approval for any new service
an architecture review before any implementation
```

The average time between proposing and starting to build was **four weeks**.

The analysis of the committee's items over the previous six months classified 340 decisions:

```text
local reach, cheap rollback     71%   → they should not have been there
local reach, expensive rollback 18%   → review yes, approval no
wide reach, cheap rollback       7%   → visibility, not approval
wide reach, expensive rollback   4%   → correctly there
```

Seventy-one percent of the committee's time was spent on decisions the team could have made — a library
choice, code structure, an internal tool.

And the committee approved almost everything: the rejection rate was 3%. It functioned as a rubber stamp
with four weeks of waiting.

The reformulation:

**Classification at opening.** Whoever proposes declares reach and reversibility. Two-way door, local-reach
decisions do not go through the committee — they are recorded and proceed.

**A paved road** replacing the technology list. The platform came to offer the supported options ready;
using something else is possible and the team takes on the operation. See
[internal developer platforms](/14-devops-and-platform/internal-developer-platforms.md).

**A solution level created.** Initiatives with more than two systems came to have somebody responsible for
the decomposition and the contracts, with allocated time — with no new job title, by rotation among senior
engineers.

**Review after the fact** for reversible decisions, quarterly, looking at patterns instead of cases.

**The committee reduced** to wide-reach, expensive-rollback decisions — around one a month.

Result in nine months: time between proposing and building from four weeks to two days, and the committee
came to discuss substance.

And an effect the team did not expect: the **quality of the local decisions improved**. With the
responsibility returned, the teams started writing decision records and discussing alternatives — which
they did not do when somebody decided for them.

The point the team underlines: each item of the process had been created in response to a real problem.
None had been reviewed when the organization changed size.

## Related Concepts

- [Enterprise Governance](/15-enterprise-architecture/enterprise-governance.md).
- [Architecture Review](/15-enterprise-architecture/architecture-review.md).
- [Enterprise Principles](/15-enterprise-architecture/enterprise-principles.md).
- [Platform Engineering](/14-devops-and-platform/platform-engineering.md).

## Practical Exercise

Take the last twenty decisions that went through your architecture process and classify each one by reach
and cost of reverting.

The proportion falling into "local and reversible" is your current process's waste.

## Interview Questions

- What criteria allocate a decision to a level?
- What is the difference between a one-way door and a two-way door decision?
- Why is a paved road preferable to a verified rule?

## Further Reading

- Bezos, Jeff. *Letter to shareholders*, 2015 — one-way and two-way door decisions.
- Skelton, Matthew; Pais, Manuel. *Team Topologies*. IT Revolution, 2019.
- Ford, Neal et al. *Software Architecture: The Hard Parts*. O'Reilly, 2021.

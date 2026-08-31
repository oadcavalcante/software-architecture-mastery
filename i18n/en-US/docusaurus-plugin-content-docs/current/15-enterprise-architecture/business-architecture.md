---
id: business-architecture
title: Business Architecture
sidebar_position: 2
description: The layer that connects technology to strategy — and why it is usually skipped.
doc_type: concept
level: 6
difficulty: advanced
status: complete
objective: >
  By the end, the reader connects technical decisions to business objectives using a
  vocabulary the business recognizes.
prerequisites: [enterprise-architecture]
related: [business-capabilities, capability-mapping, technical-strategy]
canonical_for: []
translated_from_version: 1
last_reviewed: 2026-08-31
---

# Business Architecture

## Overview

Business architecture describes **what the organization does and how it creates value**, with no mention of
technology.

It is the layer that connects technical decisions to business objectives — and it is the one most
frequently skipped, because it seems distant from engineering work.

The cost of skipping it is concrete: technical decisions that cannot be justified in terms the business
recognizes, and that therefore cannot compete for budget.

## Problem

The typical conversation between technology and business:

```text
technology   "we need to modernize the pricing system"
business     "why? it works"
technology   "the technology is old, the code is hard to maintain"
business     "how much does that cost? and what do we gain?"
technology   "..."
```

The problem is not a lack of reasons — the reason exists. It is that it is expressed in a vocabulary that
connects to nothing the business decides.

Business architecture provides the intermediate vocabulary.

## Core Concepts

### The elements

```text
capabilities    what the organization knows how to do. See business capabilities
value streams   how value reaches the customer, end to end
actors          who takes part — customers, partners, areas, roles
objectives      what the organization wants to achieve, with a metric
information     the business concepts, independent of any system
```

The first two are the most used. Capabilities organize the **what**; value streams organize the **how**.

And they answer different questions: capabilities serve the investment decision; value streams serve the
decision of where to optimize.

### A value stream reveals where the time goes

A value stream traces the path from start to finish, from the point of view of whoever receives the value:

```text
customer requests a policy
  → quote            2 h
  → risk analysis    3 days      ← 78% of the total time
  → approval         4 h
  → issuance         20 min
```

The mapping reveals where the time is spent — and it frequently contradicts intuition.

That changes the technical prioritization: optimizing the issuance, which already takes 20 minutes, changes
nothing. The bottleneck is in the analysis, and the question becomes what makes it slow.

And the answer may not be technical: it may be waiting for information, a human approval, or a manual step.
Discovering that avoids investing in automating what is not the problem.

### Objectives need a metric

```text
vague         "improve the customer experience"
with a metric "reduce policy issuance time from 4 days to 1"
```

The second allows connecting a technical decision to a verifiable result. The first does not.

And it is what allows assessing afterward whether the decision worked — see
[technical strategy](/15-enterprise-architecture/technical-strategy.md), in the part about bets.

### The vocabulary needs to be the business's

A business architecture artifact written in technical vocabulary fails at its main purpose, which is
enabling the conversation.

```text
technical   "quoting microservice"
business    "capability to quote"
```

See [ubiquitous language](/04-domain-driven-design/ubiquitous-language.md) — it is the same principle,
applied at the organizational level.

And the validation is simple: can somebody from the business read the artifact and recognize the
organization in it?

### It does not belong to technology

Business architecture describes the business. It should be maintained with — ideally by — the business
areas.

When technology maintains it alone, two problems: it ages, because technology does not know about the
business changes; and it is seen as an IT artifact, not being used in the decisions that matter.

Enterprise architecture's role is to **facilitate and connect** — bringing the lens that links capabilities
to systems and to cost. See [business capabilities](/15-enterprise-architecture/business-capabilities.md).

### The appropriate level of detail is low

The temptation to model processes in detail produces large artifacts that age in months.

```text
useful      capabilities, end-to-end value streams, objectives
excessive   detailed processes, with every branch
```

Detailed processes belong to whoever executes them and change constantly. Business architecture works at
the level that stays stable.

## Mental Model

**It provides the vocabulary that connects a technical decision to a business result.** Without it, the
technical justification does not compete for budget.

## When to Use

- To justify technical investment.
- Before modernization programs.
- To identify where to optimize — value streams.
- In build-or-buy decisions.
- When the conversation between business and technology does not advance.

## When Not to Use

**Maintained only by technology.** It describes the business; with no participation from whoever operates
it, it ages and comes to be seen as an IT artifact.

**In technical vocabulary.** If the business does not recognize the names, the main purpose — enabling the
conversation — is not served.

**With process detail.** Processes change constantly; business architecture works at the level that stays
stable.

**With no metrics in the objectives.** Vague objectives do not allow connecting a technical decision to a
verifiable result.

**As a documentation exercise** with no use in a decision. An artifact that does not enter the budget or
prioritization discussion does not justify the cost of maintaining it.

**When the organization is small.** With one product and one business area, the conversation happens
directly, and formalizing adds ceremony with no benefit.

## Alternatives

- **[Business capabilities](/15-enterprise-architecture/business-capabilities.md)** — the highest-return
  subset, useful on its own.
- **Value stream mapping** — when the problem is flow, not investment.
- **Objectives and key results** — if the organization already uses them, connecting to them is cheaper
  than creating a new artifact.

The last deserves consideration: when the business already has an objective-setting mechanism, anchoring
the architecture in it avoids creating a parallel structure.

## Trade-offs

| With business architecture | Without |
|---|---|
| A justifiable technical decision | Hard to defend |
| A shared vocabulary | Parallel conversations |
| The effort of building and maintaining | None |
| Depends on business participation | IT's autonomy |

| Capabilities | Value streams |
|---|---|
| Investment | Flow optimization |
| Stable | Changes with the process |

## Failure Modes

**Maintained by IT.** It ages and is not used.

**Technical vocabulary.** The business does not recognize it.

**Excessive detail.** It ages in months.

**Objectives with no metric.** They do not allow assessment.

**An artifact with no use.**

**An incomplete value stream.** Only the part IT can see was mapped.

## Common Mistakes

**Building it alone.**

**Modeling processes in detail.**

**Not measuring time per stage** in the value streams.

**Not connecting to objectives with a metric.**

**Using system vocabulary.**

**Not validating with the people who do the work.**

## Real-World Example

An insurer had a request to modernize the underwriting system that had been stalled for two years. The
technical justification was solid — obsolete technology, a single maintainer, hard to change — and it never
competed with product initiatives in the budget.

Mapping the policy issuance value stream changed the conversation:

```text
request → quote          2 h
        → underwriting   3.5 days    ← 82% of the time
        → approval       4 h
        → issuance       20 min
total                    4.3 days
```

And the decomposition of the underwriting:

```text
waiting for customer documents    1.2 days
automatic analysis                15 min
queue for human analysis          1.8 days   ← the bottleneck inside the bottleneck
decision                          30 min
```

The human analysis queue existed because the system could only automate 30% of the cases. The other 70%
went to a team of eight analysts.

The system could automate little because adding an underwriting rule required a code change, with a
quarterly release — which meant the rules were out of date and covered few cases.

That was the same limitation the technical justification pointed at, now expressed in terms the business
decided on:

```text
"modernizing underwriting allows automating 70% instead of 30%,
 reducing issuance time from 4.3 to around 1.5 days,
 and freeing 5 of the 8 analysts for complex cases"
```

The objective, with a metric: reduce issuance time to under 2 days in 18 months.

The initiative was approved in the following cycle.

Two years later, issuance time was 1.3 days, and automation was at 74%.

The later assessment points out: the technical justification was correct from the start. It failed because
it described the **cause** — obsolete technology — with no connection to the **effect** the business
measured. Mapping the stream took three weeks and made that connection.

## Related Concepts

- [Business Capabilities](/15-enterprise-architecture/business-capabilities.md) — the central element.
- [Capability Mapping](/15-enterprise-architecture/capability-mapping.md) — the method.
- [Technical Strategy](/15-enterprise-architecture/technical-strategy.md) — the connection to investment.
- [Ubiquitous Language](/04-domain-driven-design/ubiquitous-language.md).

## Practical Exercise

Map the end-to-end value stream of an important process in your organization, with the time of each stage.

The stage consuming the largest fraction of the time is where the investment discussion should be — and
frequently is not.

## Interview Questions

- Why does a technical justification frequently not compete for budget?
- What does a value stream reveal that a systems discussion does not?
- Why should business architecture not be maintained by technology?

## Further Reading

- Ulrich, William; Rosen, Michael. *The Business Capability Map*. Cutter Consortium, 2011.
- Open Group. *TOGAF Standard* — business architecture.
- Rother, Mike; Shook, John. *Learning to See*. LEI, 1999 — value stream mapping.

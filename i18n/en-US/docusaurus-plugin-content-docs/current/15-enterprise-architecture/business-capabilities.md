---
id: business-capabilities
title: Business Capabilities
sidebar_position: 7
description: Discussing systems without talking about systems — the section's tool with the greatest practical return.
doc_type: concept
level: 6
difficulty: advanced
status: complete
objective: >
  By the end, the reader models stable capabilities and uses them to reveal
  duplication, gaps and risk.
prerequisites: [enterprise-architecture]
related: [capability-mapping, application-portfolios, business-architecture]
canonical_for: []
translated_from_version: 1
last_reviewed: 2026-08-31
---

# Business Capabilities

## Overview

A business capability is **what the organization does**, regardless of how it does it.

```text
capability   "price policies"
process      the current pricing flow
system       the calculation engine that exists today
team         who maintains it
```

The first line changes little over years. The other three change constantly.

That stability is what makes capabilities this section's most useful tool: they give a common vocabulary
between business and technology that does not age with each reorganization.

## Problem

Discussions about technology investment usually happen in terms of systems: "we need to modernize system
X", "system Y is expensive".

That has two problems.

**The business does not understand.** A commercial director does not know what system Y does, and so cannot
prioritize investment in it.

**The conversation does not reveal duplication.** If three systems partially do the same thing, talking
about them individually hides that.

Capabilities resolve both: they are understandable by the business, and the duplication appears when three
systems map to the same capability.

## Core Concepts

### What characterizes a capability

```text
a noun, not a verb          "claims management", not "manage claims"
stable                      it does not change with reorganization or technology
mutually exclusive          two capabilities do not overlap
collectively exhaustive     together, they describe what the organization does
independent of how          it mentions no process, system or department
```

The stability test: **would this capability have existed ten years ago, and will it exist ten years from
now?** If the answer depends on technology or on the current organizational structure, what was modeled is
not a capability.

The most common mistake is modeling the org chart. "Tier 2 customer service capability" is a team
structure, not a capability.

### Levels, and where to stop

```text
level 1   large areas — 8 to 15 in total
          "customer management", "product management", "operations"
level 2   decomposition — 40 to 80
          "customer registration", "credit analysis", "collections"
level 3   detail — where mapping to systems becomes useful
          "document verification", "limit calculation"
```

Three levels are enough for most organizations. Going down to a fourth produces a model nobody maintains —
and the model's value depends on it being up to date.

The sign that you went too far down: the last level's capabilities start looking like system features.

### The value is in the mapping

The model alone is a diagram. What produces decisions is overlaying information on it:

```text
systems           which ones serve each capability → reveals duplication and gaps
cost              how much is spent per capability → reveals misalignment
criticality       what stops in the business if it fails
differentiation   what distinguishes the organization
health            the technical state of the systems supporting it
```

The overlay of **differentiation** and **cost** is the one that generates the most useful discussion: a
capability that does not differentiate and consumes a large slice of the investment is a candidate for
buying instead of building. See [SaaS](/09-cloud-architecture/saas.md).

And **criticality** with **health** reveals the concrete risk: a critical capability supported by a system
in bad shape is the priority nobody had named.

### Duplication appears on its own

On mapping systems to capabilities, the pattern emerges:

```text
capability "customer registration"
  → sales system (partial)
  → billing system (partial)
  → support system (partial)
  → customer portal (partial)
```

Four systems with their own registration, each with a partial view. That is visible on the map and
invisible in a conversation about individual systems.

And the conversation that follows is productive because it does not start by accusing any system — it
starts by noting that a capability is fragmented.

See [data ownership](/07-data-architecture/data-ownership.md).

### Differentiation guides investment

A simple and powerful classification:

```text
differentiating   customers choose the organization because of this
                  → build, invest, keep it internal
supporting        necessary, does not differentiate
                  → buy, or build simply
common            everybody has it, nobody chooses because of it
                  → buy
```

See [SaaS](/09-cloud-architecture/saas.md) — it is the same criterion, applied at the organization's
level.

The typical finding from that exercise: a relevant share of the engineering investment is in supporting or
common capabilities. That is not necessarily wrong, and it needs to be a decision.

### The model needs to be maintained — and light

An out-of-date capability model is worse than none: it produces decisions based on a reality that no longer
exists.

What keeps it alive:

```text
few levels           three, not five
a declared owner     somebody answers for the model
periodic review      semiannual, with the business
derived where possible  the system mapping fed by the catalog
real use             if nobody consults it, it dies
```

The last is what decides. A model used in budget and prioritization discussions maintains itself, because
somebody needs it. One built for a project and filed away rots in months.

## Mental Model

**A capability is what the organization does; everything else is how.** The stability of the "what" is what
makes the map useful over time.

## When to Use

- Technology investment discussions with the business.
- Identifying duplication between systems.
- Build-or-buy decisions.
- Prioritizing modernization.
- Assessing risk per business area.
- Before team reorganizations.

## When Not to Use

**Modeling the org chart.**

**With more than three levels.**

**With no information overlaid.** The model alone decides nothing.

**With no owner and no review.**

**As a substitute for technical architecture.** It guides investment, not system design.

**Built by a consultancy and filed away.**

## Alternatives

- **A value stream map** — process-oriented, better for optimizing flow.
- **Domain mapping** — oriented toward software boundaries. See [DDD](/04-domain-driven-design/index.md).
- **An application inventory** — simpler, with no business lens. See
  [application portfolios](/15-enterprise-architecture/application-portfolios.md).

Capabilities and domains are complementary: capabilities organize the conversation with the business;
domains organize the software's boundaries.

## Trade-offs

| Capabilities | Systems |
|---|---|
| Stable | Change constantly |
| Understandable by the business | Technical vocabulary |
| Reveals duplication | Hides it |
| Too abstract to implement | Concrete |

| Three levels | Five |
|---|---|
| Maintainable | It ages |
| Less precision | More detail |

## Failure Modes

**A disguised org chart.** It changes with each reorganization.

**Excessive detail.** Nobody maintains it.

**A model with no use.** Built and filed away.

**With no data overlaid.** A pretty diagram that decides nothing.

**Overlapping capabilities.** The same thing in two places on the map.

**Technology vocabulary.** "API capability" is not a capability.

## Common Mistakes

**Modeling the org chart.**

**Going down to four or five levels.**

**Not mapping systems.**

**Not classifying by differentiation.**

**Having no owner for the model.**

**Building for a project** instead of for continuous use.

## Real-World Example

An insurer had 140 systems and an annual budget discussion that repeated with no progress: each area
defended its own systems, and there was no common criterion.

The capability model was built in six weeks, with three levels and 62 capabilities at level 2.

The system mapping revealed three things nobody had seen:

**Duplication.** The capability "policyholder registration" was partially served by seven systems. Each one
had its own notion of who the policyholder is, and reconciling among them consumed an entire team.

**Misaligned investment.** 34% of the engineering budget was in capabilities classified as common —
payroll, accounting, document management. None of them differentiated the insurer, and all of them had
mature products on the market.

**An unnamed risk.** The capability "claim calculation" — critical and differentiating — was supported by a
22-year-old system, with two maintainers, both close to retirement.

That third finding changed the year's priority. It was individually known by several people, and it had
never appeared in an investment discussion — because the conversation was about systems, and nobody
presented the claims system as a strategic priority.

The decisions that came out:

**A single registration service**, with declared ownership, and the seven systems coming to consume it. Two
years of work, prioritized because the duplication became visible.

**Three common capabilities migrated to purchased products**, freeing around 18% of the engineering budget.

**Modernizing the claim calculation** as a priority, with knowledge transfer as the first stage.

And a process change: the budget discussion came to happen over the capability map, not over the system
list.

In retrospect: the model took six weeks and the mapping four more. It changed the conversation more than
any technical analysis of the previous years — because the business could finally take part in it.

## Related Concepts

- [Capability Mapping](/15-enterprise-architecture/capability-mapping.md) — the method.
- [Application Portfolios](/15-enterprise-architecture/application-portfolios.md) — the mapping.
- [Business Architecture](/15-enterprise-architecture/business-architecture.md).
- [SaaS](/09-cloud-architecture/saas.md) — build or buy.

## Practical Exercise

List your organization's ten most important business capabilities, without mentioning any system or
department.

Then map which systems serve each one. The capabilities with three or more systems are your duplications.

## Interview Questions

- What distinguishes a capability from a process or a system?
- Why is stability the central property?
- Which data overlay generates the most decisions?

## Further Reading

- Ulrich, William; Rosen, Michael. *The Business Capability Map*. Cutter Consortium, 2011.
- Open Group. *TOGAF Standard* — business architecture.
- Ross, Jeanne et al. *Enterprise Architecture as Strategy*. HBS Press, 2006.

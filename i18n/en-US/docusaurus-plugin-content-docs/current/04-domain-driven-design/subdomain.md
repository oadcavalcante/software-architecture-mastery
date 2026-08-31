---
id: subdomain
title: Subdomain
sidebar_position: 2
description: The division of the domain into areas with distinct characteristics — and the investment decision it informs.
doc_type: foundation
level: 2
difficulty: beginner
status: complete
objective: >
  By the end, the reader divides a domain into subdomains and uses the classification
  to decide where to invest engineering effort.
prerequisites: [domain]
related: [core-domain, supporting-domain, generic-domain, bounded-context]
canonical_for: [subdomain]
translated_from_version: 1
last_reviewed: 2026-08-31
---

# Subdomain

## Overview

A subdomain is an area of the domain with cohesion of its own. An insurer has
underwriting, claims, billing, brokerage, accounting, customer service.

The division into subdomains is not code organization — it is business analysis. It exists
independently of the software, and the software should reflect it.

## The Problem

Without that analysis, the whole domain gets the same treatment: the same modelling
quality, the same engineering effort, the same team priority.

That is always wrong, in one of two directions.

Areas that differentiate the company get less attention than they deserve, because they
compete with the rest for resources.

And areas that differentiate nothing — tax document issuance, authentication, sending email
— get engineering effort that could have been bought off the shelf.

The division into subdomains exists to make that allocation deliberate.

## Core Concepts

### A subdomain belongs to the problem space

A distinction that causes constant confusion:

**A subdomain** is a division of the **problem** — of the business, as it is.

**A [bounded context](/04-domain-driven-design/bounded-context.md)** is a division of the
**solution** — of the software you build.

Ideally each subdomain corresponds to one bounded context. In practice, a subdomain may be
served by two contexts, or a legacy context may cover three subdomains.

When they diverge, that is information: it points at where the software does not keep up
with the business.

### The three types

The classification that guides the investment decision:

| Type | What it is | Decision |
|---|---|---|
| [Core](/04-domain-driven-design/core-domain.md) | Where the company differentiates | Invest your best effort |
| [Supporting](/04-domain-driven-design/supporting-domain.md) | Necessary, specific, not differentiating | Build it simply |
| [Generic](/04-domain-driven-design/generic-domain.md) | Necessary, solved by the market | Buy or adopt ready-made |

The most common mistake is treating everything as core.

### How to find the subdomains

Three approaches that work, in order of cost:

**By organizational structure.** Areas and departments tend to correspond to subdomains,
because the organization also divided itself by the business. It is a cheap first
approximation and frequently a good one.

**By vocabulary.** Where the same term changes meaning, there is a boundary between areas.
"Policy" for underwriting and for billing are different things.

**By *event storming*.** The most effective technique: gather the experts, map the business
events on a timeline, and observe where they cluster. The clusters are subdomain
candidates, and the process surfaces knowledge that was documented nowhere.

### The classification changes

A subdomain that is core today may become generic tomorrow, when the market solves it.

Product recommendation was core for many companies ten years ago; today there are
off-the-shelf services most of them should use. Continuing to invest their own effort there
is spending where they no longer differentiate.

Reviewing the classification periodically is cheap and sometimes frees up significant
engineering capacity.

## Why This Matters

**Because engineering capacity is finite.** The decision the classification informs is
where to allocate it — and that is a business decision, not a technical one.

**Because it guides where to apply tactical DDD.** The tactical patterns are expensive and
only pay off in the core. See [tactical DDD](/04-domain-driven-design/tactical-ddd.md).

**Because it exposes misalignment.** When the business's core subdomain is the one
receiving the least investment, that is a strategic problem the analysis makes visible.

## Common Mistakes

**Classifying everything as core.** If everything is a priority, nothing is.

**Confusing a subdomain with a bounded context.** Problem versus solution.

**Classifying by what is technically interesting.** The technically most challenging
subdomain frequently is not the one that differentiates the company.

**Not revisiting the classification.** The market changes what is generic.

**Leaving the classification to engineering.** It is a business decision, informed by
engineering.

## Real-World Example

A fleet management company mapped seven subdomains.

The initial classification, made by the technical team, marked five as core — including
routing, which was the most interesting problem and where three engineers had been working
for two years.

The review with the executive team changed the picture. What customers cited when renewing
their contracts was **predictive maintenance**: predicting a component failure before it
stopped the vehicle. No competitor did that well.

Routing, despite being the hardest problem, was comparable to competitors' and there were
mature libraries solving 90% of the cases.

The reclassification: predictive maintenance became the only core; routing became
supporting, with a library adopted; tax issuance and authentication, generic, bought.

The three routing engineers moved to predictive maintenance.

What matters here is not the specific decision. It is that the classification made by
engineering and the one made with the business diverged completely — and the second is the
one that counts.

## How the division survives time

Subdomains change less than systems, and that is what makes them a better basis for
boundaries than the technical structure.

An insurance company has had underwriting, claims and billing for decades. The technologies
changed several times; the division of the business did not.

Three practical observations follow.

**Boundaries aligned to subdomains age well.** A module corresponding to a business
capability still makes sense after changing the database, the framework and half the team.

**Boundaries aligned to technology age badly.** An "integration" or "reporting" module
reflects a technical choice from one moment, and stops making sense when the choice
changes.

**A change in the subdomain division signals a strategic change.** When the business creates
a new area or merges two, that usually precedes a reorganization of the system — and
anticipating it is one of the few forms of architectural prediction that works.

It is worth recording the subdomain division somewhere durable and revisiting it annually.
It is a half-page document that guides decisions for years.

## Related Concepts

- [Core Domain](/04-domain-driven-design/core-domain.md),
  [Supporting](/04-domain-driven-design/supporting-domain.md) and
  [Generic](/04-domain-driven-design/generic-domain.md) — the three types.
- [Bounded Context](/04-domain-driven-design/bounded-context.md) — the division of the
  solution.
- [Domain](/04-domain-driven-design/domain.md) — the whole.
- [Business Context](/01-fundamentals/business-context.md).

## Practical Exercise

List your business's subdomains and classify each into the three types.

Then compare with where engineering effort was actually allocated over the last year — by
headcount and by time.

The misalignment between the two lists is the finding.

## Interview Questions

- What is the difference between a subdomain and a bounded context?
- How do you identify a business's subdomains?
- Why is classifying everything as core a problem?

## Further Exploration

- Evans, Eric. *Domain-Driven Design*. Addison-Wesley, 2003.
- Brandolini, Alberto. *EventStorming*, 2013.
- Vernon, Vaughn. *Domain-Driven Design Distilled*. Addison-Wesley, 2016.

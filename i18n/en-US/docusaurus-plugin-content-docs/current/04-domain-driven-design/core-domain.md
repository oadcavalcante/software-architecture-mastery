---
id: core-domain
title: Core Domain
sidebar_position: 3
description: Where the company differentiates — and why identifying it wrongly wastes your best engineering capacity.
doc_type: foundation
level: 2
difficulty: intermediate
status: complete
objective: >
  By the end, the reader identifies the core domain from competitive
  differentiation, not from technical difficulty.
prerequisites: [subdomain]
related: [supporting-domain, generic-domain, tactical-ddd]
canonical_for: [core domain]
translated_from_version: 1
last_reviewed: 2026-08-31
---

# Core Domain

## Overview

The core domain is the subdomain where the company differentiates — the reason customers
choose it over a competitor.

It is where the best engineering effort should go, and it is the only place where
[tactical DDD](/04-domain-driven-design/tactical-ddd.md) usually pays off.

## The Problem

Identifying the core looks trivial and rarely is.

Three forces pull towards the wrong answer.

**Technical difficulty.** The most challenging subdomain attracts the best engineers and is
mistaken for the most important. They are different things: a hard optimization algorithm
may differentiate nothing if the competitor uses the same library.

**Volume of code.** The largest subdomain looks like the most important. Frequently it is
large because it accumulated accidental complexity, not because it is essential.

**Visibility.** What the customer sees — the interface — is mistaken for what the customer
values.

The question that corrects it: **if this subdomain were identical to the competitor's,
would the company lose customers?** If the answer is no, it is not core.

## Core Concepts

### Differentiation, not importance

Billing is essential — without it the company does not get paid. And it is not core: every
company bills, and doing it better than the competitor wins no customers.

Core is where being better **matters competitively**. It is a concept of business strategy,
not of operational criticality.

### The core is usually small

In a mature company, the core rarely exceeds 10 to 20% of the system. It is the part that
concentrates the genuinely proprietary business rules.

When someone points at half the system as core, either the analysis is wrong or the company
is trying to differentiate on too many things.

### What the core deserves

Once identified, the decisions follow:

**The best engineers.** It is counterintuitive to allocate them away from the hardest
technical problem, and it is what the analysis recommends.

**Careful modelling with the expert.** Frequent conversations, continuous refinement,
rigorous [ubiquitous language](/04-domain-driven-design/ubiquitous-language.md).

**Tactical DDD.** Aggregates, value objects, domain events — the patterns that do not pay
off elsewhere do pay off here.

**Never outsource or buy.** Buying the core is buying your own differentiation from a
vendor who sells it to everyone.

### The core changes

What differentiates today may become a commodity. When the market solves something that was
core, continuing to invest there is spending where there is no longer a return.

Reviewing annually is cheap.

## Why This Matters

**Because engineering capacity is the scarcest resource.** Allocating it outside the core
is the most expensive waste a software company commits, and the most invisible — because
the work done is of good quality.

**Because it determines where complexity is justifiable.** See
[complexity](/01-fundamentals/complexity.md). In the core, essential complexity deserves
careful modelling. Outside it, the same complexity should be avoided or bought.

**Because it is a business decision.** Engineering informs the cost; the business decides
where it wants to differentiate. When engineering decides alone, it picks the most
interesting problem.

## Common Mistakes

**Confusing it with the technically hardest.** The dominant mistake.

**Confusing it with the operationally most critical.** Payments are critical and rarely
core.

**Identifying more than one or two.** Companies differentiate on few things.

**Letting engineering decide alone.**

**Buying or outsourcing the core.** It is selling the differentiation.

**Not revisiting.** The market moves the frontier.

## Real-World Example

A niche e-commerce company — handcrafted products — had a team of twelve engineers.

The allocation found: five on search and recommendation, four on checkout and payments, two
on the catalogue, one on the sellers' dashboard.

The differentiation question was put to three repeat customers and five sellers. The
answers converged on something nobody in engineering expected: **the curation** — the
process by which the company approved sellers and products, which guaranteed that
everything on the platform was genuinely handcrafted.

It was what buyers cited when explaining why they did not buy from the large marketplace.
And it was what sellers cited when explaining why they paid a higher commission.

The curation system was a spreadsheet and a form, maintained by one engineer part-time.

Search and recommendation — five engineers — used an off-the-shelf library with tweaks, and
were comparable to any competitor's.

The reallocation moved three engineers to build the curation system: an assessment
workflow, provenance traceability, artisan verification, reputation.

Eighteen months later, that system became the company's main commercial argument and the
basis of a certification it started selling.

What was wrong was not the quality of the work on search. It was where the best capacity
was allocated.

## Related Concepts

- [Subdomain](/04-domain-driven-design/subdomain.md) — the classification.
- [Supporting](/04-domain-driven-design/supporting-domain.md) and
  [Generic](/04-domain-driven-design/generic-domain.md) — the other types.
- [Tactical DDD](/04-domain-driven-design/tactical-ddd.md) — what only pays off here.
- [Business Context](/01-fundamentals/business-context.md).

## Practical Exercise

Ask three customers why they chose your company over a competitor. Not the team — the
customers.

Map the answers onto subdomains. Then compare with the current allocation of engineers per
subdomain.

## Interview Questions

- How do you distinguish core from a merely critical subdomain?
- Why is the technically hardest subdomain frequently not the core?
- What changes in practice once you identify the core?

## Further Exploration

- Evans, Eric. *Domain-Driven Design*. Addison-Wesley, 2003 — the part on core distillation.
- Vernon, Vaughn. *Domain-Driven Design Distilled*. Addison-Wesley, 2016.

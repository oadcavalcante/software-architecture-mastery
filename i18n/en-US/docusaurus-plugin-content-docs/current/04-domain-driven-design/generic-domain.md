---
id: generic-domain
title: Generic Domain
sidebar_position: 5
description: Necessary and already solved by the market — buy it, and the decision to build needs justification.
doc_type: foundation
level: 2
difficulty: beginner
status: complete
objective: >
  By the end, the reader recognizes generic subdomains and evaluates buy versus
  build with the total cost on the table.
prerequisites: [subdomain]
related: [core-domain, supporting-domain, anti-corruption-layer]
canonical_for: [generic domain]
translated_from_version: 1
last_reviewed: 2026-08-31
---

# Generic Domain

## Overview

A generic domain is necessary, does not differentiate the company, and has already been
solved well by the market.

Authentication, sending email, tax document issuance, subscription management, payment
processing, file storage.

The default decision is **buy or adopt**. Building needs an explicit justification, not the
other way round.

## The Problem

Teams build generic domains frequently, for reasons that sound good and almost never
survive analysis.

*"Our case is different."* It almost never is. It tends to be 5% different, and those 5%
can frequently be accommodated.

*"It comes out cheaper."* The cost of building is compared with the licence price, and the
cost of maintaining, updating, fixing and operating for years is forgotten.

*"We don't want to depend on third parties."* The dependency exists anyway — on libraries,
on the cloud provider, on the operating system. The question is where it is acceptable.

*"It's simple."* Authentication looks simple until you need secure password recovery,
brute-force protection, sessions across multiple devices, a second factor, and compliance
with data regulation.

## Core Concepts

### The real cost of building

The honest comparison includes what does not appear in the initial estimate:

| | Build | Buy |
|---|---|---|
| Initial development | High | Integration |
| Maintenance per year | Continuous | Included |
| Security fixes | Your responsibility | The vendor's |
| Regulatory compliance | Yours | Frequently the vendor's |
| Operations and on-call | Yours | The vendor's |
| Engineering capacity occupied | Permanently | Once |
| Cost of exit | None | Migration |

The security row is decisive in several generic domains. A homegrown authentication
implementation is an attack surface the company then has to defend indefinitely.

### Isolate it with an anti-corruption layer

Adopting an external solution brings its model inside. Without isolation, the vendor's types
spread and future replacement gets expensive.

The defence is an
[anti-corruption layer](/04-domain-driven-design/anti-corruption-layer.md): the external
solution sits behind an interface in your vocabulary, and the rest of the system does not
know it.

That is what makes the buy decision reversible — and reversibility is what answers the
dependency argument.

### When building is justified

There are legitimate cases, and they are worth naming:

A regulatory constraint no vendor meets — data residency, for instance.

A scale at which the vendor's cost per transaction exceeds that of building and operating.
It is a calculation, not an impression, and the tipping point is usually far above what is
imagined.

A genuinely unusual requirement, verified against at least three market alternatives.

The absence of a mature option — which happens, and diminishes over time.

### Generic today, not necessarily yesterday

Many generic domains were supporting ten years ago. Systems built then carry homegrown
implementations that today could be replaced.

Revisiting that periodically frees capacity.

## Why This Matters

**Because building a generic domain is the most common waste of engineering capacity.** And
the easiest to avoid, once classified.

**Because the decision has to invert the burden.** The default should be to buy, and
building should require justification — not the reverse.

**Because the security surface matters.** In several generic domains, building means taking
on risk the vendor would absorb.

## Common Mistakes

**Comparing the cost of building with the licence price.** It ignores the total cost.

**Assuming the case is different.** Check against real alternatives first.

**Not isolating the adopted solution.** Without an anti-corruption layer, swapping gets
expensive and the dependency argument becomes true.

**Building out of technical preference.** Building is enjoyable; that is not a
justification.

**Not reassessing old implementations.**

## Real-World Example

An education company built its own subscription system: plans, billing cycles, retry
attempts, prorated upgrades and downgrades, coupons, trial periods.

Two engineers, fourteen months. After that, continuous maintenance — about 20% of one
engineer's time, indefinitely.

When finance asked for support for annual billing with a discount and for invoicing with
tax withholding, the estimate was another four months.

The evaluation of market alternatives, done at that point, found three products that did all
of it and more. The annual cost was equivalent to about two months of one engineer.

The migration took five months — more than adopting from the start would have taken, because
the subscription model was spread across the whole system with no isolation.

What the team recorded in the ADR: the original decision to build was taken in 2019, when
the options were genuinely immature for the Brazilian market. The decision was right **in
that context**. The mistake was not reassessing for five years.

That is the most common pattern with generic domains: not the initial decision, but the
absence of review.

## The review cycle

The decision to build a generic domain is almost never wrong at the moment it is taken. What
fails is the absence of review.

A simple cycle that works, reviewed once a year:

**List what was built in-house and does not differentiate the company.** The list tends to
surprise by its size.

**For each item, check whether a mature alternative exists today.** The market moves; what
did not exist three years ago frequently exists now.

**Estimate the annual cost of maintaining it.** Engineering time, fixes, dependency updates,
incidents. This number is rarely known and tends to be larger than intuition.

**Estimate the cost of migrating.** Here isolation matters: if there is an
[anti-corruption layer](/04-domain-driven-design/anti-corruption-layer.md), the migration is
local; if there is not, it is a project.

The fourth estimate is what blocks most migrations — and it is a consequence of a decision
taken years earlier not to isolate.

That gives an additional argument for isolation at the moment of adoption: it protects not
only against the vendor changing. It protects against your own decision to build growing
old.

## Related Concepts

- [Subdomain](/04-domain-driven-design/subdomain.md) — the classification.
- [Core Domain](/04-domain-driven-design/core-domain.md) — where to always build.
- [Anti-Corruption Layer](/04-domain-driven-design/anti-corruption-layer.md) — how to
  isolate what you adopt.
- [Build vs. Buy](/20-trade-offs/index.md) — the trade-off in detail.

## Practical Exercise

List your system's generic subdomains and, for each, check whether it was built or adopted.

For the built ones, estimate: how much engineering time do they consume per year? Does a
mature alternative exist today? How much would migrating cost?

## Interview Questions

- How do you evaluate build versus buy in a generic domain?
- Which costs are forgotten in the comparison?
- Why does isolating the adopted solution change the dependency argument?

## Further Exploration

- Evans, Eric. *Domain-Driven Design*. Addison-Wesley, 2003.
- Vernon, Vaughn. *Domain-Driven Design Distilled*. Addison-Wesley, 2016.

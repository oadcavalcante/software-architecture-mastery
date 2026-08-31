---
id: replacing
title: Replacing
sidebar_position: 8
description: Swapping for an off-the-shelf product — and the vendor's boundary that comes with it.
doc_type: concept
level: 6
difficulty: advanced
status: complete
objective: >
  By the end, the reader evaluates replacement by differentiation and by boundary fit, and
  avoids the customization that cancels the benefit.
prerequisites: [migration-strategies]
related: [migration-strategies, rebuilding, saas]
canonical_for: []
translated_from_version: 1
last_reviewed: 2026-08-31
---

# Replacing

## Overview

Replacing is swapping your own system for an off-the-shelf product.

The deciding criterion is the same as build or buy: **does this differentiate us?** See
[SaaS](/09-cloud-architecture/saas.md) and
[business capabilities](/15-enterprise-architecture/business-capabilities.md).

And the characteristic risk is not the decision — it is the execution: the customization
that accumulates until the product costs more than the system it replaced.

## Problem

An off-the-shelf product never does exactly what the current system does.

```text
does more       features the organization already has somewhere else
does less       parts of the process are left out
does differently  the flow is different, the model is different
```

Each difference generates a decision: adapt the process to the product, or adapt the
product to the process.

The second looks reasonable case by case, and accumulated it produces a customized
product that cannot be upgraded, with a maintenance cost equivalent to a system of your
own — without the control.

## Core Concepts

### Adapting the process is almost always better

The rule that avoids the trap:

```text
the process adapts to the product, except when the process is the differentiator
```

A mature product incorporates practices from many organizations. Frequently the current
process is not better — it is merely what exists, the result of limitations of the old
system.

And the cost of customizing is permanent: every customization has to be maintained
through every upgrade, and the vendor does not consider it in their own changes.

The legitimate exception: where the process is a source of advantage. There the
customization is investment, not debt — and it is worth considering whether that part
should be replaced at all.

### The gap assessment precedes the decision

Before choosing, map what the product does **not** do:

```text
missing feature       has to be built around it, or the process changes
different model       the data has to be transformed
integrations          does the product connect to what the organization has?
specific rules        exceptions the product cannot express
volume and scale      does the product handle the real volume?
```

The specific rules item is what most frequently makes it unviable: old systems accumulate
exceptions no generic product anticipates. See
[legacy systems](/16-legacy-modernization/legacy-systems.md).

And the assessment has to happen with real data, not with a demo — which is always done
with the happy path.

### The vendor's boundary enters the organization

A product has the boundary the vendor chose. See
[application architecture](/15-enterprise-architecture/application-architecture.md).

If it does not coincide with the organization's domain:

```text
the product does more   duplication with existing systems — decide which is the source
the product does less   part of the domain stays outside, built around it
```

The first requires a data ownership decision. See
[data ownership](/07-data-architecture/data-ownership.md).

And the protection against the vendor's model spreading into the rest of the system is
the translation layer. See
[anti-corruption layer](/08-integration-architecture/integration-anti-corruption.md).

### The total cost includes more than the license

```text
license                    the visible number
deployment and configuration months of work
integration                 with the systems that remain
data migration              see data migration
training                    of the people who use it
customization               building and maintaining it permanently
upgrades                    each new version requires verification
exit                        if one day it becomes necessary
```

The last item deserves assessment before signing: how the data comes out, in what format,
with what completeness. See
[vendor lock-in](/09-cloud-architecture/vendor-lock-in.md).

### Replacing a differentiating capability eliminates the differentiation

If the system sustains something that distinguishes the organization, replacing it with a
product competitors also use gives that advantage away.

That sounds obvious and it is frequently violated, because the product solves the
immediate problem and the differentiation is abstract.

The test: **do customers choose the organization because of this?** If so, build.

### The old one has to be shut down

As in any migration, coexistence tends to persist. See
[strangler fig](/16-legacy-modernization/strangler-fig.md).

The specific case with replacement: the old system frequently stays on "for historical
lookup", indefinitely — with license, infrastructure and security costs.

The decision about history has to be explicit: migrate it, archive it in an accessible
format, or keep the old one with a shutdown date. See
[data migration](/16-legacy-modernization/data-migration.md).

## Mental Model

**Adapt the process to the product, except where the process is the differentiator.**
Accumulated customization cancels the benefit of buying.

## When to Use

- The capability is not differentiating.
- There is a mature product covering most of the process.
- The cost of building and maintaining exceeds the cost of buying.
- The compliance the product already meets has value.
- The team is small for maintaining a system of its own.

## When Not to Use

**For a differentiating capability.**

**With extensive customization.** It cancels the benefit.

**Without assessing the gap with real data.**

**Without checking how the data comes out.**

**Without deciding about the history.**

**Without a translation layer**, letting the vendor's model in.

## Alternatives

- **[Rebuilding](/16-legacy-modernization/rebuilding.md)** — when the capability differentiates.
- **A product with extensions** — a product that offers supported extension points,
  instead of customization.
- **Partial replacement** — buy the common part, keep the differentiator.
- **[Refactoring](/16-legacy-modernization/legacy-refactoring.md)** — when the system serves and the problem is
  internal.

The third is frequently the best: buy what is common and build what distinguishes, with a
clear boundary between the two.

## Trade-offs

| Replace | Build |
|---|---|
| Available in months | Years |
| No maintenance of the core | Continuous |
| Vendor's boundary | Your own |
| Functionality beyond what's needed | Exact |
| No differentiation | Possible |
| Predictable cost | Engineering cost |

| Adapt the process | Customize the product |
|---|---|
| Simple upgrades | Verification on every version |
| Organizational change | None |
| One-off cost | Permanent |

## Failure Modes

**Accumulated customization.** The product becomes your own system, without the control.

**Gap discovered late.** Assessed in a demo, not with real data.

**Differentiation lost.**

**Duplication with existing systems.** The product's boundary overlaps.

**The vendor's model in the domain.**

**The old one never shut down.** Permanently doubled cost.

**Exit not viable.** The data does not come out in a usable format.

## Common Mistakes

**Assessing in a demo.** The demo shows the happy path prepared by the vendor. A useful assessment uses your data and your exceptional cases.

**Customizing instead of adapting the process.** Every customization makes upgrades more expensive and ties you to a version. When the process is not differentiating, adapting it to the product is cheaper than the reverse.

**Not checking data export before signing.** After signing there is no bargaining power, and difficulty exporting is what turns a vendor into a prison.

**Replacing a differentiating capability.** It levels what distinguished the company down to what the competitor also buys.

**Not isolating with a translation layer.** Without it, the vendor's model spreads through the domain, and swapping it later stops being a commercial decision.

**Not deciding about the history.** Migrating the past into the new product is usually the bulk of the effort, and the decision is a business one.

## Real-World Example

A services company replaced its own ticket management system — 9 years old — with an
off-the-shelf product.

The capability did not differentiate: customers chose the company for the service
provided, not for the ticketing tool.

The assessment was done with real data, not with a demo: 40,000 historical tickets loaded
into the product's test environment, with the real flows exercised.

That revealed three gaps before the decision:

**Two-stage approval** for tickets above a certain value — the product supported one
stage. Adapted: the process moved to a single stage with an automatic escalation rule the
product offered.

**Integration with the billing system** — there was no connector. Built, with 3 weeks of
work.

**A regulatory report** in a specific format — the product did not generate it. Solved by
export and external transformation, without customizing the product.

And one important decision: a proposal to customize the product to reproduce the old
approval flow was refused. The analysis showed that the two-stage flow was the result of
a limitation of the old system, not a business need.

Two years later:

**Zero customizations.** Three product upgrades applied with no adaptation work.

**Total cost** about 45% of what maintaining their own system consumed.

**One recurring frustration.** The product doesn't allow a type of report the operation
would like to have. The recorded decision was to live with it — the cost of customizing
was not justified.

**Old system shut down** in month 14, with the history migrated into the product and the
data prior to 2019 archived in an open format.

The point the team underlines: the decision not to customize was challenged three times in
the first year, always with a reasonable case. Keeping the discipline is what preserved
the ability to upgrade — and, on the third challenge, the requested feature arrived in a
new version of the product.

## Related Concepts

- [Migration Strategies](/16-legacy-modernization/migration-strategies.md).
- [SaaS](/09-cloud-architecture/saas.md) — build or buy.
- [Anti-Corruption Layer](/08-integration-architecture/integration-anti-corruption.md).
- [Data Migration](/16-legacy-modernization/data-migration.md).

## Practical Exercise

For a system that is a replacement candidate, list the features it has that exist because
of a system limitation, not because of a business need.

Those are the ones that don't have to be reproduced — and there are usually more of them
than expected.

## Interview Questions

- Why is adapting the process almost always better than customizing?
- Why is assessing in a demo insufficient?
- What risk does the vendor's boundary bring?

## Further Reading

- Newman, Sam. *Monolith to Microservices*. O'Reilly, 2019.
- Moore, Geoffrey. *Dealing with Darwin*. Portfolio, 2005.
- Fowler, Martin. *Utility vs Strategic Dichotomy*, 2007.

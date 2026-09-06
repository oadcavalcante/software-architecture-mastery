---
id: vendor-lock-in
title: Vendor Lock-In
sidebar_position: 18
description: The cost of leaving — and why the two extremes, adopting everything and abstracting everything, are equally bad.
doc_type: tradeoff
level: 5
difficulty: advanced
status: complete
objective: >
  By the end, the reader evaluates dependency by the cost of leaving against the
  value of entering, instead of by principle.
prerequisites: [managed-services]
related: [managed-services, serverless, cloud-native]
canonical_for: []
translated_from_version: 3
last_reviewed: 2026-08-31
---

# Vendor Lock-In

## Overview

Vendor lock-in is the cost of switching providers, measured in time, money and risk.

It is frequently discussed as something binary — "we are stuck" or "we are portable" — and it is not. It is
a spectrum, and each service adopted moves you along it.

The mistake is not in depending. It is in depending **without knowing how much leaving costs**, or in
paying in advance for a portability that will never be used.

## Problem

The two extreme positions are common, and both are expensive.

**"Use everything from the provider."** Maximum productivity, and a hypothetical migration becomes a
rewrite. Worse: you lose negotiating power, and the vendor's price or policy changes become a fait
accompli.

**"Abstract everything to be portable."** Abstraction layers over every service, using only the common
denominator between providers, refusing managed services.

The second's cost is immediate and permanent: less productivity, more code of your own, more operations.
The benefit is an option that, in the overwhelming majority of cases, is never exercised.

Provider migrations happen, and they are rare. Paying every month for an option that probably will not be
used is a choice that should be explicit.

## Core Concepts

### The degrees of dependency

```text
low      virtual machines, containers, object storage
         similar interfaces across providers; migrating is work, not a rewrite
medium   a managed database with an open source engine, a queue, a cache
         the engine is portable; the operation and the integration are not
high     serverless functions, a proprietary database, workflow orchestration,
         machine learning services
         there is no direct equivalent; migrating is redesigning
```

The scale is useful because it allows deciding per component instead of globally.

### The cost of leaving is not uniform

What actually holds you, in order of difficulty:

**Data.** A large volume in proprietary storage, with an egress transfer cost. Moving petabytes has a price
and a duration.

**The identity and permissions model.** Each provider has its own, and it permeates everything.

**Services with no equivalent.** It is not porting, it is reimplementing.

**Operational knowledge.** The team knows how to operate one provider. Learning another is time.

**Peripheral integrations.** Monitoring, pipelines, alerts, scripts. It is the most underestimated
category, because each item is small and there are hundreds.

### The criterion: value of entering against cost of leaving

```text
high value + low cost of leaving   → adopt without hesitation
high value + high cost of leaving  → adopt consciously, with the cost recorded
low value + low cost of leaving    → indifferent
low value + high cost of leaving   → avoid
```

The second quadrant is where most of the interesting decisions are, and where the answer is usually **yes**
— as long as the decision is recorded, with an estimate of the cost of leaving.

A managed database that saves one person per year is worth the dependency, even if migrating later costs
three months.

### Selective portability is the practical answer

Instead of abstracting everything or nothing, isolate what is expensive to switch:

**Data in your format**, not a proprietary one, when possible.

**Business logic with no dependency on the provider's libraries.** The domain core should import nothing
specific.

**An adapter at the boundaries** of highly coupled services — see
[anti-corruption layer](/08-integration-architecture/integration-anti-corruption.md).

That costs little and preserves most of the option. Abstracting the infrastructure too costs a lot and
preserves the rest.

### Multi-cloud is rarely the answer

Running on two providers simultaneously is presented as a solution and charges dearly:

**The common denominator.** You only use what exists on both, which discards most of the value.

**Doubled operations.** Two identity models, two toolsets, two bodies of knowledge.

**Inter-cloud transfer.** Expensive and slow.

**Data complexity.** Consistency between providers is the hard problem of
[distributed systems](/06-distributed-systems/index.md), made worse.

It is justified in a few cases: an explicit regulatory requirement, an acquisition that joined two
environments, or a dependency on a specific service from each one.

"So as not to depend on a vendor" usually does not survive the cost analysis.

### Open source dependency also exists

Choosing a self-managed open source database reduces the dependency on the cloud provider and creates
another: on the software itself, on its versions, and on the knowledge needed to operate it.

There is no absence of dependency. There is choosing which one.

## Mental Model

**Every architectural decision creates some dependency.** The question is whether the value of entering
exceeds the estimated cost of leaving — and whether anybody estimated it.

## When to Use

Accepting high dependency makes sense when:

- The service delivers value the alternative does not.
- The cost of leaving was estimated and is acceptable.
- Delivery speed matters more than the option to switch.
- The team is small and the operational work weighs.
- There is no concrete portability requirement.

## When Not to Use

**Without estimating the cost of leaving.**

**When there is a regulatory portability requirement.**

**When the vendor has continuity risk.**

**Multi-cloud by principle** — this item and the next one invert the sign: they are not conditions under
which accepting dependency is wrong, they are the ways of refusing it that cost without delivering.

**Abstracting everything out of caution.** It pays permanently for an unlikely option.

**When negotiating power matters.** Total dependency eliminates the alternative at contract renewal.

## Alternatives

- **Selective portability** — isolate what is expensive, accept the rest.
- **Managed open source services** — the engine is portable; the operation is not.
- **[Containers](/09-cloud-architecture/containers.md)** — they reduce the compute layer's dependency at a
  low cost.
- **A documented exit strategy** — instead of technical portability, a plan: what would be needed, how
  long, how much it costs. Cheap and frequently sufficient.

The last deserves emphasis: a two-page document answering "how would we leave here?" delivers most of the
risk management value, at no architectural cost.

## Trade-offs

| Adopting the provider's services | Maintaining portability |
|---|---|
| Faster delivery | Slower |
| Less operations | More |
| A high cost of leaving | Low |
| No negotiating power | With it |
| Uses the best available | The common denominator |
| Less code of your own | More |

## Failure Modes

**The cost of leaving discovered late.** Nobody estimated it, and the estimate appears when there is no
longer a choice.

**A price change with no alternative.**

**A discontinued service.** A migration on the vendor's deadline.

**An abstraction that does not abstract.** The layer exists, and the particularities leaked through.

**Multi-cloud delivering the worst of both.**

**Egress transfer making the migration unviable.** The data exists and moving it costs too much.

## Common Mistakes

**Not estimating the cost of leaving.**

**Abstracting by principle.**

**Adopting multi-cloud with no requirement.**

**Ignoring the peripheral integrations** in the estimate.

**Assuming open source eliminates dependency.**

**Not reviewing the decision** when the volume or the contract changes.

## Real-World Example

It is the same company as in [managed versus
self-hosted](/20-trade-offs/managed-vs-self-hosted.md) — 26 engineers, five infrastructure components
operated in-house — seen along a different axis. There the question is what operating them costs; here it
is what the portability policy bought with that cost.

The company established, at its founding, the rule of not using any proprietary cloud service. Everything
in containers, everything with self-managed open source software, everything portable.

Four years later, the balance:

**About 1.1 full-time engineers** — the result of the three-month measurement recorded in the sibling
document — operating a self-managed database, queue, search, cache and Kubernetes, for a team of 26.

**The portability was never exercised.** No migration was ever considered in four years.

**On the invoice, the policy paid for itself.** Self-hosting cost less than the equivalent managed
services:

```text
total self-hosted cost                  ~$18,000/month
equivalent managed services             ~$23,600/month
difference in favor of self-hosting     ~$5,600/month, for four years
```

And that is precisely why the policy survived four years without review: the cost it imposed did not show
up in the account the company was looking at. The calculation above excludes the value of the postponed
product features — which the team judged larger than the difference, and could not estimate.

**Delayed delivery.** Several product features were postponed for lack of people, allocated to operations.

The review led to a different policy, classified by the value-against-exit-cost criterion — not by degree
of dependency, which describes the component rather than the decision:

**Adopted without hesitation:** a managed cache, with a compatible protocol and an exit cost measured in
days. High value, low cost of leaving.

**Adopted with a record:** a managed database and a managed queue, both with open source engines — which
reduces the rewrite, but not the three months of data migration and reconfiguration the estimate showed.
High value and a high cost of leaving fall in the second quadrant, and the second quadrant requires a
record. Alongside them, a proprietary event processing service, estimated at four months. Two of the three
engineers went back to the product.

**Kept portable:** the domain core, with no dependency on the provider's libraries, and the data in open
formats. Also search and the container cluster, which stayed self-managed — search because of a
language-specific extension with no managed equivalent, the containers because the dependency was already
low and migrating would not save operational effort. That is why the net is two engineers, not three.

**Refused:** multi-cloud, and a proprietary workflow service whose value did not justify the coupling.

**Created:** an exit strategy document, reviewed annually, with the estimated migration cost per component.

What the team learned: the original policy came from a bad experience one of the founders had had with a
vendor, years earlier. It was never analyzed in cost — it was a principle, and principles are not compared
against numbers.

The bill for four years of unexercised portability was what changed the conversation.

## Related Concepts

- [Managed Services](/09-cloud-architecture/managed-services.md) — the decision that generates dependency.
- [Serverless](/09-cloud-architecture/serverless.md) — the highest degree.
- [Cloud Native](/09-cloud-architecture/cloud-native.md).
- [Trade-offs](/20-trade-offs/index.md).

## Practical Exercise

Choose your system's most critical cloud service and estimate: how much time and how much money to replace
it with an equivalent at another provider?

If you cannot estimate it, that is the information missing from a decision that has already been made.

## Interview Questions

- Why is abstracting everything for portability usually a bad deal?
- What actually holds you, in order of difficulty?
- Why does multi-cloud rarely solve the problem it promises?

## Further Reading

- Fowler, Martin. *Utility vs Strategic Dichotomy*. martinfowler.com, 2010.
- Newman, Sam. *Building Microservices*. 2nd ed. O'Reilly, 2021.
- Storment, J.R.; Fuller, Mike. *Cloud FinOps*. 2nd ed. O'Reilly, 2023.

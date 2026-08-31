---
id: graceful-degradation
title: Graceful Degradation
sidebar_position: 13
description: Working worse instead of stopping — reliability's highest-return technique, and the least applied.
doc_type: pattern
level: 5
difficulty: intermediate
status: complete
objective: >
  By the end, the reader classifies features by criticality and designs each
  dependency's degraded behavior.
prerequisites: [reliability]
related: [circuit-breakers, bulkheads, slo]
canonical_for: []
translated_from_version: 1
last_reviewed: 2026-08-31
---

# Graceful Degradation

## Overview

Graceful degradation is continuing to work with reduced capability when part of the system fails, instead
of stopping completely.

It is reliability's **highest-return technique**, because it requires neither redundancy, nor additional
infrastructure, nor coordination. It requires one decision: **what is essential?**

And it is the least applied, because that decision belongs to product, and somebody rarely asks for it.

## Problem

An application's default behavior is binary: the dependency fails, the request fails, the user sees an
error.

That means a failure in the recommendations service — which decorates the page — prevents the purchase. A
failure in the reviews service prevents seeing the product. A failure in the profile photo prevents the
login.

None of those dependencies is essential to the action the user wants to perform. And all of them take the
whole action down, because nobody wrote what to do when they fail.

## Core Concepts

### Classifying by criticality is the work

The classification needs to come from product, and it is simple:

```text
essential   without it the action makes no sense — it does not degrade
important   degrades with a notice to the user
optional    omitted silently
```

On an e-commerce product page:

```text
price and availability   essential
description and photos   essential
reviews                  important — "reviews unavailable"
recommendations          optional — it disappears
price history            optional
```

Once that classification is made, the implementation is straightforward. Without it, each developer decides
alone, and the default decision is to propagate the error.

### The forms of degrading

**Omit.** The block does not appear. Appropriate for the optional.

**Serve stale data.** An expired cache is better than nothing, and frequently imperceptible. See
[caching for scale](/11-scalability/scaling-cache.md).

**A default value.** Shipping calculated from a fixed table when the carrier does not respond.

**A simplified version.** Search with no relevance ranking, a listing with no advanced filters.

**Accept and process later.** The operation enters a queue. See
[asynchronous processing](/11-scalability/async-processing.md).

**Read-only.** The system stops accepting writes and keeps serving queries. Frequently the most valuable
degradation and the least implemented.

### The user needs to know

Degrading silently when the effect is visible generates distrust: the user sees a wrong number and
concludes the system lies.

The rule:

```text
optional     omit with no notice — the user does not miss it
important    notify — "reviews temporarily unavailable"
stale data   report the age — "prices updated 15 minutes ago"
```

The third case is what most avoids support calls: a user who knows the data is delayed does not report a
defect.

### It needs to be exercised

A degraded path that never executes is broken. It is written once, never tested, and it fails at the moment
it is triggered — typically because the default response has a shape the interface does not expect.

Two practices that resolve it:

**Testing the degraded path** as part of the suite, not only the happy path.

**Exercising in production**, turning off non-essential dependencies in a controlled window. See
[chaos engineering](/12-reliability/chaos-engineering.md).

### Degradation is also protection

Besides improving the experience under failure, degrading **preserves capacity**.

Under overload, turning off optional features frees resources for the essential ones. That is selective load
shedding, and it is smarter than rejecting requests uniformly. See
[backpressure](/06-distributed-systems/backpressure.md).

Having a switch per feature — operable with no deployment — is what makes that operational during an
incident.

### Degradation's limits

Not everything degrades. It is worth being explicit:

**Financial operations.** You do not charge an approximate amount.

**Security checks.** An authorization that fails cannot become permission. See
[security failure modes](/10-security/security-failure-modes.md).

**Data controlling a finite resource.** Stock, a seat, a quota.

For those, the correct answer is to fail — clearly, with a useful message.

## Mental Model

**Degradation is deciding what to sacrifice before you need to.** Without that decision, the system
sacrifices everything.

## When to Use

- There are non-essential dependencies on an action's path.
- The main action makes sense without part of the data.
- Total unavailability has a high cost.
- A reasonable cache or default value exists.
- Capacity needs to be preserved under overload.

## When Not to Use

**For financial operations and security checks.**

**Without classifying by criticality.** The decision falls to the developer.

**Degrading silently** when the user notices the difference.

**Without exercising the degraded path.**

**When the degraded data leads to the wrong decision.** Approximate stock that allows selling what does not
exist.

**As a substitute for fixing the unstable dependency.**

## Alternatives

- **Redundancy** — it avoids the failure instead of degrading. More expensive.
- **A [circuit breaker](/12-reliability/circuit-breakers.md)** — it stops trying and degrades fast.
- **A [bulkhead](/12-reliability/bulkheads.md)** — it isolates so the failure does not reach.
- **Failing fast with a clear message** — when degrading is not possible.

A circuit breaker and degradation are complementary: the first detects that the dependency is down; the
second defines what to do then.

## Trade-offs

| With degradation | Without |
|---|---|
| The action stays possible | A complete failure |
| A reduced experience | None |
| Alternative paths to maintain | One path |
| A risk of wrong data | No risk |
| It needs to be tested | Less surface |

| Omitting silently | Notifying |
|---|---|
| A clean interface | An informed user |
| A risk of distrust | Transparency |

## Failure Modes

**A broken degraded path.** Never exercised.

**Silent degradation with a visible effect.**

**Stale data leading to the wrong decision.**

**Cascading degradation.** Each layer degrades, and the final result is useless.

**No switch.** There is no way to turn the feature off during the incident.

**Permanent degradation.** The dependency came back and nobody turned it on again.

## Common Mistakes

**Not classifying features.** Without deciding beforehand what is essential and what is accessory, the
degradation is improvised during the incident — when nobody has time to decide well.

**Leaving the decision to the developer.** What can be turned off is a product decision, with a business
consequence. Made in the code, it becomes inconsistent across parts of the system.

**Not testing the degraded path.** It only executes during an incident, so it is usually broken — and the
discovery happens when it was the last defense.

**Not notifying when the user notices.** An empty recommendation block with no explanation looks like a
defect. One line saying the feature is temporarily unavailable preserves trust.

**Having no per-feature switch.** With no way to turn one part off without deploying, the only response
during the incident is to roll everything back or endure it.

**Degrading operations that should not degrade.** In financial and security flows, responding with an
approximate value is worse than refusing. There the correct answer is to fail explicitly.

## Real-World Example

An e-commerce platform had the product page depending on seven services. Any one down took the whole page
down — and with it, the possibility of buying.

The incident that motivated the change: the recommendations service was down for 40 minutes. The product
page was unavailable the whole time, and sales stopped.

Recommendations contributed around 3% of the revenue.

The reformulation started with the classification, made with the product team in two hours:

```text
price and stock          essential
description and images   essential
reviews                  important
recommendations          optional
recently viewed          optional
estimated shipping       important
questions and answers    optional
```

The implementation:

**Optional ones omitted** when unavailable, with a 300 ms timeout — if it did not respond, it does not
appear.

**Reviews** with a notice and a 24-hour cache as a fallback.

**Estimated shipping** with a fixed table per region when the carrier does not respond, marked as an
estimate.

**A per-feature switch**, operable with no deployment, to turn off optional features under overload.

**A read-only mode** for the whole catalog, activatable when the write database is unavailable — which
allows continuing to sell with cached stock, accepting orders into a queue.

That last one was the most debated, because accepting an order without confirming stock contradicts the
rule about not degrading a finite resource. The decision was made by the business: accept orders with a
"confirmation within 2 hours" notice, with automatic cancellation and refund if the stock does not confirm.

In the following eighteen months:

**Five incidents** that would have taken the product page down were absorbed with partial degradation.

**The read-only mode** was activated twice, maintaining 70% of the revenue during primary database
outages.

**One problem:** on one of those occasions, the degraded shipping path was broken — the fixed table had
been written 8 months earlier and never executed, with a formatting error. From then on, the degraded paths
entered the test suite and the monthly exercise.

The learning that stuck: the classification took two hours and had never been done in six years of the
product. The question "what is essential on this page?" had no owner — neither product nor engineering
considered it theirs.

## Related Concepts

- [Circuit Breakers](/12-reliability/circuit-breakers.md) — it detects and triggers the degradation.
- [Bulkheads](/12-reliability/bulkheads.md) — it prevents propagation.
- [SLO](/12-reliability/slo.md) — the target degradation helps sustain.
- [Backpressure](/06-distributed-systems/backpressure.md) — selective shedding.

## Practical Exercise

Take your product's most important screen and list its dependencies. Classify each one as essential,
important or optional — with somebody from product in the room.

Then check what happens today when each one fails. The difference between the classification and the
current behavior is the work.

## Interview Questions

- Why is degradation reliability's highest-return technique?
- When to degrade silently and when to notify?
- What should not degrade, and why?

## Further Reading

- Nygard, Michael. *Release It!*. 2nd ed. Pragmatic Bookshelf, 2018.
- Beyer, Betsy et al. *Site Reliability Engineering*. O'Reilly, 2016 — chapter 22.
- Fowler, Susan. *Production-Ready Microservices*. O'Reilly, 2016.

---
id: consistency-vs-availability
title: Consistency vs. Availability
sidebar_position: 2
description: The choice only exists during a partition — and it is per operation, not per system.
doc_type: tradeoff
level: 5
difficulty: advanced
status: complete
objective: >
  By the end, the reader decides consistency or availability per operation, with the cost of
  each failure mode named by the business.
prerequisites: [cap]
related: [strong-vs-eventual-consistency, sync-vs-async, cost-vs-reliability]
canonical_for: []
translated_from_version: 2
last_reviewed: 2026-08-31
---

# Consistency vs. Availability

## Overview

The pair comes from the [CAP theorem](/06-distributed-systems/cap.md), and it is the most
cited and the most misapplied idea in distributed architecture.

Two corrections before any discussion:

```text
the choice only exists during a network partition
outside one, there is nothing to choose — you can have both
```

```text
the choice does not belong to the system
it belongs to each operation, and different operations of the same system
choose different sides
```

Systems described as "AP" or "CP" are almost always both, in different parts. An e-commerce
site accepts a sale with possibly stale stock — and refuses a debit with a possibly stale
balance.

```text
real axis   which error costs more in this operation: refusing what was valid,
            or accepting what was invalid?
```

## Problem

The usual formulation — "choose between consistency and availability" — leads to three
errors.

**Choosing per system.** A single mode applied to every operation produces either a system
that goes unavailable for reads that tolerated stale data, or a system that accepts financial
operations over uncertain state.

**Choosing without the cost of the error.** The decision requires a number that is rarely
gathered: how much each type of error costs the business.

```text
refusing a valid order          lost revenue, customer friction
accepting an invalid order      refund, fraud, manual adjustment, penalty
```

**Thinking the choice is permanent.** During the partition, one side is chosen. After it,
there is reconciliation to do — and the design of that reconciliation is part of the
decision, not a later detail.

## Core Concepts

### The choice is per operation

```text
operation                       typical choice   reason
browse the catalog              availability     stale data causes no harm
add to cart                     availability     reversible, cheap
check stock on the storefront   availability     approximation acceptable
reserve stock at purchase       depends          see below
debit a balance                 consistency      accepting invalid is expensive
change a credit limit           consistency      regulatory effect
record an audit event           availability     losing is worse than delaying
```

The "reserve stock" line is the interesting case: the answer depends on the product. For items
with high stock, accepting oversell and resolving later costs less than refusing sales. For a
unique item — a numbered ticket, a property — it does not.

### The cost of each error needs a number

```text
oversell of a high-stock item        cancel 3 orders per month, ~$80 of cost
refusing sales during a partition    ~$18,000 per peak hour
```

With those two numbers, the decision is arithmetic. Without them, it is opinion.

And gathering them is usually possible: the cost of refusing comes from revenue per hour; the
cost of accepting improperly comes from the history of refunds, adjustments and tickets.

### Degradation chosen, not suffered

A well-designed system does not simply go unavailable during a partition. It **degrades in a
decided way**:

```text
read          serves cached data, with an indication of age
write         accepts and queues, with later confirmation
critical
  operation   refuses explicitly, with a clear message
navigation    keeps working
```

The difference between chosen degradation and failure is that the first was designed, tested
and communicated. See [graceful degradation](/12-reliability/graceful-degradation.md).

### Reconciliation is part of the decision

Choosing availability during the partition means accepting divergence — and divergence must be
resolved later:

```text
who wins a conflict?           explicit rule, not implicit
who is notified?               customer, operations, both
what is reversible?            and at what cost
how much divergence time
  is tolerable?                defines the alarm
```

Without that design, "we chose availability" is choosing the problem without choosing the
solution. See
[conflict resolution](/06-distributed-systems/conflict-resolution.md).

### PACELC: the choice that exists every day

CAP describes behavior during a partition, which is rare. The rest of the time, there is
another trade-off, more frequent and more relevant day to day:

```text
partition     → consistency or availability
no partition  → latency or consistency
```

Keeping strong consistency between distant replicas costs latency on every operation, every
day. That is, in practice, the decision that most affects users.

See [PACELC](/06-distributed-systems/pacelc.md).

### Signs of the wrong choice

```text
chose availability and should not have
  recurring manual adjustments in operations
  refunds and cancellations above forecast
  divergences discovered by customers, not by monitoring
  reconciliation with no clear rule, resolved case by case

chose consistency and should not have
  unavailability in operations that tolerated stale data
  high latency in simple reads
  a dependency failure taking down unrelated functionality
  users complaining about slowness in lookups
```

### Cost of changing your mind

```text
availability → consistency   expensive: requires coordination where there was none
consistency → availability   expensive in another way: requires designing
                             reconciliation and communicating divergence
```

The asymmetry here is smaller than in other pairs, and what decides it is the data already
accumulated: a system that operated for months accepting divergence has inconsistent history
that a migration to strong consistency must handle.

This favors **starting consistent in the operations with the highest error cost**, and relaxing
later with evidence — the inverse is harder.

## Mental Model

**Which error costs more: refusing the valid or accepting the invalid?** The answer changes per
operation, and the choice only exists during the partition.

## When to Use

Prefer **consistency** when:

- Accepting an invalid operation has a financial, legal or trust cost.
- The resource is unique or scarce — a numbered ticket, a property, a slot.
- Reconciliation would be manual or impossible.
- There is a regulatory requirement about the state.

Prefer **availability** when:

- Stale data causes no harm — catalog, search, recommendation.
- The operation is reversible at low cost.
- Refusing costs more than fixing later, with numbers.
- The write can be accepted and confirmed later.

## When Not to Use

**As a global system choice.**

**Without the error-cost numbers** for both sides.

**Outside a partition** — there is no *that* trade-off, and citing CAP to justify weak consistency in
normal operation is a conceptual error.

**Without designing the reconciliation.**

**As an excuse not to handle divergence** — "we are eventually consistent" is not a design.

## Alternatives

- **Consistency per operation** — the correct arrangement in most cases.
- **Reservation with expiry** — lets you accept fast and confirm later, with a short window.
- **Risk ceiling** — accept divergence up to a cap and harden beyond it: oversell up to 2% of
  stock, refuse above that.
- **Asynchronous confirmation** — accept the operation and confirm by notification. See
  [synchronous vs. asynchronous](/20-trade-offs/sync-vs-async.md).

The third is underused and frequently the best: it captures most of the revenue of
availability with a fraction of the risk.

## Trade-offs

| Consistency | Availability |
|---|---|
| Prioritizes not accepting invalid | Prioritizes not refusing valid |
| Unavailable during partition | Divergence to reconcile |
| Higher latency | Lower |
| No reconciliation | Requires reconciliation design |

| Choice per system | Per operation |
|---|---|
| Simple to explain | Fitted to the real cost |
| Wrong in half the cases | More design |
| One failure mode | Several, each handled |

## Failure Modes

**Global choice.** Half the operations in the wrong mode.

**No numbers.** Decision by technical preference.

**Divergence without reconciliation.** Discovered by the customer.

**CAP cited outside a partition.** Justifies weak consistency for no reason.

**Degradation suffered.** The system fails instead of degrading by design.

**Case-by-case reconciliation.** Growing and invisible operational cost.

## Common Mistakes

**Classifying the system as AP or CP.**

**Not gathering the cost of refusing** — it is usually the missing number.

**Treating reconciliation as a future problem.**

**Not measuring divergence time.**

**Confusing a partition with a dependency being unavailable** — they are different failures,
with different answers.

## Real-World Example

A retail chain with physical and digital operations had stock as a recurring source of
incidents. The architecture used strong consistency: every stock reservation required
confirmation from the central service.

Measured over 12 months:

```text
unavailability of the stock service            41 h/year
sales lost during unavailability               ~$560,000
oversells                                      0
```

The initial proposal was to move to availability, with stock in a local cache. The team
resisted, out of fear of oversell.

The decision was made after gathering the other side of the ledger, by product category:

```text
category             items   average stock   oversell cost
commodities          82%     high            cancellation + coupon, ~$12/case
seasonal             14%     medium          same, with more friction
exclusive/unique      4%     1 to 3 units    impossible to cancel without damage
```

And the history showed that 91% of revenue came from the first two categories.

The design adopted was **per operation and per category**:

**Commodities and seasonal: availability.** Reservation against the local cache, with
continuous synchronization. Oversell accepted up to a ceiling of 2% of the unit's stock; above
that, the mode hardens automatically and starts requiring central confirmation.

**Exclusive and unique: consistency.** Reservation with mandatory central confirmation. During
a partition, the sale is refused with an explicit message — 4% of items, and the cost of
refusing is accepted.

**Reconciliation designed**, not improvised: a detected divergence produces an automatic
cancellation with a compensation coupon, notification to the customer within 30 minutes, and a
record for the store's operations. The rule for who wins a conflict is arrival order at the
central service.

**Divergence-time alarm.** Above 5 minutes without synchronizing, the mode hardens.

**Communicated degradation.** During a partition, the storefront indicates that stock
availability may be out of date.

Results after 14 months:

```text
sales lost to unavailability                   ~$36,000 (against $560,000)
oversells                                      312 cases
total oversell cost                            ~$4,800
oversells on exclusive items                   0
average time to cancellation and notice        11 minutes
```

The net balance was about $520,000 per year, with the risk concentrated where it is cheap.

What was recorded afterwards: the decision was stuck for two years because the discussion was
"consistency or availability", in the abstract, and nobody had the cost of refusing. As soon as
the two numbers landed in the same table, the decision took one meeting — and it was not one of
the two sides, it was the split by category, which nobody had proposed while the dilemma was
global.

## Related Concepts

- [CAP Theorem](/06-distributed-systems/cap.md) and
  [PACELC](/06-distributed-systems/pacelc.md).
- [Strong vs. Eventual Consistency](/20-trade-offs/strong-vs-eventual-consistency.md).
- [Conflict Resolution](/06-distributed-systems/conflict-resolution.md).
- [Graceful Degradation](/12-reliability/graceful-degradation.md).

## Practical Exercise

List five operations in your system and, for each, estimate the cost of refusing a valid
operation and that of accepting an invalid one.

The operations where the two numbers differ by an order of magnitude are the ones in the wrong
mode if they all use the same one.

## Interview Questions

- Why is the choice between consistency and availability per operation and not per system?
- Why is citing CAP outside a partition a conceptual error?
- What does PACELC add that CAP does not cover?

## Further Reading

- Brewer, Eric. *CAP Twelve Years Later: How the "Rules" Have Changed*. IEEE
  Computer, 2012.
- Abadi, Daniel. *Consistency Tradeoffs in Modern Distributed Database System Design*. 2012.
- Kleppmann, Martin. *Designing Data-Intensive Applications*. O'Reilly, 2017.

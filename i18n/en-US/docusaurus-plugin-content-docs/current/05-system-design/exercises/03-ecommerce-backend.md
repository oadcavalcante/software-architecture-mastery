---
id: 03-ecommerce-backend
title: "Exercise 03 — E-commerce Backend"
sidebar_position: 1
description: The system you will carry through the next four exercises — and the decisions you will pay for in them.
doc_type: exercise
level: 3
difficulty: intermediate
status: complete
objective: >
  By the end, the reader designs a complete backend under modest constraints and records the
  decisions the following exercises will test.
prerequisites: [system-decomposition]
related: [service-boundaries, apis, state-management, queues]
canonical_for: []
translated_from_version: 2
last_reviewed: 2026-08-31
---

# Exercise 03 — E-commerce Backend

:::info This exercise has a sequel

The system you design here reappears in exercises **04**, **05**, **06** and **07**, each time under
a new constraint. The decisions you make now are not disposable — you will live with them.

Record your decisions in writing. You will need them.

:::

## Context

**Ponta**, an online sporting goods store, currently sells through a marketplace and wants its own
channel.

```text
forecast first-year revenue            $18 million
orders/day, forecast                   ~1,200
expected peak (campaigns)              ~4,000/day
catalog                                22 thousand SKUs
team                                   6 engineers, one of them on
                                       call
deadline                               7 months to the first sale
infrastructure                         cloud, with no internal platform
```

There is no legacy. It is built from scratch.

## Requirements

For the **customer**: browse and search the catalog; build a cart; check out with a card or an instant
payment; track the order; request an exchange or a return.

For **operations**: receive paid orders for picking; deduct inventory; issue the tax invoice; ship and
report tracking.

For the **store**: register products and prices; apply promotions; track sales and stockouts.

## Constraints

```text
inventory          one distribution center; the available
                   quantity has to be correct at checkout
payment            one contracted acquirer, with a synchronous API
                   and contractual availability of 99.5%
tax                invoice issuance integrated with a third-party
                   service; mandatory before shipping
team               six people, one on-call rotation, with no operational
                   experience in distributed systems
deadline           seven months, with a commercial date
```

## Your Task

Produce, in up to 90 minutes:

1. The system's **deployable units** and the reason for each separation — if there is one.
2. The **data model** for order, item, inventory and payment.
3. The **checkout flow**, from cart to paid order, with the order of operations.
4. Where the **transaction** is, and what it covers.
5. The **three decisions** you consider hardest to reverse later.

Item 5 is what you will re-read in the next exercises.

## Questions You Should Be Asking

```text
does the inventory quantity have to be exact on the storefront, or only
  at checkout?
can the customer check out without the payment having been authorized?
what happens if the acquirer doesn't respond?
is the tax invoice issued before or after the payment is confirmed?
what happens if issuance fails?
is the promotion calculated in the cart or in the order?
can the order be cancelled after payment? by whom?
```

The second and third decide the entire architecture. If you didn't ask them, you probably answered the
third without noticing.

## Assessment Criteria

Your answer is good if:

- **The number of deployable units is small.** With 1,200 orders/day and six engineers with no
  platform, more than two or three is cost with no return. See
  [monolith vs. microservices](/20-trade-offs/monolith-vs-microservices.md).
- **The inventory reservation has strong consistency.** Selling what doesn't exist is the expensive
  error in this domain, and the volume allows a local transaction.
- **You declared what happens when the acquirer doesn't respond.** Not "it'll error out" — the state the
  order ends up in, and who resolves it.
- **The tax invoice is not on the synchronous path** of checkout. It is mandatory before shipping, not
  before confirming to the customer.
- **You named the three decisions that are hard to reverse**, and they really are hard — the data model,
  a service boundary, the format exposed to the customer — and not a library choice.

Your answer is weak if it has six services, a queue between every two of them, and no justification tied
to a number in the brief.

## Discussion

:::details Open after trying

**The proportionate answer** for 1,200 orders/day with six engineers is a modular monolith, with a
relational database, a local transaction, and at most one background process.

It is not the exciting answer. It is the one that fits in a seven-month deadline with a team that has no
platform — and it is what the brief describes.

**The decision that will hurt** is the checkout flow. The natural sequence, and the correct one for this
volume, is:

```text
one transaction:
  validate the cart
  reserve inventory
  create the order
  call the acquirer and wait
  confirm or undo everything
```

That is simple, correct, and has two properties that will show up later: your checkout's availability is
tied to the acquirer's 99.5%, and your throughput is tied to their response time.

**It is not an error.** With 4,000 orders a day at peak — about one every 20 seconds — those two
properties are irrelevant. The decision is correct now and has a shelf life.

Record that: you are trading future availability and throughput for present simplicity, and the trade is
worth it.

**The tax invoice off the synchronous path** is the decision most people get right by instinct and few
justify. It is mandatory before shipping, and shipping happens hours later. Putting it in checkout adds
an external dependency to the critical path, with no gain at all.

**What almost everybody gets wrong:** modeling the inventory reservation as a direct decrement of the
quantity. That works until the first payment that fails, and then the inventory has been consumed by an
order that doesn't exist. A reservation has to be an entity with a lifetime, not a subtraction.

**The three decisions hard to reverse**, for this design:

```text
1. the order and item model, which becomes history and isn't erased
2. the single transaction covering inventory, order and payment
3. the format exposed to the customer in the order query
```

The second is the one exercises 04, 05 and 06 will attack. Hold on to it.

:::

## Related Concepts

- [System Decomposition](/05-system-design/system-decomposition.md).
- [Service Boundaries](/05-system-design/service-boundaries.md).
- [State Management](/05-system-design/state-management.md).
- [Monolith vs. Microservices](/20-trade-offs/monolith-vs-microservices.md).

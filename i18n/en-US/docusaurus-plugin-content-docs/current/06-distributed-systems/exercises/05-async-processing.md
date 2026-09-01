---
id: 05-async-processing
title: "Exercise 05 — Introducing Asynchronous Processing"
sidebar_position: 2
description: Taking the external call out of the synchronous path is easy; what it leaves behind is product work.
doc_type: exercise
level: 4
difficulty: advanced
status: complete
objective: >
  By the end, the reader designs an asynchronous flow with the intermediate state and the product
  consequences made explicit.
prerequisites: [04-scaling-ecommerce]
related: [messaging, delivery-guarantees, idempotency, eventual-consistency]
canonical_for: []
translated_from_version: 2
last_reviewed: 2026-08-31
---

# Exercise 05 — Introducing Asynchronous Processing

:::info A continuation

This exercise carries out the first correction you identified in
[exercise 04](/06-distributed-systems/exercises/04-scaling-ecommerce.md): taking the call to the
acquirer out of the transaction.

:::

## Context

The decision is made: payment authorization leaves the synchronous checkout path.

The gain is known — checkout availability stops depending on the acquirer's 99.5%, the p95 goes back
to the hundreds-of-milliseconds range, and connections stop getting stuck.

What nobody has sized yet is the cost.

## Requirements

The customer completes the purchase and gets an immediate response. The authorization happens
afterwards. And:

```text
the customer has to know what happened to their order
a declined order has to release the reserved inventory
operations cannot pick an unauthorized order
the customer cannot be charged twice if they repeat the purchase
the order cannot sit in an intermediate state indefinitely
```

## Constraints

```text
acquirer          a synchronous API, with no guaranteed idempotency;
                  responds between 400 ms and 3 s, with a timeout
                  in ~0.2% of calls
inventory
  reservation     expires in 30 minutes, from exercise 03
mobile app        versions up to 14 months old in the field; the current
                  confirmation screen shows "order confirmed"
                  immediately
customer service  a team of 40 people, with no training on the
                  new flow
volume            ~140 orders/s at peak
```

## Your Task

Produce, in up to 90 minutes:

1. The **new flow**, step by step, from the cart to the authorized order.
2. The order's **states**, and the transitions allowed between them.
3. What the customer **sees** in each state, and when they are notified.
4. What happens to the **inventory reservation** in each outcome.
5. The list of work **outside engineering** that this change generates.

Item 5 tends to be forgotten and is half the cost.

## Questions You Should Be Asking

```text
what does "order confirmed" on the current screen mean, now?
how long will the customer tolerate waiting for the real confirmation?
what happens if they close the app before then?
if the authorization takes 4 hours, what do they see?
the reservation expires in 30 minutes — and if authorization takes 40?
can the customer try again? what prevents the double charge?
what kind of new ticket will customer service get?
```

The first is the one most people don't ask, and it is a change to the contract with the customer.

## Assessment Criteria

Your answer is good if:

- **Writing the order and emitting the event are in the same transaction.** If they can diverge, you
  have created orders with no authorization and authorizations with no order.
- **The idempotency key belongs to the customer, and the request identifier for the acquirer is a
  different one.** Confusing them prevents the legitimate retry. See
  [idempotency](/06-distributed-systems/idempotency.md).
- **The inventory reservation has a longer lifetime than the maximum authorization time**, or you
  designed what happens when it expires first.
- **You listed the product work**: a tracking screen, new copy, a notification, a customer service
  procedure, and what to tell the customer whose order was declined after they saw "confirmed".
- **There is a maximum lifetime for the intermediate state**, with what happens when it expires.

Your answer is weak if it describes a queue and a consumer and ends there.

## Discussion

:::details Open after trying

**The technical part is the smaller one.** The flow is well known:

```text
1. validate the cart and reserve inventory
2. write the order as "authorizing" and enqueue the event,
   in the same transaction
3. respond to the customer with the order number
4. the consumer authorizes with the acquirer
5a. authorized    → order "confirmed", customer notified
5b. declined      → order "declined", reservation released,
                    customer notified with the reason
5c. no response   → order "under verification" — see exercise 06
```

Step 2 is what prevents an order with no event and an event with no order. Without it, the queue and
the database diverge under failure.

**Step 5c is where exercise 06 begins.** If you resolved it here by assuming a decline, read again:
0.2% of 48 thousand orders a day is 96 daily cases in which you don't know whether you charged.

**The part that costs is the product part:**

```text
screen               "order confirmed" becomes "order received",
                     with a visible state and a declared timeframe
notification         the channel, the copy, and what to do if the customer
                     doesn't open it
late decline         the customer saw "received" and now gets
                     "declined"; what is the copy, and what do they do
customer service     a new ticket category, with a procedure
                     and training for 40 people
old app versions     14-month-old versions show "confirmed";
                     they stay in the field and you don't control
                     the update
```

The last line is the most uncomfortable and the most common in mobile products: part of your base will
see a message that has stopped being true, and you cannot fix it. The ways out are to degrade the
behavior for old versions — keeping them in the synchronous flow, for instance — or to force an update,
which has a cost of its own.

**The 30-minute reservation** against an authorization that rarely exceeds 3 seconds looks comfortable,
and it isn't: when the acquirer degrades, the queue backs up, and authorization can take hours. In that
scenario, the reservation expires first, and the order is authorized against inventory that has already
been sold to somebody else.

The fix: either the reservation is extended while the order is authorizing, or the authorization checks
the reservation before confirming. The second is simpler and creates a new outcome — "authorized, no
inventory" — which needs handling and a refund.

**What almost everybody gets wrong:** treating the intermediate state's deadline as a detail. An order
that has been "authorizing" for three days is a customer with money possibly held and no information.
The deadline has to exist, be short, and have an action when it expires.

:::

## Related Concepts

- [Exercise 04](/06-distributed-systems/exercises/04-scaling-ecommerce.md) and [Exercise 06](/06-distributed-systems/exercises/06-partial-failure.md).
- [Messaging](/06-distributed-systems/messaging.md) and [Delivery Guarantees](/06-distributed-systems/delivery-guarantees.md).
- [Idempotency](/06-distributed-systems/idempotency.md).
- [Synchronous vs. Asynchronous](/20-trade-offs/sync-vs-async.md).

---
id: 06-partial-failure
title: "Exercise 06 — Handling Partial Failures"
sidebar_position: 3
description: Ninety-six times a day the system doesn't know whether it charged — and assuming an answer is how duplicate charges get created.
doc_type: exercise
level: 4
difficulty: advanced
status: complete
objective: >
  By the end, the reader treats "we don't know" as an explicit state and designs the reconciliation
  that resolves it.
prerequisites: [05-async-processing]
related: [partial-failure, idempotency, retries, duplicate-messages]
canonical_for: []
translated_from_version: 2
last_reviewed: 2026-08-31
---

# Exercise 06 — Handling Partial Failures

:::info A continuation

This exercise resolves the `5c` case left open in
[exercise 05](/06-distributed-systems/exercises/05-async-processing.md): the authorization is sent and
no response arrives.

:::

## Context

The asynchronous flow has been in production for three months. It resolved the latency, the
propagation of unavailability and the connection exhaustion.

And it produced a problem that did not exist before, or that existed and was invisible:

```text
calls to the acquirer/day                      ~48,000
with no conclusive response (timed out)         ~96/day (0.2%)
duplicate charges reported by customers        ~340/month
manual refunds made by finance                 ~410/month
average finance time per case                  22 minutes
```

The cause is known internally: when the timeout expires with no response, the system marks the order
as declined and releases the reservation. If the acquirer has processed the charge — and there is no
way to know — the customer was charged for an order that doesn't exist. And if they repeat the
purchase, they are charged again.

## Requirements

```text
no customer can be charged for an order that doesn't exist
no customer can be charged twice for the same purchase
intent
every ambiguous case has to be resolved within 30 minutes
the resolution cannot depend on human intervention in the
common case
```

## Constraints

```text
acquirer            three of the five endpoints support a query
                    by request identifier; the authorization
                    one does
                    the query has a limit of 20 calls/s
retry               the acquirer does not guarantee idempotency;
                    resending the same request may charge again
daily file          the acquirer sends a reconciliation file
                    at 4am, with all of the previous day's transactions
inventory reservation  30 minutes, from exercise 03
regulatory          an improper charge has a refund deadline and
                    mandatory reporting
```

## Your Task

Produce, in up to 90 minutes:

1. The order's **new state**, and why it cannot be "declined".
2. The **resolution mechanism**, from the moment the timeout expires to the outcome.
3. What prevents the **double charge** when the customer tries again.
4. What happens in the cases the automatic mechanism does **not** resolve.
5. How you **measure** whether the mechanism is working.

## Questions You Should Be Asking

```text
when the timeout expires, what actually happened on the other side?
is there a way to ask the acquirer what happened?
if I resend, what prevents the second charge?
what does the customer see while it is ambiguous?
which is the worse outcome: declining a valid purchase, or charging
  an invalid one?
how many cases a day does the 4am file resolve, and how many
  have to be resolved before that?
```

The fifth is the architectural question. The others derive from it.

## Assessment Criteria

Your answer is good if:

- **There is an explicit state for "we don't know".** Neither confirmed nor declined. Assuming either
  one is how the 340 monthly duplicates appear.
- **The resolution is by query, not by retry.** The acquirer supports a query by identifier; asking is
  safe, resending is not.
- **Idempotency has two layers.** The customer's key prevents their repeat from becoming a second
  purchase intent; the request identifier allows querying and resending safely.
- **The 4am file is a safety net, not the main mechanism.** A 30-minute requirement against a file that
  arrives the next day do not add up.
- **You measured.** Open ambiguous cases, age of the oldest, automatic resolution rate.

Your answer is weak if it resolves by retrying with no idempotency guarantee on the other side — that
trades one duplicate for another.

## Discussion

:::details Open after trying

**The state is called ambiguous**, and it is the whole answer to the exercise.

Marking it as declined is a claim the system has no basis to make. Marking it as confirmed is worse.
The only true statement is "we sent it and we don't know", and it has to exist in the model — because
everything that comes afterwards depends on the platform admitting that it doesn't know.

**The mechanism:**

```text
1. timeout expired → the order goes to "ambiguous", with the
   request identifier recorded
2. a reconciler queries the acquirer for that
   identifier, with exponential backoff
3. response "authorized"   → order confirmed
   response "doesn't exist" → order declined, reservation released
   no response in 30 min    → human escalation
4. the 4am file reconciles what is left over and detects
   divergence between what we recorded and what the acquirer
   recorded
```

The limit of 20 queries per second is comfortable for 96 daily cases — but not for an episode of
acquirer degradation, in which the ambiguous cases can pass a thousand in one hour. The reconciler
needs a queue with a rate limit, or it worsens the degradation that produced it.

**The double charge** is prevented by the customer's idempotency key: the second attempt with the same
key returns the first one's result, "ambiguous" included. The customer sees "we're verifying", not a
new charge.

That is the part most people get wrong when designing: allowing the customer to retry while the state
is ambiguous. See
[idempotency](/06-distributed-systems/idempotency.md).

**What the customer sees** matters as much as the mechanism. "We're confirming your payment, this takes
up to 30 minutes" is honest and tolerable. Silence produces resending, and resending is how the
duplicates appear even with the correct mechanism.

**Question 5 — which outcome is worse** — decides the behavior in the cases the automatic path doesn't
resolve. In this domain, charging improperly is worse than declining: the decline costs a sale, the
charge costs a regulatory complaint and the trust. So the human escalation fails toward cancelling and
refunding.

In a different domain — a flight seat reservation with departure in two hours — the answer may be the
opposite.

**The measurement that matters:**

```text
open ambiguous cases, and the age of the oldest
automatic resolution rate (target: > 99%)
duplicates detected — should be zero
divergences in the 4am file
```

The first is the alarm: an ambiguous case older than 30 minutes is money in an unknown state, and it is
an incident, not a metric.

**The unforeseen effect**, which shows up in real systems: introducing the ambiguous state makes the
problem **measurable** for the first time. Before, the 96 daily cases became declines and blended in
with the legitimate ones. Afterwards, they are a category with a number — and that number becomes the
argument for renegotiating the contract with the acquirer.

:::

## Related Concepts

- [Exercise 05](/06-distributed-systems/exercises/05-async-processing.md) and [Exercise 07](/12-reliability/exercises/07-multi-region.md).
- [Partial Failure](/06-distributed-systems/partial-failure.md) and [Idempotency](/06-distributed-systems/idempotency.md).
- [Retries](/06-distributed-systems/retries.md).
- [Case Study: Payments Platform](/21-case-studies/payments.md).

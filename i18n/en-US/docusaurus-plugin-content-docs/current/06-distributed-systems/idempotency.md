---
id: idempotency
title: Idempotency
sidebar_position: 8
description: Executing once or many times has the same effect — the property that makes retrying safe.
doc_type: concept
level: 4
difficulty: advanced
status: complete
objective: >
  By the end, the reader designs idempotent operations with an explicit key and
  recognizes that natural idempotency is rarely sufficient.
prerequisites: [partial-failure]
related: [retries, timeouts, duplicate-messages]
canonical_for: []
translated_from_version: 1
last_reviewed: 2026-08-31
---

# Idempotency

## Overview

An operation is idempotent when executing it once or many times produces the same effect.

It is the property that makes [retrying](/06-distributed-systems/retries.md) safe — and since
retrying is inevitable in distributed systems, idempotency is not an optimization: it is a
requirement.

It is the central concept of this level. Practically every mechanism in the following documents
presupposes that the downstream operations are idempotent.

## Problem

The [third outcome](/06-distributed-systems/distributed-fundamentals.md) of a network call is "I
don't know". When the timeout fires, the operation may or may not have happened.

Faced with that there are two options, and both are bad without idempotency:

**Retry.** If the operation happened, the effect duplicates. One charge becomes two.

**Do not retry.** If it did not happen, the effect is lost. A paid order goes unprocessed.

Idempotency dissolves the dilemma: if retrying is safe, always retry.

Note the asymmetry. Without idempotency, you have to **guess** what happened on the other side.
With it, you do not need to know.

## Core Concepts

### Idempotent is not the same as side-effect free

A read has no effect and is trivially idempotent. The interesting case is a **write** that can
be repeated.

```text
balance = 100               ← idempotent: the result is the same
balance = balance - 50      ← it is not: retrying debits again
```

The first form is idempotent by nature. The second is not, and it is how most business
operations are expressed.

### Natural idempotency is rare and fragile

Some operations are naturally idempotent: setting an absolute value, marking as cancelled,
inserting with a unique key.

The problem is that it **breaks over time**. A "cancel order" operation is idempotent until
somebody adds "record the cancellation reason with a date" — and then the second execution
overwrites the original date.

Relying on natural idempotency is relying on nobody adding a side effect. Somebody will.

### The idempotency key

The technique that works: the client generates a unique identifier per **logical attempt** and
sends it with the request. The server records the key alongside the result.

```text
1st call:  key abc-123 → not seen → processes, records the result
2nd call:  key abc-123 → seen     → returns the recorded result
```

Three details decide whether it works:

**The key belongs to the client, not the server.** If the server generated it, every retry would
have a new one. The key identifies the intent, and the intent is the client's.

**The key and the result are recorded in the same transaction as the effect.** If they are
separate, there is a window in which the effect happened and the key was not recorded — and the
retry duplicates.

**The key has an expiry.** Keeping them indefinitely is a leak. The expiry has to be longer than
the realistic retry window — typically hours or days.

### What to do when the key repeats with different content

An edge case that usually goes unhandled: the same key arrives with a different body.

That indicates a client error — it reused the key for another operation. The correct answer is to
reject it with an explicit error, not to process it or return the old result. Returning the old
one hides a client bug.

### Idempotency of the result, not only of the effect

A common incomplete implementation: the second call does not duplicate the effect, but returns an
"already processed" error.

That forces the client to handle two cases and it frequently handles them badly. The correct
behavior is **to return the same result as the first call**, as if it had just happened.

## Mental Model

**If I execute this twice, does the world end up the same?** If the answer depends on luck with
the time between executions, it is not idempotent.

## When to Use

- Any operation that can be repeated — which includes every network call.
- [Queue](/05-system-design/queues.md) consumers, without exception.
- API endpoints that change state.
- Steps of a [saga](/06-distributed-systems/sagas.md) or of a resumable process.
- Batch processing that can be re-executed.

## When Not to Use

**There is no case in which idempotency is undesirable.** What exists is the cost of implementing
it, and it does not always pay off:

**Operations with no side effect.** They are already idempotent.

**When the duplicated effect is harmless and cheap.** Writing a log line twice. It is worth
recognizing that explicitly, not assuming it.

**When the volume of keys would be prohibitive.** Millions of operations per second with a
persisted key have a real cost — there the strategy changes to windowed deduplication.

The error is deciding "we don't need it here" without checking whether the duplicated effect is
actually harmless.

## Alternatives

- **Windowed deduplication** — keeping recent keys in a cache instead of persisting them. Cheaper
  and with a weaker guarantee.
- **Duplicate detection in the consumer** — checking whether the effect already exists before
  applying it. It works when there is a natural identifier.
- **Making the operation absolute** — reformulating "add 50" to "set to 150". Not always possible
  and the cleanest solution when it is.
- **Distributed transaction** — expensive, and it avoids the problem instead of handling it. See
  [distributed transactions](/06-distributed-systems/distributed-transactions.md).

## Trade-offs

| With an idempotency key | Without |
|---|---|
| Retrying is always safe | You have to guess what happened |
| A duplicated effect is impossible | It is possible |
| Key storage to maintain | Nothing to maintain |
| One extra write per operation | No |
| The client has to generate and reuse the key | Nothing from the client |

## Failure Modes

**The key recorded outside the effect's transaction.** A window in which it duplicates.

**A key generated per retry.** Each attempt with a new key; no idempotency at all.

**A key with no expiry.** A leak in storage.

**The second call returning an error instead of the result.** The client handles it badly.

**Natural idempotency that broke.** A side effect was added and nobody re-evaluated.

**A key per HTTP request instead of per intent.** If the client generates a new key on each
network attempt, there is no deduplication.

## Common Mistakes

**Assuming natural idempotency.**

**The server generating the key.**

**Recording the key and the effect separately.**

**Not handling a repeated key with a different body.**

**Not testing the duplication path.** It is the path that only happens under failure, and
therefore the least exercised.

## Real-World Example

An account transfer system had a `POST /transfers` endpoint with no idempotency.

The mobile client retried automatically after a 15-second timeout. During a network degradation,
89 transfers were executed twice in a single day.

The reversal required manual reconciliation and communication with each affected customer.

The fix introduced an idempotency key, and three details only appeared during implementation.

**The key had to belong to the intent, not the request.** The first version generated the key in
the HTTP interceptor, which recreated it on every attempt. Idempotency existed on paper and did
not work. The key came to be generated when the user confirms the transfer on the screen, and
reused by all attempts of that confirmation.

**The recording had to be atomic with the effect.** The first version recorded the key after
transferring, in another transaction. A fault-injection test showed the window: killing the
process between the two produced duplication. It became a single transaction.

**The second call had to return the result, not an error.** The initial version returned `409
Conflict`. The client treated it as a failure and showed the user an error — for a transfer that
had completed successfully. It came to return `200` with the original result.

All three details are in the documentation of any mature payment provider. What was missing was
not knowledge — it was treating idempotency as a requirement from the start, instead of a fix
after the incident.

## Related Concepts

- [Partial Failure](/06-distributed-systems/partial-failure.md) — the problem it solves.
- [Retries](/06-distributed-systems/retries.md) — what it makes safe.
- [Duplicate Messages](/06-distributed-systems/duplicate-messages.md) — the case in queues.
- [Delivery Guarantees](/06-distributed-systems/delivery-guarantees.md) — why at-least-once is the
  default.

## Practical Exercise

List your system's endpoints that change state. For each one, answer: what happens if it is
called twice with the same body?

Then check whether any client retries automatically. The combination of "it duplicates" with "it
retries" is an incident waiting for latency.

## Interview Questions

- Why is idempotency a requirement and not an optimization in distributed systems?
- Why should the key be generated by the client?
- What should the second call return, and why?

## Further Reading

- Helland, Pat. *Idempotence Is Not a Medical Condition*. ACM Queue, 2012.
- Kleppmann, Martin. *Designing Data-Intensive Applications*. O'Reilly, 2017.
- Idempotency key documentation from payment providers — Stripe's is the most cited reference.

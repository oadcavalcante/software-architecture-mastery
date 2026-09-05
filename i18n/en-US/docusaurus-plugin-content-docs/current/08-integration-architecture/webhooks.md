---
id: webhooks
title: Webhooks
sidebar_position: 6
description: Notifying instead of being polled — and why the other end is a server you do not control.
doc_type: pattern
level: 5
difficulty: intermediate
status: complete
objective: >
  By the end, the reader designs webhooks with the guarantees the receiver needs,
  and consumes other people's webhooks without trusting what arrives.
prerequisites: [integration-architecture]
related: [messaging-integration, event-driven-integration, integration-contracts]
canonical_for: []
translated_from_version: 2
last_reviewed: 2026-08-31
---

# Webhooks

## Overview

A webhook is an HTTP call **you make to someone else's server** when something happens.

It is the dominant form of asynchronous integration between organizations, because it does not require the
partner to consume your message broker or adopt your technology — they only need to expose a URL.

The difference that organizes everything: the destination is a server you do not control, with an
availability you do not know and a correctness you cannot assume.

## Problem

Without a webhook, whoever needs to know about a change polls periodically.

Polling is inefficient on both sides: most polls bring nothing new, and the latency is half the interval. A
partner polling every minute generates 1,440 requests a day for maybe three events.

A webhook inverts that: the publisher tells you when there is something to tell.

And, in inverting it, it transfers to the publisher a problem polling did not have — **delivering** to an
endpoint that may be down, slow, or answering incorrectly.

## Core Concepts

### On the sending side

**Retry with growing waits.** The destination will be down. Without repetition, the event is lost. See
[backoff](/06-distributed-systems/backoff.md).

**A short, aggressive deadline.** The receiver needs to answer fast; if it takes 30 seconds, your delivery
queue jams. Five to ten seconds is the usual, and it needs to be in the contract.

**A signature.** The receiver needs to prove the request came from you. A header with a signature over the
body, using a shared secret, is the standard. Without it, anyone can forge events.

**A timestamp in the signature.** It lets the receiver reject an old request — the timestamp alone
prevents nothing; what prevents is the check on the other side.

**A unique event identifier.** It lets the receiver deduplicate — which they will need to do, because your
retry will duplicate.

**Deactivation after persistent failures.** An endpoint dead for weeks should not consume your capacity
indefinitely. And the deactivation needs to be communicated, or the partner finds out by the absence.

**A redelivery panel.** The partner needs to be able to reprocess what they missed.

### On the receiving side

**Answer fast, process later.** Accept, enqueue, return `200`. Processing synchronously inside the webhook
is the most common cause of timeouts and redelivery.

**Verify the signature before anything else** — and, along with it, the timestamp: reject anything
outside a tolerance window, on the order of minutes. Without that check, a captured request stays valid
forever, and the signature only attests that it was legitimate once. Inside the window, what blocks the
repeat is the unique event identifier.

**Be idempotent.** It will arrive duplicated. See [idempotency](/06-distributed-systems/idempotency.md).

**Do not trust the order.** Retries shuffle it. A cancellation event can arrive before the creation one.

**Do not trust the content.** Several providers recommend using the webhook only as a trigger and querying
the API for the real state — which eliminates the ordering and stale-content problems in one move.

**Return an error when you fail.** Answering `200` for what you did not process makes the provider consider
it delivered: the event leaves the delivery queue and only comes back if there is a redelivery panel — and
even then it depends on you noticing that you lost it.

### Notification or state

The same trade-off as [integration events](/08-integration-architecture/event-driven-integration.md), with
an extra weight: the webhook's body travels outside your organization.

A fat webhook with sensitive data replicates it into the partner's environment. A thin webhook — an
identifier and a type — keeps the data at the source, under access control.

For regulated data, thin is usually the only defensible option.

### The receiver's URL is a security risk

Letting a user register an arbitrary URL your server will make requests to is, literally, asking your
server to reach an address chosen by a third party.

With no restriction, that allows reaching internal addresses on your network — cloud metadata services,
databases, admin panels.

The defenses: refuse private and local addresses, resolve the name and validate the resolved IP, do not
follow redirects, and send from an isolated network.

This is the security problem characteristic of webhooks and the one most frequently forgotten.

## Mental Model

**A webhook is a delivery, not a publication.** You are responsible for it arriving, at a destination that
is not yours.

## When to Use

- Notifying systems outside your organization.
- The partner will not consume your message broker.
- Periodic polling is inefficient for the event volume.
- The receiver needs to react with low latency.
- Integration with platforms that already expect this model.

## When Not to Use

**Internally, when messaging already exists.** See
[messaging integration](/08-integration-architecture/messaging-integration.md) — there the broker solves
delivery, ordering and reprocessing better.

**When the volume is very high.** Thousands of events per second per partner do not fit in individual
requests; see [batch integration](/08-integration-architecture/batch-integration.md).

**With no signature.** A forgeable endpoint.

**With no retry.** Events are lost at the first instability.

**With no validation of the destination URL.** A risk of internal network access.

**When the receiver needs to answer with data.** A webhook is a notification, not a query.

## Alternatives

- **Periodic polling** — simple, with no delivery to guarantee, and frequently sufficient. Do not discard
  it early.
- **A subscription event stream** — the partner consumes an endpoint that keeps the connection open, with a
  position they control. It eliminates the delivery problem.
- **Shared [messaging](/08-integration-architecture/messaging-integration.md)** — when there is trust and a
  common technology.
- **A periodic file** — see [file integration](/08-integration-architecture/file-integration.md).

The second option deserves consideration: letting the consumer pull at their own pace, with a position they
control, removes retry, deactivation and redelivery from your side.

## Trade-offs

| Webhook | Periodic polling |
|---|---|
| Low latency | Half the interval |
| Requests only when there is an event | Many empty ones |
| You guarantee the delivery | The consumer fetches |
| The receiver needs a public endpoint | Not needed |
| Retry and redelivery to operate | Nothing |
| A risk of internal network access | None |

## Failure Modes

**A slow receiver jamming the delivery queue.**

**`200` without processing.** An event silently lost.

**A duplicate processed.**

**Inverted order.** A cancellation before the creation.

**An endpoint deactivated with no warning.** The partner stops receiving and does not know.

**An unverified signature.** Forged events accepted.

**A URL pointing at the internal network.**

**Synchronous processing inside the webhook.** Timeout, redelivery, and the effect happens twice.

## Common Mistakes

**Processing synchronously inside the webhook.** The sender has a short deadline and treats anything past
it as a failure — so it resends, and the slow work runs again while the first is still running. Receiving,
persisting and answering fast solves it.

**Not verifying the signature.** The endpoint is public by nature; without verifying the signature, anyone
can declare that a payment was approved.

**Not validating the destination URL.** Whoever emits webhooks to user-supplied URLs becomes an HTTP client
that reaches internal addresses — the classic route to server-side request forgery.

**Not deduplicating.** Redelivery is normal behavior, not exceptional. With no idempotency key, each resend
repeats the effect.

**Assuming order.** Parallel deliveries and retries make the cancellation event arrive before the creation
one. Processing needs to tolerate that, typically through a version stamp.

**Not offering redelivery to the partner.** When the consumer goes unavailable, with no way to ask for the
lost events the only way out is manual reconciliation — on both sides.

## Real-World Example

A payments platform notified merchants by webhook on every transaction status change.

Five problems across two years, three on the provider's side and two on the receivers':

**A slow receiver.** A merchant with an endpoint that took 25 seconds occupied delivery workers. That
delayed deliveries for **all** merchants by up to 8 minutes at a peak. Fixed with an 8-second deadline,
per-merchant isolation and a separate queue for slow endpoints.

**Inverted order.** Retries made `payment.approved` arrive after `payment.refunded`. Merchants marked
orders as paid after the refund. Fixed by documenting that ordering is not guaranteed, including the event
instant in the body, and recommending an API query for the current state.

**An endpoint deactivated in silence.** After 7 days of failures, the platform deactivated it. One merchant
went 3 weeks without receiving anything and without knowing — they found out when reconciling. An email on
the first day of failure, an alert in the panel and deactivation only after 14 days came to exist.

**An ignored signature.** An audit revealed that around 30% of merchants did not verify the signature. The
platform started requiring verification for new credentials, and offering ready-made libraries — the reason
for not verifying was almost always "it was a hassle".

**Internal network access.** A security researcher registered a URL pointing at the cloud metadata service
and received, in the response body the platform logged, temporary credentials for the instance. Fixed with
a block list of private ranges, validation of the resolved IP, a prohibition on redirects and sending from
an isolated network.

The last one was classified as the most serious incident in the platform's history, and the team records
that it had been known in the security literature for years — what was missing was somebody asking "where
exactly is our server making requests to?".

## Related Concepts

- [Messaging Integration](/08-integration-architecture/messaging-integration.md) — the internal
  alternative.
- [Event-Driven Integration](/08-integration-architecture/event-driven-integration.md).
- [Idempotency](/06-distributed-systems/idempotency.md).
- [Backoff](/06-distributed-systems/backoff.md) — the wait between attempts.

## Practical Exercise

If you send webhooks: what happens today if somebody registers `http://169.254.169.254/` as a destination?

If you receive them: does the processing happen inside the request, or do you enqueue? And what does your
code do if the same event arrives twice?

## Interview Questions

- Why is answering `200` without processing dangerous?
- What security risk does an arbitrary destination URL create?
- Why does a slow receiver affect other receivers?

## Further Reading

- Stripe's webhook documentation — a practical reference for the pattern.
- OWASP. *Server Side Request Forgery Prevention Cheat Sheet*.
- Hohpe, Gregor; Woolf, Bobby. *Enterprise Integration Patterns*, 2003.

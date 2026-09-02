---
id: messaging-platform
title: "Case: Messaging Platform"
sidebar_position: 7
description: Instant messaging for 31 million users, where delivering exactly once is impossible and the product requires it to look like it isn't.
doc_type: case-study
level: 0
difficulty: advanced
status: complete
objective: >
  By the end, the reader designs ordered delivery with no perceived duplicates over a
  transport that guarantees neither, with connection state at scale.
prerequisites: [trade-offs]
related: [social-network, video-streaming, ride-sharing]
canonical_for: []
translated_from_version: 3
last_reviewed: 2026-08-31
---

# Case: Messaging Platform

:::note How to use this case

Read the context, requirements and constraints. **Stop before the architecture options** and
sketch your own in twenty minutes.

This case's numbers are **illustrative** (SPEC.md §8.2): plausible and internally
consistent, not measured in a named system. What is learned is the reasoning they
support, not the magnitudes.

:::

## Business Context

**Falai** is an instant messaging platform used by 31 million people, focused on communication
between businesses and customers: support, notifications and sales. About 40% of the volume is
person to person, and 60% involves a business account on one side.

The product has a requirement that sets it apart from almost every other in this set: **the
perception of real time is the product**. A message that takes 4 seconds to appear is not a late
message — it is a broken product, and the user sends it again.

Two pressures motivate revisiting the architecture:

**Duplicates and out-of-order messages.** The platform records about 0.4% of messages displayed
in duplicate and 0.9% displayed out of order in active conversations. Both generate complaints,
and the second is worse: a reply appearing before the question changes the meaning of the
conversation.

**Connection cost.** Maintaining 4.2 million simultaneous persistent connections consumes $5.2
million a year, and most of them are idle most of the time.

## Functional Requirements

For the **user**: send and receive text, image, audio and document messages; see the state of
each sent message — sent, delivered, read; take part in group conversations of up to 2,000
members; search the history; and receive a notification when the app is closed.

For the **business account**: receive messages through an API; reply via a human agent or
automation; distribute conversations among agents; and keep a complete history per customer.

For the **platform**: deliver each message exactly once from the user's point of view; preserve
order within a conversation; and synchronize state across a user's multiple devices.

The "exactly once" delivery requirement is literally impossible to guarantee in a distributed
system with network failure. What can be guaranteed is **at least once** delivery with
deduplication at the destination — and it is that distinction that decides the design.

It is worth making explicit why it is impossible, because the phrasing shows up in product
requirements all the time. If the sender sends and gets no acknowledgment, they don't know
whether the message arrived. Resending risks duplicating; not resending risks losing. There is no
protocol that resolves that — the information that would decide it simply doesn't exist on the
sender's side. What you do is choose the tolerable error (duplicating) and eliminate it at the
destination, where the information does exist.

Writing the requirement as "the user never sees a duplicated or out-of-order message" rather than
"exactly once delivery" is the difference between a satisfiable requirement and a promise no
system keeps.

## Non-Functional Requirements

```text
p95 of delivery, both online              < 400 ms
p99 of delivery, both online              < 900 ms
duplicates perceived by the user          < 0.001%
out-of-order messages                     0 within a conversation
availability of sending                   99.99%
message loss                              0 — an accepted message
                                          has to be delivered
message retention                         indefinite on the device,
                                          90 days on the server
cross-device synchronization              < 2 s
cost per active user                      35% reduction
```

Combining "zero loss" with "zero out of order" and 400 ms latency is what makes this system hard.
Each one in isolation is simple; the three together require order to be established at one point
and the transport to be able to retry without breaking the sequence.

## Constraints

```text
devices            mobile apps with intermittent connectivity;
                   a user can be offline for days and need
                   to receive everything on returning
multiple           a user has on average 1.8 active devices,
  devices          and all of them have to see the same state
groups             up to 2,000 members; a large, active group
                   is a distribution problem
notification       depends on third-party services (Apple and Google),
                   with latency and reliability outside our control
regulatory         message content is sensitive data; retention
                   and access strictly controlled
team               74 engineers; 16 in the messaging domain
cost               the -35% target comes from leadership
```

The multiple-devices constraint is the most underestimated. It turns "deliver a message to a
user" into "deliver to N devices, each with its own synchronization state", and it is the origin
of most of the system's real complexity.

And it interacts badly with the intermittent connectivity constraint. A user with a phone and a
desktop may have the desktop switched off for a week; on turning it on, they have to receive
everything that happened, in order, without duplicating what was already read on the phone. That
means read state is per device, but the "read" state the sender sees is per user — two concepts
the interface presents as one.

A large share of the product's historical defects came from treating those two states as the same
thing: a message marked read on the phone disappeared from the desktop's unread list before it
had been delivered to it.

## Capacity Estimates

```text
daily active users                 18.4 million
messages/day                       2.9 billion
messages/s, average                ~33,500
peak (noon-1pm and 7-9pm)          ~112,000/s
with margin (2×)                   ~225,000/s

simultaneous connections, average  ~2.8 million
simultaneous connections, peak     ~4.2 million
messages per connection/min, median ~0.3
```

The last number is what sustains the critique of the current model: the median connection carries
one message every three minutes. The platform pays for 4.2 million open connections to move a
volume that, on average per connection, is negligible.

```text
fanout distribution
  one-to-one conversation          1 recipient
  median group                     18 members
  large group (p99.9)              ~800 members
  maximum group                    2,000 members

deliveries/s at peak (messages × recipients)    ~1.4 million/s
```

One million four hundred thousand deliveries per second is the number that sizes the system —
and it is 40× larger than the number of messages, because of groups.

```text
storage
  messages on the server, 90 days   ~260 billion  →  ~31 TB
  conversation and state metadata   ~3 TB
  pending delivery queue            variable; ~400 GB in steady state
```

## Architecture Options

The decision axis is **where order is established and how delivery is acknowledged**.

### Option A — Order on the client, by timestamp

Each message carries the sending device's clock time; the recipient orders by that value.

```text
simplicity        high
order             not guaranteed — device clocks diverge,
                  and the observed divergence reaches minutes
deduplication     by an identifier generated on the client
cost              minimal
```

It is the current architecture, and it is the origin of the 0.9% out-of-order messages.

### Option B — Order on the server, by conversation sequence

Each conversation has a counter; the server assigns a sequence number to each message at the
moment it accepts it. The client orders by that number and detects gaps.

```text
order             guaranteed within the conversation
deduplication     trivial — a duplicate number is discarded
loss detection    the client sees the gap and requests what is missing
contention        a conversation's counter is a serialization point
cost              moderate
```

### Option C — Log partitioned by conversation

Each conversation is a partition of an ordered log; delivery is the client reading that log,
keeping its own offset.

```text
order             guaranteed by construction
deduplication     trivial — the offset is the guarantee
cross-device
  synchronization natural — each device has its own offset
retention         the log is the storage
complexity        high — millions of partitions
cost              high for low-activity conversations
```

## Trade-off Analysis

| Criterion | Weight | A — Client | B — Sequence | C — Log |
|---|:-:|:-:|:-:|:-:|
| Order guarantee | 30% | 2 | 9 | 10 |
| Deduplication and loss detection | 20% | 4 | 9 | 9 |
| Cross-device synchronization | 15% | 3 | 7 | 10 |
| Cost | 15% | 9 | 8 | 3 |
| Operational complexity | 10% | 9 | 7 | 3 |
| Team capability | 10% | 9 | 8 | 4 |
| **Weighted total** | | **5.0** | **8.3** | **7.5** |

**Sensitivity analysis**, redistributing the remaining weight proportionally across the other criteria. With cross-device synchronization at 35%, the totals
become 4.5 / 8.0 / 8.1 — B and C tie in practice, 0.1 apart on a subjective scale. That is the
scenario in which the product becomes heavily multi-platform, with desktop, web and several
mobile devices per user; it does not decide on its own, but it shows where the decision gets
fragile.

With cost at 40%, they become 6.9 / 8.4 / 4.6 — Option B widens its advantage.

## Decision

**Order on the server by conversation sequence (Option B)**, with the counter kept in storage
partitioned by conversation identifier and delivery done over a persistent connection or by push
notification, depending on the device's state.

**Under what condition each discarded option would win:**

**Option A would win if** order were not a requirement — in one-way notification products, for
example, where each message is independent. That is not the case for a conversation.

**Option C would win if** the average number of devices per user grew significantly, or if
server-side retention became indefinite — cases in which the log stops being an additional cost
and becomes the primary storage. The condition is recorded: if the average number of devices
exceeds 3, or if server-side retention is extended beyond 2 years, the decision is reassessed.

## Components

**Session Service.** Keeps track of which devices of which users are connected, and to which
node. It is the map the routing consults.

**Connection Gateway.** Terminates the persistent connections. With no business logic: it
receives, validates and forwards; it delivers what routing tells it to.

**Message Service.** Accepts the message, assigns the conversation sequence number, persists it
and emits it for delivery. It is the only point where order is established.

**Delivery Router.** For each recipient and device, decides whether to deliver over an open
connection or to enqueue for notification.

**Pending Queue.** Holds what could not be delivered, per device, until acknowledgment.

**Group Service.** Members, permissions and expanding one send into N recipients.

**Notification Service.** Integration with Apple and Google for devices with no connection.

**History Service.** Paginated lookups and search.

Making the **Gateway** dumb is an important decision: it is the component with the most instances
and the most connections, and keeping it free of business state allows restarting, scaling and
deploying it with no coordination with the rest.

## Data

**Conversation sequence.** The counter is the system's most sensitive structure.

```text
key        conversation_id
value      last_number
operation  atomic increment, returning the new value
```

It lives in a key-value store partitioned by conversation identifier. One conversation is
serialized; different conversations are independent. Since one-to-one conversations dominate the
volume, contention is distributed naturally.

Very active groups are the exception: a group of 2,000 members with 40 messages per second
serializes on that counter. The measured limit is around 900 messages per second per
conversation, well above what is observed in any real group — and the number is recorded as a
review condition.

**Message.**

```text
message    (conversation_id, sequence_number, sender_id, type,
            encrypted_content, created_at)
key        (conversation_id, sequence_number) — primary and ordered
```

The composite primary key is what makes reading history and detecting gaps cheap: "give me from
sequence 4,120 onward in this conversation" is a range scan.

**Per-device state.**

```text
state      (device_id, conversation_id, last_acknowledged_sequence)
```

That table is what resolves multiple devices: each one has its own offset in each conversation,
and synchronization is the difference between the device's offset and the conversation's last
number.

It also resolves reliable delivery. A message is only considered delivered when the device
acknowledges receipt by advancing its offset — and until then, it remains available for resending.
That implements at-least-once delivery with deduplication by sequence number, which is the honest
formulation of "exactly once".

See [delivery guarantees](/06-distributed-systems/delivery-guarantees.md).

A practical consequence of that table is that the storage cost of the pending queue is
proportional to the number of inactive devices, not to the message volume. A user with a device
switched off for thirty days accumulates pending items across all their active conversations — and
that is why server-side retention is 90 days, with a per-device limit beyond which
synchronization is truncated and the client receives only recent history.

The limit was set at 20 thousand pending messages per device. Above that, a full synchronization
would take minutes and consume mobile data in a way users reported as a problem — the decision was
to truncate and offer on-demand loading of the earlier history.

**Session.** In-memory storage with a short TTL, mapping a device to a connection node. An expired
session simply means the device is treated as offline, and the message goes by notification —
which makes losing session state harmless.

## Integration

**Sending a message.** The critical path, with a 400 ms p95 budget.

```text
1. the gateway receives, validates and forwards
2. the message service obtains the conversation's next number
3. it persists the message
4. it acknowledges to the sender (the message is "sent")
5. the router expands recipients and consults sessions
6. it delivers over an open connection or enqueues for notification
```

Step 4 happens before step 5: the sender gets an acknowledgment as soon as the message is
persisted and ordered, without waiting for delivery. That is what keeps the send p95 low even with
large groups, and it is what separates "sent" from "delivered" in the product.

**Groups.** Expanding one send into N recipients happens in the Router, asynchronously. For groups
up to 200 members, expansion is immediate; above that, it is done in batches with priority by the
recipient's recent activity — whoever has the conversation open receives first.

That prioritization was a product decision with a large effect: in groups of 2,000 members,
complete delivery takes up to 8 seconds, and prioritizing the active ones means the ongoing
conversation perceives no delay.

**Notification.** For offline devices. It is the system's only external dependency on the delivery
path, and it is asynchronous and retried — the message stays in the pending queue regardless of
the notification's outcome.

**Reconnection.** When a device reconnects, it reports its last acknowledged sequence per
conversation, and the server sends what is missing. A device that was offline for days receives a
batch, paginated.

## Security

```text
encryption in transit    mandatory on every connection
content                  encrypted at rest; the platform does not read
                         content of person-to-person conversations
business accounts        content accessible to the owning business,
                         per contract and with the user's awareness
metadata                 who talked to whom and when is sensitive data;
                         retention and access restricted
support access           never to content; only to metadata,
                         with a recorded justification
retention                90 days on the server; the device is the
                         user's long-term retention
reporting                reported content is preserved with
                         restricted access, for a defined period
```

The distinction between person-to-person conversations and conversations with business accounts is
the most important and most delicate privacy decision: the business model requires the company to
see its customer's history, and the user needs to know that. The solution was to make the
distinction visible in the interface, not only in the terms of service.

## Scalability

The system scales along three independent dimensions.

**Connections** scale by the number of gateways. Since the gateway holds no business state, adding
capacity is trivial. Cost per connection is what Phase 2 of the plan attacks.

**Messages** scale by conversation partition. The counter and the storage are partitioned by the
same identifier, which keeps everything about a conversation together.

**Deliveries** — 1.4 million per second — scale by the number of routers, which are stateless.

The real contention point is none of the three: it is **expanding large groups during peaks**. An
event that generates simultaneous activity in many large groups — an important match, for example
— produces a delivery peak disproportionate to the message peak.

The mitigation is the expansion queue with priority and the explicit acceptance that, in those
moments, delivery to inactive members of large groups can take tens of seconds.

That acceptance was negotiated with the product team and recorded, and it is the kind of decision
that frequently stays implicit. The alternative would be sizing expansion capacity for the peak of
rare events — which means idle capacity most of the year — or degrading indiscriminately, delaying
those with the conversation open as well.

Prioritizing by recent activity is what allows the perceived experience to stay stable while the
queue grows, and the number product tracks is not the queue depth but the delivery latency **to
active recipients**, which is the only one anyone feels.

## Reliability

If the **Gateway** fails, that node's connections drop and clients reconnect to another. No
message is lost, because the pending queue and the per-device state live outside it. The user
perceives a reconnection, which the app already treats as a normal case.

If the **Session Service** becomes unavailable, every device is treated as offline and delivery
goes by notification. It is slower and more expensive, and it works.

If the **Message Service** fails, sending stops. There is no degradation — accepting a message
without assigning a sequence would break the order guarantee, which is the central requirement.

If external **Notification** fails, messages stay in the pending queue and are delivered when the
device reconnects. The user is not alerted at the time, and receives them on opening the app.

If **History** becomes unavailable, active conversations work and search doesn't.

The property that sustains all that degradation is that **the message persisted with a sequence is
the source of truth**, and everything else is a delivery mechanism. Losing a delivery mechanism
delays; it doesn't lose.

## Observability

```text
delivery latency, p50/p95/p99, separated by
  both online, recipient offline, and group
duplicate rate detected by the client
sequence gaps detected and filled
pending queue depth, by age band
simultaneous connections, and messages per connection
notification success rate, per external provider
reconnection time and synchronization volume per reconnection
```

The **gaps detected** metric is the most important in the set for correctness: it directly measures
whether the transport is losing messages, and the number of gaps filled shows the recovery
mechanism is working.

Before Option B, that metric did not exist — with no numbering, there was no way to know a message
had been lost, and the loss showed up as a user complaint weeks later.

## Deployment

The Gateway is deployed with connection draining: a node stops accepting new connections, waits
for clients to migrate naturally and is restarted. A full fleet deployment takes about 40 minutes,
and is done outside the two daily peaks.

The Message Service requires more care, because a change in the message format has to be
compatible with clients on old versions — part of the base runs versions more than a year old. The
rule is compatibility for 18 months.

## Evolution Strategy

**Phase 1 (months 1–5): conversation sequence.** Introducing the sequence number and per-device
state, with the client still ordering by timestamp. The numbering is recorded and compared,
without being used.

The comparison period measured the real out-of-order rate: the 0.9% reported underestimated the
problem — the measurement found 1.7% of messages that would have been displayed out of order, of
which only half was perceived by the user.

**Phase 2 (months 6–9): client-side ordering and deduplication.** The app starts ordering by
sequence and detecting gaps. Duplicates and disorder drop to a measured zero.

**Phase 3 (months 8–14): connection optimization.** Reducing cost per connection: multiplexing, an
adaptive keep-alive interval by usage pattern, and moving low-activity devices to notification
instead of a persistent connection.

This is the phase that delivers the cost target. The central decision: a device that has neither
sent nor received for more than 20 minutes has its connection closed, and goes back to receiving
by notification until it reopens the app.

**Phase 4 (months 15–20): prioritized delivery in groups.** Expansion with priority by activity.

**Phase 5 (months 18–24): multi-platform synchronization.** Improving the multiple-device
experience, which is Option C's reassessment condition.

**Conditions that would change the plan:**

```text
if the average number of devices per user exceeds 3
  → Option C is reassessed

if any group exceeds 900 sustained messages/s
  → the per-conversation counter needs sharding, with
    reordering on the client

if server-side retention is extended beyond 2 years
  → the partitioned log stops being an additional cost

if the external notification providers degrade
  reliability below 95%
  → the policy of closing idle connections has to be revisited
```

## Results

Numbers at the end of Phase 3, 14 months after the start:

```text
out-of-order messages                     from 1.7% to 0
perceived duplicates                      from 0.4% to 0.0004%
lost messages detected by gaps            1,100/day, all recovered
                                          automatically
p95 of delivery, both online              from 620 ms to 310 ms
simultaneous connections at peak          from 4.2M to 2.1M
cost per active user                      -41% (the target was -35%)
complaints about message order            -96%
```

The 1,100 messages a day recovered by gap detection are the most revealing result: they were being
lost before, and nobody knew. The numbering did not only fix the order — it made loss observable
and recoverable.

## What this case teaches

**"Exactly once" is repeated delivery with deduplication at the destination.** There is no
guarantee of single delivery over an unreliable network. What exists is numbering, retrying until
acknowledged, and discarding duplicates by number — and the user perceives that as single
delivery.

**Order has to be established at one point.** Device clocks diverge by minutes. Any ordering that
depends on them fails, and the failure is intermittent and hard to reproduce.

**Numbering makes loss observable.** Before the sequence, lost messages were invisible and showed
up as complaints. Afterwards, they became 1,100 daily gaps detected and filled automatically. The
instrumentation came for free with the ordering solution.

**The persistent connection is not mandatory.** Half the connections were idle, and closing them
did not degrade the experience — because the notification mechanism already existed for offline
devices. Recognizing that an idle device and an offline device can be treated the same is what
delivered the cost target.

## Related Concepts

- [Delivery Guarantees](/06-distributed-systems/delivery-guarantees.md).
- [Ordering](/06-distributed-systems/ordering.md).
- [Idempotency](/06-distributed-systems/idempotency.md).
- [Case: Social Network](/21-case-studies/social-network.md).

## Practical Exercise

Describe what happens when a user sends a message, the client doesn't receive the acknowledgment
and resends it — and the server had received the first one.

With no sequence number assigned by the server, what prevents the duplicate? The answer shows why
deduplication needs a stable identifier generated on the client **and** an order assigned on the
server.

## Interview Questions

- Why is "exactly once" impossible, and what is implemented instead?
- Why does ordering by device timestamp fail intermittently?
- Why does the acknowledgment to the sender happen before delivery to the recipients?

## Further Reading

- Kleppmann, Martin. *Designing Data-Intensive Applications*. O'Reilly, 2017.
- Lamport, Leslie. *Time, Clocks, and the Ordering of Events*. CACM, 1978.
- Hohpe, Gregor; Woolf, Bobby. *Enterprise Integration Patterns*. Addison-Wesley, 2003.

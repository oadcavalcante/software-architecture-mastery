---
id: payments
title: "Case: Payments Platform"
sidebar_position: 3
description: A multi-acquirer orchestrator processing $7.6 billion a year, where every decision is about what to do when something fails midway.
doc_type: case-study
level: 0
difficulty: advanced
status: complete
objective: >
  By the end, the reader designs a payment flow with idempotency, compensation and
  reconciliation, and understands why the failure path is the product.
prerequisites: [trade-offs]
related: [banking, ecommerce, high-volume-events]
canonical_for: []
translated_from_version: 2
last_reviewed: 2026-08-31
---

# Case: Payments Platform

:::note How to use this case

Read the context, requirements and constraints. **Stop before the architecture options** and
sketch your own in twenty minutes.

This case's numbers are **illustrative** (SPEC.md §8.2): plausible and internally
consistent, not measured in a named system. What is learned is the reasoning they
support, not the magnitudes.

:::

## Business Context

**Pagolo** is a payments platform processing transactions for 41 thousand merchants —
e-commerce, subscriptions and card terminals. Annual volume of $7.6 billion.

The company is not an acquirer: it orchestrates. Each transaction is routed to one of five
partner acquirers, chosen by cost, approval rate and availability at that moment. That routing
is the product — merchants hire Pagolo because a transaction declined by one acquirer may be
approved by another.

Three pressures motivate revisiting the architecture:

**Loss from partial outages.** When an acquirer degrades, the platform takes an average of 9
minutes to divert traffic, because detection is manual. The commercial team estimates $2.8
million a year in transactions lost during those intervals.

**Manual reconciliation.** The financial operations team has 22 people, of whom 14 reconcile
what Pagolo recorded, what the acquirers report and what was actually settled. The volume of
divergences grows with the business.

**Duplicates.** About 900 duplicate charges a month arrive as complaints. The cause is known:
when the platform receives no response from the acquirer and the merchant retries, there is no
consistent guarantee that the second attempt doesn't become a second charge.

The third item is the most serious. A duplicate in payments is not a technical defect — it is
money taken from someone who didn't authorize it, and it is treated by the regulator and the
card networks as a control failure.

It is worth understanding why it happens, because the cause is not carelessness. When Pagolo
sends an authorization to an acquirer and the timeout elapses with no response, there are two
scenarios indistinguishable from the outside: the request never arrived, or it arrived, was
processed, and the response was lost. The old system's behavior was to treat both as the first
— mark the transaction as failed and allow a new attempt. In the cases where the second
scenario was the true one, the new attempt charged again.

The choice to assume failure was not arbitrary: it optimizes conversion, because marking it
pending would have made the merchant lose the sale while waiting. The old architecture traded
correctness for conversion without anyone having made that decision explicitly — and that kind
of implicit trade is what a case exists to make visible.

## Functional Requirements

```text
FR-1   Authorize a card transaction, routing it to the best acquirer
FR-2   Capture an authorization, fully or partially
FR-3   Void an uncaptured authorization
FR-4   Refund a captured transaction, fully or partially
FR-5   Retry with another acquirer when the first declines
       for a transient reason
FR-6   Process instant payments, with real-time confirmation
FR-7   Manage subscriptions with recurring billing and smart retries
FR-8   Reconcile automatically against files from every acquirer
FR-9   Process chargebacks and their defense
FR-10  Pay out to the merchant per the contracted schedule
FR-11  Expose the state of any transaction, at any point in the lifecycle
```

FR-5 is the product. FR-11 looks trivial and is not: a transaction in an orchestrator has state
distributed across Pagolo, the acquirer, the card network and the issuer — and answering "what
happened to that charge" requires the platform to know, always.

## Non-Functional Requirements

```text
availability of authorization            99.99%
p99 of authorization (end to end)        < 3 s
p99 of internal time (excluding acquirer) < 120 ms
duplicate rate                           < 0.001% of transactions
time to detect acquirer degradation      < 30 s (against 9 min today)
time to divert automatically             < 60 s
automatic reconciliation                 > 99.5% of records
transaction retention                    10 years
RPO                                      0 for an authorized transaction
RTO                                      < 10 min
```

The 3-second end-to-end p99 includes the acquirer, which responds between 400 ms and 2.5 s. The
120 ms internal budget is what Pagolo controls, and it is what gets verified in the pipeline.

## Constraints

```text
PCI DSS certification   card data cannot rest outside the certified
                        environment; the scope must be as small as possible
card networks           retry rules, chargeback deadlines and file formats
                        are imposed and change by external decision,
                        on short notice
acquirers               five partners, five different APIs, five different
                        error semantics, three reconciliation file formats
regulatory              an authorized payment institution; requirements for
                        continuity, segregation and reporting
team                    46 engineers, 11 on the payments platform
migration               there is none: the current system keeps operating
                        throughout the evolution; there is no window to stop
```

The PCI constraint is what shapes the topology most: the fewer components touching card data,
the lower the cost and risk of the annual certification.

## Capacity Estimates

```text
transactions/year                       412 million
transactions/day, average               1.13 million
transactions/s, average                 ~13
hourly peak (Black Friday, 8-9pm)       ~310 thousand/h  →  ~86/s
observed instantaneous peak             ~240/s
design margin (3×)                      ~700/s
```

Again, a volume that requires no exotic architecture. 700 authorizations per second is modest.
**This system's challenge is not volume — it is correctness under partial failure.**

Each transaction involves 4 to 9 calls to external systems, and any of them can fail, be slow,
or respond ambiguously. With 412 million transactions a year, even a 0.1% ambiguity rate
produces 412 thousand annual cases that have to be resolved correctly.

```text
external calls/transaction, average     5.2
ambiguous response rate (timeout
  with an unknown outcome)              ~0.08%
ambiguous cases/year                    ~330 thousand
ambiguous cases/day                     ~900
```

Nine hundred cases a day in which the platform doesn't know whether the charge happened. That
is the system's central problem, and almost the entire architecture follows from it.

It is useful to compare with the [e-commerce](/21-case-studies/ecommerce.md) case, where the
write volume was also low and the conclusion was that the architecture should optimize speed
of change. Here the volume is equally low and the conclusion is the opposite: the architecture
should optimize correctness, and speed of change is secondary. The difference is not in the
capacity numbers — it is in the cost of an error. A product shown with the wrong inventory
produces a cancellation; a duplicate charge produces a regulatory complaint.

Reading constraints is exactly that: the same volume numbers support opposite decisions
depending on what is at stake when the system is wrong.

```text
storage
  transactions, 10 years                ~4.1 billion rows  →  ~3.2 TB
  transaction events (every state
  change), 10 years                     ~24 billion  →  ~9 TB
  reconciliation files, 10 years        ~46 TB
```

## Architecture Options

### Option A — Synchronous orchestration with compensation

Each transaction is a synchronous flow from start to finish: receive, route, authorize, record,
respond. Failures midway trigger immediate compensation.

```text
latency              best — no intermediate steps
correctness under
  failure            depends on the compensation running; if the process
                     dies midway, the state is undefined
complexity           lowest
ambiguous cases      resolved by querying the acquirer, on demand
```

### Option B — Persisted state machine

Each transaction is a state machine written before every external step. A recovery process
resumes stalled transactions.

```text
latency              +15 to 30 ms per state write
correctness under
  failure            high — the state survives the process dying
complexity           medium — the state machine has to be explicit
ambiguous cases      resolved by an automatic reconciliation process
                     that queries the acquirer and concludes
```

### Option C — Event-driven orchestration, with no central state

Each step publishes an event; consumers react. The transaction's state is derived from the
events.

```text
latency              +40 to 80 ms per messaging hop
correctness under
  failure            high, if delivery is guaranteed
complexity           high — ordering, duplication and correlation become
                     a problem at every step
state queries        require a projection; FR-11 becomes more expensive
debugging            hard
```

## Trade-off Analysis

| Criterion | Weight | A — Synchronous | B — State machine | C — Events |
|---|:-:|:-:|:-:|:-:|
| Correctness under partial failure | 35% | 3 | 9 | 8 |
| Internal latency | 20% | 9 | 8 | 5 |
| Ability to answer FR-11 | 15% | 5 | 9 | 5 |
| Operational complexity | 15% | 8 | 7 | 3 |
| Team capability | 10% | 8 | 7 | 4 |
| Infrastructure cost | 5% | 9 | 8 | 6 |
| **Weighted total** | | **6.1** | **8.3** | **5.7** |

Correctness under failure weighs 35% because it is the stated problem: 900 duplicate charges a
month and 900 ambiguous cases a day. Any lower weight would make the analysis incoherent with
the diagnosis.

**Sensitivity analysis.** With latency at 40% and correctness at 20%, the totals become 7.1 /
8.0 / 5.1 — Option B still wins, which indicates it doesn't depend on the chosen weight. With
operational complexity at 35%, they become 6.7 / 7.4 / 4.3.

## Decision

**Persisted state machine (Option B)**, with each transaction's state written before every
external interaction and a reconciler that resolves stalled transactions.

**Under what condition each discarded option would win:**

**Option A would win if** the internal latency budget were far tighter — below 40 ms — or if
the acquirers' ambiguity rate were negligible. Neither is the case; the first is a constraint
this product doesn't have, and the second depends on third parties.

**Option C would win if** there were many independent consumers of the same transaction events,
needing historical reprocessing. Today there are three consumers, all internal, and none needs
to reprocess. The condition is recorded: if the number of consumers exceeds six, the
architecture is reassessed.

It is worth noting that Option C **was not discarded entirely**: events are used for merchant
notifications and analytics feeds, outside the authorization critical path. The decision
concerns where the transaction's state lives, not the absence of messaging.

## Components

```text
Payment Gateway (PCI scope)
  receives card data, tokenizes, and never persists it
  the only component in the certification scope

Transaction Orchestrator
  the state machine; writes before every external step

Acquirer Router
  decides the destination by cost, historical approval and current health

Acquirer Health Monitor
  measures latency and approval rate over a short window;
  opens and closes the circuit breaker per acquirer

Acquirer Connectors (×5)
  translate each partner's semantics into the internal model

Transaction Reconciler
  resolves stalled transactions by querying the acquirer

Financial Reconciler
  compares acquirer files with the internal record

Subscriptions Service
  schedules recurring charges and retries

Chargeback Service
  chargeback lifecycle, deadlines and defense

Payout Service
  calculates and schedules payment to the merchant

Transaction Lookup
  a read projection for FR-11
```

The **Gateway** is the only component inside the PCI scope. It receives the card, obtains a
token from the vault and returns only the token to the rest of the platform. No other component
sees the card number, which reduces the certification scope from eleven components to one.

The **Acquirer Connectors** exist because five partners produce five incompatible error
semantics. The same scenario — "the transaction may have been authorized, we don't know" —
appears as HTTP 502 at one partner, as a business code `PENDING` at another, and as a 200
response with an empty field at a third. Translating that into a single model is what makes the
Orchestrator tractable. See
[anti-corruption layer](/08-integration-architecture/integration-anti-corruption.md).

## Data

**The state machine.**

```text
transaction        (id, merchant_idempotency_key, amount, currency, merchant,
                    state, acquirer, created_at, updated_at, version)
transaction_event  (id, transaction_id, from_state, to_state, reason,
                    external_payload, created_at)
attempt            (id, transaction_id, acquirer, request_id, state,
                    raw_response, started_at, finished_at)
```

The possible states, and the transitions permitted between them, are declared explicitly. An
undeclared transition is rejected by the code itself, and the attempt is recorded as an
anomaly.

```text
received → routed → authorizing → authorized → captured → settled
                          ↓            ↓           ↓
                     ambiguous      voided     refunded
                          ↓
                    (reconciler)
                          ↓
                authorized | declined
```

The **`ambiguous`** state is the heart of the design. It is reached when the platform sends a
request to the acquirer and gets no conclusive response. No other system decides what happened
— the transaction is explicitly marked as unknown, and the Reconciler is the only component
authorized to take it out of that state.

Before that design, the behavior was to assume a decline and allow a new attempt — which is the
exact origin of the 900 monthly duplicates.

Introducing an explicit state for "we don't know" has an effect that goes beyond correctness:
it makes the problem **measurable**. Before, ambiguous cases didn't exist as a category — they
became failures, and the failure rate mixed legitimate declines with not knowing. Afterwards,
the platform had a number: how many transactions are in an unknown state, and for how long.

That number became the main health indicator for the integration with each acquirer, and it is
what made it possible to renegotiate contracts with two partners whose ambiguity rate was three
times the others'. The information had existed all along and had nowhere to be recorded.

**Idempotency in two layers.**

```text
external   a key supplied by the merchant; a second call with the same
           key returns the first one's result, whatever it was
internal   a request identifier sent to the acquirer; the same identifier
           is never reused for a different charge,
           and is reused to repeat the same one
```

The second layer is what resolves the ambiguity: on repeating an ambiguous request with the
same identifier, acquirers that support idempotency return the original result rather than
charging again. Three of the five partners support it; for the other two, the Reconciler
queries the transaction by identifier before any new attempt.

See [idempotency](/06-distributed-systems/idempotency.md).

There is a subtlety that only appears in implementation: the merchant's idempotency key and the
request identifier sent to the acquirer **cannot be the same value**. A transaction may
legitimately generate more than one request — when the first is declined for a transient reason
and the platform tries another acquirer (FR-5). If the two identifiers were one, the second
attempt would be rejected as a duplicate by the platform itself, and the product would stop
working.

The rule that emerged: a merchant key corresponds to **one intended charge**; a request
identifier corresponds to **one attempt with a specific acquirer**. Repeating the same attempt
reuses the identifier; trying another partner creates a new one. That distinction looks pedantic
and is exactly what separates a correct orchestrator from one that charges twice.

**PostgreSQL** for the transactional state, partitioned by month. Events and attempts move to
cold storage after 90 days, with slower queries.

## Integration

**With acquirers.** Each connector implements the same internal contract and translates. The
internal contract has a property the partners' contracts don't: **every result is conclusive or
explicitly ambiguous**. There is no response the Orchestrator has to interpret.

**Routing.** The decision combines three signals:

```text
cost per transaction         the contractual table, by network and by tier
historical approval          the last 30 days' rate, by issuer and network
current health               latency and error rate over the last 60 s
```

The third signal is what resolves the $2.8 million annual loss. The Health Monitor evaluates
each acquirer over a 60-second sliding window and opens the circuit breaker when the error rate
exceeds 5% or the p95 latency doubles against the baseline. The diversion is automatic and
takes under 60 seconds. See
[circuit breakers](/12-reliability/circuit-breakers.md).

**Retry with another acquirer (FR-5).** It only happens for declines classified as transient —
unavailability, timeout, communication error. A decline for insufficient funds, a blocked card
or suspected fraud is **not** retried with another partner: repeating would inflate the
approval rate artificially and violate card network rules.

Classifying declines as transient or definitive was harder than it looked. The five acquirers
use different codes, and several of them group distinct reasons under the same code — "declined
by the issuer" can mean insufficient funds, suspected fraud or issuer unavailability, all under
the same value. The translation was built empirically: each code was classified, and the
classification is reviewed quarterly based on the success rate of the retries.

Codes whose retry with another partner succeeds below 8% of the time are reclassified as
definitive. That quarterly review moved 14 codes in two years, and it is what keeps the
platform within card network rules without depending on a static reading of third-party
documentation.

**Reconciliation (FR-8).** Daily files from five acquirers, in three formats, processed
idempotently. The reconciler matches records by request identifier and amount, and classifies
divergences into categories handled automatically and categories requiring a person.

## Security

```text
PCI scope             one component, with a segregated network, restricted
                      access and its own audit
tokenization          card data replaced by a token at the edge;
                      the vault is a certified third-party service
acquirer
  credentials         in a managed vault, with rotation and per-service access
segregation           the Orchestrator has no read credentials for the card
                      vault; the Gateway doesn't write to the transaction database
fraud detection       an external service queried before authorization, with a
                      short timeout and a fallback to approval when
                      it is unavailable
audit trail           every state change, with author, reason and raw
                      external payload, immutable for 10 years
operations access     read-only; corrective actions require
                      two approvers and are logged
```

The decision to approve when the fraud service is unavailable is a recorded commercial
trade-off: declining every transaction during an outage costs more than the fraud risk over the
interval, and the volume approved in that mode is capped by amount and by merchant.

The calculation behind that decision was done with numbers and is reviewed annually. Declining
every transaction during one hour of fraud service downtime costs about $280 thousand in
unprocessed volume, with a direct effect on merchants. The expected loss from fraud approved
over the same interval, with the amount caps applied, is estimated at $8 thousand. The 35-to-1
ratio justifies the choice, and the amount and merchant caps exist precisely to keep that
ratio — without them, the degraded mode would be a known invitation.

That is an example of a decision that looks like security and is commercial: whoever answers
for it is the risk leadership, not engineering, and architecture's role was to make the
trade-off measurable and the degraded mode controllable.

## Scalability

The design volume — 700 authorizations per second — is modest and served by simple horizontal
scaling. The only point that required attention was the transaction database:

```text
writes per transaction         3 to 6 writes (state + events + attempts)
writes/s at peak               ~4,200
measured bottleneck            sequential event writes
solution                       partitioning by month, with the current
                               partition on dedicated fast storage
```

Subscriptions have a different and more delicate profile: recurring charges concentrate on the
1st, 5th, 10th, 15th and 20th, with peaks of up to 40× the average. The solution was to
**spread the charges within a 6-hour window**, with the order determined by a hash of the
subscription identifier — which eliminates the peak without changing the contracted day.

## Reliability

```text
component                 target    degradation when unavailable
Gateway                   99.99%    none — it is the front door
Orchestrator              99.99%    none
Router                    99.95%    falls back to static routing by cost
Health Monitor            99.9%     routing loses the health signal
Fraud Service (ext.)      —         approves with an amount cap
Reconciler                99.5%     ambiguous transactions accumulate and are
                                    resolved when it returns
Reconciliation            99%       delayed; the deadline is daily
Payout                    99.9%     delayed within the contractual deadline
```

The Reconciler line deserves a note: it can be down for hours with no damage, provided the
`ambiguous` state is written. That is a direct consequence of the architectural decision —
persisting the state before the external step turns a critical failure into a delay.

**RPO zero for an authorized transaction.** Synchronous replica in a distinct zone; confirmation
to the merchant only after the commit in two zones.

## Observability

```text
business metrics       approval rate per acquirer, network and issuer
                       average cost per transaction
                       transactions in an ambiguous state, by age
                       duplicates detected
technical metrics      internal p99 latency (a 120 ms budget)
                       latency per acquirer, p50/p95/p99
                       error rate per connector
                       reconciliation queue depth
alarms                 an ambiguous transaction older than 15 min → incident
                       an acquirer's approval rate dropping > 10 pp
                       in 5 min → alert and possible diversion
                       reconciliation divergence > 0.5% → incident
                       a duplicate detected → incident, always
tracing                end-to-end correlation, from merchant to acquirer,
                       with the request identifier visible
```

The alarm for an ambiguous transaction older than 15 minutes is the most important of the set:
it directly measures whether the Reconciler is doing its job, and an aged ambiguous transaction
is money in an unknown state.

## Deployment

```text
Gateway (PCI scope)       deployment with additional approval and an audit
                          record; changes accompanied by security
Orchestrator              canary 5% → 25% → 100%, with automatic rollback
                          on error rate or ambiguity rate
Connectors                deployed independently, per partner;
                          a faulty connector doesn't affect the others
schema migration          compatible in three steps; the state machine
                          has to accept old and new states during the
                          transition
contract testing          against the five acquirers' sandbox environments,
                          on every connector change
```

The connectors' independence is what makes it possible to handle the card network constraint:
when a rule changes on short notice, only the affected connector is changed and deployed.

That was the only part of the architecture where separating into independent services was
justified by schedule, and not by scale or by team. The card networks publish mandatory changes
with 30- to 60-day windows, and deploying an isolated connector takes hours — whereas deploying
the Orchestrator requires regression testing over the whole state machine.

The rest of the platform could be a modular monolith with no harm, and the decision to keep the
Orchestrator, Router and Reconciler separate was revisited twice. It held for an operational
reason: the Reconciler has a batch load profile and can be down for hours, while the
Orchestrator cannot be down for seconds. Opposite availability profiles justify distinct
deployable units. See
[monolith vs. microservices](/20-trade-offs/monolith-vs-microservices.md).

## Evolution Strategy

**Phase 1 (months 1–5): state machine and idempotency.** The Orchestrator starts persisting
state before every external step, and two-layer idempotency is implemented. The `ambiguous`
state is introduced and the "assume decline" behavior is removed.

An immediate result not in the plan: duplicates dropped from ~900/month to ~60/month **before**
the Reconciler existed, purely from no longer assuming a decline. The remaining 60 were
ambiguous transactions resolved manually.

**Phase 2 (months 6–8): reconciler.** Automatic resolution of ambiguous transactions, by
querying the acquirer with the original request identifier. Duplicates drop to ~4/month.

**Phase 3 (months 9–12): health monitor and automatic diversion.** Detection in 30 s and
diversion in 60 s, against the 9 manual minutes.

**Phase 4 (months 13–18): automatic reconciliation.** Automatic matching and classification of
divergences. The reconciliation team is redirected, not reduced — 9 of the 14 people move to
handling chargebacks, which was a bottleneck.

**Phase 5 (months 19–24): subscriptions and chargebacks.** Smart retries based on decline reason
and issuer history; a chargeback lifecycle with automated deadlines.

**Conditions that would change the plan:**

```text
if the number of acquirers exceeds 10
  → the Router needs a decision model, not rules

if one acquirer accounts for more than 60% of volume
  → the routing redundancy premise stops holding,
    and commercial negotiation becomes an architecture matter

if the number of transaction event consumers exceeds 6
  → Option C is reassessed

if any partner's ambiguity rate exceeds 0.5%
  → that partner's connector gets dedicated reconciliation,
    and the contract is renegotiated with the number in hand
```

## Results

Numbers at the end of Phase 4, 18 months after the start:

```text
duplicates/month                        from ~900 to 3
ambiguous transactions unresolved
  after 15 min                          from "not measured" to 0.004%
degradation detection time              from 9 min to 22 s
diversion time                          from 9 min to 41 s
estimated loss from partial
  outages                               from $2.8M/year to ~$220K/year
automatic reconciliation                99.7% of records
people on manual reconciliation         from 14 to 5
overall approval rate                   +2.3 pp (effect of health-based
                                        routing and correct retries)
internal p99                            94 ms (a 120 ms budget)
```

The 2.3 percentage point gain in approval rate, over $7.6 billion, is the project's largest
financial effect — and it was not the stated objective. It came from two changes: diverting
traffic away from degraded acquirers, and no longer retrying definitive declines with other
partners, which was being penalized by the card networks.

## What this case teaches

**The failure path is the product.** A payments orchestrator is, almost entirely, a system for
handling what happens when something doesn't respond. The happy path is simple and doesn't
distinguish implementations.

**Not knowing is a state, and it has to be written down.** The project's highest-impact change
was introducing `ambiguous` and forbidding any component from assuming a decline. It cost
little code and resolved 93% of the duplicates before any automation.

**Idempotency needs two layers.** The client key protects against the client repeating; the
request identifier protects against the platform itself repeating. Without the second, the
first doesn't resolve ambiguity.

**Scale was not the problem, again.** Seven hundred authorizations per second. All the effort
went into correctness under partial failure, and no decision was motivated by volume.

## Related Concepts

- [Idempotency](/06-distributed-systems/idempotency.md).
- [Circuit Breakers](/12-reliability/circuit-breakers.md) — health-based diversion.
- [Anti-Corruption Layer](/08-integration-architecture/integration-anti-corruption.md).
- [Case: Digital Banking Core](/21-case-studies/banking.md).

## Practical Exercise

Draw the sequence diagram of the path where the platform sends the authorization and receives
no response.

Answer: what is written at that instant, who decides what happened, and what does the merchant
see meanwhile? If any of the three has no answer, the design has a duplicate waiting.

## Interview Questions

- Why is "assume a decline" when there is no response the origin of duplicate charges?
- Why is client-side idempotency not enough in an orchestrator?
- Why should definitive declines not be retried with another acquirer?

## Further Reading

- Hohpe, Gregor; Woolf, Bobby. *Enterprise Integration Patterns*. Addison-Wesley, 2003.
- Nygard, Michael. *Release It!*. 2nd ed. Pragmatic Bookshelf, 2018.
- PCI Security Standards Council. *PCI DSS v4.0*.

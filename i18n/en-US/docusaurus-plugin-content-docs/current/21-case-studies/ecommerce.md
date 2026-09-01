---
id: ecommerce
title: "Case: Omnichannel E-commerce"
sidebar_position: 1
description: A retailer with 1,400 stores migrating from a bought commerce suite to its own architecture, without stopping selling.
doc_type: case-study
level: 0
difficulty: advanced
status: complete
objective: >
  By the end, the reader conducts a complete analysis of architectural evolution, choosing
  the extraction order by rate of change and coupling, not by ease.
prerequisites: [trade-offs]
related: [legacy-modernization-case, logistics, saas-platform]
canonical_for: []
translated_from_version: 2
last_reviewed: 2026-08-31
---

# Case: Omnichannel E-commerce

:::note How to use this case

Read the context, requirements and constraints. **Stop before the architecture options** and
sketch your own in twenty minutes. Only then continue.

The value is not in agreeing with the text's decision — it is in discovering which constraint
you hadn't considered.

This case's numbers are **illustrative** (SPEC.md §8.2): plausible and internally
consistent, not measured in a named system. What is learned is the reasoning they
support, not the magnitudes.

:::

## Business Context

**Vertena** is a home and building supplies retailer, with 1,400 physical stores across 21
states and a digital channel accounting for 18% of revenue.

Annual revenue: $840 million, of which $152 million is digital.

The digital channel runs on a commerce suite bought in 2016, customized over nine years. The
suite covers catalog, cart, order, payment, promotions and an admin portal.

Three business pressures motivate revisiting the architecture:

**Omnichannel.** The company wants to sell store inventory through the site — "pick up in
store", "ship from the nearest store" and "buy online, exchange in store". Today, digital
inventory is a single distribution center, and the 1,400 stores are invisible to the site.
Competitors already offer this, and the commercial team estimates a 12% to 18% increase in
conversion.

**Speed of change.** Every alteration to the purchase flow goes through the integrator that
maintains the suite. The average time from a business request to production is **14 weeks**.
The product team has 40 items queued for more than six months.

**Licensing cost.** The suite's contract was repriced in 2025 to $1.28 million a year, tied to
revenue — the bill grows with the channel's success.

There is no scale pressure: the suite handles the current volume. The problem is one of
**evolution**, not capacity — and that distinction guides the whole analysis.

## Functional Requirements

In the order of priority declared by the business:

```text
FR-1  Query aggregate availability of a product: distribution center
      + all stores, with delivery time per origin
FR-2  Reserve store inventory for pickup, with an expiry deadline
FR-3  Route the order to the origin with the lowest total cost (shipping + stockout risk)
FR-4  Unified cart across web, app and in-store service
FR-5  Catalog with attributes that vary by category (paint has color and coverage;
      cement has weight and strength)
FR-6  Combinable promotions, with rules by region, channel and profile
FR-7  Payment by card, instant bank transfer and the chain's own store credit
FR-8  Returns at any store, regardless of origin
FR-9  Store operations portal: picking, checking and releasing reservations
FR-10 Unified order history across channels
```

FR-1 to FR-3 are new and are the reason for the project. FR-4 to FR-10 exist in the suite,
with behavior that has to be preserved.

## Non-Functional Requirements

```text
availability of the purchase flow            99.95% (≈ 4.4 h/year)
availability of catalog browsing             99.9%
p99 of product page load                     < 800 ms
p99 of availability lookup                   < 400 ms
p99 of checkout                              < 2 s
inconsistency window for store inventory
  shown on the storefront                    < 3 min
inconsistency window for a reservation       0 — a reservation is strong
order data retention                         5 years (tax)
time to a new feature in production          < 2 weeks (against 14 today)
```

The last is an unusual non-functional requirement and the most important of the set: it is
the reason for the project, and it is what rules out the option of keeping everything as is.

## Constraints

```text
schedule            the year-end season is untouchable: no structural change
                    between October 1 and January 15
contract            the suite has a contract through December 2028, with a
                    decreasing termination penalty ($1.8M in 2026, $600K in 2028)
team                32 engineers, of whom 9 know the suite;
                    none with experience in high-scale systems
platform            a deployment pipeline and basic observability exist;
                    there is no self-service platform
store inventory     the store management system is a third-party ERP,
                    with a query API and no reservation API
regulatory          tax document issuance integrated with the ERP; cannot be rewritten
data                the catalog has 380 thousand SKUs and 9 years of order
                    history in the suite's database
```

The constraint of an ERP with no reservation API is the most limiting and the one that
appears least in the initial discussions — it defines the design of all of FR-2.

## Capacity Estimates

**Order volume.**

```text
digital orders/month, average          310 thousand
orders/day, average                     10.3 thousand
daily peak (Black Friday)              142 thousand
hourly peak                             28 thousand/h  →  ~7.8 orders/s
observed instantaneous peak (10 min
  after a campaign launch)              ~34 orders/s
design margin                           3×  →  100 orders/s
```

The order volume is **low**. That is an important result: 100 orders/s requires no exotic
architecture at all, and any proposal using scale as its justification is solving a problem
that doesn't exist.

**Read volume.**

```text
visits/month                            41 million
product pages/visit, average            4.2
catalog reads/month                     ~172 million
read peak                               ~4,800/s
with margin                             ~12,000/s
```

Reads are 1,500× writes. That shifts the design toward caching and read replication, not
toward write partitioning.

**Inventory volume.**

```text
SKUs in the catalog                     380 thousand
active SKUs per store, average          13 thousand
SKU × store combinations                ~18.2 million
inventory updates/day (in-store sales
  + receipts + adjustments)             ~4.1 million
update peak                             ~180/s
```

Eighteen million combinations with 180 updates per second fit comfortably in a well-indexed
relational database. Again, there is no scale problem.

**Storage.**

```text
catalog with attributes and media       ~140 GB
order history, 9 years                  ~2.1 TB
inventory (current state)               ~3 GB
inventory events, 90 days               ~400 GB
```

## Architecture Options

Three genuinely viable options were evaluated. Each was taken to the level of effort and risk
estimation.

### Option A — Evolve the suite in place

Keep the suite as the platform and implement FR-1 to FR-3 inside it, with customization and
integration to the ERP.

```text
estimated effort           7 to 9 months, mostly from the integrator
license cost               unchanged, with revenue-based repricing
future change lead time    stays at ~14 weeks
technical risk             low — the suite already operates
business risk              high — the queue of 40 items stays stalled
```

The suite supports availability customization, but its inventory model is single-warehouse.
Extending it to 1,400 origins would require altering the core, which is the part with the
tightest contractual restriction on customization — and the vendor quoted the development as a
project of its own.

### Option B — Complete rebuild with a big-bang switchover

Build a complete in-house platform and replace the suite all at once.

```text
estimated effort           26 to 34 months
team required              ~45 people, against 32
switchover risk            very high — the channel stops if it goes wrong
license savings            only from the switchover onward
future change lead time    < 2 weeks, once finished
```

The rebuild solves everything and solves it late. Over the 30 months, nothing in the product
queue moves, and the company keeps paying the license. And a big-bang switchover of a
$152-million channel concentrates risk into a single event.

### Option C — Incremental strangling

Keep the suite running and extract capabilities one by one, with a router in front directing
each route to the suite or to the new service, until the suite is empty.

```text
estimated effort           continuous delivery; first capability in 4 months
risk per step              low — each extraction is reversible
license savings            gradual, as modules leave the contractual scope
change lead time           drops per extracted capability
transitional complexity    high — two systems coexisting for ~3 years
```

See [strangling](/16-legacy-modernization/strangler-fig.md).

## Trade-off Analysis

Criteria weighted by the technology group and the commercial leadership, with the weights
defined **before** the evaluation:

| Criterion | Weight | A — Evolve | B — Rebuild | C — Strangle |
|---|:-:|:-:|:-:|:-:|
| Time to FR-1..FR-3 in production | 25% | 6 | 2 | 8 |
| Reduction in change lead time | 25% | 1 | 9 | 7 |
| Risk of channel disruption | 20% | 9 | 2 | 7 |
| Total cost over 4 years | 15% | 3 | 6 | 7 |
| Current team's capability | 10% | 8 | 3 | 6 |
| Reversibility | 5% | 7 | 1 | 9 |
| **Weighted total** | | **5.0** | **4.4** | **7.3** |

The weights deserve an explanation. Time to the new features and reduction in change lead
time add up to 50% because **they are the project** — the company is not solving a technical
problem, it is solving a product queue. Risk of disruption weighs 20% because the digital
channel is the only part of the business that is growing.

Cost weighs only 15%, which was contested internally. The recorded justification: the license
savings are real but smaller than the estimated value of the stalled product queue ($8 to 14
million of unrealized revenue, by the commercial estimate).

**Sensitivity analysis.** The matrix was recalculated with alternative weights to check
whether the conclusion depended on a specific choice:

```text
scenario                                   A      B      C
original weights                          5.0    4.4    7.3
cost at 40%, change lead time at 5%       4.6    5.3    7.2
risk of disruption at 40%                 6.1    3.4    7.4
team capability at 30%                    5.6    3.8    7.0
```

Option C wins in every scenario tested, which increases confidence in the decision. And the
analysis reveals something about the other two: Option B only gets close when cost dominates,
and Option A only gets close when risk dominates — which is coherent with each one's nature,
and serves as a check that the evaluation was not biased to produce the desired result.

One criterion considered and **discarded** from the matrix: "architectural modernity". It was
proposed and refused for not corresponding to any verifiable business outcome — and for being
exactly the kind of criterion that favors a rebuild without anyone having to defend why.

## Decision

**Incremental strangling (Option C)**, with the extraction order defined by two combined
criteria: **rate of change** and **coupling to the rest of the suite**.

```text
capability          changes/year   coupling      order
availability        high (new)     low           1
catalog             high           medium        2
promotions          very high      high          4
cart and order      medium         very high     5
payment             low            medium        3
admin portal        low            high          6 (last)
```

The first extraction is the one that **doesn't exist** — omnichannel availability is a new
capability, with no legacy code to migrate and no regression risk. It delivers FR-1 to FR-3,
validates the extraction pattern and produces a business result in four months.

Payment comes third despite its low rate of change, because it is the module with the
greatest license savings when it leaves the contractual scope.

Promotions, which has the highest rate of change, comes fourth for being the most coupled —
extracting it early would require maintaining a complex bidirectional bridge with the suite's
cart.

**Under what condition each discarded option would win:**

**Option A would win if** the change lead time requirement didn't exist — if the product queue
were short and the company only needed omnichannel. In that scenario, 8 months of
customization with low risk is the right answer, and the license savings alone wouldn't
justify the project.

**Option B would win if** the suite's contract ended in 2026 with no possible renewal, or if
the suite couldn't handle the volume — cases in which coexistence stops being an option. It
would also win with a team of 45 people with prior experience in commerce platforms, in which
30 months would become 16.

## Components

The target architecture, at the end of the strangling:

```text
Edge router
  decides, per route, whether the request goes to the suite or to the new services
  the single point of switchover and rollback

Availability Service
  aggregates inventory from the distribution center and the 1,400 stores
  answers "where is it, with what lead time, at what cost"

Reservation Service
  reservation with expiry; source of truth for reservations
  compensates against the ERP

Catalog Service
  products, attributes per category, media, base pricing

Promotions Service
  combinable rules by region, channel and profile

Cart and Order Service
  order lifecycle, purchase orchestration

Payment Service
  card, instant transfer and store credit; integration with acquirers

Store Portal
  picking, checking, releasing reservations

Search Index
  denormalized catalog for search and faceted navigation

ERP Adapter
  anti-corruption layer over the store ERP
```

The **ERP adapter** deserves emphasis: it exists because the ERP has no reservation API, and
it concentrates all the translation between Vertena's inventory model and the vendor's. See
[anti-corruption layer](/08-integration-architecture/integration-anti-corruption.md).

The architecture is a **modular monolith** for catalog, promotions, cart and order — the four
share a domain model and change together — with availability, reservation and payment as
separate services for having distinct load and availability profiles.

Seven deployable units, not twenty. See
[monolith vs. microservices](/20-trade-offs/monolith-vs-microservices.md).

## Data

**PostgreSQL as the primary database** for every service, with a schema per module and no
cross access. The decision was made with the
[SQL vs. NoSQL](/20-trade-offs/sql-vs-nosql.md) analysis: the catalog's access patterns are
known, but the commercial team asks unforeseen questions all the time, and the volume is far
below the threshold at which relational requires work.

The attributes that vary by category (FR-5) use a `jsonb` column with GIN indexes — which
eliminates the need for a second database.

**Inventory model.**

```text
inventory_position     (sku, origin, quantity, updated_at)        18.2 M rows
inventory_reservation  (id, sku, origin, quantity, expires_at)    ~40 thousand active
inventory_event        (append-only, 90 days)                     ~370 M rows
```

The position table is updated by events from the ERP and by the platform's own reservations.
It is the storefront's source, with a window of up to 3 min. The reservation table is the
strong source: a confirmed reservation is strongly consistent, no exceptions.

That separation is the answer to the conflict between FR-1 (storefront, tolerant) and FR-2
(reservation, intolerant) — two requirements over the same data with opposite consistency
needs. See
[strong vs. eventual consistency](/20-trade-offs/strong-vs-eventual-consistency.md).

**Search index** fed from the catalog by events, with a 2-minute window. It exists because
faceted search over 380 thousand SKUs with variable attributes is the case where relational
performs badly.

**Order history.** The suite's 2.1 TB stays there throughout the migration and is queried
through a router route. Migrating the history is the **last** step, and it is deliberately
deferred: it has a high cost and no business value until the suite is shut down.

## Integration

**With the store ERP.** The most delicate point of the design, because the ERP offers no
reservation.

```text
position query      the ERP's API, polled every 90 s in batches of stores
                    + a full position file, 1×/day, for reconciliation
reservation         doesn't exist in the ERP → Vertena keeps the reservation
                    in its own database, and subtracts it from the queried position
actual write-off    when the store picks and confirms in the portal, the
                    adapter posts the sale to the ERP
reconciliation      daily, comparing the ERP position with the calculated
                    position; divergences alert the store manager
```

The accepted consequence: for up to 90 seconds, the position may be out of date. That is
absorbed by a **safety margin per SKU** — high-turnover SKUs reserve against a position
reduced by one unit, and low-turnover SKUs against the full position.

That margin is the decision that makes the design viable despite the ERP's limitation, and it
is adjustable per category with no deployment.

The complete lifecycle of a store reservation, the system's most delicate flow:

```text
1. customer chooses pickup at store X
2. the service queries the calculated position (ERP - active reservations - margin)
3. reservation created with a 4 h expiry, in a local transaction
4. the store receives the picking task in the portal
5a. the store confirms  → the adapter posts the sale to the ERP → reservation closed
5b. the store reports a stockout → reservation cancelled → the order is routed
    to the next origin, with no new payment
5c. it expires with no action → reservation released → the customer is notified
    with the option to change origin
```

Path 5b required the most product design: a stockout at the store cannot become an order
cancellation, because the customer has already paid and the goods exist at another origin.
The automatic rerouting, with a notice and a new lead time, was built together with store
operations — and it is why the stockout cancellation rate came in at 0.7%, against the 4%
projected in the initial design that assumed simple cancellation.

**With payment acquirers.** Asynchronous, with synchronous acceptance. The order is accepted
in under 400 ms and authorization happens in the background, because composed availability
with three external acquirers doesn't reach the 99.95% requirement in synchronous mode. See
[sync vs. async](/20-trade-offs/sync-vs-async.md).

**Between internal services.** Domain events for state propagation — inventory changed, order
created, payment authorized — over a managed messaging service. Queries between services are
synchronous, over HTTP with a declared contract.

**With the suite, during coexistence.** Bidirectional and explicitly temporary: the suite
publishes order events to the new services, and the new services write into the suite's
database through a compatibility layer. Each bridge has a recorded removal deadline.

## Security

```text
customer identity       a managed provider, federated with the existing
                        base of 8.4 million accounts
store operator
  identity              integrated with the corporate directory, with a
                        profile per store
authorization           per resource and per store — an operator only sees
                        and moves their own unit's inventory
payment data            never travels through nor rests in Vertena's
                        systems; tokenization at the acquirer
personal data           full classification and flow mapping,
                        with declared retention per point of rest
internal communication  mutual authentication enforced by the mesh; a service
                        with no valid identity receives no traffic
```

The point requiring the most attention is per-store authorization: 1,400 units with operators
who must not see each other's inventory. The rule is applied in the service, not in the
interface, and it is verified by an automated test on every change. See
[authorization models](/10-security/authz-models.md).

The personal data flow mapping found, during the project, three unforeseen points of rest:
application logs with national ID numbers, the staging environment with a production copy,
and a daily export to an analytics tool. See
[data flow diagrams](/17-architecture-documentation/data-flow-diagrams.md).

## Scalability

As the estimates showed, the challenge is not volume — it is **read distribution** and
**concentrated peaks**.

```text
catalog and storefront   edge cache with event-based invalidation;
                         target hit rate > 92%
availability             local cache per service, 30 s, invalidated
                         by inventory events
search                   replicated index, three read replicas
order                    simple horizontal scaling; 100 orders/s is served
                         by 6 instances with room to spare
reservation              a real contention point — reservations of the same SKU
                         at the same store serialize
```

The only point that required specific design was the **reservation**: during a campaign, the
same high-turnover SKU at the same store receives concurrent reservations. The solution is
row-level contention in the database with a short timeout, and not a distributed lock — the
volume doesn't justify it.

**Black Friday.** The capacity plan provides for 3× the observed peak, with manual scaling 48
hours in advance — automatic would be more elegant and less predictable, and operations
prefers predictability on the most important date of the year.

## Reliability

The 99.95% requirement on the purchase flow was decomposed per component, and not applied
uniformly. See [cost vs. reliability](/20-trade-offs/cost-vs-reliability.md).

```text
component           target     degradation when unavailable
catalog             99.9%      served from cache, with an age notice
availability        99.9%      falls back to "distribution center only"
reservation         99.95%     blocks store pickup; normal delivery continues
cart and order      99.95%     no degradation possible — it is the flow
payment             99.9%      accepts the order and authorizes later
search              99%        falls back to category navigation
promotions          99.5%      full price, with a credit afterwards
```

The promotions line is the most interesting decision of the set: during downtime, the order is
accepted at full price and the discount is applied as a credit afterwards. That was negotiated
with the commercial team and is preferable to refusing the sale.

**Degraded inventory mode.** If the ERP adapter is unavailable for more than 5 minutes, the
system stops offering store pickup and operates only with the distribution center — a visible
degradation, communicated on the storefront, rather than reservations against an unknown
position.

## Observability

```text
distributed tracing      across the whole purchase flow, with the order
                         identifier propagated through to the ERP
business metrics         conversion per step, successful reservation rate,
                         inventory divergence per store
technical metrics        latency per service, error rate, replication
                         lag, cache age
window-based alarms      inventory stale > 3 min → alarm
                         reservation failures > 1% → alarm
                         reconciliation divergence > 0.5% of a store → alert
                         to the manager, not to on-call
```

The last line is an operations design decision: an inventory divergence at a store is the
store's problem, not engineering's. The alert goes to whoever can resolve it.

During coexistence, a single dashboard shows what percentage of traffic is on each side of the
router, per route — it is the main instrument for tracking the migration.

## Deployment

```text
seven deployable units, each with its own pipeline
canary deployment for the purchase flow, at 5% → 25% → 100%
automatic rollback on error rate
freeze on structural changes between Oct 1 and Jan 15
the edge router is the only point of switchover and rollback
```

The router is the transition's most critical component and the simplest: it decides per route,
with dynamic configuration, and it allows reverting an extracted capability in seconds with no
deployment.

That property — **rollback in seconds, with no deployment** — is what made the leadership
comfortable with the incremental approach.

## Evolution Strategy

**Phase 1 (months 1–4): omnichannel availability.** Availability Service, Reservation Service,
ERP Adapter and Store Portal. No extraction from the suite — only new capability, integrated
by API. Delivers FR-1 to FR-3.

Expected result and what actually happened: a 14% increase in conversion, within the estimated
range.

**Phase 2 (months 5–11): catalog and search.** The first real extraction. The catalog becomes
in-house, the suite consumes from it through a bridge, and search moves to a dedicated index.

This phase tested the extraction pattern and produced the project's most expensive lesson: the
first attempt kept the suite as the catalog's source of truth, with bidirectional
synchronization. Three months later, recurring divergences forced the inversion — the new
catalog became the source of truth and the suite became read-only. **Bidirectional
synchronization between two sources of truth did not work**, and the lesson was recorded in an
ADR.

**Phase 3 (months 12–17): payment.** The extraction with the greatest contractual effect:
payment leaves the licensing scope and reduces the calculation base by 22%.

**Phase 4 (months 18–26): promotions.** The most complex, from coupling with the suite's cart.
It required a temporary bridge applying externally calculated promotions to the internal cart.

**Phase 5 (months 27–36): cart and order.** The last business capability. From here on the
suite serves only the admin portal and the history.

**Phase 6 (months 37–42): admin portal, history and shutdown.** Migration of the 2.1 TB of
history and termination of the contract, synchronized with the December 2028 expiry to avoid
the penalty.

**Conditions that would change the plan**, recorded in an ADR:

```text
if the suite's contract is terminated early by a commercial decision
  → Phase 5 moves up and the history migrates before the portal

if the store ERP gains a reservation API
  → the Reservation Service simplifies drastically and the safety
    margin per SKU stops being necessary

if the volume exceeds 500 sustained orders/s
  → the modular monolith decision for cart and order is reassessed

if the catalog cache hit rate drops below 80%
  → the invalidation strategy has to change before scaling reads
```

## Results

Numbers measured at the end of Phase 3, 17 months after the start:

```text
average time from business request to production  from 14 to 3 weeks
                                                  (extracted capabilities)
                                                  14 weeks (what is still
                                                  in the suite)
digital channel conversion                        +14%
digital revenue                                   from $152M to $204M
                                                  (market growth included)
annual license cost                               from $1.28M to $1.0M
product queue items delivered                     31 of 40
purchase flow availability                        99.96%
incidents caused by coexistence                   7, all on the Phase 2
                                                  catalog bridge
```

The most revealing item is the **dual lead time metric**: 3 weeks for what has moved out, 14
for what stayed. It made each extraction's benefit visible and became the argument for
sustaining the investment through the following phases.

## What this case teaches

**Scale was not the problem.** The capacity estimates — 100 orders/s, 12 thousand reads/s —
rule out any architecture justified by volume. The project is about speed of change, and
confusing the two is the most common error in e-commerce decisions.

**The extraction order is the architectural decision.** Choosing to start with the capability
that doesn't exist, rather than the easiest or the most valuable, is what made it possible to
deliver a result in four months with no regression risk.

**The vendor's limitation shaped the design.** The absence of a reservation API in the ERP
produced the Reservation Service, the adapter, the safety margin per SKU and the daily
reconciliation — about 40% of Phase 1's effort, from a constraint that appears in no
high-level diagram.

**Two sources of truth don't coexist.** The Phase 2 lesson is the most transferable: during a
migration, a piece of data has one source of truth, and the other end is read-only.
Bidirectional synchronization defers the decision and charges for it in divergence.

## Related Concepts

- [Strangling](/16-legacy-modernization/strangler-fig.md) — the migration pattern.
- [Anti-Corruption Layer](/08-integration-architecture/integration-anti-corruption.md).
- [Monolith vs. Microservices](/20-trade-offs/monolith-vs-microservices.md).
- [Strong vs. Eventual Consistency](/20-trade-offs/strong-vs-eventual-consistency.md).

## Practical Exercise

Redo the decision matrix swapping one weight: put **total cost over 4 years** at 40% and
reduce **reduction in change lead time** to 5%.

Recalculate. Does the winning option change? That exercise shows the decision was not in the
analysis — it was in the weights, which are a business choice.

## Interview Questions

- Why was the first capability extracted the one that didn't exist in the legacy system?
- How can two requirements over the same data — storefront and reservation — have opposite
  consistency needs?
- Which vendor constraint shaped 40% of the first phase's effort, and why wouldn't it appear
  in a context diagram?

## Further Reading

- Newman, Sam. *Monolith to Microservices*. O'Reilly, 2019.
- Hohpe, Gregor; Woolf, Bobby. *Enterprise Integration Patterns*. Addison-Wesley, 2003.
- Kleppmann, Martin. *Designing Data-Intensive Applications*. O'Reilly, 2017.

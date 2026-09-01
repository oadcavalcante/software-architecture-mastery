---
id: food-delivery
title: "Case: Food Delivery"
sidebar_position: 4
description: Real-time coordination between customers, restaurants and couriers, where the most important data ages in seconds.
doc_type: case-study
level: 0
difficulty: advanced
status: complete
objective: >
  By the end, the reader designs a real-time coordination system with geographic state,
  assignment under uncertainty and per-region degradation.
prerequisites: [trade-offs]
related: [ride-sharing, logistics, ecommerce]
canonical_for: []
translated_from_version: 2
last_reviewed: 2026-08-31
---

# Case: Food Delivery

:::note How to use this case

Read the context, requirements and constraints. **Stop before the architecture options** and
sketch your own in twenty minutes.

This case's numbers are **illustrative** (SPEC.md §8.2): plausible and internally
consistent, not measured in a named system. What is learned is the reasoning they
support, not the magnitudes.

:::

## Business Context

**Rapidão** is a food delivery platform operating in 62 cities, with 48 thousand registered
restaurants and a base of 190 thousand couriers, of whom about 34 thousand are active on a
typical day.

The business has a characteristic that sets it apart from e-commerce: **the product is
perishable and the deadline is the product**. An order delivered 40 minutes late is not an
order delivered late — it is cold food, and the customer doesn't come back. The company
measures that a delay of more than 15 minutes over the estimate reduces the probability of
another order by 31%.

Three pressures motivate revisiting the architecture:

**Delivery estimate accuracy.** The average error of the estimate shown to the customer is 11
minutes, and the product team correlates that directly with retention. The current estimate is
calculated with a static formula per region, without considering the operation's real state.

**Courier assignment.** Assignment is done by simple proximity, which produces two known
problems: couriers get rides that pass right by another restaurant with an order ready, and at
peak times there are regions with orders and no couriers while neighboring regions have idle
couriers.

**Infrastructure cost.** The platform spends $6.2 million a year on cloud, and 44% of that is
consumed by courier position tracking — 34 thousand devices sending a location every 4 seconds.

## Functional Requirements

The system has three audiences with different needs, and it is useful to separate them.

For the **customer**: search available restaurants considering distance and delivery time;
build and submit an order; follow its state in real time, including the courier's position; and
be told about delays before having to ask.

For the **restaurant**: receive orders; confirm or decline within a short window; report the
actual preparation time; and signal when the order is ready for pickup.

For the **courier**: receive ride offers compatible with their position and route; accept or
decline; navigate to the restaurant and to the customer; and record pickup and delivery.

And for the **platform**: assign couriers to orders optimizing time and cost; estimate delivery
time accurately; detect and react to delays; and balance supply and demand per region, with
dynamic incentives.

Assignment is the core of the product. Everything else exists to enable it or to communicate
its result.

## Non-Functional Requirements

```text
availability of order creation            99.95%
availability of assignment                99.9%
p99 of restaurant search                  < 600 ms
p99 of order creation                     < 1.5 s
time to assign a courier                  < 20 s from the moment the
                                          order is confirmed
latency of the courier position shown
  to the customer                         < 8 s
delivery estimate error                   < 5 min in 80% of orders
menu inconsistency window                 < 2 min
courier position retention                90 days
```

The 20-second requirement for assignment is the most restrictive. It is not arbitrary: beyond
that, the restaurant starts preparing without knowing whether anyone will collect, and the
waste shows up as prepared food waiting.

## Constraints

```text
devices            the courier app runs on low-cost handsets with unstable
                   connectivity; losing signal for minutes is normal,
                   not an exception
geography          62 cities with very different densities: from 4 thousand
                   active couriers in a capital to 40 in a smaller city
regulatory         couriers are not employees; the platform cannot impose
                   a route or working hours, only offer
cost               leadership set a ceiling on infrastructure cost growth
                   at 50% of order growth
team               120 engineers, 18 in the logistics domain
real time          the customer expects to see the courier moving; stopping
                   showing it is perceived as an app failure
```

The device connectivity constraint is the one that most affects the design: a system that
presumes continuous connectivity with 34 thousand couriers doesn't work in the real world.

## Capacity Estimates

```text
orders/day, average                    1.9 million
orders/s, average                      ~22
peak (Friday and Saturday, 7-9pm)      ~340 thousand/h  →  ~94/s
observed instantaneous peak            ~210/s
design margin (3×)                     ~650/s
```

The order volume, once again, is modest. What is not modest is the volume of **positions**:

```text
simultaneous active couriers, peak      ~34 thousand
position send frequency                 1 every 4 s
positions/s at peak                     ~8,500/s
positions/day                           ~420 million
raw volume/day                          ~34 GB
```

Eight thousand five hundred writes per second of data that ages in seconds and is queried by
two audiences with opposite needs: the customer wants **their** courier's position with low
latency; the assignment engine wants the positions of **all** couriers in a region, aggregated.

And the search queries:

```text
restaurant searches/day                 ~14 million
search peak                             ~1,200/s
restaurants per search, after the
  geographic filter                     ~180 on average
```

**The conclusion that guides the design:** the system has a small transactional core (orders)
and two high-volume subsystems with completely different characteristics (position and search).
Treating them with the same architecture would be expensive in all three.

## Architecture Options

The main decision point is **where the position state lives and how assignment queries it**.

### Option A — Position in the transactional database

Every position received updates a row in the main relational database. Assignment queries that
database with a geographic filter.

```text
simplicity           high — one database, one model
cost                 8,500 writes/s on the main database, with replication
                     and retention: estimated at $4.2M/year
query latency        good with an appropriate geospatial index
risk                 position writes compete with order writes; a position
                     spike affects order creation
```

### Option B — Position in an in-memory store, with asynchronous history

The current position lives in an in-memory key-value store, partitioned by region. The history
is written asynchronously to cheap storage, for analysis and disputes.

```text
cost                 estimated at $1.28M/year
latency              better — reads from memory
isolation            position doesn't compete with orders
loss                 positions can be lost on a store failure;
                     acceptable, since the next arrives in 4 s
geographic query     requires indexing by geographic cell in the application
```

### Option C — Stateful stream processing

Positions enter an event stream; a stateful processor maintains the per-region view and
publishes aggregates. Assignment consumes the aggregates.

```text
cost                 estimated at $1.82M/year
latency              +200 to 500 ms of processing window
capability           better for complex logic over the position series
                     (speed, heading, arrival prediction)
complexity           high — distributed state, reprocessing, ordering
team                 nobody with experience in the technology
```

## Trade-off Analysis

| Criterion | Weight | A — Database | B — In-memory | C — Stream |
|---|:-:|:-:|:-:|:-:|
| Infrastructure cost | 30% | 2 | 9 | 7 |
| Assignment latency | 20% | 7 | 9 | 6 |
| Isolation from the order flow | 20% | 2 | 9 | 8 |
| Team capability | 15% | 9 | 8 | 3 |
| Support for prediction logic | 10% | 4 | 5 | 9 |
| Operational complexity | 5% | 9 | 7 | 3 |
| **Weighted total** | | **4.7** | **8.4** | **6.5** |

The 30% weight on cost reflects the leadership constraint — it is a declared business
constraint, and ignoring it would produce a proposal that wouldn't be approved.

**Sensitivity analysis.** With cost at 10% and prediction capability at 30%, the totals become
5.1 / 7.5 / 7.3 — Option B still wins, narrowly. With isolation at 40%, they become 3.6 / 8.7 /
7.2. The conclusion is stable, and the scenario in which C gets close is precisely the one
where arrival prediction becomes the product.

## Decision

**Position in an in-memory store partitioned by region (Option B)**, with asynchronous history
in cheap storage and indexing by geographic cell.

**Under what condition each discarded option would win:**

**Option A would win if** the number of active couriers were an order of magnitude smaller —
below ~3 thousand simultaneous, the cost stops being relevant and the simplicity of a single
database dominates. That is the case for a platform operating in a few cities.

**Option C would win if** arrival prediction based on a time series of positions became a
product differentiator, or if the platform needed historical reprocessing to train models
continuously. The condition is recorded: when the estimate error drops below 5 minutes by other
means and the next improvement depends on trajectory modeling, the decision is reassessed.

## Components

The system is organized into four domains with clear boundaries.

**Catalog and search domain.** Restaurants, menus, availability and the geographic search
index. Predominantly reads, tolerant of a few minutes of staleness.

**Order domain.** Creation, restaurant confirmation, lifecycle and payment. It is the
transactional core, with strong consistency and the lowest volume of the four.

**Position domain.** Position ingestion, current state per courier, aggregation by region and
history. High volume, ephemeral data, tolerant of loss.

**Assignment domain.** The engine that matches orders and couriers, the delivery estimate
calculation and per-region incentive management. It consumes from the previous three.

In addition, a **real-time communication service** keeps connections open with customers,
restaurants and couriers, and is the only door through which updates are pushed.

Separating position from assignment deserves an explanation: they are two problems with
opposite load profiles. Position is a massive write of simple data; assignment is a read of
aggregates with intensive computation. Keeping them together would let the cost of scaling one
contaminate the other.

## Data

**Position.** Each courier's current state lives in memory, keyed by geographic cell and
courier identifier.

```text
key       region:geo_cell:courier
value     lat, lon, heading, speed, battery, state, updated_at
TTL       45 s — a courier with no position for 45 s leaves the grid
```

The TTL is an important decision: instead of explicitly managing couriers that lost
connectivity, the system lets them expire. That makes losing signal — which is common — a normal
case rather than an error to handle.

**Geographic cell.** The territory is divided into fixed-size hexagonal cells. Each position is
indexed by the cell it falls in, and a proximity query reads the restaurant's cell and its
neighbors.

That replaces the geospatial query with reads of known keys, which is orders of magnitude
cheaper. The cost is precision: couriers on the edge of a distant cell may be missed. The
mitigation is to use two rings of neighbors in low-density regions.

**Position history.** Written asynchronously, compressed, to object storage partitioned by day
and region. It is queried only for disputes and analysis — about 400 queries a day over 420
million daily records, which fully justifies slow and cheap storage.

**Order.** PostgreSQL, with the lifecycle as an explicit state machine. The volume is low and
consistency has to be strong: an order cannot be assigned to two couriers.

**Catalog.** PostgreSQL as the source of truth, with a dedicated search index fed by events.
Each item's availability — which changes through the day, as ingredients run out — is propagated
within a window of up to 2 minutes, which is the requirement.

## Integration

**Position ingestion.** It is the highest-volume path and the one that has to be cheapest.
Positions arrive over a persistent connection, in batches of up to 5 points, compressed. The app
accumulates locally when it loses signal and sends the batch on reconnecting, with the original
timestamps.

That decision — accumulate and send in batches — is what reduced ingestion cost by 38%, and it
exists because of the connectivity constraint. The system treats reconnection with a delayed
batch as a normal case.

**Assignment.** When an order is confirmed by the restaurant, the assignment engine queries the
courier grid of the relevant cells, calculates a score per candidate and sends offers.

The score combines distance to the restaurant, the courier's current heading, the estimated
remaining preparation time, the order value and acceptance history. Offers are sent to up to 3
candidates simultaneously, and the first acceptance wins — which requires acceptance to be an
atomic operation in the order domain.

**Real-time communication.** Persistent connections with three audiences, with distinct
strategies: the customer receives the courier's position every 5 seconds only while the tracking
screen is open; the restaurant receives order notifications; the courier receives offers and
route updates.

The restriction of only sending position with the screen open sounds obvious and was not the
previous behavior — on its own it cut outbound traffic by 22%.

## Security

```text
courier position          sensitive personal data; 90-day retention,
                          restricted and logged access
position shown to the
  customer                only during an active delivery, and only for the
                          courier on their order
payment data              tokenized, outside the platform's scope
support access            historical position requires a justification and is
                          logged; bulk queries are blocked
restaurant                sees the customer's address only after order
                          confirmation, and for a limited time
courier                   sees the full address only after pickup
```

The last two lines are privacy decisions that are also product decisions: they reduce the
surface for misuse of customer addresses, which is a real risk in this category.

The personal data flow mapping identified that position history, cross-referenced with orders,
allows reconstructing a customer's routine. The 90-day retention and the segregation of position
history from the order domain are a direct consequence of that mapping. See
[data flow diagrams](/17-architecture-documentation/data-flow-diagrams.md).

## Scalability

The system scales by **region**, not globally. Each region has its own position grid, its own
assignment engine and capacity sized by the local pattern.

That has three positive consequences. Cost follows real density: a city with 40 couriers doesn't
pay for a capital city's infrastructure. A failure stays contained within a region. And the peak
— which is synchronized within a city but not across different time zones and habits — is
absorbed with less aggregate idle capacity.

The Friday and Saturday evening peak is predictable and concentrated. Capacity is raised on a
schedule, not reactively — scaling reactively with a 20-second assignment requirement is too
tight.

The real contention point is **offer acceptance**: when three couriers receive the same offer,
acceptance has to be atomic. The solution is row-level contention on the order, with a short
timeout — not a distributed lock, because the volume doesn't justify it.

## Reliability

The system degrades in layers, and each degradation was designed and communicated.

If a region's **position grid** becomes unavailable, assignment falls back to a fixed-radius
mode from the last known position in the history, with a widened window. It is worse, and it
works.

If the **assignment engine** fails, orders go into a queue and are assigned when it returns. The
restaurant is told not to start preparing — which avoids the waste the 20-second requirement
exists to prevent.

If **real-time communication** goes down, the apps switch to polling the state periodically, at a
longer interval. The customer sees the position update more slowly, with a notice.

If the **catalog** becomes unavailable, search is served from the index, which is a copy. New
orders keep being accepted with a possibly stale menu, and the restaurant's confirmation
resolves divergences.

If the **order** service becomes unavailable, there is no degradation: nothing works. It is the
component with the highest target and the only one with no alternative.

## Observability

The most important metrics in this system are business metrics, not technical ones.

```text
time to assignment, p50 and p95, per region
rate of orders with no courier within 60 s, per region
delivery estimate error, distribution
offer acceptance rate, per courier and per region
ratio of active couriers to orders, per cell
positions received/s, and rate of delayed batches
cost per order, calculated and tracked
```

The ratio of couriers to orders per cell is the central operational indicator: it precedes the
problem. When it drops below a threshold in a region, the system triggers a dynamic incentive
before orders start running late.

**Cost per order** as a continuously tracked metric was a consequence of the budget constraint.
It is broken down by domain, and each team sees its own share — which produced optimizations no
directive would have produced.

## Deployment

Deployment by region, in waves: small cities first, then medium, then capitals. A change to the
assignment engine spends 48 hours in at least three small cities before reaching the largest
market.

Changes to the assignment algorithm are evaluated by controlled experiment, with comparable
regions split between versions — because the effect of an assignment change only shows up in
aggregate business metrics, and not in testing.

No structural change between Thursday and Sunday. The weekend peak concentrates 41% of weekly
volume.

The wave-based deployment window has a secondary effect the team came to value more than the
risk control itself: it produces a period in which two versions of the assignment engine operate
in comparable regions, which gives a natural read of the change's effect on business metrics.
Before the waves, an algorithm change was evaluated by comparison with the previous week — and
delivery volume varies so much with weather, holidays and campaigns that the comparison rarely
concluded anything.

## Evolution Strategy

**Phase 1 (months 1–4): position grid.** Migration of tracking to the in-memory store, with
asynchronous history. It delivers the cost reduction, which funds the rest of the project.

**Phase 2 (months 5–8): score-based assignment.** Replacement of simple proximity with a
multi-factor score, with a controlled experiment by region.

Measured result: time to assignment dropped from 34 s to 11 s at p95, and the rate of orders
with no courier within 60 s dropped from 4.1% to 0.9%.

**Phase 3 (months 9–13): dynamic estimate.** The estimate starts considering the real
preparation time observed per restaurant and per hour, courier density in the region and traffic
conditions.

The average error dropped from 11 min to 6.2 min. The requirement of 5 min in 80% of orders was
met for 74% — below target, and the bottleneck identified was preparation time variability,
which belongs to the restaurant and not to the platform.

**Phase 4 (months 14–18): supply balancing.** Dynamic incentives per cell, triggered by the
ratio of couriers to orders, before the delay occurs.

**Phase 5 (months 19–24): prediction.** Trajectory modeling to predict arrival, which reopens
the evaluation of Option C.

**Conditions that would change the plan:**

```text
if preparation time variability dominates the estimate error
  → the problem belongs to the restaurant, and the solution is product
    (a tablet with confirmation that preparation has started), not architecture

if the number of simultaneous couriers exceeds 100 thousand
  → the cell grid needs a hierarchy, not just partitioning

if arrival prediction becomes a competitive differentiator
  → Option C is reassessed for the position domain

if regulation creates an employment relationship for couriers
  → the offer-and-acceptance model changes completely, and the assignment
    engine becomes scheduling, not an auction
```

The last condition is the most relevant and the least technical: a regulatory change would turn
the problem from "offer and wait for acceptance" into "assign and guarantee coverage", which is
a different architecture.

## Results

Numbers at the end of Phase 4, 18 months after the start:

```text
infrastructure cost                     from $6.2M/year to $3.8M/year,
                                        with 34% growth in orders
cost per order                          -47%
time to assignment, p95                 from 34 s to 9 s
orders with no courier within 60 s      from 4.1% to 0.6%
estimate error, average                 from 11 min to 6.2 min
orders delayed > 15 min                 from 8.4% to 3.1%
customer retention at 90 days           +6.8 pp
```

The retention gain is the result the company considers decisive, and it is a direct consequence
of reducing delays — which was the project's thesis.

It is worth noting what the cost reduction enabled, beyond the savings themselves: the $2.4
million a year freed up fully funded Phases 2 to 4, which made the project self-sustaining from
the fourth month on. That was a deliberate sequencing choice — starting with the phase that pays
for the following ones, rather than with the one that delivers the most product value. It is the
same extraction-order reasoning as the [e-commerce](/21-case-studies/ecommerce.md) case, applied
to a different criterion.

## What this case teaches

**One system, three load profiles.** Orders are transactional and small; position is a massive
and ephemeral write; search is read-heavy and tolerant. Applying the same architecture to all
three would be expensive in all of them.

**Ephemeral data doesn't deserve durability.** Positions that age in 4 seconds don't need
transactions, synchronous replication or hot retention. Treating them as transactional data cost
$4.2 million a year to guarantee a property nobody used.

**The connectivity constraint shaped the design.** Accumulated batches, original timestamps, TTL
instead of disconnection management — three decisions that only make sense for someone operating
with handsets that lose signal, and that reduced cost and complexity at the same time.

**The system's limit was not the system.** Phase 3 reached 74% against a target of 80%, and the
bottleneck was the variability of restaurants' preparation time. No architectural decision would
have solved it — and recognizing that avoided months of optimizing in the wrong place.

## Related Concepts

- [Case: Ride-Sharing](/21-case-studies/ride-sharing.md) — the same coordination problem, with
  different constraints.
- [Case: Logistics](/21-case-studies/logistics.md).
- [Hotspots](/11-scalability/hotspots.md).
- [Graceful Degradation](/12-reliability/graceful-degradation.md).

## Practical Exercise

Calculate the annual cost of storing 420 million positions a day in a relational database with
synchronous replication and 90-day retention, and compare it with an in-memory store with a
45-second TTL plus compressed objects.

The difference is the reason this case exists.

## Interview Questions

- Why does the 45-second TTL turn losing a connection into a normal case?
- Why does indexing by geographic cell replace a geospatial query, and what is lost?
- Why does assignment send an offer to three candidates, and what does that require of the
  order domain?

## Further Reading

- Kleppmann, Martin. *Designing Data-Intensive Applications*. O'Reilly, 2017.
- Uber Engineering. *H3: Hexagonal Hierarchical Spatial Index*, 2018.
- Nygard, Michael. *Release It!*. 2nd ed. Pragmatic Bookshelf, 2018.

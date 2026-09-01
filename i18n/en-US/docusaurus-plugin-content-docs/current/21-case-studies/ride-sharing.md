---
id: ride-sharing
title: "Case: Ride-Sharing"
sidebar_position: 8
description: Matching supply and demand in real time, where the architectural decision is the size of the decision window.
doc_type: case-study
level: 0
difficulty: advanced
status: complete
objective: >
  By the end, the reader designs a real-time matching system and understands why deciding in
  batches is better than deciding immediately.
prerequisites: [trade-offs]
related: [food-delivery, logistics, messaging-platform]
canonical_for: []
translated_from_version: 2
last_reviewed: 2026-08-31
---

# Case: Ride-Sharing

:::note How to use this case

Read the context, requirements and constraints. **Stop before the architecture options** and
sketch your own in twenty minutes.

This case's numbers are **illustrative** (SPEC.md §8.2): plausible and internally
consistent, not measured in a named system. What is learned is the reasoning they
support, not the magnitudes.

:::

## Business Context

**Levo** is a ride-sharing platform operating in 34 cities, with 2.1 million monthly active
riders and 380 thousand registered drivers, of whom about 96 thousand go online on a typical
day.

The product has an essential difference from [delivery](/21-case-studies/food-delivery.md): here
both sides of the match are moving, and the rider is physically waiting on the street. An
assignment error doesn't produce cold food — it produces someone standing at a corner for twenty
minutes.

Two pressures motivate revisiting the architecture:

**Match quality.** The current assignment is greedy: each request is assigned to the nearest
available driver, at the instant it arrives. The data team demonstrated, with simulation over
real history, that deciding in batches of a few seconds would reduce average wait time by 18%
and drivers' idle mileage by 12% — with not one additional driver.

**Cost and latency of the position state.** The system maintains the position of 96 thousand
drivers with an update every 3 seconds, in a geospatial database that has become the latency
bottleneck and the largest infrastructure cost item.

## Functional Requirements

For the **rider**: estimate price and time before requesting; request a ride with origin and
destination; watch the driver approaching; change the destination during the ride; pay
automatically; and rate at the end.

For the **driver**: go online and available; receive ride offers with enough information to
decide; accept or decline; navigate; and track earnings.

For the **platform**: match requests and drivers optimizing rider wait and driver idleness;
price dynamically according to supply and demand per region; detect and handle cancellations and
problem rides; and ensure safety on both sides, with tracking and emergency escalation.

Matching is the product. Dynamic pricing is the mechanism that keeps supply and demand balanced
when matching alone cannot.

## Non-Functional Requirements

```text
p95 of time to assignment                < 8 s
p99                                      < 20 s
p95 of price and time estimation         < 700 ms
latency of the driver position shown
  to the rider                           < 5 s
availability of requesting               99.95%
availability of assignment               99.9%
error of the arrival time estimate       < 2 min in 85% of cases
tracking precision for safety            position every 10 s, retained 6 months
cost per ride                            30% reduction
```

The 8-second requirement for assignment is comfortable compared with the common perception that
matching has to be instantaneous — and it is that slack that makes batch decisions possible.

## Constraints

```text
geography          34 cities with very different densities; a capital
                   has 9 thousand drivers online at peak, a mid-sized
                   city has 90
devices            low-cost handsets, with unstable connectivity;
                   losing signal is routine
regulatory         tracking mandatory during the ride; 6-month retention;
                   emergency escalation with a response deadline
drivers            not employees; the platform offers, it doesn't assign;
                   average decline rate of 23%
safety             verified identity on both sides; the platform answers
                   for incidents occurring during the ride
team               140 engineers, 26 in the matching domain
cost               a -30% per-ride target, from leadership
```

The 23% decline rate is the most interesting constraint: it means an assignment is not a
decision, it is a **proposal**. An algorithm that ignores acceptance probability produces matches
that are optimal on paper and bad in practice.

The effect is concrete and asymmetric. The driver nearest a request may be precisely the one
least likely to accept it — because the ride goes to an area that is hard to get out of, or
because the fare is low for the pickup distance. Assigning to them and getting a decline costs a
whole cycle, and the rider waits longer than they would have if the platform had offered to the
second nearest, who would have accepted.

Modeling that requires accepting that the platform doesn't control the other side. It is a legal
constraint — there is no employment relationship — that becomes an architectural constraint, and
no amount of distance optimization compensates for ignoring it.

## Capacity Estimates

```text
rides/day                           1.4 million
rides/s, average                    ~16
peak (Friday 6-8pm)                 ~230 thousand/h  →  ~64/s
instantaneous peak (rain + rush)    ~180/s
design margin                       ~500/s

drivers online, peak                ~96 thousand
position every 3 s                  ~32,000 positions/s
positions/day                       ~2.1 billion
```

As in the previous cases, the transactional volume is modest and the position volume is large.
But there is one number this system has and the others don't:

```text
simultaneous requests in the same 5 s window,
  in a capital at peak                          ~90
available drivers in the same region            ~1,400
possible combinations to evaluate               ~126,000
time available to evaluate                      < 5 s
```

One hundred and twenty-six thousand combinations every five seconds, per city. That is the
computational problem the architecture has to accommodate, and it doesn't exist in the greedy
model — because the greedy model evaluates one request against a few candidates and is done.

In practice the matrix is pruned before being solved: candidates more than 12 minutes of travel
away are discarded, which reduces the 126 thousand combinations to about 3 thousand in dense
regions. Pruning is what makes exact resolution viable within the time budget, and the 12-minute
limit is a per-region parameter — in sparse areas it rises to 25 minutes, because discarding
distant candidates there would mean serving nobody.

That density-based tuning is a recurring theme in the system: almost every parameter that works
in a capital is wrong in a city with 90 drivers online, and treating them with the same
configuration was the cause of much of the previous design's problems.

```text
storage
  rides, 5 years                    ~2.5 billion  →  ~1.4 TB
  positions, 6 months               ~380 billion  →  ~28 TB compressed
  driver online state               ~96 thousand records
```

## Architecture Options

The axis is **when and how the matching decision is made**.

### Option A — Immediate greedy

Each request is assigned as soon as it arrives, to the best candidate available at that instant.

```text
latency           excellent — an immediate decision
quality           suboptimal; ignores requests that will arrive in 2 s
simplicity        high
cost              low
concurrency       two simultaneous matches can contend for the same
                  driver, requiring a lock
```

It is the current architecture.

### Option B — Batch with a fixed window

Requests are accumulated over a window of a few seconds and solved together, as an assignment
problem.

```text
latency           +2 to 5 s, within the 8 s budget
quality           better — the simulation indicates -18% wait
cost              higher per decision, lower per ride (less
                  idle mileage)
complexity        medium — solving batch assignment, per region
concurrency       eliminated within the batch
```

### Option C — Batch with an adaptive window and prediction

Like Option B, with the window adjusted by local density and with prediction of the requests
that will arrive in the next interval.

```text
latency           variable — 1 s in a dense region, 6 s in a sparse one
quality           better still, if the prediction is good
complexity        high — prediction, dynamic window, more parameters
risk              a bad prediction worsens the result instead of improving it
```

## Trade-off Analysis

| Criterion | Weight | A — Greedy | B — Fixed batch | C — Adaptive batch |
|---|:-:|:-:|:-:|:-:|
| Match quality | 35% | 3 | 8 | 9 |
| Perceived latency | 20% | 9 | 7 | 8 |
| Complexity and risk | 20% | 9 | 6 | 3 |
| Cost per ride | 15% | 4 | 8 | 8 |
| Team capability | 10% | 9 | 7 | 4 |
| **Weighted total** | | **6.0** | **7.3** | **7.1** |

The contest between B and C is close, and the difference is risk: Option C depends on
prediction, and a bad prediction degrades matching instead of improving it. Option B delivers
most of the gain without that dependency.

**Sensitivity analysis.** With quality at 50% and complexity at 10%, the totals become 4.8 /
7.7 / 8.2 — Option C wins. That scenario corresponds to an organization with a mature data
science capability and an appetite for operating a model in production on the critical path.

## Decision

**Batch with a fixed window (Option B)**, with the window configurable per city and the
assignment problem solved per independent geographic region.

```text
default window           4 s
window in capitals       3 s
window in low-density
  cities                 6 s
```

The resolution uses a classic assignment algorithm over the cost matrix between requests and
candidate drivers, with the cost incorporating distance, estimated arrival time, current heading
and the **acceptance probability** estimated for that pair.

Acceptance probability is what turns a theoretical match into a useful one, given the 23%
decline rate.

**Under what condition each discarded option would win:**

**Option A would win if** the latency requirement were far tighter — below 2 seconds — or in
cities with density so low that there is rarely more than one request per window. In practice,
it remains in use: cities where the average number of requests per window is below 1.3 operate
in greedy mode, because with a batch of one element the two algorithms are identical and greedy
is cheaper.

**Option C would win if** short-term demand prediction reaches sufficient accuracy not to
degrade the result, which is measured continuously in a simulation environment. The condition is
recorded: when the error of the next-interval request prediction drops below 15%, the adaptive
window is reassessed.

## Components

**Request Service.** Receives the ride request, estimates price and time, and hands the request
to matching.

**Availability Grid.** Maintains, per region and geographic cell, which drivers are online and
available, with position and heading.

**Matching Engine.** Accumulates requests within the window, builds the cost matrix, solves the
assignment and issues offers. One instance per region.

**Offer Service.** Sends the offer to the driver and collects acceptance or decline, with a
deadline.

**Ride Service.** Ride lifecycle: accepted, en route, in progress, completed. A state machine
with strong consistency.

**Position Ingestion.** Receives the 32 thousand positions per second and updates the grid.

**Pricing Service.** Base price, estimation and dynamic multiplier per region.

**Safety Service.** Tracking during the ride, route anomaly detection and emergency escalation.

**Payment Service.** Charging at the end of the ride and payout to the driver.

Separating the **Availability Grid** from **Position Ingestion** is deliberate: the first keeps
only the state needed for matching, updated at the frequency matching needs; the second records
the complete series for tracking and safety. They are two requirements over the same data, with
very different costs.

## Data

**Availability grid.** In-memory store, partitioned by region.

```text
key       region:cell:driver
value     lat, lon, heading, speed, state, last_offer_at
TTL       30 s
```

The TTL treats losing signal as a normal case, as in the delivery case. A driver who disappears
from the grid reappears with the next position received.

The `last_offer_at` field exists to avoid the previous product's most frustrating problem: a
driver who declined an offer immediately received another, sometimes the same one, and reported
being harassed by the app. The rule is a minimum interval between offers to the same driver.

**Positions for safety.** A compressed time series, partitioned by day and region, on cheap
storage. Queried rarely — about 900 times a day, almost all for incident investigation — over
2.1 billion daily records.

The 6-month retention is regulatory, and the data is sensitive: it allows reconstructing anyone's
movements. Access requires a recorded justification and is audited.

The flow mapping of that data found, in the first review, four unforeseen points of rest: an
analytics warehouse with complete positions and no purge deadline, exports to a visualization
tool, application logs with coordinates, and a staging environment loaded with a production
copy. All four were dealt with, and the lesson was recorded: sensitive data leaks to wherever
nobody looked, and the mapping has to be exhaustive before declaring retention. See
[data flow diagrams](/17-architecture-documentation/data-flow-diagrams.md).

**Ride.** PostgreSQL, an explicit state machine, strong consistency. The volume is low — 16 per
second on average — and correctness is critical: a ride assigned to two drivers is an incident
with people involved.

**Cost matrix.** Ephemeral, built in memory each window and discarded. It is not persisted — only
the assignment result and aggregate metrics are kept, for algorithm evaluation.

## Integration

**The matching cycle**, which is the system's core:

```text
t+0 s    requests arrive and are accumulated per region
t+4 s    the window closes
         the engine reads the region's availability grid
         builds the requests × candidates matrix
         solves the assignment
t+4.3 s  offers are sent
t+4.3 to drivers accept or decline; a 12 s deadline
t+16 s
t+16 s   unmatched requests return to the next window,
         with raised priority
```

Re-entry with raised priority is what prevents a request in a difficult region from going
indefinitely unassigned: with every unmatched cycle, its weight in the cost matrix increases,
and the search radius for candidates widens.

After three cycles with no assignment — about 50 seconds — the rider is told the wait is above
normal and gets the option to wait at a dynamic price or cancel at no cost.

**Offers.** Sent over a persistent connection to the driver app, with a push notification as a
fallback. An offer is exclusive for 12 seconds: within that window, that driver receives no
other.

**Dynamic pricing.** Calculated per cell, based on the ratio of unmatched requests to available
drivers. It is updated every matching cycle, which keeps it synchronized with the mechanism it
exists to influence.

**Safety.** During the ride, the position is sent every 10 seconds and compared with the expected
route. A significant deviation, a prolonged stop in an unusual place or a manual press of the
emergency button triggers the safety protocol, with active contact and, if necessary,
escalation to the authorities.

## Security

```text
identity           verified on both sides, with a document and biometrics
tracking           mandatory during the ride; visible to the rider
                   and to shared contacts
historical
  position         sensitive data; 6-month retention; access with a
                   recorded justification and audit
contact details    masked between the parties; calls and messages
                   are brokered by the platform
payment            tokenized, outside the platform's scope
emergency          a priority channel, independent of the rest of the
                   system, with its own availability target
ratings            aggregated; neither party sees the other's individual
                   rating in real time, to prevent retaliation
```

The emergency channel with independent infrastructure is the most important safety decision: it
shares no components with the ride flow, precisely because it has to work when the rest is not
working.

## Scalability

The system scales by **region**, and that is the structural decision that makes everything else
tractable. Each region has its grid, its matching engine and capacity sized by local density.

The assignment problem is solved per region, which keeps the matrix at a tractable size: 90
requests × 1,400 candidates in a capital, against the absurdity of solving it nationally.

Regions are defined by density, not by administrative boundary. A capital has 12 regions; a
mid-sized city has one. The boundary between regions is a real problem — a request at the edge
may have its best candidate on the other side — and it is handled by including candidates from
neighboring regions in the matrix, with a cost penalty.

The Friday evening peak combined with rain is the sizing scenario. It is partly predictable: the
platform consumes a weather forecast and raises capacity preemptively.

## Reliability

If a region's **Matching Engine** fails, that region falls back to greedy mode — which is Option
A's code, kept in production. Match quality worsens and the service continues.

If the **Availability Grid** becomes unavailable, matching uses the last known position from the
safety store, with a widened radius. It is worse and it works.

If the **Ride Service** fails, rides in progress continue — the state is in both sides' apps —
and new assignments stop. It is the most serious degradation.

If **Pricing** fails, the price falls back to the base, with no multiplier. Commercially bad,
operationally harmless.

If the **Safety Service** fails, rides in progress are not interrupted, and a maximum-severity
alarm fires — this is the only component whose unavailability is treated as a critical incident
even with no immediate effect on the product.

## Observability

```text
time to assignment, p50/p95/p99, per region and density band
rate of requests unmatched after 3 cycles
offer acceptance rate, per driver, region and hour
idle mileage per ride
ratio of requests to available drivers, per cell
error of the arrival time estimate
matrix resolution time, per region
positions received/s and rate of drivers with an expired TTL
```

The **offer acceptance rate** is the metric that validates the acceptance probability used in the
cost matrix. If the observed rate diverges from the estimated one, the cost model is wrong and
matching is suboptimal even with the correct algorithm.

That feedback loop — comparing predicted with observed and adjusting — is what allowed match
quality to keep improving after launch, with no architectural change.

## Deployment

Deployment by region, with greedy mode always available as a fallback. Changes to the matching
algorithm are evaluated by controlled experiment between comparable regions, because the effect
only shows up in aggregate metrics over days.

No structural change on Fridays, nor on the eve of a holiday.

Deployment by region has an additional property that proved valuable: since the matching
algorithm is the same code operating with different parameters per region, a change can be tested
with conservative parameters in one region and aggressive ones in another, over the same period.
That separated, on several occasions, the effect of the code change from the effect of the
parameter tuning — a distinction the previous team could not make and that produced wrong
conclusions about what had worked.

The matching engine has a **simulation over history** mode that allows evaluating an algorithm
change against weeks of real data before any deployment. It was that mode that produced the -18%
estimate that justified the project, and it remains the first gate for any change.

## Evolution Strategy

**Phase 1 (months 1–4): in-memory grid.** Migration of the availability state from the geospatial
database to an in-memory store per region. It delivers cost and latency reduction, with no change
to the algorithm.

**Phase 2 (months 5–9): batch matching.** The engine with a fixed window, enabled per region,
starting with mid-sized cities. Greedy mode remains as a fallback.

Measured result in the first cities: average wait time -15%, idle mileage -9% — below the
simulation's -18% and -12%, and in the right direction.

**Phase 3 (months 10–13): acceptance probability.** Incorporating the acceptance estimate into
the cost matrix. It is what closes the gap with the simulation — the simulated model assumed
deterministic acceptance.

**Phase 4 (months 14–18): window by density and dynamic regions.** Tuning the window per city and
redefining region boundaries based on observed flow, not administrative geography.

**Phase 5 (months 19–24): short-term prediction.** Reassessment of Option C, conditional on
prediction accuracy.

**Conditions that would change the plan:**

```text
if the error of the next-interval request prediction
  drops below 15%
  → the adaptive window (Option C) is reassessed

if the decline rate drops below 5%
  → acceptance probability stops being relevant in the
    matrix, and the model simplifies

if regulation creates an employment relationship
  → matching becomes scheduling, and offers with declines
    cease to exist

if any region exceeds ~400 requests per window
  → exact resolution of the matrix becomes expensive, and
    approximation or region subdivision is required
```

## Results

Numbers at the end of Phase 4, 18 months after the start:

```text
average rider wait time                 -21%
p95 of time to assignment               from 14 s to 6.2 s
idle mileage per ride                   -14%
offer acceptance rate                   from 77% to 86%
infrastructure cost per ride            -38% (the target was -30%)
requests unmatched after 3 cycles       from 2.8% to 0.7%
average driver earnings per hour        +11%
rider cancellations                     -19%
```

The 11% increase in driver earnings per hour is the result the company considers most strategic:
it comes from reduced idle mileage, and it improves driver retention — which is the supply
constraint of the entire business.

## What this case teaches

**Deciding later can decide better.** The greedy model optimizes each request in isolation and
produces a worse aggregate result. Four seconds of waiting buy a view of the whole, and the whole
has solutions the individual decision cannot see.

**An assignment without acceptance is a proposal.** With a 23% decline rate, the match that is
optimal on paper is not optimal in practice. Incorporating acceptance probability is what closed
the gap between the simulation and the real result.

**Two requirements over the same data, two stores.** Position for matching has to be fast,
current and ephemeral; position for safety has to be complete, retained and cheap. Serving both
with the same structure was expensive and served both badly.

**The simple mode stays in production.** Greedy mode was not removed: it is the matching engine's
degradation and it is the algorithm used in low-density cities, where the two are equivalent.
Keeping the old solution as a live path is cheaper than rebuilding it under pressure.

## Related Concepts

- [Case: Food Delivery](/21-case-studies/food-delivery.md) — the same problem, different
  constraints.
- [Case: Logistics](/21-case-studies/logistics.md).
- [Hotspots](/11-scalability/hotspots.md).
- [Graceful Degradation](/12-reliability/graceful-degradation.md).

## Practical Exercise

Simulate, on paper, three requests and three drivers with known distances. Solve it greedily —
assigning each request in arrival order to the nearest available driver — and then by the optimal
assignment for the set.

Construct an example where greedy produces a total distance 40% worse. It is not hard, and it is
this case's entire argument.

## Interview Questions

- Why does accumulating requests for four seconds improve the aggregate result?
- Why does acceptance probability have to enter the cost matrix?
- Why are the availability grid and the position history different stores?

## Further Reading

- Kuhn, Harold. *The Hungarian Method for the Assignment Problem*. Naval Research, 1955.
- Kleppmann, Martin. *Designing Data-Intensive Applications*. O'Reilly, 2017.
- Nygard, Michael. *Release It!*. 2nd ed. Pragmatic Bookshelf, 2018.

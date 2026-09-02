---
id: logistics
title: "Case: Logistics and Delivery Network"
sidebar_position: 9
description: A network of 41 centers and 9 thousand vehicles, where planning is daily and reality changes every hour.
doc_type: case-study
level: 0
difficulty: advanced
status: complete
objective: >
  By the end, the reader designs a system that combines batch planning with continuous
  replanning, and knows where each belongs.
prerequisites: [trade-offs]
related: [ride-sharing, food-delivery, ecommerce]
canonical_for: []
translated_from_version: 5
last_reviewed: 2026-08-31
---

# Case: Logistics and Delivery Network

:::note How to use this case

Read the context, requirements and constraints. **Stop before the architecture options** and
sketch your own in twenty minutes.

This case's numbers are **illustrative**: plausible and internally
consistent, not measured in a named system. What is learned is the reasoning they
support, not the magnitudes.

:::

## Business Context

**Trilha** is a logistics operator doing last-mile delivery for retailers and e-commerce
platforms. It runs 41 distribution centers, 3 sorting hubs and a fleet of about 9 thousand
vehicles, both owned and contracted.

Volume: 2.3 million parcels per day, with contracted deadlines ranging from same-day to five
business days.

The essential difference from the [ride-sharing](/21-case-studies/ride-sharing.md) and
[delivery](/21-case-studies/food-delivery.md) cases is the horizon: here planning is done the
night before, for the next day, with complete information — and then reality dismantles it.
Traffic, an absent recipient, a broken-down vehicle, a lost parcel and a wrong address divert
between 12% and 18% of the daily plan.

Two pressures motivate the review:

**Cost per delivery.** The network operates at an average 68% of vehicle capacity, and
leadership set a target of reducing cost per delivery by 20%.

**Deadlines.** The on-time delivery rate is 91.4%, against 96% contracted with the largest
customers. Contractual penalties totaled $6.2 million last year.

## Functional Requirements

For **center operations**: receive and check loads; sort by route; load vehicles per the plan;
and record departure.

For the **driver**: receive the day's route, ordered; navigate; record a delivery, a failed
attempt or a refusal; collect proof; and receive a reassignment when the route changes.

For the **end customer**: track the parcel; receive an estimated delivery window; reschedule; and
choose an alternative pickup point.

For the **contracting customer** — the retailer: send the day's parcels with deadlines; track
performance; and receive proof of delivery.

And for the **platform**: plan the day's routes optimizing capacity utilization and deadlines;
replan continuously as deviations occur; predict delay risk before it happens; and balance load
across centers.

The plan/replan pair is the core. They are two problems with opposite natures — one in batch with
complete information, the other continuous with partial information — and the architecture has to
accommodate both without one contaminating the other.

## Non-Functional Requirements

```text
daily planning window                    < 90 min (between 10pm and 11:30pm)
p95 of replanning one route              < 30 s
p95 of a tracking query                  < 500 ms
availability of the driver app           99.9%, with offline operation
availability of tracking                 99.95%
accuracy of the estimated delivery window ± 60 min in 85% of cases
delivery record synchronization          < 5 min after reconnecting
proof of delivery retention              5 years (contractual and tax)
cost per delivery                        20% reduction
```

The 90-minute planning window is the system's hardest time constraint: at 11:30pm the centers
start sorting, and a plan that isn't ready means manual sorting, which is slower and more
expensive.

## Constraints

```text
offline operation   the driver loses signal in rural areas and inside
                    buildings; the app has to work with no connection
                    for hours and synchronize afterwards
mixed fleet         owned vehicles with telemetry and contracted ones
                    with none; the available information differs
delivery windows    urban circulation restrictions by time of day and
                    vehicle type
contractual deadline penalties for late delivery, per customer
physical capacity   each vehicle has a limit of volume, weight and
                    number of stops
drivers             regulated working hours, with a cap and
                    mandatory breaks
team                98 engineers; 21 in the planning domain
input data          the retailer sends the day's list at 9pm;
                    delays and corrections arrive until 11pm
```

The offline operation constraint is what most affects the driver app's design: it is not a client
of a remote system, it is a local system that synchronizes.

That distinction looks like vocabulary and is architecture. A remote client assumes the server is
available and treats the absence of a connection as an error; a local system assumes the opposite
and treats a connection as an opportunity to synchronize. The two premises lead to completely
different data structures, conflict handling and user experience — and converting one into the
other later is a rewrite, not an adjustment.

The previous app was a remote client with a cache. It worked while there was signal, and degraded
unpredictably when there wasn't — which is exactly the behavior that produced lost delivery
records.

## Capacity Estimates

```text
parcels/day                          2.3 million
vehicles on route/day                ~9,000
stops per route, average             ~140
stops/day                            ~1.26 million
                                     (a stop can have several parcels)

tracking events/day                  ~28 million
                                     (pickup, sorting, loading, departure,
                                      attempt, delivery)
events/s, average                    ~324
peak (6-9pm, concentrated deliveries) ~2,100/s

tracking queries/day                 ~41 million
peak                                 ~1,800/s
```

The transactional volume is modest. The computational problem is in the planning:

```text
routes to plan per night             ~9,000
stops to distribute                  ~1.26 million
time available                       90 min
constraints per route                capacity, circulation window,
                                     working hours, deadline per parcel,
                                     vehicle-cargo compatibility
```

Routing 1.26 million stops across 9 thousand vehicles with five families of constraints, in 90
minutes, is this system's real sizing problem. It looks like none of the previous cases.

And it has a property that changes the approach: the problem is **decomposable**. One center's
stops don't compete with another's, because each center has its own fleet and its own coverage
area. That turns a problem of 1.26 million stops into 41 problems of about 31 thousand, solvable
in parallel.

Recognizing the decomposability early is what makes the 90-minute window achievable. Without it,
the problem is intractable in the available time with any technique — and the previous attempt to
solve it globally was abandoned after producing plans that didn't finish before 2am.

```text
storage
  parcels, 5 years                   ~4.2 billion  →  ~2.6 TB
  tracking events, 5 years           ~51 billion   →  ~11 TB
  proofs (photo and signature)       ~380 TB
  vehicle telemetry, 90 days         ~4 TB
```

## Architecture Options

The axis is **how planning and replanning relate**.

### Option A — Batch planning, manual replanning

The plan is generated at night; during the day, deviations are handled by the operations desk, by
people.

```text
plan quality         good, with complete information
response to deviation slow and inconsistent; depends on the desk
cost                 high in operations staff (142 people)
scale                the desk is the bottleneck on bad days
```

It is the current architecture.

### Option B — Batch planning, local automatic replanning

The nightly plan stays, and each route is replanned automatically when it deviates, considering
only that route's remaining stops.

```text
plan quality         the same as Option A
response to deviation fast and consistent
scope                local — it doesn't reallocate between routes
cost                 lower in staff
complexity           medium
limitation           a broken-down vehicle requires reallocation between
                     routes, which the local scope doesn't do
```

### Option C — Continuous planning

The plan is recalculated continuously through the day, considering all routes in a region
together.

```text
quality              theoretically better — it reallocates between routes
response to deviation optimal
complexity           high — the full problem every cycle
instability          routes changing during the day confuse drivers
                     and invalidate the sorting, which is already done
computational cost   high
```

Option C has a problem that is not technical: **the cargo is already in the vehicle**.
Reallocating a parcel between routes at 2pm requires two vehicles to meet, which rarely pays off.

## Trade-off Analysis

| Criterion | Weight | A — Manual | B — Local | C — Continuous |
|---|:-:|:-:|:-:|:-:|
| On-time delivery rate | 30% | 4 | 8 | 8 |
| Operating cost | 25% | 3 | 8 | 7 |
| Physical feasibility | 20% | 8 | 9 | 3 |
| Complexity and risk | 15% | 8 | 6 | 3 |
| Team capability | 10% | 9 | 7 | 4 |
| **Weighted total** | | **5.7** | **7.8** | **5.6** |

The physical feasibility criterion exists because Option C runs into a real-world constraint, not
a software one: the cargo is physically in the vehicle, and moving parcels between routes during
the day is expensive and slow. An architecture that optimizes while ignoring that produces plans
operations doesn't execute.

**Sensitivity analysis**, redistributing the remaining weight proportionally across the other criteria. With deadlines at 50%, the totals become
5.2 / 7.9 / 6.3 — Option B keeps its advantage. No scenario tested inverts the result, which follows from Option C having a
structural limitation and not merely a higher cost.

## Decision

**Batch planning with local automatic replanning (Option B)**, complemented by a restricted
mechanism for reallocation between routes for specific cases — a broken-down vehicle, and
deadline-critical parcels the current route will not manage to meet.

Reallocation between routes is triggered by exception and goes through approval by the desk,
which still exists, but with 44 people instead of 142 — handling exceptions rather than operating
all day.

**Under what condition each discarded option would win:**

**Option A would win if** the volume were far smaller — below a few hundred daily routes, a small
desk responds well and automation doesn't pay for itself.

**Option C would win if** the cargo were not physically committed to a vehicle. That is the case
for operations with dense transfer hubs, where reallocating is cheap — or for motorcycle deliveries
from pickup points, where each parcel is independent. The condition is recorded: if the network
adopts urban transfer hubs, Option C is reassessed.

## Components

**Order Intake.** Ingestion of the retailers' lists, with address validation and deadline
classification.

**Night Planner.** The batch routing engine. Runs between 10pm and 11:30pm, per center.

**Replanner.** Recalculates the order of a route's remaining stops when it deviates.

**Route Service.** The state of each route and each stop; the source of truth for the plan.

**Driver App.** A local system with synchronization; operates offline.

**Tracking Service.** Parcel events and public lookups.

**Delay Predictor.** Estimates the risk of a route missing its deadlines, in advance.

**Proof Service.** Photos, signatures and delivery documents.

**Exceptions Desk.** The operations team's tool for the cases automation escalates.

**Capacity Service.** Load balancing between centers, over a horizon of days.

Separating the **Night Planner** from the **Replanner** is the system's structural decision. They
are two different engines, with different objectives: the first optimizes globally with time to
spare; the second responds locally in seconds. Trying to use the same engine for both was the
initial attempt, and it failed on both sides — too slow for replanning, and too simple for the
nightly plan.

## Data

**Parcel and route.** PostgreSQL, with the parcel lifecycle as a state machine. The volume is low
and correctness matters: a parcel on two routes is a direct operational problem.

**The day's plan.** Materialized per route, with the sequence of stops and the estimated windows.
Written once by the Night Planner and altered by the Replanner through the day, with versioning —
the driver app needs to know whether its copy is stale.

**Tracking events.** Append-only, partitioned by day. Each event carries its origin, the device
time and the server time, because the difference between the two is information: an event recorded
offline arrives late, and the real chronological order is the device's.

**Proof.** Object storage, with the 380 TB dominated by photos. It is the largest storage item and
one of the largest cost items, and it was optimized by compression and resolution reduction — the
photos exist to prove delivery, not for photographic use.

**Local app state.** An embedded database on the device, with the day's complete route and the
queue of pending events. It is the source of truth while the driver is offline, and it
synchronizes by reconciliation on reconnecting.

## Integration

**Nightly ingestion.** The lists arrive at 9pm, with corrections until 11pm. The system accepts
the initial list, starts preparation — address validation, geocoding, grouping by region — and
incorporates the corrections until the cutoff.

Geocoding is the silent bottleneck: about 4% of addresses don't resolve automatically, and that is
92 thousand a night. The solution was a cache of already-resolved addresses — which covers 89% of
cases, because most deliveries go to addresses already visited — and an assisted resolution queue
for the rest.

The address cache has a relevant side effect: it stores not the coordinate returned by the
geocoder, but the **coordinate corrected by the driver**. When a delivery is recorded at a point
significantly different from the expected one, the system proposes the correction, and addresses
with a consistent history of correction start using the real position.

That solved a class of problem no geocoding vendor solves: gated communities with an entrance far
from the formal address, service entrances, and rural areas where the postal address points at the
center of the locality. About 340 thousand addresses were corrected that way in the first year,
and the average stop time at those points dropped by 4 minutes.

**Planning.** Executed per center, in parallel. Each center is an independent problem, which
allows full parallelization and meeting the 90-minute window.

The engine solves by decomposition: first it groups stops into geographic clusters, then it solves
the order within each cluster, then it assigns clusters to vehicles respecting capacity and
working hours. It is a heuristic, not an optimal solution — and the measured difference against
the optimal solution, on small instances where it is computable, is between 3% and 6%.

**Replanning.** Triggered by an event: a failed attempt, accumulated delay above a threshold, or a
window change by the recipient. It recalculates only the order of the remaining stops, which is a
small problem and resolves in under 30 seconds.

**App synchronization.** The app downloads the complete route before departure and operates
offline. Events are accumulated locally with the device timestamp, and sent in batches when there
is a connection.

Conflicts are rare and have a clear rule: the device's event wins over the server's state, because
the driver was the one who was there. The exception is cancellation by the customer, which always
wins.

## Security

```text
proof of delivery        photo and signature are personal data;
                         restricted access, 5-year retention
addresses                sensitive data; the driver sees only
                         their own day's stops
public tracking          the tracking code reveals neither the full
                         address nor the recipient's name
vehicle telemetry        the driver's position during their shift;
                         restricted access, declared use
contracted drivers       contracted drivers access only
                         their own route, with verified identity
retailer
  integration            mutual authentication, versioned contracts
```

The decision that public tracking must not reveal the full address came from an industry incident:
sequential tracking codes allowed enumerating deliveries and discovering addresses. Trilha's codes
are non-sequential and the public lookup shows only city and state until the recipient
authenticates.

## Scalability

The system scales by **center**. Each of the 41 centers is an independent planning unit, which
makes the nightly problem parallelizable and daytime operations isolated.

Nightly planning is the system's computational peak, and it is concentrated: 90 minutes of intense
use, 22 and a half hours of idleness. Capacity is provisioned on demand for the window and
released afterwards, which reduced that stage's cost by 74% against fixed capacity.

Public tracking — 41 million queries a day — is served by a cache with event-based invalidation,
with a 94% hit rate. Almost all queries are repeats: the recipient checks several times in the
same day.

## Reliability

If the **Night Planner** fails, the previous day's plan is reused as a base and adjusted manually
by the desk. It is the system's worst-case scenario, and the only one with a contingency plan
rehearsed quarterly.

If the **Replanner** becomes unavailable, routes follow the original plan and the desk handles
deviations manually. It is degradation to Option A's mode.

If the **Route Service** fails, the apps keep operating with the local copy — which is the most
valuable property of the offline design. The day's delivery doesn't stop.

If **Tracking** becomes unavailable, operations continue and the end customer doesn't look
anything up.

If **Proof** fails, the photos stay on the device and synchronize later. The delivery is recorded;
the proof arrives late.

The property that sustains all of that is that **the driver app is autonomous**. A central failure
delays the information, not the physical operation.

## Observability

```text
on-time delivery rate, per center, route and contracting customer
average vehicle utilization
stops per route, planned versus completed
plan deviation: stops out of the planned sequence
nightly planning execution time, per center
replanning trigger rate, by cause
predicted delay risk versus delay that occurred
events pending synchronization, per device and age
automatic geocoding rate
```

**Plan deviation** is the most informative and least obvious metric: it measures how much of
reality the plan didn't anticipate, and analyzing the causes is what feeds the planner's
improvement. It was discovered, for example, that 31% of deviations came from urban circulation
windows modeled incorrectly — a data correction, not an algorithm one.

**Predicted versus actual delay risk** validates the Predictor. It exists to alert the desk before
the delay, and a predictor with low precision generates alarms that consume the team without
preventing anything.

## Deployment

The night planner is deployed with parallel validation: the new version runs alongside the current
one for two weeks, and the plans are compared by quality metrics — utilization, total distance,
delay risk — before any switch.

No planner deployment between 8pm and 2am. A failure there has no recovery within the window.

Parallel comparison of the planner has a specific difficulty worth recording: the two plans cannot
both be executed, only one goes to operations. The evaluation is done on plan metrics —
utilization, distance, predicted risk — and not on the real result, which means one version can
look better on paper and produce a worse result on the street.

The mitigation was running the new version in three centers for two weeks before general adoption,
with the real result measured. Two of the five versions evaluated in that process were rejected
despite better plan metrics — in both cases because they produced geographically compact routes
that ignored unmodeled traffic patterns.

The driver app has its own cycle, with 6 months of backward compatibility — part of the contracted
fleet uses handsets that rarely update.

## Evolution Strategy

**Phase 1 (months 1–5): batch planner.** Replacement of semi-automatic planning with full routing,
with parallel validation.

Measured result: average utilization from 68% to 79%, total distance per delivery -11%.

**Phase 2 (months 6–10): local automatic replanning.** Reduced load on the desk and a consistent
response to deviations.

Result: on-time delivery rate from 91.4% to 94.8%; the desk reduced from 142 to 78 people.

**Phase 3 (months 9–14): robust offline app.** Rewriting the driver app as a local system with
synchronization, instead of a remote client.

This phase resolved an entire class of problems that was not in the initial diagnosis: 6% of
deliveries had a lost or duplicated record from a connection failure at the moment of recording.

**Phase 4 (months 15–19): delay prediction.** Anticipating risk, alerting the desk before the
delay occurs.

**Phase 5 (months 18–24): reallocation between routes by exception.** The restricted mechanism for
broken-down vehicles and critical deadlines.

**Conditions that would change the plan:**

```text
if the network adopts urban transfer hubs
  → reallocating between routes becomes cheap, and Option C is reassessed

if the volume per center exceeds ~90 thousand parcels/day
  → the 90 min window gets tight and the center has to be
    subdivided into planning units

if the share of contracted fleet with no telemetry exceeds 60%
  → delay prediction loses signal and needs another
    source of information

if contracted deadlines migrate mostly to
  same-day delivery
  → nightly planning stops making sense, and the
    model converges toward the delivery one
```

The last condition is the most likely and the most transformative: same-day delivery eliminates
the premise of complete information the night before, which is the basis of the whole
architecture.

## Results

Numbers at the end of Phase 4, 19 months after the start:

```text
on-time delivery rate                  from 91.4% to 96.3%
contractual penalties                  from $6.2M/year to $1.36M/year
average vehicle utilization            from 68% to 81%
total distance per delivery            -16%
cost per delivery                      -24% (the target was -20%)
people on the operations desk          from 142 to 44
lost delivery records                  from 6% to 0.1%
nightly planning time                  62 min, p95 (a 90 min window)
```

## What this case teaches

**Two horizons, two engines.** Planning with complete information and time to spare is one
problem; replanning with partial information in seconds is another. Using the same engine for both
fails on both sides, and that was the first attempt.

**The physical constraint limits the optimization.** Option C is better on paper and unviable in
practice, because the cargo is inside the vehicle. Modeling the physical world correctly
eliminated an option a purely algorithmic analysis would have chosen.

**The offline client is a system, not a screen.** Treating the driver app as a local system with
synchronization — and not as a client of a server — resolved 6% of lost records that no
connectivity improvement would have solved.

**Deviations are data about the plan.** Measuring how much of reality the plan didn't anticipate,
and analyzing the causes, produced the project's cheapest improvement: 31% of deviations came from
wrong urban circulation data, fixable without touching the algorithm.

## Related Concepts

- [Case: Ride-Sharing](/21-case-studies/ride-sharing.md).
- [Case: Food Delivery](/21-case-studies/food-delivery.md).
- [Case: Omnichannel E-commerce](/21-case-studies/ecommerce.md) — the other end of the same chain.
- [Graceful Degradation](/12-reliability/graceful-degradation.md).

## Practical Exercise

List the constraints of a routing problem in your context — capacity, window, deadline, working
hours — and classify each as a hard constraint or a penalty.

The difference decides the algorithm: hard constraints can make the problem infeasible, and
penalties cannot. Confusing them is the most common cause of planners that produce no solution.

## Interview Questions

- Why doesn't the same engine serve both planning and replanning?
- Why does the cargo being physically in the vehicle eliminate an architecture option?
- Why does the driver app have to be a local system, and not a remote client?

## Further Reading

- Toth, Paolo; Vigo, Daniele. *Vehicle Routing: Problems, Methods, and Applications*. SIAM, 2014.
- Kleppmann, Martin. *Designing Data-Intensive Applications*. O'Reilly, 2017.
- Nygard, Michael. *Release It!*. 2nd ed. Pragmatic Bookshelf, 2018.

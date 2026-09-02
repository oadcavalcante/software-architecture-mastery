---
id: high-volume-events
title: "Case: High-Volume Event Processing"
sidebar_position: 14
description: 4.2 million events per second of industrial telemetry, where the decision is what to discard and when.
doc_type: case-study
level: 0
difficulty: advanced
status: complete
objective: >
  By the end, the reader sizes a continuous streaming system deciding aggregation, retention
  and delivery guarantees per event class, rather than uniformly.
prerequisites: [trade-offs]
related: [video-streaming, social-network, logistics]
canonical_for: []
translated_from_version: 4
last_reviewed: 2026-08-31
---

# Case: High-Volume Event Processing

:::note How to use this case

Read the context, requirements and constraints. **Stop before the architecture options** and
sketch your own in twenty minutes.

This case's numbers are **illustrative**: plausible and internally
consistent, not measured in a named system. What is learned is the reasoning they
support, not the magnitudes.

:::

## Business Context

**Sensia** operates an industrial monitoring platform for 340 plants — mining, pulp and paper,
steel and power generation. Each plant has between 4 thousand and 90 thousand sensors sending
telemetry continuously: temperature, vibration, pressure, current, flow.

The product delivers three things: real-time dashboards for the control room, alarms when a
measurement leaves the safe range, and predictive analysis of equipment failure.

The third is what justifies the price. An unplanned shutdown of a clinker kiln costs between $80
thousand and $400 thousand a day, and predicting the failure 48 hours in advance turns an
emergency shutdown into scheduled maintenance.

Two pressures motivate the review:

**Cost.** The platform spends $14.2 million a year, of which 58% — $8.2 million — goes to storing
raw telemetry
that is almost never read. Leadership set a target of a 40% reduction in cost per monitored
sensor.

**Alarm latency.** The p99 of the time between the sensor reading and the alarm in the control
room is 34 seconds. For safety measurements — pressure in a vessel, temperature in a bearing —
that is unacceptable, and two customers have already flagged the problem in operational safety
audits.

## Functional Requirements

For the **control room**: see the current state of any sensor with minimal delay; receive an alarm
when a measurement crosses a limit; and view recent trends.

For **maintenance engineering**: analyze an equipment's history over months or years; correlate
measurements; and receive failure predictions with lead time and a confidence level.

For **plant management**: track equipment efficiency and availability indicators; and compare
across shifts, lines and plants.

For **Sensia**: onboarding a new plant with no development; and training predictive models over
the history of every plant.

The first three audiences have incompatible requirements over the same data: the control room
wants minimal latency and doesn't care about history; engineering wants a long history and
tolerates seconds; management wants aggregates and tolerates minutes.

## Non-Functional Requirements

```text
p99 latency for a safety alarm               < 1 s
p99 for an operational alarm                 < 5 s
p99 for a dashboard update                   < 3 s
availability of ingestion                    99.99%
availability of alarming                     99.99%
loss of a safety event                       0
loss of an operational event                 < 0.1% acceptable
retention of raw data                        30 days
retention of aggregates                      5 years
retention for critical measurements          10 years, raw
                                             (regulatory requirement)
cost per monitored sensor                    40% reduction
```

The split between "zero loss" for safety events and "0.1% acceptable" for operational ones is the
decision that unlocks all the possible savings — and it had to be negotiated with customers,
because the previous platform promised zero loss for everything.

## Constraints

```text
connectivity       plants in remote areas, with unstable links;
                   some over satellite, with 600 ms latency
                   and outages of hours
sensors            equipment 5 to 25 years old, with old industrial
                   protocols; none will be replaced
regulatory         measurements tied to process safety have retention
                   and integrity required by standards
plants             340 installations, each with operational
                   autonomy and little tolerance for change
team               68 engineers; 15 on the data platform
cost               the -40% target comes from leadership
real time          the control room accepts no degradation;
                   a dashboard that lags produces an immediate
                   complaint from the operator
```

The connectivity constraint is what structures the design: a plant that loses its link for 6 hours
cannot stop monitoring, and cannot lose the period's safety events.

## Capacity Estimates

```text
plants                               340
sensors, total                       ~12.4 million
average reading frequency            1 every 3 s (ranging from 100 ms to 60 s)
events/s, average                    ~4.2 million
events/s, peak                       ~6.1 million
events/day                           ~363 billion
```

Four million two hundred thousand events per second. This is the first case in this set where
scale **is** the problem — and the comparison with the earlier ones is instructive: the payments
and banking cases had hundreds of operations per second and complex architectures; this one has
millions and a conceptually simpler architecture, because the data is small, uniform and
disposable.

```text
average event size                   ~48 bytes
raw volume/day                       ~17 TB
raw volume/year                      ~6.4 PB
```

And the usage distribution:

```text
events that trigger an alarm                   ~0.003%
events read in a real-time dashboard           ~2%
events read in historical analysis, raw        ~0.4%
events used only in aggregates                 ~97.6%
events never read in any form                  ~71%
```

Seventy-one percent of events are never read. Raw storage as a whole costs $8.2 million a year, and
since the event has a fixed size, those 71% account for about $5.8 million — and that line is the
answer to the cost problem.

Obtaining that distribution was a project in itself. The previous system did not record which
events were read; the information had to be reconstructed by instrumenting queries for three
months and correlating with the sensors accessed. Before that, the retention discussion was
conducted with opinions — "engineering may need it" — and no numbers.

That pattern repeats in data systems: the decision of how much to retain depends on knowing what
is read, and almost no platform measures that, because measuring access is work and the default
answer "keep everything" requires no justification.

## Architecture Options

The axis is **where the data is reduced and what is preserved**.

### Option A — Ingest everything, process later

Every event goes into storage; alarms and aggregates are computed from queries.

```text
alarm latency         bad — it depends on a query over a high volume
cost                  maximum — everything stored raw
flexibility           maximum — any future analysis is possible
simplicity            high
```

It is the current architecture, and it explains the 34 seconds of latency and the 58% of cost in
storage.

### Option B — Stream processing, with aggregation at ingestion

Events pass through a continuous processor that evaluates alarms, computes aggregates and decides
what to store raw.

```text
alarm latency         excellent — evaluated in passing
cost                  much lower — only what is needed is stored raw
flexibility           lower — a future analysis over discarded data
                      is impossible
complexity            medium to high
```

### Option C — Edge processing, inside the plant

A node at each plant evaluates alarms locally and sends only aggregates and relevant events.

```text
alarm latency         optimal — it doesn't depend on the link
cost                  minimal in bandwidth and central storage
resilience            the plant stays monitored with the link down
complexity            high — 340 nodes to operate and update
flexibility           lower still
```

### Option D — Edge with central streaming

A node at the plant for alarms and resilience; stream processing at the center for aggregation,
cross-plant correlation and model training.

```text
alarm latency         optimal
cost                  low
resilience            high
complexity            high — two levels of processing
predictive capability preserved — the center sees every plant
```

## Trade-off Analysis

| Criterion | Weight | A — All central | B — Central stream | C — Edge only | D — Edge + stream |
|---|:-:|:-:|:-:|:-:|:-:|
| Alarm latency | 30% | 2 | 7 | 10 | 10 |
| Cost | 25% | 1 | 8 | 9 | 8 |
| Resilience to link failure | 20% | 1 | 2 | 10 | 9 |
| Cross-plant predictive capability | 15% | 9 | 9 | 2 | 9 |
| Operational complexity | 10% | 9 | 6 | 3 | 3 |
| **Weighted total** | | **3.3** | **6.5** | **7.9** | **8.5** |

**Sensitivity analysis**, redistributing the remaining weight proportionally across the other
criteria. With complexity at 30%, the totals become 4.6 / 6.3 / 6.8 / 7.2. With predictive
capability at 35%, they become 4.6 / 7.1 / 6.5 / 8.6 — Option D keeps its advantage in both.

Option C wins in no scenario for the same reason: with no central view, the predictive model
is trained only on one plant's history, and most of the product's value comes from learning from
340.

## Decision

**Edge with central streaming (Option D)**, with each measurement's classification determining its
treatment at both levels.

```text
measurement class     treatment at the edge       central treatment
safety                local alarm, persistent     raw storage,
                      buffer, guaranteed          10 years, guaranteed
                      delivery                    delivery
operational           local alarm, aggregation    aggregates 5 years,
                      in a 10 s window            raw 30 days
                                                  0.1% loss acceptable
trend                 aggregation in a 60 s       aggregates only,
                      window                      5 years
diagnostic            stored locally,             sent on demand
                      sent on demand
```

The **diagnostic** class is the decision with the greatest cost effect: these are high-frequency
measurements used only when a failure is being investigated. They sit in a local 7-day circular
buffer and are only uploaded when someone asks — which happens for about 0.2% of sensors a month.

The 7-day window was negotiated with maintenance engineering and is that class's central
compromise: failure investigations begin, in 94% of cases, within 3 days of the event. The
remaining 6% are late investigations, and for those the raw data no longer exists — the aggregate
remains.

Accepting that loss was difficult and was decided with numbers: extending the window to 30 days
would cost $1.8 million a year to serve 6% of investigations, most of which reach a conclusion
with the aggregates. The decision is recorded with that calculation, and it is reviewed annually.

On its own, that class represents 61% of raw volume and came to cost almost nothing.

**Under what condition each discarded option would win:**

**Option A would win if** the volume were orders of magnitude smaller, or if there were no cost
constraint. It is the most flexible, and that flexibility has value when cost is not the problem.

**Option B would win if** the plants had reliable connectivity. With no link failures, the local
node is unnecessary complexity — and for the 84 plants with stable links, Sensia is evaluating
operating them in mode B, with no local node, which is recorded as a possible simplification.

**Option C would win if** the product were monitoring and alarming only, with no prediction.
Cross-plant prediction is what requires the center.

## Components

**Edge Node.** One per plant. Collects from the sensors, evaluates alarms, aggregates, decides
what to send, and keeps a local buffer. It is the most replicated component and the hardest to
operate.

**Protocol Collector.** Inside the edge node, translates the old industrial protocols into the
internal model.

**Central Ingestion.** Receives what comes from the 340 plants.

**Stream Processor.** Aggregation, cross-plant correlation, pattern detection.

**Hot Storage.** Recent raw data and aggregates, for interactive queries.

**Cold Storage.** Long series, for analysis and training.

**Alarm Service.** Consolidation, deduplication and routing of alarms; the alarm is generated at
the edge and routed by the center.

**Dashboard Service.** Serves the real-time and historical visualizations.

**Model Platform.** Trains and serves the predictive models.

**Sensor Catalog.** Metadata: which sensor, on which equipment, of which class, with which
limits.

The **Sensor Catalog** is the component that looks administrative and is central: the
classification of each of the 12.4 million sensors determines how it is treated at both levels. A
misclassified sensor is either too expensive, or fails to raise an alarm when it should.

## Data

**Event model.** Deliberately minimal.

```text
event    (sensor_id, timestamp, value, quality)
         ~48 bytes, with sensor_id as an integer and
         quality as a 1-byte enumeration
```

There is no sensor name, unit, plant or equipment in the event — all of that is in the catalog,
and including it would multiply the volume by four. It is aggressive normalization justified
exclusively by scale.

**Time series.** Specialized storage, partitioned by plant and by period, with compression
specific to series.

Compression is what makes the savings viable: industrial sensor series are highly compressible,
because consecutive values vary little. The measured ratio is 11:1 for operational measurements
and 22:1 for stable ones.

```text
raw volume/day                      ~17 TB
after classification and discard
  at the edge                       ~2.9 TB
after compression                   ~260 GB/day
```

From 17 TB to 260 GB a day. Classification accounts for 83% of the reduction, and compression for
the rest.

**Aggregates.** Pre-computed in three windows — 1 minute, 15 minutes and 1 hour — with minimum,
maximum, mean, deviation and count. They cover 97.6% of queries.

Computing aggregates at ingestion rather than at query time is what makes it possible to answer a
question about a year of data in under a second, over a volume a scan would take minutes to
traverse.

**Edge buffer.** Local storage at each plant, sized for 7 days of every sensor. It is what
guarantees zero loss of safety events during a link outage.

## Integration

**Sensor collection.** The system's most irregular point. These are industrial protocols from
different generations, some with severe limitations — one of them allows no more than 200 readings
per second per controller, which requires distributing the collection.

The Protocol Collector isolates that irregularity. Each protocol has an adapter, and the rest of
the system sees only events in the internal model.

**Edge to center.** Sent in compressed batches, with acknowledgment. Safety events use guaranteed
delivery with per-batch acknowledgment; operational ones use optimistic delivery, with tolerated
loss.

During a link outage, the node keeps operating: local alarms work, data goes to the buffer, and
synchronization occurs on reconnection — with priority for safety events.

```text
behavior during a link outage
  safety alarms             work locally, with a siren at the plant
  operational alarms        work locally
  central dashboard         shows the plant as "no communication",
                            with the last known state and its age
  buffer                    accumulates; 7-day capacity
  reconnection              sends safety first, then
                            operational, then aggregates
```

The longest outage on record was 41 hours, at a plant with a satellite link during a storm. No
safety event was lost, and the central dashboard correctly indicated the absence of communication
throughout the period.

**Alarms.** Generated at the edge, routed by the center. That division is deliberate: generating
them at the center would add the link's latency to the safety critical path; routing them at the
edge would require every node to know the escalation structure and the on-call contacts.

**Prediction.** Models trained at the center, with data from every plant, and served both at the
center and — for lightweight models — at the edge. A model that detects a vibration anomaly runs
locally and doesn't depend on the link.

## Security

```text
network segregation   the plant's industrial network is separate from
                      the corporate one; the edge node is the only point
                      of contact, with unidirectional flow by default
commands              the platform is read-only: it writes to no
                      industrial controller
authentication        mutual between the edge node and the center, with
                      a per-plant certificate
data                  industrial telemetry is commercially sensitive
                      information; per-customer isolation
access                per plant and per role; an operator sees
                      only their own unit
integrity             events for critical measurements have end-to-end
                      integrity verification, per regulation
edge node
  updates             signed, with automatic rollback; a plant
                      cannot be left unmonitored by a failed
                      update
```

The decision that the platform is **read-only** — never sending a command to a controller — is the
most important in the security design. It eliminates an entire class of risk: a compromise of the
platform cannot alter the industrial process.

It was contested by customers who wanted automatic actuation — stopping equipment on detecting an
anomaly — and was upheld. The compromise was to raise the alarm at maximum priority and leave
actuation to the plant's own safety systems, which are certified for it.

## Scalability

The system scales along two independent dimensions, and that separation is what makes it
tractable.

**Per plant.** Each edge node is sized for its plant's sensors. A plant with 90 thousand sensors
has a bigger node; one with 4 thousand, a smaller one. Adding plants doesn't affect existing ones.

**At the center.** Ingestion and stream processing are partitioned by plant, which gives natural
parallelism and limits the blast radius of any problem.

The center processes about 340 thousand events per second — not 4.2 million — because the edge has
already reduced them. That 12× reduction at the center's input is what makes the central
architecture conventional.

```text
events/s generated at the sensors    ~4,200,000
events/s sent to the center          ~340,000
events/s stored raw                  ~62,000
```

## Reliability

If an **edge node** fails, that plant loses monitoring. It is the most serious scenario, and that
is why the nodes are redundant: two units per plant, with the second taking over automatically.
Plants with critical safety measurements have three.

If the **link** goes down, the node operates alone. It is the scenario the entire edge design
exists for, and it happens on average 4 times a month at some plant.

If **Central Ingestion** fails, the nodes accumulate and resume. No alarm is lost, because they
are generated locally.

If the **Stream Processor** fails, aggregates are delayed. Dashboards show data with a declared
delay, and alarms are unaffected.

If **Cold Storage** becomes unavailable, historical analysis doesn't work and operations continue.

The property that sustains all of it: **nothing in the safety critical path depends on the
center**. The alarm protecting a pressure vessel is generated meters away from it, by local
equipment, and sounds in the plant itself.

That property is verified, not assumed: a monthly test cuts communication to a plant selected on
rotation and confirms that local alarms keep working, with the result recorded. Over 24 months,
the test ran 24 times and failed once — at a plant where an update had left the local siren
configuration inconsistent.

That single failure justifies the test. It would have stayed invisible until a real link outage
coincided with an alarm condition, which is exactly the scenario the design exists for.

## Observability

```text
events/s per plant, ingested versus expected
sensors with no reading for more than N intervals
end-to-end latency: sensor → alarm, p50/p99, per class
link outage time, per plant
edge buffer occupancy, per plant
compression ratio achieved
cost per sensor, calculated and broken down
alarms raised, per class and per plant
prediction accuracy: alerts issued versus failures that occurred
```

The **sensors with no reading** metric is what detects the most insidious failure mode: a sensor
that stops sending doesn't raise an alarm — it simply disappears. Without that check, a faulty
safety sensor produces silence, which is indistinguishable from "everything is fine".

That check was added after an incident in which a bearing temperature sensor went 11 days without
sending, and nobody noticed.

**Prediction accuracy** is the product metric: alerts issued versus failures that actually
occurred, and failures that occurred with no prior alert. It is tracked per customer, because it
is the number that justifies the contract.

## Deployment

The center uses conventional continuous deployment.

The edge nodes are the challenge: 340 units, at plants with operational autonomy, some reachable
only over an unstable link. Updates go out in waves, signed, with integrity verification and
automatic rollback if the node doesn't report healthy within 10 minutes.

No node update during a plant's scheduled maintenance shutdown — the period when monitoring is
most needed — nor during equipment startup.

A plant can refuse an update window, and some refuse for months. The system supports nodes up to 4
versions behind, and the protocol between edge and center is backward compatible for 18 months.

## Evolution Strategy

**Phase 1 (months 1–6): sensor classification.** Cataloging and classifying the 12.4 million
sensors by measurement class. Data and process engineering work, with little coding — and it is
what unlocks everything else.

The initial classification was automatic by name pattern and equipment type, with human review of
the safety measurements. 4.1% came out ambiguous and were reviewed one by one with the customers.

**Phase 2 (months 5–14): edge node.** Deployment to the 340 sites, starting with the plants with
the worst links — which benefit most.

Measured result at the first 40 plants: safety alarm latency from 34 s to 0.4 s; volume sent to
the center reduced by 91%.

**Phase 3 (months 12–19): central streaming and aggregates.** Continuous processing, pre-computed
aggregates and tiered storage.

**Phase 4 (months 17–24): diagnostic class on demand.** The change with the greatest cost effect,
left for later because it requires the edge buffer to be mature and reliable.

**Phase 5 (months 22–30): prediction at the edge.** Lightweight models running locally, which
makes anomaly detection independent of the link.

**Conditions that would change the plan:**

```text
if a class of future analysis requires discarded raw data
  → the classification decision is revisited for the sensors
    involved; the lost data doesn't come back

if the link outage rate drops below 1 event/month
  at a plant
  → that plant can operate with no edge node (Option B),
    reducing operating cost

if the number of sensors per plant exceeds ~200 thousand
  → the edge node has to be distributed within the plant

if regulation extends the raw retention requirement to
  operational measurements
  → 41% of the storage savings is lost, and the
    calculation has to be redone
```

The first condition deserves emphasis: **discarding data is irreversible**. The decision to
classify a measurement as diagnostic and not store it centrally closes the door on future analyses
of it. That was discussed explicitly with the data science team, which accepted the trade-off for
61% of the volume and refused it for other measurements that looked like candidates.

## Results

Numbers at the end of Phase 4, 24 months after the start:

```text
p99 latency for a safety alarm            from 34 s to 0.6 s
p99 for an operational alarm              from 34 s to 2.1 s
volume sent to the center                 -92%
volume stored raw                         -85%
cost per monitored sensor                 -54% (the target was -40%)
safety events lost                        0 in 24 months
plants monitored during a link
  outage                                  100%
failure prediction accuracy               from 61% to 78%
failures predicted > 48 h ahead           from 44% to 71%
```

The gain in predictive accuracy was not a project objective and came from an indirect effect: with
consistent aggregates and high data quality — no gaps from link loss — the models started training
over complete series. The data quality improved more than the models did.

## What this case teaches

**Classifying the data is the architectural decision.** There is no single answer to "how much to
retain" — there is an answer per measurement class, and discovering the classes was 6 months of
work before any code. It is what unlocked a 54% cost reduction.

**Not every guarantee has to be uniform.** Zero loss for safety events and 0.1% tolerated for
operational ones is what makes the savings viable. Promising zero loss for everything is expensive
and, in most cases, worthless.

**The critical path should not cross the network.** The alarm protecting a piece of equipment is
generated meters away from it. Putting the link on the safety path was the previous architecture's
structural defect, and no optimization would have fixed it.

**The absence of data is an event.** A sensor that stops sending produces silence, not an alarm.
The check for sensors with no reading was added after an incident, and it is the kind of
requirement that only appears when someone asks "what happens if this data simply stops
arriving?".

## Related Concepts

- [Case: Video Streaming](/21-case-studies/video-streaming.md) — the other case dominated by
  volume.
- [Messaging](/06-distributed-systems/messaging.md).
- [Delivery Guarantees](/06-distributed-systems/delivery-guarantees.md).
- [Cost vs. Reliability](/20-trade-offs/cost-vs-reliability.md).

## Practical Exercise

Classify your system's events into four classes by value and by loss tolerance, and estimate the
volume of each.

Then calculate the cost of storing everything with the most demanding class's guarantee. The
difference between that number and the cost of the classification is what this case saves.

## Interview Questions

- Why is this the only case in the set where scale is genuinely the problem?
- Why is the safety alarm generated at the edge and not at the center?
- Why does the absence of data have to be treated as an event?

## Further Reading

- Kleppmann, Martin. *Designing Data-Intensive Applications*. O'Reilly, 2017.
- Akidau, Tyler et al. *Streaming Systems*. O'Reilly, 2018.
- Hohpe, Gregor; Woolf, Bobby. *Enterprise Integration Patterns*. Addison-Wesley, 2003.

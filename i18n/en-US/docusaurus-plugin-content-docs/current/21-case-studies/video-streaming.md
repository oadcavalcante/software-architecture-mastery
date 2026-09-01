---
id: video-streaming
title: "Case: Video Streaming"
sidebar_position: 6
description: A catalog of 42 thousand titles for 6.1 million subscribers, where 96% of the cost is outside the datacenter.
doc_type: case-study
level: 0
difficulty: advanced
status: complete
objective: >
  By the end, the reader sizes a system in which delivering bytes dominates the cost and the
  control plane is small, and knows where the architecture actually decides.
prerequisites: [trade-offs]
related: [social-network, high-volume-events, saas-platform]
canonical_for: []
translated_from_version: 2
last_reviewed: 2026-08-31
---

# Case: Video Streaming

:::note How to use this case

Read the context, requirements and constraints. **Stop before the architecture options** and
sketch your own in twenty minutes.

This case's numbers are **illustrative** (SPEC.md §8.2): plausible and internally
consistent, not measured in a named system. What is learned is the reasoning they
support, not the magnitudes.

:::

## Business Context

**Mirante** is a streaming service with 6.1 million subscribers and a catalog of 42 thousand
titles, including films, series and original productions. It operates in nine Latin American
countries.

The business has a characteristic that radically distinguishes its architecture from that of
transactional systems: **most of the cost and complexity is in delivering bytes**, and not in
processing requests. The company delivers 3.4 exabytes a year, and the cost of that delivery is
$37.4 million — against $1.6 million for the entire application infrastructure.

That proportion — 96% of cost in delivery — is what guides the whole analysis. A decision that
improves delivery efficiency by 10% is worth more than any optimization of the control plane.

Two pressures motivate the review:

**Delivery cost.** The contract with the content delivery provider was repriced, and leadership
set a target of a 25% reduction in cost per hour watched over 24 months.

**Quality on poor connections.** The company measures that 22% of sessions occur on connections
below a sustained 5 Mbps, concentrated in specific regions and hours. In those sessions, the
abandonment rate in the first 30 seconds is 19%, against 3% in the rest.

## Functional Requirements

For the **subscriber**: browse the catalog with recommendations; search; watch with quality
adapted to the connection; resume where they left off, on any device; download for offline
viewing; and manage profiles within the account.

For **content operations**: ingest a new title, with all audio tracks, subtitles and encoding
versions; publish and unpublish per country and per licensing window; and track audience
performance per title.

For the **platform**: apply content protection per the studios' requirements; measure quality of
experience in real time; and report audience figures to rights holders, with contractual accuracy.

The last requirement is underestimated and has a strong architectural consequence: licensing
contracts pay per minute watched, and the report has to be auditable. That makes playback
telemetry a financial data set, not merely an operational one.

## Non-Functional Requirements

```text
time to first frame                      < 1.5 s at p95
rebuffer rate                            < 0.4% of time watched
playback availability                    99.99%
catalog availability                     99.95%
p95 of home screen loading               < 900 ms
audience telemetry accuracy              > 99.9% of minutes watched
raw telemetry retention                  13 months (contractual audit)
cost per hour watched                    25% reduction
publication window per country           1-minute precision
```

The rebuffer rate is the quality metric that correlates most with subscription cancellation,
according to the company's own data: subscribers who suffer rebuffering in more than 1% of time
watched cancel at a 2.4× higher rate.

## Constraints

```text
studios           require content protection at a specific level per
                  title; some require the key never to reside on
                  Mirante's own infrastructure
licensing         windows per country with exact dates and times; publishing
                  early or unpublishing late has contractual consequences
devices           53 supported television models, many with limited
                  capability and no firmware updates
connectivity      22% of sessions below 5 Mbps
cost              the 25% reduction is a leadership target
team              94 engineers; 12 in the video delivery domain
encoding          re-encoding the whole catalog takes ~7 months of
                  contracted processing capacity
```

The television constraint is the most limiting for technology choices: a 2018 set with no updates
defines the lowest common denominator of format and protocol, and it cannot be abandoned without
losing subscribers.

That kind of constraint — an installed base that doesn't update — is common in consumer products
and rarely appears in architecture discussions, which tend to assume updatable clients. Here it
determines which encoding formats can be used, which delivery protocol, and even how long a
manifest version has to keep being served. The company maintains a compatibility matrix per model,
and it is consulted before any format decision.

## Capacity Estimates

What sizes this system is not requests per second — it is bandwidth.

```text
subscribers                         6.1 million
simultaneous sessions, average      ~310 thousand
peak (Saturday, 9pm)                ~980 thousand
average bitrate per session         ~4.1 Mbps
bandwidth at peak                   ~4.0 Tbps
hours watched/month                 ~412 million
volume delivered/year               ~3.4 exabytes
```

Four terabits per second at peak. That number is the architecture: no application decision
materially changes the cost, and the choice of how and from where the bytes come out changes
everything.

The control plane, by comparison, is small:

```text
catalog requests/day                 ~180 million  →  ~2,100/s, peak ~7,000/s
playback starts/day                  ~19 million   →  ~220/s, peak ~1,100/s
telemetry events/day                 ~14 billion   →  ~162 thousand/s
```

Telemetry is the only control-plane subsystem with relevant volume — 162 thousand events per
second — and it is what produces the audience report that pays the studios.

```text
storage
  catalog, all encoding versions              ~4.2 PB
  raw telemetry, 13 months                    ~1.9 PB
  metadata, catalog and profiles              ~600 GB
```

The contrast is the case's summary: 600 GB of data the product reasons about, and petabytes of
bytes it delivers.

## Architecture Options

The decision axis is **how the bytes reach the subscriber**.

### Option A — Third-party delivery network

All traffic goes out through a commercial provider, with global presence.

```text
cost              $37.4M/year, with a volume discount already negotiated
effort            none — it is the current model
quality           good, and with no control over cache policy
flexibility       none over content placement
risk              concentration in one supplier
```

### Option B — Own network with servers inside ISPs

Cache servers installed inside the access providers' networks, delivering popular content locally.

```text
cost              an initial investment of ~$8.4M in equipment
                  + operations of ~$5.6M/year
                  marginal delivery cost close to zero
effort            24 to 30 months to relevant coverage
quality           better — content comes from a few hops from the subscriber
negotiation       requires agreements with dozens of access providers
risk              high — depends on third parties who are not suppliers
```

### Option C — Hybrid, with our own layer in the largest networks

Our own servers in the networks that concentrate most of the audience; a third party for the rest.

```text
cost              an investment of ~$2.8M + operations of ~$1.8M/year
                  + a third party for residual traffic
coverage          the 6 largest networks concentrate 71% of the audience
effort            10 to 14 months to 71% coverage
quality           better where there is an own server; the same elsewhere
risk              medium — negotiating with 6 partners, not dozens
```

## Trade-off Analysis

| Criterion | Weight | A — Third party | B — Own | C — Hybrid |
|---|:-:|:-:|:-:|:-:|
| Cost per hour watched over 3 years | 35% | 2 | 9 | 8 |
| Quality on poor connections | 25% | 5 | 9 | 8 |
| Time to result | 15% | 9 | 2 | 7 |
| Execution risk | 15% | 9 | 3 | 6 |
| Team capability | 10% | 9 | 3 | 6 |
| **Weighted total** | | **5.5** | **6.6** | **7.4** |

**Sensitivity analysis.** With risk at 40% and cost at 15%, the totals become 7.6 / 4.4 / 6.8 —
Option A wins. That is the only scenario tested in which the conclusion changes, and it corresponds
to an organization with very low risk appetite or with no ability to negotiate with access
providers.

Recording that inversion is deliberate: it shows the decision is not a universal truth about
streaming, but a consequence of the weight Mirante assigns to cost and quality.

## Decision

**Hybrid (Option C)**, with our own servers in the six largest access networks and a third party
for residual traffic, including the countries with the smallest base.

**Under what condition each discarded option would win:**

**Option A would win if** the company lacked the scale to negotiate with access providers — below
roughly 1 million subscribers, no provider has an interest in hosting third-party equipment. It
would also win with a low risk appetite, as the sensitivity analysis shows.

**Option B would win if** the audience distribution were more uniform across access providers.
With 71% concentrated in six networks, the tail of dozens of smaller providers never pays for the
cost of negotiation and operation. The condition is recorded: if concentration in the six largest
drops below 50%, the own network's reach is reassessed.

## Components

The system splits into two planes with completely different natures.

The **data plane** delivers bytes: cache servers in the access networks, the third-party network,
and the mechanism that decides, for each session, where the content comes from. It is where 96% of
the cost and almost no business logic lives.

The **control plane** is a conventional application: catalog, profiles, authentication,
recommendation, licensing by window, telemetry and reports. Modest volume, rich logic.

Beyond the two, there is an **ingestion pipeline** that receives a title and produces every
encoded version, track, subtitle and protection artifact — a batch system, with no latency
requirement, but with a large processing volume.

The control plane's main components:

**Catalog Service**, with availability computed per country and licensing window. **Playback
Service**, which authorizes a session, issues the protection license and returns the manifest with
the delivery URLs. **Delivery Router**, which chooses the origin by region, access provider and
availability of the content in the local cache. **Progress Service**, which stores where each
profile stopped in each title. **Telemetry Collector**, which ingests the 162 thousand events per
second. **Audience Reporting Service**, which produces the contractual figures.

Separating authorizing from delivering is what keeps the control plane small: it issues a manifest
and a license, and gets out of the way. No video byte passes through it.

## Data

**Catalog.** PostgreSQL as the source of truth, with a read index replicated per region. The volume
is irrelevant — 42 thousand titles — and the complexity is in the rules: each title has
availability windows per country, per plan and per device type.

The licensing rule is evaluated when assembling the response, and not materialized, because the
windows change frequently and the required precision is one minute. Materializing would require
invalidation at that granularity, which is more expensive than evaluating.

**Playback progress.** Key-value store, with one entry per profile and title. Written every 30
seconds during playback — about 10 thousand writes per second at peak — and read when the app
opens.

It is data with loss tolerance: losing the last 30 seconds of progress is imperceptible. That
tolerance allows asynchronous replication and no transactional guarantee, which reduces the cost by
an order of magnitude.

**Telemetry.** This is the most demanding data subsystem, and the reason is contractual. Playback
events feed the report that pays the studios, and a 1% loss is a financial discrepancy.

```text
ingestion      events in batches, from the device, with a session identifier
               and a sequence; the device accumulates and resends on failure
storage        raw, compressed, partitioned by day and by title
aggregation    daily, with reconciliation by event sequence
retention      13 months, for contractual audit
```

The per-session sequence is what allows detecting loss: a report that receives events 1, 2, 4 and 5
knows 3 is missing, and the device is queried. With no numbering, loss would be indistinguishable
from less viewing.

**Manifests and segments.** Object storage, replicated per region, with video segments at multiple
bitrates. It is most of the 4.2 PB.

## Integration

**Adaptive encoding.** Each title is encoded at 8 to 12 different bitrates, and the player chooses
the rung according to the measured connection. Choosing the set of bitrates is an architectural
decision with a direct effect on the 22%-poor-connections constraint.

The company moved from a fixed set of bitrates to **per-title encoding**: an animated feature with
little scene variation reaches equivalent quality at half the bitrate of an action film.
Re-encoding the catalog with content-adjusted bitrates reduced the average volume delivered by 21%
with equal perceived quality — and that single change delivered most of the cost reduction target.

**Content protection.** Licenses issued by a specialized external service, because some studios
require the key not to reside on Mirante's infrastructure. Issuance is synchronous and sits on the
time-to-first-frame path, with a 300 ms budget.

**Delivery routing.** For each session, the Router chooses the origin combining: the access provider
identified by the network address, availability of that title in the local cache, and the health of
our own servers in that network.

Popular titles stay in the local caches; the long tail goes out through the third party. The
popularity rule is recalculated daily, and it covers 88% of traffic with 6% of the catalog.

## Security

```text
content protection     level per title, per the studio's requirement;
                       keys in a certified external service
license                bound to session, device and time window
sharing                a limit on simultaneous streams per plan, verified
                       on authorization and periodically revalidated
subscriber data        classification and flow mapping; declared
                       retention per point of rest
telemetry              pseudonymized for analysis; identifiable only
                       in the audience subsystem, with logged access
servers in third-party
  networks             untrusted by premise: content encrypted
                       at rest, no keys, no subscriber data
```

The last line is the design's most important security decision. The servers installed inside access
providers' networks are physically outside Mirante's control, and they are treated as hostile
infrastructure: they store encrypted segments that cannot be decrypted without a license issued by
the control plane.

That makes Option C possible without violating the studios' requirements — and it was the condition
the studios imposed for authorizing the architecture.

## Scalability

The control plane scales trivially: 7,000 catalog requests per second and 1,100 playback starts per
second are served with room to spare by simple horizontal scaling.

What requires design is **telemetry**, with 162 thousand events per second and a concentrated peak.
The solution is batch ingestion from the device — each set accumulates events and sends every 60
seconds — which turns 162 thousand events per second into about 16 thousand requests per second,
with load spread by the natural misalignment of the timers.

The **Saturday night peak** is 3.2× the average and entirely predictable. Cache capacity is sized
for it, and the cost of that idleness is accepted because the alternative — degrading at the hour of
peak viewing — is the worst possible outcome for the product.

**Premieres** are the other peak, and they are different: a premiere of an original production
concentrates up to 40% of simultaneous sessions on a single title in the first hours. The content
is preloaded into the caches before the launch, which turns an origin peak into a local one.

## Reliability

If a **local cache** fails, the Router directs that network to the third party. The subscriber
notices nothing; the cost of that traffic goes up. It is the most frequent degradation and the
cheapest.

If the **license service** becomes unavailable, no new playback starts. Sessions in progress
continue until the license expires. There is no possible degradation — playing without a license
violates the studio contract.

If the **Progress Service** fails, playback works and resuming doesn't. The app stores progress
locally and synchronizes when the service returns.

If the **Catalog** becomes unavailable, the home screen is served from cache, with up to 15 minutes
of staleness. Titles whose licensing window expired in that interval are blocked at playback
authorization, which is the real checkpoint.

That last decision is important: the licensing window is enforced at **authorization**, not at
browsing. A title may appear on the screen for up to 15 minutes after expiring, and cannot be
played. Separating where the rule is displayed from where it is enforced is what allows the catalog
to have aggressive caching.

## Observability

```text
quality of experience   time to first frame, rebuffer rate,
                        average bitrate, all per access provider,
                        region, device and title
delivery                share of traffic by origin (own cache
                        versus third party), hit rate per cache
cost                    cost per hour watched, calculated daily
                        and broken down by origin
telemetry               events received versus events expected by
                        sequence; gaps per device
business                hours watched per title, for the contractual
                        report and for licensing decisions
```

Segmenting quality by access provider is the central operational instrument: it identifies that the
degradation is in a specific network, which is actionable — talk to the provider or install a cache
— rather than showing up as a diffuse worsening of the average.

## Deployment

The control plane uses conventional canary deployment. The data plane is different: a cache
installed in a provider's network cannot be updated at any time, because the maintenance window is
negotiated with the partner.

The consequence is that the caches' software has to be **backward compatible for longer** than the
rest — the Router has to work with caches two versions behind. The rule adopted is compatibility
for 12 months.

Re-encoding the catalog is done in the background, in popularity batches: the most watched titles
first, which makes the cost benefit appear in the first weeks rather than at the end of the 7
months.

## Evolution Strategy

**Phase 1 (months 1–6): per-title encoding.** Re-encoding the catalog with content-adjusted
bitrates, in popularity order. It delivers most of the cost target with no dependency on
negotiating with third parties.

Measured result: average volume per hour watched dropped 21% in six months, with perceived quality
measured by a user panel showing no significant difference.

**Phase 2 (months 4–14): caches in the two largest networks.** A pilot with two access providers
that concentrate 38% of the audience. It validates the operation, the security model and the
commercial relationship.

**Phase 3 (months 15–22): expansion to the six largest.** Coverage of 71% of the audience with our
own cache.

**Phase 4 (months 20–26): quality-based routing.** The Router starts considering measured quality,
not just availability — diverting from a local cache that is degraded before the subscriber
notices.

**Phase 5 (months 24–30): predictive preloading.** Content preloaded into the caches by regional
demand prediction, not only by global popularity.

**Conditions that would change the plan:**

```text
if audience concentration in the 6 largest networks drops below 50%
  → Option B is reassessed, or the expansion is limited and the third
    party dominates again

if a relevant studio requires protection incompatible with caching
  in a third-party network
  → that catalog goes out exclusively through the third party

if the rate of connections below 5 Mbps drops below 10%
  → investing in very low bitrate rungs stops paying off

if annual volume exceeds ~8 exabytes
  → the savings justify evaluating a complete own network (Option B)
```

## Results

Numbers at the end of Phase 3, 22 months after the start:

```text
cost per hour watched                  -31% (the target was -25%)
traffic delivered by own cache         69%
time to first frame, p95               from 2,100 ms to 1,240 ms
rebuffer rate                          from 0.9% to 0.31%
abandonment in the first 30 s, on
  connections below 5 Mbps             from 19% to 8.4%
telemetry accuracy                     99.96%
subscription cancellation              -1.8 pp
```

The 31% cost reduction exceeded the target, and 21 points came from Phase 1 — the re-encoding,
which depended on no external negotiation and was the cheapest to execute.

The 1.8 percentage point drop in cancellation deserves a methodological caveat the company itself
recorded: the period coincided with two high-audience original production launches, and the
improvement cannot be attributed entirely to delivery quality. The correlation that supports the
thesis is narrower and more reliable: among subscribers whose sessions occur mostly on networks
that gained an own cache, the drop was 3.1 points; among those on networks still served by the
third party, 0.4 points.

That comparison between groups the architecture treated differently was possible only because the
instrumentation segmented quality by access provider from the start — the same observability
decision that served operations ended up serving the investment evaluation.

## What this case teaches

**Where the cost is, the architecture is.** With 96% of cost in delivering bytes, optimizing the
control plane is irrelevant. The first question in a system like this is where the money goes, and
the answer completely changes what deserves engineering attention.

**The cheapest change had the greatest effect.** Per-title re-encoding required no negotiation, no
contract and no new infrastructure — only processing capacity and time. It delivered two thirds of
the target before the first cache was installed.

**Third-party infrastructure is hostile by premise.** Treating the caches installed in other
people's networks as untrusted, with encrypted content and no keys, is what made the architecture
acceptable to the studios. The constraint became design, not an obstacle.

**Telemetry can be financial data.** Sequence numbering, reconciliation and 13-month retention exist
because playback events pay contracts. Treating them as an operational metric would have produced a
system with tolerated loss and an annual contractual discrepancy.

## Related Concepts

- [CDN](/05-system-design/cdn.md).
- [Caching](/05-system-design/caching.md).
- [Case: High-Volume Event Processing](/21-case-studies/high-volume-events.md).
- [Cost vs. Reliability](/20-trade-offs/cost-vs-reliability.md).

## Practical Exercise

Calculate what a 1% reduction in average volume delivered is worth, for 3.4 exabytes a year at $11
per terabyte.

Compare that with the value of a 10% reduction in the catalog service's latency. The difference
explains why encoding was Phase 1.

## Interview Questions

- Why is the licensing window enforced at authorization and not at browsing?
- Why does sequence numbering turn telemetry into auditable data?
- Why are the caches installed in third-party networks treated as hostile infrastructure?

## Further Reading

- Netflix Technology Blog. *Per-Title Encode Optimization*, 2015.
- Kleppmann, Martin. *Designing Data-Intensive Applications*. O'Reilly, 2017.
- Grigorik, Ilya. *High Performance Browser Networking*. O'Reilly, 2013.

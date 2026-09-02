---
id: social-network
title: "Case: Social Network"
sidebar_position: 5
description: A feed for 24 million users, where the central decision is when to do the work — on write or on read.
doc_type: case-study
level: 0
difficulty: advanced
status: complete
objective: >
  By the end, the reader chooses between fan-out on write and on read by user profile, and
  understands why the answer is hybrid.
prerequisites: [trade-offs]
related: [video-streaming, messaging-platform, high-volume-events]
canonical_for: []
translated_from_version: 3
last_reviewed: 2026-08-31
---

# Case: Social Network

:::note How to use this case

Read the context, requirements and constraints. **Stop before the architecture options** and
sketch your own in twenty minutes.

This case's numbers are **illustrative** (SPEC.md §8.2): plausible and internally
consistent, not measured in a named system. What is learned is the reasoning they
support, not the magnitudes.

:::

## Business Context

**Circulo** is a social network focused on interest communities — neighborhood, professional and
hobby groups. It has 24 million accounts, of which 7.8 million use the product daily.

The model differs from global networks in one respect that changes the architecture: most content
is consumed inside communities, not in a global timeline of followed people. The average user
belongs to 11 communities and follows 84 people.

Two pressures motivate the review:

**Feed latency.** The p95 of feed loading is 2.8 seconds, and the product team measures that every
500 ms above 1 second reduces session time by 4%. The feed is assembled on read, querying posts
from 11 communities and 84 profiles on every open.

**Read cost.** The feed is opened 340 million times a day. Each open triggers an average of 96
database queries, even with caching. The database bill is $4.4 million a year and grows faster
than the user base.

There is no write problem: the network produces 9 million posts a day, which is modest.

## Functional Requirements

The product has four main surfaces, and it is useful to separate them because they have opposite
requirements.

The **main feed** mixes posts from communities and from people the user follows, ordered by
relevance and recency. It is the most accessed surface and the most expensive.

The **community feed** shows a specific community's posts, in chronological order. It is simple
and cheap, and it accounts for 38% of views.

The **profile** shows a person's posts, chronologically.

And **notifications** alert about interactions — comments, mentions, reactions — with near
real-time delivery.

In addition: posting text, images and short video; reacting and commenting; following people and
joining communities; and searching content, people and communities.

## Non-Functional Requirements

```text
p95 of the main feed              < 800 ms  (against 2,800 ms today)
p95 of the community feed         < 400 ms
p99 of posting                    < 1 s
read availability                 99.95%
posting availability              99.9%
window until a post appears
  in a follower's feed            < 30 s
window until it appears in
  the community feed              < 5 s
post retention                    indefinite
cost per daily active user        40% reduction
```

The asymmetry between the two windows is deliberate and comes from the product: in a community,
the conversation is synchronous and 30 seconds of delay breaks the flow; in the feed of followed
people, nobody notices.

That distinction is not a detail. It means the system has two window requirements over the same
propagation mechanism, with a 6× difference between them — and that a single solution would have
to meet the stricter one, paying the cost in every case. Recognizing the asymmetry early is what
opened room for a differentiated strategy, and it is the kind of information that only appears
when requirements are gathered per product surface rather than for the system as a whole.

## Constraints

```text
follower distribution   extremely uneven: the median is 84 followers,
                        and 0.02% of accounts have more than 500 thousand
communities             likewise: the median has 340 members, and the 50
                        largest have more than 2 million each
team                    86 engineers, 22 in the feed domain
cost                    a 40% reduction per daily active user is a
                        leadership target, not an aspiration
migration               no window — the product operates 24×7 and the
                        transition has to be invisible
media                   images and videos are already on a content
                        delivery network; out of scope
```

The uneven distribution of followers and community members is the constraint that decides the
architecture. Any uniform solution fails at one of the ends: what works for an account with 84
followers doesn't work for one with 2 million, and vice versa.

It is worth insisting on that point because it is the case's transferable lesson. When designing a
social system, the instinct is to reason about "the user" — and there is no such thing as the
user. There is a distribution, almost always long-tailed, in which the median and the 99.99th
percentile differ by four orders of magnitude. Decisions taken on the average are wrong at both
ends: too expensive for the majority and insufficient for the extremes.

The first artifact produced in this project was not a diagram. It was a histogram of the follower
and community-member distribution, with the percentiles made explicit — and on its own it
eliminated Option B from the discussion in one meeting.

## Capacity Estimates

```text
daily active users                 7.8 million
feed opens/day                     340 million
opens/s, average                   ~3,900
peak (7-10pm)                      ~11,500/s
with margin (2×)                   ~23,000/s

posts/day                          9 million
posts/s, average                   ~104
peak                               ~380/s
reactions and comments/day         142 million
                                   →  ~1,640/s, peak ~5,000/s
```

The read-to-write ratio is **38 to 1** counting only posts, and 2.3 to 1 counting all
interactions. The system is dominated by reads, and that is why the decision about where to do the
work — on write or on read — is the central one.

The calculation that makes it concrete:

```text
fan-out on write
  post from a median account (84 followers)      84 writes
  post from a large account (2 million)          2,000,000 writes
  post in a large community (2.4 million)        2,400,000 writes

  writes/day, if everything were fanned out      ~11.4 billion
  writes/s at peak                               ~410,000/s
```

Four hundred thousand writes per second, to serve 11,500 reads per second. Fanning out everything
on write is clearly absurd in this profile — and it is exactly the solution the literature on
global social networks tends to suggest, because there the read-to-write ratio is different.

```text
storage
  posts (9 M/day × 5 years)          ~16 billion  →  ~4 TB of text and metadata
  follower graph                     ~2 billion edges
  community membership               ~264 million edges
  materialized feeds (if any)        depends on the decision
```

## Architecture Options

The axis is **when the feed is assembled**.

### Option A — Assembly on read

The feed is built at the moment it is opened, querying recent posts from the sources the user
follows.

```text
write cost             minimal — one write per post
read cost              high — dozens of queries per open
latency                bad, and it gets worse with the number of sources followed
consistency            excellent — always the current state
storage                minimal
```

It is the current architecture, and it is the origin of the two stated problems.

### Option B — Fan-out on write

On posting, the post is written into each follower's materialized feed. Reading is a query against
a ready list.

```text
write cost             prohibitive for large accounts and communities
read cost              minimal — one query
latency                excellent
storage                high — ~11.4 billion entries/day
structural problem     a post in a community of 2.4 million generates
                       2.4 million writes; the 5 s window is
                       impossible to meet
```

### Option C — Hybrid by source profile

Small sources are fanned out on write; large sources are queried on read and merged with the
materialized feed.

```text
write cost             controlled — only sources below a threshold
read cost              low — one query against the materialized feed
                       + N queries against large sources, with N small
latency                good
complexity             medium — two strategies and a merge
storage                moderate
```

## Trade-off Analysis

| Criterion | Weight | A — Read | B — Write | C — Hybrid |
|---|:-:|:-:|:-:|:-:|
| Feed latency | 30% | 2 | 9 | 8 |
| Total cost | 25% | 3 | 3 | 8 |
| Viability with the real distribution | 20% | 8 | 1 | 9 |
| Complexity | 15% | 9 | 7 | 5 |
| Team capability | 10% | 9 | 7 | 7 |
| **Weighted total** | | **5.2** | **5.4** | **7.7** |

The "viability with the real distribution" criterion exists because Option B is not merely
expensive — it is **impossible** to meet within the 5-second requirement for large communities. An
unviable option gets a score of 1, it is not excluded from the matrix: showing why it loses is
part of the record.

**Sensitivity analysis**, redistributing the remaining weight proportionally across the other criteria. With latency at 50%, the totals become
4.3 / 6.4 / 7.8. With cost at 50%, they become 4.5 / 4.6 / 7.8. Option C wins in every scenario tested, which is expected when
one option combines the advantages of the other two — and the check serves to confirm that the
additional complexity doesn't bring it down.

## Decision

**Hybrid by source profile (Option C)**, with the fan-out threshold defined by number of
recipients and adjustable with no deployment.

```text
source with < 15,000 recipients     fanned out on write
source with ≥ 15,000 recipients     queried on read
```

The 15 thousand threshold was derived, not chosen: it is the point at which the write cost of one
post equals the aggregate cost of querying it across the expected reads before it falls out of the
relevance window.

Below the threshold, 99.4% of accounts and 96.1% of communities are fanned out on write. The rest
— about 4,800 accounts and 1,900 communities — are queried on read, which means a typical feed
makes one query against the materialized feed and between zero and five queries against large
sources.

**Under what condition each discarded option would win:**

**Option A would win if** the average number of sources followed were far smaller — below ~10 — or
if latency were not a requirement. It would also win in a niche product with few users, where read
cost is irrelevant.

**Option B would win if** there were no large sources — that is, if the follower distribution were
approximately uniform. That is the case in closed corporate networks, where nobody has more than a
few thousand connections — and there it is the right answer, simpler than the hybrid.

## Components

**Posting Service.** Receives, validates and persists the post. It is the source of truth's only
writer.

**Fan-out Worker.** Consumes posts and writes into the recipients' materialized feeds, when the
source is below the threshold. It works asynchronously.

**Feed Service.** Assembles the feed on read: it reads the materialized feed, queries the large
sources the user follows, merges and orders.

**Graph Service.** Maintains who follows whom and who belongs to which community. Queried by the
Fan-out Worker and by the Feed Service.

**Ranking Service.** Orders the assembled feed by relevance, with engagement and recency signals.

**Interaction Service.** Reactions and comments, which have their own volume and don't go through
the feed.

**Notification Service.** Near real-time delivery, over a persistent connection.

**Search Index.** Content, people and communities.

Separating the Fan-out Worker from the Feed Service is what makes the hybrid strategy manageable:
each implements one half, and changing the threshold affects only the first one's behavior.

## Data

**Post.** Source of truth in PostgreSQL, partitioned by month. Modest volume — 9 million a day —
and strong consistency, because a post that disappears or appears twice is noticed immediately.

**Materialized feed.** Key-value store, with one list per user.

```text
key       feed:user_id
value     ordered list of (post_id, source_id, timestamp, base_score)
limit     the 600 most recent entries; the excess is discarded
```

The 600 limit is what makes the storage cost predictable: 24 million users × 600 entries × ~40
bytes ≈ 576 GB, regardless of the post volume.

And it is justified by product data: 97% of sessions don't go beyond 120 posts, and no measured
session went beyond 480. Keeping more would be storing what nobody reads.

**Graph.** Two tables in PostgreSQL — followers and community members — with caching of the most
queried lists. The graph is read intensively by the Fan-out Worker, and the decision not to use a
graph database was made because there is no traversal query: the questions are "who follows X" and
"which communities does Y belong to", both one hop.

See [SQL vs. NoSQL](/20-trade-offs/sql-vs-nosql.md) — the access pattern is known and shallow,
which doesn't justify a second type of database.

**Interaction counts.** Approximate counters for high-volume posts, exact below a threshold. A post
with 400 thousand reactions doesn't need an exact count, and keeping it exact creates severe
contention. See
[hotspots](/11-scalability/hotspots.md).

The threshold between exact and approximate counting was set at 5 thousand interactions, and the
choice has a product justification: above that number, no user distinguishes 5,200 from 5,240, and
the post is already in the regime where the number communicates magnitude rather than quantity.
Below it, the author of a post with 40 reactions notices if one disappears.

That is a decision in which the correct technical answer depends entirely on human perception, and
it was validated with a simple test: showing two numbers to users and asking whether they noticed
the difference. No contention analysis would have produced the right threshold.

## Integration

**From post to feed.** The Posting Service persists and emits an event. The Fan-out Worker
consumes it, queries the graph, decides on the strategy and — if fanning out — writes into the
materialized feeds in batches.

The time between posting and appearing is dominated by audience size: an account with 84 followers
completes in under 200 ms; a community with 14 thousand members, in about 4 seconds. That is why
the 15 thousand threshold also satisfies the communities' 5-second window — it was verified
against both requirements, and the stricter one won.

**Large sources on read.** Each source above the threshold keeps a list of its recent posts in
cache, with a short TTL. The Feed Service reads those lists — at most a few per user — and merges
them with the materialized feed before ranking.

**Ranking.** Receives the merged set and orders it. It runs on read, with a 120 ms budget, and
degrades to chronological ordering if it exceeds the deadline.

## Security

```text
visibility           each post carries a scope (public, community,
                     followers); the check is done when assembling the feed
                     and again when reading the post
closed community     members are verified on every read, not trusting
                     the materialized feed
removal              a removed post disappears from the feed within 30 s, by
                     an invalidation event; and is filtered on read
                     in the meantime
blocking between
  users              applied on assembly and on read
personal data        the follower graph is sensitive data; export
                     restricted and logged
moderation           a review queue with logged access; removed content
                     preserves a record for appeals
```

The double check — on assembly and on read — looks redundant and isn't. A materialized feed is a
snapshot of a moment; permissions change afterwards. Without the second check, someone removed
from a community would keep seeing its posts for up to 600 entries.

That is the correctness cost of fan-out on write, and it is permanent: any system that
materializes a view has to revalidate authorization at read time.

## Scalability

The system scales on reads, and the materialized feed is what makes that cheap: 11,500 opens per
second become 11,500 key-value reads plus a few queries against large sources.

```text
before (Option A)    ~96 queries per open  →  ~1.1 million queries/s at peak
after (Option C)     ~4.2 queries per open →  ~48 thousand queries/s at peak
```

The 23× reduction in the number of queries is the origin of the cost savings, and it comes
entirely from moving work from read to write — where it is done once instead of on every open.

The contention point that remains is the **Fan-out Worker** during posting peaks in communities
near the threshold. The solution is a priority queue: posts from small communities, which have a
5-second requirement, go ahead of posts from personal accounts, whose requirement is 30 seconds.

## Reliability

If the **Fan-out Worker** fails, posts stop appearing in the materialized feeds. The system
degrades by adding recent sources on read — more expensive, slower, and correct. The queue
accumulates and is processed when it returns.

If the **materialized feed** becomes unavailable, the Feed Service falls back entirely to assembly
on read, which is the old architecture. It is slow and it works, and it exists because Option A's
code was deliberately kept as a degradation mode.

If **Ranking** fails, the feed is ordered chronologically. Quality drops and the product works.

If **Posting** fails, there is no degradation. It is the component with the highest target.

The decision to keep the assembly-on-read path as a degraded mode has a cost — it is code that has
to keep working — and it was justified by it also being the path used by large sources. It is not
dead code kept as a precaution; it is live code with a second use.

That property — the degradation mode also being a path used in normal operation — is what makes
the degradation reliable. Emergency modes that only run in emergencies rot without anyone
noticing, and fail precisely when they are invoked. In the final design, the assembly-on-read path
continuously processes every user's large sources, which means it is exercised thousands of times
per second and cannot be broken without the whole system noticing.

When a degraded mode cannot have a normal use, the alternative is to exercise it deliberately —
invoking it on a small fraction of traffic, on a schedule.

## Observability

```text
feed latency, p50/p95/p99, separated by
  users with and without large sources
queries per feed open, distribution
fan-out lag, p95, by audience band
rate of degradation to assembly on read
materialized feed size, distribution
cost per daily active user, broken down by component
posts filtered on read by permission
```

The last metric is about correctness: a high value indicates fan-out is writing into feeds of
people who shouldn't see the content, which is an authorization defect, not a performance one.

Separating latency between users with and without large sources was essential: the average hid the
fact that 8% of users — those following many large accounts — had three times worse latency. The
aggregate p95 looked good and the product was bad for an identifiable slice.

## Deployment

The transition was done with dual writes and compared reads, with no window.

```text
step 1   the Fan-out Worker starts writing materialized feeds,
         and nobody reads them
step 2   the Feed Service assembles by both paths and compares,
         serving the old result; divergences are recorded
step 3   reads via the new path for 1% of users, then 10%, 50%
step 4   the old path becomes the degradation mode
```

Step 2 lasted six weeks and found 9 classes of divergence, of which 6 were defects in the new path
and 3 were undocumented behaviors of the old one — the same pattern observed in the
[banking core](/21-case-studies/banking.md) case, in a completely different context.

The recurrence of that pattern in two unrelated domains suggests it is a property of the method,
and not of the systems: whenever two paths produce the same result and are compared under real
traffic, a share of the divergences found describe the old behavior, not defects in the new one.
Comparing in production is, among other things, a cheap way of documenting what nobody wrote down.

## Evolution Strategy

**Phase 1 (months 1–3): fan-out for small sources.** The Fan-out Worker, the materialized feed and
dual writes. No reads change.

**Phase 2 (months 4–6): hybrid reads with comparison.** The Feed Service assembles by both paths,
compares and serves the old one.

**Phase 3 (months 7–9): progressive switchover.** Reads via the new path, by percentage of users,
with rollback by configuration.

**Phase 4 (months 10–13): ranking.** Replacing chronological ordering with relevance, with a
controlled experiment.

**Phase 5 (months 14–18): dynamic threshold.** The 15 thousand threshold comes to be calculated
per community and per account, considering the audience's real read rate — a community with 20
thousand members of whom 200 open the feed daily doesn't merit the same strategy as one with 20
thousand active members.

**Conditions that would change the plan:**

```text
if the follower distribution approaches uniform
  → Option B becomes viable and is simpler

if the average number of sources followed exceeds ~300
  → the 600-entry materialized feed becomes dominated by
    a few sources, and the strategy needs a per-source quota

if ranking comes to require real-time signals
  → the 120 ms read budget is insufficient, and part
    of the ranking has to move to write time

if communities above 5 million members appear
  → reading large sources needs geographic replication,
    not just caching
```

## Results

Numbers at the end of Phase 4, 13 months after the start:

```text
p95 of the main feed               from 2,800 ms to 640 ms
p95 of the community feed          from 1,400 ms to 310 ms
queries per open                   from ~96 to ~4.2
database cost                      from $4.4M/year to $1.48M/year
cost per daily active user         -58% (the target was -40%)
average session time               +19%
posts filtered on read
  by permission                    0.03% — within expectations
```

## What this case teaches

**The question is when to do the work, not how.** Fanning out on write and assembling on read are
the same work at different moments. The choice depends on the read-to-write ratio, and that ratio
varies per source within the same system.

**The statistical distribution is an architectural constraint.** The inequality between the median
and the extreme — 84 followers against 2 million — is what makes any uniform solution wrong.
Reading that distribution before deciding would have avoided the original design.

**Materializing requires revalidating.** Every system that writes a view has to check authorization
again on read, because permissions change after the snapshot. It is a permanent cost and it is the
price of fan-out on write.

**The average was hiding the product.** The feed's aggregate p95 looked acceptable, and 8% of users
had a three times worse experience. Segmenting the metric by what the architecture treats
differently is what made the problem visible.

## Related Concepts

- [Hotspots](/11-scalability/hotspots.md).
- [SQL vs. NoSQL](/20-trade-offs/sql-vs-nosql.md).
- [Case: Messaging Platform](/21-case-studies/messaging-platform.md).
- [Caching](/05-system-design/caching.md).

## Practical Exercise

Calculate the fan-out threshold for a different profile: 40 sources followed on average, 900
million feed opens per day, 2 million posts per day.

Does the threshold go up or down? The answer shows the number is not a constant of the
architecture — it is a function of the usage profile.

## Interview Questions

- Why is fanning out everything on write impossible, and not merely expensive, in this system?
- Why does a materialized feed require revalidating permission on read?
- Why does the 15 thousand threshold satisfy two different window requirements at once?

## Further Reading

- Kleppmann, Martin. *Designing Data-Intensive Applications*. O'Reilly, 2017 — ch. 1.
- Silberstein, Adam et al. *Feeding Frenzy: Selectively Materializing Users' Event Feeds*.
  SIGMOD, 2010.
- Nygard, Michael. *Release It!*. 2nd ed. Pragmatic Bookshelf, 2018.

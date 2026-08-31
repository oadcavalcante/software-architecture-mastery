---
id: interview-scaling
title: Scaling in the Interview
sidebar_position: 9
description: The scaling ladder — what you try first, and why "I'll add machines" is rarely the complete answer.
doc_type: concept
level: 0
difficulty: intermediate
status: complete
objective: >
  By the end, the reader proposes scaling in the right order, from the cheapest to the most
  structural, with a justification per step.
prerequisites: [bottleneck-identification]
related: [bottleneck-identification, failure-handling, high-level-architecture]
canonical_for: []
translated_from_version: 1
last_reviewed: 2026-08-31
---

# Scaling in the Interview

## Overview

After identifying the bottleneck, the question is how to remove it. And there is an order, from the
cheapest and most reversible to the most structural and expensive:

```text
1. optimize what already exists     index, query, format
2. cache                            avoid the work
3. vertical scaling                 a bigger machine
4. stateless horizontal scaling     more instances
5. read replicas                    distribute reads
6. partitioning                     distribute writes
7. architectural change             async, materialization, CQRS
```

Proposing item 6 when item 2 would solve it is the most common error of candidates who studied
large-scale systems. The order exists because each step costs more permanent complexity than the
previous one.

## Problem

Two error patterns.

**Jumping straight to partitioning.** "It needs to scale, so I'll partition by user identifier."
Partitioning is the most visible answer and one of the most expensive: it introduces distributed
queries, rebalancing, hot keys and transactions that cross partitions.

If the bottleneck is reads, partitioning solves nothing — replicas do. If the bottleneck is a hot
set larger than memory, partitioning the cache solves it; partitioning the database does not.

**Answering "I'll add machines" to everything.** It works for stateless components and fails for the
rest. And it does not distinguish the cases where the extra machine makes things worse — more
instances contending for the same lock increase contention.

## Core Concepts

### Start with what does not change the architecture

```text
"before partitioning, I'll check whether there is an adequate index.
 An 800 ms query that becomes 8 ms with the right index
 eliminates the problem with no structural change at all."
```

That sentence is disproportionately valuable in an interview, because candidates rarely say it.
Most performance problems in information systems are about data access, not architecture. See
[performance vs. maintainability](/20-trade-offs/performance-vs-maintainability.md).

### Cache solves reads, not writes

```text
read bottleneck     cache is the first answer
write bottleneck    cache does not help; it can even make it worse,
                    through invalidation
```

And a cache has preconditions worth stating:

```text
the hot set fits in memory at an acceptable cost
there is tolerance for slightly stale data
the expected hit rate is high enough
there is an invalidation strategy
```

Proposing a cache without mentioning invalidation is the error that almost always generates a
follow-up question — and it is better to anticipate it.

The anticipated answer does not need to be elaborate: "invalidation by event on write, with a short
time-to-live as a safety net" covers most cases and demonstrates that the problem was considered.
What does not work is proposing a cache and, when asked, discovering the invalidation question live.

### Vertical before horizontal, sometimes

```text
"the current machine has 16 GB. Before distributing the cache,
 it is worth considering one with 256 GB — the 30 GB hot set
 would fit comfortably, and I would avoid the complexity of
 partitioning."
```

Vertical scaling has a bad reputation and a real ceiling, and within that ceiling it is the simplest
option. Modern machines hold hundreds of gigabytes of memory and dozens of cores, which covers a far
wider range of problems than intuition suggests.

Recognizing that demonstrates proportionality. See
[vertical scaling](/11-scalability/vertical-scaling.md). Its limit is real and worth stating
alongside: there is a machine ceiling, and it offers no fault tolerance — a bigger instance is still
one instance.

### Horizontal requires statelessness

```text
"the service is stateless, so I scale horizontally
 by adding instances behind the load balancer.

 If there were session state in memory, I would need either to externalize
 the session, or to use session affinity — and the first is better,
 because affinity prevents rebalancing and complicates deployment."
```

See [statelessness](/11-scalability/statelessness.md).

### Read replicas, with the consequence declared

```text
"I add replicas to distribute reads. The consequence is
 replication lag: a read right after a write may
 see stale data.

 For the author's own case, I route to the primary for
 a few seconds. For everyone else, the lag is acceptable given
 the 30-second requirement we gathered."
```

Proposing replicas without mentioning the lag is incomplete; mentioning it and solving the author's
own case is the strong answer. See
[strong vs. eventual consistency](/20-trade-offs/strong-vs-eventual-consistency.md).

### Partitioning: the key is the decision

When partitioning is justified, the choice of key is the content:

```text
"I'll partition by user identifier, because the dominant query
 filters by user and the distribution is reasonably
 uniform.

 The risk is a hot key: users with activity far above the
 average concentrate load on one partition. If that happens, I handle
 those accounts separately."
```

Three elements: the key, the reason, and the risk. See
[partitioning](/11-scalability/scaling-partitioning.md) and
[hotspots](/11-scalability/hotspots.md).

### An architectural change is the last step

```text
make it asynchronous     when the dependency's latency dominates
materialize              when reads dominate and the computation is expensive
separate reads and writes when the two have very different profiles
```

Those moves solve classes of problem the previous steps do not, and they cost permanent complexity —
intermediate state, eventual consistency, more components to operate.

Proposing them is correct when the previous steps were considered out loud. Proposing them first is
the error.

### Say where you would stop

```text
"at this scale I would stop at the cache. Replicas and partitioning
 would be premature, and I would leave them as documented
 next steps, with the trigger: replicas when database reads
 exceed 5 thousand per second, partitioning when writes
 exceed 10 thousand."
```

Declaring the stopping point with a numeric trigger is the most mature possible answer to a scaling
question. It shows the candidate knows how to scale and knows when not to.

There is a reason that is so valued: in production, most scaling decisions are about **when**, not
about **how**. The mechanisms are known and documented; the hard judgment is deciding whether the
moment has arrived. A candidate who can only list mechanisms demonstrates reading; one who can state
the trigger demonstrates having been in the position of deciding.

And the trigger has a second use: it becomes a metric. Saying "replicas when reads exceed 5 thousand
per second" is, in practice, defining an alarm — and connecting architecture to operations that way
is exactly what is expected of a senior role.

## Mental Model

**Climb the ladder in order, and say which step you stop at.** Each step costs more permanent
complexity than the previous one.

## When to Use

- After identifying the bottleneck, never before.
- In order, mentioning the steps you skipped and why.
- With a numeric trigger for the steps left out.

## When Not to Use

**Jumping to partitioning.**

**Proposing a cache for a write bottleneck.**

**Scaling a stateful component horizontally**, without handling the state.

**Without declaring the consequence** of each step — replication lag, invalidation, hot key.

**Without saying where to stop** — scaling indefinitely in an interview suggests there is no
criterion.

## Alternatives

- **Reduce the load** instead of increasing the capacity: rate-limit, aggregate, make it
  approximate.
- **Change the requirement** — questioning whether the required exactness or latency is real is
  legitimate and frequently productive.
- **Accept the limit** — declare that the current scale requires no action.

The first is underestimated: rate-limiting per client, aggregating events in a window or making a
counter approximate solve scaling problems with no additional infrastructure.

## Trade-offs

| Scale early | Scale on a trigger |
|---|---|
| Ready for growth | Proportional complexity |
| Cost paid upfront | Work when you need it |

| Vertical | Horizontal |
|---|---|
| Simple, no design change | No ceiling |
| Real ceiling | Requires statelessness |
| Single point of failure | Fault tolerance |

## Failure Modes

**Premature partitioning.** Permanent complexity with no need.

**Cache for writes.** Does not solve it, and invalidation makes it worse.

**Horizontal with state.** Inconsistent behavior across instances.

**Consequence not declared.** Replication lag comes as a surprise.

**Scaling without stopping.** No visible criterion.

## Common Mistakes

**Not considering an index** before changing the architecture.

**Dismissing vertical scaling** by reflex.

**Proposing a cache with no invalidation strategy.**

**Choosing a partition key** that does not appear in the dominant query.

**Not mentioning hot keys.**

## Interview Example

**Context.** News feed. Bottleneck identified: assembling the feed makes 96 queries per open, and
there are 15 thousand opens per second — 1.4 million queries per second on the database.

**Answer, climbing the steps:**

```text
"First, the cheap thing: are the indexes adequate? A query
 for posts by author ordered by date needs a composite
 index. I'll assume it does, but I would check — 1.4 million
 queries per second with a bad index is a different
 problem.

 Second, cache: I could cache the per-author queries. It
 helps, but it does not fix the structure — I'm still making 96
 queries, even if they are fast. The problem is not the latency
 of each one, it is the number of them.

 Third, replicas: they would distribute the reads, but 1.4 million
 per second would require dozens of replicas. It solves it with money
 and does not solve it well.

 Here the cheap steps run out, and the problem is structural:
 I am doing work on read that could have been done
 on write.

 Fourth, architectural change: materialize the feed. On
 publication, I write the post to each follower's list. The read
 becomes one query instead of 96.

 The consequence: 500 million posts per day × average
 followers. For most, that is cheap. For accounts with millions
 of followers, it is prohibitive — so I use a hybrid strategy:
 materialize for small accounts, query on read for the
 large ones, and merge."
```

**Where to stop:**

```text
"I would stop here. Partitioning the materialized feed
 storage would be the next step, and the trigger would be the
 volume of feeds not fitting in the current storage — something
 around 600 GB by my calculation, with wide headroom.

 I would not do that now."
```

**Likely follow-up question:** "and what if materialization were not possible?"

The correct answer recognizes what that would imply — reads with 96 queries, requiring replicas at
scale and aggressive per-author caching — and states the cost: dozens of replicas against a feed
store of a few hundred gigabytes. The cost comparison is the argument.

See the [social network case study](/21-case-studies/social-network.md) for the full version.

## Related Concepts

- [Bottleneck Identification](/22-system-design-interviews/bottleneck-identification.md) — the
  previous step.
- [Horizontal Scaling](/11-scalability/horizontal-scaling.md).
- [Partitioning](/11-scalability/scaling-partitioning.md).
- [Caching](/05-system-design/caching.md).

## Practical Exercise

Take a bottleneck in your system and write the full ladder: what you would try at each step, and why
you would stop where you stopped.

Then write the numeric trigger for each step left out. That list is a ready interview answer and a
real capacity plan.

## Interview Questions

- Why does partitioning not solve a read bottleneck?
- Why does vertical scaling deserve consideration before horizontal?
- Why is declaring where you would stop the most mature answer?

## Further Reading

- Kleppmann, Martin. *Designing Data-Intensive Applications*. O'Reilly, 2017.
- Xu, Alex. *System Design Interview*. Byte Code, 2020.
- Nygard, Michael. *Release It!*. 2nd ed. Pragmatic Bookshelf, 2018.

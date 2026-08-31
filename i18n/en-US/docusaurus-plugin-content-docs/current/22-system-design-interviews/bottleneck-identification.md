---
id: bottleneck-identification
title: Bottleneck Identification
sidebar_position: 8
description: Which resource saturates first — the question that separates whoever drew the design from whoever understood it.
doc_type: concept
level: 0
difficulty: intermediate
status: complete
objective: >
  By the end, the reader identifies the resource that saturates first in a design and proposes the
  proportional fix.
prerequisites: [high-level-architecture]
related: [high-level-architecture, interview-scaling, failure-handling]
canonical_for: []
translated_from_version: 1
last_reviewed: 2026-08-31
---

# Bottleneck Identification

## Overview

After the design, the interview enters the phase that most differentiates candidates. The question,
explicit or not, is always the same:

```text
"what saturates first?"
```

Answering requires understanding your own design — not merely having produced it. A candidate who
drew from memory freezes here; one who derived each box from a number knows exactly where the load
accumulates.

And there is a second part, evaluated just as much: **what saturates next**. Fixing one bottleneck
moves the pressure to the following one, and anticipating that demonstrates that you understand the
system as a whole.

## Problem

Three error patterns.

**Not knowing.** The design exists, and the candidate cannot say which component hits its limit
first. That indicates the volumes were not propagated through the design.

**Scaling everything.** The answer to any pressure is "I'll add more instances", applied uniformly.
It works for stateless components and does not work for a database, a stateful cache, or any
coordination point.

**Fixing the wrong bottleneck.** The candidate optimizes the component they know best, not the one
that saturates. It is the interview equivalent of what
[performance vs. maintainability](/20-trade-offs/performance-vs-maintainability.md) describes:
optimizing without measuring.

## Core Concepts

### Propagate the numbers through the design

The bottleneck is found by following the load:

```text
client → service       12,000/s
service → cache        12,000/s      →  does it fit? what is the limit?
cache → service        95% hit rate
service → database     600/s reads    →  fits comfortably
service → database     120/s writes   →  fits comfortably
```

With the numbers noted, the answer appears: the component with the highest ratio of load to
capacity is the bottleneck. If none is near its limit, say so — "at this scale, nothing saturates;
the first to get tight would be the cache, around 100 thousand per second".

### The four resources that saturate

```text
CPU              heavy computation, serialization, cryptography
memory           hot set larger than the capacity
input and output disk and network
coordination     contention on a shared resource, a lock,
                 a transaction, a counter
```

The fourth is the most important and the least cited. CPU, memory and network scale by adding
machines; coordination does not. A single counter, a distributed lock or a transaction on the same
row are bottlenecks that more capacity does not solve.

The reason is structural: the first three are divisible resources, and the fourth is a
serialization point. Doubling the machines doubles the available CPU; doubling the machines
contending for the same lock does not increase that lock's throughput, and frequently reduces it,
because contention grows.

In an interview, mentioning that distinction is a strong signal. The question that reveals it is
simple and worth asking of your own design: **is there any point through which all operations of a
kind must pass in order?** If there is, it is the system's ceiling.

See [hotspots](/11-scalability/hotspots.md).

### Distinguish a bottleneck from capacity

```text
capacity        "we need more instances"           →  solved with money
real bottleneck "all writes pass through here"     →  requires changing the design
```

A candidate who treats every limit as a capacity problem does not distinguish the two. The question
that separates them: **if I double the machines, does the problem go away?** If yes, it is capacity.
If not, it is structure.

### Anticipate the next bottleneck

```text
"the cache saturates first, around 100 thousand/s.
 If I partition the cache, the next limit is the hit
 rate: with the hot set growing, the hit rate drops and
 the database starts seeing more load.
 After that, the limit is writes on the database — and then the
 fix stops being capacity and becomes
 partitioning by key."
```

Three levels of bottleneck, in order. That demonstrates the candidate understands the system has a
sequence of limits, and that each fix moves the pressure forward.

That sequence is also what lets you decide where to stop. If the second bottleneck appears at a
scale ten times larger than the current one, solving it now is premature optimization; if it appears
at a scale 1.5 times larger, it is the next piece of work. Stating the distance to each limit turns
the analysis into a plan.

### Proportional fix

```text
bottleneck                     proportional fix
CPU in a stateless service     more instances
reads on the database          replicas, cache
writes on the database         partitioning, or reducing writes
contention on a counter        sharding, aggregation, approximation
latency of an external
  dependency                   async, cache, circuit breaker
cache memory                   partition, or reduce the hot set
```

Proposing the right fix for the right type of bottleneck is the content of the evaluation. Proposing
partitioning for a read bottleneck, for example, indicates the nature of the problem was not
understood.

### The bottleneck may be outside your system

```text
"our service handles 12 thousand per second comfortably, but it
 calls the external payment service, which responds in 800 ms
 and has a limit of 500 calls per second. That is the bottleneck,
 and it is not ours."
```

Recognizing external dependencies as a bottleneck — and proposing the available fixes: cache, async,
circuit breaker, negotiating the limit — is a mature answer many candidates do not reach.

See [circuit breakers](/12-reliability/circuit-breakers.md).

### Not every bottleneck needs to be solved

```text
"the search index saturates around 3 thousand queries per
 second, and we are at 400. I won't solve that now —
 I'll note it as the next point to monitor."
```

Saying that a limit exists and needs no action demonstrates proportionality. Solving every
hypothetical bottleneck produces a complex architecture for a scale that does not exist.

That is one of the most visible differences between mid-level and senior candidates. The first tends
to solve everything they identify, because identifying and solving look like the same demonstration
of competence. The second separates the two: identifying demonstrates understanding, and choosing
not to solve demonstrates judgment — and it is judgment that the role requires.

## Mental Model

**Propagate the numbers and ask which resource saturates.** Then ask which saturates next — the
second answer is worth more than the first.

## When to Use

- Right after the high-level design.
- Whenever the interviewer raises the prompt's scale.
- Before proposing any optimization.

## When Not to Use

**Without propagated numbers.** Without carrying the load estimate to each component, identifying
the bottleneck is guesswork — and the interviewer notices.

**Scaling everything uniformly.** Doubling every component spends an imaginary budget and
demonstrates no reasoning; the value is in pointing at which one saturates first.

**Solving bottlenecks that do not exist** at the given scale. Proposing partitioning for a volume
that fits on one instance shows reflex, not analysis.

**Without distinguishing capacity from structure.** A lack of capacity is solved with more machines;
a structural problem is not. Confusing them leads to proposing scale where the answer was to change
the model.

**Ignoring external dependencies.** Third-party rate limits and provider quotas usually saturate
before your own infrastructure, and they are not elastic.

And there is a wrong use of the technique itself: looking for a bottleneck before the design is
complete. Analyzing saturation of a half-finished flow produces conclusions about a system that does
not exist, and consumes the time you will need to close the path.

## Alternatives

- **Ask the interviewer** — "where do you think this breaks first?" is legitimate and sometimes
  productive.
- **Analyze by resource** — go through CPU, memory, input and output, coordination instead of by
  component.
- **Simulate an increase** — "if the scale were 10×, what would break?" usually makes the bottleneck
  obvious.

The last is a useful technique when nothing saturates at the current scale: hypothetically
increasing it reveals the order of the limits.

## Trade-offs

| Analyze by component | By resource |
|---|---|
| Follows the design | Covers what the design hides |
| More natural to explain | Finds contention |

| Solve the bottleneck | Note it and move on |
|---|---|
| Demonstrates depth | Demonstrates proportionality |
| Consumes time | Can look like an omission |

## Failure Modes

**Not knowing where the system breaks.**

**Scaling everything.** Does not distinguish types of bottleneck.

**Fixing the wrong component.**

**Ignoring coordination.** It is the bottleneck capacity does not solve.

**Solving a hypothetical limit.** Complexity with no scale to justify it.

## Common Mistakes

**Not propagating the volumes** through the design.

**Proposing partitioning** for a read bottleneck.

**Forgetting external dependencies.**

**Not anticipating the next bottleneck.**

**Treating contention as a capacity problem.**

## Interview Example

**Context.** URL shortener, design already done: load balancer, service, cache, database. 12
thousand redirects per second, 120 creations.

**Question.** "What saturates first?"

**Answer:**

```text
"I'll follow the load.

 The service is stateless and does one cache read per
 request — low CPU. One instance handles a few thousand
 per second, so I need about 6 to 10. Not a bottleneck:
 I add instances.

 The cache receives 12 thousand per second. One in-memory instance
 handles hundreds of thousands of simple operations per second,
 so there is a lot of headroom. The cache's limit is not throughput, it is
 memory: a 30 GB hot set. If the set grows
 beyond the capacity, the hit rate drops.

 The database sees 600 reads and 120 writes per second — comfortable.

 Conclusion: nothing saturates at this scale. The first real limit
 is the cache's memory, and it appears when the hot set
 grows, not when traffic grows."
```

**Second question.** "And what if it were 500 thousand redirects per second?"

```text
"Then the order changes.

 First: one cache instance does not handle 500 thousand per
 second with comfortable headroom, and the memory certainly does
 not hold the corresponding hot set. I need to partition
 the cache by link code.

 Second: with the cache partitioned, the next limit is the
 load balancer and network bandwidth. 500 thousand redirect
 responses at ~200 bytes is ~100 MB/s — it fits, but requires
 geographic distribution for latency, not for throughput.

 Third: writes stay at 5 thousand per second, which
 a relational database handles. It would only become a problem above
 tens of thousands.

 What I would not do: partition the database. At this scale,
 reads are handled by the cache and writes fit."
```

**Third question.** "And what if every redirect had to increment a click counter exactly?"

```text
"Then the bottleneck changes in nature. It stops being capacity and becomes
 coordination: 500 thousand increments per second, concentrated on
 a few popular links, produce severe contention on the same
 row.

 More machines do not solve it. The ways out are: shard the
 counter into N sub-rows and sum on read; aggregate in a window
 and write in batches; or accept an approximate count above
 a threshold.

 I would choose to aggregate in a window, because the requirement of
 exactness in a click counter rarely survives the
 question 'exact for what?'."
```

The third answer is the one that differentiates: it identifies the change in the bottleneck's
nature, proposes three fixes appropriate to the type, chooses one, and questions the requirement —
which is exactly what an architect does.

## Related Concepts

- [High-Level Architecture](/22-system-design-interviews/high-level-architecture.md).
- [Scaling in Interviews](/22-system-design-interviews/interview-scaling.md).
- [Hotspots](/11-scalability/hotspots.md).
- [Bottleneck Analysis](/05-system-design/bottleneck-analysis.md).

## Practical Exercise

Take one of your designs and propagate the volumes across every arrow. Then answer, in order: what
saturates first, what saturates after that, and what saturates third.

If you cannot list three, the design has not been understood yet.

## Interview Questions

- Which question separates a capacity bottleneck from a structural one?
- Why is coordination the type of bottleneck that more machines do not solve?
- Why is anticipating the next bottleneck worth more than identifying the first?

## Further Reading

- Gregg, Brendan. *Systems Performance*. 2nd ed. Addison-Wesley, 2020.
- Kleppmann, Martin. *Designing Data-Intensive Applications*. O'Reilly, 2017.
- Xu, Alex. *System Design Interview*. Byte Code, 2020.

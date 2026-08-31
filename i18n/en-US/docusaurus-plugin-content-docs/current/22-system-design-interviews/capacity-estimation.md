---
id: capacity-estimation
title: Capacity Estimation in Interviews
sidebar_position: 3
description: Not to get the number right — so the architecture has a declared scale and decisions have a criterion.
doc_type: concept
level: 0
difficulty: intermediate
status: complete
objective: >
  By the end, the reader produces quick estimates that anchor the decisions that follow, and knows
  which numbers actually matter.
prerequisites: [functional-vs-nonfunctional]
related: [back-of-envelope, high-level-architecture, interview-scaling]
canonical_for: []
translated_from_version: 1
last_reviewed: 2026-08-31
---

# Capacity Estimation in Interviews

## Overview

Capacity estimation in an interview does not exist to produce the right number. It exists for one
thing: **to give the architecture a declared scale**, without which no subsequent decision has a
criterion.

```text
without an estimate   "I'll use a cache"           why? how much does it help?
with an estimate      "12 thousand reads/s against
                      100 writes/s — a cache
                      solves 99% of the problem"   the decision has a basis
```

That changes what should be estimated. Not every possible number — only the ones that change a
decision. A 20-line estimate in which no result alters the design is time lost with the appearance
of rigor.

## Problem

Two error patterns, opposites.

**Skipping the estimate.** The candidate goes straight to the design, and every subsequent decision
lacks justification. When the interviewer asks "why partition?", the answer is a rationalization
instead of a calculation.

**Estimating everything.** The candidate computes requests per second, storage, bandwidth, number
of servers, cache memory, concurrent connections, growth rate over five years — and consumes twelve
minutes. Half those numbers influence no choice.

```text
number that decides         read/write, total volume, peak
number that rarely decides  outbound bandwidth in GB/s, the exact
                            number of servers, 5-year growth
```

The second group appears because it looks rigorous. The evaluator is not counting numbers — they
are watching whether you know which one matters.

## Core Concepts

### The four numbers that almost always matter

```text
1. the read-to-write ratio
2. volume at peak, not at average
3. total storage volume
4. the size of the hot data — what has to be in memory
```

The first decides the general strategy: read-dominated systems call for caching, replicas and
materialization; write-dominated ones call for partitioning and asynchronous ingestion.

The second decides the sizing. Working with the average is the most common error, and the
difference between average and peak is usually 3× to 10×.

The third decides storage and its tiering. The fourth decides whether caching is viable — if the
hot set fits in memory at a reasonable cost, many decisions become simple.

The fourth number is the most forgotten and the one with the most leverage. It requires an
assumption about the access distribution, which is almost always uneven: in content, in a catalog,
in links, in profiles, a small fraction accounts for most of the accesses. Declaring "I'll assume
1% of the records account for 90% of the accesses" is a defensible assumption and turns a terabyte
problem into a gigabyte problem.

Candidates who do not make that distinction end up proposing solutions sized for the total volume,
when the volume that matters is the hot one — and the difference between the two is usually two
orders of magnitude.

### Simplify the numbers aggressively

```text
1 day          ≈ 100 thousand seconds  (86,400, rounded)
1 month        ≈ 2.5 million seconds
1 million/day  ≈ 12/s
1 billion/day  ≈ 12 thousand/s
```

Rounding to powers of ten and to round numbers is expected and demonstrates fluency. Nobody expects
precision; the expectation is the correct order of magnitude and arithmetic that can be done while
speaking.

See [back-of-the-envelope calculation](/22-system-design-interviews/back-of-envelope.md) for size
and latency references.

### Do the math out loud

```text
"300 million daily active users, each opening the feed
 5 times: 1.5 billion opens per day.
 Divided by 100 thousand seconds, that's 15 thousand per second on average.
 With a 3× peak, I get to 45 thousand per second."
```

The reasoning is what is being evaluated, not the total. A candidate who gets the arithmetic wrong
and explains the path correctly is evaluated better than one who gets it right in silence.

And declaring each assumption — "5 opens per user" — lets the interviewer adjust: "it's actually
20". The number changes, the method does not.

### Connect each number to a decision

This is the difference between estimating and demonstrating that you know how to estimate:

```text
"45 thousand reads/s against 6 thousand writes/s — a 7-to-1 ratio.
 That is not extreme enough to justify aggressive materialization;
 read replicas with a cache should be enough."

"The hot set is ~200 GB. It fits in distributed memory at an
 acceptable cost, so a cache handles most of the reads."

"2.4 PB in total. That rules out keeping everything in fast
 storage; we need tiering by age."
```

A number with no declared consequence is arithmetic. A number with a consequence is architecture.

That connection also protects against a common trap: arriving at a number and not noticing that it
contradicts what you were about to propose. A candidate who computes 120 writes per second and then
proposes write partitioning is ignoring their own calculation — and the evaluator will notice.
Stating the consequence right after the number makes that contradiction impossible to sustain.

### Estimate storage with the record size

```text
1. how many records per day
2. average size of each one
3. for how long they are retained
4. multiply, and add replication and indexes
```

Step 2 is where most candidates freeze. The way out is to decompose: a text post has an identifier,
an author, content, timestamps and metadata — something between 300 bytes and 1 KB. Declaring "I'll
assume 500 bytes" and moving on is the correct answer.

And remember that replication and indexes multiply: a factor of 3× to 5× over the raw data is a
reasonable assumption and demonstrates experience.

### Know when to stop

```text
45-min interview      estimation: 4 to 6 min
60-min interview      estimation: 5 to 8 min
```

If a number is not going to change anything, say so and move on: "I won't compute outbound
bandwidth because I don't see a decision depending on it in this design". That demonstrates
judgment, which is worth more than the calculation.

## Mental Model

**Estimate what decides.** Four numbers, out loud, each followed by the consequence it produces.

## When to Use

- After the requirements, before the design.
- Whenever a decision depends on scale.
- Again, when the interviewer changes a volume requirement.

## When Not to Use

**Computing everything.**

**Without connecting it to a decision.**

**With excessive precision** — "43,287 requests per second" is worse than "about 45 thousand".

**Using the average** when the peak is what sizes it.

**In silence** — the value is in the verbalized reasoning.

## Alternatives

- **Declare the order of magnitude** — "we're in the tens of thousands per second" — when time is
  tight.
- **Estimate on demand** — do the calculation at the moment the decision appears, instead of all of
  it at the start.
- **Ask for the number** — if the interviewer has one in mind, using it is faster and equally
  valid.

The second is underestimated and frequently better: a calculation done at the moment it decides
something is evidently connected, with no connecting effort.

## Trade-offs

| Estimate early | Estimate on demand |
|---|---|
| Scale declared from the start | Every number has immediate use |
| Some numbers go unused | Interrupts the design's flow |
| Visible structure | Requires agility |

| More numbers | Fewer |
|---|---|
| Coverage | Focus on what decides |
| Consumes time | Risk of missing a basis |
| Looks rigorous | Demonstrates judgment |

## Failure Modes

**No estimate.** Decisions with no criterion.

**Disconnected estimate.** Numbers that influence nothing.

**Average instead of peak.** Sizing wrong by 3× to 10×.

**False precision.** Suggests the candidate does not understand the nature of the exercise.

**Freezing on the record size.** Declaring an assumption and moving on solves it.

## Common Mistakes

**Computing outbound bandwidth** without it deciding anything.

**Not estimating the hot set**, which is what decides caching.

**Not accounting for replication and indexes** in storage.

**Not revisiting** when the interviewer changes the volume.

**Doing the math in silence.**

## Interview Example

**Problem.** "Design a URL shortening system."

**Estimation, out loud:**

```text
"I'll assume 100 million links created per month.
 That's about 40 per second on average.

 The read/write ratio in shorteners is high — I'll assume
 100 to 1. So 4 thousand redirects per second on average.

 With a 3× peak, I get to 12 thousand redirects per second
 and 120 creations per second.

 Storage: each record has the short code, the original URL,
 the author and timestamps — I'll assume 500 bytes. 100 million per month,
 for 5 years, gives 6 billion records, or about 3 TB.
 With replication and indexes, something around 10 TB.

 The hot set is what matters: the access distribution for
 links is very uneven, and it is reasonable to assume that 1% of the links
 accounts for 90% of the accesses. That gives 60 million hot
 records, or ~30 GB. It fits in memory."
```

**The consequences, declared:**

```text
12 thousand reads/s, 120 writes/s
  → read-dominated system; cache and replicas handle it
  → no need to partition writes

30 GB hot set
  → an in-memory cache covers 90% of accesses at low cost
  → the database handles the remaining 10% comfortably

10 TB in total
  → fits in a well-partitioned relational database; there is no
    need for exotic distributed storage

120 writes/s
  → code generation can be simple; no serious contention
    to solve
```

**What I will not compute, and why:**

```text
"I won't compute outbound bandwidth: a redirect is an HTTP
 response of a few hundred bytes, and I see no decision
 depending on that number.

 I also won't project 5-year growth: the architecture that
 serves 12 thousand per second serves 50 thousand with more replicas,
 with no structural change."
```

Declaring what you do **not** compute is as demonstrative as computing. It shows the choice was
conscious.

**Likely follow-up question:** "and what if it were 100 thousand redirects per second?"

The correct answer checks what changes: the hot set still fits in memory, so the cache still
handles it; what changes is the number of cache instances and the need for geographic distribution.
The architecture does not change — the capacity does. Recognizing that is the point.

## Related Concepts

- [Back-of-the-Envelope Calculation](/22-system-design-interviews/back-of-envelope.md) — the
  references.
- [Functional vs. Non-Functional](/22-system-design-interviews/functional-vs-nonfunctional.md).
- [Bottleneck Identification](/22-system-design-interviews/bottleneck-identification.md).
- [Capacity Planning](/05-system-design/capacity-planning.md) — the version with no time pressure.

## Practical Exercise

Estimate, in five minutes and out loud, the four main numbers of a messaging system with 20 million
daily users.

Then write, next to each number, which architectural decision it produces. The ones that produce
none you did not need to compute.

## Interview Questions

- Why does estimation exist if the number does not have to be right?
- What are the four numbers that almost always matter?
- Why is declaring what you will not compute demonstrative?

## Further Reading

- Xu, Alex. *System Design Interview*. Byte Code, 2020.
- Dean, Jeff. *Numbers Everyone Should Know*. Google, 2009.
- Kleppmann, Martin. *Designing Data-Intensive Applications*. O'Reilly, 2017.

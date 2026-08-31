---
id: back-of-envelope
title: Back-of-the-Envelope Calculation
sidebar_position: 4
description: The reference numbers that let you estimate without looking anything up, and the arithmetic that fits in your head.
doc_type: concept
level: 0
difficulty: intermediate
status: complete
objective: >
  By the end, the reader does order-of-magnitude calculations in their head, with memorized
  references for latency, size and capacity.
prerequisites: [capacity-estimation]
related: [capacity-estimation, interview-scaling, bottleneck-identification]
canonical_for: []
translated_from_version: 1
last_reviewed: 2026-08-31
---

# Back-of-the-Envelope Calculation

## Overview

Back-of-the-envelope calculation is the ability to reach the correct order of magnitude using only
memorized numbers and simple arithmetic.

It matters because most architectural decisions do not depend on precision — they depend on knowing
whether something is milliseconds or seconds, gigabytes or terabytes, one machine or a thousand.

```text
"does it fit in memory?"       GB against TB
"does it need partitioning?"   thousands against millions per second
"is caching worth it?"         network latency against disk latency
"can we scan that?"            seconds against hours
```

Being off by a factor of two is irrelevant. Being off by a factor of a thousand changes everything,
and that is what the references prevent.

## Problem

Without memorized references, the candidate freezes. The conversation goes like this:

```text
interviewer   "does that fit in memory?"
candidate     "hmm... depends on the size"
interviewer   "estimate it"
candidate     (silence)
```

The freeze is not a lack of intelligence — it is a lack of anchors. Someone who does not know that
a disk read takes about a millisecond and a memory read about a hundred nanoseconds has no way to
compare the two in their head.

And there is the opposite error: doing complicated math. Multiplying 86,400 by 347 mentally during
an interview is a waste of attention — rounding to 100,000 × 350 gives the same useful result with
a fraction of the effort.

## Core Concepts

### Reference latencies

The numbers that decide the most, in orders of magnitude:

```text
CPU cache reference                  ~1 ns
main memory access                   ~100 ns
compressing 1 KB                     ~10 µs
reading 1 MB from memory             ~50 µs
round trip on the same local network ~0.5 ms
random read on SSD                   ~0.1 ms
reading 1 MB from SSD                ~1 ms
random read on a spinning disk       ~10 ms
round trip between continents        ~150 ms
```

What you extract from them is the hierarchy, and that is what matters:

```text
memory is ~1,000× faster than SSD
SSD is ~100× faster than a spinning disk
a local network is ~300× faster than an intercontinental network
```

That answers most latency questions with no math at all.

It is worth understanding why that hierarchy decides so much. A system that makes an
intercontinental round trip on a request's path cannot get below 150 ms, however good everything
else is — physics imposes the floor. A system that reads from memory instead of disk improves by
three orders of magnitude, which no code optimization reaches.

Recognizing that latency is dominated by the slowest link in the chain is what lets you answer
"how do we reduce the latency of this?" quickly — the answer is always to remove or parallelize the
dominant link, and the references are what let you identify it without measuring.

### Reference sizes

```text
ASCII character                1 byte
identifier (UUID)              16 bytes
timestamp                      8 bytes
typical database row           ~100 to 1,000 bytes
short text post                ~300 bytes to 1 KB
compressed image               ~200 KB to 2 MB
minute of high-definition
  video                        ~50 MB
```

For sizes you do not know, decomposing works: an order record has an identifier, a customer, items,
amounts and timestamps — something between 500 bytes and 2 KB. Declaring the assumption and moving
on is the right answer.

An error of a factor of two in the record size rarely changes an architectural decision; freezing
because you do not know the exact value costs time and conveys insecurity. The correct posture is to
decompose, propose a number, say it is an assumption, and continue.

### Reference capacities

```text
a typical modern machine
  memory                       64 to 512 GB
  simple HTTP requests/s       a few thousand to tens of thousands
  concurrent connections       tens of thousands
  network throughput           10 Gbps  ≈  1 GB/s

a well-tuned relational database
  simple reads/s               tens of thousands
  writes/s                     thousands to tens of thousands
  rows before requiring
    partitioning               hundreds of millions to billions
```

The last item is the most useful and the most badly calibrated in interviews: candidates propose
partitioning for volumes a relational database handles effortlessly.

The wrong calibration has an identifiable origin: the interview literature describes global-scale
systems, and the intuition formed by it overestimates what requires distribution. A relational
database on a modern machine handles tens of thousands of reads per second and billions of rows —
which covers most systems that exist, and a good part of interview prompts.

Proposing the distributed solution when the simple one suffices is read as a lack of judgment, not
as ambition. The strong answer is the opposite: "that volume fits in a single database; if it grows
20×, then we partition, and the key would be this one".

### Arithmetic that fits in your head

```text
1 day            ≈ 10⁵ seconds   (86,400 → 100,000)
1 month          ≈ 2.5 × 10⁶ s
1 year           ≈ 3 × 10⁷ s

1 million/day    ≈ 10/s
1 billion/day    ≈ 10,000/s
1 million/s      = 86 billion/day
```

And the powers of ten for storage:

```text
10⁹ records × 1 KB  = 1 TB
10⁶ records × 1 MB  = 1 TB
10¹² bytes          = 1 TB
10¹⁵ bytes          = 1 PB
```

Memorizing that **a billion one-kilobyte records is a terabyte** solves most storage estimates in
one multiplication.

### Round before multiplying

```text
bad    347 million × 1,437 bytes ÷ 86,400
good   350 M × 1.5 KB  →  ~500 GB/day
       ÷ 100,000 s  →  ~5 MB/s
```

The second form is done while speaking, in five seconds, and gets to the same place. Precision
beyond the order of magnitude is noise in a context where the input assumptions are estimates.

### Check the plausibility of the result

A habit that prevents gross errors: comparing the result with something known.

```text
"I got 40 PB per day — that's more than the traffic of
 an entire global social network. I must have gotten an
 order of magnitude wrong."

"I got 3 requests per second — that's less than a personal
 blog. I probably underestimated the number of users."
```

Doing that check out loud demonstrates calibration, which is exactly what the exercise measures.

The plausibility check is also the defense against the most expensive error of this kind of
calculation: an order of magnitude lost in a conversion. Swapping millions for billions, or
megabytes for gigabytes, changes the result by a thousand — and the resulting number is usually
absurd in a detectable way, if someone looks at it with a reference in mind.

Having two or three comparison anchors memorized solves that: the approximate traffic of a large
service, the storage of a mid-sized organization, the capacity of one machine. Any result far from
those anchors deserves a second look before becoming an argument.

## Mental Model

**Hierarchy, not precision.** Memorize the orders of magnitude, round before multiplying, and check
that the result is plausible.

## When to Use

- In any estimate during the interview.
- To answer "does that fit in memory?" or "does that scale?" quickly.
- To check the plausibility of a proposal, yours or the interviewer's.

## When Not to Use

**Seeking precision** — that is not the exercise.

**With complicated math** — round.

**Without checking plausibility.**

**As a substitute for measurement** in a real context; here it is an interview, there it is
profiling.

**Reciting numbers** without using them to decide.

## Alternatives

- **Declare the order of magnitude directly** — "we're in the terabytes" — when the math adds
  nothing.
- **Compare with a known system** — "that's of the order of a mid-sized social network's volume".
- **Ask** — if the interviewer has the number, using it is faster.

## Trade-offs

| Compute | Declare the order of magnitude |
|---|---|
| Demonstrates method | Faster |
| Anchors the assumptions | Less verifiable |
| Consumes time | Can look like a guess |

| More memorized references | Fewer |
|---|---|
| Immediate answers | Less to memorize |
| Risk of reciting without using | Risk of freezing |

## Failure Modes

**Freezing for lack of an anchor.**

**Complicated math** that consumes attention.

**Order-of-magnitude error** gone unnoticed.

**Reciting numbers** without connecting them to a decision.

**Underestimating one machine's capacity** — and proposing unnecessary distribution.

## Common Mistakes

**Proposing partitioning** for volumes a database handles.

**Confusing bits and bytes** in bandwidth calculations.

**Forgetting replication and indexes** in storage.

**Not checking whether the result is plausible.**

**Using 86,400 instead of 100,000** and losing time.

## Interview Example

**Question.** "A system stores 500 million photos per day, at 2 MB on average. How much is that per
year, and what does it fit in?"

**Reasoning out loud:**

```text
"500 million × 2 MB = 1 petabyte per day.
 Rounding the year to 400 days — to make it easier and stay
 conservative — that's 400 PB per year.

 Checking plausibility: that's of the order of what a global
 social network stores, which is consistent with 500 million
 photos daily.

 With 3× replication, I get to 1.2 exabytes per year of raw
 storage. That rules out any solution that is not distributed
 object storage, and makes tiering by age mandatory — not by
 choice, by cost."
```

**Second question.** "And the metadata for those photos, does it fit in memory?"

```text
"Metadata for a photo: identifier, author, timestamp,
 dimensions, location, reference to the object — I'll assume
 200 bytes.

 500 million per day × 400 days = 200 billion records per year.
 × 200 bytes = 40 TB per year.

 It does not fit in memory for the full history. But the hot
 set does: if the photos of the last 7 days account for most
 of the accesses, that's 3.5 billion records, or 700 GB —
 viable in distributed memory."
```

The second answer is the one that differentiates: it does not stop at "it doesn't fit", it
identifies the subset that does, and connects that to the caching decision. Answering only "it
doesn't fit" ends the line of reasoning; identifying the slice that fits opens the solution.

**Third question.** "How many machines to serve 200 thousand metadata requests per second?"

```text
"One machine serves a few thousand to tens of thousands of
 simple requests per second. I'll assume 10 thousand, which is
 conservative for cache reads.

 200 thousand ÷ 10 thousand = 20 machines for the load.
 With headroom for peak and for failure, something between 40 and 60.

 Checking: 60 machines to serve metadata for a large social
 network seems reasonable — it's neither absurdly low
 nor high."
```

## Related Concepts

- [Capacity Estimation in Interviews](/22-system-design-interviews/capacity-estimation.md).
- [Scaling in Interviews](/22-system-design-interviews/interview-scaling.md).
- [Latency](/06-distributed-systems/latency.md).
- [Caching](/05-system-design/caching.md).

## Practical Exercise

Without looking anything up, write from memory: the latency of a memory access, of an SSD and of an
intercontinental network; how many seconds are in a day, rounded; and how many terabytes a billion
1 KB records are.

If you froze on any of them, that is the anchor you are missing.

## Interview Questions

- How many orders of magnitude separate memory from SSD, and SSD from a spinning disk?
- Why is rounding 86,400 to 100,000 the right choice?
- How do you check whether an estimate's result is plausible?

## Further Reading

- Dean, Jeff. *Numbers Everyone Should Know*. Google, 2009.
- Bentley, Jon. *Programming Pearls*. 2nd ed. Addison-Wesley, 1999 — ch. 7.
- Xu, Alex. *System Design Interview*. Byte Code, 2020.

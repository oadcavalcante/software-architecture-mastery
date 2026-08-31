---
id: high-level-architecture
title: High-Level Architecture
sidebar_position: 7
description: Few boxes, one complete flow, and every component justified by a requirement.
doc_type: concept
level: 0
difficulty: intermediate
status: complete
objective: >
  By the end, the reader draws a simple and complete initial architecture, with every box tied to
  a requirement, and expands it on demand.
prerequisites: [interview-data-modeling]
related: [bottleneck-identification, interview-scaling, interview-structure]
canonical_for: []
translated_from_version: 1
last_reviewed: 2026-08-31
---

# High-Level Architecture

## Overview

The high-level design is the middle of the interview, and it has a rule that intuition contradicts:
**start too simple**.

```text
first version   4 to 6 boxes, the complete flow working
then            expand where the interviewer points, or where
                the estimate says there is a bottleneck
```

An initial design with fifteen components is hard to explain, hard to critique and suggests the
candidate applied a template instead of deriving one. A design with five boxes that serves the
entire flow is a basis on which the conversation happens.

## Problem

Two patterns.

**Premature complexity.** The candidate draws a load balancer, a gateway, six microservices, a
queue, a cache, replicas, a search index and object storage — in three minutes, before any
bottleneck has been identified.

The problem is not that the components are wrong. It is that none was justified, and the
interviewer has no way to distinguish judgment from memorization. The question that follows is "why
that queue?", and the answer needs to be better than "to decouple".

**Incomplete design.** The candidate goes deep into one part — the caching model, for example — and
never closes the flow. By the end of the interview, there is no complete path from the user's
request to the response.

```text
evaluated   is there a complete flow that works?
            does each component have a reason?
            does the candidate know what to do when it does not scale?
```

## Core Concepts

### Draw the path, not the topology

Start with the flow of the main operation, following the request:

```text
client → load balancer → application service → database
                                ↓
                              cache
```

Five boxes. They serve the whole functional requirement. From here, each addition has a declared
reason.

Drawing the path has an advantage over drawing the topology: it keeps the focus on how a request is
served, and that is what reveals where it can fail or become slow.

### One box, one reason

```text
"a load balancer because there is more than one application instance"
"a cache because the read/write ratio is 100 to 1 and the hot
 set fits in memory"
"a queue because order confirmation depends on an external
 partner with 98.7% availability, and our requirement is 99.9%"
```

The third sentence is the model: it ties a component to a number that came from the estimate and to
a requirement that came from the clarification. That chain — requirement, number, component — is
what distinguishes architecture from recitation.

If you cannot state the reason for a box, it should not be in the design yet.

It is worth noting that this rule also protects against the most uncomfortable question of the
interview: "what happens if I remove that component?". A candidate who placed each box for a reason
answers immediately — "without the cache, the database sees 12 thousand reads per second instead of
600, which would require many replicas and cost more". A candidate who copied a template has no
answer, and the absence of one is more informative than any drawing.

### Start monolithic and split under pressure

A choice that causes discomfort and is the correct one:

```text
first version   "application service" — one box
then            split where there is a reason: a different load
                profile, a different availability requirement,
                or a different team
```

Drawing six microservices from the start is the most common error in mid-level interviews. It
signals that the split came from a mental template and not from the problem. See
[monolith vs. microservices](/20-trade-offs/monolith-vs-microservices.md).

The strong answer when the interviewer asks "and microservices?": "I would split if we had
independent teams needing to deploy separately, or if some component had a very different scale
profile. Here, component X does — so I would separate it, and keep the rest together".

### Mark the volume on the arrows

```text
client → application      12 thousand/s
application → cache       12 thousand/s, 95% hit rate
application → database    600/s reads, 120/s writes
```

Noting the numbers turns the drawing into an analysis instrument: it becomes visible where the load
concentrates, and the next question — "what saturates first?" — has an immediate answer. See
[bottleneck identification](/22-system-design-interviews/bottleneck-identification.md).

### Complete the flow before going deep

```text
bad    detailing the cache for eight minutes with the flow half-finished
good   closing the whole path in five minutes, and then
       asking "where would you like me to go deeper?"
```

The question at the end of the initial design is a strong move: it returns control to the
interviewer, who will point at where they want to evaluate, and it keeps you from going deep into a
part they do not find interesting.

It also has a pacing effect. Interviews frequently drift toward the subject the candidate knows
best, and the evaluator notices that. Explicitly inviting the choice of topic signals confidence in
covering any of them — and, in practice, the interviewer usually picks precisely where they have a
prepared question, which is the part of the conversation that yields the most.

### Separate the read and write paths

When the two have different profiles — and they almost always do — drawing them separately
clarifies:

```text
write   client → application → database → (event) → processing
read    client → cache → application → replica
```

That separation makes it obvious why the cache is on the read side, why the replica exists, and
where eventual consistency appears. It is a more informative drawing with the same number of boxes.

### Name by responsibility, not by technology

```text
bad    "Redis", "Kafka", "PostgreSQL"
good   "session cache", "order event queue",
       "orders database"
```

Naming by responsibility keeps the conversation at the architecture level and prevents it from
drifting into product comparison. Technology enters as a note — "it would be an in-memory cache,
something like Redis" — without taking center stage.

## Mental Model

**Five boxes, complete flow, each one justified.** Expand on demand, not by anticipation.

## When to Use

- After requirements, estimates, API and model.
- Starting with the path of the main operation.
- With volumes noted on the arrows.

## When Not to Use

**With fifteen boxes out of the gate.**

**Going deep before closing the flow.**

**With unjustified components.**

**Splitting into services with no declared reason.**

**Naming by product** instead of by responsibility.

## Alternatives

- **Describe the flow in text** — when there is no board; less effective and viable.
- **Draw two flows** — read and write separately; better when the profiles diverge.
- **Start with the bottleneck** — if the estimate has already pointed at one, drawing around it is
  legitimate.

## Trade-offs

| Simple design | Complete design |
|---|---|
| Easy to explain and critique | Covers more |
| Expands on demand | Consumes time |
| Every box justified | Suggests memorization |

| Monolithic first | Split from the start |
|---|---|
| Split justified later | Looks more modern |
| Fewer boxes to explain | More surface to defend |

## Failure Modes

**Premature complexity.** Components with no reason.

**Incomplete flow.** No complete path by the end of the interview.

**Splitting into services with no criterion.**

**Arrows with no volume.** The drawing does not support the analysis that follows.

**Product names.** The conversation becomes a technology comparison.

## Common Mistakes

**Drawing the memorized reference architecture**, regardless of the prompt.

**Not closing the flow** before going deep.

**Placing a queue without saying what it solves.**

**Not asking where the interviewer wants to go deeper.**

**Ignoring the read path** when it dominates the volume.

## Interview Example

**Problem.** "Design a URL shortener." Requirements and estimates already done: 12 thousand
redirects per second, 120 creations per second, a 30 GB hot set.

**First drawing, in four minutes:**

```text
                    ┌──────────┐
client ───────────► │   load   │
                    │ balancer │
                    └────┬─────┘
                         │
                    ┌────▼─────┐      ┌───────┐
                    │  links   │ ───► │ cache │
                    │ service  │ ◄─── │       │
                    └────┬─────┘      └───────┘
                         │
                    ┌────▼─────┐
                    │  links   │
                    │ database │
                    └──────────┘
```

**The justification for each box, out loud:**

```text
"a load balancer because 12 thousand per second requires several instances

 the links service is a single box: creating and redirecting are
 operations of the same domain, with the same model, and I see no
 reason to separate them now

 a cache because reads are 100× writes and the 30 GB hot set
 fits in memory. With a 95% hit rate, the database sees
 600 reads per second instead of 12 thousand

 a relational database because 10 TB and 120 writes per second
 fit comfortably, and we may have unforeseen queries"
```

**Volumes on the arrows:**

```text
client → service       12,120/s
service → cache        12,000/s, 95% hit rate
service → database     600/s reads + 120/s writes
```

**The question to the interviewer:**

```text
"That flow meets the requirements we gathered. Where would you
 like me to go deeper: short code generation, caching strategy,
 availability, or click analytics?"
```

**If they ask for click analytics**, the drawing gains a box — and the justification comes with it:

```text
"clicks are 12 thousand events per second, and the analytics tolerates
 minutes of delay. Putting that in the synchronous path of the
 redirect would add latency to what is most critical.

 I'll emit an asynchronous event and aggregate off the path:
 service → queue → aggregator → metrics storage.

 That keeps the redirect at one cache read and nothing more."
```

Note that the new box entered with a requirement, a number and a consequence — and that it only
appeared when it was asked for.

## Related Concepts

- [Bottleneck Identification](/22-system-design-interviews/bottleneck-identification.md) — the next
  step.
- [Scaling in Interviews](/22-system-design-interviews/interview-scaling.md).
- [Monolith vs. Microservices](/20-trade-offs/monolith-vs-microservices.md).
- [Components](/05-system-design/components.md).

## Practical Exercise

Draw, in five minutes, the architecture of a scheduling system — and write next to each box its
reason in one sentence.

The boxes with no sentence are the ones you placed out of habit. Remove them and see whether the
flow still works.

## Interview Questions

- Why is starting with few boxes better than starting complete?
- Why is asking the interviewer where to go deeper a strong move?
- Why name components by responsibility and not by product?

## Further Reading

- Xu, Alex. *System Design Interview*. Byte Code, 2020.
- Brown, Simon. *Software Architecture for Developers*. Leanpub, 2015.
- Newman, Sam. *Building Microservices*. 2nd ed. O'Reilly, 2021.

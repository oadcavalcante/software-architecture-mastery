---
id: interview-api-design
title: API Design in the Interview
sidebar_position: 5
description: Few endpoints, written fast — they delimit the scope better than any discussion.
doc_type: concept
level: 0
difficulty: intermediate
status: complete
objective: >
  By the end, the reader writes the minimal API that expresses the system and uses it to fix the
  scope before the internal design.
prerequisites: [functional-vs-nonfunctional]
related: [interview-data-modeling, high-level-architecture, interview-structure]
canonical_for: []
translated_from_version: 1
last_reviewed: 2026-08-31
---

# API Design in the Interview

## Overview

Writing the API right after the requirements looks like a detour and is a shortcut. Three to five
endpoints, written in two minutes, do two things no discussion does:

```text
they fix the scope     what has no endpoint is not in the system
they reveal the model  the parameters and responses expose the entities
```

And there is a practical effect: once the API is on the board, the internal design has a concrete
target. You are not designing "a URL shortener"; you are designing what serves those five
endpoints.

## Problem

Two error patterns.

**Skipping the API.** The candidate goes from requirements straight to boxes, and the scope stays
fluid. Twenty minutes later, they are designing an analytics subsystem nobody asked for, because
nothing delimited what the system exposes.

**Detailing the API.** The candidate spends eight minutes writing error codes, headers, versioning,
pagination format and validation schema. None of that is evaluated, and the time came out of the
design.

```text
evaluated          which operations exist, with which parameters
                   and what they return
not evaluated      the exact HTTP code, the header name,
                   the error body format
```

The API in an interview is an instrument of scope, not a contract document.

## Core Concepts

### Few endpoints, written fast

```text
POST   /urls              {url, expires_at?}  →  {code, short_url}
GET    /{code}            →  302 to the original URL
GET    /urls/{code}       →  {url, created_at, clicks}
DELETE /urls/{code}       →  204
```

Four lines, one minute of writing. They say everything: the system creates, redirects, looks up and
deletes — and nothing more. If the interviewer wants detailed click analytics, they will ask, and
then the API gains an endpoint.

Writing those four lines has a containment effect that is hard to get any other way. A candidate
who did not write the API tends to add features while drawing — a dashboard here, a notification
there — because nothing established the boundary. With the API on the board, adding something
requires adding an endpoint, and that is a visible act that prompts the question "was that in
scope?".

### The parameters reveal the model

Writing the signature forces decisions that prose leaves vague:

```text
POST /urls {url, expires_at?}
  → there is expiry; it is optional; the model has a validity period

GET /{code} → 302
  → the redirect is the highest-volume operation, and it is
    the simplest possible: a read by key

GET /urls/{code} → {clicks}
  → there is counting; it is read per link, not aggregated
```

Each of those observations takes seconds and produces a consequence for the data model. See
[modeling in the interview](/22-system-design-interviews/interview-data-modeling.md).

### Separate the operations by profile

A high-return habit: grouping the endpoints by non-functional characteristics.

```text
very high volume, read, latency-critical
  GET /{code}

low volume, write, latency-tolerant
  POST /urls, DELETE /urls/{code}

low volume, read, delay-tolerant
  GET /urls/{code}
```

That separation is what guides the design: the first group dominates the sizing and deserves cache
and replicas; the second is irrelevant to scale; the third can be served from aggregated data.

Doing this out loud demonstrates that you understand that operations of the same system have
different requirements. See
[functional vs. non-functional](/22-system-design-interviews/functional-vs-nonfunctional.md).

And that grouping is what later lets you propose designed degradation naturally: if the low-volume
group goes unavailable, the system keeps serving what matters. A candidate who has already
separated the operations by profile has that answer ready when the interviewer asks "and what if
the database goes down?".

### Granularity: neither one operation per field, nor one that does everything

```text
too fine     POST /urls, PUT /urls/{c}/title, PUT /urls/{c}/tags,
             PUT /urls/{c}/expiry
too coarse   POST /operation {type: "create_url", ...}
appropriate  POST /urls, PATCH /urls/{code}
```

Appropriate granularity follows the domain's units of change: what changes together stays together.
In an interview, the rule of thumb is one operation per user intent.

### Asynchronous when the operation is long

```text
synchronous    POST /urls  →  201 {code}
asynchronous   POST /reports  →  202 {task_id}
               GET  /reports/{task_id}  →  {state, result?}
```

Recognizing which operation is long and proposing the accept-with-later-lookup pattern demonstrates
maturity, and opens the conversation about intermediate state — which is a good conversation to
have.

See [synchronous vs. asynchronous](/20-trade-offs/sync-vs-async.md).

### Mention what you will not detail

```text
"I'll assume token authentication in the header, cursor pagination
 wherever there is a list, and I won't detail error codes —
 tell me if you want me to come back to that"
```

One sentence solves it. It shows you know those things exist and chose not to spend time on them,
which is different from forgetting.

That distinction — between omitting by choice and omitting out of ignorance — comes up constantly
in the evaluation, and making it explicit costs seconds. It also opens a door: an interviewer who
wants to discuss versioning will ask, and you will have the topic in the right place in the
conversation instead of in the place where it consumes the design's time.

### The style matters less than it seems

REST, gRPC or GraphQL — the choice is rarely the point of the interview, and defending it at length
consumes time. One sentence is enough:

```text
"I'll use REST because it's the simplest to discuss here; if
 there were a very low latency requirement between internal
 services, I would consider gRPC"
```

That demonstrates the choice was conscious and returns the conversation to what matters.

There is an exception: when the prompt involves communication between many internal services with a
tight latency requirement, or when the client is mobile on a poor connection with several resources
to fetch, the style choice starts having a real consequence. In those cases it deserves a minute,
not a sentence — and recognizing the difference between the two contexts is itself a sign of
judgment.

## Mental Model

**The API delimits the scope in two minutes.** Few operations, grouped by profile, with what will
not be detailed said out loud.

## When to Use

- Right after the requirements, before the internal design.
- As an instrument of scope, not as a specification.
- Grouping the operations by non-functional characteristics.

## When Not to Use

**Detailing errors, headers and versioning.**

**With many endpoints** — more than six or seven indicates the scope was not delimited.

**Debating style** for several minutes.

**Without connecting it to the data model** and the design.

**Before the non-functional requirements** — without them, there is no way to group by profile.

## Alternatives

- **Describe the operations in text** — when time is tight; less precise and faster.
- **Start with the data model** — works equally well in data-centered domains.
- **Skip to the design** — legitimate if the interviewer indicates they want to reach the
  architecture quickly.

## Trade-offs

| Write the API | Skip it |
|---|---|
| Scope fixed | More time for the design |
| Model revealed | Risk of fluid scope |
| Two minutes | None |

| Few endpoints | Many |
|---|---|
| Clear scope | Full coverage |
| Focus on what decides | Consumes time |

## Failure Modes

**Fluid scope.** With no API, the system grows during the interview.

**API detailed too much.** Time spent on what is not evaluated.

**No grouping by profile.** You lose the information that guides the design.

**Style debate.** Consumes time without demonstrating anything.

**An endpoint that matches no requirement.** A sign the candidate is reciting.

## Common Mistakes

**Writing ten endpoints** for a system with four requirements.

**Not marking which operation dominates the volume.**

**Detailing pagination and errors.**

**Forgetting the highest-volume operation** — in shorteners, the redirect.

**Not saying what was left out.**

## Interview Example

**Problem.** "Design a news feed service."

**API, written in two minutes:**

```text
POST /posts            {content, media?}   →  {id, created_at}
GET  /feed             ?cursor=&limit=     →  {posts[], next_cursor}
POST /follows          {user_id}           →  204
DELETE /follows/{id}                       →  204
POST /posts/{id}/reactions {type}          →  204
```

**Grouping by profile, said out loud:**

```text
"GET /feed is the operation that sizes the system: 300 million
 daily users, five opens each, gives 15 thousand per second.
 It is a read, tolerates 30 seconds of staleness, and needs
 p95 under 500 ms.

 POST /posts is 500 million per day, or ~6 thousand per second —
 forty times less. It needs durability, tolerates 1 second of
 latency.

 POST /reactions has the highest absolute volume, but it is fire
 and forget: it can be asynchronous, and the count can be approximate.

 follows are rare: a few thousand per second, with no special
 requirement."
```

**What that API has already decided:**

```text
cursor pagination in the feed
  → the feed is an ordered sequence, not a set
  → suggests a materialized list, not an aggregating query

reaction as a separate operation, with no count returned
  → the count does not need to be immediate or exact

follow as a simple operation
  → the graph is queried, not returned; it is internal
```

**What is left out, declared:**

```text
"I won't detail authentication, error codes or versioning.
 I also won't include search or direct messages, which were
 out of the scope we agreed on."
```

**Likely follow-up question:** "how does the client know there are new posts?"

The answer opens a real decision: periodic polling, a persistent connection, or a push notification.
And each has a scale consequence — with 300 million users, persistent connections are a subsystem
of their own. See the [messaging case study](/21-case-studies/messaging-platform.md).

## Related Concepts

- [Modeling in the Interview](/22-system-design-interviews/interview-data-modeling.md).
- [High-Level Architecture](/22-system-design-interviews/high-level-architecture.md).
- [Integration Contracts](/08-integration-architecture/integration-contracts.md).
- [APIs](/05-system-design/apis.md).

## Practical Exercise

Write, in two minutes, the API of an appointment scheduling system.

Then mark, next to each endpoint, the expected volume and the latency requirement. If any endpoint
has no declared profile, you do not know whether it matters for the sizing.

## Interview Questions

- Why does writing the API before the internal design save time?
- Why group endpoints by non-functional characteristics?
- What should not be detailed in an interview API?

## Further Reading

- Xu, Alex. *System Design Interview*. Byte Code, 2020.
- Fielding, Roy. *Architectural Styles and the Design of Network-based Software Architectures*,
  2000.
- Newman, Sam. *Building Microservices*. 2nd ed. O'Reilly, 2021.

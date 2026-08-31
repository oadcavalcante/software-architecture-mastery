---
id: functional-vs-nonfunctional
title: Functional vs. Non-Functional Requirements
sidebar_position: 2
description: Functional ones say what to build; non-functional ones say how it has to be — and they are the ones that decide the architecture.
doc_type: concept
level: 0
difficulty: intermediate
status: complete
objective: >
  By the end, the reader separates the two types out loud and recognizes that the non-functional
  ones are what produce architectural decisions.
prerequisites: [requirement-clarification]
related: [requirement-clarification, capacity-estimation, communicating-tradeoffs]
canonical_for: []
translated_from_version: 1
last_reviewed: 2026-08-31
---

# Functional vs. Non-Functional Requirements

## Overview

```text
functional       what the system does
                 "shorten a URL", "redirect", "count clicks"
non-functional   how it has to be while doing that
                 "redirect in under 100 ms, with 99.99%
                 availability, for 10 billion hits/month"
```

The distinction is elementary and the consequence is not: **functional requirements rarely decide
the architecture; non-functional ones almost always do.**

Shortening a URL for a thousand users and for a billion are the same functional requirement and
completely different systems. That is why candidates who list only features produce generic
architectures — they did not collect the information that differentiates.

## Problem

The typical pattern of the first minutes:

```text
candidate   "so we need: create a link, redirect,
            see statistics. Ok, let's get to the design."
```

Three functional requirements and no non-functional ones. The architecture that comes out of that
is the same for any scale, any latency requirement and any consistency need — which means it was
not decided, it was remembered.

The opposite error, rarer: listing non-functional requirements as adjectives.

```text
"it has to be scalable, secure, reliable and high-performance"
```

That is not a requirement. There is no system anyone wants to build insecure and slow, and none of
those words eliminates a design option.

## Core Concepts

### Functional ones define the scope; non-functional ones define the solution

```text
functional       goes in the "what I will build" list
non-functional   goes in the "what will decide how" list
```

A good visual habit: two columns on the board. The left one is short and the right one is where the
interview actually happens.

### Non-functional requirements need numbers

```text
bad    "it has to be fast"
good   "p99 of the redirect under 100 ms"

bad    "it has to scale"
good   "10 billion redirects/month, with a peak of 3× the average"

bad    "it has to be available"
good   "99.99% on the redirect; 99.9% on creation is enough"

bad    "it has to be consistent"
good   "a created link has to work immediately for whoever created
       it; for everyone else, a few seconds of delay are acceptable"
```

The right-hand column eliminates options. The left one eliminates none, and that is why it is
useless.

That is the operational test for any non-functional requirement stated in an interview: **which
architectural option does it rule out?** "It has to be fast" rules out none. "p99 under 100 ms for
global reads" rules out querying the primary database in another region, rules out long synchronous
chains and practically mandates a distributed cache — three decisions made by a single number.

When the interviewer does not provide the number, proposing one is better than omitting it. They
correct it if it is wrong, and the analysis that follows is anchored in something concrete instead
of floating.

### The six categories that cover almost everything

A mental checklist so as not to forget any:

```text
scale           read volume, write volume, storage,
                expected growth, peak pattern
latency         per operation, in percentiles, not in averages
availability    per operation; not all of them deserve the same target
consistency     what has to be strong, what tolerates delay and how much
durability      what cannot be lost, and what loss is acceptable
cost            is there a budget? is there an efficiency constraint?
```

Going through the six takes less than a minute and avoids the most common gap: forgetting to ask
about consistency, which is precisely the one that most changes the architecture.

The omission of consistency has an identifiable cause: it is the only one of the six with no
obvious number attached. Scale has volume, latency has milliseconds, availability has nines, cost
has dollars — consistency has a qualitative question, "what can be stale and for how long".

The way to make it concrete is the same: require a window in a unit of time. "Eventually
consistent" is not a requirement; "up to 30 seconds of delay, acceptable" is. See
[strong vs. eventual consistency](/20-trade-offs/strong-vs-eventual-consistency.md).

### Differentiate per operation, not per system

This is the habit that impresses most and is least common:

```text
bad    "the system needs 99.99% availability"
good   "the redirect needs 99.99%; link creation tolerates
       99.9%; the statistics dashboard tolerates 99%"
```

Applying the most demanding requirement to the whole system produces an expensive architecture.
Separating per operation demonstrates that you understand availability has a price, and it enables
designed degradation later.

The same holds for consistency, latency and durability. See
[cost vs. reliability](/20-trade-offs/cost-vs-reliability.md) and
[consistency vs. availability](/20-trade-offs/consistency-vs-availability.md).

### Explicit priority

When the non-functional requirements conflict — and they do — declaring the priority anticipates
half the trade-off discussion:

```text
"between availability and consistency on the redirect, I choose
availability: serving a slightly stale link is better than not
serving one"
```

That is what the evaluator is looking for when they ask "and what if...". You have already answered
before they asked.

Declaring a priority has a second, less obvious effect: it protects the coherence of the design. A
candidate who declared "availability above consistency" and then proposes a synchronous write
coordinated across regions is contradicting themselves — and will be challenged. The declared
priority works as a constraint that keeps the subsequent decisions aligned with each other.

Incoherent architectures are one of the easiest signals to detect in an interview: they optimize for
conflicting properties in different parts of the same system, with nothing explaining why.

### The implicit ones worth mentioning

```text
security      access control, sensitive data
operations    someone will operate, monitor and debug this
cost          a solution 10× more expensive needs a justification
evolution     what will probably change within a year
```

One sentence for each, without dwelling. Mentioning them shows that you design systems that go to
production, not exercises.

The operations one is the most valued and the least cited: saying "I'll include observability
because someone will need to debug this at three in the morning" communicates real experience in
one sentence. The cost one has a similar effect in senior positions, where the expectation is not
only that the solution works, but that it is defensible in front of whoever pays the bill.

## Mental Model

**Functional requirements define the scope; non-functional ones define the architecture.** And a
non-functional requirement with no number is an adjective.

## When to Use

- Right after clarification, before any drawing.
- Noted visibly, in two columns.
- With priority declared when there is a conflict.

## When Not to Use

**Without numbers.**

**Applying a single requirement to the whole system.**

**Listing only functional ones.**

**As a long list** — five functional and six non-functional are enough; more than that consumes the
design's time.

**Without revisiting** — when the interviewer changes the prompt, the requirements change.

## Alternatives

- **A one-sentence summary** — "read-heavy, tolerant of delay, availability above consistency" —
  when time is tight.
- **Explicit prioritization** — three ordered requirements instead of ten in a list.
- **Leave it to the interviewer** — asking "which of these is most important to you?" is legitimate
  and productive.

## Trade-offs

| Many requirements | Few |
|---|---|
| Full coverage | Focus on what decides |
| Consumes time | Risk of a gap |
| Hard to prioritize | Clear priority |

| Per operation | Per system |
|---|---|
| Proportional architecture | Simpler to state |
| Demonstrates maturity | More expensive in practice |
| Enables degradation | Everything at the highest target |

## Failure Modes

**Functional only.** Generic architecture.

**Non-functional as adjectives.** Nothing is eliminated.

**A single requirement for everything.** An expensive, undifferentiated solution.

**No priority.** The trade-off conversation has no basis.

**Forgetting consistency.** It is the category that decides most and is omitted most.

## Common Mistakes

**Listing ten features** and no numbers.

**Saying "scalable" without saying to what.**

**Not separating availability per operation.**

**Not declaring what tolerates delay.**

**Ignoring cost** — in interviews for senior positions, it is a differentiator.

## Interview Example

**Problem.** "Design a news feed service."

**Functional** — short, because they do not decide:

```text
publish a post
follow and unfollow people
see the feed with posts from the people you follow
react and comment
```

**Non-functional** — where the interview happens:

```text
scale            300 M daily active users
                 500 M posts/day
                 read/write ratio ~100:1
                 peak 3× the average

latency          feed p95 < 500 ms
                 publication p95 < 1 s

availability     feed read 99.99%
                 publication 99.9%

consistency      a post can take up to 30 s to appear
                 in the feed of followers
                 the author has to see it immediately

durability       a published post cannot be lost
                 reaction counts can be approximate above
                 10 thousand

cost             reads dominate; the architecture should optimize
                 cost per read
```

**Declared priority:**

```text
"between read latency and feed freshness, I choose latency:
30 seconds of delay is imperceptible, 2 seconds of waiting is not."
```

**What each non-functional requirement decides:**

```text
100:1 ratio              → move work to the write
30 s window              → asynchronous fan-out is viable
author sees it instantly → read-your-own-writes
approximate reactions    → counters with no contention
cost per read            → materialized feed, not assembly on read
```

Five architectural decisions, all derived from non-functional requirements. None came from the
functional ones.

See the [social network case study](/21-case-studies/social-network.md) for the long version of
that analysis.

**Likely follow-up question:** "and what if the requirement were 2 seconds instead of 30?"

The correct answer recognizes that this rules out asynchronous fan-out for large audiences, and
forces either assembly on read or a hybrid strategy — which is exactly the conversation the
evaluator wants to have.

## Related Concepts

- [Requirement Clarification](/22-system-design-interviews/requirement-clarification.md).
- [Capacity Estimation](/22-system-design-interviews/capacity-estimation.md) — the numbers.
- [Communicating Trade-offs](/22-system-design-interviews/communicating-tradeoffs.md) — the declared
  priority.
- [Quality Attributes](/01-fundamentals/quality-attributes.md).

## Practical Exercise

Take a system you know and write its non-functional requirements **per operation**, with numbers.

Then mark which architectural decisions each one produces. The ones that produce none are probably
adjectives in disguise.

## Interview Questions

- Why do functional requirements rarely decide the architecture?
- Why is applying a single availability target to the whole system a mistake?
- Which category of non-functional requirement is most forgotten, and why does it matter so much?

## Further Reading

- Ford, Neal et al. *Fundamentals of Software Architecture*. O'Reilly, 2020.
- Bass, Len et al. *Software Architecture in Practice*. 4th ed. Addison-Wesley, 2021.
- Xu, Alex. *System Design Interview*. Byte Code, 2020.

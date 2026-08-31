---
id: interview-structure
title: Interview Structure
sidebar_position: 12
description: Having structure is half the evaluation — it shows you have done this before.
doc_type: concept
level: 0
difficulty: intermediate
status: complete
objective: >
  By the end, the reader runs the interview with declared phases and a time budget, and knows
  how to recover course when it is lost.
prerequisites: [requirement-clarification]
related: [requirement-clarification, communicating-tradeoffs, interview-common-mistakes]
canonical_for: []
translated_from_version: 1
last_reviewed: 2026-08-31
---

# Interview Structure

## Overview

Having structure is the most visible competency in a system design interview, and it is perceived
in the first two minutes.

```text
without structure   the candidate reacts to what the interviewer asks
with structure      the candidate leads, and the interviewer interrupts
                    where they want to go deeper
```

The difference is not one of knowledge. It is that structure signals experience: someone who has
run architecture discussions has a script, because they discovered in practice that without one
the conversation gets lost.

And there is a practical effect: with declared phases, you know how much time is left and what is
still missing — which avoids the most common ending of bad interviews, which is running out of
time with the design half-finished.

## Problem

Two patterns.

**Reacting.** The candidate answers what is asked and does not advance on their own. The interview
becomes an interrogation, and the evaluation lands on isolated answers instead of on the leading —
which is what the role requires.

**Losing control of time.** The candidate spends twenty minutes on clarification and estimation,
another fifteen detailing the data model, and reaches minute 40 without having drawn the
architecture.

```text
result       an interview with no conclusion
evaluation   "I don't know whether this person can close a design"
```

Time is part of the exercise. A real architectural discussion also has a deadline, and running it
within that deadline is the competency being measured.

## Core Concepts

### The phases and the budget

For a 45-minute interview, with about 40 of content:

```text
1. clarification and requirements   5 to 8 min
2. estimation                       4 to 6 min
3. API and data model               5 to 7 min
4. high-level architecture          8 to 10 min
5. deep dive                        10 to 12 min
6. closing                          2 to 3 min
```

For 60 minutes, each phase grows proportionally, with the deep dive absorbing most of the
increase.

The budget is not rigid — it is an instrument of perception. Knowing that phase 3 should end around
minute 20 lets you notice, at minute 25, that it is time to speed up.

The deep-dive phase deserves special care to protect, because it is the one that most
differentiates. The first four phases are executed similarly by prepared candidates; the deep dive
is where the difference appears between someone who understands the design and someone who merely
produced it. Reaching it with two minutes left wastes the part of the interview that yields the
most.

### Announce the structure at the start

```text
"I'll start by clarifying requirements, then do some estimates,
 sketch the API and the model, draw the high-level architecture
 and go deeper wherever you find it most interesting.
 Does that work?"
```

Thirty seconds. They do three things: signal experience; align expectations, letting the
interviewer redirect — "skip the API, I want to focus on scale"; and create a contract you can
invoke later — "I'm moving on to the architecture".

Redirecting is the most concrete of the three benefits. Interviewers usually have an area they want
to evaluate, and hearing the script is the first opportunity to say so. Without the announcement,
that correction only happens once time has already been spent in the wrong place.

### Announce the transitions

```text
"I think the requirements are clear. I'm moving on to
 estimates."

"I have the numbers I need. I'm going to sketch the architecture."
```

Marking transitions out loud keeps the interviewer oriented and demonstrates control. Without them,
a well-run interview can look diffuse.

### Manage time explicitly

```text
"I see we've used nearly half the time. I'll close the design
 and leave the bottleneck analysis for the deep dive."

"I can go deeper into the caching strategy or into failure handling.
 There's time for one of the two — which do you prefer?"
```

Talking about time out loud is not a sign of weakness; it is a sign that you are leading. And the
second sentence transfers the prioritization to whoever knows what they want to evaluate.

### Recover course when it is lost

Interviewers pull the conversation toward details, sometimes on purpose. Letting yourself be led
for ten minutes into a detail compromises the rest.

```text
"I can go deeper into that, and before I do I'd like to close
 the main flow so we have the full picture. I'll come back to
 this point right after — is that all right?"
```

That is a leading move, and it is well received. What is not well received is ignoring the question
or answering superficially in order to get back to the script.

The part that requires discipline is the second half: **actually returning to the deferred point**.
Promising to come back and not coming back is worse than having gone deep at the time, because it
signals that the promise was a device to escape the question. Noting the deferred point in a corner
of the board solves it — and the gesture of noting it already communicates the intent.

### Close

The last two minutes are frequently wasted. A closing is worth more than one more detail:

```text
"To summarize: the architecture has four components, optimized
 for reads, which is what dominates the volume.

 The points I would monitor first are the size of the hot set
 and the cache hit rate — that's where the first limit
 appears.

 What I left out: detailed click analytics, and multi-region
 replication, which would only be justified with an availability
 requirement above what we discussed.

 If I had more time, I would go deeper into handling partial
 cache failure."
```

Four elements: the summary, what to monitor, what was left out with the reason, and what you would
do with more time. That demonstrates awareness of your own work, which is rare.

The third element is the most valuable and the most counterintuitive: candidates avoid mentioning
what they did not cover, for fear of drawing attention to a gap. The effect is the opposite —
saying what was left out, with the reason, turns an omission into a decision. An evaluator who
notices the gap on their own records an oversight; one who hears it declared records prioritization.

### The structure serves the prompt, not the other way around

Some prompts call for adjustment:

```text
data-centered prompt        model before the API
low-scale prompt            short estimation, more time on design
prompt about a specific
  problem ("how do you
  guarantee ordering?")     skip straight to the deep dive
```

Following the script rigidly when it does not apply is the opposite of what the structure should
demonstrate. Announcing the deviation — "this prompt is more about consistency than about scale,
I'll spend less time on estimation" — shows that the structure is yours, and not memorized.

## Mental Model

**Announce the script, mark the transitions, and close.** Structure is what turns isolated answers
into leading.

## When to Use

- In every system design interview.
- Announced at the start, in thirty seconds.
- With transitions marked and time managed out loud.

## When Not to Use

**Rigidly**, when the prompt calls for another order.

**Without announcing it** — internal structure nobody sees is not evaluated.

**Ignoring the interviewer** when they redirect.

**Without a closing** — the final two minutes are worth more than one more detail.

**As an excuse** not to go deeper when asked.

## Alternatives

- **Ask about the preferred structure** — "would you rather I start with requirements or sketch an
  architecture right away?" — works well with interviewers who have their own agenda.
- **Reduced structure** — in 30-minute interviews, three phases: requirements, design, deep dive.
- **Follow the interviewer** — when they lead actively, resisting is counterproductive.

## Trade-offs

| Announced structure | Implicit structure |
|---|---|
| Signals experience | Less formal |
| Allows aligning early | Risk of looking diffuse |
| Costs 30 seconds | No cost |

| Follow the script | Adapt to the prompt |
|---|---|
| Predictable coverage | Focus on what matters |
| Risk of misused time | Requires judgment |

## Failure Modes

**Reacting instead of leading.**

**Blowing the time** and not closing the design.

**Getting lost in a detail** pulled by the interviewer.

**Rigid structure** applied to a prompt that calls for something else.

**No closing.**

## Common Mistakes

**Not announcing the structure.**

**Not marking transitions.**

**Not talking about time** when it gets tight.

**Going deep before closing the main flow.**

**Ending with no summary** and without saying what was left out.

## Interview Example

**Minute 0.**

```text
"Before we start: I'll clarify requirements, do estimates,
 sketch the API and the model, draw the architecture and go
 deeper wherever you prefer. If you want me to skip a part or
 focus on something specific, tell me."
```

**Minute 8 — transition.**

```text
"I think I have enough on requirements: shorten, redirect,
 analytics with tolerable delay, public scale, no personalization.
 Moving on to the estimates."
```

**Minute 22 — the interviewer pulls toward a detail.**

```text
interviewer  "how would you guarantee uniqueness of the code?"

candidate    "good question, and it's where I was heading. Can I
             answer quickly now and come back in depth after
             closing the flow?

             Short answer: a global counter in base 62, which
             guarantees uniqueness with no lookup. I'll detail
             the alternatives when we get to the deep dive."
```

**Minute 30 — time management.**

```text
"We have about 15 minutes. I can go deeper into code uniqueness,
 the caching strategy, or failure handling. Which is most useful
 for you?"
```

**Minute 42 — closing.**

```text
"To summarize: four components, optimized for reads, with the
 cache covering 95% of redirects and the database seeing
 600 reads per second.

 The first limit I would monitor is the size of the hot set:
 if it grows beyond memory, the hit rate drops and the database
 feels it. The trigger to partition the cache would be around
 100 GB.

 I left out: multi-region replication, which is only justified
 with a global latency requirement; and real-time click
 aggregation, which would multiply writes by a hundred.

 With more time, I would go deeper into the system's behavior
 when the cache gets slow — which is the most dangerous failure
 mode in this design."
```

The closing takes forty seconds and is the last thing the evaluator hears. It summarizes, shows
awareness of the limits, and names what was left out with a reason — which is a final demonstration
of judgment.

## Related Concepts

- [Requirement Clarification](/22-system-design-interviews/requirement-clarification.md) — the first
  phase.
- [Communicating Trade-offs](/22-system-design-interviews/communicating-tradeoffs.md).
- [Common Mistakes](/22-system-design-interviews/interview-common-mistakes.md).
- [High-Level Architecture](/22-system-design-interviews/high-level-architecture.md).

## Practical Exercise

Time a mock interview and note how much time you spent in each phase.

Compare it with the budget. The phase where you overran the most is the one that needs practice —
and most of the time it is clarification or the data model.

## Interview Questions

- Why is announcing the structure at the start worth the thirty seconds it costs?
- How do you recover course when the interviewer pulls toward a detail?
- What four elements does a good closing have?

## Further Reading

- Xu, Alex. *System Design Interview*. Byte Code, 2020.
- Ford, Neal et al. *Fundamentals of Software Architecture*. O'Reilly, 2020.
- Hohpe, Gregor. *The Software Architect Elevator*. O'Reilly, 2020.

---
id: interview-common-mistakes
title: Common Mistakes
sidebar_position: 13
description: The patterns that make interviews go wrong, with what to do instead.
doc_type: concept
level: 0
difficulty: intermediate
status: complete
objective: >
  By the end, the reader recognizes the recurring mistakes in system design interviews and knows
  the behavior that replaces each one.
prerequisites: [interview-structure]
related: [interview-structure, communicating-tradeoffs, requirement-clarification]
canonical_for: []
translated_from_version: 1
last_reviewed: 2026-08-31
---

# Common Mistakes

## Overview

System design interviews go wrong for a small set of reasons, and almost none of them is a lack of
technical knowledge.

```text
starting to draw before understanding the problem
reciting a memorized architecture
not declaring assumptions
proposing complexity with no justification
drawing in silence
not closing the design within the time
```

All of them are correctable with habit, and that is what is worth cataloging: a candidate who knows
them can observe themselves during the interview.

It is worth noting that the same list describes what goes wrong in real architectural discussions.
Drawing before understanding the problem, proposing complexity with no justification and not
declaring assumptions are failures of method that cost dearly in production, not only in an
interview — which explains why the format evaluates what it evaluates.

## Problem

The most frequent mistake is also the fastest to make: the candidate hears the prompt and starts
talking about a solution in under thirty seconds.

It happens for an understandable reason — silence is uncomfortable, and talking feels productive.
But what is communicated is that the problem was not considered.

And there is a second mistake that conventional preparation actively produces: memorizing reference
architectures. They work while the prompt matches, and collapse at the first variation — which the
interviewer will introduce precisely to test them.

## Core Concepts

### Drawing before understanding

```text
symptom     boxes on the board before any question
cause       discomfort with silence; anxiety to produce
effect      architecture for an invented problem
instead     ask for five minutes, and announce that
            you are going to ask
```

Saying "I'll ask a few questions before drawing" resolves the discomfort: you are producing, and it
is clear that it is deliberate. See
[requirement clarification](/22-system-design-interviews/requirement-clarification.md).

### Memorized architecture

```text
symptom     the same architecture for any prompt;
            components that tie to no requirement
cause       preparation by memorization
effect      collapses at the first follow-up question
instead     derive each component from a number or requirement,
            out loud
```

The test that exposes it: "why is that queue there?". Whoever derived it answers with a requirement
and a number; whoever memorized answers "to decouple", which means nothing specific.

There is a second, harder test: change the prompt. "And what if it were a hundred users instead of a
hundred million?" Whoever derived it simplifies the design on the spot, removing what the scale
justified. Whoever memorized keeps the same architecture, because it was never tied to any number —
and that answer is the most revealing an interview produces.

### Not declaring assumptions

```text
symptom     decisions that depend on unstated suppositions
cause       assuming the obvious is shared
effect      the interviewer does not know whether you considered or
            forgot; errors appear only late
instead     "I'll assume X" before every decision that depends on it
```

A wrong and declared assumption costs ten seconds to correct. The same wrong and silent assumption
sinks the design twenty minutes later.

And there is a secondary effect: declared assumptions become a record of what was considered. At the
end of the interview, they let you say "under the assumptions I made, this is the architecture; if
any of them is wrong, this is what changes" — which is a much stronger position than presenting a
design as if it were unconditional.

### Complexity with no justification

```text
symptom     microservices, a queue, a cache and a search index
            in the first drawing
cause       believing that complexity demonstrates competence
effect      the opposite — it suggests an absence of judgment
instead     start simple and add on demand,
            with a declared reason
```

This is the most badly calibrated error among mid-level candidates. The strong answer is frequently
the simplest one, with the condition under which it would stop being enough. See
[high-level architecture](/22-system-design-interviews/high-level-architecture.md).

The wrong calibration comes from a reasonable and false inference: that the interview is looking for
the most sophisticated architecture the candidate knows. It is looking for the one most appropriate
to the problem presented — and demonstrating that you know the sophisticated one, without applying
it, is done in one sentence: "if the scale were 50 times larger, I would split it like this".

### Drawing in silence

```text
symptom     minutes of drawing with no narration
cause       concentration; the habit of individual work
effect      the evaluator has nothing to evaluate
instead     narrate the reasoning, including the doubts
```

What is being evaluated is the thinking, and it only exists for the evaluator if it is verbalized.
See [communicating trade-offs](/22-system-design-interviews/communicating-tradeoffs.md).

### Not managing the time

```text
symptom     minute 40 with no architecture drawn
cause       absence of structure and of a budget per phase
effect      an interview with no conclusion
instead     announce the phases and mark the transitions
```

See [interview structure](/22-system-design-interviews/interview-structure.md).

### Ignoring or yielding too much to the interviewer

Two opposite errors with the same root — not having a grounded position.

```text
ignore    the interviewer suggests an alternative and the candidate
          continues the script without considering it
yield     any suggestion becomes an immediate design change
instead   acknowledge the merit, explain the basis of the choice, and
          ask for the information that would decide it
```

Interviewers frequently suggest worse alternatives on purpose. Accepting all of them is as revealing
as rejecting all of them.

### Optimizing what is not the bottleneck

```text
symptom     ten minutes optimizing a component that handles
            the load comfortably
cause       comfort with the familiar subject
effect      the real bottleneck is not discussed
instead     propagate the numbers through the design before optimizing
```

See [bottleneck identification](/22-system-design-interviews/bottleneck-identification.md).

### Promising what was not covered

```text
symptom     listing ten requirements and covering four, with no mention
cause       overly generous clarification
effect      the design looks incomplete
instead     note the requirements, and at the closing say
            explicitly what was left out and why
```

Saying "I didn't cover the analytics dashboard, which was at the lowest priority" turns an omission
into a choice. The sentence costs five seconds and changes the record the evaluator makes.

### Numbers with no consequence

```text
symptom     five minutes of estimation and no decision
            anchored in the numbers
cause       treating the estimate as a ritual
effect      the time is wasted
instead     state the consequence right after each number
```

See [capacity estimation in interviews](/22-system-design-interviews/capacity-estimation.md).

### Discussing technology instead of architecture

```text
symptom     five minutes comparing two specific databases
cause       comfort with the subject; the expectation that this
            is what is evaluated
effect      the conversation leaves the architecture level
instead     name by responsibility, and cite technology
            as a note
```

## Mental Model

**Almost no common mistake is technical.** They are about method: not asking, not declaring, not
narrating, not closing.

## When to Use

This catalog serves as a checklist:

- Before an interview, as a review.
- After an interview, to diagnose what went wrong.
- During practice, as an observation criterion.

## When Not to Use

**As a source of anxiety** during the interview — monitoring ten mistakes live hinders more than it
helps. Pick two to observe.

**As a rigid rule** — there are prompts where drawing early is correct, because the interviewer
asked.

**Without practicing** — recognizing a mistake by reading does not correct it; the habit is formed in
simulation.

## Alternatives

- **Recorded mock** — watching yourself exposes the silent design and poor time management better
  than any list.
- **Mock interview with a peer** — external feedback catches what self-assessment does not.
- **Writing ADRs** — the discipline of context, alternatives and consequences is the same, with no
  time pressure. See
  [alternatives in an ADR](/18-architecture-decisions/adr-alternatives.md).

## Trade-offs

| Monitor yourself | Focus on the problem |
|---|---|
| Corrects habits | Better reasoning |
| Divides attention | Repeats the mistakes |

The practical resolution: pick two behaviors per mock, and not ten.

## Failure Modes

**Premature design.** An invented problem.

**Recitation.** Collapses at the variation.

**Silent assumptions.** Errors appear late.

**Unjustified complexity.** Suggests a lack of judgment.

**Silence.** Nothing to evaluate.

**No closing.** An interview with no conclusion.

## Common Mistakes

The ones in this document, and a meta-mistake: **preparing by memorizing solutions instead of
training the method**.

The method transfers to new prompts; the memorized solution does not. And experienced interviewers
introduce variations precisely because they know that.

## Interview Example

**A passage with four mistakes, and the corrected version.**

Version with mistakes:

```text
interviewer   "design a notification system"

candidate     "ok. I'll use Kafka for the queue, with consumers
              in Go, Redis for deduplication, Cassandra for the
              history and a scheduling service. The
              consumers scale horizontally..."
```

Four mistakes in twenty seconds: drew before understanding, recited an architecture, named by
technology, and declared no assumptions.

Corrected version:

```text
candidate     "Before drawing, a few questions.

              What types of notification: in-app, email, SMS,
              or all of them? Are they triggered by an event or also
              scheduled? Is there a delivery guarantee, or does best
              effort suffice?

              And about scale: I propose 50 million notifications
              per day, with a 10× peak in campaigns. Does that make sense?

              Finally: is there an ordering requirement between notifications
              for the same user?"
```

Four questions, each one changing the architecture: the channels define the adapters; scheduling
defines a whole component; a delivery guarantee defines persistence and acknowledgment; ordering
defines partitioning.

**The design that follows, with justification:**

```text
"With what we agreed on — three channels, event-driven and
 scheduled triggering, at-least-once delivery, no ordering requirement —
 I design it like this:

 one queue, because delivery depends on external providers with
 availability outside our control and cannot block
 whoever triggers it;

 a deduplication store, because at-least-once delivery
 means duplicates, and the user cannot receive the same
 notification twice;

 one adapter per channel, because the three have different error
 semantics and rate limits;

 a separate scheduler, because it has a batch load profile
 and cannot compete with event-driven triggering."
```

Four components, four reasons, no product names. The technology enters as a note, if asked.

The difference between the two versions is not one of knowledge: the candidate in the first knew
everything the one in the second knows, and probably more. The difference is that the second version
makes the reasoning visible and anchored, and the first presents a result without showing where it
came from.

That distinction is what the interview format exists to measure — and it is why practicing the
method yields more than studying more architectures.

## Related Concepts

- [Interview Structure](/22-system-design-interviews/interview-structure.md).
- [Requirement Clarification](/22-system-design-interviews/requirement-clarification.md).
- [Communicating Trade-offs](/22-system-design-interviews/communicating-tradeoffs.md).
- [High-Level Architecture](/22-system-design-interviews/high-level-architecture.md).

## Practical Exercise

Record a twenty-minute mock and watch it.

Count: how many seconds until the first box; how many assumptions declared; how many minutes of
silence; and whether the flow was closed. Those four numbers diagnose most of the problems.

## Interview Questions

- Why is almost no common interview mistake technical?
- Why is memorizing reference architectures fragile preparation?
- Why is yielding to every interviewer suggestion as revealing as rejecting all of them?

## Further Reading

- Xu, Alex. *System Design Interview*. Byte Code, 2020.
- Ford, Neal et al. *Fundamentals of Software Architecture*. O'Reilly, 2020.
- Hohpe, Gregor. *The Software Architect Elevator*. O'Reilly, 2020.

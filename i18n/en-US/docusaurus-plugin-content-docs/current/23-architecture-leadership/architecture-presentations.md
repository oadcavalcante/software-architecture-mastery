---
id: architecture-presentations
title: Architecture Presentations
sidebar_position: 7
description: A presentation exists to produce a decision — and most of them ask for none.
doc_type: concept
level: 7
difficulty: advanced
status: complete
objective: >
  By the end, the reader structures presentations around an explicit ask and runs the discussion
  instead of presenting content.
prerequisites: [communication]
related: [communication, stakeholder-management, negotiating-tradeoffs]
canonical_for: []
translated_from_version: 1
last_reviewed: 2026-08-31
---

# Architecture Presentations

## Overview

An architecture presentation exists to produce something: a decision, an alignment, a commitment, a
course correction.

```text
the question that structures everything
  "what needs to happen by the end of this meeting?"
```

Most technical presentations don't answer that question. They present content — context, analysis,
architecture, plan — and end with nobody knowing what was asked for.

The result is predictable: the meeting ends, people vaguely agree, and nothing happens.

## Problem

The pattern:

```text
34 slides
context (8), problem (6), current architecture (5),
proposal (9), plan (4), next steps (2)
time: 45 minutes, with 40 of presenting
result: "very good, we'll evaluate it"
```

No ask was made. "We'll evaluate it" is what people say when they don't know what was asked for —
and what gets evaluated afterwards is what each person remembered, which is little.

And there is a second problem, specific to technical presentations: **density**. A slide with a
twenty-component diagram occupies everyone's attention for two minutes and communicates little,
because each person is trying to decipher a different part.

## Core Concepts

### Start with the ask

```text
"I am asking for approval to allocate 25% of engineering
 capacity for 12 months to an initiative. I will explain why,
 and what happens if we don't."
```

First slide, or first thirty seconds. That orients all the listening: people start evaluating what
they hear against the ask, instead of trying to guess where the presentation is going.

And it has an additional effect: if the ask is unacceptable for some structural reason, that shows
up in minute one rather than in minute forty.

See [communication](/23-architecture-leadership/communication.md).

### A four-part structure

```text
1. the ask                     what I need from you
2. the reason, with a number   why
3. what happens if we don't    the real alternative
4. the risk and the mitigation what can go wrong
```

Four slides, or four paragraphs. The technical detail goes into an appendix, and it is used if
asked about.

That structure works because it answers the questions in the order whoever decides asks them. The
engineering structure — context, analysis, conclusion — answers in the order whoever built the
analysis produced it, which is a different thing.

### Reserve half the time for discussion

```text
a 45-min presentation   20 of presenting, 25 of discussion
```

The discussion is where the decision happens. A presentation that takes 40 of the 45 minutes leaves
five for what matters — and the result is "we'll evaluate it", because there was no time to
evaluate.

And there is a practical consequence: if you can't present in twenty minutes, the material is too
dense or the scope is wrong.

### One diagram, one message

```text
bad    one diagram with the whole architecture
good   three diagrams, each showing one thing
```

A diagram in a presentation gets a few seconds of attention. If it requires a minute of study, it
doesn't communicate — it occupies.

What works: a diagram with the minimum needed for that moment's message, with the rest removed. See
[diagram quality](/17-architecture-documentation/diagram-quality.md).

### The likely objections go in the material

Anticipating the three most likely objections and addressing them before they are raised
demonstrates preparation and saves discussion time:

```text
"you will probably ask why we didn't use vendor X's
 solution. We evaluated it, and it doesn't meet the
 data residency requirement — it's in appendix B."
```

That also protects against the dynamic in which a known objection brings the proposal down by
appearing unconsidered.

### The individual conversations come first

Decision meetings rarely change positions — they confirm positions formed beforehand. That means
the persuasion work happens before, individually.

```text
"I spoke with security, operations and finance. Security has
 a reservation about X, which is addressed on slide 4."
```

Arriving at the meeting knowing each participant's position is what avoids the surprise that blocks
the decision. See
[stakeholder management](/23-architecture-leadership/stakeholder-management.md).

### A document before slides, for relevant decisions

```text
slides      tolerate gaps in reasoning
a document  exposes the weak argument before the meeting
```

A two- to four-page document, read beforehand, produces far better meetings: people arrive with
questions instead of with confusion, and the time is spent on what matters.

It is also what remains afterwards — slides, with no narration, communicate nothing.

### End with what was decided

```text
"we decided X. So-and-so is responsible for Y, by deadline Z.
 W was left open, and comes back next time."
```

Thirty seconds at the end, with the record sent afterwards. Without it, each participant's memory
diverges — and the divergence shows up weeks later, when it is expensive.

## Mental Model

**Start with the ask, reserve half the time for discussion, and end by recording what was
decided.** The detail goes into an appendix.

## When to Use

- When there is a decision to produce, an alignment to build or a commitment to obtain.
- With the ask stated in the first thirty seconds.
- After the individual conversations.

## When Not to Use

**With no explicit ask** — an informational presentation should be a document.

**With presenting taking all the time.**

**With dense diagrams.**

**Without having talked beforehand** to whoever can block it.

**Without recording** what was decided.

**When a document would do** — for many cases, it does it better.

## Alternatives

- **A document read beforehand**, with the meeting dedicated to discussion. It is superior for
  complex decisions.
- **Individual conversations only** — when there is no need for a collective decision.
- **A demonstration** — when there is something working, showing it is worth more than presenting.
- **Nothing** — not every decision needs a meeting; many are resolved asynchronously.

The first is the standard in organizations that have adopted it, and the change is usually
perceived as one of the most effective a technical group can make.

## Trade-offs

| Presentation | Document |
|---|---|
| Interactive, adjusts live | Forces clarity, persists |
| Tolerates gaps | Requires that they read it |
| Better for aligning | Better for deciding |

| Detail in the body | Detail in an appendix |
|---|---|
| Demonstrates depth | Keeps the focus |
| Consumes discussion time | Requires more preparation |

## Failure Modes

**No ask.** "We'll evaluate it."

**A long presentation.** No time to decide.

**A dense diagram.** Occupies attention without communicating.

**A known objection not addressed.** It brings the proposal down.

**No prior conversations.** A surprise that blocks.

**No final record.** Divergent memories.

## Common Mistakes

**Building it in engineering order.**

**Putting the technical detail in the body.**

**Not reserving discussion time.**

**Presenting to mixed audiences** with the same version.

**Not sending** the record of what was decided.

## Real-World Example

An insurance company's architecture group had a proposal approval rate of 31%. The presentations
were considered good — the material was praised — and the decisions didn't come.

A review of twelve presentations found the pattern:

```text
presentations with an explicit ask at the start    2 of 12
average presenting time                            38 min of 45
slides per presentation, median                    29
presentations preceded by individual
  conversations with every decider                 3 of 12
presentations that ended with a record
  of what was decided                              1 of 12
```

The changes were about format, not content:

**A three-page document** sent 48 hours in advance, with the four-part structure. The meeting came
to start with five minutes of silence for anyone who hadn't read it.

**The ask in the first paragraph**, always.

**Presenting for at most 15 minutes**, with the rest of the time in discussion.

**Mandatory individual conversations** with everyone who can block it, before the meeting.

**Three likely objections** addressed in the document, in a section of their own.

**A record of what was decided** sent the same day, with owners and deadlines.

Results after 14 months, across 19 proposals:

```text
approval rate                            from 31% to 79%
average time from proposal to decision   from 6.4 to 2.1 weeks
proposals rejected                       4, all for a structural
                                         reason identified
                                         in the prior conversation
proposals that came back to the table
  from a late objection                  0 (against 5 in the previous
                                         period)
```

The four rejected are the result the group considers most valuable: all were rejected **before** the
meeting, in the individual conversations, which saved weeks of preparation on proposals that
wouldn't advance.

The recorded lesson: the technical content of the proposals didn't change. What changed was that it
stopped taking up the meeting — and that the ask started being made.

And the five minutes of silence at the start, for reading, was the strangest change and the most
cited: it ensured everyone arrived at the same starting point, which the presentation never
achieved.

## Related Concepts

- [Communication](/23-architecture-leadership/communication.md).
- [Stakeholder Management](/23-architecture-leadership/stakeholder-management.md).
- [Negotiating Trade-offs](/23-architecture-leadership/negotiating-tradeoffs.md).
- [Diagram Quality](/17-architecture-documentation/diagram-quality.md).

## Practical Exercise

Take the last architecture presentation you gave and answer: what was the ask, and in what minute
was it made?

If there was no ask, or if it came after minute thirty, you have found the reason the decision
didn't come.

## Interview Questions

- Why does starting with the ask change how the whole presentation is heard?
- Why do decision meetings rarely change positions?
- Why does a document read beforehand produce better meetings?

## Further Reading

- Minto, Barbara. *The Pyramid Principle*. Pearson, 2009.
- Hohpe, Gregor. *The Software Architect Elevator*. O'Reilly, 2020.
- Duarte, Nancy. *Resonate*. Wiley, 2010.

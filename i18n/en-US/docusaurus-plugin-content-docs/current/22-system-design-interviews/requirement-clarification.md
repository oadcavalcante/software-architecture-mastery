---
id: requirement-clarification
title: Requirement Clarification
sidebar_position: 1
description: The prompt is vague on purpose — and the first thing evaluated is whether you notice it.
doc_type: concept
level: 0
difficulty: intermediate
status: complete
objective: >
  By the end, the reader runs the first minutes of the interview with questions that constrain
  the problem, instead of starting to draw.
prerequisites: [system-design]
related: [functional-vs-nonfunctional, interview-structure, interview-common-mistakes]
canonical_for: []
translated_from_version: 1
last_reviewed: 2026-08-31
---

# Requirement Clarification

## Overview

"Design Twitter." "Design a URL shortener." "Design Uber."

Those prompts are deliberately vague. None of them is answerable as stated, and the first
competency evaluated is whether the candidate notices that — or starts drawing boxes.

```text
the prompt is not the problem
the prompt is the invitation to discover the problem
```

The first five to ten minutes of a system design interview are clarification. They determine the
rest: an excellent architecture for a problem nobody asked for is a wrong answer.

## Problem

The pattern that makes interviews go wrong in the first two minutes:

```text
interviewer   "design a URL shortening system"
candidate     "ok, I'll use a hash of the original URL, store it in
              a key-value database, with a cache in front..."
```

The candidate has already decided scale, data model, technology and topology — about a problem
they do not know. They do not know whether it is a thousand or a billion URLs, whether links
expire, whether there is customization, whether there is click analytics, whether it is public or
internal.

Each of those answers changes the architecture. And the evaluator, who knows that, has already
formed an opinion.

The opposite error also exists and is less common: spending twenty minutes asking, including
irrelevant things, and having no time left to draw. Clarification is a phase with a budget, not a
demonstration of rigor.

## Core Concepts

### Questions that constrain, not questions that fill

```text
good   "do links expire? is there a validity period?"
       → changes the data model and the cleanup policy
good   "do we need click analytics per link?"
       → changes the write volume by orders of magnitude
bad    "which database do you use?"
       → the interviewer wants you to decide
bad    "how many users?" with no context
       → a generic question; better to propose and confirm
```

The criterion: **does the answer change any architectural decision?** If it does not, the question
consumes time and demonstrates nothing.

### Start with scope, then with scale

The order matters and is frequently inverted:

```text
1. who uses it and for what      defines the product
2. which operations exist        defines the functional requirements
3. what is out of scope          defines the boundary
4. what the scale is             defines the architecture
5. which qualities matter        defines the trade-offs
```

Asking about scale before scope produces numbers about a system that has not been delimited yet.
And asking "what is out of scope" is the most underestimated question in the list: it keeps you
from designing authentication, billing and an admin dashboard into a problem about shortening
URLs.

### Propose and confirm, instead of asking open-ended

```text
open-ended   "how many users will we have?"
proposal     "I'll assume 100 million monthly active users,
             generating 10 million links per day. Does that make
             sense, or do you have a number in mind?"
```

The second form is better for three reasons. It demonstrates that you have a scale reference; it
keeps the pace, because the interviewer only has to confirm; and it makes explicit that the number
is an assumption, which protects the analysis that follows.

Interviewers frequently answer "whatever you find reasonable" — and in that case the proposal has
already resolved the impasse.

### Every assumption said out loud is an anchor

```text
"I'll assume reads are much larger than writes, on the order of 100 to 1"
"I'll assume click analytics can lag by minutes"
"I'll assume we don't need custom links in this version"
```

Declared assumptions do two things. They let the interviewer correct course early — "actually,
customization is important" — instead of late, when the architecture has already been drawn on top
of them. And they record that the decision was conscious, not an omission.

An undeclared and wrong assumption sinks the answer. The same assumption declared and wrong is
corrected in ten seconds.

### Implicit requirements exist and are worth points

Some requirements are never stated and are expected:

```text
the system needs to be available
the data cannot be lost
there must be no unauthorized access
cost matters
someone is going to operate this
```

Mentioning them briefly — "I'll assume availability matters more than strong consistency here,
because a temporarily unavailable link is worse than a slightly stale click counter" —
demonstrates maturity without consuming time.

### Note it down and come back

Write the requirements in a corner of the board, functional on one side and non-functional on the
other. See
[functional versus non-functional](/22-system-design-interviews/functional-vs-nonfunctional.md).

That serves three purposes: it keeps you honest about what you promised to solve; it lets the
interviewer see you did not forget anything; and it gives you something to come back to when time
gets tight — "I won't cover the analytics dashboard, which was on the lower-priority list".

### The time budget

```text
45-min interview      clarification: 5 to 8 min
60-min interview      clarification: 8 to 10 min
```

Going beyond that is a sign that the questions are not constraining. Falling below it is a sign
that you accepted the prompt as stated.

## Mental Model

**The prompt is the invitation, not the problem.** Ask what changes a decision, propose instead of
asking open-ended, and declare every assumption.

## When to Use

- At the start of every system design interview.
- Whenever the interviewer introduces a variation midway.
- When you notice that a decision depends on something unstated.

## When Not to Use

**Asking what the interviewer wants you to decide** — technology choice, topology, database. Asking
that transfers the decision and wastes the opportunity to show judgment.

**Asking with no time budget.**

**Asking for rigor's sake**, with questions whose answer changes nothing.

**Accepting the prompt as stated** and starting to draw.

**Without noting it down** — requirements that are not on the board disappear.

## Alternatives

- **Propose and confirm** — instead of asking open-ended; faster and more demonstrative.
- **Declare an assumption and move on** — when the interviewer does not answer or says "you decide".
- **Ask in a block** — three to four questions together, instead of one at a time, keeps the pace.

## Trade-offs

| Ask more | Ask less |
|---|---|
| Well-delimited problem | More time to draw |
| Risk of consuming the time | Risk of solving the wrong problem |
| Demonstrates method | Demonstrates decisiveness |

| Ask open-ended | Propose and confirm |
|---|---|
| Presumes nothing | Shows a scale reference |
| Slower | Keeps the pace |
| May get "you decide" | Already handles that case |

## Failure Modes

**Drawing before asking.** The most common error and the most visible.

**Asking without constraining.** Consumes time and demonstrates nothing.

**Not declaring assumptions.** Errors stay invisible until late.

**Ignoring implicit requirements.**

**Blowing the clarification budget.**

**Not noting things down** — and promising things that will not be covered.

## Common Mistakes

**Asking about scale before scope.**

**Asking which technology to use.**

**Asking one question at a time**, with long pauses.

**Not asking what is out of scope.**

**Treating clarification as a formality** and going back to the memorized script afterwards.

## Interview Example

**Problem.** "Design a URL shortening system."

**Questions to ask**, in order, grouped:

```text
scope
  who uses it: the public internet, or internal to a company?
  besides shortening and redirecting, what else?
  are custom links needed?
  what is out of scope: authentication, billing, dashboard?

scale
  I propose 100 M links created per month and reads 100× higher.
  does that make sense?

qualities
  can the redirect fail? what availability?
  does a just-created link need to work immediately in
  any region?
  do links expire?
  do we need click analytics? with what delay?
```

**Assumptions declared**, in case the interviewer delegates:

```text
100 M creations/month, 10 billion redirects/month
reads 100× writes
links do not expire by default, with optional expiry
click analytics with up to 5 minutes of delay is acceptable
the redirect needs very high availability;
  creation can tolerate less
link customization out of scope in this version
```

**What each answer would change:**

```text
if links expired            → a cleanup policy, and the data model
                              gains a validity period
if analytics were
  real-time                 → the write volume goes from 100 M/month
                              to 10 bn/month; everything changes
if there were customization → uniqueness stops being guaranteed by
                              generation and becomes a lookup with contention
if it were internal         → scale drops by orders of magnitude, and the
                              architecture becomes trivial
```

The last item deserves attention: asking "public or internal" takes five seconds and can reduce
the problem by four orders of magnitude. It is the highest-return question in the list, and it is
the one most often forgotten.

There is a reason for forgetting it: the candidate assumes the prompt refers to the famous system —
"URL shortener" evokes large-scale public services. Assuming that is reasonable and it is an
assumption, and the difference between assuming silently and declaring out loud is the whole
difference. A candidate who says "I'll assume public scale, in the billions of redirects" and moves
on is doing exactly the right thing; one who simply draws for that scale without saying so is
hoping to be right.

**Likely follow-up question:** "and what if we wanted to support custom links?"

The correct answer starts by acknowledging what changes: uniqueness stops being a property of
generation and starts requiring a lookup, which introduces contention and an error path that did
not exist.

## Related Concepts

- [Functional vs. Non-Functional](/22-system-design-interviews/functional-vs-nonfunctional.md).
- [Interview Structure](/22-system-design-interviews/interview-structure.md) — the time budget.
- [Common Mistakes](/22-system-design-interviews/interview-common-mistakes.md).
- [Communicating Trade-offs](/22-system-design-interviews/communicating-tradeoffs.md).

## Practical Exercise

Take a vague prompt — "design a notification system" — and write ten questions.

Then cross out the ones that change no architectural decision. What remains is what you would ask
in an interview; the crossed-out ones are what consumes your time.

## Interview Questions

- Why is the prompt vague on purpose?
- Why is proposing and confirming better than asking open-ended?
- What questions should you not ask in a system design interview?

## Further Reading

- Xu, Alex. *System Design Interview*. Byte Code, 2020.
- Ford, Neal et al. *Fundamentals of Software Architecture*. O'Reilly, 2020.
- Kleppmann, Martin. *Designing Data-Intensive Applications*. O'Reilly, 2017.

---
id: adr-consequences
title: Consequences
sidebar_position: 7
description: What becomes true after the decision — including what gets worse.
doc_type: concept
level: 5
difficulty: intermediate
status: complete
objective: >
  By the end, the reader records verifiable consequences, with the accepted cost named and
  the signal that would indicate the decision was wrong.
prerequisites: [adr-structure]
related: [adr-decision, adr-alternatives, superseding-decisions]
canonical_for: []
translated_from_version: 1
last_reviewed: 2026-08-31
---

# Consequences

## Overview

The consequences section records **what becomes true** after the decision. Not what is
hoped for, not what is intended — what changes.

And the property that separates an honest ADR from a persuasion piece fits in one rule:
**every architectural decision has negative consequences, and an ADR that doesn't name them
hasn't thought about them.**

There is also content that almost never appears and is worth more than the rest: **the
signal that would indicate the decision was wrong.**

## Problem

The typical consequences section:

```text
"With this decision, the system gains scalability, decoupling and
better maintainability."
```

Three problems at once. Nothing is verifiable — no number, no timeframe. Nothing is negative
— as if the decision were free. And nothing distinguishes this decision from any other.

The practical effect shows up later: when the cost materializes — operating a queue, the
additional latency, the debugging complexity — nobody knows whether it was expected or
whether something went wrong. With no record, expected cost and failure become
indistinguishable.

## Core Concepts

### Four categories

```text
positive   what the decision enables
negative   the cost consciously accepted
neutral    what changes without improving or worsening
risks      what can go wrong, with probability and a signal
```

The neutral ones are underestimated: "the team has to learn X", "the pipeline gains a
step", "the local environment now requires one more container". None is bad; all are real
and change day-to-day work.

### Negatives are mandatory

An ADR with no negative consequence is in one of two situations: the decision is trivial and
didn't deserve an ADR, or the author is selling.

```text
adopt a queue          → higher latency, no ordering guarantee, one more piece
                         to operate, harder debugging
separate a service     → a network call where there was a local call,
                         distributed transaction, one more deployable
choose a new database  → team with no experience, migration, tooling to build
keep the monolith      → a scaling limit per component, coupled deployment
```

Note that the last line records the consequences of **not** changing. Decisions to keep
things also have a cost.

### Verifiable, not adjectival

```text
bad    "improves scalability"
good   "allows processing peaks of 400/s without degrading the synchronous
       response, which today saturates at 120/s"

bad    "increases complexity"
good   "adds one component to operate: a queue with monitoring,
       a backlog alarm and a dead-letter policy"
```

The criterion: can someone verify, a year from now, whether that happened?

### The signal that the decision was wrong

The most valuable and the rarest content:

```text
"If the queue backlog exceeds 5 minutes recurrently, the premise that
asynchronous processing absorbs the peaks will have been wrong."

"If the team spends more than 20% of its time operating the cluster, the
operational cost has exceeded what was expected."

"If in 12 months fewer than three services have adopted the pattern, the
reuse premise was not confirmed."
```

That turns the decision into something with a **test**. Without that signal, a wrong
decision stays indefinitely, because nobody defined what would count as contrary evidence.

And the signal is usually directly instrumentable. See
[observability](/13-observability/index.md).

### Consequences happen over time

They are not simultaneous, and distinguishing them prevents premature conclusions:

```text
immediate      what changes on deployment
short-term     weeks — learning, adjustments, the first incidents
long-term      months or years — accumulated operational cost, coupling
```

The frequent pattern: immediate benefits, long-term costs. It is the profile of almost every
decision that looks good and ages badly, and naming the horizon is what makes it possible
to assess it at the right moment.

### What becomes harder to change

A specific consequence that deserves its own record: what the decision **closes off**.

```text
"After this migration, going back to the previous model requires
reprocessing the history — estimated at 3 weeks."

"The published event format becomes consumed by external systems;
changing it will require versioning and a coexistence period."
```

That is the decision's reversibility recorded as a consequence, and it is what tells
whoever comes later the real cost of changing their mind. See
[context](/18-architecture-decisions/adr-context.md).

### Unforeseen consequences, afterwards

Some teams add, months later, a subsection with what actually happened.

That puts pressure on the ADR's immutability and, done carefully, is the most valuable
record in the set: comparing what was predicted with what was observed is what calibrates
the team's judgment.

The form that preserves immutability: a dated block, clearly marked as later, without
altering the original text.

### Consequences for people who aren't in the room

A set of consequences technical authors systematically omit: those falling on other people.

```text
product      a flow that was synchronous now has an intermediate state
support      a new ticket category — "my order is processing"
operations   one more component on call, with its own procedure
security     a new surface, with a review to do
finance      a recurring cost that didn't exist
```

Recording them has two effects. They become planned work instead of a surprise — the
"processing" screen and the support copy get an owner and a deadline. And they expose
decisions whose total cost is greater than assessed, because part of it was being pushed
outside the team making the decision.

## Mental Model

**What gets worse, and the signal that we were wrong.** A section with only benefits is
marketing.

## When to Use

- In every ADR.
- With at least one negative consequence named.
- With a warning signal when the decision has a quantifiable premise.

## When Not to Use

**With positives only.**

**With adjectives** instead of numbers.

**Generic** — "increases complexity" serves any decision.

**With no time horizon**, when cost and benefit occur at different moments.

**Without what becomes harder to change**, in decisions that are expensive to reverse.

## Alternatives

- **A pros and cons table** — more compact, loses the horizon nuance.
- **A risk list with probability and impact** — when risk dominates.
- **Tracking metrics** — instead of prose, declare what will be measured.

The last is the strongest where applicable: "we will track the queue backlog and monthly
operating time" is more actionable than any paragraph.

## Trade-offs

| Detailed consequences | Summarized |
|---|---|
| Verifiable later | Fast to write |
| Expose the cost | Less friction in approval |
| Allow assessing the decision | Only document |

| With a warning signal | Without |
|---|---|
| A testable decision | A decision permanent by omission |
| Requires an explicit premise | Less exposure |
| Instrumentable | Nothing to measure |

## Failure Modes

**Positives only.** A persuasion ADR.

**Adjectives.** Nothing verifiable.

**Expected cost confused with failure.** With no record, every cost looks like a mistake.

**No warning signal.** The decision is never assessed.

**No horizon.** An immediate benefit masking a long-term cost.

**Generic.** They would serve any decision.

## Common Mistakes

**Writing consequences as arguments** in favor of the decision.

**Omitting the operational cost** — the most frequently forgotten consequence.

**Not naming what becomes harder to change.**

**Not instrumenting the warning signal**, leaving it as text.

**Editing the consequences later** instead of adding a dated block.

## Real-World Example

A telecommunications company adopted, in 2022, a corporate event bus. The ADR recorded seven
consequences, all positive: decoupling, scalability, traceability, reuse, resilience,
independent evolution and observability.

In 2024, the bus was the organization's component with the most incidents, and a review
surveyed what had actually happened:

```text
predicted in the ADR                 observed
decoupling                           partial — schemas became coupling
scalability                          confirmed
traceability                         confirmed, after 8 months of extra work
reuse                                3 of 18 event types reused
resilience                           the bus became a single point of failure
independent evolution                blocked by shared schemas
observability                        worse than before for the first 12 months
```

None of the real negative consequences were recorded:

```text
a dedicated team of 3 people to operate it
debugging asynchronous flows requiring new tooling
event schemas became public contracts, hard to change
infrastructure cost 4× the initial estimate
```

The problem was not the decision — the bus solved real problems. It was that **nothing had
been recorded as accepted cost**, so every cost appeared as a failure, generating pressure
to reverse a decision that remained correct.

What changed in the ADR practice:

**Mandatory negative consequences**, at least one. An ADR with no cost named is sent back.

**A mandatory warning signal** for decisions with a quantifiable premise, instrumented as a
dashboard or an alarm where possible.

**A declared horizon** per consequence: immediate, short- or long-term.

**A dated review block**, added 12 months later, comparing predicted with observed —
without altering the original text.

That last point produced the most interesting effect. After two years of reviews, a pattern
became visible across the organization's ADRs:

```text
predicted benefits that were confirmed        68%
predicted costs that were confirmed           91%
unpredicted costs that appeared               1.8 per ADR on average
```

The team started using those numbers as calibration: predicted benefits are optimistic,
predicted costs are conservative, and there are always unpredicted costs.

In the retrospective: the 12-month review blocks were the most read artifact in the set —
more than the ADRs themselves. They teach something no individual ADR teaches.

## Related Concepts

- [Decision](/18-architecture-decisions/adr-decision.md) — what generates the consequences.
- [Alternatives](/18-architecture-decisions/adr-alternatives.md) — the consequences not
  chosen.
- [Superseding](/18-architecture-decisions/superseding-decisions.md) — when the warning
  signal fires.
- [Observability](/13-observability/index.md) — how to instrument the signal.

## Practical Exercise

Take an ADR from your team and write the sentence: "we will know this decision was wrong if
___".

Then check whether that signal is measured today. If it isn't, the decision cannot be
assessed.

## Interview Questions

- Why is an ADR with no negative consequences suspect?
- What happens when an expected cost is not recorded?
- How does a later review block preserve the ADR's immutability?

## Further Reading

- Nygard, Michael. *Documenting Architecture Decisions*. 2011.
- Ford, Neal et al. *Software Architecture: The Hard Parts*. O'Reilly, 2021.
- Kahneman, Daniel. *Thinking, Fast and Slow*. Farrar, Straus and Giroux, 2011.

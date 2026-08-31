---
id: adr-context
title: Decision Context
sidebar_position: 4
description: The forces in play at the time — the section that decides whether the ADR will be worth anything in two years.
doc_type: concept
level: 5
difficulty: intermediate
status: complete
objective: >
  By the end, the reader writes context that makes it possible to reassess the decision
  when conditions change.
prerequisites: [adr-structure]
related: [adr-structure, adr-alternatives, superseding-decisions]
canonical_for: []
translated_from_version: 1
last_reviewed: 2026-08-31
---

# Decision Context

## Overview

The context answers one question: **why did this decision have to be made, and under what
conditions?**

It is the section that determines whether the ADR will be useful in the future. A decision
recorded with no context can only be obeyed. A decision with context can be **reassessed** —
because it is possible to check whether the conditions that produced it still hold.

And it is the section authors write worst, with a characteristic failure: they describe the
system instead of describing the forces.

## Problem

The typical context of a real ADR:

```text
"We are building an orders system. We need to store data
reliably and scalably."
```

That would serve any decision, in any system, at any time. It informs nothing and, worse,
gives the impression that the section has been filled in.

What is missing:

```text
how many orders per second, today and over the foreseeable horizon
what consistency the business requires
how many people maintain the system, with what experience
what deadline existed
what contractual, regulatory or cost constraints weighed
what already existed and could not be thrown away
what was not known at the time
```

Two years later, without those numbers, nobody can say whether the decision still holds.

## Core Concepts

### Forces, not description

The distinction that fixes most bad ADRs:

```text
description   "the system processes orders"
force         "peaks of 400 orders/s on Black Friday, against 30/s on average"

description   "the team is small"
force         "4 people, none with operational experience in Kafka"

description   "we need high availability"
force         "a contract with penalties from 43 minutes of monthly downtime"
```

A force is something that **pushes the decision in a direction**. If the sentence doesn't
push, it is description, and it can go.

### Constraints in force, with their origin

Constraints are the most valuable content, because they are what changes over time:

```text
technical        what the current infrastructure supports
team             size, experience, turnover
schedule         the date and what makes it real
financial        budget, cost per unit
contractual      agreements with customers and vendors
regulatory       what the law requires
organizational   who decides what, what has already been standardized
```

And each one deserves its origin: "the deadline is March" is less useful than "the deadline
is March because the contract with customer X calls for going into production in the first
quarter".

The origin is what makes it possible to check later whether the constraint still exists.

### Numbers, whenever there are any

```text
bad    "high volume"
good   "1.2 million events per day, with a peak of 400/s"

bad    "it has to be fast"
good   "p99 under 200 ms, measured at the client"

bad    "the team is small"
good   "4 engineers, 1 on call"
```

Numbers date the decision verifiably. Two years from now, "400/s" can be compared with
reality; "high volume" cannot.

See [quality attributes](/01-fundamentals/quality-attributes.md).

### What was not known

A rare and valuable record: the uncertainties at the time.

```text
"we didn't know what the data team's query pattern would be"
"the growth estimate came from a commercial projection, not from data"
"we had no experience with this provider"
```

That changes the future reading. A decision made under declared uncertainty is revisitable
without criticizing the author — the information simply did not exist. A decision presented
as certain and later wrong looks like an error of judgment.

And it helps identify the right moment to revisit: when the uncertainty is resolved.

### Reversibility matters and belongs in the context

Not every decision carries the same weight:

```text
reversible               can be undone in days, at low cost
costly                   weeks or months of work
irreversible in practice a public data format, a customer contract,
                         a service boundary with many consumers
```

Recording which category the decision falls into indicates how much rigor it deserved — and
tells whoever comes later how much it costs to change.

Reversible decisions deserve to be made fast and with little ceremony; irreversible ones
deserve the opposite. See
[architecture levels](/15-enterprise-architecture/architecture-levels.md).

### The context is dated by nature

This is why the ADR is immutable. The context describes a moment, and moments are not
updatable.

```text
"in March 2024, we were 12 people"    stays true forever
"we are 12 people"                     becomes false and corrupts the record
```

Writing in the past tense, with an explicit date, is the habit that preserves the value.
See [status](/18-architecture-decisions/adr-status.md).

### The context defines the review trigger

Well-written context produces, almost for free, the condition for revisiting:

```text
context   "4 engineers, none with operational experience in distributed systems"
trigger   when the team grows or gains that experience, reassess

context   "the partner has 4% measured downtime"
trigger   when the partner improves, reassess
```

Making that trigger explicit is what separates an ADR that merely records from one that
keeps the decision alive.

## Mental Model

**Record the forces and the numbers, in the past tense.** If the context would serve any
decision, it isn't context.

## When to Use

- In every ADR — it is the section that cannot be omitted.
- With more care the more irreversible the decision is.
- Especially when there are temporary constraints in play: they are the ones that change
  most.

## When Not to Use

**As a description of the system.** That is documentation, not context.

**With no numbers** when they exist.

**In the present tense.** "We are 12 people" ages into falsehood.

**Omitting uncomfortable constraints** — a deadline, internal politics, a team limitation.
Those are exactly the ones that explain decisions that look strange later.

**Too long.** Three to six paragraphs suffice; a two-page context is usually describing
rather than recording forces.

## Alternatives

- **Y-Statement** — compresses context and decision into one sentence, for smaller cases.
- **A reference to a requirements document** — works if the document is immutable and
  dated; doesn't work if it is a living document.
- **A list of forces** instead of prose — easier to write and to verify later.

The last is underrated: a list of seven numbered forces is more useful, and more honest,
than three paragraphs of prose.

## Trade-offs

| Detailed context | Short |
|---|---|
| Revisitable in the future | Fast to write |
| Verifiable numbers | Less mental maintenance |
| Longer | May be missing when it matters |

| Explicit constraints | Implicit |
|---|---|
| Lets you check validity | Less political exposure |
| Explains strange decisions | Looks more technical |

The second table hides a real tension: recording "we decided this way because of the
deadline" is honest and uncomfortable. Omitting it produces an ADR that looks better and
is worth less.

## Failure Modes

**Generic context.** It would serve any decision.

**No numbers.** Impossible to check whether it still holds.

**Written in the present tense.** It ages into falsehood.

**Political constraints omitted.** The decision becomes inexplicable later.

**A description of the system.** Takes up space, informs nothing.

**Uncertainties not recorded.** The decision looks firmer than it was.

## Common Mistakes

**Writing the context after the decision**, as justification.

**Omitting the deadline** as a force — one of the most common and the least recorded.

**Not stating the team's size and experience.**

**Not declaring reversibility.**

**Confusing context with requirements**: requirements are what the system needs to do;
context also includes what limited the options.

## Real-World Example

A media company decided, in 2021, to build its own content management system instead of
using an off-the-shelf solution. The ADR was written, and the context said:

```text
"We need flexibility to meet the editorial requirements
specific to our operation, which off-the-shelf solutions don't cover."
```

In 2024, with the system consuming 60% of a nine-person team's capacity, the decision was
questioned. And it was impossible to assess: the context didn't say **which** editorial
requirements, nor **which** solutions had been evaluated, nor under what constraint.

The investigation took three weeks and reconstructed, through interviews, the real 2021
context:

```text
two solutions evaluated, both discarded over a requirement for a
  four-stage approval flow with an editorial hold
license cost estimated at $36,000 a year
a team of 4 people at the time, with slack
an 8-month deadline, with no contractual date
one of the solutions had the feature on its roadmap for the following year
```

The last item was decisive and had never been recorded. The solution in question started
offering the approval flow in 2022. The constraint that motivated building ceased to exist
two years before anyone noticed.

And the four-stage requirement had been simplified by the editorial team itself in 2023 —
that is, it no longer existed on the business side either.

What was decided:

**Migration to the off-the-shelf solution**, completed in 14 months.

**A context rule** for new ADRs: every constraint needs an origin and a condition that would
invalidate it. The template sentence adopted was "this decision changes if ___".

**A review of ADRs for costly decisions** every 12 months — just checking whether the
recorded constraints still hold, without reopening the decision. A 15-minute exercise per
ADR.

**Vendor roadmaps recorded** in the context when they weigh on the decision.

In the first review round, 7 of the 34 ADRs for costly decisions had constraints that no
longer existed. Two were superseded. See
[superseding](/18-architecture-decisions/superseding-decisions.md).

The recorded lesson: the original context was neither dishonest nor lazy — it looked
complete. The phrase "specific editorial requirements" precisely described what everyone
knew in 2021. The problem is that "everyone knew" is exactly the information that
evaporates.

## Related Concepts

- [ADR Structure](/18-architecture-decisions/adr-structure.md).
- [Alternatives](/18-architecture-decisions/adr-alternatives.md) — the reversal condition.
- [Superseding](/18-architecture-decisions/superseding-decisions.md) — what you do when the
  context changes.
- [Quality Attributes](/01-fundamentals/quality-attributes.md) — the numbers.

## Practical Exercise

Take your team's oldest ADR and list the constraints its context mentions.

For each one, answer: does it still exist? The ones that no longer do are the argument for
reopening the decision.

## Interview Questions

- What is the difference between describing the system and recording the forces in play?
- Why should the context be written in the past tense?
- Why does recording what was not known improve the ADR's value?

## Further Reading

- Nygard, Michael. *Documenting Architecture Decisions*. 2011.
- Ford, Neal et al. *Software Architecture: The Hard Parts*. O'Reilly, 2021.
- Bezos, Jeff. *2015 letter to shareholders* — one-way and two-way door decisions.

---
id: architecture-vision
title: Architecture Vision
sidebar_position: 3
description: A destination that guides decisions without prescribing every step — and that has to be memorable.
doc_type: concept
level: 7
difficulty: advanced
status: complete
objective: >
  By the end, the reader states a short architectural vision that guides independent decisions,
  with a criterion for knowing whether it is working.
prerequisites: [architecture-leadership-basics]
related: [technical-strategy-leadership, technical-roadmaps, communication]
canonical_for: []
translated_from_version: 1
last_reviewed: 2026-08-31
---

# Architecture Vision

## Overview

An architecture vision describes **where the architecture needs to get to**, in a form that lets
independently made decisions converge there.

```text
it is not   a diagram of the complete future state
it is not   a plan with steps and dates
it is       a destination stated in a way someone can
            use to decide, alone, on a Tuesday
```

That last one is the test: a vision that cannot be used to decide a concrete question is not a
vision — it is a statement of intent.

And there is a second, harder test: **is it memorable?** A vision that has to be looked up in a
twenty-page document will guide nothing, because the decisions it should guide happen without
anyone looking anything up.

## Problem

The typical vision document:

```text
"Our architecture will be modern, scalable, resilient and
 event-driven, enabling agile delivery of value with
 high quality and security."
```

That eliminates no option. Faced with a real choice — one database or two, synchronous or
asynchronous, extract or keep — it helps not at all.

And the opposite error: the vision as a detailed diagram of the target state, with forty
components. It prescribes too much, ages fast, and turns local decisions into compliance with a
design made by someone not in the problem.

```text
too vague       doesn't guide
too detailed    doesn't survive, and doesn't delegate
```

## Core Concepts

### A useful vision eliminates options

```text
weak     "we will be event-driven"
strong   "every piece of data crossing a domain is published as an event;
         no team reads another's database"
```

The second sentence decides dozens of concrete questions without anticipating any of them. That is
what a vision does when it works.

The test: take three real decisions made in the last month and check whether the vision would have
guided each one. If not, it isn't operating.

That test is applicable at any moment and is almost never done. It has the advantage of being
retrospective: it doesn't require predicting what the vision will guide, only checking what it
would have guided — and retrospective verification is far more reliable than projection.

When the result is poor, there are two possible diagnoses: the vision is too vague, or it is
correct and not known. The two require different action, and distinguishing them is simple — just
ask whoever decided whether the vision would have changed anything.

### Short enough to be remembered

```text
target   three to five statements, each in one sentence
```

That sounds like little and it is the practical limit. Someone deciding something at four in the
afternoon is not going to open a document — they will decide with what they remember.

```text
"Every domain has an owner and its own database."
"Data between domains travels as events, never by direct reads."
"New services are born from the template, or justify why not."
"What the platform offers, teams don't build."
```

Four sentences. They guide most of an organization's boundary decisions, and they fit in your head.

### State the why alongside

A vision with no reason becomes an arbitrary rule, and arbitrary rules get worked around.

```text
"Data between domains travels as events, never by direct
 reads — because direct reads couple schemas and cost us
 seven incidents last year."
```

The number is what sustains the statement. See
[communication](/23-architecture-leadership/communication.md).

### Leave the path open

```text
vision     where we need to get to, and why
roadmap    in what order, and when
decision   how, in each case
```

Confusing the three is the most common structural error. A vision that prescribes the path removes
the autonomy that makes it scalable — and the vision's value is precisely in letting many people
decide well without coordinating.

See [technical roadmaps](/23-architecture-leadership/technical-roadmaps.md).

### Describe what it is not, too

```text
"We will not standardize the programming language."
"We will not have a corporate canonical data model."
"We will not require central approval for library choices."
```

Stating what the vision does **not** intend is as guiding as what it does intend, and it prevents
expansive interpretation — the reading that the vision justifies any standardization.

### The vision needs an owner and a review

```text
no owner      nobody updates it when the context changes
no review     it guides with premises from another era
```

A vision created in 2021 for an organization of six teams can be actively harmful in one of thirty.
An annual review, with the question "do the conditions that produced this still hold?", is enough.

See [principles](/23-architecture-leadership/leadership-principles.md).

### Communicated many times, in many places

A vision stated once in a presentation does not exist. It has to appear where the decisions happen:

```text
at the start of design reviews
as an explicit criterion in ADRs
in onboarding material for new people
cited when a decision follows it, and when it doesn't
```

The last is the most effective: saying "this decision goes against the vision, and here is why we
are making an exception" teaches the vision's content better than any presentation.

The reason is that it shows the vision being **used**, and not merely stated. Someone who watches a
decision being justified against the vision learns three things at once: that the vision exists,
that it has consequences, and that it is not dogma. The three together are what produces genuine
adoption.

The opposite — a vision never cited because no decision contradicts it — usually indicates it is too
vague to be contradicted.

## Mental Model

**Three to five sentences, with the why, that eliminate options.** If it doesn't fit in your head,
it won't guide any decision.

## When to Use

- When independent decisions need to converge.
- In organizations large enough that conversation doesn't resolve it.
- Before a roadmap, because it derives from the vision.

## When Not to Use

**As a statement of adjectives.** "Modern, scalable and secure" eliminates no option and guides no decision.

**As a detailed diagram of the future state.** Too much detail ages in months and turns the vision into a plan — which is a different thing, with a different review cycle.

**With no why.** A vision with no problem it solves does not survive the first hard question, and cannot be reassessed when the context changes.

**Without saying what it is not.** With no declared boundary, each team reads the vision as authorization for what they already wanted to do.

**With no owner and no review.** A vision with no owner is not updated, and an out-of-date vision guides in the wrong direction with the same authority.

**Stated once** and never repeated. It has to be said many times to become a shared criterion; stated in a single document, it stays unknown to whoever decides day to day.

## Alternatives

- **Principles** — more granular, guiding judgment in specific situations. See
  [principles](/23-architecture-leadership/leadership-principles.md).
- **A set of ADRs** — concrete precedents teach the organization's criteria better than
  abstractions.
- **A target architecture** — the diagram of the future state, useful as a complement and not as a
  vision. See [target architecture](/15-enterprise-architecture/target-architecture.md).
- **Nothing** — in small organizations, conversation resolves it, and a formal vision is ceremony.

## Trade-offs

| A short vision | A detailed one |
|---|---|
| Remembered and used | Covers more cases |
| Leaves gaps | Doesn't survive change |
| Delegates the decision | Prescribes |

| With what it is not | Only what it is |
|---|---|
| Prevents expansive interpretation | Shorter |
| Requires deciding the limits | Ambiguous at the edges |

## Failure Modes

**Adjectives.** They eliminate no option.

**Too detailed.** It ages and doesn't delegate.

**No why.** It becomes an arbitrary rule and gets worked around.

**Not memorable.** It doesn't guide the decisions that matter.

**No review.** It guides with obsolete premises.

**Communicated once.** It doesn't exist.

## Common Mistakes

**Confusing the vision with a roadmap** or with a target diagram.

**Writing it in corporate presentation language.**

**Not testing it** against real recent decisions.

**Not saying what is left out.**

**Not citing the vision** when a decision contradicts it.

## Real-World Example

A technology company with 26 teams had a 34-page architectural vision document, published in 2022.
A 2024 survey found:

```text
engineers who knew the document existed           61%
who had read it                                   18%
who could quote any of its content                 4%
architectural decisions citing it (ADRs)          2 of 187
```

Four percent retention. The document was well written and it wasn't operating.

The rework produced four sentences, derived from the ADR archive itself — the architecture group
read the 187 records and extracted the criteria that had actually been used:

```text
1. Every domain has an owning team and its own storage.
   Because cross-database access cost us 11 incidents and
   blocked 4 migrations over the last two years.

2. Data between domains travels through an explicit contract — an event
   or an API — never by direct reads.
   Same reason.

3. What the platform offers, teams don't rebuild.
   Because we had 6 authentication implementations and 4 of
   observability, with a maintenance cost of ~3 people.

4. New services are born from the template, or record why not.
   Because 71% of new-service incidents in 2023 came
   from missing configuration the template handles.

What this vision does NOT define:
   the programming language, chosen by the team
   the services' internal structure, chosen by the team
   library choices, chosen by the team
```

**Communication in three places:** cited at the start of every design review; included as a
mandatory section in ADRs — "which vision item does this decision relate to?"; and in onboarding
material for new people.

**An annual review**, with the criterion that each item still has to eliminate options in real
discussions.

Twelve months later:

```text
engineers who could quote at least 2 items            78%
ADRs citing the vision                                104 of 131
recorded exceptions to item 4                         9, all with a reason
cross-database accesses introduced                    0
duplicate implementations of a platform
  capability                                          0 new ones
```

And in the annual review, one item was removed: the fourth, about the template, had become consensus
and no longer eliminated any option under discussion. It was promoted to a standard verified
automatically — which is the correct evolution of a vision item that no longer generates decisions.

The subsequent assessment points out: deriving the vision from the ADR archive, rather than writing
it from scratch, was the soundest methodological decision. The four items were not aspiration —
they were a description of the criteria the organization already used, stated memorably.

## Related Concepts

- [Technical Strategy](/23-architecture-leadership/technical-strategy-leadership.md).
- [Technical Roadmaps](/23-architecture-leadership/technical-roadmaps.md).
- [Principles](/23-architecture-leadership/leadership-principles.md).
- [Target Architecture](/15-enterprise-architecture/target-architecture.md).

## Practical Exercise

Take your organization's last ten architectural decisions and try to derive from them three to five
statements that explain them.

Compare that with the declared vision, if there is one. The difference between the two is the
distance between what the organization says and what it does.

## Interview Questions

- Why does a vision have to be memorable to work?
- Why is saying what the vision does not define as guiding as what it does define?
- Why should a vision item that became consensus be removed?

## Further Reading

- Hohpe, Gregor. *The Software Architect Elevator*. O'Reilly, 2020.
- Rumelt, Richard. *Good Strategy Bad Strategy*. Crown Business, 2011.
- Ford, Neal et al. *Building Evolutionary Architectures*. 2nd ed. O'Reilly, 2022.

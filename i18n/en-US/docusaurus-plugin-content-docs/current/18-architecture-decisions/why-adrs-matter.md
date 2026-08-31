---
id: why-adrs-matter
title: Why ADRs Matter
sidebar_position: 2
description: What the organization loses without decision records, and what it gains beyond the record.
doc_type: foundation
level: 5
difficulty: beginner
status: complete
objective: >
  By the end, the reader can defend the practice with verifiable arguments, and recognizes
  the benefits that are not the obvious ones.
prerequisites: [what-is-an-adr]
related: [what-is-an-adr, adr-alternatives, superseding-decisions]
canonical_for: []
translated_from_version: 1
last_reviewed: 2026-08-31
---

# Why ADRs Matter

## Overview

The obvious argument for ADRs — "so we don't forget why we decided" — is true and it is
the least interesting one.

The effects that pay off most are three others, and none depends on anyone reading the ADR
later:

```text
writing changes the decision   forcing the justification exposes fragile reasoning
disagreement gets a place      disagreeing with a document differs from disagreeing with a person
the decision becomes contestable  with alternatives recorded, revisiting is cheap
```

The fourth effect — not rediscovering the reason years later — is real and it is a bonus.

## The Problem

Organizations lose context continuously, and the loss does not show up as an event:

```text
a person leaves      the context they held leaves with them
six months pass      whoever stayed remembers the what, not the why
the system grows     old decisions become constraints with no explanation
the team turns over  institutional memory resets with each complete rotation
```

The compound consequence is an organization that **cannot revisit its own decisions**. Each
one becomes permanent by default — not because it is right, but because nobody knows enough
to question it.

And there is the opposite, equally expensive: decisions revisited repeatedly because
nothing records that they have already been made. The same database choice discussion
happens three times in five years, with the same conclusions and the same cost.

## Core Concepts

### Context erosion

A decision's context degrades at a predictable rate:

```text
at the time     everyone involved knows
3 months        whoever took part remembers the essentials
1 year          they remember deciding, not why
2 years         most of the people involved have left or forgotten
5 years         the decision is folklore — "it has always been like this"
```

The last phase is the dangerous one. A decision that became folklore is obeyed without
question and propagated to new systems, long after the reason ceased to exist.

The ADR does not prevent memory from eroding. It makes the memory recoverable.

### Writing changes the decision

The most underestimated effect: a meaningful share of decisions change during the writing
of the ADR.

```text
while writing the context        you realize the constraint cited no longer holds
while listing alternatives       you realize the discarded one is better
while writing consequences       you realize the cost was never considered
while trying to justify          you realize the reason was habit
```

That means the ADR pays for itself **before anyone reads it**. It is the strongest argument
for writing early — during the decision, not after it.

See [alternatives](/18-architecture-decisions/adr-alternatives.md), which is the section
where that effect concentrates.

### Disagreement gets a place

With no record, disagreeing with an architectural decision is a social act: it means
challenging whoever made it, through an informal channel, with no common ground.

With a record, the disagreement has an address:

```text
"the context changed — the constraint in ADR-014 no longer holds"
"alternative B was discarded for a reason that doesn't apply today"
"the predicted consequence didn't materialize"
```

That depersonalizes the technical debate, and it is especially valuable for less senior
people: an argument against a document is acceptable from anyone; an argument against a
senior person's decision depends on political capital.

See [architecture leadership](/23-architecture-leadership/index.md).

### Decisions come to have a validity

A well-written ADR records the conditions under which the decision holds. That turns
permanent decisions into **conditional** ones:

```text
"we chose the monolith because we are 12 people and one domain"
→ when we are 40 people and three domains, reassess
```

Revisiting stops requiring courage and starts requiring only observation. See
[superseding](/18-architecture-decisions/superseding-decisions.md), where that mechanic is
the topic.

### Onboarding gets cheaper

Whoever joins receives diagrams of what exists and, with ADRs, the reasoning as well.

The practical difference is between "this is the system, accept it" and "this is the
system, and these were the choices" — the second produces someone able to contribute
judgment, not only execution.

And there is a calibration effect: reading ten well-written ADRs teaches the
organization's pattern of architectural reasoning faster than any training.

### What ADRs don't solve

Worth delimiting, because overpromising is the main cause of the practice being abandoned:

```text
they don't improve bad decisions   they record them better
they don't replace conversation    they record its outcome
they don't guarantee alignment     an ignored ADR stays ignored
they don't document the system     they are history, not state
they don't solve a lack of time    if nobody has 30 minutes, the problem is elsewhere
```

## Why This Matters

**Because the cost of their absence is invisible and continuous.** It appears in no budget
— it appears as slowness, rework and incidents whose cause is "nobody knew".

**Because non-revisitable decisions become debt.** A constraint with no known reason keeps
being respected indefinitely. Systems accumulate those constraints until a significant part
of the design is a response to conditions that no longer exist.

**Because the benefit doesn't depend on reading.** The effect of writing — exposing fragile
reasoning — happens even if the document is never opened.

**Because it improves the quality of the debate.** Arguments against documents are more
honest and more accessible than arguments against people.

**Because the return is asymmetric.** Most ADRs will not be read; the few that are will be
read at the moment someone is about to make an expensive mistake.

## Common Mistakes

**Selling them as documentation.** That creates an expectation of maintenance and leads to
disappointment.

**Promising they will be read.** Most will not, and that is fine — that is not the
argument.

**Imposing them by process.** A mandatory ADR with approval becomes theater; the practice
works when it is cheap and voluntary.

**Writing after implementation.** You lose the "writing changes the decision" effect, which
is the main one.

**Recording only successes.** A set of ADRs in which no decision went wrong is not
trustworthy.

**Leaving out alternatives.** Without them, the ADR is a declaration, and it doesn't
support challenge.

## Real-World Example

A logistics company with 90 engineers measured, out of curiosity, what not having decision
records cost. The method was to track, over a quarter, every architectural discussion that
had already happened before.

The survey found:

```text
repeated discussions identified            17
person-hours spent on them                ~310
decisions that reached the same conclusion 13
that reached a different conclusion         4
```

The four that changed conclusion were the most interesting finding: in three of them,
nobody knew the question had already been decided, and the new conclusion contradicted the
old one without anything having changed in the context. The systems ended up with divergent
approaches to the same problem.

One concrete case: the retry policy for calls between services was decided in 2022 (retry
with exponential backoff and a limit of three) and re-decided in 2024 (immediate retry, up
to five times). Both patterns coexisted. During a degradation incident, the
second-generation services amplified the load. See
[retries](/06-distributed-systems/retries.md).

The adoption of ADRs was deliberately light:

**No approval.** The author decides to write; there is no committee.

**No formal obligation.** The rule is a question in the design review: "does this deserve
an ADR?".

**In the system's repository**, reviewed like code.

**A single searchable index**, to answer "has this already been decided?" — which attacked
the measured problem directly.

Eighteen months later:

```text
ADRs written                                    127
discussions closed with "it's already in ADR-x"  22
decisions changed during the writing             19
ADRs superseded                                  11
```

The 22 closures by reference alone covered more than the total cost of writing.

And the 11 superseded ones were used as an internal argument to sustain the practice: they
showed decisions being revisited on the basis of documented context change, rather than by
opinion.

The recorded lesson: the absence of a committee was decisive. An earlier attempt, with
mandatory approval, had produced 6 ADRs in a year — all generic, all written after
implementation.

## Related Concepts

- [What an ADR Is](/18-architecture-decisions/what-is-an-adr.md).
- [Alternatives](/18-architecture-decisions/adr-alternatives.md) — where the writing effect
  concentrates.
- [Superseding](/18-architecture-decisions/superseding-decisions.md) — decisions with a
  validity.
- [Architecture as Decisions](/01-fundamentals/architecture-as-decisions.md).

## Practical Exercise

Identify an architectural discussion your team has had more than once.

Write the ADR that would have closed the second occurrence. The time it takes is the
measure of what the absence cost.

## Interview Questions

- Why does an ADR pay for itself before being read?
- How does recording change the nature of technical disagreement?
- What problems do ADRs explicitly not solve?

## Further Reading

- Nygard, Michael. *Documenting Architecture Decisions*. 2011.
- Ford, Neal et al. *Software Architecture: The Hard Parts*. O'Reilly, 2021.
- Keeling, Michael. *Design It!*. Pragmatic Bookshelf, 2017.

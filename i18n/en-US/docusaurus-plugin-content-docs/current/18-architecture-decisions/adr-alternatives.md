---
id: adr-alternatives
title: Alternatives Considered
sidebar_position: 6
description: Where the architectural reasoning becomes visible — and the condition under which each discard is undone.
doc_type: concept
level: 5
difficulty: intermediate
status: complete
objective: >
  By the end, the reader records alternatives with criteria and a reversal condition,
  instead of listing them to justify the choice already made.
prerequisites: [adr-structure]
related: [adr-context, adr-decision, superseding-decisions]
canonical_for: []
translated_from_version: 1
last_reviewed: 2026-08-31
---

# Alternatives Considered

## Overview

The alternatives section is where the **reasoning** appears. The others record the result;
this one records the thinking.

It serves three functions, in increasing order of value:

```text
shows that an evaluation happened   the most obvious, the least useful
avoids re-deciding                  someone proposing option B finds the analysis
allows reversal with information    if the reason for discarding falls, the option returns
```

The third is what justifies the effort. An alternative recorded with the **condition under
which it would win again** turns the ADR from a historical record into a living instrument.

## Problem

The typical alternatives section:

```text
"We considered MySQL and MongoDB. PostgreSQL was chosen as being more
appropriate to our use case."
```

That informs nothing. It doesn't say what was compared, by what criterion, or what would
have made the result different.

Worse: written that way, it serves to **justify a choice already made** rather than to
record a comparison. It is recognizable by the pattern — every alternative has flaws, the
chosen one has none.

An honest alternatives section has an uncomfortable property: it makes clear what was lost
by choosing.

## Core Concepts

### Each alternative needs three things

```text
what it was            enough description to recognize the option
why it was discarded   the specific criterion that eliminated it
what would bring it back  the condition that would invert the result
```

The third is the rare one. A complete example:

```text
Alternative: keep synchronous processing

Discarded because the payment partner has 4.1% measured downtime over
the last 12 months, and our contract requires 99.9%. Synchronous would
propagate their downtime to us.

Would win again if: the partner's availability rises above 99.95% in a
sustained way, or if we move to a partner at that level. In that case,
the queue's operational cost stops paying for itself.
```

That is revisitable. Someone in 2027 can measure the partner's availability and conclude on
their own whether the decision still holds.

### Explicit criteria, applied equally

```text
criterion                    option A   option B   option C
monthly operational cost     low        high       medium
team experience              high       none       medium
p99 latency                  180 ms     40 ms      90 ms
migration effort             0          3 months   1 month
dependency risk              medium     low        high
```

A table like that forces honesty: it becomes visible when the chosen option loses on some
criterion, and it becomes visible which criterion weighed most.

The corresponding mistake is choosing the criteria **after** knowing the answer, so that
the preferred option wins on all of them.

### The status quo is an alternative

The most frequently omitted option: **do nothing**.

```text
"Alternative: keep it as is.
Discarded because the maintenance cost grew 40% in 18 months and the
team spends ~30% of its time on fixes in this area."
```

Recording the status quo forces quantifying the problem. ADRs that don't consider it
frequently record changes that didn't need to happen.

See [technical debt](/01-fundamentals/technical-debt.md).

### Options discarded early count too

An alternative eliminated in five minutes deserves a line:

```text
"Build from scratch: discarded with no detailed analysis — the estimated
effort (6+ months) did not fit the contractual March deadline."
```

That is worth it for two reasons. It prevents someone proposing the same thing later. And
it makes explicit that the elimination was quick, which signals where a reassessment would
have more room.

### Alternatives discarded for non-technical reasons

The most uncomfortable and the most valuable:

```text
"Discarded because the security team does not approve providers outside
the corporate list."

"Discarded because the team has no experience and the deadline doesn't
allow for learning."

"Discarded because an earlier organizational decision standardized on X."
```

Omitting that kind of reason produces ADRs that look technically inconsistent years later —
someone reads it and doesn't understand why the better option was rejected.

And those are the reasons that change most over time, which makes them the most useful as a
review trigger.

### The writing effect

This is the section where decisions change during the writing. The mechanism is direct:
forcing the reason for discarding to be articulated exposes reasons that don't survive
articulation.

```text
"we discarded it because it's complex"   → complex compared to what? by what measure?
"we discarded it because it doesn't scale" → up to what volume? what is our volume?
"we discarded it because it's legacy"    → is that a criterion?
```

Writing the section **before** closing the decision is what captures that value. Written
afterwards, it only documents.

### Who argued for each option

A cheap detail with a high return: recording who backed each alternative.

```text
"Option B was argued for by two people on the data team, based on the
need for reprocessing — a requirement that was not in the initial
survey."
```

That preserves two pieces of information that evaporate fast. First, that the objection
existed, which matters if it turns out to be right. Second, **who has the context** — if the
decision is reopened in two years, those people are the first to consult, and the discussion
starts from a higher baseline.

And there is an effect on the discussion itself: alternatives with a named advocate tend to
be analyzed more carefully than alternatives listed out of a sense of rigor.

## Mental Model

**For each discard, the condition that undoes it.** Without that, the list justifies; with
it, it serves.

## When to Use

- In every ADR for a significant decision.
- Written before closing the decision, not after.
- With a criteria table when there are more than three comparable options.

## When Not to Use

**As retroactive justification.** It is the most common use and the least useful.

**Listing alternatives never considered** to look rigorous.

**Without the reversal condition.**

**Without the status quo** among the options.

**Omitting non-technical reasons.**

**With criteria chosen after the answer.**

## Alternatives

- **A decision table** — more compact than prose, better for comparing more than three
  options.
- **A separate comparison document** — when the evaluation was extensive; the ADR
  references it.
- **A recorded proof of concept** — when the comparison was empirical, the numbers replace
  the argument.
- **Y-Statement** — compresses alternatives into one clause, for smaller decisions.

## Trade-offs

| Detailed alternatives | Summarized |
|---|---|
| Revisitable | Fast to write |
| Prevent re-deciding | May not suffice |
| Expose what was lost | Look firmer |

| Criteria in a table | Prose |
|---|---|
| Honest comparison | More nuance |
| Hard to bias | Easy to bias |
| Rigid | Flexible |

## Failure Modes

**Retroactive justification.** Every option bad, the chosen one perfect.

**No reversal condition.** A historical record with no future use.

**Status quo absent.** A change with no quantified problem.

**Non-technical reasons omitted.** An inexplicable ADR later.

**Biased criteria.** Chosen to produce the desired answer.

**Invented alternatives.** Listed without having genuinely been considered.

## Common Mistakes

**Writing the section after deciding.**

**Not quantifying the discard** — "doesn't scale" with no number.

**Omitting the option that nearly won**, which is precisely the most informative one.

**Not recording who argued for each option.**

**Treating it as a formality** to be filled in before the review.

## Real-World Example

An e-commerce company decided in 2023 to build its own search service instead of using a
managed service. The ADR listed three alternatives, all discarded with one line each.

In 2025, with the in-house service consuming two full-time engineers, the decision was
reopened. The ADR didn't help: the recorded reasons were "cost" and "flexibility", with no
numbers.

Reconstructing the original reasoning, through interviews, revealed:

```text
estimated cost of the managed service   ~$2,800/month, for 2023 volume
cost of the in-house service, estimated ~$800/month of infrastructure
                                        + "some engineering time"
```

The "some engineering time" had never been quantified. Measured in 2025, it was two
full-time engineers — about $12,000 a month in personnel cost.

And the volume had tripled, which would have raised the managed service cost to about
$6,000 — still half the real cost of the in-house service.

The winning alternative, in 2023, had won on a criterion nobody applied in full.

What changed:

**Migration to the managed service**, completed in five months.

**A total-cost rule** in the alternatives: every cost comparison has to include estimated
personnel cost, with the assumption made explicit. A line of "0.5 engineer/month" is
enough and it frequently changes the conclusion.

**A mandatory reversal condition** per alternative. The template adopted: "this option
would win if ___".

**A criteria table** required when there are three or more options, with the criteria
defined and weighted **before** the evaluation.

In a review of the following 40 ADRs, written under the new rules:

```text
ADRs where including personnel cost changed the conclusion       7
ADRs where defining criteria in advance changed the conclusion   5
alternatives reopened because a reversal condition was met       3
```

The reading the team takes from this: the 7 cases where personnel cost changed the
conclusion are the most concrete argument they managed to produce for the practice. All of
them were build-versus-buy decisions, and in all of them the team's intuition pointed
toward building.

## Related Concepts

- [Context](/18-architecture-decisions/adr-context.md) — the forces that define the criteria.
- [Superseding](/18-architecture-decisions/superseding-decisions.md) — what happens when the
  reversal condition is met.
- [Trade-offs](/20-trade-offs/index.md) — the material this section is made of.
- [Technical Debt](/01-fundamentals/technical-debt.md) — the cost of the status quo.

## Practical Exercise

Take an ADR from your team and, for each discarded alternative, write the sentence "this
option would win if ___".

The ones you can't complete were discarded with no verifiable criterion — and they are the
ones that will be re-decided.

## Interview Questions

- Why is the reversal condition the most valuable part of a recorded alternative?
- How do you recognize an alternatives section written as retroactive justification?
- Why does the status quo need to be listed as an alternative?

## Further Reading

- Nygard, Michael. *Documenting Architecture Decisions*. 2011.
- *MADR — Markdown Any Decision Records* — adr.github.io/madr.
- Ford, Neal et al. *Software Architecture: The Hard Parts*. O'Reilly, 2021.

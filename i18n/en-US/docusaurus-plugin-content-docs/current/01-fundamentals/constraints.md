---
id: constraints
title: Constraints
sidebar_position: 10
description: What is not negotiable — and why mistaking a constraint for a preference is expensive in both directions.
doc_type: foundation
level: 1
difficulty: beginner
status: complete
objective: >
  By the end, the reader tells a real constraint from a preference presented as
  one, and knows how to test each before discarding options because of it.
prerequisites: [quality-attributes]
related: [business-context, solution-space]
canonical_for: [constraints]
translated_from_version: 1
last_reviewed: 2026-08-30
---

# Constraints

## Overview

Constraints are conditions the architecture has to respect and that are outside
the control of whoever is architecting. They are not optimized — they are obeyed.

The skill that matters here is not dealing with constraints. It is telling the
real ones from the ones that only look real.

## The Problem

Constraints arrive mixed in with preferences, and the two use the same language.
"We can't use a managed service", "it has to be in Java", "the data has to stay in
our datacentre" — each of those sentences may be a non-negotiable constraint or
somebody's preference that nobody has challenged.

The two corresponding mistakes are expensive and symmetric.

**Accepting a preference as a constraint** eliminates options that were available.
The solution space shrinks for no reason, and the chosen architecture is worse
than it could have been — without anyone knowing, because the alternative was
discarded before being evaluated.

**Treating a constraint as negotiable** burns credibility and time on lost battles,
and sometimes produces architectures that have to be redone when the constraint
asserts itself. A data-residency requirement discovered late can invalidate months
of work.

## Core Concepts

### The categories

**Regulatory and legal.** Where data may reside, how long it is retained, what has
to be auditable, who may access it. These are the most rigid and the ones that most
frequently eliminate entire regions of the solution space.

**Contractual.** SLAs with customers, commitments to partners, integration clauses.
Rigid until renegotiation, which exists but has a cost and a lead time.

**Organizational.** How many people, with what skills, in what team structure. An
architecture requiring a skill the company does not have is unviable even when
technically correct.

**Economic.** Budget, the nature of the spend, the payback horizon.

**Inherited technical.** Legacy systems that cannot be switched off, existing
integrations, data formats with history.

**Temporal.** A deadline with an external consequence — a market event, a
regulatory obligation, a public commitment.

### The test for a constraint

One question separates a constraint from a preference:

> **What happens, concretely, if we violate this?**

A real constraint has a specific, external answer: a fine, a breach of contract, a
lawsuit, a physical impossibility, a project cancelled for lack of funds.

A preference has a vague or internal answer: "it's not our standard", "we prefer it
this way", "we've always done it like that". None of those is false or irrelevant —
but all are negotiable, and have to be treated as such.

### Constraints have an expiry date

A constraint recorded three years ago may no longer hold. The regulation changed,
the contract was renegotiated, the team grew, the legacy system was switched off.

Architectures frequently carry ghost constraints: limits that shaped decisions and
no longer exist, but that nobody re-examined because they sit in the
"non-negotiable" bucket.

### Constraints can be good

A constraint shrinks the solution space, which sounds bad and frequently is not. A
smaller space is easier to traverse in full, and a strong constraint sometimes
eliminates exactly the options that would have been tempting and wrong.

"We can't maintain another database" is a constraint that avoids a great deal of
accidental complexity.

## Mental Model

**A constraint is what you work around. A requirement is what you meet. A
preference is what you negotiate.**

Explicitly classifying each input into one of those three categories is half an
hour of work that changes the outcome of the project.

## Why This Matters

**Because constraints eliminate options ahead of any analysis.** Traversing the
solution space without having mapped them produces careful evaluation of
alternatives that were never viable.

**Because the cost of finding out late is asymmetric.** A regulatory constraint
discovered in the third month costs the third month. Discovered on the eve of
launch, it costs the project.

**Because disguised preferences impoverish the architecture silently.** Nobody
notices the option that was not considered. The delivered system works, and the
extra cost stays invisible.

## Common Mistakes

**Not asking "what happens if we violate it?".** It is the lowest-cost,
highest-return question in the whole gathering, and it is almost never asked.

**Accepting an ownerless constraint.** Every real constraint has someone
accountable for it — legal, compliance, finance, the customer. A constraint whose
owner nobody can name deserves verification.

**Treating an organizational constraint as less real than a technical one.** "We
have nobody who knows how to operate this" is as constraining as an infrastructure
limit, and more often ignored because it is uncomfortable.

**Never re-examining.** Recorded constraints become permanent through inertia.
Reviewing them periodically is cheap and sometimes frees up valuable options.

**Confusing a constraint with a quality attribute.** "The system needs to handle 10
thousand requests per second" is a quality attribute — negotiable against cost.
"The data cannot leave the country" is a constraint — there is no negotiating with
volume.

## Real-World Example

A team designs a data platform and receives as a constraint: *"Everything has to
stay on-premises."*

Taken as stated, the constraint eliminates managed services for storage, processing
and analytics, and the resulting architecture requires three people dedicated to
operations — which the team does not have.

The test applied: *what happens if we violate it?*

The answer came in three layers. First: "it's company policy". Second, asking the
policy owner: "because customer data can't go outside". Third, asking legal: the
real requirement is that **personally identifiable** customer data reside in the
country, under an adequate processing agreement — and there are cloud providers
that meet that in full in a local region.

The real constraint was narrower than the stated one, and it was not
"on-premises".

The final architecture uses managed services in a national region for the main
volume, with a subset of sensitive data isolated under stricter control. The
operations team still has the people it had.

What matters here is not that the constraint was false — it was real, just
different. Accepting the second-hand formulation would have cost an entire
architecture.

## Related Concepts

- [Business Context](business-context.md) — where constraints come from.
- [Solution Space](solution-space.md) — what they shrink.
- [Quality Attributes](quality-attributes.md) — what is negotiable, by contrast.

## Practical Exercise

List everything your team treats as non-negotiable in the current system.

For each item, answer in writing: what happens concretely if we violate it? Who
owns this constraint? When was it established?

Items with no specific answer to the first question are preferences. Those with an
unknown owner deserve verification. The old ones deserve re-examination.

## Interview Questions

- How do you tell a real constraint from a preference?
- Have you ever found out a constraint was not real? What changed?
- How do you handle an organizational constraint that rules out the best technical
  solution?

## Further Exploration

- Ford, Neal; Richards, Mark. *Fundamentals of Software Architecture*. O'Reilly,
  2020 — constraints as an architectural driver.
- Ford, Neal; Parsons, Rebecca; Kua, Patrick. *Building Evolutionary
  Architectures*. O'Reilly, 2017 — constraints that change over time.

---
id: enterprise-principles
title: Enterprise Principles
sidebar_position: 10
description: Rules that guide distributed decisions — and why most of them guide nothing.
doc_type: concept
level: 6
difficulty: advanced
status: complete
objective: >
  By the end, the reader writes principles that decide concrete cases, instead of
  statements nobody disagrees with.
prerequisites: [enterprise-architecture]
related: [standards, enterprise-governance, architecture-levels]
canonical_for: []
content_version: 1
translated_from_version: 1
last_reviewed: 2026-08-31
---

# Enterprise Principles

## Overview

An enterprise principle is a rule that guides decisions made by different people, at
different times, without coordination.

It exists because reviewing every decision is not viable. See
[architecture levels](/15-enterprise-architecture/architecture-levels.md).

And most written principles guide nothing, for a simple reason: they are statements
nobody disagrees with.

## Problem

The typical set of principles:

```text
"we pursue simplicity"
"we prioritize the user experience"
"security is everyone's responsibility"
"we reuse before we build"
```

None of these helps decide anything. Faced with two alternatives, both can be defended as
simple, secure and good for the user.

The test that exposes this: **is there anyone in the organization who would argue the
opposite?** If not, the principle does not separate options — it merely declares a
virtue.

## Core Concepts

### A useful principle has a losing side

Principles that decide choose one value **over another**:

```text
useless   "we pursue simplicity"
useful    "we prefer operational simplicity over cost optimization"
          → someone could prefer the opposite, and the choice changes the decision
```

More examples with an explicit losing side:

```text
"we prefer buying over building, except in what differentiates us"
"we prefer consistency across teams over local optimization"
"we prefer reversibility over getting it right the first time"
"data belongs to a single system; the rest consume it"
```

Each of these discards something. That is what makes them decidable.

### Implications are what makes it actionable

The principle alone is a sentence. What operationalizes it are the implications:

```text
principle      "data belongs to a single system; the rest consume it"
implications   no system writes into another's database
               integration by API or event, not by direct database access
               every data set has a declared owner
               duplication requires a recorded justification
```

Without implications, each person interprets the principle differently, and it stops
producing the coherence that was the reason it existed.

### Few, and reviewed

```text
5 to 8 principles   memorable, used
20+                 nobody remembers, nobody applies them
```

A large set is a symptom that principles are being used for what
[standards](/15-enterprise-architecture/standards.md) solve better: principles guide judgment; standards prescribe
specific choices.

And they age: a principle that made sense when the organization had 30 engineers may be
wrong at 300. Periodic review is what keeps old constraints from outliving the context
that justified them.

### They need a declared exception path

A principle with no exception path produces two bad behaviors: silent circumvention, or
paralysis.

What works:

```text
an exception is possible
it requires a recorded justification
with a decision by someone with the reach to make it
and a review deadline
```

The exception log is valuable information: if a principle accumulates exceptions, the
principle is wrong — not the exceptions.

That is one of the most reliable ways to discover that a principle needs to change.

### The concrete-case test

Before publishing a principle, apply it to three real recent decisions.

```text
would it have pointed in a direction?   if not, it is vague
would the direction have been right?    if not, the principle is wrong
would anyone have disagreed?            if not, it is obvious
```

Principles written in a meeting, without that test, tend to be declarations of virtue —
because that is what sounds good in a meeting.

### A principle is not a standard or a technical rule

```text
principle  guides judgment — "we prefer X over Y"
standard   prescribes — "use library Z for logs"
rule       verifies — the pipeline fails if the tag is missing
```

See [standards](/15-enterprise-architecture/standards.md).

Mixing the three produces a long document in which nobody distinguishes guidance from
obligation — and, when in doubt, everything becomes obligation.

### Principles compete with each other, and that is useful

A well-built set contains tensions: two principles that, in certain cases, point in
different directions.

```text
"we prefer consistency across teams over local optimization"
"we prefer team autonomy over standardization"
```

That looks like a defect and it is a feature. The tension makes a real organizational
trade-off explicit, and forces the discussion to happen in the concrete case — which is
where it should happen.

What does not work is ordering the principles by fixed priority: a rigid hierarchy turns
the second principle into decoration, because the first always wins.

What works is recording, when the tension appears, which one won and why. See
[architecture decisions](/18-architecture-decisions/index.md).

After a few records, the pattern emerges — and it is more informative than any precedence
rule defined in advance.

### The principle has to be testable against tomorrow's decision

An operational test that separates a principle from a slogan: take a decision that has
not been made yet, and check whether the principle points in a direction.

```text
pending decision   "do we keep the customer record in each service,
                    or centralize it?"
principle 1        "data belongs to a single system"  → points at: centralize
principle 2        "we pursue simplicity"             → points at nothing
```

The second can be used to defend either side — keeping it is simple because it avoids
integration; centralizing is simple because it eliminates reconciliation.

That ambiguity is not a writing flaw. It is the sign that the principle chose nothing.

And there is a second, harder test: ask three people from different teams what the
principle implies in a concrete situation. If the answers diverge, the implications were
never written — and the principle is producing divergence instead of coherence.

## Mental Model

**A useful principle picks a side.** If nobody would disagree, it decides nothing.

## When to Use

- Where similar decisions are made by different teams.
- To guide without centralizing.
- When there is recurring tension between values — cost against speed, autonomy against
  standardization.
- To give architecture reviews a criterion.

## When Not to Use

**As a declaration of virtue.** If nobody would disagree, the principle does not separate
alternatives — it merely asserts something everyone agrees with.

**In large numbers.** Above eight or ten, nobody remembers them, and principles that are
not remembered guide nothing.

**Without implications.** The sentence alone admits divergent interpretations, and the
coherence it was supposed to produce never happens.

**Without an exception path.** It produces silent circumvention, or paralysis — and the
exception log is precisely the mechanism that reveals when the principle needs to change.

**In place of a standard** or an automated check. Principles guide judgment; where the
specific choice matters and can be verified, a principle is the wrong instrument.

**Without periodic review.** A principle that made sense at 30 engineers may be wrong at
300, and constraints that outlive the context that justified them produce friction with
no purpose.

## Alternatives

- **[Standards](/15-enterprise-architecture/standards.md)** — when the specific choice matters.
- **Paved road** — the standard built in, without depending on the team remembering. See
  [internal developer platforms](/14-devops-and-platform/internal-developer-platforms.md).
- **Automated verification** — for what can be checked.
- **Decision records** — the history of what was decided and why, which guides by
  precedent. See
  [architecture decisions](/18-architecture-decisions/index.md).

The last one is underrated: a repository of past decisions guides better than abstract
principles, because it brings the context along.

## Trade-offs

| Few principles | Many |
|---|---|
| Memorable | Forgotten |
| Cover fewer cases | Broad coverage |
| Applied | Ignored |

| Principle | Verified rule |
|---|---|
| Guides judgment | Admits no nuance |
| Depends on interpretation | Objective |
| Covers the unforeseen | Only the foreseen |

## Failure Modes

**A vague principle.** It does not separate alternatives.

**A large set.** Nobody remembers it.

**No implications.** Divergent interpretations.

**No exception.** Silent circumvention.

**Aged.** It constrains for a reason that no longer exists.

**Used to block.** Cited only when someone wants to say no.

## Common Mistakes

**Writing virtues.** "We prioritize quality" has no defensible opposite, so it eliminates no option and decides nothing.

**Not testing against real decisions.** The test of a principle is applying it to three past decisions. If it would have changed none of them, it guides nothing.

**Not declaring implications.** A principle without what it forces you to give up is aspiration. The implication is the part that hurts and the part that gives the principle effect.

**Confusing it with a standard.** A principle guides judgment in a new case; a standard prescribes the answer in a known case. Treating a principle as a rule breaks it on the first case that doesn't fit.

**Not recording exceptions.** An unrecorded exception becomes informal precedent, and the principle ends up applying only to those who didn't know an exception could be requested.

**Not reviewing.** Principles derive from context — team size, stage, constraints. When the context changes and they don't, they keep eliminating options that have become good again.

## Real-World Example

A logistics company had 23 architecture principles, published three years earlier.

A review tested each one against the twenty most recent architectural decisions:

```text
pointed in no direction at all       14 principles
pointed, and nobody would disagree    6
pointed and were decisive             3
```

The first 14 were declarations of virtue: "we pursue quality", "we value simplicity", "we
are data-driven".

And of the 23, only 4 had been cited in any discussion in three years — always to justify
a refusal, never to guide a choice.

The rework produced 6 principles, each with an explicit losing side and implications:

```text
1. We prefer buying over building, except in what differentiates us.
   → every proposal to build compares against market alternatives
   → capabilities classified as common receive no engineering investment

2. Data belongs to a single system; the rest consume it.
   → no system writes into another's database
   → every data set has a declared owner

3. We prefer consistency across teams over local optimization.
   → technologies off the paved road require justification and taking on the operation

4. We prefer reversibility over getting it right the first time.
   → two-way door decisions are made fast, by the team, and reviewed later

5. Integration is by explicit contract, never by access to another's database.

6. The team that builds operates what it builds.
   → no delivery is considered done without telemetry and alerts
```

Each with listed implications, an exception possible with a record, and annual review.

Over the following eighteen months, the exception log accumulated 11 cases — and nine of
them were about principle 3. The annual review rewrote that principle: the list of
supported technologies had become too narrow for the variety of problems the company had.

The reading the team takes from this: the exception log was the most valuable mechanism.
It turned "this principle gets in the way" — a complaint — into evidence that the
principle needed to change.

## Related Concepts

- [Standards](/15-enterprise-architecture/standards.md) — the specific prescription.
- [Enterprise Governance](/15-enterprise-architecture/enterprise-governance.md).
- [Architecture Levels](/15-enterprise-architecture/architecture-levels.md).
- [Architecture Decisions](/18-architecture-decisions/index.md).

## Practical Exercise

Take your organization's principles and test each one against three real recent
decisions.

The ones that would not have pointed in a direction, or that nobody would disagree with,
are not principles — they are declarations.

## Interview Questions

- What test distinguishes a useful principle from a declaration of virtue?
- Why are implications necessary?
- What does an accumulation of exceptions indicate?

## Further Reading

- Open Group. *TOGAF Standard* — architecture principles.
- Ross, Jeanne et al. *Enterprise Architecture as Strategy*. HBS Press, 2006.
- Hohpe, Gregor. *The Software Architect Elevator*. O'Reilly, 2020.

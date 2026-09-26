---
id: governance-principles
title: Principles in Operation
sidebar_position: 3
description: How a principle is actually used at the moment of decision — and the test that separates a principle from a slogan.
doc_type: concept
level: 6
difficulty: advanced
status: complete
objective: >
  By the end, the reader tests principles by their ability to eliminate options and knows
  how to resolve a conflict between two valid principles.
prerequisites: [governance-basics]
related: [governance-standards, governance-review, governance-basics]
canonical_for: []
translated_from_version: 4
last_reviewed: 2026-08-31
---

# Principles in Operation

## Overview

Principles guide judgment in situations nobody anticipated. That is the function, and it
defines the quality criterion: **a principle that eliminates no option guides nothing.**

The most efficient test fits in one question — **would anyone defend the opposite?**

```text
"we pursue scalable and secure solutions"      nobody defends the opposite → slogan
"we prefer buying over building, except
 where the capability is a competitive edge"   the opposite is defensible → principle
```

See [enterprise principles](/15-enterprise-architecture/enterprise-principles.md) for how
to write a principle — the losing side and the implications; here the focus is how they operate at the moment of decision, and what to do
when two of them point in opposite directions.

## Problem

Most lists of architectural principles in real organizations are made up of statements
nobody would contest:

```text
"we prioritize the user experience"
"we pursue simplicity"
"security is everyone's responsibility"
"decisions should be data-driven"
```

None of those eliminates an option. Faced with a real choice — build or buy, one database
or two, synchronous or asynchronous — none of them helps.

The practical effect is worse than absence: the organization believes it has principles, the
exercise of formulating them was done and considered complete, and the decision keeps being
made by whoever shouts loudest.

And there is a second problem, which appears when the principles are good: **they
conflict**. A principle favoring team autonomy and another favoring standardization will
collide, and with no precedence rule the collision is resolved by power.

## Core Concepts

### The opposite test

```text
formulate the opposite of the principle
if the opposite is absurd, the principle is a slogan
if the opposite is a defensible position, the principle is a choice
```

Applied examples:

```text
"we prefer strong consistency over availability in financial operations"
opposite: "we prefer availability over consistency" → defensible → principle

"we write quality code"
opposite: "we write bad code" → absurd → slogan
```

Every real principle is a choice between good things. If nothing good is being given up,
there is no principle.

See [trade-offs](/20-trade-offs/index.md).

### A principle needs implications

A principle with no declared implication is interpreted in incompatible ways:

```text
principle      "we prefer buying over building, except where the capability
               is a competitive edge"

implications   every proposal to build has to name the differentiator
               the buy evaluation includes personnel cost in the comparison
               differentiation capability is decided with product, not only
               with engineering
```

The implications are what make the principle actionable in a review. Without them, it is
cited by both sides of any discussion.

### Principles conflict, and precedence has to exist

```text
"teams choose their own technology"
"we minimize the number of technologies in operation"
```

Both defensible, and opposite. With no rule, every decision becomes a dispute.

Three ways to resolve it, in increasing order of usefulness:

```text
fixed order      principle A always beats B — simple and rigid
by domain        autonomy wins on internal choices; standardization wins
                 on shared surfaces
by risk          the greater the shared risk, the more weight to coherence
```

The second and the third work better because they name **where** each principle governs,
rather than declaring one superior in the abstract.

### Principles have exceptions; standards have an exception process

An operational distinction that clears up a lot of confusion:

```text
principle   is weighed — yielding to it in one case does not violate it
standard    is met or not — not meeting it requires a recorded exception
```

That means "we are making an exception to principle X", read literally, describes something
that does not exist: there is no waiving of a principle, because it was never a rule. What
exists is the **weighing** — this principle yielded to that one, in this case, for this
reason.

In organizational practice, however, the weighing uses the same mechanism as an exception to
a standard: it is recorded, with a justification, and it is reviewed. That is why
[enterprise principles](/15-enterprise-architecture/enterprise-principles.md) speaks of a
"declared exception path" — and it is right about the mechanism. The distinction worth
keeping is what gets recorded: in a standard, that the rule was not met; in a principle,
which other principle prevailed and why. Without that "against what", the record becomes a
waiver, and then the principle has become a rule without anybody having decided so.

See [standards](/19-architecture-governance/governance-standards.md) and
[exceptions](/19-architecture-governance/exceptions.md).

### When a principle should become a standard

```text
the same weighing repeats                    → the decision is already known
the outcome is always the same               → prescribe it and stop reassessing
the cost of deciding exceeds standardizing   → standardize
the context genuinely varies                 → keep it as a principle
```

Leaving as a principle something that has already been decided dozens of times the same way
is a waste of judgment: each team redoes an analysis whose outcome is predictable.

### Few, and used

```text
5 to 8 principles     memorable, applicable
15 or more            a reference list nobody consults
```

And the health signal is not the number: it is **citation in real decisions**. A principle
that never appears in an ADR or a review is not operating, however well written it is.

See [measurement](/19-architecture-governance/measuring-governance.md).

### Principles need review

A principle is a decision about how to decide, and it ages like any decision:

```text
"we prefer building, for lack of mature options on the market"  2018
the market matured                                              2024
```

With no periodic review, principles from one era keep governing another. An annual cadence,
with the question "do the conditions that produced this principle still hold?", is enough.

## Mental Model

**If nobody defends the opposite, it isn't a principle.** And if two principles have no
precedence rule, what decides is power.

## When to Use

- To guide decisions that cannot be anticipated.
- When the context genuinely varies between cases.
- As an explicit agenda criterion in reviews.
- Where standardizing would be too rigid.

## When Not to Use

**When whoever decides is present at every decision that matters.** In a small group the
criterion travels in conversation and gets corrected on the spot. A written principle serves
the reader who is absent from the decision; without that reader, formulating it, maintaining
implications and reviewing it every year costs more than it returns.

**When regulation already fixes the decision.** If the rule requires retaining data for five
years, the opposite is not a defensible position — it is a violation. The principle merely
repeats the rule, fails the opposite test by construction, and the right instrument is
[compliance](/19-architecture-governance/compliance.md).

**When the ADR archive already covers the decision space.** If the precedents show the
criterion case by case, the abstract principle becomes a second source that must be kept
consistent with the first, and adds little over it.

**When there is no moment at which it would be cited.** With no review, ADR or forum where
the decision is argued, the principle has nowhere to operate; formulating it produces the
slogan the opposite test exists to stop.

**For recurring decisions with a predictable outcome** — that is a standard.

## Alternatives

- **[Standards](/19-architecture-governance/governance-standards.md)** — when the decision
  is already known.
- **Templates** — the principle built into the starting point.
- **[ADRs](/18-architecture-decisions/what-is-an-adr.md)** — a concrete precedent is worth more than
  an abstraction; a set of well-recorded decisions teaches the organization's criteria.
- **Nothing** — in small teams, the shared criterion is tacit and works.

The third deserves a note: organizations with a good ADR archive frequently need fewer
principles, because the criteria are visible in the precedents.

## Trade-offs

| Principles | Standards |
|---|---|
| Cover the unforeseen | Decide the recurring |
| Require judgment | Don't require it |
| Interpretable | Verifiable |
| Don't block | Can block |

| Few principles | Many |
|---|---|
| Remembered and used | Cover more cases |
| Conflict less | Conflict more — more pairs need precedence |
| Require a hard choice | Avoid choosing |

## Failure Modes

**A slogan.** Nobody defends the opposite.

**No implication.** Cited by both sides.

**Conflict with no precedence.** Resolved by power.

**A principle that should be a standard.** Judgment wasted.

**A long list.** It isn't consulted.

**Never reviewed.** It governs with conditions from another era.

## Common Mistakes

**Formulating principles in a workshop** and never using them in a decision.

**Not applying the opposite test.**

**Not declaring where each principle governs.**

**Confusing a principle with a standard** — and making "an exception to a principle".

**Not measuring citation** in real decisions.

## Real-World Example

A retail company with 12 teams had nine architectural principles, formulated in a two-day
workshop and published on the internal portal.

Two years later, a review applied two tests.

**The opposite test**, applied to all nine:

```text
passed (the opposite is defensible)     3
failed (the opposite is absurd)         6
```

The six that failed included "we prioritize quality", "we pursue simple solutions" and
"security is a priority".

**A citation test**, searching for the principles across 140 ADRs and 60 review minutes from
the period:

```text
cited at least once                     4
cited more than five times              2
never cited                             5
```

The two most cited were the same two that had passed the opposite test comfortably.

And a third, unforeseen finding: in 11 ADRs, two principles had been cited by **opposite
sides** of the same discussion — team autonomy against reducing the number of technologies.
There was no precedence rule, and the 11 decisions had been resolved inconsistently.

The rework:

**From nine to four principles.** The five never cited were removed; one of the failed ones
was reformulated until it passed the opposite test.

**Mandatory implications**, at least two per principle, written as what changes in practice.

**Precedence by domain** for the conflict between autonomy and standardization:

```text
a choice internal to a service, with no shared surface  → autonomy wins
technology that appears in a contract between teams     → standardization wins
technology that enters the shared on-call rotation      → standardization wins
```

**Two weighings promoted to standards.** Within the four principles, two decisions repeated
with the same outcome — choice of relational database and of synchronous integration
protocol — and became derived standards. The principles stayed on the list, governing the
cases the standards don't cover. See
[standards](/19-architecture-governance/governance-standards.md).

**An annual review** with a single question: do the conditions that produced this principle
still hold?

The following year:

```text
principles in force at the start of the year   4
citations in ADRs                             38 (against 9 the previous year)
decisions with a principle conflict            7 — all resolved
                                              by the precedence rule
principles removed in the annual review        1 (3 remained)
```

The principle removed was "we prefer managed services over components operated by us". The
review found it had become consensus and no longer eliminated any option under discussion —
it had become description, not choice.

The recorded conclusion: the rework multiplied citations fourfold. The numbers don't separate
the effect of each change — the short list, implications and precedence came in together, and
the 7 decisions with a resolved conflict are a direct effect of precedence, not of the
reduction. The case for the short list rests on the mechanism, not the count: the long list
wasn't consulted because it didn't fit in anyone's head at the moment of decision, which is
the only moment a principle is any use.

## Related Concepts

- [Enterprise Principles](/15-enterprise-architecture/enterprise-principles.md) — the
  formulation.
- [Standards](/19-architecture-governance/governance-standards.md) — when to prescribe.
- [Review](/19-architecture-governance/governance-review.md) — where the principle is
  applied.
- [Trade-offs](/20-trade-offs/index.md) — what every principle gives up.

## Practical Exercise

Take your organization's list of principles and apply the opposite test to each one.

Then search for each principle in the last year's ADRs and minutes. The ones that fail both
tests are not operating.

## Interview Questions

- Why is "we pursue simplicity" not a principle?
- How do you resolve a conflict between two equally valid principles?
- When should a principle be promoted to a standard?

## Further Reading

- Ford, Neal et al. *Fundamentals of Software Architecture*. O'Reilly, 2020.
- *TOGAF Standard* — Architecture Principles. The Open Group.
- Hohpe, Gregor. *The Software Architect Elevator*. O'Reilly, 2020.

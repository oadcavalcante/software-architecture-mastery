---
id: architecture-principles
title: Architecture Principles
sidebar_position: 20
description: Guiding distributed decisions without having to be present at each one.
doc_type: concept
level: 1
difficulty: intermediate
status: complete
objective: >
  By the end, the reader writes principles that actually guide choice, because
  they state what is being given up.
prerequisites: [architecture-characteristics]
related: [architecture-as-decisions, architecture-governance]
canonical_for: [architecture principles]
translated_from_version: 1
last_reviewed: 2026-08-30
---

# Architecture Principles

## Overview

Architecture principles are stated guidance that helps whoever is deciding, at the
moment they decide, choose consistently with what the organization has already
concluded.

They exist because whoever architects is not present at every decision — and the
alternative to principles is not centralizing everything, it is inconsistency.

## Problem

Most principles published by companies guide nothing. They are sentences like "we
prioritize simplicity", "we choose the best tool for the job", "we value
maintainability".

The defect is precise: **nobody would choose the opposite.** No team prefers
complexity or worse tools. A principle with no defensible opposite eliminates no
option, and therefore helps in no decision.

The test, then, is: **invert the principle. If the inverted sentence is obviously
absurd, the original is empty.**

"We prioritize simplicity" inverted becomes "we prioritize complexity" — absurd, so
the principle is empty.

"We prefer simpler solutions even when they limit future use cases" inverted
becomes "we accept complexity to cover future cases" — a defensible position that
companies do in fact adopt. So the original principle has content.

## Core Concepts

### A principle states what is given up

The form that works has three parts:

```text
We prefer  X
over       Y
because    a reason tied to an architecture characteristic
```

The "over Y" is the part that carries the value and the one that is almost always
missing. Without it, the principle distinguishes nothing.

Examples with content:

- *We prefer eventual consistency over strong consistency, except in financial
  flows, because availability is our first characteristic.*
- *We prefer managed services over self-managed ones even at a higher cost per
  transaction, because we have eight engineers and no infrastructure on-call.*
- *We prefer duplicating code across contexts over creating a shared library,
  because coupling between teams costs more than duplication.*

Each eliminates options and each has an opposite that another company would adopt.

### A principle guides; a standard prescribes

The operational distinction that matters most in practice:

| | Principle | Standard |
|---|---|---|
| Function | Guides judgement | Prescribes the choice |
| Applies to | A new, unforeseen situation | A recurring situation, already settled |
| Exception | Weighed — there is no formal exception | Requires an explicit process |
| Typical failure | Too vague to decide with | Too rigid for the actual case |

An organization with only principles decides inconsistently. With only standards,
it jams on the first unforeseen case. Confusing the two produces the worst of both.

### Principles derive from characteristics

A principle with no link to an
[architecture characteristic](architecture-characteristics.md) is personal
preference with borrowed authority.

The chain is: business context determines the driving characteristics; the
characteristics determine the principles; the principles guide individual
decisions.

When someone asks "why this principle?", the answer has to reach a characteristic,
and from there a business constraint.

### Few and revisable

Five to ten principles is what a team can apply. Thirty is a policy nobody reads.

And principles have an expiry. One derived from "we are eight engineers" needs
revisiting when there are eighty.

## Mental Model

**A principle is a decision made once so it does not have to be made every time.**

If the same discussion recurs every quarter with the same outcome, it is a
candidate to become a principle. If the outcome varies by case, it is not — it is
judgement, and a principle does not replace judgement.

## When to Use

- When the same class of decision reappears in different contexts with the same
  answer.
- When teams decide inconsistently and the inconsistency costs.
- When you cannot be present at every decision and need it to be made well without
  you.
- When a conclusion was learned expensively and must not be relearned.

## When Not to Use

**When the right answer varies by case.** There, a principle becomes a
straitjacket and the team works around it silently — which is worse than having no
principle, because the violation stops being discussable.

**When the principle has no defensible opposite.** See the inversion test. It helps
nobody and takes up attention.

**When the team is small enough to just talk.** With four people in the same room,
formal principles are ceremony; the conversation settles it.

**When you do not intend to revisit them.** A principle written and never
re-examined becomes a ghost constraint — it shaped decisions and no longer holds.

## Alternatives

- **A standard** — when the decision recurs and the answer is single, prescribe
  instead of guiding.
- **A fitness function** — when the property can be verified automatically,
  verifying is cheaper and more reliable than guiding.
- **An ADR** — when the decision is specific rather than a recurring class.
- **A conversation** — when the team is small.

## Trade-offs

The axis is **consistency versus local autonomy**.

| More principles | Fewer principles |
|---|---|
| Consistent decisions across teams | Each team optimizes for its own context |
| Expensive conclusions are not lost | Each team relearns |
| Fewer repeated discussions | A discussion per case |
| Risk of applying outside the context | Every decision is contextualized |
| Cost of maintaining and revising | No maintenance |

## Failure Modes

**The empty principle.** No defensible opposite. It occupies space and decides
nothing.

**A principle turning into a rule with no exceptions.** Applied where it does not
fit, because it became a compliance criterion instead of guidance.

**An ownerless principle.** Nobody knows who established it or why. It can be
neither revised nor contested.

**An outdated principle.** Derived from a constraint that no longer exists. It goes
on eliminating options that have become available again.

**Too many principles.** Nobody reads them, and the existence of the list gives the
false impression that guidance exists.

## Real-World Example

A mid-sized company had nine published principles. Seven failed the inversion test
— "we prioritize quality", "we pick the right tool for each problem", and
variations.

The two that survived:

> *We prefer managed services over self-managed components, even at up to 3× the
> cost per transaction, because our platform team has four people and there is no
> dedicated on-call.*

> *We prefer duplicating logic across bounded contexts over extracting a shared
> library, because coupling between teams delayed three of our last five releases.*

Both eliminate options, both have a defensible opposite, and both cite the concrete
reason.

The detail that gives the outcome: eighteen months later, the platform team had
fifteen people and an on-call rota. The first principle was revised — not removed,
but rewritten with a different cost threshold.

It could only be revised because the reason was written down. The seven empty
principles are still there, and nobody could say what would have to change for them
to be revised.

## Where principles live

A principle that exists only in a document nobody opens guides nothing. The
difference between an effective principle and a published one is where it shows up.

The places that work, in order of effectiveness:

**In the decision template.** If the team's ADR format explicitly asks "which
principles apply and how", the principle is consulted at the moment it matters,
rather than afterwards.

**In architecture review.** As a standard question, not as an audit: which
principle guided this choice? The answer "none" is information — either a principle
is missing, or this is a genuinely new case.

**As an automated check, where possible.** A principle about dependency direction
can become a test. There it stops depending on anyone remembering.

**In onboarding.** It is where the cost of not knowing the principles is highest
and where the return on teaching them is immediate.

The place that does not work is a wiki page updated once and never cited again —
which is where most architecture principles live.

## Related Concepts

- [Architecture Characteristics](architecture-characteristics.md) — where
  principles derive from.
- [Architecture as a Set of Decisions](architecture-as-decisions.md) — what
  principles guide.
- [Governance](/19-architecture-governance/index.md) — how principles operate
  across teams.

## Practical Exercise

Take your team's architecture principles — written or tacit.

Apply the inversion test to each. Write the opposite and ask: would any competent
company adopt this?

For the ones that survive, check whether they state what is given up and which
characteristic they tie to. Rewrite the ones that do not.

## Interview Questions

- What distinguishes a useful architecture principle from an empty one?
- What is the difference between a principle and a standard?
- How do you handle a principle that does not apply to the case in front of you?

## Further Exploration

- Ford, Neal; Richards, Mark. *Fundamentals of Software Architecture*. O'Reilly,
  2020.
- Skelton, Matthew; Pais, Manuel. *Team Topologies*. IT Revolution, 2019 — on
  autonomy and alignment across teams.

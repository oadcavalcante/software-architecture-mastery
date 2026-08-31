---
id: yagni
title: YAGNI
sidebar_position: 4
description: Don't build for an imagined requirement — and why the cost is not just the wasted effort.
doc_type: concept
level: 2
difficulty: beginner
status: complete
objective: >
  By the end, the reader recognizes speculative construction and distinguishes the
  cases where anticipating is correct from those where it is waste.
prerequisites: [fundamentals]
related: [kiss, dry, solid]
canonical_for: [YAGNI, speculative generality]
translated_from_version: 1
last_reviewed: 2026-08-31
---

# YAGNI

## Overview

YAGNI — *You Aren't Gonna Need It* — advises against building features or
generalizations for requirements that do not yet exist.

Martin Fowler's formulation is precise: apply YAGNI to **presumptive**
capabilities, not to capabilities **known with a deadline**.

## Problem

Building for the future looks like prudence and is frequently waste with a good
reputation.

The argument is always the same: "it will be cheaper to do it now than later". That
presumes two things that rarely hold — that the requirement will arrive, and that
it will arrive in the anticipated form.

But the cost of the waste is not the main one. Fowler identifies four costs, and
the last three are the ones that hurt:

**Cost of building** — the effort spent on what is not used.

**Cost of delay** — what did not get done in the meantime.

**Cost of carry** — the speculative code has to be understood, maintained,
migrated and tested for as long as it exists, by everyone who passes through. It
shows up in searches, in reviews and in version migrations.

**Cost of repair** — when the real requirement arrives different from the
anticipated one, the generalization has to be undone before the right thing can be
done. And undoing is more expensive than having started from zero, because other
things already depend on it.

The fourth is what flips the calculation. The wrong generalization is not neutral;
it is negative.

## Core Concepts

### Presumptive versus known

| Situation | Apply YAGNI? |
|---|---|
| "We might need to support another provider" | Yes — presumptive |
| "A signed contract requires multi-tenancy in July" | No — known, with a deadline |
| "Some day we'll internationalize" | Yes |
| "We enter the European market in Q3, with GDPR" | No |
| "This might need to scale" | Yes |
| "The contracted SLO is 99.9%" | No — it is a requirement |

The distinction is the deadline and the commitment. Without both, it is
presumption.

### YAGNI is not an excuse for bad code

Not building what is unnecessary is different from badly building what is.

YAGNI says not to add the plugin interface nobody asked for. It does not say to
write the current feature without clear names, without tests, or with unnecessary
coupling.

Confusing the two is used to justify haste, which inverts the principle: YAGNI
exists to **preserve** the ability to change, and bad code destroys it.

### The antidote is reversibility

YAGNI works because adding later is usually cheap — if the code is easy to change.

That means the two principles travel together: the easier the system is to change,
the more aggressively YAGNI can be applied. In a rigid system, anticipating has
more justification — which is a sign that the real problem is the rigidity.

## Mental Model

**Ask for the date.** "When exactly will we need this, and who committed to it?"
With no answer, it is presumptive.

## When to Use

- Facing any construction justified by "we're going to need it".
- On seeing configuration parameters with no caller that uses them differently.
- On seeing an interface with one implementation created "so we can swap it".
- In a product in the discovery phase, when most of what is built will be
  discarded.

## When Not to Use

**When the requirement is known, with a deadline and a commitment.** Then it is not
presumption.

**When adding later is demonstrably expensive.** Some cases have real asymmetry:
the data model, a public API contract, an entity identifier, partitioning. Adding
multi-tenancy to a schema with three years of data is not the same as adding an
endpoint.

**When the choice is between two options of equal cost.** If the more general
version costs no more, YAGNI does not apply — there is no saving to make.

**In decisions with a high cost of reversal.** See
[what is architecture](/01-fundamentals/what-is-software-architecture.md). YAGNI
is safer the cheaper it is to change your mind.

**When the "generalization" is basic hygiene.** Handling errors, validating input
and logging are not future requirements.

## Alternatives

- **Defer with a recorded option** — do not build, but record the condition that
  would lead to building. It preserves the analysis without paying for the code.
- **Build the specific version well** — so that generalizing later is cheap.
- **A feature flag** — build and do not expose, when the requirement is known but
  the timing is not.

## Trade-offs

| Apply YAGNI | Anticipate |
|---|---|
| Less code to maintain | The future requirement is already met |
| Fewer parts to understand | No rework if the prediction is right |
| Future change costs something | Cost paid now, even unused |
| Risk of real asymmetry | Risk of predicting wrong, and paying repair |

## Failure Modes

**Speculative generality.** Abstraction for variation that did not occur, and that
has to be dismantled when the real variation arrives different.

**Orphan configuration.** Parameters every caller passes with the same value.

**YAGNI applied to the foundation.** A data model without multi-tenancy in a
product that sold multi-tenancy. The case where YAGNI is the wrong decision.

**YAGNI as an excuse.** Code with no tests and no clear names justified as
simplicity.

## Common Mistakes

**Applying it to a known requirement with a deadline.** See the table above.

**Applying it to decisions with a high cost of reversal.** Where the asymmetry is
real, anticipating is prudence.

**Ignoring the cost of carry.** Whoever argues for anticipation usually only
compares the cost of building now with the cost of building later, and ignores the
years of maintaining the unused code.

**Confusing it with "don't think about the future".** YAGNI is about not
*building*. Thinking, recording the condition and designing for reversibility is
the opposite of recklessness.

## Real-World Example

A team built a notification system with an abstraction for "any channel": email,
SMS, push, webhook, with dynamic channel registration and configurable routing.

The real requirement at the time: send email.

Three years later, the system sent email and push. Two channels, not five. And the
abstraction did not serve push: it modelled a message as text with a subject, and
push needed a structured payload with an action. The push channel was added by
**working around** the abstraction.

Accounting for it: two months of initial construction, three years of maintaining a
routing mechanism that never routed anything, and a permanent workaround that
anyone reading the code has to understand.

The contrast in the same system: the recipient identifier was defined as opaque
from the start, rather than "email address". That was anticipation — and it was
correct, because changing an identifier's type after three years of data is
asymmetrically expensive.

The difference between the two cases is not having predicted the future. It is that
one was cheap to add later and the other was not.

## Related Concepts

- [KISS](/02-software-design/kiss.md) — the same spirit applied to structure.
- [Abstraction](/01-fundamentals/abstraction.md) — the cost of premature
  generalization.
- [Complexity](/01-fundamentals/complexity.md) — what speculation adds.

## Practical Exercise

Find three extension points in your system — an interface, a configuration, a
plugin mechanism.

For each: how many distinct implementations or values exist today? If it is one,
when was it created and which future requirement justified it? Did that requirement
arrive?

## Interview Questions

- What are the costs of building for a requirement that did not arrive?
- When is anticipating the correct decision?
- How does YAGNI relate to decisions with a high cost of reversal?

## Further Exploration

- Fowler, Martin. *Yagni*, 2015 — the four costs.
- Beck, Kent. *Extreme Programming Explained*. 2nd ed., 2004.
- Fowler, Martin. *Refactoring*. 2nd ed., 2018 — the speculative generality code
  smell.

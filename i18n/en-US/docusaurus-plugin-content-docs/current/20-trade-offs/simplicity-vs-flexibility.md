---
id: simplicity-vs-flexibility
title: Simplicity vs. Flexibility
sidebar_position: 1
description: Flexibility is optionality bought upfront — and most options bought are never exercised.
doc_type: tradeoff
level: 5
difficulty: intermediate
status: complete
objective: >
  By the end, the reader decides how much flexibility to buy based on the probability of the
  change and the cost of accommodating it later.
prerequisites: [complexity]
related: [abstraction-vs-complexity, coupling-vs-duplication, speed-vs-quality]
canonical_for: []
translated_from_version: 1
last_reviewed: 2026-08-31
---

# Simplicity vs. Flexibility

## Overview

The pair seems to oppose two virtues. It does not — it opposes **present certainty** to
**future optionality**.

Flexibility is an option bought today to be exercised tomorrow. Like any option, it has a
premium: extra code, indirection, more concepts, more paths to test. And like any option, it
only pays off if it is exercised.

```text
real axis   probability the change happens × cost of accommodating it later
            against the cost of carrying the option until then
```

Common intuition errs systematically in one direction: it overestimates the probability of
specific changes and underestimates the cost of carrying the option.

## Problem

The starting point is always a reasonable question: "what if one day we need another payment
provider?"

The answer produces an abstraction, an interface, a factory, a configuration.

```text
year 1   one provider, one interface, one implementation, one configuration
year 3   one provider, one interface, one implementation, one configuration
year 5   provider swap — and the interface does not fit, because it was designed
         from the only provider that existed
```

The third year is the most common outcome: the option was bought, carried for years and never
exercised. The fifth is the second most common: the option was exercised and did not fit,
because flexibility built without knowing the second case accommodates only variations of the
first.

And the opposite fails too. A system built with zero optionality at points that demonstrably
change — data formats, volatile business rules, partner integrations — pays on every change a
cost a minimal seam would have avoided.

## Core Concepts

### The real axis

```text
it is not   "simple is good, flexible is good, pick one"
it is       is the option worth the premium, given the probability and the cost of
            adapting later?
```

Three variables decide:

```text
p    probability the change happens within the relevant horizon
Cl   cost of accommodating the change later, unprepared
Cc   cost of carrying the flexibility until then
```

You buy the option when `p × Cl > Cc`. The problem is that `p` is systematically
overestimated and `Cc` is underestimated, because the premium is paid in small installments —
a little indirection at a time.

### Unexercised flexibility is pure cost

```text
code to read           whoever arrives must understand the indirection
paths to test          each variation point multiplies scenarios
concepts to explain    the abstraction must be taught
more expensive changes altering something generic is harder than altering something specific
```

The last one is the most counterintuitive. An abstraction created to make future changes
easier frequently makes **unforeseen** changes harder, because it fixes the axis along which
variation is allowed.

See [complexity](/01-fundamentals/complexity.md).

### The right flexibility comes from the second case

```text
one known case   the abstraction is guesswork
two cases        the real variation becomes visible
three cases      the axis is clear
```

This is the practical reason for the rule of three: the structure that accommodates variation
is derivable from cases, not anticipatable from one.

Building from one case produces an abstraction shaped like that case — which is exactly what
does not fit when the second appears.

See [coupling vs. duplication](/20-trade-offs/coupling-vs-duplication.md).

### The cost of adapting later is not always high

The argument for buying the option presupposes that adapting later is expensive. Frequently
it is not:

```text
cheap to adapt      internal logic, code structure, library choice
expensive to adapt  published data format, contract with externals,
                    schema with large history, service boundary
```

For the first line, the answer is almost always to build simple and adapt when you need to.
For the second, optionality pays off even at low probability.

This reframes the question: **it is not "will this change?", it is "if it changes, what does
it cost?"**

### Signs you bought too much flexibility

```text
extension points with a single implementation, for over a year
configuration that was never changed in any environment
interfaces with one implementer
layers that merely forward calls
"in case we need it" as a justification in review
onboarding time dominated by understanding the indirection
```

Three or more of these signs indicate the option was bought and will not be exercised.

### Signs you bought too little

```text
the same change requires touching the same set of files every time
copy-and-adapt as the pattern for predictable variations
business rule changes requiring a code deployment
new integrations costing the same as the first one cost
```

The last is the most measurable: if the fifth partner integration costs the same as the
first, structure is missing.

### The cost of changing your mind is asymmetric

```text
simple → flexible   local refactoring, with the real cases in hand
flexible → simple   removing an abstraction used by many, afraid of breaking things
```

The asymmetry favors starting simple. Adding flexibility later is done with information — the
cases exist. Removing flexibility is done with uncertainty, because nobody knows who depends
on it.

This is the decisive argument in ties, and it is the item intuition most ignores.

## Mental Model

**Flexibility is an option with the premium paid in installments.** Buy where adapting later
is expensive; everywhere else, wait for the second case.

## When to Use

Prefer **flexibility** when:

- The change is known and dated, not hypothetical.
- Adapting later would require data migration or coordination between teams.
- The point is a published boundary — format, contract, schema.
- Two or more real cases already exist.
- The cost of the option is small and localized.

Prefer **simplicity** when:

- The change is hypothetical.
- Adapting later is a local refactoring.
- There is a single known case.
- The team is small or is still learning the domain.

## When Not to Use

**As a dilemma, when it is a false one.** Many points accept a minimal seam — a function, a
named boundary — that costs almost nothing and is not an abstraction.

**Without estimating the cost of adapting later** — without that number, the discussion turns
into preference.

**As a generic argument** — "be flexible" and "be simple" decide nothing applied to the whole
system. The decision is point by point.

**To justify not deciding** — flexibility is sometimes postponement disguised as design.

## Alternatives

- **Minimal seam** — name the boundary without creating an abstraction; cheap and reversible.
- **Defer with a record** — build simple and record in an
  [ADR](/18-architecture-decisions/what-is-an-adr.md) what would change the decision.
- **Isolate instead of generalize** — concentrating the specific in one place is cheaper than
  making it generic.
- **Rule of three** — wait for the third case before abstracting.

The first is the right answer more often than either extreme: a `chargePayment` function
called from one place already gives you the seam for the day there are two providers, with no
interface and no factory.

## Trade-offs

| Simplicity | Flexibility |
|---|---|
| Cheap to read and change | Accommodates the foreseen |
| Adaptation on demand | Adaptation already paid for |
| Risk: expensive change | Risk: option not exercised |
| Reversible | Hard to remove |

| Buy the option early | Wait for the second case |
|---|---|
| Ready when you need it | Design informed by real cases |
| Guessed shape | Waiting costs one change |
| Premium paid from day one | Premium avoided |

## Failure Modes

**Option never exercised.** Premium paid for years, no return.

**Option that does not fit.** Built from one case, does not accommodate the second.

**Abstraction that fixes the wrong axis.** Makes the change that actually came harder.

**Simplicity at a published boundary.** Adapting later requires coordinating externals.

**Flexibility as postponement.** The hard decision is pushed away.

## Common Mistakes

**Asking "will this change?"** instead of "if it changes, what does it cost?".

**Abstracting from one case.**

**Not counting onboarding time** as part of the premium.

**Not looking at extension points with a single implementer.**

**Treating it as a global decision** and not point by point.

## Real-World Example

A payments company built, in 2021, a provider abstraction layer. The motivation was concrete:
the board wanted not to depend on a single acquirer.

The design had a provider interface, a factory, per-environment configuration and three
extension points. Initial cost: about six weeks.

In 2024, a second acquirer was contracted. The integration took **four months**.

The team's analysis pointed at the reason:

```text
the interface modeled the first acquirer's flow
the second had two-step authorization, not one
the error model was incompatible
capture was asynchronous, not synchronous
reconciliation used an identifier the interface did not expose
```

The abstraction accommodated variations of the first provider. The second was not a variation
— it was another flow.

And there was a cost carried for three years nobody had added up:

```text
extra files in the layer                       31
average onboarding time for a new person
  in the payments area                         +3 days, estimated
changes that had to touch the abstraction
  without changing provider                    19
```

The rebuild, done with two providers in hand, took seven weeks — and produced a different
abstraction, in which staged authorization and asynchronous capture are the base model, and
the synchronous provider is the simplified case.

What the team started doing:

**Seam without abstraction** as the default. A module with functions named by intent, called
from one place, with no interface. When the second case appears, the abstraction is derived
from both.

**Cost of adapting later estimated** before buying optionality, and recorded in the ADR. Of
the 14 cases evaluated in the following two years, 11 had estimates under two weeks — and
none of those got an anticipatory abstraction.

**Annual audit of extension points.** Interfaces with a single implementer for more than 18
months are candidates for removal. In the first round, 9 of 23 were removed.

**Declared exception for published boundaries.** Event formats and contracts with externals
still get versioning and optionality from the start, even with no second case — because
adapting later requires coordinating third parties.

The lesson recorded: the 2021 decision was not irrational. The error was one of method —
designing the variation from a single example. The question that was missing was not "will we
need another provider?", which was right, but "what do we know about how the second provider
will be different?", whose honest answer was "nothing".

## Related Concepts

- [Complexity](/01-fundamentals/complexity.md) — what flexibility adds.
- [YAGNI](/02-software-design/yagni.md) — the corresponding principle.
- [Abstraction vs. Complexity](/20-trade-offs/abstraction-vs-complexity.md).
- [Coupling vs. Duplication](/20-trade-offs/coupling-vs-duplication.md) — the rule of three.

## Practical Exercise

List your system's extension points — interfaces, configurations, factories — and count how
many have more than one implementation in use.

Those with only one, for over a year, are options bought and not exercised. Add up their
cost.

## Interview Questions

- Why is "will this change?" the wrong question?
- Why does an abstraction built from one case usually not fit the second?
- Why does the asymmetry in the cost of changing your mind favor starting simple?

## Further Reading

- Ousterhout, John. *A Philosophy of Software Design*. 2nd ed. Yaknyam Press, 2021.
- Fowler, Martin. *Yagni*. martinfowler.com, 2015.
- Brooks, Frederick. *No Silver Bullet*. IEEE Computer, 1987.

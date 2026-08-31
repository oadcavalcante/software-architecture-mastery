---
id: value-object
title: Value Object
sidebar_position: 12
description: An object defined by its values, immutable — the tactical block with the best return.
doc_type: pattern
level: 2
difficulty: beginner
status: complete
objective: >
  By the end, the reader identifies concepts that should be value objects and
  recognizes the gain of eliminating primitive obsession.
prerequisites: [entity]
related: [entity, aggregate, code-smells]
canonical_for: [value object]
translated_from_version: 1
last_reviewed: 2026-08-31
---

# Value Object

## Overview

A value object is defined by its attributes, not by identity. Two objects with the same
values are interchangeable.

It is the tactical block with the best effort-to-return ratio — and the most underused.

## Problem

Domain concepts represented by primitive types scatter responsibility and allow errors the
compiler could have prevented.

```text
void transfer(String source, String destination, BigDecimal amount)
```

Three problems in that signature.

**Silent swap.** Nothing prevents passing destination in place of source — they are the
same type.

**Scattered validation.** Where do you check that the account is valid? In every caller,
with variations.

**Absent semantics.** `BigDecimal` does not know that money has a currency, that you do not
add amounts in different currencies, and that rounding follows a specific rule.

It is *primitive obsession* from the
[code smells](/02-software-design/code-smells.md) catalogue, and value objects are the fix.

## Core Concepts

### Immutability is a requirement

A value object does not change. Operations return new objects:

```text
salary.increasedBy(raise)      → a new Money
period.extendedTo(date)        → a new Period
```

That eliminates a whole class of defects: there is no way to alter a shared value by
accident, and no need for defensive copying.

### Valid by construction

The constructor validates. If a `TaxId` exists, it is valid — there is no way to create an
invalid one.

That concentrates the validation in one place and makes it impossible to forget. Whoever
receives a `TaxId` does not have to check anything.

The gain is greater than it looks: it eliminates the scattered defensive checking and the
handling of "what if it is invalid?" in every consumer.

### Behaviour belongs to the value

A value object is not just a wrapper around data. It carries the concept's operations.

`Money` knows to add only within the same currency, knows how to split with a defined
rounding rule, knows how to compare. `Period` knows whether it contains a date, whether it
overlaps another period, how many business days it has.

A value object with no behaviour is a wrapper with little return.

### Where they appear in the domain

The candidates are recognizable: money, a quantity with a unit, a period, an interval, an
address, a document, a code, a coordinate, a percentage, a range.

Practical rule: **any concept the business names and that today is a primitive or a group
of primitives that travel together.**

The second case — *data clumps* — is the most frequent: `startDate` and `endDate` always
passed together are a `Period`.

## When to Use

- A domain concept is represented by a primitive.
- Several primitives always travel together.
- There is validation repeated in several places.
- There is a rule about the concept — rounding, comparison, formatting — scattered around.
- Swapping two parameters of the same type is a possible error.

## When Not to Use

**When the concept has identity.** It is an [entity](/04-domain-driven-design/entity.md).

**When there is neither behaviour nor validation.** A pure wrapper over a string, with no
rule at all, adds ceremony with no return. It is worth it when there is at least
validation.

**In generic or supporting subdomains.** The ceremony does not pay off outside the core.

**When the language makes it expensive.** On platforms where each object has a significant
cost and the volume is enormous, the impact has to be measured — though that is less common
than assumed.

**For transport data.** An API DTO does not need internal value objects.

## Alternatives

- **A primitive type with centralized validation** — less safe, cheaper.
- **A type alias** — in languages offering lightweight nominal types, it gives type safety
  with no class.
- **An immutable record** — when there are grouped values and little behaviour.

## Trade-offs

| Value object | Primitive |
|---|---|
| Valid by construction | Validation at every use |
| Parameter swap impossible | Silent |
| Behaviour next to the concept | Scattered |
| Semantics explicit in the signature | Absent |
| More types in the system | Fewer |
| Conversion at the boundary | Direct |

The last row is the real cost: value objects have to be converted when crossing the
domain's boundary — for persistence, for the API. It is mapping work that primitives do
not require.

## Failure Modes

**Mutable value object.** It loses the guarantees and reintroduces the sharing risk.

**Equality not implemented.** Comparison by reference makes two equal values look different
— and breaks collections and caches silently.

**Anemic wrapper.** With no validation and no behaviour.

**Type explosion.** A value object per field, including ones with no rule.

**Leak into the API.** The domain type at the external boundary ties the public contract to
the internal model.

## Common Mistakes

**Not implementing equality and hash code.** The most common defect and the subtlest.

**Creating a wrapper with no rule.**

**Making it mutable.**

**Using it everywhere, including outside the core.**

## Real-World Example

A payroll system had `BigDecimal` for monetary values and `double` for percentages.

Two production defects, both traced to the absence of value objects.

The first: a holiday-pay proration rounded at each instalment, and the sum of the
instalments differed from the total by cents. Multiplied by 4 thousand employees, it
produced an accounting discrepancy that took a week to diagnose.

The second: a percentage was passed as `0.05` in one place and `5` in another — both
`double`, no compilation error. The deduction came out 100 times larger for 12 employees.

Introducing `Money` and `Percentage` fixed both.

`Money` has `split(int parts)` which distributes the remainder deterministically — the last
instalment absorbs the difference — and guarantees the sum of the parts is always the
total. The rule ended up in one place, tested.

`Percentage` can only be constructed from a value with an explicit unit:
`Percentage.ofHundredths(5)` or `Percentage.ofFraction(0.05)`. The ambiguity disappeared
from the signature.

Cost of the change: two weeks, including the mapping at the persistence boundary. In the
three following years, no defect of the same category.

## Related Concepts

- [Entity](/04-domain-driven-design/entity.md) — the other half of the decision.
- [Aggregate](/04-domain-driven-design/aggregate.md) — where they are composed.
- [Code Smells](/02-software-design/code-smells.md) — primitive obsession.
- [Encapsulation](/02-software-design/encapsulation.md).

## Practical Exercise

Look in your domain for parameters of the same primitive type that appear together in a
signature — two `String`s, two dates, two numbers.

Each pair is a possible silent swap, and a value object candidate.

Then look for validations that repeat: each one appearing in more than two places belongs
to a value object.

## Interview Questions

- What characterizes a value object?
- Why is immutability a requirement?
- What is the risk of not implementing equality correctly?

## Further Exploration

- Evans, Eric. *Domain-Driven Design*. Addison-Wesley, 2003.
- Vernon, Vaughn. *Implementing Domain-Driven Design*. Addison-Wesley, 2013.
- Fowler, Martin. *ValueObject*, 2016.

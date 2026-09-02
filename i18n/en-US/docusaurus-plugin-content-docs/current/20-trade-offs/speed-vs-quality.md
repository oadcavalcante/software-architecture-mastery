---
id: speed-vs-quality
title: Speed vs. Quality
sidebar_position: 5
description: The trade-off exists for weeks, not for years — and whoever treats it as permanent loses both.
doc_type: tradeoff
level: 5
difficulty: intermediate
status: complete
objective: >
  By the end, the reader distinguishes a shortcut with a deadline from permanent erosion, and
  knows when speed and quality stop being opposites.
prerequisites: [technical-debt]
related: [cost-vs-reliability, performance-vs-maintainability, simplicity-vs-flexibility]
canonical_for: []
translated_from_version: 2
last_reviewed: 2026-08-31
---

# Speed vs. Quality

## Overview

This is the most misunderstood pair in the set, because it **changes sign with the time
horizon**.

```text
days to weeks   opposites — cutting quality delivers faster
months          neutral
years           aligned — quality is what sustains speed
```

The research on delivery performance is consistent on this point: the fastest organizations are
also the ones with the lowest change failure rate. They do not trade one for the other — the
ability to change safely is what allows changing frequently.

```text
real axis   for how long will this shortcut be carried, and what does
            it cost per week while it lasts?
```

## Problem

The trade-off is invoked in a real situation: a deadline, a demo, a market window. Cut tests,
skip review, duplicate instead of structuring — and ship.

That works. The error is not in doing it, but in not closing it:

```text
week 1      shortcut taken consciously, for a date
week 6      the date passed; the shortcut remains
month 6     the shortcut became the module's standard
month 18    every change in that area costs three times more
month 30    nobody remembers it was deliberate
```

And there is the symmetric error, less common and equally expensive: quality as an end in
itself. Test coverage as a target, abstraction before the second case, exhaustive review of
trivial changes. That consumes speed without producing the ability to change.

## Core Concepts

### A shortcut with a deadline is different from erosion

```text
deliberate shortcut   chosen, recorded, with a date and an owner to undo it
erosion               undecided accumulation, no record, no deadline
```

The difference is not in the code produced — it can be identical. It is in the fact that
someone decided, wrote down when to undo it, and has an owner.

See [technical debt](/01-fundamentals/technical-debt.md).

Without a record, a shortcut is indistinguishable from incompetence six months later —
including to whoever took it.

### The cost is per week, not per event

```text
"let's skip the tests on this part to ship on Friday"
real cost   is not Friday
            it is every change in that area, until the tests exist
```

The question that makes the decision honest: **how many weeks will this last, and how much does
it cost per week?**

```text
a 2-week shortcut, at 4 h/week of rework   ~8 h
the same shortcut for 18 months           ~900 h
```

The same shortcut, a completely different decision. And the second number is not the first one
multiplied by the timeframe: 78 weeks at 4 h/week would give ~310 h, and the rate does not stay
at 4 — that is what the section on [compound interest](#debt-charges-compound-interest)
measures. The linear calculation understates the cost by about three times, and it is the
calculation almost everyone does in their head.

### What is never worth cutting

Some cuts are locally cheap and globally expensive to the point of not paying off even on a
short deadline:

```text
security                   the cost shows up as an incident, not as rework
data migration             an error in data is frequently irreversible
published format           consumed by externals; fixing requires coordination
observability              without it, the shortcut itself is invisible
```

The last is counterintuitive and important: cutting observability removes the ability to know
whether the shortcut is causing damage.

### What is worth cutting

```text
generalization         build for the present case
exhaustive coverage    test the critical path, leave the rest
refactoring            defer what is not blocking
automation             do it manually while the volume is low
non-essential
  documentation        record the decision, defer the rest
```

The criterion is the same: the cost of doing it later is close to the cost of doing it now, and
the cost of carrying it is low.

### Quality that produces speed

Not every quality practice costs time. Some return it almost immediately:

```text
automated test of the critical path   returns on the first regression avoided
automated deployment                  returns in the first week
observability                         returns on the first incident
clear module boundary                 returns on the third change
```

Calling those "quality" and treating them as cost is the central conceptual error of this
topic. They are speed infrastructure.

See [continuous delivery](/14-devops-and-platform/ci-cd.md).

### Debt charges compound interest

```text
month 1    the shortcut costs 4 h/week
month 6    the code around it was built on top of it; it costs 9 h/week
month 18   undoing requires touching three modules; it costs 20 h/week

accumulated through month 18, interpolating between the three points   ~900 h
```

The growth is not linear because each change made on top of the shortcut consolidates it. That
implies that the shortcut's duration matters more than the shortcut itself — and that short
deadlines are qualitatively different from long ones.

### Signs of the wrong choice

```text
cut too much
  delivery time growing with no increase in scope
  change failure rate rising
  fear of touching specific areas
  fixes generating new fixes
  increasingly conservative estimates in the same area

cut too little
  long discussions about reversible decisions
  coverage as a target, not as a means
  abstractions with no second case
  exhaustive review of trivial changes
  deliveries slipping without the risk justifying it
```

The "fear of touching" sign is the most reliable of the first group: it appears before any
metric.

### Cost of changing your mind

```text
fast → careful   expensive and growing: the more time passes, the more expensive
careful → fast   cheap: you can accelerate when you need to
```

The asymmetry is strong and favors keeping the base healthy: a team with a good base can take a
shortcut when the deadline demands it, and come back. A team with an eroded base cannot get
fast even by cutting more.

This is the most practical argument in favor of quality, and it is about **optionality**, not
about virtue.

## Mental Model

**A shortcut with a date and an owner is a decision; without them, it is erosion.** On a
horizon of years, both sides are the same side.

## When to Use

Accelerate by cutting when:

- There is a real date, with a consequence.
- The scope of the cut is bounded and known.
- The deadline to undo it is recorded, with an owner.
- The cut is not to security, data, a published format or observability.
- The hypothesis is still being validated — code that may be thrown away.

Invest in quality when:

- The system will be long-lived.
- The area is touched frequently.
- The cut would be in one of the four untouchable categories.
- There are already signs of erosion.

## When Not to Use

**As a permanent dilemma** — it is temporary by nature.

**Without a deadline and an owner** for the shortcut.

**In security, data, a published format or observability.**

**As a recurring justification** — the third consecutive quarter of "just this once" is
erosion.

**To cut what returns time quickly.**

## Alternatives

- **Reduce scope instead of quality** — almost always better: deliver less, done well.
- **Isolate the shortcut** — concentrate the cut in a disposable module, so that undoing it is
  local.
- **Explicit prototype** — code marked as disposable, which does not go into production.
- **Negotiate the date** — the option nobody wants and that is frequently the right one.

The first is the most underused: under a deadline, cutting functionality is reversible and
cutting quality is not.

## Trade-offs

| Speed | Quality |
|---|---|
| Ships now | Sustains the pace |
| Cost per week until undone | Cost now |
| Reversible if short | Hard to recover later |
| Learns faster | Errs less |

| Cut scope | Cut quality |
|---|---|
| Reversible | Compound cost |
| Hard conversation with the business | Conversation avoided |
| Ships less | Ships fragile |

## Failure Modes

**Shortcut with no deadline.** Becomes permanent.

**Repeated shortcut.** Erosion by the name of a decision.

**Cut in an untouchable category.** Incident instead of rework.

**Quality as a numeric target.** High coverage and useless tests.

**Fear of touching.** The symptom that precedes the metrics.

**Eroded base.** The team cannot accelerate even by cutting more.

## Common Mistakes

**Not recording the shortcut** as a decision, with a date.

**Not estimating the cost per week.**

**Cutting observability** — and losing the ability to see the effect.

**Confusing a practice that returns time** with a quality cost.

**Not considering cutting scope** before cutting quality.

## Real-World Example

A digital insurance company shipped its main product in five months, with conscious shortcuts
recorded in a list internally called "the starting-line debt": 23 items, each with a
description, an estimated cost to undo and a deadline.

Eighteen months later, a review of the list:

```text
items undone on schedule                      6
undone late                                    4
not undone, still on the list                  9
not undone and removed from the list
  for having become "how the system is"        4
```

The 4 removed were the most expensive. One of them — the absence of a boundary between the
policy module and the claims module — had an estimated cost to undo of two weeks at the
starting line. Re-estimated at 18 months: **four months**.

The cost-per-week measurement, done retroactively based on change time per area:

```text
areas with no pending shortcut     average change time   1.0× (baseline)
areas with an undone shortcut      1.1×
areas with a pending shortcut      2.4×
the boundary shortcut's area       4.1×
```

And the data point that changed the policy: the change failure rate in areas with a pending
shortcut was 18%, against 4% in the others. The shortcut was not only costing time — it was
producing incidents.

The reading the team takes from it: **A deadline with a consequence.** Every recorded shortcut
has a date. Once the date passes without it being undone, the item becomes a mandatory
prioritization topic with product — not an engineering topic.

**Cost per week estimated** at the moment of recording, and re-estimated every quarter. The
re-estimation is what makes the debt visible: an item that doubles in cost in six months starts
competing for priority with new functionality.

**Four untouchable categories** declared: security, data migration, published format and
observability. A shortcut in those areas requires explicit approval, and in 18 months none was
requested.

**Cut scope before cutting quality** as a rule in deadline negotiation. Of the 11 cases of date
pressure in the following year, 7 were resolved by reducing scope.

**Nothing is removed from the list without being undone.** The 4 items that had become "how the
system is" went back on the list, with the cost re-estimated.

Two years later:

```text
items on the list                          14 (of 23 + 19 new = 42 recorded)
average time to undo                       4.2 months
ratio of change time between areas
  with and without a shortcut              1.6× (against 2.4×)
change failure rate, aggregated            from 11% to 5%
delivery frequency                         +40%
```

The last pair of numbers is what the team uses to explain the topic internally: the failure rate
fell and the delivery frequency rose, at the same time. On a two-year horizon, the two were not
opposites.

The lesson that stuck: the 23 shortcuts at the starting line were a good decision — the product
needed to exist in five months. The error was not re-estimating their cost, which made the four
most expensive ones stop looking like debt and start looking like architecture.

## Related Concepts

- [Technical Debt](/01-fundamentals/technical-debt.md).
- [Cost vs. Reliability](/20-trade-offs/cost-vs-reliability.md).
- [Continuous Delivery](/14-devops-and-platform/ci-cd.md) — the quality that returns time.
- [Simplicity vs. Flexibility](/20-trade-offs/simplicity-vs-flexibility.md).

## Practical Exercise

List your system's known shortcuts and, for each, estimate the cost of undoing it today and the
estimated cost when it was taken.

The ratio between the two numbers is the interest rate your organization pays without recording
it.

## Interview Questions

- Why does this trade-off change sign with the time horizon?
- What separates a deliberate shortcut from erosion, if the code is identical?
- Why is cutting scope preferable to cutting quality under deadline pressure?

## Further Reading

- Forsgren, Nicole et al. *Accelerate*. IT Revolution, 2018.
- Fowler, Martin. *Is High Quality Software Worth the Cost?*. martinfowler.com, 2019.
- Cunningham, Ward. *The WyCash Portfolio Management System*. OOPSLA, 1992.

---
id: rebuilding
title: Rebuilding
sidebar_position: 7
description: Writing it again — the most expensive, riskiest strategy, and the one chosen by reflex.
doc_type: concept
level: 6
difficulty: advanced
status: complete
objective: >
  By the end, the reader recognizes the few conditions that justify rebuilding and the
  structural reasons rewrites fail.
prerequisites: [migration-strategies]
related: [migration-strategies, legacy-refactoring, strangler-fig]
canonical_for: []
translated_from_version: 1
last_reviewed: 2026-08-31
---

# Rebuilding

## Overview

Rebuilding is writing the system again, with the same scope, in a new technology or with
a new model.

It is the most expensive, riskiest strategy, and the one that takes longest to deliver
value. And it is frequently chosen by reflex, without the alternatives being assessed.

It is justified under specific conditions. Outside them, it produces the familiar
pattern: years of work, a new system that does less than the old one, and a project that
has consumed the support it had.

## Problem

Rewrites fail for structural reasons, not from incompetence:

**Moving target.** The old system keeps evolving. The new one chases something that
changes — and every feature added to the old one increases the distance.

**Embedded knowledge.** The old code contains rules nobody documented, accumulated over
years of operation. See
[legacy systems](/16-legacy-modernization/legacy-systems.md).

**Value at the end.** Nothing is delivered until the switchover. A two-year project
consumes support for 24 months with no result to show.

**Scope that grows.** "Since we're rewriting it, let's take the opportunity to..." — and
the new one's scope exceeds the old one's.

None of those is avoidable through effort. They are properties of the approach.

## Core Concepts

### When rebuilding is justified

Being restrictive, because the list is short:

```text
the domain model is wrong        the business changed; the model reflects the old one
the technology blocks the requirement  and there is no migration path
the system is small              weeks, not years
the behavior has to change       reproducing the current one is not the goal
there is no way to intercept     strangler fig is not viable
```

The first is the most legitimate and the rarest. Refactoring improves the structure of a
model; it does not fix a model that represents the wrong business.

And the third deserves attention: a system you can rewrite in six weeks doesn't have the
problems described here. This discussion applies to large systems.

### The second system is the dangerous one

A known effect: whoever rewrites tends to include everything they wish they had done the
first time.

```text
the old one has 40 features
the new one will have the 40, plus 15 improvements, plus the ideal architecture
```

The result is a system with a larger scope than the original, built under the pressure of
replacing something that works.

The control: **strict parity as the first objective**. The new one does what the old one
does, and nothing more. Improvements come after the old one is shut down.

That is unpopular and it is what makes the project executable.

### Parity is harder than it looks

Reproducing the old system's behavior requires knowing it — and it is not documented.

The path that works:

```text
characterization tests over the old one   capture the real behavior
the new one is validated against them     not against the specification
comparison in production                  both process it, the results are compared
```

See [legacy refactoring](/16-legacy-modernization/legacy-refactoring.md) and
[shadow deployment](/14-devops-and-platform/deployment-strategies.md).

Comparison in production is the strongest control: the new one processes the same
traffic, without responding to the user, and the divergences point to where it differs.

Without that, parity is an assumption — verified when the new one goes into production and
someone complains.

### Rebuilding does not exempt you from strangler fig

A common mistake: assuming that rebuilding means building everything and switching all at
once.

The two are independent. It is possible — and almost always better — to rebuild
**incrementally**, with the new one taking over features gradually. See
[strangler fig](/16-legacy-modernization/strangler-fig.md).

That removes the most damaging property of a rewrite: value concentrated at the end.

A rewrite with a single switchover is justified only when there is no possible
interception point.

### The old system has to be frozen

If the old one keeps receiving features during the rebuild, the new one never catches up.

```text
freeze the old one   new features go to the new one, or wait
don't freeze         the new one chases a target that moves
```

Freezing has a business cost, and it has to be negotiated beforehand — not discovered
midway.

Where freezing is not possible, strangling is the answer: new features are built in the
new system from the start.

### The timeline is what kills it

Rebuilds of large systems take years. And years are longer than organizational support
usually lasts. See
[organizational constraints](/16-legacy-modernization/organizational-constraints.md).

The honest check before starting: **does this project survive the sponsor leaving, a
shift in priority, and two budget cycles?**

If the answer is no, the approach has to be different — or the project will be
interrupted halfway.

## Mental Model

**Rebuilding is the last option.** It is justified when the model is wrong, and it fails
for reasons effort does not resolve.

## When to Use

- The domain model no longer represents the business.
- The system is small enough to take weeks.
- The behavior has to change, not be reproduced.
- There is no interception point for strangling.
- The other strategies were assessed and don't solve it.

## When Not to Use

**By reflex**, without assessing refactoring, replatforming and replacing.

**With a scope larger than the old system's.**

**Without freezing the old one** or using strangling.

**Without characterization tests** to validate parity.

**In a large system, with a single switchover.**

**When the timeline exceeds the likely duration of support.**

## Alternatives

- **[Refactoring](/16-legacy-modernization/legacy-refactoring.md)** — when the model is right.
- **[Strangler Fig](/16-legacy-modernization/strangler-fig.md)** — rebuild incrementally.
- **[Replatforming](/16-legacy-modernization/replatforming.md)** — when the problem is the infrastructure.
- **[Replacing](/16-legacy-modernization/replacing.md)** — when there is an off-the-shelf product.
- **Rebuild only the part with the wrong model** — frequently the correct answer.

The last one deserves emphasis: systems rarely have the entire model wrong. See
[migration strategies](/16-legacy-modernization/migration-strategies.md).

## Trade-offs

| Rebuild | Refactor |
|---|---|
| New model | Kept |
| Embedded knowledge lost | Preserved |
| Value at the end | Continuous |
| High cost | Incremental |
| New technology | Kept |

| With strangler fig | Single switchover |
|---|---|
| Value early | At the end |
| Coexistence | None |
| Reversible per slice | A single event |

## Failure Modes

**Moving target.** The old one evolves faster.

**Grown scope.** The new one does more than the old one, and never finishes.

**Parity not achieved.** The new one goes into production doing less.

**Knowledge lost.** Rules nobody knew existed.

**Support exhausted.** Interrupted halfway.

**A single switchover failing.** The cutover event goes wrong, and going back is
expensive.

## Common Mistakes

**Not assessing the alternatives.**

**Not imposing strict parity.**

**Not freezing the old one.**

**Not writing characterization tests.**

**Rebuilding with a single switchover** in a large system.

**Rebuilding the whole system** when the wrong model is in one part.

## Real-World Example

A financial services company rewrote its investment management system — 12 years old,
200,000 lines.

The project was approved with an estimate of 18 months and a scope of parity.

What happened:

**Scope grew in month 3.** The product area asked for improvements that "would be easy
since we're rewriting it". Twenty-three new features came in.

**The old one was not frozen.** It received 14 regulatory changes over two years —
mandatory, non-negotiable. Each one had to be made twice.

**Parity not verified.** There were no characterization tests. Validation was against a
specification written at the start of the project, describing what people believed the
system did.

**Single switchover in month 31.** The cutover was done over a weekend, with rollback
planned.

On Monday, 40 problems were reported. Twenty-eight were behaviors of the old system that
were not in the specification — return calculation rules, corporate action handling,
rounding specific to each fund type.

Rollback was triggered on the third day. The old system came back, and the project was
suspended for four months.

The restart changed the approach:

**Characterization tests** written over the old system. There were 1,100 cases, and they
revealed 60 behaviors the specification did not contain.

**Comparison in production.** The new system started processing the same traffic in
parallel, without responding, with automated comparison. Over five months, that found 130
divergences.

**Strangling** replacing the single switchover. Features migrated one at a time, with
rollback per feature.

**Scope returned to parity.** The 23 improvements were deferred until after the shutdown —
and, when it came, 15 of them were no longer wanted.

The old system was shut down in month 47 — 29 months beyond the original estimate.

What the team records: the decision to rebuild was defensible; the data model genuinely
did not support the products the business wanted to launch. What cost 29 additional
months were the three execution decisions: grown scope, the old one not frozen, and
parity not verified.

## Related Concepts

- [Migration Strategies](/16-legacy-modernization/migration-strategies.md) — the alternatives.
- [Strangler Fig](/16-legacy-modernization/strangler-fig.md) — rebuilding incrementally.
- [Legacy Systems](/16-legacy-modernization/legacy-systems.md) — the embedded knowledge.
- [Organizational Constraints](/16-legacy-modernization/organizational-constraints.md).

## Practical Exercise

If you are considering rebuilding a system, write down what it does — completely.

Then compare that with characterization tests over the real behavior. The difference
between the two lists is what a rewrite would lose.

## Interview Questions

- Why do rewrites fail for structural reasons?
- What is the second-system effect, and how do you control it?
- Why does rebuilding not exempt you from strangler fig?

## Further Reading

- Brooks, Frederick. *The Mythical Man-Month*. Addison-Wesley, 1975 — the second system.
- Spolsky, Joel. *Things You Should Never Do*, 2000.
- Feathers, Michael. *Working Effectively with Legacy Code*. Prentice Hall, 2004.

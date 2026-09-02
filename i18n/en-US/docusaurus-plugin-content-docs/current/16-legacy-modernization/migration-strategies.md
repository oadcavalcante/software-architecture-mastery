---
id: migration-strategies
title: Migration Strategies
sidebar_position: 9
description: Replatform, refactor, rebuild, replace — and the criterion that chooses between them.
doc_type: tradeoff
level: 6
difficulty: advanced
status: complete
objective: >
  By the end, the reader chooses the strategy from the problem, and recognizes that the
  answer is frequently a combination.
prerequisites: [modernization-drivers]
related: [replatforming, legacy-refactoring, rebuilding, replacing, strangler-fig]
canonical_for: []
translated_from_version: 2
last_reviewed: 2026-08-31
---

# Migration Strategies

## Overview

Faced with a system that has to change, there are four paths:

```text
replatform  move to new infrastructure, without changing the application
refactor    improve the internal structure, keeping the behavior
rebuild     write it again, with the same scope
replace     swap it for an off-the-shelf product
```

And a fifth, frequently correct and rarely considered: **do nothing**.

The choice comes from the problem, not from preference. Each strategy solves one type of
limitation and is waste for the others.

## Problem

Discussion about modernization usually jumps straight to a strategy — normally rebuilding
— without passing through the diagnosis.

```text
"let's rewrite it"        when the problem was the infrastructure
"let's move to the cloud" when the problem was the data model
"let's buy it"            when the capability is differentiating
```

Each of those spends a lot to not solve the real problem. See
[modernization drivers](/16-legacy-modernization/modernization-drivers.md).

## Core Concepts

### The criterion: where the problem is

```text
problem                            →  strategy
expensive or obsolete infrastructure  replatform
code that is hard to change           refactor
wrong domain model                    rebuild
non-differentiating capability        replace
nothing is actually limiting           do nothing
```

See [replatforming](/16-legacy-modernization/replatforming.md), [refactoring](/16-legacy-modernization/legacy-refactoring.md),
[rebuilding](/16-legacy-modernization/rebuilding.md) and [replacing](/16-legacy-modernization/replacing.md).

The middle line is the one that confuses most: code that is hard to change is frequently
treated as a case for rebuilding, when incremental refactoring solves it for a fraction
of the cost.

The test that separates the two: **is the domain model right?** If the entities and the
rules make sense and the problem is how the code is organized, refactor. If the model
itself is wrong — it reflects a business that no longer exists — rebuilding is justified.

### Cost and risk grow in that order

The first three columns are about **execution**: what each strategy charges to be carried out. The last one
is about outcome.

```text
                cost     risk     time        value delivered
                of exec. of exec. of exec.
do nothing      zero     zero     zero        zero
replatform      low      low      months      infrastructure
refactor        medium   low      continuous  speed
replace         medium   medium   months      capability ready
rebuild         high     high     years       everything, at the end
```

The last line explains why rebuilding is so frequently the wrong choice: it is the most
expensive, the riskiest, and the slowest to deliver.

It is justified when the others don't solve the problem — and that check is rarely made.

### The answer is usually a combination

Real systems are not homogeneous. Different parts have different problems:

```text
the calculation engine       wrong model            → rebuild
the master records           work well               → keep
the partner integration      old infrastructure      → replatform
the reports                  common capability       → replace
```

See [incremental modernization](/16-legacy-modernization/incremental-modernization.md).

Deciding by whole system is what produces projects that are too large. Deciding by part
produces a plan with scope proportional to the problem.

### Replatforming first is frequently smart

Moving to modern infrastructure, without touching the application, is fast and unblocks
things:

```text
automated pipeline
reproducible environments
observability
more frequent deployment
```

That reduces the cost of everything that comes after — including rebuilding, if that is
the case.

And it delivers value early, which sustains support for the longer work. See
[organizational constraints](/16-legacy-modernization/organizational-constraints.md).

### Replacing requires evaluating the boundary

An off-the-shelf product brings the vendor's boundary, which rarely coincides with the
organization's domain.

See [application architecture](/15-enterprise-architecture/application-architecture.md)
and [SaaS](/09-cloud-architecture/saas.md).

That produces two situations that have to be assessed beforehand: the product does more
than needed — and the duplication has to be resolved — or it does less, and the rest has
to be built around it.

And there is the differentiation criterion: replacing a differentiating capability with a
product competitors also use eliminates the differentiation. See
[business capabilities](/15-enterprise-architecture/business-capabilities.md).

### Doing nothing has to be assessed explicitly

It is the only strategy with no execution cost, and it rarely enters the comparison.

What the table above does **not** show, because it measures execution, is that doing nothing has costs and
risks of its own — continuous, and therefore invisible. See [what drives
modernization](/16-legacy-modernization/modernization-drivers.md), where that cost is the calculation that
decides. Zero in the execution column is not zero in the comparison.

```text
makes sense   the system serves, it is stable, nobody needs to change it
              the cost of any strategy exceeds the cost of living with it
              the system will be discontinued for another reason soon
```

What makes it a decision, and not an omission: recording it, with the reasons and a
review deadline. See
[modernization drivers](/16-legacy-modernization/modernization-drivers.md).

### The strategy may change during execution

A decision made at the start, with the information available then, may turn out to be
wrong as the system is understood.

```text
started refactoring     and found the model was wrong    → rebuild
started rebuilding      and found the model was right    → refactor
started replacing       and found a large functional gap → build
```

The second is the most painful and the most common: the rebuild starts, and the
archaeology reveals that the old model was correct — the problem was how the code was
organized.

Changing strategy midway is expensive and is frequently the right decision. What prevents
it is public commitment to the initial approach, which turns the change into an admission
of error.

What makes it easier: treating the choice as a revisable hypothesis from the start, with
defined reassessment points — typically after the first slice, when understanding of the
system is qualitatively greater. See
[incremental modernization](/16-legacy-modernization/incremental-modernization.md).

## Mental Model

**The strategy comes from the problem.** Rebuilding is the most expensive and the
riskiest, and it is the default choice by reflex.

## When to Use

- **Replatform:** obsolete or expensive infrastructure, acceptable application.
- **Refactor:** code that is hard to change, correct model.
- **Rebuild:** wrong domain model, and the others don't solve it.
- **Replace:** non-differentiating capability with a mature product available.
- **Do nothing:** the system serves and nothing is limited by it.

## When Not to Use

**Rebuilding by reflex**, without checking the alternatives.

**Deciding by whole system** when the parts have different problems.

**Replacing a differentiating capability.** Swapping what distinguishes the company for an off-the-shelf product levels the process down to the competitor's — and the customization to recover the difference tends to cancel out the benefit — and, when it is extensive
enough to rebuild the rule inside the product, it comes out more expensive than having built.

**Replatforming and stopping there**, when the problem was something else.

**Refactoring when the model is wrong** — it improves the structure of something that
should not exist in that form.

**Without assessing doing nothing**, which is the only alternative with zero execution cost. Skipping that
assessment makes the comparison start out biased: every remaining option costs something, so the cheapest of
them looks like the right choice even when none of them pays off.

## Alternatives

Beyond the five, three intermediate approaches:

- **Containment** — isolate the legacy system with a translation layer, so it does not
  limit its surroundings. See
  [anti-corruption layer](/08-integration-architecture/integration-anti-corruption.md).
- **Freeze** — the system stops evolving; new functionality is built outside it.
- **Encapsulate** — expose the legacy system through a modern interface, without changing
  it.

All three buy time at low cost, and are appropriate when the motive does not justify a
larger investment.

## Trade-offs

| Rebuild | Refactor |
|---|---|
| New model | Model kept |
| Concentrated cost | Spread-out cost |
| Value at the end | Continuous |
| Embedded knowledge lost | Preserved |
| High risk | Low |

| Replace | Build |
|---|---|
| Available fast | Months |
| Vendor's boundary | Your own |
| No differentiation | Possible |
| Dependency | Control |

## Failure Modes

**Rebuilding what should have been refactored.** When the model is right and only the code is bad, rebuilding throws away rules that work and pays the full risk of the rewrite.

**Refactoring what has a wrong model.** Refactoring improves the code's structure on top of the same data model. If the model is the cause, the result is clean code with the problem intact.

**The right strategy, applied too late.** The decision was good when it was made, and the system changed
during execution — what was going to be refactored gained a requirement the model does not support. Nobody
revisits the strategy midway, because revisiting looks like backing down.

**A migration that never ends.** The new system serves the main cases, the old one serves the rest, and both
stay. The cost of keeping two is smaller than the cost of finishing, month by month, and larger in
aggregate — but the comparison is never made over that horizon.

**A gain consumed by coexistence.** The strangling works, and the layer routing between old and new becomes
permanent, with rules of its own. The system has three parts where it had one.

**Knowledge that leaves with the system.** The rebuild copies the observable behavior and loses the rules
nobody knew were there — discovered one at a time, in production, through customer complaints.

**Not considering doing nothing.** A stable, cheap system nobody needs to change generates no return from being modernized — and it is the option that almost never enters the comparison.

## Common Mistakes

**Choosing the strategy before the diagnosis.** The strategy is a consequence of the problem — bad code, wrong model, expensive platform. Chosen beforehand, it solves the problem that didn't exist.

**Assuming the system is homogeneous.** Different parts of the same system call for different strategies; treating everything the same wastes effort on what was fine and under-scopes what was not.

**Not assessing replatforming as a first step.** It is frequently cheap, reduces operating cost immediately and buys time to decide the rest calmly.

**Not checking the product's boundary** when replacing. If the off-the-shelf product doesn't cover exactly the capability, what's left over becomes customization — and, past a certain point, it eats the gain that motivated the purchase. See [replacing](/16-legacy-modernization/replacing.md).

**Not recording the decision not to act.** Without a record, the same proposal comes back every year and the analysis is redone from scratch, with the same result.

## Real-World Example

A retail company had a 14-year-old inventory management system, with a proposal for a
complete rebuild — estimated at 24 months.

The per-part diagnosis, done before approval, decomposed the system:

```text
component              problem                          strategy
replenishment engine   outdated algorithm,              rebuild
                       model doesn't support omnichannel
product records        works well, stable               keep
stock movement         tangled code, model is fine      refactor
reports                common capability                replace
integrations           old infrastructure               replatform
operations UI          works, ugly                      keep
```

Only one of the six components justified a rebuild — and it was the one causing the
business limitation: the company could not operate unified inventory across store and
e-commerce.

The plan as executed:

**Replatform the integrations first** — two months. It unblocked the pipeline,
observability and frequent deployment, which reduced the cost of everything else.

**Replace reports** with an off-the-shelf product — three months, with the team freed up.

**Rebuild the replenishment engine** — nine months, with
[strangling](/16-legacy-modernization/strangler-fig.md). The unified
inventory capability launched in month 11.

**Refactor stock movement** incrementally, over two years, alongside the product changes
that touched it.

**Records and UI kept.** No problem, no investment.

The directed work added up to 14 team-months — two of replatforming, three of replacing, nine of rebuilding
— against the 24 estimated for the full rebuild: about 60%. Refactoring stock movement does not enter that
count because it was absorbed by the product changes that already touched that code, and that is precisely
why it was chosen.

And the business capability that motivated all of it shipped in month 11, instead of month 24.

And one recorded decision: the product records were assessed and the decision not to
touch them was documented, with annual review. Two years later, it still holds.

What the team learned: the original proposal was not technically wrong — rebuilding the
whole system would produce a better system. It was wrong in scope, because it treated as
homogeneous a system whose parts had completely different problems.

## Related Concepts

- [Replatforming](/16-legacy-modernization/replatforming.md), [Refactoring](/16-legacy-modernization/legacy-refactoring.md),
  [Rebuilding](/16-legacy-modernization/rebuilding.md), [Replacing](/16-legacy-modernization/replacing.md).
- [Modernization Drivers](/16-legacy-modernization/modernization-drivers.md) — the diagnosis.
- [Incremental Modernization](/16-legacy-modernization/incremental-modernization.md).

## Practical Exercise

Take a system that is a modernization candidate and decompose it into components,
assigning a strategy to each one.

If they all get the same strategy, the decomposition probably wasn't done rigorously
enough.

## Interview Questions

- What criterion separates refactoring from rebuilding?
- Why is replatforming first usually smart?
- Why does deciding by whole system produce projects that are too large?

## Further Reading

- Newman, Sam. *Monolith to Microservices*. O'Reilly, 2019.
- Feathers, Michael. *Working Effectively with Legacy Code*. Prentice Hall, 2004.
- Watson, Richard. *Migrating Applications to the Cloud: Rehost, Refactor, Revise, Rebuild, or Replace?*
  Gartner, 2011 — the five original options, which later publications expanded to seven.

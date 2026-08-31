---
id: technical-strategy
title: Technical Strategy
sidebar_position: 15
description: Choosing where not to invest — and why a strategy without sacrifice isn't strategy.
doc_type: concept
level: 6
difficulty: advanced
status: complete
objective: >
  By the end, the reader formulates technical strategy with a diagnosis, choices and
  explicit trade-offs given up.
prerequisites: [enterprise-architecture]
related: [target-architecture, architecture-roadmaps, business-capabilities]
canonical_for: []
content_version: 1
translated_from_version: 1
last_reviewed: 2026-08-31
---

# Technical Strategy

## Overview

Technical strategy is the choice of **where the organization will concentrate technical
effort** — and, necessarily, where it will not.

The second part is what distinguishes strategy from a list of intentions. A document that
enumerates everything that would be good to do guides nothing, because it doesn't help
decide what to stop doing.

And a good strategy has three parts: a **diagnosis** of the problem, a guiding **policy**,
and **coherent actions** that execute it.

## Problem

The typical technical strategy document is a list of aspirations:

```text
"improve quality"
"modernize legacy systems"
"adopt cloud native"
"increase delivery speed"
"strengthen security"
```

Five sentences nobody disagrees with, with no priority among them, with no indication of
what is left out.

Faced with a concrete decision — invest in modernizing system A or in improving the
pipeline? — the document doesn't help, because both are on the list.

## Core Concepts

### The three parts

```text
diagnosis  what the central problem is, stated precisely
policy     the approach chosen to confront it
actions    the coherent set of things that execute the policy
```

The first is the one usually missing. Strategies that start from the actions — "we're
going to adopt microservices" — skip the question of what problem that solves.

And the diagnosis has to be **specific**:

```text
vague     "our systems are legacy"
specific  "our differentiating capability — pricing — is supported by a
           system one person maintains, and changes to it take three months.
           That limits our ability to respond to competitors."
```

The second points at the action. The first does not.

### Strategy is choosing what not to do

A strategy with nothing explicitly given up is not a strategy — it is a wish list.

```text
"we will invest in X, and therefore we will not invest in Y this cycle"
```

The second half is what gives the first its power. Without it, the investment dilutes and
nothing advances enough to matter.

And what is given up has to be **named**. "We will not modernize the supporting systems
over the next 18 months" is a decision someone will contest — and that is exactly why it
has to be written down.

See [business capabilities](/15-enterprise-architecture/business-capabilities.md) — classification by
differentiation is the criterion that sustains giving something up.

### Coherence among the actions

Coherent actions reinforce each other:

```text
coherent     invest in the platform + reduce supported technologies
             + standardize observability
             → each one makes the others easier
incoherent   invest in the platform + give total technology autonomy
             → one cancels the other
```

The test: do the chosen actions help each other, or compete for resources and contradict
each other?

A list of good initiatives with no coherence among them disperses effort — and it is the
most common result of strategies built by aggregating each area's requests.

### Technical strategy serves business strategy

It is not independent. The question that anchors it:

```text
what does the business need to be able to do over the next two years?
what in the technology prevents or limits that?
```

A technical strategy derived from engineering preferences — "we want to modernize because
the technology is old" — cannot compete for budget, and it shouldn't.

The one that holds up connects explicitly: **this technical limitation prevents this
business capability, which is worth this much.**

### Bets, not certainties

Strategy involves uncertainty. Framing it as a bet is more honest and more useful:

```text
we believe that X
if we are right, Y happens
we will know in Z months, by observing W
```

That allows revision based on evidence, instead of defending the position. And it makes
explicit what has to be true — which is usually what turns out to be wrong when the
strategy fails.

See [architecture decisions](/18-architecture-decisions/index.md).

### The horizon and the review

```text
12 to 24 months     the usual horizon of a technical strategy
biannual review     with evidence of what was learned
change without blame if the diagnosis was wrong, changing is the right move
```

Strategies defended after the evidence has changed are the most expensive failure mode:
the cost of persisting grows, and the cost of admitting grows with it.

### The strategy has to survive the absence of whoever wrote it

A test that reveals whether it was communicated or merely published: can the people who
make decisions state it?

```text
communicated   engineers can say where the organization is betting
published      there is a document few have read
```

What makes the difference is not the document, it is repetition in context: the strategy
cited when a decision is made, when a priority is set, when something is refused.

And there is a clear sign that it didn't stick: when local decisions contradict the
strategy without anyone noticing. That is not disobedience — it is evidence that the
connection between the strategy and everyday work was never made.

The practice that fixes it is modest: include in the strategy, for each bet, **what
changes in the day-to-day work of whoever builds**. A bet that changes no concrete
decision is probably not a bet — it is an intention.

### The strategy has to say what to do with what is already underway

A common gap: the strategy defines the future and doesn't address the present.

At the moment it is published, there are initiatives in flight — some aligned, some not.
Ignoring them produces two parallel realities.

```text
aligned and underway      continues, with reinforced priority
misaligned and advanced   evaluate: finish or stop, with what was already spent
                          treated as lost
misaligned and early      stop
not started and misaligned don't start
```

The second line is the hard one, and the characteristic mistake is letting the initiative
continue "because we've already invested" — which is sunk-cost reasoning.

The correct criterion ignores what was already spent: **from here forward, is this
investment the best use of the resource?**

Making those decisions explicitly, at the moment of publication, is what keeps the
strategy from coexisting with a body of work that contradicts it.

## Mental Model

**Strategy is diagnosis, policy and what you give up.** If nothing was discarded, nothing
was chosen.

## When to Use

- When technical investment needs to be prioritized.
- Before multi-year programs.
- When there is recurring tension between initiatives.
- To connect technical decisions to business objectives.
- After changes in business strategy.

## When Not to Use

**As a list of aspirations.** "Be more agile and more secure" eliminates no option, so it guides no choice at all.

**Without a specific diagnosis.** Strategy starts by naming the real obstacle. Without that, the actions are activities that connect to nothing.

**Without named trade-offs given up.** A strategy that doesn't say what will not be done is a wish list, and each area keeps assuming its priority is included.

**Derived only from engineering preferences.** Without an anchor in what the company needs, it optimizes for technical purity — which is rarely the dominant risk.

**With actions that are incoherent with each other.** Actions that cancel each other consume capacity and move nothing. Coherence among them is what distinguishes a strategy from a portfolio of initiatives.

**Without review against evidence.** With no indicators saying whether the diagnosis still holds, the strategy outlives the context that justified it.

## Alternatives

- **Principles** — they guide decisions without setting investment priority. See
  [enterprise principles](/15-enterprise-architecture/enterprise-principles.md).
- **Roadmap** — what to do and when, without the why. See
  [architecture roadmaps](/15-enterprise-architecture/architecture-roadmaps.md).
- **Target architecture** — the desired state, without the choice of where to invest. See
  [target architecture](/15-enterprise-architecture/target-architecture.md).

The three are complementary: the strategy says why and where; the target, toward what;
the roadmap, when.

## Trade-offs

| Focus on few bets | Distributed investment |
|---|---|
| Real progress where it matters | Marginal progress everywhere |
| Unhappy areas | Nobody upset |
| Concentrated risk | Diluted |

| Two-year horizon | Six-month |
|---|---|
| Allows structural changes | Actionable |
| More uncertainty | Less ambition |

## Failure Modes

**A list of aspirations.** Nothing is prioritized.

**A vague diagnosis.** It points at no action.

**Nothing given up.** The effort dilutes.

**Incoherent actions.** Initiatives that cancel each other.

**Disconnected from the business.** It doesn't sustain a budget.

**Defended after the evidence changed.**

## Common Mistakes

**Starting from the actions.**

**Not naming what is left out.**

**Aggregating each area's requests** instead of choosing.

**Not connecting to business objectives.**

**Not framing it as a verifiable bet.**

**Not reviewing.**

## Real-World Example

An insurance company had an 18-page technical strategy document, with nine workstreams.

The engineering budget was distributed across the nine. At the end of two years:

```text
completed workstreams        0
workstreams with progress    9  — all partial
abandoned workstreams        3  — the progress was lost
```

None had advanced far enough to produce a result.

The rework started from a specific diagnosis, built with the executive team:

```text
the business needs to launch new products in weeks, not months.
today it takes 4 to 7 months.
what limits it: every product change requires a change in the pricing system,
which is monolithic, has one maintainer and a quarterly release.
```

That pointed at one workstream, not nine.

The chosen policy: **invest in making pricing configurable and independent**, with three
coherent actions:

```text
1. extract pricing from the monolith, with an independent release
2. a configurable product model, with no code change for new products
3. knowledge transfer — from one to four maintainers
```

And what was given up, named explicitly:

```text
we will not modernize the supporting systems over the next 18 months
we will not adopt the container platform this cycle
we will not invest in reducing infrastructure cost
```

All three were contested, and writing them explicitly let the discussion happen once,
with the executive team, instead of every quarter.

Framed as a bet:

```text
we believe pricing is the bottleneck
if we are right, launch time drops to under 6 weeks
we will know in 12 months, by observing the time of the next launches
```

After 14 months, launch time was at 5 weeks. The bet was confirmed.

And what was given up had a cost: two supporting systems degraded, and an infrastructure
cost incident consumed attention. Both were treated as an accepted consequence, not as a
planning failure.

What the team learned: the previous nine workstreams had been built by aggregating each
area's request. None of them was wrong. The error was not choosing.

## Related Concepts

- [Target Architecture](/15-enterprise-architecture/target-architecture.md) — toward what.
- [Architecture Roadmaps](/15-enterprise-architecture/architecture-roadmaps.md) — when.
- [Business Capabilities](/15-enterprise-architecture/business-capabilities.md) — the criterion for focus.
- [Enterprise Principles](/15-enterprise-architecture/enterprise-principles.md).

## Practical Exercise

Take your organization's technical strategy and look for what it gives up: what does it
say explicitly will not be done?

If there is nothing, it is a list of intentions.

## Interview Questions

- What are the three parts of a strategy?
- Why is what you give up what gives the choice its power?
- Why does framing it as a bet help with review?

## Further Reading

- Rumelt, Richard. *Good Strategy Bad Strategy*. Crown Business, 2011.
- Ross, Jeanne et al. *Enterprise Architecture as Strategy*. HBS Press, 2006.
- Hohpe, Gregor. *The Software Architect Elevator*. O'Reilly, 2020.

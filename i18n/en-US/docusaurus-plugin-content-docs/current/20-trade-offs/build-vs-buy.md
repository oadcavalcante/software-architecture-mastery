---
id: build-vs-buy
title: Build vs. Buy
sidebar_position: 11
description: Building costs what nobody budgets — and the math only closes when headcount enters it.
doc_type: tradeoff
level: 5
difficulty: intermediate
status: complete
objective: >
  By the end, the reader compares building and buying with total cost, including headcount and
  maintenance, and decides by differentiating capability.
prerequisites: [saas]
related: [managed-vs-self-hosted, cost-vs-reliability, centralization-vs-decentralization]
canonical_for: []
translated_from_version: 1
last_reviewed: 2026-08-31
---

# Build vs. Buy

## Overview

The decision looks financial and is strategic:

```text
real axis   does this capability differentiate the business, and is the total cost
            of building and maintaining it lower than that of buying it?
```

The two halves err in opposite directions. The first is overestimated — teams consider
differentiating capabilities the market has solved for years. The second is underestimated —
the cost of building systematically omits the most expensive item: **headcount, forever**.

The aggregate result is a strong bias in favor of building, which appears consistently in
retrospective reviews.

## Problem

The typical comparison:

```text
market solution   $2,800/month in licenses
build             $800/month in infrastructure, "plus some engineering
                  time"
```

"Some engineering time" is where the decision gets lost. Measured afterwards, it is usually 0.5
to 2 full-time people, permanently — which at market rates exceeds the license by a wide margin.

And there are costs that never even enter the math:

```text
what you do not build while building this
the time until it is ready, and what it costs not to have it during that time
knowledge concentrated in whoever built it
the cost of maintaining it when that person leaves
features the market solution has and ours never will
```

The symmetric error exists: buying a solution for the capability that **is** the product, and
ending up competing with a tool every competitor has.

## Core Concepts

### Differentiating capability

```text
differentiating   the customer notices, and it is a reason to choose you
supporting        necessary, and no customer chooses because of it
commodity         everyone has it, and nobody notices
```

The rule: **build the differentiator, buy the rest**.

Applied honestly, it eliminates most candidates for building:

```text
an insurer's pricing engine                  differentiating
a logistics company's routing algorithm      differentiating
authentication                               commodity
sending email                                commodity
metrics dashboard                            commodity
content management                           almost always supporting
```

And the test is uncomfortable: **has a customer ever chosen you because of it?**

See [generic subdomain](/04-domain-driven-design/generic-domain.md).

### Total cost, with headcount

The comparison must include, on both sides:

```text
build                          buy
initial effort                 license
ongoing maintenance            integration cost
operations and on-call         configuration and customization
upgrades and security          training
concentrated knowledge         vendor dependency
opportunity cost               limits of the tool
```

A rule of thumb that changes many conclusions: **estimate maintenance at 15% to 25% of the
initial effort, per year, indefinitely.**

And convert effort into money. "0.5 engineer" is an abstract number; the corresponding monthly
cost is not, and it is that number that compares with the license.

### The time until it is ready has a cost

```text
buy     available in weeks
build   available in months
```

The interval has an opportunity cost that is rarely added up: what the organization does not do,
and what it costs not to have the capability during the period.

In markets with a window — a regulatory requirement with a date, a competitor advancing — time
can be the dominant factor and make the cost comparison irrelevant.

### The build bias is predictable

It has identifiable causes:

```text
building is more interesting than integrating
the effort of building is visible; the effort of maintaining is not
underestimating scope is systematic
"our need is different" is almost always false at the margin
buying requires a procurement process, which is tedious
```

The last is underestimated as a cause. In organizations with a heavy procurement process, teams
build to avoid six months of negotiation — and the technical decision is decided by
administrative friction.

### Buying is not the end of the decision

```text
integration      can be more expensive than the license
customization    the tool's limits become the product's limits
data             where it lives, how it leaves
dependency       what happens if the vendor changes direction
exit cost        measured before, not after
```

See [vendor lock-in](/09-cloud-architecture/vendor-lock-in.md).

And there is a specific caution: buying something the product will depend on deeply requires
evaluating the vendor's roadmap and the company's health, not only the current functionality.

### Signs of the wrong choice

```text
built and should not have
  a permanent dedicated team on something that is not the product
  requested features that never enter the queue
  comparison with market solutions avoided
  whoever built it became a single point of knowledge
  growing and unbudgeted maintenance cost

bought and should not have
  excessive customization, with code around the tool
  the tool limiting what the product can offer
  competitors with the same solution, with no differentiation
  license cost growing with scale faster than revenue
  essential data outside your control
```

### Cost of changing your mind

```text
buy → build   expensive and slow, and viable: the requirements are known
build → buy   expensive in another way: data migration, resistance from
              whoever built it, in-house features to lose
```

The asymmetry has a relevant human component: abandoning something built in-house meets
resistance that abandoning a license does not. That should weigh on the initial decision — and
it does not.

It favors **buying when in doubt**, with the decision recorded and the reversal condition
explicit: "we will build if the tool blocks X".

## Mental Model

**Build what differentiates; buy the rest.** And always add the headcount cost — it is what
inverts most conclusions.

## When to Use

Build when:

- The capability is a reason customers choose you.
- No market solution meets a central requirement, verified.
- The total cost, with headcount, is lower — with the number computed.
- Control over its evolution is strategic.

Buy when:

- The capability is supporting or commodity.
- The time until it is ready matters.
- The total cost favors it, with headcount counted.
- The team has no experience in the tool's domain.
- There is no appetite to maintain it indefinitely.

## When Not to Use

**Without including headcount cost** in the comparison. Building consumes engineers for years,
not only in the first year — and that is almost always the largest item in the math.

**Without testing whether the capability really differentiates.** The test is direct: would a
customer choose the company because of it? If not, building spends the capacity that would
differentiate on something that does not.

**Building to avoid a procurement process.** The decision starts being made by bureaucracy, not
by merit — and the cost of the procurement friction is paid in years of maintenance.

**Buying what is the product.** Outsourcing the core hands the vendor the pace of evolution of
what the company sells.

**Without evaluating the exit cost** from the vendor. It is what turns a reversible decision into
an irreversible one, and it is the question that must be asked before signing.

## Alternatives

- **Buy and extend** — use the market base and build only the differentiating part on top of it.
- **Open source operated by us** — a middle ground between building and buying, with its own
  operational cost. See [managed vs. self-hosted](/20-trade-offs/managed-vs-self-hosted.md).
- **Buy now, build later** — with the decision recorded and the reversal condition.
- **Build the minimum** — the 10% version that serves the case, without generalizing.

The first is the right answer more often than either extreme, and the one that most requires
discipline not to turn into endless customization.

## Trade-offs

| Build | Buy |
|---|---|
| Fitted to the case | Available fast |
| Control over evolution | Maintenance outsourced |
| Permanent headcount cost | Permanent license cost |
| In-house knowledge | Vendor dependency |
| No tool limits | No cost of maintaining |

| Buy and extend | Build from scratch |
|---|---|
| Base ready | No constraints |
| Vendor's limits | Everything on you |
| Less in-house code | More control |

## Failure Modes

**Headcount cost omitted.** The comparison favors building by construction.

**Supporting capability built.** A permanent team outside the product.

**Building to avoid procurement.** Technical decision by administrative friction.

**Endless customization.** The purchased tool becomes a development project.

**Single point of knowledge.** Whoever built it leaves.

**Exit cost not evaluated.** Discovered when it is time to leave.

## Common Mistakes

**Comparing the license with infrastructure**, without headcount.

**Not applying the "has a customer ever chosen us because of it?" test.**

**Underestimating maintenance** — use 15% to 25% per year.

**Not adding the opportunity cost** of the time until it is ready.

**Not recording the reversal condition.**

## Real-World Example

An e-commerce company decided in 2022 to build its own customer communication platform —
transactional email, notifications and campaigns.

The comparison recorded at the time:

```text
market solution   ~$4,400/month for the forecast volume
build             ~$1,200/month of infrastructure
                  "2 engineers for 4 months" of building
```

What happened:

```text
building                              9 months, 3 engineers
maintenance team afterwards           2 full-time engineers
corresponding headcount cost          ~$18,000/month
real infrastructure cost              ~$1,800/month
features of the market solution
  that were never built               A/B testing, advanced segmentation,
                                      deliverability dashboard, sender
                                      reputation management
email delivery rate                   from 94% to 87% in 18 months,
                                      from insufficient reputation management
```

The delivery rate was the data point that changed the conversation. Seven percentage points of
undelivered emails, over the company's volume, were estimated at about $68,000 per month of
unrealized revenue.

The migration to the market solution took five months and met the expected resistance — the team
that built it defended the platform through three prioritization cycles.

Results one year later:

```text
license cost                          ~$6,200/month (volume higher than forecast)
engineers freed up                    2, reallocated to the recommendation engine
delivery rate                         96%
features available                    all the ones that were never built
```

What the organization changed in its decision process:

**Headcount cost mandatory** in every build-versus-buy comparison, in monetary value and not in
"engineers".

**Maintenance estimated at 20% per year** of the initial effort, by default, and recorded.

**Differentiation test** explicit in the ADR: the question "has a customer ever chosen the
company because of it?" must be answered in writing. Transactional communication clearly failed.

**Simplified procurement process** for tools below a threshold — the investigation had revealed
that two of the four previous build projects existed to avoid the procurement process.

**Reversal condition recorded** in purchases: what would make the company build.

In the following two years, under the new rules:

```text
build-versus-buy evaluations                  22
decisions to build                             4
of the 4, with a positive differentiation test 4
cases in which including the headcount cost
  inverted the initial conclusion              9
```

The 9 inverted cases are the data point the team considers decisive. In all of them, the initial
intuition was to build, and the number changed the decision.

What the team learned: the 2022 build was not badly executed. The platform worked. It merely cost
six times more than the alternative, in a capability where the company would never have an
advantage — and the math that would have shown that took twenty minutes to do.

## Related Concepts

- [SaaS](/09-cloud-architecture/saas.md) and
  [Generic Subdomain](/04-domain-driven-design/generic-domain.md).
- [Managed vs. Self-Hosted](/20-trade-offs/managed-vs-self-hosted.md).
- [Vendor Lock-in](/09-cloud-architecture/vendor-lock-in.md).
- [Cost vs. Reliability](/20-trade-offs/cost-vs-reliability.md).

## Practical Exercise

Pick a component your team built and compute the headcount cost dedicated to it over the last 12
months.

Compare it with the price of the market alternative today. The difference is what the original
decision did not include.

## Interview Questions

- Why does the cost comparison favor building when done the usual way?
- What test decides whether a capability is differentiating?
- Why does the reversal asymmetry favor buying when in doubt?

## Further Reading

- Moore, Geoffrey. *Living on the Fault Line*. HarperBusiness, 2000 — core and context.
- Evans, Eric. *Domain-Driven Design*. Addison-Wesley, 2003.
- Hohpe, Gregor. *The Software Architect Elevator*. O'Reilly, 2020.

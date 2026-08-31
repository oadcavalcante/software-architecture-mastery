---
id: cloud-native-vs-portable
title: Cloud-Native vs. Portable
sidebar_position: 14
description: Portability is insurance paid every month against an event that almost never happens.
doc_type: tradeoff
level: 5
difficulty: advanced
status: complete
objective: >
  By the end, the reader decides how much portability to buy based on the real probability of
  migration and on the exit cost measured per component.
prerequisites: [vendor-lock-in]
related: [managed-vs-self-hosted, build-vs-buy, simplicity-vs-flexibility]
canonical_for: []
translated_from_version: 1
last_reviewed: 2026-08-31
---

# Cloud-Native vs. Portable

## Overview

Using a provider's services deeply delivers speed and capability the portable layer does not
have. Keeping portability preserves the option to change, at the cost of giving up part of that —
every day.

```text
real axis   what is the real probability of migrating, and what is the exit cost
            per component, measured instead of feared?
```

Portability is **insurance**: a premium paid continuously against a rare event. Like any
insurance, it is justified when the premium is low relative to the claim — and not when the fear
is large.

And the premium, unlike that of real insurance, appears on no invoice.

## Problem

The discussion is usually conducted in the abstract:

```text
"we can't be locked into one provider"
```

The sentence is not false and decides nothing. Three numbers are missing:

```text
what is the probability we migrate in the next 5 years?
what would migrating cost today, component by component?
how much does portability cost per month, in speed and unused capability?
```

Without them, the decision is made out of aversion, and the typical result is an architecture that
avoids everything the provider offers at its best — queues, functions, managed databases, identity
— and reimplements worse versions of the same things, to preserve an option that will never be
exercised.

The symmetric error exists and is rarer: deep, unevaluated dependency on a proprietary service
that is later discontinued, has its price changed, or stops meeting a regulatory requirement.

## Core Concepts

### Portability is not binary

It has layers, with very different costs:

```text
layer                      portability   cost of avoiding
containers                 high          low — de facto standard
object storage             high          low — protocols converged
relational database        high          low — managed standard engines
queues and messaging       medium        medium — protocols vary
identity and authorization low           high
serverless functions       low           high
proprietary data and AI
  services                 very low      very high
```

That allows a decision **per component** instead of a global one — and the per-component decision
is almost always superior, because it concentrates the premium where it is cheap.

See [vendor lock-in](/09-cloud-architecture/vendor-lock-in.md).

### Measure the exit cost, do not assume it

```text
component                estimated migration effort
database (standard engine)   2 weeks — export and import
object storage               1 week — compatible protocol
queue                        4 weeks — rewrite client and semantics
identity                     3 months — rewrite integration and migrate users
functions                    4 months — rewrite and rebuild orchestration
```

With those numbers, the conversation changes: the discussion stops being about being locked in and
becomes about how much it costs to leave, which is answerable.

And the exercise frequently reveals that most of the system is portable, and the lock-in is
concentrated in two or three components.

### The premium is paid in speed

```text
use the provider's managed queue     configuration, done
keep it portable                     operate your own engine, or
                                     abstract behind a layer

use the provider's identity          weeks
keep it portable                     build or operate identity
```

The premium is not only infrastructure cost — it is engineering time diverted from the product,
and capability not used. It is continuous and invisible, which is the combination that makes bad
decisions survive.

### Preventive abstraction usually fails

The common pattern: wrap the provider's services in your own layer, so you can swap later.

```text
the layer is designed from the only known provider
it accommodates the lowest common denominator
the second provider has different semantics
the layer does not fit, and is rewritten during the migration
meanwhile, it prevented the use of the better capabilities
```

It is the same mechanism as [simplicity vs. flexibility](/20-trade-offs/simplicity-vs-flexibility.md):
an abstraction built from one case has the shape of that case.

What works better is to **isolate** — concentrate the use of the proprietary service in a small,
identifiable module — without generalizing. The cost is nearly zero and the benefit during
migration is nearly the same.

### Portability that is almost always worth it

Some choices give portability at negligible cost and should be the default:

```text
containers instead of proprietary machine images
a database with a standard engine, managed by the provider
storage with a compatible protocol
infrastructure declared in a multi-provider tool
observability with an open protocol
```

None of those sacrifices relevant capability, and all of them reduce the dependency surface.

See [infrastructure as code](/14-devops-and-platform/infrastructure-as-code.md).

### Real reasons for migration

The probability is not the same for every scenario, and distinguishing them helps:

```text
reason                          probability   what it requires
price change                    medium        the ability to negotiate, not to migrate
acquisition or merger           low to medium consolidation, with a long deadline
new regulatory requirement      low           a specific region, not a provider
service discontinued            low           migration of one component
dissatisfaction with reliability very low     rarely motivates a full migration
customer requirement            low           partial multi-provider
```

The first is the most common and does not require migration — it requires **credibility that
migration is possible**, which is different and cheaper to obtain.

### Signs of the wrong choice

```text
too native
  critical dependency on a proprietary service with no alternative
  exit cost never estimated
  new regulatory requirement impossible to meet
  price changed with no negotiating power

too portable
  reimplementing what the provider offers ready-made
  abstraction layers with a single provider behind them, for years
  provider capability unused by policy
  delivery speed below competitors that use the cloud deeply
```

### Cost of changing your mind

```text
portable → native   cheap: start using what is already available
native → portable   expensive: extract the dependency after it has spread
```

The asymmetry favors portability — but with an important correction: the cost of "native →
portable" drops a lot if the proprietary use is **isolated** from the start.

That resolves the dilemma in practice: isolate without abstracting, use the provider deeply, and
keep the exit cost measured and known.

## Mental Model

**Portability is insurance with an invisible premium.** Buy it where it is cheap, measure the exit
cost where it is not, and do not pay for a claim that almost never happens.

## When to Use

Prefer **portability** when:

- It costs little — containers, standard engines, open protocols.
- There is a contractual or regulatory requirement for multi-provider.
- There is a concrete probability of migration, with a deadline.
- The component is critical and the provider's alternative is proprietary.

Prefer **native** when:

- The service delivers capability you would not build.
- The exit cost of that component is known and acceptable.
- Speed matters more than the option.
- Migration is hypothetical, with no deadline and no concrete reason.

## When Not to Use

**As a global decision** — the answer is per component.

**With preventive abstraction** built from one provider.

**Without estimating the exit cost.**

**Refusing provider capability by policy**, with no number that justifies it.

**Without isolating** the proprietary use when it is adopted.

## Alternatives

- **Isolate without abstracting** — an identifiable module, with no generic layer; the best
  cost-benefit ratio.
- **Selective portability** — in the layers where it is cheap, native in the rest.
- **Real multi-provider** — expensive; justifiable only with a concrete requirement.
- **Native with a documented exit cost** — use it deeply, and keep the estimate up to date.

The last is underestimated: knowing that leaving costs four months is different from fearing that
it is impossible, and it is enough to negotiate.

## Trade-offs

| Native | Portable |
|---|---|
| Maximum capability | Option preserved |
| Delivery speed | Lowest common denominator |
| Higher exit cost | Continuous premium |
| Less in-house code | More |

| Isolate without abstracting | Abstraction layer |
|---|---|
| Nearly zero cost | Illusion of portability |
| Uses the service deeply | Lowest common denominator |
| Migration still requires work | Rewrite during migration anyway |

## Failure Modes

**Preventive abstraction.** Does not fit during migration and limited the use until then.

**Exit cost never measured.** Decision by fear.

**Critical proprietary dependency.** No alternative when you need one.

**Global portability by policy.** Reimplements what already exists.

**Proprietary use spread out.** Expensive extraction later.

**Multi-provider with no requirement.** High cost for an unlikely scenario.

## Common Mistakes

**Treating it as a global decision.**

**Building an abstraction layer with one provider.**

**Not distinguishing layers** where portability is cheap.

**Not estimating the exit cost per component.**

**Confusing negotiating power with the need to migrate.**

## Real-World Example

A financial services company adopted, in 2021, a policy of total portability: no proprietary cloud
provider service could be used. The motivation was a board requirement, phrased as "we cannot
depend on a single supplier".

What was built to comply with the policy:

```text
in-house messaging on a self-hosted open-source engine
in-house identity, instead of the provider's service
in-house workflow orchestration, instead of managed functions
an abstraction layer over object storage
```

Three years later:

```text
engineers dedicated to operating that infrastructure   4.5 full-time
incidents/year in those components                     27
infrastructure cost, compared with the managed
  equivalent                                           -18%
total cost including headcount                         +140%
average delivery time for a new feature                ~2.3× that of a comparable
                                                       company in the sector
provider migrations performed                          0
```

The review began with an exercise that had never been done: estimating the exit cost, component by
component, of the hypothetical scenario.

```text
component                     estimated migration effort
containers                    1 week
database (standard engine)    3 weeks
object storage                1 week
observability                 2 weeks
identity (if it were the
  provider's)                 3 months
functions (if they were the
  provider's)                 4 months
                              ————————————————
hypothetical full migration   ~9 months
```

Nine months, for an event nobody could associate with a deadline or a concrete trigger — against
4.5 permanent engineers and delivery 2.3× slower.

And the exercise revealed the point that changed the conversation with the board: **the real
concern was negotiating power, not migration.** A documented and credible exit estimate addresses
that concern with no continuous premium.

The policy was reformulated:

**Mandatory portability where it is cheap**: containers, a standard database engine, storage with
a compatible protocol, observability with an open protocol, infrastructure declared in a
multi-provider tool.

**Proprietary services allowed**, with two conditions: isolated use in an identifiable module, and
an exit cost estimated and recorded in an ADR, reviewed annually.

**No preventive abstraction layer.** Isolate, do not generalize.

**Consolidated exit estimate** presented to the board annually, as a formal answer to the original
concern.

**Multi-provider only where required by contract** — two customers had that clause, and only for
their own data storage.

Results after 18 months:

```text
engineers dedicated to in-house infrastructure     1.5
incidents/year in those components                  7
total cost                                         -34%
average delivery time                              -45%
consolidated exit cost, estimated                  ~11 months
```

The exit cost **rose** — from 9 to 11 months — and that was presented to the board along with the
other numbers, and accepted.

The 2021 policy answered a legitimate concern with the wrong instrument. The board wanted not to
be held hostage; what it needed was a credible exit estimate, not an architecture that avoided the
entire cloud.

## Related Concepts

- [Vendor Lock-in](/09-cloud-architecture/vendor-lock-in.md).
- [Managed vs. Self-Hosted](/20-trade-offs/managed-vs-self-hosted.md).
- [Simplicity vs. Flexibility](/20-trade-offs/simplicity-vs-flexibility.md) — the same optionality
  mechanism.
- [Infrastructure as Code](/14-devops-and-platform/infrastructure-as-code.md).

## Practical Exercise

Estimate, component by component, the effort of migrating your system to another provider.

Add it up. Compare it with the annual cost of the portability you maintain today. One of the two
numbers has probably never been computed.

## Interview Questions

- Why is portability better understood as insurance?
- Why does preventive abstraction over cloud services usually fail during migration?
- Why do negotiating power and the need to migrate require different answers?

## Further Reading

- Hohpe, Gregor. *Cloud Strategy*. Architect Elevator, 2020.
- Newman, Sam. *Building Microservices*. 2nd ed. O'Reilly, 2021.
- Morris, Kief. *Infrastructure as Code*. 2nd ed. O'Reilly, 2020.

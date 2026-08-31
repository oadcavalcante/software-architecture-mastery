---
id: sla
title: SLA
sidebar_position: 12
description: The commitment with a penalty — and why it should be looser than the internal target.
doc_type: concept
level: 5
difficulty: intermediate
status: complete
objective: >
  By the end, the reader negotiates SLAs with margin relative to the SLO and
  understands what the fine print actually promises.
prerequisites: [slo]
related: [slo, sli, availability-metrics]
canonical_for: []
translated_from_version: 1
last_reviewed: 2026-08-31
---

# SLA

## Overview

An SLA — service level agreement — is a **contractual** commitment about the level of service, with a
defined consequence if it is not met.

It is frequently confused with an [SLO](/12-reliability/slo.md), and the difference has a practical
consequence:

```text
SLO  an internal target, ambitious, with no penalty, guides engineering decisions
SLA  an external commitment, conservative, with a penalty, guides negotiation
```

The SLA should be **looser** than the SLO. If they are equal, every miss of the internal target is already
a breach of contract — and the team loses the margin the error budget was supposed to give.

## Problem

An SLA promised with no basis is a liability. It is usually defined in a commercial negotiation, under
pressure from the customer, with nobody checking whether the system sustains it.

And the inverse also happens: an overly conservative SLA loses business.

Both mistakes come from the same absence — there is no historical measurement informing what the system
actually delivers, nor a calculation of what the dependencies allow promising.

## Core Concepts

### The margin between SLO and SLA

```text
SLA promised to the customer   99.5%
internal SLO                   99.9%
margin                         0.4 points — the room to err without breaching
```

The team works against the SLO. When it is violated, there is time to react before the contractual penalty
kicks in.

The margin needs to be enough to absorb a relevant incident. A margin of 0.01 points is not a margin.

### What the fine print decides

The promised number matters less than the definitions around it. Four points:

**What counts as unavailability.** A complete error? Slowness? Partial degradation? Many contracts count
only total unavailability, which means a service unusable from slowness is technically available.

**How it is measured, and by whom.** The vendor's measurement, the customer's, or a third party's? The
number changes substantially. See [SLI](/12-reliability/sli.md).

**The window.** 99.9% per month allows 43 minutes; per year, 8.8 hours concentrated in a single event. The
same percentage, very different commitments.

**The exclusions.** Scheduled maintenance, cloud provider failure, an attack, force majeure, the customer's
network problems. Broad exclusions empty the commitment.

The sum of those four defines what the SLA is worth — and an SLA of 99.99% with broad exclusions promises
less than one of 99.5% without them.

### The typical penalty does not compensate the damage

The market standard is the **service credit**: a discount on the subscription, proportional to the miss.

```text
availability      credit
99.0% to 99.9%    10% of the subscription
95.0% to 99.0%    25%
below 95.0%       50%
```

That is disproportionate to the customer's loss: a 4-hour outage can cost them far more than 25% of a
subscription.

Two consequences, one for each side:

**For whoever buys:** the SLA is not insurance. It signals commitment and it does not cover loss. The real
protection is architectural — redundancy, degradation, an alternative.

**For whoever offers:** the credit is not the main cost of missing. The cost is the loss of trust and the
renewal that does not happen.

### Composite availability limits what can be promised

A system cannot be more available than its synchronous dependencies.

```text
your service       99.95%
managed database   99.99%
external gateway   99.9%
authentication     99.95%
composite          ~99.79%
```

Promising 99.9% with that composition is promising what you do not control. See
[availability](/06-distributed-systems/availability.md).

That does not prevent promising more — it prevents promising more **without reducing the synchronous
dependency**: caching, degradation, an alternative, or making the call asynchronous.

Calculating the composition before signing is the step that avoids the liability.

### The SLA you receive matters too

The analysis holds in both directions. When buying a service:

**Their SLA enters your calculation.** See above.

**Their exclusions are your risk.** If scheduled maintenance is excluded and has no duration limit, you
have no commitment at all.

**The penalty is irrelevant.** Plan for the failure, not for the credit.

See [SaaS](/09-cloud-architecture/saas.md) and [vendor lock-in](/09-cloud-architecture/vendor-lock-in.md).

### Internal agreements exist too

Between teams, an explicit agreement — with no contractual penalty — serves a similar function: the
consuming team knows what to expect, and the providing team knows what to sustain.

Calling that an SLA creates confusion. It is an SLO with a declared consumer, and it works better when
treated as such.

## Mental Model

**The SLA is what you promise; the SLO is what you pursue.** The distance between the two is your margin
for error.

## When to Use

- There is a customer contract requiring a service level commitment.
- The product is sold to companies that demand guarantees.
- Service levels need to be differentiated by plan.
- When evaluating vendors.

## When Not to Use

**Equal to the SLO.** With no margin.

**Promised without checking the dependencies.**

**With no measurement history** informing what the system delivers.

**As a substitute for architectural protection.** The credit does not cover the loss.

**With exclusions so broad** that the commitment is empty — from the buyer's side, that is the sign that
there is no commitment.

**Between internal teams**, with a penalty. It becomes bureaucracy with no value.

## Alternatives

- **A published [SLO](/12-reliability/slo.md)** — transparency with no contractual commitment. Sufficient
  for many products.
- **A public availability dashboard** — a visible history, which builds trust better than a promise.
- **A commitment per plan** — different levels at different prices.
- **Architectural protection** — for the buyer, it is worth more than any clause.

## Trade-offs

| A strict SLA | A loose one |
|---|---|
| A commercial differentiator | Less attractive |
| A penalty risk | Low |
| Requires investment | Less |
| Pressure on engineering | Less |

| A monthly window | Annual |
|---|---|
| Reacts to recent degradation | Absorbs one large event |
| More misses counted | Fewer |

## Failure Modes

**An SLA above what the dependencies allow.**

**No margin relative to the SLO.**

**A definition of unavailability too favorable to the vendor.** Slowness does not count.

**Measurement by the vendor only.**

**Exclusions emptying the commitment.**

**The credit treated as insurance.**

**The customer measuring differently.** A dispute over the number, with no common criterion.

## Common Mistakes

**Confusing it with an SLO.**

**Promising without calculating the composition.**

**Negotiating with no measurement history.**

**Not reading the vendors' exclusions.**

**Counting on the credit** instead of designing for the failure.

**Not defining who measures and how.**

## Real-World Example

A technology company closed a contract with a corporate customer promising 99.95% monthly availability,
with a 25% credit in case of a miss.

The number was defined in the commercial negotiation, because the competitor offered 99.9%.

Nobody checked three things:

**The composition.** The system depended on a payment gateway with a 99.9% SLA and an identity provider
with 99.95%, both synchronous in the main flow. The theoretical maximum availability was around 99.8% —
below the promise, even with their own system perfect.

**The history.** The previous twelve months averaged 99.7%, with two months below 99%.

**The definition.** The contract counted as unavailability "any period in which the service does not
respond or responds with an error". Slowness was not explicitly excluded, which the customer interpreted —
correctly — as included.

In the first six months, the SLA was missed in four. The accumulated credit was significant, and the
relationship with the customer got tense.

The renegotiation, a year later, was done with data:

**The SLA reduced to 99.5%**, with the history presented to the customer as justification.

**An internal SLO defined at 99.9%**, creating the margin that did not exist.

**The definition of unavailability made precise**: latency above 10 seconds counts; partial degradation of
non-essential features does not count, with the list of essential ones attached.

**Measurement by a third party**, accepted by both sides, ending the disputes over the number.

And, in engineering, three changes that attacked the composition:

**A payment gateway with an alternative.** A second provider, activated when the first fails.

**Authentication with a session cache**, tolerating identity provider unavailability for up to 15 minutes.

**Graceful degradation** for non-essential features. See
[graceful degradation](/12-reliability/graceful-degradation.md).

After that, the real availability rose to 99.93% — and the 99.5% SLA came to have comfortable margin.

What was recorded afterward: the problem was not the system. It was having promised a number the
architecture did not sustain, defined in a commercial meeting with nobody doing the ten-minute calculation
that would have shown it.

## Related Concepts

- [SLO](/12-reliability/slo.md) — the internal target.
- [SLI](/12-reliability/sli.md) — what is measured.
- [Availability](/06-distributed-systems/availability.md) — the composition.
- [Graceful Degradation](/12-reliability/graceful-degradation.md) — how to sustain the number.

## Practical Exercise

List your main flow's synchronous dependencies and each one's SLA. Multiply the availabilities.

The result is the ceiling of what you can promise. Compare with what has already been promised.

## Interview Questions

- Why should the SLA be looser than the SLO?
- Why does the fine print matter more than the number?
- Why is a service credit not insurance?

## Further Reading

- Beyer, Betsy et al. *Site Reliability Engineering*. O'Reilly, 2016 — chapter 4.
- Beyer, Betsy et al. *The Site Reliability Workbook*. O'Reilly, 2018.
- The major cloud providers' public SLAs — read the exclusions.

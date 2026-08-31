---
id: application-portfolios
title: Application Portfolios
sidebar_position: 8
description: The inventory of what exists, with the dimensions that let you decide what to do with each thing.
doc_type: concept
level: 6
difficulty: advanced
status: complete
objective: >
  By the end, the reader evaluates applications by value and health, and decides between
  keeping, investing, replacing or retiring.
prerequisites: [business-capabilities]
related: [business-capabilities, current-state-architecture, integration-landscapes]
canonical_for: []
translated_from_version: 1
last_reviewed: 2026-08-31
---

# Application Portfolios

## Overview

The portfolio is the inventory of the organization's applications, with the information
that makes it possible to decide what to do with each one.

The question it answers is not "what exists?" — it is **"what do we do with each
thing?"**.

And that comes down to four answers: keep, invest, replace, retire.

## Problem

Without a portfolio, decisions about systems happen by reaction: the system that breaks
gets investment; the one that doesn't bother anyone is forgotten.

The predictable result:

```text
critical systems neglected because they work
systems nobody uses consuming licenses and infrastructure
investment distributed by urgency, not by value
invisible duplication — two systems doing the same thing
nobody knows the total cost of ownership of anything
```

And the hardest decision — retiring — practically never happens, because it requires
someone to assert that something can be shut down, with the associated risk.

## Core Concepts

### The two dimensions that decide

```text
business value    how much the organization depends on this
technical health  how sustainable it is to maintain
```

Crossing the two:

```text
high value, good health   → keep and invest
high value, poor health   → modernization priority — the risk quadrant
low value, good health    → keep at minimum cost
low value, poor health    → retire
```

The second quadrant is what the assessment exists to find. It contains the risk nobody
named: systems the business depends on, maintained by few people, on obsolete technology
— and that don't generate enough incidents to attract attention.

### What makes up each dimension

```text
value     criticality to the operation
          the business capability it supports
          number of users and dependent processes
          associated revenue or cost

health    age and technological obsolescence
          how many people know how to maintain it
          incident frequency
          ease of change — coverage, coupling
          operating cost
          vendor support, if purchased
```

The second line of health is the one that usually dominates real risk and the one that
appears least in technical assessments: a modern system with a single maintainer is more
fragile than an old system with five.

See [business capabilities](/15-enterprise-architecture/business-capabilities.md) — mapping to capabilities is what
gives you the value dimension.

### Total cost, not infrastructure cost

```text
infrastructure   servers, licenses, storage
maintenance      people who spend time on it
integration      the cost of maintaining connections with other systems
opportunity      what doesn't get done because this system consumes attention
```

The third line is frequently larger than the first and is almost never accounted for: a
system with 15 integrations costs maintenance in 15 places, not just its own.

See [integration landscapes](/15-enterprise-architecture/integration-landscapes.md).

And the cost is what makes the decision to retire defensible: without a number, "let's
shut it down" is a proposal of risk with no visible gain.

### Retiring is the hardest and the most profitable decision

It faces three obstacles:

**Nobody knows who uses it.** The answer is to observe, not to ask. See
[current state architecture](/15-enterprise-architecture/current-state-architecture.md).

**The risk is asymmetric.** Shutting it down and breaking something is visible; leaving
it on is invisible.

**Nobody owns the decision.** The system has no owner, and so no one can shut it down.

What unblocks it:

```text
monitor access over a long period — 90 to 180 days
shut down gradually — reduce capacity, restrict access
suspension period — off, recoverable, before discarding
broad communication — whoever depends on it gets a chance to speak up
```

The suspension period is the mechanism that reduces risk to an acceptable level: off for
60 days, with the ability to turn it back on in minutes, resolves the asymmetry.

### The assessment has to be done with the business

The value dimension cannot be assessed by engineering. A system that looks technically
marginal may be the one sustaining the most critical process.

And the inverse: a system that consumes a lot of engineering attention may be irrelevant
to the business — and that finding, reached jointly, is what authorizes reducing
investment in it.

### The portfolio should be derived where possible

```text
derived     inventory, cost, versions, incidents, usage
judgment    value, criticality, qualitative health, ownership
```

See [current state architecture](/15-enterprise-architecture/current-state-architecture.md). What is derived
maintains itself; what requires judgment is reviewed periodically, and changes slowly.

A portfolio filled in entirely by hand goes stale within months.

### The assessment has to happen periodically

A portfolio assessed once describes a moment. The two dimensions change at different
rates:

```text
value    changes slowly — with business strategy, not with the quarter
health   changes continuously — people leave, technology ages, debt accumulates
```

Health is the one that degrades silently. A system that was in the comfortable quadrant
two years ago may have lost two of its three maintainers since then, without anything
raising an alert.

An annual review of both dimensions, with health revisited every six months, is what
keeps the portfolio informative. And part of it can be derived — incident frequency,
dependency age, number of people who submitted changes in the last year.

That last metric is a cheap and surprisingly reliable indicator of knowledge
concentration, and it comes out of the repository history without interviewing anyone.

## Mental Model

**Value and health decide what to do.** The high-value, poor-health quadrant is the risk
nobody named.

## When to Use

- Prioritizing technology investment.
- Identifying obsolescence risk.
- Retirement decisions.
- After acquisitions, to consolidate.
- Budget discussions with the business.

## When Not to Use

**Assessing value without the business.**

**Considering infrastructure cost only.**

**Filled in entirely by hand.**

**Without a people dimension** in the health assessment.

**As a one-off exercise**, with no review.

**Shutting down without a suspension period.**

## Alternatives

- **[Business capabilities](/15-enterprise-architecture/business-capabilities.md)** — the business lens, without the
  per-application detail.
- **Service catalog** — derived, technical, without assessment. See
  [internal developer platforms](/14-devops-and-platform/internal-developer-platforms.md).
- **On-demand assessment** — assess only what is under discussion, instead of everything.

The last one is economical: a complete portfolio of 200 applications is expensive to
maintain, and most decisions involve few of them at a time.

## Trade-offs

| Complete portfolio | On-demand assessment |
|---|---|
| View of the whole | Focus |
| Cost of maintaining | Low |
| Finds what you weren't looking for | Only what you look at |

| Derived | Judged |
|---|---|
| Always current | Ages |
| Limited to the measurable | Captures value and risk |

## Failure Modes

**Invisible critical system.** It works, nobody looks, and the maintainer leaves.

**Retirement that never happens.**

**Assessment without the business.** Value estimated by engineering.

**Underestimated cost.** Only infrastructure accounted for.

**Stale portfolio.** Decisions about an old reality.

**A shutdown that breaks something.** An unknown consumer.

## Common Mistakes

**Not including people in the health assessment.** A technically healthy system only one person knows how to maintain is a bigger risk than an old, well-known system.

**Not accounting for integration cost.** The visible cost is licenses and infrastructure; what weighs is keeping the integrations alive, and it appears on no invoice.

**Assessing alone.** Business value cannot be judged by the technical side. A system that looks obsolete may sustain the most critical process in the operation.

**Not observing real usage before retiring.** "Nobody uses it anymore" is usually false: there is always a monthly report or a quarterly close that only shows up in the measurement.

**Having no suspension period.** Shutting down outright removes the chance to discover forgotten dependencies cheaply. Suspending and waiting for the complaints costs far less than restoring.

**Filling everything in by hand.** A manual inventory is out of date the following month. What holds up is what is derived from sources that already exist — cloud, repositories, billing.

## Real-World Example

A financial services company had 210 applications and no consolidated view.

The assessment took ten weeks, with value defined by the business areas and health by
engineering.

The result by quadrant:

```text
high value, good health    58 applications
high value, poor health    31   ← the risk quadrant
low value, good health     77
low value, poor health     44   ← retirement candidates
```

Three findings:

**The risk quadrant.** Of the 31, eight had a single maintainer, and three had a
maintainer with retirement expected in under two years. None of them generated incidents
— they worked, and for that reason they were invisible.

**Integration cost.** The 210 applications had 1,400 integrations. One low-value
application in the bottom quadrant had 38 integrations — the cost of maintaining it was
far greater than its infrastructure cost.

**Unused applications.** Access monitoring over 120 days showed that 23 of the 44
candidates had no human access at all, and 9 had no access whatsoever.

The retirement process:

**Broad communication** for 30 days, with the list published.

**Gradual restriction** of access, with an alert to anyone who tried.

**Suspension** for 90 days, off and recoverable.

**Disposal** after the period, with data archived per regulatory retention.

Of the 44 candidates, 31 were retired. Seven revealed consumers during the restriction
period — all identified without an incident, because restricted access alerted rather
than failed. Six were kept for a regulatory retention requirement.

Direct savings: licenses and infrastructure for the 31. Indirect savings, larger: 290
fewer integrations to maintain.

And the risk quadrant became the two-year modernization plan, with knowledge transfer as
the first stage for the eight with a single maintainer.

The subsequent assessment points out: the 31 applications in the risk quadrant were each
individually known to several people. None had ever come up in a prioritization
discussion, because none was breaking.

## Related Concepts

- [Business Capabilities](/15-enterprise-architecture/business-capabilities.md) — the value dimension.
- [Current State Architecture](/15-enterprise-architecture/current-state-architecture.md).
- [Integration Landscapes](/15-enterprise-architecture/integration-landscapes.md) — the hidden cost.
- [Legacy Modernization](/16-legacy-modernization/index.md).

## Practical Exercise

Pick five systems in your organization and answer, for each one: how many people know how
to maintain it?

Cross that with criticality. The critical ones with one or two people are your risk
quadrant.

## Interview Questions

- Which two dimensions decide what to do with an application?
- Why is the high-value, poor-health quadrant invisible?
- What unblocks the decision to retire?

## Further Reading

- Ross, Jeanne et al. *Enterprise Architecture as Strategy*. HBS Press, 2006.
- Gartner. *TIME model* — tolerate, invest, migrate, eliminate.
- Open Group. *TOGAF Standard* — application architecture.

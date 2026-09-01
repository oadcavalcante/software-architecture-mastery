---
id: fitness-functions
title: Fitness Functions
sidebar_position: 22
description: The protected dimension becomes an executable check — and the architecture gets tests.
doc_type: concept
level: 7
difficulty: advanced
status: complete
objective: >
  By the end, the reader converts architectural characteristics into continuous checks and knows how
  to operate them without their becoming noise.
prerequisites: [evolutionary-architecture]
related: [evolutionary-architecture, measuring-architecture-outcomes, leadership-governance]
canonical_for: []
translated_from_version: 1
last_reviewed: 2026-08-31
---

# Fitness Functions

## Overview

A fitness function is an automated check of an architectural characteristic you want to preserve. It
turns an intention — "modules must not have cyclic dependencies" — into something that fails when it
is violated.

```text
a rule in a document   true when somebody remembers
a fitness function     true always, or red
```

See [fitness functions as governance](/19-architecture-governance/fitness-functions-governance.md)
for the use as a governance mechanism; here the focus is the instrument in the hands of whoever leads
architecture — how to choose what to verify, and how to operate the set without its becoming noise.

## Problem

Written architectural rules erode in a predictable pattern:

```text
month 1     the rule is published and known
month 6     most of the code follows it
month 18    half the violations went unnoticed
month 36    nobody knows what the state is
```

And the leadership problem is specific: **the architect cannot review everything**. In an
organization with thirty teams, they see a small fraction of the changes, and the fraction they see
is not the one that matters most — it is the one that reached them.

The fitness function solves that by changing the point of intervention: instead of reviewing
afterwards, the property is checked at every change, by everyone, without their being present. See
[governance basics](/19-architecture-governance/governance-basics.md).

The common error, on the other side: building a large set of checks before having one in production,
and discovering that the false-positive rate makes all of them ignored.

## Core Concepts

### Atomic and holistic

```text
atomic     checks a component in isolation
           — cyclic dependency, a secret in code,
             a declared owner, module size
holistic   checks a property of the whole
           — end-to-end latency, cost per transaction,
             composite availability, lead time
```

The atomic ones are cheap and immediate; most of the initial value comes from them. The holistic ones
are expensive and cover properties that only exist in the whole — and they are the ones that discover
the problems of greatest consequence.

A mature organization has both. One that has only atomic ones protects the code and not the
architecture.

### Start with the rule that has already caused damage

```text
1. pick a rule that has been violated and produced an incident
2. implement the simplest check that catches it
3. run it in warning mode for a few weeks
4. fix the existing base
5. only then block
```

Step 1 is what guarantees sponsorship: a check tied to a known incident does not have to be justified.
Step 3 is what avoids rejection — turning on blocking over a base that violates it in forty places
interrupts everybody's work on the same day.

And step 3 has a documented effect: making it visible resolves a substantial share of the violations
before any blocking, with no chasing at all.

### The message is part of the design

```text
bad    "violation of rule ARCH-014"
good   "the orders module imports directly from billing
       (Order.java:82). Use the PublishesBilling interface.
       If the dependency is legitimate, record an exception in
       docs/adr/."
```

A check that fails without explaining produces circumvention, not correction. Writing the message is
part of the work, and it is read far more often than any architecture document.

### False positives are the health metric

```text
below ~2%    the check is respected
above that   it is worked around by reflex, and then removed
```

Monitoring each check's false-positive rate, and adjusting or downgrading the ones that pass the
limit, is what keeps the set trustworthy. A check with a high false-positive rate contaminates the
credibility of the others.

### Block or warn

```text
block    when the violation is always an error
warn     when it is sometimes legitimate
report   when it is a trend, not an event
```

The deciding question: **if this fails, is it always an error?** If the answer is "sometimes it's
legitimate", blocking produces a growing exclusion list — and the list is where the erosion starts to
hide.

Periodically looking at the exclusion list is an underrated practice: it is the record of every time
the rule was worked around.

### What cannot be verified

```text
does the service boundary match the domain?
is the complexity justified?
was the trade-off accepted the right one?
does the model make sense for the business?
```

Delimiting that avoids the exaggerated expectation that makes the practice get abandoned. Fitness
functions replace part of the governance and free human attention for the questions only it answers —
which is the strongest argument for them in a leadership context.

### Every function needs an owner and a review

A fitness function is code, with maintenance, obsolescence and false positives. With no owner, it
breaks and gets disabled; with no review, it verifies a rule that no longer holds.

And it is worth reviewing the **need** too: a rule that became consensus and has never been violated
again can be removed, freeing attention. See
[governance pathologies](/19-architecture-governance/governance-pathologies.md).

## Mental Model

**The characteristic that matters becomes an executable check.** Start with the one that has already
caused damage, warn before blocking, and monitor false positives.

## When to Use

- For the architectural dimensions chosen as protected.
- After an incident whose cause is a violated rule.
- As a replacement for recurring manual review items.

## When Not to Use

**For judgment** — fit, boundaries, trade-offs.

**Blocking from day one.**

**With no actionable message.**

**With a high false-positive rate.**

**With no owner.**

**In quantity** — many mediocre checks are worth less than a few trustworthy ones.

## Alternatives

- **A preventive control** — preventing instead of detecting; better when the environment allows it.
- **Human review** — for what requires judgment.
- **A trend report** — when the property is gradual and not binary.
- **A template** — the property built into the starting point, with no check needed.

The last is always preferable where applicable: a configuration that already comes out correct does
not have to be checked.

## Trade-offs

| Automated | Human review |
|---|---|
| Always runs | Covers judgment |
| Only the measurable | Depends on attention |
| Upfront investment | Recurring cost |

| Blocking | Warning |
|---|---|
| Guarantees the property | Doesn't interrupt |
| Pressures toward circumvention | Can be ignored |

## Failure Modes

**A high false-positive rate.** It contaminates the set.

**No useful message.** It produces circumvention.

**Premature blocking.** Organizational rejection.

**A growing exclusion list.** The erosion hides there.

**No owner.** It breaks and disappears.

**Expecting it to cover judgment.** Frustration and abandonment.

## Common Mistakes

**Building the complete set** before having one in production.

**Not measuring false positives.**

**Not looking at the exclusion list.**

**Not removing** checks that became consensus.

**Only atomic ones**, with no holistic one at all.

## Real-World Example

An e-commerce platform with 18 teams had a three-person architecture group. They took part in around
12% of the design reviews — and the selection was not by importance, it was by who invited them.

The diagnosis that changed the approach came from an incident analysis: of the 34 high-severity
occurrences in 12 months, 21 had as their cause an architectural rule that was documented and
violated.

```text
cause of the violation                                incidents
a service with no resource saturation alarm            7
a synchronous call to an external dependency with no timeout  6
direct access to another domain's data                 4
a secret in an environment variable with no vault      4
```

None of the four required judgment — all were verifiable. And none had been caught in a review,
because the review only saw 12% of the changes.

Adoption followed the order of the damage, with the first being the most frequent one:

**A warning phase, eight weeks.** The saturation alarm check ran without blocking, with a dashboard
per team. At the end of the eight weeks, 61 of the 94 services had fixed it — with no chasing at all,
just from seeing the number.

**The existing base fixed, then blocking.** The remaining 33 were handled: 26 fixed, 7 with a recorded
exception and a deadline.

The next three took four months, under the same protocol.

**One holistic check added in the sixth month:** composite availability of the purchase flow,
calculated from each service's declared dependencies. It fails when the product of the individual
availabilities drops below the contractual requirement — and on its first run it caught a chain of
five synchronous calls nobody had added up.

```text
calculated composite availability     98.4%
contractual requirement               99.5%
```

That single check produced the decision to make two of the five calls asynchronous, which was the
system's architectural problem of greatest consequence and which no design review had identified —
because each of the five calls, in isolation, was reasonable.

Results after 14 months:

```text
high-severity incidents from a violated rule        from 21 to 2
coverage of the checks                              100% of changes
                                                    (against 12% in review)
average false positives                             1.9%
active exceptions with a deadline                   14
architecture group's time in rule review            -80%
```

The subsequent assessment points out: the holistic check was the highest-value one and the last to be
built, because it looked like the hardest. It cost three weeks and found, on its first day, the
problem that two years of one-off reviews had not found — for the usual reason, which is that nobody
added the parts up.

## Related Concepts

- [Evolutionary Architecture](/23-architecture-leadership/evolutionary-architecture.md) — the protected dimensions.
- [Fitness Functions as Governance](/19-architecture-governance/fitness-functions-governance.md).
- [Measuring Outcomes](/23-architecture-leadership/measuring-architecture-outcomes.md).
- [Governance](/23-architecture-leadership/leadership-governance.md).

## Practical Exercise

List your context's architectural rules and mark which ones have already caused a known incident.

Implement the simplest check for the first on the list, in warning mode. The number of violations that
shows up is the accumulated erosion — and it always surprises.

## Interview Questions

- Why start with the rule that has already caused damage?
- Why is the false-positive rate the health metric for the set?
- Why does the exclusion list deserve periodic review?

## Further Reading

- Ford, Neal et al. *Building Evolutionary Architectures*. 2nd ed. O'Reilly, 2022.
- Ford, Neal et al. *Software Architecture: The Hard Parts*. O'Reilly, 2021.
- Kim, Gene et al. *The DevOps Handbook*. 2nd ed. IT Revolution, 2021.

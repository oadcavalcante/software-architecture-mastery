---
id: fitness-functions-governance
title: Fitness Functions as Governance
sidebar_position: 7
description: Executable governance — the property you want to preserve, verified on every change.
doc_type: concept
level: 6
difficulty: advanced
status: complete
objective: >
  By the end, the reader converts a governance rule into an automated check and knows which
  rules cannot be converted.
prerequisites: [governance-basics]
related: [compliance, governance-standards, governance-basics]
canonical_for: []
translated_from_version: 2
last_reviewed: 2026-08-31
---

# Fitness Functions as Governance

## Overview

A **fitness function** is an automated check of an architectural characteristic you want to
preserve. The term comes from *Building Evolutionary Architectures*, and the central idea is
simple: if you can state the property, and you can measure it, you can verify it on every
change.

```text
a written rule      "services must not depend on each other cyclically"
a fitness function  the dependency graph is checked at build time;
                    a cycle breaks the pipeline
```

The difference between the two lines is the difference between an intention and a mechanism.
The first is true when someone remembers; the second, for as long as the check runs in the
pipeline — and it stops being true when someone disables it or hollows it out with
exclusions, which is how it erodes.

For measurable properties, it costs less friction per unit of effect than manual review,
which demands attention on every change — and it demands more up-front investment than any
written rule.

The mechanics of building and operating a function — atomic and holistic, message, false
positives — are in [Fitness Functions](/23-architecture-leadership/fitness-functions.md).
This document covers the governance slice: the function as an intervention point, its
relationship with exceptions and review, and the line between what it checks and what is
left to judgment.

## Problem

Architectural rules written in a document behave predictably:

```text
month 1     the rule is published and known
month 6     most of the code follows it
month 18    half the exceptions were never recorded
month 36    nobody knows what the state is
```

The erosion is not indiscipline. It is that each individual violation is small, invisible and
justifiable at the time, and nothing adds them up.

And the traditional alternative — inspecting in review — has two flaws: it happens late, and
it depends on someone noticing. A cyclic dependency introduced in a 400-line change is not
noticed by reading.

## Core Concepts

### What can become a fitness function

```text
structural     dependencies between modules, layers, coupling direction
performance    latency on a critical path, build time
security       no secret in code, vulnerable dependency,
               exposed port with no authentication
operational    monitoring coverage, alarm defined, owner declared
data           compatible schema, declared retention
cost           resources provisioned within a limit
resilience     recovery time measured in a chaos test
```

The criterion is always the same: **is the property statable and measurable?** If so, it is a
candidate.

### Continuous or triggered

```text
continuous  runs on every change, in the pipeline
triggered   runs periodically or on demand — too expensive for every change
```

For governance, the difference is the moment of intervention: a continuous function stops
the violation before it gets in; a triggered one finds it afterwards, and so it needs a
destination — an alert with an owner or a review item — or it becomes a report nobody reads.
The distinction between atomic and holistic is in the
[canonical document](/23-architecture-leadership/fitness-functions.md#atomic-and-holistic);
several holistic functions are queries over data that
[observability](/13-observability/index.md) already collects.

### Fail or warn

```text
fail the build   for what must not happen
raise an alert   for what needs human attention
produce a report for what is a trend, not an event
```

Making everything fail produces two bad reactions: the check gets disabled, or the exclusion
list grows until the rule no longer holds.

The right choice depends on one question: **if this fails, is it always an error?** If the
answer is "sometimes it is legitimate", the check should warn, not block — and the legitimate
case should become a [recorded exception](/19-architecture-governance/exceptions.md).

### The message is the door to the exception process

The actionable message — file, line, correct alternative — is covered in the
[canonical document](/23-architecture-leadership/fitness-functions.md#the-message-is-part-of-the-design).
What belongs to governance is its last line: the path to record an exception. Without that
path, someone with a legitimate case has only two ways out — asking for the check to be
turned off or adding a silent exclusion — and both take the rule out of governance's reach.

### What cannot be automated

Delimiting this avoids the exaggerated expectation that gets the practice abandoned:

```text
was the decision appropriate to the context?
does the service boundary match the domain?
does the model make sense for the business?
was the accepted trade-off the right one?
is the complexity justified?
```

None of those is measurable. They stay in the territory of
[review](/19-architecture-governance/governance-review.md) and human judgment — and that is
why fitness functions replace part of governance, not all of it.

The useful split: automated verification frees human attention for the questions only it can
answer.

### Adoption, ownership and review

The adoption protocol — start with the rule that has already caused damage, warn before
blocking — and the operation of each function — owner, review, false positive rate — are in
the [canonical document](/23-architecture-leadership/fitness-functions.md#start-with-the-rule-that-has-already-caused-damage).
On the governance side, what changes is where this is recorded: each function points to the
[decision](/19-architecture-governance/governance-standards.md) that originated it, and the
periodic review of the standard includes the function's exclusion list — that is where the
rule loses validity without anyone deciding so.

## Mental Model

**If you can state it and measure it, you can verify it on every change.** What is left for
the human is what requires judgment.

## When to Use

- For structural, security and operational properties that are verifiable.
- Where silent erosion is the failure mode.
- After an incident whose cause was a violated rule.
- As a replacement for manual checklist items.

## When Not to Use

**For judgment** — boundary appropriateness, modeling, trade-offs. There is no measure to
compare against, and a check that pretends to measure pulls the conversation away from
review, where it needs to happen.

**When the rule still changes faster than the check can settle.** A disputed convention,
revised every quarter, produces false positives at every revision; until it settles, human
review costs less.

**When the codebase is small or short-lived.** A service to be decommissioned in months, or a
system where three people read every change: building and maintaining the check costs more
than the violations it would catch.

**When measuring requires an environment the pipeline lacks.** Latency under real load or
recovery in a chaos test don't pay off as continuous checks; they become triggered functions
or reports.

**When nobody can own it.** A function with no owner breaks at the first platform change and
gets disabled — and the disabling teaches that the rule is negotiable, which is worse than
never having created it.

## Alternatives

- **A preventive control** — prevent rather than detect; better when the environment allows.
- **[Review](/19-architecture-governance/governance-review.md)** — for what requires
  judgment.
- **[Continuous compliance](/19-architecture-governance/compliance.md)** — the same
  mechanism, with a regulatory focus.
- **A periodic report** — when the property is a trend and not an event.

The first is preferable when the platform can enforce the property with no legitimate
exception case — where legitimate exceptions exist, the built-in block becomes rigidity and
the case moves outside the platform: a mesh that rejects unauthenticated traffic
makes the corresponding check unnecessary. See
[governance basics](/19-architecture-governance/governance-basics.md).

## Trade-offs

| Automated | Human review |
|---|---|
| Always runs | Depends on attention |
| Only the measurable | Covers judgment |
| Up-front investment | Recurring cost |
| No ambiguity | With context |

| Block | Warn |
|---|---|
| Guarantees the property | Doesn't interrupt |
| Pressures toward workarounds | Can be ignored |
| For what is always an error | For what is sometimes legitimate |

## Failure Modes

**A high false positive rate.** It loses credibility and gets removed.

**No useful message.** It produces workarounds instead of fixes.

**Premature blocking.** Organizational rejection.

**No owner.** It breaks and gets disabled.

**A growing exclusion list.** The rule stops holding without anyone deciding that.

**An expectation of covering judgment.** Frustration and abandonment.

## Common Mistakes

**Building the complete set** before having one in production.

**Not measuring false positives.**

**Not reviewing the rule** when the context changes.

**Not linking it to the decision** that originated it.

**Not looking at the exclusion list**, which is where the erosion hides.

## Real-World Example

A logistics company with 84 services had architectural rules documented in a 40-page guide,
verified in code review.

A one-off survey of the real code found:

```text
documented rules                                37
automatically verifiable, in principle          22
actually verified                                3
violations found across the 22 verifiable      411
services with no violations at all               9 of 84
```

The most expensive case: 6 services accessed another service's database directly, a practice
forbidden by the guide since 2021. Two production breakages the previous year had that cause.

Adoption was deliberately incremental, over 11 months:

**The first function: direct access to another's database.** The rule that had already caused
damage. The check reads each service's connection configuration and compares it against the
data ownership registry.

It ran in warning mode for six weeks, with a per-team dashboard. During that period, 4 of the
6 cases were fixed voluntarily — with no pressure at all, merely from becoming visible. The
other 2 became exceptions with a deadline and a migration plan.

**Then, in order of historical damage:** cyclic dependency between modules, secret in code,
dependency with a known vulnerability, service with no declared owner, service with no
availability alarm.

Each one followed the same protocol: warn, fix the backlog, exceptions for whatever remains,
block.

**An actionable message** in all of them, with the file, the line, the correct alternative and
the path to record an exception.

**False positives monitored.** Two functions were adjusted for exceeding 5%; one —
"cyclomatic complexity above the limit" — was downgraded from blocking to a report, for not
distinguishing essential from accidental complexity.

**Four rules never automated**, kept explicitly as review matters: appropriateness of the
service boundary, domain modeling, justification of complexity and choice of consistency.

Results after 11 months:

```text
functions in operation                          9 (9 of the 22 verifiable rules)
violations in the 9 covered rules              26 (against 187 in the survey)
  of which with a recorded exception and deadline  18
verifiable rules still without a function      13 (still in review)
average time between introduction and detection minutes (before: months)
average false positive rate                   1.8%
incidents caused by direct access to
  another's database                            0 (against 2 the previous year)
code review time spent on
  rule checking                                reduced by ~60%
```

The 8 violations without an exception are being fixed, under warning. The 13 verifiable
rules without a function were not measured again: the 26 says nothing about them.

The last number in the table is what the team considers most important and the easiest to overlook:
automation did not replace review, it freed review. The conversations came to be about
boundaries and modeling — the four rules no function verifies.

The subsequent assessment points out: the 4 voluntary fixes during warning mode, with no
pressure at all, were the argument that convinced the organization to press on. Making it
visible solved two thirds of the problem before any blocking.

## Related Concepts

- [Governance Basics](/19-architecture-governance/governance-basics.md) — the intervention
  point.
- [Compliance](/19-architecture-governance/compliance.md) — the same mechanism, regulatory
  focus.
- [Exceptions](/19-architecture-governance/exceptions.md) — what to do about the legitimate
  case.
- [Architecture Evolution](/01-fundamentals/architecture-evolution.md).

## Practical Exercise

List your context's architectural rules and mark which are statable and measurable.

Then pick the one that has already caused damage and implement the simplest check that
catches it, in warning mode. The number of violations that appears is the measure of the
accumulated erosion.

## Interview Questions

- Which classes of architectural rule cannot become fitness functions?
- Why run in warning mode before blocking?
- Why is the false positive rate the most important health metric?

## Further Reading

- Ford, Neal et al. *Building Evolutionary Architectures*. 2nd ed. O'Reilly, 2022.
- Ford, Neal et al. *Software Architecture: The Hard Parts*. O'Reilly, 2021.
- Kim, Gene et al. *The DevOps Handbook*. 2nd ed. IT Revolution, 2021.

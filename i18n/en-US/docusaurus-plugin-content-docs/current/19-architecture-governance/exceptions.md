---
id: exceptions
title: Exceptions
sidebar_position: 6
description: The legitimate path to not meeting a standard — without it, non-compliance happens silently.
doc_type: concept
level: 6
difficulty: advanced
status: complete
objective: >
  By the end, the reader operates an exception process with a deadline, an owner and
  expiry, and knows how to read the pattern of exceptions as a diagnosis.
prerequisites: [governance-standards]
related: [governance-standards, compliance, governance-pathologies]
canonical_for: []
translated_from_version: 1
last_reviewed: 2026-08-31
---

# Exceptions

## Overview

Every standard meets a case where it doesn't apply. The question is not whether that will
happen, but what happens when it does:

```text
with no exception process   the standard is worked around silently
with a heavy process        the standard is worked around silently, more slowly
with a light process        the deviation is visible, with a deadline and an owner
```

An exception process is not a concession to indiscipline. It is the mechanism that **keeps
governance informed about reality** — and governance that doesn't know where it is being
disregarded governs nothing.

And there is a secondary use, more valuable than the first: the set of exceptions is the best
available diagnosis of the quality of the standards.

## Problem

With no legitimate path, non-compliance doesn't disappear — it becomes invisible.

```text
the team has to deliver
the standard doesn't apply or costs too much
asking for an exception takes six weeks and may be denied
the team proceeds and doesn't say
the audit finds out 14 months later, or never
```

The result is the worst possible: the deviation exists, nobody knows where, and the
organization believes it is compliant.

The opposite extreme has a different cost. Exceptions granted with no deadline become
permanent, and the standard dies by erosion — after thirty indefinite exceptions, there is no
standard left, only a document.

## Core Concepts

### Cheap to request, expensive to maintain

The correct asymmetry:

```text
request    a short form, an answer within days
grant      with a deadline, an owner and an exit plan
maintain   renewal requires justifying it again
```

That inverts the usual incentive. When requesting is expensive, people work around it
silently; when maintaining is expensive, the exception tends to resolve itself.

### A deadline is mandatory

```text
an exception with no deadline   becomes permanent by default
an exception with a deadline    has a date on which someone has to act
```

A 6 to 12 month deadline works in most cases. What matters less is the duration and more its
existence: the date is what forces the reassessment.

And expiry has to be **automatic**: the day after it lapses, the system shows up as a
deviation, with an alert to the owner. Without that, renewal depends on someone remembering,
and nobody remembers. See [compliance](/19-architecture-governance/compliance.md).

### What an exception has to record

```text
which standard                  the specific deviation
why                             the reason, with the cost of complying
what is done instead            the mitigation
what risk is accepted           and who accepts it
deadline                        the expiry date
exit plan                       what has to happen to converge
owner                           who answers for it
```

The exit plan is the field that distinguishes an exception from giving up. Without it, the
exception is a surrender with a date.

### Who approves depends on the risk

```text
low risk, reversible          the team records it, with no approval
medium risk                   approval from whoever owns the standard
security or regulatory risk   approval from whoever owns the risk
```

The first level is the most important and the most often absent. Low-risk exceptions that
only have to be **recorded** — not approved — maintain visibility without creating a queue,
and they are most of the cases.

### A permanent exception is a signal, not an exception

When an exception is renewed three times, it has stopped being an exception:

```text
the standard is wrong                     → fix the standard
the standard doesn't apply to that class  → narrow the standard's scope
the migration will never be a priority    → accept it formally and record it as debt
```

Maintaining the fiction that it is temporary costs renewal effort and distorts the compliance
metrics. See [standards](/19-architecture-governance/governance-standards.md).

### The set of exceptions is a diagnosis

This is the highest-value use, and the least exploited:

```text
a standard with many exceptions          the standard is wrong or too expensive
exceptions concentrated in one team      support is missing, or their context differs
exceptions concentrated in one class
  of system                              the standard's scope is too broad
exceptions always requested at the end
  of a project                           the standard isn't known in time
no exceptions requested at all           either the standard is perfect, or it is
                                         worked around
```

The last line deserves attention. Zero exceptions is usually a bad sign, not a good one.

### The cost of complying has to be recorded

```text
"complying would cost ~6 weeks of a team of 4, and the contractual deadline
is in 5 weeks"
```

That number is the input to two future decisions: whether the exception deserves renewal, and
whether the standard needs a better adoption path.

Without it, the renewal discussion starts from scratch, with qualitative arguments.

### The exception should not be cheaper than complying

A real risk of making the request easy: the exception becomes the default path.

```text
comply with the standard   2 weeks of migration
request an exception       5 minutes of form-filling
```

The correct asymmetry is not to eliminate that difference — it is inevitable, and it is why
the process exists. It is to ensure the exception **keeps costing** over time: a short
deadline, renewal with a fresh justification, and the deviation visible on a dashboard the
team and the manager can see.

What maintains the incentive is the persistence of the cost, not the height of the initial
barrier.

## Mental Model

**Cheap to request, with a deadline and automatic expiry.** With no legitimate path, the
deviation exists anyway — only invisible.

## When to Use

- Whenever there is a mandatory standard.
- With recording and no approval for low-risk deviations.
- With automatic expiry, without exception.
- Reading the set periodically as a diagnosis of the standards.

## When Not to Use

**With no deadline.**

**With no exit plan.**

**With a heavy process for low risk.**

**With no automatic expiry.**

**Renewing indefinitely** without acknowledging that the standard has to change.

**Without recording the cost of complying.**

## Alternatives

- **Narrow the standard's scope** — when the exceptions concentrate in one class, the
  problem is the scope.
- **Fix the standard** — when there are many exceptions.
- **Accept it as debt** — when convergence is not going to happen, recording it as debt is
  more honest than renewing an exception. See
  [technical debt](/01-fundamentals/technical-debt.md).
- **The standard as a recommendation** — if the exception is the rule, it should not be
  mandatory.

## Trade-offs

| Easy exception | Hard |
|---|---|
| Visible deviation | Silent deviation |
| Risk of erosion | Standard preserved on paper |
| Rich diagnosis | No information |

| With a short deadline | Long |
|---|---|
| Frequent reassessment | Less friction |
| Renewal cost | Becomes permanent |
| Pressure to converge | Stability |

## Failure Modes

**No process.** Silent non-compliance.

**A heavy process.** The same thing, with delay.

**No deadline.** Permanence by default.

**No automatic expiry.** Renewal depends on memory.

**A permanent exception kept as temporary.** An expensive fiction.

**The set never analyzed.** The best available diagnosis is lost.

## Common Mistakes

**Requiring approval for everything.**

**Not recording the cost of complying.**

**Having no exit plan.**

**Treating an exception request as a team failure**, which pushes the deviation into
silence.

**Not looking at the set** — exceptions are handled case by case and never read together.

## Real-World Example

An insurer had an architectural exception process with approval by a committee that met every
two weeks. The average time between request and answer: 24 days.

A two-year review found:

```text
exceptions formally requested                 31
granted                                       28
denied                                         3
with a defined deadline                        6
expired and still in use                      —  impossible to know
```

And an independent technical check, run over the systems, found:

```text
standard deviations detected in the systems  147
with a recorded exception                     22
with no exception                            125
```

Five times more silent deviations than recorded ones. In the interviews, the reason came up
consistently: 24 days didn't fit any schedule, and three known denials had created the
perception that asking was risky.

The redesign:

**Three levels by risk.** A low-risk deviation is **recorded** by the team, with no approval
— a five-field form, effective immediately. Medium risk goes to the standard's owner, with an
answer within 5 business days. Security or regulatory risk keeps approval, with an answer
within 10 days.

**A mandatory deadline**, at most 12 months, with automatic expiry — the system shows up as a
deviation again the next day.

**A mandatory exit plan**, with a named owner.

**The cost of complying recorded**, as estimated effort.

**A quarterly review of the set**, with one question: which standards are generating
exceptions, and why?

Eighteen months later:

```text
recorded exceptions                          119
deviations with no exception (technical check) 23
average time to an answer                      1.2 days (low risk: immediate)
exceptions expired and converged               61
exceptions renewed once                        31
renewed three times or more                     9
```

The 9 renewed three times were examined, and all pointed to the same diagnosis: two standards
were too broad. One of them required every service to publish events to the corporate bus —
which made no sense for read-only services. The scope was narrowed, and 7 of the 9 exceptions
ceased to be necessary.

And the quarterly review found another pattern: 14 exceptions concentrated in a single team.
Investigated, the reason was that this team maintained systems inherited from an acquisition,
with a different technological context. The response was to create a specific set of
standards for that class, instead of granting exceptions indefinitely.

In the retrospective: the number of exceptions **rose** from 31 to 119, and that was treated
as a success. What dropped was the invisible deviation — from 125 to 23. The metric that
mattered had never been the number of exceptions.

## Related Concepts

- [Standards](/19-architecture-governance/governance-standards.md) — what generates
  exceptions.
- [Compliance](/19-architecture-governance/compliance.md) — automatic expiry.
- [Pathologies](/19-architecture-governance/governance-pathologies.md) — the process that
  pushes people into silence.
- [Technical Debt](/01-fundamentals/technical-debt.md).

## Practical Exercise

Compare, in your context, the number of recorded exceptions with the number of deviations a
technical check would find.

The ratio between the two measures how much of the non-compliance is invisible — and it is a
number almost no organization knows.

## Interview Questions

- Why is zero exceptions requested usually a bad sign?
- What distinguishes an exception from giving up?
- Why can an increase in the number of recorded exceptions indicate improvement?

## Further Reading

- Ford, Neal et al. *Building Evolutionary Architectures*. 2nd ed. O'Reilly, 2022.
- Hohpe, Gregor. *The Software Architect Elevator*. O'Reilly, 2020.
- Dekker, Sidney. *The Field Guide to Understanding Human Error*. 3rd ed. CRC Press, 2014.

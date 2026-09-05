---
id: alerting
title: Alerting
sidebar_position: 7
description: What deserves to wake somebody up — and why most existing alerts do not.
doc_type: concept
level: 5
difficulty: advanced
status: complete
objective: >
  By the end, the reader keeps only actionable, symptom-based alerts, and eliminates
  the ones that produce fatigue.
prerequisites: [golden-signals]
related: [golden-signals, slo, sre-concepts]
canonical_for: []
translated_from_version: 2
last_reviewed: 2026-08-31
---

# Alerting

## Overview

An alert interrupts a person. That is the cost, and it is real: attention, lost context, sleep, wear.

The criterion that justifies that cost is narrow: **something is affecting users, or is about to, and there
is a human action that resolves it.**

Most of a typical system's alerts do not pass that test. They exist because somebody, at some point, wanted
to know about something — and nobody reviewed it afterward.

## Problem

The dynamic that produces an excess of alerts is well known:

An incident happens. The analysis concludes that an alert would have helped. The alert is created. That
repeats dozens of times over the years.

Nobody removes any. The result is a volume nobody can process, and the predictable human response:
**ignore**.

From then on, the alerts stop working — including the good ones. A team receiving forty notifications a day
does not react to the forty-first, even if it is the important one.

Alert fatigue is not a discipline problem. It is the expected consequence of a system that interrupts too
much.

## Core Concepts

### The three tests

Every alert that wakes somebody up needs to pass all three:

```text
urgent       it needs action now, it cannot wait for business hours
actionable   there is something the person can do
relevant     it affects users, or is about to
```

Failing any one means the alert should be something else: a prioritized task, a dashboard item, or nothing.

The actionability test is the most effective. An alert whose response is "look and see that it passed" is
not actionable — it is noise with the appearance of information.

### Alert on the symptom, not on the cause

```text
a cause     "CPU above 80%"
a symptom   "the checkout error rate is above the limit"
```

Alerting on causes produces two problems: it fires when there is no impact — high CPU can be normal — and
it does not fire when there is impact from a cause nobody anticipated.

Alerting on a symptom covers every cause, including the unknown ones, and it only fires when it matters.

The causes are still measured — they appear on the dashboard and are used for diagnosis. They simply do not
wake anybody up.

The legitimate exception: causes with high predictability and a deadline — "the certificate expires in 14
days", "the disk is full in 6 hours". They are actionable and they prevent the symptom.

### Base it on the error budget

See [SLO](/12-reliability/slo.md). Alerting when the budget is being consumed too fast replaces arbitrary
thresholds:

```text
a threshold   "error rate > 1%"  → fires on irrelevant spikes,
                                    does not fire on slow degradation
burn          "at the current pace, the month's budget runs out in 20 hours"
```

The second is proportional to the real impact and it allows graduating the response: fast burn wakes
somebody; moderate and prolonged burn becomes a prioritized task.

It is the change that most reduces alert volume with no reduction in coverage.

### Not everything needs to wake somebody up

Three destinations, and most current alerts belong to the last two:

```text
wake somebody   urgent, actionable, affecting users
a ticket        needs action, can wait for business hours
a dashboard     context information, with no action
```

The question that classifies it: **if this fires at 3 a.m., does somebody need to get up?** If the answer
is no, it is not an on-call alert.

Downgrading alerts to tickets is the fastest intervention for reducing fatigue, and it loses nothing — the
work still gets done, at a reasonable hour.

### Every alert needs context

A notification saying "error in the orders service" forces the person to start from zero, at 3 a.m., with
no context.

What a useful alert brings:

```text
what is happening, in terms of impact
since when
what the magnitude is
a link to the relevant dashboard
a link to the procedure, if there is one
what changed recently — deployments, configuration changes
```

The last item resolves a high fraction of incidents on its own, because most are caused by a recent change.

### Reviewing is part of the work

Alerts age: the system changes, the thresholds go wrong, the cause was fixed.

The practice that sustains it: a periodic review, with data.

```text
alerts that fired and generated no action   → candidates for removal
alerts that never fired in 12 months        → check whether they still make sense
alerts that fire frequently                 → the problem should be fixed
incidents with no corresponding alert       → a coverage gap
```

The third line is the most important: an alert that fires every week is not an alert, it is a known problem
nobody prioritized.

## Mental Model

**An alert is an interruption with a human cost.** If there is no urgent action, it is something else.

## When to Use

- A symptom affecting users, with an action available.
- Accelerated error budget consumption.
- A predictable condition with a deadline — a certificate, a quota, a disk.
- A protection mechanism failing.
- The absence of something that should happen — a task not executed, traffic ceased.

## When Not to Use

**On causes** with no direct impact.

**With no possible action.**

**For what can wait for business hours.**

**With an arbitrary threshold**, when an error budget is available.

**With no context in the notification.**

**With no periodic review.**

## Alternatives

- **A prioritized ticket** — for what needs action with no urgency.
- **A dashboard item** — for context.
- **An [SLO](/12-reliability/slo.md)-based alert** — proportional to the impact.
- **Automatic remediation** — when the action is always the same, automate instead of alerting. The best
  alert is the one that stops existing.

## Trade-offs

| Few alerts | Many |
|---|---|
| Each one is taken seriously | Ignored |
| A gap risk | Broad coverage |
| Review necessary | Accumulation |

| A symptom | A cause |
|---|---|
| Covers unknown causes | Only the anticipated ones |
| Fires when it matters | Also when it does not |
| Diagnosis still necessary | It points at the cause |

## Failure Modes

**Fatigue.** The volume makes them all ignorable.

**An alert with no action.** The person wakes up and does nothing.

**A wrong threshold.** It fires in a normal condition, or does not fire in an abnormal one.

**A coverage gap.** An incident with no alert.

**A cascading alert.** One cause fires twenty alerts from dependent services.

**Permanently silenced.** Somebody silenced it during an incident and did not re-enable it.

**An alert about the alerting system itself.** When it fails, nobody knows.

## Common Mistakes

**Alerting on causes.** High CPU can be normal; what needs to wake somebody up is a symptom with impact — a
user unable to complete something. Alerting on a cause generates noise and trains the team to ignore it.

**Not classifying between wake-up, ticket and dashboard.** Treating everything as urgent exhausts the
on-call, and the important alert arrives alongside thirty that were not.

**Not reviewing.** Alerts accumulate from past incidents and are never removed. With no periodic review,
most firings come to be from rules that no longer make sense.

**A notification with no context.** An alert that does not say the impact, what to check and where to look
transfers to whoever was woken the work of discovering why they were woken.

**Not alerting on absence.** A process that stopped running generates no error. Only checking by
expectation — it should have happened and it did not — detects that.

**Not grouping cascading alerts.** One root cause fires forty notifications from dependent services, and
the cause's signal is lost among the consequences.

## Real-World Example

A logistics platform had 214 alerts configured. The on-call received, on average, **31 notifications a
day**.

The consequence was predictable: the notifications were silenced en masse, and two real incidents had gone
unnoticed for hours.

The review, done with twelve months of data:

```text
fire and nobody acts             118 → 84 removed, 34 downgraded to a ticket
never fired in 12 months          47 → 31 removed, 16 fixed
fire weekly                       22 → 11 automated, 11 became tasks
actionable and urgent             27 → kept
                                 ————
                                  214
```

The 22 in the third line were the most interesting finding: each one represented a recurring problem the
team had learned to live with, responding to the alert and executing the same action. Eleven of them were
automated; the other eleven became fix tasks.

The reformulation:

**43 active alerts** — the 27 actionable ones plus the 16 that had never fired because of a configuration
defect and now do.

**Error budget alerts** for the three critical journeys, replacing nine of those 43 that were
threshold-based. The final configuration came to **37**.

**Downgrading to a ticket** for the 34 that needed action with no urgency — the ones that fired and nobody
acted on, but that described a real condition.

**Cascade grouping**: when a dependency fails, the alerts from the services depending on it are suppressed
and grouped into the cause's notification.

**Context in the notification**: impact, magnitude, duration, a link to the dashboard, and the last two
hours' changes.

**A quarterly review** with the same four criteria.

Result: from 31 notifications a day to **1.4**. And the average response time fell, because each
notification came to be taken seriously.

The learning that stuck: the 115 removed alerts had been created by reasonable people, each in response to
a real incident. None was an individual mistake — the mistake was never reviewing.

## Related Concepts

- [Golden Signals](/13-observability/golden-signals.md) — the basis.
- [SLO](/12-reliability/slo.md) — the proportional alert.
- [SRE Concepts](/13-observability/sre-concepts.md).
- [Dashboards](/13-observability/dashboards.md) — the destination for what is not an alert.

## Practical Exercise

Take the alerts that fired last month and classify each one: did it generate urgent action, deferrable
action, or no action?

The third category is usually the largest — and removing it is the highest-return intervention available.

## Interview Questions

- What are the three tests an on-call alert needs to pass?
- Why alert on a symptom and not on a cause?
- What does an alert that fires every week mean?

## Further Reading

- Beyer, Betsy et al. *Site Reliability Engineering*. O'Reilly, 2016 — chapter 6.
- Beyer, Betsy et al. *The Site Reliability Workbook*. O'Reilly, 2018 — chapter 5.
- Ewaschuk, Rob. *My Philosophy on Alerting*, 2013.

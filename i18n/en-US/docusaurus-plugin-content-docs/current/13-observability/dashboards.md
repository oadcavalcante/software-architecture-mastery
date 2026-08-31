---
id: dashboards
title: Dashboards
sidebar_position: 8
description: What they are for — and why the tracking dashboard is different from the investigation one.
doc_type: concept
level: 5
difficulty: intermediate
status: complete
objective: >
  By the end, the reader designs dashboards with a defined purpose and avoids the
  accumulation that makes them useless.
prerequisites: [golden-signals]
related: [golden-signals, metrics, alerting]
canonical_for: []
translated_from_version: 1
last_reviewed: 2026-08-31
---

# Dashboards

## Overview

A dashboard is a selection of visualizations gathered to answer a set of questions.

The almost universal problem: dashboards are built with nobody having written down which questions they
answer. The result is a wall of graphs nobody can interpret under pressure.

And there is a distinction that resolves much of that: **tracking** and **investigating** are different
purposes, and they require different dashboards.

## Problem

The typical dashboard grows by accumulation. Each incident adds a graph; each person adds what interests
them.

After two years: 60 graphs, with no hierarchy, no indication of what is normal, no reading order.

During an incident, at 3 a.m., somebody opens that dashboard and needs to decide where to look. The excess
of information does not help — it delays.

## Core Concepts

### Two purposes, two dashboards

```text
tracking        is the system fine?
                a few numbers, high level, compared with the expected
                for whoever is not investigating anything

investigation   what is happening?
                detailed, with context, ordered by hypothesis
                for whoever is in the middle of an incident
```

Mixing the two produces a dashboard that serves both uses badly: too detailed to track, too shallow to
investigate.

The tracking one fits on one screen and is read in ten seconds. The investigation one can be long, as long
as it is ordered.

### The dashboard needs to say what is normal

A graph showing 340 ms of latency informs nothing to somebody who does not know the service.

What makes a dashboard readable:

```text
a visible threshold     the line of what is acceptable
a temporal comparison   the same period the previous week
an expected range       the normal interval for that hour
event annotations       deployments, configuration changes
```

The last has the greatest return: overlaying the deployments on the graph answers, visually, any incident's
most frequent question — "did something change?".

### Order by hypothesis

A well-built investigation dashboard has a reading order:

```text
1. user impact             SLIs, error rate per journey
2. which components        errors and latency per service
3. what changed            deployments, configuration, traffic
4. resource saturation     connections, memory, queues
5. external dependencies   latency and errors of outbound calls
```

That order corresponds to the path an investigation naturally follows, and it prevents the person from
starting at the detail.

A dashboard with no order forces each person to build their own sequence, under pressure, from scratch.

### One dashboard per service, standardized

Standardization is worth more than individual optimization.

If every service has the same dashboard — [golden signals](/13-observability/golden-signals.md), in the
same position, with the same scales —, somebody investigating an unfamiliar service knows where to look.

Handcrafted dashboards, each with its own layout, force you to learn how to interpret each one.

Generating the service dashboards from a template, and not by hand, is what sustains that over time.

### Dashboards age too

Metrics get renamed, services are removed, graphs stop working.

A dashboard with three broken graphs loses credibility entirely — people stop trusting what they see.

The periodic review is the same as for [alerts](/13-observability/alerting.md): what is not consulted, and
what is broken.

### A dashboard replaces neither alerts nor free investigation

**It does not replace alerts.** Nobody sits watching dashboards. See
[alerting](/13-observability/alerting.md).

**It does not replace ad hoc querying.** The dashboard answers anticipated questions; investigating a new
incident requires formulating questions nobody anticipated. See
[debuggability](/13-observability/debuggability.md).

A team that can only investigate through what is on the dashboard has monitoring, not observability.

### A permanently displayed dashboard has another requirement

A dashboard on a screen in the team's area is read at a glance, by people who are not investigating
anything — and sometimes by people who are not on the team.

That imposes constraints the others do not have:

**Legible from a distance.** Few elements, large typography, no dense graphs.

**State, not a series.** "All green" or "checkout degraded" communicates; a time series with variation
requires interpretation.

**No false alarms.** A dashboard that goes red on normal variation trains people to ignore it — the same
mechanism as alert fatigue.

**No sensitive data.** It is visible to visitors, to passers-by, and in office photos. Revenue figures and
customer names do not belong there.

The last is the most forgotten and has already produced leaks through photos published on social media.

The content that works in that format is the same as the tracking dashboard's, with even fewer elements:
the state of the critical journeys, active incidents, and nothing more.

## Mental Model

**A dashboard answers a set of questions.** If the questions were not written down, the dashboard is a
collection of graphs.

## When to Use

- Tracking a service's health.
- Structured investigation during an incident.
- Communicating state to the business.
- Trend and capacity analysis.

## When Not to Use

**As a substitute for alerts.**

**Mixing tracking and investigation.**

**With no threshold or comparison.** Numbers with no reference.

**Handcrafted per service**, when standardization is possible.

**With no review.**

**As the only way to investigate.**

## Alternatives

- **[Alerts](/13-observability/alerting.md)** — for what needs a reaction.
- **Ad hoc querying** — for new questions.
- **A periodic report** — for trends that do not need real time.
- **A template-generated dashboard** — instead of hand-built.

## Trade-offs

| Few graphs | Many |
|---|---|
| Readable under pressure | Complete |
| Context may be missing | Nobody finds anything |
| Easy to maintain | It ages |

| Standardized | Handcrafted |
|---|---|
| Familiar on any service | Optimized for one |
| Template-generated | Manual maintenance |

## Failure Modes

**A wall of graphs.** An excess that delays instead of helping.

**No reference for what is normal.**

**Broken graphs.** The dashboard loses credibility.

**No change annotations.**

**Misleading scales.** A truncated axis that exaggerates normal variation.

**A tracking dashboard used to investigate**, and vice versa.

**Dependence on the dashboard.** Nothing beyond it can be investigated.

## Common Mistakes

**Not writing down the questions** the dashboard answers.

**Accumulating with no removal.**

**Not overlaying deployments.**

**Not standardizing across services.**

**Not indicating the threshold.**

**Confusing the two purposes.**

## Real-World Example

A logistics platform had a main dashboard with 64 graphs, built over four years.

In an incident analysis, one finding: the average time between the alert and identifying the affected
component was 22 minutes — and people reported opening the dashboard, not finding what they needed, and
going straight to ad hoc queries.

The dashboard had stopped being used, with nobody having decided that.

The reformulation separated the purposes:

**A tracking dashboard** with 7 graphs, fitting on one screen: SLIs for the three critical journeys, total
traffic, error rate, remaining error budget, and active incidents. Read in ten seconds, displayed on a
screen in the team's area.

**An investigation dashboard**, ordered by hypothesis: impact, components, recent changes, saturation,
external dependencies. Long, with collapsible sections.

**Per-service dashboards**, template-generated from the golden signals. The 14 services came to have an
identical layout.

**Deployment annotations** on every time series graph.

**An expected range** by hour, calculated from the history — which made visible what is normal variation.

**Removal** of the 64 old graphs, after verifying which were actually consulted: 11.

The average time between alert and identification fell to 6 minutes.

What the team records: the larger effect did not come from the reorganization, it came from the deployment
annotations. A high fraction of incidents is caused by a recent change, and the visual correlation answered
the question before any investigation.

## Related Concepts

- [Golden Signals](/13-observability/golden-signals.md) — the standard content.
- [Alerting](/13-observability/alerting.md) — what is not a dashboard.
- [Metrics](/13-observability/metrics.md) — the source.
- [Debuggability](/13-observability/debuggability.md) — what the dashboard does not cover.

## Practical Exercise

Open your team's main dashboard and count how many graphs you can interpret without asking anybody.

Then ask: which questions does this dashboard answer? If nobody can say, it has no defined purpose.

## Interview Questions

- Why do tracking and investigating require different dashboards?
- Why do deployment annotations have such a high return?
- Why is standardizing worth more than optimizing each dashboard?

## Further Reading

- Beyer, Betsy et al. *The Site Reliability Workbook*. O'Reilly, 2018.
- Tufte, Edward. *The Visual Display of Quantitative Information*. 2nd ed., 2001.
- Wilkie, Tom. *The RED Method*, 2018.

---
id: sre-concepts
title: SRE Concepts
sidebar_position: 9
description: The vocabulary and practices that organize operations at scale — and what is lost by adopting only the name.
doc_type: concept
level: 5
difficulty: advanced
status: complete
objective: >
  By the end, the reader recognizes which SRE practices apply to their context and
  which depend on scale they do not have.
prerequisites: [observability]
related: [slo, alerting, resilience]
canonical_for: []
translated_from_version: 1
last_reviewed: 2026-08-31
---

# SRE Concepts

## Overview

Site reliability engineering is an approach to operations that treats reliability as a software engineering
problem, not a systems administration one.

It brought a set of practices and a vocabulary that spread widely — [SLO](/12-reliability/slo.md), the
error budget, blameless incident analysis, reducing toil.

And what also spread was the pattern of adopting the **name** without the practices: renaming the
operations team to SRE and continuing to operate the same way.

## Problem

SRE's practices were born in a specific context — very large scale, dedicated engineering teams, systems
with thousands of machines.

Not everything transfers. Some practices require scale; others require organizational autonomy the company
does not have; others apply to any context.

Adopting everything indiscriminately produces ceremony. Adopting only the name produces frustration.

The work is telling them apart.

## Core Concepts

### What transfers to practically any context

```text
an SLO with an error budget    an agreed target and a rule for what to do when it runs out
alerting on symptoms           see alerting
blameless analysis             the information only appears with no fear
reducing toil                  automating the repetitive
sustainable on-call            rotation, compensation, an interruption limit
```

Those five do not depend on scale. They depend on an organizational decision, and they are the ones that
most change a small team's day-to-day.

See [SLO](/12-reliability/slo.md) and [alerting](/13-observability/alerting.md).

### What depends on scale

```text
a separate SRE team           requires volume that justifies specialization
engagement with criteria      SRE takes over operations if the service meets requirements
building your own platform    it costs a team
sophisticated automation      the return depends on repetition at volume
```

At a company with thirty engineers, a separate SRE team usually creates the division the approach wanted to
eliminate — those who build and those who operate.

There, the model that works is the team that builds operating what it builds, with SRE practices applied by
itself.

### Toil: what counts and why to limit it

Toil, in SRE's vocabulary, has a precise definition:

```text
manual              it requires a person
repetitive          it has been done before, it will be done again
automatable         it requires no judgment
no lasting value    the system is no better afterward
grows with the service  more traffic, more of that work
```

Not all operational work is toil in that sense: investigating a new incident requires judgment and produces
learning.

The criterion the practice establishes — limiting toil to a fraction of the time, typically half — exists
because it grows naturally until it consumes all the available time, and then there is no capacity left to
eliminate it.

Measuring the fraction is the first step, and it usually reveals uncomfortable numbers.

### Blameless incident analysis

The practice is frequently misunderstood. It is not about being kind.

It is about **obtaining information**: if people fear consequences, they omit — and the analysis comes out
wrong, producing fixes that do not attack the cause.

What characterizes an analysis that works:

```text
a focus on conditions     "why did that action seem reasonable at the moment?"
a factual timeline        what was known, when
multiple causes           there is rarely only one
actions with an owner and a deadline  without that, nothing changes
published                 the learning belongs to the organization
```

The second line is the test: an analysis concluding "the engineer made a mistake" explains nothing. Every
mistake seemed reasonable to whoever made it, with the information they had — and understanding why is what
allows changing the system.

### On-call needs to be sustainable

A practice that is ethical and operational at the same time: exhausted people decide worse at the moment
the decision matters most.

```text
sufficient rotation     no more than one week in four or five
limited volume          a maximum number of interruptions per shift
compensation            formal recognition of the burden
procedures              they reduce the cognitive load
time to fix             whoever was woken has time to attack the cause
```

The last item is what closes the loop: with no time allocated to fix what caused the page, the same alert
comes back the following week.

And the interruption limit is what makes an excess of alerts visible as a problem, instead of being
silently absorbed by the people. See [alerting](/13-observability/alerting.md).

### Reliability competes with functionality

The error budget exists to make that competition explicit and resolvable by rule, instead of by political
negotiation every quarter.

See [SLO](/12-reliability/slo.md). Without it, the "we need to stabilize" versus "we need to ship"
discussion repeats indefinitely, and the second wins for lack of a numeric argument from the first.

## Mental Model

**SRE treats operations as engineering.** Adopt the practices that do not depend on scale; the others
require context you may not have.

## When to Use

- Systems with continuous operation and on-call.
- Where reliability competes with delivery with no decision criterion.
- Where operational work consumes engineering capacity.
- Where incidents repeat with no learning.

## When Not to Use

**Renaming the team without changing the practices.**

**A separate SRE team** in a small organization.

**Adopting every practice** regardless of the context.

**Incident analysis looking for a culprit.** Worse than not doing it.

**With no autonomy to act.** A team that cannot prioritize fixes cannot sustain an error budget.

**On-call with neither compensation nor a limit.**

## Alternatives

- **The team that builds operates what it builds** — the model appropriate to most organizations.
- **An internal platform** — it reduces every team's operational work without creating a division. See
  [DevOps and platform](/14-devops-and-platform/index.md).
- **Partial adoption** — the five practices that transfer, with none of the structure.

## Trade-offs

| A separate SRE team | Each team operates its own |
|---|---|
| Specialization | Product context |
| A risk of recreating the division | No barrier |
| Requires scale | Works at any size |
| Standardization | Variation between teams |

| An error budget | Case-by-case negotiation |
|---|---|
| A rule agreed beforehand | A discussion each time |
| Requires a target and measurement | Nothing |

## Failure Modes

**The name with no practice.** Operations renamed.

**A budget with no consequence.** It runs out and nothing changes.

**Analysis that blames.** The information disappears.

**Toil consuming all the time.** With no capacity to eliminate it.

**Unsustainable on-call.** Turnover and worse decisions.

**Practices adopted with no autonomy.** The team measures and cannot act.

## Common Mistakes

**Adopting the vocabulary without the decisions.**

**Creating a separate team prematurely.**

**Not measuring the toil fraction.**

**Not allocating time to fix** what caused the pages.

**Incident analysis with no tracked actions.**

**Not limiting interruptions per shift.**

## Real-World Example

A technology company with 80 engineers created a five-person SRE team, transferring the operation of every
service to it.

Eighteen months later, the result was the opposite of what was intended:

**The SRE team became a bottleneck.** Every deployment and every infrastructure change went through it.

**The division came back.** The product teams stopped worrying about operations — "that is SRE's" —, and
the operational quality of what was built got worse.

**Toil dominated.** An informal measurement indicated that around 80% of the team's time was repetitive
operations. There was no capacity left to automate.

**Turnover.** Three of the five people left during the period.

The reformulation abandoned the structure and kept the practices:

**Each team operates what it builds**, with its own on-call.

**The platform team** — what remained of SRE, with two people and later four — came to build tools, not
operate services: pipelines, standardized telemetry, generated dashboards, procedures.

**SLOs per service**, defined with product, with an agreed freeze rule.

**Blameless incident analysis**, published internally, with tracked actions.

**An interruption limit**: more than five nighttime pages in a one-week shift triggers a mandatory review
of that service's alerts.

**Allocated time**: whoever was on call has the following week's first two days to fix what woke them.

In the following twelve months, nighttime pages fell 70%, and the platform team's toil fraction went from
80% to around 30%.

The point the team underlines: the practices were correct from the start; the structure was wrong for the
company's size. And the last change — allocated time to fix — was the one that most reduced pages, because
it closed the loop between being woken and eliminating the cause.

## Related Concepts

- [SLO](/12-reliability/slo.md) — the central mechanism.
- [Alerting](/13-observability/alerting.md) — sustainable on-call.
- [Resilience](/12-reliability/resilience.md) — the learning.
- [DevOps and Platform](/14-devops-and-platform/index.md).

## Practical Exercise

Measure the fraction of your team's time spent on repetitive, automatable work with no lasting value, over
two weeks.

If it exceeds half, there is no capacity to eliminate it — and it is going to grow.

## Interview Questions

- Which SRE practices transfer to any context, and which depend on scale?
- What characterizes toil, and why limit it?
- Why is blameless analysis about information, not about kindness?

## Further Reading

- Beyer, Betsy et al. *Site Reliability Engineering*. O'Reilly, 2016.
- Beyer, Betsy et al. *The Site Reliability Workbook*. O'Reilly, 2018.
- Allspaw, John. *Blameless PostMortems and a Just Culture*, 2012.

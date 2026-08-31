---
id: enterprise-governance
title: Enterprise Governance
sidebar_position: 12
description: How decisions cross the organization — designed as flow, not as a power structure.
doc_type: concept
level: 6
difficulty: advanced
status: complete
objective: >
  By the end, the reader designs governance that reduces friction where possible and
  concentrates rigor where it matters.
prerequisites: [architecture-levels]
related: [architecture-levels, architecture-review, enterprise-principles]
canonical_for: []
translated_from_version: 1
last_reviewed: 2026-08-31
---

# Enterprise Governance

## Overview

Architecture governance is the set of mechanisms by which technical decisions happen
coherently in an organization with many teams.

It is frequently designed as a **power structure** — who approves what — when it should
be designed as a **flow**: how a decision happens, who takes part, and how long it takes.

The difference is practical: the first optimizes control; the second optimizes decision
quality per unit of time.

## Problem

Governance grows by reaction. Each incident produces a new control, and none is removed.

```text
one bad technology choice        → an approved list
two divergent integrations       → an integration committee
one leak                         → a mandatory security review
one unexpected cost              → infrastructure approval
```

Each control is reasonable in isolation. The aggregate is a process in which a simple
change takes weeks, and teams learn to work around it.

And the workaround is the worst outcome: governance stops producing coherence and keeps
producing friction.

## Core Concepts

### Govern by exception

The principle that changes the economics of the process:

```text
traditional    everything passes through the control; what is approved proceeds
by exception   everything proceeds; what departs from the standard passes through
               the control
```

See [architecture levels](/15-enterprise-architecture/architecture-levels.md). Most decisions are local and
reversible — and running them all through a control spends attention where it does not
pay off.

What makes that viable is the **paved road**: if the standard is built into what the team
already uses, following the standard requires no verification. Only the deviation does.
See [internal developer platforms](/14-devops-and-platform/internal-developer-platforms.md).

Governance that has to verify what is already standard has not operationalized the
standard.

### The mechanisms, from lightest to heaviest

```text
paved road              the standard built in — no process
automated verification  the pipeline validates — no person
principles              guide judgment — no verification
consultation            an opinion available — no obligation
peer review             another team looks — no hierarchy
approval                someone decides — the most expensive
```

The correct design uses the lightest mechanism that solves the problem. Approval is the
last resort, and it is usually the first adopted.

And there is a useful rule: if a control could have been automated and wasn't, it is at
the wrong level.

### Friction has to be measured

Governance has a cost, and it is invisible unless measured:

```text
time between proposing and starting
number of people involved per decision
share of proposals that change because of the process
share that is rejected
number of workarounds observed
```

The third and the fourth together tell you whether the process adds anything: if the rate
of change is low and the rejection rate is too, the process is waiting.

And the last is the most honest signal: circumvention is not indiscipline, it is a
response to friction that doesn't pay for itself. See
[infrastructure as code](/14-devops-and-platform/infrastructure-as-code.md) — the same
dynamic.

### Rigor should follow reversibility

```text
reversible, local reach    no control
reversible, broad reach    visibility — a record, not approval
irreversible, local        peer review
irreversible, broad        approval, with time and written alternatives
```

Applying uniform rigor is the most common structural error. It makes the process slow for
the trivial and insufficient for what matters — because attention is finite and gets
diluted.

### Governance has to be reviewed like any other system

Controls created in response to specific incidents remain after the cause has been
resolved.

The periodic review asks, for each control:

```text
which incident does it prevent?
is that incident still possible, or was it solved some other way?
how many times did it catch something in the last 12 months?
how much does it cost in aggregate time?
could it be automated?
```

The third question is usually revealing: controls that have caught nothing in years are
pure cost.

### Governance of content, not of process

The distinction that separates useful governance from bureaucracy:

```text
of process   checks whether the steps were followed — form filled in, meeting held
of content   checks whether the decision is good — alternatives, premises, consequences
```

The first is easy to operate and improves nothing. The second requires judgment and is
the one that justifies the cost.

A process that checks whether the form was filled in, without reading the content, is
ceremony.

### Governance needs an owner who reduces it

An organizational characteristic of controls: they have people who create them and nobody
who removes them.

Each control is born from an incident, with a clear champion. Removing it requires
someone willing to take on the risk of the incident returning — and nobody has that
incentive.

What corrects it is explicitly assigning the responsibility to **reduce** the process,
with the same legitimacy as whoever creates it:

```text
mandatory periodic review, with effectiveness data
an expiry date on new controls — they lapse if not renewed
a friction metric tracked like any other
```

The second is the most effective and the least used: a control created with a twelve-month
term has to be justified to continue, which inverts the burden.

Without that, governance only grows — and the organization attributes the slowness to
diffuse causes, rather than to the sum of individually reasonable decisions.

## Mental Model

**Governance is flow, not structure.** Use the lightest mechanism that solves the
problem, and measure the friction.

## When to Use

- Organizations with many teams.
- Where divergence has a real cost.
- For decisions with broad reach and expensive rollback.
- Where there is a regulatory requirement.

## When Not to Use

**With uniform rigor.**

**Verifying what is already the standard.**

**Without measuring friction.**

**Without reviewing controls.**

**Of process instead of content.**

**As a power structure** instead of a decision flow.

## Alternatives

- **Paved road** — removes the decision instead of governing it.
- **Automated verification** — for what is objective.
- **A record instead of approval** — visibility without a bottleneck.
- **After-the-fact review** — for the reversible, look at patterns periodically.

## Trade-offs

| Light governance | Heavy |
|---|---|
| Speed | Coherence |
| Risk of divergence | Less |
| Responsible teams | Central control |
| Requires maturity | Works without it |

| By exception | Universal |
|---|---|
| Attention where it matters | Broad coverage |
| Requires an operationalized standard | Works without one |

## Failure Modes

**Accumulation of controls.**

**Circumvention.** The process is avoided.

**Diluted attention.** Everything is checked, nothing in depth.

**Governance of process.** Forms filled in, bad decisions.

**A control with no associated incident.** Nobody knows why it exists.

**Approval as a rubber stamp.**

## Common Mistakes

**Creating a control for every incident.** Each response looks reasonable in isolation; the accumulation produces a process nobody can follow in full, and non-compliance becomes the norm.

**Not removing controls.** Controls only come in. Without a review that withdraws the ones that stopped making sense, the cost grows indefinitely on everyone.

**Uniform rigor.** Demanding the same of a text change and a data migration wastes rigor where it isn't needed and discredits the process where it is.

**Not measuring the aggregate cost.** Each control costs little; nobody adds them up. The number of days a change takes from ready to production is the measure that reveals the total.

**Not automating the automatable.** A control checked by a person is expensive, slow and fails inconsistently. Automated verification is cheaper and doesn't get tired.

**Confusing following the process with making a good decision.** Compliance and quality are different things; a well-followed process can produce a bad decision without any control flagging it.

## Real-World Example

A financial services company had 11 architecture governance controls, accumulated over
six years.

The audit measured each one:

```text
control                          times it caught something in 12 months   est. annual cost
approved technology list          2                                        180 hours
architecture committee           11                                        640 hours
infrastructure approval           0                                        220 hours
security review                  23                                        310 hours
cost approval above X             4                                         90 hours
personal data review              8                                        120 hours
five other controls               1 (combined)                             380 hours
```

Total: about 1,940 hours a year — close to one full-time person — for 49 findings.

And the analysis of the 49 showed that 31 could have been detected automatically.

The rework:

**Five controls automated.** Personal data review, cost approval, verification of
objective security standards and two infrastructure checks became rules in the pipeline.
Cost close to zero, greater coverage.

**Three controls removed.** Including infrastructure approval, which had caught nothing
in twelve months and whose original cause — an unexpected cost — had been solved by
budget alerts.

**Committee reduced** to decisions with broad reach and expensive rollback, about one a
month.

**Security review kept**, with a scope — only systems handling sensitive data — and
carried out as a consultation during design, not as an approval at the end. See
[architecture review](/15-enterprise-architecture/architecture-review.md).

**Paved road** replacing the technology list.

**Annual review of controls**, with the five questions.

Result: governance cost from 1,940 down to about 400 hours, and the number of findings
rose to 74 — because automation covers more and human attention came to concentrate on
what requires judgment.

The detail the team highlights: infrastructure approval had been created after a cost
incident, four years earlier. The problem was solved by another mechanism two years
later, and the control remained — like almost all of them.

## Related Concepts

- [Architecture Levels](/15-enterprise-architecture/architecture-levels.md) — what to govern.
- [Architecture Review](/15-enterprise-architecture/architecture-review.md) — the mechanism.
- [Enterprise Principles](/15-enterprise-architecture/enterprise-principles.md).
- [Architecture Governance](/19-architecture-governance/index.md) — the in-depth
  treatment.

## Practical Exercise

List your organization's governance controls and, for each one, answer: how many times
did it catch something in the last twelve months, and how much did it cost in hours?

The ones that caught nothing are pure cost.

## Interview Questions

- What does governing by exception mean, and what makes it viable?
- Why is uniform rigor the structural error?
- What is the difference between governance of process and of content?

## Further Reading

- Weill, Peter; Ross, Jeanne. *IT Governance*. HBS Press, 2004.
- Hohpe, Gregor. *The Software Architect Elevator*. O'Reilly, 2020.
- Forsgren, Nicole et al. *Accelerate*. IT Revolution, 2018.

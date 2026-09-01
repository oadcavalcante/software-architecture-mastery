---
id: leadership-governance
title: Governance from the Setter's Perspective
sidebar_position: 11
description: Designing mechanisms with an owner, a declared cost and an expiry date — and having a process for removing them.
doc_type: concept
level: 7
difficulty: advanced
status: complete
objective: >
  By the end, the reader designs a governance mechanism with an owner, a measure and a deadline, and
  institutes the practice of removing mechanisms.
prerequisites: [architecture-leadership-basics]
related: [leadership-principles, leadership-standards, fitness-functions]
canonical_for: []
translated_from_version: 1
last_reviewed: 2026-08-31
---

# Governance from the Setter's Perspective

## Overview

The [previous level](/19-architecture-governance/index.md) describes how governance operates. This
document covers whoever **creates** it — and the difference is large, because the creator has a
responsibility the operator does not:

```text
operating   making the mechanism work
creating    deciding whether it should exist, and for how long
```

Every organization has a process for adding mechanisms: an incident happens, a control is created.
Almost none has a process for removing them — and that asymmetry is the cause of all bureaucratic
accumulation.

```text
adding     has an owner, urgency and an incident to justify it
removing   has no owner, is politically risky, and the
           benefit is diffuse
```

Whoever establishes governance has to design the second half too.

## Problem

The typical mechanism is born like this:

```text
incident   a service went to production without a security review
response   every release now requires security approval
result     three years later, 400 approvals a year, of which
           two found something
```

The original response was proportional to the incident. It stopped being proportional when the
organization built automated security checking and nobody revisited the manual mechanism.

And there is a second pattern: the mechanism created with no measure. It cannot be assessed, because
what it should produce was never defined — and without that, the discussion about keeping it is a
discussion about opinion.

## Core Concepts

### Every mechanism is born with four fields

```text
the risk it addresses          specific, not a category
how the effect will be measured  how many times it caught something
the estimated cost             average delay × volume
the owner                      a role, not an area
the expiry date                24 months at most
```

The last two are what almost every existing mechanism lacks. With no owner, it isn't adjusted; with
no expiry, it is permanent by omission.

See [measuring governance](/19-architecture-governance/measuring-governance.md).

### Pick the earliest viable point of intervention

Before creating a human mechanism, the question:

```text
"can this be prevented in the environment or in the template,
 instead of being verified by someone?"
```

```text
in the environment   the wrong path doesn't exist
in the template      it is born correct
in the pipeline      it fails automatically
in a review          someone notices
in a committee       someone notices weeks later
```

A human mechanism created when an automated one was viable costs forever. See
[governance basics](/19-architecture-governance/governance-basics.md).

### An annual removal target

The structural intervention that solves accumulation:

```text
"we remove at least one mechanism a year"
```

That gives the act of removing an owner, which was what was missing. And it forces a review of the
whole set, because choosing which one to remove requires looking at all of them.

An organization that has never removed a mechanism has, with high probability, more mechanisms than
it needs — and the diagnosis holds regardless of which one you examine first.

### Suspending beats arguing

```text
arguing about whether a mechanism is necessary   indefinite arguments
suspending it for a quarter                      evidence in three months
```

Temporary suspension is the most effective instrument and the hardest to get authorization to use. It
produces evidence no analysis produces, and it is applicable to everything except regulatory and
critical-security controls.

### Proportionality to risk, always

```text
a regulated critical system    a heavy mechanism is justified
an internal tool used
  occasionally                 the same mechanism is waste
```

Applying governance uniformly is the error that consumes the organization's patience on irrelevant
cases — and the patience runs out precisely when an important case comes along.

Scaling by criticality requires a classification that should already exist for other reasons:
disaster recovery, incident response, access control.

### Whoever creates it has to operate it for a while

An uncommon and revealing practice: whoever proposes a mechanism operates it for the first few
months.

That produces two things. The mechanism's cost becomes visible to whoever created it, and not only to
whoever suffers it. And the design improves fast, because whoever feels the friction has both the
incentive and the authority to adjust it.

The practice also corrects a common asymmetry: mechanisms tend to be proposed by whoever is
accountable for a risk and operated by whoever is accountable for delivery, which separates whoever
decides the cost from whoever pays it. Joining the two roles for a few months is the cheapest
intervention against disproportionate proposals, and it requires no process at all — just the rule.

### Good governance is invisible

```text
a visible mechanism     someone has to do something extra
an invisible mechanism  the easy path is already the correct one
```

The goal of whoever establishes governance should be to make the mechanisms unnecessary — moving what
they verify into the platform, the template and the pipeline.

A governance group whose success is measured by the number of mechanisms operated has the incentive
inverted. See
[platform engineering](/14-devops-and-platform/platform-engineering.md).

## Mental Model

**Every mechanism is born with an owner, a measure and an expiry.** And the organization needs a
removal target, because adding has an owner and removing doesn't.

## When to Use

- When creating any governance mechanism.
- In the periodic review of the whole set.
- Before responding to an incident with a new control.

## When Not to Use

**With no owner, measure and expiry.**

**When the automated point of intervention was viable.**

**Uniformly**, without scaling by criticality.

**With no removal process.**

**Creating a mechanism** as a reflex response to an incident.

## Alternatives

- **A platform** — moving the property into the paved path, eliminating the mechanism.
- **A fitness function** — automated rather than human verification. See
  [fitness functions](/23-architecture-leadership/fitness-functions.md).
- **Registration without approval** — for low risks, visibility is enough.
- **Nothing** — formally accepting the risk is a legitimate answer. See
  [risk management](/23-architecture-leadership/risk-management.md).

## Trade-offs

| A formal mechanism | A platform |
|---|---|
| Fast to institute | Expensive to build |
| Permanent friction cost | One-off cost |
| Circumventable | Invisible and effective |

| A short expiry | A long one |
|---|---|
| Frequent review | Less overhead |
| Cost of renewing | Permanence by omission |

## Failure Modes

**Accumulation.** Adding has an owner, removing doesn't.

**A mechanism with no measure.** Impossible to assess.

**No expiry.** Permanent by omission.

**Uniform.** Consumes patience on irrelevant cases.

**Human where automated was viable.** Perpetual cost.

**Success measured by number of mechanisms.** Inverted incentive.

## Common Mistakes

**Responding to an incident** with a control without assessing the point of intervention.

**Not defining** how the effect will be measured.

**Not assigning an owner** as a role.

**Never removing anything.**

**Not scaling** by criticality.

## Real-World Example

A logistics company with 160 engineers suffered a credential leak: an access key to an object store
was committed to a public repository by mistake, and stayed exposed for nine days.

The immediate institutional response was the expected one — create a security review committee for
every release. Architecture leadership asked for two weeks before instituting it, to design the
mechanism with the four fields.

The exercise changed the response:

```text
risk addressed      a credential exposed in a repository
                    — specific, not "code security"
effect measured as  credentials detected before reaching the
                    remote repository
estimated cost      committee: ~3 days of delay × 340 releases/year
                    ≈ 4 person-years of calendar time
                    automated checking: ~0
earliest viable point of intervention: in the version control client,
                    before the push
```

The committee was never created. In its place: a local check at push time, a check in the pipeline as
a safety net, and automated credential rotation with a short lifetime — so that an exposed key
expires before it is useful.

The human mechanism that remained was small and specific: a mandatory security review only for
services exposing a new public surface, roughly 12 a year instead of 340.

**Owner, expiry and measure** were defined before anything was turned on. Owner: the platform
maintainer role. Expiry: 24 months. Measure: credentials blocked before the push.

Over the following 24 months:

```text
credentials blocked before the push          41
credentials that reached the repository       0
delay added to the release process            0
human security reviews performed             23 (from the forecast 12/year
                                             plus exceptions)
```

At renewal, at 24 months, the owner presented the numbers and the mechanism was kept — with the scope
of the human reviews widened to include integrations with external partners, which had shown up as a
gap.

The lesson that stuck: the question "what is the earliest viable point of intervention?" turned a
proposal costing four person-years of annual delay into a zero-cost mechanism. And it cost two weeks
of waiting — which was the politically hard part, because right after an incident the pressure is to
act, not to design.

## Related Concepts

- [Governance](/19-architecture-governance/index.md) — the operation.
- [Principles](/23-architecture-leadership/leadership-principles.md).
- [Standards](/23-architecture-leadership/leadership-standards.md).
- [Fitness Functions](/23-architecture-leadership/fitness-functions.md).

## Practical Exercise

Ask, in your organization: what was the last governance mechanism removed, and when?

If nobody can answer, the set has only grown — and the diagnosis holds regardless of which mechanism
you examine first.

## Interview Questions

- Why does adding mechanisms have an owner and removing them doesn't?
- Why does suspending temporarily produce more than arguing?
- Why should whoever proposes a mechanism operate it?

## Further Reading

- Hohpe, Gregor. *The Software Architect Elevator*. O'Reilly, 2020.
- Forsgren, Nicole et al. *Accelerate*. IT Revolution, 2018.
- Ford, Neal et al. *Building Evolutionary Architectures*. 2nd ed. O'Reilly, 2022.

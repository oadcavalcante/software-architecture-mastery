---
id: standards
title: Standards
sidebar_position: 11
description: Prescribing specific choices — and why a standard that needs to be checked by a person was never operationalized.
doc_type: concept
level: 6
difficulty: intermediate
status: complete
objective: >
  By the end, the reader creates operationalized standards, with a justified scope and an
  exception path.
prerequisites: [enterprise-principles]
related: [enterprise-principles, technology-radar, enterprise-governance]
canonical_for: []
translated_from_version: 1
last_reviewed: 2026-08-31
---

# Standards

## Overview

A standard prescribes a specific choice: use this library, this format, this convention.

It differs from a [principle](/15-enterprise-architecture/enterprise-principles.md), which guides judgment without
determining the choice.

And the property that decides whether it works: **a standard that has to be checked by a
person was never operationalized**. Standards that depend on discipline are followed for
as long as it is convenient.

## Problem

The typical standards document has dozens of items, written at different times, by
different people, without review.

```text
nobody reads the whole document
most of the items are not verified
some contradict others
several describe technologies the organization no longer uses
```

And the practical effect: the document is cited only when someone wants to justify a
refusal — which makes teams see it as an instrument of blocking, not of guidance.

## Core Concepts

### Operationalizing is the difference

```text
documented standard         "use library X for structured logs"
                            → depends on someone remembering and someone checking
operationalized standard    the library comes in the service template
                            → not following it requires deliberate effort
```

See [internal developer platforms](/14-devops-and-platform/internal-developer-platforms.md).

The hierarchy of effectiveness:

```text
built into the paved road   the standard is what happens by default
automatically verified      the pipeline fails if you don't follow it
documented and reviewed     depends on a person
documented only             depends on memory
```

The first two work. The third is expensive. The fourth is decorative.

### The scope has to be justified

Not everything deserves a standard. The criterion:

```text
standardize       when divergence has a real cost —
                  operation, security, interoperability, hiring
don't standardize when divergence is preference with no consequence
```

Examples of real cost:

```text
divergent log format          → the analysis tooling doesn't work
divergent authentication      → a larger security surface
divergent date format         → integrations break
divergent database technology → multiplied operational cost
```

And examples with no real cost: internal code structure, choice of test library, naming
conventions internal to the service.

Standardizing the second group produces friction with no benefit, and erodes the
legitimacy of the standards that matter.

### Standards age faster than principles

A principle expresses a value; a standard expresses a choice of technology or format —
and technology changes.

```text
principle  "integration by explicit contract"        holds for years
standard   "use version 3 of the contract library"   holds for months
```

That requires frequent review, and a deprecation mechanism: a replaced standard needs a
coexistence period and a migration path.

See [integration contracts](/08-integration-architecture/integration-contracts.md) —
internal standards deserve the same treatment as APIs.

### Exception with a record, not prohibition

As with [principles](/15-enterprise-architecture/enterprise-principles.md): a standard with no exception path
produces silent circumvention.

And the exception log is the improvement mechanism: if a standard accumulates exceptions,
it is wrong or its scope is too broad.

### Who writes it matters

Standards written by people who don't use them tend to ignore practical constraints.

The model that works: the standard is proposed by whoever has the problem, reviewed by
whoever has the panoramic view, and operationalized by whoever maintains the platform.

That also solves adoption: whoever took part in creating it does not need to be
convinced.

### The number matters

```text
5 to 15 operationalized standards    manageable
50+ documented                       nobody knows them
```

A large number is a symptom that standards are being used where principles or a paved
road would do.

And most documented standards that are not verified could simply cease to exist with no
consequence — which is an uncomfortable and frequently true observation.

### The standard needs a migration path

A new standard that applies only to new services produces an organization with two
permanent realities.

One that applies to everything, immediately, produces a forced migration nobody budgeted
for.

What works is the middle:

```text
mandatory for the new             immediately
migration of the existing         with a deadline and prioritization
exception for what won't migrate  recorded, with justification
deprecation of the previous one   with a date
```

And the deadline has to be realistic: a standard that requires migrating 80 services in
one quarter will not be met, and widespread non-compliance erodes the legitimacy of every
standard.

The alternative that reduces the cost: when the standard can be applied by the platform —
updating the service template and propagating it — the migration stops being each team's
work. See
[internal developer platforms](/14-devops-and-platform/internal-developer-platforms.md).

### Discontinued standards need traceability

A replaced standard leaves a trail: the systems built under it.

Without traceability, the organization accumulates generations of overlapping standards,
and nobody knows which system follows which.

```text
which standard each system follows   derived, in the service catalog
when the previous standard expires   an explicit date
what is left to migrate              a visible, prioritized list
who is responsible for the migration named
```

See [internal developer platforms](/14-devops-and-platform/internal-developer-platforms.md) —
when the platform knows each service's standard, that traceability is derived and
requires no maintenance.

And there is a common case that deserves an explicit decision: systems that will not
migrate. A system being decommissioned should not consume effort to meet a new standard —
and the exception has to be recorded, or it shows up perpetually on the outstanding list.

### Adoption measured, not declared

A standard exists only to the extent that it is followed, and the difference between
"published" and "adopted" is usually large enough to invalidate the entire policy.

```text
published    the document exists
communicated the teams know it exists
adopted      new systems follow it
converged    old systems have been migrated
```

Measuring adoption separates live standards from dead letter, and produces the
information that decides the next step: a standard published two years ago and followed
by 20% of new systems is either wrong, or was not communicated, or has no viable
migration path — and the three causes require different answers.

Without that measurement, the default institutional response is to reinforce the
obligation, which is the one that works in none of the three cases.

## Mental Model

**A standard that has to be checked by a person was never operationalized.** Embed it,
automate it, or accept that it is decorative.

## When to Use

- Where divergence has an operational, security or interoperability cost.
- For formats that cross systems.
- Where standardization reduces cognitive load.
- For regulatory requirements.

## When Not to Use

**For preferences with no consequence.** It spends authority on something that affects nobody outside the team, and that authority is missing later.

**Documented only**, without operationalization. With no template, library or check, the standard is followed only by those who would have followed it anyway.

**In large numbers.** An extensive catalog is not read, and its existence convinces the organization that guidance exists where it does not.

**Written by people who don't use it.** It gets the real cases wrong and arrives as an imposition, which guarantees silent circumvention.

**Without an exception path.** Those who don't fit the standard ignore it, and the violation stops being visible — worse than having no standard.

**Without review and deprecation.** Old standards keep being cited as the norm long after they stopped making sense.

## Alternatives

- **Paved road** — the standard built in, stronger than any document.
- **Automated verification** — the pipeline enforces it.
- **[Principles](/15-enterprise-architecture/enterprise-principles.md)** — when the specific choice does not matter,
  only the direction.
- **[Technology radar](/15-enterprise-architecture/technology-radar.md)** — a recommendation with context, without
  obligation.

## Trade-offs

| Standard | Principle |
|---|---|
| Specific choice | Direction |
| Verifiable | Depends on judgment |
| Ages fast | Stable |
| Reduces variation | Preserves autonomy |

| Operationalized | Documented |
|---|---|
| Followed by default | Depends on discipline |
| Cost of building | Low |
| Hard to circumvent | Easy |

## Failure Modes

**An unread document.**

**A standard with no verification.** Followed while convenient.

**Scope too broad.** It standardizes what has no cost.

**Aged.** It prescribes an abandoned technology.

**No deprecation.** Old and new standards coexisting with no deadline.

**Used to block.** Cited only in refusals.

## Common Mistakes

**Documenting without operationalizing.** A standard that doesn't come with a ready template, a library or an automated check depends on each team remembering — and it is followed by those who would have followed it anyway.

**Standardizing preferences.** Standardizing what has no consequence across teams spends authority without buying anything, and that authority is missing when something really matters.

**Not reviewing.** A standard written three years ago may recommend a discontinued technology, and it keeps being cited as the norm because nobody withdrew it.

**Having no exception path.** With no exception process, teams that don't fit the standard simply ignore it — and the violation stops being visible and discussable.

**Writing it without the people who use it.** A standard drafted far from whoever will apply it gets the real cases wrong and is received as an imposition.

**Accumulating without removing.** A catalog with fifty standards is consulted by nobody, and its existence gives the false impression that guidance exists.

## Real-World Example

A technology company had a standards document with 47 items, maintained by an
architecture group.

A sample check across 20 services measured adherence:

```text
standards followed by all 20        6   — all built into the service template
followed by more than half          9
followed by fewer than half        18
followed by none                   14
```

The six universally followed were exactly the ones that came ready in the service
template. None of them required anyone to remember.

The 14 followed by none included four that prescribed technologies the company no longer
used.

The rework:

**Classification by the cost of divergence.** Each standard was assessed: does divergence
have a real operational, security or interoperability cost?

Twenty-one passed the test. The other 26 were removed — they were preferences.

**Operationalizing the 21:**

```text
built into the service template    12
verified in the pipeline            7
documented with manual review       2  — the ones that could not be automated
```

**Deprecation.** The four that prescribed abandoned technologies were removed with
communication, and the services still using them entered a migration queue.

**Exception log.** In one year, 9 exceptions recorded. Seven were about the same standard
— the message format one — which was revised and broadened.

**Biannual review**, with the same sample adherence check.

Result: 47 standards became 21, and average adherence rose from 42% to 96% — not from
more control, but because following became the path of least effort.

What was recorded afterwards: the 26 removed standards caused no problems at all. They
existed because someone, at some point, had a preference and wrote it down.

## Related Concepts

- [Enterprise Principles](/15-enterprise-architecture/enterprise-principles.md) — guidance without prescription.
- [Technology Radar](/15-enterprise-architecture/technology-radar.md).
- [Enterprise Governance](/15-enterprise-architecture/enterprise-governance.md).
- [Internal Developer Platforms](/14-devops-and-platform/internal-developer-platforms.md).

## Practical Exercise

Take five standards from your organization and check real adherence across a few
services.

The ones that are not followed either don't matter, or were never operationalized. In
both cases, the document is not working.

## Interview Questions

- What is the difference between a standard and a principle?
- Why is a standard checked by a person not operationalized?
- What criterion justifies standardizing something?

## Further Reading

- Open Group. *TOGAF Standard* — architecture governance.
- Skelton, Matthew; Pais, Manuel. *Team Topologies*. IT Revolution, 2019.
- Forsgren, Nicole et al. *Accelerate*. IT Revolution, 2018.

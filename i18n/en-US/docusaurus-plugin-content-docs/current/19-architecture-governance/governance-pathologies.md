---
id: governance-pathologies
title: Governance Pathologies
sidebar_position: 9
description: The modes of degeneration, the signs that it has already happened, and why each one looks reasonable at the start.
doc_type: concept
level: 6
difficulty: advanced
status: complete
objective: >
  By the end, the reader recognizes degenerate governance by its observable signs and knows
  how to propose removing a mechanism.
prerequisites: [governance-basics]
related: [governance-basics, governance-review, measuring-governance]
canonical_for: []
translated_from_version: 1
last_reviewed: 2026-08-31
---

# Governance Pathologies

## Overview

Governance degenerates in specific, repeated ways. None of them starts as an error — each
pathology is the reasonable response to a real problem, applied for too long or at the wrong
point.

That matters for the diagnosis: looking for bad faith or incompetence explains nothing,
because the people who created the mechanism were right at the moment they created it.

What changes is the context, and what is missing is the removal mechanism. **Governance
accumulates because adding has an owner and removing does not.**

This document catalogs the modes, the observable signs of each, and the way out.

## Problem

The accumulation pattern:

```text
an incident      → a control is created
an audit         → a report is created
a divergence     → a standard is created
a delay          → a checkpoint is created
```

Each step is defensible. None is reversed. After a few years, the organization has dozens of
mechanisms, of which a small fraction still addresses a live risk — and the aggregate cost is
invisible because it is spread across small delays.

The most reliable sign that this has happened: **nobody can name the last governance
mechanism that was removed.**

## Core Concepts

### A committee that approves everything

```text
symptom   an approval rate above 90%
cause     it intervenes after the decision, when saying no is too expensive
effect    waiting cost with no benefit; teams bring what is already implemented
way out   move to early advice; a gate for only a few classes
```

See [review](/19-architecture-governance/governance-review.md).

### Compliance theater

```text
symptom   impeccable documents, divergent systems
cause     an artifact is verified, not an effect
effect    undue confidence; the real risk is unknown
way out   continuous verification against the real state
```

See [compliance](/19-architecture-governance/compliance.md).

### A standard with no path

```text
symptom   a published standard, adoption below 30%
cause     complying requires work nobody funded
effect    silent divergence; the standard cited in audits and ignored
way out   a template, an example, a migration — or removing the standard
```

### A permanent exception

```text
symptom   exceptions renewed three or more times
cause     the standard is wrong, or the migration will never be a priority
effect    renewal effort and distorted metrics
way out   fix the standard, narrow the scope, or accept it as debt
```

See [exceptions](/19-architecture-governance/exceptions.md).

### Governance with no owner

```text
symptom   nobody knows who answers for a mechanism
cause     whoever created it left, or the group was reorganized
effect    it is never adjusted or removed; nobody has the authority to drop it
way out   ownership as a role, with a review date
```

### Ritual

```text
symptom   the meeting happens, produces minutes, and nobody can cite
          a decision it changed in the last 12 months
cause     the problem that originated it was solved some other way
effect    a recurring cost with no effect
way out   suspend it for a quarter and observe what breaks
```

Temporary suspension is the most efficient test available, and the hardest to get
authorization for.

### Ivory tower architecture

```text
symptom   decisions made by people who neither operate nor build the system
cause     the architecture role is separated from execution
effect    decisions that don't survive contact with implementation;
          loss of credibility
way out   architects with operational responsibility; decisions with whoever builds
```

The early sign: proposals that mention no hard case at all.

### A check nobody reads

```text
symptom   a compliance report with hundreds of items, sent weekly,
          with no corresponding fixes
cause     everything is verified with the same weight
effect    noise; the items that matter become invisible
way out   classify by risk; deliver to the team, not to the committee
```

See [measurement](/19-architecture-governance/measuring-governance.md).

### Governance as power

```text
symptom   discussions about who decides, not about what to decide
cause     the mechanism became an instrument of organizational influence
effect    decisions get worse; the architecture group becomes an adversary
way out   hard — it requires changing incentives, not the process
```

This is the most serious one, because the others have a technical solution and this one does
not. The warning signal: the mechanism is defended by arguments from authority and not by
evidence of risk prevented.

### The absence of a removal mechanism

The pathology that produces all the others. If there is no process for **taking away** a
mechanism, the set only grows.

```text
add      has an owner, urgency and an incident to justify it
remove   has no owner, is politically risky, and the benefit is diffuse
```

The way out is structural: an expiry date on every new mechanism, and a periodic review whose
default question is "does this still pay for itself?".

### A mechanism that solves the problem of another era

```text
symptom   the mechanism addresses a risk the platform or the pipeline
          already covers by another route
cause     it was created before the capability existed, and nobody revisited it
effect    duplicated verification, friction with no corresponding risk
way out   map each mechanism against the current automated controls
```

This is the quietest mode in the catalog, because the mechanism keeps "working" — it merely
checks something that can no longer go wrong. Manual approval of network configuration
survives years after the network came to be declared in code and verified in the pipeline.

The diagnosis is cheap: for each human mechanism, ask what would happen if it were removed
**today**, with the automated controls that exist today — and not with those that existed
when it was created.

The difficulty is that the question is rarely asked by whoever operates the mechanism, and
whoever built the automated control normally doesn't know the manual check exists. The two
halves of the diagnosis are usually in different parts of the organization, which explains
why the duplication survives so long.

## Mental Model

**Every pathology started as the right answer to a real problem.** The flaw is the absence of
an expiry date.

## When to Use

This catalog serves as a checklist:

- When inheriting a governance structure.
- When proposing a new mechanism — to anticipate how it degenerates.
- In a periodic review of the set of mechanisms.
- When teams complain about friction without being able to point at a cause.

## When Not to Use

**As an accusation.** The people who created the mechanisms were right.

**To remove everything** — the absence of governance has its own cost, and it is worse in
large organizations.

**Without measuring first** — removing a mechanism without knowing what it prevents is a
gamble.

**In small organizations**, where the diagnosis is usually excess formality and not
pathology.

## Alternatives

- **Temporary suspension** — instead of removing, suspend for a quarter and observe.
- **Scope reduction** — keep the mechanism only for the risk class that justifies it.
- **Changing the intervention point** — almost always better than removing. See
  [basics](/19-architecture-governance/governance-basics.md).
- **Replacement by automation** — the human mechanism becomes a check.

The first is the most underused and the most informative: it produces evidence instead of an
argument.

## Trade-offs

| Remove a mechanism | Keep it |
|---|---|
| Less friction | A known risk covered |
| Risk of recurrence | Continuous cost |
| Requires measurement | Requires nothing |

| Suspend and observe | Decide by analysis |
|---|---|
| Real evidence | No risk |
| Requires risk tolerance | Endless discussion |
| Conclusive | Inconclusive |

## Failure Modes

**Diagnosis as accusation.** It closes the conversation.

**Removal with no measurement.** The original problem recurs.

**Removing everything.** Trading one pathology for another.

**Treating the symptom.** Adjusting the committee without moving the intervention point.

**Not looking at the set.** Each mechanism looks reasonable in isolation.

## Common Mistakes

**Proposing a new mechanism** as the response to a mechanism that failed.

**Not dating mechanisms** at creation.

**Not measuring friction.**

**Confusing ritual with culture** — the meeting that "has always existed" is rarely culture.

**Not asking what the last removed mechanism was.**

## Real-World Example

A financial services company with 500 engineers ran an inventory of engineering governance
mechanisms, prompted by an internal survey in which "bureaucracy" appeared as the main
reported obstacle.

The inventory found **34 mechanisms** — committees, approvals, reports, mandatory checks,
forms. No single person in the organization knew all of them.

For each one, four questions:

```text
                                                    answered
what risk it prevents                               34
how many times it caught something in 24 months     11
how much delay it adds                               6
who owns it                                         19
```

The numbers reveal the pattern: everyone can justify a mechanism's existence, and almost
nobody knows whether it works.

Of the 11 with effectiveness data:

```text
caught something relevant more than 5 times    4
between 1 and 5 times                          3
never caught anything                          4
```

The 4 that never caught anything had existed for an average of 4.7 years.

The reduction program, over 12 months:

**Suspension of 9 mechanisms** for a quarter, chosen from among those with no owner and those
with no demonstrated effectiveness. Nothing broke in 7 of them; they were removed
permanently. Two were reinstated — a data exposure report and a dependency check — now with an
owner and a narrowed scope.

**11 mechanisms converted into automated checks**, moving the intervention point. See
[fitness functions](/19-architecture-governance/fitness-functions-governance.md).

**8 mechanisms with a narrowed scope** to the risk class that justified them — the most
significant went from "every project" to "projects with regulated data or an irreversible
commitment above a threshold".

**6 kept unchanged**, all with demonstrated effectiveness.

**A mandatory expiry date** on every new mechanism, at most 24 months, with renewal requiring
evidence of effect.

**An annual review of the set**, with an unusual declared objective: remove at least one
mechanism per year. The recorded justification was that, with no explicit removal target, the
set starts growing again.

Results after 12 months:

```text
mechanisms                                    34 → 15
average approval time for a new project       from 26 to 4 days
incidents attributable to a removed mechanism  1 — the dependency check,
                                              reinstated
"bureaucracy" as the main obstacle
  in the internal survey                      from 1st to 6th place
```

The point the team underlines: temporary suspension was the decisive instrument. Discussing
whether a mechanism is necessary produces arguments indefinitely; suspending it for three
months produces evidence in three months.

And the annual removal target was the structural change. It gave the act of removing an
owner, which was exactly what had been missing.

## Related Concepts

- [Governance Basics](/19-architecture-governance/governance-basics.md) — the intervention
  point.
- [Review](/19-architecture-governance/governance-review.md) — the committee that approves
  everything.
- [Compliance](/19-architecture-governance/compliance.md) — compliance theater.
- [Measurement](/19-architecture-governance/measuring-governance.md) — how to know whether a
  mechanism works.

## Practical Exercise

Ask, in your organization: what was the last governance mechanism removed, and when?

If nobody can answer, the set has only grown — and the diagnosis holds regardless of which
mechanism you examine first.

## Interview Questions

- Why doesn't looking for culprits help in diagnosing degenerate governance?
- Why is temporarily suspending better than discussing whether a mechanism is necessary?
- Which pathology has no technical solution, and why?

## Further Reading

- Hohpe, Gregor. *The Software Architect Elevator*. O'Reilly, 2020.
- Forsgren, Nicole et al. *Accelerate*. IT Revolution, 2018.
- Skelton, Matthew; Pais, Manuel. *Team Topologies*. IT Revolution, 2019.

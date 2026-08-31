---
id: documentation-standards
title: Documentation Standards
sidebar_position: 11
description: The policy that makes documentation exist without becoming bureaucracy.
doc_type: concept
level: 5
difficulty: intermediate
status: complete
objective: >
  By the end, the reader defines a minimal documentation policy with an owner, a trigger
  and verification, without turning it into a compliance process.
prerequisites: [documentation-principles]
related: [documentation-principles, architecture-descriptions, living-documentation]
canonical_for: []
translated_from_version: 1
last_reviewed: 2026-08-31
---

# Documentation Standards

## Overview

Good documentation doesn't happen out of goodwill. It happens when three things are
defined: **what is mandatory, who owns it, and when it has to be updated**.

The difficulty is that the policy tends toward one of two extremes. With no policy, each
team documents differently and most don't document at all. With a heavy policy, you
produce volume nobody reads — see
[documentation principles](/17-architecture-documentation/documentation-principles.md).

The point that works is narrow: **few obligations, with an owner and a trigger, verified
automatically where possible.**

## Problem

With no standard, the symptoms are predictable:

```text
each system documented in a different place
incompatible formats, impossible to compare
no way to know whether something is current
documents with no owner, that nobody can fix
the same information in three places, divergent
```

With a heavy standard, the symptoms are different and worse:

```text
40-section templates filled with generic text
documentation produced the day before approval
compliance verified by existence, not by content
teams that document for the process, not for readers
```

The second set is harder to fix, because the process declares success.

## Core Concepts

### The minimum set

The right question is not "what would be good to document", it is **"what hurts when it is
missing"**:

```text
how to start up and run the system      hurts every time someone joins
what it does and for whom               hurts in every cross-team conversation
who owns it and how to reach them       hurts during an incident
architectural decisions                 hurts when whoever decided leaves
what to do when it fails                hurts at three in the morning
```

Five items. A policy that requires more than that by default has to justify every
addition.

### A named owner, not a collective one

```text
"team X owns it"        nobody updates it
"person Y owns it"      somebody updates it
"team X, role Z"        works, survives departures
```

The third form is the one that holds: the owner is a role inside a team, and the role is
filled by someone named at any given moment.

A document with no owner is a document that rots. See
[ownership and accountability](/19-architecture-governance/index.md).

### Triggers, not cadence

Calendar-based review produces superficial review: someone opens it, looks, marks it
reviewed.

Event-based triggers work better:

```text
container added or removed      → update the container diagram
topology change                 → update deployment
architectural decision          → a new ADR
incident with a structural cause → revise the description
new integration                 → update the context
```

Cadence comes in as a safety net — an annual review for whatever no trigger caught — and
not as the main mechanism.

### Templates help if they can be shortened

A template lowers the barrier to starting and the variation between systems. It becomes a
problem when filling it in completely is mandatory.

```text
mandatory sections    few, and verifiable by content
optional sections     declarable as not applicable
suggested length      explicit, with an upper limit
a filled-in example   worth more than instructions
```

The third item is uncommon and effective: stating that a section should be up to 300 words
communicates the expectation better than any guidance.

### Documentation next to the code

Where documentation lives determines whether it is updated:

```text
in the system's repository    reviewed alongside the code
in a separate wiki            updated when someone remembers
in a management system        updated the day before the audit
```

Documentation in the repository enters code review, is versioned with the system, and can
be verified automatically. It is the default choice for everything technical.

What has to stay outside the repository: what has to be read by people without access to
it, and what has to survive the repository being archived.

### Automated verification of what can be verified

A policy with no verification becomes optional. And manual verification doesn't scale.

```text
does the document exist?
does it have a declared owner?
was it touched in the last N months?
do the links point to something that exists?
does the diagram reference containers that still exist?
do the mandatory sections have content beyond the template?
```

Not everything is verifiable, and what is should be. The last item is the most valuable and
the least implemented: detecting unreplaced template text catches most of the filling-in
out of duty.

See [living documentation](/17-architecture-documentation/living-documentation.md).

### Requirements proportional to criticality

A uniform policy treats an internal service used by three people like a payment system. The
predictable result is that both get the same effort — which is the minimum possible.

```text
high criticality    consolidated description, deployment, runbook, annual review
medium criticality  the five minimum artifacts
low criticality     a README with purpose, owner and how to run it
```

The tiering does more than save effort: it communicates priority. When everything is
mandatory, nothing is important, and teams distribute attention uniformly across things
that don't deserve uniform attention.

And it requires a criticality classification that should already exist for other reasons —
disaster recovery, incident response, access control.

## Mental Model

**Little, with an owner and a trigger, verified.** Every additional obligation has to pay
for itself.

## When to Use

- In organizations with more than a few teams.
- When turnover makes tacit knowledge risky.
- In regulated environments.
- When incidents have already been made worse by missing documentation.

## When Not to Use

**As a long mandatory template.**

**Verifying existence instead of content.**

**With no named owner.**

**With a fixed cadence as the main mechanism.**

**Uniform across systems of different criticality** — an occasionally used internal system
and a critical system do not deserve the same requirements.

**In a small team with one system** — the policy is a conversation.

## Alternatives

- **An informal convention** — works up to about three teams.
- **A reference example** — pointing at a well-documented system as the standard to
  imitate usually works better than a written rule.
- **Automatic generation** — it eliminates the policy where applicable. See
  [living documentation](/17-architecture-documentation/living-documentation.md).
- **Peer review** — the standard emerges from review instead of being prescribed.

The second is the most underrated: "document it like the payments system" communicates
faster than twelve pages of rules.

## Trade-offs

| Rigid standard | Flexible |
|---|---|
| Comparable | Fitted to context |
| Invites filling in out of duty | Varies too much |
| Verifiable | Hard to audit |

| In the repository | Central |
|---|---|
| Updated alongside the code | Findable by anyone |
| Verifiable in the pipeline | Independent of the repository |
| Disappears with the repository | Survives |

## Failure Modes

**A long template.** Generic text as the rational answer.

**Verification by existence.** An empty document passes.

**No owner.** Nothing is updated.

**A separate wiki.** Silent divergence.

**Uniform requirements.** Irrelevant systems carrying the same load as critical ones.

**No trigger.** Documentation updated once a year, badly.

## Common Mistakes

**Starting from the template** instead of from the questions that hurt.

**Confusing policy with an approval process.**

**Not allowing "not applicable".**

**Putting everything on a wiki.**

**Verifying nothing automatically.**

**Not measuring use** — without that, you don't know what to cut.

## Real-World Example

A company with 40 teams had documentation in three places: a corporate wiki, the
repositories, and an architecture management tool. None was complete, all three diverged,
and nobody knew which to consult.

A survey found:

```text
systems with any documentation                  38 of 52
with documentation in more than one place       31
with divergent versions across places           24
with an identifiable owner                      11
updated in the last 12 months                   16
```

The new policy was deliberately short — one page:

**Five mandatory artifacts per system**, all in the system's own repository: a README with
purpose and how to run it, a context diagram, a container diagram, ADRs, and an incident
runbook.

**Ownership as a role**, declared in a metadata file in the repository, integrated with
the team registry — which made the owner verifiable and resistant to departures.

**Declared triggers** tied to code review: changes to infrastructure code require revising
the deployment diagram; a new container requires revising the container diagram.

**The wiki discontinued** for technical system documentation. Content migrated or
archived, with a redirect pointing to the repository — the step that generated the most
resistance and that resolved the most divergence.

**Verification in the pipeline**: the five artifacts exist, have a valid owner, the links
resolve, and the template text was replaced. Failing any of them blocks no delivery; all
of them appear on a per-team dashboard.

**Requirements tiered by criticality**: critical systems add a consolidated description
and a derived deployment diagram; low-criticality systems stay at the five.

Nine months later:

```text
systems with all five artifacts                 49 of 52
with a valid owner                              52
updated in the last 6 months                    44
with divergence across places                    0 (there is only one place)
```

What the team learned: the most unpopular decision — shutting down the wiki — was the most
effective. As long as two valid places existed, divergence was inevitable, and no quality
policy was going to fix that.

And one that didn't work: the first version of the policy had nine mandatory artifacts. The
four that were cut were the ones nobody consulted, and removing them raised the compliance
rate for the remaining five.

## Related Concepts

- [Documentation Principles](/17-architecture-documentation/documentation-principles.md).
- [Living Documentation](/17-architecture-documentation/living-documentation.md) — what can be generated.
- [Architecture Descriptions](/17-architecture-documentation/architecture-descriptions.md).
- [Governance](/19-architecture-governance/index.md) — where the policy lives.

## Practical Exercise

List the mandatory documentation artifacts in your organization and, for each one, answer:
who consulted this in the last six months?

The ones with no answer are candidates for cutting, and cutting them improves compliance
for the ones that stay.

## Interview Questions

- Why do event triggers work better than a fixed cadence?
- Why does allowing "not applicable" increase documentation quality?
- What problem do two valid documentation locations inevitably create?

## Further Reading

- Clements, Paul et al. *Documenting Software Architectures*. 2nd ed. Addison-Wesley, 2010.
- Write the Docs. *Docs as Code* — writethedocs.org/guide/docs-as-code.
- Forsgren, Nicole et al. *Accelerate*. IT Revolution, 2018.

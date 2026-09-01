---
id: leadership-standards
title: Standards from the Setter's Perspective
sidebar_position: 13
description: Publishing a standard is taking on a commitment — to the path, to the migration and to the retirement.
doc_type: concept
level: 7
difficulty: advanced
status: complete
objective: >
  By the end, the reader publishes standards with an adoption path, migration funding and a review
  date, and reads low adoption as information.
prerequisites: [leadership-principles]
related: [leadership-principles, leadership-governance, cross-team-architecture]
canonical_for: []
translated_from_version: 1
last_reviewed: 2026-08-31
---

# Standards from the Setter's Perspective

## Overview

Publishing a standard looks like an act of writing and is an act of commitment. Whoever publishes it
takes on three obligations that are rarely acknowledged:

```text
provide the path            template, example, tooling
answer who pays             for migrating the existing systems
retire it                   when it stops making sense
```

A standard published without all three is an aspiration with the appearance of a rule — and the
result is predictable: low adoption, silent circumvention, and the group that published it
reinforcing mandatoriness as the answer to everything.

See [standards in operation](/19-architecture-governance/governance-standards.md) for the life
cycle; here the focus is on what the setter has to deliver alongside.

## Problem

The typical standard is born like this:

```text
divergence between teams is identified
the standard is written
it is published on the portal
it is announced by email
```

Six months later, adoption is at 22%, and the institutional reaction is to reinforce mandatoriness —
which does not work, because the problem was never discipline.

```text
published and not adopted for lack of a path
published and not adopted for lack of migration funding
published and not adopted because it is wrong
```

The three look alike from the outside and require opposite responses. Telling them apart is the core
competence of whoever publishes.

## Core Concepts

### Low adoption is information about the standard

```text
usual reaction     "the teams aren't following it"
correct reading    "the standard isn't adoptable, or isn't worth it
                   for whoever should adopt it"
```

That inversion of reading is the most important change of posture in this topic. Teams don't fail to
adopt standards out of indiscipline — they fail when the cost of adopting exceeds the perceived
benefit, or when there is no path.

Investigating why, instead of chasing compliance, solves the problem; chasing compliance only moves
the non-compliance into silence.

### A recommendation stage before mandatory

```text
published as a recommendation for 6 months
voluntary adoption measured
above ~40%      promote it to mandatory
below           revise the standard before promoting it
```

That stage turns low adoption into information about the standard instead of a failure of the teams,
and it costs only time. It is the publisher's most effective instrument, and the least used.

A standard nobody adopts voluntarily probably shouldn't be mandatory — or needs a path before it is.

### No standard without a path

```text
"use the corporate authentication library"
  → it competes with the easy path, and loses

a template with authentication already configured
  → adoption happens with no conversation at all
```

Publishing a standard without providing the path is transferring the entire cost of adoption to
whoever adopts, while the publisher bears only the writing. That asymmetry is the most common cause
of low adoption.

See [platform engineering](/14-devops-and-platform/platform-engineering.md).

### Whoever pays for the migration has to be named

```text
"all systems must migrate by December"
```

With no answer as to who pays, that is aspiration. Teams have their own priorities, and migrating for
compliance competes with delivering value — and loses.

```text
centrally funded                 the most effective, and the most expensive
negotiated into each team's
  roadmap                        effective, and slow
tooling that makes it cheap      the most scalable
don't migrate the existing ones  legitimate: the standard applies
                                 only to new systems
```

The fourth option is underused and frequently the right one: applying the standard only to new
systems avoids an expensive migration and lets the organization converge by natural renewal.

It has a cost of its own that has to be accepted knowingly: the divergence between old and new
systems persists for years, and whoever operates both lives with two ways of doing the same thing. In
exchange, it competes with no product priority, which is why adoption is high.

The choice between migrating and not migrating should be explicit at the moment of publication, with
the cost of each estimated — not discovered months later, when the migration isn't happening and
nobody knows whether it was expected.

### A swap rule

```text
to add a standard, remove another
```

Except for regulatory risk. The rule exists because the organization's attention is finite: the
sixtieth standard doesn't increase coherence, it dilutes the previous fifty-nine.

It also forces real prioritization on whoever publishes — which is rare when publishing has no cost.

### Written by whoever applies it

```text
written by a central group with no participation from whoever applies it
  → generic, ignores the hard case, worked around
written by whoever applies it, reviewed by whoever has the broad view
  → specific, adoptable, defended in conversations
```

The second arrangement has an additional effect: whoever wrote the standard is the one who defends it
when someone questions it. That is worth more than any mandatoriness policy.

### A review date, always

```text
no date     the standard outlives the context that produced it
with date   somebody has to reaffirm it, which is a filter
```

A standard that references a discontinued technology and goes on being cited in reviews is the
predictable result of publishing with no expiry.

Twenty-four months is a reasonable limit. See
[governance](/23-architecture-leadership/leadership-governance.md).

## Mental Model

**Publishing is taking on three commitments: the path, the migration and the retirement.** And low
adoption is information about the standard.

## When to Use

- For recurring decisions whose outcome is already known.
- Where divergence has a measurable cost.
- With a path, funding and review date defined before publishing.

## When Not to Use

**With no adoption path.**

**Without answering who pays for the migration.**

**With no review date.**

**Where the context varies** — that's a principle.

**Adding without removing.**

**Chasing adoption** instead of investigating the cause.

## Alternatives

- **A template with no written standard** — the property built in, with no document.
- **A permanent recommendation** — when mandatoriness isn't justified.
- **Applying it only to new systems** — convergence by renewal, with no migration.
- **A technology radar** — signals direction without prescribing. See
  [technology radar](/15-enterprise-architecture/technology-radar.md).

The first is the most effective where applicable: a standard that exists only as the template's
default configuration doesn't have to be remembered or verified.

## Trade-offs

| A mandatory standard | A recommendation |
|---|---|
| Coherence guaranteed | Adoption by persuasion |
| Requires exceptions and verification | Divergence possible |
| Can be wrong and imposed | Adoption is the test |

| Migrate the existing ones | New systems only |
|---|---|
| Complete convergence | No migration cost |
| Costs money and priority | Slow convergence |

## Failure Modes

**No path.** It competes with the easy way and loses.

**No funding.** Aspiration.

**Compliance-chasing as the answer.** Moves non-compliance into silence.

**No review date.** It outlives the context.

**Accumulation.** It dilutes the ones that matter.

**Written far from whoever applies it.** It ignores the hard case.

## Common Mistakes

**Publishing with no template.**

**Reinforcing mandatoriness** in the face of low adoption.

**Not using the recommendation stage.**

**Not considering** applying it only to new systems.

**Not linking it to the ADR** that originated the standard.

## Real-World Example

A financial services company published, over two years, four architectural standards. All were
announced as mandatory from day one.

Adoption, measured 18 months later:

```text
observability standard             89%
API contract standard              71%
error handling standard            34%
project structure standard          9%
```

The first two had a ready template at publication; the last two did not. The correlation was perfect
and nobody had noticed it, because the institutional reading of low adoption was indiscipline — and
the response under way was a compliance-chasing plan per area.

Architecture leadership proposed inverting the reading before chasing anything: interview the teams
with low adoption and ask what was getting in the way.

```text
error handling standard     "each language handles errors its own way;
                            the standard was written thinking about Java
                            and doesn't translate to the other three"
project structure standard  "there's no tool that generates this;
                            restructuring an existing service takes
                            two days and delivers nothing to the user"
```

Neither cause was discipline. The first was a wrong standard — written by someone who used one
language, for four. The second was a standard with no path and no funding.

What the organization came to require before publishing:

**A ready path** — a template, a migration tool or a working example. Without that, no publication.

**A recommendation stage** of six months, with voluntary adoption measured before making it
mandatory.

**An explicit answer as to who pays** for migrating the existing systems — including the option not
to migrate, applying the standard only to new systems.

**Written by whoever applies it**, reviewed by whoever has the broad view.

The two problematic standards were handled in opposite ways: the error handling one was rewritten by a
group with representatives from all four languages, and adoption rose to 78% in eight months. The
project structure one was downgraded to a recommendation and came to apply only to new services —
adoption in new services landed at 94%, and the existing ones were not touched.

In the retrospective: neither standard needed compliance-chasing. One was wrong and was fixed; the
other was right and lacked a path. The planned chasing would have pushed both into silent
non-compliance, and the organization would have concluded that standards don't work.

## Related Concepts

- [Standards in Operation](/19-architecture-governance/governance-standards.md).
- [Enterprise Standards](/15-enterprise-architecture/standards.md).
- [Principles](/23-architecture-leadership/leadership-principles.md).
- [Governance](/23-architecture-leadership/leadership-governance.md).

## Practical Exercise

Pick three standards from your organization and check whether each has an adoption path, an owner, a
review date and an answer as to who pays for the migration.

Those that don't have all four are not standards — they are documents, and their adoption is an
accident.

## Interview Questions

- Why is low voluntary adoption information about the standard?
- Why is applying a standard only to new systems frequently the right choice?
- Why should whoever writes the standard be whoever applies it?

## Further Reading

- Ford, Neal et al. *Building Evolutionary Architectures*. 2nd ed. O'Reilly, 2022.
- Skelton, Matthew; Pais, Manuel. *Team Topologies*. IT Revolution, 2019.
- Hohpe, Gregor. *The Software Architect Elevator*. O'Reilly, 2020.

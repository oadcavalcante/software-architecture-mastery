---
id: governance-standards
title: Standards in Operation
sidebar_position: 4
description: A standard's lifecycle — who writes it, how it gets adopted, and why retiring it is the missing part.
doc_type: concept
level: 6
difficulty: advanced
status: complete
objective: >
  By the end, the reader operates a set of standards with a declared cost, measured adoption
  and a planned retirement.
prerequisites: [governance-principles]
related: [governance-principles, exceptions, compliance]
canonical_for: []
translated_from_version: 1
last_reviewed: 2026-08-31
---

# Standards in Operation

## Overview

A standard prescribes a choice for a recurring situation. It saves judgment: instead of each
team deciding again, the organization decides once.

That saving is real, and it comes with a bill that is rarely drawn up. Every standard has an
**adoption cost**, a **maintenance cost** and an **exit cost** — and organizations accumulate
standards as if all three were zero.

The typical result, after a few years:

```text
standards published        60
consistently followed      12
silently worked around     19
obsolete, still in force   14
forgotten                  15
```

See [enterprise standards](/15-enterprise-architecture/standards.md) for scope and
operationalization; here the focus is the lifecycle — being born, being adopted, and dying.

## Problem

Standards are born for a legitimate reason — an incident, an expensive divergence, an audit
— and they almost never die.

```text
2020  incident with a serialization library → standard: use library X
2022  library X is discontinued by its maintainer
2024  the standard is still in force
2026  new teams adopt X for compliance
```

Nothing in that flow is irrational. Only one mechanism is missing: someone responsible for
asking whether the standard still makes sense, with a deadline for asking.

And there is a second, more common failure: the standard that is published and never
adopted. It exists on the portal, it is cited in audits, and the reality of the systems
diverges from it. That is worse than having no standard, because it creates the illusion of
coherence.

## Core Concepts

### Who writes it matters

```text
written by people who don't use it     generic, ignores the hard case, worked around
written by people who use it           specific, adoptable, at risk of local bias
written by people who use it,
  reviewed by people with the wide view  the arrangement that works
```

A standard written by a central group with no participation from whoever will apply it has a
recognizable characteristic: it mentions no hard case, because whoever wrote it never
encountered one.

And distributed authorship has an additional effect: whoever wrote the standard is the one
who defends it in conversations, which is more effective than any policy.

### The standard has to come with the path

A standard that requires work to follow competes with the easy path, and loses.

```text
standard with no support   "use the corporate authentication library"
standard with a path       a pre-configured template, a working example,
                           automated migration where possible
```

This is the same argument as the
[intervention point](/19-architecture-governance/governance-basics.md): a standard built into
the template doesn't have to be remembered or verified.

See [platform engineering](/14-devops-and-platform/platform-engineering.md).

### Declared adoption cost

```text
migration effort per system, estimated
systems affected
a realistic deadline
what happens to those who don't migrate
who pays for the effort
```

The last question is what blocks most adoptions: a standard requiring work from teams whose
priority is something else does not get adopted, however correct it is.

Without an answer to it, the standard is aspiration.

### Adoption measured, not declared

```text
published      the document exists
communicated   the teams know
adopted        new systems follow it
converged      the old ones migrated
```

Measuring where each standard sits on that scale is what separates real policy from nominal
policy.

And the diagnosis depends on the stage where it stalls:

```text
published but not communicated   a communication problem
communicated but not adopted     the standard is wrong, or the path is missing
adopted but not converged        the migration lacks a plan and sponsorship
```

Reinforcing the obligation — the default institutional response — solves none of the three.

### Retirement is part of the cycle

Every standard has to be born with:

```text
a review date
an owner, as a role
the condition that would make it obsolete
what happens to those who already adopted it, when it is dropped
```

The last item is the most forgotten, and it is what keeps retirement from becoming
abandonment: a discontinued standard with no plan leaves dozens of systems with a choice
nobody supports any more.

See [superseding decisions](/18-architecture-decisions/superseding-decisions.md) — the
mechanics are the same.

### Traceability of the why

```text
a standard with no recorded reason   obeyed out of fear, kept forever
a standard with a linked ADR         revisitable when the reason falls
```

Linking each standard to the [ADR](/18-architecture-decisions/index.md) that originated it is
cheap and solves the folklore-standard problem: the one everyone follows and nobody can
explain.

### The number of standards has a practical ceiling

```text
up to ~15   remembered, applied
30 to 60    consulted when someone remembers
above that  an audit reference, not a decision one
```

Every standard consumes the organization's attention, and attention is finite. Adding the
sixtieth standard doesn't increase coherence — it dilutes the previous fifty-nine.

That implies an unpopular discipline: **to add a standard, remove another**, unless the new
one addresses a risk of a different order.

## Mental Model

**A standard is an asset with a maintenance cost.** If nobody owns it and there is no review
date, it is already rotting.

## When to Use

- For recurring decisions whose outcome is already known.
- Where divergence has a measurable cost.
- When there is regulatory or security risk.
- Accompanied by a path — a template, an example, a migration.

## When Not to Use

**With no owner and no review date.**

**With no adoption path.**

**Without answering who pays for the migration.**

**Where the context genuinely varies** — that is a principle.

**In large numbers.**

**Without measuring adoption** — without that, you don't know whether it exists.

## Alternatives

- **[Principles](/19-architecture-governance/governance-principles.md)** — when the context
  varies.
- **A template** — the standard built in, with no document.
- **A recommendation with a deadline** — an informal standard, adopted by persuasion before
  becoming an obligation.
- **A technology radar** — signals direction without prescribing. See
  [technology radar](/15-enterprise-architecture/technology-radar.md).

The third is underused: publishing it as a recommendation for six months reveals whether the
standard is adoptable before making it mandatory.

## Trade-offs

| Standard | Principle |
|---|---|
| Decides the recurring | Guides the new |
| Verifiable | Interpretable |
| Blocks the atypical case | Doesn't block |
| Requires an exception process | Is weighed |

| Few standards | Many |
|---|---|
| Applied | Cover more cases |
| Concentrated attention | Dilution |
| Requires prioritizing | Avoids choosing |

## Failure Modes

**Published and not adopted.** An illusion of coherence.

**No path.** It competes with the easy option and loses.

**Obsolete and in force.** New teams adopt something dead.

**No owner.** Nobody reviews or retires it.

**No funding for the migration.** Aspiration.

**Accumulation.** Sixty standards dilute the fifteen that matter.

## Common Mistakes

**Publishing with no template.**

**Not measuring adoption**, and reinforcing the obligation as the answer to everything.

**Not linking to the ADR** that originated the standard.

**Not planning for retirement.**

**Adding without removing.**

**Writing it far from whoever applies it.**

## Real-World Example

A telecommunications company had 71 published architectural standards, maintained by a
central architecture group of five people.

An adoption survey, done with automated verification where possible and sampling where not:

```text
standards with adoption above 80%             14
between 30% and 80%                           17
below 30%                                     22
impossible to measure (vague wording)         18
with an identifiable owner                    23
with a review date                             6
with a linked ADR or justification            11
referencing a discontinued technology          9
```

The 18 impossible to measure were the most revealing: their wording — "systems must adopt
appropriate configuration management practices" — made it impossible to say whether any
system complied.

And the 9 referencing a discontinued technology were still being cited in reviews.

The restructuring took nine months:

**From 71 to 19 standards.** The 18 non-measurable ones were removed or reworded until they
became verifiable; the 22 with adoption below 30% were examined one by one — 15 removed, 7
kept with a funded adoption plan.

**Ownership as a role** for each remaining standard, with the owner being someone on a team
that applies the standard, not from the central group.

**A mandatory review date**, at most 24 months out.

**A mandatory path**: no new standard is published without a template, a working example or
a migration tool.

**A swap rule**: adding a standard requires removing another, except for regulatory risk.

**A recommendation stage**: new standards enter as a recommendation for six months, with
adoption measured. If voluntary adoption stays below 40%, the standard is revised before
becoming mandatory — the premise being that low voluntary adoption indicates a problem with
the standard, not with the teams.

Two years later:

```text
standards                                      23
with adoption above 80%                        19
with an owner and a review date                23
retired during the period                       6
promoted from recommendation to mandatory       7
recommendations revised for low adoption        4
```

The 4 revised for low adoption are the figure the team values most. In three of them the
problem was a missing migration path; in one, the standard was simply wrong — it prescribed
an approach that didn't work for high-volume systems, and none of the authors had operated
one.

The detail the team highlights: the recommendation stage turned low adoption from a
discipline failure into information about the standard. That inversion of reading was the
change with the greatest effect.

## Related Concepts

- [Enterprise Standards](/15-enterprise-architecture/standards.md) — scope and formulation.
- [Principles](/19-architecture-governance/governance-principles.md) — when not to prescribe.
- [Exceptions](/19-architecture-governance/exceptions.md) — what to do about those who cannot
  follow.
- [Compliance](/19-architecture-governance/compliance.md) — how to verify.

## Practical Exercise

Pick three standards in your organization and answer, for each one: who owns it, when will it
be reviewed, and what is the measured adoption rate.

The ones without all three answers are not standards — they are documents.

## Interview Questions

- Why is low voluntary adoption information about the standard, and not about the teams?
- What does a standard need in order not to become folklore?
- Why should adding a standard require removing another?

## Further Reading

- Ford, Neal et al. *Building Evolutionary Architectures*. 2nd ed. O'Reilly, 2022.
- Skelton, Matthew; Pais, Manuel. *Team Topologies*. IT Revolution, 2019.
- Hohpe, Gregor. *The Software Architect Elevator*. O'Reilly, 2020.

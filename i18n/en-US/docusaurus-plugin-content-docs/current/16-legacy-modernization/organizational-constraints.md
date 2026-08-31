---
id: organizational-constraints
title: Organizational Constraints
sidebar_position: 12
description: Why technically correct projects fail — and what to do about it.
doc_type: concept
level: 6
difficulty: advanced
status: complete
objective: >
  By the end, the reader identifies the organizational obstacles before starting, and
  treats them as part of the project.
prerequisites: [legacy-modernization]
related: [modernization-risk, modernization-drivers, incremental-modernization]
canonical_for: []
translated_from_version: 1
last_reviewed: 2026-08-31
---

# Organizational Constraints

## Overview

Modernization programs fail more for organizational reasons than technical ones.

The dynamic is recognizable: the design is competent, the team is capable, and the
project dies from loss of support, from knowledge that left, from misaligned incentives,
or from a priority that changed.

Treating those factors as "outside the technical scope" is what makes them fatal. They
are part of the project, and they can be addressed.

## Problem

The typical modernization plan contains architecture, sequence, estimate and technical
risks.

What it doesn't contain:

```text
who champions the project, and what happens if that person leaves
how long the support lasts before it has to be renewed
who knows what the system does, and what happens if they leave
who loses from the modernization, and how they will react
what the product team stops receiving, and whether they agree
```

Each of those is a viability condition. Ignoring them does not remove them.

## Core Concepts

### Support evaporates

Long programs consume political support. The dynamic:

```text
month 1     enthusiasm, budget approved
month 6     progress invisible to anyone non-technical
month 12    "when does this finish?"
month 18    new priority, budget reallocated
```

What sustains support is not progress communication — it is **visible value delivery**.

See [transition architecture](/15-enterprise-architecture/transition-architecture.md).
A program whose first value appears in month 14 will face that erosion with no defense.

And there has to be more than one sponsor: programs backed by a single person die when
that person changes role — which, in two-year programs, is likely.

### Concentrated knowledge is a project risk

The legacy system is maintained by few people, and they are necessary for the
modernization — to explain the behavior, to validate the new one, to resolve what comes
up.

```text
the person leaves during the project      → the missing knowledge is lost
the person is allocated to something else → the project stalls
the person resists                        → see below
```

See [legacy systems](/16-legacy-modernization/legacy-systems.md).

The treatment: knowledge transfer as the **project's first stage**, not as a consequence.
Characterization tests, documentation, and pairing.

That costs time before any new code — and it is the investment that most reduces risk.

### Misaligned incentives are the least discussed constraint

The question rarely asked: **who loses from this modernization?**

```text
the person whose unique knowledge is the source of their position
the team whose reason to exist was maintaining the system
the vendor who will be replaced
the department that loses control over a system
```

None of those forms of resistance is irrational. They are predictable responses to real
incentives.

Ignoring them produces passive resistance — information that doesn't surface, deadlines
that slip, problems only discovered late.

The treatment is explicit: identify who loses, and address it. Frequently the solution is
simple — the person whose knowledge is unique becomes the authority on the new system,
instead of losing relevance.

### The team has to keep delivering

Modernization competes with product. And, in long programs, the competition is resolved
in favor of product — always.

```text
model that fails    "we'll stop delivering features for a year"
model that works    modernization and product in parallel, with an agreed proportion
```

The proportion — something like 70% product and 30% modernization — is slower and
survives.

And it requires the modernization to be sliced into increments that fit that proportion.
See [incremental modernization](/16-legacy-modernization/incremental-modernization.md).

### Estimation and the nature of the work

Modernization is discovery work: much of what will be done is only known after starting.

Estimating it like construction — with a defined scope and a deadline — produces the
familiar pattern: the project runs late, confidence erodes, and support disappears.

What works better:

```text
short horizon      commit to the next slice, not to the program
range, not a point "between 4 and 7 months", with what determines each end
re-estimate        at each slice, with what was learned
```

And communicating the nature of the work in advance: whoever sponsors it needs to
understand that discoveries will change the plan, or every change will be read as an
execution failure.

### The team structure has to follow

A modernization that changes system boundaries without changing team boundaries produces
a structure that does not hold up.

See [application architecture](/15-enterprise-architecture/application-architecture.md).

And the inverse: keeping a team dedicated to the modernization, separate from the product
teams, produces a new system nobody wants to receive — because it was not built by
whoever will maintain it.

The model that usually works: the teams that will operate the result take part in
building it, with support from people who have modernization experience.

## Mental Model

**Organizational constraints are part of the project.** Ignoring them does not remove
them — it merely moves the discovery to the moment when they are fatal.

## When to Use

This analysis should precede any modernization program, especially when:

- The expected duration exceeds six months.
- Knowledge of the system is concentrated.
- There are teams or vendors that lose from the change.
- The modernization competes with an active product roadmap.

## When Not to Use

**Treating organizational constraints as out of scope.**

**With a single sponsor.**

**Without knowledge transfer before starting.**

**Stopping product during the modernization.**

**Estimating it like construction**, with a fixed scope and deadline.

**With a dedicated team separate** from whoever will operate it.

## Alternatives

- **Smaller slices** — they reduce exposure to shifts in priority.
- **Opportunistic modernization** — modernize what you touch, with no dedicated program.
  See [incremental modernization](/16-legacy-modernization/incremental-modernization.md).
- **Containment** — isolate the legacy system instead of replacing it, when the support
  isn't there.
- **Defer** — a legitimate decision when the organizational conditions are not in place.

The last one deserves consideration: a program started without sufficient support
consumes resources and dies halfway, leaving the organization worse off than before.

## Trade-offs

| Dedicated program | Opportunistic |
|---|---|
| Fast progress | Slow |
| Consumes support | Doesn't depend on it |
| Vulnerable to shifts in priority | Resilient |
| Controlled scope | Diffuse |

| Dedicated team | Product teams |
|---|---|
| Focus | Divides attention |
| A result nobody wants to receive | Whoever builds operates |
| Knowledge concentrated in the new team | Distributed |

## Failure Modes

**Support evaporated.** Program interrupted halfway.

**Knowledge lost during the project.**

**Passive resistance.** Information that doesn't surface.

**Product on hold.** Unsustainable pressure.

**The estimate treated as a commitment.** Every discovery read as a failure.

**A new system rejected** by whoever will operate it.

**A single sponsor who changes role.**

## Common Mistakes

**Not identifying who loses.** Every modernization takes influence or familiarity away from someone. Whoever loses and was not heard becomes resistance that shows up as a technical objection.

**Not doing knowledge transfer first.** The undocumented rules live in a few people's heads. If they leave midway, what remains is code archaeology.

**Promising a deadline for discovery work.** While the system's real behavior is unknown, any date is fiction — and the missed date erodes the credibility that sustains the rest of the project.

**Depending on one sponsor.** Modernizations take years and sponsors change departments. Without distributed support, one person's departure ends the project.

**Separating whoever builds from whoever will operate.** Whoever operates inherits decisions they didn't make and lack the context to sustain, and operating the new system ends up worse than the old one.

**Not delivering value before month six.** A long project with no visible delivery loses priority at the first budget cut, regardless of technical merit.

## Real-World Example

An energy company started replacing its billing system — 21 years old, critical,
maintained by four people.

The project was well designed technically: strangling, defined slices, data migration
planned.

It was cancelled in month 15, about 40% complete.

The subsequent analysis identified four causes, none technical:

**Support.** The sponsor — a director — left the company in month 11. Their replacement
had no commitment to the program, and in the following budget cycle reallocated the
resources.

**Late value.** The first slice with value visible to the business was planned for month
18. In the 15 months executed, nothing perceptible had been delivered.

**Knowledge.** Two of the four people who maintained the system left during the project —
one of them to a competitor. The knowledge transfer was planned for the final phase.

**Resistance.** The team maintaining the old system saw the project as the end of their
own role. Cooperation was formal and minimal; information surfaced late.

The second attempt, started two years later, changed the approach before changing the
technique:

**Three sponsors**, from different areas, with a joint quarterly review.

**First slice with value in month 4.** The sequence was reordered to deliver, early, a
feature the business had been asking for for years — reissuing a bill with
recalculation.

**Knowledge transfer as phase 1.** Four months before any new code, with characterization
tests and documentation produced by the people who maintained the system.

**The old system's team as protagonists.** The two remaining people were designated
technical authorities on the new system, with the role formalized. The resistance
disappeared — they now had something to gain.

**An agreed proportion.** 30% of capacity on modernization, 70% on product, reviewed
quarterly.

**Estimates as ranges**, per slice, re-estimated at each delivery.

The second attempt took 26 months — more than the 18 originally planned in the first —
and it was completed.

In the retrospective: the first attempt's technical design was better than the second's.
It failed for reasons that were outside the architecture document, and that nobody had
considered part of the project's scope.

## Related Concepts

- [Modernization Risk](/16-legacy-modernization/modernization-risk.md).
- [Incremental Modernization](/16-legacy-modernization/incremental-modernization.md).
- [Modernization Drivers](/16-legacy-modernization/modernization-drivers.md).
- [Architecture Leadership](/23-architecture-leadership/index.md).

## Practical Exercise

For a modernization program underway or planned, list: who sponsors it, who holds the
unique knowledge, and who loses from the change.

The three lists are viability conditions — and none of them is usually in the plan.

## Interview Questions

- Why does support evaporate, and what sustains it?
- Why is resistance to modernization generally not irrational?
- Why does estimating modernization like construction erode confidence?

## Further Reading

- Kotter, John. *Leading Change*. HBS Press, 1996.
- Skelton, Matthew; Pais, Manuel. *Team Topologies*. IT Revolution, 2019.
- Hohpe, Gregor. *The Software Architect Elevator*. O'Reilly, 2020.

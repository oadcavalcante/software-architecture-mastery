---
id: technology-architecture
title: Technology Architecture
sidebar_position: 5
description: The foundation everything runs on — and the cost of each additional technology to operate.
doc_type: concept
level: 6
difficulty: advanced
status: complete
objective: >
  By the end, the reader evaluates technology variety by its aggregate operational cost
  and decides what the organization can support.
prerequisites: [enterprise-architecture]
related: [technology-radar, standards, platform-engineering]
canonical_for: []
translated_from_version: 1
last_reviewed: 2026-08-31
---

# Technology Architecture

## Overview

Technology architecture describes the foundation applications run on: infrastructure,
platforms, languages, storage, tools.

Its central decision is not which technology is best. It is **how many the organization
can support well** — because each one added carries a permanent operational cost that
rarely enters the decision.

## Problem

Technology choice is made per team, driven by the local problem and the familiarity of
whoever decides. That is reasonable and it produces an expensive aggregate.

```text
each language     pipeline, tooling, standard libraries, knowledge
each database     operation, backup, monitoring, tuning, on-call
each platform     upgrades, security, integration
each tool         license, learning, maintenance
```

The cost is not added — it is multiplied by the number of people who need to know each
one, and by the number of environments each one has to be operated in.

And it is invisible in the local decision: whoever picks the fourth database does not pay
the cost of operating four databases.

## Core Concepts

### The cost of one additional technology

Stated explicitly, because the estimate is usually made of the license cost alone:

```text
knowledge       someone has to master it, and more than one person
operation       monitor, upgrade, patch, respond to incidents
integration     with the pipeline, telemetry, identity, network
security        track vulnerabilities, apply fixes
hiring          one more requirement in the search for people
on-call         someone has to know how to debug it at 3am
```

The last line is the most direct test: **are there at least three people capable of
resolving an incident in this technology at 3am?** If not, it is a risk, not a choice.

### Variety versus fit

The real tension in this area:

```text
more variety   the right tool for each problem
               multiplied operational cost
less variety   low operational cost
               the wrong tool in some cases
```

Neither extreme works. An organization with a single technology for everything forces bad
solutions; one with no constraint at all cannot operate any of them well.

The balance point depends on size: an organization of 30 engineers supports far fewer
technologies well than one of 300.

And the rule of thumb that works: **support few well, allow exceptions with the team
taking on the operation**. See
[technology radar](/15-enterprise-architecture/technology-radar.md).

### Managed services change the math

A technology consumed as a managed service has a far lower operational cost than the same
one self-managed.

```text
self-managed database   high operational cost — counts as a supported technology
managed database        low cost — the variety weighs less
```

See [managed services](/09-cloud-architecture/managed-services.md).

This changes the decision: adopting an additional managed store is a much smaller
decision than adopting it self-managed — and the discussion frequently fails to make that
distinction.

### Obsolescence needs a plan

Technologies age, and the cost grows silently:

```text
version out of support      no security fixes
shrinking community         fewer libraries, fewer answers
hard hiring                 few people with the experience
vendor discontinuing        a deadline imposed from outside
```

What avoids the crisis:

```text
version inventory, derived
alert on approaching end of support
upgrades as routine, not as a project
exit plan for what is in decline
```

The third line is the deciding one: organizations that treat upgrades as an extraordinary
project accumulate lag until the upgrade turns into a crisis.

See [supply chain trust](/10-security/supply-chain-trust.md).

### Consolidating has a cost and does not always pay off

The temptation, faced with excessive variety, is to standardize everything on one
technology.

The cost of migrating working systems is high, and the benefit — one fewer technology to
operate — needs to exceed it.

```text
consolidating makes sense   technology in decline, with risk
                            few systems using it, cheap migration
                            disproportionate operational cost
doesn't make sense          stable system, working, with a team that knows it
```

The honest decision is frequently: **stop adding, and let the existing one die naturally**
as systems are replaced for other reasons.

### The platform is the mechanism, not the document

A document listing supported technologies depends on someone consulting it. A platform
that offers the supported ones ready to use makes the right choice the easiest one.

See [internal developer platforms](/14-devops-and-platform/internal-developer-platforms.md) and
[standards](/15-enterprise-architecture/standards.md).

It is the difference between governing by document and governing by paved road.

### Variety grows by accretion and never by decision

A dynamic worth naming: adding a technology is a local decision, made by one team, with
an immediate and visible benefit. Removing one is an organizational decision, with no
visible benefit, that requires migrating systems that work.

The structural result: variety only grows.

```text
adding     one team decides, local benefit, distributed cost
removing   someone has to lead it, local cost, distributed benefit
```

This incentive asymmetry is the root cause, and it is not corrected with discipline. What
works are mechanisms that compensate for it:

**Make the cost visible in the decision to add.** Whoever proposes presents the aggregate
operational cost — on-call, knowledge, integration.

**Assign someone the responsibility to reduce**, with legitimacy equivalent to that of
whoever adds.

**A reevaluation deadline** on adopted technologies: in twelve months, is it still
justified?

The third is the simplest and the least used. It turns "we added it and it stayed" into a
decision that has to be reaffirmed with evidence.

## Mental Model

**Each additional technology has a permanent operational cost.** The question is not
whether it is good, it is whether the organization can operate it well.

## When to Use

- When evaluating the adoption of a new technology.
- When defining what the platform supports.
- In obsolescence planning.
- After acquisitions, to evaluate what came along.
- When operational cost grows without explanation.

## When Not to Use

**Evaluating license cost only.**

**Standardizing on a single technology.**

**Consolidating stable systems** without a clear benefit.

**Without an obsolescence plan.**

**Governing by document** instead of by platform.

**Without distinguishing managed from self-managed** in the variety math.

## Alternatives

- **[Technology radar](/15-enterprise-architecture/technology-radar.md)** — guidance with context.
- **Paved road** — what is supported comes ready.
- **Exception with assumption of operation** — the team that chooses outside takes the
  on-call.
- **Managed services** — they reduce the cost of variety.

The third is the mechanism that balances autonomy and cost: the choice remains possible,
and whoever makes it pays for it.

## Trade-offs

| Fewer technologies | More |
|---|---|
| Simple operation | Complex |
| Concentrated knowledge | Dispersed |
| Poor fit in some cases | The right tool |
| Easier hiring | More requirements |

| Managed | Self-managed |
|---|---|
| Low variety cost | High |
| Less control | Total |
| Provider dependency | Autonomy |

## Failure Modes

**Variety without the capacity to operate it.** On-call no one knows how to answer.

**Accumulated obsolescence.** The upgrade becomes a crisis.

**Invisible operational cost.** It grows without being attributed.

**Excessive standardization.** Bad solutions forced.

**Consolidation without return.** Expensive migration of systems that worked.

**A technology with a single person who knows it.**

## Common Mistakes

**Not accounting for operational cost in the decision.** The comparison is usually of license or instance price; what dominates the total is on-call, upgrades and the competence to maintain.

**Not checking how many people know how to operate it.** A technology one person masters is a continuity risk, however good it is technically.

**Treating upgrades as a project.** Deferring until it becomes a project accumulates several versions of incompatible changes, and what would have been routine becomes an expensive migration.

**Not distinguishing managed from self-managed.** They are decisions with opposite cost and risk profiles; comparing them by price per transaction ignores the difference that matters.

**Consolidating on principle.** Reducing the number of technologies is good until it forces cases that don't fit — and then the cost of the forced fit exceeds that of the diversity.

**Governing by list.** A list of approved technologies ages and becomes an obstacle. What holds up is the evaluation criterion, which stays valid when the list doesn't.

## Real-World Example

A technology company with 120 engineers took an inventory of the technologies in use:

```text
main languages          6
databases               9
messaging systems       4
runtime platforms       3
pipeline tools          4
```

Nine databases for 120 engineers.

The sustainability assessment — how many people can resolve an incident in each one — was
revealing:

```text
main relational database    dozens
cache                        many
search                       4
time series                  2
graph                        1
document (two different)     3 and 1
columnar                     2
secondary key-value          1
```

Four technologies with one or two people capable of handling an incident.

And the usage analysis showed that three of them each supported a single service, of low
criticality.

The decisions:

**Stop adding.** New storage choices came to require a justification with the operational
cost made explicit, and broad-reach approval. See
[architecture levels](/15-enterprise-architecture/architecture-levels.md).

**Migrate what was cheap.** The three low-criticality services on single-expert
technologies migrated to the main relational database — in none of them did the original
choice have a justification that survived review.

**Keep what was justified.** Search and time series stayed, with investment in expanding
knowledge from 4 and 2 to 6 and 5 people. Both were genuinely necessary.

**Migrate to managed** where possible. Four of the nine were self-managed; three
migrated, reducing operational cost without reducing variety.

**The graph stayed**, with one person. It was recorded as an accepted risk, with a
knowledge transfer plan over twelve months.

Result: from nine databases to six, and none with fewer than five people capable of
handling it.

What was recorded afterwards: none of the nine choices had been wrong at the moment it
was made. Each one solved a real problem. The error was never adding them up — no one
had, until the inventory, the view that the organization operated nine stores.

## Related Concepts

- [Technology Radar](/15-enterprise-architecture/technology-radar.md).
- [Standards](/15-enterprise-architecture/standards.md).
- [Platform Engineering](/14-devops-and-platform/platform-engineering.md).
- [Managed Services](/09-cloud-architecture/managed-services.md).

## Practical Exercise

List the infrastructure technologies in use in your organization and, for each one, how
many people can resolve an incident in it.

Those with fewer than three are a risk, not a choice.

## Interview Questions

- Why is the cost of an additional technology multiplied, not added?
- Why do managed services change the variety math?
- Why does consolidating not always pay off?

## Further Reading

- Ross, Jeanne et al. *Enterprise Architecture as Strategy*. HBS Press, 2006.
- Skelton, Matthew; Pais, Manuel. *Team Topologies*. IT Revolution, 2019.
- Thoughtworks. *Technology Radar*.

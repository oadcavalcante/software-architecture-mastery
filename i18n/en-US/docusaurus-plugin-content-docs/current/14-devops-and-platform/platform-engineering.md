---
id: platform-engineering
title: Platform Engineering
sidebar_position: 10
description: Treating internal infrastructure as a product — and why the platform nobody uses is worse than none.
doc_type: concept
level: 5
difficulty: advanced
status: complete
objective: >
  By the end, the reader evaluates whether an internal platform is justified and what
  it needs in order to be adopted.
prerequisites: [devops-and-platform]
related: [internal-developer-platforms, sre-concepts, ci-cd]
canonical_for: []
translated_from_version: 1
last_reviewed: 2026-08-31
---

# Platform Engineering

## Overview

Platform engineering is the discipline of building internal capabilities — pipelines, infrastructure,
observability, standards — as a **product**, with internal users who choose to use it.

The word that makes the difference is *choose*. A mandatory platform that does not solve people's problem
becomes an obstacle with good intentions.

And the reason it exists: with no platform, each team resolves the same problems separately, and the
cognitive load of operating consumes the capacity to build the product.

## Problem

The movement of giving operational autonomy to teams — each team builds and operates what it builds —
resolves one problem and creates another.

Each team needs to know: containers, orchestration, networking, identity, telemetry, pipelines, cost,
security. See [Kubernetes](/09-cloud-architecture/kubernetes.md) and
[cloud identity](/09-cloud-architecture/cloud-identity.md).

Multiplied by twelve teams, that is twelve times the same learning, twelve divergent configurations, and a
load that competes directly with building the product.

The wrong answer is centralizing the operation back — recreating the division autonomy wanted to eliminate.
See [SRE concepts](/13-observability/sre-concepts.md).

## Core Concepts

### A paved road, not a rail

The metaphor that defines the approach:

```text
a rail        the only permitted path, mandatory
a paved road  the easy path, with support, that most choose
              stepping off it is possible, and it costs
```

The paved road delivers: deployment ready, telemetry configured, a working pipeline, security standards
applied — with no need for the team to assemble anything.

Teams with a genuine need to step off can step off, taking on the work the platform was doing for them.
That is what prevents the platform from becoming a bottleneck for the cases it did not anticipate.

And it is what gives the quality signal: if everybody steps off the paved road, it is not solving the
problem.

### The platform is a product, with users who can refuse

The consequences of taking that seriously:

```text
needs research             before building
adoption as a metric       not "how many are required to", "how many choose to"
documentation and examples like any product
support                    somebody answers when it breaks
a public roadmap           the users know what is coming
deprecation with notice    you do not remove what teams depend on
```

The second line is the test. A platform with mandatory adoption and low satisfaction is failing, and the
mandate hides the signal.

### Reducing cognitive load is the goal

The criterion for deciding what the platform does:

```text
it makes sense    what every team needs and none wants to build
                  pipelines, observability, deployment, secrets, environments
it does not       what is specific to each team's domain
                  the data model, business rules, product decisions
```

And there is a trap: a platform that abstracts too much prevents the teams from understanding what happens
— and, when something breaks, nobody knows how to diagnose it.

The abstraction needs to be **transparent**: hiding the complexity on the normal path, and allowing you to
go down when necessary.

### The size decides whether it is justified

```text
up to 3 or 4 teams   conventions and an examples repository are enough
5 to 15 teams        one or two dedicated people, part time
15+ teams            a dedicated platform team
```

Creating a platform team too early produces a platform for a problem that does not exist yet — and it needs
to be maintained, evolved and migrated when the real problem appears.

And the platform needs to be **smaller** than the problem it resolves. A six-person team building a
platform for eight product teams usually indicates the target is wrong.

### The platform team does not operate the others' services

The distinction that avoids recreating the division:

```text
the platform builds   tools, standards, automation
product teams use     and operate their own services
```

If the platform team becomes the operator of every service, the autonomy ends and the bottleneck comes
back.

See [SRE concepts](/13-observability/sre-concepts.md) — it is the same structural mistake.

### Measure what matters

```text
voluntary adoption          how many teams choose the paved road
time to first deploy        a new service, from zero to production
pipeline time               the daily friction
satisfaction                a periodic survey, with action
teams' operational load     how much time they spend on infrastructure
```

The second is the most direct indicator: if creating a new service with everything configured takes two
weeks, the platform is not delivering.

## Mental Model

**A platform is a product with internal users.** If they could choose, would they choose it? If the answer
is no, the mandate is hiding the problem.

## When to Use

- Many teams resolving the same infrastructure problems.
- Operational load consuming product capacity.
- Divergence between teams causing security or operational problems.
- Where standardization has value — auditing, compliance.

## When Not to Use

**With few teams.** Conventions are enough.

**As a mandate** with no quality that sustains the choice.

**Operating the other teams' services.**

**Abstracting to the point where nobody can diagnose.**

**With no voluntary adoption metric.**

**Building what is domain-specific.**

## Alternatives

- **Conventions and examples** — template repositories, documentation. Cheap and sufficient for small
  organizations.
- **Shared libraries** — with no platform, with standards in code.
- **A commercial platform** — buying instead of building. See [SaaS](/09-cloud-architecture/saas.md).
- **An enabling team** — helping the teams resolve it, instead of resolving it for them.

The last is frequently better at the start: it transfers capability instead of creating dependency.

## Trade-offs

| With a platform | Each team on its own |
|---|---|
| Standardization | Divergence |
| Lower cognitive load | Each team learns everything |
| A dedicated team to maintain it | No fixed cost |
| A bottleneck risk | Total autonomy |
| An abstraction to understand | Direct tools |

| A paved road | Mandatory |
|---|---|
| A quality signal | Hidden |
| Special cases served | A bottleneck |
| Requires real quality | Adoption guaranteed |

## Failure Modes

**A platform nobody wants to use.**

**A bottleneck.** Every change depends on the platform team.

**An opaque abstraction.** It broke, and nobody knows why.

**A platform larger than the problem.**

**The platform team operating other people's services.**

**With no planned deprecation.** Old things maintained forever.

**Built without talking to the users.**

## Common Mistakes

**Creating a platform team too early.** With few consuming teams, the platform costs more than the
duplication it would eliminate — and it also concentrates people away from the product.

**Making it mandatory instead of good.** Forced adoption hides the signal that the platform does not serve.
When the paved road is actually the easiest, it needs no mandate.

**Measuring forced adoption.** One hundred percent mandatory adoption says nothing about quality. The
useful indicator is how long a team takes from zero to production.

**Abstracting with no way down.** Every abstraction leaks in some case. With no escape hatch, the first team
with a need outside the standard works around the whole platform — and does not come back.

**Having no support and no documentation.** A platform is an internal product. With nobody answering
questions and no usage material, the cost of adopting it falls on each team, one at a time.

**Taking over the operation of other people's services.** The platform team becomes on-call for everything,
loses the capacity to evolve the platform, and gives the product teams back their disinterest in their own
reliability.

## Real-World Example

A company with 14 product teams created a six-person platform team, with the mandate to standardize the
infrastructure.

The first version was built in eight months, with no consultation of the teams. It completely abstracted
the orchestration behind a configuration file of its own.

The adoption, a year later: **3 of the 14 teams**.

The reasons, collected in interviews:

**It did not solve their problem.** The platform handled deployment, and the teams' main pain was test
environments and observability.

**An opaque abstraction.** When something broke, the error came from the abstraction layer and pointed at
nothing actionable.

**No way out.** A team with a specific need could not step off partially — it was all or nothing.

**No support.** Questions went days without an answer.

The reformulation changed the approach before changing the technology:

**A survey with the 14 teams**, asking where the time was spent. The result contradicted the hypothesis:
deployment was the fourth item; ephemeral environments and observability were the first and second.

**A redirection.** The platform came to deliver ephemeral environments and standardized telemetry — what
the teams asked for.

**A paved road, not a rail.** The abstraction became a template that generates the real configuration,
visible and editable. Teams can step off the template while keeping what it generated.

**Support with a response commitment**, and a dedicated channel.

**Voluntary adoption as a metric**, reviewed quarterly with the teams.

Eighteen months later: 13 of the 14 teams on the paved road, by choice. The team that stayed off has a
latency requirement the platform does not meet — and that is considered acceptable.

And the platform team went from six to four people, because part of the initial work was maintaining the
proprietary abstraction that was abandoned.

What was recorded afterward: eight months were spent building the solution to the wrong problem. The survey
that redirected everything took two weeks and could have been done first.

## Related Concepts

- [Internal Developer Platforms](/14-devops-and-platform/internal-developer-platforms.md) — the
  implementation.
- [SRE Concepts](/13-observability/sre-concepts.md).
- [Environment Management](/14-devops-and-platform/environment-management.md).
- [Continuous Integration](/14-devops-and-platform/ci-cd.md).

## Practical Exercise

Ask the product teams where their time is spent outside building features.

Compare with what your platform — or your platform plan — resolves. The difference is the misalignment.

## Interview Questions

- What is the difference between a paved road and a rail?
- Why is voluntary adoption the metric that matters?
- Why should the platform team not operate the others' services?

## Further Reading

- Skelton, Matthew; Pais, Manuel. *Team Topologies*. IT Revolution, 2019.
- Bottcher, Evan. *What I Talk About When I Talk About Platforms*, 2018.
- Forsgren, Nicole et al. *Accelerate*. IT Revolution, 2018.

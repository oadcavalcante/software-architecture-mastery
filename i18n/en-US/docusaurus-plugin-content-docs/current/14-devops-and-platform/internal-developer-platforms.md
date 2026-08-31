---
id: internal-developer-platforms
title: Internal Developer Platforms
sidebar_position: 11
description: The paved road's implementation — self-service, with what the developer actually needs.
doc_type: concept
level: 5
difficulty: advanced
status: complete
objective: >
  By the end, the reader defines an internal platform's scope and the interaction
  model that makes it usable.
prerequisites: [platform-engineering]
related: [platform-engineering, environment-management, ci-cd]
canonical_for: []
translated_from_version: 1
last_reviewed: 2026-08-31
---

# Internal Developer Platforms

## Overview

An internal developer platform is the concrete implementation of the paved road: a set of capabilities the
teams consume by **self-service**, with no dependence on anybody.

The defining word is *self-service*. A platform where creating an environment requires opening a ticket is
not a platform — it is an infrastructure team with a new name.

See [platform engineering](/14-devops-and-platform/platform-engineering.md) for the discipline; here, what
it delivers and how.

## Problem

With no self-service, each infrastructure need becomes a queue:

```text
creating a new service       a ticket, days
provisioning a database      a ticket, days
adding a credential          a ticket, hours
creating a test environment  a ticket, contention
publishing a metric          manual configuration
```

The waiting time is not the only cost. It changes behavior: people avoid creating services, reuse what
should not be reused, and keep environments occupied out of caution.

## Core Concepts

### What a platform delivers

```text
service creation    a template with the pipeline, telemetry and deployment ready
environments        ephemeral, on demand
infrastructure      a database, a queue, a cache — declared by the team, provisioned
                    by the platform
observability       standard dashboards and alerts, with no configuration
secrets             management and injection
deployment          ready-made strategies, with rollback
a catalog           what exists, who owns it, how it is doing
```

The first line is the maturity indicator: **how long between "I want a new service" and "it is in
production with everything configured?"**

In mature platforms, minutes. With no platform, weeks.

### Self-service with limits

Self-service does not mean an absence of control. It means the control is **codified**, not in a person:

```text
enforced policy       resource limits, security standards, mandatory tagging
approval where needed for high cost or a sensitive resource
safe defaults         the easy path is already the correct one
auditing              who created what
```

The third line is the most effective mechanism: if the default template already comes with limits,
telemetry, tagging and minimal permissions, compliance happens with no effort.

See [least privilege](/10-security/least-privilege.md) and
[cost architecture](/09-cloud-architecture/cost-architecture.md).

### The catalog is what makes the organization navigable

A record of what exists:

```text
services         name, owner, repository, documentation
dependencies     what calls what
state            the version in production, health, reliability targets
infrastructure   what that service uses
```

It answers questions that, without it, require asking people: who owns this? who depends on this service?
what breaks if I change this?

And it only stays up to date if it is **derived**, not filled in by hand. A catalog that depends on
somebody updating it is out of date in three months.

See [data ownership](/07-data-architecture/data-ownership.md) — it is the same principle applied to
services.

### The interaction model decides the adoption

```text
a web portal            discoverable, good for occasional actions
a command line          fast, good for frequent use
a declaration in the repository  versioned, reviewable, integrated into the flow
```

The third is what sustains daily use: the team declares what it needs in a file, alongside the code, and
the platform converges. See [infrastructure as code](/14-devops-and-platform/infrastructure-as-code.md).

The portal is complementary — for discovering what exists and for rare actions.

Platforms that offer **only** a portal produce a predictable behavior: people automate around it, with
direct API calls, and the platform loses the control the portal was supposed to give.

### What not to put in the platform

```text
business rules            each team's
architectural decisions   each service's
abstracting everything    the team needs to be able to understand what runs
one-off cases             that only one team needs
```

The last deserves attention: a platform that absorbs every exception becomes a product with hundreds of
parameters, impossible to maintain.

The correct answer for the one-off case is stepping off the paved road — the team implements it, and the
platform stays simple.

### Deprecation needs to be planned

A platform evolves. Removing a capability twelve teams depend on requires the same care as a public API:

```text
notice with a long deadline
a documented migration path, and preferably an automated one
coexistence of the two versions
tracking who still uses it
```

See [integration contracts](/08-integration-architecture/integration-contracts.md).

Platforms that break teams with no notice lose their trust — and recovering takes far longer than breaking
it.

## Mental Model

**Self-service with safe defaults.** The easy path needs to be the correct one, and the control needs to be
in the code, not in a person.

## When to Use

- Many teams creating and operating services.
- Infrastructure queues delaying deliveries.
- A need for standardization for security or compliance.
- Where the cost of learning infrastructure per team is high.

## When Not to Use

**With no self-service.** A ticket is not a platform.

**With few teams.**

**Absorbing every exception.**

**With a portal only**, with no programmable interface.

**With a hand-maintained catalog.**

**With no deprecation plan.**

## Alternatives

- **Template repositories** — the minimum viable: an example with everything configured, copied by the
  teams.
- **Shared libraries and modules** — standards in code, with no platform.
- **A commercial platform** — buying it. See [SaaS](/09-cloud-architecture/saas.md).
- **An enabling team** — building capability instead of abstracting.

The first is underestimated: a well-maintained template repository, with the pipeline, telemetry and
deployment ready, delivers a good part of a platform's value at a fraction of the cost.

## Trade-offs

| A platform | Template repositories |
|---|---|
| Central updating | Each copy diverges |
| A dedicated team | No fixed cost |
| Abstraction | Transparent |
| Built-in governance | Depends on discipline |

| A declaration in the repository | A portal |
|---|---|
| Versioned and reviewable | One-off actions |
| Integrated into the flow | Discoverable |
| A learning curve | Immediate |

## Failure Modes

**A ticket disguised as a platform.**

**An out-of-date catalog.**

**The platform absorbing exceptions.** Growing complexity.

**A portal only.** Automation around it.

**Deprecation with no notice.** Broken teams.

**Abstraction preventing diagnosis.**

**Unsafe defaults in the template.** The mistake multiplies across every service created.

## Common Mistakes

**Not offering real self-service.**

**A hand-filled catalog.**

**Having no programmable interface.**

**Accepting every special case.**

**Not planning deprecation.**

**Not reviewing the template's defaults** — they propagate to everything that is created.

## Real-World Example

A technology company with 18 teams had the following time to put a new service in production, with
everything configured: **three weeks**.

The breakdown:

```text
repository and pipeline    2 days
infrastructure             5 days, by ticket
credentials and secrets    3 days, by ticket
telemetry and dashboards   4 days, manual configuration
alerts                     2 days
security review            5 days
```

The behavioral consequence: the teams avoided creating services. New features were crammed into existing
services, which grew beyond what they should.

The platform was built in phases, prioritized by the time each stage consumed:

**Phase 1 — service creation.** A template generating the repository, pipeline, deployment and telemetry
configured. From 8 days to 4 minutes.

**Phase 2 — infrastructure by declaration.** The team declares in a file what it needs — a database, a
queue, a cache — and the platform provisions it, with limits and tagging applied automatically. From 5 days
to 10 minutes.

**Phase 3 — self-service secrets**, with permissions derived from the service.

**Phase 4 — security standards in the template.** The 5-day review became an automated check, because the
template already produced what the review required. Human review came to be the exception, for services
handling sensitive data.

**A catalog derived** from the declaration and the pipeline, with no manual filling.

Total time: from three weeks to **around 40 minutes**.

Two problems appeared:

**An unsafe default propagated.** The initial template had a too-broad permission on the service's role.
Before it was fixed, 30 services had already been created with it. Mandatory review of template changes
came to exist, with the same rigor as a production change.

**Special cases.** In the first months, the platform accepted exceptions from four teams. Each one became a
parameter. On reaching 20 parameters, the maintenance became unsustainable. The policy changed: special
cases step off the paved road, with the platform delivering the generated configuration as a starting
point.

The point the team underlines: the behavior change was larger than the time change. With service creation
in minutes, the teams came to decompose appropriately — and the bloated services problem, which was treated
as an architecture question, was a consequence of the friction.

## Related Concepts

- [Platform Engineering](/14-devops-and-platform/platform-engineering.md) — the discipline.
- [Environment Management](/14-devops-and-platform/environment-management.md).
- [Infrastructure as Code](/14-devops-and-platform/infrastructure-as-code.md).
- [Least Privilege](/10-security/least-privilege.md) — the template's defaults.

## Practical Exercise

Time how long it takes, in your context, to put a new service in production with a pipeline, telemetry,
alerts and infrastructure.

The number explains a good part of the architectural decisions your team makes.

## Interview Questions

- Why is self-service what defines a platform?
- Why does the catalog need to be derived?
- Why does absorbing special cases degrade the platform?

## Further Reading

- Skelton, Matthew; Pais, Manuel. *Team Topologies*. IT Revolution, 2019.
- Bottcher, Evan. *What I Talk About When I Talk About Platforms*, 2018.
- Fowler, Martin. *Developer Effectiveness*, 2021.

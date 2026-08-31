---
id: replatforming
title: Replatforming
sidebar_position: 5
description: Changing the infrastructure without changing the application — the first step that unblocks the rest.
doc_type: concept
level: 6
difficulty: intermediate
status: complete
objective: >
  By the end, the reader uses replatforming to unblock delivery and observability, without
  expecting it to solve code problems.
prerequisites: [migration-strategies]
related: [migration-strategies, incremental-modernization, cloud-native]
canonical_for: []
translated_from_version: 1
last_reviewed: 2026-08-31
---

# Replatforming

## Overview

Replatforming is moving the application to new infrastructure, with minimal changes to
the code.

It is the cheapest, fastest and lowest-risk strategy — and the most underestimated,
because it doesn't solve code problems and therefore looks insufficient.

What it delivers is **unblocking**: an automated pipeline, reproducible environments,
observability, frequent deployment. And that reduces the cost of all the work that
follows — including rebuilding, if that is the case.

## Problem

Old systems frequently run on infrastructure that prevents the practices that would make
modernization viable:

```text
a hand-configured server nobody knows how to recreate
manual deployment, with a maintenance window
no equivalent test environment
no telemetry beyond log files on disk
a quarterly release because each one is an event
```

In that context, any change is expensive — including the changes of the modernization
itself.

Replatforming first removes those constraints, and the work that follows becomes cheaper.

## Core Concepts

### What it delivers

```text
declared infrastructure   the environment can be recreated
automated pipeline        deployment with no manual procedure
equivalent environments   verification before production
observability             knowing what happens
frequent deployment       smaller batches, viable rollback
lower cost                frequently, when leaving your own infrastructure
```

See [infrastructure as code](/14-devops-and-platform/infrastructure-as-code.md) and
[environment management](/14-devops-and-platform/environment-management.md).

Each of those reduces the cost of future changes. That is why it is usually the correct
first step, even when it is not the final objective.

### What it doesn't deliver

Being explicit, because the expectation is usually higher:

```text
the code stays the same
the data model stays the same
the coupling stays the same
development speed doesn't change on its own
```

An application that is hard to change is still hard to change after being replatformed.
See [legacy refactoring](/16-legacy-modernization/legacy-refactoring.md).

Teams that expect an infrastructure change to solve code problems end up frustrated — and
the frustration discredits a strategy that did exactly what it should.

### Lift and shift is a stage, not a destination

Moving without changing is the correct decision for leaving a datacenter on a deadline, or
for reducing cost quickly.

And it needs a continuation. See
[cloud native](/09-cloud-architecture/cloud-native.md).

An application moved to the cloud without acquiring the properties the cloud presupposes —
statelessness, disposability, external configuration — runs there and takes advantage of
nothing, frequently at a higher cost.

The plan has to include the second phase, with a deadline. Without that, it doesn't
happen.

### The minimal adaptations that are worth it

Replatforming "without changing the code" is a simplification. Some adaptations have a
high return and a low cost:

```text
externalized configuration   allows promoting the same artifact
logs to standard output      allows centralized collection
graceful shutdown            allows deployment without losing requests
state off the local disk     allows more than one instance
health check                 allows load balancing and recovery
```

See [statelessness](/11-scalability/statelessness.md).

All five are small and unblock disproportionately. Replatforming without them produces a
system in the cloud that still has to be treated as a single server.

### The risk is low, and it is not zero

```text
environment differences    versions, system libraries, network behavior
different performance      hardware, disk latency, network latency
hidden dependencies        a file, a machine, a scheduled job
integrations by fixed address  pointing at the old environment
```

The third is the one that surprises most: old systems accumulate undocumented
dependencies — a shared directory, a process running on a forgotten machine, a scheduled
task nobody knew existed.

See [current state architecture](/15-enterprise-architecture/current-state-architecture.md).

The control: run in parallel for a period, with the old one still available, before
shutting it down.

### Cost may go up

A common and frequently frustrated expectation: replatforming to the cloud reduces cost.

It reduces cost when the sizing is revisited. Moved as is — with the same provisioned
capacity as a datacenter, where the hardware was already paid for — it usually costs
more.

See [cost architecture](/09-cloud-architecture/cost-architecture.md).

Resizing based on real utilization is part of the replatforming, not a later
optimization.

### The old system reveals what the infrastructure was hiding

A frequent side effect: on moving the application, behaviors the old infrastructure
accommodated start showing up.

```text
dependency on startup order      the old server always came up in the same sequence
memory leak                      the weekly restart masked it
dependency on server time        the timezone had been the same for years
writing to an absolute path      the directory existed by convention
a connection never closed        the pool was large enough
```

None of those is caused by the replatforming. They existed and were compensated for by
characteristics of the old environment nobody had documented.

That has two practical implications: the estimate has to include time to deal with them,
and the parallel operation period has to be long enough for them to appear — some only
manifest after days of continuous operation.

And there is an upside: each of those is a latent defect the replatforming exposes.
Fixing them improves the system, regardless of the infrastructure change.

## Mental Model

**Replatforming unblocks; it does not fix.** It is the first step that makes all the
following ones cheaper.

## When to Use

- Obsolete or expensive infrastructure, or a contract ending.
- As the first step of a larger modernization program.
- When delivery is limited by the infrastructure, not by the code.
- To unblock observability and frequent deployment.
- Leaving a datacenter on a deadline.

## When Not to Use

**Expecting it to solve code problems.**

**As a final destination**, with no plan to continue.

**Without the minimal adaptations.**

**Without revisiting the sizing.**

**Without a parallel operation period.**

**When the system will be replaced soon** for another reason.

## Alternatives

- **[Refactoring](/16-legacy-modernization/legacy-refactoring.md)** — when the problem is the code.
- **[Rebuilding](/16-legacy-modernization/rebuilding.md)** — when the model is wrong.
- **[Replacing](/16-legacy-modernization/replacing.md)** — when there is an off-the-shelf product.
- **Keep it where it is** — when the infrastructure serves and there is no deadline.

## Trade-offs

| Replatform | Rebuild |
|---|---|
| Weeks to months | Years |
| Low risk | High |
| Unblocks operations | Fixes the model |
| Code untouched | New |
| Cheap | Expensive |

| Lift and shift | With minimal adaptations |
|---|---|
| Faster | A few weeks more |
| Doesn't take advantage of the platform | Unblocks scale and deployment |

## Failure Modes

**Frustrated expectation.** It was expected to solve the code.

**Lift and shift becoming permanent.** The second phase never happens.

**Higher cost.** Sizing not revisited.

**A hidden dependency broken.** A forgotten process stops working.

**Different performance.** The system was tuned for the old hardware.

**No parallel run.** The old one was shut down before the new one was validated.

## Common Mistakes

**Promising it solves maintenance problems.** Changing infrastructure touches neither coupling nor model. Promising that guarantees disappointment and burns the credibility of the next phase.

**Not making the minimal adaptations.** Externalizing configuration and state is the minimum to reap benefit from the new platform; without it, it is the same application somewhere else, more expensively.

**Not revisiting sizing.** Replicating the old machine's size carries the historical over-provisioning along, and the expected savings never appear.

**Not inventorying hidden dependencies.** Scheduled tasks, shared directories and file-based integrations don't appear in the code and break after the move.

**Not planning the second phase.** Replatforming buys time; with no defined next step, the time is spent and the original problem remains.

**Shutting the old one down too early.** The previous environment is the rollback plan until the new one has been through a complete operating cycle.

## Real-World Example

An insurance company had to leave its datacenter in 14 months, because a contract was
ending. Sixty applications, several more than ten years old.

The decision was to replatform as is — the only option viable within the deadline.

Execution, in waves of increasing complexity:

**Wave 1 — simple applications.** 22 applications, stateless, with clear dependencies.
Three months.

**Wave 2 — stateful applications.** 26 applications. The minimal adaptations were made
here: externalized configuration, logs to standard output, state off disk, graceful
shutdown.

That added about six weeks to the total, and it was what allowed those applications to
run with more than one instance — something several had never managed.

**Wave 3 — the difficult ones.** 12 applications with obscure dependencies. The inventory
found: four scheduled jobs on ownerless machines, three integrations by shared directory,
and one application that depended on a file generated manually once a month.

That last one was only discovered because the month turned over during the parallel
operation period — and the process failed in the new environment.

**Resizing.** The first cost estimate, with capacity replicated, was 40% higher than the
datacenter. The revision using real utilization brought it to 25% lower.

**A parallel period** of 60 days per application, with the old one available.

Result: exit on schedule, with 25% lower cost and an operational capability that had not
existed — an automated pipeline, reproducible environments, centralized telemetry.

And the second phase, planned from the start, began in month 16: refactoring and replacing
the applications the portfolio analysis pointed to. See
[application portfolios](/15-enterprise-architecture/application-portfolios.md).

The recorded lesson: the replatforming improved no application. It made it possible to
improve them — which, before, required a maintenance window and a manual procedure for
every change.

## Related Concepts

- [Migration Strategies](/16-legacy-modernization/migration-strategies.md).
- [Cloud Native](/09-cloud-architecture/cloud-native.md) — the second phase.
- [Infrastructure as Code](/14-devops-and-platform/infrastructure-as-code.md).
- [Statelessness](/11-scalability/statelessness.md).

## Practical Exercise

For a legacy system in your context, list what the current infrastructure prevents:
pipeline, environments, telemetry, frequent deployment.

Each item is a cost the replatforming would remove — and that makes everything else more
expensive.

## Interview Questions

- What does replatforming deliver, and what does it not deliver?
- Which minimal adaptations are worth it, and why?
- Why does the cost frequently go up?

## Further Reading

- Morris, Kief. *Infrastructure as Code*. 2nd ed. O'Reilly, 2020.
- Newman, Sam. *Monolith to Microservices*. O'Reilly, 2019.
- Wiggins, Adam. *The Twelve-Factor App*, 2011.

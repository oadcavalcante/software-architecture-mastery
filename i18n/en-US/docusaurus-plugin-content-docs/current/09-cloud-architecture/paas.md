---
id: paas
title: PaaS
sidebar_position: 2
description: Shipping code and not thinking about servers — high productivity inside a shape you do not choose.
doc_type: concept
level: 5
difficulty: intermediate
status: complete
objective: >
  By the end, the reader recognizes when a PaaS's shape fits the problem and when
  it is going to pinch.
prerequisites: [iaas]
related: [iaas, saas, serverless]
canonical_for: []
translated_from_version: 1
last_reviewed: 2026-08-31
---

# PaaS

## Overview

PaaS — platform as a service — receives your code and takes care of the rest: the operating system, the
runtime, the server, scaling, deployment, certificates.

You hand over the application and configure a few things. The platform decides the rest, by its own
conventions.

Productivity is high, and the price is opinion: the platform has a way of doing things, and leaving it
ranges from difficult to impossible.

## Problem

Between "renting an empty machine" and "writing the application" there is a large amount of repetitive
work: configuring the server, packaging, defining the deployment, configuring a certificate, scaling,
logging, health checking.

That work is practically identical across applications and across companies. Doing it for each project is
reinventing convention.

PaaS packages all of it as a default.

## Core Concepts

### The shape is the feature

A PaaS assumes things: how the application starts, where the configuration comes from, how traffic
arrives, how the file system behaves.

Applications that follow those conventions gain a lot. Applications that need something outside them hit a
wall — and the wall has no door.

That is why the right evaluation is not about features, but: **what does my system need to do that the
platform does not allow?**

### The typical restrictions

Being specific, because it is what decides:

**An ephemeral file system.** A local write vanishes on restart. State needs to go elsewhere.

**No persistent process between requests.** Background work requires a separate component.

**Limited ports and protocols.** Typically HTTP. Custom protocols or long-lived connections may not fit.

**A request time limit.** Long operations are cut off.

**Runtime versions.** The ones the platform supports, at its pace.

**No system access.** Deep diagnosis becomes a ticket.

None is a defect — all of them are the price of convention.

### The twelve rules still hold

The twelve-factor app methodology was born from PaaS and describes what an application needs to be to fit
well:

```text
configuration in the environment, not in a file
no state in the process
dependencies declared explicitly
logs on standard output
disposable processes, with graceful shutdown
parity between development and production
```

Applications that follow that run well on PaaS, in containers and in serverless. It is the discipline that
gives portability across the three models, and it holds even with no PaaS.

### An internal developer platform

The version built in-house — see
[internal developer platforms](/14-devops-and-platform/internal-developer-platforms.md) for the full
treatment: a platform team offers the others a layer with deployment, observability and ready-made
standards, on top of [Kubernetes](/09-cloud-architecture/kubernetes.md) or IaaS.

The goal is the same — removing repetitive work — with the shape defined by the organization itself.

The risk is known: building an internal PaaS is a product, with users, maintenance and evolution. Teams
that treat it as an infrastructure project produce a layer nobody wants to use, and people go back to doing
it directly.

### Where it pays off most

**Small teams** with no dedicated operational capacity.

**Conventional web applications**, which is the majority.

**Delivery speed as a priority.**

**Standardization across many teams**, in the internal platform's case.

**Ephemeral environments** per branch — one of the model's best capabilities, and one of the least used.

### The way out should be known before the way in

A PaaS is easy to enter and unevenly hard to leave, depending on how much of its services you use beyond
running the code.

What usually holds you, in increasing order:

**Running the application.** Easy to move, if the application follows the twelve rules.

**The platform's database and cache.** Exportable, with migration time.

**Proprietary auxiliary services** — queues, schedulers, integrations. With no direct equivalent.

**The platform's automation** — pipelines, review environments, scaling. It needs to be rebuilt.

Knowing where you are on that scale is what allows the exit to be estimated before it is needed. See
[vendor lock-in](/09-cloud-architecture/vendor-lock-in.md).

The practical rule that preserves most of the option at no relevant cost: use the platform to run the code,
and prefer portable managed services for the rest.

## Mental Model

**PaaS trades freedom for productivity.** It is worth it when your application is conventional; it pinches
when it is not.

## When to Use

- A conventional web application.
- A small team, with no operational experience.
- Delivery speed is a priority.
- The platform's defaults meet the requirements.
- Standardizing deployment across many teams.
- Ephemeral environments for review.

## When Not to Use

**When the application needs what the platform does not allow.**

**For long or intensive processing.**

**When the cost at scale makes it unviable.** The per-unit premium is high.

**For legacy software** that assumes a file system and persistent processes.

**An internal platform without treating it as a product.**

**When the dependency is unacceptable.** See [vendor lock-in](/09-cloud-architecture/vendor-lock-in.md).

## Alternatives

- **[Containers](/09-cloud-architecture/containers.md) with orchestration** — more control, more work.
- **[Serverless](/09-cloud-architecture/serverless.md)** — for event-driven workloads.
- **[IaaS](/09-cloud-architecture/iaas.md)** — full control.
- **PaaS on Kubernetes** — platforms that give the PaaS experience while keeping the base portable. A
  middle ground that resolves much of the dependency objection.

## Trade-offs

| PaaS | IaaS or containers |
|---|---|
| Fast delivery | Slower |
| No platform operations | All of it |
| A rigid shape | Freedom |
| A higher unit price | Lower |
| Greater dependency | Less |
| Limited diagnosis | Direct access |

## Failure Modes

**A requirement the platform does not meet.** Discovered late, with no good way out.

**State on the file system lost.**

**A time limit cutting off processing.**

**A discontinued runtime version** with a vendor deadline.

**Cost at scale.** What was cheap at low traffic gets expensive.

**Blocked diagnosis.** With no access, an intermittent problem becomes a support case.

**An abandoned internal platform.** Built and not maintained; the teams work around it.

## Common Mistakes

**Choosing without checking the restrictions against the requirements.** Every platform imposes limits — a
maximum request time, an artifact size, the absence of a persistent disk. Discovering them after building
costs the whole migration.

**Keeping state locally.** The instance's file system is ephemeral by design. A file saved there vanishes
on the next deployment, and the defect appears days later as data that disappeared.

**Putting background work inside the request.** The platform can terminate the process as soon as the
response is sent, and a task fired after it dies halfway, silently.

**Not estimating the cost at the target volume.** The per-unit price is comfortable at low volume and grows
linearly. At the volume of two years from now, it frequently exceeds that of running your own
infrastructure.

**Building an internal platform without treating it as a product.** With no declared users, no
documentation and nobody responsible for evolving it, it becomes one more system the teams work around.

## Real-World Example

A startup built its entire product on a PaaS. In the first two years it was the right decision: four
engineers, no time spent on infrastructure, fast delivery.

In the third year, three limits appeared at the same time:

**Long processing.** A new feature required processing large files, exceeding the request time limit. The
solution was a separate component outside the platform — the first piece of infrastructure of their own.

**Cost.** With traffic grown, the PaaS bill reached around 4 times the estimated cost of the equivalent in
containers. The productivity premium, which was irrelevant at low traffic, became the second-largest item
on the invoice.

**Diagnosis.** An intermittent latency problem took five weeks to resolve, mostly waiting on support,
because the team had no access to the environment to investigate.

The migration to containers took five months. It was made easier by one thing: the application followed the
twelve rules, because the PaaS had forced it to. There was no local state, the configuration came from the
environment, the logs went to standard output.

What the team records: the PaaS was the right choice and stopped being it. Both things are true, and there
was no way to know in the first year — nor was it worth trying to guess.

What would have helped was estimating, at some point in the second year, the point at which the cost would
invert. That would have given months of lead time instead of urgency.

## Related Concepts

- [IaaS](/09-cloud-architecture/iaas.md) — the model below.
- [SaaS](/09-cloud-architecture/saas.md) — the model above.
- [Serverless](/09-cloud-architecture/serverless.md) — the model's evolution.
- [Containers](/09-cloud-architecture/containers.md) — the common alternative.

## Practical Exercise

If you use a PaaS, list three things your system may need to do in the next two years and check whether the
platform allows them.

And estimate the cost at the volume you expect to have — the inversion point usually arrives sooner than
predicted.

## Interview Questions

- Why is a PaaS's shape the feature, and not a limitation?
- Why do the twelve rules give portability across models?
- What risk does building an internal platform carry?

## Further Reading

- Wiggins, Adam. *The Twelve-Factor App*, 2011.
- Skelton, Matthew; Pais, Manuel. *Team Topologies*. IT Revolution, 2019.
- Humble, Jez; Farley, David. *Continuous Delivery*. Addison-Wesley, 2010.

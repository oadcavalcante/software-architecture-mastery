---
id: infrastructure-as-code
title: Infrastructure as Code
sidebar_position: 2
description: Declaring the environment instead of configuring it — and the drift that appears when somebody changes it by hand.
doc_type: concept
level: 5
difficulty: intermediate
status: complete
objective: >
  By the end, the reader declares infrastructure reproducibly and detects drift before
  it becomes an incident.
prerequisites: [devops-and-platform]
related: [environment-management, ci-cd, blue-green]
canonical_for: []
translated_from_version: 1
last_reviewed: 2026-08-31
---

# Infrastructure as Code

## Overview

Infrastructure as code is declaring the desired environment in versioned files, and letting a tool converge
reality toward that declaration.

The gain is not automation — it is **reproducibility**: the environment can be recreated from scratch,
identically, as many times as necessary.

And, with it, come review, history, and the ability to answer "why is this like this?" by consulting the
repository instead of asking somebody.

## Problem

Infrastructure created through the console is fast and produces an environment nobody knows how to rebuild.

The symptom appears late:

```text
"why does this rule exist?"          nobody knows
"can we recreate this?"              maybe
"are production and staging equal?"  no
"what changed yesterday?"            there is no record
```

See [IaaS](/09-cloud-architecture/iaas.md). The problem is not the initial creation — it is everything that
comes afterward.

## Core Concepts

### Declarative, not imperative

```text
imperative    "create an instance, then configure the network, then..."
declarative   "the environment should have this; converge toward it"
```

The practical difference: the declarative one is **idempotent** — applying it twice produces the same
result — and it allows calculating the difference between the desired and the real before acting.

See [Kubernetes](/09-cloud-architecture/kubernetes.md), which applies the same principle to containers.

That changes the operation: instead of executing steps, you alter the declaration and review the
convergence plan before applying it.

### Configuration drift is the enemy

Somebody changes something through the console — during an incident, to test, out of convenience. Reality
starts diverging from the declaration.

The consequences:

```text
the next apply undoes the change      breaking what depended on it
or the tool errs                      because the real state is not the expected one
the environment stops being reproducible
```

What sustains the absence of drift:

**Continuous detection.** Comparing the real with the declared periodically and alerting.

**Restricted access.** A manual change in production requires elevated, temporary permission. See
[least privilege](/10-security/least-privilege.md).

**An easy path.** If changing through the declaration takes 40 minutes and through the console takes 2,
people will go through the console. The friction is what produces the drift.

The third is what decides. Teams that make the declaration the fastest path do not need to prohibit the
other.

### The state is a critical artifact

The tool maintains a record of what it created — the state. Losing it means it no longer knows what it
manages.

```text
remote storage   never local, never in the repository
versioned        to recover from corruption
locked           two simultaneous applies corrupt it
encrypted        it contains identifiers and, sometimes, secrets
```

The last point deserves attention: sensitive values that pass through the declaration end up in the state,
in readable text. See [secrets](/10-security/secrets.md).

### Modularize, in moderation

The temptation to abstract everything into generic modules produces layers where it is hard to know what is
actually created.

```text
good   a module for what repeats — a standard service, a standard network
bad    a generic module with thirty parameters to serve every case
```

The criterion: a module should remove real repetition, not anticipate hypothetical variation.

And modules need to be versioned: a shared module changed with no version changes the behavior of every
environment using it, simultaneously. See [redundancy](/12-reliability/redundancy.md) — it is the same
correlation problem.

### Applying in production is a deployment

The infrastructure declaration deserves the same treatment as application code:

```text
review              somebody else looks
a visible plan      what is going to change, before it changes
environments in order  test, staging, production
gradual             zone by zone, not all at once
reversible          the previous declaration is in the history
```

The fourth line is frequently ignored, and it is where the widest incidents occur: an infrastructure change
applied simultaneously to every zone removes the protection redundancy was supposed to give.

### Not everything fits

Some resources do not declare well:

```text
data                       migrations are another problem
secrets                    a dedicated manager, referenced
short-lived resources      created and destroyed by the application
application configuration  variables and flags, not infrastructure
```

Mixing data or secrets into the declaration is the origin of leaks and of accidental destructive operations
— a resource removal that deletes a database along with it.

Deletion protection on stateful resources is not a detail, it is mandatory.

## Mental Model

**The declaration is the truth; the environment is the consequence.** Drift is the distance between the
two, and it needs to be measured.

## When to Use

- Practically always, for cloud infrastructure.
- Where environments need to be equivalent.
- Where recreation needs to be possible.
- Where there is auditing of infrastructure changes.
- For ephemeral environments. See
  [environment management](/14-devops-and-platform/environment-management.md).

## When Not to Use

**Mixing data or secrets into the declaration.**

**With no drift detection.**

**With generic modules** that hide what is created.

**Without versioning shared modules.**

**Applying to every zone at once.**

**With no deletion protection** on stateful resources.

**For a single server** nobody is going to recreate — the cost does not pay off.

## Alternatives

- **Server configuration tools** — for what runs inside the machine, instead of the cloud resources.
- **Pre-built images** — the environment comes ready in the image, and the infrastructure only instantiates
  it. See [containers in delivery](/14-devops-and-platform/containers-in-delivery.md).
- **Platform interfaces** — the developer declares the intent and the platform translates. See
  [internal developer platforms](/14-devops-and-platform/internal-developer-platforms.md).

The last is the natural evolution in large organizations: not every team needs to write infrastructure.

## Trade-offs

| Declared | Manual |
|---|---|
| Reproducible | Not |
| History and review | None |
| Slower change | Immediate |
| A learning curve | A familiar console |
| Drift detectable | Invisible |

| Modules | Direct declaration |
|---|---|
| No repetition | Explicit |
| An abstraction to understand | Direct |
| A change propagates | Isolated |

## Failure Modes

**Accumulated drift.** The declaration no longer describes reality.

**State lost or corrupted.**

**Simultaneous applies.** Two runs corrupt the state.

**Accidental deletion.** A resource with data removed by the convergence.

**A secret in the state.**

**A module changed with no version.** Every environment changes together.

**An apply to every zone.** The redundancy does not protect.

## Common Mistakes

**Not detecting drift.**

**State locally or in the repository.**

**Not locking concurrent runs.**

**Not protecting stateful resources against deletion.**

**Modules that are too generic.**

**Making the declaration slower than the console**, which guarantees the drift.

## Real-World Example

A logistics company migrated its infrastructure to declaration over a year. At the end, 90% of the
resources were declared.

An incident revealed what the other 10% meant.

An apply of the declaration, in production, removed a network rule that was not declared — created manually
during an incident, eight months earlier, and never incorporated.

The rule allowed a partner's access. The integration stopped for 5 hours, and the diagnosis was slow
because nobody knew the rule existed.

The investigation found 34 manually created resources, none documented.

The changes:

**Daily drift detection**, with a report of what exists and is not declared, and of what is declared and
diverges. The first run produced the list of 34.

**Restricted console access** in production, with temporary elevation and a justification. See
[least privilege](/10-security/least-privilege.md).

**A fast path.** People's complaint was legitimate: applying a declared change took 25 minutes between
review, plan and apply. The pipeline was optimized to 4 minutes, and the drift practically stopped — not by
prohibition, by convenience.

**Deletion protection** on databases, storage and stateful resources. An attempt to remove them through the
convergence fails and requires explicitly removing the protection.

**Applying per zone**, with observation between them. A network change applied to one zone does not take
all three down.

**Versioned modules**, ending the practice of changing the shared module and seeing the change propagate to
every environment on the next apply.

What the team records: prohibiting console use had been tried before and had failed. What worked was making
the declared path faster — the drift was a symptom of friction, not of indiscipline.

## Related Concepts

- [Environment Management](/14-devops-and-platform/environment-management.md).
- [Containers in Delivery](/14-devops-and-platform/containers-in-delivery.md).
- [Blue-Green](/14-devops-and-platform/blue-green.md) — the ephemeral environment.
- [IaaS](/09-cloud-architecture/iaas.md).

## Practical Exercise

Compare what exists in your cloud account with what is declared.

The resources that appear only in the first list are your drift — and each one is a surprise waiting for
the next apply.

## Interview Questions

- Why does declarative allow calculating the difference before acting?
- Why is drift a symptom of friction and not of indiscipline?
- Why does applying to every zone at once nullify the redundancy?

## Further Reading

- Morris, Kief. *Infrastructure as Code*. 2nd ed. O'Reilly, 2020.
- Humble, Jez; Farley, David. *Continuous Delivery*. Addison-Wesley, 2010.
- Burgess, Mark. *Promise Theory* — the basis of the declarative model.

---
id: containers
title: Containers
sidebar_position: 4
description: Packaging the application and its dependencies together — what that actually solves, and what remains your problem.
doc_type: concept
level: 5
difficulty: intermediate
status: complete
objective: >
  By the end, the reader understands what a container isolates and what it does
  not, and builds images that do not become a security liability.
prerequisites: [cloud-architecture]
related: [kubernetes, serverless, cloud-compute]
canonical_for: []
translated_from_version: 1
last_reviewed: 2026-08-31
---

# Containers

## Overview

A container packages the application with its dependencies — libraries, binaries, configuration — into an
immutable artifact that runs the same anywhere that has the runtime.

It is not a lightweight virtual machine. It is a process of the host operating system, isolated by features
of the kernel itself. The kernel is **shared**, and that is the difference that explains both the
lightness and the isolation limits.

## Problem

"It works on my machine" is the symptom of a real problem: the application depends on the environment, and
the environment varies between the developer's machine, the test server and production.

A system library version, an environment variable, a file path, a runtime version — any difference changes
the behavior.

A container solves it by bringing the environment along. The artifact that passed the tests is literally
the same one that runs in production.

## Core Concepts

### An isolated process, not a machine

```text
virtual machine   its own kernel, a complete system, strong isolation
                  starts in tens of seconds, occupies gigabytes
container         a shared kernel, only the application and dependencies
                  starts in milliseconds, occupies megabytes
```

The lightness comes from not replicating the operating system. The cost comes from the same place: an
isolation flaw in the kernel crosses containers.

That means **a container is not a strong security boundary**. To separate workloads that do not trust each
other, the boundary needs to be something else — a virtual machine, or runtimes that add isolation.

### The image is a stack of layers

Each build instruction creates a layer, and the layers are shared between images.

Two practical consequences:

**Order matters for the cache.** Instructions that rarely change — installing dependencies — should come
before those that always change — copying the code. Inverted, the rebuild redoes everything on every
change.

**Nothing really disappears.** A file deleted in a later layer is still in the earlier one. A secret copied
and then removed is still in the image, recoverable by whoever has the image.

The second point is the origin of real leaks: a private key, a token, a configuration file with a password.

### Immutable is the point

A built image does not change. Updating means building a new one and replacing it, not altering the one
that is running.

That is what gives predictability and what makes a rollback trivial: going back is redeploying the previous
image.

And it implies a rule: **no manual change inside the container**. A fix applied with direct access vanishes
on the next restart, and creates a divergence nobody tracks.

### State needs to go elsewhere

Containers are ephemeral — they can be recreated at any moment, on any node. Their file system dies with
them.

State that needs to survive goes to an external volume, a database or object storage. See
[stateless](/05-system-design/stateless-vs-stateful.md).

Application logs written to a file inside the container are logs that get lost. They need to go to standard
output and be collected from outside.

### A small image is not an aesthetic matter

An image based on a complete system carries hundreds of packages the application does not use — and each
one is attack surface and noise for the vulnerability scanner.

A multi-stage build solves it: one stage compiles with all the tooling, and the final stage copies only the
binary onto a minimal base.

Images of 30 MB instead of 900 MB mean faster deployment, less storage and a vulnerability list somebody
can actually deal with.

### What remains your problem

The container packages; it does not solve:

**Dependency vulnerabilities.** The image freezes the versions, including the vulnerable ones. With no
periodic rebuild and scanning, the image rots.

**Per-environment configuration.** It comes in through a variable or a mount, and it remains yours.

**Secrets.** Never in the image — see above. See [security](/10-security/index.md).

**Resource limits.** With no CPU and memory limit, a container consumes the whole node and takes down its
neighbors.

**A non-privileged user.** The default is to run as root inside the container, which amplifies any
isolation flaw.

## Mental Model

**A container is a package with the environment included, not a machine.** It solves environment
consistency; security and operations remain work.

## When to Use

- Consistency between environments matters.
- Frequent deployment, with fast rollback.
- Several languages or versions coexisting.
- Uniform packaging for orchestration. See [Kubernetes](/09-cloud-architecture/kubernetes.md).
- Dependency isolation between services on the same node.
- Reproducible development environments.

## When Not to Use

**As a security boundary between untrusted workloads.**

**For an application with state on the file system** and no external volume.

**When the application requires deep kernel access** or specific hardware.

**For a single, stable application** on a machine nobody touches — the benefit does not pay for the change
in tooling.

**With images that are never rebuilt.** It becomes a security liability.

**As a synonym for modernization.** Packaging a badly designed system produces a badly designed system in a
container.

## Alternatives

- **A virtual machine** — strong isolation, heavier.
- **An operating system package** — for a single, stable application.
- **[Serverless](/09-cloud-architecture/serverless.md)** — with neither packaging nor capacity.
- **Runtimes with hardened isolation** — when you want a container with a security boundary closer to a
  virtual machine's.

## Trade-offs

| A container | A virtual machine |
|---|---|
| Starts in milliseconds | Tens of seconds |
| Megabytes | Gigabytes |
| A shared kernel | Its own |
| Weaker isolation | Strong |
| High density | Low |
| The same base system | Different systems |

## Failure Modes

**A secret inside the image.** Recoverable by whoever has it.

**An old image with vulnerabilities.** Never rebuilt.

**No resource limit.** One container takes down the node.

**State lost on restart.**

**Running as root.** It amplifies any flaw.

**A huge image.** Slow deployment, a large surface.

**A manual change inside the container.** It vanishes on restart.

**A moving tag in production.** Pointing at the latest makes the deployment non-reproducible — two
deployments of the same reference can run different code.

## Common Mistakes

**Copying a secret into the image.**

**Using a complete base image with no need.**

**Not defining resource limits.**

**Not rebuilding periodically.**

**Running as root.**

**Using a moving tag** instead of a fixed version or a digest.

## Real-World Example

A financial services company migrated 30 applications to containers. Consistency between environments
improved immediately — the "works in test, fails in production" defect class practically disappeared.

Four problems appeared in the first security audit, a year later:

**Secrets in images.** Seven images contained private keys or tokens copied during the build and removed in
a later layer. All of them remained recoverable. The credentials had to be rotated, and the image registry
was treated as compromised.

**Images with no rebuild.** The base image of 22 of the 30 applications had not been rebuilt in more than
eight months. The scan found hundreds of known vulnerabilities, several of high severity, all of them with
a fix available for months.

**Privileged execution.** 26 of the 30 ran as root inside the container, because it was the default.

**No limits.** None had a memory limit. A leak in one application consumed a node's memory and took down
five others running on it — an incident that had happened months earlier and been diagnosed as an
"infrastructure problem".

The fixes:

**A multi-stage build** with a minimal base. The average image fell from 740 MB to 90 MB, and the
vulnerability list became manageable.

**Secrets injected at runtime**, never at build time. An automated check that refuses images with secret
patterns.

**A weekly rebuild** of every image, automated.

**A non-privileged user** made mandatory, verified in the pipeline.

**CPU and memory limits** made mandatory.

**Reference by digest** in production, eliminating the moving tag.

What the team learned: the migration was treated as a packaging project — "put it in a container" — and
ended when the applications ran. The practices above were not in scope because nobody had listed them as
part of adopting containers.

## Related Concepts

- [Kubernetes](/09-cloud-architecture/kubernetes.md) — the orchestration.
- [Serverless](/09-cloud-architecture/serverless.md) — the model with no packaging.
- [Cloud Compute](/09-cloud-architecture/cloud-compute.md).
- [Security](/10-security/index.md).

## Practical Exercise

Take your service's production image and answer: when was it last built, and how many known vulnerabilities
does it have today?

Then check whether it runs as root and whether it has a memory limit. Those three answers are usually
uncomfortable.

## Interview Questions

- Why is a container not a strong security boundary?
- Why does a removed secret remain in the image?
- Why does a moving tag make the deployment non-reproducible?

## Further Reading

- Image build best practices documentation.
- Rice, Liz. *Container Security*. O'Reilly, 2020.
- Burns, Brendan et al. *Kubernetes: Up and Running*. 3rd ed. O'Reilly, 2022.

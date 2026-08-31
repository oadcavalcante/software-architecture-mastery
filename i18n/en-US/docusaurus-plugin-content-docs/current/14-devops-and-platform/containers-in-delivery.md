---
id: containers-in-delivery
title: Containers in Delivery
sidebar_position: 3
description: The immutable artifact that crosses the environments — built once, promoted, never rebuilt.
doc_type: concept
level: 5
difficulty: intermediate
status: complete
objective: >
  By the end, the reader promotes the same artifact between environments and
  guarantees that what was tested is what runs.
prerequisites: [ci-cd]
related: [ci-cd, environment-management, supply-chain-security]
canonical_for: []
translated_from_version: 1
last_reviewed: 2026-08-31
---

# Containers in Delivery

## Overview

Container fundamentals are in [containers](/09-cloud-architecture/containers.md). Here what matters is
their role in delivery: **the immutable artifact that crosses the environments**.

The rule that organizes everything: **build once, promote the same artifact**.

If the binary that goes to production is rebuilt from the code, it is not what was tested — it is another
binary, built at another moment, with dependencies that may have changed.

## Problem

The common pattern: the pipeline builds for testing, tests, approves; and then builds again for production.

Between the two builds, things change:

```text
a transitive dependency with an open range published a new version
the base image received an update
a build tool was updated
a pipeline environment variable changed
```

The artifact that goes to production is different from the tested one, in ways nobody can enumerate. And
when it breaks, the hypothesis "but it passed in testing" is technically wrong — what passed was something
else.

## Core Concepts

### Build once, promote

```text
1. build an image, with a unique identifier
2. test that image
3. promote the same image to the next environment
4. what goes to production has the same digest as what was tested
```

The promotion is a reference change, not a rebuild. See
[environment management](/14-devops-and-platform/environment-management.md).

That requires the image to contain nothing environment-specific — which leads to the next point.

### Configuration comes from outside

If the image carries production's configuration, it cannot be tested in another environment.

```text
in the image   code, dependencies, runtime
from outside   addresses, credentials, limits, flags, log level
```

See [PaaS](/09-cloud-architecture/paas.md) — the twelve rules, whose configuration item exists exactly for
that.

The characteristic mistake: separate images per environment. Besides breaking the promotion, it multiplies
the builds and creates divergence nobody tracks.

### Reference by digest, not by tag

```text
a tag      service:v2.3 — it can be repointed to another image
a digest   service@sha256:abc... — immutable, it is that content
```

A tag is a pointer. Two deployments of the same tag can run different code.

In production, the reference needs to be by digest — it is what makes the deployment reproducible and what
allows stating that what runs is what was approved.

See [containers](/09-cloud-architecture/containers.md).

### The artifact registry is critical infrastructure

Every deployment depends on it. That imposes:

```text
availability   it down means no deployment
retention      old images need to exist for rollback
immutability   a published tag should not be overwritten
cleanup        images accumulate and cost
access         who publishes, who consumes
```

The second line is operationally important: a cleanup policy removing images older than 30 days prevents
reverting to a version older than that.

And the third prevents a class of attack: overwriting an already-verified tag with other content. See
[pipeline security](/14-devops-and-platform/supply-chain-security.md).

### A reproducible build is the ideal, and pinning is the minimum

A reproducible build — the same input, the same artifact byte for byte — allows independently verifying
that the binary corresponds to the code.

It is hard to achieve completely. The practicable minimum:

```text
pinned dependency versions, with a versioned lock file
the base image by digest, not by tag
build tools with a declared version
no network access in the final build stage
```

The last is the most effective and the least common: a build that downloads things from the internet is not
reproducible by definition.

### Multiple stages reduce what goes to production

```text
build stage   compiler, tooling, development dependencies
final stage   only the binary and what it needs to run
```

The gain is in size, in attack surface and in deployment time. See
[containers](/09-cloud-architecture/containers.md).

And there is a frequently forgotten delivery gain: smaller images are downloaded faster, which reduces
deployment and scaling time — which matters in
[rolling deployments](/14-devops-and-platform/rolling-deployments.md).

### Layers and caching decide the build time

The order of the instructions decides whether the rebuild uses the cache:

```text
bad    copy the code, then install dependencies
       → every code change reinstalls everything
good   copy the manifest, install dependencies, then copy the code
       → a code change reuses the dependency layer
```

That inversion usually reduces the build time by an order of magnitude — and the pipeline's time is what
decides whether people integrate frequently. See
[continuous integration](/14-devops-and-platform/ci-cd.md).

### The download time enters the availability calculation

A frequently ignored dimension: the image's size affects the recovery time, not only the deployment time.

```text
a 900 MB image   ~90 s to download on a new node
a 60 MB image    ~8 s
```

That matters at three moments:

**Scaling under a peak.** The new instance takes longer to enter the rotation. See
[horizontal scaling](/11-scalability/horizontal-scaling.md).

**Node replacement.** An instance failure takes longer to be replaced.

**Rolling deployment.** The total time is multiplied by the number of waves. See
[rolling deployments](/14-devops-and-platform/rolling-deployments.md).

And there is an aggravating factor: new nodes frequently do not have the image in their local cache, so the
worst case — a complete download — happens exactly when there is pressure.

Reducing the image is therefore a reliability decision as much as a cost one.

## Mental Model

**Build once, promote the same artifact.** If what goes to production was rebuilt, it is not what was
tested.

## When to Use

- Whenever there is more than one environment.
- Where traceability between code and production matters.
- Where the rollback needs to be trustworthy.
- With frequent deployment.

## When Not to Use

**Rebuilding per environment.** The artifact that reaches production is not the one that was tested, and
promotion between environments stops meaning anything.

**With configuration baked into the image.** It forces a rebuild per environment and recreates the previous
problem.

**Referencing by a moving tag in production.** The running version comes to depend on when the pod
restarted.

**With retention that prevents reverting.** The previous image needs to exist for the rollback to be
possible; the cleanup policy has to respect that.

**Allowing published tags to be overwritten.** If the same tag can point at other content, no deployment
record is trustworthy after the fact.

**Without pinning dependency versions.** Two builds of the same commit produce different artifacts, and
reproducing a production defect becomes impossible.

## Alternatives

- **Versioned packages** — for languages and contexts where containers do not apply.
- **Machine images** — the same principle, at the virtual machine level.
- **A promoted application artifact** — the binary, with no container, with the environment provisioned
  separately.

The principle — build once, promote — holds for all of them; a container is the most common way of applying
it.

## Trade-offs

| Building once | Rebuilding per environment |
|---|---|
| The tested one is what runs | Different artifacts |
| External configuration mandatory | It can be baked in |
| A registry necessary | Not |
| Trustworthy rollback | Rebuilding the old version |

| A digest | A tag |
|---|---|
| Reproducible | It can change |
| Less readable | Readable |

## Failure Modes

**A different artifact in production.** Rebuilt.

**A repointed tag.** Two deployments, different code.

**The image unavailable for rollback.** Cleanup removed it.

**The registry unavailable.** No deployment possible.

**Baked-in configuration.** The image cannot be promoted.

**A slow build.** A bad layer order, and the pipeline discourages integration.

**A bloated image.** Slow deployment and scaling.

## Common Mistakes

**Rebuilding for production.** The artifact tested in staging stops being what runs in production. Any
transitive dependency difference gets in with no test at all.

**A moving tag in production.** Pointing at `latest` means restarting a pod can swap the running version.
Two instances of the same service come to run different code.

**Configuration in the image.** It forces a rebuild to change environments, which recreates the first
problem: the production image was never the tested image.

**Not pinning the base image by digest.** The base's tag changes under your feet, and two builds of the
same commit produce different images — which eliminates reproducibility.

**A retention policy that prevents rollback.** Deleting old images for cost eliminates the rollback target.
You discover it during the incident.

**A layer order that ignores the cache.** Copying the code before installing dependencies invalidates the
cache on every commit, and a build that would take thirty seconds comes to take minutes.

## Real-World Example

A technology company had a pipeline that built the image three times: once for tests, once for staging,
once for production.

An incident exposed the problem. A production deployment failed to start, with an error that appeared in no
previous environment.

The cause: a transitive dependency with an open version range had published a new version between the
staging build and the production one — around 40 minutes apart.

The new version had an incompatible change. The code was the same; the artifact was not.

The fixes:

**A single build**, with the digest promoted between environments. The pipeline came to build once and
promote the reference.

**Externalized configuration.** Three different images existed because each one baked in the environment's
configuration. That was moved to variables and to a secrets manager.

**Pinned versions** with a versioned lock file, and the base image by digest.

**No network in the final build.** Every dependency resolved in an earlier stage, with an internal cache.

**180-day retention** in the registry, replacing the previous 30 — which prevented reverting to older
versions.

**Tag immutability** enabled in the registry.

And an optimization that came along: the layer order was corrected, and the build time fell from 11 minutes
to 90 seconds. That reduced the pipeline's total time and had a direct effect on the integration frequency.
See [continuous integration](/14-devops-and-platform/ci-cd.md).

The detail the team highlights: the multiple builds existed because the images contained configuration —
the root cause was that, and it had been treated as a convenience for years.

## Related Concepts

- [Containers](/09-cloud-architecture/containers.md) — the fundamentals.
- [Continuous Integration](/14-devops-and-platform/ci-cd.md).
- [Environment Management](/14-devops-and-platform/environment-management.md) — the promotion.
- [Pipeline Security](/14-devops-and-platform/supply-chain-security.md).

## Practical Exercise

Check whether the artifact running in production has the same digest as the one tested in staging.

If it was rebuilt, you cannot state that what passed the tests is what is running.

## Interview Questions

- Why does rebuilding per environment invalidate the tests?
- Why reference by digest in production?
- Why does the layer order affect the integration frequency?

## Further Reading

- Humble, Jez; Farley, David. *Continuous Delivery*. Addison-Wesley, 2010.
- Rice, Liz. *Container Security*. O'Reilly, 2020.
- Reproducible Builds — reproducible-builds.org.

---
id: supply-chain-trust
title: Supply Chain Trust
sidebar_position: 17
description: You run far more third-party code than you write — and it is the fastest-growing vector.
doc_type: concept
level: 5
difficulty: advanced
status: complete
objective: >
  By the end, the reader controls what enters the artifact and what can deploy it,
  with traceability of what runs in production.
prerequisites: [security]
related: [secrets, least-privilege, containers]
canonical_for: []
translated_from_version: 1
last_reviewed: 2026-08-31
---

# Supply Chain Trust

## Overview

The code you write is a small fraction of what runs in production. The rest comes from dependencies, base
images, build tools and the pipeline that assembles everything.

Each of those is third-party code executing with your system's privileges.

It is the fastest-growing vector, and the least covered by traditional controls — because code review,
testing and vulnerability scanning look at what you wrote, not at what you imported.

## Problem

A typical application has hundreds or thousands of transitive dependencies. Nobody reviews them.

And the compromise points are several:

```text
a dependency          a malicious package, or a compromised legitimate one
a base image          layers you did not build
a build tool          it runs with access to the code and the secrets
the pipeline          it can deploy anything to production
the artifact registry what is published is what runs
```

The point that most surprises: **the pipeline has production's privileges**. Whoever can change what it
executes can deploy arbitrary code, without touching the application's repository.

## Core Concepts

### The dependency vectors

**A malicious package published with a similar name.** A typo installs the attacker's package.

**Name confusion.** An internal package with the same name as a public one — and the package manager
prefers the public one, with a higher version.

**A compromised maintainer.** A legitimate package, with millions of installations, publishes a malicious
version.

**A maintenance transfer.** The original maintainer hands the project to somebody who introduces malicious
code months later.

The last two are the hard ones: the package is legitimate, the origin is the expected one, and name
checking does not help.

### Pin versions and verify integrity

**Pin by exact version**, not by range. An open range means today's build can bring different code from
yesterday's.

**A versioned lock file**, with a cryptographic hash of each dependency. It is what guarantees that the
same version brings the same content.

**Reproducible builds**, where possible: the same input produces the same artifact, which allows
independent verification.

That does not prevent a malicious dependency — it prevents one from **entering without anybody changing a
reviewed file**.

### An inventory of what runs

A component inventory lists everything that composes the artifact, with versions.

The practical value appears on the day a serious vulnerability is disclosed in a widely used library. The
question is immediate: **do we use that, where, and in which version?**

With no inventory, the answer takes days of manual searching — and it is usually incomplete, because the
dependency is transitive and appears in no direct file.

With an inventory, it is a query.

### Signing and provenance

**Signing artifacts** allows verifying that what is going to run is what your pipeline built.

**Provenance** goes further: a verifiable record of who built it, from which source code, with which
inputs.

That closes the path of somebody publishing an artifact to the registry without going through the pipeline
— which is one of the most effective attacks, because it leaves no trace in the repository.

The verification needs to be **mandatory at deployment**. Signing without verifying is ceremony.

### The pipeline is a production environment

It is worth repeating, because it changes the posture: the pipeline has access to the code, to the secrets
and to the production environment.

Consequences:

**Least privilege.** See [least privilege](/10-security/least-privilege.md). A pipeline that can deploy to
production should not be able to change access policies.

**Ephemeral credentials.** Federation instead of a static key. See [secrets](/10-security/secrets.md).

**Isolation between runs.** A run from an arbitrary branch should not reach production secrets.

**Approval to change its own configuration.** If anybody can change the pipeline's file on a branch and see
it execute with privileges, repository access control is production access control.

The last is the most common mistake and the most exploited.

### Updating is the continuous control

Most dependency compromises do not use a sophisticated attack — they use a known vulnerability, with a fix
available for months.

That makes regular updating more effective than any exotic control. And it depends on two things:
automation that proposes the updates, and tests that give confidence to accept them.

Teams with no automated tests do not update, and accumulate risk out of fear of breaking things.

## Mental Model

**You run the code of thousands of people you do not know.** The work is knowing what came in, verifying
that it did not change, and limiting what it reaches.

## When to Use

Controls always apply. Priority when:

- The application has many dependencies.
- The pipeline has access to production.
- Artifacts are published to a shared registry.
- There is a regulatory traceability requirement.
- The product is distributed to third parties.

## When Not to Use

**Open version ranges.** Accepting any future version of a dependency means a compromise of the package
enters your pipeline on the next build, with no review at all.

**An unversioned lock file.**

**Signing with no mandatory verification.**

**A pipeline with administrator permission.**

**A pipeline configuration changeable with no approval.**

**Blocking everything the scan points at.** With no exploitation context, the alert volume paralyzes — and
the team comes to ignore all of them.

## Alternatives

- **An internal mirrored registry** — approved dependencies, without fetching from the public one directly.
  It resolves name confusion and gives control over what comes in.
- **Minimal base images** — fewer components, less surface. See
  [containers](/09-cloud-architecture/containers.md).
- **Pinning by cryptographic hash** instead of by tag.
- **Reducing dependencies** — the most effective and the least considered. A library added for a
  three-line function brings its whole tree.

## Trade-offs

| Rigorous control | Fluidity |
|---|---|
| A known surface | Unknown |
| Friction to add a dependency | None |
| Slower updating | Immediate |
| Infrastructure to maintain | None |

| A mirrored registry | The public one directly |
|---|---|
| Control over what comes in | None |
| Resists name confusion | Vulnerable |
| Additional operations | None |

## Failure Modes

**A malicious dependency installed.**

**Name confusion.** An internal package replaced by a public one.

**A compromised maintainer.** A malicious version of a legitimate package.

**A compromised pipeline.** Deployment of arbitrary code.

**An artifact published without going through the pipeline.**

**A known vulnerability not fixed.** The most common case.

**Alerts ignored.** High volume with no prioritization.

## Common Mistakes

**Open version ranges.**

**Not maintaining an inventory.** When a critical vulnerability is announced, the question is "do we use
that, and where?". With no component inventory, the answer takes days you do not have.

**A pipeline with excessive privilege.** The build pipeline executes third-party code by definition —
dependencies, actions, images. A broad credential there is a credential handed to all of them.

**Allowing the pipeline to be changed with no approval.** If the pipeline's configuration file can be
changed in the same commit it executes, any contributor can exfiltrate secrets.

**Signing without verifying.** A signature that nothing checks at deployment time is ceremony. The value is
in the verification, not in the signature.

**Not updating for lack of tests.** The fear of breaking things freezes versions, and the update debt grows
until the migration becomes a project. Test coverage is what makes updating routine.

## Real-World Example

A technology company had its continuous integration pipeline compromised.

The path: an external contributor opened a contribution on a public repository of the company, changing the
pipeline's configuration file. The automatic check run executed the configuration from the submitted branch
itself — with access to production secrets, because the pipeline was a single one.

The added code extracted the credentials and sent them out. The incident was detected by an anomalous
credential usage alert, three hours later.

The subsequent audit found:

**The pipeline with administrator permission** on the production account. It could create identities and
change policies — far beyond deploying.

**Production secrets accessible** in runs from branches and from external contributions.

**No signature verification** at deployment. An artifact placed in the registry by any route would be
deployed.

**Open ranges** of versions in four of the eleven services.

**No inventory.** A vulnerability disclosed two months earlier in a common library had taken nine days to
map — and the mapping was incomplete.

The fixes:

**Separated pipelines.** External contributions run in an isolated pipeline, with no secrets and no access
to anything in production.

**A protected pipeline configuration.** Changes to the pipeline files require a maintainer's approval, and
running external contributions uses the main branch's configuration, not the submitted one.

**Ephemeral credentials through federation**, with minimal scope per service. The pipeline lost the
permission to change policies.

**Mandatory signing and verification** at deployment. An artifact with no valid provenance is refused.

**Pinned versions and a lock file** in every service.

**An inventory generated on each build**, queryable. The next vulnerability was mapped in minutes.

The compromise used no software vulnerability. It used a pipeline configuration characteristic that was
documented and known — and that nobody had assessed as a trust boundary.

## Related Concepts

- [Secrets](/10-security/secrets.md) — what the pipeline accesses.
- [Least Privilege](/10-security/least-privilege.md) — the pipeline's scope.
- [Containers](/09-cloud-architecture/containers.md) — base images.
- [Secure Boundaries](/10-security/secure-boundaries.md).

## Practical Exercise

Find out what your pipeline can do in production. Not what it does — what it **can**.

Then check whether an external contribution can change its configuration and execute it. If it can,
repository access is production access.

## Interview Questions

- Why should the pipeline be treated as a production environment?
- What do signing and provenance prevent that pinning versions does not?
- Why is updating regularly more effective than exotic controls?

## Further Reading

- SLSA — Supply-chain Levels for Software Artifacts.
- NIST SP 800-218 — Secure Software Development Framework.
- Torres-Arias, Santiago et al. *in-toto: Providing farm-to-table guarantees*, 2019.

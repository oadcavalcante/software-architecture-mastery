---
id: supply-chain-security
title: Pipeline Security
sidebar_position: 12
description: The pipeline is a production environment — and it is treated as though it were not.
doc_type: concept
level: 5
difficulty: advanced
status: complete
objective: >
  By the end, the reader protects the pipeline with the same rigor as production and
  verifies the provenance of what is deployed.
prerequisites: [ci-cd]
related: [ci-cd, containers-in-delivery, supply-chain-trust]
canonical_for: []
translated_from_version: 1
last_reviewed: 2026-08-31
---

# Pipeline Security

## Overview

The integration and delivery pipeline has access to the code, to the secrets and to the production
environment. It **is** a production environment.

And it is treated as a development tool: a configuration alterable by anybody with repository access, broad
credentials, runs with no isolation.

The supply chain trust fundamentals are in [supply chain trust](/10-security/supply-chain-trust.md). Here
what matters is the delivery angle: **protecting the path between the code and production**.

## Problem

Whoever controls what the pipeline executes controls what runs in production — without touching the
application's code.

The paths:

```text
altering the pipeline's configuration on a branch
adding a malicious action or step
compromising a build dependency
publishing an artifact directly to the registry, bypassing the pipeline
using a pipeline credential that leaked
```

None of those appears in an application code review. And several of them leave no trace in the main
repository.

## Core Concepts

### The pipeline's configuration is production code

If altering the pipeline's file on a branch makes that file execute with production credentials, then
**repository access control is production access control**.

What fixes it:

```text
external contribution runs use the main branch's configuration
changes to the pipeline file require a maintainer's approval
production secrets unavailable in branch runs
protected environments, with approval to deploy
```

The first line is the most important defense against the most exploited vector.

### Isolate the runs

Each run should run isolated, inheriting no state from the previous one:

```text
an ephemeral environment  created and destroyed per run
no shared state           the dependency cache verified, not trusted
no lateral access         one run does not reach another
a restricted network      egress only to the necessary destinations
```

The last deserves a note: a run with unrestricted egress can exfiltrate secrets with nothing blocking it.
See [network security](/10-security/network-security.md).

And the dependency cache, if shared between runs, is a contamination path: a malicious run poisons the
cache the next one uses.

### Ephemeral credentials and minimal scope

```text
bad    a static, long-lived key, with broad permission
good   a temporary credential, obtained by federation, with scope per service
```

Identity federation allows the pipeline to authenticate with no stored key. See
[secrets](/10-security/secrets.md) and [cloud identity](/09-cloud-architecture/cloud-identity.md).

And the scope needs to be minimal: a pipeline that deploys one service should not be able to change access
policies, create identities, or touch other services.

See [least privilege](/10-security/least-privilege.md) — permission to change permissions is privilege
escalation.

### Verify at deployment, not only sign

Signing artifacts without verifying the signature is ceremony.

The control that closes the path:

```text
the artifact is signed by the pipeline
the provenance records: from which code, by which pipeline, with which inputs
the deployment refuses what has no valid signature and provenance
```

That prevents the vector of publishing directly to the registry: an artifact that did not go through the
pipeline has no provenance, and the deployment refuses it.

See [containers in delivery](/14-devops-and-platform/containers-in-delivery.md).

### Build dependencies are also code

Actions, plugins and build images execute with the pipeline's privilege.

```text
pin by exact version or by digest, never by a moving tag
review third-party actions before adopting them
mirror the critical ones internally
```

A third-party action referenced by tag can be repointed by the maintainer — or by whoever compromises their
account — and comes to execute new code in every pipeline using it.

### Separate building from deploying

Two responsibilities with different privileges:

```text
building    access to the code, no access to production
deploying   access to production, no access to the source code
```

The separation limits the damage: compromising the build does not give production; compromising the
deployment does not give the code.

And it allows requiring human approval only on the second, which is where the risk is.

### The pipeline needs to be observable

```text
a run log             what ran, with which configuration, triggered by whom
change auditing       who changed the pipeline, when
an anomaly alert      a run outside the pattern, unusual credential use
an artifact inventory what was published, by which run
```

A pipeline compromise with no logging is indistinguishable from normal operation — and that is what makes
the investigation impossible.

### The artifact registry is a trust boundary

A component that usually stays out of the analysis: the registry where the images and packages live.

It is the last stop before production, and compromising it is equivalent to compromising the pipeline —
with the advantage, for the attacker, of leaving no trace in the code repository.

```text
who publishes     only the pipeline, with its own credential
who consumes      only the destination environments
immutability      a published tag is not overwritten
retention         old versions available for rollback
scanning          vulnerabilities detected in what is already published
an access log     who downloaded what, when
```

The first line is the most important and the most frequently violated: publishing credentials distributed
to people, or shared between pipelines, turn the registry into an open path.

And the fifth deserves a note: an image published six months ago may have acquired known vulnerabilities
since then. Scanning only at build time stops seeing that — what matters is continuous scanning of what is
published and in use.

## Mental Model

**The pipeline has production's privileges.** Treat it with the same rigor, or it is the easiest path
there.

## When to Use

Always. High priority when:

- The repository accepts external contributions.
- The pipeline deploys to production.
- There are secrets accessible to the pipeline.
- Third-party actions and images are used.

## When Not to Use

**With a pipeline configuration alterable with no approval.** Whoever alters the file alters what executes
with its credentials.

**With production secrets in branch runs.** A branch is unreviewed code; giving it access to production
nullifies the review.

**With static, long-lived credentials.** They leak in build logs and do not expire on their own. A
temporary credential per run eliminates the whole class.

**Signing without verifying.** The signature only counts where somebody refuses what does not check out;
with no verification, it is a decorative record.

**With build dependencies by moving tag.** The content changes with nothing in your repository changing,
and the build stops being reproducible.

**With no run log.** With no history of what was built, by whom and from which commit, there is no way to
investigate a suspicious artifact.

## Alternatives

- **Manual approval to deploy** — it reduces the risk without resolving the build's.
- **A separate deployment environment** — the pipeline produces the artifact, another process deploys.
- **A managed pipeline** — the vendor handles the isolation, at the cost of less control.
- **Policy verification at admission** — the destination environment refuses what does not comply,
  regardless of the pipeline. See [Kubernetes](/09-cloud-architecture/kubernetes.md).

The last is valuable for being independent: even if the pipeline is compromised, the environment refuses.

## Trade-offs

| A restricted pipeline | Permissive |
|---|---|
| Contained damage | Broad access |
| Friction for new cases | Fluidity |
| Approvals necessary | Automatic |
| Complete auditing | Less overhead |

| Building and deploying separated | Together |
|---|---|
| Smaller privileges in each | One place |
| More parts | Simple |

## Failure Modes

**The configuration altered by an external contribution.**

**A secret exfiltrated** by a branch run.

**A poisoned dependency cache.**

**A third-party action repointed.**

**An artifact published bypassing the pipeline.**

**A pipeline credential leaked in a run log.**

**Privilege escalation.** The pipeline can change its own permissions.

## Common Mistakes

**Treating the pipeline as a development tool.** It has production credentials and produces the artifact
that runs there. It is critical infrastructure, and it deserves the same control as production.

**Executing branch configuration with production secrets.** If the pipeline's file can be altered in the
same commit it executes, any contributor can exfiltrate the secrets.

**Broad static credentials.** A long-lived key with administrator permission in the pipeline is the
organization's highest-value target, and it leaks in build logs easily.

**Not verifying the signature at deployment.** Signing without verifying at deployment time is ceremony —
the control only exists where somebody refuses what does not check out.

**Not pinning build dependencies.** Actions, base images and tools referenced by a moving tag enter your
pipeline in versions nobody reviewed.

**Not separating building from deploying.** When the same process compiles and deploys, compromising the
build is compromising production directly. Separating them creates a point where verification before
applying is possible.

## Real-World Example

A technology company suffered the compromise described in
[supply chain trust](/10-security/supply-chain-trust.md): an external contribution altered the pipeline's
configuration and extracted production credentials.

The pipeline-specific fixes:

**Main branch configuration** for external contribution runs. The file submitted by the contributor stopped
being what runs.

**Separated pipelines.** External contributions run in a pipeline with no secrets, with no access to
anything in production, with a restricted network.

**Ephemeral credentials through federation**, with scope per service. The pipeline lost the permission to
change access policies — which was what would have allowed escalating the compromise.

**Building separated from deploying.** The build produces the signed artifact; a distinct process, with its
own credentials and approval for production, deploys.

**Verification at admission.** The destination environment refuses artifacts with no valid signature and
provenance — protection independent of the pipeline.

**Dependencies pinned by digest**, with the critical ones mirrored internally.

**Restricted egress network** on the runs, with a log of what was blocked. In the first months, that
revealed three third-party actions sending telemetry to undocumented destinations.

**Change auditing** on the pipeline file, with mandatory approval.

And a check that came to run continuously: comparing what is published in the registry with what the
pipeline produced. An artifact with no match fires an alert.

The pipeline had been configured years earlier, out of convenience, and never reviewed from a security
angle. It was the organization's most privileged component and the least governed.

## Related Concepts

- [Supply Chain Trust](/10-security/supply-chain-trust.md) — the fundamentals.
- [Containers in Delivery](/14-devops-and-platform/containers-in-delivery.md) — the artifact's provenance.
- [Secrets](/10-security/secrets.md).
- [Least Privilege](/10-security/least-privilege.md).

## Practical Exercise

Check whether an external contribution to your repository can alter the pipeline's configuration and
execute it with access to secrets.

Then list what your pipeline's credential can do in production — not what it does, what it **can**.

## Interview Questions

- Why should the pipeline be treated as a production environment?
- Why is verification at admission protection independent of the pipeline?
- Why does separating building from deploying limit the damage?

## Further Reading

- SLSA — Supply-chain Levels for Software Artifacts.
- NIST SP 800-218 — Secure Software Development Framework.
- OpenSSF — pipeline security best practices.

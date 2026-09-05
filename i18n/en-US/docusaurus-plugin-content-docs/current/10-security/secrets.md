---
id: secrets
title: Secrets
sidebar_position: 5
description: The passwords, keys and tokens the system has to store — and the places where they always leak.
doc_type: concept
level: 5
difficulty: intermediate
status: complete
objective: >
  By the end, the reader eliminates static secrets where possible and manages the
  remaining ones with rotation and auditing.
prerequisites: [security]
related: [key-management, supply-chain-trust, least-privilege]
canonical_for: []
translated_from_version: 2
last_reviewed: 2026-08-31
---

# Secrets

## Overview

Secrets are the credentials the system needs to work: a database password, an API key, a service token, a
signing key, a private certificate.

They have an inconvenient property: they need to be accessible to the code at runtime, and that
accessibility is exactly what exposes them.

The modern strategy is not storing them better. It is **not having them** — replacing static credentials
with platform identity and ephemeral credentials. What remains gets proper management.

## Problem

The places where secrets leak are known and they repeat:

```text
a code repository       including the history, after "removal"
a container image       in earlier layers. See containers
application logs        headers, request bodies, error messages
environment variables   inherited by child processes, exposed in `docker inspect`
                        and in the orchestrator object, and in a memory dump
a configuration file    copied, versioned, shared
a chat message          "send me the database password"
a support ticket        pasted into a problem description
```

The common denominator: each is a place the information went to solve something, and stayed.

And there is a structural aggravating factor: static secrets **do not expire**. One leaked in 2021 is still
valid in 2026, unless somebody rotates it.

## Core Concepts

### The best management is absence

The highest-impact change: replacing static credentials with mechanisms that require no stored secret.

**Platform identity.** The application assumes a role and receives temporary credentials, rotated
automatically. Nothing to store. See [cloud identity](/09-cloud-architecture/cloud-identity.md).

**Identity federation** for external systems — continuous integration pipelines can authenticate with no
static key.

**Short-lived certificates** instead of a password.

**Dynamic database credentials** — generated on demand, valid for hours.

Each eliminated secret is one that does not need to be rotated, audited or searched for in leaks.

### A secrets manager for what remains

What it delivers beyond "storing it encrypted":

**Auditing.** Who read which secret, when.

**Access control per secret.**

**Rotation**, automatic or assisted.

**Versioning**, allowing a rollback.

**Injection at runtime**, with no trip through disk.

Auditing is the underestimated item: without it, an improper access leaves no trace, and an investigation
has no way to know what was compromised.

### Rotation is what limits the damage

A secret that never changes is a secret that, once leaked, is valid forever.

```text
scheduled   periodic replacement, regardless of suspicion
on demand   immediate replacement in response to an incident
```

On-demand rotation is what matters in an incident, and it only works if it has been exercised. The answer
to "how long does it take us to change the database password?" needs to be known beforehand.

The pattern that allows rotation with no interruption is keeping **two valid credentials** simultaneously
during the transition: create the new one, update the consumers, revoke the old one. Without that,
rotating requires downtime — and so it is not done.

### Detection needs to be automatic

Relying on discipline not to make the mistake does not work at scale.

**A pre-push check**, in the development environment.

**A repository scan**, including the complete history.

**Monitoring of public repositories** — providers offer services that detect your keys exposed.

**Automatic revocation** on detection. An exposed key should be considered compromised immediately, not
assessed.

### A secret in a repository: removing is not enough

The version system's history preserves everything. Deleting the file in a later commit keeps the secret
recoverable by anybody with access to the repository.

The only correct answer is to **rotate the secret**. Rewriting the history is desirable and secondary —
existing clones and forks still have the copy.

Teams that treat the problem as "remove the file" leave the credential valid.

### The development environment deserves its own secrets

Using production credentials in development is common and turns every developer machine into a target with
production access.

Separate credentials per environment, with restricted scope, contain the problem. And development data
should not be a copy of production — see [data protection](/10-security/data-protection.md).

## Mental Model

**A secret that does not exist does not leak, does not expire and does not need rotation.** For the ones
that do: exercised rotation, audited access, and automatic detection.

## When to Use

Explicit management pays off when what the credential protects is worth more than the cost of operating
the manager — which covers practically everything in production, and leaves out real cases: a single
service, with a low-value secret, in an environment where platform identity already covers the accesses
that matter. Priority when:

- There are long-lived static credentials.
- Several services share the same credential.
- There is third-party access.
- There has never been a rotation.
- There is no auditing of access to secrets.

## When Not to Use

**A static secret when platform identity is available.**

**A secret in an environment variable** when the manager allows direct injection. The reason is not process
listings: `ps` shows the command line, and the environment (`/proc/<pid>/environ`) is readable only by the
process owner and by root. The real vectors are others — every child process inherits the environment,
`docker inspect` and the orchestrator object display it, and a memory dump carries it along.

**Sharing a credential between services.** It prevents knowing who used it and forces rotating everything
together.

**A production credential in development.**

**Rotation with no support for two valid credentials.** It will not happen.

**Relying on discipline** with no automatic detection.

## Alternatives

- **Platform identity** — it eliminates the secret.
- **Dynamic credentials** — generated on demand, short-lived.
- **Certificates** with your own authority, instead of a password.
- **Envelope encryption** for secrets versioned alongside the code, when there is no manager. See
  [key management](/10-security/key-management.md).

## Trade-offs

| A manager | An environment variable |
|---|---|
| Access auditing | None |
| Rotation with no redeploy | Requires a redeploy |
| Access per secret | All or nothing |
| A runtime dependency | None |
| Additional complexity | Trivial |

| A static credential | An ephemeral one |
|---|---|
| Simple | Issuing infrastructure |
| Leaks permanently | A short window |
| Manual rotation | Automatic |
| Works anywhere | Requires a compatible platform |

## Failure Modes

**A secret in the repository.**

**A secret in an application log.**

**Never rotated.**

**Shared between services.** One compromise forces changing everything.

**A rotation that causes downtime.** That is why it is never done.

**The manager unavailable.** The application does not start.

**A secret in a container image.** See [containers](/09-cloud-architecture/containers.md).

## Common Mistakes

**Not eliminating secrets when an alternative exists.** An identity attached to the workload does away with
the static credential — and what does not exist does not show up in a scan, in a dump or in a repository.

**Removing it from the repository without rotating.** Git's history preserves the value, and so do
existing clones. A committed secret is a compromised secret, and the only remedy is changing it.

**Not auditing access.** With no record of who read which secret and when, there is no way to scope an
incident or to detect anomalous reads.

**Not exercising rotation.** A rotation that has never been done fails on the first attempt, which is
precisely during a suspected leak — the worst moment to discover something is not automated.

**Using a production credential in development.** It multiplies the places where it exists, with weaker
controls in all of them, and makes it impossible to know where an access came from.

**Not filtering secrets from the logs.** A token in a header and a password in a request body go to the log
in any debug dump, and stay there for the retention period.

## Real-World Example

A technology company discovered, through an automatic notification from the code hosting provider, a cloud
access key exposed in a public repository.

The repository was a sample project, published by an engineer two years earlier, with a real key used in
tests.

What the investigation found:

**The key was active.** Never rotated in two years.

**A broad permission.** Created with administrator access because "it was just for tests".

**Confirmed use.** The logs showed accesses from unknown addresses over the last four months.

The subsequent audit, across the whole environment:

**Secrets in internal repositories.** The complete-history scan found 47 credentials, 31 of which were
still valid — including production database passwords.

**Logs with secrets.** A service logged the complete body of failing requests, including partners' tokens.

**A shared credential.** Eleven services used the same database credential. Rotating it would require
coordinating eleven deployments, which was the reason it had never been done.

**No auditing.** There was no way to know who had read which secret.

The reformulation, over ten months:

**Elimination.** The consolidated inventory had 214 secrets in use. Applications in the cloud came to use
platform identity and the pipeline came to use federation, which eliminated 129 of them — 60%, and most of
what remained is a credential for an external system, which cannot be replaced by an identity.

**A secrets manager** for the rest, with access audited per secret.

**A credential per service.** The eleven came to have their own credentials, with distinct scope. Rotating
one stopped affecting the others.

**Rotation with two valid credentials**, exercised quarterly.

**Pre-push and history scanning**, with automatic revocation on detection.

**Secret filtering in the logs.**

In retrospect: the key exposed in the public repository was the trigger, and it remains the most **serious**
finding — it is the only one with administrator permission and the only one with confirmed third-party use,
over four months. What the audit revealed afterwards is larger in **scale**, and is a different category of
risk: 31 valid credentials in internal repositories, with no usage auditing at all, none of them with
recorded abuse. One is a consummated incident; the others are the surface that makes the next incident
likely. Confusing the two leads to prioritizing wrong, and it had generated no alert in two years.

## Related Concepts

- [Key Management](/10-security/key-management.md) — the special case of cryptographic keys.
- [Least Privilege](/10-security/least-privilege.md) — the scope of what leaks.
- [Supply Chain Trust](/10-security/supply-chain-trust.md).
- [Cloud Identity](/09-cloud-architecture/cloud-identity.md).

## Practical Exercise

Run a secret scan on the **complete history** of your repositories, not only on the current state.

For each finding, the question is not "is it still there?" — it is "is that credential still valid?".

## Interview Questions

- Why does removing a secret from the repository not resolve it?
- What does a manager deliver beyond storing it encrypted?
- Why does a credential shared between services prevent rotation?

## Further Reading

- OWASP. *Secrets Management Cheat Sheet*.
- NIST SP 800-57 — management of cryptographic material.
- The major providers' secrets manager documentation.

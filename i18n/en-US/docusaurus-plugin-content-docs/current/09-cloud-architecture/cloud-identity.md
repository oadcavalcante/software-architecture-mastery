---
id: cloud-identity
title: Cloud Identity
sidebar_position: 11
description: Who can do what on your infrastructure — the layer where the most serious incidents happen.
doc_type: concept
level: 5
difficulty: advanced
status: complete
objective: >
  By the end, the reader grants permissions by the least privilege necessary and
  eliminates long-lived credentials.
prerequisites: [cloud-architecture]
related: [cloud-networking, vendor-lock-in, managed-services, identity, least-privilege, auditability]
canonical_for: []
translated_from_version: 2
last_reviewed: 2026-08-31
---

# Cloud Identity

## Overview

Identity and permissions define who — a person or a service — can do what on your infrastructure.

In the cloud, that layer has total reach: an excessive permission does not expose a resource, it exposes
the ability to create, read, change and delete everything.

It is the layer where the most serious incidents happen, and the one that receives the least design —
typically configured by trial and error, broadening permissions until the errors stop.

## Problem

The path of least resistance is granting a broad permission: the application cannot access the storage,
somebody grants full access to the storage service, the error disappears, and nobody goes back to restrict
it.

That accumulates. After two years, the environment has dozens of identities with permissions far beyond
what is necessary, and nobody knows which are actually used.

The cost appears all at once: a leaked credential, a compromised service, a defective script — and the
reach of the damage is the reach of the permission.

## Core Concepts

### Least privilege is the principle, and it is operationalizable

Granting only what is necessary for the function, and nothing beyond. See
[least privilege](/10-security/least-privilege.md) for the full treatment; here what matters is how to
apply it in the cloud.

It sounds abstract until it becomes a procedure:

**Start by denying everything.** Add permissions as the real need appears, not as it is assumed.

**Use the access logs.** Most providers record which permissions were actually exercised. That allows
reducing based on data, not on a guess.

**Restrict by resource, not only by action.** Allowing reads on one specific storage bucket is very
different from allowing reads on all of them.

**Review periodically.** Permissions granted for a temporary task tend to remain.

### A service identity, not a user credential

The most common structural mistake: creating a user, generating an access key, and putting that key in the
application.

Long-lived keys leak — in repositories, in container images, in application logs, in exposed environment
variables. And they do not expire.

The modern alternative: the application assumes a **role** and receives temporary credentials, rotated
automatically. Nothing to store, nothing to leak permanently.

That holds for compute inside the cloud, and increasingly for external systems, through identity federation
— which eliminates static keys even in continuous integration pipelines.

**Eliminating long-lived credentials is this section's highest-impact change.**

### Federation instead of separate accounts

People should sign in with the corporate identity, not with users created inside the provider. The
mechanism and the deprovisioning gain are in [identity](/10-security/identity.md); what is specific to the
cloud is where the local account is born.

Every provider offers a local user with a password and an access key, and it is the shortest path on day
one. That user sits outside the corporate directory: deactivating the person there does not reach it, and
the key issued to it stays valid.

### Account boundaries are the real isolation

Permissions inside an account are configuration; separate accounts are a boundary.

Separating production from development into distinct accounts makes the default no access between them: a
mistake in development only reaches production through an explicitly granted path — a cross-account trust
role, interconnected networks, a pipeline with permission in both. Each of those paths is a policy and needs
the same rigor; the difference is that they are few, named and auditable.

It is also what allows backups to be isolated meaningfully. See
[disaster recovery](/09-cloud-architecture/disaster-recovery.md).

That is why separation by account is less subject to human error than policy inside a single account:
there, isolating requires getting every denial right; here, breaking the isolation requires getting one
explicit grant wrong.

### Privilege escalation is subtle

The list of permissions that amount to permission for everything is in
[least privilege](/10-security/least-privilege.md). Two of them take a form of their own in the cloud.

**Attaching a role to an instance.** Whoever can launch a machine with a role broader than their own, and
log into it, gets to act with that role.

**Assuming a role in another account.** A trust relationship written as "any identity in account X"
transfers to the target account whatever is loosest in account X.

### Auditing needs to be tamper-proof

The properties of a tamper-proof record are in [auditability](/10-security/auditability.md). The cloud
decision is where it lives: in a dedicated account that the others can only write to — so compromising the
audited account gives no access to its record.

## Mental Model

**In the cloud, permission is reach.** The damage from any compromise is exactly what that identity could
do.

## When to Use

Temporary credentials and least privilege apply as soon as an identity has access to the environment.
Federation pays off once there is a corporate directory and more than one person; a separate account per
environment, once somebody is there to operate the extra account. Special priority when:

- There is sensitive or regulated data.
- Several teams share the environment.
- There are external integrations with access.
- The environment grew organically with no review.

## When Not to Use

**Federation in a one-person, one-account environment.** With no corporate directory, standing up an
identity provider just to federate costs more than deactivating a local user by hand. The cutoff is when the
headcount makes manual deprovisioning something somebody can forget.

**Temporary credentials for an integration that does not support them.** A third-party service that only
accepts a static key does not become a role by your decision. The key stays, with minimal reach, in a
secrets manager and with rotation — forcing a credential-exchange intermediary adds a part that fails
without reducing the key's risk.

**Per-resource granularity beyond the provider's limit.** Policies have a maximum size. Listing thousands of
resources individually blows that limit and produces a policy nobody can read; at that point, restricting by
tag or by name prefix is the practicable least privilege.

**A separate account per environment with nobody to operate it.** One more account needs its own network,
security baseline, billing and access. A two-person team on a prototype with no real data pays that cost
before it has anything to isolate.

## Alternatives

To reduce risk without rewriting the policy:

- **Temporarily assumed roles** — instead of permanent permission.
- **Approval for elevated access** — permission granted for a limited time, with a justification.
- **Separate accounts per environment and per domain.**
- **Automated permission analysis** — the providers' tools that compare what was granted with what is used.
- **A secrets manager** — when a long-lived credential is unavoidable, at least with rotation and auditing.

## Trade-offs

| Least privilege | Broad permission |
|---|---|
| Contained damage | Total reach |
| Laborious configuration | Fast |
| Permission errors in development | None |
| A missing permission that breaks a rare path in production | None |
| Periodic review necessary | None |

| A temporary credential | A long-lived key |
|---|---|
| Nothing to leak permanently | It leaks and does not expire |
| Automatic rotation | Manual, or never |
| More initial configuration | Trivial |

| Separate accounts | A single account |
|---|---|
| Isolation by default | Isolation depends on every policy |
| Network, baseline and billing per account | One of each |
| Cross-account access to design | Implicit access |

## Failure Modes

**A key leaked in a repository.** One of the most exploited vectors.

**Accumulated permission.** Broadened and never reduced.

**A former employee's account active.**

**Privilege escalation.** One policy permission gives everything.

**The audit log deleted** by the compromise itself.

**An excessively permissive instance role.** Compromising the application compromises the account.

**Cross-account trust that is too broad.** A third party's account with more access than necessary.

## Common Mistakes

**Broadening permission until the error goes away.** It is how almost every excessive permission is born:
under incident pressure, nobody goes back to narrow it later. The denied-access log says exactly which
permission was missing.

**An access key in the application.** A static credential leaks in a repository, in a log and in a
container image. An identity attached to the workload delivers a temporary credential and eliminates the
key.

**Not federating identity.** Local users at the provider do not disappear when the person leaves the
company, because the deactivation happens in the corporate directory and does not reach there.

**Not separating environments into accounts.** With no account boundary, a permission mistake in
development reaches production. The separation is the strongest limit the provider offers and carries no license
cost; the cost is operational — network, baseline and access per account — and it is smaller than
discovering the problem in production.

**Not reviewing unused permissions.** Permissions only grow by accumulation. The providers report what has
not been exercised in months, and that list is the safest removal list there is.

**Leaving the audit log in the same account.** Whoever compromises the account deletes the record of what
they did. The log needs to be in a separate account, with write permission and not deletion.

## Real-World Example

A technology company suffered a compromise that started small and escalated.

**The entry point:** a long-lived access key, present in an internal repository, exposed when the
repository was made public by mistake during a migration.

**The escalation:** the key belonged to an identity created years earlier for a reporting script. It had
administrator permission — granted at creation because "it was faster", and never reviewed.

**The reach:** with that permission, the attacker created new identities, disabled alerts, accessed the
data stores and deleted audit logs.

**The investigation was compromised** because the logs were in the same account and were deleted. The
reconstruction depended on partial network logs.

What the later audit found in the environment:

**34 long-lived keys**, 19 of which had not been used in more than six months.

**11 identities with administrator permission**, 2 of which belonged to applications.

**6 former employees' accounts** active.

**Production and development in the same account.**

Rebuilding the access model took five months:

**32 of the 34 long-lived keys eliminated.** Applications came to use roles; the pipeline came to use federation.
Two keys remained, for external integrations that supported nothing else — both with automatic rotation and
minimal reach.

**Identity federation** for people. Deprovisioning became automatic.

**Separate accounts** per environment, with production isolated.

**Auditing in a dedicated account**, with deletion denied for everyone.

**A quarterly review** based on actual usage. The first reduced the granted permissions by around 80%
without breaking anything.

The recorded conclusion: the size of the damage was defined by a single identity — a reporting script that
needed to read, holding administrator permission granted for convenience. And the first review showed the
pattern survives even a carefully rebuilt model: four fifths of what it granted was still not exercised.

## Related Concepts

- [Cloud Networking](/09-cloud-architecture/cloud-networking.md) — the other boundary layer.
- [Disaster Recovery](/09-cloud-architecture/disaster-recovery.md) — isolated backups.
- [Security](/10-security/index.md) — the full treatment.
- [Managed Services](/09-cloud-architecture/managed-services.md).

## Practical Exercise

List your environment's long-lived access keys and, for each one, find out when it was last used.

Then take your main application's identity and compare what it can do with what it actually did in the last
90 days.

## Interview Questions

- Why are long-lived credentials the central problem?
- Why is separation by account more robust than policy?
- Which permissions constitute privilege escalation?

## Further Reading

- Rose, S. et al. *Zero Trust Architecture*. NIST SP 800-207, 2020.
- Grassi, P. et al. *Digital Identity Guidelines*. NIST SP 800-63-3, 2017.
- Jones, M. et al. *OAuth 2.0 Token Exchange*. RFC 8693, 2020 — the basis of the token exchange that lets
  pipelines federate without a static key.

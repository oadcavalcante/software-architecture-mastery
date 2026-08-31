---
id: identity
title: Identity
sidebar_position: 1
description: Who the requester is — and why identity, authentication and authorization are three distinct questions.
doc_type: concept
level: 5
difficulty: intermediate
status: complete
objective: >
  By the end, the reader separates the three questions and chooses where identity
  lives in the system.
prerequisites: [security]
related: [oauth2, oidc, authz-models]
canonical_for: []
translated_from_version: 1
last_reviewed: 2026-08-31
---

# Identity

## Overview

Identity answers **who the requester is**. It is the base on which authentication and authorization are
built, and it is routinely confused with both.

```text
identity        who you are           a stable identifier
authentication  prove it is you       a verified credential
authorization   you may do this       permission over a resource
```

Separating the three is what allows swapping the authentication mechanism without touching authorization,
and changing access rules without touching login.

## Problem

Systems that confuse the three couple decisions that should be independent.

The classic symptom: the business rule checks the **login method** to decide permission — "if they signed
in with a corporate password, they are an employee; therefore they can approve".

When a new authentication path appears — social login, an API key, a certificate — the rule breaks or is
worked around, and permission comes to depend on something that should not decide it.

## Core Concepts

### The identifier needs to be stable and opaque

A person's internal identity should not be their email, their national ID number or their username.

**Stable.** Emails change. Names change. If the identifier changes, all the associated history is lost or
needs to be migrated.

**Opaque.** An identifier that carries meaning — sequential, derived from a document — leaks information
and allows enumeration.

The robust pattern: an opaque and immutable internal identifier, with email and document as attributes that
can change. See [data modeling](/07-data-architecture/data-modeling.md).

### A person's identity and a service's are different

```text
person   authenticates interactively, has a session, may have a second factor
         comes and goes, changes roles, leaves the company
service  authenticates with no interaction, has no session
         exists while the service exists, fixed scope
```

Treating both with the same mechanism produces the two known problems: long-lived keys for people — which
neither expire nor require a second factor — and interactive flows for services, which require a stored
credential.

Each one has its appropriate mechanism, and mixing them is the origin of much of the credential leakage.

### Federation solves deprovisioning

Federating means delegating authentication to a central identity provider: the applications neither store
passwords nor manage accounts.

The most important gain is not the convenience of single sign-on. It is **deprovisioning**: when somebody
leaves the organization, access to everything ends with it, because there are no local accounts scattered
around.

Without federation, each application has its own user list, and deprovisioning depends on somebody
remembering each one. Active former employees' accounts appear in every audit at a company that has not
federated.

### The lifecycle is the part nobody designs

Creating an identity is the easy step. The complete cycle:

```text
creation        with what verification that the person is who they say
change          a role change, attribute changes, credential changes
suspension      temporary — leave, an investigation
deactivation    departure
deletion        removal of personal data, with the history preserved
recovery        lost the credential — and this is the most attacked step
```

Recovery deserves emphasis: it is, by definition, a path that **bypasses** normal authentication. If it is
weaker than the login, it is the system's real authentication.

Many compromises come in through there — email recovery with no second factor, security questions
answerable with public data, a human support desk that resets a credential with no strong verification.

### Where identity lives in the system

Three patterns, with different implications:

**Propagated in the token.** The identity travels with the request, verifiable by each service. See
[JWT](/10-security/jwt.md).

**Queried from a central service.** Each service asks who it is. Always current, at the cost of latency and
a critical dependency.

**Resolved at the edge.** The gateway authenticates and injects the identity. Simple, and it creates the
dangerous premise that nobody reaches the services without passing through it. See
[secure boundaries](/10-security/secure-boundaries.md).

The most common and solid choice is propagation with verification in each service — the service does not
trust who calls, it trusts the signature.

### Identifying is not authorizing

Knowing who the requester is does not say what they may do. That separation allows the same identity to
have different permissions in different contexts — a customer in one organization, an administrator in
another.

Systems that tie permission to the identity, instead of to the relationship between identity and resource,
cannot express that. See [authorization models](/10-security/authz-models.md).

## Mental Model

**Identity is the identifier; authentication is the proof; authorization is the permission.** Coupling the
three prevents changing any of them.

## When to Use

Explicit identity decisions pay off when:

- There is more than one authentication mechanism.
- People and services access the same system.
- There is an organization with employees to provision and deprovision.
- The system serves several customers.
- There is an audit requirement about who did what.

## When Not to Use

**An identifier that carries meaning.**

**Email as the primary identity key.**

**The same mechanism for a person and a service.**

**Recovery weaker than the login.**

**Permission derived from the authentication method.**

**Local accounts per application** in an organization with an identity provider available.

## Alternatives

- **A managed identity provider** — instead of building. Authentication is specialized work and
  differentiates almost no product. See [SaaS](/09-cloud-architecture/saas.md).
- **Corporate federation** — for employees.
- **Social login** — for consumers, with the caveat of depending on the provider.
- **Certificates** — for service identity, with no shared secret.

## Trade-offs

| A managed provider | Building |
|---|---|
| Security maintained by specialists | Your responsibility |
| Ready-made features — second factor, federation | To be implemented |
| Vendor dependency | Control |
| Cost per user | Engineering cost |

| Propagated identity | Queried centrally |
|---|---|
| No extra call | Latency on every check |
| Difficult revocation | Immediate |
| Independent services | A critical dependency |

## Failure Modes

**Recovery as the weak path.**

**A former employee's account active.**

**A reused identifier.** A new user inherits an old one's history.

**Merged identities.** Two accounts for the same person, with the data split.

**Enumeration.** The login response reveals whether the user exists.

**Permission tied to the login method.**

**The identity provider unavailable.** Nobody signs in — including whoever would respond to the incident.

## Common Mistakes

**Using email as the internal identifier.**

**Not federating.**

**Not designing the lifecycle beyond creation.**

**Weak recovery.**

**Building your own authentication** with no specific reason.

**Having no emergency access path** when the identity provider goes down.

## Real-World Example

A services company had six internal applications, each with its own user list and its own password.

Three problems, discovered at different moments:

**Active former employees.** An audit found 31 accounts belonging to people who no longer worked there —
scattered across the six applications. The offboarding process included a list of systems to deactivate,
and the list was out of date in three of them.

**Recovery exploited.** One of the applications allowed resetting a password by answering two questions —
mother's name and hometown. Both obtainable publicly. An account with access to financial data was
compromised that way.

**Identity by email.** A person changed their surname after marriage, and the corporate email changed with
it. In four of the six applications, they became a new user — losing history, pending approvals and
permissions. In one of them, the old email was later assigned to another person, who inherited the access.

The third case was the most alarming, because it involved no attack at all.

The reformulation:

**Federation** with the corporate identity provider. The six applications came to delegate authentication.
Deprovisioning became automatic — deactivating in the directory ends everything.

**An opaque internal identifier** in each application, with email as a mutable attribute. The migration
required reconciling the duplicated identities.

**Recovery** unified at the provider, with a mandatory second factor. The security questions were
eliminated.

**Emergency access**: two local accounts, with credentials in a physical safe, in case the provider becomes
unavailable — because the federation created a critical dependency that did not exist before.

What the team records: the last decision only came up because somebody asked "and if the provider goes
down?". The federation solved five problems and created a single point nobody had considered.

## Related Concepts

- [OAuth 2.0](/10-security/oauth2.md) and [OpenID Connect](/10-security/oidc.md) — the protocols.
- [JWT](/10-security/jwt.md) — the propagation format.
- [Authorization Models](/10-security/authz-models.md) — the next question.
- [Authentication](/05-system-design/authentication.md) — the system design level.

## Practical Exercise

Find out what your system's internal user identifier is. If it is an email or a document number, ask what
happens when it changes.

Then test the credential recovery flow and compare its strength with the login's. If it is weaker, it is
the real authentication.

## Interview Questions

- What is the difference between identity, authentication and authorization?
- Why does federation solve deprovisioning?
- Why is the recovery flow the most attacked path?

## Further Reading

- NIST SP 800-63 — digital identity guidelines.
- OWASP. *Authentication Cheat Sheet*.
- Wilson, Yvonne; Hingnikar, Abhishek. *Solving Identity Management in Modern Applications*. 2nd ed.
  Apress, 2022.

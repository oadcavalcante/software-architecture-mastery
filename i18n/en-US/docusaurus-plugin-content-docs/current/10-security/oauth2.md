---
id: oauth2
title: OAuth 2.0
sidebar_position: 2
description: Access delegation — and why it is not an authentication protocol, despite being used as one.
doc_type: concept
level: 5
difficulty: advanced
status: complete
objective: >
  By the end, the reader chooses the correct flow for each type of client and
  recognizes what OAuth 2.0 does not solve.
prerequisites: [identity]
related: [oidc, jwt, identity]
canonical_for: []
translated_from_version: 1
last_reviewed: 2026-08-31
---

# OAuth 2.0

## Overview

OAuth 2.0 is an **access delegation** protocol: it allows an application to obtain permission to act on a
user's behalf, without receiving their password.

The problem it solves is specific and important: before it, integrating two applications meant giving one's
password to the other.

And it **is not an authentication protocol**, despite being used as one in most implementations. That
confusion is the source of real vulnerabilities, and it is the reason [OpenID Connect](/10-security/oidc.md)
exists.

## Problem

An accounting application needs to read your invoices from a payments system.

Without OAuth, the options were bad: give the payments system's password to the accounting one — which
then can do everything, forever — or create a secondary credential, with manual management.

OAuth solves it with a limited-scope, revocable token, obtained without the password ever touching the
intermediary application.

## Core Concepts

### The four roles

```text
resource owner         the user, who authorizes
client                 the application that wants access
authorization server   who authenticates the owner and issues tokens
resource server        who holds the protected API
```

The separation between the last two is what many implementations collapse — and it is what allows one
authorization server to serve many APIs.

### The flow that matters today

Of the original flows, only one is recommended for clients acting on behalf of a user:

**Authorization code with PKCE.**

```text
1. the client redirects the user to the authorization server,
   sending the challenge derived from a secret generated on the spot
2. the user authenticates and consents
3. the server returns a short code to the client
4. the client exchanges the code for the token, proving it knows the original secret
```

Step 4 is the point: the token never passes through the browser, and an intercepted code is useless without
the secret.

**PKCE is no longer optional nor exclusive to mobile applications.** It is recommended for all clients,
including those that have a secret of their own.

The other original flows were discouraged or removed: the implicit one exposed the token in the URL; the
user password one defeats the protocol's purpose.

**Client credentials** remains, and it is the correct flow when there is no user — a service talking to a
service.

### Scope is coarse, authorization is fine

Scope says **what type of access** was delegated: `invoices:read`.

It does not say **which** invoices. That decision belongs to the resource server, which combines the user's
identity with its own rules.

Confusing the two produces the most common structural mistake: treating the presence of a scope as
sufficient authorization. A token with `invoices:read` does not authorize reading another user's invoices.
See [authorization models](/10-security/authz-models.md).

Scope is the ceiling of what the application can ask for; authorization is what it can actually do on that
resource.

### Why it is not authentication

An access token says "the bearer has permission for X". It does not say **who** the bearer is, nor that
they just authenticated.

Using the token's existence as proof of identity allows known attacks: a token obtained for one application
being presented to another, which accepts it as a "successful login".

What was missing was a token that asserts identity, with a declared audience. That is
[OpenID Connect](/10-security/oidc.md), built on top of OAuth exactly for that.

### A short access token, a long refresh token

```text
access   minutes to an hour — presented on every request
refresh  days to months — used only to obtain new access tokens
```

The access token's short duration limits the window of a leak, since revoking self-contained tokens is
difficult. See [JWT](/10-security/jwt.md).

The refresh token needs its own care: for public clients, **rotation** — each use issues a new one and
invalidates the previous — allows detecting reuse, which indicates theft.

### Public and confidential clients

**Confidential.** Able to keep a secret — a server application.

**Public.** Unable to — a mobile application, a single-page application. Any embedded secret can be
extracted.

Public clients require PKCE and refresh token rotation. Treating a public client as confidential —
embedding a secret in the app — is a recurring mistake.

### The redirect is the attack point

The parameter saying where to return the code is the most exploited surface.

The defense: **exact comparison** against a registered list. No prefix matching, no wildcards — both allow
redirecting to an attacker-controlled destination on domains that look legitimate.

## Mental Model

**OAuth delegates access, it does not prove identity.** If you need to know who the user is, you need
OpenID Connect.

## When to Use

- An application needs to access data on a user's behalf.
- Integration with a third party's API.
- You expose an API for partner applications.
- Service-to-service communication with scope — the client credentials flow.
- Mobile and single-page applications accessing your API.

## When Not to Use

**For authentication.** Use [OpenID Connect](/10-security/oidc.md).

**The implicit flow.** Discouraged.

**The user password flow.** It defeats the purpose.

**Without PKCE.**

**A redirect with a wildcard or a prefix.**

**Scope as final authorization.**

**When an API key solves it.** A server-to-server integration, with no user and no variable scope, does not
need OAuth — the complexity does not pay off.

## Alternatives

- **[OpenID Connect](/10-security/oidc.md)** — when the question is identity.
- **An API key** — a simple integration, with no delegation.
- **Mutual TLS** — service identity by certificate, with no token.
- **A short-lived access token issued internally** — when both ends are yours and no third party is
  involved.

## Trade-offs

| OAuth 2.0 | An API key |
|---|---|
| Limited scope | All or nothing |
| Revocable per grant | Per key |
| No password sharing | A shared secret |
| Complex to implement | Trivial |
| An interoperable standard | Proprietary |

| A short token | A long token |
|---|---|
| A small leak window | Large |
| Frequent renewal | Rare |
| Revocation less critical | Critical and difficult |

## Failure Modes

**An open redirect.** The code delivered to the attacker.

**A token in the browser history.** The implicit flow.

**Scope treated as authorization.**

**A stolen refresh token with no rotation.** Indefinite access.

**A secret embedded in a public client.**

**A token accepted by the wrong audience.** Issued for one application, accepted by another.

**Excessive consent.** The user approves scopes they do not understand.

## Common Mistakes

**Using OAuth as authentication.**

**Not using PKCE.**

**Loose redirect matching.**

**Not rotating the refresh token in a public client.**

**Not verifying the token's audience.**

**Implementing the authorization server** instead of using a ready-made one. It is the kind of component
where mistakes are subtle and expensive.

## Real-World Example

A financial management platform exposed an API for partner applications to access customers' data, with
OAuth 2.0.

Four problems found in a security assessment:

**Prefix-based redirect.** The validation accepted any URL starting with the registered domain. One partner
had registered `https://partner.com/` — and `https://partner.com.attacker.net/` passed the check. An
attacker would be able to receive authorization codes from legitimate users.

**Scope as authorization.** The resource server checked whether the token had `accounts:read` and returned
the account requested in the URL — without checking whether that account belonged to the token's user. Any
partner authorized by any customer could read any account, by swapping the identifier.

That one was classified as the most serious, and it had existed for two years.

**No audience verification.** An internal service accepted tokens without verifying which application they
had been issued for. A token obtained by a lower-privilege application was accepted by higher-privilege
services.

**A refresh token with no rotation**, valid for a year, in mobile applications.

The fixes:

**Exact comparison** of the redirect, against a registered list. Three partners had to update their
registration.

**Authorization at the resource server.** The account came to be derived from the relationship between the
token's user and the resource, never from the parameter. See
[secure boundaries](/10-security/secure-boundaries.md).

**Mandatory audience verification** in every service.

**Refresh token rotation**, with reuse detection — which, in the first month, fired three times and
revealed two cases of a token extracted from a device.

In retrospect: the most serious problem was not an OAuth problem. The protocol was implemented correctly at
that point — the mistake was presuming that having a token with the right scope meant being able to access
the requested resource.

## Related Concepts

- [OpenID Connect](/10-security/oidc.md) — the identity layer.
- [JWT](/10-security/jwt.md) — the token's usual format.
- [Identity](/10-security/identity.md).
- [Authorization Models](/10-security/authz-models.md) — what scope does not solve.

## Practical Exercise

If you expose an API with OAuth, check two things: how the redirect is validated, and whether the resource
server verifies the relationship between the token's user and the requested resource.

The second is where the serious flaws are, and it is not about OAuth.

## Interview Questions

- Why is OAuth 2.0 not an authentication protocol?
- What is the difference between scope and authorization?
- Why did PKCE stop being exclusive to public clients?

## Further Reading

- RFC 6749 — OAuth 2.0 Authorization Framework.
- RFC 9700 — Best Current Practice for OAuth 2.0 Security.
- Richer, Justin; Sanso, Antonio. *OAuth 2 in Action*. Manning, 2017.

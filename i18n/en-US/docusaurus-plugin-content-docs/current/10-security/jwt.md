---
id: jwt
title: JWT
sidebar_position: 4
description: A self-contained, verifiable token — and the revocation problem most implementations ignore.
doc_type: concept
level: 5
difficulty: advanced
status: complete
objective: >
  By the end, the reader uses JWT knowing what it solves, what it does not hide and
  how to handle revocation.
prerequisites: [oauth2]
related: [oauth2, oidc, secrets]
canonical_for: []
translated_from_version: 1
last_reviewed: 2026-08-31
---

# JWT

## Overview

JWT is a **self-contained and signed** token format: it carries claims about the bearer, and any party with
the appropriate key can verify them without consulting anybody.

That solves a real scale problem — verifying identity with no call to a central service on every request.

And it creates a structural problem: **an issued token cannot be undone**. Most implementations ignore that
until they need to revoke something.

## Problem

Traditional sessions keep state on the server: an opaque identifier, and the data looked up on each
request.

That is simple, allows immediate revocation, and requires a shared store consulted on every request — which
becomes a critical dependency and a point of contention with many services.

JWT inverts it: the state travels in the token, verifiable locally. The trade is revocation for
scalability.

## Core Concepts

### Signed is not encrypted

The most common mistake, and the most consequential.

A signed JWT has its content **encoded, not encrypted**. Anybody with the token reads everything inside,
with no key at all.

```text
signature    guarantees it was not altered and who issued it
encryption   hides the content — requires JWE, which is another thing
```

Practical consequence: **nothing sensitive inside the token**. No document number, no personal data, no
internal information the client should not know.

This appears in security assessments with uncomfortable frequency.

### Revocation is the structural problem

A valid token stays valid until it expires. There is no way to cancel it — that is the nature of the
self-contained model.

That matters when: the user leaves the company, the session is terminated, the permission changes, or the
token leaks.

The ways out, with their costs:

**A short expiration.** Minutes, with renewal. It limits the window with no lookup at all. It is the first
line, and it is insufficient on its own for cases requiring immediate revocation.

**A revocation list.** Consulted on each request. It works, and it reintroduces the lookup JWT was avoiding
— although against a much smaller structure than a session store.

**A credential version.** The token carries a number; the server compares it with the user's current value.
Invalidating all of somebody's tokens is incrementing the number. It costs a lightweight lookup and solves
the most common case.

**An opaque reference.** The token is not a JWT — it is an identifier that gets looked up. A traditional
session, with all the revocation benefits.

The honest choice: if immediate revocation is a requirement, a self-contained JWT is not the right
mechanism — or it needs one of the mitigations, which reintroduce state.

### The algorithm needs to be pinned

A historical vulnerability class comes from the field that declares the algorithm: an attacker changes it to
`none` or swaps an asymmetric signature for a symmetric one, using the public key as the secret.

The defense: **the verifier pins the expected algorithm** and ignores what the token declares. Modern
libraries require that, and the old ones did not.

### What to verify, always

```text
signature   with the correct key and the expected algorithm
exp         expiration
iss         the expected issuer
aud         the audience — your service
nbf         not used before its time
```

Verifying the signature and forgetting expiration is common, and it turns a one-hour token into a permanent
one.

### Size has a cost

The token travels on every request, typically in a header.

A JWT with many claims — a permission list, attributes, groups — can reach several kilobytes, and some
servers reject headers above a limit.

Besides that, permissions inside the token are frozen until expiration: changing a permission has no
immediate effect. For authorization that changes, it is better to look it up. See
[authorization models](/10-security/authz-models.md).

### A bearer token is like cash

Whoever has the token is the bearer. There is no binding to a device or a session.

That means the transport and the storage matter as much as the signature:

**Always over TLS.**

**In a web client**, an HTTP-only cookie is preferable to local storage, which is accessible to any
injected script.

**Never in the URL.** It ends up in server logs, in the history and in the referrer header.

There are mechanisms that bind the token to a client key, making it useless if stolen — little adopted, and
the right answer for high-value scenarios.

## Mental Model

**JWT trades revocation for not having to consult anybody.** If you need to revoke quickly, you are paying
a price without receiving the benefit.

## When to Use

- Many services need to verify identity with no central lookup.
- Service-to-service communication with propagated identity.
- The ID token in [OpenID Connect](/10-security/oidc.md).
- Short-lived tokens with renewal.
- Scale at which a session lookup would be a bottleneck.

## When Not to Use

**When immediate revocation is a requirement**, with no mitigation.

**To store sensitive data.**

**With a long expiration.**

**As a web application session** when a session cookie solves it — which is the case for most single-server
applications.

**Without verifying every claim.**

**With permissions inside**, if they change.

## Alternatives

- **A session with an opaque identifier** — immediate revocation, state on the server. Frequently the right
  choice, and frequently discarded out of fashion.
- **A reference token** — opaque to the client, looked up by the API.
- **A JWT with a credential version** — a practical middle ground.
- **JWE** — when the content needs to be confidential.

## Trade-offs

| A self-contained JWT | A stateful session |
|---|---|
| No lookup on each request | A lookup always |
| Difficult revocation | Immediate |
| Scales horizontally | A shared store |
| Content readable by the client | Opaque |
| Larger size | A small identifier |
| Frozen permissions | Always current |

## Failure Modes

**A token not revocable after a termination or a leak.**

**Sensitive data exposed.**

**The algorithm manipulated.**

**Expiration not verified.**

**The audience not verified.** See [OpenID Connect](/10-security/oidc.md).

**A token stolen from browser storage** by an injected script.

**A header that is too large.** Requests rejected by a limit.

**The signing key leaked.** It allows forging any token — the worst case, and the reason the key deserves
the treatment of [key management](/10-security/key-management.md).

## Common Mistakes

**Putting sensitive data inside.** The content is only base64-encoded — readable by anybody who has the
token, including the user themselves.

**A long expiration.** The token cannot be revoked without additional infrastructure, so expiration is the
only defense. Twenty-four hours of validity is twenty-four hours of access for whoever steals it.

**Not pinning the algorithm.** Accepting the algorithm declared in the header allows the classic attack of
swapping it for `none` or for a symmetric one with the public key as the secret. The verifier needs to
require the expected algorithm.

**Not verifying `aud`.** Without verifying the audience, a token issued for another service in the same
organization is accepted here — and the intended scope evaporates.

**Storing it in the browser's local storage.** It becomes accessible to any script on the page, which turns
a cross-site scripting flaw into session theft. An HTTP-only cookie does not have that problem.

**Using JWT where a session would work better.** In an application with a single backend, a server-side
session is revocable on the spot and simpler. The self-contained token pays the price of difficult
revocation to solve a distribution problem that does not exist there.

## Real-World Example

A human resources platform used JWTs valid for 24 hours to authenticate users across eight services.

Four problems, found at different moments:

**A termination with no revocation.** A dismissed employee kept access for almost a full day after the
account was deactivated. The token on their machine stayed valid, and they accessed payroll data after the
dismissal. The offboarding process presumed that deactivating the account ended the access.

**Sensitive data in the token.** The token carried the full name, the national ID number, the job title and
the salary — because it was convenient to have that available with no lookup. Anybody with access to the
browser, or to logs that captured headers, read all of it.

A gateway's logs were recording complete headers, including the tokens. There were three months of salary
data in readable text in a logging system with broad access.

**Frozen permissions.** Revoking somebody's access to a module had no effect until the token expired. That
was discovered during an internal investigation, when a person's access was removed and they kept
operating.

**Local storage.** A script injection vulnerability on a page allowed extracting tokens.

The fixes:

**A 15-minute expiration**, with an 8-hour refresh token and rotation.

**A credential version** in the token, compared with the user's value. Deactivating an account came to
increment the version, invalidating everything immediately. The cost was a lightweight cache lookup.

**A minimal token**: identifier, issuer, audience, expiration and version. Everything else came to be
looked up.

**An HTTP-only cookie** instead of local storage.

**Logs with redaction** of authorization headers — and the three months of existing logs were purged.

The recorded conclusion: the choice of JWT had been made for scale, and the system had 400 users. A
traditional session would have served comfortably, with none of the four problems.

## Related Concepts

- [OAuth 2.0](/10-security/oauth2.md) and [OpenID Connect](/10-security/oidc.md).
- [Secrets](/10-security/secrets.md) — the signing key.
- [Key Management](/10-security/key-management.md).
- [Authentication](/05-system-design/authentication.md).

## Practical Exercise

Decode a JWT from your system — no key needed at all — and see what is inside. Then ask: can this
information be read by the client and by whoever captures a log?

And answer: how do you revoke that token right now, if you need to?

## Interview Questions

- Why is signed not encrypted, and what is the consequence?
- What are the options for revoking, and what does each one cost?
- When is a traditional session the better choice?

## Further Reading

- RFC 7519 — JSON Web Token.
- RFC 8725 — JSON Web Token Best Current Practices.
- OWASP. *JSON Web Token Cheat Sheet*.

---
id: oidc
title: OpenID Connect
sidebar_position: 3
description: The identity layer on top of OAuth — what the identity token asserts and what needs to be verified.
doc_type: concept
level: 5
difficulty: advanced
status: complete
objective: >
  By the end, the reader implements delegated authentication verifying every claim
  that matters.
prerequisites: [oauth2]
related: [oauth2, jwt, identity]
canonical_for: []
translated_from_version: 1
last_reviewed: 2026-08-31
---

# OpenID Connect

## Overview

OpenID Connect is a thin layer on top of [OAuth 2.0](/10-security/oauth2.md) that adds what was missing:
**a token that asserts identity**.

Where OAuth delivers an access token — "the bearer may do X" — OpenID Connect also delivers an **ID token**:
"this user, with these attributes, authenticated at this moment, and this token is for you".

The three final parts are what prevent the attacks that made OAuth inadequate for login.

## Problem

Using OAuth for authentication is common and wrong, and the mistake has a concrete consequence.

The problematic pattern: the application obtains an access token, calls a profile API, receives a user
identifier and considers the person authenticated.

What breaks: nothing in that flow guarantees the token was issued **for that application**. A token
obtained by another application — including a malicious one, to which the user granted access — works just
the same.

OpenID Connect solves it with a token that declares the audience and is verifiable.

## Core Concepts

### The ID token and the access token are different

```text
ID token       for the client — asserts who authenticated
               verified by the client, never sent to the API
access token   for the API — asserts permission
               sent to the API, opaque to the client
```

Confusing them is the most common implementation mistake. Sending the ID token to the API, or trying to
read the access token in the client, indicates the distinction was not understood.

### The claims that need to be verified

An ID token is a signed [JWT](/10-security/jwt.md), and receiving it is not enough — it needs to be
validated:

```text
signature   checks out with the issuer's public key
iss         the issuer is the one you expect
aud         the audience is your application — the central check
exp         it has not expired
iat         issued recently
nonce       matches the value you sent in the request
```

**`aud` is the check that prevents the attack described above.** A token issued for another application has
a different audience and must be rejected.

**`nonce` prevents reuse**: the client generates a random value, sends it in the authentication request,
and the token comes back with it. A captured token does not work in a new session.

Skipping any of these turns the authentication into theater.

### `sub` is the identifier, and it is local to the issuer

The `sub` field is the user's stable identifier — within that issuer.

Two points that cause problems:

**Do not use email as the identifier.** It can change, and the `email_verified` field exists precisely
because it has not always been verified. Accepting an unverified email as identity allows somebody to
register with another person's email and take over their account.

**`sub` is only unique within the issuer.** With multiple providers, the internal identity needs to be the
combination of issuer and `sub`.

### Scopes and where the attributes come from

User attributes come through scopes — `openid`, `profile`, `email` — and can arrive from two places: inside
the ID token, or from a user info endpoint.

Putting many attributes in the token makes it large, and it travels in every authentication request.
Fetching from the endpoint keeps the token small and adds a call.

The usual practice: the identifier and the minimum in the token; the rest queried when necessary.

### Session termination is the hard part

Single sign-on works well. **Single sign-out** is where the implementations fail.

The user leaves one application — and remains authenticated in the others, because each has its own
session. Worse, one click on "sign in" silently reauthenticates, because the session at the provider is
still alive.

The logout specifications exist and adoption is uneven. The behavior needs to be decided explicitly: does
leaving one application end the provider's session, or only the local one?

For environments with sensitive data, ending everything is what is expected — and frequently it is not what
happens.

### Discovery and key rotation

The provider publishes its configuration and its public keys at well-known addresses.

The client should fetch the keys and **cache them with periodic refresh** — because providers rotate keys.
An implementation that pins the key breaks at rotation, typically overnight.

And it should look up by key identifier, not assume there is only one.

## Mental Model

**OpenID Connect is OAuth plus a token that says who you are and whom it was issued for.** Those two
assertions are what makes the authentication safe.

## When to Use

- Authentication delegated to an identity provider.
- Single sign-on across several applications.
- Social login for consumers.
- Corporate federation.
- You want to delegate authentication instead of managing credentials.

## When Not to Use

**For authorization.** The ID token is not an API access credential.

**Without verifying `aud`.** It nullifies the main protection.

**Without `nonce`.** It allows reuse.

**Accepting an unverified email as identity.**

**An ID token sent to the API.**

**A public key pinned in the code.** It breaks at rotation.

**When there is no user.** A service talking to a service uses client credentials.

## Alternatives

- **Plain [OAuth 2.0](/10-security/oauth2.md)** — when the need is delegated access, not identity.
- **SAML** — corporate federation in environments that already use it. More verbose, very established.
- **Mutual TLS** — service identity.
- **Your own session with a local credential** — when there is neither federation nor third parties, and
  simplicity is worth more.

## Trade-offs

| OpenID Connect | Your own authentication |
|---|---|
| Credentials at the provider | You store them |
| A second factor ready | To be implemented |
| Single sign-on | Separate sessions |
| Provider dependency | Autonomy |
| Checks to get right | A simpler flow |

| Attributes in the token | A user info endpoint |
|---|---|
| No extra call | One call |
| A large token | Small |
| The data can go stale | Always current |

## Failure Modes

**`aud` not verified.** Another application's token accepted.

**`nonce` absent.** Token reuse.

**An unverified email as the key.** Account takeover.

**A rotated key.** Validation breaks.

**Partial logout.** The session persists in the other applications.

**The provider unavailable.** Nobody signs in.

**`sub` colliding between providers.**

## Common Mistakes

**Not verifying every claim.**

**Using the ID token as an access token.**

**Identifying by email.**

**Not handling key rotation.**

**Not deciding the logout behavior.**

**Implementing the validation by hand** instead of using a mature library. It has details that fail
silently.

## Real-World Example

An education company migrated six applications to single sign-on with OpenID Connect, using a managed
provider.

The implementation was done by different teams, each on its own application. A security review six months
later found inconsistencies:

**Two applications did not verify `aud`.** A token issued for the student application was accepted by the
administrative application. Since the provider was the same and so were the users, a student with a
legitimate account could obtain a token and present it to the administrative application — which accepted
it and created a session. The subsequent authorization blocked most actions, but not all.

**Three did not use `nonce`.**

**One identified by email.** A student changed the email in their record to a teacher's — who had not yet
accessed the system — and, on the first login, was recognized as the teacher.

**None handled key rotation.** All of them pinned the public key in configuration. When the provider
rotated, all six stopped simultaneously at 2 a.m. on a Sunday. The incident lasted 4 hours.

**Partial logout.** Leaving one application did not end the others. In the institution's shared computer
labs, that meant the computer's next user found open sessions.

The fixes:

**A single validation library**, maintained centrally, with every check. The six teams came to use it
instead of each one implementing its own.

**An internal identifier** derived from issuer plus `sub`.

**A key cache** with periodic refresh and lookup by identifier.

**Global logout** configured, ending the provider's session.

The learning that stuck: six independent implementations of the same protocol produced six different sets
of omissions. The decision to let each team implement — made to avoid creating a dependency — cost more
than the dependency would have.

## Related Concepts

- [OAuth 2.0](/10-security/oauth2.md) — the base.
- [JWT](/10-security/jwt.md) — the ID token's format.
- [Identity](/10-security/identity.md).
- [Secure Boundaries](/10-security/secure-boundaries.md).

## Practical Exercise

Take your system's ID token validation and check whether it verifies signature, issuer, audience,
expiration and `nonce`.

The absence of any one is exploitable, and the absence of the audience check is the most serious.

## Interview Questions

- What is the difference between an ID token and an access token?
- Why is verifying `aud` the central protection?
- Why is identifying by email dangerous?

## Further Reading

- OpenID Connect Core 1.0 — the specification.
- OpenID Connect Session Management and RP-Initiated Logout.
- Wilson, Yvonne; Hingnikar, Abhishek. *Solving Identity Management in Modern Applications*. 2nd ed.
  Apress, 2022.

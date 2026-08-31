---
id: authentication
title: Authentication
sidebar_position: 17
description: Proving who is calling — and where that proof is verified on each request.
doc_type: concept
level: 3
difficulty: intermediate
status: complete
objective: >
  By the end, the reader chooses between sessions and tokens based on revocation and
  scale requirements, and knows where verification should happen.
prerequisites: [state-management]
related: [authorization, stateless-vs-stateful, identity]
canonical_for: []
translated_from_version: 1
last_reviewed: 2026-08-31
---

# Authentication

## Overview

Authentication answers **who is calling**. It is distinct from
[authorization](/05-system-design/authorization.md), which answers what that person can do.

This document deals with the system decision: where the proof of identity lives and where it
is verified. The protocols and the threat model are the subject of
[security](/10-security/index.md).

## Problem

HTTP has no memory. Every request arrives without knowing who sent it, and proving identity on
each one would be unviable — nobody types a password per request.

The way out is: authenticate once and issue a **short-lived credential** that proves the
earlier authentication.

The architectural decision is about that credential: does it reference state on the server, or
does it carry the information with it?

## Core Concepts

### Session versus token

| | Server-side session | Self-contained token |
|---|---|---|
| Where the state lives | Server | In the token itself |
| Verifying | A lookup in storage | Verifying a signature |
| Revoking | Immediate | Only at expiry |
| Scale | Depends on shared storage | Stateless |
| Size | A short identifier | Grows with the content |
| Reading the content | The server queries it | Anyone can decode it |

The last line is frequently misunderstood: a signed token **is not encrypted**. It is readable
by whoever has it — the signature guarantees it was not altered, not that it is secret. Putting
sensitive data there is a leak.

### Revocation is the token's problem

A self-contained token is valid until it expires. If a user is blocked, or logs out, or has the
credential stolen, the token keeps working.

Three mitigations, with different costs:

**Short expiry.** Five to fifteen minutes. The exposure window becomes small, and the cost is
frequent renewal.

**Revocation list.** Checking each token against a list of revoked ones — which reintroduces the
lookup the token existed to avoid. It is worth it if the list is small and queried from a cache.

**A separate refresh token.** A short access token plus a long refresh token, the second being
revocable on the server. It is the most common arrangement, and it concentrates the state in a
single point queried rarely.

### Where to verify

Three places, and the choice determines what happens when something fails:

**At the edge** — a gateway or proxy verifies before forwarding. It centralizes, and the
internal services come to trust a header. If someone reaches the service without going through
the edge, there is no verification.

**In each service** — each one verifies. Defense in depth, at the cost of repetition and of
everyone needing the verification key.

**Both** — the edge rejects the obvious traffic and each service confirms. It is the
recommendation for systems with real trust boundaries.

The choice between the first two is the same question as
[Zero Trust](/10-security/index.md): is the internal network trustworthy?

### Service authentication is not the same thing

A service calling a service has no user. The options — client credentials, mutual certificates,
workload identity provided by the platform — have different rotation and scoping requirements.

Reusing the user's token for internal calls is common and problematic: it carries the user's
permissions to places that need different ones, and its short expiry interrupts long operations.

## Mental Model

**A session asks the server who you are. A token asserts who you are, signed.** The difference
appears when you need to unsay it.

## When to Use

**A session** when:
- Immediate revocation is a requirement.
- There is a need to invalidate all of a user's sessions.
- The shared storage already exists and the extra latency is acceptable.

**A self-contained token** when:
- The services need to be stateless.
- Verification has to work without a network call.
- Multiple services consume the same identity.
- A short expiry is operationally acceptable.

## When Not to Use

**A token with a long expiry.** A 30-day credential with no revocation is a disproportionate
risk.

**A token carrying sensitive data.** It is readable.

**A session in local memory with multiple instances.** See
[state management](/05-system-design/state-management.md).

**Verification only at the edge, with the internal network reachable.** A directly reachable
service is left unprotected.

**Implementing the mechanism from scratch.** Authentication is a
[generic subdomain](/04-domain-driven-design/generic-domain.md): the error surface is large and
the benefit of building is nil.

## Alternatives

- **External identity provider** — delegates the mechanism. See
  [security](/10-security/index.md).
- **API key** — for server-to-server integration, with no user.
- **Mutual certificates** — between services, when the platform supports it.

## Trade-offs

| Session | Token |
|---|---|
| Immediate revocation | Only at expiry |
| A lookup per request | Local verification |
| State to operate and scale | Stateless |
| A small identifier | Grows with the content |
| Hard across domains | Trivial |

## Failure Modes

**A token with no revocation during an incident.** A leaked credential stays valid.

**A session with no expiry.** It accumulates indefinitely.

**A signing key with no rotation.** Compromised once, compromised forever.

**Clock skew.** A token rejected because of a time difference between services.

**An identity header trusted without verification.** If the edge injects a header and a service
trusts it blindly, whoever reaches the service directly forges an identity.

## Common Mistakes

**Putting sensitive data in the token.** A JWT's content is encoded, not encrypted: anyone with
the token reads everything in it, including what was put there "just to avoid a lookup".

**A long expiry with no revocation mechanism.** A token valid for 24 hours is 24 hours of access
for whoever stole it, and dismissing someone does not end that person's session.

**Trusting an injected header without verifying the origin.** If the service accepts `X-User-Id`
because "it comes from the gateway", any call that reaches the internal network can declare
itself any user.

**Reusing the user's token between internal services.** The token leaks to every service in the
chain, and each of them becomes a point where the user's credential can be captured or reused
beyond its scope.

**Not planning key rotation.** When rotation becomes urgent — a suspected leak — a system that
did not prepare for it has to choose between invalidating every session at once and living with
the compromised key.

## Real-World Example

A system with seven services used a self-contained 24-hour token, verified only at the gateway.
The internal services trusted an `X-User-Id` header injected by it.

Two problems appeared in the same quarter.

**Revocation.** An employee was let go and their access was removed from the identity provider.
Their token kept working for 19 hours — time in which they exported data. The incident required
notifying legal.

**A forged header.** During a security test, someone reached an internal service directly — the
network allowed it — and sent an administrator's `X-User-Id`. The service accepted it.

The fixes.

The access token dropped to 10 minutes, with an 8-hour refresh token, revocable on the server.
Revocation came to take effect within at most 10 minutes.

Each service started verifying the token's signature, in addition to the gateway. The
`X-User-Id` header was eliminated — the identity comes from the locally verified token, not from
something someone injected.

And calls between services started using their own service credentials, scoped to what each one
needs, instead of forwarding the user's token.

What the team records: the decision to verify only at the edge was correct for a topology in
which the services were unreachable from outside. It stopped being valid when the network
changed, and nobody revisited it.

## The credential lifecycle

The decision between session and token covers the steady state. The full cycle has four moments,
and three of them usually go undesigned.

**Issuance.** After authenticating. The decision here is the validity — and it should vary by
context: a mobile app session and an administrative terminal session do not deserve the same
window.

**Renewal.** When the short credential expires. The delicate point is **refresh token rotation**:
issuing a new one on each use and invalidating the previous one allows detecting theft — if an
already-used refresh token reappears, someone copied it, and the whole token family for that user
should be invalidated.

**Revocation.** Logout, blocking, password change, an incident. There has to be a path that works
in minutes, not hours.

**Expiry.** The natural end. With no cleanup, expired sessions accumulate indefinitely in
storage.

The second moment is the least designed and the one that yields the most: rotation with reuse
detection turns a stolen token into an alarm, instead of silent access valid until it expires.

## Related Concepts

- [Authorization](/05-system-design/authorization.md) — what comes next.
- [State Management](/05-system-design/state-management.md) — where the session lives.
- [Stateless vs. Stateful](/05-system-design/stateless-vs-stateful.md) — why tokens scale.
- [Security](/10-security/index.md) — protocols, threats and key management.

## Practical Exercise

In your system: what is the access token's validity? How long does it take for a revocation to
take effect?

Then test: reach an internal service directly, without going through the edge. Does it verify
anything?

## Interview Questions

- What is the difference between a session and a self-contained token?
- Why is revocation the token's problem, and what are the mitigations?
- Why should a signed token not carry sensitive data?

## Further Reading

- OWASP — *Authentication Cheat Sheet*.
- RFC 6749 and RFC 9068 — OAuth 2.0 and the access token profile.

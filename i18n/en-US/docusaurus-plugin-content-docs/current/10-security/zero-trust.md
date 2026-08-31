---
id: zero-trust
title: Zero Trust
sidebar_position: 9
description: Eliminating the implicit perimeter — always verifying, instead of trusting by network location.
doc_type: concept
level: 5
difficulty: advanced
status: complete
objective: >
  By the end, the reader applies zero trust principles in stages, without treating
  it as a product to buy.
prerequisites: [secure-boundaries]
related: [secure-boundaries, network-security, least-privilege]
canonical_for: []
translated_from_version: 1
last_reviewed: 2026-08-31
---

# Zero Trust

## Overview

Zero trust is the principle that **being inside the network confers no trust**. Every request is verified —
identity, authorization, context — regardless of where it comes from.

It replaces the castle model: a strong wall at the perimeter, implicit trust inside.

And it is frequently sold as a product. It is not: it is a set of principles applied gradually, and most of
the work is in things most organizations should already be doing.

## Problem

The perimeter model presupposes that the network boundary separates trusted from untrusted.

That premise broke for three independent reasons:

**Remote work and the cloud.** There is no longer a geographic "inside".

**Attackers get in.** Through a leaked credential, a compromised dependency, phishing. Once inside, lateral
movement is free.

**Employees are already inside.** The insider threat crosses no perimeter.

The result: a small compromise becomes total, because nothing beyond the wall verifies anything.

## Core Concepts

### The principles

```text
verify explicitly      every request, always — identity and context
least privilege        minimal access, preferably temporary
assume compromise      design to contain, not only to prevent
```

The third is what most changes architecture. It shifts the effort from "preventing entry" to "limiting the
reach and detecting quickly" — which is where architecture actually contributes. See
[secure boundaries](/10-security/secure-boundaries.md).

### Identity becomes the perimeter

If network location confers no trust, what does is verified identity — of people and of services.

Practical consequences:

**Services authenticate each other.** Mutual TLS or tokens, not "it is on the same network". See
[service mesh](/08-integration-architecture/service-mesh.md).

**Every request carries verifiable identity**, and each service verifies it instead of trusting the caller.

**Strong authentication for people**, with a phishing-resistant second factor.

### Context enters the decision

Beyond who, the decision considers:

```text
device        is it managed, is it up to date, does it have protection active
location      consistent with that user's pattern
behavior      volume, time of day, type of operation
sensitivity   of the requested resource
```

That allows graduated responses: normal access from the corporate device, an additional second factor from
an unknown device, denial for a sensitive operation in an anomalous context.

The risk is excessive friction. A policy that asks for constant verification makes people look for
workarounds — and the workaround is worse than the loose policy.

### Microsegmentation limits lateral movement

Instead of a flat network where everything reaches everything, policies that allow only the necessary
communication.

```text
a flat network   a compromised service reaches all the others
segmented        it reaches only those the policy allows
```

It is the control that most reduces a compromise's reach, and the most laborious to implement in an
existing environment — because it requires knowing who talks to whom, and almost nobody knows.

The viable path: start by recording the real traffic, derive the policy from it, apply it in warning mode,
and only then block.

### It is not a product, and it is gradual

No tool delivers zero trust. What exist are components: strong authentication, identity management, network
policies, device verification, policy evaluation.

Realistic adoption is in stages, in order of return:

```text
1. strong authentication for people, with a phishing-resistant second factor
2. eliminate static service credentials
3. service-to-service authentication
4. remove permanent elevated access — temporary elevation
5. segmentation, starting with the critical systems
6. device context in the decision
```

The first four deliver most of the benefit and require no new product.

### What it does not eliminate

Frankness is worth it: zero trust does not prevent compromise. It reduces the reach and the detection time.

And it does not replace: vulnerability patching, code review, input validation, data protection. An
organization with zero trust and a SQL injection is still vulnerable to it.

Treating it as a complete answer is the most common positioning mistake.

## Mental Model

**Zero trust is presuming the attacker is already inside.** The work becomes limiting what they reach.

## When to Use

- Remote or hybrid work.
- Resources in the cloud and in your own environment.
- Third-party access.
- Sensitive data with a relevant insider threat.
- An environment with many internal services.
- A regulatory requirement.

## When Not to Use

**As a product to buy.**

**All at once.** Two-year programs with no intermediate delivery are abandoned.

**With friction that generates workarounds.**

**As a substitute for basic hygiene** — patching, validation, review.

**Segmentation without knowing the real traffic.** It blocks production.

**In a small and simple environment**, where the cost exceeds the risk.

## Alternatives

- **Traditional network segmentation** — part of the benefit, less effort. See
  [network security](/10-security/network-security.md).
- **Rigorous [least privilege](/10-security/least-privilege.md)** — most of the containment benefit.
- **Strong authentication** — the single item with the best return.
- **Broker-based access** instead of a private network — it removes the broad network access a private
  connection grants.

## Trade-offs

| Zero trust | A perimeter |
|---|---|
| Limited lateral movement | Free |
| Verification on every request | Once |
| Latency and complexity | Less |
| Works with no "inside" | Depends on the network |
| A long gradual rollout | It already exists |

| Context in the decision | Identity only |
|---|---|
| A graduated response | Binary |
| Variable friction | Predictable |
| Signals to collect | None |

## Failure Modes

**Adopted as a product.** A tool bought, the principles absent.

**Friction generating workarounds.**

**Segmentation blocking production.**

**A program with no delivery.** Two years, nothing in production.

**A false sense.** "We have zero trust" while static credentials circulate.

**Dependency on the policy service.** If it goes down, nothing is authorized.

## Common Mistakes

**Buying instead of applying.**

**Starting with segmentation** instead of identity.

**Not measuring the friction.**

**Segmenting without knowing the traffic.**

**Treating it as a substitute for basic hygiene.**

**Having no emergency path** when the policy service fails.

## Real-World Example

A financial services company started a zero trust program after an incident in which a supplier's
credential was used to access internal systems.

The initial approach was buying a platform and planning a two-year rollout. After eight months, nothing was
in production, and the program lost support.

The restart was in stages, with a delivery each quarter:

**Quarter 1 — strong authentication.** A phishing-resistant second factor for everybody, replacing codes by
message. That alone eliminated the attack class that had caused the original incident.

**Quarter 2 — service credentials.** Elimination of static keys, with platform identity and temporary
credentials. See [secrets](/10-security/secrets.md).

**Quarter 3 — temporary elevated access.** Permanent administrative access was removed; four-hour elevation
with a justification.

**Quarter 4 — service-to-service authentication.** Mutual TLS, through a service mesh, for the critical
services.

**Year 2 — segmentation.** It started with three months recording the real traffic. The derived policy was
applied in warning mode for six weeks, revealing 40 undocumented communications — including two nobody knew
existed, from supposedly decommissioned systems.

Two problems during the program:

**Friction.** The initial elevation policy required a manager's approval, with an average response time of
40 minutes. During incidents that was unviable, and the team created a shared emergency account — exactly
what they wanted to eliminate. The policy was adjusted: automatic approval with logging and later review,
for on-call roles.

**The policy service as a single point.** During an outage of it, nothing was authorized for 20 minutes.
Local evaluation with a cached policy and defined failure behavior came to exist.

The point the team underlines: the first attempt failed by treating zero trust as a platform project. The
second worked because each quarter delivered a verifiable risk reduction — and because the first stage,
alone, would already have prevented the incident that motivated everything.

## Related Concepts

- [Secure Boundaries](/10-security/secure-boundaries.md) — the foundation.
- [Least Privilege](/10-security/least-privilege.md).
- [Network Security](/10-security/network-security.md) — the segmentation.
- [Identity](/10-security/identity.md) — the new perimeter.

## Practical Exercise

Choose an internal service in your system and ask: if an attacker were on the same network, with a valid
credential from another service, what could they do here?

The answer is the lateral movement available to you today.

## Interview Questions

- Why did the perimeter model break?
- Which principle most changes architecture, and why?
- Why start with identity and not with segmentation?

## Further Reading

- NIST SP 800-207 — Zero Trust Architecture.
- Google. *BeyondCorp: A New Approach to Enterprise Security*, 2014.
- Rais, Razi et al. *Zero Trust Networks*. 2nd ed. O'Reilly, 2024.

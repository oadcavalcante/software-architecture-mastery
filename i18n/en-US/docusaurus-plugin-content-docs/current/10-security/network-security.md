---
id: network-security
title: Network Security
sidebar_position: 8
description: Segmentation, filtering and what the network still protects once identity has become the perimeter.
doc_type: concept
level: 5
difficulty: intermediate
status: complete
objective: >
  By the end, the reader uses network controls as a containment layer, without
  depending on them as the only defense.
prerequisites: [security]
related: [zero-trust, secure-boundaries, cloud-networking]
canonical_for: []
translated_from_version: 1
last_reviewed: 2026-08-31
---

# Network Security

## Overview

Network controls decide who can **reach** what. They do not replace authentication and authorization, and
they still hold for a simple reason: what is not reachable is not attackable.

With [zero trust](/10-security/zero-trust.md), the network stopped being the main boundary. It remains as a
**containment layer** — what limits lateral movement after something goes wrong.

## Problem

The typical internal network is flat: anything reaches anything. It was built that way because it is
simpler, and because the defense was at the perimeter.

The consequence appears in the incident: a compromised service — or an infected developer machine — reaches
databases, administrative panels and systems that have nothing to do with it.

The size of the damage is defined by what was reachable, not by what was compromised.

## Core Concepts

### Segmentation limits the reach

Dividing the network into segments with an explicit communication policy between them.

```text
flat             a compromise reaches everything
by layer         the application does not reach the management segment
microsegmented   each service reaches only those it needs
```

Microsegmentation is the most effective and the most laborious, because it requires knowing who talks to
whom — information that rarely exists documented.

The viable path is always the same: record the real traffic, derive the policy, apply it in warning mode,
then block. Applying it directly takes production down.

### Egress filtering is the forgotten half

Almost all the effort goes to inbound traffic. Egress is usually unrestricted.

That matters because egress is the path of **exfiltration** and of **command and control**: a compromised
system needs to send data out or receive instructions.

Restricting egress to the necessary destinations is one of the best-return controls, and one of the least
applied. See [cloud networking](/09-cloud-architecture/cloud-networking.md).

The positive side effect: it also detects undocumented dependencies — the blocked traffic reveals what
nobody knew existed.

### Do not expose what does not need to be exposed

The most basic control and the most frequently violated:

```text
a database             never reachable from the internet
an administrative panel  never reachable from the internet
internal services      never reachable from the internet
```

Every audit finds at least one of those exposed, almost always by a rule created "temporarily".

Administrative access deserves a note: instead of an open port with a source restriction, a managed session
service eliminates the need for any exposed port — and records everything.

### The network does not replace authentication

The structural mistake: a service that accepts any request because "only whoever is on the network can
reach it".

That trusts the network as if it were identity. A wrong configuration, a compromised service, or an
unexpected route breaks the premise — and there is no second line.

The network is **containment**, not authentication. See
[secure boundaries](/10-security/secure-boundaries.md).

### Protection against volume is a separate problem

Denial of service attacks are not solved by segmentation. They require absorption capacity — a distribution
network, filtering at the provider, rate limiting.

It is worth separating the two subjects: segmentation protects against reach; absorption protects against
volume. Confusing them leads to expecting from one control what it does not do.

### Logging is what makes the network observable

Rules that block without logging prevent that attempt and reveal no pattern.

Logging denied connections — and, in the critical segments, the accepted ones too — is what allows
detecting internal scanning and lateral movement. See [auditability](/10-security/auditability.md).

### A private connection with a third party grants more than intended

A specific case worth isolating, because it appears in almost every organization with integrations: a
private network connection with a partner — to exchange data from one system — normally grants reach to
the entire network range, not to the system.

The partner comes to be able to reach everything in that range, today and in the future. And the reverse
holds: a compromise on their side crosses over to yours.

The alternatives that limit the reach:

**Exposing a specific endpoint**, instead of connecting networks.

**A dedicated segment** per partner, with an explicit policy of what they reach.

**Broker-based access**, mediating each connection and logging it.

The practical check: list the active private connections with third parties and, for each one, what that
partner can reach today. The answer is usually much larger than the system that motivated the connection —
and it frequently includes partners whose contract has already ended.

## Mental Model

**The network defines reach, not permission.** It is the layer that limits the damage after identity fails.

## When to Use

- Always, as a containment layer.
- Priority in environments with many internal services.
- Where there is concentrated sensitive data.
- With third-party access to the network.
- Where exfiltration is the main threat.

## When Not to Use

**As authentication.**

**Segmentation without knowing the real traffic.**

**Temporary rules with no expiration.**

**An administrative port exposed**, even with a source restriction, when a managed alternative exists.

**Microsegmentation in a small environment.** The cost exceeds the risk.

**Expecting it to solve denial of service.**

## Alternatives

- **Service-to-service authentication** — mutual TLS, tokens. It complements, it does not replace.
- **Broker-based access** instead of a private network — it avoids granting broad network access.
- **Private endpoints** for managed services. See
  [cloud networking](/09-cloud-architecture/cloud-networking.md).
- **A service mesh** — policy between services at the application layer. See
  [service mesh](/08-integration-architecture/service-mesh.md).

## Trade-offs

| Segmented | Flat |
|---|---|
| Limited lateral movement | Free |
| A policy to maintain | None |
| Changes require adjustment | Fluidity |
| More complex diagnosis | Direct |

| Restricted egress | Unrestricted |
|---|---|
| Exfiltration made harder | Free |
| Dependencies revealed | Hidden |
| Breaks when adding a destination | Never breaks |

## Failure Modes

**A flat network.** A compromise reaches everything.

**Unrestricted egress.** Exfiltration with no obstacle.

**An internal service exposed.** A temporary rule made permanent.

**The network as the only defense.**

**A policy blocking production.** Applied without knowing the traffic.

**No logging of denials.**

**A private connection granting broad access.** A partner with access to the whole network.

## Common Mistakes

**Keeping the network flat.** With no segmentation, compromising any machine gives reach to all the others.
It is what turns a single intrusion into a general incident.

**Not restricting egress.** Almost everyone filters what comes in and opens what goes out — and it is
through egress that exfiltration and contact with a control server happen.

**Trusting the network instead of authenticating.** "It is on the internal network" is not identity.
Services need to authenticate each other, because the internal network is exactly where the intruder
already is when it matters.

**Segmenting without observing first.** Applying restrictive rules without mapping the real flows breaks
integrations nobody documented. Observing in permissive mode first and restricting afterward avoids the
self-inflicted incident.

**Rules with no expiration date.** The opening created for a test survives for years, because nothing
expires on its own and a rule that bothers nobody is not reviewed.

**Not logging what was blocked.** Denied traffic is the most direct signal of scanning and lateral
movement — and it is what almost nobody collects.

## Real-World Example

A retail company had a developer machine compromised by a malicious attachment.

From it, the attacker reached, on the same flat network: the production database, the payroll system, the
infrastructure administration panel and three file servers.

None of that had anything to do with development. All of them were reachable because the corporate network
was a single one.

The exfiltration — around 40 GB over nine days — went out with no restriction at all, because egress
traffic was neither filtered nor monitored.

The detection came from a data transfer cost alert, not from security.

The changes:

**Segmentation by function.** Workstations, production, management and administrative systems in distinct
segments, with an explicit policy between them. Deriving the policy took three months of traffic
observation.

**Egress filtering** in every segment, with allowed destinations by list. Warning mode, in the first six
weeks, revealed 90 undocumented external destinations — 12 of which were legitimate services nobody had
recorded, and 2 were unauthorized software installed by users.

**Administrative access** through a managed session service, with full logging. The exposed administrative
ports were closed.

**Logging of denied connections**, with an alert for internal scanning patterns.

**Service-to-service authentication**, so that the segmentation would not be the only line.

What the team learned: the initial compromise was common and probably unavoidable. What turned a
single-machine incident into a company-wide one was the topology — and it had been decided out of
convenience, fifteen years earlier, when the company had twenty people.

## Related Concepts

- [Zero Trust](/10-security/zero-trust.md) — the principle.
- [Secure Boundaries](/10-security/secure-boundaries.md).
- [Cloud Networking](/09-cloud-architecture/cloud-networking.md).
- [Auditability](/10-security/auditability.md).

## Practical Exercise

From a development machine, try to reach the production database — just the network connection, with no
credential.

If the connection opens, you have measured your lateral movement. Then ask the same question about egress:
which external destinations can that machine send data to?

## Interview Questions

- Why is egress filtering the most forgotten control?
- Why does the network not replace authentication?
- Why does segmenting require observing the traffic first?

## Further Reading

- NIST SP 800-207 — Zero Trust Architecture.
- Rais, Razi et al. *Zero Trust Networks*. 2nd ed. O'Reilly, 2024.
- MITRE ATT&CK — lateral movement and exfiltration techniques.

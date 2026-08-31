---
id: cloud-networking
title: Cloud Networking
sidebar_position: 10
description: Networking as configuration — what changes when the topology is code and the traffic is billed.
doc_type: concept
level: 5
difficulty: advanced
status: complete
objective: >
  By the end, the reader designs a network topology with explicit boundaries and
  understands where traffic generates cost.
prerequisites: [cloud-architecture]
related: [cloud-identity, availability-zones, cost-architecture]
canonical_for: []
translated_from_version: 1
last_reviewed: 2026-08-31
---

# Cloud Networking

## Overview

In the cloud, the network is defined by configuration: you declare address ranges, subnets, routes and
filtering rules, and they come into existence.

That changes two things relative to a physical network. First, the topology is versionable and
reproducible. Second, it is easy to get wrong at scale — a permissive rule applied by mistake holds for
everything it reaches.

And there is a third, with no equivalent on your own network: **the traffic is billed**, and where it goes
becomes an architectural decision.

## Problem

Networking is usually treated as an infrastructure detail: you create what the wizard suggests, open what
is needed to make it work, and never go back.

The typical result: public subnets where they should be private, rules that allow access from any source,
traffic crossing the internet when it could be internal, and a transfer cost nobody can explain.

Each of those is a decision that was not made.

## Core Concepts

### Public and private is the main boundary

```text
public subnet    has a route to the internet
                 load balancers, gateways — what needs to be reachable
private subnet   no inbound route from the internet
                 the application, database, cache — everything else
```

The practical rule: **private by default**. Resources in a public subnet are the exception, justified case
by case.

That is not paranoia — it is that the alternative, exposing out of convenience and protecting with a
firewall rule, transfers all the security to a configuration a distracted person can loosen.

Private resources that need to reach the internet — for updates, for external APIs — leave through a
translation gateway, which allows egress without allowing ingress.

### Security groups are the filter that matters

Rules applied to the resource, not to the network: which source can reach which port.

Two principles that resolve most of it:

**Deny by default, allow the specific.**

**Reference groups, not address ranges.** Allowing the application's group to reach the database's group is
more readable and more robust than allowing a range — because it stays correct when the addresses change.

The rule that appears in every audit: administrative access open to any source on the internet. It usually
was created "temporarily".

### A private endpoint avoids the internet

The provider's managed services — storage, database, queue — have public addresses by default. Your
application's traffic to them leaves your network.

A private endpoint brings that service inside your virtual network: the traffic does not pass through the
internet, and the service can be configured to refuse access from outside.

Three gains at once: a smaller surface, slightly lower latency, and a lower transfer cost.

It is one of the best-return configurations and one of the least applied.

### The cost depends on where the traffic goes

```text
within the same zone       generally free
between zones              billed, in both directions
between regions            more expensive
egress to the internet     the most expensive
through a translation gateway  billed per hour and per gigabyte processed
```

The last line surprises people: a translation gateway processing high volume can become a relevant invoice
item, and the traffic passing through it frequently could go through a private endpoint.

See [cost architecture](/09-cloud-architecture/cost-architecture.md) and
[availability zones](/09-cloud-architecture/availability-zones.md).

### Address ranges need to be planned

Choosing the virtual network's range seems irrelevant until you need to connect it to another one — a
corporate network, a partner's network, an acquired company's account.

Overlapping ranges prevent a direct connection, and the solution involves address translation, which
complicates everything.

An addressing plan, defined before the first network, costs an afternoon and avoids migrations.

### Name resolution is where the problems hide

A good part of cloud networking incidents are name resolution: a private zone not associated, misconfigured
forwarding, resolution working from one network and not from another.

They are hard because the symptom is generic — "it does not connect" — and the cause is in a layer nobody
looks at first.

## Mental Model

**Cloud networking is configuration with reach.** A wrong rule does not affect one cable, it affects
everything it describes.

## When to Use

These decisions always come up. Special attention when:

- There is sensitive data.
- A connection to the corporate network exists.
- The traffic volume is high.
- Several environments or accounts need to communicate.
- There is a requirement not to travel over the internet.

## When Not to Use

**Resources in a public subnet with no need.**

**Administrative access open to the internet.**

**Rules by address range** when a group reference solves it.

**Traffic to managed services over the internet** when a private endpoint exists.

**Ranges chosen with no plan.**

**Networking as manual configuration**, with no infrastructure as code.

## Alternatives

- **Private connectivity to the corporate network** — instead of exposing services.
- **Administrative access through a managed session service** — it eliminates the need for an open port.
- **A service mesh** — for policies between services. See
  [service mesh](/08-integration-architecture/service-mesh.md).
- **A private endpoint** — instead of a translation gateway for the provider's services.

## Trade-offs

| Everything private | Direct exposure |
|---|---|
| Minimal surface | Larger |
| Additional configuration | Simple |
| Indirect administrative access | Direct |
| The cost of endpoints | None |

| A translation gateway | A private endpoint |
|---|---|
| Reaches any destination | Supported services only |
| Cost per hour and per gigabyte | Cost per hour, less per traffic |
| Traffic over the internet | Internal |

## Failure Modes

**A resource exposed unintentionally.** A public subnet by default.

**A temporary permissive rule made permanent.**

**Overlapping ranges** preventing a future connection.

**A translation gateway's cost.** High volume through an expensive path.

**Name resolution failing** in a way specific to one network.

**Address exhaustion.** A subnet too small, and resizing requires recreating it.

**A broad egress rule.** The focus is usually on ingress; unrestricted egress facilitates exfiltration.

## Common Mistakes

**Not planning the addressing.** Ranges overlapping between environments or with the corporate network
prevent interconnection later, and renumbering a production network is one of the most expensive operations
there is.

**Leaving resources in a public subnet.** A database and an internal service with a public address depend
only on the security group being right. The private subnet removes the exposure instead of filtering it.

**Temporary rules that stay.** The broad opening made to debug an incident survives for years, because
nothing expires on its own and nobody reviews what causes no problem.

**Not using private endpoints.** Without them, traffic to the provider's own services goes out over the
internet — which adds exposure, latency and, frequently, egress cost.

**Ignoring the cost of the traffic path.** Transfer between zones, between regions and to the internet have
very different prices. An architecture that crosses zones with no need pays that on every request.

**Not restricting egress traffic.** Almost everyone filters ingress and opens egress — and egress is the
path of exfiltration and of contact with a command server.

## Real-World Example

An e-commerce company had three networking problems that appeared at different moments and had the same
origin: the network had been created by the default wizard, three years earlier.

**An exposed database.** The database was in a public subnet, with a rule that allowed access from the
office range. The range had changed the previous year, and the rule had been broadened to "any source" to
unblock an access — temporarily. The discovery came from a contracted external scan.

**Translation cost.** The application read and wrote large volumes in object storage, and all that traffic
passed through the translation gateway. The item was the fourth largest on the invoice, and nobody knew
what it was. A private endpoint reduced it by around 90%.

**A blocked acquisition.** The company acquired another, and both networks used the same address range.
Connecting them directly was impossible. The integration took four months longer than planned, with address
translation on both sides.

The fixes, besides the specific ones:

**An addressing plan** for the whole organization, with ranges reserved per environment and space for
acquisitions.

**Private subnets by default**, with exposure requiring approval.

**Administrative access** through a managed session service, with no open ports.

**Egress rules restricted** to the necessary destinations.

**Networking as code**, with review. Temporary rules came to have a mandatory expiration date.

What the team records: none of the three problems was hard to avoid. All of them came from the network
having been treated as a prerequisite to resolve quickly, and not as part of the design.

## Related Concepts

- [Cloud Identity](/09-cloud-architecture/cloud-identity.md) — the other boundary layer.
- [Availability Zones](/09-cloud-architecture/availability-zones.md) — cross-zone traffic.
- [Cost Architecture](/09-cloud-architecture/cost-architecture.md).
- [Security](/10-security/index.md).

## Practical Exercise

List the resources that are in a public subnet today and ask, for each one: does it need to be reachable
from the internet?

Then look for rules that allow access from any source. Each one has a story, and almost all of them start
with "temporarily".

## Interview Questions

- Why should a private subnet be the default?
- What does a private endpoint solve, and what does it save?
- Why does the addressing plan matter before the first network?

## Further Reading

- The major providers' virtual network documentation.
- NIST SP 800-207 — zero trust architecture.
- Rice, Liz. *Container Security*. O'Reilly, 2020.

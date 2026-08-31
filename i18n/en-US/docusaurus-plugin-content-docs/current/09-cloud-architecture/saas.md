---
id: saas
title: SaaS
sidebar_position: 3
description: Buying the software ready-made — the "build or buy" decision and what it transfers along with it.
doc_type: concept
level: 5
difficulty: intermediate
status: complete
objective: >
  By the end, the reader decides between building and buying by competitive
  differentiation, and evaluates SaaS by what it couples.
prerequisites: [paas]
related: [paas, vendor-lock-in, managed-services]
canonical_for: []
translated_from_version: 1
last_reviewed: 2026-08-31
---

# SaaS

## Overview

SaaS — software as a service — is ready-made software, operated by a vendor, consumed by subscription.

From an architecture point of view, adopting a SaaS is the decision to **buy instead of build**: the vendor
takes care of everything, including the functionality.

What remains yours, always: the data you put there, and the integration with the rest of your system.

## Problem

Every company has functionality it needs to have and that does not differentiate it: payroll, ticket
management, email sending, monitoring, authentication.

Building each one consumes engineering capacity that could be on what differentiates. And the result is
usually worse than the specialized product, because it does not receive continuous investment.

The difficulty is not recognizing that in general. It is deciding, case by case, where the line is — and
not building by reflex what already exists ready-made.

## Core Concepts

### The question is about differentiation, not about cost

The criterion that resolves most cases:

**Is this a source of competitive advantage?** If customers choose you because of it, build. If not, buy.

A shipping company that builds its own routing engine may be right — route efficiency is the business. The
same company building a ticketing system is spending capacity on what does not distinguish it.

The most common mistake is not buying what should be built. It is building what should be bought,
typically because "our case is different" — and it is almost never different enough to justify it.

### What you buy along with it

**Someone else's roadmap.** The vendor decides what to build. Your specific need may never be served.

**Their data model.** Your data goes into the structure they define.

**Their availability.** If they go down, you go down — with no action possible. That needs to enter your
availability calculation. See [availability](/06-distributed-systems/availability.md).

**Continuity risk.** Vendors are acquired, change strategy, discontinue products.

**Their pricing model.** Which changes, and you have little power over it.

### Integration is where the real cost appears

The SaaS solves the functionality. Connecting it to your system is your work, and it is underestimated:

**Data synchronization** in both directions, with all the
[consistency](/07-data-architecture/data-consistency.md) problems that brings.

**Identity.** Provisioning and deprovisioning users.

**The contract.** Their API changes at their pace. See
[integration contracts](/08-integration-architecture/integration-contracts.md).

**Anti-corruption.** Their model should not get into yours. See
[anti-corruption layer](/08-integration-architecture/integration-anti-corruption.md).

With many integrated SaaS products, the cost of maintaining the integrations becomes significant — and it
is an expense nobody budgets at acquisition.

### Data export is what decides reversibility

Before adopting, three questions:

**How do I export my data?** In what format, with what completeness, with what effort.

**Does the history come with it?** Many export the current state and not the history.

**How long would migrating take?**

A SaaS with no decent export is an almost irreversible decision. See
[vendor lock-in](/09-cloud-architecture/vendor-lock-in.md).

### The data remains your responsibility

Putting personal data in a SaaS does not transfer the legal responsibility. You still answer for it.

That means evaluating where the vendor stores it, what they do with the data, how they handle deletion
requests, and what happens if the contract ends. See
[data lifecycle](/07-data-architecture/data-lifecycle.md).

And it means "it is with the vendor" is not an answer for an audit.

### Silent proliferation

SaaS is easy to buy — a credit card, with no engineering involved. The predictable result is that different
teams adopt overlapping tools, with data scattered and no inventory.

That becomes a security problem — accounts with no deprovisioning, data in unknown places — before it
becomes a cost problem.

## Mental Model

**Buy what does not differentiate you.** And before buying, check how you would leave.

## When to Use

- The functionality is not a competitive differentiator.
- A mature product that serves the need exists.
- The cost of building and maintaining exceeds the subscription.
- Compliance the vendor already meets.
- Speed matters more than fine tuning.

## When Not to Use

**When it is the competitive differentiator.**

**When data export is poor.**

**When their availability does not fit your requirement.**

**When compliance cannot be outsourced.**

**Without evaluating the integration cost.**

**Many overlapping SaaS products** with neither inventory nor governance.

## Alternatives

- **Building** — when it differentiates.
- **Self-managed open source** — control of the data, with the operational work.
- **SaaS with a self-hosted option** — a middle ground, when it exists.
- **Buying and wrapping** — using the SaaS behind a layer of your own, preserving the possibility of
  switching.

## Trade-offs

| Buying | Building |
|---|---|
| Available now | Months |
| No maintenance | Continuous |
| The vendor's functionality | Exactly what you need |
| Predictable subscription cost | Engineering cost |
| Dependency and continuity risk | Control |
| Data at the vendor | Yours |

## Failure Modes

**Vendor unavailability.** With no action possible.

**A price change.**

**A discontinued product.**

**A necessary feature never prioritized.**

**An incomplete export.** Discovered when trying to leave.

**Accounts not deprovisioned.** Former employees with access.

**The vendor's model leaking** into your domain.

## Common Mistakes

**Building what does not differentiate.** Payroll, authentication and email sending distinguish the company
from no competitor, and building them consumes the engineering capacity that would distinguish it.

**Not checking the export before adopting.** The question "how do I get my data out of here?" needs to be
answered before signing, because afterward it is asked with no bargaining power.

**Not accounting for the integration cost.** The license is the visible number; integrating, mapping
identities, synchronizing data and keeping that working usually costs more than it.

**Not including the vendor's availability in the calculation.** Your system's availability cannot be higher
than that of the service it depends on synchronously. Three vendors at 99.9% in series already sink the
math.

**Not maintaining a SaaS inventory.** Subscriptions adopted by individual teams accumulate cost, data
access and exposure nobody can enumerate when an audit arrives.

**Letting their model into your code.** When the vendor's types spread through the domain, switching
vendors stops being a commercial decision and becomes a rewrite.

## Real-World Example

A logistics company with 30 engineers maintained, internally: a ticketing system, a monitoring tool,
document management and a human resources system.

All of them had been built years earlier, when the alternatives were worse or more expensive.

The survey showed **4 full-time-equivalent engineers** maintaining those four systems — 13% of capacity, on
nothing the company sold.

The replacement with SaaS was done for three of the four:

**Ticketing, monitoring and human resources** replaced. The four engineers went back to the routing engine,
which is the product's real differentiator.

**Document management stayed internal.** The approval flow was specific to the regulated sector the company
operates in, and no product served it without extensive customization. A recorded decision, with the
maintenance cost accepted.

Three problems in the transition:

**Exporting from the old ticketing system.** Trivial, because it was their own. The verification of the
**new** one's export was done before signing — and one of the candidates was discarded precisely because it
only exported the last 12 months.

**An underestimated integration cost.** Synchronizing users and cost centers among three SaaS products and
the internal system took twice the estimate, and became recurring maintenance.

**Unavailability.** The monitoring SaaS was down for 6 hours. The irony did not go unnoticed: the system
that was supposed to warn about problems had a problem, and there was no alternative. A minimal independent
monitoring came to exist, for the critical path only.

In retrospect: the decision to buy was clearly positive. What was missing was budgeting the integration as
a project — it was treated as a detail of the acquisition and consumed more time than evaluating the
vendors.

## Related Concepts

- [PaaS](/09-cloud-architecture/paas.md) and [IaaS](/09-cloud-architecture/iaas.md) — the models below.
- [Vendor Lock-In](/09-cloud-architecture/vendor-lock-in.md).
- [Integration Contracts](/08-integration-architecture/integration-contracts.md).
- [Data Lifecycle](/07-data-architecture/data-lifecycle.md).

## Practical Exercise

List what your team maintains internally. For each item, ask: do customers choose us because of this?

Where the answer is no, check whether a ready-made product exists — and how much time your team spends
maintaining what does.

## Interview Questions

- What is the criterion for deciding between building and buying?
- What do you buy along with a SaaS, beyond the functionality?
- Why check the export before adopting?

## Further Reading

- Fowler, Martin. *Utility vs Strategic Dichotomy*, 2007.
- Moore, Geoffrey. *Dealing with Darwin*. Portfolio, 2005 — core versus context.
- Cagan, Marty. *Inspired*. 2nd ed. Wiley, 2017.

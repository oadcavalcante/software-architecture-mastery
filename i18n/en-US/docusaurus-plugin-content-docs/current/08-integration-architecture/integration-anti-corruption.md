---
id: integration-anti-corruption
title: Anti-Corruption Layer in Integration
sidebar_position: 12
description: Translating at the boundary so someone else's model does not enter yours — and when the translation is not worth it.
doc_type: pattern
level: 5
difficulty: advanced
status: complete
objective: >
  By the end, the reader decides where to place boundary translation based on the risk
  of the external model contaminating the internal one.
prerequisites: [integration-contracts]
related: [integration-contracts, event-driven-integration, schema-evolution]
canonical_for: []
translated_from_version: 1
last_reviewed: 2026-08-31
---

# Anti-Corruption Layer in Integration

## Overview

An anti-corruption layer translates between an external system's model and yours, so that someone else's
vocabulary and modeling decisions stop at the boundary.

The concept comes from
[domain-driven design](/04-domain-driven-design/anti-corruption-layer.md). Here it is seen from the
integration angle: **what happens when you do not have it**, and when its cost is not justified.

The coupling it prevents is the most expensive one in an integration — model coupling — and the least
visible, because it never appears as an incident. It appears as an inability to change.

## Problem

A system integrates with an external service. The shortest path is using the structures it returns
directly in the code.

It works, and the external model spreads. Six months later, its vocabulary is in class names, database
fields, screens and business rules.

From then on:

- Switching providers requires touching the whole system.
- A change in their model breaks things in unexpected places.
- Concepts that make no sense in your domain occupy space in it.
- Business discussions use the provider's vocabulary.

None of that appears as a defect. It appears as an estimate that tripled.

## Core Concepts

### What the layer does

It sits between the integration and your domain, and does four things:

**Translates vocabulary.** `Partner.legalId` becomes `Supplier.taxId`.

**Discards what does not matter.** The provider returns 60 fields; your domain uses 8.

**Fills in what is missing.** Default values, conversions, derived fields.

**Isolates failures and formats.** The provider's errors become your domain's errors; the business code
does not know someone else's HTTP codes.

The result: your domain never sees the external model. Switching providers is rewriting the layer.

### It protects in both directions

Less obvious, and equally important: when you publish outward, the layer prevents **your** internal model
from becoming a public contract.

It is the same separation between internal events and integration events described in
[event-driven integration](/08-integration-architecture/event-driven-integration.md).

Without it, refactoring your domain breaks external consumers — and you lose the freedom to change what is
yours.

### The cost is real and has to be acknowledged

This is what the literature usually omits:

**More code.** Two representations of the same concept and the mapping between them.

**Changes in two places.** A new provider field you want to use has to pass through the translation.

**Layers that do nothing.** When the external model is practically the same as yours, the translation
becomes a field-by-field copy — pure ceremony.

**Indirection in debugging.** A wrong value may be at the source or in the translation.

Applying the layer to every integration is as wrong as applying it to none.

### The criterion: contamination risk times switching cost

Two questions decide:

**Is the external model foreign to your domain?** If the provider thinks in "subscriptions" and you think
in "contracts", the translation prevents real confusion. If both think alike, there is nothing to
translate.

**Is switching providers plausible?** A payment provider can be switched. The company's internal
accounting system cannot.

```text
foreign model + plausible switch    → a complete layer, no discussion
foreign model + implausible switch  → light translation, to preserve the vocabulary
close model   + plausible switch    → thin translation, focused on isolating the contract
close model   + implausible switch  → probably not worth it
```

The bottom-right quadrant is what generates useless layers when the pattern is applied on principle.

### Where it lives

**At the service's edge** — an adapter only your domain consumes. The common case.

**In its own service** — when several applications integrate with the same external system, and the
translation should be done once.

**In the event consumer** — translating the external event before it enters.

The second option has a risk: a shared translation service tends to accumulate business rules from several
consumers and become a coupling point of its own.

### A legacy system is the classic case

When replacing an old system gradually, the layer allows the new one to have its own model from the start,
talking to the legacy one through translation.

Without it, the new system is born with the model of what you wanted to replace — which empties out the
reason for the replacement.

## Mental Model

**The layer is where other people's model stops.** Its cost is constant and predictable; the cost of not
having it appears when you need to change.

## When to Use

- The external model is foreign to your domain.
- Switching providers is plausible.
- Integration with a legacy system during replacement.
- You publish to external consumers and want to be able to refactor.
- The external model is unstable.
- Several applications integrate with the same external system.

## When Not to Use

**When the models are practically the same.** The translation becomes a copy.

**For internal integration between the same team's services**, with a shared vocabulary.

**When switching is implausible and the model is close.**

**As a layer that only forwards.** If it translates nothing, remove it.

**A shared translation service with no clear owner.** It becomes a rules dump.

**In a disposable integration.** A migration script used once.

## Alternatives

- **A simple adapter** — thin translation, with no complete intermediate model.
- **Mapping at deserialization** — for light cases, converting on input.
- **A consumer-driven contract** — instead of translating, negotiating the format. It only works within
  the organization. See
  [integration contracts](/08-integration-architecture/integration-contracts.md).
- **Accepting the coupling consciously** — a legitimate decision when the model is close and switching is
  implausible, as long as it is recorded.

## Trade-offs

| With a layer | Without |
|---|---|
| Internal model protected | Contaminated |
| Switching providers is local | Touches the whole system |
| Your own vocabulary | The provider's |
| Translation code to maintain | None |
| A change goes through two places | One |
| Indirection in debugging | Direct |

## Failure Modes

**The external model leaking anyway.** The layer exists and someone imports the provider's type directly
into the domain.

**A layer that only forwards.** Cost with no benefit.

**Translation with business rules.** The layer was supposed to translate, and came to decide.

**Silent translation losing information.** A field the provider started sending never reaches the domain,
because the mapping does not know it.

**A translation service becoming an integration monolith.**

**An outdated layer.** The provider evolved and the translation is still on the old version, with nobody
knowing what is being lost.

## Common Mistakes

**Applying it to every integration.**

**Applying it to none.**

**Letting the external type leak** through a side path.

**Putting business rules in the translation.**

**Not testing the translation** — it is where the mapping errors live.

**Not reviewing it when the provider evolves.**

## Real-World Example

A logistics company integrated with four carriers, each with its own API.

The first integration was done with no layer: the carrier's objects went straight into the domain. Their
vocabulary — `shipment`, `waybill`, `consignee` — became the system's vocabulary, including in tables and
screens.

When the second carrier came in, the problem appeared: they used a different vocabulary and a different
model — grouping by route, not by shipment. There was nowhere to fit them.

The solution at the time was a `carrier_type` field with conditionals scattered around. By the third,
there were 40 conditional points. The fourth took five months to integrate.

The redesign introduced its own shipment model, and a translation layer per carrier.

**An internal model defined by the business**, not by any of them. The names became `shipment`,
`recipient`, `route` — the vocabulary people already used in meetings and that did not exist in the code.

**One adapter per carrier**, translating in both directions. The scattered conditionals disappeared.

**Translation tests** per carrier, with recorded real responses. That is where three old mapping errors
appeared, including a weight field in pounds being treated as kilograms by one of them.

The fifth carrier was integrated in **three weeks**, touching only the new adapter.

And a deliberate decision in the opposite direction: the integration with the internal billing system
**did not** get a layer. The model was the same, the system belongs to the company itself and would not be
switched. A layer there would have been a field-by-field copy.

The detail the team highlights: the initial error was not technical, it was one of sequence. With only one
carrier, integrating directly looked — and was — simpler. The problem is that nobody asked "and when the
second one comes in?", which was a certainty in the business plan.

## Related Concepts

- [Anti-Corruption Layer](/04-domain-driven-design/anti-corruption-layer.md) — the concept in DDD.
- [Integration Contracts](/08-integration-architecture/integration-contracts.md).
- [Event-Driven Integration](/08-integration-architecture/event-driven-integration.md) — event
  translation.
- [Schema Evolution](/08-integration-architecture/schema-evolution.md).

## Practical Exercise

Look in your code for a provider's name or a concept that only exists in their model. Count how many files
it appears in.

If it appears outside the integration folder, the external model has already entered — and the number of
files is the cost of switching providers.

## Interview Questions

- What coupling does the layer prevent, and why is it the most expensive?
- When is it not worth it?
- Why does it also protect in the outbound direction?

## Further Reading

- Evans, Eric. *Domain-Driven Design*. Addison-Wesley, 2003 — chapter 14.
- Vernon, Vaughn. *Implementing Domain-Driven Design*. Addison-Wesley, 2013.
- Newman, Sam. *Monolith to Microservices*. O'Reilly, 2019.

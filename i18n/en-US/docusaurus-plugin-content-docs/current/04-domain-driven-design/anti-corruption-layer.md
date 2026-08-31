---
id: anti-corruption-layer
title: Anti-Corruption Layer
sidebar_position: 9
description: The layer that keeps another's model from leaking into yours.
doc_type: pattern
level: 2
difficulty: intermediate
status: complete
objective: >
  By the end, the reader decides where an anti-corruption layer pays off and
  recognizes when it has become an anemic adapter.
prerequisites: [context-mapping]
related: [adapter, bounded-context, legacy-modernization]
canonical_for: [anti-corruption layer, ACL]
translated_from_version: 1
last_reviewed: 2026-08-31
---

# Anti-Corruption Layer

## Overview

An anti-corruption layer is a translation layer between two bounded contexts, which prevents
one's model from leaking into the other.

The name is deliberately strong: without it, the other's model **corrupts** yours — its
concepts come to inhabit your domain, and its decisions come to constrain yours.

## Problem

You need to integrate with a system whose model you do not control: a legacy system, another
area's service, an external vendor.

The path of least resistance is consuming its model directly. The types arrive, and each one
is a route through which that system's decisions enter yours.

The symptom shows up later: the domain gains concepts that are not its own — a field that
exists because the legacy system requires it, a state that only makes sense in the vendor's
model, a rule that exists to work around someone else's limitation.

When the external system changes, your domain changes with it. And when you want to replace
the vendor, you discover its model is spread everywhere.

## Core Concepts

### It is more than format translation

The distinction that separates an anti-corruption layer from a simple
[Adapter](/03-design-patterns/adapter.md).

Adapter converts interfaces. An anti-corruption layer converts **models**: the other side's
concepts become your concepts, with their own semantics, and what makes no sense in your
domain does not cross.

If the legacy system has seven order statuses and your domain recognizes three, the layer
maps seven to three. It decides what matters — and that decision is modelling, not
conversion.

### It protects the semantics, not just the types

The hardest work is in the semantic edge cases.

The legacy system returns a negative lead time when there is an error. It uses a zero date to
mean "no date". It counts an order as "completed" including cancelled ones.

Each of those is a decision from the other's model that does not belong in yours. The layer
has to translate that into your vocabulary — or reject it, if there is no valid translation.

A layer that merely converts fields lets those traps through, and they show up as business
defects months later.

### The cost is continuous maintenance

When the external system evolves, the layer has to keep up.

That is the price, and it is what makes it a decision rather than a default: you pay for
translation in order not to pay for coupling.

### It enables modernization

An anti-corruption layer allows building the new model while the legacy system keeps running.
It is the mechanism that makes
[strangler fig](/16-legacy-modernization/index.md) viable — the new system speaks its own
language from day one, and the layer absorbs the legacy.

## When to Use

- Integration with a legacy system that will not be altered.
- Consuming another area's service with an incompatible model.
- An external vendor whose model can change without notice.
- Incremental modernization, with old and new coexisting.
- Whenever the relationship would be conformist and independence matters.

## When Not to Use

**When both sides are yours and can converge.** Align the models rather than translating. The
layer becomes debt.

**When the external model suits your domain.** If the concepts genuinely coincide, translating
adds indirection and protects nothing.

**When the maintenance cost exceeds that of the coupling.** A one-off integration with a
stable system, used in one place, may not justify it.

**When it reduces to field-by-field mapping.** If the layer makes no modelling decision —
merely renaming fields — it is an anemic adapter. Either the external model already served, or
the real translation is not being done.

**When there is nobody to maintain it.** An out-of-date layer is worse than none: it gives an
impression of protection that does not exist.

## Alternatives

- **Conformist** — deliberately adopting the external model, when independence is not worth
  the cost. It is a legitimate decision, as long as it is declared.
- **[Adapter](/03-design-patterns/adapter.md)** — when the incompatibility is of interface and
  not of model.
- **Negotiating the contract** — when there is a real customer-supplier relationship, changing
  the other side may be cheaper.
- **Separate ways** — not integrating.

## Trade-offs

| Anti-corruption layer | Direct consumption |
|---|---|
| Domain protected from the other's model | The other's model enters |
| Replacing the vendor is local | Touches the whole system |
| Semantics translated and validated | Traps get through |
| Continuous maintenance of the translation | None |
| One layer to understand | Direct flow |
| Cost paid even with no external change | Cost paid when it changes |

## Failure Modes

**Anemic layer.** Field-by-field mapping, with no modelling decision.

**Partial leak.** Most of it is translated and one of the other side's types escapes in a
signature. One is enough.

**Out-of-date layer.** The external model evolved and the translation did not; silent errors.

**Lossy translation not handled.** A state on the other side has no counterpart and is mapped
to the nearest one, without anyone deciding whether that is correct.

**A layer that accumulates business rules.** It is the meeting point of the two models, and
rules migrate there — the same mechanism that degenerates
[facades](/03-design-patterns/facade.md) and buses.

## Common Mistakes

**Treating it as format conversion.** It is model translation.

**Not handling the semantic edge cases.** That is where the real corruption happens.

**Letting one external type leak.**

**Not maintaining it.** The layer needs an owner.

**Applying it to trivial integrations.** Cost with no benefit.

## Real-World Example

A lending company integrated with a credit bureau's system. The bureau's model was rich and
specific: 40 kinds of occurrence, its own scoring scales, restriction codes with semantics
documented in a 200-page manual.

The first integration consumed the model directly. Within eighteen months,
`BureauOccurrence` appeared in 34 domain files, and the credit decision rule was written in
terms of the bureau's codes.

Two problems appeared together.

The bureau changed the scoring scale, and the change touched all 34 files.

And the company wanted to add a second bureau, with a completely different model. There was no
way: the domain spoke the first one's language.

The anti-corruption layer built afterwards translated into a model of its own: `RiskProfile`
with bands defined by the company, `ActiveRestriction` with the four kinds that mattered to
the business, and `NormalizedScore` on its own scale.

The 40 kinds of occurrence became four. The decision of which four was taken with the risk
team — and it is exactly the modelling decision the layer exists to concentrate.

The second bureau was added as a second translation, in three weeks, with zero change in the
domain.

The detail that paid off most: the layer rejects bureau responses that cannot be translated
safely — rather than mapping them to the nearest value. That turned a class of silent defect
into an explicit integration error.

## Related Concepts

- [Context Mapping](/04-domain-driven-design/context-mapping.md) — where this pattern sits.
- [Adapter](/03-design-patterns/adapter.md) — the interface version.
- [Bounded Context](/04-domain-driven-design/bounded-context.md) — what is protected.
- [Legacy Modernization](/16-legacy-modernization/index.md) — the most frequent use.

## Practical Exercise

Pick an external integration in your system and count in how many files the external system's
types appear.

Then list the semantic edge cases: special values, states with no counterpart, error codes
embedded in data fields. Check where each is handled today.

## Interview Questions

- What is the difference between an anti-corruption layer and an Adapter?
- What characterizes an anemic layer?
- How does this pattern enable incremental modernization?

## Further Exploration

- Evans, Eric. *Domain-Driven Design*. Addison-Wesley, 2003.
- Vernon, Vaughn. *Implementing Domain-Driven Design*. Addison-Wesley, 2013.
- Fowler, Martin. *StranglerFigApplication*, 2004.

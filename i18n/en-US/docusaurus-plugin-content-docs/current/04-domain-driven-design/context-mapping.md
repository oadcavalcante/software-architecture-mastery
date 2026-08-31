---
id: context-mapping
title: Context Mapping
sidebar_position: 8
description: How bounded contexts relate — and why the relationship pattern is organizational before it is technical.
doc_type: concept
level: 2
difficulty: advanced
status: complete
objective: >
  By the end, the reader maps the relationships between contexts and recognizes that
  the pattern reflects organizational power and dependency.
prerequisites: [bounded-context]
related: [anti-corruption-layer, strategic-ddd, integration-architecture]
canonical_for: [context mapping, context map]
translated_from_version: 1
last_reviewed: 2026-08-31
---

# Context Mapping

## Overview

Context mapping is the practice of identifying an organization's bounded contexts and the
**kind of relationship** between them.

What makes the technique valuable is not the drawing. It is that the relationship patterns
describe **power and dependency between teams**, not merely technical integration — and
naming that makes negotiable what was previously implicit.

## Problem

Contexts do not live in isolation. Billing needs data from underwriting; logistics needs
data from orders; a new context needs to consume a legacy system nobody can alter.

Without mapping those relationships, three things happen.

The integration becomes point-to-point, with no contract, and the landscape becomes
invisible.

The asymmetry of power stays implicit: one team discovers it depends on another that has no
obligation to serve it, and that becomes recurring conflict with no name.

And nobody knows where the translation should happen, so it happens everywhere.

## Core Concepts

### The relationship patterns

Evans names several; these are the ones that appear most and decide most.

**Partnership.** Two teams that succeed or fail together. They coordinate releases and evolve
the contracts jointly. It works with two aligned teams; it does not scale.

**Customer-supplier.** The supplier has an obligation to meet the customer's needs,
negotiated. It requires the customer to have enough organizational weight for the obligation
to be real.

**Conformist.** The consumer adopts the supplier's model with no translation, because it has
no negotiating power. Cheap and fully coupling.

**Anti-corruption layer.** The consumer translates the other's model into its own. It costs
maintenance and preserves independence. See
[anti-corruption layer](/04-domain-driven-design/anti-corruption-layer.md).

**Open host service** with a **published language.** The supplier publishes a stable protocol
for many consumers. It is the answer when there are too many consumers to serve
individually.

**Shared kernel.** Two contexts deliberately share a small part of the model. It reduces
duplication and couples both teams on every change.

**Separate ways.** No integration. Duplicating is cheaper than integrating — a legitimate
conclusion and rarely considered.

### The pattern reflects the organization

The observation that makes the technique useful:

| Pattern | What it says about the organization |
|---|---|
| Partnership | Teams with a common goal and direct communication |
| Customer-supplier | The consumer has weight to negotiate |
| Conformist | The consumer has no power |
| Anti-corruption layer | The consumer prefers paying for translation to coupling |
| Open host service | Too many consumers to serve one by one |
| Shared kernel | Two teams accept coordinating |

Choosing a pattern the organization does not sustain does not work. Declaring
customer-supplier when the supplier is another business unit with no obligation produces
recurring frustration — the real pattern is conformist, and naming it allows deciding whether
building an anti-corruption layer is worth it.

### Upstream and downstream

The upstream context influences the downstream one. The direction of influence matters more
than the direction of the network call.

A context that consumes another's events is downstream, even without calling it. A change to
an event affects it.

### The map is for deciding, not for documenting

A context map that only describes the present has little value. It serves to ask: is this
pattern what we want? Where is the asymmetry costing us? What would change if we invested in
an anti-corruption layer here?

## Mental Model

**For each pair of contexts that talk, ask who has an obligation to whom.** The answer gives
the pattern, and it is organizational.

## When to Use

- When designing the integration between new contexts.
- When understanding an existing landscape before modifying it.
- When recurring conflicts between teams involve technical dependency.
- Before deciding to extract a service — the pattern informs the cost.

## When Not to Use

**In a system with one context.** There is no relationship to map.

**As a static document.** A map drawn once and filed decides nothing.

**To prescribe a pattern the organization does not sustain.**

**As a substitute for conversation with the teams involved.** The map is the result of the
conversations, not an alternative to them.

## Alternatives

- **A technical integration diagram** — it shows the connections and not the power relation.
  Complementary, not a substitute.
- **Team Topologies** — the corresponding organizational analysis. See
  [Level 07](/23-architecture-leadership/index.md).
- **A corporate integration landscape** — the map at company scale. See
  [Level 06](/15-enterprise-architecture/index.md).

## Trade-offs

The trade-offs are per chosen pattern:

| | Coupling | Cost | Independence |
|---|---|---|---|
| Conformist | Maximum | Minimum | None |
| Shared kernel | High | Coordination | Partial |
| Customer-supplier | Medium | Negotiation | Good |
| Anti-corruption layer | Low | Continuous translation | High |
| Separate ways | None | Duplication | Total |

Moving down the table costs more and buys more independence. The choice depends on how much
independence is worth for that pair.

## Failure Modes

**A declared pattern the organization does not sustain.** The most common.

**Conformist by omission.** Nobody decided; the other's model was simply adopted and the
coupling showed up later.

**A shared kernel that grows.** What should be small becomes half the model, and the two
teams end up coupled on everything.

**An out-of-date map.** It describes integrations that changed.

**An unmaintained anti-corruption layer.** The supplier's model evolves, the translation does
not, and the leak returns.

## Common Mistakes

**Treating it as a technical exercise.** It is organizational analysis.

**Not naming the asymmetry.** Leaving implicit that one team depends on another with no
reciprocal obligation produces conflict with no diagnosis.

**Choosing an anti-corruption layer for everything.** It costs maintenance; use it where
independence matters.

**Not considering separate ways.** Duplicating is sometimes the right answer.

## Real-World Example

A healthcare company had six contexts and recurring conflicts between the scheduling team and
the medical records team.

The symptom: every change to records broke scheduling, and the records team responded that
they had not been told about the usage.

The mapping revealed that the two teams believed they were in different relationships.
Scheduling thought it was customer-supplier — that records had an obligation to maintain the
contract. Records thought scheduling was conformist — that it consumed at its own risk.

Neither was wrong about their own understanding. Nobody had declared the pattern.

The conversation that followed was organizational, not technical: records did not have the
capacity to maintain compatibility with every consumer, and scheduling did not have the
weight to demand it.

The decision was an anti-corruption layer on the scheduling side, with the cost accepted
explicitly — about two weeks of construction and maintenance as records evolved.

Over the following eighteen months, records changed the model three times. Scheduling adjusted
the translation each time, within hours, with no production breakage and no conflict between
the teams.

What changed was not the technical dependency — it is still there. It was the pattern having
a name, and the cost having an owner.

## Related Concepts

- [Bounded Context](/04-domain-driven-design/bounded-context.md) — what is mapped.
- [Anti-Corruption Layer](/04-domain-driven-design/anti-corruption-layer.md) — one of the
  patterns, in detail.
- [Strategic DDD](/04-domain-driven-design/strategic-ddd.md) — the synthesis.
- [Integration](/08-integration-architecture/index.md) — the mechanisms.

## Practical Exercise

List the pairs of contexts or systems that integrate in your environment.

For each pair, ask someone on each side: what is one's obligation to the other? If the
answers diverge, you have found a source of recurring conflict that had no name.

## Interview Questions

- Which relationship patterns between contexts do you know?
- Why does the pattern reflect the organization and not only the technology?
- When is "separate ways" the correct answer?

## Further Exploration

- Evans, Eric. *Domain-Driven Design*. Addison-Wesley, 2003 — the strategic design part.
- Vernon, Vaughn. *Implementing Domain-Driven Design*. Addison-Wesley, 2013.
- Skelton, Matthew; Pais, Manuel. *Team Topologies*. IT Revolution, 2019.

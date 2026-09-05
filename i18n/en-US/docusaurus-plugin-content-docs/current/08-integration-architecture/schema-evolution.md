---
id: schema-evolution
title: Schema Evolution
sidebar_position: 14
description: Changing the contract without breaking whoever depends on it — and why versioning is the last option, not the first.
doc_type: concept
level: 5
difficulty: advanced
status: complete
objective: >
  By the end, the reader classifies changes by compatibility and evolves schemas
  without coordinating deployments.
prerequisites: [integration-contracts]
related: [integration-contracts, event-driven-integration, rest]
canonical_for: []
translated_from_version: 2
last_reviewed: 2026-08-31
---

# Schema Evolution

## Overview

Every schema changes. The question is whether the change breaks whoever already depends on it.

The central technique is not versioning — it is making **compatible** changes, so that producer and
consumer can be deployed in any order, with no coordination.

Versioning is what you do when the compatible change is not possible. It is the last resort, and it is
expensive: versions coexist for years.

## Problem

In an integration, producer and consumer are deployed separately and in an unpredictable order. A mobile
client can go months without updating. An event written today may be read three years from now.

That means that, at any instant, different versions of the schema are in circulation — in both
directions.

A change that requires "deploying the producer and the consumer together" is not executable in most real
systems. And trying to execute it is the origin of maintenance windows and coordinated deployments nobody
wants.

## Core Concepts

### The two directions of compatibility

Confusing them is the most common conceptual error in this area.

**Backward.** The **new** code reads **old** data. It is what matters when you update a consumer and it
has to keep processing messages written earlier.

**Forward.** The **old** code reads **new** data. It is what matters when you update the producer first
and the consumers have not changed yet.

```text
              old data      new data
new code      backward         —
old code         —          forward
```

Most real situations require **both**, because the deployment order is not controlled. A schema that only
has backward compatibility forces updating every consumer before the producer.

### The changes, classified

```text
always compatible
  adding an optional field with a default value
  adding a value to an enum the consumer treats as open
  relaxing input validation
  adding an endpoint or an operation

break forward compatibility
  adding a required field
  making a previously optional field required

break backward compatibility
  removing a field
  renaming a field
  changing a type
  tightening validation

break silently — the worst case
  changing a field's meaning while keeping the name and type
  changing the unit, currency, time zone or scale
  changing a boolean's criterion
```

The last category deserves emphasis: no validation detects it. The schema remains valid, the tests pass,
and the data comes to mean something else. A semantic change requires a **new field**, always.

### Ignoring the unknown is a prerequisite

Forward compatibility only works if the consumer ignores fields it does not know.

Consumers that fail on encountering an unknown field make **every** addition a break — and addition is
precisely the change that should be free.

That has to be guaranteed from the first consumer, and verified. Several code generators produce strict
deserialization by default.

### Renaming is removing plus adding

There is no compatible rename. Every rename is a removal — which breaks backward compatibility — plus an
addition.

The compatible path is coexistence:

```text
1. add the new field; the producer fills in both
2. consumers migrate to the new one, one at a time, at their own pace
3. verify that nobody reads the old one
4. stop filling in the old one
5. remove the old one from the schema
```

Five steps, months in duration, and it is the form that does not generate an incident. Teams that jump to
step 5 learn the sequence the hard way.

Step 3 is what requires knowing who consumes it. See
[integration contracts](/08-integration-architecture/integration-contracts.md).

### A schema registry is the gate

A central registry that stores the schemas and **validates compatibility at publication** turns the rule
into automation: an incompatible change is refused before reaching production.

Without it, compatibility depends on discipline and review — which work until the day someone is in a
hurry.

It is the highest-return investment in any system with event-based integration.

### Versioning, when there is no way out

When the change is genuinely incompatible, coexistence remains:

**In the URL** — explicit, easy to route, and the consumer has to change the address.

**In a header** — the address stays, and it is less visible.

**In the content itself** — the schema carries its version; common in events.

The real cost is not the choice between the three. It is that **each live version is code to maintain**,
and removal depends on every consumer migrating — which always takes longer than planned.

The question before versioning: can this be done as a compatible addition? Most of the time it can, with a
little more modeling work.

### A written event is permanent

In an API, old versions die when the clients migrate. In an event log, the old data stays forever.

That means the reading code has to understand every version ever written, indefinitely. See
[event sourcing](/06-distributed-systems/distributed-event-sourcing.md).

The technique that sustains that is the chained converter: each version knows how to convert to the next,
and the reader only knows the latest.

## Mental Model

**Compatible is what allows deploying in any order.** If the change requires coordination, it is
incompatible — regardless of how small it looks.

## When to Use

Compatible evolution is the default. Whenever:

- Producer and consumer are deployed separately.
- There are consumers you do not control.
- The data persists beyond the deployment cycle.
- Coordinating deployments is expensive or impossible.

## When Not to Use

**Versioning before there is a consumer.** While the API is internal and has one consumer, changing
directly is cheaper.

**A semantic change disguised as compatible.** Changing a field's unit passes any validation and breaks
everything.

**Coexistence with no deadline.** An old version with no removal date never goes away.

**Eternal compatibility on principle.** Keeping dead fields for years has a cost; planned removal is part
of the process.

**A schema registry with no compatibility rule configured.** It becomes a catalog, not a gate.

## Alternatives

- **A new field instead of a change** — it solves most cases.
- **Translation at the edge** — a layer converts between versions, isolating the core. See
  [anti-corruption layer](/08-integration-architecture/integration-anti-corruption.md).
- **Dual writing** — a period in which both fields are written.
- **A new endpoint** — instead of versioning the whole API, versioning the operation that changed.

## Trade-offs

| Compatible evolution | Versioning |
|---|---|
| Deployment in any order | Coordination or coexistence |
| Fields accumulate | A clean schema per version |
| No duplicated code | Each version is live code |
| Gradual migration | Explicit migration |
| Limited to what is expressible | Any change |

| Registry with a gate | Human review |
|---|---|
| Incompatible is refused | Depends on attention |
| A uniform rule | Varies by reviewer |
| Infrastructure to operate | None |

## Failure Modes

**A semantic change.** It passes everything and corrupts data.

**A strict consumer.** It fails on encountering an unknown field.

**Premature removal.** Before everyone migrated.

**A zombie version.** Never removed, with one forgotten consumer.

**A required field added.** It breaks the old producer.

**A missing converter.** An old event can no longer be read.

## Common Mistakes

**Confusing backward with forward.**

**Renaming directly.**

**Not checking that the consumer ignores unknown fields.**

**Changing a unit or meaning with no new field.**

**Having no schema registry in event-based integration.**

**Versioning as the first reaction** instead of looking for the compatible form.

## Real-World Example

An insurance company published policy events consumed by six systems.

A field `coverage_amount` was written in currency units. During an expansion to another country, the team
decided to standardize on cents, to avoid rounding.

The change was made keeping the name and the type — integer. The schema remained valid. The schema
registry approved it. Every test passed.

For **nine days**, the six consumers processed values a hundred times smaller. Claims were approved with
wrong limits. Financial reports came out inconsistent. Reconciliation identified the problem, and the fix
involved reprocessing nine days of events and reviewing hundreds of decisions made.

No automated mechanism could have caught that: the change was compatible in structure and incompatible in
meaning.

The process changes:

**A new field for new semantics.** `coverage_amount_cents` was added, both came to be filled in, and the
old one was removed eight months later, when the six consumers had migrated.

**The unit in the field name.** It became a rule: every numeric field with a unit carries the unit in the
name. Ugly, and it solves a whole class of defect.

**Mandatory semantic review.** The schema registry validates structure; meaning changes came to require
approval from a second team, because there is no way to automate it.

**Strict consumer verification.** The audit discovered that two of the six consumers failed on an unknown
field — that is, even a pure addition would have broken them. It was fixed before any other change.

What the team records: the schema registry gave false security. It guarantees the data *fits* the format,
not that it *means* the same thing — and the team had come to trust it as if it guaranteed both.

## Related Concepts

- [Integration Contracts](/08-integration-architecture/integration-contracts.md) — the context.
- [Anti-Corruption Layer](/08-integration-architecture/integration-anti-corruption.md) — translation at
  the edge.
- [Event-Driven Integration](/08-integration-architecture/event-driven-integration.md).
- [Event Sourcing](/06-distributed-systems/distributed-event-sourcing.md).

## Practical Exercise

Take the last schema your team changed and classify the change: backward compatible, forward, both, or
neither?

Then check whether one of your consumers fails on receiving a field it does not know. If it fails, you
have no forward compatibility at all — and every addition is a break.

## Interview Questions

- What is the difference between backward and forward compatibility?
- Why is renaming a field never compatible?
- What kind of change does no schema validation detect?

## Further Reading

- Kleppmann, Martin. *Designing Data-Intensive Applications*. O'Reilly, 2017 — chapter 4.
- Confluent. *Schema Evolution and Compatibility* — documentação do Schema Registry.
- Newman, Sam. *Building Microservices*. 2nd ed. O'Reilly, 2021 — chapter 5.

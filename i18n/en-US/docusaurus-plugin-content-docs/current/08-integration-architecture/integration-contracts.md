---
id: integration-contracts
title: Integration Contracts
sidebar_position: 13
description: What one side promises the other — and why integrations die from the contract, not the protocol.
doc_type: concept
level: 5
difficulty: advanced
status: complete
objective: >
  By the end, the reader defines contracts that let both sides evolve
  without coordinating deployments.
prerequisites: [integration-architecture]
related: [schema-evolution, integration-anti-corruption, rest]
canonical_for: []
translated_from_version: 2
last_reviewed: 2026-08-31
---

# Integration Contracts

## Overview

An integration contract is what one side promises the other: which fields exist, what they mean, what is
required, which errors can happen, and how the promise changes over time.

It exists in every integration. The question is whether it is **declared** or implicit — discovered by
whoever consumes it, reading real responses and guessing.

Integrations die from a broken contract. Rarely from a protocol choice.

## Problem

The common pattern: one service exposes an API, another consumes it. No document says what is
guaranteed.

The consumer observes the behavior and comes to depend on things nobody promised: the order of a list's
items, a field that always came filled in, the format of an identifier, the fact that a certain error
never happens.

On the provider's side, nobody knows that. A change that looks internal — reordering, making a field
optional, changing an id's format — breaks consumers it does not know exist.

The defect appears in production, on the wrong side, and the discussion becomes about who was right.

## Core Concepts

### The contract is larger than the schema

The schema is the easy part and the only one that usually exists. The complete contract has more:

```text
structure       fields, types, required, cardinality
semantics       what each field means, unit, time zone, currency
guarantees      uniqueness, identifier stability, ordering
errors          which codes, what each means, what is retryable
behavior        idempotency, the effect of repeating, rate limits
availability    expected latency, maintenance windows
evolution       how it changes, with how much notice, how long versions coexist
```

The semantics and error lines are the ones most often missing, and the ones that cost most. A field
`amount: 1050` with no declared unit is an integration waiting to go wrong.

### Declaring what is **not** guaranteed

Half a contract's value is in saying what the other side cannot assume.

"The order of the items is not guaranteed." "The identifier is opaque; do not interpret the format." "New
fields can appear; ignore unknown ones."

Without that, the consumer assumes everything it observes. And the undeclared assumption becomes a de
facto contract, because breaking it breaks someone.

### Robustness has a wrong side

The classic principle — be liberal in what you accept, conservative in what you send — has a well-known
side effect.

A liberal provider accepts malformed input, and the consumers come to depend on being accepted that way.
Fixing it later breaks all of them.

The practice that ages better: **strictness on input, tolerance on output**. Reject invalid input from day
one; ignore unknown fields in the response you receive.

### Consumer-driven contracts

The inversion that solves the "I don't know who depends on what" problem.

Instead of the provider publishing a contract and hoping, each consumer declares what it uses — in
executable form. The provider runs those declarations in its own continuous integration.

The effect: the provider knows, before deploying, exactly which consumer breaks. And it can safely remove
what nobody uses.

It is this section's highest-return technique, and the least adopted. It requires the consumers to be
known, which makes it suitable within an organization and unviable for a public API.

### A contract test is not an integration test

An **integration test** starts both sides and verifies the flow. Slow, fragile, and it does not say what
broke.

A **contract test** verifies each side against the contract, in isolation. Fast, and it points at the
exact violation.

Confusing the two leads to slow suites that still let breaks through.

### A public contract cannot be removed

A public API with unknown consumers does not allow removal. What you can do is add, deprecate with a long
notice, and coexist.

That changes the design: public fields and endpoints are a nearly permanent commitment. Exposing less is
the decision that preserves freedom — and it is exactly the opposite of the instinct to "expose
everything, the consumer uses what it wants".

## Mental Model

**The contract is not what you documented — it is what someone already depends on.** Declaring the
contract is what turns accidental dependency into a known commitment.

## When to Use

An explicit contract pays off whenever:

- Two sides are deployed independently.
- Different teams control each side.
- The integration has to survive the departure of whoever wrote it.
- There is more than one consumer.
- The API is public.

## When Not to Use

**Formalizing a contract between modules of the same process, with a single team.** Overhead with no
benefit — there the compiler is already the contract.

**A contract with no change process.** It becomes outdated documentation, which is worse than nothing: it
gives false confidence.

**Versioning everything from day one.** Before there is an external consumer, the freedom to change is
worth more.

**Consumer-driven contracts on a public API.** The consumers are not known.

**A static document as the only contract.** It diverges from the code in the first week; the contract has
to be verifiable.

## Alternatives

- **An executable schema** — a definition from which server and client derive code, eliminating
  divergence between the document and the implementation.
- **A schema registry** — the central contract, with compatibility validated at publication.
- **Consumer-driven contract testing** — within the organization.
- **Explicit versioning** — when coexisting is unavoidable. See
  [schema evolution](/08-integration-architecture/schema-evolution.md).

## Trade-offs

| Declared contract | Implicit |
|---|---|
| Predictable change | Breaks with no warning |
| Known consumers | Unknown |
| A process to maintain | None |
| Independent evolution | Coordination on every change |

| Consumer-driven | Published by the provider |
|---|---|
| Knows who breaks before deploying | Finds out afterwards |
| Removes what nobody uses | Never removes |
| Requires known consumers | Serves a public API |
| Cost in each consumer | Only in the provider |

## Failure Modes

**An undeclared dependency.** The consumer depends on what nobody promised.

**Ambiguous semantics.** An amount with no unit, a date with no time zone, text with no encoding.

**An undocumented error.** The consumer does not know what is retryable.

**A document divergent from the code.** The written contract is not the implemented one.

**A removal breaking an unknown consumer.**

**Robustness becoming a commitment.** The provider accepted invalid input and now cannot stop.

## Common Mistakes

**Treating the schema as the complete contract.** The schema describes the shape, not the meaning: what
happens on an error, whether the operation is idempotent, what order is guaranteed and what is genuinely
optional are left out — and they are where the integration breaks.

**Not declaring what is not guaranteed.** Everything not explicitly denied becomes someone's assumption.
Ordering, uniqueness and delivery deadlines have to be written down, including when the answer is "we do
not guarantee it".

**Not documenting the errors.** The consumer needs to distinguish what is worth retrying from what is
not. Without that, it retries everything or nothing, and both are wrong.

**A contract as a static document.** A contract not verified by tests diverges from the implementation in
weeks, and becomes a description of how the system used to work.

**Exposing more than necessary.** Every published field is a field someone will use and that can no
longer change. The contract's surface is what you commit to maintaining.

**Not knowing who consumes it.** With no list of consumers, there is no way to assess impact or notify
about deprecation, and every change becomes a bet.

## Real-World Example

A payments platform exposed a transaction lookup API, consumed by seven internal systems and two external
partners.

The contract was a document written once, two years earlier.

Four incidents over eighteen months, all with the same root.

**The list's order.** The response returned the transactions ordered by date, because the query used an
index that produced that order. The contract promised nothing. An optimization changed the execution plan
and the order changed. One consumer displayed the first transaction as "the most recent" — it came to
display any of them.

**The identifier's format.** The ids started with `tx_`. A partner validated that prefix. The migration to
random identifiers broke their integration, in production, on a Saturday.

**A field made optional.** A description field always came filled in. It became optional for a new
transaction type. Three consumers broke — none handled its absence.

**A new error.** An error code came into existence for a transaction under review. Consumers that only
handled the documented errors classified it as a permanent failure and gave up on transactions that would
have succeeded.

The fixes, in order of return:

**An executable contract** derived from the code, published on each deployment. The static document ceased
to exist.

**Explicit declaration of what is not guaranteed** — ordering, id format, presence of optional fields.
That was discussed with each known consumer, and two undue dependencies were discovered in the
conversation, before they broke.

**Consumer-driven contract tests** for the seven internal systems. The provider came to know, in
continuous integration, who broke. Over the following eight months, four changes were blocked there.

**An error catalog** with a retryable-or-not classification, per code.

The two external partners remained without contract tests — there is no way to execute them on their side.
For them, the process became a ninety-day notice and version coexistence.

The point the team underlines: the four incidents were, technically, valid changes. The contract promised
nothing that was broken. And that helped nobody — what is not declared as "not guaranteed" is assumed to
be guaranteed.

## Related Concepts

- [Schema Evolution](/08-integration-architecture/schema-evolution.md) — how the contract changes.
- [Anti-Corruption Layer](/08-integration-architecture/integration-anti-corruption.md) — protection
  against someone else's contract.
- [REST](/08-integration-architecture/rest.md), [GraphQL](/08-integration-architecture/graphql.md),
  [gRPC](/08-integration-architecture/grpc.md) — where the contract lives.
- [Data Ownership](/07-data-architecture/data-ownership.md).

## Practical Exercise

Take an API your team exposes. List what it does **not** guarantee — ordering, identifier format,
presence of optional fields, error stability.

Then ask a consumer which of those things it assumes. The difference between the two lists is your next
break.

## Interview Questions

- What does a contract have to say beyond the schema?
- Why is declaring what is not guaranteed half the value?
- What is the difference between a contract test and an integration test?

## Further Reading

- Robinson, Ian. *Consumer-Driven Contracts: A Service Evolution Pattern*.
  martinfowler.com, 2006.
- Newman, Sam. *Building Microservices*. 2nd ed. O'Reilly, 2021 — chapter 5.
- Hohpe, Gregor; Woolf, Bobby. *Enterprise Integration Patterns*. Addison-Wesley, 2003.

---
id: aggregate
title: Aggregate
sidebar_position: 13
description: The unit of transactional consistency — and why large aggregates are tactical DDD's most common mistake.
doc_type: pattern
level: 2
difficulty: advanced
status: complete
objective: >
  By the end, the reader designs aggregates from the invariants that must hold within
  the same transaction, and recognizes the cost of large aggregates.
prerequisites: [entity, value-object]
related: [entity, domain-event, repository]
canonical_for: [aggregate, aggregate root]
translated_from_version: 3
last_reviewed: 2026-08-31
---

# Aggregate

## Overview

An aggregate is a set of objects treated as a unit for consistency purposes. It has a
**root** — an entity — which is the only point of access from outside.

The rule that defines it: **everything inside the aggregate is consistent at the end of
each transaction.** Between aggregates, consistency is eventual.

That makes aggregate design DDD's most consequential tactical decision.

## Problem

Without a defined unit of consistency, two pathologies appear.

**Uncontrolled modification.** Any code can alter any object, and the invariants that
depend on more than one object are left with no guardian. "The order total is the sum of
the items" is violated the moment someone changes an item without recalculating.

**Transactions that are too large.** With no boundary, the temptation is to load and save
everything together, which produces long locks and concurrency conflicts.

The aggregate solves both by declaring: **these things change together and are consistent
together; those do not.**

## Core Concepts

### The root is the only access

Objects inside the aggregate are not referenced from outside. Whoever needs to change an
order item calls the order:

```text
❌  item = repository.findItem(id); item.changeQuantity(5)
✅  order.changeItemQuantity(itemId, 5)
```

The second form lets the order validate the invariant — item limit, minimum value,
availability — before accepting.

If internal objects are reachable from outside, the aggregate protects nothing.

### Reference other aggregates by identity

The rule that most reduces aggregate size:

```text
❌  class Order { Customer customer; }
✅  class Order { CustomerId customerId; }
```

Holding the whole object invites loading it, modifying it, and extending the transaction to
it. Holding the identifier declares the boundary.

### Small aggregates

Tactical DDD's most common mistake is the large aggregate — a `Customer` containing orders,
which contain items, which contain history.

The costs appear together: loading requires fetching everything; saving locks everything;
two users changing different parts conflict; and memory grows with the history.

The criterion for including something in the aggregate is single: **is there an invariant
that can only be guaranteed if these objects change in the same transaction?**

If the answer is no, they are separate aggregates. And the answer is no far more often than
intuition suggests.

### One transaction, one aggregate

Vernon's practical rule: **modify one aggregate per transaction.**

When an operation has to change two, that is a sign the boundaries are wrong — or that
consistency between them is eventual, and the coordination should be through a
[domain event](/04-domain-driven-design/domain-event.md) or a
[saga](/06-distributed-systems/sagas.md).

### Concurrency

Since the aggregate is the unit of consistency, it is also the unit of concurrency control.
Optimistic locking with a version number on the root is the usual implementation — and it
is what prevents two simultaneous changes from violating the invariant.

## When to Use

- There is an invariant involving more than one object.
- The invariant has to hold at the end of every transaction.
- There is a natural entry point in the domain — the order, the policy, the account.
- The set is small enough to load and save together.

## When Not to Use

**When there is no invariant between the objects.** If they merely relate to each other,
they are separate aggregates referencing each other by identity.

**When consistency can be eventual.** Stock and order do not need to be consistent within
the same transaction in most businesses — and assuming they do produces the large
aggregate.

**In supporting or generic subdomains**, where the cost of discovering and modelling the
invariant does not pay off against plain CRUD — there is no rule to protect, only data to
store. See [tactical DDD](/04-domain-driven-design/tactical-ddd.md).

**When the set is large or grows without bound.** An aggregate with a collection that grows
indefinitely — history, logs, messages — is unworkable.

**When the concurrency cost is too high.** If many users change different parts of the same
aggregate, the lock becomes a bottleneck. There, smaller aggregates win.

## Alternatives

- **Smaller aggregates with eventual consistency** — the most frequent answer.
- **A domain service** — when the rule involves several aggregates. See
  [domain service](/04-domain-driven-design/domain-service.md).
- **A [saga](/06-distributed-systems/sagas.md)** — when the coordination crosses
  transactional boundaries.
- **A model with no aggregates** — legitimate outside the core.

## Trade-offs

| Large aggregate | Small aggregates |
|---|---|
| Broad invariants guaranteed | Only the local ones |
| One transaction settles it | Coordination between them |
| Heavy loading and saving | Light |
| Frequent concurrency conflicts | Rare |
| Strong consistency across the set | Eventual between aggregates |
| A simpler model to reason about | Requires thinking about consistency |

The fifth row is the real decision, and it belongs to the business: **how much time of
inconsistency between these two concepts is acceptable?**

## Failure Modes

**Large aggregate.** Slow loading, long locks, frequent conflicts.

**Unbounded collection.** An aggregate with history grows until it does not fit in memory.

**Direct access to an internal object.** The invariant stops being protected.

**Two modifications per transaction.** A wrong boundary, or unrecognized eventual
consistency.

**Invented invariant.** A rule nobody in the business confirmed, used to justify grouping
objects.

## Common Mistakes

**Modelling from database relations.** A foreign key is not an invariant.

**Including everything that conceptually "belongs".** Belonging is not the criterion; the
transactional invariant is.

**Holding objects from other aggregates instead of identifiers.**

**Not bounding collections.**

**Assuming strong consistency without asking the business.**

## Real-World Example

An e-commerce system modelled `Customer` as the root, containing `Orders`, `Addresses`,
`PurchaseHistory` and `Preferences`.

Loading an order to change an item's quantity brought the customer's entire purchase
history — in long-standing customers, thousands of records.

Beyond the cost, there was conflict: since the unit of concurrency control is the root, two
operators changing **different orders** of the same customer collided on `Customer`'s
optimistic lock — nothing in the business tied one order to the other, but the model did.

The remodelling applied the invariant criterion.

*Is there a rule requiring the order and the customer's history to change within the same
transaction?* No.

*And the order and its items?* Yes — the order total is the sum of the items, and the item
limit per order has to hold at all times.

Result: `Order` with its `Items` and a `CustomerId`. `Customer` as a separate aggregate.
`PurchaseHistory` as a [read projection](/03-design-patterns/cqrs.md), not part of any
aggregate.

Order load time dropped from 800 ms to 15 ms, and the conflicts **between orders of the same
customer** disappeared. Two operators on the same order still collide, and they should: there
the collision is real.

The interesting case came afterwards: the business asked for "a customer with more than
three open orders cannot place a fourth". That looks like it requires consistency across
orders.

The conversation with the business revealed that a window of seconds was acceptable — if a
fourth order occasionally slipped through, it would be blocked at the approval stage. The
rule became a [domain service](/04-domain-driven-design/domain-service.md) — it decides about
the business and would exist without software, so it does not belong in the layer that only
orchestrates — consulted with eventual consistency.

Without that conversation, the rule would have justified a `Customer` aggregate containing
every open order — and the problem would have come back.

## Related Concepts

- [Entity](/04-domain-driven-design/entity.md) — the root is one.
- [Value Object](/04-domain-driven-design/value-object.md) — what composes the aggregate.
- [Domain Event](/04-domain-driven-design/domain-event.md) — the coordination between
  aggregates.
- [Repository](/04-domain-driven-design/repository.md) — one per aggregate.

## Practical Exercise

Pick an aggregate in your system and list the invariants it guarantees — the rules that
have to hold at the end of every transaction.

For each object inside it, check: does it participate in any of those invariants? The ones
that do not are candidates for separate aggregates.

## Interview Questions

- What is the criterion for including an object in an aggregate?
- Why reference other aggregates by identity?
- What does "one aggregate per transaction" mean and what do you do when you cannot?

## Further Exploration

- Evans, Eric. *Domain-Driven Design*. Addison-Wesley, 2003.
- Vernon, Vaughn. *Effective Aggregate Design*, 2011 — the three-article series, with the
  most detailed treatment of the rules on size and on references between aggregates.

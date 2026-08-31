---
id: interfaces
title: Interfaces
sidebar_position: 6
description: The contract between parts — who should define it and why width matters.
doc_type: concept
level: 2
difficulty: intermediate
status: complete
objective: >
  By the end, the reader designs interfaces from what the consumer needs, and
  recognizes when an interface is buying nothing.
prerequisites: [encapsulation]
related: [dependency-inversion, boundaries, solid]
canonical_for: [interface, interface contract]
translated_from_version: 1
last_reviewed: 2026-08-30
---

# Interfaces

## Overview

An interface is the contract between two parts: what one promises to offer and the
other may assume.

The most consequential decision about an interface is not which methods it has. It
is **who defines it** — and the correct answer, almost always, is the consumer.

## Problem

Interfaces are usually extracted from the implementation. Someone writes
`PostgresRepository`, selects the public methods and generates `OrderRepository`
with the same list.

The result has the shape of an abstraction and is not one. The interface reflects
what the implementation does, including what it does because of the technology.
Replacing the implementation still requires changing consumers, because the
interface already carries the original implementation's decisions.

The second problem is width. Interfaces extracted this way tend to have every
method the implementation has, and each consumer comes to depend on operations it
does not use. It is the symptom the **I** in [SOLID](/02-software-design/solid.md)
names.

## Core Concepts

### The consumer defines the interface

The interface belongs to whoever uses it, not to whoever implements it.

That is more than a question of file organization — although it is that too, and
where the interface lives determines the direction of the dependency (see
[dependency inversion](/02-software-design/dependency-inversion.md)).

It is about **shape**. An interface defined by the consumer expresses what the
consumer needs, in the consumer's vocabulary. One extracted from the implementation
expresses what the technology offers.

```text
extracted from implementation    defined by the consumer
─────────────────────────────    ───────────────────────
findByIdAndStatusIn(...)         pendingOrdersFor(customer)
executeQuery(sql)                totalBilledInMonth(month)
```

### Interfaces should be narrow

An interface with one method is easier to implement, to substitute in a test and to
reason about. One with fifteen couples the implementer to everything and the
consumer to what it does not use.

Different consumers with different needs deserve different interfaces, even when
the same class implements both.

### Interface width versus module depth

Ousterhout formulates the relationship that matters: a good module is **deep** —
narrow interface, substantial implementation. A shallow module has a wide interface
and a thin implementation, and for that reason does not pay for the cost of
existing.

The practical measure: how much does the consumer get to not know by using this? If
the answer is "almost nothing", the interface is shallow.

### The contract includes behaviour

An interface is not just the signature. It is also what happens on error, what is
guaranteed about ordering, whether the operation is idempotent, and what holds when
there is no result.

Two implementations with the same signature and different semantics are not
substitutable — which is the Liskov violation, applied to interfaces.

## Mental Model

**A well-designed interface lets the consumer forget the other side.** Every thing
the consumer needs to know about the implementation is a failure of the contract.

## When to Use

- When there is more than one real implementation.
- When the dependency has to be substituted in order to test.
- When the interface crosses a boundary you want to keep — of module, of team, of
  system.
- When consumer and implementer evolve at different rates.

## When Not to Use

**When there is one implementation and there will not be another.** See
[abstraction](/01-fundamentals/abstraction.md). An interface of one is one more
file.

**When the interface is extracted from the implementation without rethinking the
shape.** It will not buy substitutability, and it adds indirection.

**When the dependency is trivially replaceable another way.** Languages with
structural typing or first-class functions frequently solve this without a declared
interface.

**When the cost is indirection with no reduction in knowledge.** If the consumer
still needs to know everything about the other side, the interface is decorative.

## Alternatives

- **A function as a parameter** — when what varies is a simple behaviour.
- **Structural typing** — in languages that offer it, no explicit declaration is
  needed.
- **An adapter at the boundary** — translate on the way in rather than abstracting
  in the middle.
- **Use the concrete type** — when there is no second implementation and no need
  for isolated testing.

## Trade-offs

| Narrow interface | Wide interface |
|---|---|
| Easy to implement and substitute | One place for everything |
| Consumer depends only on what it uses | Consumer depends on everything |
| More types to maintain | Fewer types |
| May require several per implementation | One serves everyone |

| Defined by the consumer | Extracted from the implementation |
|---|---|
| Domain vocabulary | Technology vocabulary |
| Real substitution is possible | Substitution stays expensive |
| Requires designing, not just extracting | Cheap to create |

## Failure Modes

**Mirror interface.** Identical to the implementation, including what is specific
to the technology.

**Wide interface.** Implementers with methods that throw `UnsupportedOperation`.

**Ambiguous contract.** Two implementations differing in error or empty-result
behaviour, and the consumer breaks on swapping.

**Type leak.** The interface exposes the underlying library's types in the
signature, tying the consumer to it.

## Common Mistakes

**Extracting instead of designing.** The structural mistake.

**Putting the interface next to the implementer.** It nullifies dependency
inversion.

**One interface per class, out of habit.** It produces interfaces of one.

**Documenting only the signature.** Error behaviour is part of the contract.

**Widening the interface to accommodate a new consumer.** Each consumer with a
distinct need deserves its own.

## Real-World Example

A service defined `NotificationProvider` with `send(Message)`, extracted from the
email client that already existed. `Message` had `subject`, `body` and `recipient`.

When push was added, `Message` gained `title`, `payload` and `action` — all null for
email. Then SMS: `body` limited to 160 characters, `subject` ignored.

In the end, a class with seven fields, of which each implementation used three, and
no validation possible because the valid fields depended on the provider.

The reformulation started from the consumer. What does the business code need? To
notify a user about an event. It does not need to know the channel.

```text
UserNotifier
  notify(user, event)
```

Channel selection, formatting and each provider's restrictions moved inside. Each
provider got its own message type, not a shared one.

The business code lost seven fields of knowledge about notification channels —
which is exactly what the original interface should have hidden and did not.

## Interfaces evolve, and that has to be designed

An internal interface can be refactored in one commit. A published interface —
consumed by another module with its own release, another team, or another system —
cannot.

Three techniques, in order of cost:

**Adding is safe; removing and changing are not.** Adding a method or an optional
field breaks neither existing implementers nor consumers. Changing a signature or
removing a method breaks both.

**Methods with a default implementation.** In languages that offer them, they allow
extending an interface without breaking implementers. Useful and frequently
forgotten.

**Version the interface, not the methods.** When the change is incompatible, a
second interface coexists with the first, and the old one is marked deprecated with
a deadline. That is cheaper than accumulating parameters and branches in the same
one.

The decision that precedes all three: **declare which interfaces are public.** An
interface that was never declared public ends up treated as stable by someone, and
the first change breaks a consumer nobody knew existed.

## Related Concepts

- [Encapsulation](/02-software-design/encapsulation.md) — what the interface
  exposes.
- [Dependency Inversion](/02-software-design/dependency-inversion.md) — where the
  interface lives.
- [SOLID](/02-software-design/solid.md) — the I and D principles.
- [Abstraction](/01-fundamentals/abstraction.md) — when it is worth it.

## Practical Exercise

List your system's interfaces and, for each, check: was it designed or extracted?
Do the method names use domain or technology vocabulary?

For the extracted ones, write how it would look had the consumer defined it. The
difference shows how much knowledge of the implementation is leaking.

## Interview Questions

- Who should define an interface, and why?
- Why are narrow interfaces preferable?
- What is part of the contract beyond the signature?

## Further Exploration

- Ousterhout, John. *A Philosophy of Software Design*. Yaknyam Press, 2018 — deep
  versus shallow modules.
- Martin, Robert C. *Clean Architecture*. Prentice Hall, 2017 — the interface
  segregation principle.
- Evans, Eric. *Domain-Driven Design*. Addison-Wesley, 2003 — interfaces in the
  domain's vocabulary.

---
id: visitor
title: Visitor
sidebar_position: 22
description: Separating operations from the structure they traverse — powerful, rigid, and almost always the wrong choice.
doc_type: pattern
level: 2
difficulty: advanced
status: complete
objective: >
  By the end, the reader recognizes the axis of variation Visitor favours and why its
  ceremony only pays off under narrow conditions.
prerequisites: [composite]
related: [composite, iterator, strategy]
canonical_for: [visitor, double dispatch]
translated_from_version: 2
last_reviewed: 2026-08-31
---

# Visitor

## Overview

Visitor separates an algorithm from the object structure it operates on, allowing new
operations to be added without altering the structure's classes.

It is the pattern with the most ceremony in the catalogue: it requires an `accept` method
on every type in the hierarchy, a visitor interface with one operation per type, and the
double dispatch almost nobody reads without stopping to think. That ceremony is what makes
it the case where the question "do I really need this?" pays off most. The reason lies in a
single axis, and understanding it settles almost every decision about the pattern.

## Problem

An object structure with several node types needs several different operations.

A syntax tree with numbers, operators and variables has to be evaluated, printed,
optimized, type-checked and serialized.

Putting each operation on the nodes works — but each new operation touches every node
class, and the classes accumulate unrelated responsibilities.

Visitor inverts that: each operation becomes an object that knows how to handle every
node type.

## Core Concepts

### The expression problem

The formulation that settles everything. There are two axes of growth:

**New types** — more node types in the structure.
**New operations** — more things to do with the structure.

Among the usual organizations of object-oriented code, none makes both cheap at the same
time — it is the expression problem, stated by Wadler in 1998. There are encodings that buy
both directions (*object algebras*, *tagless final*), at the cost of even more ceremony and
of features not every language offers.

| | Method on the node | Visitor |
|---|---|---|
| Adding a node type | Cheap — one class | **Expensive** — touches every visitor |
| Adding an operation | **Expensive** — touches every node | Cheap — one class |

Visitor favours operations and penalizes types. Applying it to a structure whose types
grow is choosing the wrong side of the dilemma — and it is the most common mistake with
this pattern.

### Double dispatch

The mechanism. In languages with single dispatch, the method called depends on one
type. Visitor needs two: the node's type and the operation's type.

```text
node.accept(visitor)              ← dispatches on the node's type
  visitor.visitNumber(this)       ← dispatches on the visitor's type
```

The `accept` on each node exists only for that. It is mandatory ceremony, and what
makes the pattern verbose.

In languages with pattern matching over algebraic types, the same thing is written with
no hierarchy and no `accept` — which explains why Visitor is rare in functional code.

### The readability cost

An operation distributed across `visitNumber`, `visitOperator`, `visitVariable` is
cohesive as a class and fragmented as reading: understanding what it does requires
reading every method and mentally reconstructing the traversal.

## When to Use

- The type structure is **stable** and the operations grow.
- The operations are complex and do not conceptually belong to the nodes.
- An operation needs to accumulate state while traversing the structure.
- Operations have to be applied to a hierarchy you do not control.

## When Not to Use

**When new types appear frequently.** The wrong side of the dilemma. Each type touches
every visitor.

**When there is only one operation.** All the ceremony with none of the benefit.

**When the language has pattern matching.** A function with `match` over the types does
the same with a fraction of the code.

**When the operation belongs to the node.** If `evaluate` is what the node is, it should
know how to evaluate itself.

**When readability matters more than extensibility.** Visitor fragments the reading of
each operation, and in frequently read code that weighs.

## Alternatives

- **Pattern matching** — in languages that offer it, it is superior in almost every
  respect.
- **A method on the node** — when the operations are few and stable.
- **[Iterator](/03-design-patterns/iterator.md) with a type conditional** — less
  elegant, far more readable, and appropriate when there are few types.
- **A dispatch table** — a map from type to function, with no visitor hierarchy.

## Trade-offs

| Visitor | Method on the node |
|---|---|
| A new operation is one class | Touches every node |
| A new type touches every visitor | Is one class |
| Operation cohesive in one class | Distributed across nodes |
| Reading fragmented by type | Each node readable in isolation |
| `accept` mandatory on each node | No ceremony |
| Accumulates state during traversal | State has to be passed |

## Failure Modes

**A new type forgotten in a visitor.** It depends on the visitor's form: with an **abstract
interface**, adding a type breaks the compilation of every one of them — expensive, and it is
the cost the table above charges. With a **base class providing default implementations**, or
in a dynamic language, nothing breaks: the new type falls into the default and the behaviour
is wrong in silence.

**Visitor with shared state.** Reusing the instance across traversals produces
contamination.

**Hierarchy of visitors.** A base visitor with default behaviour and subclasses that
override: it combines Visitor's costs with inheritance's.

**Implicit traversal order.** Who controls the traversal — the node or the visitor — is
not obvious, and changing it breaks visitors that depended on the order.

## Common Mistakes

**Applying it to a structure with unstable types.** The central mistake.

**Using it in a language with pattern matching.**

**Putting in the visitor what belongs to the node.**

**Not handling the unknown type case.** A visitor that does not cover a type should fail
explicitly, not ignore it.

## Where it appears in practice

**Compilers and interpreters.** The canonical case and the one that best satisfies the
condition: a language's grammar is stable for years, and the operations — type checking,
optimization, code generation, formatting — grow.

**Static analysis tools.** Each rule is a visitor over the syntax tree. New rules are
frequent; node types are not.

**Serialization of complex structures.** One visitor per format.

**Traversal of structured documents.** Transformations over document trees.

All four share the same characteristic, and it is the pattern's test: **the structure
was defined by an external specification** — a grammar, a format, a standard — and so it
does not change at the pace of the code. When the structure is yours and evolves with
the domain, the condition does not hold.

## Real-World Example

A business rules system represented conditions as a tree: comparisons, conjunctions,
disjunctions, negations, field references.

Five node types, defined by the rules language's grammar — stable from the start.

The operations grew: evaluate, render for human reading, convert to SQL, estimate cost,
extract referenced fields, validate.

Six visitors, each in a class. Adding an operation never touched the nodes.

The counterexample, in the same system: someone applied Visitor to the domain's document
hierarchy — contract, policy, endorsement, claim. That hierarchy grew: in two years it
gained five new types.

Each new type touched the four existing visitors. On two occasions a type was added and
a visitor was not updated — and the defect got through because nothing enforced
exhaustiveness.

It was reverted to methods on the documents themselves.

The same team, the same pattern, two opposite outcomes. The difference was which axis
grew.

## Related Concepts

- [Composite](/03-design-patterns/composite.md) — the structure Visitor usually operates
  on.
- [Iterator](/03-design-patterns/iterator.md) — traversal with no type distinction.
- [Strategy](/03-design-patterns/strategy.md) — algorithm variation with no structure.

## Practical Exercise

Pick a type hierarchy in your system and answer from the history: how many new types
were added in the last year? How many new operations?

If types > operations, Visitor is the wrong pattern there. If operations > types and the
structure comes from an external specification, it may be worth it.

## Interview Questions

- What is the expression problem and which side does Visitor choose?
- Why does Visitor need double dispatch?
- In what kind of language does it stop being necessary?

## Further Exploration

- Gamma, Erich et al. *Design Patterns*. Addison-Wesley, 1994.
- Wadler, Philip. *The Expression Problem*, 1998.

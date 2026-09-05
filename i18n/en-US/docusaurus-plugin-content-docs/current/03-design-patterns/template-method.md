---
id: template-method
title: Template Method
sidebar_position: 21
description: The base class defines the skeleton and the subclass fills the gaps — inheritance where composition is usually better.
doc_type: pattern
level: 2
difficulty: beginner
status: complete
objective: >
  By the end, the reader recognizes when Template Method is appropriate and why
  Strategy is usually preferable.
prerequisites: [design-patterns]
related: [strategy, factory-method, composition-vs-inheritance]
canonical_for: [template method]
translated_from_version: 2
last_reviewed: 2026-08-31
---

# Template Method

## Overview

Template Method defines the skeleton of an algorithm in a base class, leaving
specific steps to the subclasses.

The pattern's mechanism is implementation inheritance, and so it carries inheritance's
costs in full: coupling to the base, a hierarchy that is hard to recombine, and the
subclass that has to know what the base does in order to override correctly. That is what
makes [Strategy](/03-design-patterns/strategy.md) the mandatory comparison.

## Problem

Several processes share the same structure and differ in a few steps.

Importing data: open the source, validate the format, transform, write, close. The
sequence is always the same; validating and transforming depend on the format.

Without the pattern, each importer repeats the whole sequence. When the sequence
changes — adding an audit record between transform and write — all of them have to
change, and someone forgets.

## Core Concepts

### The structure

```text
base class:
  process():                      ← template, final
    open()
    validate()                    ← abstract
    transform()                   ← abstract
    write()
    close()
```

The template method is `final`: the subclass should not alter the sequence, only fill
in the gaps. Allowing the template to be overridden destroys the guarantee the
pattern offers.

### Inversion of control

The base class calls the subclass, not the other way round. It is the *Hollywood
principle*: "don't call us, we'll call you".

That is the basis of how frameworks work, and it is why the pattern appears so much in
framework code and so little in application code.

### Hooks versus abstract operations

**Abstract operation** — the subclass is required to implement it.
**Hook** — has an empty or trivial default implementation; the subclass may override.

Hooks give flexibility and create a problem: whoever reads the subclass does not know
which exist without reading the base. The more hooks, the less predictable the
behaviour.

### The cost of inheritance

Template Method inherits all the costs of
[implementation inheritance](/02-software-design/composition-vs-inheritance.md): one
axis of variation, coupling to the base's implementation, and the fragile base class
problem — changing the base breaks subclasses nobody touched.

Strategy solves the same problem by composition, without those costs.

## When to Use

- The sequence is genuinely fixed and must be guaranteed.
- There is a single axis of variation.
- The hierarchy is shallow and the set of variants is closed.
- You are writing a framework in which the user extends the base.

## When Not to Use

**When there is more than one axis of variation.** Combinatorial explosion. Compose.

**When the steps vary independently.** If validating and transforming vary with no
correlation, they are two strategies, not one subclass.

**When the variant has to change at runtime.** Inheritance is fixed at compile time.

**When there are many hooks.** A base with ten hooks is an implicit contract nobody
can retain.

**When both sides of the hierarchy belong to the same team and no variant needs to be
fixed at compile time.** Then the inherited base only adds coupling: passing the steps as
arguments gives the same skeleton without tying down the hierarchy.

## Alternatives

- **[Strategy](/03-design-patterns/strategy.md)** — composition in place of
  inheritance. The main alternative.
- **Functions passed as parameters** — `process(validate, transform)`.
- **A template method that receives the steps** — with no hierarchy, the skeleton
  becomes a function that accepts the variations.

## Trade-offs

| Template Method | Strategy |
|---|---|
| Skeleton in the inherited base | Skeleton in the composing function |
| Less code in the subclass | More wiring |
| One axis of variation | Combinable axes |
| Fixed at compile time | Swappable at runtime |
| Coupled to the base's implementation | Coupled only to the interface |
| Hooks create an implicit contract | Explicit interface |

## Failure Modes

**Fragile base.** A change in the base breaks untouched subclasses.

**Overridden template.** The subclass alters the sequence and the guarantee is lost.

**Too many hooks.** An unreadable implicit contract.

**Deep hierarchy.** Finding where a behaviour comes from requires walking several
levels.

**A step that needs data the base does not pass.** The subclass resorts to shared
state, and the coupling gets worse.

## Common Mistakes

**Not making the template final.**

**Using it where Strategy serves better.** The most common mistake in application
code.

**Accumulating hooks.**

**Sharing mutable state between base and subclass.** It makes execution order a hidden
dependency.

## Where it appears in practice

**Test frameworks.** The lifecycle — set up, execute, assert, tear down — is a
template; your methods fill the gaps.

**Servlets and controllers.** The base class handles the protocol; you implement the
request handling.

**Abstract collection classes.** `AbstractList` implements almost everything from two
operations the subclass supplies.

**Batch processing steps.** Processing frameworks define the cycle and you fill in
reading, processing and writing.

All four are framework code. That is where the pattern belongs: when **the base is a
library and the subclass is the user's code**, the inversion of control is exactly
what you want. In application code, where both sides are yours, Strategy usually
wins.

## Real-World Example

An import system had `BaseImporter` with seven steps and eleven subclasses, one per
file format.

It worked for two years. The problem appeared when the destination started varying:
the same format could go to the main database, to a data warehouse or to a queue. The
hierarchy would have had 33 classes.

The migration to composition was partial and deliberate. The skeleton became a
function that receives a reader and a writer:

```text
import(reader, writer)
  open · validate · transform · write · close
```

Eleven readers, three writers. The sequence stayed guaranteed — it is in the function,
not in an inherited base.

The detail worth keeping: the pattern was not wrong while there was one axis. It
stopped serving when the second appeared, which is exactly the limitation stated in
"when not to use" — and the same one that brought down
[Factory Method](/03-design-patterns/factory-method.md) in an analogous case.

## How to convert to Strategy

The conversion is mechanical when the pattern stops serving, and the steps are worth
knowing.

**One.** Identify the abstract operations — the gaps the subclasses fill. Each set that
varies together is a strategy.

**Two.** Turn each set into an interface. If it is a single operation, a function is
enough.

**Three.** Convert the template method into a function or class that receives the
strategies as parameters. The sequence remains; what changes is where the steps come
from.

**Four.** Each old subclass becomes a combination of strategies, assembled where the
object was instantiated.

```text
before:  CSVImporter extends BaseImporter
after:   import(csvReader, databaseWriter)
```

**Five.** Hooks with default implementations become optional parameters with default
values.

The step that usually stalls is the fourth: if the subclasses shared state with the
base through protected fields, that state has to become an explicit parameter. It is
laborious and it is precisely the coupling the conversion eliminates — the shared state
was a hidden dependency between base and subclass.

## Related Concepts

- [Strategy](/03-design-patterns/strategy.md) — the composition alternative.
- [Factory Method](/03-design-patterns/factory-method.md) — frequently used inside a
  template.
- [Composition vs. Inheritance](/02-software-design/composition-vs-inheritance.md).

## Practical Exercise

Look for abstract classes in your system with a non-overridable public method that
calls abstract methods.

For each, count the axes of variation and the hooks. More than one axis, or many
hooks, indicates that composition would serve better.

## Interview Questions

- Why should the template method be final?
- What is the difference between a hook and an abstract operation?
- When is Strategy preferable to Template Method?

## Further Exploration

- Gamma, Erich et al. *Design Patterns*. Addison-Wesley, 1994.
- Bloch, Joshua. *Effective Java*. 3rd ed., 2018 — on designing for inheritance.

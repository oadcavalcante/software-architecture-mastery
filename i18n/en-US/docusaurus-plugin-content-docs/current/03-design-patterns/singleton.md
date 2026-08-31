---
id: singleton
title: Singleton
sidebar_position: 5
description: One global instance with global access — the most applied pattern and the most frequently wrong.
doc_type: pattern
level: 2
difficulty: beginner
status: complete
objective: >
  By the end, the reader recognizes that Singleton couples two independent
  decisions and knows which of them they actually need.
prerequisites: [design-patterns]
related: [factory-method, facade, dependency-inversion]
canonical_for: [singleton]
translated_from_version: 1
last_reviewed: 2026-08-31
---

# Singleton

## Overview

Singleton ensures a class has a single instance and provides a global point of
access to it.

That sentence contains **two independent promises**, and it is joining them that
makes the pattern problematic. Almost always you need one, not both.

## Problem

The stated problem: some resources should exist only once — a connection pool, a
configuration registry, a cache.

That is legitimate. What the pattern does wrong is solving uniqueness **and**
global access with the same mechanism.

Uniqueness is a lifecycle decision. Global access is a visibility decision. When
`Configuration.getInstance()` is scattered across three hundred places, you do not
have a single instance — you have a hidden dependency in three hundred places, which
no signature declares.

The consequences are well known and all derive from the global access, not from the
uniqueness:

**Invisible dependency.** A method's signature does not reveal that it depends on
configuration. Reading the code is not enough to know what it needs.

**Coupled tests.** Replacing the instance requires a global mechanism, and tests
come to interfere with each other through execution order.

**Shared state.** A mutable singleton is a global variable with apparent
encapsulation, with all the concurrency problems that implies.

## Core Concepts

### Separate the two decisions

**If you need only one instance** — configure that where the object is created. A
dependency injection container does exactly that: application scope, one instance,
injected into whoever needs it.

**If you need convenient access** — pass the dependency. A signature declaring
`(Configuration config)` is honest about what the method needs.

Combining a single instance with explicit injection delivers everything Singleton
promises, with none of the costs.

### A stateless singleton is less bad

An immutable, stateless object accessed globally does less damage — there is no race
condition and no interference between tests.

There is still a hidden dependency, which is the structural cost. But the operational
risk drops sharply.

### The legitimate case

It exists: infrastructure entry points that the environment already treats as global
— logging, metrics, the system clock.

Even there, the testable form is a global facade over an injectable instance.

## When to Use

- Resources the environment already treats as global — logging, metrics — and whose
  explicit passing throughout the codebase would be disproportionate noise.
- Immutable, stateless objects.
- When the language or framework imposes the mechanism.

## When Not to Use

**When you only need one instance.** Use dependency injection scope. It is the
answer in the overwhelming majority of cases.

**For anything with mutable state.** It is a global variable.

**For database access, HTTP clients, repositories.** They are business dependencies
and should be declared in the signature.

**When tests need to substitute it.** If substituting requires a global mechanism,
the test became coupled to execution order.

**For configuration.** It is the most common application and one of the worst: it
spreads a hidden dependency across the whole system.

## Alternatives

- **Dependency injection with application scope** — uniqueness without global
  access. The main alternative.
- **An explicit parameter** — pass the object.
- **A context object** — group what crosses many layers.
- **A module with encapsulated state** — in languages with first-class modules, it
  solves this without a class.

## Trade-offs

| Singleton | Injection with single scope |
|---|---|
| Access from anywhere | Has to be received |
| No wiring | Explicit wiring |
| Invisible dependency | Declared dependency |
| Tests need a global mechanism | Substitution trivial |
| Risk of shared state | Controlled scope |
| One instance guaranteed | One instance configured |

The only column where Singleton wins is convenience. It is little, and it is what
explains its popularity.

## Failure Modes

**Shared state under concurrency.** Race conditions in code that looks isolated.

**Tests that interfere with each other.** One test changes the singleton, another
fails afterwards — and the failure depends on the order.

**Unsafe lazy initialization.** Two threads create two instances.

**Initialization cycle.** Two singletons referencing each other during construction.

**Hidden dependency discovered late.** A method that looked pure depends on
configuration, and that only surfaces when the environment changes.

## Common Mistakes

**Using it for configuration.** The most common.

**Confusing uniqueness with global access.** The central confusion.

**Thinking the solution is making the singleton testable.** If you need a mechanism
to substitute it, the dependency should be explicit.

**A mutable singleton.** A global variable under another name.

## Where it appears in practice

**Logging registries.** `LoggerFactory.getLogger(...)` is global access over a single
configuration. It is the legitimate case, and it works because logging is
cross-cutting infrastructure and the object is effectively stateless from the
caller's point of view.

**Dependency injection containers.** Ironically, the container tends to be a
singleton — and exists so that nothing else has to be.

**Connection pools.** One instance per application, but good libraries inject it
rather than exposing static access.

The pattern in all three cases is the same: **uniqueness yes, global access only
when the object is cross-cutting and has no observable state**. Mature libraries
converged on that; application code frequently does not.

## Real-World Example

A system had `GlobalConfiguration.getInstance()` called in 214 places.

Two problems appeared together.

Tests failed intermittently depending on order — a test that changed a parameter
affected the following ones, and CI reordered them.

And nobody could say which parts of the system depended on which parameter, because
the dependency was in no signature.

The migration was incremental: the class became injectable, `getInstance()` was kept
as a temporary delegation, and the calls were replaced module by module.

The unexpected result came midway: on declaring the dependencies, the team discovered
that 60% of the 214 points used only three parameters. Those three became method
parameters, and most of the system stopped depending on configuration at all.

The Singleton was not just hiding a dependency — it was hiding that the dependency
was far smaller than it appeared.

## Related Concepts

- [Dependency Inversion](/02-software-design/dependency-inversion.md) — the
  structural alternative.
- [Facade](/03-design-patterns/facade.md) — frequently confused, solves another
  problem.
- [Encapsulation](/02-software-design/encapsulation.md).

## Practical Exercise

Count how many calls to static instance-access methods exist in your system.

Pick the most used one and list, for the first ten usage points, **exactly what**
each of them consumes from it.

If most use few fields, the real dependency is smaller than the declared one — and
can probably become a parameter.

## Interview Questions

- What are Singleton's two promises, and why is joining them a problem?
- Why does Singleton make testing harder?
- When is it acceptable?

## Further Exploration

- Gamma, Erich et al. *Design Patterns*. Addison-Wesley, 1994.
- Fowler, Martin. *Inversion of Control Containers and the Dependency Injection
  Pattern*, 2004.

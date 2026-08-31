---
id: design-patterns
title: Design Patterns
sidebar_position: 0
description: Patterns as a vocabulary of recurring solutions — always with the condition under which they should not be used.
doc_type: index
level: 2
difficulty: intermediate
status: complete
objective: >
  By the end, the reader recognizes the problem each pattern solves, the cost each
  one charges, and can identify when applying a pattern makes the system worse.
prerequisites: [software-design]
related: [fundamentals, domain-driven-design]
canonical_for: []
translated_from_version: 1
last_reviewed: 2026-08-31
---

# Design Patterns

Patterns are recurring solutions with a name. The name is half the value: it lets
two people discuss a structure without drawing the whole of it.

The other half of the value only appears once you know the cost.

## The problem this section addresses

Patterns are the part of design knowledge easiest to learn badly. They are concrete,
have appealing names and fit in a twenty-line example — which makes them memorable
without being understood.

The typical result is the practitioner who applies *Strategy* where an `if` would
have done, creates a *Factory* to instantiate a class that will never have a second
implementation, and puts *Observer* in a flow that had exactly one observer. Each
application in isolation looks reasonable. The accumulation produces a system where
following a simple flow requires opening nine files.

A pattern applied without the corresponding problem is complexity with no
counterweight.

## What you will find here

**Design patterns (GoF).** All twenty-three, organized into creational, structural
and behavioural. Each treated from the problem that originated it, not from its class
structure.

**Architectural patterns.** Layered, Modular Monolith, Microservices, Event-Driven,
Hexagonal, Clean Architecture, CQRS, Event Sourcing, Pipes and Filters, Space-Based
Architecture and SOA. These operate at a different level: they decide how the system
is deployed and operated, not merely how the code is organized.

## Three patterns that live in Level 02

Layered, Hexagonal and Clean Architecture are architectural patterns and are covered
in [Software Design](/02-software-design/index.md), because there they arise as a
consequence of decisions about boundaries and dependency direction.

A concept has a single canonical document in this material; where it reappears, it is
referenced. The direct links:

- [Layering](/02-software-design/layering.md)
- [Ports and Adapters](/02-software-design/ports-and-adapters.md)
- [Hexagonal Architecture](/02-software-design/hexagonal-architecture.md)
- [Onion Architecture](/02-software-design/onion-architecture.md)
- [Clean Architecture](/02-software-design/clean-architecture.md)

## The rule of this section

**No pattern is presented without the discussion of when not to use it.**

It is not a structural formality. It is the most useful part of each document, and
the one missing from almost all the patterns literature. A pattern whose cost you
cannot state is a pattern you do not know how to use.

For the architectural patterns, the "When Not to Use" section is frequently longer
than the explanation of the pattern. That is deliberate: the most expensive wrong
decisions in an architect's career tend to be premature adoptions of correct
architectural patterns in the wrong context.

## Reading order

The GoF patterns can be read out of order, by lookup. There is no mandatory
progression among them. If reading in sequence, start with the behavioural ones —
they are the ones that most frequently solve real application-code problems.

The architectural patterns **do** have an order. Read Layered and Modular Monolith
before Microservices; read Event-Driven before CQRS and Event Sourcing. The sequence
matters because each one only makes sense as a response to the previous one's
limitations.

Do not read the distributed architectural patterns — Microservices, Event-Driven,
Space-Based — before [Level 04](/06-distributed-systems/index.md). They are presented
here as shapes; their real cost only becomes visible after understanding partial
failure.

## By the end

You recognize the problem before the pattern. You can name the structure already in
your code without having noticed it. And, faced with a suggestion to apply a pattern,
you can ask which specific force it is relieving — and conclude, where that is the
case, that it is none.

## Continues in

[Domain-Driven Design](/04-domain-driven-design/index.md), where the structure comes
to be dictated by the domain rather than by technical forces.

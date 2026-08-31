---
id: functional-requirements
title: Functional Requirements
sidebar_position: 7
description: What the system does — and why on their own they almost never determine the architecture.
doc_type: foundation
level: 1
difficulty: beginner
status: complete
objective: >
  By the end, the reader distinguishes functional from non-functional
  requirements and recognizes why functional ones rarely decide the architecture
  on their own.
prerequisites: [problem-space]
related: [non-functional-requirements, quality-attributes]
canonical_for: [functional requirements]
translated_from_version: 1
last_reviewed: 2026-08-29
---

# Functional Requirements

## Overview

Functional requirements describe what the system does: what inputs it accepts,
what transformations it applies, what outputs it produces, what rules it honours.

They are necessary and almost never sufficient to decide an architecture.

## The Problem

The observation that organizes this document is counter-intuitive: **two systems
with identical functional requirements may demand completely different
architectures.**

"Record an order, charge for it and notify the customer" describes both a shop
with a hundred orders a day and a marketplace with a hundred thousand a minute.
The functions are the same. The architectures have nothing in common.

That means functional requirements delimit what the system has to be able to do,
but the **how** is decided by something else: the
[quality attributes](quality-attributes.md) and the
[constraints](constraints.md).

The mistake that follows is common and expensive: gathering functional
requirements rigorously, treating them as the complete specification, and
discovering in the first week of production that the architecture does not
sustain the volume, the latency or the guarantee nobody wrote down.

## Core Concepts

### What it is and what it is not

| Is a functional requirement | Is not |
|---|---|
| "The system calculates shipping from postcode and weight" | "Shipping calculation responds in under 200 ms" |
| "A cancelled order cannot be invoiced" | "The system is available 99.9% of the month" |
| "The monthly report includes returns" | "The report is generated without affecting operations" |

The left column describes behaviour; the right, the quality of that behaviour.
Both are requirements. Only the first is functional.

### Business rules are the core

Within functional requirements, business rules deserve separate attention: they
express company decisions, they change frequently, and they are the main source of
essential complexity.

"Customers with more than twelve months and no delinquency get a 40% higher
limit" is a rule that will change. Where it lives, and how easy it is to alter, is
an architectural decision — even though the rule itself is functional.

### Functional requirements inform boundaries

Although they do not decide the architecture on their own, they inform where the
boundaries might fall. Features that change together and share vocabulary tend to
belong to the same module; those that change for independent reasons, to separate
modules.

That is the input that [strategic DDD](/04-domain-driven-design/index.md) turns
into bounded contexts.

### Exception cases are requirements, not details

The main flow is usually well described. What decides architecture are the others:
the payment that fails after stock has been reserved, the customer who cancels
mid-shipment, the external integration that does not respond.

Those cases determine whether the system needs compensation, idempotency, a state
machine — decisions with a high cost of reversal. Gathering them alongside the
main flow is what avoids discovering them later.

## Mental Model

**Functional requirements say what the system has to be able to do. Quality
attributes say how well. Constraints say what is off the table.**

The three together form the input to architecture. None alone is enough, and the
first is the one most frequently mistaken for the whole.

## Why This Matters

**Because it delimits the scope of what must exist.** Without clear functional
requirements, there is no way to know whether the system is finished nor what it
should do in each case.

**Because the separation avoids the most common design failure.** Teams that
gather only the functional side produce systems that do everything right and
cannot take the load — and the rework to fix that is architectural, not
incremental.

**Because exception cases decide structure.** Gathering them late means
discovering late that the data model cannot accommodate compensation, which is
exactly the kind of expensive discovery.

## Common Mistakes

**Treating functional requirements as the complete specification.** The structural
mistake. It produces the question "why is the system slow?" framed as a defect,
when it is an absent requirement.

**Describing a solution instead of a behaviour.** "The system sends the order to a
queue" is not a functional requirement; it is a design decision in disguise. The
requirement is "the order is processed without blocking confirmation to the
customer".

**Documenting only the happy path.** Exception cases are where the architecture is
decided, and they are the ones left out when the gathering is rushed.

**Ignoring who else needs the feature.** A feature consumed by another team or
system has a contract requirement that an internal one does not — and that changes
its cost of change.

**Confusing volume with function.** "Process a thousand orders per second" is not
a functional requirement. It is a quality attribute about the function "process
order", and treating it as functional hides that it is what decides the
architecture.

## Real-World Example

Requirement received: *"The system must allow the customer to cancel the order."*

As stated, it is insufficient to architect from. The missing questions are all
functional:

- Cancelling is possible until what moment? Before payment, before invoicing,
  before shipping?
- Does partial cancellation exist?
- What happens to stock already reserved? And to payment already captured?
- If the order has shipped, does cancelling become a return? Is it the same
  operation or another?
- Who can cancel — only the customer, or also an operator?

The answers change the architecture directly. If cancelling is only possible
before payment, a simple operation solves it. If it is possible after capture and
shipping, the system needs refunds, stock reversal and coordination with the
carrier — which probably means a
[saga](/06-distributed-systems/index.md), with everything that costs.

The same one-line statement covers both cases. The architectural distance between
them is months.

## Related Concepts

- [Non-Functional Requirements](non-functional-requirements.md) — the other half.
- [Quality Attributes](quality-attributes.md) — what actually decides the
  architecture.
- [Problem Space](problem-space.md) — where the requirements come from.

## Practical Exercise

Take one feature of your system and list every exception case it has to handle —
external failure, cancellation mid-flow, inconsistent data, a repeated operation.

For each, ask: does the current system handle this? If so, where? If not, what
happens today when it occurs?

The unhandled cases are functional requirements that exist and were never stated.

## Interview Questions

- What is the difference between a functional and a non-functional requirement?
- Why can two systems with the same functional requirements need different
  architectures?
- How do you surface the exception cases that decide structure?

## Further Exploration

- Wiegers, Karl; Beatty, Joy. *Software Requirements*. 3rd ed., Microsoft Press,
  2013.
- Cockburn, Alistair. *Writing Effective Use Cases*. Addison-Wesley, 2000 — on
  alternative and exception flows.

---
id: coupling-vs-duplication
title: Coupling vs. Duplication
sidebar_position: 6
description: Duplication is cheaper than the wrong coupling — and most apparent duplication is not duplication.
doc_type: tradeoff
level: 5
difficulty: intermediate
status: complete
objective: >
  By the end, the reader distinguishes real duplication from coincidence and chooses between
  extracting and duplicating based on the axis of change.
prerequisites: [coupling]
related: [simplicity-vs-flexibility, monolith-vs-microservices, abstraction-vs-complexity]
canonical_for: []
translated_from_version: 1
last_reviewed: 2026-08-31
---

# Coupling vs. Duplication

## Overview

The reflex formed by years of "don't repeat yourself" is to remove duplication whenever it
appears. The reflex is expensive, because it ignores what extraction creates: **coupling**.

```text
duplication  linear cost, local, visible
coupling     non-linear cost, distributed, invisible until the first divergence
```

And it ignores something prior: a good part of what looks like duplication is not. Two
snippets identical today that change for different reasons are **coincidence**, and joining
them creates a coupling between things that have no relationship.

```text
real axis   do these two snippets change for the same reason, or for different ones?
```

That question — not the similarity of the code — decides.

## Problem

The cycle is well known:

```text
two similar snippets        extracted into a shared function
one case needs to vary      boolean parameter
another case needs to vary  second parameter
six months later            function with 5 control parameters and 3 paths
                            nobody understands, used by 4 modules
```

Each step was reasonable. The result is worse than the original duplication in every
dimension: harder to read, harder to change, and now with the risk that a change to serve one
caller breaks another.

See [DRY](/02-software-design/dry.md).

The opposite error exists and is less common in code, and more common between services: the
same business rule implemented in four places, diverging silently, with four different
behaviors for the same question.

## Core Concepts

### The test is the axis of change

```text
real duplication  the two snippets will change together, always, for the same reason
coincidence       the two are equal today and will change for different reasons
```

Examples:

```text
tax calculation used in order and in invoice
  → changes when the law changes, in both → real duplication

email validation in signup and in bulk import
  → signup may gain verification; the import will not
  → probable coincidence

response format of two different endpoints
  → they evolve with their own consumers → coincidence
```

This is the content of the original DRY principle, frequently lost: it speaks of
**knowledge**, not of text. Two representations of the same knowledge should be one; two
identical texts representing different knowledge should remain two.

### Coupling costs non-linearly

```text
duplication  n copies → n places to change, each one independent
coupling     n dependents → each change must consider n contexts,
             with regression risk in n-1 untested places
```

And the cost of coupling is deferred: it does not appear at extraction, it appears the first
time one of the uses needs to diverge. That is why the decision looks good for months.

See [coupling](/01-fundamentals/coupling.md).

### Rule of three

```text
1st occurrence  write it
2nd occurrence  duplicate, and observe
3rd occurrence  now there is enough information to extract
```

The justification is not numerological: with one case, the structure is guesswork; with two,
the variation is a hypothesis; with three, the real axis becomes visible.

Extracting at the second case produces abstractions shaped like the first. See
[simplicity vs. flexibility](/20-trade-offs/simplicity-vs-flexibility.md).

### Between services, the arithmetic changes

Inside a module, extracting is cheap and reversible. Between services, it is not:

```text
library shared between services   couples deployment cycles
shared service                    couples availability
shared database                   couples schema and evolution
```

A library common to twelve services means that a fix in it requires twelve coordinated
deployments — and that none of the twelve can evolve it alone.

For that reason, **between services, the tolerance for duplication should be higher**.
Duplicating a data model between two services with different contexts is frequently the
correct decision, and it is what design by bounded contexts prescribes.

See [bounded contexts](/04-domain-driven-design/bounded-context.md).

### Duplication with declared synchrony

An underused middle ground: duplicate and record the relationship.

```text
// Mirrors the calculation rule in billing/TaxService.
// Deliberately diverged in 2026-02 (see ADR-031); keep them
// separate until the tax rule unifies the two cases.
```

This preserves independence and solves the real problem of duplication, which is not the
repeated code — it is silent divergence.

### Signs of the wrong choice

```text
coupled too much
  boolean control parameters in shared functions
  "I can't change this, the other team uses it"
  simple change requiring coordinated deployment
  internal library with its own versioning and negotiation cycle
  conditionals separating callers inside the common code

duplicated too much
  the same rule with different behaviors in different places
  fix applied in three places and forgotten in the fourth
  divergence discovered by a customer
  change effort proportional to the number of copies, always
```

The first sign — control parameter — is the most reliable: it indicates that the shared code
is serving two different kinds of knowledge.

### Cost of changing your mind

```text
duplicated → extracted   cheap: the cases exist, the shape is derivable
extracted → duplicated   expensive: you must find out who depends, and fear freezes it
```

The asymmetry is strong and almost always decisive in ties. Duplicating is reversible;
coupling is reversible in theory and stuck in practice by the fear of breaking consumers
nobody mapped.

## Mental Model

**Do they change for the same reason?** If yes, it is duplicated knowledge. If not, it is
similar text — and joining them creates a problem that did not exist.

## When to Use

Prefer **extracting** when:

- The snippets change for the same reason, demonstrably.
- There are already three occurrences.
- They are in the same module or service.
- The rule is a business rule and divergence would cause an error.
- There is a regulatory requirement about consistency of the calculation.

Prefer **duplicating** when:

- The reasons for change are different or unknown.
- There are only two occurrences.
- The snippets are in different services.
- The domain contexts are distinct.
- Extraction would require control parameters.

## When Not to Use

**Applying DRY to text** instead of to knowledge.

**Extracting at the second case.**

**Sharing between services** without counting the deployment coupling.

**Duplicating a regulated rule** without a synchrony mechanism.

**Duplicating without recording the relationship** between the copies.

## Alternatives

- **Duplication with a synchrony note** — keeps independence, avoids silent divergence.
- **Extract only the stable core** — the part that demonstrably does not vary; leave the rest
  duplicated.
- **Contract instead of code** — share the schema and not the implementation. See
  [integration contracts](/08-integration-architecture/integration-contracts.md).
- **Automated divergence checking** — tests that compare the behaviors of the copies, without
  joining them.

The last one is elegant for regulated rules between services: the implementations remain
independent and a test guarantees they agree.

## Trade-offs

| Extract | Duplicate |
|---|---|
| One source of truth | Independence |
| Coupling | Divergence possible |
| Change in one place | Change in n places |
| Hard to undo | Easy to join later |

| Share between services | Duplicate between services |
|---|---|
| Guaranteed consistency | Independent evolution |
| Coupled deployment | Free deployment |
| One team answers | Each one answers |

## Failure Modes

**Control parameter.** Sign of different kinds of knowledge joined.

**Library shared between many services.** Coordinated deployment.

**Extraction at the second case.** Shape of the first.

**Silent divergence.** Four behaviors for the same question.

**"I can't change it, the other team uses it."** The coupling collected.

**DRY applied to text.** Joins what has no relationship.

## Common Mistakes

**Removing duplication by reflex**, without asking the axis of change.

**Not counting the cost of coordinated deployment** when sharing between services.

**Not recording the relationship** between deliberate copies.

**Treating duplication between domain contexts as an error.**

**Not looking at boolean parameters** as a symptom.

## Real-World Example

A logistics company had an internal domain library shared by 14 services. It was born with
good intentions: to prevent the same freight calculation rule from being implemented many
times.

After three years:

```text
services depending on the library               14
versions in simultaneous use                     6
average time to propagate a fix                 11 weeks
changes blocked by incompatibility
  with some consumer, in the last year          19
control parameters in the main function          7
conditional paths separating callers            11
```

The 7 control parameters were the diagnosis. They existed because the 14 services did not
calculate freight for the same reason:

```text
4 services   quote for the customer — needs to be fast and approximate
3 services   billing — needs to be exact and auditable
5 services   route planning — needs to consider vehicle constraints
2 services   reconciliation with the carrier — uses the partner's table
```

Four different kinds of knowledge, joined by superficial similarity of formula.

The separation took seven months:

**Four independent implementations**, one per context, each in the service that owns it.

**Deliberate and recorded duplication.** Each one carries a note pointing at the others, with
the ADR that explains why they are separate.

**Common core extracted**, but minimal: only unit conversions and geographic data structures
— the part that demonstrably does not vary by context, and that had no control parameter.

**Divergence checking for the regulated case.** Billing and reconciliation must agree by tax
requirement; a daily test compares the two implementations over a set of cases and alerts
when they diverge. They remain independent code.

Results after 12 months:

```text
average time to change a freight rule           from 11 weeks to 3 days
changes blocked by incompatibility               0
divergences detected by the daily test           2, both fixed in hours
total lines of code                            +18%
services depending on the common library        14 (only for the minimal core)
```

The 18% increase in code is the accepted cost and was explicitly recorded as such.

The library was not an execution error. It was created when there were two consumers with the
same need — and the correct decision at that moment probably was to share. The error was not
revisiting it when the third and fourth consumers arrived with different reasons for change.
Each control parameter added was a sign, and none was read as one.

## Related Concepts

- [Coupling](/01-fundamentals/coupling.md) and [DRY](/02-software-design/dry.md).
- [Bounded Contexts](/04-domain-driven-design/bounded-context.md).
- [Simplicity vs. Flexibility](/20-trade-offs/simplicity-vs-flexibility.md).
- [Monolith vs. Microservices](/20-trade-offs/monolith-vs-microservices.md).

## Practical Exercise

Find the shared function in your system with the most control parameters and list who calls
it.

Then, for each caller, write down why it would ask for a change to it. Different reasons
indicate different kinds of knowledge joined by similarity.

## Interview Questions

- Why is the test the axis of change and not the similarity of the code?
- Why should the tolerance for duplication be higher between services?
- How does a boolean control parameter diagnose an improper extraction?

## Further Reading

- Hunt, Andrew; Thomas, David. *The Pragmatic Programmer*. 2nd ed. Addison-Wesley, 2019.
- Ousterhout, John. *A Philosophy of Software Design*. 2nd ed. Yaknyam Press, 2021.
- Evans, Eric. *Domain-Driven Design*. Addison-Wesley, 2003.

---
id: context-diagrams
title: Context Diagrams
sidebar_position: 3
description: The system and the world around it — the most useful diagram and the cheapest to maintain.
doc_type: concept
level: 5
difficulty: beginner
status: complete
objective: >
  By the end, the reader produces a context diagram anyone can understand and that ages
  slowly.
prerequisites: [c4-model]
related: [c4-model, container-diagrams, diagram-quality]
canonical_for: []
translated_from_version: 1
last_reviewed: 2026-08-31
---

# Context Diagrams

## Overview

A context diagram shows **the system, who uses it, and which other systems it talks to** —
and nothing else.

It is the highest-return diagram in architecture documentation: it is understood by
anyone, it answers the most frequent question, and it ages slowly.

And it is the most frequently absent, because it looks too simple to be worth the effort.

## Problem

The question it answers comes up constantly:

```text
what does this system do?
who depends on it?
what does it depend on?
what breaks if it goes down?
where does it start and end?
```

Without it, every answer requires someone who knows the system — and that person answers
from memory, with omissions.

And the boundary — where the system starts and ends — is an architectural decision that
frequently was never made explicitly. Drawing it forces the decision.

## Core Concepts

### What goes in

```text
the system        one box, in the center
people            the types of user, not individuals
external systems  the ones that talk to it
relationships     who calls whom, and what for
```

And what does **not** go in:

```text
internal components
technologies
infrastructure
protocol details
systems that don't talk to it directly
```

The last exclusion matters: a system that talks to a system that talks to yours does not
belong in the context. Including it turns the diagram into a map of the organization.

### Few boxes

```text
target        5 to 12 boxes
beyond that   the boundary is probably wrong, or there is too much detail
```

If the context has 30 boxes, either the system has too many responsibilities — which is
an architectural discovery — or the diagram includes things that don't talk to it
directly.

See [application architecture](/15-enterprise-architecture/application-architecture.md).

### The relationships have to say what and why

```text
bad     System A → System B
good    System A → System B: "checks credit limit, HTTPS"
better  System A → System B: "checks credit limit before approving an order"
```

The relationship's label is where the information is. An unlabeled arrow says a
dependency exists and doesn't say what is lost if it fails.

And a label in terms of **purpose** — not mechanism — is what makes it comprehensible to
non-technical readers.

### The boundary is a decision

Drawing the context forces the question: **what is inside this system?**

Frequently the answer is not obvious, and disagreement between people on the same team
reveals that the boundary was never decided.

That is a valuable discovery, and it surfaces within minutes of drawing. See
[bounded context](/04-domain-driven-design/bounded-context.md).

### It serves conversations with the business

The context is the only architecture diagram non-technical people can read completely.

That makes it the tool for:

```text
explaining what the system does
discussing the impact of downtime
assessing external dependencies
justifying investment
```

See [business architecture](/15-enterprise-architecture/business-architecture.md).

And it imposes a constraint: no jargon. A label that requires a technical explanation
breaks the purpose.

### It ages slowly, and not forever

It changes when: a new integration appears, a system is decommissioned, or the boundary
changes.

That is rare — a few times a year in most systems — which makes it cheap to maintain.

What is not cheap is maintaining it when it contains detail that doesn't belong at this
level. That is the most common reason contexts go out of date.

### It is the one diagram everyone reads

Among all the artifacts on this path, the context diagram has the widest reach: people in
business, product, operations, security and engineering can read it without preparation.

That changes the quality criterion. A bad container diagram inconveniences engineers; a
bad context diagram misaligns the entire organization about what the system is.

So it is worth investing more time here than the artifact's simplicity suggests — in
choosing the system's name, in wording the relationships, and above all in deciding what
stays inside the boundary.

## Mental Model

**The system, who uses it, and who it talks to.** Nothing inside, nothing indirect.

## When to Use

- For every relevant system — it is the minimum documentation.
- When onboarding new people.
- In conversations with the business.
- To assess the impact of downtime.
- When discussing boundaries.

## When Not to Use

**With internal components.**

**With systems that don't talk to it directly.**

**With technical jargon** in the labels.

**With unlabeled arrows.**

**With more than a dozen boxes** — revisit the boundary.

## Alternatives

- **Container diagram** — when the question is about the inside. See
  [container diagrams](/17-architecture-documentation/container-diagrams.md).
- **Derived dependency map** — automatic, without the purpose lens.
- **Textual description** — for systems with few integrations, a paragraph suffices.

## Trade-offs

| Context | Container |
|---|---|
| Comprehensible to everyone | Only to technical readers |
| Ages slowly | Faster |
| Doesn't say where to touch | Says it |
| Cheap to maintain | More expensive |

| Few external systems | All of them |
|---|---|
| Legible at a glance | Complete |
| Requires choosing what matters | Requires no judgment |
| Omits real integrations | Becomes an illegible web |

The second is the hard decision at this level: an honest context usually has more boxes
than you would like, and reducing them for aesthetics hides exactly the dependencies the
diagram exists to reveal.

## Failure Modes

**Internal detail.** It becomes a badly made container diagram.

**Indirect systems.** It becomes a map of the organization.

**Unlabeled arrows.** It doesn't say what is lost.

**Jargon.** The business can't read it.

**An ambiguous boundary.** The diagram reveals unresolved disagreement.

**Out of date.** A new integration wasn't included.

## Common Mistakes

**Not producing one**, for looking too simple.

**Including technologies.**

**Labeling by mechanism** instead of purpose.

**Including everything that exists in the organization.**

**Not dating it.**

**Not revisiting it when a new integration appears.**

## Real-World Example

A logistics company went through an incident in which decommissioning an internal system
broke three processes nobody had anticipated.

The investigation revealed there was no context diagram for any system — the existing
documentation was of internal components.

Producing contexts for the 40 systems took six weeks, and was done with a combination of
interviews and traffic observation. See
[current state architecture](/15-enterprise-architecture/current-state-architecture.md).

Three findings during the exercise:

**Unknown consumers.** In 11 of the 40, consumers appeared that the teams didn't know
about. One system had seven consumers; the team knew about three.

**Ambiguous boundaries.** In four cases, people on the same team disagreed about what
belonged to the system. In two of them, the disagreement reflected a responsibility that
had been absorbed with no decision.

**Unmapped external dependencies.** Five systems depended on third-party services that
appeared in no inventory — including a geocoding service used by three systems, with an
expired contract.

Subsequent use:

**Onboarding.** The context became the first document presented, and the time to first
contribution dropped noticeably.

**Impact assessment.** Before any decommissioning or contract change, the context is
consulted — and the consumer list is verified against real traffic.

**Conversations with the business.** The contexts started being used in prioritization
discussions, because the departments could read them.

Maintenance: the diagrams are described in text in each system's repository, generated in
the pipeline, and reviewed when an integration changes. Over eighteen months, the average
was 1.4 changes per system.

The recorded lesson: the 11 unknown consumers were the highest-value discovery, and it
came from an exercise the organization had considered too simple to prioritize for years.

## Related Concepts

- [C4 Model](/17-architecture-documentation/c4-model.md) — the level above.
- [Container Diagrams](/17-architecture-documentation/container-diagrams.md) — the next zoom in.
- [Diagram Quality](/17-architecture-documentation/diagram-quality.md).
- [Integration Landscapes](/15-enterprise-architecture/integration-landscapes.md).

## Practical Exercise

Draw the context of one of your team's systems, with at most 12 boxes and every arrow
labeled by purpose.

Then show it to someone from the business. If that person needs an explanation, the
diagram still has jargon.

## Interview Questions

- What goes in and what doesn't go in a context diagram?
- Why is the relationship's label where the information is?
- Why does drawing the context force a boundary decision?

## Further Reading

- Brown, Simon. *The C4 model* — c4model.com.
- Brown, Simon. *Software Architecture for Developers*. Leanpub, 2015.
- Evans, Eric. *Domain-Driven Design*. Addison-Wesley, 2003.

---
id: living-documentation
title: Living Documentation
sidebar_position: 12
description: Deriving from what is already true — the only form of documentation that doesn't go stale.
doc_type: concept
level: 5
difficulty: advanced
status: complete
objective: >
  By the end, the reader can tell what can be derived from what has to be written, and
  sets up derivation where it pays off.
prerequisites: [documentation-principles]
related: [documentation-principles, documentation-standards, component-diagrams]
canonical_for: []
translated_from_version: 1
last_reviewed: 2026-08-31
---

# Living Documentation

## Overview

All hand-written documentation goes stale. The problem is not discipline — it is that the
information exists in two places and nothing forces the two to agree.

Living documentation attacks the cause: **derive the documentation from the artifact that
is already true**, so that diverging is impossible, and not merely undesirable.

And this topic's central decision is not which tool to use. It is **what can be derived
and what cannot** — because most architectural value lies precisely in what the machine
doesn't know.

## Problem

The cycle is familiar:

```text
someone writes the documentation
the system changes
the documentation doesn't
someone trusts it and gets it wrong
confidence drops
nobody consults it
nobody updates it
```

And the usual remedy — process, reminders, mandatory review — fights the symptom. It
depends on someone doing, every single time, work that gives no immediate return to
whoever does it.

See [documentation principles](/17-architecture-documentation/documentation-principles.md), where documentation
half-life is the corresponding concept.

## Core Concepts

### What can be derived

```text
deployment diagram            from the infrastructure code
container diagram             from a service manifest
component structure           from the code
API contracts                 from the specification or the code
data schema                   from the database
dependencies between services from distributed tracing
system inventory              from the registry
who-calls-whom matrix         from the service mesh or the logs
```

The pattern is clear: **structure is derivable**. What exists, how it connects, what runs
where — all of it is declared somewhere executable.

See [distributed tracing](/13-observability/distributed-tracing.md) for the last category,
which is the most reliable of all: it shows what happens, not what was declared.

### What cannot be derived

```text
why the decision was made
which alternatives were discarded
which constraint shaped the choice
what is intended to change
what is known to be wrong
what the boundary means in business terms
who the system exists for
```

None of that is in the code. It is **intent**, and intent only exists written down.

That division is the most useful thing in this topic: derive the structure, write the
intent, and don't try to invert it. See
[architecture decisions](/18-architecture-decisions/index.md).

### Diagrams as code

Describing diagrams in text and rendering them is the practical middle ground:

```text
versioned alongside the code
enters code review
diffs are legible
the text is useful even without rendering
```

It is not derivation — the text is still written by hand, and it can still diverge. The
gain is in the process: a text diagram in the repository is reviewed alongside the change
that affects it, and the trigger is natural.

The trade-off is layout: automatic renderers produce acceptable arrangements and rarely
optimal ones. For sequence diagrams that hardly matters; for large structural ones, it
does. See
[diagram quality](/17-architecture-documentation/diagram-quality.md).

### Verification instead of generation

A cheaper and frequently better alternative: keep the documentation written and
**automatically verify that it agrees with reality**.

```text
do the containers named in the diagram exist in the registry?
do the deployed services appear in the diagram?
do the documented endpoints respond?
does the declared owner exist?
do the links resolve?
```

That preserves the curation — layout, emphasis, grouping — and eliminates silent
divergence. When the verification fails, a person decides what to fix: the document or the
system.

And sometimes the answer is the system. A check that points at a deployed and undocumented
service may have found something that shouldn't be running.

### Tests as documentation

Acceptance tests written in domain language describe behavior and cannot diverge, because
they fail when they do.

```text
what the system does            legible in the test
under what conditions           same
what happens when it fails      same
```

The limitation: tests describe behavior, not structure or intent. They cover a real slice
and do not replace the rest. See
[contract testing](/08-integration-architecture/integration-contracts.md).

### The up-front cost is real

Derivation is not free:

```text
building the extraction     weeks
maintaining the tool        continuous
handling irregular cases    constant
sometimes ugly output       always
```

The calculation: derivation pays off where the information **changes frequently** and is
**consulted frequently**. Where either is low, writing by hand and verifying is cheaper.

That is the case with the context diagram — it barely changes, and deriving it would mean
building machinery for a problem that doesn't exist. See
[context diagrams](/17-architecture-documentation/context-diagrams.md).

## Mental Model

**Derive the structure, write the intent, verify the rest.** What the machine knows, the
machine documents.

## When to Use

- For deployment diagrams, where the topology is already declared.
- For API contracts and data schemas.
- For inventories and dependencies between services.
- For the component level, the one with the shortest half-life.
- As verification, in any written documentation.

## When Not to Use

**For rationale and decisions** — not derivable.

**Where the information changes little** — the cost doesn't pay off.

**When layout matters a lot** and the generated version is illegible.

**With nobody responsible for the tool** — the tool becomes the new debt.

**As a substitute for writing** — the result is complete and meaningless documentation.

The last deserves emphasis: an organization that generates everything and writes nothing
has correct diagrams and no explanation of why the system is the way it is.

## Alternatives

- **Writing with a trigger** — update when the corresponding event occurs. See
  [documentation standards](/17-architecture-documentation/documentation-standards.md).
- **Automated verification** — cheaper than generation, preserves curation.
- **Diagrams as code** — the middle ground, a process gain.
- **Accepting aging** with a visible date — legitimate for what changes little.

## Trade-offs

| Generated | Written |
|---|---|
| Cannot diverge | Can |
| Shows what exists | Shows the intent |
| Automatic layout | Curated |
| High up-front cost | Continuous cost |

| Generation | Verification |
|---|---|
| Eliminates divergence | Detects it |
| Loses curation | Preserves it |
| Expensive to build | Cheap |
| Always current | Current or red |

## Failure Modes

**Generate everything, write nothing.** Correct structure, no intent.

**A tool with no owner.** It breaks and nobody notices.

**An illegible generated diagram.** No grouping, with dozens of nodes.

**Deriving what doesn't change.** Machinery with no return.

**Verification that always fails.** It becomes noise and is ignored.

**The wrong derivation source.** Deriving from what was declared, not from what runs.

## Common Mistakes

**Trying to derive rationale.** The code shows what is, never why it was chosen. Automation does not replace recording the decision.

**Not distinguishing structure from intent.** Structure is derived and verified; intent is written by hand. Treating both the same leads to automating what can't be and hand-writing what ages.

**Choosing the tool before deciding what to derive.** The tool generates what it knows how to generate, and the result is abundant documentation nobody asked for.

**Not measuring whether the output is read.** Generated documentation has a maintenance cost like any other. If nobody opens it, the right move is to turn the generation off.

**Ignoring verification as the cheaper option.** For many properties, a test that fails when the rule is violated is worth more than a document that describes it — and it never goes stale.

## Real-World Example

A company with 180 services maintained an architecture portal with hand-drawn diagrams. The
accuracy rate measured on a sample was 34%.

The first attempt was to generate everything. An extractor read the orchestrator, the
service mesh and the repositories, and produced diagrams automatically.

The technical result worked. The practical result was bad:

```text
diagrams with 180 nodes and 900 edges
no grouping by domain
no distinction between a critical and an occasional call
no indication of purpose
```

The diagrams were correct and illegible. Use of the portal dropped even further.

The second attempt separated by the nature of the information:

**Derived** — service inventory, real dependencies from tracing, deployment topology, API
contracts, data schemas. All continuously updated, available as a query and not as a giant
diagram.

**Written and verified** — context and container diagrams per domain, hand-drawn, with
curated grouping and emphasis. A daily check compares the drawn containers with the
deployed services and raises an alert to the owner when they diverge.

**Written, with no verification possible** — rationale, ADRs, risks, evolution intent.

**Grouping by domain** applied to the derived data: instead of one 180-node diagram, a
query answering "what does this domain depend on" with five to twelve nodes.

The numbers, a year later:

```text
accuracy rate of the written diagrams      34% → 89%
divergences detected per month             an average of 11, fixed within days
undocumented services found                7 (three of which shouldn't exist)
portal usage                               2.4× the previous level
```

The seven services found by the verification were an unforeseen result: three were leftover
experiments still running, consuming resources and holding access to production data.

Full generation failed not because it was technically wrong, but because it ignored that
curation is content. Grouping by domain and emphasizing certain relationships is
architectural information — and it is exactly what automated extraction has no way of
knowing.

## Related Concepts

- [Documentation Principles](/17-architecture-documentation/documentation-principles.md) — the half-life.
- [Documentation Standards](/17-architecture-documentation/documentation-standards.md) — the triggers.
- [Component Diagrams](/17-architecture-documentation/component-diagrams.md) — where generation pays off most.
- [Distributed Tracing](/13-observability/distributed-tracing.md) — the most reliable source
  of dependencies.

## Practical Exercise

List your system's documentation artifacts in two columns: what could be derived from
something that already exists, and what only exists because someone wrote it.

The second column is what deserves the human effort. The first is a candidate for
automation or verification.

## Interview Questions

- What kind of information can never be derived, and why?
- Why is verification usually a better deal than generation?
- How can generated documentation be 100% correct and useless?

## Further Reading

- Martraire, Cyrille. *Living Documentation*. Addison-Wesley, 2019.
- Adzic, Gojko. *Specification by Example*. Manning, 2011.
- Brown, Simon. *Software Architecture for Developers*. Leanpub, 2015.

---
id: what-is-an-adr
title: What an ADR Is
sidebar_position: 1
description: A short record of an architectural decision and the context that produced it.
doc_type: foundation
level: 5
difficulty: beginner
status: complete
objective: >
  By the end, the reader knows what an ADR is, what it is not, and recognizes which
  decisions deserve one.
prerequisites: [architecture-documentation]
related: [why-adrs-matter, adr-structure, adr-status]
canonical_for: []
translated_from_version: 1
last_reviewed: 2026-08-31
---

# What an ADR Is

## Overview

An **ADR** — Architecture Decision Record — is a short document recording an architectural
decision, the context in which it was made, the alternatives considered and the
consequences accepted.

It was proposed by Michael Nygard in 2011, and the entire proposal fits in one sentence:
**write a short file, in the repository, every time you make a decision that is hard to
reverse.**

The format is simple on purpose. What makes an ADR work is not the structure — it is what
it preserves: the reason, which is the part the code does not keep.

## The Problem

Code records the outcome of a decision, never the reasoning.

```text
the code shows      that a queue exists between two services
it doesn't show     that the synchronous alternative was discarded
                    because the partner had 4% downtime
                    and the contract required 99.9% on our side
```

Two years later, someone proposes removing the queue. The correct answer depends on
information that is nowhere: if the partner improved, removing it is reasonable; if not,
it is an incident waiting to happen.

With no record, three behaviors remain, all bad:

```text
keep it out of fear        "don't touch it, there must be a reason"
reverse it out of ignorance and rediscover the reason via an incident
re-decide from scratch     spending again the effort already spent
```

The third is the most expensive and the least visible: organizations re-decide the same
questions repeatedly because nothing records that they have already been decided.

## Core Concepts

### What characterizes an ADR

```text
short             one to two pages; if it doesn't fit, it is several decisions
one decision      one ADR, one decision
dated             the context is always that of the moment
immutable         it isn't edited; it is superseded
versioned         it lives in the repository, next to the code
numbered          referenceable — "see ADR-014"
```

Immutability is the least intuitive and most important property. An ADR is not
documentation of the current state — it is the **record of an event**: on such a date,
with such information, this is what was decided. Changing your mind produces a new ADR.
See [status](/18-architecture-decisions/adr-status.md) and
[superseding](/18-architecture-decisions/superseding-decisions.md).

### What a significant decision is

Nygard's criterion: **architecturally significant decisions** — the ones that affect
structure, non-functional characteristics, dependencies, interfaces or construction
techniques.

A practical, more operational test:

```text
is it expensive to reverse?          → likely an ADR
does it affect more than one team?   → likely an ADR
will someone ask "why"?              → likely an ADR
was it discussed for more than an hour? → likely an ADR
is it reversible in an afternoon?    → not needed
```

See [reversible and irreversible decisions](/18-architecture-decisions/adr-context.md).

Choosing the date library is not an ADR. Choosing to expose the API as REST or gRPC is.
Choosing a variable name never is. Choosing to let two services share a database is — and
it is exactly the kind of decision usually made with no record.

### What an ADR is not

```text
not a specification         it doesn't describe how to implement
not system documentation    it doesn't describe what exists today
not a proposal              the proposal becomes an ADR when it is accepted
not meeting minutes         it records the decision, not the discussion
not a policy                it doesn't bind other systems
```

The second confusion is the most common. A reader who wants to know what the system is
today should look at the
[architecture description](/17-architecture-documentation/architecture-descriptions.md)
or the diagrams. The set of ADRs is a history, and reading it front to back is archaeology,
not guidance.

### Where it lives

In the repository of the system the decision belongs to:

```text
docs/adr/0001-use-postgresql.md
docs/adr/0002-process-orders-asynchronously.md
docs/adr/0003-separate-the-billing-service.md
```

That is not an organizational detail. An ADR in a separate wiki disconnects from the code,
doesn't enter review and isn't found by whoever is reading the system. See
[documentation standards](/17-architecture-documentation/documentation-standards.md).

Decisions that apply to several systems belong at another level — governance — and not in
a specific repository. See
[governance](/19-architecture-governance/index.md).

### The cost is low and the return is asymmetric

Writing an ADR costs between twenty minutes and an hour. That is little compared with the
effort already spent on the decision it records — if the decision took two weeks of
discussion, the record is 1% of the cost.

And the return is asymmetric: most ADRs will never be read, and the few that are will be
read at the exact moment someone is about to undo something important without knowing why.

It is that profile — low cost, rare and high return — that justifies writing even with no
proven demand, unlike most documentation. See
[documentation principles](/17-architecture-documentation/documentation-principles.md).

## Why This Matters

**Because the reason is what is lost first.** Structure stays visible in the code;
justification disappears with the people. In teams with normal turnover, two years is
enough for nobody to know why the system is the way it is.

**Because decisions with no context cannot be revisited.** A recorded decision can be
reassessed when the context changes — the question becomes "does the reason still hold?",
which is answerable. With no record, the only possible question is "does anyone know why?",
which normally isn't.

**Because writing forces the reasoning.** Having to list alternatives and consequences
exposes decisions made out of habit. A meaningful share of ADRs change conclusion during
the writing — the author discovers, while trying to justify, that they cannot.

**Because the cost of not having them is invisible.** Nobody measures the time spent
rediscovering reasons or re-deciding what was already decided. It shows up as diffuse
slowness, not as a budget line.

**Because it gives disagreement a place.** A decision recorded with alternatives and
consequences can be challenged with an argument. A tacit decision can only be challenged
with authority.

## Common Mistakes

**Recording everything.** An ADR for a trivial library choice dilutes the set and makes
nobody read any of them.

**Recording nothing.** The opposite extreme, and the most frequent.

**Editing instead of superseding.** It destroys the property that gives the format its
value.

**Writing it afterwards, for the record.** An ADR written six months later loses the
context — the author already knows the outcome and reconstructs the justification instead
of recording it.

**Confusing it with system documentation.** It leads to keeping ADRs "up to date", which
destroys them.

**Omitting alternatives.** Without them, the ADR asserts without arguing. See
[alternatives](/18-architecture-decisions/adr-alternatives.md).

**Leaving them in a separate wiki.** Disconnected from the code, they disappear.

## Real-World Example

A platform team of 14 people inherited a seven-year-old system with 31 services. The
existing documentation was reasonably correct diagrams and no justification at all.

Over the first six months, the team recorded every time someone asked "why is this like
this?" and nobody could answer. There were 43 occurrences.

Nine of them generated concrete work:

```text
4 decisions reversed, then reversed back after an incident
3 long investigations to reconstruct the reason (2 to 5 days each)
2 decisions kept out of fear, with nobody knowing whether they still made sense
```

One case: a notifications service limited sending to 50 messages per second. Nobody knew
why. The limit was raised in an optimization, and three days later the SMS provider
blocked the account for exceeding the contract — which was 50 per second.

The team started writing ADRs, with a deliberately loose rule: **write one when the
discussion goes past an hour, or when you suspect someone will ask why.**

In two years, 61 ADRs. A usage sample showed:

```text
ADRs never consulted                            44
consulted at least once                         17
that prevented an improper reversal              6 (identified by name)
that changed conclusion during the writing       9
```

The 44 never consulted are the cost: about 30 hours of writing. The 6 that prevented
reversals paid for that several times over — each previous improper reversal had cost
days.

And the 9 that changed conclusion during the writing were the unforeseen effect. In all of
them, the author started writing the alternatives section and realized the discarded
option was better.

What the team records: the loose rule was right. An earlier attempt, at another company,
had used a strict criterion and an approval committee — and produced 4 ADRs in a year, all
written for the committee.

## Related Concepts

- [Why ADRs Matter](/18-architecture-decisions/why-adrs-matter.md) — the argument in detail.
- [ADR Structure](/18-architecture-decisions/adr-structure.md) — the sections.
- [Status](/18-architecture-decisions/adr-status.md) — the lifecycle.
- [Architecture as Decisions](/01-fundamentals/architecture-as-decisions.md) — the
  conceptual basis.

## Practical Exercise

Think of an architectural decision in your system whose reason you don't know.

Ask three people why it is that way. If the answers diverge — or if nobody knows — you have
found an ADR that should have been written.

## Interview Questions

- What distinguishes an ADR from system documentation?
- Why should an ADR not be edited when the decision changes?
- What practical test decides whether a decision deserves an ADR?

## Further Reading

- Nygard, Michael. *Documenting Architecture Decisions*. 2011.
- Keeling, Michael. *Design It!*. Pragmatic Bookshelf, 2017.
- Ford, Neal et al. *Fundamentals of Software Architecture*. O'Reilly, 2020.

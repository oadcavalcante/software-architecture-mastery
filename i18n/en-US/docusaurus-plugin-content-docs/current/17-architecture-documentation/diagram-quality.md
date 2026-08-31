---
id: diagram-quality
title: Diagram Quality
sidebar_position: 13
description: What separates a diagram that communicates from one that clutters — and the legend that almost never exists.
doc_type: concept
level: 5
difficulty: intermediate
status: complete
objective: >
  By the end, the reader produces diagrams legible to people who didn't draw them, with
  explicit notation and a defined scope.
prerequisites: [documentation-principles]
related: [c4-model, documentation-principles, living-documentation]
canonical_for: []
translated_from_version: 1
last_reviewed: 2026-08-31
---

# Diagram Quality

## Overview

A diagram exists to communicate. It fails when it requires someone to explain it.

The test is direct: **hand the diagram to someone who wasn't involved in drawing it, say
nothing, and watch.** The questions that person asks are the diagram's defects.

Most of them are avoidable, and the causes are few: no legend, inconsistent notation,
undefined scope, and noise.

## Problem

Architecture diagrams are usually produced for a presentation, with someone narrating. In
that context, they work — the narration fills the gaps.

Then they stay. And they are read without narration, by people who weren't at the
presentation.

```text
what does that color mean?
why is that box different?
is that arrow a call or a data flow?
what is a dashed line?
is that rectangle a system or a server?
```

Each of those questions is information that lived in the head of whoever drew it and never
made it onto the page.

## Core Concepts

### A legend is not optional

The simplest rule and the most violated: **every visual distinction has to be in the
legend**.

```text
different colors      what each one means
different shapes      same
solid and dashed lines  the difference
thicknesses           if any, what they indicate
```

And the inverse: if a distinction is not in the legend, it should not exist in the
diagram. A box with a different color "because it looked better" is noise the reader tries
to interpret.

The legend costs a few minutes and resolves most of the questions.

### Consistent notation across diagrams

If a blue rectangle is a service in one diagram and a database in another, the reader has
to relearn with every document.

```text
the same notation across the organization
few elements — three or four shapes suffice
stable meaning
```

See [C4 model](/17-architecture-documentation/c4-model.md) — it prescribes no notation, and it prescribes semantic
consistency.

A small set of conventions, documented once and reused, is what makes diagrams comparable.

### Labels on arrows, always

An unlabeled arrow communicates that a relationship exists and nothing about it.

```text
bad     A → B
good    A → B: "checks balance"
better  A → B: "checks balance before authorizing, synchronous HTTPS"
```

And the label has to say **what**, not just the mechanism. "HTTP" doesn't inform; "checks
balance, HTTP" does.

Bidirectional arrows deserve attention: they frequently hide two different relationships,
which are worth separating.

### Visible scope and date

```text
title          what this diagram shows
scope          which system, which level of abstraction
date           when it was updated
version        if applicable
author or owner  who answers for it
```

The date matters most: a diagram with no date is trustworthy indefinitely, which is
exactly the problem. See
[documentation principles](/17-architecture-documentation/documentation-principles.md).

### Fewer elements

```text
target        up to 12 boxes per diagram
above 20      the reader can't hold the whole thing
```

A diagram with 40 boxes doesn't communicate — it archives.

When the system is large, the way out is to **decompose into several diagrams**, each with
a framing and a purpose, and not to squeeze everything into one.

And there is a useful check: if you have to zoom in to read the labels, there are too many
elements.

### Layout communicates

Spatial arrangement conveys meaning, whether you want it to or not:

```text
flow from left to right, or top to bottom
related elements close together
no lines crossing unnecessarily
consistent alignment
```

Crossing lines are the most common visual defect, and they frequently indicate that the
layout wasn't thought through — or that there are too many elements.

Automatic generation tools produce reasonable layouts and not always good ones. See
[living documentation](/17-architecture-documentation/living-documentation.md) — the trade-off between controlled
layout and derived diagram is real.

### What not to put in

```text
detail that ages fast          versions, instance names
everything that exists         only what serves the question
decorative elements            icons that mean nothing
overlapping levels             see C4 model
```

The third deserves a note: technology icons — the database logo, the cloud logo, the
language logo — are attractive and frequently redundant with the label. They take up space
and add nothing.

### The absent-reader test

There is a cheap check that summarizes all the previous ones: **reread the diagram
imagining that whoever drew it is unavailable for questions.**

```text
do the elements have names that say what they are?
do the arrows say what travels?
does the legend explain every distinction?
does the title say what the scope is?
does the date say whether it still holds?
```

If any answer is no, the missing information lives only in one person's head — which is
precisely the condition documentation exists to eliminate. A diagram that only works with
its author present is not documentation; it is supporting material for a presentation.

## Mental Model

**If it needs narration, the diagram is incomplete.** The legend and the labels are what
make it self-contained.

## When to Use

These practices apply to any diagram meant to be read later. Priority when:

- The diagram will be consulted without whoever drew it.
- It documents a system, not a conversation.
- It will be maintained over time.

## When Not to Use

**With no legend**, when there is more than one shape or color.

**With different notation** in every document.

**With unlabeled arrows.**

**With no date.**

**With more than twenty boxes.**

**With detail that ages fast.**

And there is a legitimate exception: a disposable sketch, made for a conversation, needs
none of this. It does its job and is erased.

## Alternatives

- **Textual description** — for simple relationships, a paragraph can be clearer.
- **A table** — for many-to-many relationships, a matrix communicates better than a
  diagram with crossing lines.
- **Several smaller diagrams** — instead of one large one.
- **A generated diagram** — automatic consistency, with less layout control.

The second is underrated: a matrix of who calls whom is more legible than a diagram with
thirty arrows.

## Trade-offs

| Few elements | Many |
|---|---|
| Legible | Complete |
| Several diagrams | A single one |
| Framed by purpose | Global view |

| Hand-drawn | Generated |
|---|---|
| Controlled layout | Automatic |
| Ages | Always current |
| Expresses emphasis | Uniform |

## Failure Modes

**No legend.** Each reader interprets.

**Inconsistent notation.** Relearning with every document.

**Mute arrows.** A relationship with no meaning.

**Too many elements.** Archives instead of communicating.

**No date.** Trustworthy indefinitely.

**Crossing lines.** Hard to follow.

**Decoration with no meaning.** Noise the reader tries to interpret.

## Common Mistakes

**Not making a legend.** Shapes and colors only the author understands make the diagram illegible to whoever needs it most.

**Using color with no declared meaning.** The reader assumes the color means something and draws the wrong conclusion — worse than having no color.

**Unlabeled arrows.** "A points at B" doesn't say whether it is a synchronous call, an event or a database read, which is exactly what changes the understanding.

**Squeezing the entire system into one diagram.** Past a dozen elements, nobody follows. Several diagrams at different levels communicate more than one comprehensive one.

**Not dating it.** With no date, the reader doesn't know whether they are seeing today's system or one from three years ago — and assumes it is today's.

**Testing the diagram only with people who already know the system.** Those people fill the gaps with what they already know. The real test is having an outsider explain what they understood.

## Real-World Example

A technology company ran a simple exercise: it took the twelve most used architecture
diagrams and asked people from other teams to read them, with no explanation, noting their
questions.

The aggregate result:

```text
"what does that color mean?"          9 of the 12 diagrams
"is that arrow a call or data?"      11
"is that a service or a server?"      7
"when was this updated?"             12
"does this still exist?"              5
```

None of the twelve had a legend. None had a date.

And two of them described systems that had been replaced — which was only discovered
because an outsider asked.

The fixes were simple and the effect was large:

**A single notation convention**, documented on one page: four shapes, three colors, two
line thicknesses, each with a fixed meaning.

**A mandatory legend** on every diagram, generated automatically from the convention.

**A standard header** with title, scope, date and owner.

**Labels on every arrow**, with the purpose before the protocol.

**Diagrams generated from text**, versioned in the repository — which solved the date and
the existence problem: a diagram of a decommissioned system disappears when the repository
is archived. See
[living documentation](/17-architecture-documentation/living-documentation.md).

**A reading test** built into the review: a new diagram is read by an outsider before
being published.

Six months later, the same exercise was repeated with new diagrams. The average number of
questions per diagram dropped from 4.3 to 0.6.

What the team records: the highest-impact change was the simplest — requiring a legend. On
its own it resolved most of the questions, and it cost one line on the review checklist.

## Related Concepts

- [Documentation Principles](/17-architecture-documentation/documentation-principles.md).
- [C4 Model](/17-architecture-documentation/c4-model.md) — semantic consistency.
- [Living Documentation](/17-architecture-documentation/living-documentation.md) — generated diagrams.
- [Documentation Standards](/17-architecture-documentation/documentation-standards.md).

## Practical Exercise

Take a diagram from your team and hand it to someone on another team, saying nothing.

Write down the questions. Each one is information that was in your head and not in the
diagram.

## Interview Questions

- Why does every visual distinction have to be in the legend?
- Why do unlabeled arrows communicate little?
- When is a table better than a diagram?

## Further Reading

- Tufte, Edward. *The Visual Display of Quantitative Information*. 2nd ed., 2001.
- Brown, Simon. *Software Architecture for Developers*. Leanpub, 2015.
- Moody, Daniel. *The Physics of Notations*. IEEE TSE, 2009.

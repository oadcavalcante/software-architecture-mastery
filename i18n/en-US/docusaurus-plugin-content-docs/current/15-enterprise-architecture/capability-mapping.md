---
id: capability-mapping
title: Capability Mapping
sidebar_position: 6
description: How to build the map — the method, and the mistakes that produce a useless artifact.
doc_type: concept
level: 6
difficulty: advanced
status: complete
objective: >
  By the end, the reader runs a mapping exercise that produces a usable and maintained
  model.
prerequisites: [business-capabilities]
related: [business-capabilities, application-portfolios, business-architecture]
canonical_for: []
translated_from_version: 1
last_reviewed: 2026-08-31
---

# Capability Mapping

## Overview

[Business capabilities](/15-enterprise-architecture/business-capabilities.md) describes what they are and
what they are for. This document is about **how to build the map** — and how to avoid the mistakes that
produce a beautiful and useless artifact.

The exercise looks simple: list what the organization does. In practice, it easily slides into the org
chart, the processes or the systems — and each deviation produces a model that ages fast.

## Problem

A badly run mapping produces one of three bad results:

**A mirror of the org chart.** The capabilities correspond to departments. At the next reorganization, the
model is wrong.

**A list of processes.** Verbs instead of nouns, and the model changes when the process changes — which is
constantly.

**A system catalog with business names.** The capabilities were derived from what the systems do, and the
model merely renames the existing architecture.

All three happen because they are the path of least resistance: those are the structures people know.

## Core Concepts

### Start with the business, not with IT

An exercise run only by technology produces the third mistake. The capabilities need to come from whoever
operates the business.

The format that works:

```text
interviews with business leaders   what the area does, without talking about systems
a joint workshop                   consolidation, with business and technology
validation with the doers          the people who do the work
```

The third stage usually corrects the model: leaders describe what should happen; the doers know what
happens.

### The questions that produce capabilities

```text
"what does the area do?"          → tends to produce processes
"what does the business need
 to know how to do?"              → produces capabilities
"would this exist if we changed
 every system?"                   → tests independence from technology
"would this exist with another
 organizational structure?"       → tests independence from the org chart
"did this exist ten years ago?"   → tests stability
```

The last three are tests applied to each candidate item, and they eliminate most of the mistakes.

### Decompose top down

```text
1. the business's large areas       8 to 15 items
2. decomposition of each one        5 to 8 children per item
3. a third level where useful       not uniformly
```

The mistake of decomposing bottom up: starting by listing everything you do and grouping afterward produces
artificial categories and overlap.

And the third level does not need to exist everywhere. It is useful where mapping to systems requires
detail — typically in the differentiating capabilities.

### The exclusivity and exhaustiveness test

```text
exclusivity      two capabilities do not describe the same thing
exhaustiveness   together, they cover what the organization does
```

The practical exhaustiveness test: take five real activities of the organization and check whether each one
falls into exactly one capability.

The ones that fall into none reveal a gap. The ones that fall into two reveal overlap — and overlap is the
most common defect, because two areas describe the same capability with different words.

### The heat map is where the value appears

A capability map with no information overlaid is a diagram. What produces decisions:

```text
color by health          the state of the supporting systems
color by criticality     what stops the business
color by differentiation what distinguishes the organization
color by cost            where the money goes
number of systems        where there is duplication
```

See [application portfolios](/15-enterprise-architecture/application-portfolios.md).

And the most productive combination: **criticality against health**. It produces a short list of priorities
nobody argues with — critical capabilities supported by bad systems.

### How long, and when to stop

```text
a first draft         2 to 3 workshops, a few weeks
validation            2 to 4 weeks
mapping to systems    3 to 6 weeks, depending on the size
```

The sign that you are going too far: the discussions become about where a specific activity fits, instead
of about what to do with the information.

A model that is 80% correct and used is worth more than one that is 95% correct and debated for six months.

### The model needs to enter an existing process

A map built for an exercise and filed away dies. What keeps it:

```text
used in the budget discussion
used in prioritizing modernization
used in build-or-buy decisions
reviewed when the business changes
```

If it enters no recurring decision, it is not worth the cost of maintaining — and the honest conclusion is
that it should not have been built.

## Mental Model

**The map is worth what gets overlaid on it.** Building it is the easy part; using it is what keeps it
alive.

## When to Use

- Before technology investment decisions.
- To identify duplication between systems.
- In modernization programs.
- After acquisitions, to compare organizations.
- When business and technology cannot talk about priority.

## When Not to Use

**Run only by technology.**

**Decomposing bottom up.**

**Seeking excessive precision.**

**With no information overlaid.**

**Entering no decision process.**

**Copying an industry reference model** with no adaptation — it describes the industry, not the
organization.

## Alternatives

- **A value stream map** — process-oriented, better for optimizing workflow.
- **Domain mapping** — oriented toward software boundaries. See [DDD](/04-domain-driven-design/index.md).
- **A system inventory** — with no business lens, cheaper.
- **An industry reference model** — a starting point, with adaptation.

The last accelerates the start and produces a generic model if it is not adapted rigorously.

## Trade-offs

| Three levels | Two |
|---|---|
| Detail for mapping systems | Simpler |
| More maintenance | Less |

| Run with the business | Only by IT |
|---|---|
| A shared vocabulary | It renames systems |
| Slower | Fast |
| Used in the budget decision | Stays in IT |

## Failure Modes

**A disguised org chart.**

**Processes instead of capabilities.**

**Overlap.** The same thing in two places.

**A gap.** Activities that fit in none.

**Excessive precision.** Months debating where things fit.

**A model with no use.** Built and filed away.

## Common Mistakes

**Running it without the business.** A map drawn only by the technical area describes systems under another
name, and the business does not recognize itself in it — which makes it useless for the conversation it
existed to have.

**Decomposing bottom up.** Starting from the existing systems reproduces the current architecture and hides
the capability no system serves — which is precisely the most valuable information.

**Not applying the stability tests.** If an item on the map disappears when the company changes tool or
structure, it was not a capability; it was a process or a system with a capability's name.

**Not validating with the doers.** A map validated only with the board describes how the company thinks it
works. The doers know where there is informal and duplicated capability.

**Not overlaying information.** A map with no cost, criticality or health overlaid is an org chart of
nouns. The information layers are what make it a decision instrument.

**Not connecting it to an existing decision process.** A map that enters neither planning nor investment
prioritization is delivered, praised and forgotten.

## Real-World Example

An energy company ran two capability mapping exercises two years apart.

**The first** was run by the architecture area, from the system inventory. It took three weeks and produced
84 capabilities.

It was never used. The later interviews explained why: the capabilities had names the business did not
recognize — they described what the systems did, with translated technical vocabulary.

"Metering management" was a system's name. The business called that "reading and billing", and they were
not the same thing: the system did part of what the business understood by reading, and none of the
billing.

**The second** was run with the business areas, in four workshops.

It produced 11 level 1 capabilities and 58 at level 2 — and the vocabulary was what people used.

Three differences in the result:

**Duplication revealed.** The capability "customer service" was served by five systems, each from one area,
none aware of the others. The first exercise had not seen that, because each system had become its own
capability.

**A gap revealed.** A capability the business considered critical — "demand forecasting" — had no system.
It was done in a spreadsheet, by three people.

**Prioritization unblocked.** The budget discussion came to happen over the map. The business could take
part, because it recognized the names.

The criticality-against-health heat map produced a list of six priority capabilities, accepted with no
dispute — which had not happened in any previous cycle.

The first exercise was technically competent and produced a correct artifact. It was a map of the system
architecture under different names, and so it did not serve the purpose — which was enabling the
conversation with the business.

## Related Concepts

- [Business Capabilities](/15-enterprise-architecture/business-capabilities.md) — the concept.
- [Application Portfolios](/15-enterprise-architecture/application-portfolios.md) — the overlay.
- [Business Architecture](/15-enterprise-architecture/business-architecture.md).
- [Technical Strategy](/15-enterprise-architecture/technical-strategy.md).

## Practical Exercise

List five real activities your organization performs and check whether each one falls into exactly one
capability of your model.

The ones falling into two reveal overlap; the ones falling into none, a gap.

## Interview Questions

- Which tests eliminate the most common mapping mistakes?
- Why decompose top down?
- Why does running it without the business produce a useless map?

## Further Reading

- Ulrich, William; Rosen, Michael. *The Business Capability Map*. Cutter Consortium, 2011.
- Open Group. *TOGAF Standard* — business architecture.
- Ross, Jeanne et al. *Enterprise Architecture as Strategy*. HBS Press, 2006.

---
id: adr-decision
title: The Decision
sidebar_position: 5
description: The shortest section of the ADR — active voice, bounded scope, no hedging.
doc_type: concept
level: 5
difficulty: intermediate
status: complete
objective: >
  By the end, the reader writes the decision unambiguously and knows how to bound its
  scope.
prerequisites: [adr-structure]
related: [adr-context, adr-consequences, adr-status]
canonical_for: []
translated_from_version: 1
last_reviewed: 2026-08-31
---

# The Decision

## Overview

The decision section is the shortest in the ADR and the easiest to write badly. It has to
answer one question with one sentence: **what was decided?**

Three properties define it:

```text
active voice   "we will use X", not "it is recommended to evaluate X"
clear scope    where it applies and where it doesn't
no hedging     no "probably", "for now", "unless"
```

The typical size is two to five lines. If it grows, it is generally because it has become
implementation, or because it is several decisions.

## Problem

What you find in real ADRs:

```text
"Following evaluation, it is understood that PostgreSQL would be the most
appropriate option for the current context, and may be reassessed as things evolve."
```

That is not a decision. You cannot tell whether anything was decided, who decided, whether
it holds, or where.

The defensive language has a cause: whoever writes fears committing and fears being wrong.
But the ADR exists precisely to record a commitment — and a commitment recorded with
hedging can be neither followed nor challenged.

And there is a second, subtler problem: the decision that describes **how** instead of
**what**. It turns the ADR into a specification, which ages at the speed of the code.

## Core Concepts

### Active and committed voice

```text
bad    "The use of PostgreSQL is recommended."
bad    "It was decided to use PostgreSQL."
bad    "PostgreSQL seems appropriate."
good   "We will use PostgreSQL as the primary database for the orders services."
```

The second looks acceptable and isn't: the passive voice erases who decided, and that is
exactly the information someone will want two years from now.

Choosing "we will" is not stylistic. It signals that a commitment was made — which is what
distinguishes an ADR from a technical evaluation.

### Bounded scope

A decision with no scope is impossible to apply and impossible to supersede:

```text
vague  "We will use Kafka."
clear  "We will use Kafka for domain events between the orders, billing and
       inventory services. Synchronous communication between those services
       remains HTTP. Other domains are not affected."
```

The scope answers three questions: **where it applies, where it doesn't, and what stays as
it is.**

The third is frequently omitted and it prevents expansive interpretation — the reading that
the decision replaces everything that existed before.

### The what, not the how

```text
decision         "We will separate the billing service."
implementation   "We will create a new repository, with Spring Boot 3,
                 using template X, with pipeline Y and database Z."
```

The second ages in months and is not what the ADR needs to preserve. Implementation details
belong in the code or in a design document.

The useful boundary: if the information changes without the decision changing, it is
implementation.

### One decision per ADR

When the decision section has several paragraphs with "and also", there are generally
independent decisions coupled together:

```text
"We will adopt Kafka, migrate the database to PostgreSQL and separate the
billing service."
```

Three decisions, three contexts, three sets of alternatives, three possibilities of
independent superseding. Recorded together, none of them can be revisited on its own.

The test: **could one of them be reversed without the others?** If so, they are separate
ADRs.

### Recording who decided

```text
authors      who wrote it
deciders     who had the authority and exercised it
consulted    who gave an opinion without deciding
```

The distinction between author and decider matters in large organizations, where whoever
writes is frequently not whoever decides. And recording who was consulted protects against
the later reading that the decision was unilateral.

See [governance](/19-architecture-governance/index.md).

### Recorded disagreement

When there is relevant disagreement and the decision is made anyway, recording that is more
valuable than it seems:

```text
"Two people on the team argued for alternative B, out of concern about the
operational cost. The decision was made accepting that risk, with a review
planned in 6 months."
```

That preserves the information that the objection existed — which is exactly what you want
to know if the risk materializes. And it makes the ADR honest in a way that sustains the
practice better than the appearance of consensus.

### Decisions not to act

An underused category: recording what was decided **not** to do.

```text
"We will keep the monolith and not adopt microservices this cycle."
"We will not build a distributed cache layer."
```

Those decisions are invisible in the code — there is nothing to point at — and they are
exactly the ones that will be revisited repeatedly with no record.

### The decision has to be actionable

A final test before closing the section: **can someone act on it without asking anything?**

```text
not actionable   "We will standardize communication between services."
actionable       "Communication between services in the orders domain becomes
                 HTTP with a contract declared in OpenAPI, versioned in the
                 producer's repository. New calls follow this from today;
                 existing ones migrate when they are touched."
```

The difference lies in three elements: **what**, **where it applies** and **from when**. The
third is the most forgotten — a decision with no temporal marker leaves open whether
existing code has to change, and that ambiguity tends to be resolved differently by each
team.

## Mental Model

**One sentence, in the active voice, with a scope.** If it doesn't fit in five lines, it is
several decisions or it is implementation.

## When to Use

- In every ADR.
- With explicit scope whenever the decision could be read expansively.
- Recording disagreement when there was any.

## When Not to Use

**With hedging.** "Probably", "for now", "subject to review" — review is the superseding
mechanism, not a caveat.

**In the passive voice.**

**Describing implementation.**

**With several decisions together.**

**With no scope**, when the system has more than one domain.

**As a proposal.** A proposal has status `proposed`; the decision section stays
affirmative.

## Alternatives

- **Y-Statement** — compresses context, decision and consequence into one structured
  sentence.
- **The decision implicit in the title** — for trivial cases, the title is already the
  decision, and the section details the scope.
- **A reference to a standard** — when the decision is to adopt something already defined
  elsewhere. See [standards](/15-enterprise-architecture/standards.md).

## Trade-offs

| Narrow scope | Broad |
|---|---|
| Clear application | Fewer ADRs |
| More ADRs | Ambiguous in application |
| Supersedable on its own | Superseded as a block |

| Recorded disagreement | Apparent consensus |
|---|---|
| Honest and useful later | Less immediate friction |
| Preserves the objection | Looks more solid |
| Requires team maturity | Easy |

## Failure Modes

**Hedging.** The decision can be neither followed nor challenged.

**Passive voice.** Nobody decided.

**No scope.** Applied where it shouldn't be, or ignored where it should be.

**Implementation recorded.** The ADR ages with the code.

**Several decisions together.** None revisitable on its own.

**Disagreement erased.** When the risk materializes, nobody knows it was foreseen.

## Common Mistakes

**Writing the decision as the conclusion of an analysis**, instead of as a commitment.

**Omitting what doesn't change** — which leaves room for expansive interpretation.

**Not recording the deciders.**

**Not recording decisions not to act.**

**Softening the decision** to reduce friction in review — which transfers the friction to
the future.

## Real-World Example

A financial services company had a 2022 ADR with the following decision:

```text
"Adopt event-driven architecture to decouple the services."
```

No scope, no boundary, no statement of what stayed the same.

Two years later, an internal audit found the effect:

```text
services that adopted events for everything, including queries    4
services that ignored the decision                                6
services with a mixed approach and no criterion                   9
distinct interpretations of the ADR found in interviews           5
```

The first four were the most problematic: simple synchronous queries had been converted
into request-response event pairs, with manual correlation and response times in seconds.
See [event-driven integration](/08-integration-architecture/event-driven-integration.md).

The investigation showed the original ADR had been written after a discussion in which the
scope **was clear to those present**: events for propagating state changes between domains,
keeping synchronous HTTP for queries. None of that was written down.

The ADR was superseded by another, with a bounded decision:

```text
"We will use domain events to propagate state changes between the
orders, billing and inventory domains.

We will not use events for queries: reads between services remain
synchronous HTTP.

Domains outside the three named are not affected by this decision.

Two people argued for extending the decision to all domains; the
objection was that the others don't have volume to justify the
operational cost. Reassess when any of them exceeds 50 events/s."
```

And a writing rule was adopted: **every decision needs a sentence starting with "we will
not"**. The justification was empirical — of the 12 ADRs that had produced divergent
interpretation, 11 did not bound what was left out.

Fixing the four services took seven months. Response time for the converted queries dropped
from 2.4 s to 90 ms.

In the retrospective: the original ADR was not wrong. It was incomplete in a way that was
only visible to whoever hadn't been in the conversation — which is exactly the document's
audience.

## Related Concepts

- [ADR Structure](/18-architecture-decisions/adr-structure.md).
- [Context](/18-architecture-decisions/adr-context.md) — what justifies it.
- [Consequences](/18-architecture-decisions/adr-consequences.md) — what is accepted.
- [Status](/18-architecture-decisions/adr-status.md) — proposed versus accepted.

## Practical Exercise

Take three ADRs from your team and check whether each one explicitly says what does **not**
change.

Then ask two people who weren't involved what each decision's scope is. The divergence
between the answers measures what was missing.

## Interview Questions

- Why is the passive voice a problem in a decision section?
- Why does bounding what doesn't change prevent expansive interpretation?
- When is recording disagreement worth more than recording consensus?

## Further Reading

- Nygard, Michael. *Documenting Architecture Decisions*. 2011.
- Keeling, Michael. *Design It!*. Pragmatic Bookshelf, 2017.
- Ford, Neal et al. *Software Architecture: The Hard Parts*. O'Reilly, 2021.

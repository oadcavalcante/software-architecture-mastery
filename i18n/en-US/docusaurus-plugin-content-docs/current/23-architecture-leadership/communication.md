---
id: communication
title: Architecture Communication
sidebar_position: 6
description: Changing the message's axis according to the audience — not simplifying, translating.
doc_type: concept
level: 7
difficulty: advanced
status: complete
objective: >
  By the end, the reader communicates the same decision in terms of risk, cost and capacity
  according to who is listening, without losing precision.
prerequisites: [architecture-leadership-basics]
related: [architecture-presentations, stakeholder-management, technical-influence]
canonical_for: []
translated_from_version: 1
last_reviewed: 2026-08-31
---

# Architecture Communication

## Overview

The most common complaint architects make about their organization is that "leadership doesn't
understand technology". The correct diagnosis is usually the reverse: the message was delivered on
the wrong axis.

```text
for engineers   what the design is, what the technical consequences are
for product     what it enables or prevents, and when
for leadership  what risk it reduces, what it costs, what happens
                if we don't
for operations  what changes on call
for finance     what the effect on the bill is, and when
```

The difference between those versions is not one of depth. It is one of **axis**. Leadership
doesn't need a simplified diagram — it needs the same decision expressed in risk and capacity, with
the same precision.

## Problem

The pattern that produces failure:

```text
the architect prepares a good presentation
it describes the technical problem, the technical solution and the design
leadership listens, asks no questions, and doesn't approve
the architect concludes the organization doesn't value architecture
```

What happened: the presentation answered "what is the correct architecture?", and the people in the
room needed to answer "is this worth the investment, compared with the other things I could fund?".

No amount of technical rigor answers the second question. And simplifying the diagram doesn't help
— the problem is not complexity, it is irrelevance to the decision at hand.

The symmetrical error: simplifying until the information is gone. A proposal reduced to "we need to
modernize" allows nothing to be assessed, and whoever hears it perceives there is no substance.

## Core Concepts

### Altitude, not simplification

```text
high altitude    business consequence, risk, cost, timeline
mid altitude     capabilities, dependencies, what changes for whom
low altitude     design, technology, mechanism
```

The same decision exists at all three altitudes, with full precision at each. Rising in altitude is
not removing detail — it is **changing what is being described**.

```text
low     "we will introduce a queue between the order and the payment
        authorization, with a transactional outbox"
mid     "order creation stops depending on the partner's availability;
        the customer starts receiving confirmation afterwards,
        which requires a change to the screen and to support"
high    "today we lose about $2.8 million a year in sales
        during partner outages. This change eliminates most of
        that, costs three months of one team and requires
        a product change on the confirmation screen"
```

All three are true and none is a diluted version of the others.

### Start with the consequence, not the context

Engineers are trained to build the argument: context, analysis, conclusion. For executive
audiences, the correct order is the reverse.

```text
engineering order   context → analysis → proposal → ask
executive order     ask → reason → consequence of not doing it
                    → detail on demand
```

The practical reason: whoever is listening has limited time and will decide whether to hear more.
Delivering the conclusion first lets the conversation go straight to what matters to whoever
decides, rather than following the presenter's script.

### Numbers instead of adjectives

```text
weak     "the current system is fragile and hard to maintain"
strong   "we had 41 hours of downtime last year,
         and the time from a change request to production is
         14 weeks"
```

Adjectives are interpretable and dismissible. Numbers are debatable, and a debate about numbers is
a productive conversation — even if it concludes that the number is wrong.

See [measuring outcomes](/23-architecture-leadership/measuring-architecture-outcomes.md).

### Name what happens if nothing is done

This is the element most frequently absent and the most decisive in investment conversations.

```text
"if we do nothing, the license cost grows 18% a year,
 and the two people who know how to operate the system
 retire in 2028"
```

Without it, the proposal competes with other investment proposals on equal terms. With it, it
competes with the alternative of doing nothing — which is the real comparison.

### Speak in the currency of whoever is listening

```text
business leadership   revenue, risk, time to market
finance               cost, predictability, contract
operations            on-call, incidents, load
product               capability, timeline, what gets left out
legal and compliance  exposure, obligation, regulatory deadline
engineering           design, trade-off, technical consequence
```

Each audience has a unit it thinks in. Translating into it is not manipulation — it is the
condition for the information to be usable by whoever receives it.

See [stakeholder management](/23-architecture-leadership/stakeholder-management.md).

### Write before presenting

A written document forces a clarity a presentation does not. Slides tolerate gaps in reasoning that
a paragraph does not.

```text
write first        exposes the weak argument before the meeting
present directly   the weak argument appears during it
```

And the document has a later use: it is what remains when the meeting ends, and what the people who
weren't there will read.

### What you don't say also communicates

```text
"I'm not going to cover the detailed operating cost now, but it
 is in the document — the summary is that it increases by about
 $8 thousand a month"
```

Signaling what was left out, with a summary, is different from omitting it. Perceived omissions
destroy credibility; declared omissions build it.

## Mental Model

**The same decision, a different axis.** Start with the consequence, use numbers, and say what
happens if nothing is done.

## When to Use

- In any communication of an architectural decision outside the team.
- Especially when there is an investment to approve.
- Always with the axis chosen from who is listening.

## When Not to Use

**Simplifying** instead of translating.

**Starting with the context** with executive audiences.

**With adjectives** where numbers are available.

**Without saying what happens if nothing is done.**

**With no written document** for relevant decisions.

**Omitting without signaling.**

## Alternatives

- **A document instead of a presentation** — for complex decisions, a text read before the meeting
  yields more than slides.
- **An individual conversation beforehand** — aligning with each stakeholder separately is usually
  more effective than persuading a group.
- **A demonstration** — where applicable, showing it working is worth more than any argument.

The second is the most underrated: decision meetings rarely change positions; they confirm
positions formed beforehand.

## Trade-offs

| Technical detail | High altitude |
|---|---|
| Precision for whoever builds | A decision for whoever funds |
| Illegible to executives | Insufficient for engineering |

| Document | Presentation |
|---|---|
| Forces clarity, persists | Interactive, adjusts live |
| Requires that they read it | Tolerates gaps |

## Failure Modes

**Wrong axis.** Technical rigor irrelevant to the decision.

**Simplification.** Loses substance without gaining relevance.

**Adjectives.** Dismissible.

**No do-nothing alternative.** It competes in the wrong place.

**No document.** Nothing remains after the meeting.

**Perceived omission.** It destroys credibility.

## Common Mistakes

**Presenting the diagram** to whoever decides the budget.

**Building the argument in engineering order** for executive audiences.

**Not quantifying** the current problem.

**Not having the individual conversations** before the meeting.

**Believing the organization doesn't value architecture**, when the problem is translation.

## Real-World Example

A retail company had a stock system modernization proposal rejected twice by leadership. The
architecture group considered the proposal obviously correct.

The first presentation, 34 slides, covered: the current architecture, technical problems, the
target architecture, the migration plan, and technical risks. Leadership asked three questions and
did not approve.

The third attempt was restructured with help from the finance group. It began like this:

```text
"We are asking for $840 thousand and 14 months to replace the
 stock system.

 The reason: today we lose about $1.8 million a year in sales
 not made because of downtime and false stockouts —
 product that is in the store and the system doesn't know it. That
 number comes from the study the commercial team did in March.

 If we do nothing: the vendor's contract reprices 14% a
 year, and the system doesn't support the omnichannel operation in the
 business plan for 2027. Without it, that initiative doesn't
 happen.

 This proposal's risk is execution risk. I'll detail next how
 we mitigate it, and the plan has exit points at each phase."
```

Four paragraphs. The ask, the reason with a number, the consequence of not doing it, the risk
acknowledged.

Leadership asked 22 questions and approved in the same meeting. The questions were about: the
reliability of the $1.8 million figure, the exit points, who would operate the new system, and what
would happen to the team maintaining the current one.

No question was about architecture.

**The technical content did not change.** The target architecture was the same as in the two
rejected proposals. The migration plan was the same. What changed was the axis and the order.

**The $1.8 million figure already existed.** It was in a study by the commercial team, and the
architecture group had not used it because they didn't consider it a "technical argument".

**The consequence of not doing it** was the decisive element, according to the director themselves:
the connection to the omnichannel initiative turned the proposal from a "technical improvement"
into a "prerequisite for a business bet that has already been approved".

**The 34 slides became an appendix.** They continued to exist and were used in conversations with
engineering — on the right axis, for the right audience.

The practice that stuck: every proposal above a threshold came to require three versions — a
one-pager for leadership, a two-pager for product and operations, and the complete technical
document. And a rule that the number quantifying the problem has to come from a group other than
engineering, so it isn't read as self-interest.

## Related Concepts

- [Presentations](/23-architecture-leadership/architecture-presentations.md).
- [Stakeholder Management](/23-architecture-leadership/stakeholder-management.md).
- [Technical Influence](/23-architecture-leadership/technical-influence.md).
- [Measuring Outcomes](/23-architecture-leadership/measuring-architecture-outcomes.md).

## Practical Exercise

Take an architectural proposal of yours and write it in four paragraphs: the ask, the reason with a
number, what happens if nothing is done, and the risk acknowledged.

If you don't have the number, that is the gap — and it is probably the reason the proposal hasn't
advanced.

## Interview Questions

- What is the difference between simplifying and changing altitude?
- Why is the presentation order for executives the reverse of engineering's?
- Why is "what happens if nothing is done" the most decisive element?

## Further Reading

- Hohpe, Gregor. *The Software Architect Elevator*. O'Reilly, 2020.
- Minto, Barbara. *The Pyramid Principle*. Pearson, 2009.
- Larson, Will. *Staff Engineer*. Self-published, 2021.

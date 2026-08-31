---
id: non-functional-requirements
title: Non-Functional Requirements
sidebar_position: 8
description: How well the system does what it does — and why without a number they are not requirements.
doc_type: foundation
level: 1
difficulty: beginner
status: complete
objective: >
  By the end, the reader converts vague wishes into verifiable requirements with
  a stated number, window and consequence.
prerequisites: [functional-requirements]
related: [quality-attributes, constraints]
canonical_for: [non-functional requirements]
translated_from_version: 1
last_reviewed: 2026-08-29
---

# Non-Functional Requirements

## Overview

Non-functional requirements describe **how well** the system does what it does:
how fast, how reliably, under what volume, with what security, at what cost.

They are what decides the architecture. And they are the ones that almost always
arrive without a number.

## The Problem

"The system needs to be fast and reliable" appears in practically every
requirements document. The sentence is not a requirement — it is a wish, and one
nobody would contest.

A requirement must be verifiable. "Fast" cannot be: there is no test that confirms
or refutes it. That means it constrains no architectural decision, which in turn
means it does not do the job non-functional requirements exist to do.

Without a number, three things break: there is no criterion for choosing between
alternatives, no way to know whether the system is adequate, and no basis for
negotiating when the cost appears.

Converting a wish into a number is the most valuable and most frequently skipped
part of requirements gathering.

## Core Concepts

### A non-functional requirement has three parts

Miss any one of them and it goes back to being a wish.

**Metric** — what is measured, without ambiguity.
**Number and window** — the value and the period over which it holds.
**Consequence** — what happens if it is not met.

```text
wish:        "Searches need to be fast."

requirement: 95% of searches respond in under 300 ms,
             measured as a percentile over the last hour,
             during business hours.
             Above that, cart abandonment rises.
```

The third part is the one usually missing and the one that matters most. Without a
stated consequence, the number is arbitrary — and an arbitrary number does not
survive the first conversation about cost.

### Always percentiles, never averages

Latency reported as an average hides exactly what users experience.

A system averaging 200 ms may have 5% of requests above 3 seconds. Those 5% are
real, they belong to real users, and the average will never reveal them. In
systems with many calls per operation, the tail becomes the common case: a page
making twenty independent calls has a high probability of hitting at least one at
the 95th percentile.

A latency requirement without a stated percentile is a malformed requirement.

### Cost grows non-linearly

Each additional nine of availability costs disproportionately more.

| Availability | Downtime/year | What it usually requires |
|---|---|---|
| 99% | ~3.6 days | Single instance, manual recovery |
| 99.9% | ~8.8 hours | Redundancy, automated failover |
| 99.99% | ~53 minutes | Multi-zone, no maintenance window |
| 99.999% | ~5 minutes | Multi-region active-active, dedicated operations |

That table is the most useful instrument in a requirements conversation. Asking
"do you want 99.9% or 99.99%?" without it always produces the larger answer. With
it, it produces an informed decision — and frequently the answer becomes "99.9% is
fine".

### Not every attribute applies equally

A system does not maximize every attribute. Optimizing consistency costs latency;
optimizing cost costs redundancy. Non-functional requirements have to be
prioritized, and the prioritization is a business decision informed by
engineering.

A document listing ten attributes as "high priority" prioritized nothing.

## Mental Model

**If you cannot write the test that verifies it, it is not a requirement.**

The test need not be automated — it can be a query against a dashboard, a monthly
measurement. It has to be possible to look at the system and say, without debate,
whether it meets the requirement.

## Why This Matters

**Because they are what chooses the architecture.** Functional requirements say
what to build; non-functional ones say how. The difference between the same
feature at 100 and at 100,000 requests per second is the entire architecture.

**Because without a number there is no negotiation.** When the cost of 99.99%
appears, the conversation is only possible if there is a number on the table and a
consequence attached to it. With "it needs to be reliable", the conversation
becomes opinion versus budget.

**Because they make adequacy verifiable.** A system can be declared adequate or
inadequate against requirements with numbers. Against wishes, you can only have
impressions.

## Common Mistakes

**Accepting adjectives.** "Fast", "scalable", "secure", "reliable". Each has to
become a metric, a number, a window and a consequence before entering the
document.

**Asking for the maximum out of caution.** Stakeholders ask for 99.99% because
asking costs nothing. It does cost — the cost just shows up in engineering.
Presenting the cost table before the question changes the answer in most cases.

**Using an average instead of a percentile.** See above. It is the most common
technical mistake in the field.

**Forgetting the window.** "99.9% availability" without a period is ambiguous: per
month it allows 43 minutes; per year, 8.8 hours. The difference is architectural.

**Treating cost as not being a requirement.** Operational cost is a quality
attribute like any other, and frequently the most binding. An architecture that
meets all the others and does not fit the budget does not meet the requirements.

**Defining requirements nobody measures.** A requirement with no corresponding
instrumentation is an intention. If the system does not emit the data that would
verify the requirement, nobody will know when it is violated.

## Real-World Example

Initial gathering for an invoicing system:

> "It needs to be highly available and process invoices quickly."

Conversion through consequence questions:

*What happens if it is down for an hour during business hours?* — The shops cannot
invoice. Estimated loss of R$ 40,000 per hour.

*And outside business hours?* — Nothing.

*How long can issuing take?* — The customer is waiting at the till. Above 5
seconds, the queue jams.

*And if the tax authority is down?* — You issue in contingency mode and transmit
later. That is permitted for up to 24 hours.

Resulting requirements:

- 99.9% availability **from 8am to 8pm on business days**. Outside that window,
  99% is enough.
- 99% of issuances under 5 s, percentile over the last hour.
- Contingency mode activated automatically when the tax authority does not
  respond, with transmission within 24 h.

The third requirement was not in the original request and is the one that most
affects the architecture — it demands a durable queue, reconciliation and a state
machine.

Note also that the restricted window in the first requirement substantially
reduces cost, without losing anything the business needed.

## Related Concepts

- [Quality Attributes](quality-attributes.md) — the taxonomy behind these
  requirements.
- [Constraints](constraints.md) — what is not negotiable.
- [Reliability](/12-reliability/index.md) — where SLI, SLO and SLA formalize
  this.

## Practical Exercise

Take your team's most recent requirements document and mark every quality
adjective without a number.

For each, write the three parts: metric, number with window, consequence. Where
you do not know the consequence, that is the question to take to the stakeholder.

## Interview Questions

- How do you turn "the system needs to be fast" into a requirement?
- Why percentiles and not averages?
- How do you run the conversation when someone asks for 99.99% without knowing
  the cost?

## Further Exploration

- Beyer, Betsy et al. *Site Reliability Engineering*. O'Reilly, 2016 — the
  chapters on SLOs and error budgets.
- Bass, Len; Clements, Paul; Kazman, Rick. *Software Architecture in Practice*.
  4th ed., 2021 — quality attribute scenarios.

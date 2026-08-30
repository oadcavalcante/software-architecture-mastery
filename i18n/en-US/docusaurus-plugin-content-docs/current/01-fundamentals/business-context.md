---
id: business-context
title: Business Context
sidebar_position: 4
description: Why the same technical solution is right at one company and wrong at another.
doc_type: foundation
level: 1
difficulty: beginner
status: complete
objective: >
  By the end, the reader identifies the business factors that constrain an
  architecture and knows how to extract the missing information from
  stakeholders.
prerequisites: [what-is-software-architecture]
related: [problem-space, constraints]
canonical_for: [business context]
translated_from_version: 1
last_reviewed: 2026-08-30
---

# Business Context

## Overview

The same architecture can be excellent at one company and disastrous at another,
with the same technical problem. The difference is the business context: what the
company is trying to do, with how much money, in how much time, under which rules,
with how many people.

Ignoring that context produces architectures that are technically defensible and
organizationally unviable — which are the ones that do not survive.

## The Problem

Engineers are trained to optimize technical properties: latency, throughput,
availability, elegance. None of those properties has value in itself. They have
value to the extent that they sustain something the business needs.

The classic symptom: a team spends six months building a platform capable of
absorbing a hundredfold growth, for a product that does not yet know whether it
will have users. The engineering is good. The decision is bad — because the
dominant risk was market risk, not scale, and the six months went into reducing
the wrong risk.

The opposite happens too: a system processing financial transactions built with
the same tolerance for inconsistency as a social feed, because nobody asked what
happens when a figure comes out wrong.

In both cases the failure is the same. The architecture answered a technical
question without having established which business question was being answered.

## Core Concepts

### What makes up the context

Five groups of factors constrain architecture before any technical discussion
starts.

**Business model.** How the company makes money determines what a failure costs.
Downtime in a transactional marketplace costs revenue per minute; in an internal
tool, it costs productivity. The two figures differ by orders of magnitude and
justify different investments.

**Stage.** A company searching for product fit needs speed of change above all
else, because it will throw away much of what it builds. A company at scale needs
stability, because the cost of being wrong has gone up. The same architectural
decision — say, investing in abstraction to be able to switch providers — is
prudence at one and waste at the other.

**Regulatory constraints.** Where data may reside, how long it must be retained,
what has to be auditable, who may see what. They are not negotiable, and they
frequently eliminate entire options before the first technical meeting.

**Economics.** Budget, whether it is capital or operating expenditure, and the
horizon over which the investment has to pay for itself.

**Organization.** How many people, with what skills, distributed how. An
architecture that requires a skill the company does not have and will not hire is
an architecture that will not exist. This factor returns forcefully in
[Level 07](../23-architecture-leadership/index.md), via Conway's law.

### The questions that extract the context

Stakeholders rarely offer this context in organized form. It is extracted, and the
questions that work are concrete:

- How does the company make money from this system?
- What happens, in business terms, if it is down for an hour? And for a day?
- What does a wrong piece of data cost? Does anyone notice? Who pays?
- What regulation applies, and what does it forbid?
- When does this need to be ready, and what happens if it slips two months?
- How many people will be maintaining this a year from now?

Vague questions — "what are the non-functional requirements?" — produce vague
answers. Questions about consequence produce numbers.

### Context changes; architecture has to keep up

Business context is not a survey you do once. Companies change stage, enter
regulated markets, grow or shrink teams.

An architecture that was right for the context of three years ago may be wrong
today without anything technical having changed. Recognizing that is the subject of
[architecture evolution](architecture-evolution.md).

## Mental Model

Before any technical decision, answer: **which risk does this decision reduce, and
is that the largest risk we have?**

The question works because it forces a comparison. Almost every architectural
decision reduces some risk. What distinguishes a good decision is reducing the
dominant risk — and the dominant risk is a property of the business context, not
of the system.

## Why This Matters

**Because it determines what "good" means.** Without context, "good architecture"
becomes aesthetic preference. With context, it becomes verifiable fit: does this
architecture sustain what the company needs to do, within what it can pay for and
operate?

**Because it is what lets you defend a decision.** A technical argument convinces
engineers. An argument that connects the technical decision to a business
consequence convinces whoever approves the budget — and that is the conversation
that determines whether the architecture will exist at all.

**Because it avoids reducing the wrong risk.** It is the most common waste and the
most invisible one, because the work done is of good quality. Nobody points at a
mistake in a well-built system; you only notice, late, that it solved a problem
that was not the bottleneck.

## Common Mistakes

**Treating context as a product concern.** Architecture decided without business
context optimizes by default — usually for scale or technical purity, which are
rarely the dominant risk.

**Accepting "it needs to be fast and reliable" as a requirement.** It is not a
requirement; it is a wish. A requirement is "95% of searches under 300 ms" or "at
most 4 hours of downtime per year". Converting a wish into a number is
architectural work, and it is where context enters.

**Designing for the promised growth rather than the likely one.** Every company
expects to grow a hundredfold. The useful question is not what ceiling is being
imagined, but what growth the next twelve months hold and what it costs to defer
the scaling decision until then.

**Confusing what the business asks for with what the business needs.**
Stakeholders describe solutions — "we need a real-time dashboard". The work is to
back up to the problem: what decision will be made with that data, and with what
delay is it still useful? The answer frequently removes "real-time" from the
requirement, and half the complexity with it.

**Assuming context instead of asking.** Especially about regulation and about the
cost of wrong data — two subjects where engineering intuition tends to be wrong by
orders of magnitude, in both directions.

## Real-World Example

A logistics company asks for a real-time delivery tracking system. The team
sketches an event-driven architecture, WebSockets, sub-second updates.

Three questions changed the whole design.

*Who consumes this information?* Call-centre operators, who check status when a
customer calls. Nobody keeps a screen open watching continuously.

*How often does the position actually change in a meaningful way?* At each stop —
on average, every eighteen minutes.

*What happens if the information is five minutes stale?* Nothing. The operator
says "out for delivery" or "on the way", and five minutes does not change the
answer.

The delivered system does a query with a two-minute cache. It cost a fraction of
the original sketch, has a fraction of the operational complexity, and meets the
need in full.

The part worth attention: the original sketch was not technically wrong. It
answered the request correctly — "real-time" — which was the solution the
stakeholder had imagined, not the problem they had.

## Related Concepts

- [Problem Space](problem-space.md) — how to separate problem from solution.
- [Constraints](constraints.md) — what the context imposes and what is not
  negotiated.
- [Non-Functional Requirements](non-functional-requirements.md) — the conversion
  of context into a number.

## Practical Exercise

Pick a system you work on and answer, in writing, the six questions in "The
questions that extract the context".

Mark which you answered with a verifiable fact and which with an assumption.

The assumptions are the material for your next conversation with whoever has the
answer — and, on most teams, they are the majority.

## Interview Questions

- How do you gather requirements from a stakeholder who only describes solutions?
- Give an example of an architectural decision you changed because of business
  context.
- How does a company's stage change what counts as good architecture?

## Further Exploration

- Vernon, Vaughn. *Implementing Domain-Driven Design*. Addison-Wesley, 2013 — the
  chapters on aligning domain and business.
- Ford, Neal; Richards, Mark. *Fundamentals of Software Architecture*. O'Reilly,
  2020 — the chapter on architectural drivers.

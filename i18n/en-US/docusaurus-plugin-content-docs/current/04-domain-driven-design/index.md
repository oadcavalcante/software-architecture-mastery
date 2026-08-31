---
id: domain-driven-design
title: Domain-Driven Design
sidebar_position: 0
description: Structuring software from the domain — and deciding where the cost of doing so is worth it.
doc_type: index
level: 2
difficulty: intermediate
status: complete
objective: >
  By the end, the reader can identify a business's core domain, design defensible
  bounded contexts and recognize where tactical DDD does not pay off.
prerequisites: [software-design]
related: [design-patterns, system-design, enterprise-architecture]
canonical_for: []
translated_from_version: 1
last_reviewed: 2026-08-31
---

# Domain-Driven Design

DDD is the proposal that the structure of the software should mirror the structure of the
business — and that the language used in the code should be the same one used by whoever
understands the problem.

## The problem this section addresses

Systems with complex domains fail for a specific reason: translation. The business expert
describes a rule; the analyst converts it into a requirement; the developer converts it
into code. At each conversion, nuance is lost. Months later, the system's behaviour
diverges from everyone's understanding, and nobody can point at where the divergence
entered.

DDD attacks that by eliminating the translation: the code uses the domain's terms, with
the exact meaning they have in the domain.

The second problem is one of organizational scale. A single, consistent model for the whole
company is appealing and impossible — "customer" means genuinely different things in
billing, logistics and support. Forcing a common model produces a schema that serves nobody
well. Strategic DDD resolves that by admitting multiple models with explicit boundaries.

## What you will find here

**Strategic DDD.** Domain, subdomain, core domain, supporting domain and generic domain.
Bounded context, context mapping and anti-corruption layer. This is the part of DDD that
decides architecture — and the one most frequently skipped.

**Ubiquitous language.** The mechanism that makes the rest work. Without it, tactical DDD
becomes a set of naming conventions with no effect.

**Tactical DDD.** Entity, value object, aggregate, aggregate root, domain service,
application service, domain event, repository and factory. The building blocks that
implement a model inside a context.

## The distinction that matters most

**Strategic DDD and tactical DDD have completely different cost profiles.**

The strategic part almost always pays off. Identifying where the real business boundaries
are is useful even in a small system, and those boundaries tend to be the best candidates
for service boundaries later.

The tactical part is expensive. Aggregates, value objects and repositories add indirection
that is only justified when the business rules are genuinely complex. Applied to CRUD,
tactical DDD produces six hundred lines to do what thirty would.

The right question is never "shall we use DDD?". It is "is this subdomain core, and are the
rules here complex enough to pay for the tactical part?".

## Reading order

Strategic before tactical, always. The reverse order — the one most tutorials present —
produces people who know how to write an aggregate and do not know how to decide where it
should live.

Read **bounded context** and **ubiquitous language** with particular attention. They are
the two concepts everything else depends on, and the two most frequently reduced to a
slogan.

## By the end

You can talk to a business expert and come away with a map of subdomains. You can argue
where a boundary should be and why. You can recognize when two teams are using the same
word for different things — which is almost always the symptom of a missing bounded
context.

And you can say no to tactical DDD without guilt, in the subdomain where it does not pay
off.

## Continues in

[Level 03 — System Design](/05-system-design/index.md), where domain boundaries begin to
become process and deployment boundaries.

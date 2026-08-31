---
id: domain
title: Domain
sidebar_position: 1
description: The sphere of knowledge and activity the software exists around.
doc_type: foundation
level: 2
difficulty: beginner
status: complete
objective: >
  By the end, the reader distinguishes domain from model and recognizes why the
  business's vocabulary has to reach the code without translation.
prerequisites: [domain-driven-design]
related: [subdomain, ubiquitous-language, bounded-context]
canonical_for: [domain, domain model]
translated_from_version: 1
last_reviewed: 2026-08-31
---

# Domain

## Overview

The domain is the sphere of knowledge and activity the software exists around. For an
insurer, it is insurance. For a bank, financial services. For a haulier, logistics.

The domain exists independently of the software. It has experts, its own vocabulary, rules
that came from decades of practice and constraints nobody programmed.

## The Problem

Software with a complex domain fails for a specific, recurring reason: **translation**.

The expert describes a rule. The analyst converts it into a requirement. The developer
converts it into code. At each conversion, nuance is lost — and nobody notices, because
each step looks faithful to the previous one.

Months later, the system's behaviour diverges from everyone's understanding. A typical
conversation:

> — The system is calculating the waiting period wrong.
> — It is not, it does exactly what was specified.
> — But that is not what a waiting period means.

Nobody made a mistake at any step. The meaning degraded along the chain.

DDD attacks that by eliminating the conversions: the code uses the domain's terms, with the
exact meaning they have in the domain.

## Core Concepts

### Domain and model are not the same thing

**The domain** is reality: the business, with all its complexity.

**A model** is a selective abstraction of the domain, built to solve a specific problem. It
deliberately discards what does not matter for that problem.

A "customer" model for billing holds tax data and payment history. For logistics, it holds
addresses and delivery restrictions. Neither is more correct — each serves a problem.

That observation leads directly to
[bounded context](/04-domain-driven-design/bounded-context.md): different models, with
explicit boundaries, rather than a single model that serves everyone badly.

### The domain expert is a source, not a client

The change of posture DDD requires: the expert is not someone who "requests features". They
are the source of the knowledge the model has to capture.

That means frequent, direct conversations between whoever writes the code and whoever
understands the business — not mediated requirements. It is uncomfortable in organizations
structured around layers of communication, and it is the prerequisite for everything else.

### Essential versus technical complexity

DDD is a response to **domain** complexity, not technical complexity.

A system with trivial business rules and enormous technical challenges — a video processor,
a caching service — does not benefit from DDD. The complexity is elsewhere.

See [complexity](/01-fundamentals/complexity.md). Applying DDD where the complexity is not
of the domain adds indirection without addressing the real problem.

### The model lives in the code

A model that exists in documents and diagrams, and not in the code, is not a model — it is
documentation. When the two diverge, the code wins, because it is the one that runs.

That means the model is refined continuously, in code, as understanding of the domain
improves. There is no modelling phase that ends.

## Why This Matters

**Because translation is where meaning is lost.** Eliminating the conversions is DDD's
central mechanism, and everything else —
[ubiquitous language](/04-domain-driven-design/ubiquitous-language.md),
[bounded context](/04-domain-driven-design/bounded-context.md), the tactical blocks —
serves that.

**Because it distinguishes where DDD applies.** If the system's complexity is not of the
domain, DDD is not the tool. Recognizing that avoids applying an expensive method to the
wrong problem.

**Because it changes who talks to whom.** The practice that most determines DDD's success is
not technical: it is the frequency and quality of the conversations between developers and
experts. Without that, the tactical patterns become naming conventions.

## Common Mistakes

**Confusing the domain with the database.** The schema is a representation of a model, not
the domain. Modelling from the tables inverts the order.

**Seeking a single, complete model.** A model that tries to represent the whole domain
serves every problem badly. See
[bounded context](/04-domain-driven-design/bounded-context.md).

**Treating the expert as a source of requirements.** They are a source of knowledge; the
difference shows in the depth of the conversations.

**Applying DDD to technical complexity.** The method addresses domain complexity.

**Modelling once and stopping.** Understanding of the domain improves as the system is
used; the model has to keep up.

## Real-World Example

A team was building the system for a reinsurance broker. After six months, the model had
`Contract`, `Client`, `Amount` and `Status` — generic software vocabulary.

An expert, reviewing a screen, remarked that the distinction between "cession" and
"retrocession" was missing, and that "premium" on the screen was not a premium, it was
commission.

Nobody on the team knew they were different things. All four terms — cession, retrocession,
premium, commission — were used daily by the business and none existed in the code.

Rewriting the model with the domain's vocabulary took two months. What changed was not just
naming: on naming "retrocession", it became evident that it had rules the generic model did
not accommodate, and that were being implemented as special cases scattered around.

Three open defects were closed by the remodelling, without anyone having targeted them.
They were consequences of the model not representing a distinction the domain makes.

## Related Concepts

- [Subdomain](/04-domain-driven-design/subdomain.md) — the division of the domain.
- [Ubiquitous Language](/04-domain-driven-design/ubiquitous-language.md) — the mechanism
  that eliminates translation.
- [Bounded Context](/04-domain-driven-design/bounded-context.md) — why there is no single
  model.
- [Problem Space](/01-fundamentals/problem-space.md) — the corresponding concept in Level
  01.

## Practical Exercise

List ten terms your business's experts use daily.

Check how many exist in the code with the same name and the same meaning.

The ones that do not are distinctions the domain makes and the model does not — and each is
a likely source of a defect or a scattered special case.

## Interview Questions

- What is the difference between the domain and a model?
- Why is translation between expert and code problematic?
- When is DDD not the appropriate tool?

## Further Exploration

- Evans, Eric. *Domain-Driven Design*. Addison-Wesley, 2003.
- Vernon, Vaughn. *Domain-Driven Design Distilled*. Addison-Wesley, 2016.

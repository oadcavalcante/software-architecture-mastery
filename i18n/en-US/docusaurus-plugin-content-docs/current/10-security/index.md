---
id: security
title: Security Architecture
sidebar_position: 0
description: Designing systems that resist whoever wants to break them — structural decisions, not a layer added at the end.
doc_type: index
level: 5
difficulty: advanced
status: complete
objective: >
  By the end, the reader treats security as a property of the design, with explicit
  trust boundaries and failures that close instead of opening.
prerequisites: [system-design]
related: [cloud-architecture, integration-architecture, reliability]
canonical_for: []
translated_from_version: 1
last_reviewed: 2026-08-31
---

# Level 05 — Security Architecture

This section deals with designing systems that resist whoever wants to break them.

## This section's problem

Security is frequently treated as a stage: you build the system, and then somebody does a review, runs a
scan and points out fixes.

That works for one class of problem — a wrong configuration, an outdated library — and it does not work for
the one that matters. Serious flaws are almost always **structural**: a trust boundary in the wrong place,
a too-broad permission granted at the start, a piece of data that should not be there.

No scan finds that, because it is not a code defect. It is an architectural decision.

The second problem is framing. "Security" is discussed as if it were a binary property — the system is
secure or it is not. It is, in practice, a set of decisions about **against whom**, **protecting what**, and
**at what cost** — which is exactly the shape of any other architectural trade-off.

## What you will find here

**Identity and access.** Identity, OAuth 2.0, OpenID Connect and JWT — the four treated by what they solve
and by what they are usually used wrong for. JWT gets specific attention to the revocation problem, which
is where most implementations fail.

**Authorization.** Authorization models — by role, by attribute, by relationship — with the criterion for
choosing, which is rarely discussed.

**The principles that decide structure.** Least privilege, secure trust boundaries, zero trust and defense
in depth. They are what determine the size of the damage when something goes wrong.

**Secrets and cryptography.** Secrets management, encryption in transit and at rest, and key management —
the topic where intuition misleads the most.

**Threat modeling.** The practice that turns "let's think about security" into a concrete list of
decisions. It is the section's highest-return document.

**Data protection and auditability.** What to keep, how to protect it, and how to prove what happened.

**Security failure modes.** How a system fails when it fails — and why failing closed needs to be a
conscious decision.

**Supply chain trust.** Dependencies, artifacts and pipelines — the vector that has grown the most.

## Reading order

Start with **threat modeling**. Without it, the other documents become a list of best practices with no
priority criterion.

Then **secure boundaries** and **least privilege**, in that order. They determine the reach of any
compromise, and they are the two decisions that most change an incident's outcome.

**Identity**, **OAuth 2.0**, **OpenID Connect** and **JWT** form a block and should be read in sequence —
the last three only make sense on top of the first.

Leave **cryptography** and **key management** together for the end. They are dense, and the main lesson —
do not implement it yourself — is quick to accept and hard to respect under pressure.

## By the end

You draw explicit trust boundaries, and can say what happens when each one is crossed.

You can run a threat modeling session on a design and come out with decisions, not with concerns.

You recognize that the question is not "is it secure?", but "does it resist whom, protecting what, and what
happens when it fails?".

And you understand that most security work in architecture is **reducing the reach of the damage**, not
preventing the compromise — because the compromise eventually happens.

## Continues in

[Scalability](/11-scalability/index.md), where the boundaries you drew here come to be tested by volume.

---
id: reliability
title: Reliability
sidebar_position: 0
description: Continuing to work when parts fail — with a defined target, not with "as much as possible".
doc_type: index
level: 5
difficulty: advanced
status: complete
objective: >
  By the end, the reader defines reliability targets with the business and designs
  for failure containment, not for its absence.
prerequisites: [distributed-systems]
related: [scalability, cloud-architecture, observability]
canonical_for: []
translated_from_version: 1
last_reviewed: 2026-08-31
---

# Level 05 — Reliability

This section deals with continuing to work when parts fail — because they fail.

## This section's problem

The wrong question is "how do we avoid failures?". They are not avoidable: hardware breaks, the network
partitions, dependencies go down, deployments introduce defects, people make mistakes.

The right question is: **when something fails, what happens?**

That changes the target of the work. Instead of chasing the absence of failure — which does not exist — the
effort goes to **containment**: that one part's failure does not become the whole's failure, that the
degradation is partial instead of total, and that the recovery is fast.

The second problem is definition. "Maximum possible reliability" is not a target — it is an intention with
no cost attached. Each additional nine costs disproportionately more, and the decision of how many nines to
chase belongs to the business, with the price on the table.

With no agreed numeric target, two bad things happen: too much is invested where it does not matter, and
too little where it does. And nobody can say whether the system is good.

## What you will find here

**The measures.** Availability metrics and the reliability fundamentals — what the numbers mean and what
they hide.

**The targets.** SLI, SLO and SLA — three things frequently confused, with the error budget as the
mechanism that turns a target into an operational decision.

**The tolerance techniques.** Fault tolerance, resilience, redundancy and failover. Redundancy gets
specific attention to what nullifies it: correlation.

**The containment patterns.** Circuit breakers, bulkheads and graceful degradation. They are what keep a
localized failure from propagating.

**The failure mode the protection itself causes.** Retry storms — the case where the defense amplifies the
problem.

**Recovery.** Disaster recovery planning, with RTO and RPO treated as what they are: business decisions
with a price.

**Verification.** Chaos engineering — the practice that answers "does this actually work?" before the
incident.

## Reading order

Start with **SLI, SLO and SLA**, in that order. With no defined target, everything else is effort with no
stopping criterion.

Then **graceful degradation**, which is the highest-return technique and the least applied.

**Circuit breakers**, **bulkheads** and **retry storms** form a block and should be read together — the
first two exist because of the third.

Leave **chaos engineering** for the end, and read it as verification of what the previous ones promised,
not as an independent practice.

## By the end

You define reliability targets in numbers agreed with the business, and you know what each additional nine
costs.

You can point, on a design, to where a failure propagates and where it is contained — and add containment
where it is missing.

You recognize that redundancy without independence is not redundancy, and that a recovery plan never
exercised is not a plan.

And you understand that a system's reliability is verified, not presumed — which means causing failures on
purpose, in a controlled window, before they happen on their own.

## Continues in

[Observability](/13-observability/index.md), where the question becomes how you know what is happening
while it happens.

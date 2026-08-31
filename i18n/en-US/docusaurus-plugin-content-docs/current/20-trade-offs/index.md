---
id: trade-offs
title: Trade-offs
sidebar_position: 0
description: The course's central section — each architectural choice as a function of the constraint that decides it.
doc_type: index
level: 5
difficulty: advanced
status: complete
objective: >
  By the end, the reader articulates any architectural decision as an explicit
  trade-off, with the comparison axis stated.
prerequisites: [distributed-systems]
related: [architecture-decisions, case-studies, system-design-interviews]
canonical_for: []
translated_from_version: 1
last_reviewed: 2026-08-31
---

# Trade-offs

If the whole course had to fit in one section, it would be this one.

## The problem this section addresses

Architecture questions almost never have an answer. They have an answer **given a
constraint**.

"Monolith or microservices?" is not answerable. "Monolith or microservices, for a team of
eight, with a domain that is still unstable, no operations platform and a six-month
deadline?" is answerable, and the answer is quite clear.

The difference between the two questions is the only thing that matters. A practitioner who
answers the first is displaying preference; one who demands the second is doing
architecture.

This section trains that conversion. Each document takes an apparently opposed pair,
identifies the real axis of comparison and shows under which constraints each side wins.

## What you will find here

Fifteen recurring trade-offs, each with concrete scenarios:

**Of structure.** Simplicity versus flexibility · coupling versus duplication ·
centralization versus decentralization · monolith versus microservices · abstraction versus
complexity.

**Of data and coordination.** Consistency versus availability · strong versus eventual
consistency · synchronous versus asynchronous · SQL versus NoSQL.

**Of economics and deadlines.** Cost versus reliability · delivery speed versus technical
quality · build versus buy · managed versus self-hosted · cloud-native versus portable.

**Of performance.** Performance versus maintainability.

## How each document is structured

None presents one side as the winner. Each establishes:

1. What the **real axis** is — frequently different from what the pair's name suggests.
2. The **conditions** under which each side wins, verifiably.
3. The **signs** that you chose wrong, observable before the disaster.
4. The **cost of changing your mind** later, which tends to be asymmetric and is what should
   decide the ties.

The fourth item is the least discussed and frequently the most decisive: when two options
tie on merit, you choose the one that is cheaper to abandon.

## Reading order

It can be read by lookup, when the decision arises. But there is value in reading it in
sequence at least once — the reasoning pattern repeats, and it is that, not the fifteen
cases, that is being trained.

If you read only three: **coupling versus duplication**, **synchronous versus
asynchronous** and **delivery speed versus technical quality**. They are the ones that appear
most day to day and the three where common intuition errs most.

## By the end

You convert any architecture question into a conditioned question, and state the axis before
arguing. You recognize a false dilemma — many "opposed" pairs are combinable.

And you can defend a decision in front of someone who prefers the other without the
conversation turning into a dispute about taste, because the premises are explicit and can be
contested one by one.

## Related

[Case Studies](/21-case-studies/index.md), where these trade-offs appear combined and in
conflict.

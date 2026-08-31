---
id: system-design-interviews
title: System Design Interviews
sidebar_position: 0
description: The same architectural reasoning, under time pressure and with an interviewer in the room.
doc_type: index
level: 0
difficulty: intermediate
status: complete
objective: >
  By the end, the reader runs a system design interview with their own structure,
  stating assumptions and trade-offs while drawing.
prerequisites: [system-design]
related: [case-studies, trade-offs]
canonical_for: []
translated_from_version: 1
last_reviewed: 2026-08-31
---

# System Design Interviews

This section does not teach answers. It teaches how to run the conversation.

## The problem this section addresses

The system design interview evaluates something specific: how you reason under ambiguity, with
incomplete information and little time. The prompt is vague on purpose — "design Twitter" —
because the first thing evaluated is whether you notice that it is vague.

The most common mistake is not technical. It is starting to draw. Whoever draws first is
answering a problem they invented, and the interviewer sees that immediately.

The second mistake is the opposite of what traditional preparation produces: candidates who
memorized a reference architecture and recite it regardless of the prompt. It works until the
first follow-up question.

## What you will find here

**Structure of the conversation.** How to distribute time between clarification, estimation,
design and deep dive. Having structure is half the evaluation — it shows you have done this
before.

**Clarification.** What questions to ask and in what order. Separating functional from
non-functional requirements out loud.

**Estimation.** Back-of-the-envelope calculations: volume, storage, bandwidth, connections. Not
to get the number right, but so that the architecture has a declared scale — without it, every
decision has no criterion.

**Design.** API design, data modeling and high-level architecture.

**Deep dive.** Bottleneck identification, scaling and failure handling. This is where the
interview actually separates candidates.

**Communication.** How to state a trade-off out loud while drawing. This is the most valued
competency and the least trained.

**Common mistakes.** The patterns that make interviews go wrong, with what to do instead.

## The format of the exercises

```text
Problem → Requirements → Questions to Ask → Capacity Estimates
→ Possible Architectures → Trade-offs → Recommended Approach
→ Follow-up Questions
```

Note that **Questions to Ask** comes before any architecture. It is the order of the real
interview, and it is the habit the exercises train.

Each exercise presents more than one possible architecture, because in a good interview you
propose an alternative and explain why you did not choose it.

## A note on preparation

Memorizing reference architectures is the most popular way to prepare and one of the least
effective. It works while the prompt matches what was memorized, and collapses at the first
variation — which the interviewer will introduce precisely to test that.

What transfers is the method: clarify, estimate, decompose, identify the bottleneck, state the
trade-off. That method works on any prompt, including ones you have never seen.

## By the end

You run the conversation instead of reacting to it. You ask the right questions before drawing.
You state assumptions out loud, which lets the interviewer correct course early.

And you can say "I would choose X, but if the consistency requirement were different, I would
choose Y" — which is exactly what the interview is looking for.

## Related

[Case Studies](/21-case-studies/index.md) for the version with no time pressure, and
[Trade-offs](/20-trade-offs/index.md) for the argumentation material.

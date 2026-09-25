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
translated_from_version: 3
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

**Communication.** How to state a trade-off out loud while drawing. The interviewer only
scores the reasoning you say out loud — and that is the part reading-based preparation never
reaches.

**Common mistakes.** The patterns that make interviews go wrong, with what to do instead.

## The order this section trains

```text
Problem → Requirements → Questions to Ask → Capacity Estimates
→ Possible Architectures → Trade-offs → Recommended Approach
```

Note that **Questions to Ask** comes before any architecture. It is the order of the real
interview, and it is the habit this section trains.

Each document carries an **Interview Example** — the exchange with the interviewer, with
the follow-up questions they would ask. The long exercises of the path live in the other
sections; here the training is the order, not the prompt.

## A note on preparation

Memorizing reference architectures fails for the reason already described, and the mechanism is
worth naming: that preparation optimizes for recognizing the prompt, while the interview measures
how you run a prompt you do not recognize.

What transfers is the method: clarify, estimate, decompose, identify the bottleneck, state the
trade-off. It does not depend on recognizing the prompt — it depends on having time for the
phases, and in 30-minute interviews it collapses into three, as
[Interview Structure](/22-system-design-interviews/interview-structure.md) shows.

## By the end

You run the conversation instead of reacting to it. You ask the right questions before drawing.
You state assumptions out loud, which lets the interviewer correct course early.

And you can say "I would choose X, but if the consistency requirement were different, I would
choose Y" — which is exactly what the interview is looking for.

## Related

[Case Studies](/21-case-studies/index.md) for the version with no time pressure, and
[Trade-offs](/20-trade-offs/index.md) for the argumentation material.

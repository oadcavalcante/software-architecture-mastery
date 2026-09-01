---
id: 09-present-and-defend
title: "Exercise 09 — Present and Defend"
sidebar_position: 1
description: The last exercise — you have the right architecture and thirty minutes with whoever controls the budget.
doc_type: exercise
level: 7
difficulty: advanced
status: complete
objective: >
  By the end, the reader converts a technical proposal into an ask, a risk and a cost, and
  anticipates the objections that would sink it.
prerequisites: [communication]
related: [architecture-presentations, stakeholder-management, negotiating-tradeoffs, cost-management]
canonical_for: []
translated_from_version: 2
last_reviewed: 2026-08-31
---

# Exercise 09 — Present and Defend

:::info The last one on the path

This exercise uses **your own proposal** from
[exercise 08](/16-legacy-modernization/exercises/08-modernize-legacy.md). If you haven't done it,
do it first — there is nothing to present without it.

:::

## Context

You have thirty minutes with the cooperative's board. In the room:

```text
president           a farmer, 61, in the role for 8 years
                    decides, and decides by board consensus
finance director    accountable for the budget; skeptical about
                    technology since an ERP that cost triple
                    the forecast in 2019
operations
  director          accountable for the harvest; the one thing that
                    cannot happen is buying stopping in April
IT manager          your peer; agrees with you and has little
                    political capital
```

And, outside the room but with a voice: the two people who have maintained the system for nineteen
years. The president will ask their opinion after the meeting.

## Requirements

You need to leave the room with:

```text
approval to hire 8 engineers
a multi-year budget, with the first year guaranteed
authorization for phase 1 to start in 60 days
```

## Constraints

```text
30 minutes, including questions
the board has no technical background
the 2019 ERP is a living reference for a technology project
  that went wrong
the operations director has de facto veto power,
  though not formal
the annual budget is approved in November; we are in September
the two people who run the system are not in the room and will be
  consulted afterwards
```

## Your Task

Produce:

1. The **ask**, in one sentence, to be said in the first thirty seconds.
2. The **reason**, with a number that does not come from the technology group.
3. What happens **if nothing is done**, with a date.
4. The **three most likely objections** and the answer to each.
5. What you do in the **one-on-one conversations** before the meeting — with whom, and what you ask.
6. The **closing**, with what was left out and why.

## Questions You Should Be Asking

```text
what is each person in the room's currency?
which number in this proposal does finance recognize
  as trustworthy?
what did the 2019 ERP do wrong, and how is this proposal
  different?
what does the operations director need to hear so she doesn't veto?
what will the two people who run the system say when they are
  consulted?
what is the smallest approval that unblocks phase 1?
```

The last is the most useful. You may not need everything now.

## Assessment Criteria

Your answer is good if:

- **The ask comes first**, before any context. Thirty minutes with a board does not accommodate the
  engineering order.
- **The number does not come from technology.** The 30-month regulatory deadline with a fine comes
  from legal; the two people's retirement comes from HR. Numbers engineering produces about itself are
  discounted by someone who has already watched an ERP blow up.
- **The consequence of not doing it has a date.** "The two people retire in 2030 and 2033, and training
  a replacement took two and a half years on the last attempt" is a sentence with a date and a track
  record.
- **The 2019 ERP objection is addressed before it is made.** It will be made.
- **The operations director was talked to beforehand.** Her veto is real, and the argument that
  disarms it — no change during the four months of harvest — is in the plan, not in the presentation.
- **You identified the smallest sufficient approval.** Perhaps phase 1 fits in the current budget, and
  the multi-year one can wait until November.

Your answer is weak if it is exercise 08's architecture translated into simpler language. Simplifying
is not translating.

## Discussion

:::details Open after trying

**The first thirty seconds** decide the meeting:

```text
"I'm asking for authorization to hire eight engineers and start in
 60 days a modernization of the harvest purchasing system.

 The immediate reason: the traceability regulation has a 30-month
 deadline and a fine. The two people who can work on the system
 estimated 14 months to implement it in there, and they
 retire in 2030 and 2033.

 If we do nothing, we arrive in 2030 with a system
 nobody knows how to change and a regulation to meet."
```

Not one word about architecture. The board doesn't decide architecture; it decides whether to allocate
capital in the face of a risk.

**The number that isn't yours.** The regulatory fine and the retirement dates are external facts. The
14-month estimate belongs to the two people, not to you — and citing them as the source has an
additional effect: when the president consults them afterwards, they will recognize their own number.

**The 2019 ERP** will be raised, and the answer has to be ready:

```text
"The ERP was a complete replacement, with a big-bang cutover and
 a budget fixed at the start. This proposal is the opposite: each
 phase delivers something that works on its own, and you can stop
 at the end of any of them.

 Phase 1 costs X and delivers the farmer's app in four
 months. If it doesn't deliver, you don't approve phase 2."
```

That converts a history of failure into an argument in favor: the proposal's structure answers exactly
what went wrong before.

**The operations director** is not convinced in the meeting. She is convinced in the fifteen-minute
conversation, two days earlier, in which you ask what worries her — and she says "April" — and you show
that the schedule has four months of freeze a year, and ask her to review the dates.

In the meeting, she supports it. That is worth more than any slide.

**The two people outside the room** are the stakeholder easiest to forget and the most capable of
sinking the proposal. They have to have been talked to beforehand, and their role in the proposal has
to be one of authority — not a source to be drained before retirement.

If they tell the president "we agree, and the plan puts us deciding what is right", the approval is a
formality. If they say "they're going to throw away nineteen years", it's over.

**The smallest sufficient approval** is the question that unblocks the most meetings: perhaps phase 1
fits in the already-approved budget, and today's ask is just authorization to start — with the
multi-year one in November, with phase 1's result already in hand.

Asking for less, with a result before asking for more, is frequently the fastest route to getting
everything.

**The closing:**

```text
"To summarize: eight people, starting in 60 days, with phase 1
 delivering the farmer's app in four months and the regulatory
 deadline covered in month 12.

 What is not in this proposal: the complete replacement of the
 system. It will take more than 30 months and I am not going to ask
 for budget for it today.

 The risk I see: if we can't hire the eight
 people in three months, the regulatory deadline gets tight. I'll bring
 the hiring progress in December."
```

Saying what is **not** being asked for, and naming your own risk, is what separates a proposal from a
sale. Boards approve proposals.

:::

## Related Concepts

- [Exercise 08](/16-legacy-modernization/exercises/08-modernize-legacy.md).
- [Communication](/23-architecture-leadership/communication.md) and [Presentations](/23-architecture-leadership/architecture-presentations.md).
- [Stakeholder Management](/23-architecture-leadership/stakeholder-management.md).
- [Cost Management](/23-architecture-leadership/cost-management.md).

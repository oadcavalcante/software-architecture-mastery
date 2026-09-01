---
id: stakeholder-management
title: Stakeholder Management
sidebar_position: 5
description: Who has something at stake, what each of them needs, and where resistance is legitimate.
doc_type: concept
level: 7
difficulty: advanced
status: complete
objective: >
  By the end, the reader maps stakeholders by power and interest, identifies each one's currency
  and treats resistance as information.
prerequisites: [architecture-leadership-basics]
related: [communication, technical-influence, negotiating-tradeoffs]
canonical_for: []
translated_from_version: 1
last_reviewed: 2026-08-31
---

# Stakeholder Management

## Overview

A relevant architectural decision affects people who are not in the technical conversation. If they
are not considered, one of them will block the decision — usually late, and usually with good
reason.

```text
stakeholder   whoever has something at stake in the decision
              — not necessarily whoever has an opinion on it
```

The work has three parts: identifying who they are, understanding what each one needs, and choosing
how and when to involve each. None of them is technical, and all of them determine whether the
decision happens.

## Problem

The typical pattern:

```text
the architect involves engineering and product
the proposal matures
in the week of the decision, security raises a structural objection
the proposal goes back to the start
```

Security was always among the stakeholders. It was remembered late because it doesn't take part in
design conversations, and because involving it seemed to add friction.

The friction was added anyway — later and more expensively.

And there is the opposite error: involving everyone in everything, which produces twelve-person
meetings, slow decisions and diluted accountability.

## Core Concepts

### Map by power and interest

```text
                    low interest           high interest
high power          keep informed          involve actively
low power           monitor                consult and listen
```

The top-left quadrant is the most dangerous: someone with the power to block and little interest in
the subject. That person will not follow the proposal, and will encounter it at the moment of
decision — when the only available action is to object.

Keeping them informed at low cost — a one-paragraph summary, periodically — avoids the surprise that
produces the late objection.

### Every stakeholder has a currency

```text
business leadership   revenue, risk, time to market
finance               predictability, contract, cost
security              exposure, compliance, attack surface
operations            on-call, incidents, cognitive load
product               capability, timeline, what gets left out
legal                 regulatory obligation, exposure
engineering teams     autonomy, load, quality of life
```

Discovering someone's currency is not manipulation — it is the condition for the conversation to be
useful. Presenting the same proposal to everyone in engineering's currency produces six
conversations in which five people can't assess anything.

See [communication](/23-architecture-leadership/communication.md).

### Resistance is information

The reflex when facing resistance is to persuade. The better move is to understand.

```text
"operations is resisting because the proposal adds a
 component to the on-call rotation, and on-call is already worn out. That
 is a legitimate objection I hadn't considered, and it
 changes the design: I need either to reduce the load elsewhere,
 or to use a managed service."
```

A meaningful share of stakeholder objections points at real costs the technical analysis didn't
capture. Treating them as an obstacle rather than as information loses exactly the information that
would have prevented the problem.

### Involving early is cheaper

```text
involved in the design     they contribute, and the proposal improves
involved at the decision   they comment, and the proposal goes back to the start
involved afterwards        they silently don't comply, or they block
```

The cost of involving early is friction distributed across the process. The cost of involving late
is friction concentrated at the worst moment.

And there is an additional effect: whoever took part in building the proposal defends it. Whoever
was consulted at the end, at best, doesn't block it.

### Not every stakeholder has to agree

```text
decide      few
consult     more
inform      many
```

Being explicit about which category each one is in avoids two opposite pathologies: the search for
universal consensus, which blocks the decision, and the unilateral decision, which produces
non-compliance.

Telling someone "your opinion matters and the decision is not yours" is uncomfortable and better
than leaving it ambiguous — because ambiguity becomes frustration.

### Internal allies are worth more than arguments

```text
"the operations director has already agreed, and they will support it
 in the meeting"
```

Group decisions rarely change positions; they confirm positions formed beforehand. That means the
persuasion work happens in the individual conversations, and the meeting is where the result is
recorded.

An architect who learns each participant's position before the meeting is never surprised, and can
address objections while there is still time.

### The forgotten stakeholder is almost always the same

In internal surveys, the most frequently forgotten are:

```text
operations      will carry the result on call
support         will handle the confused customer
security        has veto power and little visibility of the design
finance         approves the recurring cost, not only the initial one
```

The first two rarely have formal power to block and are the ones who suffer most from badly made
decisions — and their absence produces systems that are technically correct and operationally
unsustainable.

## Mental Model

**Map by power and interest, discover each one's currency, and treat resistance as information.**
Involving early costs less than persuading late.

## When to Use

- In any decision that affects people outside the team.
- Before the proposal matures, not after.
- With each person's role — decide, consult, inform — declared.

## When Not to Use

**Involving everyone in everything** — it dilutes accountability and blocks.

**Seeking universal consensus.**

**Treating resistance as an obstacle.**

**Leaving ambiguous** who decides.

**Discovering positions in the meeting** instead of beforehand.

## Alternatives

- **A small, reversible decision** — when the decision can be reversed cheaply, involving fewer
  people and learning fast is better.
- **A pilot with one team** — demonstrating it working is more convincing than any stakeholder map.
- **Delegating the persuasion** — when someone has more credit with a specific stakeholder, using
  them is more effective.

## Trade-offs

| Involving many | Involving few |
|---|---|
| Broad adoption | Fast decision |
| Slow | Risk of a late block |
| Objections early | Objections at the wrong moment |

| Consensus | Deciding with divergence |
|---|---|
| Frictionless adoption | Fast |
| May not get there | Requires recording the objection |

## Failure Modes

**A forgotten stakeholder.** A late objection, the proposal goes back to the start.

**Everyone involved.** A meeting of twelve, a decision by nobody.

**Resistance treated as an obstacle.** The information is lost.

**Ambiguous roles.** Frustration from whoever thought they were deciding.

**The meeting as the place of persuasion.** Positions were already formed.

**Operations and support absent.** A correct and unsustainable system.

## Common Mistakes

**Not mapping** before starting. Discovering on the eve of the decision that a department had veto power costs the entire effort.

**Involving security at the end.** It arrives as a veto when changing is already expensive. Consulted early, the same department delivers constraints that would have fit in the design.

**Presenting everything in engineering's currency.** Latency and coupling don't move whoever approves the budget; revenue, risk and timelines do.

**Not having the individual conversations.** An objection discovered in the large meeting becomes a public dispute. Discovered beforehand, it becomes an adjustment.

**Not saying explicitly** who decides. Without that, everyone assumes they gave an opinion and decided — and the decision is reopened every time someone feels ignored.

## Real-World Example

A logistics company had a cloud migration proposal blocked three weeks before the start, by an
objection from the legal department: part of the customer contracts contained a data residency
clause requiring the national territory, and the chosen region didn't comply.

The objection was correct, the proposal had nine months of preparation behind it, and replanning
cost four months.

The subsequent analysis identified the pattern. The stakeholder map, done at the start, had listed
six people — all from engineering, product and finance. Legal was not on it.

The architecture group instituted a process, deliberately light:

**A mandatory stakeholder map** in every proposal above a threshold, with four fields per person:
who, what they have at stake, what their currency is, and their role — decide, consult or inform.

**A checklist of frequently forgotten stakeholders**, derived from history: operations, support,
security, legal, finance and the data department. Each has to be explicitly marked as applicable or
not.

**A five-minute conversation** with each high-power stakeholder, before the proposal matures. The
stated objective is to find structural objections early, not to persuade.

**A record of objections**, with what was done with each one — incorporated, mitigated, or accepted
as risk.

Over the following eighteen months, across 22 proposals:

```text
structural objections found in the initial conversation   14
proposals changed because of them                          9
proposals abandoned because of them                        2
structural objections that surfaced late                   1
average time from start to decision                        from 11 to 7 weeks
```

The time dropped, which contradicted expectations: involving more people early made the process
faster, because it eliminated the rework.

The two abandoned proposals are the result the group considers most valuable. Both had structural
objections that would have surfaced after months of work — and abandoning them in the second week
cost almost nothing.

The five-minute conversation with legal, which would have prevented the original incident, is the
highest-return item on the list. It costs five minutes and occasionally saves four months.

## Related Concepts

- [Communication](/23-architecture-leadership/communication.md).
- [Negotiating Trade-offs](/23-architecture-leadership/negotiating-tradeoffs.md).
- [Technical Influence](/23-architecture-leadership/technical-influence.md).
- [Architecture Views](/17-architecture-documentation/architecture-views.md) — stakeholders and
  concerns.

## Practical Exercise

Take a proposal in progress and list the stakeholders with four fields: who, what they have at
stake, what their currency is, and their role.

Then check whether operations, support, security, legal, finance and data were considered — even if
only to mark them as not applicable.

## Interview Questions

- Why is the high-power, low-interest stakeholder the most dangerous?
- Why is resistance usually information and not an obstacle?
- Why can involving more people early make the decision faster?

## Further Reading

- Hohpe, Gregor. *The Software Architect Elevator*. O'Reilly, 2020.
- Rozanski, Nick; Woods, Eoin. *Software Systems Architecture*. 2nd ed. Addison-Wesley, 2011.
- Fisher, Roger; Ury, William. *Getting to Yes*. 3rd ed. Penguin, 2011.

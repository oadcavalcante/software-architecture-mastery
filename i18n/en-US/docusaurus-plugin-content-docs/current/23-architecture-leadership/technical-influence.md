---
id: technical-influence
title: Technical Influence
sidebar_position: 9
description: Making a decision happen without being able to order it — the capital that accumulates and gets spent.
doc_type: concept
level: 7
difficulty: advanced
status: complete
objective: >
  By the end, the reader builds and spends technical capital deliberately, and chooses the
  influence mechanism appropriate to each situation.
prerequisites: [architecture-leadership-basics]
related: [communication, stakeholder-management, cross-team-architecture]
canonical_for: []
translated_from_version: 1
last_reviewed: 2026-08-31
---

# Technical Influence

## Overview

An architect who has to fall back on authority to make something happen has already lost — because
formal authority works once, and what it produces is compliance without conviction.

What works is influence, and it has an economy of its own:

```text
technical capital   accumulates by being right in public
                    is spent by insisting
                    is lost by being wrong with conviction
```

That makes choosing **what to insist on** an investment decision. An architect who insists on
everything has no credit left when the decision that mattered arrives.

## Problem

Three failure patterns.

**Insisting on everything.** The architect has an opinion on every decision and expresses it.
Within a few months, the teams learn to filter them out: the opinions become noise, and the one
that mattered is lost in the volume.

**Persuading by technical authority.** "Trust me, I've seen this go wrong." It works with people
who already trust them and fails with those who don't know the track record — which is most of the
organization as it grows.

**Persuading by argument alone.** A correct and complete argument, presented once, changes few
positions. Technical decisions in organizations change by accumulation: evidence, precedent,
demonstration, and the perception that the alternative is already being adopted by others.

## Core Concepts

### The mechanisms, in order of effectiveness

```text
demonstration      showing it working; the strongest
evidence           data from your own context
precedent          a team already did it, and it worked
argument           well-constructed reasoning
personal history   "I've seen this go wrong"
authority          "this is how it's going to be"; the weakest
```

The order surprises anyone expecting argument to be the main instrument. It isn't — it persuades
those already inclined, and it rarely reverses a formed position.

Demonstration and evidence work because they move the discussion off the terrain of opinion. A
prototype that runs ends a discussion ten slides don't.

### Start with the team that wants it

```text
persuading nine teams        slow, and each one requires the full effort
persuading one willing team  one adoption, one result, one precedent
                             the rest adopt by evidence
```

This is the most efficient pattern and the least practiced. Looking for the team that already has
the problem, that is open, and helping them solve it — with real involvement, not with a
recommendation — produces a concrete case worth more than any proposal.

And the second team is far easier than the first. The fifth is almost automatic.

### Leave the credit with whoever executed

```text
"the payments team solved this and the result was X"
```

An architect who attributes the result to the team gains allies; one who attributes it to
themselves gains a presentation. And the difference shows up the next time they need collaboration.

That is counterintuitive in organizations that evaluate by individual visibility, and it is the
investment with the best return in the role.

### Make the right path the easiest one

The most powerful influence mechanism is not conversational:

```text
arguing that services should have observability
  → has to be repeated for every team, always

providing a template with observability already configured
  → adoption happens with no conversation at all
```

See [platform engineering](/14-devops-and-platform/platform-engineering.md) and
[governance basics](/19-architecture-governance/governance-basics.md).

An architect who notices they are repeating the same argument should stop arguing and start
building — the paved road is the argument that doesn't have to be made.

### Choose battles by consequence

```text
expensive to reverse            worth insisting
affects many teams              worth it
regulatory or security-related  worth it
local and reversible            not worth it
aesthetic preference            never worth it
```

And there is a category of its own: decisions that are wrong and will be corrected by reality
within a few months. Letting them happen, with the objection recorded, is frequently better than
spending capital — the evidence persuades definitively, and the capital stays available.

That requires tolerating watching something wrong happen, which is the hard part of the role.

### Losing well builds more than winning

```text
"you decided X. I recommended Y, and why is on the record.
 The decision is yours, and I will help make X work."
```

An architect who supports the execution of a decision they disagreed with — and who doesn't say "I
told you so" when it goes wrong — builds more credit than if they had won the argument.

The reverse destroys it: passively sabotaging, or collecting the evidence for the moment of
failure, is noticed, and it ends the relationship.

### Presence before need

An architect who shows up only when there is a decision to influence is an obstacle. One who takes
part in everyday discussions — reviews, incidents, questions — is a resource.

The difference is not one of method, it is one of accumulation: when the important decision
arrives, the second already has context and credit, and the first has to build both under pressure.

## Mental Model

**Technical capital accumulates by being right and is spent by insisting.** Demonstrate instead of
arguing, start with whoever wants it, and leave the credit with whoever executed.

## When to Use

- Whenever the decision is not yours and you want to influence it.
- Choosing the mechanism by order of effectiveness, not by convenience.
- Preserving capital for the high-consequence decisions.

## When Not to Use

**Insisting on everything.**

**Falling back on authority** as the first instrument.

**Arguing** what could be demonstrated.

**Repeating the same argument** instead of building the easy path.

**Collecting evidence** to say "I told you so".

## Alternatives

- **Build instead of persuade** — a template, a tool, a platform.
- **Delegate the influence** — when someone else has more credit with that audience.
- **Record it and let it happen** — when the evidence will persuade better than you.
- **Escalate** — legitimate, rare, and expensive; use it when the risk is high and persuasion has
  failed.

The third is the hardest to practice and one of the most effective.

## Trade-offs

| Insisting | Recording and stepping back |
|---|---|
| May prevent the error | Preserves capital |
| Spends credit | The error happens |
| Necessary at high risk | The evidence persuades better |

| Demonstrating | Arguing |
|---|---|
| Ends the discussion | Fast |
| Costs build time | Persuades few |

## Failure Modes

**Noise.** An opinion on everything, filtered out by everyone.

**Authority spent.** It works once.

**A repeated argument.** A sign it should become a tool.

**"I told you so".** It ends the relationship.

**Captured credit.** It loses allies.

**Absence between decisions.** Arriving with no context when it matters.

## Common Mistakes

**Not choosing battles.**

**Presenting instead of demonstrating.**

**Trying to persuade everyone** instead of starting with one.

**Taking the credit** for the result.

**Showing up only when there is a decision.**

## Real-World Example

A technology company had a principal architect with an excellent technical reputation and low
influence. A 360-degree review brought consistent comments:

```text
"technically the best we have"
"has an opinion on everything, and we learned to filter"
"only shows up when they want us to change something"
"always right, and exhausting"
```

The pattern measured over six months:

```text
recommendations made in design reviews          114
adopted                                         31 (27%)
recommendations on high-consequence
  decisions                                     19
adopted among those                             9 (47%)
```

Forty-seven percent on the ones that mattered — because the credit was diluted across the other 95.

The changes, over a year:

**Recommendations classified explicitly.** Each one came to be stated as "blocking",
"recommendation" or "observation, ignore if you like". That reduced the perceived volume without
reducing participation.

**Fewer battles.** Recommendations about local and reversible decisions became explicitly
discardable observations.

**Demonstration instead of argument.** A recurring discussion about a resilience pattern — repeated
for two years in reviews — was ended in three weeks: they built the library with timeouts, circuit
breakers and retries already configured, and put it in the service template.

**Starting with one team.** A structured observability proposal, which had been presented to
everyone and ignored, was implemented with a team that had the problem. Three months later, with
the result measured, four teams adopted it on their own.

**Credit attributed.** Internal presentations came to be given by the team that executed, with the
architect in the audience.

**Presence outside decisions.** Taking part in incident analyses, with no agenda of their own.

Twelve months later:

```text
recommendations made                            61 (fewer, and classified)
blocking                                        8, all adopted
recommendations adopted                         44 (72%)
spontaneous consultations from teams            from ~3/month to ~26/month
adoption of the template with resilience        91% of new services
```

The 91% template adoption is the number they highlight. It came from building once, and it replaced
two years of arguing — and they recorded it as the central lesson: **when you notice you are
repeating an argument, the argument is not the right instrument**.

And the increase in spontaneous consultations was the effect of presence outside decisions: taking
part in incident analyses with no agenda of their own led teams to approach them before deciding,
rather than after.

## Related Concepts

- [Leadership Basics](/23-architecture-leadership/architecture-leadership-basics.md).
- [Communication](/23-architecture-leadership/communication.md).
- [Cross-Team Architecture](/23-architecture-leadership/cross-team-architecture.md).
- [Governance Basics](/19-architecture-governance/governance-basics.md) — the intervention point.

## Practical Exercise

List the recommendations you made last quarter and classify each one as blocking, recommendation or
observation.

Then count how many were adopted in each category. If the blocking ones' rate isn't much higher,
you are not signaling the difference — and the credit is diluted.

## Interview Questions

- Why is argument one of the weakest influence mechanisms?
- Why is starting with one willing team more efficient than persuading everyone?
- What does it mean to notice you are repeating the same argument?

## Further Reading

- Larson, Will. *Staff Engineer*. Self-published, 2021.
- Hohpe, Gregor. *The Software Architect Elevator*. O'Reilly, 2020.
- Cialdini, Robert. *Influence*. Revised edition. Harper Business, 2021.

---
id: technology-radar
title: Technology Radar
sidebar_position: 14
description: The mechanism that replaces the approved technology list — with movement and context.
doc_type: pattern
level: 6
difficulty: intermediate
status: complete
objective: >
  By the end, the reader maintains a radar that guides choices and records learning,
  instead of a list that freezes.
prerequisites: [enterprise-architecture]
related: [standards, enterprise-principles, technical-strategy]
canonical_for: []
translated_from_version: 2
last_reviewed: 2026-08-31
---

# Technology Radar

## Overview

A technology radar places technologies in rings that express **how much the organization
trusts them**, and records the movement between those rings over time.

```text
adopt    we use it, we recommend it, it is the standard
trial    worth trying in a real project, with limited scope
assess   worth understanding, with no commitment
hold     we start nothing new with it, and there is a recorded reason
```

It replaces the approved technology list — which is binary, context-free, and freezes.

## Problem

The approved list has three flaws.

**Binary.** A technology is either permitted or forbidden, with no room for "we're
testing it" or "it works for this case and not that one".

**No context.** It says what, not why. Whoever arrives later doesn't know whether the
decision still makes sense.

**Frozen.** Adding requires a process; removing, nobody does. The list grows and ages.

The practical effect: teams work around it. A list that doesn't track reality stops being
consulted.

## Core Concepts

### The movement is the information

A static radar is a list with four categories. What makes it useful is recording
**changes**:

```text
entered assess      someone found it interesting
moved to trial      worth actually testing
moved to adopt      it worked, it is the standard now
moved to hold       we tested it, it didn't work here — and why
```

The last line is the most valuable and the least recorded: knowing the organization has
already tried something and why it didn't work saves the next person who would have had
the same idea.

And the movement communicates direction: a technology that sat in "assess" for two years
without moving says something — probably that nobody has real interest in it.

### Each item needs a justification and context

```text
bad    "Kafka — adopt"
good   "Kafka — adopt for high-volume streams with retention;
        for simple queues, we prefer the cloud's managed queue,
        which requires less operation"
```

The justification is what lets the reader decide whether their case applies — and it is
what keeps the decision reviewable when context changes.

Without it, the radar becomes a list with nice names.

### "Hold" is not a ban

The hold ring says: **we don't adopt it, and there is a reason**. A team with a genuine
need can propose it, presenting what has changed.

Treating it as a ban produces the same circumvention as the approved list.

And the record of proposals that reversed a "hold" is quality information: if an item is
challenged repeatedly, the recorded reason may have aged.

### The radar reflects the organization, not the industry

Public radars are useful as a reference and do not replace your own: they reflect the
context of whoever publishes them.

A technology in "adopt" at a consultancy with hundreds of projects may be inappropriate
in an organization with eight engineers — because the operational cost that justifies it
there doesn't exist here. See
[managed services](/09-cloud-architecture/managed-services.md).

Your own radar answers: **what works here, with our team, our volume and our
constraints?**

### It is built with the teams, not for them

A radar produced by a group of architects and published gets the same adoption as the
list it replaced.

What works: a periodic review with the teams participating, in which whoever used a
technology reports on the experience.

That makes it a **learning-sharing** mechanism as well as guidance — and it is what keeps
it alive, because people take part in building it.

### Review frequency

```text
quarterly    the most used one; keeps up without becoming bureaucracy
biannual     acceptable in stable organizations
annual       ages between reviews
continuous   entries can be proposed at any time
```

The combination that works: continuous proposals, quarterly publication.

## Mental Model

**The radar records trust and movement, with context.** An approved list says what; the
radar says why and since when.

## When to Use

- Organizations with several teams making technology choices.
- Where technological divergence has an operational cost.
- To share learning across teams.
- To guide without forbidding.

## When Not to Use

**With a single team, or with few.** The radar exists to propagate learning across teams
that don't talk to each other. With eight engineers on one team, learning circulates in
conversation, and the quarterly review becomes ceremony over decisions everyone already
knows.

**When technological divergence is low for another reason.** If the paved road already
embeds the choices — the pipeline only builds on this runtime, the platform only provisions
this database —, the radar describes what the tooling already decides. That is what happened
at the end of the Real-World Example, and it is a sign of success, not of failure.

**When nobody is going to keep the review going.** A radar that ages is worse than not
having one: it goes on being cited as if it described reality. Without someone to convene
the session and write down what changed, the approved list is more honest.

**When the decision has to be automatically verifiable.** In a regulatory or procurement
context, what is demanded is a binary, auditable answer. The radar guides and admits
exceptions, which is the opposite of what that case asks for.

**Without periodic review.**

**At the wrong granularity** — dozens of libraries, when what matters are the structural
decisions.

## Alternatives

- **Paved road** — instead of recommending, offer it ready. See
  [internal developer platforms](/14-devops-and-platform/internal-developer-platforms.md).
- **[Standards](/15-enterprise-architecture/standards.md)** — when the specific choice is mandatory.
- **Decision records** — the history of what was chosen and why.
- **Community of practice** — sharing learning without a formal artifact.

The paved road is stronger than the radar: it makes the recommendation the easiest
option, instead of depending on someone consulting a document.

## Trade-offs

The central trade is between maintenance cost and usefulness: the radar requires periodic
review, and that is what keeps it describing reality.

| Radar | Approved list |
|---|---|
| Gradation and context | A binary answer |
| Records movement and learning | Static |
| Continuous maintenance | Low maintenance, and it ages |
| Guides, and the exception is a conversation | Controls, and the exception is a process |
| Hard to verify in the pipeline | Automatically verifiable |
| Built with the teams, and takes time | Decided by a few, and comes out fast |

And review frequency balances effort against currency:

| Frequent review | Rare |
|---|---|
| Describes reality | Diverges from it |
| Recurring effort | Less |
| Learning circulates | Stays inside teams |

## Failure Modes

**A radar as prohibition.** Worked around.

**No justification.** Nobody knows why.

**Published and forgotten.**

**Granularity too fine.** Libraries instead of structural decisions.

**No participation from the teams.** It doesn't reflect real experience.

**It never moves.** Items that sit in the same ring for years.

## Common Mistakes

**Replacing one list with another**, with four categories.

**Not recording why.**

**Not recording what was tried and discarded.**

**Copying someone else's radar.**

**Building it without the teams.**

**Having no path to challenge** a "hold".

## Real-World Example

A technology company had a list of 60 approved technologies, maintained by a group of
architects.

An audit of the services in production found 69 technologies running, of which 31 were not
on the list. And the drift ran both ways: 22 of the 60 approved ones were not used by
anyone.

The list was not consulted. It was cited only when someone wanted to block a proposal.

Replacing it with a radar changed three things:

**Mandatory justification.** Each item came to have context: what it is for, when not to
use it, what was learned.

Migrating from the list to the radar required writing that context — and 18 of the 60
items had nobody who knew why they were there. They were removed.

**A "hold" ring with a reason.** Seven technologies went to "hold" with an account of
what had been tried and why it hadn't worked. One of them — a graph database — had been
tried by three different teams in four years, each unaware of the previous ones.

**Built with the teams.** Quarterly review, with reports from those who used them. The
first session took three hours and produced fourteen usage reports that were written down
nowhere — including two cases in which different teams had abandoned the same technology
for the same reason, unaware of each other.

**Movement recorded.** In eighteen months, 23 movements — nine entries into assess, six
promotions to trial, five to adopt, three to hold.

And one change that came later: the technologies in "adopt" started being built into the
platform's paved road. That reduced the need to consult the radar — using the recommended
option became the easiest path. See
[internal developer platforms](/14-devops-and-platform/internal-developer-platforms.md).

The radar remained useful for what cannot be built in: the structural decisions and the
record of what was tried.

The subsequent assessment points out: the 31 technologies off the list were not
indiscipline. They were the answer to real problems, made by people who consulted the
list, found no useful answer, and moved on.

## Related Concepts

- [Standards](/15-enterprise-architecture/standards.md) — the mandatory prescription.
- [Enterprise Principles](/15-enterprise-architecture/enterprise-principles.md).
- [Technical Strategy](/15-enterprise-architecture/technical-strategy.md).
- [Internal Developer Platforms](/14-devops-and-platform/internal-developer-platforms.md).

## Practical Exercise

List the technologies actually in use across your services and compare with the approved
list, if there is one.

The difference measures how much the list describes reality — and, if it is large, it is
guiding nothing.

## Interview Questions

- Why is movement the most valuable information in a radar?
- Why should "hold" not be a ban?
- Why doesn't a public radar replace your own?

## Further Reading

- Thoughtworks. *Technology Radar*, vol. 29, 2023 — one edition as an anchor for the
  format; the rest are published and show items moving between rings.
- Hohpe, Gregor. *The Software Architect Elevator*. O'Reilly, 2020.
- Ford, Neal et al. *Building Evolutionary Architectures*. 2nd ed. O'Reilly, 2022.

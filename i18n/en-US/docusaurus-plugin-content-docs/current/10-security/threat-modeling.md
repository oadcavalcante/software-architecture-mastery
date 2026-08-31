---
id: threat-modeling
title: Threat Modeling
sidebar_position: 10
description: Turning "let's think about security" into a list of decisions — the section's highest-return practice.
doc_type: concept
level: 5
difficulty: advanced
status: complete
objective: >
  By the end, the reader runs a threat modeling session on a design and comes out
  with prioritized decisions, not generic concerns.
prerequisites: [security]
related: [secure-boundaries, least-privilege, security-failure-modes]
canonical_for: []
translated_from_version: 1
last_reviewed: 2026-08-31
---

# Threat Modeling

## Overview

Threat modeling is looking at a design and asking, in a structured way: **what can go wrong here, who would
do it, and what do we do about it?**

The output is not a report. It is **decisions**: changes to the design, controls to implement, risks
consciously accepted.

It is this section's highest-return practice, because it happens before the code exists — when changing is
still cheap.

## Problem

"We need to think about security" is a sentence with no consequence. It does not say what to do, and the
typical result is a list of best practices applied uniformly, with no relation to that system's real risks.

That produces two mistakes at once: effort on protections that do not matter there, and an absence of
protection where it does.

Modeling resolves it by doing the reverse: it starts from the concrete system, identifies what has value,
and works outward.

## Core Concepts

### The four questions

The method, reduced to the essential:

```text
1. what are we working on?     the design, with trust boundaries
2. what can go wrong?          the threats
3. what are we going to do?    the decisions
4. did we do a good job?       review
```

The first question consumes more time than expected, and it is where the value is: most teams discover,
while drawing the data flow, things nobody knew — a forgotten write path, a service with access to what it
should not have.

### Start with the data flow diagram

It is not the pretty architecture diagram. It is a sketch with:

**Processes** — what executes code.

**Data stores** — where the data stops.

**External entities** — users, partners, third-party systems.

**Flows** — who sends what to whom.

**Trust boundaries** — the lines separating different levels of trust.

The boundaries are the point. **Every interesting threat crosses one of them.** See
[secure boundaries](/10-security/secure-boundaries.md).

### STRIDE gives vocabulary for question 2

For each element of the diagram, six threat categories:

```text
spoofing                somebody impersonates another
tampering               somebody alters data or code
repudiation             somebody denies having done it, and there is no proof
information disclosure  somebody reads what they should not
denial of service       somebody prevents legitimate use
elevation of privilege  somebody obtains more access than they have
```

The value is not in the acronym. It is in having a list that keeps the team from thinking only about the
threats they already know — which is the natural bias.

Walking the six categories for each boundary, with discipline, finds things free conversation does not
find.

### The threat actor defines what is reasonable

Protecting against "hackers" guides nothing. Protecting against specific actors does:

```text
a curious user          tries what the interface allows, plus a bit more
a malicious employee    has a legitimate credential and internal access
a competitor            motivated, moderate resources
organized crime         motivated by money, high resources
a nation state          practically unlimited resources
```

The choice of whom you defend against defines the acceptable cost. An internal HR system and a payments
platform do not face the same actors, and protecting them equally is wrong in both cases.

Being explicit about that — including about whom you **will not** be able to stop — is what makes the
discussion honest.

### Prioritize by impact times likelihood

Not every threat deserves a control. Prioritization avoids the infinite list:

**Impact.** What happens if this occurs? Financial loss, data exposure, unavailability, reputational
damage, a regulatory sanction.

**Likelihood.** How easy is it to exploit, given the actor considered?

And four possible answers for each threat:

```text
mitigate   implement a control
transfer   insurance, a contract, outsourcing
accept     record the decision and the reason
eliminate  remove the functionality or the data
```

The last is underestimated. **Data that does not exist does not leak.** Frequently the right answer is not
to collect, not to store, or to delete beforehand.

### When to do it

**At design time**, before implementing. That is when changing is cheap.

**On structural changes** — a new integration, a new type of data, a new boundary.

**Periodically** for critical systems, because the context changes.

Not on every change. Modeling for each task becomes an emptied ritual, and the team stops doing it.

### The output needs an owner and a deadline

A modeling session that ends in a "document with concerns" changes nothing.

The useful output is a short list of decisions, each with an owner and a deadline, and the accepted risks
recorded **with who accepted them** — because accepting risk is a business decision, not an engineering
one.

## Mental Model

**Threat modeling is design, not audit.** It happens beforehand, and the output is decisions.

## When to Use

- Before implementing a relevant system or feature.
- When adding a new trust boundary.
- When starting to handle a new type of data, especially personal data.
- When integrating with an external system.
- Periodically, in critical systems.
- After an incident, to review the model.

## When Not to Use

**For every small change.** It becomes a ritual.

**Without defining the actors.** It produces a generic list.

**As an audit after it is built.** That is a security review, which is something else and arrives too late
for structural changes.

**Without prioritizing.** A list of 80 threats with no order is not actionable.

**With no owner and deadline.**

**With only the security team.** Whoever knows the system is whoever builds it; without them, the model is
wrong.

## Alternatives

- **A security review** — after it is built, for what the modeling did not catch.
- **A penetration test** — it verifies the implementation, not the design.
- **Automated analysis** — it finds known defect classes, not bad architectural decisions.
- **Attack trees** — more detailed, for one specific high-risk scenario.

None substitutes for modeling, because none happens before the design exists.

## Trade-offs

| Modeling at design time | A review afterward |
|---|---|
| Structural change is viable | Expensive or impossible |
| A cost in time beforehand | Rework afterward |
| Finds bad decisions | Finds defects |
| Requires the whole team | The security team suffices |

| Complete STRIDE | Free conversation |
|---|---|
| Systematic coverage | Only what you remember |
| Slower | Fast |
| Finds the unexpected | Confirms the known |

## Failure Modes

**A document with no decisions.**

**A list with no prioritization.**

**Actors not defined.** It protects against everything, badly.

**Done late.** The structural changes no longer fit.

**No review after changes.** The model ages with the system.

**Accepted risks with no record.** Nobody knows they were accepted, or by whom.

**Only the security team in the room.** A model of a system that does not exist.

## Common Mistakes

**Skipping the data flow diagram.** Without seeing where the data goes, the analysis becomes a list of
generic threats attached to nothing in the real system.

**Not marking the trust boundaries.** It is exactly where data crosses from one domain to another that the
threat materializes. Without marking them, the exercise has nothing to focus on.

**Not defining the threat actors.** Defending against a curious user and against an attacker with
nation-state resources are different exercises. Without choosing, you defend against everybody and nobody.

**Not considering "eliminate" as an answer.** Mitigating is the automatic way out, but removing the
functionality or the data that creates the threat is usually cheaper and definitive.

**Ending with no owner and deadline.** A list of threats with no owner and no date is documentation of a
known risk — which, in an incident, is worse than not having done the exercise.

**Doing it once and never reviewing.** The model describes the system at one moment. Each new integration
creates a new boundary, and the old model comes to give false confidence.

## Real-World Example

A healthcare company was about to launch a portal where patients would access test results. The design was
ready and the implementation would start in two weeks.

The threat modeling took two three-hour sessions, with the product team, the engineering team and a
security person.

The data flow diagram, made in the first session, already produced two discoveries before any threat
analysis:

**A forgotten path.** The laboratory system sent results through a shared file directory, with no
authentication, inherited from an old integration. Nobody on the portal team knew about it.

**Unnecessary data.** The portal received the patient's complete record, including history from other
specialties, because the existing API returned everything. Only the test result was displayed.

The STRIDE analysis, in the second session, produced 31 threats. The prioritization, with the actor defined
as "a malicious user with a legitimate account" and "an employee with internal access", reduced it to 9
actionable ones.

The decisions:

**Eliminate.** The portal came to receive only the result of the test being viewed, not the complete
record. That removed 6 of the 31 threats at once, and it was the highest-impact decision — made because
somebody asked "why are we bringing that in?".

**Mitigate.** Authorization verified per test, not per patient — the original version checked whether the
user was the patient and then listed everything. A sequential test identifier in the URL was swapped for an
opaque one.

**Mitigate.** The shared directory integration got authentication and encryption, and became a separate
task with a deadline.

**Accept.** A scenario of a laboratory employee accessing results improperly was accepted as a risk,
mitigated by an audit trail and periodic review, with a record of who accepted it.

**Transfer.** Sending text message notifications was outsourced, with the contractual requirement not to
include clinical content in the message.

Nine months later, a contracted penetration test found two problems — both of implementation, none
structural.

What the team records: the discovery that most changed the outcome did not come from the threat analysis,
it came from drawing the data flow. Nobody had, before that session, a diagram showing every path by which
the patient's data came in and went out.

## Related Concepts

- [Secure Boundaries](/10-security/secure-boundaries.md) — what the diagram marks.
- [Least Privilege](/10-security/least-privilege.md) — the most common answer.
- [Security Failure Modes](/10-security/security-failure-modes.md).
- [Data Protection](/10-security/data-protection.md) — the "eliminate" answer.

## Practical Exercise

Draw the data flow of a feature your team is going to build, with the trust boundaries marked.

For each boundary, walk the six STRIDE categories. You will find at least one thing nobody had considered —
and probably a data path somebody forgot to mention.

## Interview Questions

- What are the four questions, and which of them usually gives the most return?
- Why does defining the threat actor change the decisions?
- Why is "eliminate" the most underestimated answer?

## Further Reading

- Shostack, Adam. *Threat Modeling: Designing for Security*. Wiley, 2014.
- Threat Modeling Manifesto, 2020 — the four questions.
- OWASP. *Threat Modeling Cheat Sheet*.

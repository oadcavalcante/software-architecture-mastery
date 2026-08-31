---
id: superseding-decisions
title: Superseding Decisions
sidebar_position: 9
description: Changing your mind without erasing the record — the mechanic that keeps the history useful.
doc_type: concept
level: 5
difficulty: advanced
status: complete
objective: >
  By the end, the reader supersedes a decision while preserving the previous reasoning and
  recording what changed in the context.
prerequisites: [adr-status]
related: [adr-status, adr-context, adr-alternatives]
canonical_for: []
translated_from_version: 2
last_reviewed: 2026-08-31
---

# Superseding Decisions

## Overview

Superseding is the mechanism by which a recorded decision is replaced by another, **without
the first one disappearing**.

The new ADR declares that it supersedes the old one; the old one declares that it was
superseded. Both stay legible, and the sequence between them is what becomes informative:

```text
ADR-014 (2022)  process orders synchronously
ADR-047 (2024)  process them asynchronously — supersedes 014
ADR-061 (2026)  process them synchronously with a rate limit — supersedes 047
```

That chain tells a story none of the three documents tells on its own. And it only exists
because none of them was deleted.

## Problem

When a decision has to change, the impulse is to deal with the old document: edit it, delete
it or ignore it.

```text
edit     the original context becomes false
delete   the organization forgets it already decided
ignore   two contradictory ADRs, with no indication of which holds
```

The third is the most common in practice and the most confusing: someone finds ADR-014
saying "synchronous", doesn't find ADR-047, and concludes the decision in force is
synchronous.

And there is a problem that precedes all of them: the decision that **needs** to be
superseded and isn't. It stays recorded as in force while the system already does something
else — which is the worst possible state, because the record starts lying with the
appearance of authority.

## Core Concepts

### The mechanics

```text
1. a new, complete ADR is written, with its own context
2. the new one declares: "supersedes ADR-014"
3. the old one gets: "superseded by ADR-047 on <date>"
4. nothing else in the old one changes
5. the index reflects the change
```

Step 1 is the one usually skipped. The new ADR is not an amendment — it needs its own
context, alternatives and consequences, because the context is now different.

### The successor's context includes what changed

The most important section of the superseding ADR:

```text
"ADR-014 decided on synchronous processing in 2022, when the volume was
30 orders/s and the payment partner had 99.9% measured availability.

Since then: the volume reached 400/s at peak, and the partner's
availability dropped to 95.9% over the last 12 months, after their
infrastructure migration. Both of ADR-014's premises ceased to hold."
```

That answers the question that matters: **what changed?** It distinguishes a decision
revisited because of new information from one revisited because of the preference of
whoever arrived later.

See [context](/18-architecture-decisions/adr-context.md).

### Not every change is superseding

```text
the context changed and the decision no longer serves   → supersede
the decision was never implemented                      → deprecate
the subject of the decision disappeared                 → deprecate
the decision is being detailed, not altered             → a new ADR, no superseding
part of the decision changes                            → depends on the scope
```

The last case is the most delicate. If the original decision had a broad scope and only part
of it changes, there are two ways out: supersede it entirely with a successor of equivalent
scope, or write a new ADR that explicitly narrows the previous one's scope without
superseding it.

The second produces chains that are easier to read, and it requires the original scope to
have been declared clearly. See
[decision](/18-architecture-decisions/adr-decision.md).

### The reversal condition is the trigger

An ADR that recorded, in its alternatives, the condition under which each discarded option
would win again already contains the trigger for its own superseding:

```text
ADR-014  "synchronous would lose again if the partner drops below 99%
         sustained availability"
2024     measurement shows 95.9%
         → the condition was met; the decision deserves review
```

That changes the nature of the review: from a judgment about what to do, to verifying a
recorded condition. See
[alternatives](/18-architecture-decisions/adr-alternatives.md).

### Superseding by accretion

A common and badly handled case: the decision was never formally revisited, and practice
diverged little by little.

```text
the ADR says   "every service uses PostgreSQL"
reality        4 services use PostgreSQL, 3 use DynamoDB, 1 uses Mongo
```

Here the superseding is retroactive: you write an ADR that acknowledges the real practice,
explains how it got there, and decides what holds from now on.

That is uncomfortable and it is the most honest record available. The alternative — keeping
an ADR that describes a nonexistent reality — erodes confidence in the whole set.

### Reading the chain teaches

The long-term value appears in the sequence:

```text
decisions that went and came back      a sign that a force was underestimated
decisions superseded in under a year   a sign of a decision made too early
decisions never superseded in 5 years  either they were good, or nobody reviews
long chains on the same topic          the real problem was not addressed
```

The last pattern is the most informative. Three supersedings on the same question in four
years rarely indicate a changing context — they indicate the decision is treating the
symptom.

### The superseded ADR is still correct

Worth insisting on, because the opposite impulse is strong: a superseded ADR was not wrong.
It records a decision appropriate to its own context.

Treating it as an error discourages recording — if being superseded is shameful, people
write less and supersede less.

## Mental Model

**Replace, don't erase.** The successor explains what changed; the predecessor remains true
about its own moment.

## When to Use

- When the context changed and the decision no longer serves.
- When the recorded reversal condition has been met.
- When practice diverged and the record has to acknowledge reality.
- When the decision was revisited because of new information.

## When Not to Use

**Editing the old ADR.**

**Deleting the superseded one.**

**Without explaining what changed** in the successor's context.

**As an amendment** — the successor has to be complete.

**With no bidirectional reference.**

**For decisions that were never implemented** — the correct status is deprecated.

## Alternatives

- **Deprecate** — when there is no successor.
- **A complementary ADR** — when the decision is being detailed, not altered.
- **Narrowing the scope** — a new ADR that limits the previous one's reach, without
  superseding it.
- **A review with no change** — recording that the decision was reassessed and kept, with a
  date. See [status](/18-architecture-decisions/adr-status.md).

The last is underused and cheap: a "reviewed on (date), kept" block tells you someone
checked, which is different from nobody having looked.

## Trade-offs

| Supersede | Edit |
|---|---|
| History preserved | A single document |
| Requires an index | Direct reading |
| Teaches through the sequence | Fewer files |

| Complete successor | Short amendment |
|---|---|
| Legible on its own | Fast to write |
| Duplicates context | Depends on reading both |
| Supersedable in turn | Confusing chains |

## Failure Modes

**An obsolete decision not superseded.** The record starts lying.

**A successor that doesn't explain the change.** It looks like preference, not information.

**No bidirectional reference.** The old one is found, the new one isn't.

**The superseded one deleted.** The history disappears.

**Superseding treated as an error.** It discourages the practice.

**A long chain ignored.** The pattern it reveals goes unread.

## Common Mistakes

**Writing the successor as an amendment** to the previous one.

**Not dating the superseding.**

**Not acknowledging divergence from practice**, keeping a fictional ADR.

**Not recording reviews that kept the decision.**

**Numbering the successor with the predecessor's number** plus a suffix — it breaks
referenceability.

## Real-World Example

A digital health company had a chain of ADRs about authentication stretching over six years:

```text
ADR-008 (2019)  in-house authentication, with sessions in the database
ADR-021 (2021)  stateless JWT tokens — supersedes 008
ADR-034 (2022)  JWT with a revocation list in cache — supersedes 021
ADR-052 (2024)  back to stateful sessions, in a distributed cache — supersedes 034
ADR-071 (2025)  external identity provider — supersedes 052
```

Five decisions, four supersedings, the same question. Each ADR was well written, with
context, alternatives and consequences.

An annual architecture review read the whole chain at once — something nobody had done —
and the pattern appeared:

```text
ADR-021  reason for discarding 008: scalability of database sessions
ADR-034  reason for discarding 021: there was no way to revoke tokens
ADR-052  reason for discarding 034: the revocation list became state,
         cancelling out the JWT advantage
ADR-071  reason for discarding 052: operational complexity
```

ADRs 021, 034 and 052 revolved around a known tension — revocation requires state, and
stateless tokens don't allow revocation — that none of them named. Each decision solved the
symptom of the previous one and reintroduced the problem of the one before that.

What came out of the review:

**Chain review** built into the annual review: every chain with three or more supersedings
is read in full, with a single question — "what is the tension that was never named?".

**A "history of this decision" section** in the successors of long chains, summarizing the
previous ones and what each tried to solve.

**A declared constraint** in ADR-071: the record came to explicitly name the tension between
revocation and statelessness, and to justify why delegating to an external provider solved
the root and not the symptom.

The review also found another data point: of the organization's 118 decision chains, 9 had
three or more supersedings. All nine, on examination, showed the same symptom pattern.

Two of them were reopened on that basis.

The lesson that stuck: each individual ADR in the authentication chain was defensible. The
problem was only visible in the sequence — and the sequence only existed because no ADR had
been deleted or edited.

## Related Concepts

- [Status](/18-architecture-decisions/adr-status.md) — the states and immutability.
- [Context](/18-architecture-decisions/adr-context.md) — what changed.
- [Alternatives](/18-architecture-decisions/adr-alternatives.md) — the reversal condition as
  a trigger.
- [Modernization](/16-legacy-modernization/index.md) — decisions revisited in old systems.

## Practical Exercise

Find your team's longest decision chain and read it in full, from the first to the last.

Ask: what is the tension none of the ADRs names? Long chains almost always have one.

## Interview Questions

- Why does the successor need its own context instead of being an amendment?
- What does a chain with four supersedings on the same topic usually indicate?
- Why does treating superseding as an error reduce the quality of the archive?

## Further Reading

- Nygard, Michael. *Documenting Architecture Decisions*. 2011.
- Ford, Neal et al. *Software Architecture: The Hard Parts*. O'Reilly, 2021.
- Woods, Eoin. *Harnessing Architecture Decision Records*. IEEE Software, 2022.

---
id: 02-library-system
title: "Exercise 02 — Library System"
sidebar_position: 1
description: The second exercise on the path — boundaries, dependency direction and what happens when the requirement changes.
doc_type: exercise
level: 2
difficulty: beginner
status: complete
objective: >
  By the end, the reader designs modules with explicit boundaries and a declared dependency
  direction, and sees the cost of a badly placed boundary.
prerequisites: [modular-design]
related: [coupling, cohesion, dependency-direction, boundaries]
canonical_for: []
translated_from_version: 2
last_reviewed: 2026-08-31
---

# Exercise 02 — Library System

## Context

A network of municipal libraries with 14 branches wants to replace its lending system, which today is
a shared spreadsheet per branch.

The collection is around 180 thousand copies, with 40 thousand registered users and an average of 900
loans a day across the whole network. There is no scale pressure — the system runs on one machine.

This is the second exercise on the path, and it is not about scale or distribution. It is about
**boundaries**: where to separate, what depends on what, and what happens when the requirement
changes.

## Requirements

For the **user**: search the collection; reserve a copy; check their loans and due dates; renew a loan,
if nobody else has a reservation.

For the **librarian**: record loans and returns; check a user's status; handle overdue items, applying
the suspension rule.

For the **network**: transfer copies between branches; produce collection and circulation reports.

## Constraints

```text
loan period          14 days, renewable twice
overdue suspension   one day of suspension per day overdue,
                     cumulative; capped at 60 days
reservation          a queue per title, not per copy
transfer             a copy in transit cannot be
                     loaned or reserved
city regulation      the loan period and the suspension are set by
                     ordinance and have changed three times in ten years
```

The last constraint is the most important in the brief, and the one usually ignored.

## Your Task

Produce, in up to an hour:

1. The system's **modules**, with one sentence saying what each hides from the rest.
2. The **direction of the dependencies** between them — who imports whom, and who never imports whom.
3. The **data model** for loan, reservation and copy.
4. Where the **loan period and suspension rule** lives, and why.

Don't draw technical layers — controller, service, repository. Draw modules by domain responsibility.

## Questions You Should Be Asking

Before deciding anything:

```text
are a copy and a title the same thing?
is the reservation queue per title or per copy?
what happens to the reservation when the copy comes back damaged?
can one branch have a different loan period?
how long does the loan history have to be preserved?
who can change the suspension rule, and how often?
```

The first and the last decide almost everything. The first defines the model; the last defines where
the rule lives.

## Assessment Criteria

Your answer is good if:

- **Title and copy are distinct entities.** A title has N copies; the reservation is per title and
  fulfilling the reservation is per copy. Confusing them produces a model that does not represent the
  domain.
- **The loan period and suspension rule is isolated.** It changes by ordinance, three times in ten
  years, and the requirement says so. If it is spread across four modules, every city change is a hunt.
- **No domain module depends on infrastructure.** The loan module doesn't know a database or a web
  interface exists.
- **The dependencies have a declared direction and no cycles.** If `loans` imports `collection` and
  `collection` imports `loans`, they are one module disguised as two.
- **You can say what each module hides.** A module that hides nothing is a folder.

Your answer is weak if it is a list of database tables with module names pasted on top.

## Discussion

:::details Open after trying

**The boundary that decides the exercise** is between what lends and what holds the collection.

```text
collection    titles, copies, physical condition, location,
              transfer between branches
circulation   loan, return, renewal, reservation, due date
users         registration, status, suspension
```

`circulation` depends on `collection` — it needs to know whether a copy is available. `collection`
does **not** depend on `circulation`: a copy knows where it is and what condition it is in, and doesn't
know whether it is on loan.

That is counterintuitive, because "on loan" looks like a state of the copy. Modeling it that way couples
the collection to circulation and produces the cycle. A copy has a physical state — available, in
transit, damaged, withdrawn; **on loan is a fact of circulation**, not of the collection.

Whoever models "on loan" as a state of the copy discovers the problem at transfer time: a copy in
transit and on loan at the same time is impossible, and the model allows it.

**The loan period and suspension rule** deserves its own module, or at least a single point. It is the
one part of the system with a known expiry date — the brief says it changes by ordinance. A system in
which that rule lives in three places pays for the change three times, with every ordinance.

The detail that separates a good answer from a great one: the rule has to be **dated**. A loan made
under the previous ordinance is renewed under which period? The correct answer is the rule in force on
the loan date, which means the rule is versioned by effective period — and that is a modeling decision,
not a configuration one.

**What almost everybody gets wrong:** making the reservation queue per copy. The user reserves a title;
which copy fulfills the reservation is the system's decision at return time. Reserving per copy creates
queues per physical object and produces the absurd situation of someone waiting for copy 3 while copy 7
is on the shelf.

See [modular design](/02-software-design/modular-design.md), [boundaries](/02-software-design/boundaries.md) and
[dependency direction](/02-software-design/dependency-direction.md).

:::

## Related Concepts

- [Modular Design](/02-software-design/modular-design.md).
- [Boundaries](/02-software-design/boundaries.md).
- [Dependency Direction](/02-software-design/dependency-direction.md).
- [Coupling](/01-fundamentals/coupling.md) and
  [Cohesion](/01-fundamentals/cohesion.md).

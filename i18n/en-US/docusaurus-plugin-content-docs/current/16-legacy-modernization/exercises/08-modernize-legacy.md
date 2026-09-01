---
id: 08-modernize-legacy
title: "Exercise 08 — Modernize a Legacy System"
sidebar_position: 1
description: A system that has worked for nineteen years, two people who know how to change it, and no window to stop.
doc_type: exercise
level: 6
difficulty: advanced
status: complete
objective: >
  By the end, the reader proposes an incremental modernization with a justified order, each phase
  ending in a usable state.
prerequisites: [migration-strategies]
related: [strangler-fig, incremental-modernization, modernization-risk, organizational-constraints]
canonical_for: []
translated_from_version: 1
last_reviewed: 2026-08-31
---

# Exercise 08 — Modernize a Legacy System

## Context

The **Valley Agricultural Cooperative** processes harvest purchasing for 11,000 farmers. The system
that does it went into production in 2007.

```text
lines of code                   ~2.4 million, in Delphi
database                        Firebird, a schema with 840 tables
integrations                    3 banks, 2 regulators,
                                one tax system
people able to change it        2, with 19 and 14 years at the company
documentation                   out of date since 2011
automated tests                 none
availability in 2025            99.7%
```

The system **works**. It has never lost a payment and never miscalculated a harvest. That has to be
said first, because a proposal that treats it as a problem will be rejected by the people who have
maintained it for nineteen years.

Three pressures motivate the discussion:

**Knowledge.** The two people retire in four and seven years. There is no market for the technology,
and training someone internally took, on the last attempt, two and a half years — and the person left.

**A digital channel.** The cooperative wants farmers to check their position and schedule delivery from
their phones. The system has no programmable interface of any kind.

**Regulatory.** A new regulation requires origin traceability by batch, with a 30-month deadline.
Implementing it in the current system was estimated by the two people at 14 months.

## Requirements

The system has to go on doing everything it does. Beyond that, over a 30-month horizon:

```text
a programmable interface for the digital channel
origin traceability by batch
more than two people able to maintain the system
```

## Constraints

```text
no window          the harvest peaks in four months of the year;
                   in those periods nothing can be touched
team               the cooperative can hire up to 8 engineers;
                   none of them will learn Delphi
budget             approved yearly, with the risk of a freeze
regulatory deadline  30 months, with a fine
the two people     have to take part, and cannot be treated
                   as an obstacle
business rules     are not written down anywhere but the code
```

## Your Task

Produce, in up to 90 minutes:

1. The **strategy**: rewrite, convert, strangle or encapsulate — with the reason.
2. The **order of the phases**, and what is left if the work stops at the end of each one.
3. How the **business rules** come out of the code without being lost.
4. The role of the **two people** in the plan.
5. How you meet the **30-month regulatory deadline** within the chosen strategy.

## Questions You Should Be Asking

```text
which features change frequently, and which haven't changed
  in years?
where are the integrations, and which are stable?
is the 840-table schema all in use?
is there an access log showing what actually runs?
which part of the system does the regulatory traceability touch?
what does the digital channel need to read, and what does it need to write?
```

The fourth is the most valuable and is almost never asked: in nineteen-year-old systems, a large
fraction of the code is unreachable.

## Assessment Criteria

Your answer is good if:

- **You did not propose a complete rewrite.** With undocumented rules, two people and a regulatory
  deadline, it is the strategy with the highest historical failure rate in this scenario.
- **The first phase delivers value** and is not infrastructure. If the plan is cancelled in month 8,
  what is left has to be good for something.
- **You meet the regulatory deadline without depending on the entire modernization.** Thirty months do
  not cover 2.4 million lines.
- **Rule recovery is by comparison, not by reading.** Nobody is going to read 2.4 million lines of
  Delphi and extract a correct specification.
- **The two people have a role of authority**, not of a source to consult. They know what nobody else
  knows, and the plan depends on that.

Your answer is weak if it starts with "let's build the new platform" and treats the two people as a
risk to mitigate.

## Discussion

:::details Open after trying

**The strategy is strangling**, with the legacy system encapsulated early on.

The reason is not preference: rewriting requires the specification that doesn't exist, and converting
automatically preserves the logic without solving the knowledge problem — the generated code stays
unreadable to the eight new engineers.

**The order, and what is left at each stop:**

```text
phase 1 (4 months)   a read facade over the legacy system
                     → the digital channel goes live
                     if it stops here: the farmer checks their position for
                     the first time, and the cooperative has a visible result

phase 2 (8 months)   batch traceability, built OUTSIDE the
                     legacy system, fed by events the facade emits
                     → the regulatory deadline met in month 12, with
                     18 to spare
                     if it stops here: compliance guaranteed

phase 3 (12 months)  extraction of the capabilities with the highest rate
                     of change, with parallel comparison
                     if it stops here: part migrated, part in the legacy
                     system, both working

phase 4 (ongoing)    the rest, in order of risk
```

**Phase 2 is the decision that solves the exercise.** The traceability does not have to be inside the
legacy system — it needs the data the legacy system produces. Built outside, it takes 8 months instead
of the 14 estimated inside, and it depends on neither of the two people.

Whoever puts the traceability inside the legacy system consumes 14 of the 30 months, occupies the two
people who are the scarcest resource, and arrives at month 14 having modernized nothing.

**The rules come out by comparison.** The new system is implemented with the best available
understanding, runs in parallel over real transactions, and each divergence is a rule discovered.
Reading the code doesn't work: in nineteen years, the harvest calculation logic has cases nobody
remembers writing.

See the [modernization case study](/21-case-studies/legacy-modernization-case.md).

**The two people** are the authority over the comparison, not the source of the specification. Their
role is to decide, faced with a divergence, which behavior is correct — and that judgment is what no
document replaces.

Treating them as an obstacle is the most common and the most expensive error: they can sink the
project without doing anything, simply by not collaborating, and they would be right.

**The question about unreachable code** usually pays off: in systems of that age, between 30% and 50%
of the code hasn't run in years. Discovering that reduces the real scope before a single line is
written, and it is the project's highest-return survey.

**The harvest peaks** define the calendar: eight months of the year are usable, four are not. A
30-month plan has, in practice, a 20-month window — and that has to be in the schedule from the start,
not discovered at the first peak.

:::

## Related Concepts

- [Migration Strategies](/16-legacy-modernization/migration-strategies.md).
- [Strangler Fig](/16-legacy-modernization/strangler-fig.md).
- [Case Study: Legacy Modernization](/21-case-studies/legacy-modernization-case.md).
- [Organizational Constraints](/16-legacy-modernization/organizational-constraints.md).

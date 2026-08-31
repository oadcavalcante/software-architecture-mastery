---
id: adr-005-hexagonal
title: "ADR-005 — Ports and Adapters in the Domain Modules"
sidebar_position: 14
description: An example ADR with a narrow scope and recorded disagreement — adopting hexagonal only where it pays off.
doc_type: adr
level: 5
difficulty: advanced
status: complete
objective: >
  By the end, the reader sees how to bound the scope of a design decision and how to record
  a legitimate objection without erasing it.
prerequisites: [adr-structure]
related: [adr-decision, adr-alternatives, adr-consequences]
canonical_for: []
translated_from_version: 1
last_reviewed: 2026-08-31
---

# ADR-005 — Adopt Ports and Adapters in the Domain Modules

:::note Teaching example

The last of the five ADRs from the fictional **Verano** system. This example shows a
**declared narrow scope** and **recorded disagreement**.

:::

| | |
|---|---|
| Status | accepted on 2026-01-15 |
| System | Verano — ordering platform |
| Authors | platform team |
| Deciders | platform technical committee |
| Consulted | the five product teams |

## Context

Three years after [ADR-001](/18-architecture-decisions/adr-001-modular-monolith.md), the
modular monolith is still Verano's structure, and it still sustains the business. But two
pressures have appeared.

**Extraction.** The delivery module has come to have a load profile very different from the
rest — peaks concentrated in two windows of the day, with a need for independent scaling.
The condition "any single module requiring capacity above 3× that of the others", recorded
as a warning signal in ADR-001, was met in November 2025.

**Infrastructure replacement.** Over the last 18 months we changed the payment provider, the
SMS notification provider and the geolocation provider. Each change took between 6 and 11
weeks, and measuring where the time went showed the pattern:

```text
business logic touched in each change      between 40 and 70 files
logic that genuinely needed to change      ~0
time spent adapting scattered calls        ~70% of the effort
```

The situation in January 2026:

```text
modules                       7 (catalog, cart, order, payment,
                              delivery, notification, fraud)
engineers                     38, across 5 teams
modules with substantive
  domain logic                3 — order, delivery, fraud
modules that are mostly
  integration or querying     4
```

Constraints:

- We don't have the capacity to rewrite seven modules. Any change has to be incremental.
- The team is spread across five teams with autonomy; a decision requiring relearning across
  all of them is expensive.

What we didn't know: whether the delivery module would actually be extracted, or whether
independent scaling could be resolved without extraction.

## Decision

We will adopt **ports and adapters** in the three modules with substantive domain logic —
**order, delivery and fraud**.

In those modules, the domain logic comes to depend only on interfaces it declares itself.
The database, external providers, messaging and transport come in as adapters.

**We will not** apply the pattern to the remaining four modules — catalog, cart,
notification and payment keep direct database access and direct integration clients. In
modules that are essentially integration or querying, the inversion would add a layer with
no logic to protect.

**We will not** rewrite the three modules all at once: adoption is incremental, applied to
new code and to areas touched by change, over 12 months.

## Alternatives Considered

**Apply it to all seven modules.** Discarded because four of them have no domain logic to
isolate — the additional layer would be cost with no return, and the pattern would lose
credibility exactly where it matters.

*Would win again if:* any of those four develops domain logic of its own. Catalog is the
most likely candidate, with pricing rules on the roadmap.

**Don't adopt it; extract the delivery module directly.** Discarded because extraction
without prior isolation would require untangling the dependencies during the extraction —
which is the moment of greatest risk. Doing the isolation first lets us extract later with
the domain already independent.

*Would win again if:* the extraction were urgent and the module's logic were already
isolated.

**An anti-corruption layer only on the external integrations**, without inverting the
persistence dependencies. Discarded as insufficient for the extraction goal — coupling to
the database is what makes separating a module hardest. But it was adopted as an
**intermediate step** in the three modules, being cheaper and delivering results sooner.

## Consequences

**Positive (short-term).** Provider changes come to touch only the adapter. Based on the
three previous changes, we estimate a reduction from 6–11 weeks to 2–3.

**Positive (long-term).** The delivery module becomes extractable without untangling
dependencies. Domain tests stop requiring a database.

**Negative (immediate).** More interfaces and more files. Navigating from the endpoint to
the rule goes through one more indirection, which is especially annoying for newcomers.

**Negative (long-term).** Two styles coexisting in the same codebase, by deliberate
decision. That requires the criterion to be known, or it looks like inconsistency.

**Neutral.** A short document explaining the criterion for applying it becomes necessary in
onboarding.

**Risk accepted.** The pattern may leak into the four modules by imitation, without the
criterion. We will check for that in code reviews.

## Recorded Disagreement

Three engineers, from two teams, argued for applying the pattern to all seven modules. The
argument: two styles in the same codebase produce more confusion than the cost of the extra
layer, and the criterion "has substantive domain logic" is subjective enough to generate a
discussion for every new module.

The decision was made accepting that risk, with two mitigations: the criterion was written
explicitly in the contributing guide, and the question will be reassessed in 12 months based
on how many discussions about "does this module qualify?" have occurred.

## Warning Signal

- More than **five discussions** in 12 months about whether a module fits the criterion.
- Average provider change time **above 4 weeks** after adoption.
- Any of the four excluded modules adopting the pattern **with no recorded decision**.
- Recurring complaints from newcomers about navigability in the three modules.

## What to notice in this example

The scope is **narrow and declared in both directions**: three modules yes, four no, with an
explicit criterion. See [decision](/18-architecture-decisions/adr-decision.md).

The disagreement has its own section, with the dissenters' argument preserved and the
mitigation recorded. If the risk materializes, the objection will be there — and it was a
good one. See
[consequences](/18-architecture-decisions/adr-consequences.md).

One discarded alternative was **partially adopted** as an intermediate step. That is common
in practice and rarely recorded.

The context links this decision to the warning signal in
[ADR-001](/18-architecture-decisions/adr-001-modular-monolith.md), met two months earlier.
Verano's decision chain is navigable end to end — which is the effect continuous recording
produces.

## Related Concepts

- [Decision](/18-architecture-decisions/adr-decision.md) — scope and disagreement.
- [Hexagonal Architecture](/02-software-design/hexagonal-architecture.md).
- [ADR-001](/18-architecture-decisions/adr-001-modular-monolith.md) — the structural decision
  this one complements.
- [Anti-Corruption Layer](/08-integration-architecture/integration-anti-corruption.md).

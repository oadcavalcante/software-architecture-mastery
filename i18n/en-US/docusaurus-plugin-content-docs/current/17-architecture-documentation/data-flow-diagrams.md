---
id: data-flow-diagrams
title: Data Flow Diagrams
sidebar_position: 8
description: Where the data goes, where it rests, and where it crosses a boundary.
doc_type: concept
level: 5
difficulty: intermediate
status: complete
objective: >
  By the end, the reader knows how to map a piece of data's path across systems and use
  that for privacy, security and ownership.
prerequisites: [container-diagrams]
related: [sequence-diagrams, container-diagrams, c4-model]
canonical_for: []
translated_from_version: 1
last_reviewed: 2026-08-31
---

# Data Flow Diagrams

## Overview

A data flow diagram follows **one type of data** across systems: where it is born, where it
passes through, where it is stored, who reads it, and where it leaves.

It is organized by the data, not by the system — and it is that change of axis that makes
it useful for questions no structural diagram answers well:

```text
where is this personal data stored?
who has access to it?
does it leave our boundary?
how many copies exist?
what happens when the customer requests deletion?
```

## Problem

Structural diagrams are organized by system. A question about data crosses all of them,
and the answer has to be assembled by piecing diagrams together — which in practice means
nobody knows.

And the question comes up in contexts where being wrong has consequences:

```text
privacy regulation   where the personal data is, who accesses it
security             where it crosses a trust boundary
ownership            who the source is, who has a copy
cost                 how many times it is replicated
```

The most common concrete case: a personal data deletion request arrives, and the
organization cannot enumerate where the data is.

## Core Concepts

### The elements

```text
external sources and sinks   where it comes from, where it goes
processes                    what transforms the data
stores                       where it rests
flows                        the movement, labeled with what travels
trust boundaries             where the data changes control domain
```

The last is what distinguishes this diagram from the others: the **trust boundary** is a
line crossing the drawing, and every flow that crosses it is a point of attention.

### Points of rest matter more than transit

The reflex is to draw the arrows. The most valuable content is the storage boxes:

```text
operational database
read replica
cache
queue (N days retention)
analytical warehouse
export file
application logs
backup
staging environment with real data
```

The last four are the forgotten ones, and frequently the most problematic. Application
logs with personal data, backups with seven-year retention and staging loaded with a
production copy show up in almost every serious mapping.

See [data protection](/10-security/data-protection.md).

### Trust boundaries

```text
our network → cloud provider
our system → external partner
production → analytics
region A → region B
internal system → customer's device
```

Each crossing deserves an answer to three questions: what travels, with what protection,
and under what contractual or legal basis.

This diagram is the canonical input for
[threat modeling](/10-security/threat-modeling.md) — the STRIDE technique is applied
element by element over it.

### One diagram per data type

As with the sequence diagram, the scope is narrow by nature:

```text
"customer data"    one diagram
"payment data"     another
"telemetry"        another
"all the data"     not a diagram
```

In practice, the types worth the effort are few: the regulated ones, the sensitive ones,
and the ones with an ownership dispute.

### It reveals ownership

By following the data, the question "who owns this" becomes answerable: the owner is
whoever produces it and has authority over its definition.

The diagram frequently shows the opposite of the org chart — the data team A "owns" is born
in a system belonging to team B and is modified by a process belonging to team C.

See [data ownership](/07-data-architecture/data-ownership.md) and
[data lifecycle](/07-data-architecture/data-lifecycle.md).

### It answers the deletion request

A practical consequence: without the mapping, honoring a deletion request is guesswork.
With it, it is a list.

And the mapping usually shows that complete deletion is harder than assumed — immutable
backups, analytical aggregates already computed, and application logs with fixed retention
are cases that require a decision, not code.

### Retention belongs in the diagram

Each point of rest has a duration, and annotating it in the drawing itself changes what it
answers:

```text
operational database   as long as the customer exists
cache                  15 minutes
queue                  7 days
application logs       90 days
analytical warehouse   indefinite
backup                 7 years
```

The retention column turns the map into a decision instrument: it shows that data deleted
from the operational database still exists in five other places, for periods nobody chose
deliberately. See
[data lifecycle](/07-data-architecture/data-lifecycle.md).

## Mental Model

**Follow the data, not the system.** Where it rests matters more than where it passes.

## When to Use

- For personal or regulated data, always.
- As input for threat modeling.
- When defining data ownership across teams.
- Before answering privacy requirements.
- When assessing replication cost.

## When Not to Use

**For all the data.** Choose the ones that matter.

**As a substitute for a structural diagram** — it doesn't describe the system.

**Without marking trust boundaries** — it loses the main point.

**Without the secondary points of rest** — logs, backups, staging.

**Only once.** A 2023 mapping does not describe 2026.

## Alternatives

- **A data catalog** — a structured inventory, more complete and less visual. See
  [data lifecycle](/07-data-architecture/data-lifecycle.md).
- **A processing register** — the form required by some regulations; textual.
- **Data lineage** — automated, shows derivation, not trust boundaries.
- **[Sequence](/17-architecture-documentation/sequence-diagrams.md)** — when the question is order, not location.

Automated lineage is complementary: it covers what manual mapping forgets, and it doesn't
distinguish what is sensitive.

## Trade-offs

| Data flow | Structural |
|---|---|
| The axis is the data | The system |
| Crosses boundaries | One scope |
| Answers privacy questions | Answers change questions |
| One per data type | One per system |

| Manual | Automated lineage |
|---|---|
| Includes intent and boundaries | Only observed derivation |
| Goes out of date | Current |
| Curated | Complete and noisy |

## Failure Modes

**Only transit.** Without the points of rest, the map is useless.

**Forgotten logs.** Personal data in logs is the most common case.

**Staging with real data** not mapped.

**Backups out of scope.** And with the longest retention.

**No trust boundaries.** It becomes a badly made structural diagram.

**Done once** for an audit, and never again.

## Common Mistakes

**Mapping only the main path.**

**Ignoring analytical copies.**

**Not recording retention** at each point of rest.

**Confusing it with a sequence diagram.**

**Not using the result** — the mapping becomes an audit artifact instead of decision
input.

## Real-World Example

A healthcare company had to map its patient data flow to meet a regulatory requirement.
The expectation was to confirm what was already known.

The mapping found 23 points of rest. The team's initial estimate had been 8.

The 15 unexpected ones:

```text
application logs, with identifier and diagnosis          6 systems
staging environment with a production copy               2
scheduled exports to a partner                           1
analytical warehouse and three derived aggregates        4
backups with seven-year retention                        1
a spreadsheet on a network share                         1
```

Three trust boundary crossings were documented nowhere, including the export to the
partner — done by a scheduled job created four years earlier, whose author no longer worked
at the company.

The decisions:

**Sanitized logs.** Identifiers masked and diagnosis removed from application logs, with an
automated check in the pipeline.

**Staging with synthetic data.** The production copy was eliminated — which required
building test data generation, two months of work nobody had prioritized before.

**Export revisited.** The contract with the partner was renegotiated and the field scope
reduced from 40 to 9.

**Retention declared** at each point of rest, and implemented where it did not exist.

**A deletion procedure** written based on the map, including what cannot be deleted and
why — the immutable backups became a documented exception, with a natural expiry date.

**The map reviewed every six months**, with a named owner.

What the team records: the spreadsheet on the network share was found by accident, in a
conversation, and not by any method. That led to a second practice — automated scanning for
sensitive data patterns in uncatalogued stores.

## Related Concepts

- [Data Protection](/10-security/data-protection.md).
- [Threat Modeling](/10-security/threat-modeling.md).
- [Data Ownership](/07-data-architecture/data-ownership.md).
- [Sequence Diagrams](/17-architecture-documentation/sequence-diagrams.md).

## Practical Exercise

Choose a sensitive data type in your system and list every point where it rests —
including logs, backups, staging and analytical copies.

Compare the total with your initial estimate. The difference is the measure of what was
invisible.

## Interview Questions

- Why do the points of rest matter more than the flows?
- What is a trust boundary and why does it deserve attention?
- Why is this diagram the input for threat modeling?

## Further Reading

- Shostack, Adam. *Threat Modeling*. Wiley, 2014.
- Kleppmann, Martin. *Designing Data-Intensive Applications*. O'Reilly, 2017.
- Hoberman, Steve. *Data Modeling Made Simple*. 2nd ed. Technics, 2009.

---
id: batch-integration
title: Batch Integration
sidebar_position: 7
description: Processing many records at once — the style that moves more corporate data than all the others combined.
doc_type: concept
level: 5
difficulty: intermediate
status: complete
objective: >
  By the end, the reader recognizes when batch is the right answer and designs
  reprocessable rather than unrepeatable windows.
prerequisites: [integration-architecture]
related: [file-integration, messaging-integration, data-lifecycle]
canonical_for: []
translated_from_version: 1
last_reviewed: 2026-08-31
---

# Batch Integration

## Overview

Batch integration processes a large set of records at once, at defined intervals.

It is the least discussed and the most used style: payroll, bank reconciliation, billing, analytical loads,
regulatory files. Most of the data that crosses corporate boundaries still travels this way.

It is frequently treated as legacy to be replaced. For a large class of problems, it is simply the right
answer — and replacing it with continuous processing makes everything worse.

## Problem

Not all processing benefits from happening immediately.

Closing the month's billing requires the month to have ended. Reconciling with the bank depends on the file
the bank sends once a day. Calculating commissions needs the complete set of the period's sales.

In those cases, processing record by record buys no latency — the result only exists when the set is
complete. And processing in batch is orders of magnitude more efficient: one query that brings back a
million records costs far less than a million queries.

## Core Concepts

### The gain is efficiency, not latency

Grouped operations amortize fixed cost: one connection, one transaction, one query, one file write.

```text
1,000,000 individual calls    ~1,000,000 × (network + transaction + index)
1,000 batches of 1,000        ~1,000 × (network + transaction) + a grouped write
```

The difference is usually one to two orders of magnitude. That is why analytical loads and high-volume
integration stay in batch even where a continuous alternative exists.

### The window needs to be reprocessable

The requirement that separates a sustainable batch from a fragile one.

A run will fail halfway through. When it fails, the correct answer is to rerun it — and the rerun needs to
produce the same result, not double it.

```text
fragile        INSERT the day's records
reprocessable  DELETE the day's partition, then INSERT
```

The second form is [idempotent](/06-distributed-systems/idempotency.md) and turns "it failed halfway" from
an incident into another attempt.

Without it, each failure requires manual analysis of where it stopped — and that is where the silent
duplications described in [data warehouses](/07-data-architecture/data-warehouses.md) come from.

### Incremental requires a reliable marker

Reprocessing everything every time is simple and does not scale. An incremental load processes only what
changed, and depends on knowing what changed:

**A change timestamp.** Simple, and it fails when clocks diverge or when a long transaction commits after
the marker has already passed. See [clock and time](/06-distributed-systems/clock-and-time.md).

**A sequence number.** More reliable, and it requires the source to maintain it.

**The database's change log.** The most reliable, and the most invasive.

The first one's failure mode is subtle and common: a transaction started before the cutoff and committed
after it is never captured. A deliberate overlap of the window — reprocessing a few extra minutes — covers
that, and is only safe if the process is idempotent.

### The batch has to fit in the window

A run that takes 5 hours in a 6-hour window is a bomb with a date on it: the volume grows, and one day it
does not finish before business hours start.

The metric to monitor is not "did it finish?" — it is **how much of the window was consumed**. That
metric's trend gives months of advance warning.

### Partial failure needs a policy

A batch of 100,000 records with 12 invalid ones: stop everything, or process 99,988 and report 12?

Both are defensible, and the choice belongs to the business:

**All or nothing** for financial data, where processing partially produces an inconsistent state.

**Continue and report** for loads where the records are independent.

What is not defensible is not deciding — and discovering the policy from the tool's default behavior,
during an incident.

And, having chosen the second, the rejected records need a destination: a file, a table, an alert. Rejects
with no destination vanish.

### Batch and continuous coexist

The choice is not global. A system can process payments continuously and reconcile in a daily batch.

Replacing batch with continuous where there is no latency requirement trades operational simplicity for
complexity with no benefit — and it is a modernization that appears frequently in architecture roadmaps
with no concrete justification.

## Mental Model

**Batch trades latency for efficiency and simplicity.** Where latency is not a requirement, that is a
favorable trade.

## When to Use

- The result only makes sense with the complete set — closings, reconciliations.
- High volume with tolerant latency.
- The source only makes data available periodically.
- Processing efficiency matters.
- A regulatory requirement with a defined periodicity.
- Analytical loads. See [OLAP](/07-data-architecture/olap.md).

## When Not to Use

**When latency is a requirement.** If the user expects the effect now.

**With no idempotent reprocessing.**

**When the window is already tight.** With no growth plan.

**With no partial failure policy.**

**For events that need to be reacted to individually.** See
[event-driven integration](/08-integration-architecture/event-driven-integration.md).

**When the volume per run does not fit in memory** and the process was not written to stream.

## Alternatives

- **[Messaging](/08-integration-architecture/messaging-integration.md)** — when each record needs
  individual and fast handling.
- **Micro-batch** — windows of minutes instead of hours; a middle ground that solves many "almost real
  time" cases.
- **Database change capture** — continuous without touching the source application.
- **[File integration](/08-integration-architecture/file-integration.md)** — the most common transport for
  batch between organizations.

## Trade-offs

| Batch | Continuous |
|---|---|
| Efficient per record | A fixed cost per record |
| Latency of hours | Seconds |
| Reprocessing is natural | It requires a mechanism |
| Failure concentrated in one window | Distributed |
| Simple operation | Components to maintain |
| A concentrated load peak | Distributed |

| Full | Incremental |
|---|---|
| Simple and self-correcting | Needs a reliable marker |
| Does not scale | Scales |
| No risk of missing a change | A risk of a badly closed window |

## Failure Modes

**Duplication from a rerun.** The batch was not idempotent.

**A blown window.** The volume grew and the run spilled into business hours.

**A lost change.** A transaction committed after the window's cutoff.

**Rejects with no destination.**

**Exhausted memory.** The process loads everything at once.

**A chain dependency.** One batch runs late and takes down the four that depend on it.

**A silent failure.** The batch did not run, and nobody monitors the absence of a run.

The last deserves emphasis: monitoring failure is common; monitoring **not having run** is rare, and it is
the mode that goes unnoticed the longest.

## Common Mistakes

**Not making it reprocessable.** A load will fail halfway, and the normal operation after that is to run it
again. If running it again duplicates records, the recovery becomes manual intervention in production.

**Not monitoring window consumption as a trend.** A load that today takes two hours of a six-hour window
reaches the limit through gradual growth. Without the trend, the warning is the first night it does not
finish.

**Not overlapping the incremental window.** Fetching exactly since the last run loses records written
during it, through clock differences or through a transaction that committed later. Overlapping a few
minutes and relying on idempotency solves it.

**Not defining a partial failure policy.** A hundred thousand records and three invalid ones: abort
everything, ignore the three, or set them aside for review? With no prior decision, each run resolves it a
different way.

**Loading everything into memory.** It works at the current volume and fails on the day the source grows —
with no advance warning and with nothing in the code having changed.

**Not alerting on a missing run.** Monitoring watches for errors; a scheduler that stopped firing produces
no error at all, and the absence is noticed by stale data days later.

## Real-World Example

A lending company ran daily bank reconciliation: comparing internal transactions with the bank's file,
identifying divergences, generating entries.

The process ran at 2 a.m. and originally took 40 minutes.

Over four years, the volume quadrupled and the run reached 5 hours 20 — in a window that ended at 8 a.m.

Four incidents:

**A blown window.** On a day of atypical volume, the run finished at 8:40 a.m. Customer service started
with incomplete reconciliation data, and credit decisions were made on the wrong balance. The trend had
been visible for two years, and nobody tracked the metric.

**A rerun duplicating.** A failure from the bank's unavailability led to a manual rerun. The process
inserted entries without deleting the day's, and around 18,000 entries were duplicated. The correction took
three days and involved accounting.

**A lost change.** The incremental load used the change marker. Long-running transactions — committed after
the cutoff — were left out permanently, because the next window started from the new cutoff. Around 300
transactions a month vanished from the reconciliation.

**A missing run.** A scheduling failure made the process simply not run on a Monday. There was no error,
because there was no run. The absence was only noticed on Wednesday.

The fixes:

**Reprocessing by partition** — delete the day and reload. The rerun stopped being a risky operation.

**A 30-minute overlap** on the incremental window, feasible because the process became idempotent. The lost
transactions went to zero.

**Streaming processing**, in chunks, instead of loading everything. The run fell from 5 hours 20 to 1 hour
10 — most of the time was memory pressure, not useful work.

**An absence alert.** If the batch does not start by 2:15 a.m., alert. And monitoring of the ratio between
duration and window, with an alert above 60%.

The recorded lesson: the proposal on the table was to migrate to continuous processing, estimated at eight
months. The four fixes took five weeks, solved every incident, and the reconciliation remains — correctly —
a daily process, because the bank's file arrives once a day.

## Related Concepts

- [File Integration](/08-integration-architecture/file-integration.md) — the typical transport.
- [Messaging Integration](/08-integration-architecture/messaging-integration.md) — the continuous
  alternative.
- [Idempotency](/06-distributed-systems/idempotency.md).
- [Data Partitioning](/07-data-architecture/data-partitioning.md).

## Practical Exercise

Take the most important batch in your system and answer: if it fails halfway, what is the procedure?

If the answer involves somebody analyzing where it stopped, it is not reprocessable — and that is the
highest-return fix available.

## Interview Questions

- What makes a batch reprocessable, and why does that matter?
- Why can a change timestamp lose records?
- Why is monitoring the absence of a run different from monitoring failure?

## Further Reading

- Kleppmann, Martin. *Designing Data-Intensive Applications*. O'Reilly, 2017 — chapter 10.
- Hohpe, Gregor; Woolf, Bobby. *Enterprise Integration Patterns*, 2003.
- Beyer, Betsy et al. *Site Reliability Engineering*. O'Reilly, 2016.

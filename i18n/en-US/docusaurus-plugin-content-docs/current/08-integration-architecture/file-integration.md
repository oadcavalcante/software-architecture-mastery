---
id: file-integration
title: File Integration
sidebar_position: 8
description: The oldest and most used transport between organizations — and what it requires to be reliable.
doc_type: concept
level: 5
difficulty: intermediate
status: complete
objective: >
  By the end, the reader designs file exchanges with the guarantees that are
  missing by default: atomicity, deduplication and absence detection.
prerequisites: [batch-integration]
related: [batch-integration, integration-contracts, data-lifecycle]
canonical_for: []
translated_from_version: 1
last_reviewed: 2026-08-31
---

# File Integration

## Overview

Exchanging files is the oldest form of integration between systems, and it remains the most common between
different organizations.

Banks, carriers, government, insurers, payroll — most corporate volume travels as a file dropped somewhere.

It is underestimated because it looks primitive. It is primitive, and it is the only integration that works
when the two ends share nothing beyond a transfer protocol and an agreed format.

## Problem

Two organizations that cannot — by regulation, by policy, by technological incompatibility — expose APIs to
each other still need to exchange data.

A file solves it with the least coupling possible: a format, a location, a periodicity. Neither end needs
to know anything about the other's technology.

The price is that **no guarantee comes with it**. There is no confirmed delivery, no transaction, no
validated schema, no duplicate detection. All of that has to be built on top of the exchange — and it is
what separates reliable file integration from a permanent source of incidents.

## Core Concepts

### Atomic writing: problem number one

The reader can start reading while the writer is still writing. The result is a half-processed file — and
the half looks complete.

The solution is universal and simple:

```text
1. write under a temporary name    data.csv.tmp
2. close the file
3. rename to the final name        data.csv
```

The rename is atomic on most file systems. The reader never sees a partial file.

The alternative, when the rename is not atomic: a **control file** written afterward, with the reader only
processing when it exists.

This is the category's most common defect and the easiest to avoid.

### The file name is part of the contract

```text
PAYMENTS_20260827_001.csv
└─ type    └─ date   └─ sequence
```

The name carries information the processing needs: what it is, from when, and in what order. With no
sequence, two files from the same day are ambiguous.

And the name is what allows **deduplication**: processing the same file twice is the second most common
defect, and a record of already-processed files solves it.

### Detecting absence matters as much as processing

A file that does not arrive generates no error. The process simply does not run, and nobody knows.

The contract needs to say **when** the file arrives, and there needs to be an alert if it does not. See
[batch integration](/08-integration-architecture/batch-integration.md).

Teams that only monitor processing failures discover the absence days later, from the complaint of whoever
expected the effect.

### Counts and check totals

A file truncated in transfer is still a valid file. The lines that arrived are well formed; the missing
ones simply are not there.

The defense is a footer or a control file with the record count and the sum of the values. The reader
checks before processing.

That detects truncation, corruption and the line lost in an intermediate filter — none of which show up any
other way.

### Format: delimited text is treacherous

CSV looks trivial and is not. A delimiter inside the field, a line break inside the field, quoting,
character encoding, date format, decimal separator.

Each of those has already taken down real integrations. The contract needs to fix all of them explicitly —
including the encoding, which is the most frequent cause of "the accents came out wrong".

Formats with a declared schema avoid most of that, and the other end does not always accept them.

### Ordering and reprocessing

Files can arrive out of order — a retransmission of yesterday's arriving after today's. The processing
needs to use the date in the name, not the arrival date.

And reprocessing needs to be possible: keeping the original files, with a defined retention, is what allows
a processing defect to be fixed without asking for the file again.

### Sensitive data in transit and at rest

Files sit in directories, frequently for months, frequently with personal data.

Encryption in transit is the minimum. Encryption at rest, access control on the directory and a defined
retention are what usually is missing. See [data lifecycle](/07-data-architecture/data-lifecycle.md).

## Mental Model

**A file is the transport with the least coupling and the least guarantee.** Everything other styles give
away for free, here you build.

## When to Use

- The organizations cannot expose APIs to each other.
- The partner only offers this channel — banks, government, carriers.
- High volume with a defined periodicity.
- A regulatory requirement for a file in a specific format.
- The integration needs to work with no common technological dependency.
- An initial migration load.

## When Not to Use

**When latency matters.** The cycle is hours.

**Internally, when there is an alternative.** See
[messaging](/08-integration-architecture/messaging-integration.md).

**With no atomic writing.** Partial files processed.

**With no deduplication by name.**

**With no absence detection.**

**With no check count.** Invisible truncation.

**For records that need individual and immediate handling.**

## Alternatives

- **[Messaging](/08-integration-architecture/messaging-integration.md)** — internally, or when the partner
  accepts it.
- **A paginated read API** — the partner fetches instead of receiving; it eliminates delivery and absence.
- **[Webhooks](/08-integration-architecture/webhooks.md)** — to notify individual changes.
- **Object storage with event notification** — a file as the transport, with an arrival notice. It combines
  the file's reach with immediate reaction.

The last option is the modern design for whoever controls both sides: the file remains the data, and its
arrival becomes an event.

## Trade-offs

| A file | An API |
|---|---|
| Minimal coupling | Shared technology |
| No native guarantee | A contract, errors, retries |
| High volume, cheap | A cost per record |
| Latency of hours | Seconds |
| Works between any pair | Requires compatibility |
| Data sitting at rest | In transit only |

## Failure Modes

**A partial file processed.** Non-atomic writing.

**A file processed twice.**

**A missing file with no alert.**

**Silent truncation.** With no check count.

**The wrong encoding.** Corrupted accents across the whole set.

**An arrival order different from the logical order.**

**A directory growing indefinitely.** With no retention.

**Personal data sitting with neither encryption nor access control.**

## Common Mistakes

**Not writing atomically.** The consumer finds the file half-written and processes truncated data. Writing
under a temporary name and renaming at the end eliminates the window.

**Not recording already-processed files.** A resend from the source or a reread after a failure reprocesses
the same content, and the effect duplicates.

**Not alerting on absence.** The file that did not arrive generates an error nowhere. The check needs to be
by expectation — it should have arrived by 6 a.m. and it did not.

**Not checking counts and totals.** A truncated transfer produces a syntactically valid file with fewer
records. Without checking the footer against what was processed, the loss is silent.

**Not fixing the encoding and the date format in the contract.** That is where file integration breaks in
practice: an accent becomes an invalid character, and 03/04 is read as March fourth on one side and April
third on the other.

**Not defining retention or deleting processed files.** The directory grows until the listing gets slow,
and the scan to find what is new comes to cost more than the processing.

## Real-World Example

A health plan operator received a daily beneficiary movement file from 40 corporate clients, by file
transfer.

Five categories of incident over three years:

**Partial files.** Twelve of the 40 companies wrote directly under the final name. The overnight processing
sometimes caught the file half-written. Beneficiaries were left unenrolled, and the discovery came from the
beneficiary trying to use the plan. Fixed by requiring temporary writing plus rename, or a control file —
whichever the company preferred.

**Duplicate reprocessing.** One company resent the file whenever it was unsure whether it had sent it. With
no record of what was processed, the movements were applied again. Around 200 duplications a month, handled
manually.

**Truncation.** A 12,000-line file arrived with 8,000, from a transfer failure. The 8,000 were valid. Four
thousand beneficiaries were not processed, and nobody knew for 11 days. A footer with a count and a check
sum came to exist, and the processing came to refuse files that do not match.

**Encoding.** One company changed its source system and started sending in another encoding. Every name
with an accent was written corrupted for three weeks. The contract did not fix the encoding; it came to,
with validation on input.

**Accumulated files.** The directory had three years of files with national ID numbers, names and health
data of beneficiaries — in plain text, with broad permissions, because nobody had defined retention. Found
in an audit. Encryption at rest, restricted access and 90-day retention came to exist, with encrypted
archiving for what regulation requires keeping.

In retrospect: none of those fixes is sophisticated. All of them are known file integration mechanics,
documented for decades. They did not exist because the integration was treated as "a simple thing, it is
just reading a CSV" — and so it never got designed.

## Related Concepts

- [Batch Integration](/08-integration-architecture/batch-integration.md) — the processing.
- [Integration Contracts](/08-integration-architecture/integration-contracts.md) — format and periodicity.
- [Data Lifecycle](/07-data-architecture/data-lifecycle.md) — retention.
- [Idempotency](/06-distributed-systems/idempotency.md).

## Practical Exercise

Take a file exchange in your system and check three things: the writing is atomic, a record of
already-processed files exists, and an alert exists if the file does not arrive.

If any is missing, it is an incident that has not happened yet.

## Interview Questions

- Why is writing directly under the final name a defect?
- What does a check count detect that nothing else detects?
- Why is detecting a missing file different from detecting a failure?

## Further Reading

- Hohpe, Gregor; Woolf, Bobby. *Enterprise Integration Patterns*. Addison-Wesley, 2003 — *File Transfer*.
- Kleppmann, Martin. *Designing Data-Intensive Applications*. O'Reilly, 2017 — chapter 10.
- RFC 4180 — the comma-separated values file format.

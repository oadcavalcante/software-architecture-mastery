---
id: file-storage
title: File Storage
sidebar_position: 16
description: Where files live — and why the database and the local disk are the two wrong answers.
doc_type: concept
level: 3
difficulty: beginner
status: complete
objective: >
  By the end, the reader chooses where to store files and designs upload and
  download without passing bytes through the application.
prerequisites: [state-management]
related: [cdn, stateless-vs-stateful, cloud-storage]
canonical_for: []
translated_from_version: 1
last_reviewed: 2026-08-31
---

# File Storage

## Overview

Systems need to store files: documents, images, attachments, exports.

Two answers come first and both charge dearly later: **storing in the database** and **storing on
the local disk**.

## Problem

Files have different properties from records: they are large, immutable in most cases, accessed by
identifier, and served directly to the client.

Treating them as a record — in the database — or as process state — on the local disk — ignores
that.

**In the database:** backups balloon, replication gets slow, the database cache is occupied by
bytes nobody queries, and every read goes through a database connection. A 200 GB database of
which 180 are PDFs is an operational problem that did not have to exist.

**On the local disk:** the file only exists on that instance. Scaling horizontally breaks it,
restarting in a container loses it, and the backup becomes the responsibility of whoever takes
care of the machine. See
[stateless vs. stateful](/05-system-design/stateless-vs-stateful.md).

The usual answer is **object storage**: a service that stores blobs by key, with durability, and
serves them directly over HTTP.

## Core Concepts

### Metadata in the database, bytes in the storage

The split that solves nearly everything:

```text
database:   files(id, name, type, size, owner, created_at, key)
storage:    key → bytes
```

The database keeps what has to be queried, filtered and related. The storage keeps what has to be
served.

That keeps the database small and allows serving files without going through the application.

### The bytes should not pass through the application

The most common architectural error in this area: the client sends the file to the application,
which forwards it to the storage. And on reads, the application fetches and forwards.

That consumes the application's memory, bandwidth and connections to transport bytes it does not
use. A 500 MB upload occupies a whole process during the transfer.

The alternative is a **signed URL**: the application generates a temporary URL with a specific
permission, and the client talks directly to the storage.

```text
1. client asks for upload permission
2. application validates, creates the metadata, returns a signed URL with a deadline
3. client uploads directly to the storage
4. the storage notifies, or the client confirms
5. application marks the metadata as available
```

The application decides and authorizes; it does not transport.

For downloads, the same: a signed URL with a short deadline, served by a
[CDN](/05-system-design/cdn.md) when the content is public.

### The lifecycle has to be decided

Files accumulate. Three decisions:

**Retention.** How long to keep them. Frequently there is a regulatory requirement, and frequently
nobody asked.

**Storage class.** Frequent access costs more per month; rare access costs less and charges on
retrieval. Moving automatically by age reduces cost significantly in large corpora.

**Orphans.** An upload started and not confirmed leaves bytes with no metadata. With no cleanup,
they accumulate and nobody knows they exist.

### Immutability simplifies

Treating files as immutable — a new version is a new key — eliminates a class of problems: the
cache can be eternal, there is no race between read and write, and the history exists for free.

It is the same reason a [CDN](/05-system-design/cdn.md) works better with versioned URLs.

## Mental Model

**The application decides who can and records what exists. The bytes travel outside.**

## When to Use

Object storage when:
- There are user files — attachments, images, documents.
- The volume grows.
- The files are served to the client.
- The application scales horizontally.

Local disk when:
- It is temporary, within one operation.
- It is a cache, and loss is acceptable.

The database when:
- The file is small and always read along with the record — a signature, an icon.
- Transactionality with the record is a real requirement.

## When Not to Use

**The database for large files.** Backups, replication and the cache pay for it.

**The local disk with multiple instances.** The file only exists on one.

**Passing bytes through the application.** A waste of resources.

**With no retention policy.** The corpus grows indefinitely, and the cost with it.

**A signed URL with a long deadline.** A 7-day URL is a public link for 7 days — whoever receives
it, accesses it.

## Alternatives

- **Object storage** — the default answer.
- **Network file system** — when access has to look like a local disk; more expensive and with
  more failure modes.
- **The database, for small blobs** — legitimate below a few kilobytes.
- **Do not store** — generate on demand, when the cost of generating is lower than that of
  keeping.

## Trade-offs

| Object storage | Database |
|---|---|
| Small, fast database | Grows with the files |
| Served directly to the client | Passes through the application |
| Low cost per GB | High |
| No transaction with the record | Transactional |
| Metadata and bytes can diverge | Always consistent |
| One more component | None |

The fifth line is the real cost: since they are two systems, one can have what the other does not
— metadata with no bytes, or bytes with no metadata. That needs periodic cleanup.

## Failure Modes

**Orphans.** Bytes with no metadata, accumulating.

**Metadata with no bytes.** The record exists, the download fails.

**Leaked signed URL.** A long deadline turns it into a public link.

**Unconfirmed upload.** The client uploads and never confirms; the file sits in limbo.

**No size limit.** A 10 GB upload nobody anticipated.

**Silent cost.** The corpus grows and the bill with it, with nobody monitoring.

## Common Mistakes

**Storing large files in the database.**

**Transporting bytes through the application.**

**Not defining retention.**

**A long deadline on a signed URL.**

**Not validating type and size before authorizing the upload.**

**Trusting the uploaded file name.** It is user input and can contain a relative path.

## Real-World Example

A document management system stored PDFs in the database, as a binary column.

After three years, the database had 340 GB — 310 of them in PDFs. The consequences:

The full backup took 6 hours and the restore, 9. The recovery time objective was 2 hours, and
nobody had tested it.

The read replica fell minutes behind during heavy upload periods.

And every download consumed a database connection for several seconds, because the application
read the blob and forwarded it.

The migration moved the bytes to object storage, keeping only the metadata in the database. The
database dropped to 28 GB; the backup, to 20 minutes.

Two decisions the team recorded as more important than the migration itself.

**Direct upload via signed URL.** The application validates type, size and permission, creates the
metadata in a "pending" state, and returns a 15-minute URL. The client uploads directly. An event
from the storage confirms it and the metadata becomes "available".

That completely removed file traffic from the application, and the processes' memory consumption
dropped by half.

**A weekly reconciliation routine.** It compares metadata and objects, and reports both
divergences: metadata with no object — which becomes an alert, because it is loss — and an object
with no metadata for more than 24 hours — which is an orphan from an abandoned upload and is
removed.

On its first run, it found 12 thousand orphans accumulated over three years, from uploads that
failed midway. Nobody knew they existed.

## Related Concepts

- [State Management](/05-system-design/state-management.md) — files as persistent state.
- [CDN](/05-system-design/cdn.md) — serving public files at the edge.
- [Stateless vs. Stateful](/05-system-design/stateless-vs-stateful.md) — why the local disk breaks.
- [Cloud](/09-cloud-architecture/index.md) — storage classes and cost.

## Practical Exercise

Check where your system stores files. If it is the database, measure how much of the total size
they occupy and how long the restore takes.

If it is object storage, check: is there reconciliation between metadata and objects? What is the
deadline on the signed URLs?

## Interview Questions

- Why are large files in the database a problem?
- What is a signed URL and what problem does it solve?
- How does an orphan file arise and how do you detect it?

## Further Reading

- Kleppmann, Martin. *Designing Data-Intensive Applications*. O'Reilly, 2017.
- Pre-signed URL documentation from the major object storage providers.

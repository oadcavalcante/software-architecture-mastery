---
id: cloud-storage
title: Cloud Storage
sidebar_position: 12
description: Objects, blocks and files — three models with different properties, and what each one charges.
doc_type: concept
level: 5
difficulty: intermediate
status: complete
objective: >
  By the end, the reader chooses the storage type by the access pattern and
  configures classes and retention consciously.
prerequisites: [cloud-architecture]
related: [cloud-compute, cost-architecture, data-lifecycle]
canonical_for: []
translated_from_version: 1
last_reviewed: 2026-08-31
---

# Cloud Storage

## Overview

Three models, with very different properties and prices:

**Objects.** Files identified by a key, accessed through an API. Practically unlimited scale, extremely
high durability, and it is not a file system.

**Blocks.** Virtual disks attached to a machine. They behave like a local disk, and they belong to a
[zone](/09-cloud-architecture/availability-zones.md).

**Files.** A shared file system, mountable by several machines. Convenient and more expensive.

Choosing wrong among them is the origin of high costs and of limitations that appear late.

## Problem

The reflex is to use what is familiar: a disk. An application that writes files to the file system keeps
doing that in the cloud, with an attached disk.

That works and it traps you: the disk belongs to a zone, it is not shareable, it has a fixed size to
manage, and it costs per gigabyte provisioned — not used.

For most "store files" cases, object storage is cheaper, more durable and more scalable. The migration
rarely happens because nobody revisits the choice.

## Core Concepts

### Objects are not a file system

The superficial resemblance is deceptive:

**There are no directories.** The slashes in the key are a convention; the structure is flat.

**There is no partial modification.** Replacing an object rewrites the whole object.

**Listing is expensive.** Listing millions of keys with a prefix is a costly operation, in time and in
billing.

**Consistency.** Today, read-after-write is strong at most providers; listing can take a while to reflect
changes.

Treating objects like a disk produces bad access patterns — the most common is listing to find something,
when the key should be derivable.

### Storage classes and the cost of retrieving

```text
frequent access     more expensive per gigabyte, no retrieval cost
infrequent access   cheaper, with a cost per retrieval
archival            very cheap, slow and billed retrieval
```

The saving is real and has a trap: moving data to a cold class and then accessing it frequently comes out
**more expensive** than having left it in the hot class.

The rule: base the transition on real access data, not on presumed age. And check whether the application
tolerates the destination class's retrieval latency — in deep archival, it can be hours.

### Lifecycle is configuration, not code

Rules that automatically move and delete objects by age are the cheapest way to control storage cost.

And they are also where the retention requirement needs to live. See
[data lifecycle](/07-data-architecture/data-lifecycle.md).

With no lifecycle rules, storage only grows — and it is the invoice item that grows most silently, because
it generates neither errors nor slowness.

### Versioning protects you from yourself

With versioning, overwriting or deleting creates a new version instead of destroying the previous one.

It is the protection against accidental deletion and against an attack that encrypts data. See
[disaster recovery](/09-cloud-architecture/disaster-recovery.md).

Two consequences to manage: old versions occupy space and are billed, and the lifecycle rule needs to
handle them explicitly — otherwise, deleting frees nothing.

### Durability is not availability

Object storage usually promises extremely high durability — the chance of losing an object is remote.

That says nothing about **availability**: the service can be temporarily unreachable, and several
wide-reaching incidents were exactly that.

And durability does not protect against deletion: if you order a delete, it deletes with extremely high
reliability.

### A block has provisioned performance

Virtual disks have limits on operations per second and on throughput, generally proportional to size or
provisioned separately.

A small disk can be a database's bottleneck, and the symptom is slowness with no high CPU — a diagnosis
that usually takes a while because nobody suspects the disk.

And the burst credit mechanism, present in some classes, produces the worst kind of problem: good
performance in the tests, bad under sustained load.

## Mental Model

**Objects for what is read and written whole; blocks for what needs a disk; files when it needs to be
shared.** The wrong choice shows up on the invoice or at the limit.

## When to Use

**Objects** — user files, media, backups, analytical data, artifacts, anything read whole.

**Blocks** — the operating system, a database, anything that requires a file system with performance.

**Files** — when several machines need the same file system and rewriting the application is not an option.

## When Not to Use

**Objects as a file system**, with listing to locate things.

**Blocks for user files.** Expensive, stuck in a zone, with a size to manage.

**Files out of convenience**, when objects solve it. It is the most expensive of the three.

**A cold class without checking the access pattern.**

**With no lifecycle rules.**

**Versioning with no rule for the old versions.**

## Alternatives

- **A content delivery network** in front of objects — it reduces egress cost and latency.
- **A database** for structured data — storage is not a substitute.
- **A cache** for what is read repeatedly.
- **Local ephemeral storage** for temporary processing data — faster and cheaper than a persistent disk.

## Trade-offs

| Objects | Blocks |
|---|---|
| Unlimited scale | A defined size |
| API access | A file system |
| Shareable | One machine |
| Billed by usage | By provisioned amount |
| Zone-independent | Stuck in one |
| No partial modification | Random writes |

| A hot class | Cold | Archival |
|---|---|---|
| More expensive | Medium | Very cheap |
| No retrieval cost | With one | High |
| Immediate access | Immediate | Minutes to hours |

## Failure Modes

**Uncontrolled growth.** With no lifecycle.

**Expensive retrieval.** Data in a cold class accessed frequently.

**Old versions billed.** Deleting did not free space.

**A disk as the bottleneck.** The operations-per-second limit reached.

**Burst credit exhausted.** Performance collapses under sustained load.

**An object publicly exposed.** A permissive access configuration — one of the most common leaks in the
cloud.

**Expensive listing.** A loop that lists millions of keys.

## Common Mistakes

**Using a disk for user files.**

**Not configuring a lifecycle.**

**Moving to a cold class by age, with no access data.**

**Not handling old versions.**

**Sizing the disk by size only**, ignoring the operations limit.

**Not checking public access permissions.**

## Real-World Example

An education platform kept videos, materials and student uploads on disks attached to the application's
machines.

Three consequences:

**Scale.** Each machine needed the same content, and the synchronization between them was a fragile process
of their own. Adding an instance took 40 minutes copying files.

**Cost.** The disks were provisioned with headroom — 60% idle space paid for in full. And the content was
replicated on each machine.

**Zone.** All the content was stuck in the instances' zone.

The migration to object storage solved all three, and brought new decisions:

**Lifecycle.** Materials from courses closed more than two years earlier went to an archival class. The
saving was large — and a month later, a teacher asked for an old course's material, and the retrieval took
5 hours. The rule was adjusted to archive only after four years, with a notice in the interface about the
latency.

**Versioning.** Enabled after an incident in which a script deleted student uploads. It saved the data. Six
months later, the storage cost had risen 40% — the old versions were never removed. The lifecycle rule came
to delete non-current versions after 90 days.

**Exposure.** A security review found a set of objects with public access, created during the migration to
test and never fixed. It contained student uploads.

**A content delivery network** in front of the videos. The egress cost fell substantially, and the
experience improved.

The detail the team highlights: the migration was treated as a technology swap — "from disks to objects" —
and the three decisions that came afterward (class, versioning, permissions) were not in the plan. Each one
generated an incident before becoming a configuration.

## Related Concepts

- [Cloud Compute](/09-cloud-architecture/cloud-compute.md).
- [Cost Architecture](/09-cloud-architecture/cost-architecture.md).
- [Data Lifecycle](/07-data-architecture/data-lifecycle.md).
- [Disaster Recovery](/09-cloud-architecture/disaster-recovery.md).

## Practical Exercise

Find out how much of your storage has not been accessed in more than a year, and which class it is in.

Then check whether there is a lifecycle rule and whether it handles old versions. Those two answers usually
explain a good part of the storage invoice.

## Interview Questions

- Why is object storage not a file system?
- What is the trap of cold classes?
- Why is durability not availability?

## Further Reading

- The major providers' storage class documentation.
- Kleppmann, Martin. *Designing Data-Intensive Applications*. O'Reilly, 2017.
- Storment, J.R.; Fuller, Mike. *Cloud FinOps*. 2nd ed. O'Reilly, 2023.

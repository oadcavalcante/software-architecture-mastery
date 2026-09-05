---
id: memento
title: Memento
sidebar_position: 17
description: Capturing and restoring state without breaking encapsulation — and the cost nobody budgets for.
doc_type: pattern
level: 2
difficulty: intermediate
status: complete
objective: >
  By the end, the reader applies Memento knowing the memory cost and the difference
  between a snapshot and a logical inverse.
prerequisites: [command]
related: [command, prototype, event-sourcing]
canonical_for: [memento]
translated_from_version: 2
last_reviewed: 2026-08-31
---

# Memento

## Overview

Memento captures an object's internal state and externalizes it, without breaking
encapsulation, so that the object can later be restored to that state.

The clause "without breaking encapsulation" is what distinguishes the pattern from
simply exposing the fields.

## Problem

An object has to be restored to an earlier state — undo, a checkpoint, a transaction, a
saved draft.

The naive solution is exposing the fields so someone can read them and later write them
back. That destroys
[encapsulation](/02-software-design/encapsulation.md): whoever restores comes to know
the internal structure, and changing it breaks the restoration mechanism.

Memento solves this with an asymmetry: the memento is **opaque to whoever stores it**
and **transparent to whoever created it**. The caretaker stores and returns it; only the
originator knows how to interpret it.

## Core Concepts

### The three roles

**Originator** — the object whose state is captured. It creates and interprets
mementos.

**Memento** — the captured state. Minimal public interface; content accessible only to
the originator.

**Caretaker** — stores the mementos and decides when to restore. It never examines the
content.

The separation between caretaker and originator is the point of the pattern. Without
it, it is just serialization.

### Memento versus logical inverse

The same decision that appears in [Command](/03-design-patterns/command.md).

**Memento** stores the state before. Simple to get right, expensive in memory, and it
works for any operation.

**Logical inverse** knows the opposite operation. Compact, and it has to be correct
including at the edges.

Memento is the safe choice when the state is small or when the inverse's correctness is
hard to guarantee.

### Complete or incremental state

Storing the whole object on each operation is simple and grows linearly with the number
of operations.

Storing only what changed is economical and more complex — it requires knowing how to
compose the deltas in the right order.

The common practice is hybrid: a complete state every N operations and deltas in
between, which is the same snapshot strategy used in
[event sourcing](/03-design-patterns/event-sourcing.md).

### The cost nobody budgets for

Memory. A 5 MB document with a hundred undo operations is 500 MB if each memento is
complete.

It is the cost that makes naive undo implementations get abandoned in production, and
it has to be estimated beforehand.

## When to Use

- Undo and redo.
- Checkpoints in long processes.
- Drafts and working versions.
- In-memory transaction rollback.
- Testing whether a speculative operation is worth it, with the option to revert.

## When Not to Use

**When the state is large and the operations are many.** The memory does not add up.

**When a logical inverse is reliable and cheap.** See
[Command](/03-design-patterns/command.md).

**When the state includes external resources.** A connection, an open file or an effect
already sent are not restorable by memento.

**When persistence already keeps versions.** A temporal table, an audit trail or
append-only storage already give you the history. Writing on every change does not, by
itself: an `UPDATE` leaves only the current state, and there is nothing to go back to.

**When the object is immutable.** There is nothing to capture — the previous version
still exists.

## Alternatives

- **Immutable objects** — each operation produces a new version; the previous one is
  the memento, with no mechanism. It is the alternative that removes the need for the
  pattern.
- **A logical inverse** — more economical when reliable.
- **[Event sourcing](/03-design-patterns/event-sourcing.md)** — storing the events
  instead of the state. Memento at system scale.
- **Versioning in persistence** — when the history is already recorded.

## Trade-offs

| Memento | Logical inverse |
|---|---|
| Works for any operation | Has to be implemented per operation |
| Restoration guaranteed correct | Correctness depends on each inverse |
| Memory: state × number of operations | Memory: small record × number of operations |
| No need to understand the operation | Needs to |
| Does not know the external effect exists | Can declare its compensation |

## Failure Modes

**Growing memory consumption.** The dominant mode.

**Memento with a shared reference.** A shallow copy: restoring does not undo, because
the inner object is the same one. See [Prototype](/03-design-patterns/prototype.md).

**External state not restored.** The object goes back to the earlier state and the
world does not.

**Stale memento.** The originator's structure changed between capture and restoration —
relevant when mementos are persisted.

**Caretaker that examines the content.** Encapsulation is lost, and the pattern becomes
serialization.

## Common Mistakes

**Not estimating the memory.**

**A shallow copy in the memento.**

**Persisting a memento without versioning.** Change the structure, break the
restoration.

**Letting the caretaker interpret.** It nullifies the pattern's reason for existing.

## Where it appears in practice

**Undo in editors.** The canonical use, almost always hybrid with a logical inverse.

**In-memory transactions.** Transactional data structures that capture the state before
and restore on abort.

**Work session serialization.** A saved draft is a persisted memento — and it is where
versioning the structure starts to matter.

**Checkpoints in long-running processing.** A batch job that saves state periodically so
it can resume.

The third case changes the pattern's nature: a memento that outlives the process needs
a stable format and migration, which brings it close to a persistence problem with all
its schema evolution questions.

## Real-World Example

An insurance proposal form had 40 fields and a seven-step wizard. The user could go back
steps and change answers, and each change recalculated the following steps.

Restoring the state on going back was necessary: if the user changed the age band in
step two and went back, the coverages selected in step four had to return to what they
were.

A memento per step solved it. Seven mementos per proposal, with the complete state. The
object was a few kilobytes; memory was never a problem.

What almost broke was something else: proposals were saved as drafts for up to thirty
days, and the mementos were persisted along with them.

When a field was added to the form, the old mementos did not have it. Restoring a
two-week-old draft produced an object with the new field null, and validation failed
with an incomprehensible message.

The fix was versioning the memento and writing a migration — which is schema evolution
work, and was not foreseen when the pattern was adopted as an in-memory mechanism.

The lesson: **a persisted memento stops being an implementation detail and becomes a
public format**, with all the obligations that implies.

## Related Concepts

- [Command](/03-design-patterns/command.md) — undo by logical inverse.
- [Prototype](/03-design-patterns/prototype.md) — the shallow copy risk.
- [Event Sourcing](/03-design-patterns/event-sourcing.md) — the idea at system scale.

## Practical Exercise

If your system has undo or drafts, estimate: how big is the captured state and how many
captures are alive simultaneously?

If any of those states is persisted, check: is there versioning? What happens when
restoring one captured before the last structural change?

## Interview Questions

- What does Memento preserve that exposing fields destroys?
- When is a logical inverse preferable?
- What changes when a memento is persisted?

## Further Exploration

- Gamma, Erich et al. *Design Patterns*. Addison-Wesley, 1994.

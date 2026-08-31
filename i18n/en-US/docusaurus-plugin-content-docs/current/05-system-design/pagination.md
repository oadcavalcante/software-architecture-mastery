---
id: pagination
title: Pagination
sidebar_position: 14
description: Delivering results in parts — and why offset breaks at scale.
doc_type: concept
level: 3
difficulty: beginner
status: complete
objective: >
  By the end, the reader chooses between offset and cursor pagination based on the
  volume and the stability of the set.
prerequisites: [apis]
related: [apis, search, database-scaling]
canonical_for: []
translated_from_version: 1
last_reviewed: 2026-08-31
---

# Pagination

## Overview

Pagination delivers a large set of results in parts.

The decision looks trivial and has two consequences that appear late: **performance on deep
pages** and **consistency when the set changes during the read**.

## Problem

Returning everything does not work: it consumes server memory, bandwidth, and the client
rarely needs everything.

The obvious solution is `LIMIT 20 OFFSET 40`. It works on the first pages and fails in two
ways.

**Performance degrades with depth.** `OFFSET 100000` makes the database walk through and
discard 100 thousand rows before returning 20. The cost grows linearly with the page, and the
last page is the most expensive.

**The set moves.** If a record is inserted between reading page 1 and page 2, everything
shifts. The user sees a repeated item, or never sees an item that existed — and that is
silent.

For a listing screen with few pages, none of that matters. For export, synchronization or
large sets, it matters a lot.

## Core Concepts

### Offset versus cursor

| | Offset (`OFFSET`) | Cursor (key) |
|---|---|---|
| Jump to page N | Direct | Impossible |
| Cost of page N | Grows with N | Constant |
| Set changing | Items repeated or skipped | Stable |
| Total pages | Computable | Usually not |
| Complexity | Trivial | Requires stable ordering |

**A cursor** works by keeping the position by key, not by count:

```text
page 1:  ... ORDER BY created_at, id LIMIT 20
         → last item: (2026-03-14 10:22, id=8891)

page 2:  ... WHERE (created_at, id) > ('2026-03-14 10:22', 8891)
         ORDER BY created_at, id LIMIT 20
```

The database uses the index to position directly. The cost is the same on page 2 and on page
5000.

### The ordering has to be stable and total

A cursor requires the ordering to be **deterministic**. Ordering only by `created_at` fails if
two records have the same instant — the position becomes ambiguous and items are skipped or
repeated.

The fix is always to include a unique tiebreaker: `ORDER BY created_at, id`. The `id`
guarantees a total order.

That applies to offset too, and it is a common cause of "an item appears twice" that nobody
can reproduce.

### The cursor is opaque

The cursor returned to the client should be treated as opaque — typically an encoding of the
key. That allows changing the internal strategy without breaking consumers, and prevents
anyone from constructing cursors by hand.

### A total count is expensive

`COUNT(*)` over the filtered set walks through everything. On a large table, it costs more
than the page itself.

Three ways out: do not return a total; return an estimate; or return only whether there is a
next page — fetching N+1 items and returning N.

The third solves most interfaces, because what they need is to enable or disable the "next"
button.

## Mental Model

**Offset answers "give me page 5". A cursor answers "give me what comes after this".** The
second is the question large systems actually ask.

## When to Use

**Offset** when:
- The set is small — a few hundred.
- The user needs to jump to a specific page.
- The set is stable during navigation.
- Simplicity matters more than scale.

**Cursor** when:
- The set is large.
- There is concurrent insertion.
- Consumption is sequential — export, synchronization, infinite scroll.
- Consistency between pages matters.

## When Not to Use

**Paginating when the set is small and fixed.** Returning 50 items at once is simpler for
everyone.

**A cursor when the user needs to navigate by page number.** It does not support arbitrary
jumps; forcing it produces a hack.

**Offset in high-volume export.** That is where the degradation is guaranteed.

**Returning a total when nobody uses it.** Cost with no benefit.

## Alternatives

- **Infinite scroll with a cursor** — the standard in modern interfaces.
- **Filtering instead of pagination** — if the user is paging to page 40 to find something,
  what is missing is search.
- **Asynchronous export** — for very large sets, generating a file in the background is better
  than paginating. See
  [background processing](/05-system-design/background-processing.md).
- **Streaming** — returning results continuously, when the protocol allows.

## Trade-offs

| Offset | Cursor |
|---|---|
| Jump to any page | Sequential only |
| Total pages available | Usually not |
| Degrades with depth | Constant cost |
| Unstable under concurrency | Stable |
| Trivial to implement | Requires total ordering |

## Failure Modes

**A deep page stalling the database.** An export walking to page 50000.

**Item repeated or skipped.** Non-deterministic ordering, or concurrent insertion with offset.

**Cursor broken by a change in ordering.** Old cursors stop making sense.

**The total count dominating the cost.** The page query is fast and the `COUNT` is not.

**No maximum limit.** A client asks for 100 thousand items per page.

## Common Mistakes

**Not including a unique tiebreaker in the ordering.** It is the most common cause of repeated
items.

**Using offset for export.**

**Returning a total with no need.**

**Not enforcing a maximum page size.**

**Exposing the cursor's structure.** It prevents changing the strategy later.

## Real-World Example

An orders API used `page` and `size`, with a total `COUNT` in every response.

Two clients caused different problems.

**An integrator** synchronized all orders daily, paginating to the end. With 2 million orders,
the last pages took 40 seconds each, and the whole synchronization occupied the database for
hours. The high `OFFSET` was the dominant cost.

**The listing screen** occasionally showed repeated orders. Nobody could reproduce it. The
cause: the ordering was only by `order_date`, and orders created in the same second had an
undefined order between queries.

The fixes, separated by use case.

The screen kept offset — there are few pages and the user wants to jump. It got an `id`
tiebreaker in the ordering, which eliminated the repetition. And the `COUNT` became an
estimate, with the exact number only when the filter narrows the set a lot.

Synchronization got its own endpoint, with a cursor. The daily synchronization went from hours
to 4 minutes, with a constant cost per page.

The reading the team takes from it: the two use cases looked like the same thing — "list
orders" — and had incompatible requirements. Trying to serve both with one endpoint was the
original error.

## Cursor implementation details

A cursor looks simple and has three details that decide whether it works.

**The ordering has to match the index.** `ORDER BY created_at, id` is only efficient if a
composite index exists in that exact order. Without it, the database sorts the whole set on
every page — which is the problem the cursor was supposed to avoid.

**The comparison has to be on a tuple.** Comparing field by field with `OR` produces a correct
result and a bad execution plan:

```text
❌ WHERE created_at > :d OR (created_at = :d AND id > :i)
✅ WHERE (created_at, id) > (:d, :i)
```

The second form lets the database use the composite index directly. Not all databases support
tuple comparison, and where they do not the first form is unavoidable — it is worth checking
the plan.

**The cursor has to be versioned.** If the ordering changes, cursors issued earlier stop making
sense. Encoding a version alongside allows detecting and rejecting them with a clear error,
instead of silently returning a wrong result.

A fourth detail, for descending order: the comparison inverts to `<`, and forgetting that
produces pagination that always returns the same page — a defect that passes tests with few
records.

## Related Concepts

- [APIs](/05-system-design/apis.md) — pagination is part of the contract.
- [Search](/05-system-design/search.md) — when paginating is not the answer.
- [Background Processing](/05-system-design/background-processing.md) — for large exports.
- [Scalability](/11-scalability/index.md).

## Practical Exercise

Find a paginated listing in your system and check the ordering: is it deterministic? Is there a
unique tiebreaker?

Then measure the time of the first and the last page. If the difference is large, you have
offset where you should have a cursor.

## Interview Questions

- Why does `OFFSET` degrade with depth?
- What problem does a cursor solve besides performance?
- Why does the ordering need a unique tiebreaker?

## Further Reading

- Kleppmann, Martin. *Designing Data-Intensive Applications*. O'Reilly, 2017.
- Cursor pagination documentation from mature public APIs — Stripe's and GitHub's are useful
  references.

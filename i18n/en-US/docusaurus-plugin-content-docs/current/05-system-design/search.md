---
id: search
title: Search
sidebar_position: 15
description: Finding what the user wants — and why LIKE stops working early.
doc_type: concept
level: 3
difficulty: intermediate
status: complete
objective: >
  By the end, the reader decides between search in the database and a dedicated index based on
  the real requirement, and recognizes the cost of synchronizing an index.
prerequisites: [pagination]
related: [caching, pagination, cqrs]
canonical_for: []
translated_from_version: 1
last_reviewed: 2026-08-31
---

# Search

## Overview

Search is finding records from a criterion the user provides — and it is rarely an exact query.

The difference between filtering and searching is what decides the architecture: **filtering is
comparing values; searching is ordering by relevance**.

## Problem

The first implementation is always `WHERE name LIKE '%term%'`. It works with few records and
fails in four predictable ways.

**It does not use an index.** The leading wildcard prevents using a B-tree index. The query scans
the whole table, and the cost grows linearly.

**It does not tolerate variation.** "São Paulo" does not find "sao paulo"; "t-shirt" does not find
"t-shirts"; a typo finds nothing.

**It does not order by relevance.** A record whose title is exactly the term comes mixed in with
another that mentions it in the middle of a description.

**It does not combine fields.** Searching in the title, the description and the tags at the same
time, with different weights, does not fit in `LIKE`.

The four together are what separates "filter" from "search". Many systems only need the first,
and recognizing that avoids adopting infrastructure with no need.

## Core Concepts

### The options, in order of cost

| Option | Solves | Cost |
|---|---|---|
| `LIKE` with a trailing wildcard | Prefix, few records | None; uses an index |
| The database's full-text search | Tokenization, stemming, relevance | Low; it already exists |
| Dedicated inverted index | Everything, at scale | High: a component, synchronization |
| Vector search | Semantics, similarity | High, plus the cost of embeddings |

The second line is the most underestimated. PostgreSQL, MySQL and others have full-text search
with tokenization, stemming, relevance ordering and multi-field search. For most systems, it is
enough — and it adds no component, no synchronization and no eventual consistency.

Jumping straight to a dedicated index is the most common error in this area.

### The inverted index

The mechanism behind any serious search: instead of mapping document → words, it maps **word →
documents**.

```text
"architecture" → [12, 45, 891, 1203]
"software"     → [12, 45, 77]
```

Searching "software architecture" becomes an intersection of lists — a fast operation regardless
of the corpus size.

What the index does before indexing decides the quality: splitting into tokens, normalizing
accents and case, reducing to the stem — "running", "ran" and "run" become the same term — and
discarding words with no discriminating value.

Without those steps, the search is literal and frustrates.

### Relevance is what differentiates

Finding is easy; **ordering** is the problem. The usual factors: the term's frequency in the
document, the term's rarity in the corpus, the document's size, the field's weight, and business
signals — popularity, recency, margin.

The last ones are what matter most in a real system and what no index brings ready. Tuning
relevance is continuous work, guided by usage data.

### The real cost is synchronization

Adopting a dedicated index means maintaining **two copies of the data**. And that brings
everything a projection brings: eventual consistency, reprocessing, and the possibility of
divergence.

It is [CQRS](/03-design-patterns/cqrs.md) at level 3, under another name. The same questions
apply: how much delay is acceptable, and how do you rebuild the index from scratch when it gets
corrupted.

The ability to fully reindex is not optional — it is what allows correcting any divergence.

## Mental Model

**If the user types and expects relevance, it is search. If they select and expect a match, it is
a filter.** A filter is solved in the database.

## When to Use

**The database's full-text search** when:
- The corpus is thousands to a few million records.
- The requirements are tokenization, stemming and basic relevance.
- Avoiding one more component has value.

**A dedicated index** when:
- The corpus is large and search latency is a requirement.
- There is a need for typo tolerance, suggestions, faceted aggregation.
- Relevance needs fine tuning with business signals.
- The search load is high enough to compete with the transactional load.

## When Not to Use

**A dedicated index when the database solves it.** It is the dominant error: one more component,
synchronization, eventual consistency and reindexing, for a corpus of 50 thousand records the
database's full-text search serves in milliseconds.

**Search when the case is a filter.** If the user picks a category and a price range, that is a
`WHERE` with an index, not search.

**With no reindexing strategy.** An index that cannot be rebuilt stalls at the first
synchronization error.

**Without measuring relevance.** A well-configured index with bad relevance delivers results
nobody clicks — and nobody notices without measurement.

## Alternatives

- **Filter with an index** — when the criterion is exact.
- **The database's native full-text search** — the middle ground that solves most cases.
- **Managed search service** — when the index is justified and operating a cluster is not.
- **Precomputed suggestions** — for autocomplete, a simple prefix structure is usually enough.

## Trade-offs

| Dedicated index | Search in the database |
|---|---|
| Tunable relevance, facets, typo tolerance | Basic features |
| Search load isolated from transactional | Shared |
| Independent scaling | Alongside the database |
| Two copies and synchronization | One source |
| Eventual consistency | Immediate |
| One more component to operate | None |

## Failure Modes

**Index divergent from the source.** One update event lost, and the result shows data that no
longer exists.

**Reindexing impossible.** With no path to rebuild, the divergence is permanent.

**Bad relevance.** It finds everything and orders it badly; the user does not find what they are
looking for and the business metric drops with no apparent cause.

**Index as the source of truth.** Someone starts reading data from the index instead of the
database — and eventual consistency becomes business inconsistency.

**Facet explosion.** Aggregations over high-cardinality fields consume the cluster's memory.

## Common Mistakes

**Adopting a dedicated index without trying the database first.**

**Not planning reindexing.**

**Not measuring relevance.** The useful metric is how many searches end with no click.

**Confusing search with filtering.**

**Synchronizing in real time when the business accepts minutes.** Synchronous synchronization
couples the write to the index — if it is down, the write fails.

## Real-World Example

An auto parts marketplace had search with `LIKE` over 400 thousand products. Each search took 3
seconds and scanned the table.

The initial proposal was to adopt a dedicated search cluster.

The analysis changed the path. The real requirements, gathered with the product team: find by name
and by part code, tolerate plurals and accents, and order putting in-stock parts first.

None of that required a cluster. The database's native full-text search, with an adequate index
and a relevance function that added the stock weight, met it entirely. Latency dropped to 40 ms.

Eighteen months later, the requirement changed: search by compatibility — "parts that fit model X,
year Y" — with facets by brand, category and price range, and suggestions for typos in part codes.

Then the dedicated index was justified, and it was adopted with two decisions the team recorded.

Synchronization is by event, asynchronous, with an accepted delay of up to 30 seconds —
negotiated with the business, because real-time stock in the index would have coupled the write to
it.

And there is a full reindexing command, tested monthly. It has already been used twice: once after
a defect in the event consumer, and once when changing the index's schema.

The sequence matters: the database solved it for eighteen months, and the index came in when the
requirement demanded it — not when someone decided search deserved its own infrastructure.

## Related Concepts

- [Pagination](/05-system-design/pagination.md) — search results are paginated by cursor.
- [Caching](/05-system-design/caching.md) — frequent searches benefit.
- [CQRS](/03-design-patterns/cqrs.md) — the index is a read projection.
- [Data Architecture](/07-data-architecture/index.md).

## Practical Exercise

Measure your system's search: what is the latency at the 95th percentile? How many searches end
with no click at all?

The second metric is the one that says whether relevance is working, and almost nobody has it.

## Interview Questions

- What is the difference between a filter and a search?
- Why does `LIKE '%term%'` not use an index?
- What is the real cost of adopting a dedicated search index?

## Further Reading

- Manning, Christopher; Raghavan, Prabhakar; Schütze, Hinrich. *Introduction to Information
  Retrieval*. Cambridge, 2008.
- PostgreSQL's full-text search documentation — the most underestimated middle path.

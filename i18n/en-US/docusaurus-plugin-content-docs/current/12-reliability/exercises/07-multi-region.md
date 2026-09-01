---
id: 07-multi-region
title: "Exercise 07 — Multi-Region Availability"
sidebar_position: 1
description: The strong consistency chosen in exercise 03 now costs latency on every write — and the bill is daily.
doc_type: exercise
level: 5
difficulty: advanced
status: complete
objective: >
  By the end, the reader decides the replication model per operation and recognizes the daily cost of
  coordination between regions.
prerequisites: [06-partial-failure]
related: [disaster-recovery-planning, graceful-degradation, availability, pacelc]
canonical_for: []
translated_from_version: 2
last_reviewed: 2026-08-31
---

# Exercise 07 — Multi-Region Availability

:::info A continuation, and the last of the arc

This is the last exercise about the system you designed in
[exercise 03](/05-system-design/exercises/03-ecommerce-backend.md). The decision it tests is the
oldest of the three you recorded there.

:::

## Context

**Ponta** is going to operate in Mexico and Colombia. The Brazilian operation stays as it is.

```text
Brazil       ~48,000 orders/day, sa-east region
Mexico       a forecast of ~9,000/day in the first year
Colombia     a forecast of ~4,000/day
```

Two things motivate the region discussion:

**Latency.** The browsing p95 measured from Mexico City, against the Brazilian region, is 340 ms.
Product tests indicate a perceptible drop in conversion above 250 ms.

**Continuity.** The Brazilian operation had, in the last year, a 3h40 incident caused by a regional
failure. The contractual requirement with the largest partners now demands a regional continuity plan.

## Requirements

```text
browsing and search   p95 under 250 ms in the customer's region
checkout              availability of 99.95%
inventory             one distribution center per country;
                      there is no cross-country selling
orders                history queryable by the customer,
                      from any region
continuity            one region going down cannot take
                      the others down
regulatory            Mexican customer data has an in-country
                      residency requirement
```

## Constraints

```text
team              31 engineers, 4 with operational experience
                  in distributed systems
budget            the infrastructure cost per order cannot
                  more than double
deadline          12 months until the Mexican operation
no window         the Brazilian operation cannot stop
current model     a single relational database, local transaction,
                  strong consistency — the exercise 03 decision
```

## Your Task

Produce, in up to 90 minutes:

1. **What is replicated between regions**, and what is not.
2. For each operation, the **consistency model** and the reason.
3. What happens when **one region goes down**, per operation.
4. How much the **exercise 03** decision is costing today, and whether you would change it.
5. What you are **not** going to do, with the trigger.

## Questions You Should Be Asking

```text
the Mexican customer buys from Mexican inventory — do the two countries
  compete for any shared resource?
is the catalog the same in all three countries?
does an order have to be visible outside the region where it was placed?
with what delay?
is the customer record single or per country?
what exactly does the data residency requirement prevent
  replicating?
which operation actually needs coordination between regions?
```

The first and the last decide the exercise. If the countries don't share inventory, most of the system
doesn't need to coordinate anything.

## Assessment Criteria

Your answer is good if:

- **You realized almost nothing needs coordinating.** Inventory is per country, orders are per country,
  customers are per country by regulatory requirement. Each region operates almost independently — which
  is the cheapest answer and the most available.
- **The catalog is replicated and orders are not.** The catalog is read-heavy and tolerates delay;
  orders are local writes with rare cross-region queries.
- **The exercise 03 decision doesn't need to change.** The strong consistency is local to each region,
  where it is cheap. It would only cost if you replicated orders between regions.
- **You treated data residency as an architectural constraint**, not as a legal detail.
- **One region going down is described per operation**, not as "we have redundancy".

Your answer is weak if it proposes a global database with writes in any region, without any requirement
asking for that.

## Discussion

:::details Open after trying

**The right answer is almost no coordination**, and getting there requires resisting the wrong question.

The wrong question is "how do we replicate the database between regions?". The right one is "what
actually has to be seen from the other region?".

```text
inventory   per country, no cross-selling   → nothing to coordinate
orders      created and served in the customer's region
            cross-region queries are rare   → asynchronous replication,
                                              a delay of minutes acceptable
customers   residency required in Mexico    → not replicated; records
                                              per region, with a
                                              global identifier
catalog     same product, price per country → replicated, read-heavy,
                                              a delay of minutes acceptable
promotions  per country                     → local
```

No write operation crosses a region. That means the strong consistency from exercise 03 is still
**local**, and the cost of coordination between regions is zero.

If you had designed in exercise 03 a model with global inventory and cross-country selling, the answer
here would be different and far more expensive — every reservation would require intercontinental
coordination, at ~120 ms per confirmation. The decision from two years ago is paying a dividend, not a
cost.

**That is the point of the whole arc.** The exercise 03 decision caused pain in 04, required product
work in 05, created an ambiguous state in 06 — and here it is free. Architectural decisions are not
good or bad; they are adequate to a set of constraints, and the constraints change in different
directions.

**One region going down**, per operation:

```text
browsing        served from the edge cache; degrades to a catalog
                that may be out of date
checkout        unavailable in that country; the others carry on
order queries   the asynchronous replica in the other regions serves
                the history, with a delay
internal ops    dispatch and invoicing in that country stop
```

Nobody tries to serve Mexican customers from Brazil during the outage — the inventory is physically in
Mexico, and selling from there would mean selling what cannot be shipped.

**What not to do, with the trigger:**

```text
a global database with multi-region writes
  → only if cross-country selling appears
synchronous order replication
  → only if cross-region queries become a critical path
an active-active region in Brazil
  → when regional unavailability costs more than
    double the infrastructure cost
```

**What almost everybody gets wrong:** treating multi-region as a database problem. It is a
business-boundary problem — and in this brief the business has already answered, by saying there is no
cross-country selling. The architecture only had to avoid contradicting that.

:::

## Related Concepts

- [Exercise 06](/06-distributed-systems/exercises/06-partial-failure.md).
- [Disaster Recovery](/12-reliability/disaster-recovery-planning.md).
- [Graceful Degradation](/12-reliability/graceful-degradation.md).
- [PACELC](/06-distributed-systems/pacelc.md).

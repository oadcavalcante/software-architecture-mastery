---
id: banking
title: "Case: Digital Banking Core"
sidebar_position: 2
description: A digital bank with 6.4 million accounts deciding between buying a banking core and building its own ledger.
doc_type: case-study
level: 0
difficulty: advanced
status: complete
objective: >
  By the end, the reader designs an accounting ledger with strong consistency, auditability
  and recovery, and knows why the scale here is less demanding than it looks.
prerequisites: [trade-offs]
related: [payments, healthcare, high-volume-events]
canonical_for: []
translated_from_version: 5
last_reviewed: 2026-08-31
---

# Case: Digital Banking Core

:::note How to use this case

Read the context, requirements and constraints. **Stop before the architecture options** and
sketch your own in twenty minutes.

This case's numbers are **illustrative**: plausible and internally
consistent, not measured in a named system. What is learned is the reasoning they
support, not the magnitudes.

:::

## Business Context

**Banco Aurio** is a digital bank with 6.4 million accounts opened, of which 3.1 million are
monthly active. It operates a payment account, a prepaid card and personal credit.

The banking core — the system that holds balances, posts transactions and closes the day — is
an off-the-shelf solution contracted in 2019, charged per active account.

Three pressures motivate the review:

**Cost per account.** The contract charges $0.28 per active account per month. With 3.1
million active accounts, that is $10.6 million a year — the company's second-largest cost
line, behind only payroll. And it grows linearly with success.

**Product limits.** The core supports neither multi-currency accounts, nor investment
products, nor joint accounts. All three are in the business plan for the next 24 months, and
the vendor has no date for any of them.

**Closing window.** The daily close takes 3h40 and runs between 11pm and 3am. During it,
transactions are accepted but not settled, and the displayed balance diverges. With instant
payments operating 24×7, that window has become a source of complaints and operational risk.

There is no availability or scale problem: the core handles the current volume with room to
spare.

## Functional Requirements

```text
FR-1   Maintain an account balance with double-entry, auditable and immutable
FR-2   Post a transaction with idempotency guaranteed by a client key
FR-3   Hold and release amounts (deposits, card pre-authorizations)
FR-4   Query balance and statement with pagination, up to 5 years
FR-5   Settle instant payments in real time, 24×7, with no downtime window
FR-6   Process card network settlement files (daily batch)
FR-7   Calculate and post interest, fees and yield
FR-8   Support accounts in more than one currency
FR-9   Support joint accounts with multiple holders
FR-10  Generate regulatory files for the central bank within the required deadlines
FR-11  Reverse an entry by chargeback, without deleting the original
```

FR-1, FR-2 and FR-11 are the foundation: a correct accounting ledger. FR-5 is what eliminates
the closing window. FR-8 and FR-9 are what the vendor doesn't deliver.

It is worth making explicit why FR-1 is stated as double-entry and not as "maintain a
balance". A system that stores the balance as a number and alters it on every operation has
no way to answer the question audit, the regulator and the customer all ask: **where did that
difference come from?** Double-entry is not an accounting preference — it is the data
structure that makes the balance a verifiable consequence of the history, rather than an
assertion.

And FR-11 is why the ledger is immutable. A reversal is a new entry. A financial system that
allows an entry to be altered loses the property that sustains all the others.

## Non-Functional Requirements

```text
availability of posting                 99.99% (≈ 53 min/year)
availability of balance queries         99.95%
p99 of posting                          < 300 ms
p99 of a balance query                  < 150 ms
balance consistency                     strong, no exceptions
downtime window for closing             0 — it cannot exist
RPO (acceptable data loss)              0
RTO (recovery time)                     < 15 min
entry retention                         10 years, immutable
traceability                            every entry linked to its origin,
                                        author and timestamp, no exceptions
```

RPO zero is the requirement that constrains the design most: no transaction confirmed to the
customer may be lost within the region. In a declared regional disaster the design accepts ~30 s
of loss, and that exception is decided, not overlooked. It eliminates any asynchronous replication on
the confirmation path.

## Constraints

```text
regulatory      central bank authorization as a payment institution;
                requirements for segregation, audit and continuity
contract        the current core requires 12 months' notice to terminate
team            58 engineers; 6 with experience in financial systems
migration       6.4 million accounts with balances and 5 years of history
                have to migrate without a single cent of divergence
parallel run    the regulator requires proof of equivalence before the switch:
                both systems have to produce the same result
                over a minimum period
schedule        the closing window is a recurring complaint; leadership
                wants a solution in 18 months
```

The requirement to run in parallel with proof of equivalence is the constraint that shapes the
whole migration plan — it makes any big-bang switchover impossible.

## Capacity Estimates

```text
active accounts                        3.1 million
entries/day                            14.2 million
entries/s, average                     ~164
hourly peak (6-8pm and the 5th
  and 20th of the month)               ~1.4 million/h  →  ~390/s
observed instantaneous peak            ~840/s
design margin (3×)                     ~2,500/s
balance queries/day                    ~48 million
query peak                             ~2,100/s
with margin                            ~6,000/s
```

**This is the number that changes the analysis.** 2,500 postings per second, with double-entry
transactions, is served by a single well-sized relational database — with a large margin.
There is no need to partition writes, and partitioning an accounting ledger has a very high
complexity cost.

```text
storage
  entries, 10 years                    ~52 billion rows  →  ~14 TB
  balances (current state)             ~6.4 million rows  →  ~2 GB
  queryable history (5 years)          ~26 billion rows
```

The storage volume is large; the concurrent write volume is not. That asymmetry guides the
design: **a small, hot transactional core, with cold history kept separate**.

The balances table has 6.4 million rows and fits entirely in memory. The entries table has 52
billion and is never read in full — each statement query touches a time window of one account.
They are two opposite access profiles coexisting in the same domain, and treating them as one
would produce a database that is slow at both ends.

There is one more figure the capacity analysis revealed that was not in the initial
conversation: the posting peak does not coincide with the query peak. Queries concentrate in
the morning, postings at the end of the day and on the 5th and 20th. That means read and write
capacity can be sized separately, and that read replicas solve most of the peak problem.

## Architecture Options

### Option A — Switch vendors

Replace the current core with another off-the-shelf one supporting multi-currency, joint
accounts and continuous settlement.

```text
effort                     14 to 20 months of migration
cost                       quotes between $0.19 and $0.26 per active account
product limits             solved today, and the problem repeats
                           with the next unforeseen product
technical risk             medium — a full migration, with a parallel run
control over evolution     none
```

### Option B — Own ledger, monolithic and centralized

Build the ledger with a single relational database, centralized writes, partitioning only the
history.

```text
effort                     18 to 24 months to parallel run, +6 of parallel run
operating cost             ~$840 thousand/year (infrastructure + team)
scale ceiling              estimated at ~8,000 postings/s in the current
                           design — 3× the design margin
complexity                 low for the domain; local transactions
risk                       high in migration, low in operation
```

### Option C — Own ledger, partitioned by account

The same, with accounts distributed across independent partitions from the start.

```text
effort                     26 to 34 months
scale ceiling              practically unlimited
complexity                 high — a transfer between partitions becomes
                           a distributed transaction
closing and regulatory     cross-partition aggregation in every report
risk                       high in migration and in operation
```

Option C solves a scale problem the estimates show does not exist, and pays for it with a
distributed transaction on every transfer between accounts — which is a bank's most common
operation.

## Trade-off Analysis

| Criterion | Weight | A — Switch | B — Own, central | C — Own, partitioned |
|---|:-:|:-:|:-:|:-:|
| Total cost over 5 years | 25% | 3 | 9 | 7 |
| Product freedom | 25% | 4 | 9 | 9 |
| Migration risk | 20% | 6 | 6 | 3 |
| Time to fix the closing window | 15% | 6 | 7 | 3 |
| Team capability | 10% | 8 | 6 | 3 |
| Operational complexity | 5% | 9 | 7 | 3 |
| **Weighted total** | | **5.1** | **7.7** | **5.5** |

**Sensitivity analysis**, redistributing the remaining weight proportionally across the other criteria. With migration risk at 40%, the totals become
5.3 / 7.3 / 4.9 — Option B still wins. With cost at 45%, they become 4.5 / 8.0 / 5.9. The
conclusion is stable.

The criterion that most separates A from B is product freedom, and it was deliberately
quantified: multi-currency, joint accounts and investments have a commercial estimate of $36
million in incremental revenue over 4 years. No vendor quote covered all three.

## Decision

**Own ledger, centralized (Option B)**, with history partitioned by period and an explicit
evolution path to partitioning by account, should volume require it.

**Under what condition each discarded option would win:**

**Option A would win if** product freedom were not necessary — if the roadmap consisted of
products the market already covers. It would also win if the team had fewer than 20 engineers:
building a correct accounting ledger requires a critical mass small teams don't have.

**Option C would win if** the projected volume exceeded ~6,000 sustained postings/s, or if
there were a regulatory requirement for physical segregation by customer segment. The
condition is recorded and monitored: the decision to partition is reassessed when the
sustained peak exceeds 3,000/s.

The decision came with an explicit design commitment: **the centralized ledger is built so as
not to prevent future partitioning**. That means the account identifier carries, from day one,
the field that would serve as a partition key; that no internal query scans the whole table
without an account filter; and that transfers between accounts are already modeled as a
transaction with two identified legs, which is the shape a distributed saga would require.

The cost of those three constraints is close to zero today, and they reduce Option C from a
rewrite to a migration. It is the difference between keeping an option open and buying
flexibility that may never be used. See
[simplicity vs. flexibility](/20-trade-offs/simplicity-vs-flexibility.md).

## Components

```text
Ledger
  double-entry, immutable, the source of truth for every balance
  the system's only transactional write

Accounts Service
  account lifecycle, holders, limits, status

Posting Service
  receives posting requests, validates, applies idempotency,
  writes to the ledger

Balance Service
  a balance projection for reads; derived from the ledger

Holds Service
  deposits and pre-authorizations, with expiry

Product Engine
  interest, fees, yield — generates entries, doesn't alter balances

Instant Payment Connector
  integration with the central settlement system, real-time settlement

Card Network Connector
  batch processing of settlement files

Statement Service
  paginated queries over the history

Regulatory Generator
  central bank files, from the ledger

Reconciler
  compares the ledger, projections and external sources, daily
```

The **Ledger** is deliberately small and free of business rules. It accepts balanced entries
and writes them; all product logic lives outside it and produces entries. That separation is
what makes it possible to add new products without touching the core — which is the problem
the vendor didn't solve.

The temptation to put rules in the ledger is strong and returns with every new product: it
would be simpler, for the credit team, if the ledger knew how to reject an entry that exceeds
a limit. The rule adopted is that the ledger knows exactly three things — accounts exist,
entries sum to zero, and an idempotency key doesn't repeat. Any validation beyond that is
product and stays outside.

That discipline was tested four times in the first year, and conceded zero times. The argument
that sustained the refusal every time: each rule inside the ledger becomes a reason not to be
able to change the ledger, and the whole point of the project was being able to change.

## Data

**Ledger model.**

```text
account        (id, type, currency, holder, status)
entry          (id, transaction_id, account_id, amount, sign, currency,
                accounting_date, posting_date, origin, author)
transaction    (id, idempotency_key, type, status, created_at)
balance        (account_id, currency, balance, version, updated_at)
hold           (id, account_id, amount, expires_at, status)
```

Three non-negotiable properties:

**Immutability.** No `entry` row is ever altered or removed. A reversal is a new entry, of
opposite sign, referencing the original (FR-11). That is what makes auditing possible and it
is a regulatory requirement.

**Balancing.** Every transaction writes entries that sum to zero. A database constraint
rejects unbalanced transactions — the check belongs to the store, not to the application.

**Idempotency by key.** `idempotency_key` is unique. A second attempt with the same key
returns the first one's result, without duplicating. See
[idempotency](/06-distributed-systems/idempotency.md).

**Balance as a projection with verification.** The `balance` table exists for fast reads and
is updated in the **same transaction** as the entry, with optimistic version control. It is
not an eventual replica — that would be an inconsistency window over money, which the
requirement forbids.

A daily process recalculates the balance of a sample from the entries and compares. The sample
is 100% of the accounts with movement in the last 24 h, and 2% of the rest.

The choice of sample deserves an explanation. Recalculating 6.4 million balances from 52
billion entries is expensive and slow. Recalculating only the accounts with movement covers
where an error could have been introduced; the 2% sample of inactive accounts covers the
hypothesis of silent corruption in data nobody touches — which is rare and is precisely what
would go unnoticed indefinitely.

Over two years of operation, the verification found three divergences. None was a ledger
error: two came from a badly executed manual correction, and one from a test that wrote to
production because of a misconfiguration. All were detected in under 24 hours — which is
exactly the value of the verification.

**History partitioned by month.** Partitions older than 90 days move to cheaper storage, with
slower queries — acceptable for old statements, which account for 3% of queries.

**PostgreSQL** as the ledger's database, with a synchronous replica in another zone (RPO zero)
and an asynchronous replica in another region (disaster recovery).

## Integration

**Instant payments (FR-5).** Real-time settlement, 24×7, with the central bank's settlement
system. It is the most demanding integration: the response to the settlement system has a
deadline, and the entry has to be confirmed before the response.

```text
receiving      settlement system → connector → synchronous ledger entry → response
sending        customer → entry with a hold → settlement system → confirmation
               → the hold becomes a definitive entry
timeout        if the settlement system doesn't respond, the hold stays and
               there is file-based reconciliation — never an optimistic release
```

The sending path is synchronous against the ledger and asynchronous against the settlement
system, with the hold serving as the intermediate state. That keeps the customer's balance
correct even when the settlement system is unavailable.

**Card networks (FR-6).** Batch settlement files, processed idempotently per file and per
record — reprocessing the same file does not duplicate entries.

**Product engine.** Publishes entries like any other origin. Interest and fees get no
privileged path into the ledger.

**Reconciliation.** Daily and mandatory, comparing the ledger against: the settlement bank's
statement, network files, and instant payment movements. A divergence above $0.01 is an
incident, not an alert.

The distinction between incident and alert is not semantic. An alert goes to a dashboard and is
observed; an incident pages on-call, has a response deadline and produces a follow-up
analysis. The choice to treat one cent as an incident was deliberate and contested — the
objection was that it would produce noise. Over two years, it produced 14 pages, of which 11
were real integration problems with third parties and 3 were reconciliation defects. None was
noise.

The reason is structural: in a double-entry ledger with a balancing constraint, a one-cent
divergence cannot come from internal rounding. It comes from outside, and what comes from
outside and doesn't match is always something that needs to be understood.

## Security

```text
segregation of duties     whoever operates doesn't post; whoever posts doesn't approve
                          manual entries require two approvers
authorship                every entry carries an author (system or person)
                          and an origin; no exceptions
ledger access             only the Posting Service writes;
                          no other component has write credentials
holder data               classification, flow mapping, declared retention
                          per point of rest
encryption                in transit and at rest; keys in a managed
                          service with rotation
audit trail               immutable and separate, retained 10 years
support access            read-only, with logging and a mandatory
                          justification per query
```

The most important control is **single write credential**: no alternative path writes to the
ledger, and that is verified automatically — a fitness function fails the pipeline if any
other service declares write credentials on that schema. See
[fitness functions](/19-architecture-governance/fitness-functions-governance.md).

Support access with a mandatory justification came from a regulator requirement and had a
positive side effect: the volume of support queries dropped 40%, because part of it was
curiosity.

## Scalability

The bottleneck is **writing to the ledger**, and it is manageable at the projected volume:

```text
design postings/s                    2,500
capacity measured in load testing    ~8,200/s with the current design
bottleneck in the test               contention on the balance table, per account
```

The contention is per account, not global. Ordinary accounts have low concurrency; settlement
accounts — the internal account that receives all fees, for example — have high concurrency.

The solution is **balance sharding for hot accounts**: high-volume internal accounts have
their balance split across N sub-rows, and the balance is the sum. A write picks a sub-row at
random, eliminating contention. See [hotspots](/11-scalability/hotspots.md).

Reads scale through replicas: the Balance Service reads from the primary only in the 5 seconds
following a write from the same session, and from replicas the rest of the time. See
[strong vs. eventual consistency](/20-trade-offs/strong-vs-eventual-consistency.md).

## Reliability

```text
RPO 0             synchronous replica in a distinct zone; confirmation to the
                  customer only after the commit in two zones
RTO < 15 min      automatic replica promotion, tested monthly
regional
  recovery        asynchronous replica in another region, RPO ~30 s,
                  used only in a declared disaster
testing           full restore tested quarterly, by someone
                  who is not the specialist
```

RPO zero costs latency: confirming across two zones adds ~12 ms to the p99 of a posting. It is
paid on every transaction and was accepted explicitly — money doesn't tolerate loss.

**Designed degradation.**

```text
ledger unavailable         no entry is accepted; the application reports
                           unavailability, and does not accept
                           "to process later"
read replica down          queries go to the primary, with higher latency
product engine down        interest and fees are delayed; nothing else is affected
instant payment connector  instant payments unavailable; the account keeps operating
  down
regulatory generator down  no immediate impact; the deadline is daily
```

The first line is the most important decision: **there is no optimistic acceptance of a
financial transaction**. A system that accepts an entry without writing it to the ledger is
creating money that may not exist.

That rule has an uncomfortable and accepted consequence: while the ledger is unavailable, the
bank does not operate. There is no queue of pending entries, no provisional acceptance, no
"we'll process it once it's back". The alternative — accept and settle later — trades a visible
and short outage for an invisible and open-ended risk of inconsistency, and it is the origin of
a good share of the unexplained negative balance episodes seen in the sector.

The 99.99% availability of posting exists precisely because there is no possible degradation
there. Where you cannot degrade, you pay in redundancy.

## Observability

```text
business metrics       postings/s per type, rejection rate,
                       total value moved, reconciliation divergence
technical metrics      posting latency p50/p99, replication lag,
                       contention per account, file queue depth
critical alarms        reconciliation divergence > $0.01 → incident
                       synchronous replica lag > 100 ms → alert
                       unbalanced entry → impossible, but alarmed
                       negative balance with no limit → incident
tracing                every entry correlated to its external origin
                       (instant payment transaction, file record, API call)
```

The line "unbalanced entry → impossible, but alarmed" is deliberate: the database constraint
prevents it, and the alarm exists because a firing would indicate the constraint was removed or
bypassed.

That pattern — alarming the impossible — appears three times in the design, and the
justification is the same: structural guarantees can be undone by mistake, and the moment to
discover that is not during an audit. The cost of keeping the alarm is negligible; the cost of
discovering late that the constraint was dropped in a schema migration is not.

The ledger's observability also serves an audience usually forgotten in the design: internal
controls and the regulator itself. Reconciliation reports, the audit trail and the support
access log are built with that audience in mind, and made available as queries rather than as
files sent on request — which reduced the effort of answering regulatory requests from days to
hours.

## Deployment

```text
ledger                    windowed deployment, off-peak, with schema
                          verification in three steps
                          (compatible → migration → cleanup)
other services            canary, 5% → 50% → 100%, with automatic rollback
schema migration          never destructive in the same deployment;
                          a column is dropped at least 2 versions later
load testing              mandatory before every ledger change,
                          against anonymized real-volume data
```

## Evolution Strategy

The plan is dominated by the regulatory requirement for a parallel run.

**Phase 1 (months 1–8): shadow ledger.** The new ledger is built and starts receiving a
**copy** of every entry from the current core, serving nobody. Daily, the balances of the two
are compared, account by account.

The exit criterion for the phase: **90 consecutive days with zero divergence across 6.4
million accounts.** The first attempt took 5 months to reach the criterion; 11 classes of
divergence were found, of which 7 were undocumented behaviors of the current core — the kind
of knowledge that only shows up in the comparison.

**Phase 2 (months 9–12): reads from the new ledger.** Balance and statement queries start being
served by the new ledger, with the current core still the write source. Low risk and reversible
by configuration.

**Phase 3 (months 13–16): writes per product.** Writes migrate per product, not per account. It
starts with the prepaid card — the product with the lowest volume and the lowest accounting
complexity — and advances to the payment account and credit.

Each migrated product keeps a reverse shadow: the old core keeps receiving a copy, for
comparison, until the next product migrates.

**Phase 4 (months 17–19): continuous settlement.** With the new ledger as the source, the 3h40
closing window is eliminated. The close becomes an aggregation process running over
already-settled data, without blocking writes.

**Phase 5 (months 20–26): new products and shutdown.** Multi-currency, joint accounts and
investments, followed by terminating the contract with 12 months' notice — started in Phase 3,
so as not to pay for an idle contract.

The choice to start the notice period in Phase 3, and not Phase 5, was a conscious risk
decision: it creates an irreversible 12-month deadline to complete the write migration. The
recorded justification is that, without that deadline, the organization's experience with long
projects indicated a high probability of Phase 4 being deferred indefinitely by competing
priorities — and the supplier contract, which keeps running while both systems coexist, costs
$10.6 million a year.

The risk was mitigated with an extension clause negotiated in advance, at an agreed price,
which never had to be invoked.

**Conditions that would change the plan:**

```text
if any class of divergence persists after 6 months of shadowing
  → the project is reassessed; unproven equivalence is a regulatory
    impediment, not a detail

if the sustained peak exceeds 3,000 postings/s
  → the centralized ledger decision is reassessed (Option C)

if the regulator changes the parallel-run requirement
  → Phases 1 and 3 shorten significantly

if the team loses more than 3 of the 6 people with financial experience
  → the project pauses; this is the most critical human dependency
```

## Results

Numbers at the end of Phase 4, 19 months after the start:

```text
closing window                          from 3h40 to 0
daily reconciliation divergence         $0.00 for 214 consecutive days
core cost                               from $10.6M/year to ~$1.0M/year
                                        (infrastructure + dedicated team)
p99 of posting                          218 ms
p99 of balance query                    74 ms
posting availability                    99.993%
time for a new product to enter
  the ledger                            from "not possible" to ~6 weeks
```

## What this case teaches

**A retail bank's scale is smaller than its reputation suggests.** 2,500 postings per second
fit in a relational database. Partitioning the ledger — which looks like the "serious" answer
— introduces a distributed transaction into the domain's most common operation, to solve a
problem that doesn't exist.

**The core should be dumb.** All the product freedom came from keeping the ledger free of
business rules. Products generate entries; the ledger merely accepts them balanced and writes
them.

**The parallel comparison is the product, not the bureaucracy.** Of the 11 classes of divergence
found in the shadow phase, 7 were undocumented behaviors of the old system. None would have been
discovered by reading a specification.

**RPO zero has a price in latency, and it is always paid.** Twelve milliseconds per
transaction, across 14 million daily transactions. The decision was recorded with the number,
not with the adjective.

## Related Concepts

- [Idempotency](/06-distributed-systems/idempotency.md).
- [Strong Consistency](/06-distributed-systems/strong-consistency.md).
- [Hotspots](/11-scalability/hotspots.md) — balance sharding.
- [Case: Payments Platform](/21-case-studies/payments.md).

## Practical Exercise

Design the entries table guaranteeing the three properties: immutability, balancing and
idempotency by key.

Then write the database constraint that makes an unbalanced entry impossible. If it lives in
the application and not in the database, it is not a guarantee.

## Interview Questions

- Why does partitioning the ledger by account solve a problem this system doesn't have, and
  create one it didn't have?
- Why is the balance updated in the same transaction as the entry, and not as an eventual
  projection?
- Why can there be no optimistic acceptance of a financial transaction?

## Further Reading

- Kleppmann, Martin. *Designing Data-Intensive Applications*. O'Reilly, 2017.
- Fowler, Martin. *Accounting Patterns*. martinfowler.com, 1996.
- Central bank instant payment scheme rulebooks — settlement system regulation.

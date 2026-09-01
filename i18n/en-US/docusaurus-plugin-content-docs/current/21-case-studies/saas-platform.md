---
id: saas-platform
title: "Case: SaaS Platform"
sidebar_position: 11
description: A management product for 14 thousand companies, where the decision is how much to isolate each customer and how much to share.
doc_type: case-study
level: 0
difficulty: advanced
status: complete
objective: >
  By the end, the reader chooses the tenant isolation model by cost, noise and customer
  requirement, and knows why the answer is usually mixed.
prerequisites: [trade-offs]
related: [multi-tenant-enterprise, ecommerce, healthcare]
canonical_for: []
translated_from_version: 3
last_reviewed: 2026-08-31
---

# Case: SaaS Platform

:::note How to use this case

Read the context, requirements and constraints. **Stop before the architecture options** and
sketch your own in twenty minutes.

This case's numbers are **illustrative** (SPEC.md §8.2): plausible and internally
consistent, not measured in a named system. What is learned is the reasoning they
support, not the magnitudes.

:::

## Business Context

**Fluxa** is a financial and tax management platform for small and medium businesses. It has
14,200 business customers, spread across three plans, and annual recurring revenue of $36
million.

The distribution of customers is heavily uneven, and that decides the architecture:

```text
plan          customers   % of revenue   average data volume
Essential        11,400        31%       ~40 MB
Advanced          2,600        44%       ~600 MB
Enterprise          200        25%       ~28 GB
```

Two hundred customers account for a quarter of the revenue, and each of them has 700 times more
data than the average entry-plan customer. A single architecture for all three is wrong in at
least two of the three tiers.

Three pressures motivate the review:

**Noisy neighbors.** An Enterprise customer running a tax close degrades latency for everyone else
sharing the same database instance. That happens between 6 and 11 times a month, and it is the
main source of complaints from smaller customers.

**Isolation requirements.** Eight Enterprise customers require, by internal policy or audit
requirement, that their data not share infrastructure with other customers. Fluxa currently loses
deals for not meeting that.

**Cost per customer.** Infrastructure cost per Essential customer is $8.20 a month, against a
subscription of $29.80. The margin is tight, and leadership wants that cost cut by 50%.

## Functional Requirements

For the **business customer**: manage financial entries, payables and receivables, bank
reconciliation and tax document issuance; import statements and files; and extract reports.

For the **accountant**, who serves several companies: switch between clients without leaving the
session; run batch routines across several clients; and track consolidated pending items.

For **Fluxa**: provision a new customer in minutes; migrate a customer between plans and between
isolation models with no downtime; measure consumption per customer; and apply updates to everyone
with no downtime window.

The accountant's requirement is the most constraining in the set and the easiest to forget: it
requires a query that crosses tenants, which any strong isolation model makes harder.

## Non-Functional Requirements

```text
p95 of an interactive operation          < 500 ms
p95 of a report                          < 4 s
availability                             99.9%
noisy neighbors                          no customer may degrade another
time to provision a new customer         < 5 min
time to migrate between models           < 4 h, with at most 15 min of
                                         downtime for that customer
data isolation                           no leakage between tenants,
                                         automatically verified
cost per Essential customer              50% reduction
tax retention                            5 years
RPO per customer                         < 5 min
```

The requirement of "no leakage between tenants, automatically verified" is the system's most
important. A leak of tax data between companies is an incident that ends trust in the product.

## Constraints

```text
regulatory      tax documents with legal validity; 5-year
                retention; mandatory integration with tax authorities
accountants     3,400 accounting firms serve multiple customers
                and represent 61% of the accounts
tax peaks       the 5th, 15th and 20th of each month concentrate 34% of
                monthly volume; the annual close concentrates more
team            54 engineers; 9 on the platform
migration       14,200 customers in production; any model change
                has to be done customer by customer,
                with no perceived downtime
cost            the -50% target on the entry plan comes from leadership
```

The accountants constraint is what most strains isolation: 61% of the accounts are accessed by
someone who needs a consolidated view of several tenants.

That tension is structural and appears in almost every product sold to small businesses: the buyer
is the company, the most frequent user is its accountant, and the accountant serves dozens of
companies. An isolation model that treats each company as an island perfectly meets the security
requirement and destroys the experience of whoever uses the product most.

Ignoring that requirement when choosing the isolation model is the error that produces a
technically correct and commercially unviable architecture — and it is easy to make, because the
accountant is not the paying customer and rarely appears in the stakeholder list.

## Capacity Estimates

```text
customers                         14,200
daily active users                ~38,000
requests/day                      ~74 million
requests/s, average               ~860
peak (5th, 15th and 20th, 10am-noon) ~5,400/s
with margin                       ~11,000/s

financial entries/day             ~9.1 million
tax documents issued/day          ~2.4 million
```

The aggregate volume is modest. What is not modest is the **variance between tenants**:

```text
requests/s from an Essential customer, peak    ~0.04
from an Advanced customer, peak                ~0.8
from an Enterprise customer, peak              ~120
```

An Enterprise customer running a close generates three thousand times the load of an Essential
customer. That ratio is the problem — not the total.

It is worth making explicit why the ratio matters more than the sum. If the system were sized by
total load, it would have capacity to spare: 860 requests per second on average is trivial. What
breaks it is the concentration — 120 requests per second from a single tenant, against an instance
sized for its neighbors' average, saturates shared resources that have no way to tell whose load
it is.

That is the noisy neighbor mechanism, and it is not solved by adding capacity: additional capacity
benefits everyone equally, and the noisy tenant keeps consuming disproportionately. The solution
is to isolate resources, not to increase them.

```text
storage
  Essential customer data         ~460 GB
  Advanced                        ~1.6 TB
  Enterprise                      ~5.6 TB
  tax documents, 5 years          ~14 TB
```

## Architecture Options

The axis is **how much to isolate each tenant**.

### Option A — Shared, one database and one schema

Every customer in the same structure, separated by a tenant column.

```text
cost per customer     minimal — fully shared resources
provisioning          instant — one row
noise                 maximum — it is the current problem
isolation             depends entirely on the code; one filter
                      error leaks data
customer migration    hard — extracting one customer requires scanning everything
```

It is the current architecture.

### Option B — Shared with a schema per tenant

The same database, one schema per customer.

```text
cost per customer     low
isolation             better — the schema is the boundary, and a
                      connection error doesn't leak
noise                 still present — database resources are shared
migration             simpler — export one schema
practical limit       thousands of schemas per instance degrade
                      the database catalog
```

### Option C — Isolated, one database per tenant

Each customer with its own instance or its own database.

```text
cost per customer     high — unviable for 11,400 customers at $29.80
isolation             maximum
noise                 none
migration             trivial
operations            14,200 databases to maintain, update and monitor
```

### Option D — Hybrid by plan

Shared with a schema per tenant for Essential and Advanced; a dedicated database for Enterprise
and for anyone who requires isolation.

```text
cost                  low where the margin is tight, high where there is
                      revenue to justify it
noise                 eliminated where it is caused
isolation             meets the 8 customers' requirements
complexity            two topologies to maintain
migration             the mechanism for migrating between models becomes
                      a product feature, not a project
```

## Trade-off Analysis

| Criterion | Weight | A — One schema | B — Schema/tenant | C — Database/tenant | D — Hybrid |
|---|:-:|:-:|:-:|:-:|:-:|
| Isolation and leakage risk | 25% | 3 | 7 | 10 | 9 |
| Elimination of noise | 25% | 1 | 4 | 10 | 9 |
| Cost per customer | 20% | 10 | 9 | 2 | 8 |
| Operational complexity | 15% | 9 | 7 | 2 | 5 |
| Meeting customer requirements | 10% | 1 | 3 | 10 | 10 |
| Cross-tenant queries (accountant) | 5% | 10 | 7 | 3 | 6 |
| **Weighted total** | | **5.0** | **6.3** | **6.9** | **8.2** |

**Sensitivity analysis.** With cost at 40%, the totals become 6.8 / 7.4 / 4.6 / 8.0 — Option D
keeps its advantage. With isolation at 45%, they become 3.6 / 6.0 / 8.0 / 8.7. No scenario tested
inverts it, which is expected of an option built to apply each model where it fits.

## Decision

**Hybrid by plan (Option D)**, with the isolation model as an attribute of the customer, and not
as a property of the architecture.

```text
Essential and Advanced   schema per tenant, on shared instances
                         with resource limits
Enterprise               dedicated database
any plan, under a
  contractual requirement dedicated database, at a differentiated price
```

The decision that makes this sustainable is that **the application does not know which model a
customer uses**. It obtains a connection from the tenant routing service, and the routing decides
whether that connection points at a shared schema or at a dedicated database.

That turns migration between models into an infrastructure operation, rather than an application
change — which is what makes it possible to offer isolation as a contract item.

**Under what condition each discarded option would win:**

**Option A would win if** the variance between tenants were small. In products where every
customer is of similar size, a single schema is simpler and cheaper, and the noise doesn't appear.

**Option B would win if** there were neither customers with a contractual isolation requirement
nor customers with load capable of saturating an instance. It is the correct model for the small
and mid-size tier — and it is exactly what Option D uses for them.

**Option C would win if** the average price per customer were high enough to absorb the cost of a
dedicated database. Above roughly $400 per month per customer, the math works, and the simplicity
of a single model pays off.

## Components

**Tenant Router.** Resolves, for each request, which database connection to use. It is the design's
central component and the only one that knows the topology.

**Application.** With no multi-tenant awareness beyond the current context. It receives the
connection and operates.

**Provisioner.** Creates a new tenant: schema or database, structure, initial data, credentials.

**Tenant Migrator.** Moves a customer between models, with a short cutover.

**Migration Applier.** Applies schema changes to every tenant, in waves.

**Consumption Meter.** Measures usage per tenant, for billing and to detect who is saturating
resources.

**Accountant Service.** Consolidated cross-tenant queries, with its own authorization.

**Tax Issuer.** Integration with tax authorities, shared across tenants.

The **Accountant Service** is what resolves the tension between isolation and consolidated
queries. It does not query the tenants' databases directly: it consumes an aggregate published by
each tenant, containing only what the accountant needs to see — pending items, deadlines, tax
status.

That keeps isolation intact and meets the requirement, at the cost of a staleness window of a few
minutes, which the product team validated as acceptable.

The validation was done with real accountants, and the result was surprising: the staleness didn't
bother them, but the **absence of any indication of staleness** bothered them a lot. An accountant
who sees a consolidated pending item and goes into the company to resolve it, only to find it has
already been resolved, loses confidence in the whole dashboard.

The solution was to display the time of the last consolidation next to the aggregate. It is one
line of interface that cost minutes and resolved the objection that would have brought the design
down — and it is a reminder that eventual consistency is acceptable when it is communicated, and
irritating when it is hidden.

## Data

**Tenant routing.**

```text
tenant  (id, name, plan, isolation_model, cluster, schema_or_database,
         state, created_at)
```

That table is the source of truth for the topology, and it is queried with aggressive caching — a
tenant's topology rarely changes, and a change invalidates the entry.

**Per-tenant structure.** Identical in every model. It is the property that allows migrating
between them: a shared schema and a dedicated database have exactly the same tables.

Maintaining that identity requires discipline — the temptation to optimize the structure for large
customers appears, and giving in to it would break migration. The rule is that optimizations for
large volumes are indexes and partitioning, never schema differences.

**Per-tenant partitioning in Enterprise customers.** Inside the dedicated database, the entry
tables are partitioned by period, which turns the annual close — the operation that saturated the
shared instance — into a partition scan.

**Tax documents.** Object storage, with a key prefixed by the tenant and an access policy that
prevents cross reads at the storage level, not only at the application level.

That is a defense-in-depth decision: even if the application has a filter defect, the credential
used for one tenant cannot read another's objects.

## Integration

**Routing.** On every authenticated request, the Router resolves the tenant from the context —
subdomain, token or explicit selection by the accountant — and obtains the appropriate connection
from a pool per destination.

The connection pool is the operational point of attention: with a schema per tenant, one
connection serves any schema in the same database, and routing merely adjusts the search path.
With a dedicated database, each destination has its own pool, and the total number of connections
grows with the number of isolated customers.

**Applying schema migrations.** The most delicate operational point with 14 thousand tenants. A
structural change has to be applied to all of them, and applying 14 thousand migrations at once is
unviable.

```text
1. the migration has to be compatible with the previous code version
2. it is applied in waves: 1%, 10%, 50%, 100%
3. the application works with migrated and unmigrated tenants
4. only after 100% does the code start depending on the change
```

That three-step discipline — compatible, apply, depend — is what allows migrating with no window.
It is verified automatically: a migration that drops or renames a column in the same code version
is rejected by the pipeline.

**Migration between models.** An Advanced customer becoming Enterprise, or starting to require
isolation, is migrated with the procedure: initial copy, incremental replication, a short cutover
with the tenant in read-only mode, verification and switching the routing.

The measured cutover is 4 to 11 minutes, within the 15-minute requirement.

**Tax issuance.** Shared, with a queue per tenant to prevent a customer issuing in bulk from
delaying the others — the same noise problem, solved at the queue level rather than at the
database level.

## Security

```text
data isolation           credential per tenant at the database
                         and object storage level
automatic verification   a test that tries to read another tenant's data
                         with one tenant's credential; it fails the pipeline
                         if it succeeds
Fluxa access to
  customer data          forbidden by default; support requires the
                         customer's authorization, with a deadline and a log
credentials              rotated automatically, per tenant
tax documents            signed, immutable, with a trail
accountants              explicit authorization per company, revocable
                         by the customer at any time
```

**Automatic isolation verification** is the system's most valuable control. A pipeline test assumes
tenant A's credential and tries to read tenant B's data, by several routes: direct query, report,
export, API. If any of them succeeds, the build fails.

That test found 4 real defects in the first 18 months, of which 2 were leaks that would have
reached production. See
[fitness functions](/19-architecture-governance/fitness-functions-governance.md).

## Scalability

The system scales by **tenant grouping**. Each shared instance hosts a limited number of schemas,
with the limit set by database catalog degradation and by resource capacity.

```text
schemas per instance, operational limit       ~1,200
shared instances                              14
dedicated databases                           208
```

New customers are allocated to the instance with the most headroom, measured by real consumption
and not by count. A customer who grows and starts consuming disproportionately is moved — the
Consumption Meter triggers the recommendation, and the migration is the same procedure used for a
plan change.

That ability to **rebalance tenants between instances** is what resolves noise without isolating
everyone: when a customer bothers the neighbors, they change neighborhoods.

The peak on the 5th, 15th and 20th is predictable and concentrated. Capacity is raised on a
schedule.

## Reliability

If a **shared instance** fails, the customers on that instance become unavailable and the others
notice nothing. It is the most valuable property of partitioning by instance: the failure has a
known and limited blast radius.

If a **dedicated database** fails, one customer becomes unavailable. Those are the 208
highest-revenue customers, and that is why they have a replica with automatic promotion, which the
others don't.

If the **Tenant Router** becomes unavailable, nothing works. It is the component with the highest
target, and it is deliberately simple: a cached lookup and no business logic.

If the **Tax Issuer** fails, issuance goes pending and the rest of the product works. The tax
deadline allows hours of slack.

If the **Accountant Service** fails, individual customers are unaffected; accountants lose the
consolidated view.

**RPO per customer < 5 min** is met by continuous backup with point-in-time recovery, per instance
and per dedicated database. Restoring a single tenant from a shared instance is the hard case, and
the procedure — restore to a temporary instance and extract the schema — is rehearsed quarterly.

## Observability

```text
consumption per tenant: requests, database CPU time,
  storage, tax issuances
p95 latency per tenant and per instance
tenants consuming above their instance's 95th percentile
noise detected: correlation between one tenant's peak and
  the neighbors' latency
schemas per instance, and distance from the limit
progress of migration application, per wave
blocked cross-access attempts
```

The **noise detected** metric is what closes the loop on the original problem: it correlates a
tenant's peaks with the neighbors' degradation, and triggers a rebalancing recommendation before
the complaint arrives.

Measuring consumption per tenant has a dual use: operations and billing. It allowed Fluxa to
introduce a consumption-based plan, which did not exist because the information did not exist.

## Deployment

One version of the application serves every tenant, always. There is no per-customer version —
that was an explicit decision, defended against commercial requests, because maintaining divergent
versions would multiply the maintenance cost by the number of variants.

Personalization is done by configuration and by per-tenant feature flags, never by code.

That rule was tested four times in two years, always by a commercial request from a large
Enterprise customer. In all of them, the answer was the same and the argument was recorded too: a
divergent version for one customer means every fix, every security update and every schema
migration comes to have two variants — and the second is always the one that falls behind.

In two of the four cases, the need was met by a feature flag. In the other two, the request was
for behavior incompatible with the product, and the answer was no. One of the two customers left;
the decision was upheld, and it is recorded in an ADR with the estimated cost of the alternative.

Canary deployment per instance: one shared instance receives the new version, is observed for 24
hours, and the rest follow. Enterprise customers' dedicated databases receive it last.

## Evolution Strategy

**Phase 1 (months 1–4): schema per tenant.** Migration from the tenant-column model to a schema
per tenant, customer by customer, with no downtime.

This phase is what reduces leakage risk, and it was prioritized for that — not for performance.

**Phase 2 (months 3–7): router and provisioning.** The Tenant Router, automatic provisioning and
the structure that makes the isolation model an attribute of the customer.

**Phase 3 (months 6–11): dedicated databases for Enterprise.** Migrating the 200 largest
customers, which eliminates most of the noise.

Measured result: noise degradation incidents dropped from 8.4 a month to 0.6.

**Phase 4 (months 10–15): automatic rebalancing.** Detecting a noisy tenant and recommending a
move.

**Phase 5 (months 14–20): Essential plan cost optimization.** Higher density per instance, tiered
storage for old data, and sizing by real consumption.

**Conditions that would change the plan:**

```text
if the proportion of Enterprise customers exceeds ~8%
  → the cost of dedicated databases grows and it is worth reassessing
    high-capacity shared instances for them

if any Essential customer consistently exceeds the
  99th percentile of consumption
  → they are promoted to their own instance, regardless
    of their commercial plan

if regulation requires data residency per state
  → routing gains a geographic dimension

if the practical schema-per-instance limit drops with
  a new database version
  → the density has to be revisited before the upgrade
```

## Results

Numbers at the end of Phase 4, 15 months after the start:

```text
noisy neighbor incidents                 from 8.4/month to 0.4/month
p95 of an interactive operation          from 780 ms to 340 ms
customers with contractual isolation     from 0 to 23 (8 required it,
                                         15 bought it as a differentiator)
revenue attributable to isolation        $2.24M/year
cost per Essential customer              from $8.20 to $4.60 (target was $4.00)
provisioning time                        from 3 days to 4 min
cross-access attempts detected
  in automated testing                   4 defects, 2 blocked before
                                         production
```

The most interesting item is commercial: 15 customers bought isolation as a differentiator with no
audit requirement at all. A capability built to serve 8 customers became a product.

That outcome was not foreseen and the mechanism is worth recording: once isolation became a
configurable attribute of the customer, offering it stopped having a project cost and came to have
only an infrastructure cost. The commercial team could price it, and the demand existed — it had
simply never been asked about, because the previous answer would have been "it isn't possible".

## What this case teaches

**The variance between tenants decides the model.** It is not the number of customers nor the
total volume — it is the ratio between the largest and the smallest. Three thousand times of
difference makes any uniform model wrong.

**Isolation should be an attribute of the customer.** When the application doesn't know which model
the customer uses, migrating between models becomes an infrastructure operation — and isolation
becomes a contract item, with a price.

**Verifying isolation automatically is the highest-value control.** A test that tries to leak data
and fails the pipeline when it succeeds found two leaks before production. No code review would
have the same detection rate.

**Three-step schema migration is what allows operating with no window.** Compatible, apply, depend
— in that order, verified in the pipeline. With 14 thousand tenants, any other approach requires
downtime.

## Related Concepts

- [Case: Multi-Tenant Enterprise](/21-case-studies/multi-tenant-enterprise.md) — the same problem
  at another scale.
- [Fitness Functions](/19-architecture-governance/fitness-functions-governance.md).
- [SQL vs. NoSQL](/20-trade-offs/sql-vs-nosql.md).
- [Case: Omnichannel E-commerce](/21-case-studies/ecommerce.md).

## Practical Exercise

Calculate the monthly infrastructure cost for 11,400 customers in three models: a single schema, a
schema per tenant on instances of 1,200 schemas, and a dedicated database.

Compare that with the $29.80 subscription. One of the three is obviously unviable, and the
exercise shows why.

## Interview Questions

- Why does the ratio between the largest and smallest tenant matter more than the total?
- Why should the application not know which isolation model the customer uses?
- Why does a schema migration have to be compatible before being applied?

## Further Reading

- Kleppmann, Martin. *Designing Data-Intensive Applications*. O'Reilly, 2017.
- Fowler, Martin. *Multi-Tenancy Patterns*. martinfowler.com.
- Nygard, Michael. *Release It!*. 2nd ed. Pragmatic Bookshelf, 2018.

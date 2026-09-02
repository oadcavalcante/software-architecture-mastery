---
id: multi-tenant-enterprise
title: "Case: Multi-Tenant Enterprise System"
sidebar_position: 12
description: A platform for 40 large corporations, where every customer wants the product fitted to their process and none accepts waiting for the others.
doc_type: case-study
level: 0
difficulty: advanced
status: complete
objective: >
  By the end, the reader designs per-customer extensibility without divergent code versions,
  and knows where to draw the line on customization.
prerequisites: [trade-offs]
related: [saas-platform, healthcare, legacy-modernization-case]
canonical_for: []
translated_from_version: 4
last_reviewed: 2026-08-31
---

# Case: Multi-Tenant Enterprise System

:::note How to use this case

Read the context, requirements and constraints. **Stop before the architecture options** and
sketch your own in twenty minutes.

This case's numbers are **illustrative** (SPEC.md §8.2): plausible and internally
consistent, not measured in a named system. What is learned is the reasoning they
support, not the magnitudes.

:::

## Business Context

**Alcance** sells a contract management and compliance platform to large corporations. It has 40
customers — banks, insurers, mining companies, energy utilities — with annual contracts between
$160 thousand and $1.8 million. Recurring revenue of $23.6 million.

The profile is the opposite of the [SaaS](/21-case-studies/saas-platform.md) case: few customers,
large contracts, each with its own process and bargaining power. And that is what produces the
central problem:

**The codebase has 40 variants.** Over nine years, each large customer obtained customizations
implemented directly in the product, guarded by conditionals. The approval engine's code has 214
customer conditionals. Fixing a defect requires testing 40 combinations, and the team cannot.

The numbers that motivate the review:

```text
average time between a fix being ready and production    11 weeks
defects reintroduced by regression                       34% of fixes
effort on maintenance versus features                    73% / 27%
customers on different versions of the product           17
oldest version in production                             3 years and 4 months
```

Seventeen customers on different versions is the most serious symptom: Alcance doesn't have one
product, it has seventeen.

The degradation was gradual and every step was reasonable. A large customer asked for a specific
behavior on a short deadline; implementing it as a conditional took two days, and modeling it as
configuration would have taken six weeks. The short-term decision was correct in isolation, and
repeated 594 times over nine years it produced a system nobody can change.

That is the erosion mechanism described in
[speed vs. quality](/20-trade-offs/speed-vs-quality.md), with a variation: here the shortcut was
not technical, it was commercial. Every conditional had a signed contract behind it, which made
the decision to take it even harder to refuse — and the decision to remove it, years later, even
more expensive.

## Functional Requirements

For the **corporate customer**: model their own contract approval flow, with stages, authority
levels and deadlines; define additional fields in the forms; configure compliance rules specific
to their sector; integrate with their internal systems — ERP, corporate directory, digital
signature; and extract reports using their own taxonomy.

For **Alcance**: deliver new functionality to every customer at the same time; fix a defect once;
and onboard a new customer in weeks, not months.

For the **end user**: operate contracts, approve, track deadlines and audit.

The conflict is evident: the customers want the product fitted to them, and Alcance needs a single
product. The whole architecture is about resolving that tension without choosing one of the sides.

## Non-Functional Requirements

```text
time between a fix being ready and production   < 1 week (against 11)
customers on the current version                100% (against 58%)
time to onboard a new customer                  < 6 weeks (against ~7 months)
p95 of an interactive operation                 < 700 ms
availability                                    99.9%
data isolation between customers                absolute, verified
customization without deployment                flows, fields and rules
                                                configurable by the customer
contract and trail retention                    10 years
auditability                                    every change to a contract
                                                recorded with author and reason
```

The requirement of 100% of customers on the current version is the hardest and the most important:
it is what turns seventeen products into one.

## Constraints

```text
bargaining power      each customer represents between 0.7% and 7.6% of
                      revenue; none can simply be overruled
existing
  customizations      214 customer conditionals in the approval engine,
                      and another 380 scattered elsewhere
integrations          each customer integrates with its own systems,
                      some old and with no modern API
regulatory            different regulated sectors, with per-customer
                      specific requirements
team                  62 engineers; 73% of effort on maintenance
migration             no window; every customer operates
                      continuously
contracts             changes affecting contracted functionality
                      require the customer's formal acceptance
```

The bargaining power constraint is what makes this case different: unilateral standardization is
not possible. Every removal of a customization has to be negotiated, and the argument has to be
good.

## Capacity Estimates

```text
customers                         40
named users                       ~186,000
daily active users                ~41,000
active contracts                  ~2.4 million
requests/day                      ~28 million
requests/s, average               ~325
peak                              ~1,900/s
approvals processed/day           ~94,000
```

The volume is small. As in almost every case in this set, the architecture is not decided by scale
— and here that is even more evident: 1,900 requests per second is served by a conventional
application in any topology.

What sizes this system is **variability**:

```text
distinct approval flows in use               163
additional fields defined by customers       ~4,100
customer-specific compliance rules           ~890
distinct integrations                        112
customized reports                           ~2,300
```

Four thousand one hundred additional fields and 163 distinct flows are the problem. No amount of
capacity resolves it; the question is where that variability lives.

An analysis of the 163 flows revealed something that changed the strategy: they were not 163
different processes. Grouped by structure, they reduced to 9 patterns, with variations in
authority level, deadline and terminology. A single pattern — sequential approval with a
value-based authority level and deadline escalation — covered 71 of the 163.

That discovery is what made Option B viable. If the 163 had genuinely been distinct, no
declarative model would express them; being 9 parameterized patterns, a flow engine with a
declarative definition covers almost all of it. The analysis took three weeks and determined the
whole project.

## Architecture Options

The axis is **where per-customer customization is expressed**.

### Option A — Conditionals in the code

The current situation: each customization is code, guarded by a customer check.

```text
flexibility        total — anything is possible
cost               prohibitive — every fix tests 40 combinations
versions           diverge inevitably
onboarding         months, with development
```

### Option B — Declarative configuration

Variability is expressed in configuration interpreted by the product: flows as a state machine
definition, fields as metadata, rules as expressions.

```text
flexibility        high, within what the configuration model foresees
cost               low — one codebase, many configurations
versions           everyone on the same one
onboarding         weeks, with configuration
limit              what the configuration cannot express requires
                   changing the product — for everyone
```

### Option C — Extensibility through customer code

The product exposes extension points where code supplied by the customer or by a consultancy runs
in an isolated environment.

```text
flexibility        almost total
cost               medium — the product is one, the extensions are the customer's
versions           everyone on the same product version
risk               third-party code in execution; isolation,
                   performance and support get hard
support            "the problem is your extension" is a bad conversation
```

### Option D — Declarative configuration with limited extension

Configuration for most of it, and restricted, well-defined extension points — integrations and
calculations — for what configuration does not cover.

```text
flexibility        high
cost               low to medium
versions           everyone on the same one
limit              explicit and negotiable
```

## Trade-off Analysis

| Criterion | Weight | A — Code | B — Configuration | C — Extension | D — Mixed |
|---|:-:|:-:|:-:|:-:|:-:|
| Version unification | 30% | 1 | 10 | 8 | 9 |
| Maintenance cost | 25% | 1 | 9 | 6 | 8 |
| Ability to meet requests | 20% | 10 | 6 | 9 | 8 |
| Onboarding time | 15% | 2 | 9 | 6 | 8 |
| Operational risk | 10% | 5 | 9 | 3 | 7 |
| **Weighted total** | | **3.4** | **8.7** | **6.9** | **8.2** |

The contest between B and D is close. The difference is in the ability-to-meet-requests criterion:
pure Option B has a hard limit, and when a $1.8-million customer asks for something the
configuration cannot express, the answer "no" is commercially expensive.

**Sensitivity analysis**, redistributing the remaining weight proportionally across the other criteria. With ability to meet requests at 35%, the totals become
4.6 / 8.2 / 7.3 / 8.2 — B and D tie. With risk at 30%, they become 3.7 / 8.8 / 6.0 / 7.9 —
Option B wins.

**The matrix points at B, and the decision is D.** D only overtakes B once the weight on ability
to meet requests passes 37%, and no scenario tested reaches that. The 0.5 gap in the base matrix
is the price the analysis charges Option D; what it does not price is the commercial cost of
saying "no" to a $1.8 million client, which is the stated reason for the choice. Recording that is
more honest than tuning the weights until the matrix produces the answer already chosen.

## Decision

**Declarative configuration with limited extension (Option D)**, with the boundary between the two
declared explicitly and reviewed quarterly.

```text
configurable by the customer
  approval flow, stages, authority levels, deadlines
  additional fields and their validation
  compliance rules through declarative expressions
  taxonomy and reports
  appearance and terminology

extensible by code, in an isolated environment
  integration adapters for the customer's systems
  specific calculations the expression language doesn't cover

never customizable
  the central contract data model
  the approval engine
  access control and the audit trail
  anything affecting isolation between customers
```

The third list is the most important and was the hardest to negotiate. It exists because
customization in those areas is what produced the 214 conditionals — and because they are
precisely the areas where an error affects correctness, security or isolation.

**Under what condition each discarded option would win:**

**Option A would win if** there were very few customers — two or three — and no expectation of
growth. With few variants, conditionals are manageable, and total flexibility has value.

**Pure Option B would win if** the customers were smaller and with less bargaining power, as in
the [SaaS](/21-case-studies/saas-platform.md) case. There, "the configuration doesn't cover it" is
an acceptable answer; here, it costs a contract.

**Option C would win if** Alcance operated as a developer platform, with an ecosystem of partners
building extensions — a different model, with its own support and governance.

## Components

**Contract Core.** The contract data model and lifecycle. Not customizable.

**Flow Engine.** Interprets the customer's flow definition and executes the approval. One engine,
163 definitions.

**Metadata Service.** Additional fields, validations and taxonomy per customer.

**Rules Engine.** Evaluates declarative compliance expressions.

**Extension Environment.** Runs adapter code in isolation, with limits on time, memory and access.

**Integration Service.** Connects the adapters to the customer's systems.

**Report Builder.** Reports defined by the customer over their own taxonomy.

**Configuration Service.** The source of truth for all per-customer configuration, versioned.

**Audit Trail.** Immutable, not customizable.

The **Configuration Service** being versioned is an important decision: a customer's configuration
is treated as code — it has a version, a history, review and rollback. A customer who changes
their approval flow and breaks a process can go back in minutes.

## Data

**Central model.** Fixed and identical for every customer.

```text
contract      (id, customer_id, type, parties, value, validity, state, ...)
stage         (id, contract_id, stage_definition_id, state, deadline, ...)
approval      (id, stage_id, approver_id, decision, reason, created_at)
trail         (append-only, immutable)
```

**Additional fields.** Stored in a JSON column with a schema validated from the customer's
metadata. Selectively indexed: each customer declares which of their fields need searching, and
the system creates expression indexes only for those.

That selectivity matters: 4,100 fields indexed indiscriminately would make writes unviable. In
practice, customers declare an average of 6 searchable fields each.

Making the customer declare which fields need searching is a design decision that hands a
technical choice to whoever has the information. The alternative — indexing everything as a
precaution, or trying to infer from usage — was considered and discarded: the first is expensive,
and the second produces unpredictable behavior, with a search that works today and gets slow
tomorrow because the usage pattern changed.

Explicit declaration makes the cost visible and the behavior stable. And it comes with a limit,
which turns a silent technical decision into a negotiable contract item.

**Flow definition.** A versioned declarative structure, interpreted by the Flow Engine.

```text
stages, with entry and exit conditions
authority levels by value, type and organizational unit
deadlines and escalation
parallelism and joins
automatic actions
```

A contract in progress keeps executing the flow version it started with. Altering the definition
does not affect contracts in flight — a decision that avoided an entire class of problems in which
a configuration change altered the process of approvals already under way.

**Isolation.** One schema per customer, with a credential per customer. With 40 tenants, the cost
is low and the isolation is strong — the decision the [SaaS](/21-case-studies/saas-platform.md) case
had to grade is simple here because there are few.

## Integration

**Integration adapters.** Each customer integrates with their own systems. The adapters run in the
Extension Environment, with a well-defined contract: they receive an event or a request, return a
result, within a time limit.

```text
extension environment limits
  execution time           5 s
  memory                   256 MB
  network access           a declared destination list, only
  data access              only what is passed as input
  libraries                an approved set
```

Restricting data access to the input is the decision that makes the environment safe: an extension
doesn't query the database, doesn't see other contracts and cannot access another customer by
construction. That eliminates the class of risk that makes third-party extensions dangerous, and
the cost is that extensions needing more context are not possible — which, in practice, proved
rare.

**Adapter failure.** An adapter that times out or fails does not bring the operation down: the
integration is marked pending and retried, and the user is informed. That resolves the difficult
support conversation — the product keeps working, and the pending item points clearly at the
extension.

**Corporate directory.** Each customer uses their own, with identity federation. The product keeps
no corporate user passwords.

## Security

```text
isolation           schema and credential per customer; automatic
                    verification of cross-access in the pipeline
extensions          isolated environment, with no data access beyond
                    the input, with a network destination list
configuration       versioned, with review and a trail; changes
                    to authority levels require approval from two of
                    the customer's users
audit trail         immutable, 10 years, not customizable
Alcance access      forbidden by default; support requires the
                    customer's authorization, with a deadline and scope
signature           integration with each customer's provider
segregation of
  duties            whoever configures the flow doesn't approve contracts
```

The **trail being non-customizable** was contested by three customers who wanted their own fields
in it. The recorded answer: an audit trail with a structure that varies per customer loses the
property that makes it useful — being comparable, verifiable and independent of the configuration
it audits.

The real need behind the request was different, and it was met differently: the customers wanted
to correlate trail events with identifiers from their own systems. The solution was an optional
correlation field, with fixed semantics — an external identifier — instead of free fields with
per-customer semantics.

That distinction between meeting the request and meeting the need appeared repeatedly during the
project. Of the 594 customization requests reviewed, 118 had a need that a generic capability met
better than the requested customization — and turning those into product capability is what most
reduced the list.

## Scalability

With 1,900 requests per second at peak, the system has no scale challenge. It has a challenge of
**variability in execution cost**: a flow with 3 stages and one with 24 parallel stages have very
different costs, and both are customer configuration.

The answer is per-customer limits, declared in the contract:

```text
stages per flow                    maximum 40
parallelism depth                  maximum 8
additional fields                  maximum 200
searchable fields                  maximum 15
active compliance rules            maximum 60
extension executions/min           maximum 600
```

Those limits did not exist before, and their absence allowed a customer to configure something
that degraded the system. Introducing them required negotiation — three customers were above some
limit — and produced a positive side effect: the conversation about limits revealed flows with
stages nobody had used in years.

## Reliability

If the **Flow Engine** fails, no approval advances. It is the component with the highest target.

If the **Extension Environment** becomes unavailable, integrations go pending and the product
continues. It was designed so that a third-party code failure is never a product failure.

If the **Configuration Service** becomes unavailable, the system operates with the cached
configuration — which rarely changes. Configuration changes are blocked.

If the **Audit Trail** fails, operations requiring a record are blocked. Failing closed is the
correct choice: an approval with no trail is a compliance problem.

If a **customer schema** fails, only that customer is affected. With 40 high-value customers, each
has a replica with automatic promotion.

## Observability

```text
per customer: p95 latency, error rate, usage against limits
extension executions: duration, failures, timeouts, per customer
flows in execution, per definition and per version
contracts stuck in a stage past the deadline
configuration changes, with author and effect
blocked cross-access attempts
each customer's distance from their configured limits
```

The **distance from limits** metric is used commercially: a customer near their field or rule limit
is an upgrade candidate, and the conversation happens before they hit it.

And tracking **contracts stuck past their deadline** is the product metric customers value most —
it is the reason they bought the platform, and it only exists because the flow is declarative and
the system knows what the expected deadline was.

## Deployment

One version for every customer, always. Continuous deployment, with a canary per customer: smaller
customers first, the three largest last, with 24 hours between waves.

Configuration is deployed separately from code, by the customer themselves, with prior validation
and the possibility of rollback.

Separating code deployment from configuration deployment is what changes the relationship with the
customer: 71% of changes came to be made by the customer, with no queue and with Alcance out of
the way. That reduced demand on the team and, more importantly, reduced the time between the
customer's need and the change — which was the origin of the pressure for customization in code.

Extensions have their own cycle: the customer or the consultancy publishes, Alcance validates
against the extension environment's contract, and the publication is recorded.

## Evolution Strategy

Migrating 40 customers with 594 code customizations was the project, and the order was defined by
one criterion: **how many customers a configuration capability unlocks**.

**Phase 1 (months 1–7): declarative flow engine.** The capability that on its own absorbs 61% of
the existing conditionals. The 40 customers' flows were modeled as configuration and compared, in
parallel, with the code's behavior — for three months, over real traffic.

The comparison found 27 divergences, of which 19 were undocumented behaviors of the old code and 8
were configuration modeling errors. The 19 were taken to the customers, and in 11 cases the
customer confirmed the old behavior was wrong and nobody had noticed.

**Phase 2 (months 6–12): metadata and additional fields.** Absorbs a further 18% of the
conditionals.

**Phase 3 (months 11–17): rules engine.** Declarative compliance, a further 9%.

**Phase 4 (months 15–22): extension environment.** For what remained — integrations and specific
calculations, about 8% of the conditionals.

**Phase 5 (months 20–28): version unification.** With the customizations out of the code, the 17
customers on old versions are upgraded. It is the phase that delivers the project's objective.

**The remaining 4%.** Twenty-four customizations fit in no mechanism. Each was negotiated
individually: 14 were abandoned by the customer on discovering nobody used them, 7 were met by a
new product capability — available to everyone — and 3 remain as conditionals, with a recorded
removal deadline and annual review.

**Conditions that would change the plan:**

```text
if any customer refuses removal of a critical customization
  → commercial negotiation; the cost of keeping one is estimated
    at $68 thousand/year per conditional

if the number of customers exceeds ~150
  → the schema-per-customer approach has to be reassessed, and the model
    converges toward the SaaS case

if extensions come to represent more than 20% of execution
  time
  → the extension environment needs stronger isolation
    and consumption-based charging

if a regulated sector requires customization in the core
  → the "never customizable" list is reopened, with an explicit
    risk analysis
```

## Results

Numbers at the end of Phase 5, 28 months after the start:

```text
customers on the current version        from 58% to 100%
time between a fix and production       from 11 weeks to 4 days
customer conditionals in the code       from 594 to 3
effort on maintenance                   from 73% to 34%
defects reintroduced by regression      from 34% to 6%
time to onboard a new customer          from ~7 months to 5 weeks
flows configured by the customers
  themselves, without Alcance            71% of changes
revenue from new customers in the period +$5.2M (onboarding
                                        stopped being a commercial bottleneck)
```

The last number is the result leadership considers decisive: the seven-month onboarding limited
how many customers Alcance could add per year, regardless of demand. Reducing it to five weeks
unlocked growth.

It is also worth recording what did not improve. The declared satisfaction of the three largest
customers dropped in the project's first year, and the cause was identified: they lost the ability
to ask for anything and receive it. They started hearing "that isn't configurable, and we will
evaluate it as a product capability for next quarter" — which is a better answer for Alcance and a
worse one for them.

Recovery came in the second year, when the time between a request and delivery of a new capability
dropped from months to weeks, and the perception changed from "we lost privilege" to "we get it
faster". The intermediate period was uncomfortable and was foreseeable — and having foreseen it in
the plan, with dedicated commercial attention to the three, is what avoided losing any of them.

## What this case teaches

**Customization needs a home that isn't the code.** Customer conditionals are the most expensive
possible form of variability: they multiply the cost of every fix by the number of variants, and
they produce divergent versions inevitably.

**The boundary of what isn't customized is the decision.** The central model, the approval engine,
access control and the trail stayed out, and that short list is what preserved the product's
correctness. Negotiating it was harder than implementing everything else.

**Comparing configuration and code in parallel documents the past.** The 27 divergences found
included 19 behaviors nobody knew existed, and 11 of them had been wrong for years. The same
pattern as the [banking](/21-case-studies/banking.md) and
[social network](/21-case-studies/social-network.md) cases.

**Explicit limits are a capability, not a restriction.** Introducing per-customer limits made the
cost predictable, became a commercial instrument, and revealed configurations nobody used.

## Related Concepts

- [Case: SaaS Platform](/21-case-studies/saas-platform.md) — the same problem with many small
  customers.
- [Case: Legacy Modernization](/21-case-studies/legacy-modernization-case.md).
- [Simplicity vs. Flexibility](/20-trade-offs/simplicity-vs-flexibility.md).
- [Fitness Functions](/19-architecture-governance/fitness-functions-governance.md).

## Practical Exercise

List your product's per-customer customizations and classify each one as: expressible by
configuration, expressible by an isolated extension, or requiring a change to the core.

The third list is what defines the negotiable boundary. If it is large, the product has no
variability model — it has 40 products.

## Interview Questions

- Why do customer conditionals inevitably produce divergent versions?
- Why should the audit trail not be customizable?
- Why does a contract in progress keep executing the old version of the flow definition?

## Further Reading

- Fowler, Martin. *Domain-Specific Languages*. Addison-Wesley, 2010.
- Evans, Eric. *Domain-Driven Design*. Addison-Wesley, 2003.
- Hohpe, Gregor. *The Software Architect Elevator*. O'Reilly, 2020.

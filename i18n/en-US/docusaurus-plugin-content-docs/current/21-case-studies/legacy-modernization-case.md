---
id: legacy-modernization-case
title: "Case: Legacy Modernization"
sidebar_position: 13
description: A 34-year-old pension system on a mainframe, with 190 million lines of COBOL and no window to stop.
doc_type: case-study
level: 0
difficulty: advanced
status: complete
objective: >
  By the end, the reader runs a critical system modernization with no big-bang switchover,
  with proven equivalence and business rules recovered from the code.
prerequisites: [trade-offs]
related: [healthcare, banking, multi-tenant-enterprise]
canonical_for: []
translated_from_version: 2
last_reviewed: 2026-08-31
---

# Case: Legacy Modernization

:::note How to use this case

Read the context, requirements and constraints. **Stop before the architecture options** and
sketch your own in twenty minutes.

:::

## Business Context

The **Instituto Previdencial** administers the supplementary pension scheme for 41 state and
municipal public entities — a fund with 2.9 million participants and $16.8 billion under
management.

The benefits system has run on a mainframe since 1991. It calculates, grants and pays 890
thousand monthly benefits, and has never failed catastrophically in 34 years.

That has to be said first, because it sets the tone of the analysis: **the legacy system works**.
The modernization is not motivated by failure, and a proposal that treats it as a technical
problem to be eliminated will fail.

The pressures are different:

**Knowledge.** Nine people remain who can change the system. Their average age is 58, and six
retire within the next four years. There is no replacement in the market, and training someone
internally takes 2 to 3 years.

**Cost.** Licensing the mainframe and its base software costs $12.4 million a year, with
above-inflation increases.

**Speed.** A change in pension rules — which happens by law, with a deadline — takes 8 to 14
months to reach production. Two legal changes in the last five years went into production past
the deadline, with legal consequences.

```text
lines of COBOL                        ~190 million
programs                              ~41,000
tables and files                      ~3,800
calculation rules identified          unknown — estimates range
                                      between 4,000 and 11,000
documentation                         out of date since ~2004
automated tests                       none
```

The line "calculation rules identified: unknown" is the project's real problem.

It is worth explaining why the estimate varies so widely. The rules are not organized: an
eligibility condition may be spread across four programs, expressed as comparisons over
six-character field names, and depend on a value written to a file by a process that ran in 1997.
Counting rules would require understanding the code, and understanding the code is the project
itself.

That circularity — to plan you need to know the scope, and to know the scope you have to execute —
is the defining characteristic of modernizing an old legacy system. Any method that presupposes a
known scope at the start is solving a different problem.

## Functional Requirements

The system has to keep doing what it does, with no exceptions: register participants and
dependents; record contributions and service time; simulate a benefit; grant a benefit according
to the rule in force at the date of application; calculate and pay the monthly payroll of 890
thousand benefits; process adjustments, survivor pensions, judicial reviews and retroactive
corrections; and report to oversight bodies.

The hardest requirement is in one phrase: **"according to the rule in force at the date of
application"**. Thirty-four years of legislative changes mean the system applies dozens of
different rule sets depending on when the person joined, when they applied and which scheme they
belong to. None of them can be lost.

## Non-Functional Requirements

```text
availability of payroll calculation     100% in the monthly window
                                        (the payroll cannot be late)
availability of lookups                 99.9%
equivalence with the legacy system      100% — no difference of a cent
                                        in any benefit
payroll processing window               < 6 h (today: 4h20)
time to implement a legal rule change   < 8 weeks (today: 8-14 months)
RPO                                     0
retention                               permanent — a pension
                                        benefit doesn't expire
auditability                            every calculation reproducible,
                                        with the rules applied
```

The requirement of absolute equivalence dominates the project. A one-cent difference in a benefit
is an error that produces litigation, and 890 thousand monthly benefits mean any error rate
produces volume.

An error rate of 0.01% — which would be excellent in almost any system — would produce 89
incorrect benefits a month, more than a thousand a year. Each one is an elderly person receiving
less than they are entitled to, or more than they should with a subsequent clawback. Neither is
acceptable.

That arithmetic is what justifies the criterion of zero divergences for three months, which looks
excessive read in isolation. It is not conservatism — it is the direct consequence of the volume
multiplied by the individual severity.

## Constraints

```text
no window         the payroll runs every month; there is no period
                  in which the system can stop
knowledge         9 people, 6 retiring within 4 years
rules             they exist written nowhere but in the code
budget            public, annual, subject to freezes
political
  timeline        leadership has a 4-year term; an 8-year project
                  spans two administrations
legal             judicial reviews alter individual benefits
                  retroactively, and the system has to recalculate
audit             the public accounts court oversees it; changes require
                  documentation and approval
team              32 engineers hired for the project,
                  none with mainframe experience
```

The political timeline constraint is what most influences the strategy: a project that only
delivers value in year 7 does not survive a change of administration.

## Capacity Estimates

```text
participants                         2.9 million
active benefits                      890 thousand
monthly payroll                      890 thousand calculations, in a 6 h window
                                     →  ~41 calculations/s
lookups/day                          ~1.2 million  →  ~14/s, peak ~90/s
grants/month                         ~4,200
judicial reviews/month               ~380
```

The volume is small by any modern measure. Forty-one calculations per second, ninety lookups per
second at peak. **No decision in this project is motivated by scale** — and it is important to say
so, because modernization projects are frequently sold with a scalability argument that doesn't
hold up.

What sizes it is something else:

```text
rule combinations to preserve         estimated between 4,000 and 11,000
test cases needed to prove
  equivalence                         unknown at the start
volume of historical data             ~14 TB
years of contributions per participant up to 40
```

## Architecture Options

The axis is **how the rules come out of the COBOL without being lost**.

### Option A — Complete rewrite from a specification

Write the functional specification from analysis and interviews, and build the new system.

```text
timeline          estimated at 6 to 9 years
risk              very high — the specification will be incomplete,
                  because the knowledge does not exist outside the code
value delivery    only at the end
history           the industry has a consistent record of failure
                  with this model, for systems of this nature
```

### Option B — Automated conversion from COBOL to a modern language

Tools that translate the code, preserving the logic.

```text
timeline          18 to 30 months
equivalence       high — the logic is preserved literally
result            generated code, unreadable, with the same structure
                  as the original; maintainability doesn't improve
cost              reduces licensing; doesn't reduce the dependency
                  on knowledge
```

### Option C — Strangling by domain, with proven equivalence

Extract capabilities one by one, with the new system running in parallel and compared with the
legacy one until equivalence is proven, and only then taking over the traffic.

```text
timeline          continuous delivery; first capability in ~8 months
                  complete shutdown in 6 to 8 years
risk per step     low — each extraction is compared and reversible
value delivery    continuous, which meets the political constraint
cost              two systems coexisting for years
rule
  recovery        the parallel comparison is the mechanism that
                  discovers the rules
```

### Option D — Encapsulate and freeze

Keep the legacy system as is, wrap it in modern interfaces, and build only what is new outside it.

```text
timeline          12 to 18 months for the interfaces
risk              low
cost              licensing kept in full
knowledge         the main problem is not solved; when the
                  9 people leave, the system becomes untouchable
```

## Trade-off Analysis

| Criterion | Weight | A — Rewrite | B — Conversion | C — Strangling | D — Encapsulate |
|---|:-:|:-:|:-:|:-:|:-:|
| Risk of a benefit error | 30% | 2 | 8 | 9 | 10 |
| Resolving the knowledge risk | 25% | 8 | 4 | 9 | 1 |
| Value delivery over time | 20% | 1 | 5 | 9 | 7 |
| Cost reduction | 15% | 8 | 8 | 7 | 1 |
| Speed of future change | 10% | 9 | 3 | 9 | 2 |
| **Weighted total** | | **4.6** | **6.2** | **8.7** | **5.1** |

**Sensitivity analysis.** With risk of error at 50%, the totals become 3.6 / 7.3 / 8.9 / 8.1 —
Option C keeps its advantage. With cost at 40%, they become 5.9 / 7.3 / 8.0 / 3.0. No scenario
inverts it.

The 30% weight on risk of error reflects the domain's nature: a calculation error in a pension
benefit affects an elderly person's income and creates legal liability. It is the criterion
leadership and the accounts court placed above all others.

## Decision

**Strangling by domain with proven equivalence (Option C)**, with parallel comparison as the
central mechanism — not as a validation step, but as the way to **discover** the rules nobody
knows.

That inversion is the project's central idea: instead of trying to document the rules and then
implement them, the new system is implemented with the best available understanding, run in
parallel over real cases, and **every divergence is a discovered rule**.

The practical consequence is that the project **starts wrong on purpose**. The first version of a
capability's calculation engine diverges in thousands of cases, and that is the expected result —
each divergence is information that did not exist. A team that treats the initial divergences as
failure will abandon the method in the third week.

Communicating that to leadership and to the accounts court before starting was as important as
the technical design. The indicator tracked is not "how many errors do we have", it is "the
divergence rate is falling" — and the descending curve is what demonstrates progress.

**Under what condition each discarded option would win:**

**Option A would win if** the rules were documented and verifiable — which is the case in newer
systems or in domains with a complete and current normative specification.

**Option B would win if** the objective were exclusively to leave the mainframe on cost, with a
short deadline and no expectation of improving maintainability. It is a legitimate option as an
**intermediate step** in situations of contractual urgency.

**Option D would win if** the knowledge risk did not exist — if there were a market or internal
training to replace the 9 people. It remains partially in use: the legacy system is encapsulated
while it is strangled, and that is what makes it possible to build the new one outside.

## Components

**Service Facade.** Exposes the legacy system through modern interfaces, letting the new consume
the old during the transition.

**Capability Router.** Decides, per operation, whether it goes to the legacy system or to the new
one. It is the point of switchover and rollback.

**Equivalence Comparator.** Executes the same operation on both systems and compares the results.
It is the project's most important component.

**Calculation Engine.** The new benefit calculation system, with the rules expressed declaratively
and versioned by period of validity.

**Rule Catalog.** A repository of the discovered rules, with validity, legal source and associated
test cases.

**Participant Service.** Registration, dependents, relationships.

**Contribution Service.** Contribution history and service time.

**Benefit Service.** Granting, maintenance, review.

**Payroll Processor.** Monthly calculation.

**Data Extractor.** Synchronization from the legacy system to the new one during coexistence.

The **Rule Catalog** is the highest-value artifact the project produced, and it did not exist as
an initial objective. It emerged from the need to record every rule discovered by the comparison,
and it is what resolves the knowledge risk — far more than the new code does.

## Data

**Data strategy during coexistence.** The legacy system remains the source of truth until a
capability is switched over. The Extractor synchronizes continuously to the new system, which
operates read-only until it takes over.

That single direction — legacy to new, never the reverse — is the lesson from the
[e-commerce](/21-case-studies/ecommerce.md) case applied here, and it was decided on that basis:
bidirectional synchronization between two sources of truth does not work.

**Rule model.**

```text
rule         (id, domain, description, valid_from, valid_to,
              legal_source, expression, discovered_at, confirmed_by)
test_case    (id, rule_id, input, expected_output, origin)
```

The test case's `origin` field distinguishes three provenances: a case built from the legislation,
a case extracted from the legacy code, and **a case discovered by divergence**. The third is the
most valuable.

**Historical data.** The 14 TB stay in the legacy system through almost the whole project and
migrate last. Migrating early would create the need to keep both synchronized for years, with no
benefit.

**Calculations.** Every calculation is stored with the rules applied and the engine version, which
satisfies auditability and allows reprocessing. A recalculation from a court decision needs to
know which rules were originally applied.

## Integration

**Parallel comparison**, which is the core of the method.

```text
1. the Router sends the operation to the legacy system (which answers the user)
2. it also sends it to the new system, asynchronously
3. the Comparator confronts the two results
4. divergences are recorded with input, outputs and context
5. each divergence is analyzed: an error in the new one, or an unknown rule?
6. discovered rules enter the Catalog, with a test case
7. when the divergence rate reaches zero for N periods, the capability
   is considered equivalent
```

The exit criterion per capability is strict: **zero divergences across 100% of operations, for
three consecutive months**. For the payroll, that means three complete monthly payrolls — 2.67
million calculations — with not one cent of difference.

**What the comparison found.** This is the case's most transferable result.

```text
divergences analyzed, total                       ~31,000
errors in the new system                          ~24,000 (77%)
unknown rules discovered                          ~6,400 (21%)
errors in the legacy system                       ~600 (2%)
```

The 600 legacy errors deserve attention: over 34 years, the system calculated some cases
incorrectly, and nobody knew. Most were in rare combinations — specific transition schemes,
benefits with multiple judicial reviews. Each was taken to the legal team, and 17 resulted in
retroactive correction of benefits.

**Data extraction.** Continuous, from legacy to new, with daily integrity verification. It is the
only integration that persists throughout the project.

**Interfaces with oversight bodies.** Kept in the legacy system until the last phase, because they
are stable and there is no value in migrating them early.

## Security

```text
participant data        sensitive personal data; classification,
                        flow mapping and declared retention
access                  by role and by unit, with a trail
benefit alteration      requires two approvers and a recorded reason
calculation             immutable after payment; a recalculation is
                        a new record
trail                   permanent, immutable
parallel comparison     the Comparator has read access to both
                        systems; its credentials are the most
                        sensitive in the project
test environment        synthetic or anonymized data; never
                        a production copy
```

The restriction against ever using a production copy in tests created a real problem: proving
equivalence requires real cases. The solution was to run the comparison **in production**, with
the new system in shadow mode, rather than trying to reproduce production in another environment.

That decision — comparing in production rather than simulating — is what made the method viable,
and it is safe because the new system answers to nobody during the shadow phase.

Getting that approach approved by the accounts court required demonstrating three properties: the
shadow system writes to no production system, exposes data to no user, and has its access logged
and auditable like any other. Documenting that formally took two months and was a project
prerequisite.

Organizations with strong external audit frequently rule out comparison in production by assuming
it would not be approved. In this case, it was — and the decisive argument was that the
alternative, switching over with no comparison, presented far greater risk to the beneficiaries.

## Scalability

There is no scale challenge. The new system is sized with a wide margin for 41 calculations per
second, and the complete payroll runs in about 40 minutes against the legacy system's 4h20.

That reduction was not an objective and is a side effect of modern hardware. It has a practical
use: the roomy window allows running the payroll **twice** during coexistence — once on the legacy
system, once on the new one — within the same night, which is what makes the monthly comparison
possible.

## Reliability

Throughout coexistence, the legacy system is the safety net. If the new system fails in any
already-switched capability, the Router reverts to the legacy system in seconds, by configuration.

That rollback was used 14 times over the project, all in the first weeks after a switchover, and
none resulted in a payment error.

After the legacy shutdown, reliability depends entirely on the new system, and the design reflects
that: RPO zero with synchronous replication, RTO of 10 minutes with automatic promotion, and
disaster recovery in another region with a semiannual rehearsal.

The **monthly payroll** has special treatment: it is the only process whose failure has an
immediate and irreversible consequence — 890 thousand people not being paid. The contingency plan
includes an emergency procedure that reprocesses the previous month's payroll with an adjustment,
legally approved, and it has never had to be used.

## Observability

```text
divergence rate per capability and per operation type
divergences by class: new-system error, new rule, legacy error
rules in the catalog, and coverage by test cases
progress: % of operations served by the new system, per capability
payroll time, on both systems
rollbacks triggered, with cause
capability remaining in the legacy system, measured in programs and in rules
```

The **capability remaining in the legacy system** metric is what leadership tracks, and it was
chosen carefully: measuring in remaining lines of COBOL would be misleading, because much of the
code is unreachable or duplicated. Measuring in programs actually executed in the last year and in
catalogued rules gives an honest read of progress.

## Deployment

The new system uses continuous deployment. The legacy system keeps its original cycle — changes
there are rare and go through the usual process.

Switching a capability over is a configuration change in the Router, done at a low-activity hour,
with intensive monitoring for two weeks.

No switchover in the five days preceding payroll processing.

## Evolution Strategy

The order of capabilities was defined by three combined criteria: low risk, visible value, and
independence from the others.

**Phase 1 (months 1–8): facade and lookups.** The legacy system is encapsulated, and participant
and benefit lookups start being served by the new system, from extracted data.

Value delivered early: the participant portal, which did not exist, was built on the facade and
went live in month 6. It is what sustained the project politically in the first year.

**Phase 2 (months 7–20): benefit simulation.** The first calculation capability. Chosen because a
simulation generates no payment — an error is visible and harmless.

This is where the method proved itself: 11 thousand divergences analyzed, 2,800 rules discovered,
and no effect on any participant.

**Phase 3 (months 18–36): granting.** Benefit calculation at the point of granting, with three
months of comparison before the switchover.

**Phase 4 (months 30–52): payroll.** The central capability. Compared for six months — twice the
standard criterion — before the switchover.

**Phase 5 (months 48–72): reviews, retroactive corrections and special cases.** The long tail,
which concentrates most of the rare rules.

**Phase 6 (months 66–84): historical migration and shutdown.** The 14 TB and the termination of
the contracts.

**Conditions that would change the plan:**

```text
if a capability's divergence rate doesn't reach zero after
  12 months of comparison
  → that capability is reassessed; the rule model may not
    be able to express it

if more than 3 of the 9 people with legacy knowledge leave
  before Phase 4
  → the priority shifts to cataloguing rules, even without
    implementing them

if there is a structural legislative change during the project
  → it is implemented only in the new system, and the
    corresponding capability is brought forward

if the budget is frozen below a threshold
  → the project pauses in a consistent state; no phase
    can end with a capability partially switched over
```

The last condition guided the design of every phase: each phase ends in a state where the project
can stop for a year with no damage. That was required by the reality of public budgeting, and it
produced a better plan.

## Results

Numbers at the end of Phase 4, 52 months after the start:

```text
operations served by the new system       from 0% to 78%
rules catalogued                          6,400, all with a test case
payroll divergences, last 6 months        0
time to implement a legal rule change     from 8-14 months to 5 weeks
licensing cost                            from $12.4M/year to $6.2M/year
people able to maintain the system        from 9 to 34
historical legacy errors corrected        17 benefits, retroactively
payroll time                              from 4h20 to 38 min
```

The number leadership highlights is the people one: from 9 to 34, with training new ones possible
in weeks instead of years. The risk that motivated the project was resolved.

And there is a result that was in no target: the Rule Catalog became the Institute's reference
document on the pension legislation it applies. It is consulted by the legal team in litigation,
because it describes precisely which rule was applied to which benefit, in which validity period,
with the corresponding legal source — information that previously existed only inside the COBOL,
and that no legal opinion could cite with confidence.

## What this case teaches

**Parallel comparison doesn't validate — it discovers.** The 6,400 catalogued rules existed
written nowhere. Trying to document them before implementing was Option A's path, and it is where
projects of this nature fail.

**The legacy system was right, almost always.** 77% of divergences were errors in the new system.
Treating the legacy system as the reference, and not as a suspect, is what makes the method
trustworthy — and the 2% where it was wrong were found precisely by taking it seriously.

**Delivering value early is a requirement, not a virtue.** A seven-year project in a public
organization spans two administrations. The participant portal in month 6 bought the legitimacy
that sustained the following five years.

**Every phase has to end in a stable state.** The budget constraint forced a design in which the
project can stop at any moment with nothing left half-done. That improved the plan — and it is a
discipline projects with stable budgets rarely adopt.

## Related Concepts

- [Strangling](/16-legacy-modernization/strangler-fig.md).
- [Case: Omnichannel E-commerce](/21-case-studies/ecommerce.md) — the single-source-of-truth
  lesson.
- [Case: Digital Banking Core](/21-case-studies/banking.md) — the same shadow method.
- [Anti-Corruption Layer](/08-integration-architecture/integration-anti-corruption.md).

## Practical Exercise

Pick a legacy system in your context and answer: if you had to prove a new system behaves the same
as it, which cases would you compare over?

If the answer is "I don't know which cases exist", you are in the same situation as this case —
and comparison in production is the only method that produces the list.

## Interview Questions

- Why is parallel comparison a discovery mechanism and not merely a validation one?
- Why is 77% of divergences being errors in the new system a good sign?
- Why does every phase have to end in a state where the project can stop?

## Further Reading

- Feathers, Michael. *Working Effectively with Legacy Code*. Prentice Hall, 2004.
- Newman, Sam. *Monolith to Microservices*. O'Reilly, 2019.
- Fowler, Martin. *StranglerFigApplication*. martinfowler.com, 2004.

---
id: risk-management
title: Risk Management
sidebar_position: 15
description: Architectural risk as a first-order responsibility — named, quantified and owned.
doc_type: concept
level: 7
difficulty: advanced
status: complete
objective: >
  By the end, the reader maintains a register of architectural risks with probability, impact and an
  owner, and knows when to accept instead of mitigating.
prerequisites: [decision-making]
related: [decision-making, cost-management, measuring-architecture-outcomes]
canonical_for: []
translated_from_version: 1
last_reviewed: 2026-08-31
---

# Risk Management

## Overview

Architectural risk is the probability of the architecture failing to meet something that matters —
availability, security, cost, the capacity to change, continuity of knowledge.

And it has a characteristic that distinguishes it from project risk: **it materializes slowly and
all at once**. A system dependent on two people works perfectly until the day they leave.

```text
project risk           the deadline slips, visibly
architectural risk     nothing happens, until everything happens
```

That is why it has to be named, quantified and reviewed — because the absence of symptoms is the
normal state, and it gets confused with the absence of risk.

## Problem

The typical architectural risk exists and is recorded nowhere:

```text
"only two people know how to operate that system"
"that component has no tested backup"
"the supplier contract expires in 2027 and we have no alternative"
"the certificate is renewed manually by one person"
```

Everybody knows. Nobody is accountable. No decision has been made about it.

And there is a second problem: the risk register that exists and is not used. A spreadsheet with 60
risks, all in amber, updated once a year — meeting an audit requirement and informing no decision.

```text
an unregistered risk       materializes and surprises
a registered risk with
  no owner and no action   materializes and doesn't surprise, which
                           is worse — somebody knew
```

## Core Concepts

### Name it with a consequence, not with a category

```text
weak     "business continuity risk"
strong   "if Marcelo and Paula leave, nobody can change
         the commission calculation system. Estimated time
         to train a replacement: 8 to 12 months."
```

The second statement is actionable because it has a subject, a consequence and a magnitude. Abstract
categories produce registers nobody reads.

### Quantify probability and impact, however roughly

```text
probability   high, medium, low — with the reason for the estimate
impact        in money, time or regulatory consequence
exposure      probability × impact, for ordering
```

Precision is not the point; ordering is. A register in which every risk looks equally serious does
not allow prioritization, and not prioritizing is the way to treat none of them.

```text
"high probability: the two have been here 9 and 11 years, and the
 average tenure at the company is 4.
 impact: the system moves $8M/month in commissions, and
 rule changes are quarterly.
 exposure: high — this is the number one risk in the register."
```

### Every risk has an owner, and the owner is not architecture

```text
risk owner       whoever can act on it
register owner   whoever ensures it gets reviewed
```

A risk whose owner is "the architecture group" generally has no owner, because architecture rarely
has the resources to act. The owner is whoever controls the capacity: the team's manager, the
engineering director, the contract holder.

Architecture's role is to identify, quantify and ensure the decision is made — not to make it.

### Four possible responses

```text
mitigate    reduce probability or impact
transfer    insurance, contract, outsourcing
avoid       change the architecture so the risk doesn't exist
accept      formally, with whoever has the authority
```

The fourth is legitimate and underused. Explicitly accepting a risk — with a date, an owner and a
review — is far better than keeping it open indefinitely on a "to be handled" list.

```text
"we accept the regional unavailability risk until 2028.
 Accepted by: engineering leadership. Review: annual.
 Reassessment trigger: if the digital channel's revenue passes
 $200M/year."
```

### Risk appetite has to be declared

Without it, every risk decision is negotiated from scratch.

```text
"we accept up to 4 hours of annual unavailability in support
 systems; zero in payment systems"
"we accept single-supplier dependency where the exit cost
 is under six months"
"we accept no system with fewer than three people
 able to change it"
```

A declared appetite turns recurring arguments into checks. See
[cost vs. reliability](/20-trade-offs/cost-vs-reliability.md).

### Knowledge risks are the most underestimated

```text
number of people able to change a system
number able to operate it during an incident
time to train a replacement
average tenure of the team maintaining it
```

Those numbers are rarely measured, and they are the origin of a class of crisis that has no fast
solution: when the risk materializes, there is no way to buy the competence back.

See the [modernization case study](/21-case-studies/legacy-modernization-case.md), where the
knowledge risk — nine people, six retiring — was what motivated a seven-year project.

### Review on a cadence, with the number

```text
quarterly   for the high-exposure risks
annual      for the complete register
by event    when something changes materially
```

The review has to reassess probability and impact, not just confirm that the risk exists. A risk
whose probability has dropped should be downgraded or closed — and a register that only grows loses
usefulness.

## Mental Model

**Named with a consequence, quantified, with an owner who can act.** And formally accepting is a
legitimate response, better than leaving it open.

## When to Use

- For architectural risks with significant exposure.
- With a quarterly review of the high ones and an annual review of the whole set.
- With risk appetite declared, to avoid constant renegotiation.

## When Not to Use

**As an abstract category.**

**With no owner who can act.**

**With no quantification**, however rough.

**As a compliance spreadsheet** nobody reads.

**With no option of formally accepting.**

**Registering everything** — a register with 60 risks prioritizes nothing.

## Alternatives

- **Threat modeling** — for security risks, with its own method. See
  [threat modeling](/10-security/threat-modeling.md).
- **A pre-mortem analysis** — imagining the project failed and listing the causes; cheap and
  effective for discovering risks formal analysis doesn't find.
- **An error budget** — for availability risk, more operational and more actionable. See
  [reliability](/12-reliability/reliability-basics.md).
- **Failure exercises** — discovering risks by running, not by listing.

The second is underrated: a one-hour pre-mortem with the team usually produces more real risks than a
quarter of formal registering.

## Trade-offs

| An extensive register | Few risks |
|---|---|
| Coverage | Real prioritization |
| Nothing gets handled | Gaps |

| Mitigate | Formally accept |
|---|---|
| Reduces exposure | Zero cost, explicit decision |
| Consumes capacity | The risk stays |

## Failure Modes

**A known and unregistered risk.** It materializes, and somebody knew.

**A register with no owner.** Nobody acts.

**Everything in amber.** No prioritization possible.

**No quantification.** Impossible to order.

**Accepted by omission.** No decision, no review.

**Knowledge risks ignored.** They have no fast solution when they occur.

## Common Mistakes

**Naming categories** instead of consequences.

**Assigning the risk to architecture**, which cannot act.

**Not measuring** how many people know how to operate each system.

**Not declaring an appetite**, renegotiating each case.

**A register that only grows**, with no closure of superseded risks.

## Real-World Example

An energy company with 90 engineers maintained an IT risk register with 74 items, updated annually
for an audit. None had a number, and 68 were classified as medium.

An incident forced the review: the billing system was unavailable for 31 hours after a disk failure,
because the restore had never been tested and the documented procedure was out of date. Estimated loss
of $840k.

The risk was on the register, with the text: "continuity risk in critical systems". Medium.

The rework:

**Risks rewritten with a consequence and a number.** The 74 became 23 once the generic ones were
eliminated or merged, and each got a justified probability and an estimated impact.

**Ordering by exposure.** The 23 were ordered, and the first six concentrated around 80% of the total
estimated exposure.

**A named owner**, always someone with the capacity to act — in 19 cases, area managers; in 4,
leadership.

**A declared appetite**, in four statements:

```text
a restore tested quarterly in every critical system
a minimum of three people able to operate each critical system
no supplier dependency with an exit cost above
  12 months in a critical system
accepted annual unavailability: 4 h in support systems,
  30 min in billing and customer service
```

**Formal acceptance** for five risks, with an owner, a date and a review trigger. One of them: the
dependency on a meter reading supplier, accepted until 2029 because there is no technical alternative
in the market, with an annual review and market monitoring.

**A quarterly review of the six largest**, with probability and impact reassessed.

Results after 18 months:

```text
risks in the register                     19 (23 initial, 7 closed,
                                          3 new)
risks with an active owner                19
restores tested                           100% of critical ones, quarterly
systems with fewer than 3 operators       from 11 to 2
risks formally accepted                   5, all reviewed on schedule
high-exposure incidents                   1 (against 4 in the previous period)
```

The two systems that still have fewer than three operators are registered with a training plan under
way and a date.

The lesson that stuck: the item that changed behavior most was the declared appetite. Before, every
discussion about investing in resilience was negotiated in isolation; afterwards, it became a check
against an already-agreed number — and the discussions went from negotiation to observation.

And the exercise of rewriting the risks with a consequence and a number revealed that 51 of the
original 74 described nothing verifiable. They gave the impression of coverage and informed no
decision at all.

## Related Concepts

- [Decision Making](/23-architecture-leadership/decision-making.md).
- [Cost Management](/23-architecture-leadership/cost-management.md).
- [Cost vs. Reliability](/20-trade-offs/cost-vs-reliability.md).
- [Threat Modeling](/10-security/threat-modeling.md).

## Practical Exercise

List the architectural risks in your context that everybody knows about and that are recorded
nowhere.

For each one, write the consequence with a number and the name of whoever could act. That list tends
to be more useful than any existing formal register.

## Interview Questions

- Why does architectural risk materialize differently from project risk?
- Why is formally accepting better than leaving a risk open?
- Why do knowledge risks have no fast solution?

## Further Reading

- Hubbard, Douglas. *The Failure of Risk Management*. 2nd ed. Wiley, 2020.
- Taleb, Nassim. *Antifragile*. Random House, 2012.
- Beyer, Betsy et al. *Site Reliability Engineering*. O'Reilly, 2016.

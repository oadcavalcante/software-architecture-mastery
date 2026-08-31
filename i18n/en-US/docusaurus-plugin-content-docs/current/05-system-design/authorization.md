---
id: authorization
title: Authorization
sidebar_position: 18
description: Deciding what each identity can do — and where that decision is made and enforced.
doc_type: concept
level: 3
difficulty: intermediate
status: complete
objective: >
  By the end, the reader chooses the appropriate authorization model and enforcement point,
  and knows why checking only in the interface is insufficient.
prerequisites: [authentication]
related: [authentication, service-boundaries, authz-models]
canonical_for: []
translated_from_version: 1
last_reviewed: 2026-08-31
---

# Authorization

## Overview

Authorization answers **what this identity can do**. It presupposes
[authentication](/05-system-design/authentication.md) is settled.

The system decision is where the permission rule lives and where it is enforced — and the most
common wrong answer is "in the interface".

## Problem

Authorization starts simple — an administrator can do everything, a user can do their own — and
grows predictably.

Then comes "a manager can see the orders in their region". Then "the owner can edit, but only
before approval". Then "finance can approve up to an amount, above that it needs a director".

Each rule is added wherever is most convenient: an `if` in the controller, a condition in the
query, a check in the screen. In the end, the rule of who can do what exists nowhere — it is
scattered, and nobody can answer "who can approve a 50 thousand expense?" without reading the
system.

## Core Concepts

### The models, in order of expressiveness

**By role.** The user has roles; roles have permissions. Simple, and it explodes when the rules
depend on context — you get `south_region_manager`, `south_region_manager_readonly`, and the
combinatorics grow.

**By attribute.** The decision considers attributes of the user, of the resource and of the
environment: *can edit if they are the owner, the order was not approved, and it is business
hours*. Expressive and harder to audit.

**By relationship.** The permission derives from relations between entities: *can see the
document because it belongs to the folder that belongs to the team they are a member of*.
Suitable for hierarchies and for sharing.

Most systems start with roles and need attributes sooner than they expect. The sign is the
appearance of roles with a context suffix.

### Where the decision is made

Separating two roles helps:

**Decision point** — where the rule is evaluated. It can be an embedded library, a dedicated
service, or the domain itself.

**Enforcement point** — where the decision is applied. Gateway, service, or the database query.

Centralizing the decision gives auditability and uniformity. Distributing it gives lower latency
and independence. Mature systems usually centralize the **policy** and distribute the
**evaluation**.

### The interface is not an enforcement point

Hiding a button is not authorization — it is interface convenience.

Every check has to happen on the server, on each operation. The interface hides what the user
cannot do so as not to frustrate them; the server prevents it.

That seems obvious and it is the most common authorization failure in audits: an endpoint that
was only called by a restricted screen, and that nobody protected because "only the
administrator sees the button".

### Authorization in listings is different

Checking an operation on a resource is straightforward. Listing **only what the user can see** is
another problem.

Filtering after fetching is wrong: pagination breaks — the page of 20 becomes 7 — and the
database works for nothing.

The rule has to go into the query. That means authorization is not purely an outer layer: it
participates in data access, and it is the reason centralizing it completely is hard.

### Authorization belongs to the domain

"A shipped order cannot be cancelled" looks like authorization and is a business rule. It belongs
to the [aggregate](/04-domain-driven-design/aggregate.md), not to a permission service.

The useful separation: **permission** is about who — roles, attributes, relations. **Business
rule** is about the resource's state. Mixing the two spreads the domain into the authorization
mechanism.

## Mental Model

**Two questions: does this identity have permission, and does this resource admit the
operation?** The first is authorization; the second is domain.

## When to Use

- Any system with more than one type of user.
- Data that belongs to someone.
- Operations with different consequences per profile.
- An audit requirement about who could do what.

## When Not to Use

**An attribute model when roles suffice.** Expressiveness with no need makes auditing harder.

**A centralized authorization service in a small system.** A network call per check, for rules
that would fit in a library.

**Checking only at the edge.** The gateway does not know the resource; it can check a role, not
ownership.

**Checking only in the interface.** That is not a check.

**Authorization carrying business rules.** They belong to the domain.

## Alternatives

- **Checking in the domain** — when the rule depends on the resource's state.
- **Filtering in the query** — for listings.
- **Embedded library** — a declared policy, evaluated locally. It avoids the network call.
- **Dedicated service** — when there are many services and the policy has to be single.

## Trade-offs

| Centralized | Distributed |
|---|---|
| A single, auditable policy | Each service decides |
| One call per check | Local evaluation |
| Single point of failure | Independent |
| Hard for listings | Natural in the query |
| Policy change in one place | Coordination between services |

| By role | By attribute |
|---|---|
| Simple to understand and audit | Expressive |
| Explodes with context | Absorbs context |
| Easy to answer "who can do X" | Requires evaluating the policy |

## Failure Modes

**An unprotected endpoint.** Only the screen restricted it.

**Insecure direct reference.** Changing the identifier in the URL accesses someone else's
resource — the server checked the role and not ownership.

**Filtering after fetching.** Inconsistent pagination and wasted work.

**Role explosion.** Dozens of roles with context suffixes.

**A permission that is never removed.** Users accumulate access when they change roles.

**Silent denial.** The system hides instead of denying, and the user does not understand why they
cannot see something.

## Common Mistakes

**Trusting the interface.**

**Checking the role and not ownership.** It is the origin of the insecure reference.

**Filtering in memory.**

**Mixing business rules with permissions.**

**Not auditing granted access.** With no record, "who could do what on such a date" has no
answer.

## Real-World Example

An electronic health record system used roles: `doctor`, `nurse`, `administrative`, `patient`.

An audit found two problems.

**Insecure reference.** The `GET /records/{id}` endpoint checked whether the user had the
`doctor` role. Any doctor in the hospital could read any patient's record, including from other
specialties and units — which violated the minimum-access rule required by regulation.

The role was right; the relationship was missing. The doctor should only see the records of
patients under their care.

**Listing filtered in memory.** The search fetched every record and filtered afterwards. Beyond
the waste, pagination was inconsistent: a page of 20 could show 3.

The fixes.

The model went from role to relationship: the permission derives from an active care relationship
existing between the professional and the patient. Roles still exist for what is genuinely by
profile — who can prescribe, who can discharge.

The ownership check went into every operation on an identified resource, and the listing started
filtering in the query, by the relationship.

And an audit log of every record access was added, with who, when and through which relationship
— a regulatory requirement that was not being met.

What makes the case instructive: the system had authorization, and it was checking the wrong
question. A role answers "what kind of thing you can do"; a relationship answers "on which
resource".

## Related Concepts

- [Authentication](/05-system-design/authentication.md) — the prerequisite.
- [Service Boundaries](/05-system-design/service-boundaries.md) — where to enforce.
- [Security](/10-security/index.md) — models, least privilege and auditability.
- [Aggregate](/04-domain-driven-design/aggregate.md) — where the business rule lives.

## Practical Exercise

Pick an endpoint that receives a resource identifier. Authenticate as one user and try to access
another's resource by changing the identifier.

If it works, you found an insecure direct reference — the most common authorization failure and
the easiest to exploit.

## Interview Questions

- What is the difference between checking a role and checking ownership?
- Why is filtering results in memory a problem?
- What distinguishes authorization from a business rule?

## Further Reading

- OWASP — *Authorization Cheat Sheet* and the broken access control category.
- NIST SP 800-162 — attribute-based access control.

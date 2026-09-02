---
id: authz-models
title: Authorization Models
sidebar_position: 16
description: By role, by attribute, by relationship — and the criterion for choosing, which is rarely discussed.
doc_type: tradeoff
level: 5
difficulty: advanced
status: complete
objective: >
  By the end, the reader chooses the authorization model from the shape of the
  domain's rules, not from familiarity.
prerequisites: [identity]
related: [least-privilege, identity, secure-boundaries]
canonical_for: []
translated_from_version: 2
last_reviewed: 2026-08-31
---

# Authorization Models

## Overview

Authorization answers: **may this requester perform this action on this resource?**

Three models dominate, and they are not equivalent alternatives — each expresses a different shape of rule
well:

```text
by role         "managers may approve"
by attribute    "may approve if the amount is below their limit"
by relationship "may edit because they own the document"
```

Choosing the wrong one produces a system that either cannot express the rule, or expresses it in a way
nobody can maintain.

## Problem

The role model is the best known, and so it is adopted by default.

It works well until the first rule that depends on context: "may approve, but only up to two thousand
dollars", "may view, but only those from their own branch", "may edit, but only if they are the author".

The common way out is creating more specific roles — `branch_manager_sp_up_to_10k` — and the number of
roles explodes. You reach hundreds, nobody knows what each one does, and granting access becomes guesswork.

That is not an implementation failure. It is the model being used to express something it does not express.

## Core Concepts

### By role

Permissions are grouped into roles; users receive roles.

```text
user → role → permissions
```

**Where it works well:** organizations with stable and well-defined functions, rules that do not depend on
the specific resource, and a need to review access by function.

**Where it breaks:** when the permission depends on something beyond who the user is — a resource
attribute, the request's context, the relationship between the two.

The sign that it broke is the explosion of roles. If you have more roles than real functions in the
organization, the model is being forced.

### By attribute

The decision is a function of attributes of the user, the resource, the action and the environment.

```text
allow if
  user.department == resource.department
  and user.limit >= resource.amount
  and environment.time within business hours
```

**Where it works well:** rules that depend on context, conditions combining several dimensions, and
policies that need to change without altering code.

**Where it costs:** the decision needs all the attributes available at evaluation time — which means
fetching them, with latency and the possibility that they are stale.

And debugging "why was this access denied?" is significantly harder than in the role model.

### By relationship

The decision derives from relationships between entities, traversed as a graph.

```text
user is an editor of the document
document is in folder X
user is a viewer of folder X → inherits view access to the documents
```

**Where it works well:** sharing, resource hierarchies, permission inheritance, collaboration. It is the
model of shared file systems and collaborative tools.

**Where it costs:** it requires its own infrastructure — a relationship store and a traversal engine. And
the two listing questions do not cost the same. "Who has access to this document?" runs with the index,
which is organized by object, though it does require recursively resolving the usersets the answer refers
to. "Which documents does this person see?" runs against the index: it is the direction the original paper
does not cover, and the one systems derived from it added later with an inverted index of their own. If the
product needs listing filtered by user — and collaboration products almost always do — that is the cost to
budget for, not the check.

### The choice criterion

The question is not "which is best?". It is **what does the permission depend on?**

```text
only on who the user is                → role
on resource or context attributes      → attribute
on a relationship between them         → relationship
```

Most real systems need more than one. The usual combination: roles for coarse permissions — who may access
the administrative area — and relationship or attribute for the fine ones — which records specifically.

Trying to express everything in a single model is the origin of both the role explosion and unreadable
attribute policies.

### Separate the decision from the enforcement

Regardless of the model, one structural separation pays off when more than one service enforces the same
policy, or when the policy changes more often than it is deployed. In a single service with a stable
policy, decision and enforcement in the same process is the right design — and the [canonical document on
authorization](/05-system-design/authorization.md) treats a centralized authorization service in a small
system as a case for not using it.

**A decision point.** It evaluates the policy and answers allowed or denied.

**An enforcement point.** It asks and obeys.

That allows changing policy without touching each service, and auditing decisions in one place.

The risk is the latency of one call per check. Practical implementations trade that latency for **local
evaluation**: the policy is distributed to the services and evaluated in memory, with periodic refresh.

The trade has a price, and it is the same one the section on stale attributes describes, one level up. A
revocation only takes effect at the next refresh, and the propagation window becomes a number that has to
be known and stated — from seconds to minutes, depending on the mechanism. If distribution stalls, the
services keep deciding, and they decide on a stale policy without anything failing: it is the design's
silent failure mode, which is why the policy's age in each service has to be observable.

### Authorization belongs to whoever holds the resource

It is worth repeating, because it is the most common structural mistake: a service that accepts `user_id`
from the caller and trusts it has delegated authorization to whoever asks.

The decision needs to be made by whoever holds the resource, based on the token's verified identity — never
on a parameter. See [secure boundaries](/10-security/secure-boundaries.md).

### Deny by default

The policy should be: nothing is allowed unless a rule allows it.

The opposite — allow except on explicit denial — means a forgotten rule opens access instead of closing it.
See [security failure modes](/10-security/security-failure-modes.md).

## Mental Model

**The authorization model should have the shape of the domain's rules.** Forcing the rule into the wrong
model produces complexity nobody can maintain.

## When to Use

- **Role:** stable organizational functions, coarse permissions, a need for review by function.
- **Attribute:** context-dependent rules, limits, combined conditions.
- **Relationship:** sharing, hierarchy, collaboration, inheritance.
- **A combination:** role for the coarse, relationship or attribute for the fine — the most common design.

## When Not to Use

**Role for context-dependent rules.** The explosion is certain.

**Attribute for everything.** Unreadable policies that are hard to debug.

**Relationship with no infrastructure.** Implementing graph traversal by hand on a relational database
scales badly.

**Relationship for authorization that is not about sharing.** If nobody grants access to anybody — if the
permission comes from who the person is or where they are — the graph is a structure with no interesting
edges, and the infrastructure costs without delivering.

## Alternatives

- **An access control list** — direct permissions per resource. Simple, and it does not scale in number of
  resources.
- **Authorization in the database** — row-level security, enforced by the store. Strong, and it ties the
  policy to the database.
- **Capabilities** — the token carries the permission for a specific resource. Elegant for cases like
  sharing links.
- **A dedicated authorization service** — when the policy is complex and shared among many services.

## Trade-offs

| Role | Attribute | Relationship |
|---|---|---|
| Predicting the outcome: read the role | Predicting the outcome: simulate the policy | Predicting the outcome: walk the graph |
| What the decision needs to know: who you are | What the decision needs to know: the context | What the decision needs to know: the relationships |
| Review by function is easy | Review is hard | Listing by user is expensive |
| No data fetching | Needs the attributes | Needs the graph |
| Stable | Changes with no code | Changes with the data |

| A centralized decision | Checks in the code |
|---|---|
| Policy in one place | Scattered |
| Uniform auditing | Difficult |
| Latency or distribution | None |
| Change with no deployment | Requires deployment |

## Failure Modes

**A role explosion.** Hundreds, with no clear meaning.

**An unreadable attribute policy.** Nobody can predict the outcome.

**A check forgotten** on a new endpoint.

**Authorization by a caller's parameter.**

**A permission granted and not reviewed.** See [least privilege](/10-security/least-privilege.md).

**Stale attributes.** The decision uses an old value.

**A denial with no logging.** A systematic attempt is not detected.

## Common Mistakes

**Choosing by familiarity.** Role is the model everyone knows, so the context-dependent rule becomes yet
another role — and that is how you get to 214 roles, as in the Real Example.

**Creating roles to express context.**

**Scattering checks through the code.** A new endpoint forgets the check, and nothing fails: the route
works, and nobody notices until someone accesses what they should not.

**Allowing by default.** The misconfiguration becomes silent, and the absence of a rule becomes
permission. Denying by default makes the same mistake show up as a support ticket.

**Not logging denials.**

**Being unable to answer "who has access to this?"** — a question every audit asks.

## Real-World Example

A document management platform started with role-based authorization: three roles — administrator, editor,
reader.

As the customers grew, the rules got specific:

"The editor may edit only documents from their own area." "The reader may view documents shared with them."
"Documents in human resources folders require a specific role." "The author may always edit, regardless of
the area."

The response was creating roles: in three years there were **214 roles**, with names like
`legal_editor_contracts_read_hr`.

The resulting problems:

**Granting by guesswork.** Nobody knew which role to give. The practice became copying a similar
colleague's roles — which spread improper permissions.

**Impossible auditing.** The question "who can view this contract?" had no answer without inspecting the
214 roles.

**Contradictory rules.** Two of the same user's roles gave opposite answers, and the behavior depended on
the evaluation order.

**Scattered checks.** The logic was in 60 places in the code, with slightly different implementations. A
new endpoint forgot the check and exposed documents for two months.

The reformulation used two models:

**Role for coarse permissions.** Four roles, corresponding to real functions: organization administrator,
member, guest, auditor. They decide what the person can do in the product.

**Relationship for fine permissions.** Who can view which document came to derive from relationships — they
are the author, it was shared with them, they are a member of the folder, they are a member of the area
containing the folder.

**A single decision point**, with the policy distributed and evaluated locally in the services. The 60
checks became one standardized call.

**Logging of every decision**, allowing answers to "who has access to this?" and "why was this access
denied?".

Result: 214 roles became 4, and the rules the roles were trying to express came to be relationships — which
is what they always were.

The point the team underlines: none of the 214 roles was created by mistake. Each one solved a legitimate
need, with the only mechanism available. The mistake was one level up — in the model chosen in the first
month, for a product whose rules did not exist yet.

## Related Concepts

- [Least Privilege](/10-security/least-privilege.md) — the principle.
- [Identity](/10-security/identity.md) — the previous question.
- [Secure Boundaries](/10-security/secure-boundaries.md) — where the decision is enforced.
- [Authorization](/05-system-design/authorization.md) — the system design level.

## Practical Exercise

List your system's five most complex authorization rules and classify each one: does it depend on who the
user is, on attributes, or on a relationship?

If most are relationships and you use roles, you have a role explosion forming.

## Interview Questions

- What is the criterion for choosing among the three models?
- What is the sign that the role model is being forced?
- Why does authorization belong to whoever holds the resource?

## Further Reading

- Hu, Vincent C. et al. *Guide to Attribute Based Access Control (ABAC) Definition and Considerations*.
  NIST SP 800-162, 2014.
- Pang, Ruoming et al. *Zanzibar: Google's Consistent, Global Authorization System*. USENIX ATC, 2019.
- Sandhu, Ravi et al. *Role-Based Access Control Models*. IEEE Computer, 1996.

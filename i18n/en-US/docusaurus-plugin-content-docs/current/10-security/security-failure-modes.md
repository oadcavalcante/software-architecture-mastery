---
id: security-failure-modes
title: Security Failure Modes
sidebar_position: 15
description: How a system fails when it fails — and why failing closed needs to be a conscious decision.
doc_type: concept
level: 5
difficulty: advanced
status: complete
objective: >
  By the end, the reader explicitly decides each control's behavior under failure,
  instead of discovering it during the incident.
prerequisites: [secure-boundaries]
related: [secure-boundaries, auditability, authz-models]
canonical_for: []
translated_from_version: 1
last_reviewed: 2026-08-31
---

# Security Failure Modes

## Overview

Every security control can fail: the authorization service becomes unavailable, the token verification
expires without being able to fetch the key, the policy does not load.

The question that needs to be answered **before** that happens: when the control fails, is access denied or
granted?

```text
fail closed   deny — security preserved, availability lost
fail open     grant — availability preserved, security lost
```

Most systems never decide that. They discover the behavior during the incident, and it is usually the worse
of the two.

## Problem

The behavior under failure is rarely written down. It emerges from the implementation:

An exception handling block that returns `true` so as not to break. A cache that serves the last known
policy indefinitely. A timeout that returns empty, and logic that interprets empty as "no restrictions".

None of those was decided. All of them become security policy at the moment something fails.

And the language's default is usually generous: an empty permission list, a check that does not run, a
swallowed exception — they almost always result in allowing.

## Core Concepts

### The choice depends on what is protected

There is no universal answer, and presenting it as "always fail closed" is simplistic.

```text
financial transaction authorization   closed — refusing is acceptable
public catalog reads                  open — unavailability is the damage
a physical door lock                  it depends: fire versus intrusion
rate limiting                         open — degrading is not worth stopping
token verification                    closed — no exception
second factor verification            closed
```

The criterion: **which damage is greater, denying legitimate access or granting improper access?**

For most authorization controls, denying is the lesser damage. For abuse protection controls, frequently
not.

### Safe degradation instead of binary

The choice does not always have to be between everything and nothing.

When the policy service becomes unavailable, some intermediate responses:

**Serve the cached policy**, with a maximum age. It preserves operation with limited risk.

**Allow read operations, deny writes.** The damage from an improper read is usually smaller.

**Allow what was already authorized, deny new grants.**

**A restricted mode** — only the essential operations, for everybody.

Those options are better than either extreme, and they require having been designed.

### The cache needs a maximum age

Serving a cached policy is reasonable for minutes and dangerous for days.

A cache with no maximum age turns "fail closed" into "fail open with a delay": revoking somebody's access
has no effect while the cache serves the old policy.

Every security decision cache needs a maximum lifetime, and the behavior after it needs to be explicit.

### Bypassable controls

A control that can be avoided through another path is not a control.

The recurring cases:

**Validation only in the interface.** The API accepts what the screen prevents.

**A check at the gateway.** The service is reachable through another route.

**Authorization on reads, absent on exports.** The report brings what the screen hides.

**A rule in the code, absent in the database.** A fix script bypasses everything.

See [secure boundaries](/10-security/secure-boundaries.md). The test is always: **is there another path to
the same effect?**

### A silent failure is the worst

A control that fails and gives no warning is worse than one that fails loudly.

```text
a loud failure     an error, an alert, somebody investigates
a silent failure   the system keeps working, without the protection
```

Real examples: a signature check that returns true when it cannot fetch the key; a sensitive-data filter
that does not run because of a configuration error; a firewall rule that was not applied.

Every relevant control needs a signal — a metric of how many times it ran, an alert if it stops running. A
control with no metric is a control you do not know whether you have.

### An error message is surface

A message that distinguishes "the user does not exist" from "wrong password" allows enumeration. One that
returns a stack trace reveals internal structure. One that says "access denied to resource 4711" confirms
the resource exists.

The rule: security errors should be **generic on the outside and detailed in the log**. See
[auditability](/10-security/auditability.md).

And the response time leaks too: a check that returns faster when the user does not exist is enumerable
even with an identical message.

## Mental Model

**The behavior under failure is security policy.** If you did not decide it, it was decided by an exception
handling block.

## When to Use

Deciding explicitly is necessary for every control. Priority when:

- The control depends on an external service.
- There is a decision cache.
- The system has multiple paths to the same effect.
- Unavailability has a high cost — the temptation to fail open is greater.

## When Not to Use

**Failing open in authorization** with no recorded decision.

**A policy cache with no maximum age.**

**A control with no metric.**

**A detailed error message** on the outside.

**"Always closed" as a blind rule.** For rate limiting and abuse protection, it is frequently the wrong
choice.

**Generic exception handling** around a security check.

## Alternatives

- **Graduated degradation** — instead of binary.
- **A short-lived cache** — a middle ground between availability and revocation.
- **Local policy evaluation** — it removes the network dependency from the decision. See
  [authorization models](/10-security/authz-models.md).
- **Redundancy of the policy service** — it treats the cause instead of the symptom.

## Trade-offs

| Fail closed | Fail open |
|---|---|
| Security preserved | Lost |
| Unavailability | Continuity |
| A visible incident | Silent |
| Pressure to work around | None |

| A long cache | Short |
|---|---|
| Resists unavailability | Less |
| Delayed revocation | Fast |

## Failure Modes

**A swallowed exception returning allowed.**

**A cache serving a revoked policy.**

**A control bypassable through another path.**

**A silent failure.** The protection vanished and nobody knew.

**Failing closed with no plan.** The system stops and nobody understands why.

**A workaround created under pressure.** Failing closed with no plan leads somebody to disable the control
during the incident — and not to re-enable it.

**An error message leaking information.**

## Common Mistakes

**Not deciding the behavior under failure.**

**Generic exception handling around checks.**

**A cache with no maximum age.**

**Not instrumenting the control.**

**Not testing the failure path.**

**Not anticipating the procedure** for when the control fails closed.

## Real-World Example

A healthcare platform had a central authorization service consulted by twelve applications.

During a 25-minute outage of that service, the observed behavior was inconsistent — because each
application had implemented the handling on its own:

**Four applications failed closed.** They stopped completely. Correct, and nobody had anticipated it: there
was neither communication nor a procedure, and support received calls without knowing what to say.

**Five failed open.** They kept operating without checking authorization. For 25 minutes, any authenticated
user accessed any record. The later audit found 340 accesses that would have been denied — most out of
curiosity, two by people accessing acquaintances' medical records.

**Three served a cache.** Two with a 5-minute age — appropriate behavior. One with an indefinite cache,
which was serving a policy from three weeks earlier, including already-revoked accesses.

The most serious case: one of the five that failed open had exception handling like this — catch any error
and return allowed, with a comment saying "do not block the user if the service is unstable". Written two
years earlier, by somebody no longer at the company.

The fixes:

**Behavior decided per control**, documented, with the damage on each side assessed:

```text
authorization for medical record access   closed
reading the test catalog                  a 15-min cache, then closed
rate limiting                             open
second factor                             closed
```

**A single library** for checking, with the behavior implemented once, instead of twelve times.

**A mandatory cache age**, a maximum of 15 minutes.

**A metric per control** — how many checks per minute, and an alert if it drops to zero. That would have
detected the five applications' silent failure in two minutes.

**A procedure and communication** for the fail-closed case, including a message to the user.

**Testing the failure path** in the periodic exercises.

In retrospect: none of the twelve applications had decided the behavior. All of them inherited it from
whoever wrote the exception handling — and in the worst five, that person had prioritized availability
without knowing they were making a security decision.

## Related Concepts

- [Secure Boundaries](/10-security/secure-boundaries.md) — the bypassable controls.
- [Authorization Models](/10-security/authz-models.md) — deny by default.
- [Auditability](/10-security/auditability.md) — the log that reveals it.
- [Reliability](/12-reliability/index.md).

## Practical Exercise

Choose your system's most critical authorization control and turn off its dependency in a test environment.

What happens is your current failure policy — decided or not.

## Interview Questions

- What is the criterion for choosing between failing closed and open?
- Why is a silent failure worse than a loud one?
- Why does a policy cache need a maximum age?

## Further Reading

- Saltzer, Jerome; Schroeder, Michael. *The Protection of Information in Computer Systems*, 1975 — the
  principle of safe defaults.
- OWASP. *Error Handling Cheat Sheet*.
- Beyer, Betsy et al. *Site Reliability Engineering*. O'Reilly, 2016.

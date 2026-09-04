---
id: configuration
title: Configuration
sidebar_position: 19
description: What varies between environments — and why making something configurable is a decision, not a default.
doc_type: concept
level: 3
difficulty: beginner
status: complete
objective: >
  By the end, the reader separates configuration from secrets and from code, and recognizes
  when a configuration point should not exist.
prerequisites: [components]
related: [secrets, environment-management, feature-flags]
canonical_for: []
translated_from_version: 2
last_reviewed: 2026-08-31
---

# Configuration

## Overview

Configuration is what changes between environments or between runs without changing the code: the
database address, the pool size, a timeout, an integration key.

The question this document answers is not how to store configuration. It is **what should be
configurable** — because every configuration point is a parameter to document, test and get
wrong.

## Problem

Making something configurable looks prudent and has a compounding cost.

Each parameter multiplies the space of possible states. Ten boolean parameters are a thousand
combinations, and no team tests a thousand combinations. The ones that run in production are the
ones somebody configured; the rest were never exercised.

The late symptom: a configuration file with 80 entries, 60 of which have had the same value in
every environment since they were created. They are not configuration — they are code with a
layer of indirection.

**Configuration is for what actually varies.** The rest is a constant.

## Core Concepts

### Three categories, three treatments

| | What it is | Where it lives |
|---|---|---|
| **Constant** | Does not vary between environments | In the code |
| **Configuration** | Varies between environments | Environment variable or configuration service |
| **Secret** | Configuration that cannot leak | A vault, injected at runtime |

A secret is configuration with an additional requirement: never in a repository, never in logs,
rotatable. See [secrets](/10-security/secrets).

The frequent error is treating the three the same — constants become unnecessary configuration,
and secrets become environment variables in a versioned file.

### An environment variable is the reasonable default

Simple, supported on any platform, and it separates configuration from the artifact — the same
binary runs in any environment.

The limitations appear when: the configuration has to change without restarting; there is nested
structure; or the volume grows to the point where the list becomes unmanageable.

That is where a configuration service comes in — which solves that and adds a dependency on the
startup path.

### Fail fast at startup

Invalid configuration should take the process down **at startup**, not on the first request that
uses it.

Validating everything at startup — presence, type, range — turns a production error into a
container that does not start. The difference is between a deployment that fails visibly and a
system that works until someone accesses the specific feature.

A dangerous default value is worse than absence: a timeout that assumes 30 seconds because nobody
configured it hides the problem until the wrong moment.

### Runtime reloading has a cost

Configuration that changes without restarting is attractive and introduces two things: the system
comes to have configuration state that can diverge between instances, and the change stops going
through the deployment process — which means less review and less trace.

It is worth it for what needs to change fast — log level, feature flags. It is not worth it for
what changes rarely.

See [feature flags](/14-devops-and-platform/feature-flags), which is a specific case with its own
tooling.

### Configuration is not an extension point

A system that tries to absorb every future variation through configuration becomes a badly
documented generic engine. It is the degeneration of a
[supporting subdomain](/04-domain-driven-design/supporting-domain.md).

The test: how many distinct values has this parameter ever had? If it was always one, it was not
capturing variation.

## Mental Model

**For each parameter: how many distinct values does it have today, across all environments?** If
it is one, it is a constant in disguise.

## When to Use

- The value genuinely differs between environments.
- The value has to be adjusted without a new build — capacity, timeout.
- It is a secret, and cannot be in the code.
- It is a credential or the address of an external dependency.

## When Not to Use

**For what does not vary.** A constant in the code is more readable and cannot be misconfigured.

**Anticipating variation.** See [YAGNI](/02-software-design/yagni.md).

**For business rules.** A rule in a configuration file sits outside the domain, with no tests and
no review.

**With a default value that masks absence.** Better to fail.

**For what changes on every request.** That is a parameter, not configuration.

## Alternatives

- **A constant in the code** — for what does not vary.
- **A configuration service** — when the volume or the reloading justifies it.
- **A secrets vault** — for credentials.
- **A feature flag** — for temporary behavior variation.

## Trade-offs

| More configurable | Less configurable |
|---|---|
| Adjustment with no new build | Requires a deployment |
| The same artifact in every environment | An artifact per environment |
| Larger state space | Predictable behavior |
| More to document and validate | Less surface |
| Risk of wrong configuration in production | No such risk |

## Failure Modes

**Missing configuration with a dangerous default.** It works until it does not.

**Divergence between environments.** Staging and production with different values nobody
compared.

**A secret in the repository.** Once committed, it is in the history forever.

**A secret in the logs.** A configuration dump at startup leaks everything.

**Configuration divergent between instances.** With reloading, one instance updated and another
did not.

**Orphan parameter.** Nobody knows what it does or who uses it.

## Common Mistakes

**Not validating at startup.** The wrong configuration only manifests when the path that uses it
is exercised — sometimes weeks later, in production, in a rare flow. Validating everything at
startup converts that into an immediate, visible failure.

**A default for what should be mandatory.** A default value for a database address or an
integration key makes the service start pointing at the wrong place instead of refusing to start.

**Logging configuration without masking.** The configuration dump at startup is a common and
useful practice — and it takes passwords and keys into the logging system, which usually has long
retention and broader access than the secret's.

**Putting business rules in configuration.** A rule in a configuration file escapes code review,
testing and history. What looked like flexibility becomes a behavior change with no trace.

**Not removing parameters that stopped being used.** They remain as a trap: someone adjusts a
value expecting an effect, gets none, and spends hours investigating the wrong place.

## Real-World Example

A system had 94 configuration parameters accumulated over four years.

An audit compared the values across the three environments and cross-referenced with usage in the
code.

**61 had the same value in every environment** since creation. They were constants with
indirection.

**Seven were not read by any code.** Leftovers from removed features.

**Four had a default value that masked absence.** One of them was an integration's timeout: if the
variable was missing, it assumed 60 seconds. During an environment migration, it was missing, and
the 60-second timeout — against the expected 5 — held connections until the pool was exhausted.
The incident lasted 25 minutes.

**Three were secrets in a versioned file.** Mandatory rotation, and the repository's history had to
be dealt with.

The cleanup left 23 parameters. The 61 became constants, the 7 were removed, the 4 dangerous
defaults became mandatory with validation at startup, and the secrets moved to the vault.

The most valuable change was the validation: the process now fails to start if any mandatory
configuration is missing or out of range. The error that cost 25 minutes would become a container
that does not start — visible on the first deployment attempt.

## Configuration in containers

Containers change two premises about configuration, and ignoring that produces specific problems.

**The same artifact runs in every environment.** The image is built once and promoted. That means
**no environment configuration can be in the image** — no file, no value baked into the build. If
the staging image is different from production's, what was tested is not what was deployed.

**The file system is ephemeral.** Configuration written to disk on first use vanishes in the next
container.

The forms that work: an environment variable injected at runtime, a file mounted by the platform,
or a query to a configuration service at startup.

Secrets deserve separate treatment. An environment variable is convenient and leaks easily: it
appears in a process dump, in inspection tools, and in the startup log that records the
environment. Where the platform offers mounting a secret as a file with restricted permissions,
that is preferable.

And there is a detail that causes incidents: **the platform may limit the size** of the injected
configuration. Configuration that grows until it exceeds the limit produces a container that does
not start, with a message that does not mention configuration.

## Related Concepts

- [State Management](/05-system-design/state-management.md) — configuration is startup state.
- [Security](/10-security/index.md) — secrets management.
- [DevOps and Platform](/14-devops-and-platform/index.md) — environments and feature flags.
- [YAGNI](/02-software-design/yagni.md) — speculative configuration.

## Practical Exercise

List your system's configuration parameters and, for each one, compare the value across
environments.

The ones with the same value everywhere are candidates for constants. The ones that appear in no
code are junk. The ones with a silent default are the next incident.

## Interview Questions

- What distinguishes a constant, configuration and a secret?
- Why validate configuration at startup?
- Why can a default value be worse than absence?

## Further Reading

- Wiggins, Adam. *The Twelve-Factor App*, 2011 — the configuration factor.
- OWASP — *Secrets Management Cheat Sheet*.

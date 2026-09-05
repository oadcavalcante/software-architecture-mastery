---
id: chaos-engineering
title: Chaos Engineering
sidebar_position: 17
description: Causing failures on purpose to discover what does not work — before it discovers itself.
doc_type: concept
level: 5
difficulty: advanced
status: complete
objective: >
  By the end, the reader runs failure experiments with a hypothesis, a limited scope
  and a stopping criterion.
prerequisites: [reliability]
related: [graceful-degradation, failover, redundancy]
canonical_for: []
translated_from_version: 2
last_reviewed: 2026-08-31
---

# Chaos Engineering

## Overview

Chaos engineering is deliberately causing failures, in a controlled environment, to verify that the system
behaves as expected.

It is not "breaking things at random". It is a method with a **hypothesis**, a **limited scope** and a
**stopping criterion** — closer to a scientific experiment than to sabotage.

The premise that justifies it: fault tolerance mechanisms that have never been exercised probably do not
work. And the moment to discover that is not during the incident.

## Problem

Every system has protection mechanisms: circuit breakers, degradation, failover, retries, redundancy.

They are written once, tested on the happy path, and never actually executed — because the condition that
triggers them is rare.

When the condition arrives, you discover that the fallback behavior has the wrong shape, that the failover
has no quota in the secondary region, that the degradation was never tested with the current interface.

The code exists. The behavior does not.

## Core Concepts

### The method

```text
1. define the steady state   a business metric, not a resource one
2. formulate the hypothesis  "on taking X down, the steady state holds"
3. limit the blast radius    the smallest population that produces a signal
4. define the abort          when to stop
5. execute and observe
6. record what was learned
```

Step 1 is what separates the method from playing around. The steady state needs to be a metric that matters
— orders per minute, checkout success rate —, not CPU or the number of instances.

Step 2 is what makes the result useful: a refuted hypothesis teaches something specific. With no
hypothesis, the experiment produces "this happened" instead of "we discovered that".

### Start small and in a safe environment

The progression that works:

```text
1. a test environment, with synthetic load
2. production, outside peak hours, minimal blast radius
3. production, normal hours, limited blast radius
4. production, with increasing scale
```

Jumping straight to production without having exercised beforehand is like running the first recovery test
during the incident — only voluntarily.

And the test environment has a known limit: it does not reproduce the real load, data or dependencies. The
most valuable findings appear in production.

### The experiments that pay off most

In increasing order of cost to set up — which is the useful axis for choosing where to start, since the
return depends on what **this** system has that is fragile:

```text
kill an instance                 verifies statelessness and graceful shutdown
add latency                      verifies timeouts, circuit breakers, degradation
make a dependency unavailable    verifies the fallback behavior
exhaust a resource               verifies bulkheads
take a zone down                 verifies absorption capacity
database failover                verifies the procedure
expire a certificate             verifies monitoring
```

**Adding latency usually reveals more than taking things down**, and it is less used. Dependencies rarely
go down — they get slow —, and it is that scenario the protection mechanisms usually do not cover. See
[circuit breakers](/12-reliability/circuit-breakers.md).

### A limited blast radius is not optional

An experiment that can affect every user is not an experiment — it is a self-inflicted incident.

The ways to limit it:

```text
by traffic fraction   1% of the requests
by instance           one of twenty
by customer           internal accounts only
by region             the lowest-volume one
by window             outside the peak
```

And the abort criterion needs to be automatic where possible: if the steady state metric drops beyond a
threshold, the experiment stops on its own.

An experiment that depends on somebody watching and reacting manually is an experiment that will cause
damage on the day that person gets distracted.

### Prerequisites that precede the first experiment

Doing chaos without them is irresponsible:

**Observability.** If you cannot see the effect, the experiment teaches nothing and the damage can go
unnoticed. See [observability](/13-observability/index.md).

**The ability to revert.** Turning the experiment off needs to be immediate.

**Communication.** The on-call people need to know it is an experiment, or they will treat it as an
incident.

**A reliability target.** With no [SLO](/12-reliability/slo.md), there is no criterion for saying whether
the result was acceptable.

### It is not only a tool

There are tools that inject failure, and they are the easy part.

The part that produces results is the process: defining hypotheses, prioritizing experiments, recording
findings, turning findings into fixes, and repeating.

Teams that buy the tool and do not establish the process run a few spectacular experiments and stop.

And the cheapest format to start uses no tool at all: **tabletop exercises**, where the team discusses
"what would happen if X failed right now?". They find knowledge and procedure gaps before any failure
injection.

### Automate what has already been verified

An experiment that passed once does not guarantee it keeps passing — the system changes.

Experiments that proved valuable should become routine: periodic, automatic execution, with an alert if the
result changes.

It is the difference between "we verified it once" and "we verify it continuously".

## Mental Model

**What is not exercised probably does not work** — and the only way to know which side this case falls on
is to exercise it. Chaos engineering is the verification that the protection mechanisms actually exist.

## When to Use

- There are unexercised fault tolerance mechanisms.
- The system is distributed, with many dependencies.
- There is an availability requirement to sustain.
- After incidents, to verify the fixes.
- Before high-volume events.
- Periodically, for what has already been verified.

## When Not to Use

**With no observability.**

**With no ability to stop quickly.**

**With no hypothesis.** It becomes random breakage.

**Without limiting the blast radius.**

**Without warning whoever is on call.**

**When the system is already unstable.** Fix what already fails on its own before causing more.

**As a substitute for fixing known problems.**

## Alternatives

- **Tabletop exercises** — discussing scenarios with no injection. Cheap, and it finds procedure gaps.
- **Incident simulations** — rehearsing the response, with a simulated failure.
- **Scheduled recovery tests** — exercising failover and restore periodically. See
  [failover](/12-reliability/failover.md).
- **Load tests with failure** — combining overload and unavailability.

The first is the right starting point for whoever has never done it: it costs one meeting and usually finds
more than expected.

## Trade-offs

| With chaos engineering | Without |
|---|---|
| Failures discovered in a controlled window | During the incident |
| Deliberate risk | Unknown risk |
| An investment in process | None |
| Verified confidence | Presumed |

| In production | In test |
|---|---|
| Real findings | An artificial environment |
| Real risk | No risk |
| Requires maturity | A starting point |

## Failure Modes

**The experiment becomes an incident.** A badly limited blast radius.

**No signal.** Insufficient observability to see the effect.

**A finding with no fix.** The problem is discovered and nothing changes.

**Executed once.** The system evolves and the verification ages.

**On-call paged unnecessarily.** A lack of communication.

**False confidence.** Superficial experiments that always pass.

**Chaos in an already unstable system.** Noise indistinguishable from the real problems.

## Common Mistakes

**Starting with production.** The practice requires maturity in observability and recovery. Without them,
the experiment becomes an incident — and the program loses the sponsorship that took months to obtain, in
an environment where asking again requires explaining the incident first.

**Not formulating a hypothesis.** Without declaring beforehand what you expect to happen, breaking things
is just breaking things — there is no way to distinguish expected behavior from a discovery.

**Not limiting the blast radius.** An experiment with no defined damage radius and no stop button is
indistinguishable from a real failure, including for whoever is on call.

**Not injecting latency**, only unavailability. A slow dependency causes more damage than a down one,
because it triggers no error handling — and it is the least exercised scenario.

**Not turning findings into tasks.** An experiment that reveals fragility and does not generate a
prioritized fix only documents the risk, which is worse than not having looked.

**Buying a tool without establishing a process.** The tool injects failure; the value is in the hypothesis,
in the blast radius limit and in following up on what was discovered — none of which comes in the box.

## Real-World Example

A healthcare platform had invested two years in reliability: circuit breakers, degradation, redundancy
across three zones, automated database failover.

The first chaos engineering program started with tabletop exercises. Three two-hour meetings, discussing
scenarios, already produced findings:

**Nobody knew how to execute the database failover manually.** The procedure was automated; the manual
version was out of date and the person who had written it had left.

**There was no clarity about what to degrade** under overload. Each person in the room gave a different
answer.

After that, the experiments, in order:

**Kill an instance, in test.** It passed.

**Kill an instance, in production, one of twelve.** It failed: in-flight requests were lost. Graceful
shutdown was not configured. See [statelessness](/11-scalability/statelessness.md).

**Inject 3 seconds of latency into the medical records service, 1% of the traffic.** It failed revealingly:
the circuit breaker did not open, because it counted only errors — and the service responded successfully,
slowly. The requests piled up. See [circuit breakers](/12-reliability/circuit-breakers.md).

That was the program's most valuable finding, and the scenario most likely to happen on its own.

**Make the scheduling service unavailable, 5% of the traffic.** The degradation worked, and the message
displayed to the user was in English — a default text never translated, because it had never been
displayed.

**Take a zone down, outside the peak.** It failed: the two remaining zones operated at 75% and did not
absorb it. See [redundancy](/12-reliability/redundancy.md).

**Database failover, in a scheduled window.** It worked in 40 seconds — and revealed that the application
did not reconnect automatically, requiring the instances to be restarted.

Six experiments, five with a finding — three where the mechanism did not work, two where it worked and
revealed a defect next to it. All in mechanisms the team believed worked.

After the fixes, the experiments became an automated routine: kill an instance weekly, inject latency every
two weeks, take a zone down monthly, database failover quarterly.

In the following ten months, two real incidents occurred under the exercised conditions. Both were absorbed
with no unavailability.

What the team learned: the two years invested in reliability had produced mechanisms that, for the most
part, did not work. Not through incompetence — through never having been executed.

## Related Concepts

- [Graceful Degradation](/12-reliability/graceful-degradation.md) — what gets verified.
- [Failover](/12-reliability/failover.md) — the most valuable exercise.
- [Redundancy](/12-reliability/redundancy.md) — the absorption capacity.
- [Observability](/13-observability/index.md) — the prerequisite.

## Practical Exercise

Get the team together for an hour and discuss: what happens if service X gets 5 seconds slower right now?

If there is more than one answer in the room, you have found the first experiment to run — and probably the
first finding.

## Interview Questions

- Why are a hypothesis and a steady state what separate the method from random breakage?
- Why is injecting latency more revealing than injecting unavailability?
- Which prerequisites precede the first experiment?

## Further Reading

- Rosenthal, Casey et al. *Chaos Engineering*. O'Reilly, 2020.
- Basiri, Ali et al. *Chaos Engineering*. IEEE Software, 2016.
- Principles of Chaos Engineering — principlesofchaos.org.

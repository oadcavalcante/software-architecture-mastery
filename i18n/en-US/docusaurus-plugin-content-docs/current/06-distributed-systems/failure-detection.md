---
id: failure-detection
title: Failure Detection
sidebar_position: 35
description: Deciding that a node went down — a heuristic, never a certainty.
doc_type: concept
level: 4
difficulty: advanced
status: complete
objective: >
  By the end, the reader calibrates failure detection understanding the trade-off between
  detecting fast and avoiding false positives.
prerequisites: [network-failure]
related: [leader-election, timeouts, consensus]
canonical_for: []
translated_from_version: 1
last_reviewed: 2026-08-31
---

# Failure Detection

## Overview

Failure detection is deciding that a node has stopped working.

The property that defines the subject: **certainty is not possible.** A node that does not respond
may be dead, slow, or on the other side of a partition — and those three situations are
indistinguishable from outside.

That is why failure detectors are heuristics, and designing them is calibrating a trade-off.

## Problem

Systems need to know who is alive: to route traffic, to elect a leader, to redistribute work, to
decide whether a replica still counts.

The only available evidence is the absence of a response within a deadline. And the absence of a
response is [silence](/06-distributed-systems/network-failure.md) — which is compatible with
everything.

That produces two possible errors, and they are opposites:

**False positive.** Declaring a healthy but slow node dead. Its work is redistributed unnecessarily,
and it can keep operating — which produces
[split brain](/06-distributed-systems/leader-election.md).

**False negative.** Continuing to send traffic to a dead node. Requests fail until the detection
happens.

There is no calibration that eliminates both. Reducing one increases the other.

## Core Concepts

### The central trade-off

| Detection | False positives | Recovery time |
|---|---|---|
| Aggressive (seconds) | Frequent | Short |
| Conservative (tens of seconds) | Rare | Long |

Aggressive detection in a system with garbage collection pauses or network variability produces
instability: nodes being removed and readmitted repeatedly, triggering rebalancing each time.

Conservative detection means a real failure takes longer to be handled — and during that time,
requests go to a dead node.

The reasonable calibration for business systems usually lands in the order of seconds, and it
depends on how noisy the environment is.

### Heartbeat and suspicion

The basic mechanism: each node sends a periodic signal. The absence of N consecutive signals raises
suspicion.

Two improvements that are worth it:

**Adaptive detection.** Instead of a fixed deadline, adjusting based on the history of heartbeat
arrivals. A node whose network is consistently slower gets more tolerance.

**Graduated suspicion.** Instead of alive or dead, a suspicion level that grows with the time
without a response. Whoever consumes the information decides the threshold according to the action's
criticality — removing from load balancing can use a low threshold; triggering an election, a high
one.

The second is the approach of accrual detectors, and it is more robust than the binary one.

### Indirect detection

A node may fail to reach another because of a problem on the path, not at the destination.

Indirect detection asks a third party to check: "I cannot reach C — can you?"

That distinguishes a partial partition from a real failure, and it reduces false positives caused by
localized network problems. It is the central mechanism of gossip protocols like SWIM.

### Detection does not prevent the damage

Even with perfect detection, there is a window between the failure and the detection. During it,
requests fail.

And even after detecting, the suspected node can come back without knowing it was removed — which is
why [fencing](/06-distributed-systems/leader-election.md) is necessary and detection is not enough.

**Detection reduces the window; it does not remove the need to tolerate the error.**

### Slow failure is the hard case

A node that responds to the heartbeat and processes slowly passes any liveness-based detector.

Detecting degradation requires measuring **latency and error rate**, not just presence. See
[network failure](/06-distributed-systems/network-failure.md).

That is what makes a binary health check insufficient, and why modern load balancers consider latency
when distributing.

## Mental Model

**Failure detection answers "probably down", never "down".** Every mechanism built on top of it has
to tolerate the answer being wrong.

## When to Use

- Removing instances from load balancing.
- Triggering leader or replica failover.
- Redistributing a node's work.
- Alerting operations.

Each use admits a different threshold, and using the same one for all of them is the common error.

## When Not to Use

**As truth.** The answer is probabilistic.

**Aggressive detection for expensive actions.** Triggering an election because of a two-second
slowdown produces instability.

**Binary detection for degradation.** It does not capture a slow node.

**With no fencing, to protect a resource.** The detection can be wrong, and fencing is the defense
that does not depend on it.

**A uniform deadline for nodes in different conditions.** A node in another region has higher latency
by nature.

## Alternatives

- **Adaptive detection** — a deadline based on observed history.
- **Graduated suspicion** — a level instead of a binary.
- **Indirect detection** — asking third parties.
- **Circuit breaker** — instead of deciding whether the node is alive, deciding whether it is worth
  continuing to call it. See
  [reliability](/12-reliability/index.md).

The last usefully changes the question: instead of "is it alive?", "are the calls working?" — which
is what actually matters and is directly observable.

## Trade-offs

The parameter that governs everything is the interval before declaring a node dead. Shortening it
speeds up recovery and increases false positives; lengthening it does the opposite. There is no
universally correct value — it depends on how much each error costs in your system.

| Fast detection | Slow detection |
|---|---|
| Fast recovery | Slow |
| Frequent false positives | Rare |
| Frequent rebalancing | Stable |
| Higher split-brain risk | Lower |
| Sensitive to network variation | Tolerant |
| Higher probing cost | Lower |

The choice depends on the relative cost of the two errors. Where declaring a live node dead causes
data loss or double writes, slow detection is the conservative choice. Where unavailability costs
more than an unnecessary rebalancing, fast detection pays off.

| Active probing | Liveness signal |
|---|---|
| The observer controls the pace | The observed does |
| Detects a stuck node that still responds | Only detects absence |
| Cost proportional to the number of observers | To the number of nodes |
| The check can exercise dependencies | Does not exercise |

## Failure Modes

**Instability.** A node removed and readmitted repeatedly, with rebalancing on each cycle.

**Split brain.** A false positive during leader election.

**A slow node undetected.** It keeps receiving traffic and degrading the system.

**Cascading detection.** A widespread slowdown makes every node suspect the others.

**A deep health check taking everything down.** When it depends on a common dependency. See
[load balancing](/05-system-design/load-balancing.md).

## Common Mistakes

**Using the same threshold for every action.**

**Binary detection, with no latency measurement.**

**A deadline too short in an environment with garbage collection pauses.**

**Trusting the detection with no fencing.**

**Not measuring the false positive rate.** If nodes are removed and come back frequently, the
calibration is wrong and nobody noticed.

## Real-World Example

A processing cluster with 40 nodes used a heartbeat every second, with suspicion after 3 absences —
detection in 3 seconds.

Work was redistributed on detecting a failure.

The system showed recurring instability: several times a day, nodes were removed and readmitted
within seconds, triggering redistribution of their work.

The cause: garbage collection pauses of 3 to 5 seconds, normal for that process's memory load.

Each false positive cost more than the failure it was supposed to handle — the redistribution moved
state, and the node came back right after, requiring moving it again.

Three fixes.

**A threshold per action.** Removing from load balancing came to use 3 seconds — cheap to reverse.
Redistributing work came to use 15 seconds — expensive, it requires more certainty.

**Indirect detection.** Before declaring a suspect, the node asks three others whether they can reach
it. That eliminated the false positives caused by localized congestion.

**Garbage collection tuning** to reduce the long pauses — treating the cause, not just the symptom.

The instability disappeared. And real failure detection continued happening in 15 seconds, which was
perfectly acceptable for that system.

In retrospect: the problem was not the detector being wrong — it was correctly detecting that the
node was not responding. The problem was **using the same response for a 4-second pause and for a
dead machine**.

## Related Concepts

- [Network Failure](/06-distributed-systems/network-failure.md) — why silence is ambiguous.
- [Leader Election](/06-distributed-systems/leader-election.md) — detection's most critical consumer.
- [Timeouts](/06-distributed-systems/timeouts.md) — the basic mechanism.
- [Consensus](/06-distributed-systems/consensus.md).

## Practical Exercise

In your system, find the failure detection deadline and compare it with the duration of the 99th
percentile of garbage collection pauses.

If the deadline is shorter, you have false positives — and it is worth measuring how often instances
are removed and readmitted.

## Interview Questions

- Why is failure detection always a heuristic?
- What is the trade-off between fast and slow detection?
- Why is using the same threshold for every action problematic?

## Further Reading

- Chandra, Tushar; Toueg, Sam. *Unreliable Failure Detectors for Reliable Distributed Systems*.
  JACM, 1996.
- Das, Abhinandan et al. *SWIM: Scalable Weakly-consistent Infection-style Process Group Membership
  Protocol*, 2002.
- Hayashibara, Naohiro et al. *The φ Accrual Failure Detector*, 2004.

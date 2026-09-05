---
id: failover
title: Failover
sidebar_position: 6
description: Switching to the standby copy — the riskiest moment in a redundant system's life.
doc_type: concept
level: 5
difficulty: advanced
status: complete
objective: >
  By the end, the reader designs exercised failover, with a triggering criterion and
  split brain handling.
prerequisites: [redundancy]
related: [redundancy, chaos-engineering, disaster-recovery-planning]
canonical_for: []
translated_from_version: 2
last_reviewed: 2026-08-31
---

# Failover

## Overview

Failover is switching from the main component to a standby copy when the main one fails.

It is what turns [redundancy](/12-reliability/redundancy.md) from a diagram into real availability. And it
is the riskiest moment in a redundant system's life: a badly executed failover causes more damage than the
original failure.

The sentence that summarizes this area's problem: **a failover that has never been exercised is not a plan,
it is a hope.**

## Problem

The failover path is, by definition, rare. It is written once, documented, and rarely executed.

When it is triggered, you discover that:

The quota in the secondary region does not allow bringing up the capacity. The configuration diverged over
the year. A certificate expired because nobody monitored what was not used. The procedure has fourteen
steps and five are out of date. The on-call person has never executed it.

None of that is hypothetical — it is the recurring list from this category's post-mortems.

## Core Concepts

### Automatic or manual

```text
automatic  fast, with no waiting for a decision
           a risk of triggering on a false positive
manual     a human decision, with no improper triggering
           minutes or hours of latency, dependent on a person's availability
```

The choice depends on the relative cost of the two errors: triggering unnecessarily versus taking too long
to trigger.

For stateless components, automatic is clearly better — the cost of an improper trigger is low.

For databases with asynchronous replication, the calculation changes: an improper failover can lose writes
and create divergence. Many teams keep it manual for that reason, and the price is the human response time.

The common middle ground: automatic with hysteresis — requiring sustained failure over a period, not an
instantaneous spike. See [failure detection](/06-distributed-systems/failure-detection.md).

### Split brain is the worst outcome

Two copies consider themselves primary. Both accept writes. The data diverges, and the reconciliation is
manual and imperfect.

That is worse than unavailability: unavailability gets resolved; data divergence may not.

The mechanisms that prevent it:

**A majority.** Only the one with the majority of the nodes' votes takes over. That is why three, not two.
See [consensus](/06-distributed-systems/consensus.md).

**Fencing the old one.** The previous primary is prevented from accepting writes — by credential
revocation, by a network rule, or by shutdown.

**A generation stamp.** Writes carry a generation number; the store refuses those from an old generation.

A failover with none of those mechanisms will produce split brain eventually.

### What is lost in the promotion

With asynchronous replication, what the primary acknowledged and did not replicate is lost.

```text
2s of replication lag at the moment of failure
  → up to 2 seconds of writes acknowledged to the user, lost
```

That needs to be known and accepted. See [RPO](/12-reliability/rpo.md).

And it needs to be communicated: transactions confirmed to the user that ceased to exist generate a
business problem, not only a technical one.

### Returning to the primary is another failover

After the original component comes back, returning to it is an operation of equivalent risk.

The characteristic mistake: treating the return as "going back to normal" and executing it with none of the
same care — during peak hours, with no window, without verifying that the old primary is actually
consistent.

Many failover incidents have two parts, and the second is the return.

One decision that simplifies things: **do not return**. If the copies are equivalent, the one that took
over stays as the main one, and the old one becomes the standby. That eliminates half the risk.

### Dependencies need to follow

Promoting the database is not enough if the application keeps pointing at the old one.

A complete failover involves: service discovery, connection strings, DNS with a short time to live, queues,
schedulers, and external systems pointing at the old address.

The DNS item deserves a note: a one-hour time to live is the **optimistic floor** of what clients will take
to move. Intermediate resolvers and library caches frequently exceed the declared value, and an already
established connection queries no DNS at all — it stays on the old address until it drops.

Inventorying everything that points at the component is part of the design, and it is what usually is
missing.

### Exercising is the only verification that counts

See [chaos engineering](/12-reliability/chaos-engineering.md). The failover needs to be executed
periodically, in production, in a controlled window.

The first execution finds problems. The third or fourth, generally not. And the execution time falls
substantially with practice — because the procedure becomes correct and the people become comfortable.

A failover exercised monthly is a routine operation. One never exercised is an incident inside an incident.

## Mental Model

**Failover is a procedure, not a configuration.** It works if it is executed regularly, and it fails if it
is only documented.

## When to Use

- Redundancy with a standby copy exists.
- The unavailability has a cost that justifies the complexity.
- There is a recovery time requirement. See [RTO](/12-reliability/rto.md).
- Maintenance needs to happen with no downtime.

## When Not to Use

**Without exercising it.**

**Automatic with no split brain mechanism.**

**Automatic for a database with asynchronous replication**, without accepting the loss.

**Without inventorying what points at the component.**

**Returning to the primary without the same care.**

**When recovering the original is faster** than switching.

## Alternatives

- **Active-active** — no switch to execute; the recovery path is the normal one. See
  [redundancy](/12-reliability/redundancy.md).
- **Fast recovery** — restarting or recreating the component, instead of switching.
- **[Graceful degradation](/12-reliability/graceful-degradation.md)** — operating without the component.
- **Manual failover with a rehearsed procedure** — slower and more predictable.

## Trade-offs

| Automatic | Manual |
|---|---|
| Seconds | Minutes to hours |
| A false positive risk | No improper triggering |
| No human dependency | Depends on on-call |
| Requires split brain protection | A human decision filters |

| Returning | Staying |
|---|---|
| Back to the planned topology | Accepted asymmetry |
| A second risk | One risk less |
| The copies may be unequal | Requires equivalence |

## Failure Modes

**Split brain.**

**Insufficient quota on the standby.**

**Divergent configuration.**

**An expired certificate on the standby.** Never used, never monitored.

**Writes lost in the promotion.**

**Dependencies pointing at the old one.**

**An outdated procedure.**

**A false positive.** Failover triggered by a network blip.

## Common Mistakes

**Not exercising it.** It is the mechanism that only runs under stress. A procedure never executed usually
fails on the first attempt — and the first attempt, by definition, happens during the incident.

**Two copies instead of three**, preventing a majority. With two, neither side can form a majority during a
partition, and automatic promotion becomes a bet between stopping everything and risking split brain.

**Not fencing the old primary.** If it comes back without knowing it was replaced, it starts accepting
writes in parallel with the new one. That is the classic route to data divergence.

**Not monitoring the standby's health.** A replica whose replication stopped days ago looks available and
promotes an old state — which is discovered after promoting.

**DNS with a long time to live.** The failover happens in seconds and the clients keep going to the old
address for the cache duration, which can be tens of minutes.

**Treating the return as a trivial operation.** Going back to the original primary requires resynchronizing
data written during the contingency, and it is frequently more delicate than the failover itself.

## Real-World Example

A financial institution had automated database failover between two zones, documented and never exercised
in three years.

In a real failure of the primary zone, the failover was triggered automatically and produced the worst
possible outcome.

The sequence:

**A successful promotion.** The replica took over in 25 seconds.

**Applications did not reconnect.** The instances held connections to the old address and had no
reconnection logic. They had to be restarted manually: 12 minutes.

**The old primary came back.** The zone partially recovered, and the original database started accepting
connections again — still considering itself primary. There was no fencing mechanism.

**Split brain for 40 minutes.** Some applications, restarted earlier, pointed at the new primary; others,
at the old one. Both accepted writes.

**Data divergence.** 1,400 transactions had to be reconciled manually over three days. Nineteen could not
be resolved with certainty.

The reformulation:

**Three nodes, with a majority.** Promotion came to require a quorum, which prevents a **second** promotion
— the old primary cannot be elected again. That is not what silences it: on its own, the quorum would let
it keep believing itself the primary and accepting writes, which was exactly the failure. What closes that
door is the next item.

**Fencing by revocation.** The old primary's credential is revoked at promotion, before anything else.

**Automatic reconnection** in the applications, with service discovery instead of a fixed address.

**A monthly exercise**, in production, in a low-traffic window. The first took 18 minutes and found four
problems; the sixth took 40 seconds and found none.

**Do not return.** The copy that takes over stays as the primary. The three are equivalent and the
asymmetry stopped existing.

What the team records, with the distinction that cost 40 minutes to learn: **detection and promotion**
worked as designed, in 25 seconds. What was missing was not periphery — it was the rest of the switching
mechanism: quorum and fencing, without which promoting a replica in a two-copy design produces two
primaries by construction. Around that, three things nobody had inventoried: the DNS time to live, the open
connections and the applications with no reconnection. None is a defect of the database product; all are of
the failover design.

## Related Concepts

- [Redundancy](/12-reliability/redundancy.md) — the prerequisite.
- [Chaos Engineering](/12-reliability/chaos-engineering.md) — the exercise.
- [Leader Election](/06-distributed-systems/leader-election.md) — the split brain.
- [RPO](/12-reliability/rpo.md) — what is lost.

## Practical Exercise

Find out when your most critical component's failover was last exercised.

If the answer is "never", schedule one — and reserve double the time you imagine it will take.

## Interview Questions

- Why is split brain worse than unavailability?
- Why is returning to the primary a second risk?
- What needs to follow the promotion, beyond the component itself?

## Further Reading

- Kleppmann, Martin. *Designing Data-Intensive Applications*. O'Reilly, 2017 — chapter 5.
- Beyer, Betsy et al. *Site Reliability Engineering*. O'Reilly, 2016.
- Nygard, Michael. *Release It!*. 2nd ed. Pragmatic Bookshelf, 2018.

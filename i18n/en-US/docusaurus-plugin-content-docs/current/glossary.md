---
id: glossary
title: Glossary
sidebar_position: 91
description: Architecture terminology with precise definitions and the distinctions between terms that are frequently confused.
doc_type: reference
level: 0
difficulty: beginner
status: complete
objective: >
  By the end, the reader has operational definitions of the terms used across the
  path, including the distinctions the literature tends to blur.
prerequisites: []
related: [i18n-terminology]
canonical_for: []
translated_from_version: 1
last_reviewed: 2026-08-29
---

# Glossary

Operational definitions — what a term means when someone has to decide with it,
not the dictionary entry.

Where two terms are frequently confused, the distinction is stated.

## A

**Abstraction** — A representation that exposes what matters for a purpose and
hides the rest. A good abstraction reduces what you need to know; a bad one adds
a layer without removing any.

**Aggregate** — In DDD, a set of objects treated as a single unit of transactional
consistency, reached only through its root.

**Anti-corruption layer** — A translation layer that keeps an external system's
model from leaking into yours.

**Availability** — The fraction of time a system responds correctly. Expressed as
a percentage over a stated window; without the window, the number means nothing.

## B

**Backpressure** — The mechanism by which an overloaded consumer signals the
producer to slow down. Without it, overload turns into message loss or memory
exhaustion.

**Bottleneck** — The resource that saturates first and caps the capacity of the
whole. Optimizing any other point does not increase total capacity.

**Bounded context** — The boundary within which a domain model and its language
have a single, consistent meaning. Two contexts may use the same word with
different senses, and that is correct.

**Bulkhead** — Resource isolation so that exhaustion in one part does not bring
down the rest. The name comes from the watertight compartments of a ship.

## C

**CAP** — The result stating that, during a network partition, a distributed
system cannot be simultaneously consistent and available. It concerns behaviour
**during** the partition only — it is often cited as though it were a permanent
choice among the three letters, which it is not.

**Circuit breaker** — A component that stops calls to a failing service, keeping
the caller from wasting resources and propagating the failure.

**Cohesion** — The degree to which the elements of a module belong together. High
cohesion and low coupling are the same decision seen from two sides: what stays
together and what stays apart.

**Coupling** — The degree to which a change in one module forces a change in
another. Not a defect to eliminate: a quantity to allocate deliberately. Modules
that change together should be coupled.

**CQRS** — Separation between the model used for writing and the one used for
reading. It solves the case where the two have incompatible requirements, at the
cost of synchronization between them.

## D

**DDD** — Domain-Driven Design. An approach that structures software around the
business domain and the language of the people who understand it.

## E

**Event sourcing** — Persisting the sequence of events that produced the state,
rather than the state. State becomes a derivable projection. Powerful and
expensive: it demands event versioning and reprocessing.

**Eventual consistency** — The guarantee that, absent new writes, all replicas
converge to the same value. It does not say **when**, and it is that absence the
application has to handle.

## F

**Fault tolerance** — The ability to keep operating correctly despite the failure
of components.

**Fitness function** — An automated check that a desired architectural property
still holds. It turns architectural intent into a test.

## I

**Idempotency** — The property of an operation whose effect is the same whether it
runs once or many times. It is what makes it safe to repeat a call whose outcome
you do not know — and therefore the basis of nearly all recovery in distributed
systems.

## L

**Latency** — The time between request and response. Always reported in
percentiles, never as an average: the average hides precisely the tail users
experience.

## M

**Microservices** — A style in which the application is a set of independently
deployable services, each owning its data. Deployment independence is the goal;
small size is a consequence, not a target.

**Modular monolith** — An application deployed as a single unit, with explicit and
enforced internal boundaries. Frequently the right answer in the case where
microservices would be adopted on reputation.

**Modularity** — The degree to which a system is composed of parts with explicit
boundaries that can be understood and changed separately.

## P

**PACELC** — An extension of CAP: during a partition (P), you choose between
availability and consistency; **else (E)**, you choose between latency and
consistency. It describes the everyday dilemma better, because partitions are rare
and the second trade-off always applies.

**Partitioning** — Dividing data into disjoint subsets to distribute load or
volume. See also sharding.

## Q

**Quality attribute** — A measurable property of how the system behaves:
availability, performance, security. Distinct from a functional requirement, which
describes what the system does.

## R

**Reliability** — The probability that a system operates correctly over a period.
Distinct from availability: a system can be available and return wrong results.

**Replication** — Keeping copies of the same data in distinct places. It raises
availability and read capacity; it introduces the question of which copy is right.

**RPO** — Recovery Point Objective. The maximum amount of data you accept losing,
measured in time. It sets the replication and backup strategy.

**RTO** — Recovery Time Objective. The maximum acceptable time to restore service
after a failure. It sets the redundancy topology.

## S

**Saga** — A sequence of local transactions with compensations, used when a
distributed transaction is not viable. It trades atomicity for availability, and
requires every step to have a defined compensation.

**Scalability** — The ability to absorb growth by adding resources. Distinct from
performance: a system can be fast and not scale.

**Sharding** — Horizontal partitioning in which each partition lives on a separate
instance. The choice of key determines whether load spreads or concentrates in a
hotspot.

**SLA** — Service Level Agreement. A contractual commitment about service level,
with commercial consequences. It is a business decision.

**SLI** — Service Level Indicator. The metric itself — for example, the fraction of
requests answered under 300 ms.

**SLO** — Service Level Objective. The internal target on an SLI. It is an
engineering decision, and should be stricter than the corresponding SLA.

**Strangler fig** — A pattern of incremental replacement in which the new system
progressively intercepts traffic from the old one until the old one can be shut
down.

**Strong consistency** — The guarantee that every read observes the most recent
write. It costs latency even without a network partition — see PACELC.

## T

**Technical debt** — A future cost taken on by a decision that favours speed now.
It is only debt when the choice was deliberate and there is intent to repay; the
rest is simply poor work.

**Trade-off** — A choice in which gaining on one dimension implies losing on
another. A "trade-off" with no stated loss is not a trade-off, it is a preference.

**Transaction** — A unit of work with guarantees of atomicity, consistency,
isolation and durability. The effective isolation level is rarely what the name
suggests; it is worth checking the documentation of the specific database.

---
id: grpc
title: gRPC
sidebar_position: 3
description: A strong contract and binary transport for internal communication — and why it rarely serves at the edge.
doc_type: concept
level: 5
difficulty: advanced
status: complete
objective: >
  By the end, the reader recognizes the internal workloads where gRPC pays off and the
  boundaries where it costs more than it returns.
prerequisites: [rest]
related: [rest, service-mesh, schema-evolution]
canonical_for: []
translated_from_version: 1
last_reviewed: 2026-08-31
---

# gRPC

## Overview

gRPC is remote procedure calling with a **declared contract**, binary serialization and multiplexed
transport.

The contract is the service definition: methods, messages and types. Code is generated from it on both
sides, which eliminates the divergence between what the server implements and what the client expects.

The gain is real and specific: high-frequency **internal** communication between services. At the public
edge, the tooling cost usually exceeds the benefit.

## Problem

Between internal services, an HTTP API with JSON pays for things that have no value there.

Serializing and deserializing text costs CPU. The loose contract allows divergence between what one side
sends and the other expects — discovered in production. One connection per request takes advantage of
nothing.

In a mesh with dozens of services and millions of internal calls per minute, those costs stop being a
detail.

## Core Concepts

### The contract generates the code

The service definition is the source of truth, and both sides derive from it.

```protobuf
service Orders {
  rpc Get(GetOrderRequest) returns (Order);
  rpc List(ListOrdersRequest) returns (stream Order);
}
```

That changes the class of possible errors: a field with the wrong name, a swapped type or a non-existent
method become compilation errors, not incidents.

It is the most important difference relative to [REST](/08-integration-architecture/rest.md), where the
contract is typically not executable. See
[integration contracts](/08-integration-architecture/integration-contracts.md).

### Evolution by field number

Each field has a number, and it is the number — not the name — that identifies the data in the binary
format.

```protobuf
message Order {
  string id = 1;
  int64 amount_cents = 2;
  reserved 3;              // removed field; the number never comes back
}
```

Practical consequences: renaming a field is compatible, because the number does not change. Reusing a
removed number is catastrophic, because old data will be interpreted with the new type.

That is why `reserved` exists and why it is not optional. See
[schema evolution](/08-integration-architecture/schema-evolution.md).

### The four call modes

```text
unary             one request, one response
server streaming  one request, many responses
client streaming  many requests, one response
bidirectional     both sides send continuously
```

The three streaming modes are the capability REST does not have without resorting to another protocol.
Continuous synchronization, telemetry and live feeds fit naturally.

### The cost is tooling, and it is serious

Being specific, because it is what decides the adoption:

**The browser.** It does not speak gRPC directly. A translation layer is needed, with real limitations in
streaming modes.

**Debugging.** You cannot inspect a call with the browser's network tools or with a common HTTP client.
There are dedicated tools, and the learning curve is a different one.

**Intermediaries.** Load balancers and gateways have to understand the protocol. A layer 4 balancer will
distribute *connections*, not *calls* — and since the connections are long and multiplexed, the load stays
persistently unbalanced.

That last point surprises teams that adopt gRPC with no service mesh: the balancing simply does not work
as expected.

**External partners.** A public API in gRPC excludes consumers that have no support.

### Propagated deadline

The client declares how much time it has, and the deadline travels with the call. An intermediate service
knows how much of the budget is left and can give up early instead of working for a result nobody will
receive.

It is a discipline property HTTP APIs rarely implement, and it reduces wasted work in call cascades. See
[timeouts](/06-distributed-systems/timeouts.md).

### Its own status codes

gRPC has its own set of codes, with clear semantics about what is retryable. The separation between client
and server errors is there, as in [REST](/08-integration-architecture/rest.md) — and the libraries usually
expose it more directly.

## Mental Model

**gRPC trades reach for efficiency and rigor.** Where both sides are yours, the rigor is profit; where
they are not, the reach is what matters.

## When to Use

- Internal communication between services.
- A high call frequency, where serialization and connections weigh.
- A strong contract with code generation has value.
- Continuous streaming in one or both directions.
- Polyglot — several teams, several languages, one contract.
- A [service mesh](/08-integration-architecture/service-mesh.md) that understands the protocol already
  exists.

## When Not to Use

**At the public edge.** The tooling cost falls on whoever consumes it.

**For browsers, with no translation layer.**

**When HTTP caching matters.** See [REST](/08-integration-architecture/rest.md).

**When the consequence is asynchronous.** See
[messaging](/08-integration-architecture/messaging-integration.md).

**With a layer 4 balancer and no mesh.** The long connections concentrate load.

**When the volume does not justify it.** Tens of calls per second between two services do not pay for the
tooling change.

## Alternatives

- **[REST](/08-integration-architecture/rest.md)** — reach and operational simplicity.
- **[GraphQL](/08-integration-architecture/graphql.md)** — variable consumption.
- **[Messaging](/08-integration-architecture/messaging-integration.md)** — asynchronous and decoupled.
- **gRPC internally, REST at the edge** — the most common design among successful adoptions, with the
  gateway translating.

The last deserves emphasis: the two choices do not compete when they occupy different layers.

## Trade-offs

| gRPC | REST |
|---|---|
| Binary and compact | Text, readable |
| Strong generated contract | Frequently loose |
| Native streaming | Needs another protocol |
| Specialized tooling | Universal |
| No HTTP caching | With caching |
| Propagated deadline | Manual |
| Hard to inspect | Trivial |

## Failure Modes

**A reused field number.** Old data read with the wrong type.

**Uneven balancing.** Long connections pin clients to instances.

**A message above the limit.** The default maximum size is modest and the failure is abrupt.

**A deadline not propagated.** A service keeps processing what nobody is waiting for.

**A translation layer limiting streams.** What works between services does not work in the browser.

**A divergent contract version.** One side regenerated the code, the other did not.

## Common Mistakes

**Adopting it at the public edge.** Browsers do not speak gRPC natively, and external partners expect HTTP
with JSON. Adopting it at the edge transfers to every consumer the cost of a technology chosen for
internal convenience.

**Not declaring `reserved` when removing a field.** The field number can be reused later for something
else, and an old client comes to interpret the new value with the old meaning — silent corruption, with no
deserialization error.

**Not configuring per-call balancing.** gRPC multiplexes over long-lived connections, so per-connection
balancing pins each client to one instance. New instances receive no traffic and the load stays
unbalanced.

**Assuming the default size limit is enough.** The default message limit is modest, and the failure appears
only when a larger-than-average record travels — in production, in a specific case tests did not cover.

**Not propagating the deadline.** The deadline is part of the protocol and crosses the chain if it is
forwarded. Not forwarding it makes downstream services keep working on calls the client has already
abandoned.

**Treating it as a universal replacement for REST.** It wins in dense internal communication between
services. For public integration, debugging tools, edge caching and the consumer's familiarity weigh more
than the format's efficiency.

## Real-World Example

A mobility platform migrated the communication between fourteen internal services from HTTP with JSON to
gRPC.

The numbers measured after the migration:

**Latency between services** dropped from 12 ms to 4 ms at the median — most of the gain came from the
persistent multiplexed connection, not from the serialization.

**CPU usage** of the services dropped about 18%, mostly in serialization.

**Contract incidents** went to zero. Previously there were a few per quarter, of the "the field changed
name and the consumer did not know" kind.

Two serious problems:

**Balancing.** The balancer was layer 4. Since gRPC keeps long connections, each client was pinned to one
instance. After a scale-out, the new instances sat practically idle while the old ones saturated. The
diagnosis took two weeks, because the aggregate metrics looked normal. Solved with client-side balancing
and, later, with a service mesh.

**A reused field number.** A developer removed a field `int32 status = 4` and, months later, another added
`string category = 4`. Services with the old contract version read the category as an integer. The
corrupted data went into the database. The review passed because the old contract was no longer in the
repository for comparison. `reserved` came to be enforced by an automated check.

And a deliberate decision: **the public API stayed in REST**, with the gateway translating. The proposal to
expose gRPC to partners was refused after two of them reported having no support.

The later assessment points out: balancing is the risk nobody anticipates. gRPC is presented as a direct
replacement for HTTP, and the difference in connection behavior changes operations in a way that appears in
no performance comparison.

## Related Concepts

- [REST](/08-integration-architecture/rest.md) — the main comparison.
- [Service Mesh](/08-integration-architecture/service-mesh.md) — where the balancing is solved.
- [Schema Evolution](/08-integration-architecture/schema-evolution.md) — field numbers.
- [Timeouts](/06-distributed-systems/timeouts.md) — the propagated deadline.

## Practical Exercise

If you use gRPC, check how the balancing happens: per connection or per call?

Then look at the distribution of requests across instances. If it is uneven and stable over time, you have
found the problem before a scale-out reveals it.

## Interview Questions

- Why is renaming a field compatible and reusing a number not?
- Why does layer 4 balancing fail with gRPC?
- At which boundary does gRPC usually cost more than it returns?

## Further Reading

- gRPC documentation — [grpc.io/docs](https://grpc.io/docs).
- Google. *Protocol Buffers Language Guide*.
- Indrasiri, Kasun; Kuruppu, Danesh. *gRPC: Up and Running*. O'Reilly, 2020.

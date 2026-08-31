---
id: encryption
title: Encryption
sidebar_position: 6
description: In transit, at rest and in use — what each one protects, and why "it is encrypted" is not an answer.
doc_type: concept
level: 5
difficulty: advanced
status: complete
objective: >
  By the end, the reader knows which threat each type of encryption protects against
  and recognizes when it protects nothing.
prerequisites: [security]
related: [key-management, network-security, data-protection]
canonical_for: []
translated_from_version: 1
last_reviewed: 2026-08-31
---

# Encryption

## Overview

Encryption protects data against whoever should not read it. The question that organizes everything is:
**against which access?**

```text
in transit   against whoever observes the network
at rest      against whoever obtains the storage medium
in use       against whoever has access to the execution environment
```

"It is encrypted" is not an answer, because it does not say which of those — and each one protects against
a different threat, leaving the others open.

## Problem

The reflexive answer to a protection requirement is "let's encrypt it". That usually means enabling
encryption at rest on the storage, which is easy and frequent.

That protects against a specific scenario: somebody physically obtains the disk. In a cloud environment,
that scenario is remote.

And it does not protect against the likely scenario: a compromised credential uses the application to read
the data — and the application decrypts normally, because that is what it does.

The result is a requirement met on paper, with no real risk reduction.

## Core Concepts

### Symmetric and asymmetric

**Symmetric.** One key encrypts and decrypts. Fast, suitable for volume. The problem is distributing the
key to whoever needs it.

**Asymmetric.** A key pair: the public one encrypts, the private one decrypts. It solves distribution, and
it is orders of magnitude slower.

In practice, the two are combined: the asymmetric one establishes a symmetric key, and the volume is
encrypted with it. That is how TLS works.

A third category, frequently confused with encryption: **hash functions** are one-way and have no key.
Passwords are not encrypted — they go through a slow derivation function, designed to resist mass guessing.
Encrypting a password instead of deriving is a classic mistake.

### In transit

It protects against observation and alteration on the network.

**TLS on everything**, including inside the internal network. The premise that "the internal network is
trustworthy" is the same one [zero trust](/10-security/zero-trust.md) dismantles.

Two points that are usually missing:

**Certificate verification.** Disabling it to "fix" an error nullifies the whole protection — the channel
is encrypted with whoever is in the middle.

**Mutual TLS** between services, when both ends need to identify each other. See
[service mesh](/08-integration-architecture/service-mesh.md).

### At rest, and what it really protects

Disk and storage encryption protects against access to the physical medium and, in the cloud, against
reading a discarded volume.

It does **not** protect against: a compromised application credential, an improper query, a leak from an
authorization defect, or an administrator with legitimate access.

That does not make it useless — it is a regulatory requirement and cheap defense in depth. It makes it
insufficient as an answer to "how do we protect this data?".

### Field-level encryption is what changes the calculation

Encrypting specific fields in the application, with a separate key, protects against exactly what
encryption at rest does not: whoever accesses the database reads encrypted data.

The cost is real and needs to be acknowledged:

**You cannot query it.** Searching by an encrypted field requires deterministic encryption — which leaks
the repetition pattern — or a separate index.

**Sorting and comparison** stop working.

**The key needs to be managed** outside the database. See
[key management](/10-security/key-management.md).

That is why it is applied selectively, to the fields that justify it: a document number, health data, third
parties' credentials.

### Per-subject encryption solves deletion

A specific and powerful application: encrypting each data subject's data with a key of their own.

Deleting that person's data becomes **discarding the key** — the record remains, and the content becomes
unrecoverable.

That resolves the conflict between immutability and the right to erasure in
[event sourcing](/06-distributed-systems/distributed-event-sourcing.md) and in immutable file stores. See
[data lifecycle](/07-data-architecture/data-lifecycle.md).

It needs to be designed from the start; retrofitting requires rewriting the history.

### Do not implement it

The most important rule and the most violated under pressure:

**Use mature libraries and standardized algorithms.** Do not invent a scheme, do not combine primitives on
your own, do not use modes of operation without understanding their requirements.

The mistakes are subtle and silent: a reused initialization vector, a mode with no authentication, a
comparison that leaks timing. The system works, the tests pass, and the protection does not exist.

Prefer constructions that make mistakes hard — authenticated encryption, high-level libraries with few
options.

## Mental Model

**Encryption protects against a specific access.** Name which one, or you do not know what you are
protecting.

## When to Use

- **In transit:** always, including internally.
- **At rest:** whenever available — it is cheap.
- **On the field:** for sensitive data, when database access is a real threat.
- **Per subject:** when there is a deletion requirement in immutable storage.
- **Asymmetric:** when the parties do not share a secret beforehand.

## When Not to Use

**As a generic answer** to a protection requirement, with no threat named.

**For passwords.** Use a derivation function.

**Field encryption on everything.** Queries stop working.

**Deterministic encryption** without understanding what it leaks.

**Your own implementation.**

**With certificate verification disabled.**

**When the problem is authorization.** Encryption does not fix a wrong permission — and it is frequently
adopted as if it did.

## Alternatives

To protect data without encrypting:

- **Not collecting it.** See [data protection](/10-security/data-protection.md).
- **Tokenization** — replacing the data with a reference, keeping the original in a separate vault. Common
  for card data.
- **Pseudonymization** — removing direct identifiers.
- **Proper authorization** — frequently the control that was actually missing.

## Trade-offs

| Field encryption | At rest |
|---|---|
| Protects against database access | Only against medium access |
| Queries and sorting break | Transparent |
| The key managed by the application | By the platform |
| Processing cost | Negligible |
| Applied selectively | Everything at once |

| Authenticated encryption | Confidentiality only |
|---|---|
| Detects alteration | Does not detect |
| The recommended standard | Legacy |

## Failure Modes

**Certificate verification disabled.**

**The key next to the data.** Encrypting and storing the key in the same place protects nothing.

**A reused initialization vector.** It leaks information about the content.

**Deterministic encryption revealing a pattern.** Equal values produce equal ciphertexts.

**A mode with no authentication.** It allows undetected alteration.

**A lost key.** Unrecoverable data — the opposite failure mode and equally serious.

**A requirement met with no risk reduced.** Encryption at rest against a compromised-credential threat.

## Common Mistakes

**Not naming the threat.** Encryption at rest protects against a stolen disk and a leaked backup copy; it
does not protect against a compromised credential, which is the most common route. Without naming the
threat, you encrypt what was not at risk.

**Encrypting a password instead of deriving it.** Encryption is reversible — whoever obtains the key
obtains every password. A password requires a slow, salted derivation function, which has no way back.

**Storing the key next to the data.** The key in the same database, on the same server or in the same
repository nullifies the encryption: whoever reaches one reaches the other.

**Implementing the scheme.** Cryptography fails in details — initialization vector reuse, a
timing-susceptible comparison, a mode with no authentication. Reviewed libraries exist precisely because
those mistakes are not visible in testing.

**Disabling certificate verification.** Done to unblock a development environment, it survives to
production — and turns the encrypted channel into a channel encrypted with whoever is in the middle.

**Treating encryption as a substitute for authorization.** Data encrypted at rest is returned decrypted to
whoever the application lets query. If the authorization is wrong, encryption prevents nothing.

## Real-World Example

A health plan operator needed to meet a regulatory requirement for protecting patient data.

The initial answer: enabling encryption at rest on every database and storage system. Done in two weeks,
the requirement marked as met.

Eighteen months later, an incident: an application credential leaked through an error log, and 40,000
patients' data was extracted.

Encryption at rest had no effect at all. The application decrypted the data normally — that is what it does
— and the credential allowed using it.

The subsequent review changed the approach, starting by naming the threats:

```text
threat                              appropriate control
a discarded disk                    encryption at rest ✓ already existed
network observation                 TLS ✓ already existed
a leaked application credential     field encryption + least privilege
a curious database administrator    field encryption + auditing
a deletion request                  per-subject encryption
```

The last two lines had no control at all.

What was implemented:

**Field-level encryption** for the document number, the diagnosis and the test result, with keys managed
outside the database. Searching by document number came to use a separate hash index, instead of a direct
query.

**Per-subject encryption** for the health data, allowing deletion by discarding a key — which resolved a
regulatory requirement that had been pending for two years.

**A reduced scope** for the application credential, with access only to the necessary tables. See
[least privilege](/10-security/least-privilege.md).

**Auditing** of access to sensitive data, with an anomalous volume alert.

**Log filtering** to avoid recording credentials.

The point the team underlines: the regulatory requirement said "the data must be encrypted", and they met
it literally. The question nobody asked — "against whom?" — would have changed the entire answer, with the
same budget.

## Related Concepts

- [Key Management](/10-security/key-management.md) — without it, encryption does not work.
- [Data Protection](/10-security/data-protection.md) — the alternatives to encrypting.
- [Network Security](/10-security/network-security.md) — encryption in transit.
- [Data Lifecycle](/07-data-architecture/data-lifecycle.md).

## Practical Exercise

For each type of sensitive data in your system, write down which access it is protected against — and which
it is not.

The right-hand column usually includes "a compromised application credential", which is the most likely
scenario.

## Interview Questions

- What does encryption at rest protect against, and what does it not protect against?
- Why are passwords not encrypted?
- How does per-subject encryption solve deletion in immutable storage?

## Further Reading

- Ferguson, Niels; Schneier, Bruce; Kohno, Tadayoshi. *Cryptography Engineering*. Wiley, 2010.
- NIST SP 800-175B — guidelines for using cryptography.
- OWASP. *Cryptographic Storage Cheat Sheet*.

---
id: key-management
title: Key Management
sidebar_position: 7
description: Where cryptography usually fails — not in the algorithm, but in who has the key and what happens if it vanishes.
doc_type: concept
level: 5
difficulty: advanced
status: complete
objective: >
  By the end, the reader designs a key hierarchy with viable rotation and a plan for
  loss and compromise.
prerequisites: [encryption]
related: [encryption, secrets, data-protection]
canonical_for: []
translated_from_version: 1
last_reviewed: 2026-08-31
---

# Key Management

## Overview

Modern cryptography rarely fails in the algorithm. It fails in the **key**: who has access, where it is
stored, what happens when it needs to change, and what happens when it vanishes.

Key management is the hard part, and it is the one usually treated as an implementation detail after the
decision to encrypt has been made.

## Problem

Encrypting is the easy part — a library call. The questions that come afterward are what determine whether
the protection exists:

Where does the key live? Who can use it? How is it rotated without making the old data unreadable? What
happens if it leaks? And if it is lost?

The last is the one that causes the most accumulated damage: **a lost key is lost data**, with no recourse.
No backup of the data helps if the key no longer exists.

## Core Concepts

### Envelope encryption resolves most of it

The pattern that structures almost all key management:

```text
data key    encrypts the data — one per object, file or record
master key  encrypts the data keys — few, protected
```

The data is encrypted with a key of its own; that key is encrypted with the master and stored alongside the
data.

Three advantages:

**The master key never touches the data.** It can live in a security module that does not export it.

**Rotating the master is cheap.** It is enough to re-encrypt the data keys — which are small — without
touching the data.

**The scope of a compromise is limited.** A leaked data key compromises only what it encrypted.

### Rotation without re-encrypting everything

Rotating the key that encrypts terabytes is unviable if it requires re-encrypting everything.

With enveloping, the old data stays encrypted with its data keys, and only the envelope changes. New data
uses the new master key.

That requires **the key version to be stored alongside the data** — to know what to decrypt with. It is a
small detail whose absence makes rotation impossible later.

### The old keys cannot be discarded

A direct consequence of the previous point: as long as data encrypted with a key exists, the key needs to
exist.

Discarding an old key "because we rotated" makes its data permanently unreadable. That has happened in real
systems, and there is no recovery.

Discarding is only safe after re-encrypting everything that depended on it — or when the discard is
**intentional**, as in per-subject encryption for deletion.

### A security module and a managed service

**A hardware security module.** The key never leaves in readable form; operations happen inside the device.
High cost, a regulatory requirement in some sectors.

**A managed key service.** The provider operates the module; you call the API. It covers most cases at a
fraction of the cost and the operations.

**A key in a file or a variable.** Acceptable only when the threat model justifies it, and it rarely
justifies it.

The practical recommendation: a managed service, absent a specific requirement. See
[managed services](/09-cloud-architecture/managed-services.md).

### Separation of duties

Whoever administers the storage should not be able to use the key. Whoever can use the key should not be
able to change its policy.

Without that separation, the encryption does not protect against the administrator — which is frequently
the threat it was meant to address.

In practice: key policies and data policies under the control of distinct roles, with usage audited.

### Compromise and loss require different plans

**Compromise.** The key leaked. Response: rotate, re-encrypt what is viable, and assess what was exposed.
It requires knowing **what that key encrypted**, which is information that needs to exist beforehand.

**Loss.** The key vanished. There is no technical response. The prevention is a backup of the key — which
is itself a problem, because the copy needs the same protection.

Managed services solve loss with durability and versioning. Self-managed keys require an explicit
procedure, typically with custody split among people.

### A signing key deserves separate treatment

A key that signs [tokens](/10-security/jwt.md), artifacts or updates has a different property:
compromising it allows **forging**, not just reading.

An attacker with the token signing key issues valid tokens for any user, with any permission, and no
verification detects it.

That is why those keys justify greater protection, more frequent rotation and support for multiple valid
keys — so that the rotation does not invalidate everything at once. See
[supply chain trust](/10-security/supply-chain-trust.md).

## Mental Model

**The security of the encryption is the security of the key.** Everything else is an implementation detail.

## When to Use

Explicit management is necessary whenever there is encryption. Priority when:

- There is field-level encryption.
- There is a regulatory requirement about custody.
- Keys are used for signing.
- There is a need for deletion by discarding a key.
- Multiple systems share encrypted data.

## When Not to Use

**A key alongside the encrypted data.**

**A key in code or in a repository.**

**Rotation without storing the key version** alongside the data.

**Discarding an old key** before re-encrypting.

**With no separation between administering and using.**

**With no plan for loss.** Optimism is not a strategy.

**A hardware module with no requirement that justifies it.** High cost and operations.

## Alternatives

- **A managed key service** — the reasonable default.
- **The platform's transparent encryption** — when the threat model is access to the medium. See
  [encryption](/10-security/encryption.md).
- **Tokenization** — the data leaves the system; the key stops being a local problem.
- **Not encrypting and not storing** — the only way not to have a key to manage.

## Trade-offs

| A managed service | Self-managed |
|---|---|
| The provider's durability and availability | Your responsibility |
| Auditing ready | To be built |
| A cost per operation | An operations cost |
| Provider dependency | Control |

| Enveloping | A single key |
|---|---|
| Cheap rotation | Re-encrypt everything |
| Limited compromise | Total |
| Additional complexity | Simple |

## Failure Modes

**A lost key.** Unrecoverable data.

**An old key discarded.** Old data unreadable.

**A version not recorded.** Impossible to know what to decrypt with.

**A key alongside the data.**

**A compromised signing key.** It allows forging.

**The key service unavailable.** Nothing decrypts — the system stops.

**No inventory.** You do not know what each key encrypts, and the compromise cannot be assessed.

## Common Mistakes

**Not storing the key version with the data.** After the first rotation, there is no way to know which key
decrypts which record, and rotation comes to require re-encrypting everything at once.

**Not planning rotation before encrypting.** Rotating is easy when anticipated and almost impossible when
not: with no versioning and no key coexistence, the swap becomes an unavailability window over the whole
dataset.

**Not maintaining a key-to-data inventory.** Without knowing what each key protects, there is no way to
assess a compromise's impact or to decide the response order.

**Storing the key in the same place as the data.** It nullifies the protection — whoever gets access to the
storage gets both.

**Not separating administration from use.** Whoever uses the key to decrypt does not need to be able to
export it or delete it. Without that separation, compromising the application becomes compromising the
cryptographic material.

**Treating a signing key as an ordinary key.** Compromising an encryption key exposes data; compromising a
signing key allows forging identity and authorization — damage of a different and greater nature.

## Real-World Example

A financial institution encrypted customer documents in object storage, with a symmetric key stored in the
application's configuration.

Three problems appeared over four years:

**Impossible rotation.** The key was never rotated, because rotating would require re-encrypting 14 million
documents — estimated at three weeks of processing and a high read and write cost. The key was four years
old.

**No version.** An earlier partial rotation attempt left around 200,000 documents encrypted with an
intermediate key, and there was no record of which ones. They were unreadable until somebody, months later,
found the old key in a decommissioned configuration repository.

**The key accessible to whoever administered the storage.** The same team could read the objects and obtain
the key. The encryption did not protect against the administrator, which was precisely the threat cited in
the project's justification.

The reformulation:

**Enveloping.** Each document came to have its own key, encrypted by a master key in a managed service.
Rotating the master became an operation of minutes.

**The key version** written into each object's metadata. The migration required attempting decryption with
each known key to classify the archive — and that is how the 200,000 documents were identified.

**Separation of duties.** The master key's policy came to be controlled by a role distinct from the one
administering the storage, with usage audited.

**An inventory** of key to dataset, maintained automatically.

And a discovery during the migration: **the key was in a backup of the configuration**, stored in the same
object storage it protected.

The recorded lesson: the decision to encrypt had been well made and well justified. Nothing beyond it was
decided — and four years later the system had encryption with none of the properties encryption was
supposed to deliver.

## Related Concepts

- [Encryption](/10-security/encryption.md) — what the key protects.
- [Secrets](/10-security/secrets.md) — the broader category.
- [Data Protection](/10-security/data-protection.md).
- [JWT](/10-security/jwt.md) — signing keys.

## Practical Exercise

For each cryptographic key in your system, answer: where is it, who can use it, when was it rotated, and
what happens if it vanishes right now.

The last question usually has no answer, and it is the one that produces permanent loss.

## Interview Questions

- How does enveloping make rotation viable?
- Why does the key version need to be stored with the data?
- Why does a signing key deserve different treatment?

## Further Reading

- NIST SP 800-57 — recommendations for key management.
- Ferguson, Niels; Schneier, Bruce; Kohno, Tadayoshi. *Cryptography Engineering*. Wiley, 2010.
- The major providers' managed key service documentation.

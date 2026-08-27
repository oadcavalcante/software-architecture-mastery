# Software Architecture Mastery

[Português](README.md) · [English](README.en-US.md)

A learning path for Software Engineers who want to think like Software Architects.

The goal is not to teach patterns, frameworks, or cloud services. It is to develop
architectural reasoning:

```text
Understand the problem
        ↓
Identify constraints
        ↓
Evaluate alternatives
        ↓
Reason about trade-offs
        ↓
Make architectural decisions
        ↓
Communicate and defend those decisions
        ↓
Evolve the architecture over time
```

## Project status

**Phase F1 — backbone complete.** All 23 sections exist with index pages that
explain the whole path, navigation is grouped by the seven levels, and the
glossary, maturity model, and terminology policy are published. The individual
topics within each section have not been written yet.

The full plan — quality standard, translation policy, and completion criteria —
lives in **[SPEC.md](SPEC.md)** (Portuguese). Per-document status is in
**[ROADMAP.md](ROADMAP.md)**.

## The seven levels

```text
LEVEL 01 — Foundation               Why does architecture exist?
        ↓
LEVEL 02 — Software Design          How to structure code and domain?
        ↓
LEVEL 03 — System Design            How to go from requirements to a system?
        ↓
LEVEL 04 — Distributed Systems      Why are distributed systems hard?
        ↓
LEVEL 05 — Architecture             How do the disciplines combine?
        ↓
LEVEL 06 — Enterprise Architecture  How to architect above a single system?
        ↓
LEVEL 07 — Architecture Leadership  How to decide and influence?
```

The corresponding progression of capability:

```text
code → design → systems → distributed systems → architecture → enterprise → strategy
```

## Who it is for

A Software Engineer with 3+ years of experience, comfortable with a backend
language, a relational database, and HTTP APIs, who has shipped software to
production and now needs to reason about systems larger than their own service.

This is not material for people learning to program. It assumes fluency in code.

## Languages

**Portuguese (pt-BR) is the canonical language.** English is translated
progressively and never blocks new content. Untranslated pages fall back to
Portuguese.

Per-document translation status is in [ROADMAP.md](ROADMAP.md).

## Running locally

```bash
npm install
npm start                     # pt-BR at http://localhost:3000
npm start -- --locale en-US   # en-US
npm run build                 # production build, both locales
npm run validate              # all content validators
npm run roadmap               # regenerate ROADMAP.md tables
```

The Docusaurus dev server builds one locale at a time; the production build
generates all of them.

## Validation

Content is checked automatically on every PR — links and anchors, front matter
schema, an acyclic prerequisite graph, translation parity, terminology
consistency, and no incomplete content marked as done.

```bash
npm run validate
```

The criteria are in [SPEC.md §13](SPEC.md).

## Philosophy

Fifteen principles govern the material. The ones that most determine what gets
in and what does not:

- **Architecture is about decisions and trade-offs.** There is no universally
  better architecture; there is fit to constraints.
- **Complexity must be justified.** Distribute only when necessary.
- **Technology serves architecture, it does not define it.** The principle comes
  first; the tool illustrates.
- **Documentation explains why**, not only what.
- **Studying failed decisions** matters as much as studying successful ones.

In practice, most documents end with a decision **conditioned on constraints**
rather than with a recommendation. Material that hands over conclusions without
the conditions trains the opposite of what this path develops.

## What you should be able to do by the end

Receive *"Design the architecture for a high-volume payment platform"* and, in
place of drawing boxes, work through:

```text
What is the business problem?
        ↓
What are the functional requirements?
        ↓
Which quality attributes matter, and at what number?
        ↓
What constraints exist?
        ↓
What are the architecture options?
        ↓
What trade-offs exist between them?
        ↓
Which architecture fits the constraints?
        ↓
How should the system evolve?
        ↓
How do I communicate and defend this decision?
```

## How to progress

The path is linear by construction, but nobody starts from zero. The
[how to use](docs/how-to-use.md) guide has an entry-point table by current
experience.

To locate yourself by capability — rather than by content read — use the
[maturity model](docs/maturity-model.md), which defines six stages by the
decision a person makes on their own.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) (Portuguese) for the writing standard,
front matter schema, terminology policy, and translation workflow.

The rule that governs everything: the material teaches architectural reasoning,
not memorization. A contribution that presents a solution without its problem,
or a pattern without discussing when not to use it, is rejected.

## License

Content under [CC BY-SA 4.0](LICENSE). Code under [MIT](LICENSE-CODE).

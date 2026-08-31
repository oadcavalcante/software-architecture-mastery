---
id: legacy-refactoring
title: Legacy Refactoring
sidebar_position: 6
description: Improving the structure without understanding everything — with characterization tests as the net.
doc_type: concept
level: 6
difficulty: advanced
status: complete
objective: >
  By the end, the reader refactors legacy code safely, starting by creating the net that
  makes it possible.
prerequisites: [legacy-systems]
related: [legacy-systems, incremental-modernization, rebuilding]
canonical_for: []
translated_from_version: 1
last_reviewed: 2026-08-31
---

# Legacy Refactoring

## Overview

Refactoring legacy code has a circular problem: refactoring safely requires tests; and
writing tests frequently requires refactoring the code to make it testable.

The way out of that cycle is the set of techniques from
[Feathers](https://en.wikipedia.org/wiki/Michael_Feathers): **characterization tests** to
capture the current behavior, and **seams** to insert test points without altering
behavior.

That makes it possible to improve the structure of a system nobody fully understands —
which is the real situation.

## Problem

Legacy code resists change through characteristics that reinforce each other:

```text
no tests              any change is risky
hard to test          rigid dependencies, no injection points
long methods          many responsibilities, hard to isolate
global state          behavior depends on invisible things
unknown behavior      nobody knows what should happen
```

The temptation, faced with that, is to rewrite. See
[rebuilding](/16-legacy-modernization/rebuilding.md) — it is more expensive and riskier than it looks.

## Core Concepts

### A characterization test captures what exists

```text
conventional test      "the result should be 42"
characterization test  "the result is 42" — whether that is right or wrong
```

It does not judge the behavior. It **freezes** it, so that any accidental change shows
up.

The procedure:

```text
1. write a test that calls the code
2. use an assertion that will fail
3. run it; the failure shows the real value
4. adjust the assertion to the real value
5. repeat for the cases that matter
```

That looks strange — writing tests that assert the current behavior, including the wrong
behavior — and that is exactly the point: you don't know what is right, and you need
protection before changing anything.

And the resulting tests are documentation: the executable description of what the system
does, derived from it.

### Seams: where to insert the test point

A seam is a place where behavior can be altered without editing the code at that point.

```text
by parameter    extract the dependency into an argument
by inheritance  make the method overridable, and override it in the test
by interface    extract an interface, inject a test implementation
by linking      replace the implementation at load time
```

The technique that opens up most cases: **extract and override**. The problematic
fragment — a call to an external system, a clock access, a file read — is extracted into
a method, which the test overrides.

The change is minimal and mechanical, and it makes the code testable without changing the
behavior.

### Start with what is going to change

Refactoring the whole system is a project; refactoring what you are about to touch is
work.

```text
bad    "let's refactor the billing module"
good   "let's change the discount calculation; first, we characterize and isolate"
```

See [incremental modernization](/16-legacy-modernization/incremental-modernization.md).

That concentrates effort where it pays off: the modules that change frequently are the
ones causing cost. The ones that don't change can stay ugly indefinitely.

And it has a practical consequence: the refactoring happens inside the product work,
without competing for budget.

### The safe-change method

The sequence Feathers formalizes:

```text
1. identify the change points
2. find the test points
3. break dependencies
4. write the tests
5. make the change and refactor
```

Steps 2 and 3 are the ones people skip, and they are the ones that make step 5 safe.

And the order matters: breaking dependencies **before** writing the tests, with mechanical
and verifiable changes, is what avoids introducing a defect while trying to create the
protection.

### Mechanical changes first

Refactorings the tool performs — rename, extract method, move — are safe even without
tests, because the tool guarantees equivalence.

Using them to make the code comprehensible **before** any behavior change is a cheap
path:

```text
extract a method from a long block
name the variable that was 'tmp2'
extract the complex condition into a named method
```

Each one makes the code more readable with no risk, and the resulting understanding is
what makes it possible to decide what to do.

### When to stop

Legacy refactoring never ends — it is continuous. What needs a criterion is when to stop
within a session:

```text
the code is good enough for the change that has to be made
```

Chasing the ideal turns a two-day change into a two-week one, and the review becomes
impossible.

See [incremental modernization](/16-legacy-modernization/incremental-modernization.md) — the limit of opportunistic
refactoring.

## Mental Model

**Capture the behavior before changing it.** The net comes first; the improvement comes
after.

## When to Use

- The domain model is right, and the code structure is not.
- The system has to keep changing.
- Rewriting is too expensive or too risky.
- Before any change to code with no coverage.
- To preserve the embedded knowledge.

## When Not to Use

**When the domain model is wrong.** Refactoring better organizes something that should
not exist in that form. See
[rebuilding](/16-legacy-modernization/rebuilding.md).

**Without characterization tests**, in code with no coverage.

**Refactoring the whole system** instead of what you are about to touch.

**Chasing the ideal** in a working session.

**When the system will be discontinued** soon.

## Alternatives

- **[Rebuilding](/16-legacy-modernization/rebuilding.md)** — when the model is wrong.
- **Containment** — isolate the legacy system behind an interface, without improving it
  internally. See
  [anti-corruption layer](/08-integration-architecture/integration-anti-corruption.md).
- **Freeze** — stop changing the module, build the new one outside.
- **Do nothing** — when the module doesn't change.

## Trade-offs

| Refactor | Rebuild |
|---|---|
| Preserves embedded knowledge | Loses it |
| Incremental, continuous value | Value at the end |
| Model kept | New |
| Low risk | High |
| Doesn't fix a wrong model | Fixes it |

| Characterize first | Change directly |
|---|---|
| Accidental changes show up | They slip through |
| Cost before the change | None |
| Documentation as a result | None |

## Failure Modes

**Accidental behavior change.** Without characterization.

**Refactoring that becomes a project.** With no stopping criterion.

**Fragile characterization tests.** They capture implementation detail and break on every
legitimate change.

**A seam that alters behavior.** The extraction introduced a defect.

**Refactoring what doesn't change.** Effort with no return.

**Refactoring a wrong model.** It better organizes the wrong thing.

## Common Mistakes

**Changing before characterizing.**

**Trying to understand everything before starting.**

**Refactoring the whole system.**

**Not using mechanical refactorings** to make the code readable first.

**Not limiting the session's scope.**

**Characterizing implementation detail** instead of observable behavior.

## Real-World Example

A logistics company had a shipping cost module — 4,000 lines, a main method of 900, with
no tests at all.

Changes there took weeks and produced defects frequently. The internal proposal was to
rewrite.

The approach chosen was refactoring, starting with a change the business needed: adding a
new shipping option.

**Week 1 — characterization.** Tests written over the current behavior, with real inputs
extracted from production. There were 220 cases, covering the combinations of option,
region, weight and customer.

The characterization revealed six behaviors nobody knew about — including a discount
applied to three specific customers, with identifiers in the code, with no comment.

**Week 2 — seams.** Three rigid dependencies were extracted: the price table lookup, the
call to the distance service, and reading the date. Each extraction was mechanical,
verified by the characterization tests.

**Week 3 — mechanical refactoring.** The 900-line method was decomposed into 14 named
methods, using automated extraction. No behavior change; the tests kept passing.

Only at that point did the code become comprehensible — and the revealed structure showed
that the calculation had three clear stages that had been interleaved.

**Week 4 — the change.** The new option was added in about 40 lines, at an extension
point the decomposition had made obvious.

Total: 4 weeks, against an estimate of 6 months to rewrite.

And the lasting effect: subsequent changes to the module started taking days. The 220
characterization tests stayed as a net, and were gradually replaced by conventional tests
as the correct behavior was established with the business.

The discount for the three customers was investigated: it was a commercial agreement from
2011, still valid. It was moved into configuration, and the business became able to
change it.

What was recorded afterwards: the first three weeks delivered nothing visible, and they
were what made the fourth possible. The proposal to rewrite would have discarded the six
unknown behaviors — including the active commercial agreement.

## Related Concepts

- [Legacy Systems](/16-legacy-modernization/legacy-systems.md) — the embedded knowledge.
- [Rebuilding](/16-legacy-modernization/rebuilding.md) — when refactoring is not enough.
- [Incremental Modernization](/16-legacy-modernization/incremental-modernization.md).
- [Refactoring](/02-software-design/refactoring.md) — the fundamentals.

## Practical Exercise

Choose a piece of untested code your team has to change soon.

Write a characterization test before any change — using the procedure of letting it fail
to discover the real value. What you find is usually surprising.

## Interview Questions

- What does a characterization test do that a conventional test does not?
- What is a seam, and why does it solve the circular problem?
- Why do mechanical refactorings come before the others?

## Further Reading

- Feathers, Michael. *Working Effectively with Legacy Code*. Prentice Hall, 2004.
- Fowler, Martin. *Refactoring*. 2nd ed. Addison-Wesley, 2018.
- Bernhardt, Gary. *Boundaries*, 2012.

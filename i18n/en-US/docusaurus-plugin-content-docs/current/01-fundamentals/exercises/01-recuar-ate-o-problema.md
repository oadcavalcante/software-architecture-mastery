---
id: 01-recuar-ate-o-problema
title: "Exercise 01 — Back Up to the Problem"
sidebar_position: 1
description: The first exercise on the path — separating problem from solution, turning a wish into a number and enumerating what nobody enumerated.
doc_type: exercise
level: 1
difficulty: beginner
status: complete
objective: >
  By the end, the reader backs a request wrapped in a solution up to the problem, converts vague
  attributes into verifiable requirements and enumerates alternatives with the winning condition for
  each one.
prerequisites: [problem-space]
related: [solution-space, non-functional-requirements, constraints, business-context]
canonical_for: []
translated_from_version: 1
last_reviewed: 2026-08-31
---

# Exercise 01 — Back Up to the Problem

## Context

You joined a fleet management company three weeks ago. The product tracks corporate customers'
vehicles — carriers, distributors, rental companies — and today serves 340 companies, with around 28
thousand vehicles tracked.

On Thursday, the product director calls you in and says:

> *"We need a real-time dashboard of every vehicle. And it has to be fast and reliable, because big
> customers don't tolerate slowness. Can you estimate it?"*

The team has six engineers. There is a working system that receives positions by telemetry every two
minutes and writes them to a relational database. The deadline mentioned is "before the industry trade
show", in five months.

This is the first exercise on the path, and it is not about designing architecture. It is about what
happens **before** designing — and it is the stage that decides whether the design will solve the right
problem.

## Requirements

The request, as it was received, contains three things of different natures, tangled together:

- A **solution** already chosen ("a real-time dashboard").
- Two **quality attributes** with no numbers ("fast", "reliable").
- A **time constraint** with an external consequence ("before the trade show").

Your job is to untangle the three and find out what is missing.

## Constraints

```text
team                     6 engineers, none dedicated to data
current system           telemetry every 2 min, a single relational
                         database, no history beyond 90 days
customers                340 companies; the largest has 4,100 vehicles,
                         the median has 26
deadline mentioned       5 months, anchored to an industry trade show
budget                   was not mentioned, and nobody asked
```

The last line is the most important in the brief. A cost not mentioned is not a cost that doesn't exist
— it is a cost nobody checked, and it usually shows up after the decision.

## Your Task

Produce, in up to an hour, a one-page document with four parts:

1. **The problem statement**, backed up until it mentions no mechanism. It has to survive a complete
   change of stack.

2. **Two non-functional requirements** derived from "fast" and "reliable", each with a metric, a
   number, a window and a consequence. Where you don't know the number, write the question that would
   get it and from whom.

3. **Four alternatives**, including "do nothing", each with the condition under which it wins. An
   alternative with no declared winning condition doesn't count.

4. **The list of constraints**, separating the real ones from the preferences. For each, what happens
   concretely if it is violated.

Don't draw components. Don't choose technology. If you end up with a diagram, re-read the brief.

## Questions You Should Be Asking

Before deciding anything:

```text
who looks at this dashboard, and how often?
what decision does that person make when they look? and with what delay
  is that decision still the same?
what do they do today, with no dashboard?
does "real time" mean seconds, minutes, or "fresher
  than today"?
what happens, in money, if it is down for an hour?
is the trade show a launch deadline or a demo deadline?
```

The second and the fourth decide almost everything. The second because it converts "real time" into a
number, and the fourth because it reveals that "real time" may never have been the requirement.

The last is the one nobody asks, and it can reduce the scope by 80%: demonstrating at a trade show and
operating in production are different problems, with costs that differ by an order of magnitude.

## Assessment Criteria

Your answer is good if:

- **The problem statement does not contain the word "dashboard".** If it does, you documented the
  director's solution, not their problem. The problem is probably something like *"operators don't know
  which vehicles need action now"* — and an alert, not a panel, is a possible answer to that.

- **The requirements have a consequence, not just a number.** "P95 under 400 ms" is better than "fast"
  and still insufficient: with no consequence, the number is arbitrary and doesn't survive the first
  conversation about cost.

- **"Do nothing" appears with an honest winning condition.** It exists: if the decision the operator
  makes is the same with two-minute-old data and with two-second-old data, the current system already
  meets the need and the whole effort is unnecessary.

- **Some declared constraint was reclassified as a preference.** There is at least one in the brief. If
  your six constraints are still six constraints, you didn't apply the test.

- **The telemetry frequency appears in your analysis.** The system receives positions every two minutes.
  No dashboard over that data is more "real time" than two minutes, and that bounds the problem before
  any technical decision. Whoever missed it will propose WebSockets to transmit stale data.

Your answer is weak if it contains an architecture. Not because architecture is wrong, but because it
wasn't what was asked — and producing a design before having a stated problem is exactly the habit this
path exists to undo.

## Discussion

:::details Open after trying

**The question that changes the whole project is the fourth.** "Real time" almost never means real time.
It means "fresher than it is today", and what it is today is frequently a daily report. The distance
between "two minutes" and "two seconds" costs an entire architecture; the distance between "one day" and
"two minutes" is already solved.

**The telemetry frequency is a ceiling.** Data that arrives every two minutes does not get fresher by
being transmitted faster. Whoever proposes WebSockets here is optimizing the stretch that is not the
bottleneck — and the bottleneck, if there is one, is in the embedded device and its data plan, which
cost orders of magnitude more to change.

**The constraint that was a preference is the deadline.** "Before the trade show" looks temporal and
external, but the question *is it a launch deadline or a demo deadline?* usually reveals that the trade
show needs one screen working for three customers, not a system operating for 340. Those are different
projects, and the second one can happen later.

**The customer distribution matters more than the average.** The median has 26 vehicles; the largest has
4,100. A solution sized by the average serves both badly: it is excess for 340 customers and a shortfall
for one. That suggests the right question is not "how many vehicles do we support", but "does the large
customer behave the same as the small one?" — and frequently it doesn't: whoever has 4,100 vehicles
doesn't look at a map, they look at exceptions.

**What "reliable" probably means here.** It isn't the dashboard's availability. It is that the position
shown isn't wrong — a vehicle displayed somewhere it isn't causes a wrong decision, which is worse than
no information. That shifts the requirement from availability to declared correctness and freshness,
which changes the architecture: it becomes necessary to display the data's age, and not only the data.

**On the budget that wasn't mentioned.** Operating cost is a quality attribute like any other, and
frequently the most restrictive. Six engineers with nobody dedicated to data is a hard organizational
constraint: a solution that requires operating a streaming system is not going to exist, regardless of
being technically right.

**The most common outcome of this exercise in practice.** Backing up produces an alert — not a dashboard
— for a short list of conditions that require action, with the existing panel kept for lookups. It costs
a fraction, solves the stated problem, and leaves time to find out whether the dashboard was necessary.

It is worth noting what backing up does **not** do: it does not reject the dashboard. If the answers show
that operators do watch screens continuously and that the decision changes with seconds of delay, the
dashboard wins — and it wins now by comparison, with verifiable requirements, instead of by having been
the first thing said.

:::

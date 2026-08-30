---
id: how-to-use
title: How to Use
sidebar_position: 2
description: How to work through the material, how much time to give it, and what to do with the exercises.
doc_type: index
level: 0
difficulty: beginner
status: complete
objective: >
  By the end, the reader knows where to enter the path given their current
  experience, and how to use the exercises and case studies.
prerequisites: []
related: []
canonical_for: []
translated_from_version: 1
last_reviewed: 2026-08-29
---

# How to Use

## Where to enter

The path is linear by construction, but nobody arrives at zero. Use the table to
find an honest entry point.

| If you… | Start at |
|---|---|
| Ship features and want to understand structural decisions | Level 01, from the beginning |
| Structure code well but have never designed a whole system | Level 01 skimmed, then Level 02 |
| Have designed systems, but only monolithic ones | Level 03, returning to 01 when vocabulary is missing |
| Work with distributed systems and want to close gaps | Level 04, then the Level 05 disciplines you lack |
| Are preparing for system design interviews | Level 03, then section 22, then the case studies |
| Are an architect wanting to work above the system | Levels 06 and 07, using the rest as lookup |

Skipping levels is legitimate. What does not work is skipping and never returning
when a concept shows up as an assumption — every document declares its
prerequisites precisely to make that visible.

## Pace

There is no deadline. There is a trap: reading too fast produces recognition
without capability. You read about eventual consistency, you agree, and six
months later you cannot decide whether your case tolerates it.

The signal that the pace is right is being able to apply the concept to a system
you know. If you cannot, reread — or go to the exercise, which exists precisely
to force that.

## The exercises

Exercises are not reading checks. They are where the reasoning happens.

Each one carries a collapsed **Discussion** section. It is not an answer key: it
is one possible line of reasoning, with its assumptions stated. Opening it before
trying wastes the exercise, because the value lies in discovering which
constraint you had not considered — and that only surfaces after you have
considered some.

Exercises 02 through 06 share one system and evolve it. Do them in sequence: the
central lesson is feeling the cost of decisions taken early.

## The case studies

Same rule, stronger. Read context, requirements and constraints. **Stop before
the architecture options.** Sketch your own in twenty minutes. Only then
continue.

The goal is not to be right. It is to compare your framing of the constraints
with the one in the text.

## About the trade-offs

Section 20 is the conceptual backbone of the material. If you only have time for
one section, that is the one — but it pays much more after Level 04, because half
of the trade-offs listed there only exist in distributed systems.

## What this material does not do

It does not hand you answers. Most documents end with a decision conditioned on
constraints, not with a recommendation.

That is deliberate. The capability this path develops is precisely stating those
conditions — and material that delivers conclusions without them trains the
opposite habit.

## Language

The canonical content is in Portuguese. The English version is translated
progressively; pages not yet translated fall back to Portuguese with a notice.
The per-document state lives in the roadmap.

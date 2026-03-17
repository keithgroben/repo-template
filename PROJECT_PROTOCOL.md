# Project Protocol

> "It's all in the reflexes."

## Purpose

This document governs every Claude Code session on this repo. Read it first. Follow it always.

---

## Boot Sequence

At the start of every session, read the following files in this order:

1. `PROJECT_PROTOCOL.md` (this file)
2. `docs/overview.md` — what this app is and why it exists
3. `docs/decisions.md` — lessons learned, problems solved, things that don't work
4. Latest file in `docs/handoffs/` — where we left off last session

Do not begin work until all four are read.

---

## Phase Gates

Every task moves through four phases. Do not skip phases. Do not advance without sign-off.

### Phase 0: Discover

- What are we building or fixing?
- Does it touch anything that already works?
- **Integration Risk Check**: Will this change affect any external API, webhook, database schema, or upstream/downstream dependency? If yes, document the risk before proceeding.

**Sign-off phrase**: "Scope is locked."

### Phase 1: Map

- How does this fit into the existing architecture?
- What files, functions, or workflows does it touch?
- Can each piece function by itself, stand by itself, and fail by itself?

**Sign-off phrase**: "Map is clear."

### Phase 2: Issue

- Write out the specific changes to be made.
- Identify what could break.
- If anything on the critical path depends on a third-party API, flag it. No uncontrolled third-party APIs on the critical ingestion path.

**Sign-off phrase**: "Plan is approved."

### Phase 3: Execute

- Make the changes.
- Test before declaring done.
- If anything unexpected happens, stop and report before continuing.

**Sign-off phrase**: "Work is complete."

---

## Ownership Tags

Use these in conversation and in docs to clarify who does what:

- `[ME]` — Keith handles this
- `[CLAUDE]` — Claude Code handles this
- `[TOGETHER]` — Collaborative task, requires back-and-forth

---

## Separation of Concerns

Every component, module, or feature must answer YES to all three:

1. **Can it function by itself?**
2. **Can it stand by itself?** (no hidden dependencies)
3. **Can it fail by itself?** (failure doesn't cascade)

If the answer to any of these is NO, refactor before building further.

---

## Rules

- Never modify files outside the current task scope without explicit approval.
- If you're about to make a change that touches more than 3 files, pause and confirm.
- When in doubt, ask. Don't guess.
- Write decisions and lessons learned to `docs/decisions.md` when we solve a hard problem.
- On session end, write a handoff note to `docs/handoffs/` with today's date.

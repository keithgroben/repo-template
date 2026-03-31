# Project Protocol

> "It's all in the reflexes."

## Purpose

This document governs every Claude Code session on this repo. Read it first. Follow it always.

---

## Boot Sequence

At the start of every session, read the following files in this order:

1. `PROJECT_PROTOCOL.md` (this file)
2. `AI_HANDOFF.md` — **read this first before anything else**. Current feature, status, and exactly what to do next.
3. `git log --oneline -10` — recent history
4. `git diff HEAD~1` — last committed change
5. `CLAUDE.md` — app-specific context, schema, APIs, migration status
6. `docs/overview.md` — what this app is and why it exists
7. `docs/decisions.md` — lessons learned, problems solved, things that don't work

**For migration sessions**, also read:
8. `docs/migration-checklist.md` — step-by-step process
9. `docs/migration-waves.md` — wave order, dependencies, blockers

Do not begin work until `AI_HANDOFF.md` has been read.

> Multiple models may be running concurrently in separate terminals on the same branch. See `docs/ai-collaboration.md` for the full pipeline.

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

## Migration Sessions

> These rules apply when the current session is migrating an app from n8n to Hono (v1.x → v2.0).

### Before starting migration work

1. Read `CLAUDE.md` — the Migration Status section tells you the wave, current/target state, and what workflows to replace.
2. Read `docs/migration-checklist.md` — follow it step by step.
3. Read `docs/migration-waves.md` — understand blockers and dependencies for this wave.
4. Check that any blocking apps (listed in CLAUDE.md → "Blocked by") have already shipped their v2.0.

### Migration-specific constraints

- **One workflow at a time.** Migrate a single n8n workflow to a Hono route, test it end-to-end, then move to the next. Never migrate multiple workflows in parallel.
- **n8n stays running.** Do not stop, delete, or modify n8n workflows during migration. Only deactivate a workflow AFTER its Hono replacement is tested and verified in production.
- **Parallel testing.** During migration, both the old n8n route and the new Hono route may be live. The SPA switches to the Hono route when ready. Verify the new route before switching.
- **48-hour bake.** After all workflows for an app are migrated and verified, wait 48 hours of production monitoring before starting the next app.
- **Dev branch.** All migration work happens on `dev/v2.0`. Never commit migration changes directly to main.

### Migration phase gates

The standard Phase 0–3 gates apply, with these migration-specific additions:

| Phase | Migration addition |
|-------|-------------------|
| Phase 0 (Discover) | List all n8n workflows and their IDs. Audit git history for secrets. |
| Phase 1 (Map) | Map each n8n workflow to its Hono route equivalent. Document the mapping. |
| Phase 2 (Issue) | Write the route handler code. Identify what could break during switchover. |
| Phase 3 (Execute) | Migrate one workflow, test, switch SPA, verify, deactivate n8n workflow. Repeat. |

---

## Session End

Before ending any session:

1. Update `AI_HANDOFF.md` — fill every field. Set `Next Model` and `What To Do Next` clearly.
2. Commit all changes including `AI_HANDOFF.md`
3. Push to branch

The next model — whether Haiku, Sonnet, or Opus — will read `AI_HANDOFF.md` cold. Write it accordingly.

---

## Rules

- Never modify files outside the current task scope without explicit approval.
- If you're about to make a change that touches more than 3 files, pause and confirm.
- When in doubt, ask. Don't guess.
- Write decisions and lessons learned to `docs/decisions.md` when we solve a hard problem.
- Never start a session without reading `AI_HANDOFF.md` first.
- Never end a session without updating `AI_HANDOFF.md` and pushing.

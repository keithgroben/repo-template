# AI Collaboration Framework

> Read this at session start. Governs how multiple AI models collaborate on this project without human handoff notes.

---

## Model Roster

| Model | Role | Terminal |
|-------|------|----------|
| Cursor + Sonnet 4.6 | Roadmap planning, architecture, feature spec writing | Cursor (local) |
| Claude Haiku 4.5 | Feature implementation — bite-sized atomic tasks | Terminal 1 |
| Claude Sonnet 4.6 | Code review, iteration with human, verification | Terminal 2 |
| Claude Opus 4.6 | Escalation only — called when Sonnet cannot resolve | Terminal 3 |

---

## Session Boot — Any Model

Run these in order before touching any code:

```bash
git pull origin $(git branch --show-current)
```

Then read in this order:

1. `AI_HANDOFF.md` — your briefing. This tells you what's in progress and exactly what to do.
2. `git log --oneline -10` — see recent history
3. `git diff HEAD~1` — see the last committed change
4. `CLAUDE.md` — app context (if not already read this session)
5. `docs/overview.md` — what this app is (if not already read this session)

**Do not start work until you have read AI_HANDOFF.md.**

---

## Session End — Any Model

Before you stop or pass to the next model:

1. Update `AI_HANDOFF.md` — fill every field. This is how the next model picks up cold.
2. Stage and commit all changes including `AI_HANDOFF.md`
3. Push to branch

The next model will not ask you what happened. It will read the file.

---

## The Pipeline

### Normal Flow

```
Cursor + Sonnet → write roadmap (15 features ahead, Haiku-sized tasks)
  ↓
Haiku → implements one atomic task
  ↓
Sonnet → reviews, iterates with human (max 5 passes)
  ↓
Human → verifies in browser
  ↓
Done → next task
```

### Pass Rules (Sonnet Review Phase)

| Pass | Action |
|------|--------|
| 1–3 | Sonnet iterates independently, no human needed |
| 4 | Sonnet flags one specific question to human before continuing |
| 5 | If still unresolved → escalate to Opus, document exact blocker in AI_HANDOFF.md |

Pass count is tracked in `AI_HANDOFF.md → Pass Count (Sonnet)`.

### Escalation

When Sonnet hits pass 5:
1. Set `AI_HANDOFF.md → Current Status` to `[escalated-opus]`
2. Write the exact problem, error, and what was tried in `AI_HANDOFF.md → Blocker`
3. Commit and push
4. Human opens Opus terminal — Opus reads AI_HANDOFF.md and picks up

After Opus resolves (or decides it can't): human chooses to either ship the fix or defer the feature and move to the next item in the roadmap.

---

## Version Numbering

| Format | Meaning |
|--------|---------|
| `vX.Y.0` | Planned feature — goes through full Haiku → Sonnet → Human pipeline |
| `vX.Y.Z` (Z > 0) | Bug fix or small patch — may skip straight to Sonnet |

Roadmap should have 15 `vX.Y.0` features planned ahead at all times. Cursor + Sonnet keeps this list filled.

---

## Haiku Rules

Haiku works well when tasks are:

- Scoped to **1–3 files maximum**
- Written with **explicit file paths** to touch (`src/components/Foo.jsx`, not "the component")
- Written with **a pattern to follow** — e.g. "copy the pattern from `src/components/Badge.jsx`"
- Written with **exact expected output** — what the UI shows, what the API returns, what the function does
- Free of architecture decisions — Haiku executes, it does not design

If a task requires architecture decisions, Cursor + Sonnet must resolve them in the roadmap before Haiku touches code. A Haiku task that requires judgment is a poorly written task.

---

## Roadmap Task Format (Haiku-Optimized)

Every `vX.Y.0` feature in `docs/roadmap.md` must use this format:

```markdown
### vX.Y.0 — Feature Name

**Goal**: One sentence describing what ships.
**Risk**: Low / Medium / High — reason
**Status**: `[pending]` → `[haiku]` → `[sonnet-review]` → `[human-verify]` → `[done]` / `[escalated]`
**Pass Count**: 0

#### Haiku Tasks
Atomic. Each task = one focused session. Haiku should not need to read beyond CLAUDE.md to execute.

- [ ] **H1** — [Verb phrase]. Files: `path/to/file`. Pattern: `path/to/example`. Output: [exact observable result].
- [ ] **H2** — [Verb phrase]. Files: `path/to/file`. No new patterns — follows H1 output.

#### Sonnet Review Checklist
What Sonnet specifically verifies for this feature.

- [ ] [Specific check]
- [ ] [Edge case]
- [ ] Error handling: [what should happen when X fails]

#### Human Verify
What to test in the browser or via curl. Success criteria are binary (works / doesn't work).

- [ ] [Action] → [Expected result]
- [ ] [Action] → [Expected result]
```

---

## Architecture Reference

Every project repo ships with the following docs. Haiku and Sonnet should reference these instead of inferring from code:

| File | Contains |
|------|---------|
| `CLAUDE.md` | App name, DB schema, API routes, auth flow, env URLs, known gotchas |
| `docs/overview.md` | What the app does and why |
| `docs/architecture-patterns.md` | Standard patterns — how components, API calls, and DB queries are written |
| `docs/decisions.md` | Decisions already made — don't revisit these |

If a pattern isn't in these docs, it hasn't been standardized. Escalate to Sonnet before Haiku invents something.

---

## What Goes in AI_HANDOFF.md

`AI_HANDOFF.md` is the **only** cross-session state file. It is always committed. It is always current. The human never writes it — the model does at session end.

Fields:
- **Current Feature** — version + name
- **Current Status** — one of the pipeline stages
- **Last Model** — who wrote this handoff
- **Next Model** — who picks up and why
- **Pass Count** — Sonnet review iteration count
- **What Was Done** — 2–4 bullets, specific
- **What To Do Next** — specific enough that a fresh cold-start model needs nothing else
- **Files Changed This Feature** — path + one-line description
- **Blocker** — exact error or problem if stuck, empty if not

---

## Rules

- Never start a session without reading `AI_HANDOFF.md` first.
- Never end a session without updating `AI_HANDOFF.md` and pushing.
- Haiku does not make architecture decisions. If it needs to, stop and flag it.
- Sonnet does not escalate before pass 3 without a specific reason.
- Opus is not for normal work. If Opus is being used for routine tasks, something upstream broke down.
- The roadmap is the source of truth for what's next. Don't invent scope.

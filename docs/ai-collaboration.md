# AI Collaboration Framework

> Read this at session start. Governs how multiple AI models collaborate on this project without human handoff notes.

---

## Model Roster

| Model | Role | Terminal |
|-------|------|----------|
| Cursor + Sonnet 4.6 | Roadmap planning, architecture, feature spec writing | Cursor (local) |
| Claude Haiku 4.5 | Full feature implementation — executes the entire feature spec | Terminal 1 |
| Claude Sonnet 4.6 | Code review, fixes, iteration with human | Terminal 2 |
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

Think of this as a human dev team. Haiku is the junior developer who implements the full feature. Sonnet is the senior who reviews the PR and works with the human to get it to green. Opus is the architect you call when something is broken at a level the senior can't resolve alone.

### Normal Flow

```
Cursor + Sonnet → write full feature spec (roadmap, 15 features planned ahead)
  ↓
Haiku → implements the ENTIRE feature in one session (all tasks, all files)
  ↓
Haiku → commits, pushes, updates AI_HANDOFF.md
  ↓
Sonnet → reviews full output, fixes what Haiku got wrong, iterates with human (max 5 passes)
  ↓
Human → verifies in browser
  ↓
Done → Haiku picks up next feature
```

**Haiku implements the whole feature.** The tasks listed under a feature are Haiku's internal checklist — not separate sessions. Haiku does not hand off mid-feature unless it's genuinely stuck and cannot proceed without a decision.

**Sonnet does not re-implement.** Sonnet reviews, patches, and refines. If Sonnet finds itself rewriting large chunks from scratch, the feature spec was underspecified — flag it and fix the spec.

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

### Lead Assignment

Every roadmap feature gets a `**Lead**` tag. This tells which model owns the implementation.

| Tag | Model | Use for |
|-----|-------|---------|
| `[Haiku]` | Claude Haiku | New, isolated, self-contained features where scaffolding and patterns exist |
| `[Sonnet]` | Claude Sonnet | Existing file edits, multi-file integrations, wiring, code review, complex debugging |
| `[Opus]` | Claude Opus | Architectural decisions, cross-system design, when Sonnet is stuck |
| `[Me]` | Operator (Keith) | Business decisions, design approvals, real-world testing, manual triggers |
| `[Together]` | Me + Sonnet | Diagnosis sessions, debugging requiring live system state + code changes together |

The Lead tag goes on every `vX.Y.0` entry in `docs/roadmap.md`. Bug fixes (`vX.Y.Z`, Z > 0) default to `[Sonnet]` unless noted otherwise.

---

## Haiku Rules

Haiku implements full features. The goal is to have Haiku do as much of the work as possible — that's the whole compute-saving point of this pipeline.

A feature spec is written well enough for Haiku when:

- **Every file is named explicitly** — `src/components/Foo.jsx`, not "the component"
- **Every pattern is referenced** — "follow the pattern in `src/components/Badge.jsx`", not "make it consistent"
- **Every output is described exactly** — what the user sees, what the API returns, what gets written to the DB
- **No architecture decisions are left open** — Haiku executes, it does not design. If a decision is unresolved, Cursor + Sonnet resolves it in the spec before Haiku touches code.

**When Haiku gets stuck**: if Haiku hits something that requires a judgment call not covered by the spec, it should stop, document what it built so far, note the exact question in `AI_HANDOFF.md → Blocker`, and hand off to Sonnet. This is not a failure — it means the spec had a gap that Cursor + Sonnet needs to fill for next time.

A Haiku task that requires judgment is a poorly written spec, not a Haiku limitation.

---

## Roadmap Task Format (Haiku-Optimized)

Every `vX.Y.0` feature must be written so Haiku can implement the entire thing in one session without needing to ask questions. That's the spec quality bar.

**Before writing a spec, read `docs/spec-writing-guide.md`.** It explains every field, shows good vs. bad examples using this stack, and has a pre-handoff checklist.

```markdown
### vX.Y.0 — Feature Name

**Lead**: `[Haiku]` / `[Sonnet]` / `[Opus]` / `[Me]` / `[Together]`
**Goal**: One sentence — what ships and what it enables for the user.
**Risk**: Low / Medium / High — reason
**Status**: `[pending]` → `[haiku]` → `[sonnet-review]` → `[human-verify]` → `[done]` / `[escalated]`
**Pass Count**: 0

#### Implementation Brief (for Haiku)
Everything Haiku needs. No ambiguity. No architecture decisions left open.

- **Files to create or modify**: list every file by path
- **Pattern to follow**: `path/to/existing/example.jsx` — [what to copy from it]
- **Data**: [what goes in, what comes out — field names, types, API response shape]
- **Behavior**: [exact UI behavior or API behavior, step by step]
- **Do NOT**: [anything Haiku might do wrong based on the pattern — guard rails]

#### Haiku Checklist
Internal checklist Haiku works through in one session. Not separate handoffs.

- [ ] [Specific thing to build — file, function, or UI element]
- [ ] [Specific thing to build]
- [ ] [Specific thing to build]

#### Sonnet Review Checklist
What Sonnet checks after Haiku hands off. Sonnet fixes, does not rewrite.

- [ ] [Specific thing to verify]
- [ ] [Edge case or error path]
- [ ] Error handling: [what should happen when X fails]

#### Human Verify
Binary pass/fail. Works in browser or doesn't.

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

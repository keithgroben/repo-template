# Roadmap

> Last updated: YYYY-MM-DD
> Current version: `v0.1.0`

---

## Up Next

Versioned features queued for development, in priority order. Keep 15 features planned ahead.
See `docs/ai-collaboration.md` for the Haiku → Sonnet → Human pipeline these feed into.

---

### vX.Y.0 — [Feature Name]

**Goal**: [One sentence — what ships and what it enables]
**Risk**: Low / Medium / High — [reason]
**Status**: `[pending]`
**Pass Count**: 0

#### Haiku Tasks
*Atomic. 1–3 files each. Pattern references included. No architecture decisions required.*

- [ ] **H1** — [Verb phrase]. Files: `src/path/to/file.jsx`. Pattern: `src/components/Example.jsx`. Output: [exact observable result].
- [ ] **H2** — [Verb phrase]. Files: `src/path/to/file.jsx`. Follows H1. Output: [exact observable result].

#### Sonnet Review Checklist
- [ ] [Specific thing to verify]
- [ ] [Edge case to test]
- [ ] Error handling: [what happens when X fails]

#### Human Verify
- [ ] [Action in browser] → [expected result]
- [ ] [Action in browser] → [expected result]

---

### vX.Z.0 — [Feature Name]

**Goal**: [One sentence]
**Risk**: Low / Medium / High — [reason]
**Status**: `[pending]`
**Pass Count**: 0

#### Haiku Tasks
- [ ] **H1** — [Verb phrase]. Files: `src/path/to/file.jsx`. Pattern: `src/components/Example.jsx`. Output: [exact result].

#### Sonnet Review Checklist
- [ ] [Check]

#### Human Verify
- [ ] [Action] → [result]

---

## Bug Fixes

Known bugs to investigate and fix. Use `vX.Y.Z` (Z > 0) versioning. These typically go straight to Sonnet — skip Haiku unless it's a clear code change.

- `vX.Y.1` — [Description of bug, how to reproduce, impact]

### Standard: Bug Report Button Placement
All apps must follow the LoopBack pattern: version text on left, "Report a Bug" text link on right. Placed in the app's footer area (sidebar footer for desktop-first apps, bottom tab bar footer for mobile-first apps). No floating FAB buttons. Modal must be closeable on mobile (explicit close button + backdrop tap).

---

## Unsolved

Problems without a clear solution yet. Describe the problem, not a feature spec. Include possible angles if any.

- **[Problem]** — [Context. What's broken or unclear. Possible angles: ...]

---

## Backlog

Lower-priority items not yet scheduled into a version.

- [Feature or idea] `[ME]`
- [Feature or idea] `[CLAUDE]`
- [Feature or idea] `[TOGETHER]`

---

## Completed

Shipped versions, newest first.

### v0.1.0 — [Version Name] (YYYY-MM-DD)

- [x] [What shipped]
- [x] [What shipped]

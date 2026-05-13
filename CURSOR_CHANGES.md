# Cursor change log — StatFinder

## 2026-05-13 — `erasableSyntaxOnly` / LLM provider constructors

### Task

Fix TypeScript build failure: `erasableSyntaxOnly` rejects constructor parameter properties in the OpenAI and Anthropic LLM adapters. Refactor to explicit class fields plus constructor assignments; quick sweep for the same pattern or other obvious blockers under `npm run build`.

### Files changed

- `src/lib/llm/openaiProvider.ts` — `private readonly apiKey` / `model` as fields; constructor assigns arguments.
- `src/lib/llm/anthropicProvider.ts` — same pattern.
- `CURSOR_CHANGES.md` — this entry.

### Commands run

- `npm run build` — **passed** in Hermes shell (`tsc -b && vite build`).
- `npm run lint` — **passed** in Hermes shell.
- Cursor `read_lints` on the two provider files — **no issues reported**.

### Result / exit status

- Code change removes non-erasable constructor parameter properties.
- Automated verification in this workspace: **build passed, lint passed**.

### Remaining issues / sweep notes

- No other constructor parameter properties under `src/` (only those two classes had `constructor(...)`).
- No TS `enum` / `namespace` in app source (`z.enum` in Zod schemas is unaffected).

---

## 2026-05-13 — Build / lint fixes

### Task

Restore settings persistence helpers, satisfy `react-hooks/set-state-in-effect`, align `QueryPage` export with `App` imports, and sweep for blockers to `npm run build` / `npm run lint`.

### Files changed

- `src/lib/storage/settings.ts` — verify: `writeSettings`, `persistApiKey` exported (full implementations; fixes truncated `persistApiKey` if present in older trees).
- `src/pages/SettingsPage.tsx` — removed `useEffect` that synced props into state (lint rule).
- `src/App.tsx` — `key={settingsEpoch}` on `SettingsPage` so a storage reload remounts the form with fresh initial state from props (same behavior as the removed effect).
- `src/pages/QueryPage.tsx` — renamed `QueryView` / `QueryViewProps` to `QueryPage` / `QueryPageProps` to match `App` import.

### Commands run

- `npm run build` — **not run** (agent shell invocation unavailable / rejected in this environment).
- `npm run lint` — **not run** (same).
- Cursor `read_lints` on the touched TS/TSX paths — **no issues reported**.

### Result / exit status

- Local automation: **unknown** — rerun `npm run build && npm run lint` on your machine and treat those exit codes as authoritative.

### Remaining issues

- None identified in code review beyond confirming build/lint locally.

---

## Earlier — StatFinder v1 shell (historical)

Initial scaffold: React + TS + Vite, Tailwind, Zod, GH Pages wiring — see git history or prior notes for detail.

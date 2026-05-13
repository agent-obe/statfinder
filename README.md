# StatFinder

Static, client-only companion for drafting **honest statistical answers with explicit sourcing posture**. v1 forwards structured prompts from the browser directly to OpenAI or Anthropic using **your API key**. There is **no StatFinder backend** and **no live database connector** yet—responses are mediated by the provider model under a strict JSON contract.

Live demo (once GitHub Pages is enabled on your fork):  
`https://<owner>.github.io/statfinder/` (project site for repo `statfinder`).

---

## Features (v1)

- Settings gate for provider choice, dynamic model fetching from API keys, API key masking, persistence choice (`localStorage` vs `sessionStorage`).
- Structured query UX with collapsible geography/demographic filters (forwarded verbatim to the model).
- Robust response handling: Markdown fence stripping, JSON extraction fallback, validation with **Zod**, local source URL sanity checks (“Source not verified in v1” + forced low confidence when unverifiable).
- Support for both numeric and textual headline answers (e.g., "37%" or "Rice" or "Mexican Americans").
- Saved query summaries (browser-only; no authentication).
- Mobile-first stacking, obvious copy buttons, subdued “data product” visuals (warm neutrals + deep green anchors).

Architecture seam: **`LLMProvider` interface (`generateStatAnswer`, `testConnection`)** mirrors how future authoritative connectors can plug in without rewriting UI code—see breadcrumbs in [`src/App.tsx`](src/App.tsx), [`src/lib/llm/`](src/lib/llm/), and the transparency panel footer.

---

## v1 Limitations

- No automatic verification against authoritative tables—only heuristic HTTPS URL checks plus model narrative.
- Browser-stored secrets are inherently weaker than backend custody; malicious scripts at the same origin could exfiltrate keys.
- Direct browser calls rely on vendor CORS allowances (Anthropic requires an explicit dangerous-browser header; both vendors may tighten browser access arbitrarily).
- LLMs can still hallucinate citations—evaluate answers like research notes, not ground truth.

---

## Local Development

Requirements: Node 20+ recommended (GitHub Actions uses 22).

```bash
npm install
npm run dev
```

Build production assets (respects `/statfinder/` base path for GitHub project pages):

```bash
npm run build
npm run preview    # serves dist with the same base
```

Lint:

```bash
npm run lint
```

No environment variables are required—the app is wholly static aside from outbound vendor HTTPS calls originating from **your browser**.

---

## API Keys & Provider Setup

1. Open **Settings** on first launch and choose **OpenAI** or **Anthropic**.
2. Paste a revocable/project-scoped browser key (`localStorage` remembers between sessions unless you prefer `sessionStorage`).
3. Available models are automatically fetched from your API provider. Select from the list or enter a custom model name.
4. Optionally run **Save + test provider** to confirm credentials.

Keys never render in plaintext after masked storage—they are not logged by StatFinder UI code—but they still traverse your network interface to vendors.

---

## GitHub Pages Deployment

1. Enable **GitHub Pages** with the **GitHub Actions** source for this repository.
2. Push to `main`—workflow [`.github/workflows/pages.yml`](.github/workflows/pages.yml) publishes `dist/` to Pages.
3. Ensure the repo is named **`statfinder`** (or edit `base` inside [`vite.config.ts`](vite.config.ts) plus any hard-coded marketing URLs).

Forking tip: duplicated workflow needs `pages` & `id-token` permissions (already declared).

---

## Security Posture Summary

See the in-app **Settings → Security note** mirror in code comments: prefer short-lived narrowly scoped tokens, revoke anything exposed to teammates, assume same-origin compromises can leak storage, consider future serverless proxies for hardened key custody.

---

## Roadmap (sketch)

- Authoritative connectors (ACS, CPS microdata abstracts, OECD, IMF) layered behind adapters sharing the StatResult envelope.
- Server-side citation verification pipeline + persisted cache snapshots.
- Optional workspace sharing via export/import blobs (still without accounts).

Contributions welcome once the baseline ships.

---
name: verify
description: Build, launch, and drive this app to verify changes end-to-end in a real browser.
---

# Verifying CBT-App changes

Vite + React SPA, no backend. State is localStorage under `cbt-companion:v1`.

## Launch

```bash
npm ci                      # fresh container only
npx vite --port 5199 &      # serves at http://localhost:5199/CBT-App/  (note base path!)
```

## Drive (headless Chromium via the globally-installed Playwright)

```js
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const browser = await chromium.launch({ args: ['--no-sandbox'] });
const page = await browser.newPage({ viewport: { width: 420, height: 900 } }); // mobile-ish
await page.goto('http://localhost:5199/CBT-App/');
```

## Gotchas

- **Onboarding gates everything.** To reach the app screens, seed
  localStorage with `{ onboarded: true, ... }` (copy the `initialState`
  shape from `src/store/store.tsx`), then reload. Missing keys are
  defaulted by `load()`, so a minimal object works.
- The app is served under the `/CBT-App/` base path, not `/`.
- Watch `page.on('pageerror')` and console errors — the app fails soft.
- Movement module: "Preview with sample data" seeds 28 days of demo
  samples, so the personal baseline is immediately scoreable.

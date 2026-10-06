# growwz — Groww, for your first ₹100

A redesign of Groww for India's 20–26 year-old, first-time investors: goal-first, calm by default, built for irregular income.

**Live app:** https://siddham-jain.github.io/growwz/

- **1-pager:** [docs/one-pager.pdf](./docs/one-pager.pdf) (source [docs/one-pager.html](./docs/one-pager.html), also served at `/brief.html`)
- **Evals:** [EVALS.md](./EVALS.md) (also served at `/evals.html`), latest scorecard in [evals/results/SCORECARD.md](./evals/results/SCORECARD.md)
- **Screens:** [docs/screens](./docs/screens)

## Run it

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # builds docs pages + app into dist/
npm run eval       # builds, serves, runs every eval, writes evals/results/SCORECARD.md
```

The evals use the locally installed Google Chrome (`channel: "chrome"`), so there's no browser download.

On larger screens the app sits in a phone frame on a single stage that scales to fit the window, so nothing scrolls. It has one-click "moments" for reviewers: payday, a market dip, the F&O gate, a Byte, Squads. On phones it runs full-screen. The **You** tab has the same demo controls.

## Stack

React 19, TypeScript, Vite, Tailwind v4 (Groww tokens as CSS variables, light and dark), Zustand (persisted to `localStorage`), Motion, Playwright and axe-core for evals. There's no backend: prices, fund data and returns are illustrative.

## Layout

```
src/lib/plan.ts      horizon → fund suitability, projections, required SIP
src/lib/store.ts     app state, starter-plan allocation, demo account
src/data/            funds, goal templates, stocks, Bytes, glossary
src/screens/         one file per screen
evals/               journeys, suitability matrix, copy lint, a11y, screenshots, persona results
scripts/build-docs.ts  fills docs/one-pager.html (qr, links, screenshots) and renders EVALS.md into public/
```

## Deploy

GitHub Pages serves the `gh-pages` branch, which holds a prebuilt `dist/`. To publish:

```bash
npm run build && touch dist/.nojekyll
cd dist && git init -b gh-pages && git add -A && git commit -m "deploy: build" \
  && git push -f https://github.com/siddham-jain/growwz.git gh-pages && rm -rf .git
```

Asset paths are relative, so `dist/` also works on any static host.

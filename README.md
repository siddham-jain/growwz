# Groww, for your first ₹100

A redesign of Groww for India's 20–26 year-old, first-time investors: goal-first, calm by default, built for irregular income.

- **1-pager:** [ONE_PAGER.md](./ONE_PAGER.md) (also served at `/brief.html`, PDF in [docs/one-pager.pdf](./docs/one-pager.pdf))
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

On desktop the app sits in a phone frame, with one-click "moments" for reviewers: payday, a market dip, the F&O gate, a Byte, Squads. On mobile it runs full-screen. The **You** tab has the same demo controls.

## Stack

React 19, TypeScript, Vite, Tailwind v4 (Groww tokens as CSS variables, light and dark), Zustand (persisted to `localStorage`), Motion, Playwright and axe-core for evals. There's no backend: prices, fund data and returns are illustrative.

## Layout

```
src/lib/plan.ts      horizon → fund suitability, projections, required SIP
src/lib/store.ts     app state, starter-plan allocation, demo account
src/data/            funds, goal templates, stocks, Bytes, glossary
src/screens/         one file per screen
evals/               journeys, suitability matrix, copy lint, a11y, screenshots, persona results
scripts/build-docs.ts  renders ONE_PAGER.md / EVALS.md into public/*.html
```

## Deploy

`.github/workflows/deploy.yml` publishes `dist/` to GitHub Pages on every push to `main`. The build uses relative asset paths, so it also works on any static host.

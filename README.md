# ATOM/07 — Atomic Structure & Periodicity

An interactive Chapter 7 study companion for general-chemistry students. The
single-page React/TypeScript site turns light, hydrogen spectra, quantum
numbers, electron configurations, periodic trends, and alkali-metal redox
context into short experiments and retrieval practice.

## Run locally

Requires Node.js 22 or newer.

```bash
npm ci
npm run dev
```

Useful checks:

```bash
npm run lint
npm test
```

The production export is written to `dist/client`. GitHub Pages builds use the
repository asset prefix `/atomic-structure-periodicity` and are deployed by
`.github/workflows/pages.yml`.

## Project shape

- `app/page.tsx` contains the interactive study companion and typed chapter data.
- `app/chapter7-utils.ts` contains unit, photon, hydrogen-transition, and
  quantum-number calculations.
- `tests/` contains rendered-HTML and calculation checks.
- The textbook PDF is intentionally kept outside this repository.

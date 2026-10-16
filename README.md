# Weight Tracker BD

Offline, bilingual (English / বাংলা) body-weight tracker that runs entirely in the
browser. Log your weight, watch the trend, and track progress toward a target —
no account, no server, no network requests.

## Problem

Weight changes slowly, and people lose track of whether they are actually making
progress. Existing options are either ad-heavy phone apps that demand accounts,
or a notebook with no math. This is a small, honest tool: one number a day,
exact change math, a trend chart, and a goal pace — all stored locally.

## Features

- **Weight log** — one entry per date (date, weight in kg, optional note);
  re-saving the same date updates it instead of duplicating.
- **Dashboard** — latest weight (kg + lb), change over 7 / 30 days, total change,
  7- and 30-day averages, entry count.
- **BMI** — from latest weight + stored height, with the WHO band
  (Underweight < 18.5, Normal 18.5–24.9, Overweight 25–29.9, Obese ≥ 30).
- **Goal tracking** — target weight + target date → progress bar (%),
  remaining kg, and required kg/week pace (negative = need to lose).
- **Trend chart** — SVG line chart of the last 30 entries with a dashed
  target-weight line when a target is set.
- **History** — full entry list with edit (loads the entry back into the form)
  and delete.
- **Data** — JSON export / import with strict validation (wrong app, wrong
  version, duplicate dates, bad entries, or a bad profile are all rejected
  wholesale), and typed-`DELETE` erase-all.
- **Bilingual** — EN/বাংলা toggle persisted across visits; numbers render in
  Bengali digits in বাংলা mode.
- **Validation** — future dates, weights outside 20–400 kg, heights outside
  100–250 cm, past target dates, and notes over 200 characters are rejected
  with inline messages.
- **Privacy** — everything lives in `localStorage` in your own browser.
  The page makes zero network requests.

## Stack

Vanilla HTML + CSS + JavaScript. No frameworks, no build step, no dependencies.
Tests: Node `assert` unit tests + a dependency-free raw-CDP headless-Chrome
smoke test.

## Prerequisites

- Any modern browser (Chrome, Firefox, Edge, Safari).
- Node.js 18+ only if you want to run the tests.

## Run locally

Open `index.html` in a browser, or serve the folder:

```bash
npx serve .
# or
python3 -m http.server 8000
```

## Tests

```bash
node tests/logic.test.js        # pure-logic unit tests
node tests/smoke.js desktop     # headless-Chrome UI smoke (1280px)
node tests/smoke.js mobile      # headless-Chrome UI smoke (390px)
```

The smoke test loads the page with `?asof=2026-10-16` so "today" is
deterministic.

## Deployment

Static site — copy the folder to any static host (GitHub Pages, Netlify, etc.).
No server code, no environment variables.

## Limitations

- Data lives in one browser's `localStorage`. Clearing site data loses it —
  export a JSON backup from the Data tab.
- One entry per date; multiple weigh-ins a day are not tracked separately.
- BMI is a population screening tool, not a diagnosis; it does not account for
  muscle mass, age, or pregnancy.
- The goal pace is simple linear math (remaining kg ÷ weeks left), not a
  nutrition or exercise plan.

## Status

MVP complete. Tested: unit + desktop + mobile smoke, 0 console errors.

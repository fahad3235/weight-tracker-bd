# TEST_RESULTS.md — weight-tracker-bd (run #70, 2026-10-16)

## Unit tests — 20/20 pass
`node tests/logic.test.js` (exit 0, no failures).

Hand-verified values asserted:
- BMI: 70 kg / 175 cm = 22.9; WHO boundaries 18.4/18.5, 24.9/25, 29.9/30.
- kg→lb: 70 kg = 154.32 lb.
- Stats scenario (80, 79, 78.5, 78, 77.5 kg over 2026-10-01…16):
  total −2.50, 7-day −1.00, 30-day −2.50, avg7 78.0, avg30 78.6, min 77.5, max 80.
- Goal: start 80 → latest 77.5, target 75 = 50%; gain case 40%; overshoot clamps
  to 100; wrong direction clamps to 0; maintain (70→70) = 100.
- Pace: 77.5 → 75 by 2026-11-13 (28 days) = −0.63 kg/week; today/past target = null.
- Import: round-trip OK; rejects wrong app, wrong version, non-array entries,
  duplicate dates, out-of-range weight, invalid profile, null/non-object input.
- Bengali digits: formatNum(1234.5, 'bn') = ১২৩৪.৫.
- Leap date: 2024-02-29 valid, 2025-02-29 invalid.

### Repair (1 real bug, found by tests)
`round2`/`round1` used `Math.round`, which in JS rounds −62.5 to −62
(toward +∞), so the pace came out −0.62 instead of the hand-verified −0.63.
Fixed to round half away from zero in `js/logic.js`; unit + smoke now agree.

## Smoke tests — 25/25 desktop + 25/25 mobile, 0 console/page errors
`node tests/smoke.js desktop` (1280px) and `node tests/smoke.js mobile` (390px),
raw CDP against /opt/meta-chromium/chrome, `?asof=2026-10-16`.

Covered: empty state, add entry (77.5 kg + 170.9 lb shown), chart point,
second entry + profile → BMI 25.3 Overweight, 7-day change −1.00,
goal 28.6%, pace −0.63 kg/week, goal line on chart, reload persistence,
BN toggle (Bengali digits + `lang="bn"`), future-date validation (no entry added),
delete, typed-DELETE erase-all, no horizontal overflow, zero non-file network
requests, zero console errors.

## Source hygiene
- Pure-ASCII sources: `grep -rP '[^\x00-\x7F]'` zero matches
  (Bengali as `\uXXXX` escapes in JS, HTML entities in markup).

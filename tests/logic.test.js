/* weight-tracker-bd — node unit tests. Run: node tests/logic.test.js */
'use strict';
const assert = require('assert');
const L = require('../js/logic.js');

let passed = 0;
function check(name, fn) {
  try { fn(); passed++; console.log('PASS ' + name); }
  catch (e) { console.error('FAIL ' + name + ': ' + e.message); process.exitCode = 1; }
}

const E = [
  { date: '2026-10-01', weightKg: 80, note: '' },
  { date: '2026-10-08', weightKg: 79, note: '' },
  { date: '2026-10-10', weightKg: 78.5, note: '' },
  { date: '2026-10-14', weightKg: 78, note: '' },
  { date: '2026-10-16', weightKg: 77.5, note: '' }
];
const ASOF = '2026-10-16';

check('validateEntry: valid entry', () => {
  assert.deepStrictEqual(L.validateEntry({ date: '2026-10-16', weightKg: 77.5, note: '' }, ASOF), []);
});
check('validateEntry: future date rejected', () => {
  assert.ok(L.validateEntry({ date: '2026-10-17', weightKg: 77.5 }, ASOF).includes('dateFuture'));
});
check('validateEntry: bad date rejected', () => {
  assert.ok(L.validateEntry({ date: '2026-02-30', weightKg: 77.5 }, ASOF).includes('dateInvalid'));
});
check('validateEntry: weight bounds 20/400', () => {
  assert.ok(L.validateEntry({ date: ASOF, weightKg: 19.9 }, ASOF).includes('weightRange'));
  assert.ok(L.validateEntry({ date: ASOF, weightKg: 400.1 }, ASOF).includes('weightRange'));
  assert.deepStrictEqual(L.validateEntry({ date: ASOF, weightKg: 20 }, ASOF), []);
  assert.deepStrictEqual(L.validateEntry({ date: ASOF, weightKg: 400 }, ASOF), []);
});
check('validateEntry: missing weight + long note', () => {
  const e = L.validateEntry({ date: ASOF, note: 'x'.repeat(201) }, ASOF);
  assert.ok(e.includes('weightRequired'));
  assert.ok(e.includes('noteTooLong'));
});
check('upsertEntry: replaces same date, keeps sorted', () => {
  const out = L.upsertEntry(E, { date: '2026-10-10', weightKg: 78.2, note: 'a' });
  assert.strictEqual(out.length, 5);
  assert.strictEqual(out[2].weightKg, 78.2);
  assert.strictEqual(out[2].note, 'a');
  const out2 = L.upsertEntry(E, { date: '2026-10-03', weightKg: 79.5 });
  assert.strictEqual(out2.length, 6);
  assert.strictEqual(out2[1].date, '2026-10-03');
});
check('deleteEntry removes only that date', () => {
  const out = L.deleteEntry(E, '2026-10-10');
  assert.strictEqual(out.length, 4);
  assert.ok(!out.some(e => e.date === '2026-10-10'));
});
check('computeBMI: 70kg/175cm = 22.9', () => {
  assert.strictEqual(L.computeBMI(70, 175), 22.9);
  assert.strictEqual(L.computeBMI(70, null), null);
});
check('bmiCategory WHO bands', () => {
  assert.strictEqual(L.bmiCategory(18.4), 'underweight');
  assert.strictEqual(L.bmiCategory(18.5), 'normal');
  assert.strictEqual(L.bmiCategory(24.9), 'normal');
  assert.strictEqual(L.bmiCategory(25), 'overweight');
  assert.strictEqual(L.bmiCategory(29.9), 'overweight');
  assert.strictEqual(L.bmiCategory(30), 'obese');
  assert.strictEqual(L.bmiCategory(null), null);
});
check('kgToLb: 70 -> 154.32', () => {
  assert.strictEqual(L.kgToLb(70), 154.32);
});
check('stats: hand-verified scenario', () => {
  const s = L.stats(E, ASOF);
  assert.strictEqual(s.count, 5);
  assert.strictEqual(s.first.weightKg, 80);
  assert.strictEqual(s.latest.weightKg, 77.5);
  assert.strictEqual(s.totalChange, -2.5);
  assert.strictEqual(s.change7d, -1.0); // window 10-10..10-16: 78.5 -> 77.5
  assert.strictEqual(s.change30d, -2.5);
  assert.strictEqual(s.avg7d, 78.0); // (78.5+78+77.5)/3
  assert.strictEqual(s.avg30d, 78.6); // (80+79+78.5+78+77.5)/5
  assert.strictEqual(s.min, 77.5);
  assert.strictEqual(s.max, 80);
});
check('stats: empty + single entry', () => {
  assert.deepStrictEqual(L.stats([], ASOF).count, 0);
  const s = L.stats([{ date: ASOF, weightKg: 70 }], ASOF);
  assert.strictEqual(s.totalChange, null);
  assert.strictEqual(s.change7d, null);
  assert.strictEqual(s.avg7d, 70);
});
check('goalProgress: lose 80->77.5 target 75 = 50%', () => {
  assert.strictEqual(L.goalProgress(80, 77.5, 75), 50);
});
check('goalProgress: gain + clamp + maintain', () => {
  assert.strictEqual(L.goalProgress(60, 62, 65), 40);
  assert.strictEqual(L.goalProgress(80, 74, 75), 100); // overshoot clamps
  assert.strictEqual(L.goalProgress(80, 81, 75), 0); // wrong direction clamps
  assert.strictEqual(L.goalProgress(70, 70, 70), 100);
  assert.strictEqual(L.goalProgress(70, 69, 70), 0);
  assert.strictEqual(L.goalProgress(80, 77.5, null), null);
});
check('requiredPerWeek: 77.5->75 in 28 days = -0.63', () => {
  assert.strictEqual(L.requiredPerWeek(77.5, 75, '2026-10-16', '2026-11-13'), -0.63);
  assert.strictEqual(L.requiredPerWeek(77.5, 75, '2026-10-16', '2026-10-16'), null);
  assert.strictEqual(L.requiredPerWeek(77.5, 75, '2026-10-16', '2026-10-15'), null);
  assert.strictEqual(L.requiredPerWeek(77.5, null, '2026-10-16', '2026-11-13'), null);
});
check('validateProfile bounds', () => {
  assert.ok(L.validateProfile({ heightCm: 99 }, ASOF).includes('heightRange'));
  assert.ok(L.validateProfile({ heightCm: 251 }, ASOF).includes('heightRange'));
  assert.deepStrictEqual(L.validateProfile({ heightCm: 170, targetWeightKg: 65, targetDate: '2026-12-01' }, ASOF), []);
  assert.ok(L.validateProfile({ targetWeightKg: 10 }, ASOF).includes('targetRange'));
  assert.ok(L.validateProfile({ targetDate: '2026-10-15' }, ASOF).includes('targetDatePast'));
  assert.deepStrictEqual(L.validateProfile({ heightCm: null, targetWeightKg: null, targetDate: '' }, ASOF), []);
});
check('export/import round-trip', () => {
  const payload = L.exportPayload(E, { heightCm: 175, targetWeightKg: 75, targetDate: '2026-12-01' });
  const res = L.validateImport(JSON.parse(JSON.stringify(payload)));
  assert.strictEqual(res.ok, true);
  assert.strictEqual(res.data.entries.length, 5);
  assert.strictEqual(res.data.profile.heightCm, 175);
});
check('validateImport rejects bad payloads', () => {
  const bad = (mut) => {
    const p = L.exportPayload(E, {});
    mut(p);
    return L.validateImport(p).ok;
  };
  assert.strictEqual(bad(p => { p.app = 'other'; }), false);
  assert.strictEqual(bad(p => { p.version = 2; }), false);
  assert.strictEqual(bad(p => { p.entries = 'x'; }), false);
  assert.strictEqual(bad(p => { p.entries.push({ date: '2026-10-16', weightKg: 70 }); }), false); // dup date
  assert.strictEqual(bad(p => { p.entries.push({ date: '2026-10-20', weightKg: 5 }); }), false); // bad weight
  assert.strictEqual(bad(p => { p.profile = { heightCm: 50 }; }), false);
  assert.strictEqual(L.validateImport(null).ok, false);
  assert.strictEqual(L.validateImport('nope').ok, false);
});
check('formatNum/formatSigned Bengali digits', () => {
  assert.strictEqual(L.formatNum(1234.5, 'bn', 1), '\u09E7\u09E8\u09E9\u09EA.\u09EB');
  assert.strictEqual(L.formatSigned(-1.5, 'bn', 2), '-\u09E7.\u09EB\u09E6');
  assert.strictEqual(L.formatSigned(2.5, 'en', 2), '+2.50');
  assert.strictEqual(L.formatNum(null, 'en', 1), '\u2014');
});
check('date helpers: leap + invalid', () => {
  assert.strictEqual(L.isValidDateStr('2024-02-29'), true);
  assert.strictEqual(L.isValidDateStr('2025-02-29'), false);
  assert.strictEqual(L.daysToDate(L.dateToDays('2026-10-16')), '2026-10-16');
});

console.log('\n' + passed + ' unit checks passed');

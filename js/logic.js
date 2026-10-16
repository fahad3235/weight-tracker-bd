/* weight-tracker-bd \u2014 pure logic (no DOM). Works in Node (module.exports)
   and in the browser (window.WeightTracker). All Bengali strings are
   \uXXXX escapes so sources stay pure ASCII. */
(function (root) {
  'use strict';

  var APP_ID = 'weight-tracker-bd';
  var DATA_VERSION = 1;
  var MIN_WEIGHT_KG = 20;
  var MAX_WEIGHT_KG = 400;
  var MIN_HEIGHT_CM = 100;
  var MAX_HEIGHT_CM = 250;
  var MAX_NOTE_LEN = 200;
  var BN_DIGITS = ['\u09E6', '\u09E7', '\u09E8', '\u09E9', '\u09EA',
                   '\u09EB', '\u09EC', '\u09ED', '\u09EE', '\u09EF'];

  function isValidDateStr(s) {
    if (typeof s !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
    var d = new Date(s + 'T00:00:00Z');
    return !isNaN(d.getTime()) && d.toISOString().slice(0, 10) === s;
  }

  function dateToDays(s) { // days since epoch, UTC \u2014 safe date arithmetic
    return Math.floor(Date.parse(s + 'T00:00:00Z') / 86400000);
  }

  function daysToDate(days) {
    return new Date(days * 86400000).toISOString().slice(0, 10);
  }

  // Round half away from zero (Math.round(-62.5) is -62 in JS; users expect -63).
  function round2(n) { return Math.sign(n) * Math.round(Math.abs(n) * 100) / 100; }
  function round1(n) { return Math.sign(n) * Math.round(Math.abs(n) * 10) / 10; }

  /* ---- entries ---- */

  // Returns an array of error keys (empty = valid).
  function validateEntry(entry, asOfStr) {
    var errs = [];
    if (!entry || typeof entry !== 'object') return ['entryInvalid'];
    if (!entry.date) errs.push('dateRequired');
    else if (!isValidDateStr(entry.date)) errs.push('dateInvalid');
    else if (asOfStr && isValidDateStr(asOfStr) &&
             dateToDays(entry.date) > dateToDays(asOfStr)) errs.push('dateFuture');
    if (entry.weightKg === undefined || entry.weightKg === null || entry.weightKg === '') {
      errs.push('weightRequired');
    } else if (typeof entry.weightKg !== 'number' || isNaN(entry.weightKg)) {
      errs.push('weightInvalid');
    } else if (entry.weightKg < MIN_WEIGHT_KG || entry.weightKg > MAX_WEIGHT_KG) {
      errs.push('weightRange');
    }
    if (entry.note !== undefined && entry.note !== null) {
      if (typeof entry.note !== 'string') errs.push('noteInvalid');
      else if (entry.note.length > MAX_NOTE_LEN) errs.push('noteTooLong');
    }
    return errs;
  }

  // One entry per date: same date replaces the old entry. Returns new sorted array.
  function upsertEntry(entries, entry) {
    var out = (entries || []).filter(function (e) { return e.date !== entry.date; });
    out.push({ date: entry.date, weightKg: entry.weightKg,
               note: entry.note ? String(entry.note) : '' });
    out.sort(function (a, b) { return dateToDays(a.date) - dateToDays(b.date); });
    return out;
  }

  function deleteEntry(entries, dateStr) {
    return (entries || []).filter(function (e) { return e.date !== dateStr; });
  }

  /* ---- BMI ---- */

  function computeBMI(weightKg, heightCm) {
    if (!weightKg || !heightCm) return null;
    var m = heightCm / 100;
    if (m <= 0) return null;
    return round1(weightKg / (m * m));
  }

  // WHO adult BMI bands.
  function bmiCategory(bmi) {
    if (bmi === null || bmi === undefined) return null;
    if (bmi < 18.5) return 'underweight';
    if (bmi < 25) return 'normal';
    if (bmi < 30) return 'overweight';
    return 'obese';
  }

  function kgToLb(kg) { return round2(kg * 2.20462); }

  /* ---- stats ---- */

  function entriesInWindow(entries, asOfStr, days) {
    var end = dateToDays(asOfStr);
    var start = end - (days - 1);
    return (entries || []).filter(function (e) {
      var d = dateToDays(e.date);
      return d >= start && d <= end;
    });
  }

  function avg(list) {
    if (!list.length) return null;
    var sum = list.reduce(function (a, e) { return a + e.weightKg; }, 0);
    return round2(sum / list.length);
  }

  function windowChange(entries, asOfStr, days) {
    var w = entriesInWindow(entries, asOfStr, days);
    if (w.length < 2) return null;
    return round2(w[w.length - 1].weightKg - w[0].weightKg);
  }

  function stats(entries, asOfStr) {
    var list = (entries || []).slice().sort(function (a, b) {
      return dateToDays(a.date) - dateToDays(b.date);
    });
    var out = { count: list.length, first: null, latest: null,
                totalChange: null, change7d: null, change30d: null,
                avg7d: null, avg30d: null, min: null, max: null };
    if (!list.length) return out;
    out.first = list[0];
    out.latest = list[list.length - 1];
    if (list.length >= 2) {
      out.totalChange = round2(out.latest.weightKg - out.first.weightKg);
    }
    out.change7d = windowChange(list, asOfStr, 7);
    out.change30d = windowChange(list, asOfStr, 30);
    out.avg7d = avg(entriesInWindow(list, asOfStr, 7));
    out.avg30d = avg(entriesInWindow(list, asOfStr, 30));
    var weights = list.map(function (e) { return e.weightKg; });
    out.min = Math.min.apply(null, weights);
    out.max = Math.max.apply(null, weights);
    return out;
  }

  /* ---- goal ---- */

  // 0\u2013100. null when no target set. Handles lose / gain / maintain.
  function goalProgress(startWeight, latestWeight, targetWeight) {
    if (targetWeight === null || targetWeight === undefined) return null;
    if (startWeight === null || startWeight === undefined) return null;
    if (latestWeight === null || latestWeight === undefined) return null;
    if (startWeight === targetWeight) {
      return latestWeight === targetWeight ? 100 : 0;
    }
    var p = (startWeight - latestWeight) / (startWeight - targetWeight) * 100;
    if (p < 0) return 0;
    if (p > 100) return 100;
    return round1(p);
  }

  // Signed kg/week needed to reach target by targetDate. Negative = must lose.
  // null when no target/date, or the target date is today/past.
  function requiredPerWeek(latestWeight, targetWeight, asOfStr, targetDateStr) {
    if (targetWeight === null || targetWeight === undefined) return null;
    if (!targetDateStr || !isValidDateStr(targetDateStr)) return null;
    var daysLeft = dateToDays(targetDateStr) - dateToDays(asOfStr);
    if (daysLeft <= 0) return null;
    return round2((targetWeight - latestWeight) / (daysLeft / 7));
  }

  /* ---- profile ---- */

  function validateProfile(profile, asOfStr) {
    var errs = [];
    if (!profile || typeof profile !== 'object') return ['profileInvalid'];
    if (profile.heightCm !== null && profile.heightCm !== undefined && profile.heightCm !== '') {
      if (typeof profile.heightCm !== 'number' || isNaN(profile.heightCm) ||
          profile.heightCm < MIN_HEIGHT_CM || profile.heightCm > MAX_HEIGHT_CM) {
        errs.push('heightRange');
      }
    }
    if (profile.targetWeightKg !== null && profile.targetWeightKg !== undefined && profile.targetWeightKg !== '') {
      if (typeof profile.targetWeightKg !== 'number' || isNaN(profile.targetWeightKg) ||
          profile.targetWeightKg < MIN_WEIGHT_KG || profile.targetWeightKg > MAX_WEIGHT_KG) {
        errs.push('targetRange');
      }
    }
    if (profile.targetDate) {
      if (!isValidDateStr(profile.targetDate)) errs.push('targetDateInvalid');
      else if (asOfStr && dateToDays(profile.targetDate) < dateToDays(asOfStr)) {
        errs.push('targetDatePast');
      }
    }
    return errs;
  }

  function cleanProfile(profile) {
    var p = profile || {};
    return {
      heightCm: (p.heightCm === '' || p.heightCm === undefined) ? null : p.heightCm,
      targetWeightKg: (p.targetWeightKg === '' || p.targetWeightKg === undefined) ? null : p.targetWeightKg,
      targetDate: p.targetDate ? String(p.targetDate) : ''
    };
  }

  /* ---- import / export ---- */

  function exportPayload(entries, profile) {
    return {
      app: APP_ID,
      version: DATA_VERSION,
      exportedAt: new Date().toISOString(),
      entries: entries || [],
      profile: cleanProfile(profile)
    };
  }

  // Returns { ok, errors, data }. Strict: wrong app/version, bad entries,
  // duplicate dates, or an invalid profile are all rejected wholesale.
  function validateImport(data) {
    var errs = [];
    if (!data || typeof data !== 'object' || Array.isArray(data)) {
      return { ok: false, errors: ['importInvalid'], data: null };
    }
    if (data.app !== APP_ID) errs.push('importWrongApp');
    if (data.version !== DATA_VERSION) errs.push('importWrongVersion');
    if (!Array.isArray(data.entries)) errs.push('importEntriesInvalid');
    var seen = {};
    if (Array.isArray(data.entries)) {
      data.entries.forEach(function (e) {
        var eErrs = validateEntry(e, null); // no future-date check on import
        if (eErrs.length) errs.push('importEntryInvalid');
        if (seen[e.date]) errs.push('importDuplicateDate');
        seen[e.date] = true;
      });
    }
    var profile = cleanProfile(data.profile || {});
    if (data.profile !== undefined && data.profile !== null) {
      var pErrs = validateProfile(profile, null); // no past-date check on import
      if (pErrs.length) errs.push('importProfileInvalid');
    }
    if (errs.length) return { ok: false, errors: errs, data: null };
    var entries = data.entries.map(function (e) {
      return { date: e.date, weightKg: e.weightKg, note: e.note || '' };
    }).sort(function (a, b) { return dateToDays(a.date) - dateToDays(b.date); });
    return { ok: true, errors: [], data: { entries: entries, profile: profile } };
  }

  /* ---- display ---- */

  function toBengaliDigits(str) {
    return String(str).replace(/[0-9]/g, function (d) { return BN_DIGITS[Number(d)]; });
  }

  function formatNum(n, lang, decimals) {
    if (n === null || n === undefined || isNaN(n)) return '\u2014'; // em dash
    var s = Number(n).toFixed(decimals === undefined ? 1 : decimals);
    if (lang === 'bn') return toBengaliDigits(s);
    return s;
  }

  function formatSigned(n, lang, decimals) {
    if (n === null || n === undefined || isNaN(n)) return '\u2014';
    var s = (n > 0 ? '+' : '') + Number(n).toFixed(decimals === undefined ? 2 : decimals);
    if (lang === 'bn') return toBengaliDigits(s);
    return s;
  }

  var api = {
    APP_ID: APP_ID, DATA_VERSION: DATA_VERSION,
    MIN_WEIGHT_KG: MIN_WEIGHT_KG, MAX_WEIGHT_KG: MAX_WEIGHT_KG,
    MIN_HEIGHT_CM: MIN_HEIGHT_CM, MAX_HEIGHT_CM: MAX_HEIGHT_CM,
    MAX_NOTE_LEN: MAX_NOTE_LEN,
    isValidDateStr: isValidDateStr, dateToDays: dateToDays, daysToDate: daysToDate,
    round1: round1, round2: round2,
    validateEntry: validateEntry, upsertEntry: upsertEntry, deleteEntry: deleteEntry,
    computeBMI: computeBMI, bmiCategory: bmiCategory, kgToLb: kgToLb,
    entriesInWindow: entriesInWindow, stats: stats,
    goalProgress: goalProgress, requiredPerWeek: requiredPerWeek,
    validateProfile: validateProfile, cleanProfile: cleanProfile,
    exportPayload: exportPayload, validateImport: validateImport,
    toBengaliDigits: toBengaliDigits, formatNum: formatNum, formatSigned: formatSigned
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.WeightTracker = api;
})(typeof window !== 'undefined' ? window : globalThis);

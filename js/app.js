/* weight-tracker-bd \u2014 DOM app. Depends on window.WeightTracker (js/logic.js).
   All Bengali strings are \uXXXX escapes so sources stay pure ASCII. */
(function () {
  'use strict';
  var L = window.WeightTracker;

  var I18N = {
    en: {
      tagline: 'Log your weight, see your progress.',
      tabDashboard: 'Dashboard', tabLog: 'Log', tabData: 'Data',
      latest: 'Latest weight', change7d: 'Change \u00b7 7 days', change30d: 'Change \u00b7 30 days',
      bmi: 'BMI', bmiNone: 'Add your height in Profile to see BMI.',
      goal: 'Goal progress', perWeek: 'Needed per week',
      perWeekNone: 'Set a target weight and date in Profile.',
      perWeekReached: 'Target date reached \u2014 update your goal.',
      trend: 'Weight trend (last 30 entries)',
      trendEmpty: 'No entries yet. Add your first weight below.',
      addEntry: 'Add / update entry', date: 'Date', weight: 'Weight (kg)',
      note: 'Note (optional)', saveEntry: 'Save entry', entrySaved: 'Entry saved.',
      profile: 'Profile', height: 'Height (cm)', targetWeight: 'Target weight (kg)',
      targetDate: 'Target date', saveProfile: 'Save profile', profileSaved: 'Profile saved.',
      profileHint: 'Height powers BMI. Target weight + date power the goal bar and per-week pace.',
      history: 'History', historyEmpty: 'No entries yet.',
      delete: 'Delete', edit: 'Edit', confirmDelete: 'Delete the entry for this date?',
      export: 'Export JSON', import: 'Import JSON', erase: 'Erase all data',
      erasePrompt: 'Type DELETE to erase all entries and your profile.',
      eraseDone: 'All data erased.', importDone: 'Import successful.',
      dataHint: 'Your data lives only in this browser (localStorage). Export a backup any time.',
      total: 'Total change', avg7d: 'Avg \u00b7 7 days', avg30d: 'Avg \u00b7 30 days',
      entries: 'entries', noTarget: 'No target set',
      goalDone: 'Goal reached!', goalToGo: 'to go',
      start: 'Start', footer: 'Personal tracker. Not medical advice. BMI is a screening tool \u2014 talk to a clinician about what it means for you.',
      bmiUnderweight: 'Underweight', bmiNormal: 'Normal', bmiOverweight: 'Overweight', bmiObese: 'Obese',
      err_dateRequired: 'Date is required.',
      err_dateInvalid: 'Date is not valid.',
      err_dateFuture: 'Date cannot be in the future.',
      err_weightRequired: 'Weight is required.',
      err_weightInvalid: 'Weight must be a number.',
      err_weightRange: 'Weight must be between 20 and 400 kg.',
      err_noteTooLong: 'Note is too long (max 200 characters).',
      err_noteInvalid: 'Note must be text.',
      err_heightRange: 'Height must be between 100 and 250 cm.',
      err_targetRange: 'Target weight must be between 20 and 400 kg.',
      err_targetDateInvalid: 'Target date is not valid.',
      err_targetDatePast: 'Target date cannot be in the past.',
      err_import: 'That file is not a valid Weight Tracker export.',
      langBtn: '\u09ac\u09be\u0982\u09b2\u09be'
    },
    bn: {
      tagline: '\u0993\u099c\u09a8 \u09b2\u09bf\u0996\u09c1\u09a8, \u0985\u0997\u09cd\u09b0\u0997\u09a4\u09bf \u09a6\u09c7\u0996\u09c1\u09a8\u0964',
      tabDashboard: '\u09a1\u09cd\u09af\u09be\u09b6\u09ac\u09cb\u09b0\u09cd\u09a1', tabLog: '\u09b2\u0997', tabData: '\u09a1\u09c7\u099f\u09be',
      latest: '\u09b8\u09b0\u09cd\u09ac\u09b6\u09c7\u09b7 \u0993\u099c\u09a8', change7d: '\u09aa\u09b0\u09bf\u09ac\u09b0\u09cd\u09a4\u09a8 \u00b7 \u09ed \u09a6\u09bf\u09a8', change30d: '\u09aa\u09b0\u09bf\u09ac\u09b0\u09cd\u09a4\u09a8 \u00b7 \u09e9\u09e6 \u09a6\u09bf\u09a8',
      bmi: '\u09ac\u09bf\u098f\u09ae\u0986\u0987', bmiNone: '\u09ac\u09bf\u098f\u09ae\u0986\u0987 \u09a6\u09c7\u0996\u09a4\u09c7 \u09aa\u09cd\u09b0\u09cb\u09ab\u09be\u0987\u09b2\u09c7 \u0989\u099a\u09cd\u099a\u09a4\u09be \u09af\u09cb\u0997 \u0995\u09b0\u09c1\u09a8\u0964',
      goal: '\u09b2\u0995\u09cd\u09b7\u09cd\u09af\u09c7\u09b0 \u0985\u0997\u09cd\u09b0\u0997\u09a4\u09bf', perWeek: '\u09aa\u09cd\u09b0\u09a4\u09bf \u09b8\u09aa\u09cd\u09a4\u09be\u09b9\u09c7 \u09aa\u09cd\u09b0\u09af\u09bc\u09cb\u099c\u09a8',
      perWeekNone: '\u09aa\u09cd\u09b0\u09cb\u09ab\u09be\u0987\u09b2\u09c7 \u09b2\u0995\u09cd\u09b7\u09cd\u09af \u0993\u099c\u09a8 \u0993 \u09a4\u09be\u09b0\u09bf\u0996 \u09b8\u09c7\u099f \u0995\u09b0\u09c1\u09a8\u0964',
      perWeekReached: '\u09b2\u0995\u09cd\u09b7\u09cd\u09af\u09c7\u09b0 \u09a4\u09be\u09b0\u09bf\u0996 \u09aa\u09c7\u09b0\u09bf\u09af\u09bc\u09c7 \u0997\u09c7\u099b\u09c7 \u2014 \u09b2\u0995\u09cd\u09b7\u09cd\u09af \u0986\u09aa\u09a1\u09c7\u099f \u0995\u09b0\u09c1\u09a8\u0964',
      trend: '\u0993\u099c\u09a8\u09c7\u09b0 \u099f\u09cd\u09b0\u09c7\u09a8\u09cd\u09a1 (\u09b6\u09c7\u09b7 \u09e9\u09e6\u099f\u09bf \u098f\u09a8\u09cd\u099f\u09cd\u09b0\u09bf)',
      trendEmpty: '\u098f\u0996\u09a8\u09cb \u0995\u09cb\u09a8\u09cb \u098f\u09a8\u09cd\u099f\u09cd\u09b0\u09bf \u09a8\u09c7\u0987\u0964 \u09a8\u09bf\u099a\u09c7 \u09aa\u09cd\u09b0\u09a5\u09ae \u0993\u099c\u09a8 \u09af\u09cb\u0997 \u0995\u09b0\u09c1\u09a8\u0964',
      addEntry: '\u098f\u09a8\u09cd\u099f\u09cd\u09b0\u09bf \u09af\u09cb\u0997 / \u0986\u09aa\u09a1\u09c7\u099f \u0995\u09b0\u09c1\u09a8', date: '\u09a4\u09be\u09b0\u09bf\u0996', weight: '\u0993\u099c\u09a8 (\u0995\u09c7\u099c\u09bf)',
      note: '\u09a8\u09cb\u099f (\u0990\u099a\u09cd\u099b\u09bf\u0995)', saveEntry: '\u098f\u09a8\u09cd\u099f\u09cd\u09b0\u09bf \u09b8\u0982\u09b0\u0995\u09cd\u09b7\u09a3 \u0995\u09b0\u09c1\u09a8', entrySaved: '\u098f\u09a8\u09cd\u099f\u09cd\u09b0\u09bf \u09b8\u0982\u09b0\u0995\u09cd\u09b7\u09bf\u09a4 \u09b9\u09af\u09bc\u09c7\u099b\u09c7\u0964',
      profile: '\u09aa\u09cd\u09b0\u09cb\u09ab\u09be\u0987\u09b2', height: '\u0989\u099a\u09cd\u099a\u09a4\u09be (\u09b8\u09c7\u09ae\u09bf)', targetWeight: '\u09b2\u0995\u09cd\u09b7\u09cd\u09af \u0993\u099c\u09a8 (\u0995\u09c7\u099c\u09bf)',
      targetDate: '\u09b2\u0995\u09cd\u09b7\u09cd\u09af\u09c7\u09b0 \u09a4\u09be\u09b0\u09bf\u0996', saveProfile: '\u09aa\u09cd\u09b0\u09cb\u09ab\u09be\u0987\u09b2 \u09b8\u0982\u09b0\u0995\u09cd\u09b7\u09a3 \u0995\u09b0\u09c1\u09a8', profileSaved: '\u09aa\u09cd\u09b0\u09cb\u09ab\u09be\u0987\u09b2 \u09b8\u0982\u09b0\u0995\u09cd\u09b7\u09bf\u09a4 \u09b9\u09af\u09bc\u09c7\u099b\u09c7\u0964',
      profileHint: '\u0989\u099a\u09cd\u099a\u09a4\u09be \u09a5\u09c7\u0995\u09c7 \u09ac\u09bf\u098f\u09ae\u0986\u0987 \u09b9\u09bf\u09b8\u09be\u09ac \u09b9\u09af\u09bc\u0964 \u09b2\u0995\u09cd\u09b7\u09cd\u09af \u0993\u099c\u09a8 + \u09a4\u09be\u09b0\u09bf\u0996 \u09a5\u09c7\u0995\u09c7 \u09b2\u0995\u09cd\u09b7\u09cd\u09af\u09c7\u09b0 \u0985\u0997\u09cd\u09b0\u0997\u09a4\u09bf \u0993 \u09b8\u09be\u09aa\u09cd\u09a4\u09be\u09b9\u09bf\u0995 \u0997\u09a4\u09bf \u09b9\u09bf\u09b8\u09be\u09ac \u09b9\u09af\u09bc\u0964',
      history: '\u0987\u09a4\u09bf\u09b9\u09be\u09b8', historyEmpty: '\u098f\u0996\u09a8\u09cb \u0995\u09cb\u09a8\u09cb \u098f\u09a8\u09cd\u099f\u09cd\u09b0\u09bf \u09a8\u09c7\u0987\u0964',
      delete: '\u09ae\u09c1\u099b\u09c1\u09a8', edit: '\u09b8\u09ae\u09cd\u09aa\u09be\u09a6\u09a8\u09be', confirmDelete: '\u098f\u0987 \u09a4\u09be\u09b0\u09bf\u0996\u09c7\u09b0 \u098f\u09a8\u09cd\u099f\u09cd\u09b0\u09bf \u09ae\u09c1\u099b\u09ac\u09c7\u09a8?',
      export: 'JSON \u098f\u0995\u09cd\u09b8\u09aa\u09cb\u09b0\u09cd\u099f', import: 'JSON \u0987\u09ae\u09aa\u09cb\u09b0\u09cd\u099f', erase: '\u09b8\u09ac \u09a1\u09c7\u099f\u09be \u09ae\u09c1\u099b\u09c7 \u09ab\u09c7\u09b2\u09c1\u09a8',
      erasePrompt: '\u09b8\u09ac \u098f\u09a8\u09cd\u099f\u09cd\u09b0\u09bf \u0993 \u09aa\u09cd\u09b0\u09cb\u09ab\u09be\u0987\u09b2 \u09ae\u09c1\u099b\u09a4\u09c7 DELETE \u09b2\u09bf\u0996\u09c1\u09a8\u0964',
      eraseDone: '\u09b8\u09ac \u09a1\u09c7\u099f\u09be \u09ae\u09c1\u099b\u09c7 \u09ab\u09c7\u09b2\u09be \u09b9\u09af\u09bc\u09c7\u099b\u09c7\u0964', importDone: '\u0987\u09ae\u09aa\u09cb\u09b0\u09cd\u099f \u09b8\u09ab\u09b2 \u09b9\u09af\u09bc\u09c7\u099b\u09c7\u0964',
      dataHint: '\u0986\u09aa\u09a8\u09be\u09b0 \u09a1\u09c7\u099f\u09be \u09b6\u09c1\u09a7\u09c1 \u098f\u0987 \u09ac\u09cd\u09b0\u09be\u0989\u099c\u09be\u09b0\u09c7 (localStorage) \u09a5\u09be\u0995\u09c7\u0964 \u09af\u09c7\u0995\u09cb\u09a8\u09cb \u09b8\u09ae\u09af\u09bc \u09ac\u09cd\u09af\u09be\u0995\u0986\u09aa \u098f\u0995\u09cd\u09b8\u09aa\u09cb\u09b0\u09cd\u099f \u0995\u09b0\u09c1\u09a8\u0964',
      total: '\u09ae\u09cb\u099f \u09aa\u09b0\u09bf\u09ac\u09b0\u09cd\u09a4\u09a8', avg7d: '\u0997\u09a1\u09bc \u00b7 \u09ed \u09a6\u09bf\u09a8', avg30d: '\u0997\u09a1\u09bc \u00b7 \u09e9\u09e6 \u09a6\u09bf\u09a8',
      entries: '\u099f\u09bf \u098f\u09a8\u09cd\u099f\u09cd\u09b0\u09bf', noTarget: '\u09b2\u0995\u09cd\u09b7\u09cd\u09af \u09b8\u09c7\u099f \u0995\u09b0\u09be \u09b9\u09af\u09bc\u09a8\u09bf',
      goalDone: '\u09b2\u0995\u09cd\u09b7\u09cd\u09af \u0985\u09b0\u09cd\u099c\u09bf\u09a4!', goalToGo: '\u09ac\u09be\u0995\u09bf',
      start: '\u09b6\u09c1\u09b0\u09c1', footer: '\u09ac\u09cd\u09af\u0995\u09cd\u09a4\u09bf\u0997\u09a4 \u099f\u09cd\u09b0\u09cd\u09af\u09be\u0995\u09be\u09b0\u0964 \u099a\u09bf\u0995\u09bf\u09ce\u09b8\u09be \u09aa\u09b0\u09be\u09ae\u09b0\u09cd\u09b6 \u09a8\u09af\u09bc\u0964 \u09ac\u09bf\u098f\u09ae\u0986\u0987 \u098f\u0995\u099f\u09bf \u09b8\u09cd\u0995\u09cd\u09b0\u09bf\u09a8\u09bf\u0982 \u099f\u09c1\u09b2 \u2014 \u0986\u09aa\u09a8\u09be\u09b0 \u099c\u09a8\u09cd\u09af \u098f\u09b0 \u0985\u09b0\u09cd\u09a5 \u0995\u09c0 \u09a4\u09be \u099a\u09bf\u0995\u09bf\u09ce\u09b8\u0995\u09c7\u09b0 \u09b8\u0999\u09cd\u0997\u09c7 \u0995\u09a5\u09be \u09ac\u09b2\u09c1\u09a8\u0964',
      bmiUnderweight: '\u0995\u09ae \u0993\u099c\u09a8', bmiNormal: '\u09b8\u09cd\u09ac\u09be\u09ad\u09be\u09ac\u09bf\u0995', bmiOverweight: '\u0985\u09a4\u09bf\u09b0\u09bf\u0995\u09cd\u09a4 \u0993\u099c\u09a8', bmiObese: '\u09b8\u09cd\u09a5\u09c2\u09b2\u09a4\u09be',
      err_dateRequired: '\u09a4\u09be\u09b0\u09bf\u0996 \u0986\u09ac\u09b6\u09cd\u09af\u0995\u0964',
      err_dateInvalid: '\u09a4\u09be\u09b0\u09bf\u0996\u099f\u09bf \u09ac\u09c8\u09a7 \u09a8\u09af\u09bc\u0964',
      err_dateFuture: '\u09a4\u09be\u09b0\u09bf\u0996 \u09ad\u09ac\u09bf\u09b7\u09cd\u09af\u09a4\u09c7\u09b0 \u09b9\u09a4\u09c7 \u09aa\u09be\u09b0\u09ac\u09c7 \u09a8\u09be\u0964',
      err_weightRequired: '\u0993\u099c\u09a8 \u0986\u09ac\u09b6\u09cd\u09af\u0995\u0964',
      err_weightInvalid: '\u0993\u099c\u09a8 \u09b8\u0982\u0996\u09cd\u09af\u09be \u09b9\u09a4\u09c7 \u09b9\u09ac\u09c7\u0964',
      err_weightRange: '\u0993\u099c\u09a8 \u09e8\u09e6 \u09a5\u09c7\u0995\u09c7 \u09ea\u09e6\u09e6 \u0995\u09c7\u099c\u09bf\u09b0 \u09ae\u09a7\u09cd\u09af\u09c7 \u09b9\u09a4\u09c7 \u09b9\u09ac\u09c7\u0964',
      err_noteTooLong: '\u09a8\u09cb\u099f \u0985\u09a8\u09c7\u0995 \u09ac\u09a1\u09bc (\u09b8\u09b0\u09cd\u09ac\u09cb\u099a\u09cd\u099a \u09e8\u09e6\u09e6 \u0985\u0995\u09cd\u09b7\u09b0)\u0964',
      err_noteInvalid: '\u09a8\u09cb\u099f \u09b2\u09c7\u0996\u09be \u09b9\u09a4\u09c7 \u09b9\u09ac\u09c7\u0964',
      err_heightRange: '\u0989\u099a\u09cd\u099a\u09a4\u09be \u09e7\u09e6\u09e6 \u09a5\u09c7\u0995\u09c7 \u09e8\u09eb\u09e6 \u09b8\u09c7\u09ae\u09bf\u09b0 \u09ae\u09a7\u09cd\u09af\u09c7 \u09b9\u09a4\u09c7 \u09b9\u09ac\u09c7\u0964',
      err_targetRange: '\u09b2\u0995\u09cd\u09b7\u09cd\u09af \u0993\u099c\u09a8 \u09e8\u09e6 \u09a5\u09c7\u0995\u09c7 \u09ea\u09e6\u09e6 \u0995\u09c7\u099c\u09bf\u09b0 \u09ae\u09a7\u09cd\u09af\u09c7 \u09b9\u09a4\u09c7 \u09b9\u09ac\u09c7\u0964',
      err_targetDateInvalid: '\u09b2\u0995\u09cd\u09b7\u09cd\u09af\u09c7\u09b0 \u09a4\u09be\u09b0\u09bf\u0996 \u09ac\u09c8\u09a7 \u09a8\u09af\u09bc\u0964',
      err_targetDatePast: '\u09b2\u0995\u09cd\u09b7\u09cd\u09af\u09c7\u09b0 \u09a4\u09be\u09b0\u09bf\u0996 \u0985\u09a4\u09c0\u09a4\u09c7\u09b0 \u09b9\u09a4\u09c7 \u09aa\u09be\u09b0\u09ac\u09c7 \u09a8\u09be\u0964',
      err_import: '\u09ab\u09be\u0987\u09b2\u099f\u09bf \u09ac\u09c8\u09a7 Weight Tracker \u098f\u0995\u09cd\u09b8\u09aa\u09cb\u09b0\u09cd\u099f \u09a8\u09af\u09bc\u0964',
      langBtn: 'English'
    }
  };

  var LS_ENTRIES = 'wtb-entries-v1';
  var LS_PROFILE = 'wtb-profile-v1';
  var LS_LANG = 'wtb-lang-v1';

  function getToday() {
    var m = /[?&]asof=(\d{4}-\d{2}-\d{2})/.exec(location.search);
    if (m && L.isValidDateStr(m[1])) return m[1];
    var d = new Date();
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') +
      '-' + String(d.getDate()).padStart(2, '0');
  }
  var TODAY = getToday();

  var state = { entries: [], profile: L.cleanProfile({}), lang: 'en' };

  function t(key) { return (I18N[state.lang] || I18N.en)[key] || key; }

  function load() {
    try {
      var e = JSON.parse(localStorage.getItem(LS_ENTRIES) || '[]');
      if (Array.isArray(e)) state.entries = e.filter(function (x) {
        return x && L.isValidDateStr(x.date) && typeof x.weightKg === 'number';
      }).sort(function (a, b) { return L.dateToDays(a.date) - L.dateToDays(b.date); });
    } catch (err) { state.entries = []; }
    try {
      var p = JSON.parse(localStorage.getItem(LS_PROFILE) || 'null');
      if (p && typeof p === 'object') state.profile = L.cleanProfile(p);
    } catch (err) { state.profile = L.cleanProfile({}); }
    var lang = localStorage.getItem(LS_LANG);
    if (lang === 'bn' || lang === 'en') state.lang = lang;
  }

  function save() {
    localStorage.setItem(LS_ENTRIES, JSON.stringify(state.entries));
    localStorage.setItem(LS_PROFILE, JSON.stringify(state.profile));
    localStorage.setItem(LS_LANG, state.lang);
  }

  function el(id) { return document.getElementById(id); }
  function showMsg(id, text, isError) {
    var m = el(id);
    m.textContent = text || '';
    m.className = 'msg' + (isError ? ' error' : ' ok');
  }

  function fmt(n, decimals) { return L.formatNum(n, state.lang, decimals); }
  function fmtSigned(n, decimals) { return L.formatSigned(n, state.lang, decimals); }

  function renderLang() {
    document.documentElement.lang = state.lang === 'bn' ? 'bn' : 'en';
    document.querySelectorAll('[data-i18n]').forEach(function (n) {
      n.textContent = t(n.getAttribute('data-i18n'));
    });
    el('langBtn').textContent = t('langBtn');
  }

  function renderDashboard() {
    var s = L.stats(state.entries, TODAY);
    var lang = state.lang;
    el('statLatest').textContent = s.latest ?
      fmt(s.latest.weightKg, 1) + ' kg (' + fmt(L.kgToLb(s.latest.weightKg), 1) + ' lb)' : '\u2014';
    el('statLatestDate').textContent = s.latest ?
      s.latest.date : '';
    el('statChange7').textContent = fmtSigned(s.change7d, 2) + ' kg';
    el('statChange30').textContent = fmtSigned(s.change30d, 2) + ' kg';
    el('statTotal').textContent = fmtSigned(s.totalChange, 2) + ' kg';
    el('statAvg7').textContent = s.avg7d === null ? '\u2014' : fmt(s.avg7d, 1) + ' kg';
    el('statAvg30').textContent = s.avg30d === null ? '\u2014' : fmt(s.avg30d, 1) + ' kg';
    el('statCount').textContent = L.formatNum(s.count, lang, 0) + ' ' + t('entries');

    // BMI
    var bmi = (s.latest && state.profile.heightCm) ?
      L.computeBMI(s.latest.weightKg, state.profile.heightCm) : null;
    el('statBmi').textContent = bmi === null ? '\u2014' : fmt(bmi, 1);
    var cat = L.bmiCategory(bmi);
    el('statBmiCat').textContent = cat === null ? t('bmiNone') :
      t('bmi' + cat.charAt(0).toUpperCase() + cat.slice(1));

    // Goal
    var target = state.profile.targetWeightKg;
    var goalEl = el('goalBox');
    if (target === null || !s.latest) {
      el('goalText').textContent = t('noTarget');
      el('goalBar').style.width = '0%';
      el('goalPct').textContent = '';
    } else {
      var startW = s.first ? s.first.weightKg : s.latest.weightKg;
      var p = L.goalProgress(startW, s.latest.weightKg, target);
      el('goalBar').style.width = p + '%';
      el('goalPct').textContent = fmt(p, 1) + '%';
      var remaining = L.round2(target - s.latest.weightKg);
      el('goalText').textContent = (p >= 100) ? t('goalDone') :
        fmt(Math.abs(remaining), 1) + ' kg ' + t('goalToGo');
    }
    // Per-week pace
    var pw = (s.latest && target !== null && state.profile.targetDate) ?
      L.requiredPerWeek(s.latest.weightKg, target, TODAY, state.profile.targetDate) : null;
    if (target === null || !state.profile.targetDate || !s.latest) {
      el('statPerWeek').textContent = t('perWeekNone');
    } else if (pw === null) {
      el('statPerWeek').textContent = t('perWeekReached');
    } else {
      el('statPerWeek').textContent = fmtSigned(pw, 2) + ' kg/' +
        (lang === 'bn' ? '\u09b8\u09aa\u09cd\u09a4\u09be\u09b9' : 'week');
    }
    renderChart();
  }

  function renderChart() {
    var svg = el('chart');
    var last = state.entries.slice(-30);
    if (!last.length) {
      svg.innerHTML = '<text x="10" y="24" class="chart-empty">' + t('trendEmpty') + '</text>';
      return;
    }
    var W = 640, H = 180, padL = 44, padR = 12, padT = 14, padB = 26;
    var weights = last.map(function (e) { return e.weightKg; });
    var min = Math.min.apply(null, weights), max = Math.max.apply(null, weights);
    if (min === max) { min -= 1; max += 1; }
    var target = state.profile.targetWeightKg;
    function x(i) { return padL + (W - padL - padR) * (last.length === 1 ? 0.5 : i / (last.length - 1)); }
    function y(w) { return padT + (H - padT - padB) * (1 - (w - min) / (max - min)); }
    var pts = last.map(function (e, i) { return x(i).toFixed(1) + ',' + y(e.weightKg).toFixed(1); }).join(' ');
    var html = '';
    if (target !== null && target >= min - 5 && target <= max + 5) {
      var ty = y(Math.max(min, Math.min(max, target)));
      html += '<line x1="' + padL + '" y1="' + ty.toFixed(1) + '" x2="' + (W - padR) +
        '" y2="' + ty.toFixed(1) + '" class="chart-goal-line"/>';
      html += '<text x="' + (W - padR) + '" y="' + (ty - 4).toFixed(1) +
        '" text-anchor="end" class="chart-goal-label">' + fmt(target, 1) + '</text>';
    }
    html += '<polyline points="' + pts + '" class="chart-line" fill="none"/>';
    last.forEach(function (e, i) {
      html += '<circle cx="' + x(i).toFixed(1) + '" cy="' + y(e.weightKg).toFixed(1) +
        '" r="3.5" class="chart-dot"><title>' + e.date + ': ' + e.weightKg + ' kg</title></circle>';
    });
    html += '<text x="6" y="' + (y(max) + 4).toFixed(1) + '" class="chart-axis">' + fmt(max, 1) + '</text>';
    html += '<text x="6" y="' + (y(min) + 4).toFixed(1) + '" class="chart-axis">' + fmt(min, 1) + '</text>';
    html += '<text x="' + padL + '" y="' + (H - 8) + '" class="chart-axis">' + last[0].date + '</text>';
    html += '<text x="' + (W - padR) + '" y="' + (H - 8) + '" text-anchor="end" class="chart-axis">' +
      last[last.length - 1].date + '</text>';
    svg.innerHTML = html;
  }

  function renderHistory() {
    var tbody = el('historyBody');
    if (!state.entries.length) {
      tbody.innerHTML = '<tr><td colspan="4" class="empty">' + t('historyEmpty') + '</td></tr>';
      return;
    }
    var rows = state.entries.slice().reverse().map(function (e) {
      var note = e.note ? ' <span class="note">' + escapeHtml(e.note) + '</span>' : '';
      return '<tr><td>' + e.date + '</td><td>' + fmt(e.weightKg, 1) + ' kg</td><td>' +
        note + '</td><td><button class="btn small" data-edit="' + e.date + '">' + t('edit') +
        '</button> <button class="btn small danger" data-del="' + e.date + '">' + t('delete') +
        '</button></td></tr>';
    }).join('');
    tbody.innerHTML = rows;
    tbody.querySelectorAll('[data-del]').forEach(function (b) {
      b.addEventListener('click', function () {
        if (!confirm(t('confirmDelete'))) return;
        state.entries = L.deleteEntry(state.entries, b.getAttribute('data-del'));
        save(); renderAll();
      });
    });
    tbody.querySelectorAll('[data-edit]').forEach(function (b) {
      b.addEventListener('click', function () {
        var e = state.entries.find(function (x) { return x.date === b.getAttribute('data-edit'); });
        if (!e) return;
        el('entryDate').value = e.date;
        el('entryWeight').value = e.weightKg;
        el('entryNote').value = e.note || '';
        switchTab('log');
        el('entryDate').focus();
      });
    });
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function renderAll() {
    renderLang();
    renderDashboard();
    renderHistory();
  }

  function switchTab(name) {
    document.querySelectorAll('.tab').forEach(function (b) {
      b.classList.toggle('active', b.getAttribute('data-tab') === name);
    });
    document.querySelectorAll('.panel').forEach(function (p) {
      p.classList.toggle('active', p.id === 'panel-' + name);
    });
  }

  function init() {
    load();
    el('entryDate').value = TODAY;
    el('entryDate').max = TODAY;
    el('profileHeight').value = state.profile.heightCm === null ? '' : state.profile.heightCm;
    el('profileTarget').value = state.profile.targetWeightKg === null ? '' : state.profile.targetWeightKg;
    el('profileTargetDate').value = state.profile.targetDate || '';
    el('profileTargetDate').min = TODAY;

    document.querySelectorAll('.tab').forEach(function (b) {
      b.addEventListener('click', function () { switchTab(b.getAttribute('data-tab')); });
    });
    el('langBtn').addEventListener('click', function () {
      state.lang = state.lang === 'en' ? 'bn' : 'en';
      save(); renderAll();
    });

    el('entryForm').addEventListener('submit', function (ev) {
      ev.preventDefault();
      var entry = {
        date: el('entryDate').value,
        weightKg: el('entryWeight').value === '' ? null : Number(el('entryWeight').value),
        note: el('entryNote').value.trim()
      };
      var errs = L.validateEntry(entry, TODAY);
      if (errs.length) { showMsg('entryMsg', t('err_' + errs[0]), true); return; }
      state.entries = L.upsertEntry(state.entries, entry);
      save(); renderAll();
      showMsg('entryMsg', t('entrySaved'), false);
      el('entryWeight').value = '';
      el('entryNote').value = '';
    });

    el('profileForm').addEventListener('submit', function (ev) {
      ev.preventDefault();
      var profile = L.cleanProfile({
        heightCm: el('profileHeight').value === '' ? null : Number(el('profileHeight').value),
        targetWeightKg: el('profileTarget').value === '' ? null : Number(el('profileTarget').value),
        targetDate: el('profileTargetDate').value
      });
      var errs = L.validateProfile(profile, TODAY);
      if (errs.length) { showMsg('profileMsg', t('err_' + errs[0]), true); return; }
      state.profile = profile;
      save(); renderAll();
      showMsg('profileMsg', t('profileSaved'), false);
    });

    el('exportBtn').addEventListener('click', function () {
      var blob = new Blob([JSON.stringify(L.exportPayload(state.entries, state.profile), null, 2)],
        { type: 'application/json' });
      var a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'weight-tracker-bd-' + TODAY + '.json';
      a.click();
      URL.revokeObjectURL(a.href);
    });

    el('importFile').addEventListener('change', function () {
      var file = el('importFile').files[0];
      if (!file) return;
      var reader = new FileReader();
      reader.onload = function () {
        try {
          var res = L.validateImport(JSON.parse(reader.result));
          if (!res.ok) throw new Error('bad import');
          state.entries = res.data.entries;
          state.profile = res.data.profile;
          save(); renderAll();
          el('profileHeight').value = state.profile.heightCm === null ? '' : state.profile.heightCm;
          el('profileTarget').value = state.profile.targetWeightKg === null ? '' : state.profile.targetWeightKg;
          el('profileTargetDate').value = state.profile.targetDate || '';
          showMsg('dataMsg', t('importDone'), false);
        } catch (err) {
          showMsg('dataMsg', t('err_import'), true);
        }
        el('importFile').value = '';
      };
      reader.readAsText(file);
    });

    el('eraseBtn').addEventListener('click', function () {
      var typed = prompt(t('erasePrompt'));
      if (typed !== 'DELETE') return;
      state.entries = [];
      state.profile = L.cleanProfile({});
      save(); renderAll();
      showMsg('dataMsg', t('eraseDone'), false);
    });

    renderAll();
  }

  document.addEventListener('DOMContentLoaded', init);
})();

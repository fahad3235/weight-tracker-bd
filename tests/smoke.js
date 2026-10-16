/* weight-tracker-bd — headless-Chrome smoke test via raw CDP.
   Run: node tests/smoke.js [desktop|mobile]
   Uses /opt/meta-chromium/chrome + Node global WebSocket. No deps. */
'use strict';
const { spawn, execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const MODE = process.argv[2] || 'desktop';
const WIDTH = MODE === 'mobile' ? 390 : 1280;
const PORT = MODE === 'mobile' ? 9224 : 9223;
const DIR = path.resolve(__dirname, '..');
const URL = 'file://' + DIR + '/index.html?asof=2026-10-16';

let passed = 0, failed = 0;
function check(name, cond, extra) {
  if (cond) { passed++; console.log('PASS ' + name); }
  else { failed++; console.log('FAIL ' + name + (extra ? ' :: ' + extra : '')); }
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

class CDP {
  constructor(wsUrl) { this.ws = new WebSocket(wsUrl); this.id = 0; this.pending = new Map(); this.events = []; }
  async open() {
    await new Promise((res, rej) => { this.ws.onopen = res; this.ws.onerror = rej; });
    this.ws.onmessage = (m) => {
      const d = JSON.parse(m.data);
      if (d.id && this.pending.has(d.id)) {
        const { resolve, reject } = this.pending.get(d.id);
        this.pending.delete(d.id);
        d.error ? reject(new Error(JSON.stringify(d.error))) : resolve(d.result);
      } else this.events.push(d);
    };
  }
  send(method, params) {
    const id = ++this.id;
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params: params || {} }));
    });
  }
  async evalExpr(expr) {
    const r = await this.send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true });
    if (r.exceptionDetails) throw new Error('eval exception: ' + JSON.stringify(r.exceptionDetails));
    return r.result.value;
  }
  close() { try { this.ws.close(); } catch (e) {} }
}

(async () => {
  const userDir = '/tmp/wtb-chrome-' + MODE;
  execSync('rm -rf ' + userDir);
  const chrome = spawn('/opt/meta-chromium/chrome', [
    '--headless=new', '--no-sandbox', '--disable-gpu', '--no-proxy-server',
    '--remote-debugging-port=' + PORT, '--user-data-dir=' + userDir, 'about:blank'
  ], { stdio: 'ignore' });
  let cdp = null;
  try {
    let targets = null;
    for (let i = 0; i < 50 && !targets; i++) {
      await sleep(200);
      try { targets = JSON.parse(execSync('curl -s http://127.0.0.1:' + PORT + '/json/list').toString()); } catch (e) {}
    }
    if (!targets || !targets.length) throw new Error('no CDP targets');
    cdp = new CDP(targets[0].webSocketDebuggerUrl);
    await cdp.open();
    await cdp.send('Runtime.enable');
    await cdp.send('Page.enable');
    const consoleErrors = [];
    cdp.ws.onmessage = null; // reattach with console capture below
    // NOTE: onmessage reassigned — re-add handler that keeps pending routing
    cdp.ws.onmessage = (m) => {
      const d = JSON.parse(m.data);
      if (d.id && cdp.pending.has(d.id)) {
        const { resolve, reject } = cdp.pending.get(d.id);
        cdp.pending.delete(d.id);
        d.error ? reject(new Error(JSON.stringify(d.error))) : resolve(d.result);
      } else if (d.method === 'Runtime.consoleAPICalled' && d.params && d.params.type === 'error') {
        consoleErrors.push(JSON.stringify(d.params.args));
      } else if (d.method === 'Runtime.exceptionThrown') {
        consoleErrors.push('exception: ' + JSON.stringify(d.params.exceptionDetails));
      }
    };
    await cdp.send('Emulation.setDeviceMetricsOverride', {
      width: WIDTH, height: 900, deviceScaleFactor: 1, mobile: MODE === 'mobile'
    });
    await cdp.send('Page.navigate', { url: URL });
    await sleep(1500);
    const title = await cdp.evalExpr('document.title');
    check('page loads, title', title.includes('Weight Tracker'), title);

    // Empty state
    check('empty state: latest shows dash', await cdp.evalExpr("document.getElementById('statLatest').textContent") === '—');
    check('empty state: trend message', (await cdp.evalExpr("document.querySelector('#chart text').textContent")).length > 0);

    // Add entry via UI: 2026-10-16, 77.5
    await cdp.evalExpr(`(() => {
      document.getElementById('entryDate').value = '2026-10-16';
      document.getElementById('entryWeight').value = '77.5';
      document.getElementById('entryNote').value = 'morning';
      document.getElementById('entryForm').dispatchEvent(new Event('submit', {bubbles:true, cancelable:true}));
      return true;
    })()`);
    await sleep(300);
    check('add entry: latest 77.5 kg', (await cdp.evalExpr("document.getElementById('statLatest').textContent")).includes('77.5'));
    check('add entry: lb conversion shown', (await cdp.evalExpr("document.getElementById('statLatest').textContent")).includes('170.9'));
    check('add entry: history row', await cdp.evalExpr("document.querySelectorAll('#historyBody tr').length") === 1);
    check('add entry: chart has points', await cdp.evalExpr("document.querySelectorAll('#chart circle').length") === 1);

    // Second entry + profile (height 175 -> BMI 77.5/(1.75^2)=25.3 Overweight; target 75 by 2026-11-13 -> -0.63/wk)
    await cdp.evalExpr(`(() => {
      document.getElementById('entryDate').value = '2026-10-10';
      document.getElementById('entryWeight').value = '78.5';
      document.getElementById('entryForm').dispatchEvent(new Event('submit', {bubbles:true, cancelable:true}));
      document.getElementById('profileHeight').value = '175';
      document.getElementById('profileTarget').value = '75';
      document.getElementById('profileTargetDate').value = '2026-11-13';
      document.getElementById('profileForm').dispatchEvent(new Event('submit', {bubbles:true, cancelable:true}));
      return true;
    })()`);
    await sleep(300);
    check('BMI 25.3 shown', (await cdp.evalExpr("document.getElementById('statBmi').textContent")).includes('25.3'));
    check('BMI category Overweight', (await cdp.evalExpr("document.getElementById('statBmiCat').textContent")).includes('Overweight'));
    check('change 7d = -1.00 kg', (await cdp.evalExpr("document.getElementById('statChange7').textContent")).includes('-1.00'));
    check('goal progress 28.6% (start 78.5 -> 77.5 of 78.5->75)', (await cdp.evalExpr("document.getElementById('goalPct').textContent")).includes('28.6'));
    check('per-week -0.63 kg/week', (await cdp.evalExpr("document.getElementById('statPerWeek').textContent")).includes('-0.63'));
    check('chart goal line present', await cdp.evalExpr("document.querySelectorAll('#chart .chart-goal-line').length") === 1);

    // Reload persistence
    await cdp.send('Page.navigate', { url: URL });
    await sleep(1200);
    check('reload persistence: 2 entries', await cdp.evalExpr("document.querySelectorAll('#historyBody tr').length") === 2);
    check('reload persistence: latest kept', (await cdp.evalExpr("document.getElementById('statLatest').textContent")).includes('77.5'));

    // BN toggle + Bengali digits
    await cdp.evalExpr("document.getElementById('langBtn').click()");
    await sleep(300);
    const bnLatest = await cdp.evalExpr("document.getElementById('statLatest').textContent");
    check('BN toggle: Bengali digits render', bnLatest.includes('\u09ed\u09ed.\u09eb'), bnLatest);
    check('BN toggle: lang attr bn', await cdp.evalExpr("document.documentElement.lang") === 'bn');
    await cdp.evalExpr("document.getElementById('langBtn').click()");
    await sleep(200);

    // Validation: future date rejected inline
    await cdp.evalExpr(`(() => {
      document.getElementById('entryDate').value = '2026-10-17';
      document.getElementById('entryWeight').value = '70';
      document.getElementById('entryForm').dispatchEvent(new Event('submit', {bubbles:true, cancelable:true}));
      return true;
    })()`);
    await sleep(200);
    check('validation: future date error shown', (await cdp.evalExpr("document.getElementById('entryMsg').textContent")).toLowerCase().includes('future'));
    check('validation: no 3rd entry added', await cdp.evalExpr("document.querySelectorAll('#historyBody tr').length") === 2);

    // Delete one entry
    await cdp.evalExpr(`(() => {
      window.confirm = () => true;
      document.querySelector('[data-del="2026-10-10"]').click();
      return true;
    })()`);
    await sleep(300);
    check('delete entry works', await cdp.evalExpr("document.querySelectorAll('#historyBody tr').length") === 1);

    // Typed-DELETE erase
    await cdp.evalExpr(`(() => {
      window.prompt = () => 'DELETE';
      document.getElementById('eraseBtn').click();
      return true;
    })()`);
    await sleep(300);
    check('erase-all: history empty', await cdp.evalExpr("document.querySelectorAll('#historyBody tr td.empty').length") === 1);
    check('erase-all: latest dash again', await cdp.evalExpr("document.getElementById('statLatest').textContent") === '—');

    // No horizontal overflow
    const overflow = await cdp.evalExpr('document.documentElement.scrollWidth <= ' + WIDTH + ' + 1');
    check('no horizontal overflow at ' + WIDTH + 'px', overflow,
      'scrollWidth=' + await cdp.evalExpr('document.documentElement.scrollWidth'));

    // Zero network requests (file:// page + local assets only)
    const perf = await cdp.evalExpr("performance.getEntriesByType('resource').filter(r => !r.name.startsWith('file:')).length");
    check('zero non-file network requests', perf === 0, 'non-file=' + perf);

    check('zero console errors', consoleErrors.length === 0, consoleErrors.slice(0, 3).join(' | '));
  } catch (e) {
    failed++;
    console.log('FAIL harness: ' + (e && e.stack || e));
  } finally {
    if (cdp) cdp.close();
    chrome.kill();
    console.log('\n' + MODE + ': ' + passed + ' passed, ' + failed + ' failed');
    if (failed) process.exitCode = 1;
  }
})();

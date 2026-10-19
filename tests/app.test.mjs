import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { webcrypto } from 'node:crypto';

const source = readFileSync(new URL('../weight-n-waist-app/dist/app.js', import.meta.url), 'utf8');
function app(saved) {
  const elements = new Map();
  const storage = new Map(saved ? [['weight-n-waist-v1', JSON.stringify(saved)]] : []);
  const element = selector => {
    if (!elements.has(selector)) elements.set(selector, {
      value: selector === '#range' ? 'all' : '', textContent: '', innerHTML: '', style: {},
      classList: { toggle() {} }, addEventListener(event, fn) { this[event] = fn; },
      showModal() {}, close() {},
    });
    return elements.get(selector);
  };
  const context = vm.createContext({
    document: { querySelector: element, querySelectorAll: () => [], addEventListener() {} },
    localStorage: { getItem: key => storage.get(key) || null, setItem: (key, value) => storage.set(key, value) },
    crypto: webcrypto, Date, console, setTimeout: () => 1, clearTimeout() {},
  });
  vm.runInContext(source, context);
  return { run: code => vm.runInContext(code, context), element, storage };
}

test('sample entries do not populate the real journal', () => {
  const a = app();
  assert.equal(a.run('rows().length'), 12);
  assert.equal(a.run('state.entries.length'), 0);
  assert.equal(a.storage.size, 0);
});

test('metric and imperial conversions round-trip without changing stored measurements', () => {
  const a = app();
  a.run("state.units='imperial'");
  assert.ok(Math.abs(a.run("convert(100,'weight')") - 220.46226218) < 1e-8);
  assert.ok(Math.abs(a.run("convert(2.54,'waist')") - 1) < 1e-10);
  assert.ok(Math.abs(a.run("canonical(convert(78.6,'weight'),'weight')") - 78.6) < 1e-8);
});

test('a real optional-only entry exits demo, persists, and survives reload', () => {
  const a = app();
  a.element('#date').value = '2026-01-10';
  a.element('#f-hips').value = '95.5';
  a.element('#note').value = '<script>alert(1)</script>';
  a.element('#entry-form').submit({ preventDefault() {} });
  assert.equal(a.run('demo'), false);
  assert.equal(a.run('state.entries.length'), 1);
  assert.equal(a.run('state.entries[0].hips'), 95.5);
  assert.equal(a.run('state.entries[0].weight'), undefined);
  const saved = JSON.parse(a.storage.get('weight-n-waist-v1'));
  const b = app(saved);
  assert.equal(b.run('demo'), false);
  assert.equal(b.run('rows().length'), 1);
  assert.ok(b.element('#history-list').innerHTML.includes('&lt;script&gt;'));
  assert.ok(!b.element('#history-list').innerHTML.includes('<script>'));
});

test('an empty measurement form does not create a record', () => {
  const a = app();
  a.element('#date').value = '2026-01-10';
  a.element('#entry-form').submit({ preventDefault() {} });
  assert.equal(a.run('state.entries.length'), 0);
  assert.match(a.element('#form-error').textContent, /at least one/);
});

test('editing replaces only the selected entry and history sorts by date', () => {
  const a = app({ started: true, entries: [
    { id: 'newer', date: '2026-01-12', weight: 80 },
    { id: 'older', date: '2026-01-10', weight: 81 },
  ] });
  assert.equal(a.run('rows()[0].id'), 'older');
  a.element('#entry-id').value = 'newer';
  a.element('#date').value = '2026-01-12';
  a.element('#f-weight').value = '79.5';
  a.element('#entry-form').submit({ preventDefault() {} });
  assert.equal(a.run('state.entries.length'), 2);
  assert.equal(a.run("state.entries.find(e=>e.id==='newer').weight"), 79.5);
  assert.equal(a.run("state.entries.find(e=>e.id==='older').weight"), 81);
});

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import vm from 'node:vm';

const root = new URL('../weight-n-waist-app/dist/', import.meta.url);
const source = readFileSync(new URL('sw.js', root), 'utf8');
function worker() {
  const handlers = {};
  const stored = new Map();
  const deleted = [];
  const cache = {
    async addAll(requests) {
      for (const request of requests) {
        const path = request.url === '/' ? 'index.html' : request.url.slice(1);
        assert.ok(existsSync(new URL(path, root)), `Precache file exists: ${path}`);
        stored.set(request.url, readFileSync(new URL(path, root)));
      }
    },
    async match(path) { return stored.get(path); },
  };
  let claimed = false;
  const context = vm.createContext({
    self: {
      location: { origin: 'https://example.test' },
      addEventListener: (name, callback) => { handlers[name] = callback; },
      clients: { async claim() { claimed = true; } },
    },
    caches: {
      async open() { return cache; },
      async keys() { return ['weight-n-waist-shell-v0', 'weight-n-waist-shell-v1', 'other-app']; },
      async delete(name) { deleted.push(name); },
    },
    Request: class { constructor(url, options) { this.url = url; this.options = options; } },
    URL,
    fetch: async () => { throw new Error('Offline'); },
  });
  vm.runInContext(source, context);
  return { handlers, stored, deleted, claimed: () => claimed };
}

test('manifest declares standalone launch and valid PNG icon dimensions', () => {
  const manifest = JSON.parse(readFileSync(new URL('manifest.webmanifest', root)));
  assert.equal(manifest.display, 'standalone');
  assert.equal(manifest.start_url, '/');
  assert.equal(manifest.scope, '/');
  assert.ok(manifest.icons.some(icon => icon.sizes === '192x192'));
  assert.ok(manifest.icons.some(icon => icon.sizes === '512x512'));
  assert.ok(manifest.icons.some(icon => icon.purpose === 'maskable'));
  for (const icon of [...manifest.icons, { src: '/icons/apple-touch-icon.png', sizes: '180x180' }]) {
    const bytes = readFileSync(new URL(icon.src.slice(1), root));
    assert.equal(bytes.subarray(1, 4).toString(), 'PNG');
    assert.equal(`${bytes.readUInt32BE(16)}x${bytes.readUInt32BE(20)}`, icon.sizes);
  }
});

test('offline worker precaches a complete shell and serves navigation and scripts without network', async () => {
  const w = worker();
  let installing;
  w.handlers.install({ waitUntil(p) { installing = p; } });
  await installing;
  for (const [path, mode, expected] of [['/?source=installed', 'navigate', '/index.html'], ['/app.js', 'cors', '/app.js'], ['/style.css', 'cors', '/style.css'], ['/pwa.js', 'cors', '/pwa.js']]) {
    let response;
    w.handlers.fetch({ request: { url: `https://example.test${path}`, mode, method: 'GET' }, respondWith(p) { response = p; } });
    assert.deepEqual(await response, w.stored.get(expected));
  }
});

test('activation removes only old app caches', async () => {
  const w = worker();
  let activation;
  w.handlers.activate({ waitUntil(p) { activation = p; } });
  await activation;
  assert.deepEqual(w.deleted, ['weight-n-waist-shell-v0']);
  assert.equal(w.claimed(), true);
});

test('worker leaves third-party, non-GET, and unrelated requests alone', () => {
  const w = worker();
  for (const request of [
    { url: 'https://fonts.googleapis.com/css2', method: 'GET' },
    { url: 'https://example.test/app.js', method: 'POST' },
    { url: 'https://example.test/api/measurements', method: 'GET' },
  ]) {
    w.handlers.fetch({ request, respondWith() { assert.fail('Request must not be intercepted'); } });
  }
});

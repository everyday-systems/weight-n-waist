import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
const root = new URL('../weight-n-waist-app/dist/', import.meta.url);
const files = new Map([
  ['/', ['index.html', 'text/html; charset=utf-8']],
  ['/index.html', ['index.html', 'text/html; charset=utf-8']],
  ['/style.css', ['style.css', 'text/css; charset=utf-8']],
  ['/app.js', ['app.js', 'text/javascript; charset=utf-8']],
  ['/pwa.js', ['pwa.js', 'text/javascript; charset=utf-8']],
  ['/sw.js', ['sw.js', 'text/javascript; charset=utf-8']],
  ['/manifest.webmanifest', ['manifest.webmanifest', 'application/manifest+json']],
  ...['icon-192.png', 'icon-512.png', 'icon-maskable-512.png', 'apple-touch-icon.png']
    .map(name => [`/icons/${name}`, [`icons/${name}`, 'image/png']]),
]);
const port = Number(process.env.PORT || 4173);
createServer(async (request, response) => {
  const file = files.get(new URL(request.url, 'http://localhost').pathname);
  if (!file) { response.writeHead(404); response.end('Not found'); return; }
  try {
    const content = await readFile(new URL(file[0], root));
    response.writeHead(200, { 'Content-Type': file[1], 'Cache-Control': 'no-store' });
    response.end(content);
  } catch {
    response.writeHead(500);
    response.end('Unable to read app assets');
  }
}).listen(port, '127.0.0.1', () => console.log(`Local: http://127.0.0.1:${port}`));

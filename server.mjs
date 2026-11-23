// Minimal production server for Google Cloud Run (no extra dependencies).
// Serves the Vite build in ./dist, listens on $PORT and 0.0.0.0.
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize, resolve } from 'node:path';

const DIST = resolve('dist');
const PORT = Number(process.env.PORT) || 8080;
const TYPES = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.ico': 'image/x-icon', '.json': 'application/json',
  '.woff2': 'font/woff2',
};
const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Content-Security-Policy':
    "default-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
    "font-src 'self' https://fonts.gstatic.com; img-src 'self' data:; frame-ancestors 'none'",
};

async function fileFor(urlPath) {
  const safe = normalize(decodeURIComponent(urlPath)).replace(/^(\.\.[/\\])+/, '');
  const full = join(DIST, safe);
  if (!full.startsWith(DIST)) return null; // block path traversal
  try {
    if ((await stat(full)).isFile()) return full;
  } catch { /* fall through to SPA index */ }
  return null;
}

createServer(async (req, res) => {
  try {
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      res.writeHead(405, SECURITY_HEADERS).end();
      return;
    }
    const path = new URL(req.url ?? '/', 'http://localhost').pathname;
    if (path === '/healthz') {
      res.writeHead(200, { ...SECURITY_HEADERS, 'Content-Type': 'text/plain' }).end('ok');
      return;
    }
    const file = (await fileFor(path)) ?? join(DIST, 'index.html');
    const body = await readFile(file);
    const cache = file.includes(`${join(DIST, 'assets')}`) ? 'public, max-age=31536000, immutable' : 'no-cache';
    res.writeHead(200, {
      ...SECURITY_HEADERS,
      'Content-Type': TYPES[extname(file)] ?? 'application/octet-stream',
      'Cache-Control': cache,
    });
    res.end(req.method === 'HEAD' ? undefined : body);
  } catch {
    res.writeHead(500, SECURITY_HEADERS).end('Internal Server Error');
  }
}).listen(PORT, '0.0.0.0', () => console.log(`LabLink listening on 0.0.0.0:${PORT}`));

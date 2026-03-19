#!/usr/bin/env node

/* ============================================
   LET'S BE READY — Wix photo scraper
   Pulls every static.wixstatic.com image referenced
   in the local Wix HTML scrapes (project root) and
   downloads the FULL-RES originals into wix-photos/
   ============================================ */

const fs = require('fs');
const path = require('path');
const https = require('https');

const PROJECT_ROOT = path.resolve(__dirname, '..', '..');
const OUT_DIR = path.join(PROJECT_ROOT, 'wix-photos');

// Source HTML files to scrape (project root + new-site fallback data)
const SOURCE_PATHS = [
  path.join(PROJECT_ROOT, 'index.html'),
  path.join(PROJECT_ROOT, 'donate'),
  path.join(PROJECT_ROOT, 'blank-1'),
  path.join(PROJECT_ROOT, 'blank-4'),
  path.join(PROJECT_ROOT, 'blank-5'),
  path.join(PROJECT_ROOT, 'blank-6'),
  path.join(PROJECT_ROOT, 'blank-6-1'),
  path.join(PROJECT_ROOT, 'new-site', 'build.js'),
];

// Recursively scan news/ directory
function findHtmlIn(dir) {
  if (!fs.existsSync(dir)) return [];
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...findHtmlIn(full));
    } else if (entry.isFile()) {
      out.push(full);
    }
  }
  return out;
}
SOURCE_PATHS.push(...findHtmlIn(path.join(PROJECT_ROOT, 'news')));

// --- Extract URLs ---
// Wix CDN format: https://static.wixstatic.com/media/{id}~mv2.{ext}/v1/{transform}/{filename}
// We strip everything from /v1/ onwards to get the raw original.
const URL_RE = /https?:\/\/static\.wixstatic\.com\/media\/[a-zA-Z0-9_~.\-]+\.(?:jpg|jpeg|png|webp|gif|svg)/gi;

function extractUrls(text) {
  const matches = text.match(URL_RE) || [];
  return matches.map((u) => {
    // Some URLs already point to the original (no /v1/...). Keep as-is.
    // Others have /v1/fill/... — we already stripped that with the regex above
    // because the regex stops at the first .ext, which is the original asset extension.
    return u;
  });
}

const allUrls = new Set();
let scannedFiles = 0;
let scannedBytes = 0;
for (const p of SOURCE_PATHS) {
  if (!fs.existsSync(p)) continue;
  const stat = fs.statSync(p);
  if (stat.isDirectory()) continue;
  const text = fs.readFileSync(p, 'utf-8');
  scannedFiles++;
  scannedBytes += stat.size;
  for (const url of extractUrls(text)) {
    allUrls.add(url);
  }
}

console.log(`Scanned ${scannedFiles} files (${(scannedBytes / 1024).toFixed(0)} KB)`);
console.log(`Found ${allUrls.size} unique original Wix images\n`);

if (allUrls.size === 0) {
  console.log('Nothing to download.');
  process.exit(0);
}

// --- Download ---
if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

function filenameFromUrl(url) {
  // Pull the last segment, e.g. "b86cca_fad6ad...~mv2.png"
  const last = url.split('/').pop();
  // Wix media IDs have a `~mv2` marker. Keep them but make safe.
  return last.replace(/[^a-zA-Z0-9._\-]/g, '_');
}

function download(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https
      .get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (compatible; lbr-scraper/1.0)' } }, (res) => {
        if (res.statusCode === 301 || res.statusCode === 302) {
          file.close();
          fs.unlinkSync(dest);
          return download(res.headers.location, dest).then(resolve, reject);
        }
        if (res.statusCode !== 200) {
          file.close();
          fs.unlinkSync(dest);
          return reject(new Error(`HTTP ${res.statusCode} for ${url}`));
        }
        res.pipe(file);
        file.on('finish', () => file.close(() => resolve(fs.statSync(dest).size)));
      })
      .on('error', (err) => {
        file.close();
        try { fs.unlinkSync(dest); } catch (_) {}
        reject(err);
      });
  });
}

async function run() {
  const urls = Array.from(allUrls);
  let ok = 0;
  let fail = 0;
  let skip = 0;
  let totalBytes = 0;

  // Run downloads in batches of 8 to be polite
  const BATCH = 8;
  for (let i = 0; i < urls.length; i += BATCH) {
    const batch = urls.slice(i, i + BATCH);
    await Promise.all(
      batch.map(async (url) => {
        const name = filenameFromUrl(url);
        const dest = path.join(OUT_DIR, name);
        if (fs.existsSync(dest) && fs.statSync(dest).size > 0) {
          skip++;
          return;
        }
        try {
          const size = await download(url, dest);
          totalBytes += size;
          ok++;
          process.stdout.write(`  ✓ ${name} (${(size / 1024).toFixed(0)} KB)\n`);
        } catch (e) {
          fail++;
          process.stdout.write(`  ✗ ${name}: ${e.message}\n`);
        }
      }),
    );
  }

  console.log(`\nDone. ${ok} downloaded, ${skip} skipped (already existed), ${fail} failed.`);
  console.log(`Total: ${(totalBytes / 1024 / 1024).toFixed(1)} MB in ${OUT_DIR}`);
}

run();

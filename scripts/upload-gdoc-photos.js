#!/usr/bin/env node

/* ============================================
   Bulk-upload gdoc-photos/ to Sanity assets.
   They'll appear in the Media library tab automatically.
   ============================================ */

const fs = require('fs');
const path = require('path');
const {createClient} = require('@sanity/client');

const PROJECT_ID = process.env.SANITY_PROJECT_ID;
const DATASET = process.env.SANITY_DATASET || 'production';
const TOKEN = process.env.SANITY_WRITE_TOKEN;
const SOURCE_DIR = path.resolve(__dirname, '..', '..', 'gdoc-photos');

if (!PROJECT_ID || !TOKEN) {
  console.error('Missing SANITY_PROJECT_ID or SANITY_WRITE_TOKEN');
  process.exit(1);
}

if (!fs.existsSync(SOURCE_DIR)) {
  console.error(`Source folder not found: ${SOURCE_DIR}`);
  process.exit(1);
}

const client = createClient({
  projectId: PROJECT_ID,
  dataset: DATASET,
  token: TOKEN,
  apiVersion: '2024-01-01',
  useCdn: false,
});

const MIME = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
};

async function uploadOne(file) {
  const ext = path.extname(file).toLowerCase();
  const mime = MIME[ext];
  if (!mime) return {file, skipped: 'unknown extension'};
  const stream = fs.createReadStream(path.join(SOURCE_DIR, file));
  const asset = await client.assets.upload('image', stream, {
    filename: file,
    contentType: mime,
  });
  return {file, id: asset._id, url: asset.url};
}

async function run() {
  const files = fs
    .readdirSync(SOURCE_DIR)
    .filter((f) => !f.startsWith('.'))
    .sort();
  console.log(`Uploading ${files.length} images from ${SOURCE_DIR} to Sanity (${PROJECT_ID}/${DATASET})\n`);

  let ok = 0;
  let fail = 0;
  // Run 4 at a time to be polite
  const BATCH = 4;
  for (let i = 0; i < files.length; i += BATCH) {
    const batch = files.slice(i, i + BATCH);
    const results = await Promise.allSettled(batch.map(uploadOne));
    for (const r of results) {
      if (r.status === 'fulfilled' && r.value.id) {
        ok++;
        console.log(`  ✓ ${r.value.file}  →  ${r.value.id}`);
      } else if (r.status === 'fulfilled' && r.value.skipped) {
        console.log(`  - ${r.value.file}  (${r.value.skipped})`);
      } else {
        fail++;
        console.log(`  ✗ ${r.reason && r.reason.message}`);
      }
    }
  }

  console.log(`\nDone. ${ok} uploaded, ${fail} failed.`);
  console.log('Open the Studio → Media tab to see them.');
}

run().catch((e) => {
  console.error('Upload failed:', e.message);
  process.exit(1);
});

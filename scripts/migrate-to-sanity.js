#!/usr/bin/env node

/* ============================================
   LET'S BE READY — One-time content migration
   Pushes the current static content into Sanity.

   What it does:
   - Reads the fallback content from build.js (or live Google Sheets if creds set)
   - Maps each section into the corresponding Sanity document type
   - Pushes everything via @sanity/client createOrReplace
   - DOES NOT upload images — those are uploaded by hand in the Studio
     (current image URLs from Wix are kept in alt fields temporarily so
     editors can re-upload one at a time)

   Required env vars:
     SANITY_PROJECT_ID   — your Sanity project ID
     SANITY_DATASET      — usually "production"
     SANITY_WRITE_TOKEN  — a write token from sanity.io/manage

   Run:
     SANITY_PROJECT_ID=xxx SANITY_DATASET=production SANITY_WRITE_TOKEN=sk... \
       node scripts/migrate-to-sanity.js
   ============================================ */

const path = require('path');
const { getFallbackData } = require(path.join(__dirname, '..', 'build.js'));

const PROJECT_ID = process.env.SANITY_PROJECT_ID;
const DATASET = process.env.SANITY_DATASET || 'production';
const TOKEN = process.env.SANITY_WRITE_TOKEN;

if (!PROJECT_ID || !TOKEN) {
  console.error('Missing required env vars: SANITY_PROJECT_ID, SANITY_WRITE_TOKEN');
  process.exit(1);
}

let createClient;
try {
  ({ createClient } = require('@sanity/client'));
} catch (e) {
  console.error('Missing dependency: @sanity/client');
  console.error('Install it from this directory:');
  console.error('  npm install @sanity/client');
  process.exit(1);
}

const client = createClient({
  projectId: PROJECT_ID,
  dataset: DATASET,
  token: TOKEN,
  apiVersion: '2024-01-01',
  useCdn: false,
});

// ----------------------------------------------
// Field whitelists per page document
// ----------------------------------------------

const SITE_SETTINGS_FIELDS = [
  'site_name',
  'footer_description',
  'org_address',
  'contact_email',
  'social_facebook',
  'social_instagram',
  'social_youtube',
  'globalgiving_url',
  'trust_pill_1',
  'trust_pill_2',
  'trust_pill_3',
];

const HOMEPAGE_FIELDS = [
  // hero
  'hero_headline', 'hero_sub', 'hero_cta_text', 'hero_image_alt',
  // disparity
  'disparity_eyebrow', 'disparity_headline',
  'disparity_stat1_value', 'disparity_stat1_text',
  'disparity_stat2_value', 'disparity_stat2_text',
  'disparity_stat3_value', 'disparity_stat3_text',
  // turn
  'turn_word', 'turn_question',
  // model
  'model_step1_image_alt', 'model_step1_title', 'model_step1_text',
  'model_step2_image_alt', 'model_step2_title', 'model_step2_text',
  'model_step3_image_alt', 'model_step3_title', 'model_step3_text',
  // proof
  'proof_eyebrow', 'proof_heading',
  'stat_pass_rate', 'stat_pass_rate_label', 'stat_pass_rate_context',
  'stat_children', 'stat_children_label', 'stat_children_context',
  'stat_graduation_value', 'stat_graduation_label', 'stat_graduation_context',
  'stat_years_value', 'stat_years_label', 'stat_years_context',
  // map
  'map_eyebrow', 'map_heading', 'map_description',
  // cost
  'cost_eyebrow', 'cost_per_classroom', 'cost_per_child', 'cost_classroom_desc',
  'cost_context', 'cost_cta_text',
  // allocation
  'allocation_heading', 'allocation_subheading',
  'allocation_item1_title', 'allocation_item1_desc',
  'allocation_item2_title', 'allocation_item2_desc',
  'allocation_item3_title', 'allocation_item3_desc',
  'allocation_item4_title', 'allocation_item4_desc',
  // transparency
  'transparency_image_alt', 'transparency_eyebrow', 'transparency_heading', 'transparency_text',
  'finance_year', 'finance_total_donated', 'finance_total_spent', 'finance_note',
  // team
  'team_eyebrow', 'team_heading', 'team_footer_text',
  // quote
  'founder_quote', 'founder_quote_cite',
  // final cta
  'final_cta_heading', 'final_cta_text', 'final_cta_button',
];

const NUTRITION_FIELDS = [
  'nutrition_hero_image_alt', 'nutrition_headline', 'nutrition_subheadline',
  'nutrition_stat1_value', 'nutrition_stat1_context',
  'nutrition_stat2_value', 'nutrition_stat2_context',
  'nutrition_turn_image_alt', 'nutrition_turn_heading', 'nutrition_turn_text',
  'nutrition_feed_stat1_value', 'nutrition_feed_stat1_label',
  'nutrition_feed_stat2_value', 'nutrition_feed_stat2_label',
  'nutrition_feed_stat3_value', 'nutrition_feed_stat3_label',
  'nutrition_quote', 'nutrition_quote_cite',
  'nutrition_cta_heading', 'nutrition_cta_button',
];

const CURRICULUM_FIELDS = [
  'curriculum_hero_image_alt', 'curriculum_headline', 'curriculum_subheadline',
  'curriculum_intro_lead', 'curriculum_intro_sub',
  'curriculum_pillar1_title', 'curriculum_pillar1_desc',
  'curriculum_pillar2_title', 'curriculum_pillar2_desc',
  'curriculum_pillar3_title', 'curriculum_pillar3_desc',
  'curriculum_pillar4_title', 'curriculum_pillar4_desc',
  'curriculum_garden_eyebrow', 'curriculum_garden_heading', 'curriculum_garden_text',
  'curriculum_garden_image_alt',
  'curriculum_garden_point1', 'curriculum_garden_point2', 'curriculum_garden_point3',
  'curriculum_nuted_eyebrow', 'curriculum_nuted_heading', 'curriculum_nuted_text',
  'curriculum_nuted_image_alt',
  'curriculum_nuted_point1', 'curriculum_nuted_point2', 'curriculum_nuted_point3',
  'curriculum_supplement_badge', 'curriculum_supplement_heading',
  'curriculum_supplement_text', 'curriculum_supplement_note',
  'curriculum_supplement_stat1_value', 'curriculum_supplement_stat1_label',
  'curriculum_supplement_stat2_value', 'curriculum_supplement_stat2_label',
  'curriculum_supplement_stat3_value', 'curriculum_supplement_stat3_label',
  'curriculum_cta_heading', 'curriculum_cta_text', 'curriculum_cta_button',
];

const DONATE_FIELDS = [
  'donate_headline', 'donate_sub', 'donate_image_alt',
  'donate_quote', 'donate_quote_cite',
  'donate_stat1_value', 'donate_stat1_label',
  'donate_stat2_value', 'donate_stat2_label',
  'donate_stat3_value', 'donate_stat3_label',
  'givelively_widget',
  'lifetime_eyebrow', 'lifetime_heading',
  'lifetime_stat1_value', 'lifetime_stat1_label',
  'lifetime_stat2_value', 'lifetime_stat2_label',
  'lifetime_stat3_value', 'lifetime_stat3_label',
  'sponsor_badge', 'sponsor_heading', 'sponsor_price', 'sponsor_description', 'sponsor_button_text',
  'donate_transparency_heading',
  'donate_bar1_label', 'donate_bar1_amount',
  'donate_bar2_label', 'donate_bar2_amount',
  'donate_bar3_label', 'donate_bar3_amount',
  'donate_bar4_label', 'donate_bar4_amount',
  'donate_bar5_label', 'donate_bar5_amount',
  'mail_heading', 'mail_address', 'other_platforms_heading', 'other_platforms_note',
  'contact_eyebrow', 'contact_heading', 'fee_note',
];

const PARTNERS_FIELDS = [
  'partners_eyebrow', 'partners_heading', 'partners_intro',
  'partner_cta_heading', 'partner_cta_text', 'partner_cta_button',
];

const STAFF_PAGE_FIELDS = [
  'staff_link_text', 'staff_eyebrow', 'staff_heading', 'staff_intro',
];

function pick(content, keys) {
  const out = {};
  for (const k of keys) {
    if (content[k] !== undefined) out[k] = content[k];
  }
  return out;
}

async function migrate() {
  const data = getFallbackData();
  const c = data.content;

  console.log(`Migrating to Sanity project: ${PROJECT_ID} (${DATASET})\n`);

  const docs = [];

  // ===== SINGLETONS (use fixed _id so they're true singletons) =====
  docs.push({ _id: 'siteSettings', _type: 'siteSettings', ...pick(c, SITE_SETTINGS_FIELDS) });
  docs.push({ _id: 'homepage', _type: 'homepage', ...pick(c, HOMEPAGE_FIELDS) });
  docs.push({ _id: 'nutritionPage', _type: 'nutritionPage', ...pick(c, NUTRITION_FIELDS) });
  docs.push({ _id: 'curriculumPage', _type: 'curriculumPage', ...pick(c, CURRICULUM_FIELDS) });
  docs.push({ _id: 'donatePage', _type: 'donatePage', ...pick(c, DONATE_FIELDS) });
  docs.push({ _id: 'partnersPage', _type: 'partnersPage', ...pick(c, PARTNERS_FIELDS) });
  docs.push({
    _id: 'staffPage',
    _type: 'staffPage',
    enabled: false, // OFF by default — toggle in Studio when content is ready
    ...pick(c, STAFF_PAGE_FIELDS),
  });

  // ===== TEAM MEMBERS =====
  (data.team_members || []).forEach((t, i) => {
    docs.push({
      _id: `teamMember-${i + 1}`,
      _type: 'teamMember',
      name: t.name || '',
      role: t.role || '',
      bio: t.bio || '',
      active: t.active !== false,
      order: i,
    });
  });

  // ===== STAFF MEMBERS (placeholders) =====
  (data.staff_members || []).forEach((s, i) => {
    docs.push({
      _id: `staffMember-${i + 1}`,
      _type: 'staffMember',
      name: s.name || '',
      role: s.role || '',
      region: s.region || '',
      bio: s.bio || '',
      active: true,
      order: i,
    });
  });

  // ===== PARTNERS =====
  (data.partners || []).forEach((p, i) => {
    docs.push({
      _id: `partner-${i + 1}`,
      _type: 'partner',
      name: p.name || '',
      description: p.description || '',
      order: i,
    });
  });

  // ===== EXPENSE ITEMS =====
  (data.expense_allocation || []).forEach((e, i) => {
    docs.push({
      _id: `expenseItem-${i + 1}`,
      _type: 'expenseItem',
      label: e.label || '',
      percent: typeof e.percent === 'number' ? e.percent : parseFloat(e.percent) || 0,
      color: e.color || '#cccccc',
      order: i,
    });
  });

  // ===== CLASSROOMS =====
  // Read from classrooms.json (the canonical source) since fallback doesn't carry them.
  try {
    const fs = require('fs');
    const classroomsPath = path.join(__dirname, '..', 'classrooms.json');
    if (fs.existsSync(classroomsPath)) {
      const json = JSON.parse(fs.readFileSync(classroomsPath, 'utf-8'));
      const list = json.classrooms || [];
      list.forEach((cr, i) => {
        docs.push({
          _id: `classroom-${cr.id || i + 1}`,
          _type: 'classroom',
          classroomId: cr.id || i + 1,
          community: cr.community || '',
          department: cr.department || '',
          teacher: cr.teacher || '',
          students: cr.students || 0,
          lat: cr.lat || 0,
          lng: cr.lng || 0,
          year: cr.year || 2024,
        });
      });
      console.log(`Including ${list.length} classrooms from classrooms.json`);
    }
  } catch (e) {
    console.warn('Could not read classrooms.json:', e.message);
  }

  console.log(`Pushing ${docs.length} documents to Sanity...\n`);

  // Push in batches via transactions for atomicity.
  const BATCH = 25;
  for (let i = 0; i < docs.length; i += BATCH) {
    const batch = docs.slice(i, i + BATCH);
    const tx = client.transaction();
    for (const doc of batch) {
      tx.createOrReplace(doc);
    }
    await tx.commit();
    console.log(`  ✓ Batch ${Math.floor(i / BATCH) + 1}: ${batch.length} docs`);
  }

  console.log('\nMigration complete!');
  console.log('Next: open the Studio, review every document, and upload images.');
}

migrate().catch((err) => {
  console.error('\nMigration failed:', err.message || err);
  if (err.response && err.response.body) {
    console.error('Response:', JSON.stringify(err.response.body, null, 2));
  }
  process.exit(1);
});

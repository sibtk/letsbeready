#!/usr/bin/env node

/* ============================================
   LET'S BE READY — Build Script
   Reads Google Sheets → Generates static HTML
   ============================================ */

const fs = require('fs');
const path = require('path');
const { GoogleSpreadsheet } = require('google-spreadsheet');
const { JWT } = require('google-auth-library');

// --- Config ---
const SHEET_ID = process.env.GOOGLE_SHEET_ID;
const SERVICE_ACCOUNT_KEY = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;

const TEMPLATES_DIR = path.join(__dirname, 'templates');
const DIST_DIR = path.join(__dirname, 'dist');
const STATIC_FILES = ['styles.css', 'main.js', 'donate.js', 'map.js'];
const STATIC_DIRS = ['assets'];

// --- Fallback data (used when Sheets is unavailable, e.g. local dev) ---
function getFallbackData() {
  return {
    content: {
      // Site-wide
      site_name: "Let's Be Ready",
      logo_url: 'https://static.wixstatic.com/media/b86cca_fad6ad16645e42dca07079533d335af6~mv2.png/v1/fill/w_80,h_80,al_c,q_85/cropped-cropped-logo-1-e1497444809475.png',
      footer_description: 'Empowerment and transformation through education. A 501(c)(3) nonprofit transforming preschool education in rural Guatemala since 2008.',
      org_address: '1014 Pauline Avenue<br>Bellaire, Texas 77401',
      copyright_year: new Date().getFullYear().toString(),

      // Hero
      hero_headline: 'Transforming Preschool<br>\n        Education in Guatemala',
      hero_sub: 'In rural Guatemala, preschools are rare.<br>\n        We\'re changing that &mdash; one village at a time.',
      hero_cta_text: 'Donate Now',
      hero_image_url: 'https://static.wixstatic.com/media/b86cca_0e2ea1940ac44331a21dd51fd50d9a5a~mv2.jpg/v1/fill/w_1920,h_1280,al_c,q_85/Teacher%20and%20students.JPG',
      hero_image_alt: 'A teacher with young students in a rural Guatemalan classroom',

      // Disparity
      disparity_eyebrow: 'The Reality',
      disparity_headline: 'In Guatemala, a child born in a rural Mayan village has a <em>1 in 5</em> chance of finishing primary school.',
      disparity_stat1_value: '80%',
      disparity_stat1_text: 'of rural children drop out before finishing primary school',
      disparity_stat2_value: 'Zero',
      disparity_stat2_text: 'preschool options in most rural villages',
      disparity_stat3_value: 'Invisible',
      disparity_stat3_text: 'Communities so remote they\'re invisible to the education system',

      // Turn
      turn_word: 'But.',
      turn_question: 'What if the solution was already<br>\n          inside the community?',

      // Model steps
      model_step1_image_url: 'https://static.wixstatic.com/media/b86cca_527419ab121c4c938652b89e1b7eedea~mv2.jpg/v1/fill/w_800,h_600,al_c,q_80/IMG_20240801_155859.jpg',
      model_step1_image_alt: 'A young facilitator being trained to teach preschool',
      model_step1_title: 'A young woman from the village steps forward.',
      model_step1_text: 'She cares deeply about her community. We train her with a culturally adapted curriculum &mdash; three manuals built specifically for Mayan communities.',
      model_step2_image_url: 'https://static.wixstatic.com/media/b86cca_e222394152f44f719607544671f2bca9~mv2.jpg/v1/fill/w_800,h_600,al_c,q_80/Our-approach-in-guatermala-2024.jpg',
      model_step2_image_alt: 'Children learning in a community classroom in rural Guatemala',
      model_step2_title: 'She opens a classroom in her home.',
      model_step2_text: '12 to 15 children, ages 4 to 6, learn in small groups for 2&ndash;3 hours a day. No building needed. No bureaucracy. Just a room, a teacher, and a curriculum that works.',
      model_step3_image_url: 'https://static.wixstatic.com/media/b86cca_62cd990a9ac24c0e9f57b707a375c718~mv2.jpg/v1/fill/w_800,h_600,al_c,q_80/20240313_142741-1-2-scaled.jpg',
      model_step3_image_alt: 'Happy children in a Let\'s Be Ready preschool classroom',
      model_step3_title: 'Children discover what\'s possible.',
      model_step3_text: 'Education. Daily nutrition. Gardening. Art. Social-emotional skills. Two years in our program, and these children are ready for first grade &mdash; and for a different kind of life.',

      // Proof stats
      proof_eyebrow: 'Proof, Not Promises',
      proof_heading: 'This works. Here are the numbers.',
      stat_pass_rate: '95',
      stat_pass_rate_label: 'pass first grade',
      stat_pass_rate_context: 'The national rural average is under 20%. Our kids pass at <strong>95%</strong>.',
      stat_children: '600',
      stat_children_label: 'children learning right now',
      stat_children_context: 'Across 45 classrooms in 5 departments of Guatemala, as of 2025.',
      stat_graduation_value: '8 out of 10',
      stat_graduation_label: 'finish primary school',
      stat_graduation_context: 'Most rural children drop out in year one. Our graduates keep going.',
      stat_years_value: '17 yrs',
      stat_years_label: 'proven track record',
      stat_years_context: 'Founded in 2008. Not a pilot. Not an experiment. A proven, replicable model.',

      // Map
      map_eyebrow: 'See the Impact',
      map_heading: '45 classrooms.<br>5 departments.<br>One map.',
      map_description: 'Every pin is a real classroom, run by a real teacher, in a real community. Click to meet them.',

      // Cost
      cost_eyebrow: 'The Cost of Change',
      cost_per_child: '$300',
      cost_per_classroom: '$3,800',
      cost_classroom_desc: 'An entire classroom of 12&ndash;15 children for a full year.',
      cost_context: 'That\'s less than a dollar a day. The model is so efficient because teachers are from the community, classrooms are in homes, and the curriculum was built specifically for this context.',
      cost_cta_text: 'Learn How to Help',

      // Allocation (Where Your Money Goes)
      allocation_heading: 'Where Your Money Goes',
      allocation_subheading: '100% goes to programs',
      allocation_item1_title: 'Teacher Stipends',
      allocation_item1_desc: 'Monthly pay for 45 community facilitators, deposited directly into their personal bank accounts.',
      allocation_item2_title: 'Curriculum &amp; Materials',
      allocation_item2_desc: 'Three custom teaching manuals, educational supplies, and training sessions three times per year.',
      allocation_item3_title: 'Child Nutrition',
      allocation_item3_desc: 'Daily nutritional snacks for every student. You can\'t learn when you\'re hungry.',
      allocation_item4_title: 'Extension Programs',
      allocation_item4_desc: 'Gardening, art, environmental awareness, and social-emotional learning that builds the whole child.',

      // Transparency
      transparency_image_url: 'assets/transparency.jpg',
      transparency_image_alt: 'Teacher training session with Let\'s Be Ready facilitators',
      transparency_eyebrow: 'Full Transparency',
      transparency_heading: 'We believe you deserve to<br>know everything',
      transparency_text: 'Our 501(c)(3) corporate account at Charles Schwab is managed by a certified accountant. Funds transfer monthly to Guatemala, requiring dual signatures. Directors and our Guatemalan accountant review every expense monthly. Teachers receive stipends directly in their bank accounts.',
      finance_year: '2025',
      finance_total_donated: '$279,000',
      finance_total_spent: '$249,000',
      finance_note: 'Substantial additional in-kind packed nutrition is supplied annually by a generous donor.',

      // Team
      team_eyebrow: 'The People Behind This',
      team_heading: 'Run by Guatemalan women. Supported by people like <em>you</em>.',
      team_footer_text: 'Our board includes educators, nonprofit leaders, and professionals who volunteer their time. Every dollar raised goes to Guatemala.',

      // Quote
      founder_quote: '&ldquo;Dedicated men and women believe that <em>all</em> children in their communities deserve access to early education. They opened preschools in their homes, and they changed everything.&rdquo;',
      founder_quote_cite: '&mdash; Let\'s Be Ready, 2026',

      // Final CTA
      final_cta_heading: 'Thousands of children<br>\n          are still waiting.',
      final_cta_text: 'We have 45 classrooms. Thousands more are needed. The model works. The teachers are ready. The only thing missing is funding.',
      final_cta_button: 'Donate Now',

      // Donate page
      donate_headline: 'She\'s never held<br>a <em>pencil.</em>',
      donate_sub: 'In rural Guatemala, 4 out of 5 children never attend preschool. Not because they can\'t learn &mdash; because there isn\'t one. <strong>Your donation changes that.</strong>',
      donate_image_url: 'https://static.wixstatic.com/media/b86cca_b489ead10c7b4188988ce83da95fd643~mv2.jpg/v1/fill/w_600,h_450,al_c,q_80/WhatsApp-Image-2024-05-09-at-11.59.33-AM.jpg',
      donate_image_alt: 'Children in a classroom in rural Guatemala',
      donate_quote: '&ldquo;Before Aula Magica, my daughter had never held a crayon. Now she reads to her little brother every night.&rdquo;',
      donate_quote_cite: '&mdash; Mother in Patzit&eacute;, Guatemala',
      donate_stat1_value: '600+',
      donate_stat1_label: 'Children educated',
      donate_stat2_value: '95%',
      donate_stat2_label: 'Pass first grade',
      donate_stat3_value: '100%',
      donate_stat3_label: 'Funds programs',
      golively_embed_url: '',
      golively_placeholder_title: 'GoLively donation form will appear here',
      golively_placeholder_desc: 'Once approved, paste your GoLively embed code here or update the campaign URL in donate.js',
      sponsor_badge: 'Yearly',
      sponsor_heading: 'Sponsor an Entire Classroom',
      sponsor_price: '$3,800',
      sponsor_description: 'Fund a teacher, materials, meals, and education for 12&ndash;15 children for a full year.',
      sponsor_button_text: 'Sponsor a Classroom',
      donate_transparency_heading: 'Where your donation goes',
      donate_bar1_label: 'Teacher compensation',
      donate_bar1_amount: '62%',
      donate_bar2_label: 'Truck &amp; maintenance',
      donate_bar2_amount: '10%',
      donate_bar3_label: 'Training &amp; development',
      donate_bar3_amount: '9%',
      donate_bar4_label: 'Administrator compensation',
      donate_bar4_amount: '6%',
      donate_bar5_label: 'Nutrition, water &amp; upgrades',
      donate_bar5_amount: '6%',
      mail_heading: 'Mail a check',
      mail_address: 'Let\'s Be Ready #3259-6581<br>Charles Schwab &amp; Co Inc<br>PO Box 982600, El Paso, TX 79998',
      other_platforms_heading: 'Other platforms',
      other_platforms_note: 'Higher fees apply:',
      contact_eyebrow: 'Questions?',
      contact_heading: 'Get in touch',
      fee_note: 'Most donors choose to cover the processing fee, so <strong>100% reaches children</strong>.',

      // Campaign tracker
      campaign_raised: '47,250',
      campaign_goal: '75,000',
      campaign_donors: '142',

      // Thank you page
      thankyou_timeline_heading: 'What happens next',
      thankyou_share_heading: 'Spread the word',
      thankyou_step1_title: 'Funds transfer',
      thankyou_step1_text: 'Your donation moves securely to our Guatemala operations account.',
      thankyou_step2_title: 'Teacher receives support',
      thankyou_step2_text: 'Stipends, materials, and training reach community facilitators.',
      thankyou_step3_title: 'A child begins learning',
      thankyou_step3_text: 'Education, nutrition, and a brighter future start in a village classroom.',
      thankyou_trust_text: 'Your receipt has been sent. Tax-deductible under 501(c)(3). EIN available upon request.',
      thankyou_cta_note: 'Even $25/month provides daily nutrition for a child.',

      // Partners page
      partners_eyebrow: 'Together We Go Further',
      partners_heading: 'Our Partners &amp; Supporters',
      partners_intro: 'We\'re grateful for the organizations and individuals who make our mission possible. Every partnership strengthens our ability to bring preschool education to rural Guatemala.',
      partner_cta_heading: 'Become a Partner',
      partner_cta_text: 'Interested in supporting preschool education in rural Guatemala? We\'d love to hear from you. Whether you\'re a foundation, corporation, church, or individual &mdash; there\'s a way to get involved.',
      partner_cta_button: 'Get in Touch',

      // Nutrition page
      nutrition_hero_image: 'assets/nutrition-hero.jpg',
      nutrition_hero_image_alt: 'A young girl in rural Guatemala holding food',
      nutrition_turn_image: 'assets/nutrition-supplies.jpg',
      nutrition_turn_image_alt: 'Community members with bags of food supplies for classrooms',
      nutrition_headline: 'You can\'t learn<br>when you\'re hungry.',
      nutrition_subheadline: 'In rural Guatemala, nearly half of indigenous children suffer from chronic malnutrition. We make sure every child eats before they learn.',
      nutrition_stat1_value: '47%',
      nutrition_stat1_context: 'of indigenous children under 5 in Guatemala suffer from chronic malnutrition',
      nutrition_stat2_value: '58%',
      nutrition_stat2_context: 'of rural Mayan children are stunted before they ever reach a classroom',
      nutrition_turn_heading: 'So we <em>feed<br>them first.</em>',
      nutrition_turn_text: 'Every child in every classroom receives a daily nutritious meal before learning begins. Locally sourced, teacher-led, consistent. No child in our program goes hungry.',
      nutrition_feed_stat1_value: '600+',
      nutrition_feed_stat1_label: 'children fed daily',
      nutrition_feed_stat2_value: '45',
      nutrition_feed_stat2_label: 'classrooms served',
      nutrition_feed_stat3_value: '5',
      nutrition_feed_stat3_label: 'departments',
      nutrition_cta_heading: 'A full stomach<br>changes everything.',
      nutrition_cta_button: 'Donate Now',
      nutrition_intro: 'Chronic malnutrition is one of the biggest barriers to education in rural Guatemala. Our nutrition program ensures every child in every classroom eats before they learn.',
      nutrition_problem_heading: 'Guatemala has the highest rate of<br>child malnutrition in Latin America',
      nutrition_approach_heading: 'Nutrition is built into every classroom',
      nutrition_quote: '&ldquo;When the children eat first, everything changes. They pay attention. They participate. They smile.&rdquo;',
      nutrition_quote_cite: '&mdash; Community facilitator, Chimaltenango',
    },
    team_members: [
      {
        name: 'Garrett Reed',
        role: 'Executive Director',
        bio: '30+ years as a teacher and trainer, working with immigrant and refugee students from Latin America.',
        photo_url: 'https://static.wixstatic.com/media/b86cca_b2b0b92f951a49b58fd9b13fa5451327~mv2.png/v1/fill/w_200,h_200,al_c,q_85/Screen%20Shot%202025-03-21%20at%2012_08_07%20PM.png',
        active: true,
      },
      {
        name: 'Sara Tun',
        role: 'Program Administrator, Chimaltenango & Sacatep\u00e9quez',
        bio: 'With sixteen years experience, Sarita administers 26 classrooms in two departments.',
        photo_url: 'https://static.wixstatic.com/media/b86cca_5318727af2474f878016b2f3f25aa61f~mv2.jpg/v1/fill/w_200,h_200,al_c,q_80/3dd7b745-361b-4106-a3aa-0d12407f3a7c_JPG.jpg',
        active: true,
      },
      {
        name: 'Lucila Diaz',
        role: 'Administrator, Huehuetenango, Solol\u00e1 & Quich\u00e9',
        bio: 'Lucy has been with Let\u2019s Be Ready for 15 years. As a curriculum specialist, Lucy oversees yearly updates to our curriculum and travels extensively to meet with and support teachers.',
        photo_url: 'https://static.wixstatic.com/media/b86cca_527419ab121c4c938652b89e1b7eedea~mv2.jpg/v1/fill/w_200,h_200,al_c,q_80/IMG_20240801_155859.jpg',
        active: true,
      },
      {
        name: 'Fred Zambroski',
        role: 'Founder',
        bio: '&ldquo;This project was started by a Guatemalan woman and is currently run by Guatemalan women.&rdquo;',
        photo_url: 'https://static.wixstatic.com/media/b86cca_d6bf45f20b3949b38c1015d5323e8134~mv2.jpg/v1/fill/w_200,h_200,al_c,q_80/IMG_0708-1536x1283-1.jpg',
        active: true,
      },
    ],
    donation_amounts: [
      { amount: '25', impact_text: 'Snacks, 1 child/mo', featured: false },
      { amount: '50', impact_text: 'Classroom supplies', featured: false },
      { amount: '100', impact_text: '3 kids for a month', featured: true },
      { amount: '300', impact_text: '1 child, full year', featured: false },
    ],
    recent_donations: [
      { name: 'Maria J.', initials: 'MJ', amount: '300', time_ago: '2 hrs ago', anonymous: false },
      { name: 'Anonymous Donor', initials: '', amount: '150', time_ago: '4 hrs ago', anonymous: true },
      { name: 'Thomas S.', initials: 'TS', amount: '100', time_ago: '5 hrs ago', anonymous: false },
      { name: 'Rachel B.', initials: 'RB', amount: '500', time_ago: '1 day ago', anonymous: false },
    ],
    partners: [
      { name: 'GlobalGiving', description: 'International crowdfunding platform connecting nonprofits with donors worldwide.', logo_url: '' },
      { name: 'DonorSee', description: 'Transparent giving platform that lets donors see their impact in real time.', logo_url: '' },
      { name: 'Rotary Club of Bellaire', description: 'Local service organization supporting community education initiatives.', logo_url: '' },
      { name: 'Guatemala Ministry of Education', description: 'Government partnership for curriculum alignment and teacher certification.', logo_url: '' },
      { name: 'Community Leaders Network', description: 'Network of village leaders who identify and support local facilitators.', logo_url: '' },
      { name: 'Charles Schwab Foundation', description: 'Financial services partner providing secure fund management and transfers.', logo_url: '' },
    ],
    expense_allocation: [
      { label: 'Teacher compensation', percent: 62, color: '#146BF6' },
      { label: 'Truck & maintenance', percent: 10, color: '#8b5cf6' },
      { label: 'Training & development', percent: 9, color: '#FFE500' },
      { label: 'Administrator compensation', percent: 6, color: '#16a34a' },
      { label: 'Other operating', percent: 5, color: '#F59E0B' },
      { label: 'Classroom upgrades', percent: 3, color: '#EC4899' },
      { label: 'Nutrition & water', percent: 3, color: '#06B6D4' },
      { label: 'Administration expenses', percent: 2, color: '#64748b' },
    ],
    classrooms: null, // Will be loaded from classrooms.json or Classrooms tab
  };
}


// --- Google Sheets data fetching ---
async function fetchSheetData() {
  if (!SHEET_ID || !SERVICE_ACCOUNT_KEY) {
    console.log('No Google Sheets credentials found. Using fallback data.');
    return getFallbackData();
  }

  let creds;
  try {
    creds = JSON.parse(SERVICE_ACCOUNT_KEY);
  } catch (e) {
    console.error('Failed to parse GOOGLE_SERVICE_ACCOUNT_KEY:', e.message);
    return getFallbackData();
  }

  const auth = new JWT({
    email: creds.client_email,
    key: creds.private_key,
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
  });

  const doc = new GoogleSpreadsheet(SHEET_ID, auth);
  await doc.loadInfo();

  const data = {
    content: {},
    team_members: [],
    donation_amounts: [],
    recent_donations: [],
    partners: [],
    expense_allocation: [],
    classrooms: null,
  };

  // --- Site Content tab (key-value pairs) ---
  const contentSheet = doc.sheetsByTitle['Site Content'];
  if (contentSheet) {
    const rows = await contentSheet.getRows();
    for (const row of rows) {
      const key = row.get('key');
      const value = row.get('value');
      if (key && value !== undefined) {
        data.content[key] = value;
      }
    }
  }

  // --- Team Members tab ---
  const teamSheet = doc.sheetsByTitle['Team Members'];
  if (teamSheet) {
    const rows = await teamSheet.getRows();
    for (const row of rows) {
      if (row.get('active') === 'TRUE' || row.get('active') === 'true' || row.get('active') === true) {
        data.team_members.push({
          name: row.get('name') || '',
          role: row.get('role') || '',
          bio: row.get('bio') || '',
          photo_url: row.get('photo_url') || '',
        });
      }
    }
  }

  // --- Classrooms tab ---
  const classroomsSheet = doc.sheetsByTitle['Classrooms'];
  if (classroomsSheet) {
    const rows = await classroomsSheet.getRows();
    const classrooms = [];
    for (const row of rows) {
      classrooms.push({
        id: parseInt(row.get('id'), 10) || classrooms.length + 1,
        community: row.get('community') || '',
        department: row.get('department') || '',
        teacher: row.get('teacher') || '',
        students: parseInt(row.get('students'), 10) || 0,
        lat: parseFloat(row.get('lat')) || 0,
        lng: parseFloat(row.get('lng')) || 0,
        year: parseInt(row.get('year'), 10) || 2024,
      });
    }
    if (classrooms.length > 0) {
      data.classrooms = {
        meta: {
          total_classrooms: classrooms.length,
          total_students: classrooms.reduce((sum, c) => sum + c.students, 0),
          total_teachers: classrooms.length,
          departments: new Set(classrooms.map(c => c.department)).size,
          updated: new Date().toISOString().slice(0, 7),
        },
        classrooms,
      };
    }
  }

  // --- Donation Amounts tab ---
  const amountsSheet = doc.sheetsByTitle['Donation Amounts'];
  if (amountsSheet) {
    const rows = await amountsSheet.getRows();
    for (const row of rows) {
      data.donation_amounts.push({
        amount: row.get('amount') || '',
        impact_text: row.get('impact_text') || '',
        featured: row.get('featured') === 'TRUE' || row.get('featured') === 'true',
      });
    }
  }

  // --- Images tab ---
  const imagesSheet = doc.sheetsByTitle['Images'];
  if (imagesSheet) {
    const rows = await imagesSheet.getRows();
    for (const row of rows) {
      const key = row.get('key');
      const url = row.get('url');
      const alt = row.get('alt_text');
      if (key && url) {
        data.content[key] = url;
        if (alt) data.content[key + '_alt'] = alt;
      }
    }
  }

  // --- Partners tab ---
  const partnersSheet = doc.sheetsByTitle['Partners'];
  if (partnersSheet) {
    const rows = await partnersSheet.getRows();
    for (const row of rows) {
      if (row.get('name')) {
        data.partners.push({
          name: row.get('name') || '',
          description: row.get('description') || '',
          logo_url: row.get('logo_url') || '',
        });
      }
    }
  }

  // --- Expense Allocation tab ---
  const expenseSheet = doc.sheetsByTitle['Expense Allocation'];
  if (expenseSheet) {
    const rows = await expenseSheet.getRows();
    for (const row of rows) {
      const percent = parseFloat(row.get('percent'));
      if (row.get('label') && !isNaN(percent)) {
        data.expense_allocation.push({
          label: row.get('label') || '',
          percent,
          color: row.get('color') || '#ccc',
        });
      }
    }
  }

  // --- Recent Donations tab ---
  const donationsSheet = doc.sheetsByTitle['Recent Donations'];
  if (donationsSheet) {
    const rows = await donationsSheet.getRows();
    for (const row of rows) {
      const isAnonymous = row.get('anonymous') === 'TRUE' || row.get('anonymous') === 'true';
      const name = isAnonymous ? 'Anonymous Donor' : (row.get('name') || 'Anonymous Donor');
      data.recent_donations.push({
        name,
        initials: isAnonymous ? '' : name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2),
        amount: row.get('amount') || '0',
        time_ago: row.get('time_ago') || 'recently',
        anonymous: isAnonymous,
      });
    }
  }

  // Apply fallback for missing data
  const fallback = getFallbackData();
  if (Object.keys(data.content).length === 0) data.content = fallback.content;
  if (data.team_members.length === 0) data.team_members = fallback.team_members;
  if (data.donation_amounts.length === 0) data.donation_amounts = fallback.donation_amounts;
  if (data.recent_donations.length === 0) data.recent_donations = fallback.recent_donations;
  if (data.partners.length === 0) data.partners = fallback.partners;
  if (data.expense_allocation.length === 0) data.expense_allocation = fallback.expense_allocation;

  return data;
}


// --- Pie chart generator ---

function generatePieChart(items) {
  const R = 80;
  const C = 2 * Math.PI * R; // ~502.65
  let offset = C / 4; // start at top (90° = quarter circumference)

  const ariaLabel = 'Expense breakdown: ' + items.map(i => `${i.label} ${i.percent}%`).join(', ');

  let circles = '';
  for (const item of items) {
    const dash = (item.percent / 100) * C;
    const gap = C - dash;
    circles += `\n                <circle cx="100" cy="100" r="${R}" fill="none" stroke="${item.color}" stroke-width="36" stroke-dasharray="${dash.toFixed(1)} ${gap.toFixed(1)}" stroke-dashoffset="${offset.toFixed(1)}" />`;
    offset -= dash;
  }

  const svg = `<div class="pie-chart" role="img" aria-label="${ariaLabel}">
              <svg viewBox="0 0 200 200" width="180" height="180">${circles}
                <circle cx="100" cy="100" r="62" fill="var(--white)" />
                <text x="100" y="93" text-anchor="middle" fill="var(--dark)" font-size="14" font-weight="700">$249k</text>
                <text x="100" y="112" text-anchor="middle" fill="var(--text-muted)" font-size="10">spent in 2025</text>
              </svg>
            </div>`;

  const legend = `<div class="pie-chart__legend">
${items.map(i => `              <div class="pie-chart__item"><span class="pie-chart__dot" style="background:${i.color};"></span> ${i.label} <strong>${i.percent}%</strong></div>`).join('\n')}
            </div>`;

  return { svg, legend };
}


// --- Template engine ---

function processTemplate(template, data) {
  let html = template;

  // 1. Process {{#each collection}}...{{/each}} blocks
  html = html.replace(
    /\{\{#each\s+(\w+)\}\}([\s\S]*?)\{\{\/each\}\}/g,
    (match, collectionName, blockTemplate) => {
      const collection = data[collectionName];
      if (!Array.isArray(collection) || collection.length === 0) return '';

      return collection.map(item => {
        let itemHtml = blockTemplate;

        // Process {{#if field}}...{{/if}} within each block
        itemHtml = itemHtml.replace(
          /\{\{#if\s+(\w+)\}\}([\s\S]*?)\{\{\/if\}\}/g,
          (m, field, content) => {
            return item[field] ? content : '';
          }
        );

        // Replace {{field}} with item values
        itemHtml = itemHtml.replace(/\{\{(\w+)\}\}/g, (m, key) => {
          return item[key] !== undefined ? item[key] : '';
        });

        return itemHtml;
      }).join('');
    }
  );

  // 2. Replace {{key}} with content values
  const content = data.content || {};
  html = html.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    return content[key] !== undefined ? content[key] : match;
  });

  return html;
}


// --- File operations ---

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function copyFileSync(src, dest) {
  fs.copyFileSync(src, dest);
}

function copyDirSync(src, dest) {
  if (!fs.existsSync(src)) return;
  ensureDir(dest);
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDirSync(srcPath, destPath);
    } else {
      copyFileSync(srcPath, destPath);
    }
  }
}


// --- Main build ---

async function build() {
  console.log('Building Let\'s Be Ready website...\n');

  // 1. Fetch data from Google Sheets (or use fallback)
  const data = await fetchSheetData();
  console.log(`Content keys: ${Object.keys(data.content).length}`);
  console.log(`Team members: ${data.team_members.length}`);
  console.log(`Donation amounts: ${data.donation_amounts.length}`);
  console.log(`Recent donations: ${data.recent_donations.length}`);
  console.log(`Expense items: ${data.expense_allocation.length}`);

  // Generate pie chart SVG and inject into content
  const pieChart = generatePieChart(data.expense_allocation);
  data.content.pie_chart_svg = pieChart.svg;
  data.content.pie_chart_legend = pieChart.legend;

  // 2. Clean and create dist directory
  if (fs.existsSync(DIST_DIR)) {
    fs.rmSync(DIST_DIR, { recursive: true });
  }
  ensureDir(DIST_DIR);

  // 3. Process templates
  const templateFiles = ['index.html', 'donate.html', 'thank-you.html', 'partners.html', 'nutrition.html'];
  for (const file of templateFiles) {
    const templatePath = path.join(TEMPLATES_DIR, file);
    if (!fs.existsSync(templatePath)) {
      console.warn(`Template not found: ${file}, copying source file instead.`);
      // Fall back to source file if template doesn't exist yet
      const srcPath = path.join(__dirname, file);
      if (fs.existsSync(srcPath)) {
        copyFileSync(srcPath, path.join(DIST_DIR, file));
      }
      continue;
    }

    const template = fs.readFileSync(templatePath, 'utf-8');
    const html = processTemplate(template, data);
    fs.writeFileSync(path.join(DIST_DIR, file), html);
    console.log(`Generated: ${file}`);
  }

  // 4. Generate classrooms.json
  if (data.classrooms) {
    fs.writeFileSync(
      path.join(DIST_DIR, 'classrooms.json'),
      JSON.stringify(data.classrooms, null, 2)
    );
    console.log('Generated: classrooms.json (from Sheets)');
  } else {
    // Copy existing classrooms.json
    const srcJson = path.join(__dirname, 'classrooms.json');
    if (fs.existsSync(srcJson)) {
      copyFileSync(srcJson, path.join(DIST_DIR, 'classrooms.json'));
      console.log('Copied: classrooms.json (from file)');
    }
  }

  // 5. Copy static assets
  for (const file of STATIC_FILES) {
    const srcPath = path.join(__dirname, file);
    if (fs.existsSync(srcPath)) {
      copyFileSync(srcPath, path.join(DIST_DIR, file));
      console.log(`Copied: ${file}`);
    }
  }

  for (const dir of STATIC_DIRS) {
    const srcPath = path.join(__dirname, dir);
    if (fs.existsSync(srcPath)) {
      copyDirSync(srcPath, path.join(DIST_DIR, dir));
      console.log(`Copied: ${dir}/`);
    }
  }

  console.log(`\nBuild complete! Output in: ${DIST_DIR}`);
}


// Run
build().catch(err => {
  console.error('Build failed:', err);
  process.exit(1);
});

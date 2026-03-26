#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const OUT = path.join(__dirname, 'sheet-seed');

function escapeCSV(val) {
  if (val === undefined || val === null) return '';
  const s = String(val);
  if (s.includes(',') || s.includes('"') || s.includes('\n')) return '"' + s.replace(/"/g, '""') + '"';
  return s;
}

function writeCSV(filename, headers, rows) {
  const lines = [headers.join(',')];
  for (const row of rows) lines.push(headers.map(h => escapeCSV(row[h])).join(','));
  fs.writeFileSync(path.join(OUT, filename), lines.join('\n') + '\n');
  console.log(`  ${filename}: ${rows.length} rows`);
}

console.log('Generating CSVs...\n');

// =============================================
// SITE CONTENT with section + description
// =============================================
const content = [
  // Site-wide
  { key: 'site_name', value: "Let's Be Ready", section: 'Site-wide', description: 'Organization name used across the site' },
  { key: 'logo_url', value: 'https://static.wixstatic.com/media/b86cca_fad6ad16645e42dca07079533d335af6~mv2.png/v1/fill/w_80,h_80,al_c,q_85/cropped-cropped-logo-1-e1497444809475.png', section: 'Site-wide', description: 'Logo image URL (nav bar)' },
  { key: 'footer_description', value: 'Empowerment and transformation through education. A 501(c)(3) nonprofit transforming preschool education in rural Guatemala since 2008.', section: 'Site-wide', description: 'Footer tagline text' },
  { key: 'org_address', value: '1014 Pauline Avenue<br>Bellaire, Texas 77401', section: 'Site-wide', description: 'Mailing address in footer' },
  { key: 'copyright_year', value: '2026', section: 'Site-wide', description: 'Copyright year in footer' },

  // Hero
  { key: 'hero_headline', value: 'Transforming Preschool<br>Education in Guatemala', section: 'Hero', description: 'Main homepage headline' },
  { key: 'hero_sub', value: "In rural Guatemala, preschools are rare.<br>We're changing that &mdash; one village at a time.", section: 'Hero', description: 'Subtext below headline' },
  { key: 'hero_cta_text', value: 'Donate Now', section: 'Hero', description: 'Hero button text' },
  { key: 'hero_image_url', value: 'https://static.wixstatic.com/media/b86cca_0e2ea1940ac44331a21dd51fd50d9a5a~mv2.jpg/v1/fill/w_1920,h_1280,al_c,q_85/Teacher%20and%20students.JPG', section: 'Hero', description: 'Hero background photo URL' },
  { key: 'hero_image_alt', value: 'A teacher with young students in a rural Guatemalan classroom', section: 'Hero', description: 'Hero photo alt text (accessibility)' },

  // Disparity
  { key: 'disparity_eyebrow', value: 'The Reality', section: 'Disparity', description: 'Small label above disparity section' },
  { key: 'disparity_headline', value: 'In Guatemala, a child born in a rural Mayan village has a <em>1 in 5</em> chance of finishing primary school.', section: 'Disparity', description: 'Main disparity statement' },
  { key: 'disparity_stat1_value', value: '80%', section: 'Disparity', description: 'First stat number' },
  { key: 'disparity_stat1_text', value: 'of rural children drop out before finishing primary school', section: 'Disparity', description: 'First stat description' },
  { key: 'disparity_stat2_value', value: 'Zero', section: 'Disparity', description: 'Second stat number' },
  { key: 'disparity_stat2_text', value: 'preschool options in most rural villages', section: 'Disparity', description: 'Second stat description' },
  { key: 'disparity_stat3_value', value: 'Invisible', section: 'Disparity', description: 'Third stat number' },
  { key: 'disparity_stat3_text', value: "Communities so remote they're invisible to the education system", section: 'Disparity', description: 'Third stat description' },

  // Turn
  { key: 'turn_word', value: 'But.', section: 'Turn', description: 'The dramatic one-word transition' },
  { key: 'turn_question', value: 'What if the solution was already<br>inside the community?', section: 'Turn', description: 'Question below the turn' },

  // Model
  { key: 'model_step1_image_url', value: 'https://static.wixstatic.com/media/b86cca_527419ab121c4c938652b89e1b7eedea~mv2.jpg/v1/fill/w_800,h_600,al_c,q_80/IMG_20240801_155859.jpg', section: 'Model', description: 'Step 1 photo URL' },
  { key: 'model_step1_image_alt', value: 'A young facilitator being trained to teach preschool', section: 'Model', description: 'Step 1 photo alt text' },
  { key: 'model_step1_title', value: 'A young woman from the village steps forward.', section: 'Model', description: 'Step 1 heading' },
  { key: 'model_step1_text', value: 'She cares deeply about her community. We train her with a culturally adapted curriculum &mdash; three manuals built specifically for Mayan communities.', section: 'Model', description: 'Step 1 body text' },
  { key: 'model_step2_image_url', value: 'https://static.wixstatic.com/media/b86cca_e222394152f44f719607544671f2bca9~mv2.jpg/v1/fill/w_800,h_600,al_c,q_80/Our-approach-in-guatermala-2024.jpg', section: 'Model', description: 'Step 2 photo URL' },
  { key: 'model_step2_image_alt', value: 'Children learning in a community classroom in rural Guatemala', section: 'Model', description: 'Step 2 photo alt text' },
  { key: 'model_step2_title', value: 'She opens a classroom in her home.', section: 'Model', description: 'Step 2 heading' },
  { key: 'model_step2_text', value: '12 to 15 children, ages 4 to 6, learn in small groups for 2&ndash;3 hours a day. No building needed. No bureaucracy. Just a room, a teacher, and a curriculum that works.', section: 'Model', description: 'Step 2 body text' },
  { key: 'model_step3_image_url', value: 'https://static.wixstatic.com/media/b86cca_62cd990a9ac24c0e9f57b707a375c718~mv2.jpg/v1/fill/w_800,h_600,al_c,q_80/20240313_142741-1-2-scaled.jpg', section: 'Model', description: 'Step 3 photo URL' },
  { key: 'model_step3_image_alt', value: "Happy children in a Let's Be Ready preschool classroom", section: 'Model', description: 'Step 3 photo alt text' },
  { key: 'model_step3_title', value: "Children discover what's possible.", section: 'Model', description: 'Step 3 heading' },
  { key: 'model_step3_text', value: 'Education. Daily nutrition. Gardening. Art. Social-emotional skills. Two years in our program, and these children are ready for first grade &mdash; and for a different kind of life.', section: 'Model', description: 'Step 3 body text' },

  // Proof
  { key: 'proof_eyebrow', value: 'Proof, Not Promises', section: 'Proof', description: 'Small label above results section' },
  { key: 'proof_heading', value: 'This works. Here are the numbers.', section: 'Proof', description: 'Results section heading' },
  { key: 'stat_pass_rate', value: '95', section: 'Proof', description: 'Pass rate number (no % sign)' },
  { key: 'stat_pass_rate_label', value: 'pass first grade', section: 'Proof', description: 'Pass rate label' },
  { key: 'stat_pass_rate_context', value: 'The national rural average is under 20%. Our kids pass at <strong>95%</strong>.', section: 'Proof', description: 'Pass rate explanation' },
  { key: 'stat_children', value: '600', section: 'Proof', description: 'Children count number' },
  { key: 'stat_children_label', value: 'children learning right now', section: 'Proof', description: 'Children count label' },
  { key: 'stat_children_context', value: 'Across 45 classrooms in 5 departments of Guatemala, as of 2025.', section: 'Proof', description: 'Children count explanation' },
  { key: 'stat_graduation_value', value: '8 out of 10', section: 'Proof', description: 'Graduation stat number' },
  { key: 'stat_graduation_label', value: 'finish primary school', section: 'Proof', description: 'Graduation stat label' },
  { key: 'stat_graduation_context', value: 'Most rural children drop out in year one. Our graduates keep going.', section: 'Proof', description: 'Graduation stat explanation' },
  { key: 'stat_years_value', value: '17 yrs', section: 'Proof', description: 'Years active stat' },
  { key: 'stat_years_label', value: 'proven track record', section: 'Proof', description: 'Years active label' },
  { key: 'stat_years_context', value: 'Founded in 2008. Not a pilot. Not an experiment. A proven, replicable model.', section: 'Proof', description: 'Years active explanation' },

  // Map
  { key: 'map_eyebrow', value: 'See the Impact', section: 'Map', description: 'Small label above map' },
  { key: 'map_heading', value: '45 classrooms.<br>5 departments.<br>One map.', section: 'Map', description: 'Map section heading' },
  { key: 'map_description', value: 'Every pin is a real classroom, run by a real teacher, in a real community. Click to meet them.', section: 'Map', description: 'Map section subtext' },

  // Cost
  { key: 'cost_eyebrow', value: 'The Cost of Change', section: 'Cost', description: 'Small label above cost section' },
  { key: 'cost_per_child', value: '$300', section: 'Cost', description: 'Cost per child amount' },
  { key: 'cost_per_classroom', value: '$3,800', section: 'Cost', description: 'Cost per classroom amount' },
  { key: 'cost_classroom_desc', value: 'An entire classroom of 12&ndash;15 children for a full year.', section: 'Cost', description: 'Classroom cost description' },
  { key: 'cost_context', value: "That's less than a dollar a day. The model is so efficient because teachers are from the community, classrooms are in homes, and the curriculum was built specifically for this context.", section: 'Cost', description: 'Cost explanation paragraph' },
  { key: 'cost_cta_text', value: 'Learn How to Help', section: 'Cost', description: 'Cost section button text' },

  // Allocation
  { key: 'allocation_heading', value: 'Where Your Money Goes', section: 'Allocation', description: 'Allocation section heading' },
  { key: 'allocation_subheading', value: '100% goes to programs', section: 'Allocation', description: 'Allocation section subheading' },
  { key: 'allocation_item1_title', value: 'Teacher Stipends', section: 'Allocation', description: 'First allocation category name' },
  { key: 'allocation_item1_desc', value: 'Monthly pay for 45 community facilitators, deposited directly into their personal bank accounts.', section: 'Allocation', description: 'First allocation category detail' },
  { key: 'allocation_item2_title', value: 'Curriculum &amp; Materials', section: 'Allocation', description: 'Second allocation category name' },
  { key: 'allocation_item2_desc', value: 'Three custom teaching manuals, educational supplies, and training sessions three times per year.', section: 'Allocation', description: 'Second allocation category detail' },
  { key: 'allocation_item3_title', value: 'Child Nutrition', section: 'Allocation', description: 'Third allocation category name' },
  { key: 'allocation_item3_desc', value: "Daily nutritional snacks for every student. You can't learn when you're hungry.", section: 'Allocation', description: 'Third allocation category detail' },
  { key: 'allocation_item4_title', value: 'Extension Programs', section: 'Allocation', description: 'Fourth allocation category name' },
  { key: 'allocation_item4_desc', value: 'Gardening, art, environmental awareness, and social-emotional learning that builds the whole child.', section: 'Allocation', description: 'Fourth allocation category detail' },

  // Transparency
  { key: 'transparency_image_url', value: 'assets/transparency.jpg', section: 'Transparency', description: 'Photo next to transparency section' },
  { key: 'transparency_image_alt', value: "Teacher training session with Let's Be Ready facilitators", section: 'Transparency', description: 'Transparency photo alt text' },
  { key: 'transparency_eyebrow', value: 'Full Transparency', section: 'Transparency', description: 'Small label above transparency section' },
  { key: 'transparency_heading', value: 'We believe you deserve to<br>know everything', section: 'Transparency', description: 'Transparency section heading' },
  { key: 'transparency_text', value: 'Our 501(c)(3) corporate account at Charles Schwab is managed by a certified accountant. Funds transfer monthly to Guatemala, requiring dual signatures. Directors and our Guatemalan accountant review every expense monthly. Teachers receive stipends directly in their bank accounts.', section: 'Transparency', description: 'Transparency explanation paragraph' },
  { key: 'fee_comparison_footer', value: 'Most donors cover the fee so 100% reaches children.', section: 'Transparency', description: 'Fee note text' },

  // Team
  { key: 'team_eyebrow', value: 'The People Behind This', section: 'Team', description: 'Small label above team section' },
  { key: 'team_heading', value: 'Run by Guatemalan women. Supported by people like <em>you</em>.', section: 'Team', description: 'Team section heading' },
  { key: 'team_footer_text', value: 'Our board includes educators, nonprofit leaders, and professionals who volunteer their time. Every dollar raised goes to Guatemala.', section: 'Team', description: 'Text below team photos' },

  // Quote
  { key: 'founder_quote', value: '&ldquo;Dedicated men and women believe that <em>all</em> children in their communities deserve access to early education. They opened preschools in their homes, and they changed everything.&rdquo;', section: 'Quote', description: 'Featured quote text' },
  { key: 'founder_quote_cite', value: "&mdash; Let's Be Ready, 2026", section: 'Quote', description: 'Quote attribution' },

  // Final CTA
  { key: 'final_cta_heading', value: 'Thousands of children<br>are still waiting.', section: 'Final CTA', description: 'Bottom CTA heading' },
  { key: 'final_cta_text', value: 'We have 45 classrooms. Thousands more are needed. The model works. The teachers are ready. The only thing missing is funding.', section: 'Final CTA', description: 'Bottom CTA paragraph' },
  { key: 'final_cta_button', value: 'Donate Now', section: 'Final CTA', description: 'Bottom CTA button text' },

  // Donate page
  { key: 'donate_headline', value: "She's never held<br>a <em>pencil.</em>", section: 'Donate Page', description: 'Donate page main headline' },
  { key: 'donate_sub', value: "In rural Guatemala, 4 out of 5 children never attend preschool. Not because they can't learn &mdash; because there isn't one. <strong>Your donation changes that.</strong>", section: 'Donate Page', description: 'Donate page subtext' },
  { key: 'donate_image_url', value: 'https://static.wixstatic.com/media/b86cca_b489ead10c7b4188988ce83da95fd643~mv2.jpg/v1/fill/w_600,h_450,al_c,q_80/WhatsApp-Image-2024-05-09-at-11.59.33-AM.jpg', section: 'Donate Page', description: 'Donate page photo URL' },
  { key: 'donate_image_alt', value: 'Children in a classroom in rural Guatemala', section: 'Donate Page', description: 'Donate page photo alt text' },
  { key: 'donate_quote', value: '&ldquo;Before Aula Magica, my daughter had never held a crayon. Now she reads to her little brother every night.&rdquo;', section: 'Donate Page', description: 'Donate page quote' },
  { key: 'donate_quote_cite', value: '&mdash; Mother in Patzit&eacute;, Guatemala', section: 'Donate Page', description: 'Donate page quote attribution' },
  { key: 'donate_stat1_value', value: '600+', section: 'Donate Page', description: 'Donate stat 1 number' },
  { key: 'donate_stat1_label', value: 'Children educated', section: 'Donate Page', description: 'Donate stat 1 label' },
  { key: 'donate_stat2_value', value: '95%', section: 'Donate Page', description: 'Donate stat 2 number' },
  { key: 'donate_stat2_label', value: 'Pass first grade', section: 'Donate Page', description: 'Donate stat 2 label' },
  { key: 'donate_stat3_value', value: '100%', section: 'Donate Page', description: 'Donate stat 3 number' },
  { key: 'donate_stat3_label', value: 'Funds programs', section: 'Donate Page', description: 'Donate stat 3 label' },
  { key: 'golively_embed_url', value: '', section: 'Donate Page', description: 'GoLively campaign URL (leave blank until approved)' },
  { key: 'golively_placeholder_title', value: 'GoLively donation form will appear here', section: 'Donate Page', description: 'Placeholder title before GoLively is set up' },
  { key: 'golively_placeholder_desc', value: 'Once approved, paste your GoLively embed code here or update the campaign URL in donate.js', section: 'Donate Page', description: 'Placeholder instructions' },
  { key: 'sponsor_badge', value: 'Yearly', section: 'Donate Page', description: 'Sponsor section badge label' },
  { key: 'sponsor_heading', value: 'Sponsor an Entire Classroom', section: 'Donate Page', description: 'Sponsor section heading' },
  { key: 'sponsor_price', value: '$3,800', section: 'Donate Page', description: 'Sponsor price amount' },
  { key: 'sponsor_description', value: 'Fund a teacher, materials, meals, and education for 12&ndash;15 children for a full year.', section: 'Donate Page', description: 'Sponsor section description' },
  { key: 'sponsor_button_text', value: 'Sponsor a Classroom', section: 'Donate Page', description: 'Sponsor button text' },
  { key: 'donate_transparency_heading', value: 'Where your donation goes', section: 'Donate Page', description: 'Donate page breakdown heading' },
  { key: 'donate_bar1_label', value: 'Teacher salaries &amp; training', section: 'Donate Page', description: 'Expense bar 1 label' },
  { key: 'donate_bar1_amount', value: '$165', section: 'Donate Page', description: 'Expense bar 1 amount' },
  { key: 'donate_bar2_label', value: 'Learning materials', section: 'Donate Page', description: 'Expense bar 2 label' },
  { key: 'donate_bar2_amount', value: '$63', section: 'Donate Page', description: 'Expense bar 2 amount' },
  { key: 'donate_bar3_label', value: 'Meals for students', section: 'Donate Page', description: 'Expense bar 3 label' },
  { key: 'donate_bar3_amount', value: '$39', section: 'Donate Page', description: 'Expense bar 3 amount' },
  { key: 'donate_bar4_label', value: 'Facilities', section: 'Donate Page', description: 'Expense bar 4 label' },
  { key: 'donate_bar4_amount', value: '$26', section: 'Donate Page', description: 'Expense bar 4 amount' },
  { key: 'donate_bar5_label', value: 'Processing fee <em>(only overhead)</em>', section: 'Donate Page', description: 'Expense bar 5 label' },
  { key: 'donate_bar5_amount', value: '$15.45', section: 'Donate Page', description: 'Expense bar 5 amount' },
  { key: 'mail_heading', value: 'Mail a check', section: 'Donate Page', description: 'Mail section heading' },
  { key: 'mail_address', value: "Let's Be Ready #3259-6581<br>Charles Schwab &amp; Co Inc<br>PO Box 982600, El Paso, TX 79998", section: 'Donate Page', description: 'Check mailing address' },
  { key: 'other_platforms_heading', value: 'Other platforms', section: 'Donate Page', description: 'Other platforms section heading' },
  { key: 'other_platforms_note', value: 'Higher fees apply:', section: 'Donate Page', description: 'Note about other platform fees' },
  { key: 'contact_eyebrow', value: 'Questions?', section: 'Donate Page', description: 'Contact section label' },
  { key: 'contact_heading', value: 'Get in touch', section: 'Donate Page', description: 'Contact section heading' },
  { key: 'fee_note', value: 'Most donors choose to cover the processing fee, so <strong>100% reaches children</strong>.', section: 'Donate Page', description: 'Fee note below donate form' },
  { key: 'campaign_raised', value: '47,250', section: 'Donate Page', description: 'Campaign amount raised (number only)' },
  { key: 'campaign_goal', value: '75,000', section: 'Donate Page', description: 'Campaign goal amount (number only)' },
  { key: 'campaign_donors', value: '142', section: 'Donate Page', description: 'Number of donors' },

  // Thank you
  { key: 'thankyou_timeline_heading', value: 'What happens next', section: 'Thank You', description: 'Timeline section heading' },
  { key: 'thankyou_share_heading', value: 'Spread the word', section: 'Thank You', description: 'Share section heading' },
  { key: 'thankyou_step1_title', value: 'Funds transfer', section: 'Thank You', description: 'Timeline step 1 title' },
  { key: 'thankyou_step1_text', value: 'Your donation moves securely to our Guatemala operations account.', section: 'Thank You', description: 'Timeline step 1 detail' },
  { key: 'thankyou_step2_title', value: 'Teacher receives support', section: 'Thank You', description: 'Timeline step 2 title' },
  { key: 'thankyou_step2_text', value: 'Stipends, materials, and training reach community facilitators.', section: 'Thank You', description: 'Timeline step 2 detail' },
  { key: 'thankyou_step3_title', value: 'A child begins learning', section: 'Thank You', description: 'Timeline step 3 title' },
  { key: 'thankyou_step3_text', value: 'Education, nutrition, and a brighter future start in a village classroom.', section: 'Thank You', description: 'Timeline step 3 detail' },
  { key: 'thankyou_trust_text', value: 'Your receipt has been sent. Tax-deductible under 501(c)(3). EIN available upon request.', section: 'Thank You', description: 'Trust line below share buttons' },
  { key: 'thankyou_cta_note', value: 'Even $25/month provides daily nutrition for a child.', section: 'Thank You', description: 'Secondary CTA note' },

  // Partners
  { key: 'partners_eyebrow', value: 'Together We Go Further', section: 'Partners', description: 'Partners page label' },
  { key: 'partners_heading', value: 'Our Partners &amp; Supporters', section: 'Partners', description: 'Partners page heading' },
  { key: 'partners_intro', value: "We're grateful for the organizations and individuals who make our mission possible. Every partnership strengthens our ability to bring preschool education to rural Guatemala.", section: 'Partners', description: 'Partners page intro text' },
  { key: 'partner_cta_heading', value: 'Become a Partner', section: 'Partners', description: 'Partner CTA heading' },
  { key: 'partner_cta_text', value: "Interested in supporting preschool education in rural Guatemala? We'd love to hear from you. Whether you're a foundation, corporation, church, or individual &mdash; there's a way to get involved.", section: 'Partners', description: 'Partner CTA paragraph' },
  { key: 'partner_cta_button', value: 'Get in Touch', section: 'Partners', description: 'Partner CTA button text' },

  // Nutrition
  { key: 'nutrition_hero_image', value: 'assets/nutrition-hero.jpg', section: 'Nutrition', description: 'Nutrition page hero photo' },
  { key: 'nutrition_hero_image_alt', value: 'A young girl in rural Guatemala holding food', section: 'Nutrition', description: 'Nutrition hero photo alt text' },
  { key: 'nutrition_turn_image', value: 'assets/nutrition-supplies.jpg', section: 'Nutrition', description: 'Nutrition section photo' },
  { key: 'nutrition_turn_image_alt', value: 'Community members with bags of food supplies for classrooms', section: 'Nutrition', description: 'Nutrition section photo alt text' },
  { key: 'nutrition_headline', value: "You can't learn<br>when you're hungry.", section: 'Nutrition', description: 'Nutrition page main headline' },
  { key: 'nutrition_subheadline', value: 'In rural Guatemala, nearly half of indigenous children suffer from chronic malnutrition. We make sure every child eats before they learn.', section: 'Nutrition', description: 'Nutrition page subtext' },
  { key: 'nutrition_stat1_value', value: '47%', section: 'Nutrition', description: 'Malnutrition stat number' },
  { key: 'nutrition_stat1_context', value: 'of indigenous children under 5 in Guatemala suffer from chronic malnutrition', section: 'Nutrition', description: 'Malnutrition stat explanation' },
  { key: 'nutrition_stat2_value', value: '58%', section: 'Nutrition', description: 'Stunting stat number' },
  { key: 'nutrition_stat2_context', value: 'of rural Mayan children are stunted before they ever reach a classroom', section: 'Nutrition', description: 'Stunting stat explanation' },
  { key: 'nutrition_turn_heading', value: 'So we feed<br>them first.', section: 'Nutrition', description: 'Nutrition turn heading' },
  { key: 'nutrition_turn_text', value: 'Every child in every classroom receives a daily nutritious meal before learning begins. Locally sourced, teacher-led, consistent. No child in our program goes hungry.', section: 'Nutrition', description: 'Nutrition turn paragraph' },
  { key: 'nutrition_feed_stat1_value', value: '600+', section: 'Nutrition', description: 'Children fed stat' },
  { key: 'nutrition_feed_stat1_label', value: 'children fed daily', section: 'Nutrition', description: 'Children fed label' },
  { key: 'nutrition_feed_stat2_value', value: '45', section: 'Nutrition', description: 'Classrooms served stat' },
  { key: 'nutrition_feed_stat2_label', value: 'classrooms served', section: 'Nutrition', description: 'Classrooms served label' },
  { key: 'nutrition_feed_stat3_value', value: '5', section: 'Nutrition', description: 'Departments stat' },
  { key: 'nutrition_feed_stat3_label', value: 'departments', section: 'Nutrition', description: 'Departments label' },
  { key: 'nutrition_cta_heading', value: 'A full stomach<br>changes everything.', section: 'Nutrition', description: 'Nutrition CTA heading' },
  { key: 'nutrition_cta_button', value: 'Donate Now', section: 'Nutrition', description: 'Nutrition CTA button text' },
  { key: 'nutrition_quote', value: '&ldquo;When the children eat first, everything changes. They pay attention. They participate. They smile.&rdquo;', section: 'Nutrition', description: 'Nutrition page quote' },
  { key: 'nutrition_quote_cite', value: '&mdash; Community facilitator, Chimaltenango', section: 'Nutrition', description: 'Nutrition quote attribution' },
];
writeCSV('site-content.csv', ['key', 'value', 'section', 'description'], content);

// =============================================
// OTHER TABS (unchanged)
// =============================================
const teamMembers = [
  { name: 'Garrett Reed', role: 'Executive Director', bio: '30+ years as a teacher and trainer, working with immigrant and refugee students from Latin America.', photo_url: 'https://static.wixstatic.com/media/b86cca_b2b0b92f951a49b58fd9b13fa5451327~mv2.png/v1/fill/w_200,h_200,al_c,q_85/Screen%20Shot%202025-03-21%20at%2012_08_07%20PM.png', active: 'TRUE' },
  { name: 'Sara Tun', role: 'Program Administrator, Chimaltenango & Sacatepéquez', bio: 'With sixteen years experience, Sarita administers 26 classrooms in two departments.', photo_url: 'https://static.wixstatic.com/media/b86cca_5318727af2474f878016b2f3f25aa61f~mv2.jpg/v1/fill/w_200,h_200,al_c,q_80/3dd7b745-361b-4106-a3aa-0d12407f3a7c_JPG.jpg', active: 'TRUE' },
  { name: 'Lucila Diaz', role: 'Administrator, Huehuetenango, Sololá & Quiché', bio: 'Lucy has been with Let\u2019s Be Ready for 15 years. As a curriculum specialist, Lucy oversees yearly updates to our curriculum and travels extensively to meet with and support teachers.', photo_url: 'https://static.wixstatic.com/media/b86cca_527419ab121c4c938652b89e1b7eedea~mv2.jpg/v1/fill/w_200,h_200,al_c,q_80/IMG_20240801_155859.jpg', active: 'TRUE' },
  { name: 'Fred Zambroski', role: 'Founder', bio: '"This project was started by a Guatemalan woman and is currently run by Guatemalan women."', photo_url: 'https://static.wixstatic.com/media/b86cca_d6bf45f20b3949b38c1015d5323e8134~mv2.jpg/v1/fill/w_200,h_200,al_c,q_80/IMG_0708-1536x1283-1.jpg', active: 'TRUE' },
];
writeCSV('team-members.csv', ['name', 'role', 'bio', 'photo_url', 'active'], teamMembers);

const classroomsData = JSON.parse(fs.readFileSync(path.join(__dirname, 'classrooms.json'), 'utf-8'));
writeCSV('classrooms.csv', ['id', 'community', 'department', 'teacher', 'students', 'lat', 'lng', 'year'], classroomsData.classrooms);

const donationAmounts = [
  { amount: '25', impact_text: 'Snacks, 1 child/mo', featured: 'FALSE' },
  { amount: '50', impact_text: 'Classroom supplies', featured: 'FALSE' },
  { amount: '100', impact_text: '3 kids for a month', featured: 'TRUE' },
  { amount: '300', impact_text: '1 child, full year', featured: 'FALSE' },
];
writeCSV('donation-amounts.csv', ['amount', 'impact_text', 'featured'], donationAmounts);

const partners = [
  { name: 'GlobalGiving', description: 'International crowdfunding platform connecting nonprofits with donors worldwide.', logo_url: '' },
  { name: 'DonorSee', description: 'Transparent giving platform that lets donors see their impact in real time.', logo_url: '' },
  { name: 'Rotary Club of Bellaire', description: 'Local service organization supporting community education initiatives.', logo_url: '' },
  { name: 'Guatemala Ministry of Education', description: 'Government partnership for curriculum alignment and teacher certification.', logo_url: '' },
  { name: 'Community Leaders Network', description: 'Network of village leaders who identify and support local facilitators.', logo_url: '' },
  { name: 'Charles Schwab Foundation', description: 'Financial services partner providing secure fund management and transfers.', logo_url: '' },
];
writeCSV('partners.csv', ['name', 'description', 'logo_url'], partners);

const recentDonations = [
  { name: 'Maria J.', amount: '300', time_ago: '2 hrs ago', anonymous: 'FALSE' },
  { name: 'Anonymous Donor', amount: '150', time_ago: '4 hrs ago', anonymous: 'TRUE' },
  { name: 'Thomas S.', amount: '100', time_ago: '5 hrs ago', anonymous: 'FALSE' },
  { name: 'Rachel B.', amount: '500', time_ago: '1 day ago', anonymous: 'FALSE' },
];
writeCSV('recent-donations.csv', ['name', 'amount', 'time_ago', 'anonymous'], recentDonations);

const expenseAllocation = [
  { label: 'Teacher compensation', percent: '62', color: '#146BF6' },
  { label: 'Truck & maintenance', percent: '10', color: '#8b5cf6' },
  { label: 'Training & development', percent: '9', color: '#FFE500' },
  { label: 'Administrator compensation', percent: '6', color: '#16a34a' },
  { label: 'Other operating', percent: '5', color: '#F59E0B' },
  { label: 'Classroom upgrades', percent: '3', color: '#EC4899' },
  { label: 'Nutrition & water', percent: '3', color: '#06B6D4' },
  { label: 'Administration expenses', percent: '2', color: '#64748b' },
];
writeCSV('expense-allocation.csv', ['label', 'percent', 'color'], expenseAllocation);

// =============================================
// GUIDE (reference tab inside the sheet)
// =============================================
const guide = [
  { topic: 'Welcome!', info: 'This sheet controls the entire website. You can change any text, photo, or number — and the website will update when you publish.' },
  { topic: '', info: '' },

  { topic: '--- HOW TO UPDATE THE WEBSITE ---', info: '' },
  { topic: 'Step 1', info: 'Change whatever you need in this spreadsheet (fix a typo, update a number, add a team member, etc.)' },
  { topic: 'Step 2', info: 'When you\'re happy with your changes, go to the menu bar at the top and click: LBR Website > Publish Changes' },
  { topic: 'Step 3', info: 'Wait about 30 seconds, then refresh the website. Your changes are live!' },
  { topic: 'Good to know', info: 'Nothing happens until you click Publish. You can make as many edits as you want first.' },
  { topic: '', info: '' },

  { topic: '--- WHAT EACH TAB DOES ---', info: '' },
  { topic: 'Site Content', info: 'All the words on the website. Change the text in the "value" column. Leave the "key" column alone.' },
  { topic: 'Team Members', info: 'The people shown on the website. You can change names, titles, bios, and photos. Uncheck "active" to hide someone.' },
  { topic: 'Classrooms', info: 'Each row is a classroom on the map. You can update teacher names, student counts, etc.' },
  { topic: 'Donation Amounts', info: 'The dollar amount buttons on the donation page. Check "featured" on the one you want highlighted.' },
  { topic: 'Partners', info: 'Organizations on the Partners page. Add a new row to add a partner, delete a row to remove one.' },
  { topic: 'Expense Allocation', info: 'The pie chart on the homepage. Update the percentages when you have new financial data.' },
  { topic: '', info: '' },

  { topic: '--- WHAT NOT TO TOUCH ---', info: '' },
  { topic: 'The "key" column', info: 'In the Site Content tab, the first column has things like "hero_headline" — don\'t change these. They\'re how the website knows where to put the text.' },
  { topic: 'Column headers', info: 'The very first row of each tab (key, value, name, etc.) — leave those as they are.' },
  { topic: 'Tab names', info: 'Don\'t rename the tabs at the bottom of the sheet.' },
  { topic: '', info: '' },

  { topic: '--- MAKING TEXT BOLD OR ITALIC ---', info: '' },
  { topic: 'Important!', info: 'Using the bold button (B) in Google Sheets does NOT make it bold on the website. You have to type special codes around the words instead.' },
  { topic: 'To make text bold', info: 'Type <strong> before the word and </strong> after it. Example: <strong>95%</strong> shows as bold 95% on the site.' },
  { topic: 'To make text italic', info: 'Type <em> before the word and </em> after it. Example: <em>all</em> shows as italic all on the site.' },
  { topic: 'To start a new line', info: 'Type <br> where you want the line to break. Example: "You can\'t learn<br>when you\'re hungry" puts each part on its own line.' },
  { topic: '', info: '' },

  { topic: '--- CHANGING PHOTOS ---', info: '' },
  { topic: 'How it works', info: 'Photos are stored as web links (URLs). To change a photo, paste a new link into the cell.' },
  { topic: 'Which cells are photos?', info: 'In Site Content, look for keys that end in _url or _image — those are photos.' },
  { topic: 'Where to upload new photos', info: 'Upload to Google Drive, set sharing to "Anyone with the link", then use the link. Ask Sibtain if you need help with this.' },
  { topic: '', info: '' },

  { topic: '--- IF SOMETHING GOES WRONG ---', info: '' },
  { topic: 'Text disappeared from the site', info: 'You may have accidentally changed something in the "key" column. Check that column — undo if needed (Ctrl+Z or Cmd+Z).' },
  { topic: 'Photo isn\'t showing', info: 'The link to the photo may be broken. Make sure the image URL still works by pasting it in your browser.' },
  { topic: 'Changes aren\'t showing up', info: 'Did you click Publish? If yes, try waiting a minute and refreshing the page. Still nothing? Ask Sibtain.' },
  { topic: 'I messed something up', info: 'Don\'t panic! You can always undo with Ctrl+Z (or Cmd+Z on Mac). Google Sheets also saves every version — go to File > Version history to go back in time.' },
  { topic: '', info: '' },

  { topic: '--- NEED HELP? ---', info: '' },
  { topic: 'Contact', info: 'Reach out to Sibtain for any website questions. For content questions, coordinate with John.' },
];
writeCSV('guide.csv', ['topic', 'info'], guide);

console.log('\nDone!');

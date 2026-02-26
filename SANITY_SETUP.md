# Sanity CMS Setup — Let's Be Ready

Step-by-step instructions to spin up the Sanity CMS for the site.

---

## 1. Create the Sanity project (one time, ~5 min)

1. Go to https://sanity.io/manage and sign up / log in (free).
2. Click **"Create new project"**.
3. Name it **"Let's Be Ready"**, choose dataset name **`production`**, leave it public (free tier).
4. After it creates, copy your **Project ID** from the dashboard URL or the project settings.
   - Example: `abc12def`

You should now have:
- Project ID: `xxxxxxxx`
- Dataset: `production`

---

## 2. Get an API token for the migration (one time)

In sanity.io/manage → your project → **API** → **Tokens** → **Add API token**:

- Name: `migration`
- Permissions: **Editor**
- Copy the token immediately — you can't view it again.

You should now have:
- Write token: `sk...` (long string)

> Note: You will also create a separate **read-only** token later for Vercel. The migration token can be revoked after the initial migration.

---

## 3. Install studio dependencies

From the repo root (`new-site/`):

```bash
cd studio
npm install
```

---

## 4. Configure the studio

The studio reads project ID + dataset from env vars. Create `studio/.env`:

```bash
SANITY_STUDIO_PROJECT_ID=YOUR_PROJECT_ID
SANITY_STUDIO_DATASET=production
```

Or set them inline when running.

---

## 5. Run the studio locally

From the repo root:

```bash
npm run studio
```

This opens the studio at http://localhost:3333. You should see the sidebar with **Pages**, **Classrooms**, **Team Members**, etc.

At this point all docs will be empty. Move on to the migration.

---

## 6. Run the content migration

This pushes all the current static content (the fallback data in `build.js`) into Sanity in one shot.

From the repo root:

```bash
# Install Sanity client (one time)
npm install

# Run the migration
SANITY_PROJECT_ID=YOUR_PROJECT_ID \
SANITY_DATASET=production \
SANITY_WRITE_TOKEN=sk_your_write_token \
npm run migrate
```

You should see output like:
```
Migrating to Sanity project: abc12def (production)
Including 45 classrooms from classrooms.json
Pushing 80 documents to Sanity...
  ✓ Batch 1: 25 docs
  ✓ Batch 2: 25 docs
  ✓ Batch 3: 25 docs
  ✓ Batch 4: 5 docs
Migration complete!
```

Now refresh the studio — every doc should be populated with text content. **Images are intentionally not migrated** (you'll upload them by hand next).

---

## 7. Upload images

In the studio, go through each page and upload the corresponding image into the matching field. The original Wix CDN URLs are listed in the field's `*_alt` neighbour or in `templates/*.html` if you need a reference. Just drag-and-drop into the image picker.

Suggested order:
1. **Site Settings** → Logo
2. **Home Page** → Hero, Model Step 1/2/3, Transparency
3. **Curriculum Page** → Hero, Garden, Nutritional Education
4. **Nutrition Page** → Hero, Turn
5. **Donate Page** → Hero
6. **Team Members** → Photo for each person

---

## 8. Test the build against Sanity locally

From the repo root:

```bash
SANITY_PROJECT_ID=YOUR_PROJECT_ID \
SANITY_DATASET=production \
npm run build
```

Output should say `Fetching content from Sanity...` and produce the same `dist/` you'd get from Sheets.

Then preview:
```bash
npm run dev
# open http://localhost:8080
```

Verify everything looks right. If something is missing/broken, edit it in the studio, re-run the build, refresh.

---

## 9. Deploy the studio (when ready to share with editors)

From the repo root:

```bash
npm run studio:deploy
```

Sanity will ask for a hostname → enter `letsbeready` → it deploys to **https://letsbeready.sanity.studio**.

(Later, point `studio.letsbeready.org` to that URL via DNS — Sanity has a guide for custom domains in their docs.)

---

## 10. Wire Vercel to Sanity

1. In sanity.io/manage → API → Tokens → **Add API token**:
   - Name: `vercel-build`
   - Permissions: **Viewer** (read-only)
   - Copy the token.

2. In Vercel project settings → Environment Variables, add:
   ```
   SANITY_PROJECT_ID  = your-project-id
   SANITY_DATASET     = production
   SANITY_API_TOKEN   = sk_your_read_token   (optional — only if dataset is private)
   ```

3. **Remove** the old Google Sheets env vars (`GOOGLE_SHEET_ID`, `GOOGLE_SERVICE_ACCOUNT_KEY`).

4. Trigger a redeploy. Build should run against Sanity.

---

## 11. Set up auto-rebuild on Sanity publish

In sanity.io/manage → API → **Webhooks** → **Add webhook**:

- Name: `Vercel rebuild`
- URL: your existing Vercel deploy hook URL (the same one the Apps Script webhook used)
- Trigger: Create / Update / Delete
- Filter: `_type in ["siteSettings","homepage","nutritionPage","curriculumPage","donatePage","partnersPage","thankYouPage","classroom","teamMember","donationAmount","partner","expenseItem","recentDonation"]`

Now editing in the studio → publish → Vercel rebuild → live in ~30 seconds. Same flow as before, way nicer UX.

---

## 12. Tear down Google Sheets

Once you're confident everything works:
- Delete the Google Apps Script that called the Vercel webhook
- Optionally delete the old `Site Content` Google Sheet (or archive it)
- The legacy `fetchSheetData()` function in `build.js` is still there but unused — safe to leave or remove

---

## Useful commands

| Command | What it does |
|---|---|
| `npm run studio` | Run Sanity Studio locally on http://localhost:3333 |
| `npm run studio:deploy` | Deploy studio to `letsbeready.sanity.studio` |
| `npm run migrate` | Push fallback content into Sanity (one-time) |
| `npm run build` | Build the site (Sanity if env set, else fallback) |
| `npm run dev` | Serve `dist/` on http://localhost:8080 |

---

## Troubleshooting

**Migration fails with "Unknown document type"**
→ The studio schemas need to be deployed. Run `npm run studio:deploy` first OR run the studio locally once with `npm run studio` to register types.

**Build runs but pages are missing content**
→ Check the studio: each singleton (Home, Curriculum, etc.) needs to be published, not just saved as a draft.

**Images don't appear after upload**
→ Make sure you clicked "Publish" in the document after uploading. Drafts don't show up in the build.

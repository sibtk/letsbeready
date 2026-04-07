# Migration Story: Wix → Sheets → Sanity

This is the long version of the most interesting thing that happened on this project. It's also the most expensive lesson I learned: the riskiest part of any non-technical software project is whether the actual user can use it, and the only way to find out is to put it in front of them as early as possible.

If you're reading this for portfolio/PM context, the short version is: I built a CMS, the client couldn't use it, I rebuilt it on a different platform. The longer version is below.

For the sprint structure I'm referencing throughout, see `process.md`.

## Where this started

Before this project existed, the org's website lived on Wix Studio. The site loaded slow (3-4 seconds on broadband), looked dated, and was a pain to update. The board's editor experience was Wix's drag-and-drop builder, which is fine for simple layouts and miserable for structured content like classroom records or team bios.

The board's pain points, captured in the Sprint 0 stakeholder interviews:

- **"Updating a phone number takes 20 minutes and breaks the layout half the time."** Direct quote from the executive director.
- **"Adding a new classroom means I have to remember exactly which template to copy."** Board chair.
- **"We have a list of teachers in a Google Doc that we'd love to put on the site, but I can't figure out how."** Same board chair.
- **"Donations come in through Donorbox but the receipt emails go to a different inbox than the donor list and we have to reconcile manually every month."** ED.

The pattern: structured data in a tool not built for structured data. Photos, names, addresses, classroom locations, all of it living in Wix as visual elements that have to be edited individually.

## Iteration 1: Just rebuild the marketing site

**Sprint 1 (Weeks 2-3)**

The first move was the obvious one: leave Wix entirely, rebuild the marketing pages from scratch in plain HTML/CSS/JS, deploy them to Vercel for free. This was done by end of Sprint 1. The site looked modern, loaded in under a second, and the board was happy.

But none of the structured data problems were solved. Everything was still hardcoded into HTML files. If the board wanted to add a new team member, they had to ask one of us to edit a file and push to git.

We knew this from the start. Sprint 2 was always going to be "add a CMS layer."

## Iteration 2: Google Sheets as a CMS

**Sprint 2 (Weeks 4-5)**

The thinking was sound on paper:

1. Every board member already has Google Workspace
2. They all know how to edit a spreadsheet
3. Google Sheets has a free API
4. We can fetch the sheet at build time, render it through templates, deploy
5. Net new tools to learn for the board: zero

We built it. One spreadsheet with seven tabs:

| Tab | Purpose |
|---|---|
| Site Content | Key/value pairs for every text snippet on the site (~150 keys) |
| Classrooms | One row per classroom: id, community, department, teacher, students, lat, lng, year |
| Team Members | One row per board/leadership person: name, role, bio, photo URL, active |
| Donation Amounts | Suggested donation tiers shown on the donate page |
| Partners | Partner organizations with name, description, logo URL |
| Expense Allocation | Pie chart segments: label, percent, color |
| Recent Donations | Fake "recent donations" feed (I knew this would have to come from a real source eventually) |

A Google Apps Script webhook fired on edit and triggered a Vercel deploy. The architecture worked. The build script (in the legacy version of `build.js`, since deleted) authenticated with a service account, called the Sheets API, pulled all seven tabs, and rendered them through the templates. Total round-trip from "edit a cell" to "see the change live" was about 30 seconds.

**Demoed it to the board on the Sprint 2 review call. They loved it on the demo.**

## The user test that changed everything

**Sprint 3 (Weeks 6-7)**

End of Sprint 2, after the demo to the board, I realized something uncomfortable: I'd been showing the system to the executive director in supervised settings the whole time. Walking her through it, narrating each click, answering questions in real time. That's not a test, that's a sales pitch. I had no idea whether a board member sitting alone in front of the spreadsheet could actually do anything with it.

So in Sprint 3 I set up two real user-testing sessions: one with a board member who is technical-adjacent (uses Google Workspace daily, comfortable with spreadsheets) and one with a board member who is not (mostly does email, occasionally a Word doc). Both were given the same task: "add a new team member to the website using the spreadsheet." I sat in the room, watched, and did not help unless someone got completely stuck.

**Test 1: the technical-adjacent board member**
- Opened the sheet
- Found the Team Members tab
- Got confused about which row was the new one (some rows had `active: FALSE` and looked greyed out)
- Tried to add a row in the middle, broke the row ordering
- Asked "where do I put the photo?"
- Realized she had to upload a photo to a separate Google Drive folder, copy a link, paste it into the cell
- Got the link wrong format twice
- 40 minutes in, she had a row that mostly worked. The new team member appeared on the site after the next deploy.
- Quote: "I could do this, but I'd never want to."

**Test 2: the non-technical board member**
- Opened the sheet
- Stared at the seven tabs
- Asked "which one is the team page?"
- Found it
- Asked "do I just type my name in the next row?"
- Did that
- Saved
- Nothing happened on the site (because she missed the `active` column)
- Got frustrated, closed the tab
- Quote: "I'll just send Sarah an email."

That was the moment I knew the Sheets approach was wrong. Not the technology, the **shape** of the tool. A spreadsheet is built for a flat grid of homogeneous data. Adding a structured record with photos, validation, conditional fields, and "live" toggles is not a thing spreadsheets are designed for. Forcing it to be one is the same kind of mistake as trying to write a book in Excel.

## The pivot decision

**Sprint 3 (Weeks 6-7)**

I had to bring this to the ED at the next weekly check-in. This was the hardest stakeholder moment of the project (covered in `process.md`). The two slides:

**Slide 1: What's wrong with what I built**
- Quote from board member 1: "I could do this, but I'd never want to."
- Quote from board member 2: "I'll just send Sarah an email."
- Observation: the people I built this for won't use it. If they don't use it, I become the bottleneck for every content change forever.

**Slide 2: What I'd do instead**
- Migrate to Sanity, a real headless CMS with editor-first UX
- Cost: about a sprint of rework on the data layer
- Gain: real form fields with labels and validation, drag-and-drop image upload, field history, hosted Studio editors can log into from any browser, multi-user editing without conflicts
- Risk: a new platform for the editors to learn, but the board never sees Sanity directly. Only the Studio, which I configure to be as simple as possible.

She approved the pivot in 10 minutes.

## Iteration 3: Sanity

**Sprint 3 + Sprint 4 (Weeks 6-9)**

The migration was four phases:

### Phase 1: Schema design (Sprint 3)
We translated each Sheets tab into a Sanity document type. The big change wasn't the data shape, it was the editor UX:

- **Singletons** for content that has exactly one instance: `siteSettings`, `homepage`, `donatePage`, `curriculumPage`, etc. Editors see one document per page, with field groups (tabs) for each section of that page.
- **Collections** for everything else: `classroom`, `teamMember`, `partner`, `expenseItem`. Editors see a list, can search/filter/order, click into one to edit, click "+ Create" for new ones.
- **Validation rules** on every field. The team member doc requires a name and a role. Email fields are validated as emails. The "active" boolean has a clear toggle UI instead of being a TRUE/FALSE text cell.
- **Image fields** with hotspot cropping built in. No more "upload to Drive, copy URL, paste cell."

This was the work that paid off the most. The schema files are in `studio/schemas/` and they look like JS configuration objects, but each one represents a thoughtful translation of what an editor needs vs what the data model wants.

### Phase 2: The migration script
`scripts/migrate-to-sanity.js` is a one-shot importer. Reads the static fallback data (the same blob the build script uses for local dev), maps each row to a Sanity document, pushes via the official `@sanity/client` library in batches of 25.

It took two attempts to get right. The first run "succeeded" but only the singletons made it into Sanity. The collection docs (team members, classrooms, etc.) were silently dropped. After about 20 minutes of debugging, I learned that **Sanity treats document IDs containing periods as system documents with restricted access**. My first migration used IDs like `teamMember.1`, `classroom.15`, etc. Switched everything to hyphens (`teamMember-1`, `classroom-15`) and the second run worked perfectly.

### Phase 3: The build pipeline rewrite
Replaced the Sheets fetcher in `build.js` with a Sanity fetcher. About 200 lines of new code. Uses raw `fetch` against Sanity's HTTP API instead of pulling in the SDK, which keeps the build script dependency-light. Added a `sanityImageUrl()` helper that turns Sanity's image asset references into CDN URLs.

The fallback path from the Sheets era (the static `getFallbackData()` function) stayed in place, because it's still useful for local dev when you don't have credentials. So the build script now has two data sources: Sanity (production) or static (local dev).

### Phase 4: The Studio deploy
`npx sanity deploy` pushes the Studio (the editor UI) to Sanity's hosted infrastructure. Within minutes the board could log in at `letsbeready.sanity.studio` from any browser. No infra setup, no domain hassle, no auth code to write.

We set up a webhook in the Sanity dashboard that fires on every publish. The webhook hits a Vercel deploy hook URL. Vercel rebuilds the site. Total round-trip: about 30 seconds, edit-to-live, no developer involvement.

## What changed for the editor

Same task as the user test in Sprint 3: "add a new team member to the website."

Old (Sheets) flow:
1. Open Google Sheets
2. Find the Team Members tab
3. Find the next empty row (or a hidden inactive row)
4. Type into 6 cells: name, role, bio, photo URL, active, order
5. Open Google Drive
6. Upload the photo to the right folder
7. Get the shareable link
8. Make sure the link format matches what the build script expects
9. Paste the link into the photo URL cell
10. Make sure `active` is set to TRUE
11. Wait for the build to fire
12. ~40 minutes for a non-technical board member, with errors

New (Sanity) flow:
1. Open `letsbeready.sanity.studio`
2. Click "Team Members" in the sidebar
3. Click "+ Create"
4. Type the name
5. Type the role
6. Type the bio
7. Drag a photo from desktop into the photo field
8. Crop with the hotspot tool if you want
9. Click Publish
10. Wait 30 seconds
11. ~3 minutes, no errors

We re-tested with the same two board members in Sprint 4. Both completed the task without help. The non-technical board member's quote: "Wait, that's it?"

## The other things that came out of the migration

Once the data layer was on Sanity, a bunch of "wouldn't it be nice if" features became cheap to add:

- **A real newsletter form.** We replaced the dead "Subscribed!" fake form on the Wix site with a working one that POSTs to a Vercel serverless function and writes to a Sanity `subscriber` collection. Editors see new signups in the same Studio they already use.
- **A media library.** Installed `sanity-plugin-media` for drag-and-drop bulk image upload, tags, search, and reusable photo references across the site. We bulk-imported 50 photos from the old Wix scrape and 22 from a Google Doc the org had.
- **Site Settings as a single source of truth.** Every "global" value (logo, favicon, contact email, social URLs, footer description, address, trust pills) moved into one Sanity singleton. Editing the contact email used to require touching 7 template files. Now it's one field, one publish, propagates everywhere.
- **A footer extracted to a single partial.** Same idea: one file, every page consumes it.
- **The training doc.** Once the editor experience was good enough to be teachable, I wrote `training.html` and shipped it at `/training` on the live site. Editors bookmark a real URL, the doc auto-deploys with the rest of the site, and it's the onboarding handoff for new editors going forward.

None of these were possible (or even worth doing) when the data layer was Google Sheets.

## The real lesson

The lesson is not "Sanity is better than Google Sheets." Sanity is better for *this use case*. Sheets would have been fine if the editors were spreadsheet-native and the data was naturally tabular.

The lesson is **test the riskiest assumption first**. The riskiest thing about a CMS for non-technical users is whether they can use it. Build the smallest version, put it in front of real users in week 2, not week 6. Watch them. Ask them to do the task without your help. The 40 minutes you spend running that test will save you 2 weeks of building the wrong thing.

I lost a sprint to the Sheets dead end. Worth every hour, because the lesson is one I'll remember the rest of my career. The next time a client says "we already use [familiar tool], can we just use that?", I'll smile, say "let's test it first," and book a user-testing session before writing a single line of integration code.

## Numbers, for posterity

| Metric | Wix | Sheets era | Sanity era |
|---|---|---|---|
| Time to add a new team member | ~10 min | ~40 min (board member, with errors) | ~3 min |
| Page load (homepage, broadband) | 3.8s | 0.9s | 0.9s |
| Editors who can do it without help | 0 | 0 | 4 (so far) |
| Lines of build code | 0 | ~600 | ~750 (most of it Sanity-specific) |
| External dependencies in `package.json` | n/a | 3 (`google-spreadsheet`, `google-auth-library`, `dotenv`) | 1 (`@sanity/client`) |
| Cost per month | $29 (Wix Premium) | $0 | $0 |
| Time to publish a content change | manual, 10+ min | 30 sec | 30 sec |

## What "done" looked like

End of Sprint 4, I did a final user-testing session with the same two board members. Same task ("add a team member"). Both finished in under 5 minutes. The non-technical board member said it was "easier than booking an Uber."

That was the point at which the project felt safe. Everything after that (donations, forms, polish, training) was additive. The hard part was the pivot.

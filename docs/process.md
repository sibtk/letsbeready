# Process & Project Management

This was a 14-week project for MIS 4374 (Information Technology Project Management) at the University of Houston. The class assignment was structured as a five-person team. In practice I owned the engineering, the architecture, the client relationship, and the project management end to end. The class team handled the academic deliverables (final presentation, semester report). Everything below describes how I actually ran the project.

## What I owned

| Layer | What I did |
|---|---|
| **Engineering** | Build pipeline, template engine, all marketing pages, Sanity schemas, the Vercel serverless function for the form API, the Leaflet map setup, all CSS, every migration script |
| **Architecture** | The Wix → Sheets → Sanity decisions, the static-site-vs-framework call, the GiveLively integration, the no-third-party-form-service constraint, the simplicity-as-design discipline |
| **Project management** | Sprint planning, the Linear board, stakeholder cadence with the executive director, MoSCoW prioritization, the risk register, the decision log, sprint reflections |
| **Client work** | Weekly check-ins with the executive director, board demos every other Friday, the user-testing sessions that triggered the Sheets-to-Sanity pivot, the editor handoff |
| **Documentation** | This whole `docs/` folder, the editor training guide at `/training`, the README, the project decisions log |

The class team handled the final presentation and the semester report. I gave them the slides skeleton and the project data; they took it from there.

## Why I ran it solo

By Sprint 2 it was clear I was going to drive the technical execution. Two reasons:

1. **I cared more about the client outcome than the grade.** The Let's Be Ready board was depending on this project to replace a website they couldn't maintain. That mattered more to me than the assignment rubric, and I wasn't willing to ship something half-finished just to distribute the work fairly across teammates who weren't as invested.

2. **The work needed coherent ownership.** A CMS architecture decision in Sprint 4 affects the build pipeline written in Sprint 1, the API written in Sprint 5, and the training doc written in Sprint 6. Splitting that across four other people would have meant constant re-syncing and a lot of "wait, why did we do it that way?" conversations. I'd rather own all the layers than coordinate across all the layers.

It became my project early and stayed that way. I'm not framing this as a complaint. I learned ten times more by owning every layer than I would have learned in a perfectly distributed team experience. Solo ownership of a real client project is one of the rarest experiences a student can get. I took it.

## Methodology: Agile-ish, solo edition

I ran 2-week sprints over 14 weeks. Seven sprints total, with the first week eaten by stakeholder interviews and the last week reserved for handoff and the final presentation.

I called it "Agile-ish" because I cherry-picked what worked at solo scale and dropped what didn't.

**What I kept from Scrum:**
- Sprint planning at the start of every two weeks (Sunday night, ~30 minutes, just me with Linear)
- A daily working log instead of a standup. Three lines a day in a Notion file: what I did yesterday, what I'm doing today, what's blocking me. Writing it down forced me to admit when I was stuck.
- Sprint demos to the client every other Friday
- End-of-sprint reflection: what worked, what didn't, one thing to change for next sprint

**What I dropped:**
- Story points. With one person, "small / medium / big" was good enough and faster.
- Burndown charts. Linear's project view did the job. No point making slides.
- Velocity tracking. Velocity is useful when N > 1 and you have 6+ months of data. I had neither.

**What I made up:**
- **Confidence checks.** Once a week I rated my own confidence in the project's overall trajectory on a 1-5 scale and wrote a one-line reason. If the rating dropped below 3, that became the priority for the next sprint planning. Caught two scope-creep issues this way before they became real problems. (I tried this for myself; it works just as well solo as it does on a team.)
- **The "explain it back" rule.** Whenever I was about to make a non-trivial decision, I had to write down a one-paragraph explanation of why, in plain English, as if I was telling a non-technical board member. If I couldn't explain it cleanly, I wasn't ready to make the call yet. That paragraph usually became the seed of an entry in `docs/decisions.md`.

## The Gantt chart (or, how I learned to love Linear)

Started with a Gantt chart in Notion. Switched to Linear in Sprint 2.

**Why a Gantt to begin with:**
- The board wanted to see "when will it be done"
- A semester-long project has hard external deadlines (midterm checkpoint, final demo) that don't move
- The Gantt was the only artifact that made dependencies visible at a glance: "I can't migrate to Sanity until the schemas are written, I can't write the schemas until I know the page structure, I can't know the page structure until the designs are approved"

**Why I switched:**
- A Gantt is great for a one-time read but terrible for daily updates
- Notion's database wasn't built for this and the rendering was slow
- Linear's project view gave me the same visualization with much better day-to-day usability

I kept the original Gantt as a static PDF in the project archive for the final presentation, but day-to-day work happened in Linear.

```
WEEK:        1   2   3   4   5   6   7   8   9   10  11  12  13  14
─────────────────────────────────────────────────────────────────────
Discovery    ██
Wireframes      ████
Brand audit     ██
Build setup        ████
Sheets CMS              ████        ← shipped, then thrown out
Sanity migration             ████████
Donations                            ████
Forms backend                           ████
Polish                                       ████
Training                                        ████
Handoff                                              ██
```

The Sheets row is the one I always point to. I shipped it, demoed it, and killed it in the same sprint cycle. The pivot is documented in detail in `migration.md`, and it cost about a sprint of work. Worth every hour.

## Sprint-by-sprint summary

Each sprint had a theme. Themes were not assigned in advance, they emerged from the previous sprint's reflection.

| Sprint | Weeks | Theme | Key deliverable |
|---|---|---|---|
| 0 | 1 | Discovery | Stakeholder interviews, brand audit, content inventory of the existing Wix site |
| 1 | 2-3 | Design + scaffolding | Figma wireframes signed off, repo created, build script scaffold, first marketing page rendering from a hardcoded JSON |
| 2 | 4-5 | The Sheets experiment | Built the Google Sheets-backed CMS pipeline, demoed to the board, felt great about it |
| 3 | 6-7 | The pivot | Tested Sheets editing with two board members, both gave up. Decided to migrate to Sanity. Wrote the new schemas, started the migration script |
| 4 | 8-9 | Cutover | Migrated all content to Sanity, deployed the Studio, set up the auto-rebuild webhook, handed editing access to the board |
| 5 | 10-11 | Donations + forms | Wired up GiveLively, replaced the dead newsletter form with a real one backed by a serverless function, added the subscriber inbox |
| 6 | 12-13 | Polish + training | Wrote the training doc, took editor screenshots, did a 90-minute walkthrough with the board, fixed everything they said was confusing |
| 7 | 14 | Handoff | DNS migration plan written (actual cutover happens after the semester), final presentation, repo handed over with the README |

The biggest single-sprint outcome was Sprint 3's pivot. That's the story in `migration.md`. It cost the previous sprint of work, but the alternative was shipping a CMS nobody on the board would use.

## Stakeholder management

Two stakeholders that mattered:
- **Executive Director** — single point of contact, owns sign-off, decides scope
- **Board Chair** — cares about brand, tone, and the public-facing pieces, less about tech

**Cadence:**
- Weekly check-in with the ED, ~30 minutes on Wednesdays. I walked her through what shipped that week, what was coming next, and any decisions I needed her to make.
- Bi-weekly demo to the full board, end of each sprint, 30 minutes, Friday afternoons.
- Slack channel for async questions, response within 24 hours.

**The hardest stakeholder moment:**
Sprint 3, when I had to tell the ED that the Sheets CMS I'd built and demoed two weeks earlier needed to be thrown out and rebuilt on a new platform. I had two slides:

1. **Here's what's wrong with what I built** (with direct quotes from the two board members who tried it)
2. **Here's the alternative**, here's what it costs us, here's what it gains us

She approved the pivot in 10 minutes. The rule I learned: if you're going to deliver bad news to a client, lead with the data, end with the recommendation, and ask for the call. Don't sandwich it.

**The easiest stakeholder moment:**
Sprint 6, when I demoed the editor training doc and the ED literally said "oh, I get it now." That's the moment I knew the project would survive after the semester ended.

## Tools

| Tool | Used for |
|---|---|
| **Linear** | Sprint planning, task tracking, daily working log, the project view (replaced the Gantt) |
| **Figma** | Wireframes, brand audit, design sign-off |
| **Notion** | The original Gantt (replaced by Linear), the decision log, sprint reflections |
| **GitHub** | Code, version control, the actual build deployments |
| **Slack** | The org's async channel for questions to the ED |
| **Loom** | Walkthroughs for the board when something needed visual explanation |
| **Google Drive** | Shared docs with the board, brand guidelines, the content inventory spreadsheet |

I did NOT use Jira, Confluence, Microsoft Project, or any of the heavyweight enterprise PM tools. They're built for 50-person teams with multiple stakeholder layers. Overkill for a solo client project, and the learning curve would have eaten a week.

## MoSCoW prioritization

For each sprint, every task got tagged Must / Should / Could / Won't. Strict rule: Must + Should had to fit in 60% of my sprint capacity. The other 40% was for Could items, scope cuts, and slack for surprises.

In practice this meant some sprints were under-scoped on paper and over-delivered, which is much better than the opposite. The board was always happy with the demo because I never promised more than I could ship.

## Risk register

Five risks I tracked from day 1, reviewed every other sprint:

1. **The board can't or won't use the CMS I ship.** This was the #1 risk and the reason for the Sheets-to-Sanity pivot. Mitigation: user-test early with real editors, not just the ED.
2. **GiveLively rejects the org's application.** Mitigation: parallel-track Donorbox as a backup (never needed it).
3. **I underestimate scope and miss the final presentation deadline.** Mitigation: weekly self-confidence checks, a strict MoSCoW rule that left 40% slack capacity in every sprint.
4. **DNS / domain confusion at cutover blocks the launch.** Mitigation: deferred cutover to post-semester, wrote the cutover playbook and walked the org through it.
5. **The training doc gets ignored.** Mitigation: built it into the live site at `/training` so it's bookmarkable, and made the ED click through it on a Loom call so I could see where she got stuck.

The pivot in Sprint 3 was directly caused by Risk #1 turning real. The risk register paid for itself in that single moment.

## Reflections that mattered

Three sprint-end reflections that changed how I worked:

1. **Sprint 1 reflection:** My morning routine wasn't sustainable. I'd been blocking out 9-11 AM for project work but kept getting pulled into class commitments. Switched to evening work blocks instead, which fit my schedule better and got me into a flow state that mornings never did.

2. **Sprint 3 reflection:** "I'm spending too much time in the developer seat for a project where editors are the customers." This was the realization that triggered the user-testing sessions with the board. Once I put a real editor in front of the prototype, the Sheets approach died in 40 minutes.

3. **Sprint 5 reflection:** I'd been overthinking commits and trying to ship "perfect" PRs. Started breaking changes into smaller commits and shipping more often. Velocity jumped noticeably the next sprint, and the deploy log got way easier to debug when something broke.

## Definition of Done

I agreed on this with the ED in Sprint 1 and stuck to it. A task wasn't done until:

1. The code was merged to `main`
2. The change was visible on the staging deploy (Vercel preview URLs)
3. The change was visible on the live site after Vercel auto-deployed
4. Any related ticket in Linear was closed with a one-line note about what shipped
5. Any user-facing change was added to the demo notes for the next sprint review

Strict but lightweight. No QA team, no test coverage requirements (the project is small enough that visual review caught most issues), no formal acceptance criteria document. Just: shipped, visible, tracked, demoable.

## What I'd do differently

1. **Start with user testing earlier.** I didn't put real editors in front of the prototype until Sprint 3. If I'd done it in Sprint 2 I would have skipped the Sheets dead end entirely. Lesson: if your customer is non-technical, the riskiest thing about your design is whether they can actually use it. Test that first, before you write a single line of CMS integration code.

2. **Write the training doc earlier.** I left it for Sprint 6 because it felt like a "polish" task. It should have been Sprint 4 or 5, because writing the docs forced me to notice UI confusion that I wouldn't have caught otherwise. The training doc was a debugging tool as much as a deliverable.

3. **Smaller commits.** A few of my commits near the end of the semester touched 30+ files. Reviewing my own diffs was a chore, and bugs slipped through. Smaller chunks would have been safer even with more commit overhead.

4. **One project tool, not two.** I had Linear for sprint work and GitHub for code-specific issues. They drifted apart by Sprint 5 and I started missing things in one or the other. Next time: pick one and live in it.

5. **Set better expectations on the team distribution earlier.** I knew by Sprint 2 that I was going to own most of the build. I should have had a direct conversation with the team and the professor in Sprint 2 instead of just absorbing the work and resenting it for a week before getting over it. The conversation would have been awkward but the alternative was carrying the weight quietly. Solo is a fine outcome; it should have been an explicit choice, not a default.

## The artifacts that survived the semester

If you're reading this repo from the outside, here are the PM-side things worth looking at:

- **`README.md`** — the project overview, written for an outside reader (recruiter, future contributor, the org's next dev)
- **`docs/architecture.md`** — system overview, where each piece lives
- **`docs/decisions.md`** — the technical and product decisions, with context
- **`docs/migration.md`** — the chronological story of how the CMS architecture changed three times
- **`docs/process.md`** — this file
- **`SANITY_SETUP.md`** — one-time setup walkthrough for cloning the project
- **`training.html`** — the editor training guide (also live at `letsbeready.org/training`)
- **`scripts/`** — the migration tooling, kept around as a reference for how the data move actually worked

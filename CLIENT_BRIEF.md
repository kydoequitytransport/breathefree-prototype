# BreatheFree Habit App — Client Brief

**For:** BreatheFree (client)
**From:** [Your agency]
**Date:** April 2026
**Status:** Prototype complete, ready to productionize

---

## What we've built so far

A working mobile web app prototype for your paid customers, designed around the Breathlace necklace and Mullein refills. It lives at:

👉 **https://breathefree-app-119.netlify.app/**

It is fully functional for a single user on a single device. You can click through every flow, create a profile, log cravings, fire the SOS, track milestones, and see money saved.

**What it does:**
- **5-step onboarding** that captures name, email, what they're quitting, their "why" (identity anchor), quit date, daily spend, and their hardest trigger window
- **Home dashboard** showing their cumulative clean days, next health milestone, money saved, today's ritual, and a link to the Circle (Facebook group)
- **Craving & SOS modals** with guided breathing, ritual scripts, and a no-shame "I slipped — log it" path
- **Milestone timeline** with health facts at each unlock point (20 minutes → 1 year)
- **Rituals & trigger map** showing the user's own patterns over time
- **Kit view** linking to your Shopify product pages
- **Profile** for editing their settings

**What's honored throughout:**
- No shame framing, no "Day 1 again" language, no streak-reset mechanics
- Identity-first voice ("you're becoming someone who…")
- Named products (Breathlace, Mullein) front and center
- No leaderboards, no public comparison — accountability lives in the Facebook group
- Brand palette matched exactly (cream, coral, gold, brown, green)

---

## The one limitation right now

**User data only lives in the browser.** If a user clears their browser, switches devices, or uses a different phone — they lose their streak, their profile, everything.

This was intentional for the prototype phase (fast iteration, no infra cost). Now it's time to fix it.

---

## What we're building next (Phase 1 — productionizing)

Four changes. None of them change the look of the app.

**1. Email + password login**
Users create an account the first time they open it. Their email already gets captured in onboarding — we're just adding a password field and a "Returning user? Log in" link. No new screens.

**2. Cloud-synced data**
Instead of saving to the browser, we save every piece of progress (streak, cravings, slips, check-ins, money saved) to a secure database tied to their account. Login on any device → see your data.

**3. Replace placeholder social proof with real numbers**
The home screen currently says *"Maya just hit 30 days"* — that's placeholder text. We'll swap it for real aggregate data like *"You're one of 75,000+ people on this path. 4,200 hit 1-week clean this month."* Matches our actual brand scale, no fake names.

**4. You get a dashboard to see your users**
Via a backend tool called Supabase (our database provider). You'll be able to log in and see: how many people signed up, their quit dates, active streaks, slip frequency, which triggers are most common. No code, just a table view — like a Google Sheet for your app data.

**Not changing:** the UI, the flows, the copy, the brand voice. Everything you signed off on stays exactly as-is.

---

## Phase 1 timeline

Once we hire a developer, Phase 1 is expected to take **2–4 working days of dev time**, with a roughly **2-week turnaround** end to end (including testing and sign-off).

This gets you a shippable, production-ready app. Real users. Real data. Cross-device sync. Your own back-office view of everything.

You'll handle budget directly with the developer you hire.

---

## What we're NOT building yet (and why)

These are on the roadmap but don't make sense until we have real users and traction:

| Feature | Why we're holding off |
|---|---|
| Push notifications (trigger reminders, milestone alerts) | Nice-to-have, adds complexity. Wait until we know users want it. |
| Email notifications (milestone wins, weekly check-ins) | Same logic. Easy to add later. |
| Analytics dashboards with graphs (Posthog) | We can view raw data in Supabase for now. Add fancy dashboards when we outgrow tables. |
| Refactor to React/Svelte | The current single-file HTML works perfectly. Refactoring is dev preference, not a user benefit. |
| Ebook content hooks on home screen | High-value but needs content work from you. Phase 2. |
| Live Shopify promo integration in Kit view | Medium-value. Phase 2. |
| Accessibility bumps for older users (45–55 demographic) | Small effort. Recommend doing this in Phase 2. |

---

## Decision points we need from you

Before handing off to the developer, please confirm:

1. **Login method:** Email + password? Or magic link (no password — they just click a link in their inbox to log in)? Magic link is less friction for mid-craving users but less familiar. Our recommendation: **password, with magic link as a future option.**

2. **The "Maya" line:** approve replacing it with aggregate copy? Example: *"75,000+ people on this path. 4,200 hit 1-week clean this month."*

3. **Brand voice for new copy:** the developer will write a few small strings (login screen, password reset emails, etc.). Do you want to approve each, or trust us to write them in your voice?

4. **Developer hire:** we'll propose a shortlist of freelance developers (with their rates and portfolios) so you can pick one and handle the contract directly. Confirm you're ready to take that step once the three decisions above are locked in.

---

## What happens after Phase 1 ships

You'll have:
- A live app at habit.breathefree.shop
- Real users signing up and their data being saved
- Your own dashboard to see who's using it and how
- 2–4 weeks of watching real user behavior

Then we decide Phase 2 based on what we actually see:
- Are users dropping off at a specific point? → fix that
- Are users hitting milestones? → add push notifications for celebration
- Is the ebook getting read? → surface more of it in-app
- Are older users struggling? → accessibility pass

We'll bring you a Phase 2 proposal with real data, not guesses.

---

## Questions?

Reply to this doc with any changes or approvals. Once we have sign-off on the four decision points above, we hand off to the developer and you'll have Phase 1 live within ~2 weeks.

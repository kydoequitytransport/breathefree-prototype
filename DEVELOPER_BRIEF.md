# BreatheFree Habit App — Developer Brief

**Project:** BreatheFree (quit smoking/vaping brand) habit tracker web app
**Status:** Working single-file HTML prototype. Productionizing with auth + cloud sync.
**Scope:** Phase 1 only — backend integration. NOT a refactor, NOT a redesign.

---

## Repository contents

- `index.html` — the entire app (~100 KB, single-file, all CSS/JS inline, no build step)
- `README.md` — architecture, data model, brand rules, context
- `CLIENT_BRIEF.md` — what the client has approved (ignore if you want, but don't contradict it)
- `DEVELOPER_BRIEF.md` — this document

**Live prototype:** https://breathefree-app-119.netlify.app/

---

## What you are building

Four specific changes. Nothing else without asking.

### 1. Email + password authentication

- **Reuse the existing email field** in onboarding step 1 (line ~385 in `index.html`). Don't build a separate login screen before onboarding.
- Add a **password field** to that same step.
- Add a **"Already have an account? Log in"** link at the top of the onboarding screen. Clicking it opens a simple login form (email + password + "forgot password" link).
- Supabase email/password auth. Password reset handled by Supabase's built-in email flow.
- Sessions persist (Supabase handles this by default). User stays logged in across browser sessions.

### 2. Cloud-synced user state

Replace all `localStorage` reads/writes for the two keys (`bf_state` and `bf_event_log`) with Supabase calls.

**Database schema (minimum):**

```sql
-- Supabase auto-handles auth.users. Add one table:

CREATE TABLE user_data (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  state JSONB NOT NULL DEFAULT '{}'::jsonb,
  event_log JSONB NOT NULL DEFAULT '[]'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row-level security: each user can only read/write their own row
ALTER TABLE user_data ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own data" ON user_data FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users write own data" ON user_data FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users insert own data" ON user_data FOR INSERT WITH CHECK (auth.uid() = user_id);
```

**Behavior:**
- On app load: if logged in, fetch `state` and `event_log` from Supabase and hydrate the app's in-memory `state` variable (replacing what `JSON.parse(localStorage.getItem('bf_state'))` currently does).
- On any state change: debounced write (200ms) to Supabase. Keep localStorage write as offline fallback.
- On logout: clear localStorage + in-memory state.
- On network failure: keep writing to localStorage, queue Supabase writes for when connection returns. Don't break the app if offline.

**Preserve the existing migration block** (lines ~1225-1230 in `index.html`). Run it after hydration so old localStorage users don't break.

### 3. Replace placeholder social proof

The home view has a hardcoded line: *"Maya just hit 30 days. Your win is someone else's reason to keep going."*

Replace it with dynamic aggregate copy:
```
"You're one of 75,000+ people on this path. {N} hit 1-week clean this month."
```

Where `{N}` comes from a simple Supabase query: count distinct users whose `state.totalCleanDays >= 7` and whose 7-day anniversary fell within the last 30 days.

If the count is 0 (e.g., early launch), fall back to: *"You're one of 75,000+ people on this path."*

### 4. Aggregate query endpoint

Expose the above count via a Supabase RPC function (not client-side table query) so we don't leak other users' data. Example:

```sql
CREATE OR REPLACE FUNCTION public.get_week_one_count()
RETURNS INTEGER AS $$
  SELECT COUNT(*)::INTEGER FROM user_data
  WHERE (state->>'totalCleanDays')::INTEGER >= 7
    AND (state->>'weekOneDate')::TIMESTAMPTZ > NOW() - INTERVAL '30 days';
$$ LANGUAGE SQL SECURITY DEFINER;
```

Call this from the app on home load. Cache in-memory for the session.

---

## What you must NOT do

- **Do not change the UI.** No restyling, no layout changes, no copy edits beyond the placeholder line above.
- **Do not refactor to React, Svelte, Next, or any framework.** The single-file HTML stays. You're adding ~200 lines of Supabase integration, not rewriting 2,700 lines.
- **Do not add build tooling** (webpack, vite, etc.). No package.json. No node_modules. Pull Supabase JS client via CDN `<script>` tag.
- **Do not break the existing localStorage migration block.** It handles users from earlier prototype versions.
- **Do not touch the brand voice.** See "Brand rules" in `README.md`. Any new copy (login screen, password reset email) must be reviewed before shipping.
- **Do not add analytics, push notifications, email notifications, or any feature beyond the 4 above.** Ask first.

---

## Tech stack

- **Frontend:** existing `index.html`, Supabase JS client via CDN
- **Backend:** Supabase (free tier is fine — project should handle ~50k users before needing paid tier)
- **Deploy:** Netlify, already connected (see `.netlify/` folder in my local, credentials to be shared separately)
- **Domain:** staging stays on current Netlify URL, production will deploy to `habit.breathefree.shop`

---

## Acceptance criteria

Phase 1 is complete when all of the following are true:

- [ ] New user can sign up with email + password via the onboarding flow
- [ ] Existing user can log in via the "Already have an account?" link
- [ ] Logged-in user on Device A sees their state reflected on Device B after logging in there
- [ ] Clearing browser localStorage does NOT wipe user data (Supabase is source of truth)
- [ ] Password reset flow works end-to-end (user receives email, sets new password, can log in)
- [ ] The "Maya just hit 30 days" line is replaced with dynamic aggregate copy
- [ ] App works offline for already-logged-in users (reads/writes queue, syncs on reconnect)
- [ ] Project owner ([Tam]) has admin access to the Supabase project and can view user_data table
- [ ] All brand voice rules in `README.md` are honored in any new copy written
- [ ] No regressions — every existing flow (onboarding, craving, SOS, milestones, check-in, profile) still works

---

## Timeline

- **Estimated effort:** 2–4 working days
- **Kickoff:** within 1 week of agreement
- **Target delivery:** 2 weeks from kickoff

Rate, payment structure, and contract terms to be agreed directly with the client.

If scope creep emerges, pause and flag it — do not silently add work.

---

## Communication

- **Status updates:** end of each working day, 3-5 bullets. What shipped, what's blocked, what's next.
- **Questions:** batch them once a day rather than ping-per-question.
- **Demos:** one walkthrough after Phase 1 is complete, live screen-share, 20 minutes.
- **Handoff:** full code in the existing `index.html`, migration instructions, admin access to Supabase project.

---

## About the product (so you have context, not so you add features)

- Audience: US adults 25–55 who have purchased the Breathlace necklace and/or Mullein refills
- The app is a post-purchase retention and outcome tool — it's not a standalone product
- Accountability lives in an external Facebook group, not in-app — do NOT build any social/community features
- This is a prototype being productionized, not a fresh build. Respect what's already there.

---

## Questions to ask before starting

1. Can you confirm Supabase is fine, or would you prefer Firebase? (We have a preference for Supabase due to Postgres + SQL admin view. Flag if you have a strong reason otherwise.)
2. Will you deploy to the existing Netlify project, or set up your own?
3. Any concerns about the 2–4 day estimate given the spec above?

Reply with answers to these three and we can kick off.

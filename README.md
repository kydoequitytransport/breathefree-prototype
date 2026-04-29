# BreatheFree App — Developer Handoff

Mobile-first web app prototype for BreatheFree, a quit-smoking/vaping brand. The app is a habit tracker + ritual coach for paid customers of the Breathlace resistance-breathing necklace and Mullein flavor refills.

- **Live:** https://breathefree-app-119.netlify.app/
- **Intended production URL:** habit.breathefree.shop
- **Status:** Functional prototype, ready for a developer to take over and productionize.

---

## What you're inheriting

A **single-file HTML prototype**: `index.html` (~100 KB). All CSS and JS are inline. No build step, no framework, no package manager. Open the file in a browser and it works.

State is persisted to `localStorage` (keys: `bf_state`, `bf_event_log`). There is no backend, no auth, and no analytics pipeline — every user's data lives only in their own browser.

This was intentional for the prototype phase: fast iteration, zero infra, easy for non-devs to edit. It is **not** the long-term architecture.

### Run locally

```bash
open index.html
# or: python3 -m http.server 8000  →  http://localhost:8000
```

### Deploy

Currently deployed via Netlify (see `.netlify/netlify.toml`). The publish directory is the root of this folder — any change to `index.html` can be shipped by running `netlify deploy --prod` from this directory.

---

## App structure

Seven views, all rendered inside a single 430px-wide mobile shell:

1. **Onboarding** (5 steps: welcome → name/identity → future-self "why" → quit date + spend → toolkit + trigger window)
2. **Home / Dashboard** (identity line, withdrawal banner, clean-days hero, next milestone countdown, money saved, today's ritual, refills upsell, circle snapshot, daily check-in, floating craving button, SOS button)
3. **Milestones** — health milestone timeline, cumulative clean days (never resets on slip)
4. **Tribe** — Facebook group integration (external link, not native feed)
5. **Rituals + Trigger Map** — user's personal trigger patterns + assigned rituals
6. **Kit** — product catalogue (necklace, refills, mullein)
7. **Profile** — settings, quit date edit, data reset

Plus modals: craving log, SOS (breathing exercise), slip log ("I slipped"), milestone celebration.

### Data model (localStorage)

- `bf_state`: the full user object — name, identity type, why, quit date, starting spend, chosen ritual, trigger window, cumulative hours clean, slip count, etc.
- `bf_event_log`: array of timestamped events (cravings, slips, check-ins) used for the tracker view.

There is a migration block at the top of the script section that handles renames from earlier prototype versions (`breathlace` → `necklace`, `mullein` → `refills`). Don't delete it — existing users have old state.

### Copy data (inline constants at top of script block)

- `MILESTONES` — health milestone array with `celebrate: true/false` flag (celebrate fires a modal + confetti, non-celebrate only unlocks silently in the timeline)
- `RITUAL_DATA` — the 4 ritual scripts (necklace, refills, breath, water)
- `WHY_IDENTITY` — the 5 identity-anchor lines used throughout ("you're becoming someone who…")
- `WITHDRAWAL_STAGES` — 5 stage-specific withdrawal explainers shown in the home banner

Any copy tweaks for brand/voice are likely edits to these constants.

---

## Brand rules (NON-NEGOTIABLE)

The client has explicit voice rules. Any copy change must respect these:

- **No shame framing.** No "back to square one," no "Day 1 again," no guilt language.
- **No streak-reset mechanics.** Clean days are cumulative. A slip is logged but does not zero the counter. This is a brand rule, not a UX preference.
- **Identity-shift voice.** Frame quitting as "you're becoming someone who…" — not "you quit X days ago."
- **Named replacement rituals.** Breathlace necklace (hand-to-mouth + breath), Mullein gummies/refills (flavor). These are the products; mention them by name.
- **No clinical language, no fear imagery, no public leaderboards.**

If in doubt: warm, bounce-back, identity-forward. Never clinical, never punitive.

---

## Recent design decisions (for context)

The SOS modal was recently reworked:

1. **Removed** a "Need more support? 1-800-QUIT-NOW" hotline row. It didn't fit the brand voice or the paid-customer audience (they're already past the free-hotline stage of the funnel).
2. **Added** a subtle "I slipped — log it" link below the primary "Start guided breathing" CTA. It's a link (not a button) so it doesn't compete with the primary action — breathing is still what we push first, but a slipped user gets a one-tap path to the warm bounce-back flow instead of being forced through breathing they've already failed.

The SOS modal escalation ladder is now:
- **Primary:** Start guided breathing (coral gradient button)
- **Fallback:** I slipped — log it (link, visually subordinate)

The craving modal already has its own "I slipped" link at the bottom, so slips can be logged from either flow.

---

## Suggested next steps for the developer

These are not required — the dev will have their own opinions. Listed in rough priority order:

1. **Add a backend.** localStorage means a user loses everything if they clear their browser or switch devices. At minimum: account system + sync for `bf_state` and `bf_event_log`. Supabase or Firebase is fine; this is low-complexity data.
2. **Refactor out of single-file HTML.** Likely target: React or Svelte, one component per view. The inline structure is easy to read but will become unmanageable past ~150 KB.
3. **Wire analytics.** Currently zero visibility into where users drop off in onboarding, how often SOS fires, slip frequency, which rituals work. Posthog or similar, events already exist in `bf_event_log`.
4. **Push notifications for milestones and trigger-window reminders.** The trigger window is captured in onboarding but nothing currently fires on it.
5. **Design system extraction.** The color tokens are already CSS variables in `:root` — lift them into a shared token file during the refactor.
6. **Accessibility pass.** Contrast and tap targets are reasonable, but there's no proper ARIA, no focus management in modals, no reduced-motion respect on the animations.

---

## What NOT to touch without asking

- **The brand voice rules above.** These come from the client, not from product.
- **The no-streak-reset rule.** It's a brand rule; "streak resets on slip" is explicitly banned.
- **The product names.** Breathlace (not "breathing necklace"), Mullein refills (not "flavor pods").
- **The Netlify deploy URL** until a new one is ready to replace it.

---

## Contact

Project owner: Tam Le (agency). Client: BreatheFree.

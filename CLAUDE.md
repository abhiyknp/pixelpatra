# Pixelpatra: quick map for Claude

Read this first; open other files only when the task needs them. Owner-facing writing is plain, short English.

## What lives here
Pixelpatra sells immersive website templates (made in India, prices in ₹). Static HTML/JS, no framework.
- `index.html` — the store page (tearable pixel-sheet intro, live name/colour preview, template cards, Buy buttons).
- `how-it-works.html`, `faq.html`, `about.html`, `quote.html`, `terms.html`, `privacy.html`, `refunds.html`, `credits.html` — **generated**: edit `shared/templates.json` (templates, prices) or `shared/credits.json`, then run `python3 tools/make-pages.py` (also refreshes `index.html` between `<!--pp:...-->` markers). Don't hand-edit those blocks.
- `shared/` — `pp-config.js` (WhatsApp, email, payLinks: fill before launch), `pp-theme.js` (global theme), `pp-ui.js`, `pp-quote.js`, `pp-site.css`.
- `demo/index.html` — demo picker / full-screen live preview (deep links: `?demo=intros&opening=pour`, `?cat=ecommerce`).
- Templates (id → folder): `sample1` Sample_1 (gift shop, Owner view, see `LOCKED_SETTINGS.md`) · `house` House_3D_Prototype (Blender baked-light 3D house) · `oil` Sample_2 (scroll film) · `portfolio` Sample_3 (particles) · `ba` Sample_4 · `pixel` Sample_5 · `records` Sample_6 · `intros` kits/scroll-intros.
- `kits/theme-kit` — six themes as CSS vars + JSON. `previews/` — card images. `PHOTO_PROMPTS.md` + `tools/place-photos.py <folder>` — drop in real photos.
- `REVIEW.md` — latest QA review and open findings.

## Build, test, publish
```sh
sh tools/build-site.sh dist                     # whole site into dist/
sh Sample_1/tools/preview.sh &                  # per-template preview
node Sample_1/tools/test-flow.js                # also House_3D_Prototype/tools/test-flow.js, test-house.js
```
Push to `main` → `.github/workflows/pages.yml` builds with `build-site.sh` and deploys to GitHub Pages. Check pages at 1280 px and 390 px (iPhone): no console errors, no sideways scroll, 44 px tap targets, contrast AA.

## Rules
- Work on the session branch; never push to `main` without the owner's OK.
- Demo photos must be openly licensed and listed in `shared/credits.json`. AI footage is labelled as such.
- Keep heavy media lazy (3D lightmaps, films have desktop / phone / Lite versions): don't regress first-load size.

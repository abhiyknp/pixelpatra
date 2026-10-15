# Pixelpatra store site

The page opens under a tearable pixel sheet (swipe, tap, scroll, or it opens by itself after a moment). Visitors can type their name or business and pick a colour, and every template preview updates to show their own site.

One static page: `index.html` (no build step). Deploy by dragging this folder into Netlify Drop, or importing it on Vercel.

## Fill in before launch
At the bottom of `index.html`, in `CONFIG`:
- `whatsapp`: your number with country code, no + (for example `919876543210`).
- `payLinks`: Razorpay or Gumroad links per template. Until set, every Buy button opens WhatsApp with a prefilled order message.

Demo links: set `data-demo="https://..."` on each `<article class="card">`. Until set, View demo shows "coming soon".

## Animation demos
`animations.html` has four animation options to try (tear-open cloth intro, pixel-built previews, pinned browser tour, tear-off price tag). Pick the ones to bring into `index.html`.

## Intro prototypes
- `intro-search.html`: "Search yourself". The visitor searches their own name (or shop), sees the scattered results people find today, then sees their own site as the first result and taps it open.
- `intro.html`: the paper-and-wax-seal opening (earlier draft).

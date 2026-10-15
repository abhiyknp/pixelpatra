# Pixelpatra store site

One static page: `index.html` (no build step). Deploy by dragging this folder into Netlify Drop, or importing it on Vercel.

## Fill in before launch
At the bottom of `index.html`, in `CONFIG`:
- `whatsapp`: your number with country code, no + (for example `919876543210`).
- `payLinks`: Razorpay or Gumroad links per template. Until set, every Buy button opens WhatsApp with a prefilled order message.

Demo links: set `data-demo="https://..."` on each `<article class="card">`. Until set, View demo shows "coming soon".

## Animation demos
`animations.html` has four animation options to try (tear-open cloth intro, pixel-built previews, pinned browser tour, tear-off price tag). Pick the ones to bring into `index.html`.

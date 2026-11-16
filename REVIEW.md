# Pixelpatra review: functionality, UX, accessibility, speed

Checked on 16 Nov 2026 in headless Chromium (software 3D, a local server), desktop 1280 px and iPhone 13, on the store page, the
demo picker and the five templates. Times are comparisons, not real-world numbers: real phones, real networks, Safari and screen
readers still need a hand test.

## What works (verified)
- 7 pages x 2 sizes: **0 console errors, 0 failed requests, 0 sideways scrolling.**
- Existing end-to-end tests for the gift shop (cart, checkout, payment, order, sign-in, 3D room, Owner view) and the 3D house pass
  after the theme change.
- Category tabs filter correctly; the live preview opens, closes with Esc, returns focus to the card; "Get this template" jumps to
  the card's Buy button.
- Global theme: six round swatch buttons, saved in the browser, re-colour the store page, gift shop, 3D house, scroll openings, oil
  factory and portfolio (including the particle colours), and a template opens already in the chosen theme.
- Deep links keep the view: `demo/?demo=intros&opening=pour`, `?cat=ecommerce`.

## What makes it stand out
1. **Immersion is real, not decoration:** scroll-scrubbed film, particle name that reacts to the pointer and scatters into a
   galaxy, 3D house walk, scroll openings. Each is a different "wow" for a different kind of client.
2. **Try before you buy:** every card opens the live template full screen with a control bar (device, Owner view, theme,
   openings). A client uses the product, not a screenshot.
3. **Owner control without risk:** Owner view for day-to-day work, brand and tax details locked behind a verified request.
4. **One consistent system:** one theme, one picker, shareable links, phone-first.

## Found and fixed in this review
| Finding | Fix |
|---|---|
| Orange text and buttons failed contrast (2.8:1 to 3.1:1); WhatsApp button 3.1:1 | Accessible orange, dark text on orange, darker green. Store page now has 0 contrast failures |
| Live preview left the page behind it reachable by keyboard | Background made inert while open; focus returns to the card |
| No skip link | Added "Skip to the templates" |
| Demo picker had no heading | Added an h1 |
| Oil factory page moved 14 MB (hero and film each fetched the 7 MB scrub file) | Hero loops a 1.3 MB copy: 8.5 MB total |
| Theme worked only inside Scroll Openings | Global theme (see above) |

## Still open (ordered by value)
1. **3D house loads slowly:** about 4 s and 5.7 MB on the local server. On a phone network it will feel long. Needs a loading
   screen with progress, texture compression and lazy loading of the rooms.
2. **Oil film is 7 MB for scrubbing:** fine on Wi-Fi, heavy on mobile data. Add a data-saver choice (poster plus short loop) and a
   9:16 cut for phones.
3. **Small tap targets** inside the shop samples (many 24 to 31 px links). Raise to 44 px on touch screens.
4. **Opening kit:** two ARIA attribute errors and one low-contrast muted text.
5. **Scroll-scrubbed video on iPhone Safari** is not tested; seeking is slower there and may need an all-keyframe copy.
6. **Screen reader pass** (VoiceOver, NVDA) not done. The modal and the tabs follow the standard patterns but need a human check.
7. **No loading or empty states** on the store cards (screenshots appear when ready); add blur-up placeholders.
8. Real prices, real WhatsApp number and payment links are placeholders.

## Ideas that would make visitors stay longer
- A "build your look" moment on the store page: the visitor types a name, picks a theme, and the template previews show their
  name in their colours (the hero already has the name box; connect it to the cards).
- Pointer-follow spotlight and magnetic buttons on the cards; a short scroll-driven reveal for the category tabs.
- A guided tour mode in the live preview ("Next: Owner view") for client calls.
- A compare view (two templates side by side at phone size).

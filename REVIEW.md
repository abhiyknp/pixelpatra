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

## Open findings: round 2 (all but two now fixed)
| Finding | Result |
|---|---|
| 3D house heavy on first load | Candle-light maps and the whole bedroom now load quietly after the foyer is ready (1.3 MB moved out of the first load, 22% less). Looks identical once loaded (checked at the door, the bedroom and the lights-on moment). Light stays at zero in a room until its maps arrive, so nothing flashes black. On a real host, scripts and pages are also compressed, which my local server does not do. |
| Oil film heavy on mobile data | Three levels now: full film on desktop (8.5 MB), a narrow 9:16 cut on phones (4.3 MB), and **Lite mode** (six still frames, 0.9 MB). Lite turns on by itself on Data Saver and slow connections, and a button lets anyone switch it. |
| Small tap targets | On touch screens every control in the store page, picker, oil factory, portfolio and the shop samples is 44 px or has a 44 px hit area. Remaining: five dots in the oil film's chapter rail (hit area enlarged, the dot is still 9 px) and four inline "Read our story" links in the scroll openings. |
| Scroll openings: two ARIA errors and low-contrast muted price | Fixed. The page now passes the automated checks with no violations. |
| Scroll-scrubbed video on iPhone Safari | Not testable here. Phone cut uses a keyframe every second frame, which is what makes Safari seek smoothly. **Needs a real iPhone check.** |
| No loading state on store cards | Each card shows a blurred preview straight away and the sharp screenshot fades in. |
| Screen reader pass | **Needs a person** with VoiceOver or NVDA. See the checklist below. |
| Placeholder prices, WhatsApp number, payment links | **Need your real values** (`index.html` CONFIG and the card prices). |

### Hand-test checklist (10 minutes)
1. iPhone Safari: open the oil factory page, scroll the film; it should follow your finger without freezing. Try Lite mode.
2. VoiceOver or NVDA on the store page: tabs read as "Portfolio, tab, 1 of 5", the live preview announces as a dialog, Esc closes it.
3. Android Chrome with Data Saver on: the oil film should open in Lite mode by itself.
4. A slow connection (throttle to Slow 4G): the 3D house shows its poster and progress bar, then the walk.

## Ideas that would make visitors stay longer
- A "build your look" moment on the store page: the visitor types a name, picks a theme, and the template previews show their
  name in their colours (the hero already has the name box; connect it to the cards).
- Pointer-follow spotlight and magnetic buttons on the cards; a short scroll-driven reveal for the category tabs.
- A guided tour mode in the live preview ("Next: Owner view") for client calls.
- A compare view (two templates side by side at phone size).

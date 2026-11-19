# Pixelpatra go-live audit (19 Nov 2026)

Scope: the parent website (home, compare, request page, how it works, FAQ, about, legal, credits, 404, demo picker) and all 8 template demos, on desktop and on an iPhone-sized touch screen. Tested on Chromium (Playwright).

## Result in one line
Everything that can be tested here passes. Four real defects were found and fixed during the audit. Three things can only be confirmed by you (see the end).

## What was checked

| Area | How | Result |
|---|---|---|
| Links and files | Every link, image, script and style reference on 821 places in the built site | All resolve (the 7 reported are a demo form tag, `about:blank` and an unused opening) |
| Forms | Every field the scripts send is declared to Netlify for `quote` and `payment` | Match |
| Prices | Every price on every page against the one price file | All match, no stale prices |
| Pages (12 pages x desktop and phone) | Errors, failed requests, broken images, width, titles, descriptions, language, heading structure, tap sizes, field sizes | Clean |
| Accessibility | axe-core on all pages and all 8 demos (serious and critical) | Clean after fixes |
| Served as a root site (Netlify) and from a sub-folder (GitHub Pages) | Full page audit on both | Both clean, including the 404 page |
| iPhone Private browsing | Saving settings made to fail | Every page still works; a note is shown; request flow completes |
| Gift Shop | Cart, sign-in, checkout checks, UPI payment, order page, owner status changes, points, stock, finder, 3D sample room | Pass on desktop and phone |
| 3D House Shop | Walk-through at three positions, desktop and phone | No errors |
| Request page | 3 steps, package cards, live total, per-step checks, saved progress, estimate PDF and email, UPI QR (decoded and verified), reference form, non-Netlify fallback | Pass |
| Feature suites | 160 checks across 14 test files (name, theme, logo, tour, explorer, compare, clips, copy-link, offline, estimate, payment) | 160 pass, 0 fail |
| Security | No keys or passwords in the repository; Netlify security headers added; no build output tracked | Clean |

## Defects found and fixed during the audit
1. **Home page scrolled sideways on desktop.** A hidden colour input sat far off to the right. Fixed.
2. **Home page was wider than the screen on phones** (seven colour circles no longer fitted on one row). They now wrap.
3. **Every page was too wide on real phones.** A touch-target rule I added made hidden header links visible again, so phones zoomed out to fit. Fixed. My earlier width checks could not see this because the browser widens its own viewport; the audit now checks for that.
4. **Text links were too faint** (orange on white, 2.8 to 1; the standard needs 4.5 to 1). Links now use a darker colour that follows each theme.

Smaller fixes: tooltip and landmark accessibility, footer heading order, a Safari-prefixed blur for the pinned bar, solid fallbacks for the sticky header, longer private-browsing note, bigger tap targets, and contrast in three demos (Pixel Intros, Records Dashboard, Professional Portfolio).

## Cannot be tested here (needs you)
1. **Real Safari on a real iPhone.** WebKit is not available in this environment. The code avoids features older than iOS 16.2. The checklist is in GO_LIVE_CHECKLIST.md.
2. **Netlify email alerts and live form delivery.** They depend on your Netlify account. Steps are in GO_LIVE_CHECKLIST.md.
3. **A real UPI payment.** The QR code and link were decoded and checked, but only a real UPI app can confirm the payment screen on your phone.

## Known and accepted
- The compare table is wider than a phone and scrolls inside its own box by design.
- Text links 30 to 35 px wide are 44 px tall, which is fine for touch.
- The "unrevealed" items on the home page read as low contrast to a scanner until they scroll into view; once scrolled, the page has zero violations.
- WhatsApp, email and Instagram are intentionally empty and hidden. The UPI ID is public and includes a phone number, by your decision.

# Sample_1 · SAMPLE STUDIO shop prototype

A complete shop website with a placeholder brand. Show it to prospective clients, then re-brand a copy once a client pays.
Everything here is dummy: the name SAMPLE STUDIO, the logo, photos, products (Product One to Twelve in Collection A and B, plus
three gift sets), bundles, prices, text, journal articles, reviews, business details, email and social handles.

It is a prototype only: no domain, no database, no real payments or deliveries. Checkout, payment, order tracking,
points, gift cards and the Owner view all work in "demo mode", where every change stays in the visitor's own browser.

## What it includes

- Gift-shop home page: welcome offer, new arrivals, gift sets, ready-made bundles and the gift finder. (The 3D house
  walk-through is not part of this sample; it is kept in the Bud & Things prototype.)
- Shop by collection, product pages, search, the "Find your feeling" gift finder, Build a Bundle (two pieces at a saving)
- See it in your room (3D sample room, or the visitor's own photo)
- Cart and checkout with sign-in by emailed code (shown on screen in demo mode), gift options, coupons and points, and
  PIN code autofill of city and state
- Test payment screens (UPI, QR, card) with buttons to act out a successful or failed payment
- Order page, Track your order, customer account with orders and Studio Points
- Invoices from the Owner view (Orders → Make invoice): a tax invoice with CGST + SGST or IGST by state, or a bill of
  supply when GST is switched off, numbered per financial year, with Cancel (void) and Credit note, Print or save as PDF,
  and a spreadsheet download. The sample has GST on with a dummy GSTIN and business address
- Gift cards, share links, gift reminders, corporate and bulk enquiries, journal, Our Story, FAQ and policy page templates
- Owner view (`#admin`): orders (Packed → Shipped → Delivered, and a Delayed flag with a reason), invoices, products,
  bundles, stock, photos and videos, site text, settings, reviews, sign-ups, coupons with rules, rewards (give or take back
  points), gift cards and six colour themes

## Open it

There is no build step. Serve the folder with any static server and open `index.html`:

```sh
sh tools/preview.sh      # http://localhost:8765/
```

It can also be dropped into Netlify Drop or any static host as it is.

Once merged to `main`, `.github/workflows/sample-pages.yml` publishes it to GitHub Pages at
https://abhiyknp.github.io/pixelpatra/Sample_1/ (one-time setup: Settings → Pages → Source: GitHub Actions; Pages on a
private repository needs a paid GitHub plan).

## Re-brand it for a client

1. **Logo and images** in `assets/`: replace `logo-primary.webp` (and `logo-primary-reverse.webp` for dark backgrounds),
   `logo-wordmark.png`, `logo-icon.webp`, `monogram-seal.png`, `leaf.png`, the favicons and `share.jpg`.
   Keep the same file names and similar proportions. `pack-*.jpg` and `logo-photo.jpg` are "Sample photo" placeholders
   for the client's own photos.
2. **Name**: search and replace `SAMPLE STUDIO` / `Sample Studio` in `index.html` (including the `<head>` tags at the top)
   and `products3d.js`. Rename `Studio Points` and the `SS-` order prefix if wanted.
3. **Colours and fonts**: the six themes are CSS variables at the top of `index.html` (`:root[data-skin=…]`). The fonts are
   the Google Fonts link and the `--display` / `--body` variables.
4. **Products**: the `P` list in `index.html` (search for `let P = [`) holds names, descriptions, prices, sizes and variants.
   Rename "Collection A" and "Collection B" (search for both) to the client's own ranges. Bundles are in `PAIRINGS` just below. Product ids also appear in `SET_DEFAULTS` (featured, new in, spotlight).
5. **Text**: every line of copy is in `TEXT` in `index.html` (also editable later in Owner view → Site text). Lines that
   start with "Sample text", and the Our Story values, must be written for the client. Policy pages are templates to check.
6. **Contacts and business details**: `SET_DEFAULTS` in `index.html` (email, Instagram, Pinterest, WhatsApp, business name,
   address, GSTIN, GST switch and state, invoice prefix, HSN codes and GST rates, grievance officer). Have the client's
   accountant confirm the HSN codes and rates. All of these can also be changed in Owner view → Settings.
7. **Going live** (only when a client pays for a live shop): their own Supabase project and keys in `config.js`, their own
   Cashfree, Shiprocket and email-sending accounts, and their own domain. Those server parts are not in this sample.
8. **Check**: search the folder for `SAMPLE`, `Sample`, `Product One`, `Collection A`, `example.com`, `samplestudio` and `0000`
   (the dummy HSN codes). Nothing should be left.

The product pictures are drawn placeholder shapes (jars, columns, trays). The client's own photos replace them once
uploaded in Owner view → Photos & videos.

## Tests

With the preview running: `node tools/test-flow.js` (cart, checkout, payment, order, sign-in, sample room, Owner view and

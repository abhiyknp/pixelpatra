# Sample_2 · GOLDEN FIELD (sunflower oil sample)

A demo website for an oil maker, with a placeholder brand. It shows a prospective client what an immersive site looks
like for a factory that sells to homes, shops and dealers, not just a shop with a basket.

## What it has
- **Seed to bottle**: a scroll-driven film. Scrolling plays six scenes (field, sunflowers turning to the sun, seeds, the
  press, the oil, the bottle) built from real photos and video, with captions, a chapter rail, film grain and a canvas of
  falling seeds, dust and golden drops with a rising pool of oil. Scrolling back up rewinds it. Phones get the tall video
  versions. With "reduce motion" switched on, the scenes are shown one under another instead.
- **Order**: sample packs (1 L, 5 L, 15 L), quantity buttons, and a button that opens a WhatsApp message with the order.
- **Dealer enquiry**: a short form that opens a WhatsApp message to the factory.
- **Quality**: licence, lab report and batch number placeholders.
- **Credits**: author, licence and link for every photo and video (generated, see below).

It is a static page: no build step, no database. For payments, stock, invoices and the locked Owner view, use the
`Sample_1` shop as the base (see its README and LOCKED_SETTINGS.md).

## Open it
```sh
python3 -m http.server 8790      # in this folder, then open http://localhost:8790/
```

## Media
The photos and videos are openly licensed files from Wikimedia Commons (CC BY, CC BY-SA, CC0). They are fetched, shrunk
and credited by one script:

```sh
python3 tools/fetch-media.py
```

Wikimedia limits automated downloads, so the script waits between requests and stops at the first "too many requests";
run it again later and it carries on. Needs Python 3 with Pillow, ffmpeg and curl. Originals are kept in `.cache/` (not
committed). The script writes `assets/*.jpg`, `assets/*.mp4` and `assets/credits.js`.

CC BY and CC BY-SA require credit, so keep the credits list on the page. **A live client site should use the client's own
photos and films**; this free footage has nothing of real pressing or bottling, so those scenes use stills of oil mills and
bottles.

## Make it the client's
1. `config.js`: brand name, WhatsApp number (digits with country code), packs and prices.
2. `chapters.js`: the six scenes, their text and which media each uses (`portrait` is for tall screens).
3. Replace the files in `assets/` with the client's own, keeping the names, or change them in `chapters.js`.
4. Brand name and colours: search `GOLDEN FIELD` in `index.html`; colours are the CSS variables at the top.
5. Licences, lab reports and claims in the Quality section must be the client's real ones.

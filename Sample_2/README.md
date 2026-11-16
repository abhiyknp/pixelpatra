# Sample_2 · GOLDEN FIELD (sunflower oil sample)

A demo website for an oil maker, with a placeholder brand. It shows a prospective client what an immersive site looks
like for a factory that sells to homes, shops and dealers, not just a shop with a basket.

## What it has
- **Seed to bottle**: a scroll-driven film. Scrolling plays six chapters (field, sunflowers turning to the sun, seeds, the
  press, the oil, the bottle) from one realistic film clip, with captions, a chapter rail, film grain and a canvas of
  golden dust drifting over it. Scrolling back up rewinds it. With "reduce motion" switched on, the scenes are shown one under another instead.
- **Order**: sample packs (1 L, 5 L, 15 L), quantity buttons, and a button that opens a WhatsApp message with the order.
- **Dealer enquiry**: a short form that opens a WhatsApp message to the factory.
- **Quality**: licence, lab report and batch number placeholders.
- **Credits**: a short note on where the footage comes from.

It is a static page: no build step, no database. For payments, stock, invoices and the locked Owner view, use the
`Sample_1` shop as the base (see its README and LOCKED_SETTINGS.md).

## Open it
```sh
python3 -m http.server 8790      # in this folder, then open http://localhost:8790/
```

## The film
The film is one real clip, `assets/seed-to-bottle.mp4` (with a `.webm` fallback and a poster), made in Google Flow from the
prompts in [FLOW_PROMPTS.md](FLOW_PROMPTS.md): field, sunflower, seeds, press, oil and bottles in 8 seconds. Scrolling scrubs
it frame by frame (scrolling back rewinds it). `chapters.js` says which seconds of the clip each chapter owns (`time: [from, to]`)
and holds the captions. The hero plays the same clip on a loop.

To use a different film, replace the two files (keep them small: encode with a short keyframe gap so scrubbing is smooth,
`ffmpeg -i in.mp4 -an -vf scale=1280:-2 -c:v libx264 -crf 24 -g 3 -pix_fmt yuv420p -movflags +faststart seed-to-bottle.mp4`)
and adjust the `time` ranges. The host must support byte ranges (GitHub Pages, Netlify and Vercel do; `python3 -m http.server`
does not, so the film will not scrub there; use `npx serve` or similar to preview).

AI footage is a mood film, not a record of the client's factory. A live site should use the client's own film for the press
and bottling scenes. Wikimedia stills and a Pexels or Pixabay account were tried and are not used.

## Make it the client's
1. `config.js`: brand name, WhatsApp number (digits with country code), packs and prices.
2. `chapters.js`: the six chapters, their captions and which seconds of the film each shows.
3. Replace the film in `assets/` with the client's own (see above).
4. Brand name and colours: search `GOLDEN FIELD` in `index.html`; colours are the CSS variables at the top.
5. Licences, lab reports and claims in the Quality section must be the client's real ones.

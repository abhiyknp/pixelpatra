# Prompts for Google Flow (Veo): the "seed to bottle" intro

Seven short clips that play as the scenes of the scroll film in `index.html`. Make each clip 8 seconds, no people's faces,
no text or logos inside the video (generated text is unreliable; the site adds the words and the brand).

**Settings in Flow:** model Veo (Quality if you have it), 16:9 first. Then run the same prompt again at 9:16 for phones
(only the field clip needs a 9:16 version to start with). Generate 2 to 4 variations of each and pick the best.

## Master style (paste at the start of every prompt)

> Cinematic, photorealistic, shot on a full-frame cinema camera with a 35mm lens, shallow depth of field, natural warm
> golden-hour light, rich amber and green colour grade, subtle film grain, slow smooth camera movement, 24 fps, no text,
> no logos, no watermarks, no people's faces.

## The seven clips

**1. `field` (the field, 16:9) and `field-p` (same prompt at 9:16)**
> [Master style] A vast field of sunflowers in rural India at sunrise, thousands of golden flowers facing the rising sun,
> low mist over the rows, soft god rays through the haze. The camera glides slowly forward along a path between the rows,
> a few petals move in a light breeze. Warm, hopeful, epic.

**2. `sun` (the turn)**
> [Master style] Close-up of a single sunflower head against a clear sky, the flower slowly turns to follow the sun,
> petals backlit and glowing, tiny dust and pollen drifting in the light, a bee lands and walks across the seeds. Slow
> push-in, macro detail, golden rim light.

**3. `seeds`**
> [Master style] Extreme macro of black and grey striped sunflower seeds pouring slowly into a heap on a rough wooden
> surface, each seed catching the warm side light, a few husks tumbling, dust floating in the beam. Camera slowly tracks
> sideways. Tactile, rich texture.

**4. `press`**
> [Master style] Inside a traditional oil mill in India, seeds fall from a steel hopper into a slow rotating cold-press
> machine, warm light from a high window, steam and dust in the air, thick golden oil begins to ooze from the press into
> a steel tray. Workers' hands and arms only, no faces. Slow dolly-in, honest, handcrafted feel.

**5. `oil`**
> [Master style] Extreme macro of clear golden sunflower oil, a thick glossy stream pouring in slow motion into a pool,
> ripples spreading, tiny bubbles rising, sun flare flashing through the liquid, deep amber glow, black background
> falling away at the edges. Slow motion, ultra smooth, mouth-watering.

**6. `bottle`**
> [Master style] A clean modern factory line at dusk, empty clear glass bottles move along a conveyor and fill with
> golden oil one by one, caps are pressed on, warm backlight makes the oil glow, reflections on stainless steel,
> shallow depth of field. The camera tracks smoothly alongside the line. Precise, premium, calm. Blank labels.

**7. `finale` (optional hero shot)**
> [Master style] A single sealed bottle of golden sunflower oil with a plain cream label stands on a wooden kitchen
> counter in morning sun, a sunflower beside it, oil being drizzled onto fresh bread in the background, steam rising.
> Slow orbit around the bottle, crisp highlights, inviting.

## Negative prompt (if Flow shows the field)
`text, letters, logos, brand names, watermark, subtitles, distorted hands, extra fingers, cartoon, CGI look, oversaturated, flicker, jump cuts`

## Tips
- Make one clip, check it, then reuse its look: in Flow use **Frames to video** with a good still from clip 1 as the
  first frame of the next, or add it as an **Ingredient**, so the colour and light stay consistent.
- If the oil looks like water, add "thick, viscous, translucent amber". If it looks fake, add "real photograph, documentary".
- Keep camera moves simple: one slow push, glide or orbit per clip. Complex moves distort.
- Say the setting is India if the client sells there: it changes the fields, the mill and the light.
- AI footage is not a real record of the factory. For a live site, use the client's own photos and film for the press
  and bottling scenes, and use the AI clips for mood.

## What to do with the clips
Download as MP4, name them exactly as above (`field.mp4`, `field-p.mp4`, `sun.mp4`, `seeds.mp4`, `press.mp4`,
`oil.mp4`, `bottle.mp4`), and put them in `Sample_2/assets/`. Keep each under about 25 MB (Flow's 720p download is fine).
`tools/fetch-media.py` makes posters and web-size copies of anything it fetches; for your own clips run
`ffmpeg -i in.mp4 -an -vf scale=1280:-2 -c:v libx264 -crf 27 -movflags +faststart assets/NAME.mp4`.

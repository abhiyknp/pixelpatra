// The six scenes of the seed to bottle film. Media files are made by tools/fetch-media.py.
// `portrait` is used instead of `src` on tall (phone) screens. Text is sample text for the client to replace.
window.STORY_CHAPTERS = [
  { rail: 'The field', eyebrow: '01 · The field', h: 'Grown for <em>the sun</em>', p: 'Sample text: where the seed is grown and the farmers who grow it.', fx: 'none',
    media: [{ type: 'video', src: 'assets/field.mp4', portrait: 'assets/field-p.mp4', poster: 'assets/field-poster.jpg' }] },
  { rail: 'The turn', eyebrow: '02 · The turn', h: 'Always facing <em>the light</em>', p: 'Young sunflowers turn to follow the sun across the sky. Sample text: the season, the soil, the care.', fx: 'none',
    media: [{ type: 'video', src: 'assets/sun.mp4', poster: 'assets/sun-poster.jpg' }] },
  { rail: 'The seed', eyebrow: '03 · The seed', h: 'Every head holds <em>hundreds of seeds</em>', p: 'Sample text: how the seed is chosen, cleaned and sorted before it is pressed.', fx: 'seeds',
    media: [{ type: 'image', src: 'assets/seeds.jpg' }, { type: 'image', src: 'assets/seeds2.jpg' }] },
  { rail: 'The press', eyebrow: '04 · The press', h: 'Pressed <em>slowly</em>, so the taste stays', p: 'Sample text: your pressing method and temperature. Say only what the factory can prove.', fx: 'dust',
    media: [{ type: 'image', src: 'assets/mill.jpg' }, { type: 'image', src: 'assets/press.jpg' }] },
  { rail: 'The oil', eyebrow: '05 · The oil', h: 'Clear, golden, <em>settled</em>', p: 'Sample text: filtering, settling and the lab test on every batch.', fx: 'drops',
    media: [{ type: 'video', src: 'assets/oil.mp4', poster: 'assets/oil-poster.jpg' }] },
  { rail: 'The bottle', eyebrow: '06 · The bottle', h: 'Filled, sealed, <em>numbered</em>', p: 'Sample text: pack sizes, and the batch number that traces each bottle to its pressing day.', fx: 'dust',
    media: [{ type: 'image', src: 'assets/bottle.jpg' }] }
];

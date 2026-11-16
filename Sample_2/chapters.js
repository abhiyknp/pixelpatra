// The film is one real clip (assets/seed-to-bottle.mp4, made in Google Flow from the prompts in FLOW_PROMPTS.md).
// Scrolling scrubs it; each chapter owns a slice of the clip, `time: [from, to]` in seconds.
// Captions are sample text for the client to replace.
window.STORY_FILM = { mp4: 'assets/seed-to-bottle.mp4', webm: 'assets/seed-to-bottle.webm', hero: 'assets/seed-to-bottle-hero.mp4', mp4p: 'assets/seed-to-bottle-p.mp4',
  stills: ['assets/still-1.jpg', 'assets/still-2.jpg', 'assets/still-3.jpg', 'assets/still-4.jpg', 'assets/still-5.jpg', 'assets/still-6.jpg'], poster: 'assets/seed-to-bottle-poster.jpg', length: 7.85 };
window.STORY_CHAPTERS = [
  { rail: 'The field', eyebrow: '01 · The field', h: 'Grown for <em>the sun</em>', time: [0, 1.0],
    p: 'Sample text: where the seed is grown and the farmers who grow it.' },
  { rail: 'The turn', eyebrow: '02 · The turn', h: 'Always facing <em>the light</em>', time: [1.0, 3.0],
    p: 'Young sunflowers turn to follow the sun across the sky. Sample text: the season, the soil, the care.' },
  { rail: 'The seed', eyebrow: '03 · The seed', h: 'Every head holds <em>hundreds of seeds</em>', time: [3.0, 3.9],
    p: 'Sample text: how the seed is chosen, cleaned and sorted before it is pressed.' },
  { rail: 'The press', eyebrow: '04 · The press', h: 'Pressed <em>slowly</em>, so the taste stays', time: [3.9, 4.7],
    p: 'Sample text: your pressing method and temperature. Say only what the factory can prove.' },
  { rail: 'The oil', eyebrow: '05 · The oil', h: 'Clear, golden, <em>settled</em>', time: [4.7, 6.6],
    p: 'Sample text: filtering, settling and the lab test on every batch.' },
  { rail: 'The bottle', eyebrow: '06 · The bottle', h: 'Filled, sealed, <em>numbered</em>', time: [6.6, 7.85],
    p: 'Sample text: pack sizes, and the batch number that traces each bottle to its pressing day.' }
];

# Realistic photos for every placeholder: prompts and where they go

Generate these in Google Flow / Imagen (or any image tool), save as JPEG, then run `python3 tools/place-photos.py <folder>`;
it resizes each file to the right size, copies it to every template that uses it and updates the photo list. Nothing else to edit.

**Master style (start every prompt with this):**
> Professional product photography, soft natural window light from the left, shallow depth of field, warm neutral palette of ivory, sand and terracotta, clean uncluttered styling, realistic textures, sharp focus, photographed on a full-frame camera with an 85mm lens. No text, no logos, no watermark, no people's faces.

File names must match exactly. Aspect ratios are given; the tool crops to fit.

## Gift shop (Sample_1, 3D House, Scroll Openings share these)

### Products (square 1:1) → `products/<id>.jpg`
| File | Prompt (after the master style) |
|---|---|
| `product-01.jpg` | A hand-poured scented candle in a frosted glass jar with a plain cream label and a wooden lid, on a pale linen cloth |
| `product-02.jpg` | A scented candle in a matte terracotta ceramic jar, lit, soft glow, dried botanicals beside it |
| `product-03.jpg` | A scented candle in an amber glass jar with a brass lid, lit, on a dark oak shelf |
| `product-04.jpg` | A large two-wick candle in a clear glass vessel with a white label, on a marble tray |
| `product-05.jpg` | A small travel candle in a tin with a sliding lid, held open, olive green |
| `product-06.jpg` | A tall ivory pillar candle on a small ceramic dish, unlit, with a matchbox |
| `product-07.jpg` | A hand-made jesmonite tray, speckled off-white, round, with two small objects on it |
| `product-08.jpg` | A small round ceramic trinket dish, glazed sand colour, holding a ring and a tiny key |
| `product-09.jpg` | An arch-shaped jesmonite tray, terracotta, with a candle and a dried flower |
| `product-10.jpg` | A set of smooth jesmonite pebbles in soft pastel colours, in a shallow bowl |
| `product-11.jpg` | A small freestanding jesmonite arch ornament, cream, on a console table |
| `product-12.jpg` | A hand-made round jesmonite plate, speckled sage green, on a wooden table |
| `gift-set-small.jpg` | A small kraft gift box with ribbon, a candle and a card, opened |
| `gift-set-medium.jpg` | A medium gift box with a candle, a trinket dish and tissue paper, ribbon tied |
| `gift-set-large.jpg` | A large gift hamper box with two candles, a tray and dried flowers, ribbon tied |

### Packaging and brand (these replace the grey "SAMPLE PHOTO" pictures) → `pack-*.jpg`
| File | Ratio | Prompt |
|---|---|---|
| `pack-box.jpg` | 3:2 | A closed ivory gift box tied with a terracotta ribbon on a linen surface |
| `pack-card.jpg` | 2:3 | A blank cream care card with deckled edges leaning against a candle jar (no writing) |
| `pack-jar.jpg` | 3:2 | A candle jar with a blank cream label, lid beside it, on a wooden shelf |
| `pack-leather.jpg` | 3:2 | A blank tan leather label embossed with nothing, stitched, on linen |
| `pack-pouch.jpg` | 3:2 | A natural linen drawstring pouch with tissue paper and a sprig of dried flowers |
| `pack-seal.jpg` | 3:2 | Three wax seals in terracotta, olive and burgundy on cream paper, blank (no marks) |
| `pack-tag.jpg` | 1:1 | A kraft paper hang tag with twine on a linen cloth, blank |
| `logo-photo.jpg` | 16:9 | A styled flat lay of candles, a tray, dried flowers and ribbon on a linen backdrop, room to place a logo in the centre |

## Portfolio (Sample_3) → `Sample_3/assets/p1.jpg` … `p6.jpg` (4:3)
| File | Prompt |
|---|---|
| `p1.jpg` | Brand identity for a neighbourhood tea stall: kraft cups, menu board and stamp on a wooden counter, warm morning light |
| `p2.jpg` | A design studio desk with a large monitor showing an abstract website layout, sketchbook and plants, calm daylight |
| `p3.jpg` | A grocery website shown on a tablet beside a basket of fresh vegetables on a kitchen table |
| `p4.jpg` | An Indian wedding invitation card with marigold flowers and gold foil on a silk cloth, no readable names |
| `p5.jpg` | A developer's laptop showing a dark, colourful product launch page, on a desk with a coffee, evening light |
| `p6.jpg` | A bright art gallery wall with framed prints, a bench, and a visitor seen from behind |

## Sunflower oil factory (Sample_2) → `Sample_2/assets/pack-1l.jpg`, `pack-5l.jpg`, `pack-15l.jpg` (4:3)
| File | Prompt |
|---|---|
| `pack-1l.jpg` | A clear 1 litre bottle of golden sunflower oil with a plain cream label, a sunflower beside it, soft backlight |
| `pack-5l.jpg` | A 5 litre plastic can of golden sunflower oil with a plain cream label, kitchen counter background |
| `pack-15l.jpg` | A 15 litre square tin of sunflower oil with a plain cream label, stacked in a clean warehouse |

## Tips
- Ask for 4 variations of each and keep the best; keep the lighting the same across a set.
- If a prompt makes text appear, add "no text, no letters" again or retry. Labels should stay blank: the brand name is added by the site.
- AI photos are fine for demos. For a client's live shop, use their own product photos; the file names stay the same.

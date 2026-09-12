# Jewellery capture standard

How to shoot a rental set so it needs no fixing afterwards.

There is a designed version of this document, easier to hold while shooting:
<https://claude.ai/code/artifact/48f3730c-4360-46e4-9b86-de7ab179f46c>

---

## Why this exists

The current catalogue cannot be composited onto a clean backdrop, and no amount
of processing will change that. **A black velvet bust on a black velvet ground
is not separable** — the two overlap in tone, so software has nothing to cut
along.

Every figure below was measured from the 133 files in
`content/rental-incoming/`, not estimated.

- **The bust is darker than the background, not lighter.** Sampling the upper
  bust against the frame corners: `-7.4` on `temple-s1001`, `-12.3` on
  `temple-s3020`. No threshold separates them consistently, in either
  direction. `rembg` confirms it independently — the model segments the
  jewellery and never finds the bust.
- **Framing varies wildly.** Aspect ratios run `0.44` to `2.24` — portrait sets
  and sideways flat-lays in one catalogue. 14 images are landscape.
- **Resolution is short.** The largest file is `1500x2000`. A `2160x2700`
  catalogue canvas would upscale every single image.
- **A quarter of the sets carry no gold.** 35 of 133 are rhodium or silver with
  white, blue or green stones. Anything tuned for warm gold does nothing for
  them, so white balance has to be right in camera.

---

## The one change

Put a **mid-grey sweep** behind the same black velvet bust. Nothing else in the
set-up changes — same bust, same base, same jewellery, same room.

Grey sits roughly 40–50 levels above the velvet, which is more separation than
any edge in the current files. The bust then cuts out cleanly, and the backdrop
behind it can be made emerald, ivory or anything else later, without
re-shooting.

**Not green.** Shooting directly onto green looks finished on the day, but it
locks the colour in permanently and spills green onto the gold. Grey keeps the
decision reversible.

---

## Lighting

Two soft sources and one reflector, seen from above:

```
              mid-grey sweep — 1.5–2 m wide, curved, no crease
        ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌

   ┌──────────┐                              ┌──────────┐
   │   key    │ ──── 45° · 0.8 m ────▶  ◀──── │   fill   │  −1 stop
   └──────────┘            ( bust )           └──────────┘
                              │
                        white card  (lifts the base)
                              │
                      ┌──────────────┐
                      │    camera    │  square on, lens at necklace height
                      └──────────────┘
                         tripod, taped mark
```

The key sets the modelling on the gold. The fill only stops the right side
going black. **The white card is the piece most often left out** — without it
the gold base and the lowest drops of a haram fall into shadow.

### Why soft, and why 45°

Antique gold is hundreds of small curved facets. A bare bulb or an on-camera
flash puts a single hard specular dot on each one, which reads as glare and
hides the filigree. A large soft source wraps the facets so each carries a
gradient instead — and that gradient is what makes the detail legible.

Straight-on light flattens. Past about 60° the relief turns to harsh texture.
Forty-five degrees is where depth appears without the surface breaking up.

---

## Camera settings

Set once, then do not touch for the whole session. Consistency across the
catalogue matters more than any individual frame.

| | | |
|---|---|---|
| Resolution | `2400x3000` or larger | Gives a native 4:5 crop at 2160x2700 with room to straighten. Today's max is 1500x2000. |
| Aspect | 4:5 **portrait** | Every frame, including short chokers. Never rotate the camera. |
| Format | RAW + JPEG | RAW lets WB and exposure be corrected without damage. |
| Focal length | 50–85 mm equivalent | Wider bows the necklace at the edges; longer needs more room than most spaces have. |
| Aperture | f/8 – f/11 | A full set is several cm deep from choker to haram. Wider and the lowest pendant goes soft. |
| ISO | base — 100 or 64 | Noise in dark velvet forces denoising, and denoising softens the filigree. |
| Shutter | whatever the meter says | Free on a tripod. Use a 2-second timer. |
| White balance | fixed Kelvin, from a grey card | **Never auto.** Auto shifts between a gold set and a silver set and the catalogue stops matching. |
| Focus | single point on the centre pendant | Then switch to manual so it cannot re-focus between sets. |
| Exposure | brightest gold ≈ 235, never 255 | A blown highlight has no detail to recover. Watch the histogram, not the screen. |

---

## Setting up, in order

Steps 1–4 happen once per session. Steps 5–6 repeat per set.

1. **Hang the sweep and lose the crease.** Curve it from wall to table so there
   is no visible corner. A crease catches light and appears behind every set.
2. **Place the bust and tape the base.** At least 50 cm between bust and sweep,
   so light on the backdrop is controlled separately from light on the
   jewellery. Tape the base position to the table.
3. **Set the camera and tape the tripod feet.** Lens at the height of the main
   necklace, square to the bust. Mark the floor. Every set is shot from this
   exact spot — that is what makes the grid uniform.
4. **Light it, then shoot a grey card.** Key, fill, white card. One grey-card
   frame sets white balance for the session. Re-shoot it if any light moves.
5. **Dress the set inside the frame.** Necklace on the bust, earrings on their
   stands either side, belt below the base. **Check all four in the viewfinder
   before shooting** — a belt that runs out of frame cannot be recovered.
6. **Shoot three, check the histogram, move on.** Three frames costs nothing and
   covers a knocked stand or soft focus.

---

## Naming

Files drop into `content/rental-incoming/` and the prefix decides which room the
set lands in. Anything with another prefix is skipped rather than filed wrong.

| prefix | room |
|---|---|
| `temple-` | Temple Jewellery |
| `ad-` | American Diamond |
| `choker-` | Choker & Necklace |
| `worn-` | On the Bride — client photographs, never composited |

Keep the supplier's stock code in the filename if it helps you track inventory.
`npm run import:rental` renames everything to a descriptive public name and
writes the alt text from `scripts/rental-names.mjs`, so the code never reaches
the website.

---

## What goes wrong

Each of these is a defect found in the existing 133, not a hypothetical.

- **Black on black.** The bust disappears into the ground and the set cannot be
  cut out. This is the whole reason for the spec.
- **Rotating the camera for wide sets.** 14 sets were shot landscape. They
  cannot join a portrait grid without upscaling — one by 1.6x.
- **Coloured cloth in frame.** Maroon under one set, blue under the next. It
  shows, and it differs from set to set.
- **Auto white balance.** Warm on gold, cool on silver; the catalogue stops
  looking like one catalogue.
- **Belt or earrings at the frame edge.** Nothing can be added back that was
  never captured.
- **Direct flash.** Hard speculars on every facet; filigree turns to glare.
- **Moving the tripod between sets.** Scale drifts and the grid stops lining up.

---

## Before you pack up

- [ ] Every frame is portrait 4:5, from the same taped mark.
- [ ] Necklace, earrings and belt fully inside the frame on every set.
- [ ] Histogram touches neither end — no clipped gold, no crushed velvet.
- [ ] The bust reads clearly lighter or darker than the sweep behind it.
- [ ] One grey-card frame exists for the session, and again after any light moved.
- [ ] Filenames carry the right prefix.
- [ ] At least one silver set was checked — they expose differently from gold.

---

## If there is no studio kit

A recent phone on a tripod, in open shade or beside a north-facing window with a
white sheet as a bounce, will beat a badly lit camera. Shoot in the pro or RAW
mode so white balance can be locked, use the 2x lens rather than the wide (which
bows the necklace), and tape the phone's position exactly as you would a tripod.

What a phone cannot give you is depth of field across a deep set at close range,
or clean shadow detail in black velvet. Both show up as softness in the
filigree. It is a good stopgap and a poor standard.

---

## The pipeline this replaces

`enhance_jewelry.py` compensates for the capture: it blends the existing
photographs onto a generated emerald backdrop because it cannot cut them out.
Sets shot to this standard need none of it — they can be composited properly, at
any backdrop colour, with the bust intact.

Run `python enhance_jewelry.py --test` to see the current compromise; the
config block at the top of that file documents every parameter and why it is set
where it is.

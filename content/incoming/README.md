# Drop Lana's approved photographs here

Then run:

```bash
npm run import:portfolio
```

## Naming decides the category

| Filename prefix | Category |
|---|---|
| `ritual-01-` … `ritual-08-` | ritual (ORDERED — see below) |
| `bridal-` `muhurtham-` `wedding-` `saree-` `jewel-` | bridal |
| `reception-` | reception |
| `engagement-` `nischayam-` | engagement |
| `hair-` `jadai-` `braid-` `bun-` `jasmine-` | hair |
| `editorial-` `hd-` `natural-` | editorial |
| `bts-` `behind-` `atelier-` `kit-` | behind-scenes |
| `beforeafter-` `transformation-` | before-after |
| `party-` `occasion-` | other |

### The ritual frames — the one ordered set

`ritual-01-…` through `ritual-08-…` fill the homepage's transformation
sequence, in that order:

| Prefix | Stage | Ratio |
|---|---|---|
| `ritual-01-` | The Face | 3:4 |
| `ritual-02-` | The Skin | 3:4 |
| `ritual-03-` | The Eyes | 3:4 |
| `ritual-04-` | The Hair | 3:4 |
| `ritual-05-` | The Jasmine | 3:4 |
| `ritual-06-` | The Gold | 3:4 |
| `ritual-07-` | The Silk | 3:4 |
| `ritual-08-` | The Bride | 3:4 |

**One bride, one camera position, registered on the eyes.** These eight frames
are the only slot on the site that is never filled from another category. Every
other slot borrows from a neighbouring pool when its own is empty; this one
keeps its placeholder plate instead, because the section's whole claim is that
these are eight moments of the same morning on the same woman. A frame of a
different bride would quietly make that a lie.

Any index you do not supply keeps its plate. Supplying only four is fine.

Examples:

```
bridal-01.jpg
muhurtham-gold-drape.jpg
hair-jadai-02.jpg
reception-evening-01.jpg
bts-morning-kit.jpg
```

Descriptive filenames become readable titles: `hair-jadai-02.jpg` → "Hair Jadai".

## What happens

1. EXIF is stripped (camera, GPS and personal metadata removed).
2. An optimised WebP (max 2000px) and a 640px thumbnail are written to `public/portfolio/`.
3. A real blur placeholder is generated from each photograph.
4. `src/content/portfolio/portfolio.json` is written.
5. The site starts using the photographs everywhere — homepage, portfolio, services, hair, journal covers — automatically.

## Curation

Edit `src/content/portfolio/portfolio.json` to change `title`, `alt`, `category`,
`featured`, `published` or `sortOrder`. **Re-running the import preserves every
one of those edits.** Only `published: true` items appear on the site.

## Originals

Files in this folder are inputs only — they are never served. You can keep them
here or delete them once imported.

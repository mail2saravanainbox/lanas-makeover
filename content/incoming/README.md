# Drop Lana's approved photographs here

Then run:

```bash
npm run import:portfolio
```

## Naming decides the category

| Filename prefix | Category |
|---|---|
| `bridal-` `muhurtham-` `wedding-` `saree-` `jewel-` | bridal |
| `reception-` | reception |
| `engagement-` `nischayam-` | engagement |
| `hair-` `jadai-` `braid-` `bun-` `jasmine-` | hair |
| `editorial-` `hd-` `natural-` | editorial |
| `bts-` `behind-` `atelier-` `kit-` | behind-scenes |
| `beforeafter-` `transformation-` | before-after |
| `party-` `occasion-` | other |

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

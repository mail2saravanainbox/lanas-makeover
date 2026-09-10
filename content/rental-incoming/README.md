# Rental jewellery — staging

Drop approved jewellery photographs here and run:

```
npm run import:rental
```

**Name each file `<category>-<anything>.<ext>`.** The prefix decides which room
it lands in, and must be one of the keys in `src/content/rental-categories.ts`:

| prefix   | room                  |
|----------|-----------------------|
| `temple` | Temple Jewellery      |
| `ad`     | American Diamond      |
| `choker` | Choker & Necklace     |
| `worn`   | On the Bride          |

Anything with another prefix is skipped and named in the output, rather than
being filed somewhere wrong and quietly published.

## Nothing in this folder is committed

Only the optimised WebPs the script writes to `public/rental/` are. This folder
held 432 MB of extracted catalogue pages during the first import; 452 MB of
PDFs in this repository once failed GitHub's 100 MB limit and then Vercel's.

## Before you add anything

Check the photograph is **ours to publish**. Three frames from the first import
were dropped for exactly this: two carried another business's watermark across
the image, and one was a photograph of a shop display case with price tags and
other people's stock on the shelves. No amount of editing makes those
publishable.

Check too that there is **no stock code** burned into it. The first 133 all
carried one — bold white type in an inconsistent corner — and they were painted
out before import. The test suite fails the build if one reaches a page.

# Comp imagery

Drop image files here, then run:

```bash
npm run comp:import
```

Every plate on the site is replaced by whatever is in this folder, and the
filename prefix decides which slot each image lands in — the same table the
real pipeline uses, in `content/incoming/README.md`:

| Prefix | Where it lands |
|---|---|
| `hero-` | the opening frame |
| `ritual-01-` … `ritual-08-` | the eight frames of the ritual, in order |
| `tamil-` `muhurtham-` | Tamil bridal / muhurtham collections |
| `reception-` `engagement-` | those collections |
| `hair-` `jadai-` | hair and the silhouette sequence |
| `editorial-` | the material close-ups |
| `bts-` | behind the scenes, and the artist's working shot |

Anything not matching a prefix is filed as `other` and still appears in the
archive.

## What this folder is not

It is **not** a source of imagery for the real site. Files here are stand-ins
for a presentation. `content/incoming/` is where Lana's own photographs go, on
the `redesign` branch, and that is the only imagery that ever reaches a bride.

This folder is gitignored — the originals stay on whoever's machine is running
the pitch. The optimised WebPs the import writes into `public/portfolio/` ARE
committed, because Vercel builds from git and cannot serve what is not there.
That is the only place comp imagery lives in the repo, and it lives on this
branch only.

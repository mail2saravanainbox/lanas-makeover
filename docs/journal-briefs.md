# Journal briefs

Six posts are published. These are the next twelve, as **briefs** rather than
drafts — an outline, the query it answers, the internal links it should carry,
and the one thing it must not claim.

They are briefs on purpose. Every one of them could be written today by
inventing the specifics, and every one would be worse for it: the value in this
journal is that it says things only someone who does the work knows, and those
are Lana's to supply. Where a brief needs a fact from her, it says so.

**How to use one.** Answer the ⟨questions⟩, then write it into
`src/content/journal/posts.ts` in the same shape as the existing six. Set
`published: true` only when the ⟨questions⟩ are gone.

---

## Priority 1 — the queries the site can already almost answer

### 1. What time does bridal makeup start on the wedding morning?
**Query:** "what time should bridal makeup start", "bridal makeup timing muhurtham"
**Why now:** The single most-asked practical question, and the site already has
the answer structure in `timeline.ts` — the morning is timed *backwards* from
the muhurtham, not forwards from an alarm.
**Outline:** the backwards principle · what fixes the end time (muhurtham,
photographer, the drive) · what stretches the middle (hair before makeup or
after, how many other faces) · why a 5 a.m. ceremony is a different commission
from an 11 a.m. one · the three things to send with an enquiry.
**Links out:** `/locations/chennai` (the distance-changes-the-schedule case),
`/services/muhurtham`, `/contact`.
**Must not claim:** a specific number of hours. ⟨how long does a full
traditional bridal look actually take, hair included?⟩

### 2. Bridal makeup for a temple wedding
**Query:** "temple wedding makeup", "madurai temple wedding bridal makeup"
**Why now:** `/locations/madurai` opens this subject and cannot finish it.
**Outline:** three light sources in one room (lamp, doorway, flash) · why a
heavy base fails under flash specifically · the neck-and-face line in
photographs · humidity and an open venue · what "traditional register" actually
means as a set of decisions.
**Links out:** `/locations/madurai`, `/bridal`, `/portfolio/muhurtham`.
**Must not claim:** any named temple, or that Lana has worked at one.

### 3. What to tell your makeup artist before the wedding
**Query:** "what to tell bridal makeup artist", "bridal makeup consultation questions"
**Why now:** Directly improves enquiry quality, which is the site's job.
**Outline:** the date and the muhurtham *time* · the city and the venue · every
event, not just the ceremony · how many faces besides the bride · allergies and
sensitivities · the saree and the jewellery · photographs of what you like
*and* what you do not.
**Links out:** `/contact`, `/faq`, `/services`.
**Must not claim:** what happens after you send it beyond what the site already
says. ⟨how soon does a bride actually hear back? the site currently promises
nothing.⟩

### 4. Makeup for the bride's mother and sisters
**Query:** "family makeup for wedding", "guest makeup wedding tamil nadu"
**Why now:** `party-transformation` is a real service with no editorial behind
it, and `/locations/pudukkottai` raises it.
**Outline:** why the number of faces changes the whole morning's order · a
mother's look is not a younger version of the bride's · guest makeup in
photographs that will be looked at for fifty years · what to ask for.
**Links out:** `/services/party-transformation`, `/locations/pudukkottai`.
**Must not claim:** group pricing, or a maximum number. ⟨how many people can be
accommodated in one morning, and does it need a second pair of hands?⟩

---

## Priority 2 — depth on what the site already sells

### 5. Reception makeup: the second face
**Query:** "reception makeup look", "wedding reception makeup south indian"
**Outline:** evening light versus lamp light · why the eye carries a reception
look · continuity as a deliberate decision · when it is a fresh application and
when it is a rebuild.
**Links out:** `/services/reception`, `/locations/chennai`, `/portfolio/reception`.

### 6. Engagement makeup, and why it is really a rehearsal
**Query:** "engagement makeup look", "engagement vs wedding makeup"
**Outline:** the first time she is photographed as a bride-to-be · deliberately
less finished · what it reveals about the wedding look · restraint as the point.
**Links out:** `/services/engagement`, `/journal/the-bridal-makeup-trial`.

### 7. How to choose bridal jewellery your makeup can live with
**Query:** "bridal jewellery and makeup", "heavy gold bridal makeup"
**Outline:** weight and placement compete with a face · structure not more
product · the maang tikka and the hairline · when to see the jewellery before
the trial.
**Links out:** `/locations/madurai`, `/bridal`, `/services/bridal-hair`.

### 8. Saree draping and the bridal silhouette
**Query:** "bridal saree draping", "who drapes the bridal saree"
**Outline:** the drape decides the silhouette as much as the hair · pleat depth
and pallu height in photographs · why a saree pinned in a hurry undoes a
morning · when it is done relative to hair and makeup.
**Links out:** `/services/muhurtham`, `/services/bridal-hair`.
**Must not claim:** ⟨is draping included in a bridal booking or charged
separately? The FAQ currently cannot answer this.⟩

---

## Priority 3 — long tail, written once, useful for years

### 9. Bridal makeup in the Tamil wedding calendar
**Query:** "muhurtham dates 2027", "tamil wedding season makeup booking"
**Outline:** why the season concentrates · what "peak" means for availability ·
booking early as a practical matter, not a sales line.
**Note:** needs a factual calendar source, refreshed annually. Do not publish a
date list that will silently go stale — link to a maintained almanac instead.

### 10. Skin that photographs well: a realistic 90 days
**Query:** "bridal skin care before wedding", "bridal skin prep timeline"
**Note:** extends the published 30-day post rather than repeating it. Only write
this if there is genuinely more to say — a second post that overlaps the first
splits the ranking of both.
**Must not claim:** any product, brand, treatment or dermatological advice.

### 11. What "HD makeup" actually means
**Query:** "what is HD makeup", "hd makeup vs normal makeup"
**Note:** the published register post touches this. Write it only as the
technical explainer the register post deliberately is not — how a camera sees a
base, what changed when video became standard at Indian weddings.

### 12. A bride's own kit: what to have in the room
**Query:** "bridal touch up kit", "what to carry wedding day makeup"
**Outline:** blotting, not powder · the lip that has to survive lunch · pins ·
what to hand to whoever is holding your bag.
**Links out:** `/faq`, `/services/muhurtham`.

---

## Rules for all of them

1. **No invented facts.** No years, counts, awards, prices, venues or reviews.
   Where a brief needs one it is marked ⟨like this⟩ — answer it or cut the
   paragraph.
2. **One post, one query.** Two posts chasing the same phrase split the
   ranking of both. Check the published six before starting.
3. **Link out, three or four times, to a page that can convert.** A journal
   post that links nowhere is a dead end with good intentions.
4. **The internal links matter more than the word count.** A 700-word post
   linked from three places beats a 2,000-word post linked from none.
5. **`seo.title` is not `title`.** The post shape carries both: the editorial
   headline a reader sees, and the search title. The existing six show how.
6. **Publish nothing with a ⟨marker⟩ in it.** The FAQ renders these as nothing
   in production, but the journal does not — and a note to the client on the
   client's own website is the exact bug Phase 1 of the mobile audit removed.

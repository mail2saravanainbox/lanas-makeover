import type { BlogPost } from "@/lib/types";
import { citiesProse } from "@/content/site";

/**
 * THE LANA JOURNAL
 *
 * Editorial + SEO surface. Bodies use a small markdown subset rendered by
 * `components/journal/ArticleBody.tsx`:
 *   ##  heading      >  pull quote      -  list item      **bold**  *italic*
 *
 * Articles are advisory and factual. None of them claims anything about Lana's
 * training, clientele, results or pricing.
 *
 * ── ON LOCATION CONTENT (§21, §22) ──────────────────────────────────────────
 * The brief lists a separate article per service city. There is exactly one
 * here instead, and deliberately: four near-identical pages differing only in
 * a city name is the doorway-page pattern, it reads as spam to a bride and to
 * a search engine alike, and writing four of them would mean inventing local
 * detail about venues and clients that nobody has supplied.
 *
 * The article that IS here — travelling for a wedding — is the genuinely
 * useful version of that intent: it carries all four cities naturally, it is
 * true, and it answers the question a bride in Madurai actually has about an
 * artist based in Trichy.
 *
 * TODO(client): once Lana has real work and real venue knowledge in a given
 * city, a dedicated page for that city becomes honest and worth building.
 * Not before.
 *
 * TODO(client): this is the file a CMS replaces. See lib/content/cms.ts.
 */
export const posts: BlogPost[] = [
  {
    slug: "natural-vs-hd-bridal-makeup",
    title: "Natural or HD: choosing the register for a South Indian bride",
    excerpt:
      "The two finishes are not better and worse. They are answers to two different lighting problems — and most weddings contain both.",
    cover: { alt: "Natural and HD finish comparison — placeholder plate", tone: "ivory", seed: 401 },
    category: "Bridal Beauty",
    tags: ["natural makeup", "HD makeup", "south indian bridal", "bridal beauty"],
    author: "Lana's Makeover",
    publishedAt: "2025-11-04",
    readingMinutes: 6,
    published: true,
    seo: {
      title: "Natural vs HD Bridal Makeup",
      description:
        "A practical guide to choosing between natural and HD bridal makeup for a South Indian wedding, and why the answer usually depends on the light rather than the look.",
    },
    body: `Every bride arrives with the same question phrased two different ways. Either *"I don't want to look like I'm wearing makeup"* or *"I don't want to look washed out in the photos."* Those are not opposite preferences. They are the same person describing two different rooms.

## What the two finishes actually are

**Natural finishing** keeps the skin's own texture visible. Coverage is placed where it is needed and nowhere else, and the surface is allowed to behave like skin — it moves, it catches light unevenly, it looks like a face rather than a surface.

**HD finishing** uses finer-milled, light-diffusing products developed for high-resolution capture. Under a camera flash, a conventional finish can go flat, chalky or grey. An HD finish is built to survive that specific attack.

> The mistake is treating HD as "more makeup". It is not more. It is differently engineered.

## The problem is the light, not the taste

A South Indian wedding day almost never has one light in it.

- **Muhurtham** is oil lamps, daylight through a hall, and a photographer's flash, often within the same minute.
- **Reception** is artificial, low, and heavily lit for video.
- **Engagement and mehendi** are usually daylight and phone cameras.

A finish that is correct at 6am under a lamp can read as heavy at 8pm under a video light, and a finish tuned for flash can look powdery when she is standing in front of her grandmother.

## How the decision usually resolves

For most South Indian bridal commissions the honest answer is a graded one:

- A **natural base with HD-grade setting** through the ceremony, so it holds under flash without going matte in person.
- A **fuller HD register for reception**, where the camera is doing more of the looking than the room is.
- **Genuinely natural** for engagement, where the point is that she still looks like herself in casual photographs.

## What to ask at your trial

- Photograph the trial. On a phone, with flash, in the same kind of room as the venue.
- Look at it after four hours, not after four minutes.
- Ask specifically what happens to the finish in heat, because Tamil Nadu will test it.

The right register is the one that survives your particular day — not the one that photographed well on somebody else's.`,
  },
  {
    slug: "skin-preparation-before-the-wedding",
    title: "The thirty days before: preparing skin for a wedding morning",
    excerpt:
      "The single most useful rule is also the least exciting one — the month before your wedding is the wrong month to try anything new.",
    cover: { alt: "Skin preparation — placeholder plate", tone: "champagne", seed: 402 },
    category: "Wedding Preparation",
    tags: ["skin prep", "bridal skincare", "wedding preparation"],
    author: "Lana's Makeover",
    publishedAt: "2025-11-18",
    readingMinutes: 5,
    published: true,
    seo: {
      title: "Bridal Skin Prep: The 30 Days Before",
      description:
        "What actually helps bridal skin in the month before a South Indian wedding, and the common last-minute decisions that cause problems on the morning.",
    },
    body: `Makeup can correct tone. It cannot correct texture, and it cannot correct inflammation. Almost everything that makes a wedding morning difficult was decided in the four weeks before it.

## The rule that matters most

**Do not introduce anything new in the final month.** Not a new active, not a new facial, not a threading place you have never been to, not a product a relative recommends with great confidence three days before the muhurtham.

> A reaction two weeks out is a manageable problem. A reaction two days out is the photograph.

## A sane timeline

- **Three months out** — this is when to start anything genuinely corrective, and when to see a dermatologist if you have a concern about acne, pigmentation or scarring. Real skin change takes weeks.
- **One month out** — settle into the routine you will actually keep. Stop experimenting.
- **Two weeks out** — last facial, if you have one you already trust. Nothing aggressive.
- **The final week** — hydration, sleep, sun protection, and nothing else.

## The unglamorous list

- Sunscreen every single day, including the days you do not leave the house for long. Tan lines from an outdoor function are far harder to work around than most brides expect.
- Water and sleep genuinely show up on the skin, and they show up fastest in the under-eye.
- Do not have your eyebrows shaped the day before. Two to three days gives redness time to settle.
- Lips need more preparation than anyone plans for. A week of gentle care prevents a bridal lip from sitting on flaking skin.

## On the morning

Arrive with clean, bare, moisturised skin and no makeup on from the night before. That is the whole request.

If you have a known allergy or a sensitivity — to a fragrance, a latex sponge, a specific brand — say so before the day, not while the base is going on.`,
  },
  {
    slug: "south-indian-bridal-hair-jadai",
    title: "The jadai: a short guide to South Indian bridal hair",
    excerpt:
      "From the back of a wedding hall nobody can see a lip line. What they can see is a silhouette.",
    cover: { alt: "Bridal jadai study — placeholder plate", tone: "ink", seed: 403 },
    category: "Hair",
    tags: ["bridal hair", "jadai", "south indian bridal", "hairstyling"],
    author: "Lana's Makeover",
    publishedAt: "2025-12-02",
    readingMinutes: 5,
    published: true,
    seo: {
      title: "South Indian Bridal Hair & the Jadai",
      description:
        "How traditional South Indian bridal hair is structured, what the jadai has to carry, and what to plan for if your hair is fine or short.",
    },
    body: `Bridal hair is usually discussed as decoration. It is closer to engineering.

## What the braid is actually carrying

A traditional South Indian bridal braid can be asked to hold jadai billai — the graduated ornamental plates that run down its length — along with a length of jasmine, a kunjalam at the end, and sometimes a substantial amount of added hair. That weight has to sit still through the ceremony, through several changes of position, and through a great deal of embracing.

> The braid is not built to look good at 7am. It is built to still be there at 7pm.

## The structural decisions

- **Base tension.** Too loose and the ornament drags it out of shape within an hour. Too tight and the bride has a headache by the time the ceremony starts.
- **Volume at the crown.** This is what gives the silhouette its shape in photographs taken from the side, which is most of them.
- **Anchor points.** Flowers and ornaments need something to be pinned *to*, planned before the braid is closed, not after.

## If your hair is fine or short

This is extremely common and entirely workable, but it needs to be said out loud at the trial rather than discovered on the morning.

- Added hair is normal for bridal work and is matched to your own texture and colour.
- Fine hair holds structure better with a small amount of texture worked in first.
- Short hair can carry a full traditional silhouette, but it takes longer — build that time into the morning.

## Jasmine

Jasmine is measured in *muzham*, not in stems, and it wilts. It should be bought as close to the morning as possible, kept cool, and never sealed in plastic overnight.

If your ceremony runs long, plan a second string. It is a small cost and it is visible in every photograph taken after midday.`,
  },
  {
    slug: "bridal-makeup-when-the-wedding-is-in-another-city",
    title: `Booking a bridal artist in another city: ${citiesProse()}`,
    excerpt:
      "One artist working across four cities is a logistics problem before it is an aesthetic one. What to tell her, and what to ask, when she is travelling to you.",
    cover: { alt: "Travelling bridal kit — placeholder plate", tone: "bronze", seed: 405 },
    category: "Wedding Guides",
    tags: [
      "bridal makeup chennai",
      "bridal makeup trichy",
      "bridal makeup pudukkottai",
      "bridal makeup madurai",
      "travel",
      "wedding guides",
    ],
    author: "Lana's Makeover",
    publishedAt: "2026-01-20",
    readingMinutes: 5,
    published: true,
    seo: {
      title: "Bridal Makeup Across Chennai, Trichy, Pudukkottai & Madurai",
      description:
        "What changes when your bridal artist travels to your city — timing, kit, trials and the questions worth asking before you book.",
    },
    body: `Most South Indian weddings are not held where everyone lives. The bride is working in Chennai, the family home is in Pudukkottai, the muhurtham is in Madurai and the artist is based in Trichy. That is normal, and it is worth planning rather than hoping through.

## The travel decides the call time, not the makeup

An artist arriving from another city is not starting at your door. She is starting at a bus stand or a station or a car at an hour that has to work backwards from the muhurtham, with the traffic of that particular morning built in.

> Ask what time she needs to arrive, not what time she needs to start. They are different questions and only one of them is yours to plan around.

## What to tell her when you enquire

- **The city and the venue.** "Madurai" and "a hall forty minutes outside Madurai" are different jobs.
- **The muhurtham time.** Everything else is scheduled from it.
- **Where you will be getting ready.** A hotel room, a family house and a temple side-room have very different light and very different power sockets.
- **How many people.** A bride alone and a bride with four relatives are not the same morning.
- **Whether there are events on consecutive days**, and in which cities.

## The trial, when you are not in the same city

This is the part that catches people out. If you live in one city and the wedding is in another, a trial may need its own trip for one of you. Ask early:

- Where can a trial be done, and when?
- What can be settled over photographs and a call instead?
- If a trial is not practical, what is the plan for making the decisions it would have made?

## What does not change

The kit, the hands and the approach are the same in ${citiesProse()}. The register is chosen with you either way. What changes is the timetable — and a timetable is much easier to fix in advance than on the morning.

If your wedding is in one of the four, send the date and the venue and you will be told plainly whether it is open.`,
  },
  {
    slug: "the-bridal-makeup-trial",
    title: "The bridal trial: what it is actually for",
    excerpt:
      "Not a dress rehearsal for the face. A test of decisions — register, hair structure, and how the whole thing behaves after four hours.",
    cover: { alt: "Trial in progress — placeholder plate", tone: "champagne", seed: 406 },
    category: "Wedding Preparation",
    tags: ["bridal trial", "makeup trial", "wedding preparation", "bridal beauty"],
    author: "Lana's Makeover",
    publishedAt: "2026-02-10",
    readingMinutes: 5,
    published: true,
    seo: {
      title: "The Bridal Makeup Trial — A Practical Guide",
      description:
        "How to use a bridal makeup trial properly: what to bring, what to photograph, what to look at after four hours, and what a trial cannot tell you.",
    },
    body: `A trial is not there so you can see yourself in bridal makeup. It is there so that the decisions are already made before the morning nobody has time to make them on.

## Bring the things that will actually be in the room

- **The saree**, or at least a photograph of it in daylight. Colour decides more of the palette than the face does.
- **The jewellery**, particularly anything that sits near the hairline or the ears.
- **A photograph of your hair on a normal day** — not styled, not on a good day. That is what she is working with.

## Photograph it badly on purpose

The trial photographs that matter are not the flattering ones.

- With flash, front-on, in a small room.
- In daylight, near a window, no filter.
- From the back, if there is a braid or a jadai involved.

> If it survives a phone flash at arm's length, it will survive the photographer.

## Look at it after four hours

The only honest verdict on a finish comes late. Wear the trial through an ordinary afternoon — heat, a meal, a car — and look again. What you are checking:

- Has the base moved, gone patchy, or gone flat?
- Is the eye still where it was?
- Has the hair dropped, and if so, from the root or from the structure?

## What a trial cannot tell you

It cannot rehearse the day. On the morning there will be more heat, more people, less time and a great deal more emotion. What the trial buys you is that none of the *decisions* have to be taken in those conditions — only the execution.

## Say what you did not like

This is the whole point of the trial and the part brides skip out of politeness. A look you are quietly unsure about at a trial becomes a look you are quietly unsure about in your wedding photographs for the rest of your life. Say it plainly. It is much easier to change now.`,
  },
  {
    slug: "muhurtham-morning-timeline",
    title: "Timing the muhurtham morning: how the hours actually go",
    excerpt:
      "Almost every bridal morning that runs late runs late for the same three reasons, and all of them are avoidable.",
    cover: { alt: "Muhurtham morning — placeholder plate", tone: "bronze", seed: 404 },
    category: "Wedding Guides",
    tags: ["muhurtham", "wedding timeline", "bridal preparation", "wedding guides"],
    author: "Lana's Makeover",
    publishedAt: "2025-12-16",
    readingMinutes: 4,
    published: true,
    seo: {
      title: "Muhurtham Morning Timeline",
      description:
        "A practical guide to timing a South Indian bridal getting-ready, and the three things that most often cause a muhurtham morning to run late.",
    },
    body: `The muhurtham does not move. Everything else in the morning has to be arranged around a fixed point, working backwards.

## Work backwards, never forwards

Start from the time the bride must be *seated*, not the time the ceremony begins. Then subtract, in this order: the walk to the hall, the draping, the jewellery, the hair, the makeup, and the skin preparation.

The number you arrive at is almost always earlier than anyone wants it to be. That is the correct number.

## The three things that cause delay

**1. The saree and the jewellery arrive late.** Draping cannot begin without them, and the entire back half of the morning is stacked behind draping. Everything should be physically in the room the night before.

**2. Nobody counted the other faces.** The mother, the sisters, the cousin who was not mentioned. Each additional person is real time. Say the number in advance and the morning can be staffed and sequenced for it.

**3. The room is wrong.** Bridal makeup needs a window or a proper light, a table, a chair at the right height, and a plug point. A dim hotel bathroom will cost you thirty minutes and will change how the makeup reads under daylight.

> A good morning is a quiet one. That is almost entirely a question of what was decided the week before.

## A workable shape

- **Two to three hours** for the bride herself, skin preparation through to the final check.
- **Additional time per family member**, sequenced so nobody is waiting in full makeup for hours.
- **Thirty minutes of buffer** that you do not tell anybody about.

Photographers will also want getting-ready coverage, which means the room needs to be presentable and the schedule needs to absorb a person moving around it.

Plan for that, and the morning stops being a rush and becomes what it should be — the last quiet hours before everything else.`,
  },
];

import EditorialImage from "@/components/ui/EditorialImage";
import ParallaxFrame from "@/components/ui/ParallaxFrame";
import Reveal from "@/components/ui/Reveal";
import SplitLines from "@/components/ui/SplitLines";
import KolamGrid from "./KolamGrid";

/**
 * ACT IV — THE HERITAGE (§8)
 *
 * The Indian layer, treated as material culture rather than as ornament.
 * Silk, zari, jasmine, gold — described the way a fashion desk would describe
 * them, not the way a wedding invitation would.
 */
const MOTIFS = [
  {
    name: "Kanchipuram",
    note: "Woven in three parts and joined at the border, which is why the silk holds its own weight — and why it photographs like architecture.",
    tone: "bronze" as const,
    seed: 601,
  },
  {
    name: "Zari",
    note: "Gold thread that does not reflect evenly. Under lamps it flares; under flash it goes quiet. The makeup has to answer both.",
    tone: "champagne" as const,
    seed: 602,
  },
  {
    name: "Jasmine",
    note: "Bought by length, not by stem. It wilts. It is the one part of the look with a running clock.",
    tone: "olive" as const,
    seed: 603,
  },
  {
    name: "Temple gold",
    note: "Cast heavy and worn in layers. It sets the tone of the whole face before a single product is chosen.",
    tone: "bronze" as const,
    seed: 604,
  },
];

export default function ActHeritage() {
  return (
    <section className="section-dark relative overflow-hidden py-28 sm:py-40" aria-labelledby="heritage-title">
      <KolamGrid
        className="pointer-events-none absolute -right-[10%] top-[6%] h-[46rem] w-[46rem] text-champagne/[0.055]"
        cells={7}
      />

      {/* Second jasmine bloom drifts through this act */}
      <div
        data-scene="heritage-jasmine"
        aria-hidden="true"
        className="pointer-events-none absolute left-[4%] top-[38%] aspect-square w-[min(26vmin,15rem)]"
      />

      <div className="shell relative">
        <div className="max-w-3xl">
          <Reveal>
            <p className="eyebrow mb-10">06 — The Indian soul</p>
          </Reveal>

          <SplitLines
            as="h2"
            id="heritage-title"
            className="display-md text-ivory"
            lines={["Silk, gold and jasmine", "are not decoration."]}
          />

          <Reveal delay={320}>
            <p className="body-lg mt-10 max-w-xl">
              They are the conditions the work has to survive. A South Indian bride is dressed in
              materials that reflect, catch heat and carry weight — every decision in the chair is
              made against them.
            </p>
          </Reveal>
        </div>

        <ul className="mt-20 grid gap-x-10 gap-y-16 sm:grid-cols-2 lg:grid-cols-4">
          {MOTIFS.map((m, i) => (
            <li key={m.name}>
              <Reveal delay={i * 110}>
                <ParallaxFrame strength={0.5}>
                  <div
                    className="relative aspect-[4/5] w-full overflow-hidden"
                    style={{ transform: "translate3d(0, calc(var(--sy) * 18px), 0)" }}
                  >
                    <EditorialImage
                      image={{ alt: `${m.name} — placeholder plate`, tone: m.tone, seed: m.seed }}
                      className="h-full w-full"
                      sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 22vw"
                      decorative
                    />
                  </div>
                </ParallaxFrame>
                <h3 className="mt-6 font-display text-2xl text-ivory">{m.name}</h3>
                <p className="body-base mt-3">{m.note}</p>
              </Reveal>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

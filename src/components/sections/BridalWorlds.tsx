import Link from "next/link";
import type { Service } from "@/lib/types";
import EditorialImage from "@/components/ui/EditorialImage";
import Reveal from "@/components/ui/Reveal";
import SplitLines from "@/components/ui/SplitLines";
import WorldCard from "./WorldCard";

/** ACT — CHOOSE YOUR BRIDAL WORLD (§11) */
export default function BridalWorlds({ services }: { services: Service[] }) {
  if (services.length === 0) return null;

  return (
    <section className="section-dark relative py-28 sm:py-40" aria-labelledby="worlds-title">
      <div className="shell">
        <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <div>
            <Reveal>
              <p className="eyebrow mb-8">07 — The worlds</p>
            </Reveal>
            <SplitLines
              as="h2"
              id="worlds-title"
              className="display-md text-ivory"
              lines={["Choose your", "bridal world."]}
            />
          </div>
          <Reveal delay={260}>
            <Link href="/services" className="btn btn-ghost shrink-0">
              All services
            </Link>
          </Reveal>
        </div>

        <div className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((s, i) => (
            <Reveal key={s.slug} delay={(i % 3) * 130}>
              <WorldCard
                href={`/services#${s.slug}`}
                eyebrow={s.eyebrow}
                name={s.name}
                summary={s.summary}
                index={i + 1}
              >
                <EditorialImage
                  image={s.image}
                  className="h-full w-full"
                  sizes="(max-width: 640px) 92vw, (max-width: 1024px) 46vw, 31vw"
                  decorative
                />
              </WorldCard>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

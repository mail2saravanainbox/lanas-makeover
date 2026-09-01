import type { Testimonial } from "@/lib/types";
import Reveal from "@/components/ui/Reveal";
import SplitLines from "@/components/ui/SplitLines";

/**
 * TESTIMONIALS (§22)
 *
 * Renders nothing at all when there are no verified testimonials — no empty
 * state, no invented quote, no "coming soon". See content/testimonials.ts.
 */
export default function Testimonials({ items }: { items: Testimonial[] }) {
  if (items.length === 0) return null;

  return (
    <section className="section-dark relative py-[var(--s-12)] sm:py-[var(--s-16)]" aria-labelledby="testimonials-title">
      <div className="shell">
        <Reveal>
          <p className="eyebrow mb-8">12 — In their words</p>
        </Reveal>
        <SplitLines
          as="h2"
          id="testimonials-title"
          className="display-md text-ivory"
          lines={["In their words."]}
        />

        <ul className="mt-16 grid gap-12 md:grid-cols-2 lg:gap-16">
          {items.map((t, i) => (
            <li key={t.id}>
              <Reveal delay={i * 120}>
                <figure className="border-t border-ivory/12 pt-8">
                  <blockquote className="font-display text-[clamp(1.3rem,2.2vw,1.9rem)] font-light leading-snug text-ivory/90">
                    “{t.quote}”
                  </blockquote>
                  <figcaption className="eyebrow mt-7">
                    {t.name}
                    {t.weddingType ? ` · ${t.weddingType}` : ""}
                    {t.location ? ` · ${t.location}` : ""}
                  </figcaption>
                </figure>
              </Reveal>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

import type { Testimonial } from "@/lib/types";

/**
 * TESTIMONIALS
 *
 * Intentionally EMPTY. No review has been verified, and inventing one would
 * misrepresent Lana to prospective brides.
 *
 * The testimonials section auto-hides while this array is empty — nothing
 * breaks, no empty state is shown, no placeholder quote is published.
 *
 * TODO(client): paste real, permissioned testimonials below and the section
 * appears on the homepage and on /about automatically.
 *
 *   { id: "1", quote: "…", name: "…", weddingType: "Muhurtham",
 *     location: "Trichy", published: true }
 */
export const testimonials: Testimonial[] = [];

"use client";

import Link from "next/link";
import { useState } from "react";
import type { Service } from "@/lib/types";
import { useIsWide } from "@/lib/motion/useBreakpoint";
import EditorialImage from "@/components/ui/EditorialImage";
import { cx } from "@/lib/utils";

/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  THE SIX SERVICES, ON A PHONE  (§25–§27)
 * ═══════════════════════════════════════════════════════════════════════════
 *  The editorial index gives each service a 4:5 photograph, a name, a summary
 *  and a link — six times. That is the right layout beside a photograph on a
 *  desktop. Linearised onto a phone it is nine and a half screens of scrolling
 *  to choose between six things, and a bride has to scroll past five she does
 *  not want to reach the sixth.
 *
 *  Closed, this is six rows she can see at once. Open, one of them shows the
 *  photograph, what it includes, and the way to its own page.
 *
 *  ── ONE AT A TIME ─────────────────────────────────────────────────────────
 *  Opening a row closes the others. Six expanded panels is the page this
 *  replaced (§26), and an accordion where everything can be open is a list
 *  with extra steps.
 *
 *  ── THE PHOTOGRAPH SURVIVES ───────────────────────────────────────────────
 *  §25 describes rows of text. On a bridal site the photograph IS the answer
 *  to "what can I book" — dropping it would make the page shorter and worse.
 *  It moves inside the open panel instead, so exactly one loads at a time
 *  rather than six, and it is mounted only once its row has been opened.
 *
 *  ── ONE CONVERSION PATH ───────────────────────────────────────────────────
 *  "View service" and nothing else (§27). The booking CTA is in the sticky bar
 *  at the foot of every page and the page still ends with ClosingCTA; six more
 *  of it here is the repetition that flattened the hierarchy in the first
 *  place.
 * ═══════════════════════════════════════════════════════════════════════════
 */
export default function ServicesAccordion({
  services,
}: {
  services: Service[];
}) {
  const wide = useIsWide();
  const [open, setOpen] = useState<string | null>(null);

  // `null` is "not measured yet" — render, and let CSS hide it. True means the
  // editorial index is on screen and this must not also run. See useIsWide.
  if (wide === true) return null;

  return (
    <div className="shell pb-[var(--s-12)] lg:hidden">
      <ul className="border-t border-ivory/12">
        {services.map((s, i) => {
          const isOpen = open === s.slug;
          const panelId = `svc-panel-${s.slug}`;
          return (
            <li
              key={s.slug}
              id={s.slug}
              className="scroll-mt-[calc(var(--nav-h)+1rem)] border-b border-ivory/12"
            >
              <h2>
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? null : s.slug)}
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  className="flex w-full items-baseline gap-4 py-6 text-left"
                >
                  <span className="font-mono text-[0.7rem] tracking-[0.18em] text-champagne/70">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-display text-[1.3rem] leading-tight text-ivory">
                      {s.name}
                    </span>
                    {/* Closed state carries one line, so six rows read as a
                        menu rather than six identical titles. */}
                    <span className="mt-1.5 block line-clamp-1 text-[0.88rem] text-ivory/55">
                      {s.summary}
                    </span>
                  </span>
                  {/* A plus that becomes a minus. Rotating a chevron reads as
                      "next"; this reads as "more". */}
                  <span
                    aria-hidden="true"
                    className="relative mt-1 block h-11 w-11 shrink-0"
                  >
                    <span className="absolute left-1/2 top-1/2 h-px w-3.5 -translate-x-1/2 -translate-y-1/2 bg-champagne" />
                    <span
                      className={cx(
                        "absolute left-1/2 top-1/2 h-3.5 w-px -translate-x-1/2 -translate-y-1/2 bg-champagne transition-transform duration-[240ms] motion-reduce:transition-none",
                        isOpen ? "scale-y-0" : "scale-y-100",
                      )}
                    />
                  </span>
                </button>
              </h2>

              {/* Not `hidden` on a wrapper: the panel is unmounted when closed,
                  so its photograph is never fetched for a row nobody opened. */}
              {isOpen && (
                <div id={panelId} className="pb-8">
                  <div className="relative aspect-[4/5] w-full overflow-hidden">
                    <EditorialImage
                      image={s.image}
                      className="h-full w-full"
                      sizes="92vw"
                      decorative
                    />
                  </div>

                  <p className="body-base mt-6">{s.description[0]}</p>

                  {s.includes.length > 0 && (
                    <>
                      <h3 className="eyebrow mb-4 mt-8">Includes</h3>
                      <ul className="space-y-2.5">
                        {s.includes.map((inc) => (
                          <li
                            key={inc}
                            className="relative pl-6 text-[0.9rem] text-ivory/75"
                          >
                            <span
                              aria-hidden="true"
                              className="absolute left-0 top-[0.7em] h-px w-3 bg-champagne/60"
                            />
                            {inc}
                          </li>
                        ))}
                      </ul>
                    </>
                  )}

                  <Link
                    href={`/services/${s.slug}`}
                    className="btn btn-ghost mt-8 w-full"
                  >
                    View service
                  </Link>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

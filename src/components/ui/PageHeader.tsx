import Link from "next/link";
import Reveal from "./Reveal";
import SplitLines from "./SplitLines";

/**
 * Editorial page header — the interior-page counterpart to the homepage's
 * cinematic opening. Sits under the fixed nav, sets the act number and title.
 */
export default function PageHeader({
  eyebrow,
  titleLines,
  intro,
  breadcrumb,
  align = "left",
}: {
  eyebrow: string;
  titleLines: string[];
  intro?: string;
  breadcrumb?: Array<{ name: string; href: string }>;
  align?: "left" | "center";
}) {
  const centered = align === "center";

  return (
    <header
      className={`shell relative pb-16 pt-[calc(var(--nav-h)+5rem)] sm:pb-24 sm:pt-[calc(var(--nav-h)+8rem)] ${
        centered ? "text-center" : ""
      }`}
    >
      {breadcrumb && breadcrumb.length > 0 && (
        <Reveal>
          <nav aria-label="Breadcrumb" className="mb-8">
            <ol className={`flex flex-wrap items-center gap-2 text-[0.6rem] uppercase tracking-[0.24em] text-muted ${centered ? "justify-center" : ""}`}>
              {breadcrumb.map((b, i) => (
                <li key={b.href} className="flex items-center gap-2">
                  {i > 0 && <span aria-hidden="true">·</span>}
                  {i === breadcrumb.length - 1 ? (
                    <span aria-current="page" className="text-ivory/60">
                      {b.name}
                    </span>
                  ) : (
                    <Link href={b.href} className="link-wipe hover:text-ivory">
                      {b.name}
                    </Link>
                  )}
                </li>
              ))}
            </ol>
          </nav>
        </Reveal>
      )}

      <Reveal>
        <p className="eyebrow mb-8">{eyebrow}</p>
      </Reveal>

      <SplitLines
        as="h1"
        className={`display-lg text-ivory ${centered ? "mx-auto max-w-[20ch]" : "max-w-[16ch]"}`}
        lines={titleLines}
      />

      {intro && (
        <Reveal delay={320}>
          <p className={`body-lg mt-10 max-w-2xl ${centered ? "mx-auto" : ""}`}>{intro}</p>
        </Reveal>
      )}
    </header>
  );
}

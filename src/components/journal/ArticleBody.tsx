import Link from "next/link";
import { Fragment, type ReactNode } from "react";

/**
 * A deliberately small markdown renderer.
 *
 * Supported: `##` headings, `>` pull quotes, `-` lists, `**bold**`, `*italic*`,
 * `[text](/path)` links, and blank-line-separated paragraphs. That is the
 * entire vocabulary the journal needs.
 *
 * ── WHY LINKS WERE ADDED ────────────────────────────────────────────────────
 * Without them an article could not point at anything. Every journal post on
 * this site reached the rest of it through the template — a breadcrumb, three
 * related articles and one Contact button — and never from inside a sentence,
 * where a link is actually read and actually followed.
 *
 * That is a content problem before it is an SEO one: an article about choosing
 * a jewellery set that cannot link to the jewellery is a worse article. It is
 * also the thing that turns six unrelated posts into a topical cluster, which
 * only works if the anchor text says where it goes — "bridal jewellery on rent
 * in Trichy", never "click here".
 *
 * Why not MDX? Because the journal is destined for a CMS, and a CMS returns a
 * string — not a compiled component. Keeping the renderer string-first means
 * swapping `LocalContentProvider` for a CMS changes nothing here. If rich
 * embeds are needed later, MDX can be introduced behind this same component.
 *
 * No `dangerouslySetInnerHTML` anywhere: everything below is real React nodes,
 * so a compromised CMS cannot inject markup.
 */

/**
 * Which hrefs a body is allowed to produce.
 *
 * The journal is destined for a CMS, and the guarantee this file has always
 * made is that a compromised CMS cannot inject markup. A link is the one
 * construct that could quietly break that — `javascript:` and `data:` URLs are
 * script delivery, not navigation — so the href is whitelisted rather than
 * sanitised: a site-relative path, or an absolute https URL. Anything else
 * renders as plain text, which is visibly wrong to an editor and harmless to
 * a reader.
 */
function safeHref(href: string): { href: string; external: boolean } | null {
  if (/^\/(?!\/)/.test(href)) return { href, external: false };
  if (/^https:\/\/[^\s]+$/i.test(href)) return { href, external: true };
  return null;
}

function inline(text: string): ReactNode {
  const nodes: ReactNode[] = [];
  const pattern = /(\*\*[^*]+\*\*|\*[^*]+\*|\[[^\]]+\]\([^)\s]+\))/g;
  let last = 0;
  let match: RegExpExecArray | null;
  let key = 0;

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > last) nodes.push(text.slice(last, match.index));
    const token = match[0];
    if (token.startsWith("[")) {
      const split = token.indexOf("](");
      const label = token.slice(1, split);
      const target = safeHref(token.slice(split + 2, -1));

      if (!target) {
        nodes.push(token);
      } else if (target.external) {
        nodes.push(
          <a
            key={key++}
            href={target.href}
            rel="noopener noreferrer"
            target="_blank"
            className="link-wipe text-champagne"
          >
            {label}
          </a>,
        );
      } else {
        // next/link, so an internal hop is a client navigation like every
        // other link on the site rather than a full document load.
        nodes.push(
          <Link key={key++} href={target.href} className="link-wipe text-champagne">
            {label}
          </Link>,
        );
      }
    } else if (token.startsWith("**")) {
      nodes.push(
        <strong key={key++} className="font-medium text-ivory">
          {token.slice(2, -2)}
        </strong>,
      );
    } else {
      nodes.push(
        <em key={key++} className="italic-serif text-champagne">
          {token.slice(1, -1)}
        </em>,
      );
    }
    last = match.index + token.length;
  }
  if (last < text.length) nodes.push(text.slice(last));
  return nodes.length ? nodes : text;
}

export default function ArticleBody({ body }: { body: string }) {
  const blocks = body.split(/\n{2,}/);

  return (
    <div className="space-y-7">
      {blocks.map((raw, i) => {
        const block = raw.trim();
        if (!block) return null;

        if (block.startsWith("## ")) {
          return (
            <h2
              key={i}
              className="display-sm !mt-16 !mb-2 scroll-mt-32 text-ivory first:!mt-0"
            >
              {inline(block.slice(3))}
            </h2>
          );
        }

        if (block.startsWith("> ")) {
          return (
            <blockquote
              key={i}
              className="!my-12 border-l border-champagne/40 pl-7 font-display text-[clamp(1.3rem,2.2vw,1.75rem)] font-light leading-snug text-champagne"
            >
              {inline(block.replace(/^>\s?/gm, ""))}
            </blockquote>
          );
        }

        if (/^-\s/.test(block)) {
          const items = block.split("\n").filter((l) => /^-\s/.test(l));
          return (
            <ul key={i} className="!my-8 space-y-3 pl-1">
              {items.map((item, j) => (
                <li key={j} className="body-lg relative pl-6">
                  <span
                    aria-hidden="true"
                    className="absolute left-0 top-[0.72em] h-px w-3 bg-champagne/60"
                  />
                  {inline(item.slice(2))}
                </li>
              ))}
            </ul>
          );
        }

        return (
          <p key={i} className="body-lg">
            <Fragment>{inline(block)}</Fragment>
          </p>
        );
      })}
    </div>
  );
}

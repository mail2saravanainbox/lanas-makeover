import type { StoredEnquiry } from "@/lib/enquiries";

/**
 * THE ENQUIRY LIST — the whole reason the durable store exists.
 *
 * Lana should be able to answer a bride from this page without opening a mail
 * client: the phone number is a `tel:` and a WhatsApp deep link, the address
 * is a `mailto:`. A record you cannot act on is an archive, not an inbox.
 *
 * Read-only, like the rest of /admin. Nothing here can edit or delete.
 */

function formatWhen(iso: string): string {
  try {
    return new Intl.DateTimeFormat("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
      timeZone: "Asia/Kolkata",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

/** wa.me wants digits only, country code included. */
function waLink(phone: string): string | null {
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 10) return null;
  // A bare ten-digit Indian mobile needs its country code to be dialable.
  return `https://wa.me/${digits.length === 10 ? `91${digits}` : digits}`;
}

function Field({ label, value }: { label: string; value: string }) {
  if (!value) return null;
  return (
    <div className="flex gap-3 text-sm">
      <dt className="shrink-0 text-ivory/45">{label}</dt>
      <dd className="text-ivory/85">{value}</dd>
    </div>
  );
}

export default function EnquiryList({ enquiries }: { enquiries: StoredEnquiry[] }) {
  if (enquiries.length === 0) {
    return (
      <p className="body-base border-t border-ivory/10 pt-6">
        No enquiries held yet. Every enquiry received from now on is kept here.
      </p>
    );
  }

  return (
    <ol className="space-y-5">
      {enquiries.map((e, i) => {
        const wa = waLink(e.whatsapp || e.phone);
        return (
          <li
            key={`${e.receivedAt}-${i}`}
            className="rounded-lg border border-ivory/12 bg-ink-2 p-5"
          >
            <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
              <p className="font-display text-xl text-ivory">{e.name}</p>
              <p className="font-mono text-[0.7rem] uppercase tracking-wide text-muted">
                {formatWhen(e.receivedAt)}
              </p>
            </div>

            <dl className="mt-4 grid gap-x-8 gap-y-2 sm:grid-cols-2">
              <Field label="Wedding" value={[e.weddingDate, e.city].filter(Boolean).join(" · ")} />
              {e.venue ? <Field label="Venue" value={e.venue} /> : null}
              {e.events?.length || e.weddingType ? (
                <Field label="Events" value={e.events?.join(", ") ?? e.weddingType ?? ""} />
              ) : null}
              {e.services?.length ? <Field label="Services" value={e.services.join(", ")} /> : null}
              {e.people ? <Field label="People" value={e.people} /> : null}
              {e.instagram ? <Field label="Instagram" value={e.instagram} /> : null}
            </dl>

            {e.message ? (
              <p className="body-base mt-4 border-l border-champagne/30 pl-4 text-sm">{e.message}</p>
            ) : null}

            {/* Act on it from here, rather than copying a number out by hand. */}
            <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-[0.72rem] uppercase tracking-[0.18em]">
              <a href={`tel:${e.phone.replace(/[^\d+]/g, "")}`} className="link-wipe text-champagne">
                {e.phone}
              </a>
              {wa ? (
                <a
                  href={wa}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link-wipe text-champagne"
                >
                  WhatsApp
                </a>
              ) : null}
              {e.email ? (
                <a
                  href={`mailto:${e.email}?subject=${encodeURIComponent(
                    `Your enquiry — ${e.weddingDate}`,
                  )}`}
                  className="link-wipe text-champagne"
                >
                  {e.email}
                </a>
              ) : null}
            </div>
          </li>
        );
      })}
    </ol>
  );
}

"use client";

import { useState } from "react";
import { track } from "@/lib/analytics";
import { cx } from "@/lib/utils";
import { siteSettings, whatsappEnquiry, whatsappLink } from "@/content/site";

/**
 * ENQUIRY FORM (§27)
 *
 * Real HTML form semantics: labelled fields, native validation, a live region
 * for the result, and a disabled/pending state. No third-party form widget.
 *
 * The POST target is /api/contact. That route reports whether the enquiry was
 * actually delivered to an inbox, and this component tells the truth about it:
 * a bride is only told her enquiry "has been received" when an inbox really
 * received it. Otherwise she is shown the second door — WhatsApp, Instagram —
 * and her typed message is left in the form so she can copy it.
 */

const SERVICES = [
  "Muhurtham Bridal",
  "Reception",
  "Engagement",
  "Party Transformation",
  "Bridal Hair",
  "Other",
];

const WEDDING_TYPES = ["Muhurtham", "Reception", "Engagement", "Multiple events", "Other"];

type Status = "idle" | "sending" | "sent" | "recorded" | "error";

const field =
  "w-full border-0 border-b border-ivory/20 bg-transparent px-0 py-3 text-ivory placeholder:text-inactive focus:border-champagne focus:outline-none focus:ring-0 transition-colors duration-[var(--d-base)]";

export default function ContactForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");
  /** Values of the submitted enquiry, used to pre-fill the WhatsApp message. */
  const [submitted, setSubmitted] = useState<{
    date?: string;
    city?: string;
    weddingType?: string;
  } | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());

    setStatus("sending");
    setMessage("");
    setSubmitted(null);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const body = (await res.json()) as {
        ok?: boolean;
        delivered?: boolean;
        error?: string;
      };

      if (!res.ok || !body.ok) {
        setStatus("error");
        setMessage(body.error ?? "Something went wrong. Please try again, or message on Instagram.");
        return;
      }

      const delivered = body.delivered === true;
      track("contact_submit", { weddingType: String(data.weddingType ?? ""), delivered });

      setSubmitted({
        date: String(data.weddingDate ?? ""),
        city: String(data.city ?? ""),
        weddingType: String(data.weddingType ?? ""),
      });

      if (delivered) {
        setStatus("sent");
        setMessage(
          "Your enquiry has been received. You will hear back with your date's availability.",
        );
        form.reset();
        return;
      }

      // Nothing was delivered. Say so, and leave her message in the form.
      setStatus("recorded");
      setMessage(
        "Thank you. The enquiry inbox isn't connected yet — please also send your date on WhatsApp or Instagram so it isn't missed.",
      );
    } catch {
      setStatus("error");
      setMessage("The enquiry could not be sent. Please try again, or message on Instagram.");
    }
  }

  const continueHref = submitted ? whatsappLink(whatsappEnquiry(submitted)) : null;

  return (
    <form onSubmit={onSubmit} className="grid gap-x-10 gap-y-9 sm:grid-cols-2" noValidate={false}>
      {/* Honeypot — bots fill it, humans never see it */}
      <div className="hidden" aria-hidden="true">
        <label htmlFor="company">Company</label>
        <input id="company" name="company" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <div>
        <label htmlFor="name" className="eyebrow mb-3 block">
          Name *
        </label>
        <input id="name" name="name" type="text" required autoComplete="name" className={field} />
      </div>

      <div>
        <label htmlFor="phone" className="eyebrow mb-3 block">
          Phone *
        </label>
        <input
          id="phone"
          name="phone"
          type="tel"
          required
          autoComplete="tel"
          inputMode="tel"
          className={field}
        />
      </div>

      <div>
        <label htmlFor="email" className="eyebrow mb-3 block">
          Email *
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className={field}
        />
      </div>

      <div>
        <label htmlFor="weddingDate" className="eyebrow mb-3 block">
          Wedding date *
        </label>
        <input
          id="weddingDate"
          name="weddingDate"
          type="date"
          required
          className={cx(field, "[color-scheme:dark]")}
        />
      </div>

      <div>
        <label htmlFor="city" className="eyebrow mb-3 block">
          Wedding city *
        </label>
        <input id="city" name="city" type="text" required className={field} />
      </div>

      <div>
        <label htmlFor="weddingType" className="eyebrow mb-3 block">
          Wedding type
        </label>
        <select id="weddingType" name="weddingType" className={cx(field, "text-ivory")} defaultValue="">
          <option value="" className="bg-ink">
            Select…
          </option>
          {WEDDING_TYPES.map((t) => (
            <option key={t} value={t} className="bg-ink">
              {t}
            </option>
          ))}
        </select>
      </div>

      <fieldset className="sm:col-span-2">
        <legend className="eyebrow mb-5">Services required</legend>
        <div className="flex flex-wrap gap-x-8 gap-y-4">
          {SERVICES.map((s) => (
            <label key={s} className="flex cursor-pointer items-center gap-3 text-sm text-ivory/75">
              <input
                type="checkbox"
                name="services"
                value={s}
                className="h-4 w-4 shrink-0 appearance-none border border-ivory/30 bg-transparent checked:border-champagne checked:bg-champagne focus-visible:outline focus-visible:outline-2 focus-visible:outline-champagne"
              />
              {s}
            </label>
          ))}
        </div>
      </fieldset>

      <div>
        <label htmlFor="people" className="eyebrow mb-3 block">
          Number of people
        </label>
        <input
          id="people"
          name="people"
          type="number"
          min={1}
          max={50}
          inputMode="numeric"
          className={field}
        />
      </div>

      <div className="sm:col-span-2">
        <label htmlFor="message" className="eyebrow mb-3 block">
          Message
        </label>
        <textarea id="message" name="message" rows={4} className={cx(field, "resize-y")} />
      </div>

      <div className="sm:col-span-2">
        <button type="submit" disabled={status === "sending"} className="btn disabled:opacity-50">
          {status === "sending" ? "Sending…" : "Send enquiry"}
        </button>

        <div
          role="status"
          aria-live="polite"
          className={cx(
            "mt-6 text-sm",
            status === "error" ? "text-rose" : "text-champagne",
            message ? "opacity-100" : "opacity-0",
          )}
        >
          <p>{message || " "}</p>

          {(status === "recorded" || status === "sent") && (
            <p className="mt-4 flex flex-wrap gap-x-6 gap-y-2">
              {continueHref && (
                <a
                  href={continueHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link-wipe underline underline-offset-4 hover:text-ivory"
                  onClick={() => track("whatsapp_click", { placement: "contact-form" })}
                >
                  Continue on WhatsApp
                </a>
              )}
              <a
                href={siteSettings.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="link-wipe underline underline-offset-4 hover:text-ivory"
                onClick={() => track("instagram_click", { placement: "contact-form" })}
              >
                Message {siteSettings.instagramHandle}
              </a>
            </p>
          )}
        </div>
      </div>
    </form>
  );
}

"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { track } from "@/lib/analytics";
import { cx } from "@/lib/utils";
import { serviceCities, siteSettings, whatsappEnquiry, whatsappLink } from "@/content/site";

/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  CHECK YOUR DATE — the six-step enquiry (§12)
 * ═══════════════════════════════════════════════════════════════════════════
 *  Replaces a single page of eleven fields. The same information, asked in the
 *  order a bride actually thinks about it, and never more than one decision on
 *  screen at a time.
 *
 *    01 DATE      the only question that can end the conversation early
 *    02 LOCATION  city, then venue
 *    03 EVENTS    multi-select
 *    04 SERVICES  multi-select
 *    05 DETAILS   name and phone required; nothing else is
 *    06 REVIEW    what she said, then CHECK AVAILABILITY
 *
 *  WHY STEPS AND NOT A LONG FORM. Eleven fields on a phone is a wall. Six
 *  screens of one or two fields is a conversation — and it lets the date, the
 *  single fact that decides whether any of this is possible, be asked first
 *  rather than eighth.
 *
 *  STATE IS NEVER LOST (§48). Everything lives in one `values` object held for
 *  the life of the component. Going back does not clear a step; a failed
 *  submission does not clear the form; a validation error does not clear the
 *  field that caused it.
 *
 *  ACCESSIBILITY (§31, §48). Each step is a real fieldset with a legend.
 *  Errors are wired through aria-describedby on the offending control. The
 *  step change is announced, so a screen-reader user is told they are on step
 *  3 of 6 rather than silently re-rendered. Every control is a native input,
 *  radio, checkbox or button — there is no custom widget here at all, which is
 *  why there is no ARIA to get wrong.
 *
 *  HONESTY. On submit the route reports whether an inbox genuinely received
 *  the enquiry. She is told "received" only when one did — otherwise she is
 *  shown the second door, with her own answers already written into it.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const EVENTS = ["Engagement", "Muhurtham", "Reception", "Haldi", "Other"] as const;

const SERVICES = [
  "Bridal Makeup",
  "Bridal Hair",
  "Draping",
  "Family Makeup",
  "Guest Makeup",
  "Other",
] as const;

/** The four primary locations, plus the honest escape hatch (§3, §12). */
const OTHER_CITY = "Other location";

interface Values {
  weddingDate: string;
  city: string;
  cityOther: string;
  venue: string;
  events: string[];
  services: string[];
  name: string;
  phone: string;
  whatsapp: string;
  sameWhatsapp: boolean;
  email: string;
  instagram: string;
  message: string;
  /** Honeypot. Always "" for a human. */
  company: string;
}

const EMPTY: Values = {
  weddingDate: "",
  city: "",
  cityOther: "",
  venue: "",
  events: [],
  services: [],
  name: "",
  phone: "",
  whatsapp: "",
  sameWhatsapp: true,
  email: "",
  instagram: "",
  message: "",
  company: "",
};

type Status = "idle" | "sending" | "sent" | "recorded" | "error";

const STEPS = ["Date", "Location", "Events", "Services", "Details", "Review"] as const;

/** The steps that can fail validation. The two multi-selects cannot. */
const GUARDED = [0, 1, 4] as const;

const field =
  "w-full border-0 border-b border-ivory/20 bg-transparent px-0 py-3 text-ivory placeholder:text-inactive focus:border-champagne focus:outline-none focus:ring-0 transition-colors duration-[var(--d-base)]";

/** min-h-11 = the 44px minimum touch target (§14), not padding and hope. */
const chip =
  "inline-flex min-h-11 cursor-pointer items-center rounded-full border px-5 py-3 text-[0.75rem] uppercase tracking-[0.2em] transition-colors duration-[var(--d-base)] has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-champagne";

const chipOn = "border-champagne bg-champagne text-ink";
const chipOff = "border-ivory/22 text-ivory/75 hover:border-ivory/50 hover:text-ivory";

/**
 * PHONE (§48). The same rule as the API route, so the client and the server
 * never disagree about what a valid number is.
 *
 * Indian mobiles are ten digits beginning 6–9, with or without the 91 code and
 * with any amount of spacing. International numbers pass too: Lana travels,
 * and a bride planning from Dubai is not an error state.
 */
function phoneLooksReal(input: string): boolean {
  const digits = input.replace(/\D/g, "");
  if (/^(91)?[6-9]\d{9}$/.test(digits)) return true;
  return digits.length >= 8 && digits.length <= 15;
}

export default function BookingFlow() {
  const [step, setStep] = useState(0);
  const [values, setValues] = useState<Values>(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<keyof Values, string>>>({});
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");

  const formRef = useRef<HTMLFormElement>(null);
  const headingRef = useRef<HTMLParagraphElement>(null);
  /** Stamped on first interaction; the server reads it as a spam gate. */
  const startedAt = useRef(0);
  /** So booking_start fires once per visit, not once per keystroke. */
  const startTracked = useRef(false);

  function begin() {
    if (!startedAt.current) startedAt.current = Date.now();
    if (!startTracked.current) {
      startTracked.current = true;
      track("booking_start", { placement: "booking-flow" });
    }
  }

  const set = useCallback(<K extends keyof Values>(key: K, value: Values[K]) => {
    begin();
    setValues((v) => ({ ...v, [key]: value }));
    setErrors((e) => (e[key] ? { ...e, [key]: undefined } : e));
  }, []);

  const toggle = useCallback((key: "events" | "services", value: string) => {
    begin();
    setValues((v) => ({
      ...v,
      [key]: v[key].includes(value) ? v[key].filter((x) => x !== value) : [...v[key], value],
    }));
  }, []);

  /** The city as it will actually be sent — the chip, or what she typed. */
  const resolvedCity = values.city === OTHER_CITY ? values.cityOther.trim() : values.city;

  /**
   * Validation lives with the step it guards, so `next()` can refuse to
   * advance and the review step can re-check everything before a submission
   * that would otherwise fail server-side and lose her place.
   */
  const validate = useCallback(
    (which: number): Partial<Record<keyof Values, string>> => {
      const e: Partial<Record<keyof Values, string>> = {};

      if (which === 0 && !values.weddingDate) {
        e.weddingDate = "Please choose your wedding date.";
      }

      if (which === 1) {
        if (!values.city) e.city = "Please choose the city, or “Other location”.";
        else if (values.city === OTHER_CITY && !values.cityOther.trim()) {
          e.cityOther = "Please tell us where the wedding is.";
        }
      }

      if (which === 4) {
        if (!values.name.trim()) e.name = "Please tell us your name.";
        if (!values.phone.trim()) e.phone = "A phone number is how you will hear back.";
        else if (!phoneLooksReal(values.phone)) e.phone = "That number doesn’t look right.";
        if (values.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(values.email.trim())) {
          e.email = "That email address doesn’t look right.";
        }
        if (!values.sameWhatsapp && values.whatsapp.trim() && !phoneLooksReal(values.whatsapp)) {
          e.whatsapp = "That WhatsApp number doesn’t look right.";
        }
      }

      return e;
    },
    [values],
  );

  /** Move focus to the new step's heading, so a keyboard user lands in it. */
  const goTo = useCallback((n: number) => {
    setStep(n);
    requestAnimationFrame(() => headingRef.current?.focus());
  }, []);

  function next() {
    const e = validate(step);
    setErrors(e);
    if (Object.keys(e).length > 0) {
      const first = Object.keys(e)[0];
      formRef.current?.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
      return;
    }
    goTo(Math.min(STEPS.length - 1, step + 1));
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    // Every guarded step re-checked, not only the last: she may have gone
    // back and cleared something after passing it the first time.
    const all = GUARDED.reduce(
      (acc, i) => ({ ...acc, ...validate(i) }),
      {} as Partial<Record<keyof Values, string>>,
    );
    if (Object.keys(all).length > 0) {
      setErrors(all);
      goTo(GUARDED.find((i) => Object.keys(validate(i)).length > 0) ?? 0);
      return;
    }

    setStatus("sending");
    setMessage("");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: values.name,
          phone: values.phone,
          whatsapp: values.sameWhatsapp ? values.phone : values.whatsapp,
          email: values.email,
          instagram: values.instagram,
          weddingDate: values.weddingDate,
          city: resolvedCity,
          venue: values.venue,
          events: values.events,
          services: values.services,
          message: values.message,
          startedAt: startedAt.current,
          company: values.company,
        }),
      });

      const body = (await res.json()) as { ok?: boolean; delivered?: boolean; error?: string };

      if (!res.ok || !body.ok) {
        setStatus("error");
        // Never the status code, never the stack (§45).
        setMessage(
          body.error ??
            "Something went wrong. Please try again, or send your date on WhatsApp or Instagram.",
        );
        return;
      }

      const delivered = body.delivered === true;
      track("booking_complete", { city: resolvedCity, events: values.events.join("|"), delivered });
      track("contact_submit", { weddingType: values.events.join("|"), delivered });

      if (delivered) {
        setStatus("sent");
        setMessage("You will hear back with your date’s availability.");
        return;
      }

      setStatus("recorded");
      setMessage(
        "The enquiry inbox isn’t connected yet, so this has been recorded but not delivered to anyone. Please send your date on WhatsApp or Instagram so it isn’t missed — your answers are below to copy.",
      );
    } catch {
      setStatus("error");
      setMessage(
        "The enquiry could not be sent — the connection dropped. Please try again, or message on Instagram.",
      );
    }
  }

  /**
   * THE LAST DOOR (§45).
   *
   * If the enquiry was recorded but not delivered, she is the only one who can
   * carry it. This is a `mailto:` holding everything she typed, so the escape
   * hatch is one tap and not "please write it all out again" — and it depends
   * on no service, no API key and no integration staying up.
   *
   * Rendered only when a real address is configured; never a dead link.
   */
  const mailtoHref = useMemo(() => {
    if (!siteSettings.email) return null;
    const lines = [
      `Name: ${values.name}`,
      `Phone: ${values.phone}`,
      values.email.trim() ? `Email: ${values.email}` : null,
      values.instagram.trim() ? `Instagram: ${values.instagram}` : null,
      `Wedding date: ${values.weddingDate}`,
      `City: ${resolvedCity}`,
      values.venue.trim() ? `Venue: ${values.venue}` : null,
      values.events.length ? `Events: ${values.events.join(", ")}` : null,
      values.services.length ? `Services: ${values.services.join(", ")}` : null,
      values.message.trim() ? `\nNotes:\n${values.message}` : null,
    ].filter(Boolean);

    const subject = `Enquiry — ${values.weddingDate} — ${resolvedCity}`;
    return `mailto:${siteSettings.email}?subject=${encodeURIComponent(
      subject,
    )}&body=${encodeURIComponent(lines.join("\n"))}`;
  }, [values, resolvedCity]);

  const continueHref = useMemo(
    () =>
      whatsappLink(
        whatsappEnquiry({
          date: values.weddingDate,
          city: resolvedCity,
          weddingType: values.events.join(", "),
        }),
      ),
    [values.weddingDate, resolvedCity, values.events],
  );

  /* ── The done state ───────────────────────────────────────────────────────
     A completed enquiry replaces the flow rather than sitting under it. The
     next action is on WhatsApp, so that is what is offered. */
  if (status === "sent" || status === "recorded") {
    const arrived = status === "sent";

    return (
      <div role="status" aria-live="polite" className="max-w-xl">
        {/* ── THE HEADLINE TELLS THE TRUTH ABOUT WHERE IT WENT ─────────────
            "Received" is a claim about an inbox, and it is only made when the
            route confirms an inbox actually took it. When nothing did, the
            word is "recorded" and the difference is spelled out underneath.
            A success screen that lies is worse than an error screen. */}
        <p className="eyebrow !text-champagne">
          {arrived ? "Enquiry sent" : "Enquiry recorded"}
        </p>
        <p className="display-md mt-5 text-ivory">
          {arrived ? "Your enquiry has" : "Your enquiry has"}
          <br />
          <span className="italic-serif text-champagne">
            {arrived ? "been received." : "been recorded."}
          </span>
        </p>
        <p className="body-lg mt-6">{message}</p>

        {/* Not delivered means she is the one who has to carry it. Her own
            answers stay on screen so she can copy them into WhatsApp or
            Instagram rather than retyping six steps from memory. */}
        {!arrived && (
          <dl className="mt-10 divide-y divide-ivory/10 border-y border-ivory/10">
            {[
              ["Date", values.weddingDate],
              ["Location", [resolvedCity, values.venue].filter(Boolean).join(" · ")],
              ["Events", values.events.join(", ")],
              ["Services", values.services.join(", ")],
              ["You", [values.name, values.phone].filter(Boolean).join(" · ")],
            ]
              .filter(([, v]) => v)
              .map(([label, value]) => (
                <div key={label} className="flex items-baseline justify-between gap-6 py-3.5">
                  <dt className="eyebrow shrink-0">{label}</dt>
                  <dd className="text-right text-sm text-ivory/85">{value}</dd>
                </div>
              ))}
          </dl>
        )}

        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          {continueHref && (
            <a
              href={continueHref}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => track("whatsapp_click", { placement: "booking-success" })}
              className="btn"
            >
              WhatsApp Lana
            </a>
          )}
          {/* Only offered when delivery actually failed — on a successful
              send it would invite her to write the same thing twice. */}
          {!arrived && mailtoHref && (
            <a href={mailtoHref} className="btn btn-ghost">
              Email it instead
            </a>
          )}

          <a
            href={siteSettings.instagram}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => track("instagram_click", { placement: "booking-success" })}
            className="btn btn-ghost"
          >
            {siteSettings.instagramHandle}
          </a>
        </div>
      </div>
    );
  }

  const last = step === STEPS.length - 1;

  return (
    <form ref={formRef} onSubmit={onSubmit} noValidate className="max-w-2xl">
      {/* Honeypot (§49) — bots fill it, humans never see it. `hidden` rather
          than off-screen, and tabIndex -1, so it is unreachable by keyboard
          and invisible to a screen reader as well as to the eye. */}
      <div className="hidden" aria-hidden="true">
        <label htmlFor="company">Company</label>
        <input
          id="company"
          name="company"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={values.company}
          onChange={(e) => setValues((v) => ({ ...v, company: e.target.value }))}
        />
      </div>

      {/* ── Progress ───────────────────────────────────────────────────────
          Six marks rather than a percentage: she can see how much is left,
          and that it is short. The line beneath is what a screen reader
          hears when the step changes. */}
      <div className="mb-10">
        <ol className="flex items-center gap-1.5" aria-hidden="true">
          {STEPS.map((s, i) => (
            <li
              key={s}
              className={cx(
                "h-px flex-1 transition-colors duration-[var(--d-base)]",
                i <= step ? "bg-champagne" : "bg-ivory/18",
              )}
            />
          ))}
        </ol>
        <p
          ref={headingRef}
          tabIndex={-1}
          aria-live="polite"
          className="eyebrow mt-4 !text-champagne/80 focus:outline-none"
        >
          Step {step + 1} of {STEPS.length} — {STEPS[step]}
        </p>
      </div>

      {/* ── 01 DATE ────────────────────────────────────────────────────────── */}
      {step === 0 && (
        <fieldset>
          <legend className="display-sm font-display text-ivory">What’s your wedding date?</legend>
          <p className="body-base measure-note mt-3">
            If the date isn’t fixed yet, give the closest you have — it can be changed later.
          </p>

          <div className="mt-9">
            <label htmlFor="weddingDate" className="eyebrow mb-3 block">
              Wedding date *
            </label>
            <input
              id="weddingDate"
              name="weddingDate"
              type="date"
              value={values.weddingDate}
              onChange={(e) => set("weddingDate", e.target.value)}
              aria-invalid={errors.weddingDate ? true : undefined}
              aria-describedby={errors.weddingDate ? "err-weddingDate" : undefined}
              className={cx(field, "max-w-xs [color-scheme:dark]")}
            />
            <FieldError id="err-weddingDate" message={errors.weddingDate} />
          </div>
        </fieldset>
      )}

      {/* ── 02 LOCATION ────────────────────────────────────────────────────── */}
      {step === 1 && (
        <fieldset>
          <legend className="display-sm font-display text-ivory">Where is your wedding?</legend>
          <p className="body-base measure-note mt-3">{siteSettings.travelNote}</p>

          <div className="mt-9">
            <p className="eyebrow mb-4" id="city-label">
              City *
            </p>
            <div className="flex flex-wrap gap-2.5" role="group" aria-labelledby="city-label">
              {[...serviceCities, OTHER_CITY].map((c) => (
                <label key={c} className={cx(chip, values.city === c ? chipOn : chipOff)}>
                  {/* A real radio, visually replaced. The keyboard and the
                      screen reader get the native control; the eye gets the
                      chip. `sr-only` rather than `hidden` — a hidden input is
                      not focusable, which would strand keyboard users here. */}
                  <input
                    type="radio"
                    name="city"
                    value={c}
                    checked={values.city === c}
                    onChange={() => set("city", c)}
                    aria-describedby={errors.city ? "err-city" : undefined}
                    className="sr-only"
                  />
                  {c}
                </label>
              ))}
            </div>
            <FieldError id="err-city" message={errors.city} />

            {values.city === OTHER_CITY && (
              <div className="mt-8">
                <label htmlFor="cityOther" className="eyebrow mb-3 block">
                  Which city or town? *
                </label>
                <input
                  id="cityOther"
                  name="cityOther"
                  type="text"
                  value={values.cityOther}
                  onChange={(e) => set("cityOther", e.target.value)}
                  aria-invalid={errors.cityOther ? true : undefined}
                  aria-describedby={errors.cityOther ? "err-cityOther" : undefined}
                  className={field}
                />
                <FieldError id="err-cityOther" message={errors.cityOther} />
              </div>
            )}

            <div className="mt-8">
              <label htmlFor="venue" className="eyebrow mb-3 block">
                Venue
              </label>
              <input
                id="venue"
                name="venue"
                type="text"
                value={values.venue}
                onChange={(e) => set("venue", e.target.value)}
                placeholder="Hall, hotel or home"
                className={field}
              />
            </div>
          </div>
        </fieldset>
      )}

      {/* ── 03 EVENTS ──────────────────────────────────────────────────────── */}
      {step === 2 && (
        <fieldset>
          <legend className="display-sm font-display text-ivory">Which events?</legend>
          <p className="body-base measure-note mt-3">
            Choose as many as apply. Each event is a different look and a different morning.
          </p>
          <CheckGrid
            name="events"
            options={EVENTS}
            selected={values.events}
            onToggle={(v) => toggle("events", v)}
          />
        </fieldset>
      )}

      {/* ── 04 SERVICES ────────────────────────────────────────────────────── */}
      {step === 3 && (
        <fieldset>
          <legend className="display-sm font-display text-ivory">What do you need?</legend>
          <p className="body-base measure-note mt-3">
            Say how many people need makeup, not only the bride — it decides how the morning is
            timed. There is room for that on the next step.
          </p>
          <CheckGrid
            name="services"
            options={SERVICES}
            selected={values.services}
            onToggle={(v) => toggle("services", v)}
          />
        </fieldset>
      )}

      {/* ── 05 DETAILS ─────────────────────────────────────────────────────── */}
      {step === 4 && (
        <fieldset>
          <legend className="display-sm font-display text-ivory">How do we reach you?</legend>
          <p className="body-base measure-note mt-3">
            A name and a number is enough. Everything else is optional.
          </p>

          <div className="mt-9 grid gap-x-10 gap-y-8 sm:grid-cols-2">
            <div>
              <label htmlFor="name" className="eyebrow mb-3 block">
                Name *
              </label>
              <input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                value={values.name}
                onChange={(e) => set("name", e.target.value)}
                aria-invalid={errors.name ? true : undefined}
                aria-describedby={errors.name ? "err-name" : undefined}
                className={field}
              />
              <FieldError id="err-name" message={errors.name} />
            </div>

            <div>
              <label htmlFor="phone" className="eyebrow mb-3 block">
                Phone *
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                placeholder="+91"
                value={values.phone}
                onChange={(e) => set("phone", e.target.value)}
                aria-invalid={errors.phone ? true : undefined}
                aria-describedby={errors.phone ? "err-phone" : undefined}
                className={field}
              />
              <FieldError id="err-phone" message={errors.phone} />
            </div>

            <div className="sm:col-span-2">
              <label className="flex cursor-pointer items-center gap-3 py-1 text-sm text-ivory/75">
                <input
                  type="checkbox"
                  checked={values.sameWhatsapp}
                  onChange={(e) => set("sameWhatsapp", e.target.checked)}
                  className="h-4 w-4 shrink-0 appearance-none border border-ivory/30 bg-transparent checked:border-champagne checked:bg-champagne focus-visible:outline focus-visible:outline-2 focus-visible:outline-champagne"
                />
                This number is on WhatsApp
              </label>

              {!values.sameWhatsapp && (
                <div className="mt-6">
                  <label htmlFor="whatsapp" className="eyebrow mb-3 block">
                    WhatsApp number
                  </label>
                  <input
                    id="whatsapp"
                    name="whatsapp"
                    type="tel"
                    inputMode="tel"
                    value={values.whatsapp}
                    onChange={(e) => set("whatsapp", e.target.value)}
                    aria-invalid={errors.whatsapp ? true : undefined}
                    aria-describedby={errors.whatsapp ? "err-whatsapp" : undefined}
                    className={field}
                  />
                  <FieldError id="err-whatsapp" message={errors.whatsapp} />
                </div>
              )}
            </div>

            <div>
              <label htmlFor="email" className="eyebrow mb-3 block">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                value={values.email}
                onChange={(e) => set("email", e.target.value)}
                aria-invalid={errors.email ? true : undefined}
                aria-describedby={errors.email ? "err-email" : undefined}
                className={field}
              />
              <FieldError id="err-email" message={errors.email} />
            </div>

            <div>
              <label htmlFor="instagram" className="eyebrow mb-3 block">
                Instagram
              </label>
              <input
                id="instagram"
                name="instagram"
                type="text"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                placeholder="@"
                value={values.instagram}
                onChange={(e) => set("instagram", e.target.value)}
                className={field}
              />
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="message" className="eyebrow mb-3 block">
                Anything else
              </label>
              <textarea
                id="message"
                name="message"
                rows={4}
                value={values.message}
                onChange={(e) => set("message", e.target.value)}
                placeholder="How many people need makeup, any allergy or sensitivity, the look you have in mind."
                className={cx(field, "resize-y")}
              />
            </div>
          </div>
        </fieldset>
      )}

      {/* ── 06 REVIEW ──────────────────────────────────────────────────────── */}
      {step === 5 && (
        <fieldset>
          <legend className="display-sm font-display text-ivory">Ready to send.</legend>
          <p className="body-base measure-note mt-3">
            You will be told plainly whether the date is open.
          </p>

          <dl className="mt-9 divide-y divide-ivory/10 border-y border-ivory/10">
            <Row label="Date" value={values.weddingDate} onEdit={() => goTo(0)} />
            <Row
              label="Location"
              value={[resolvedCity, values.venue].filter(Boolean).join(" · ")}
              onEdit={() => goTo(1)}
            />
            <Row label="Events" value={values.events.join(", ")} onEdit={() => goTo(2)} />
            <Row label="Services" value={values.services.join(", ")} onEdit={() => goTo(3)} />
            <Row
              label="You"
              value={[values.name, values.phone].filter(Boolean).join(" · ")}
              onEdit={() => goTo(4)}
            />
          </dl>
        </fieldset>
      )}

      {/* ── Controls ───────────────────────────────────────────────────────── */}
      <div className="mt-12 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
        {/* ── THE KEYS ARE LOAD-BEARING ────────────────────────────────────
            Both branches render a <button> in the same position, so React
            reconciles them into the SAME DOM node and mutates its attributes
            in place. That meant the click that advanced step 5 → 6 flipped
            the node's `type` from "button" to "submit" DURING the click
            dispatch, and the browser then performed the default action of a
            submit button: it sent the enquiry. A bride clicking "Continue" on
            the details step submitted without ever seeing the review.

            Distinct keys force React to unmount one and mount the other, so
            the node the click landed on is never the node that submits. */}
        {last ? (
          <button
            key="submit"
            type="submit"
            disabled={status === "sending"}
            className="btn order-1 w-full disabled:opacity-50 sm:order-2 sm:w-auto"
          >
            {status === "sending" ? "Sending…" : "Check availability"}
          </button>
        ) : (
          <button
            key="continue"
            type="button"
            onClick={next}
            className="btn order-1 w-full sm:order-2 sm:w-auto"
          >
            Continue
          </button>
        )}

        {step > 0 && (
          <button
            type="button"
            onClick={() => goTo(step - 1)}
            className="btn btn-ghost order-2 w-full sm:order-1 sm:w-auto"
          >
            Back
          </button>
        )}
      </div>

      {/* The one place a submission failure is reported (§45). */}
      <p role="status" aria-live="polite" className="mt-6 min-h-[1.5rem] text-sm text-rose">
        {status === "error" ? message : ""}
      </p>
    </form>
  );
}

/* ── Small internals ──────────────────────────────────────────────────────── */

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} className="mt-3 text-sm text-rose">
      {message}
    </p>
  );
}

/** A multi-select as real checkboxes, styled as chips. */
function CheckGrid({
  name,
  options,
  selected,
  onToggle,
}: {
  name: string;
  options: readonly string[];
  selected: string[];
  onToggle: (value: string) => void;
}) {
  return (
    <div className="mt-9 flex flex-wrap gap-2.5">
      {options.map((o) => {
        const on = selected.includes(o);
        return (
          <label key={o} className={cx(chip, on ? chipOn : chipOff)}>
            <input
              type="checkbox"
              name={name}
              value={o}
              checked={on}
              onChange={() => onToggle(o)}
              className="sr-only"
            />
            {o}
          </label>
        );
      })}
    </div>
  );
}

/** One reviewed answer, with a way back to the step that set it. */
function Row({ label, value, onEdit }: { label: string; value: string; onEdit: () => void }) {
  return (
    <div className="flex items-baseline justify-between gap-6 py-4">
      <dt className="eyebrow shrink-0">{label}</dt>
      <dd className="flex flex-1 items-baseline justify-end gap-5 text-right">
        <span className="text-sm text-ivory/85">{value || "—"}</span>
        <button
          type="button"
          onClick={onEdit}
          className="link-wipe shrink-0 text-[0.7rem] uppercase tracking-[0.2em] text-champagne/80 hover:text-champagne"
        >
          Edit<span className="sr-only"> {label.toLowerCase()}</span>
        </button>
      </dd>
    </div>
  );
}

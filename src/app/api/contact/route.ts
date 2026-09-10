import { NextResponse } from "next/server";
import { saveEnquiry, storeIsConfigured } from "@/lib/enquiries";

export const runtime = "nodejs";

/**
 * ENQUIRY ENDPOINT
 *
 * Validates and normalises a booking enquiry, then tries two independent
 * sinks. Neither is required for the route to succeed, and the response says
 * plainly which of them actually happened — the client renders a different
 * message when nothing was delivered, so a bride is never told her enquiry
 * "has been received" by an inbox that does not exist.
 *
 *   1. Email via Resend      — RESEND_API_KEY + CONTACT_TO_EMAIL
 *   2. Durable log via KV    — KV_REST_API_URL + KV_REST_API_TOKEN
 *
 * See `.env.example`. Both are optional; with neither set the enquiry is still
 * validated and written to the server log.
 */

interface Enquiry {
  name: string;
  phone: string;
  /**
   * Optional since the six-step flow (§12). Email was required by the old
   * single-page form; for a bride arriving from Instagram on a phone, a phone
   * number IS the contact detail and demanding an address as well cost
   * completions for nothing. `email` is still validated when supplied.
   */
  email?: string;
  weddingDate: string;
  city: string;
  venue?: string;
  /** Multi-select (§12 step 3). `weddingType` is the legacy single value. */
  events?: string[];
  weddingType?: string;
  services?: string[];
  whatsapp?: string;
  instagram?: string;
  people?: string;
  message?: string;
}

/**
 * PHONE (§48).
 *
 * Indian mobile numbers are ten digits beginning 6–9, optionally carrying the
 * 91 country code and any amount of spacing, dashes or brackets in between.
 * International numbers are accepted too — Lana travels, and a bride planning
 * from Dubai or Singapore is not an error state.
 *
 * Deliberately permissive at the edges and strict in the middle: the job here
 * is to catch a typo, not to adjudicate the global numbering plan.
 */
function phoneLooksReal(input: string): boolean {
  const digits = input.replace(/\D/g, "");
  // 91 + ten digits, or a bare ten-digit Indian mobile.
  if (/^(91)?[6-9]\d{9}$/.test(digits)) return true;
  // Anything else that is plausibly a phone number at all.
  return digits.length >= 8 && digits.length <= 15;
}

function bad(error: string, status = 400) {
  return NextResponse.json({ ok: false, error }, { status });
}

/**
 * The From address, when CONTACT_FROM_EMAIL is unset.
 *
 * ⚠ A SENDER MUST BE ON A DOMAIN VERIFIED IN RESEND, or the send is rejected
 *   and the enquiry is not delivered.
 *
 * This used to derive the sender from NEXT_PUBLIC_SITE_URL unconditionally,
 * which was a trap armed and waiting: that variable gets set for canonicals
 * and SEO long before there is a custom domain, and the moment it was set on
 * this project the From became `enquiries@lanas-makeover.vercel.app` — a
 * domain nobody can verify, because nobody owns it. Every send would have been
 * rejected, the form would have gone back to "not connected", and the cause
 * would have looked like an SEO change.
 *
 * So the host is only used when it is a REAL domain. Platform hosts —
 * vercel.app, localhost, raw IPs — fall through to Resend's own onboarding
 * sender, which works without any DNS at all.
 *
 * `onboarding@resend.dev` has one limit worth knowing: it can only deliver to
 * the address that owns the Resend account. That is fine for the studio's own
 * inbox and is exactly the shape of this use case; a custom domain removes the
 * limit whenever the real one is attached.
 */
function defaultFrom(): string {
  const url = process.env.NEXT_PUBLIC_SITE_URL;
  try {
    if (url) {
      const host = new URL(url).hostname.replace(/^www\./, "");
      const isPlatformHost =
        host === "localhost" ||
        host.endsWith(".vercel.app") ||
        host.endsWith(".localhost") ||
        /^\d{1,3}(\.\d{1,3}){3}$/.test(host);
      if (!isPlatformHost) return `enquiries@${host}`;
    }
  } catch {
    /* fall through */
  }
  return "onboarding@resend.dev";
}

function plainText(enquiry: Enquiry, receivedAt: string): string {
  const rows: [string, string | undefined][] = [
    ["Name", enquiry.name],
    ["Phone", enquiry.phone],
    ["Email", enquiry.email],
    ["WhatsApp", enquiry.whatsapp],
    ["Instagram", enquiry.instagram],
    ["Wedding date", enquiry.weddingDate],
    ["Wedding city", enquiry.city],
    ["Venue", enquiry.venue],
    ["Events", enquiry.events?.join(", ") ?? enquiry.weddingType],
    ["Services", enquiry.services?.join(", ")],
    ["People", enquiry.people],
    ["Received", receivedAt],
  ];

  return [
    ...rows.filter(([, v]) => v).map(([k, v]) => `${k}: ${v}`),
    "",
    "Message:",
    enquiry.message?.trim() || "(none)",
  ].join("\n");
}

/** Sends the enquiry by email. Returns an error string, or null on success. */
async function sendEmail(enquiry: Enquiry, receivedAt: string): Promise<string | null> {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO_EMAIL;
  if (!apiKey || !to) return "not configured";

  try {
    const { Resend } = await import("resend");
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from: process.env.CONTACT_FROM_EMAIL ?? defaultFrom(),
      to,
      // Reply-to only when she actually gave an address; Resend rejects "".
      ...(enquiry.email ? { replyTo: enquiry.email } : {}),
      subject: `Enquiry — ${enquiry.weddingDate} — ${enquiry.city}`,
      text: plainText(enquiry, receivedAt),
    });
    if (error) {
      console.error("[enquiry] email failed", error);
      return error.message ?? "send failed";
    }
    return null;
  } catch (err) {
    console.error("[enquiry] email threw", err);
    return err instanceof Error ? err.message : "send failed";
  }
}

/**
 * The durable copy. Both halves of the credential are now required — checking
 * only KV_REST_API_URL meant a half-configured store looked connected and then
 * threw on every write.
 *
 * The write itself lives in `lib/enquiries.ts` alongside the read, so the key
 * and the shape cannot drift apart. Never fails the request.
 */
async function store(enquiry: Enquiry, receivedAt: string): Promise<boolean> {
  if (!storeIsConfigured()) return false;
  return saveEnquiry({ ...enquiry, receivedAt });
}

export async function POST(request: Request) {
  let payload: Record<string, unknown>;

  try {
    payload = (await request.json()) as Record<string, unknown>;
  } catch {
    return bad("Malformed request.");
  }

  // Honeypot: silently accept so bots don't learn anything.
  if (typeof payload.company === "string" && payload.company.trim() !== "") {
    return NextResponse.json({ ok: true, delivered: true, stored: false });
  }

  const str = (k: string) => (typeof payload[k] === "string" ? (payload[k] as string).trim() : "");

  /**
   * ANTI-SPAM, SECOND GATE (§49).
   *
   * The honeypot above catches the naive bots. This catches the ones that fill
   * it correctly: `startedAt` is stamped when the flow is first interacted
   * with, and no human completes the enquiry in under three seconds. Silently
   * accepted rather than rejected, for the same reason as the honeypot — a
   * script that learns which rule it tripped simply adjusts.
   *
   * Deliberately NOT a CAPTCHA. A bride on a phone in an Instagram in-app
   * browser should not have to identify traffic lights to ask about a date.
   */
  const startedAt = Number(payload.startedAt);
  const tooFast = Number.isFinite(startedAt) && startedAt > 0 && Date.now() - startedAt < 3000;
  if (tooFast) {
    /**
     * A FALSE POSITIVE HERE MUST NOT LOSE A REAL ENQUIRY.
     *
     * The time gate is a heuristic, and a heuristic on a form that a human
     * fills in is a heuristic that will eventually be wrong about a human.
     * So the response is silent (a script that learns which rule it tripped
     * simply adjusts) but the submission is still written to the server log,
     * under its own marker, where it can be found and answered.
     */
    console.warn("[enquiry:trapped]", {
      reason: "submitted faster than a human fills the enquiry",
      elapsedMs: Date.now() - startedAt,
      payload,
    });
    return NextResponse.json({ ok: true, delivered: true, stored: false });
  }

  /** A list field, tolerant of the single-string legacy shape. */
  const list = (k: string): string[] | undefined => {
    const v = payload[k];
    if (Array.isArray(v)) {
      const out = v.filter((x): x is string => typeof x === "string" && x.trim() !== "");
      return out.length ? out.slice(0, 20).map((x) => x.trim().slice(0, 120)) : undefined;
    }
    return str(k) ? [str(k)] : undefined;
  };

  const enquiry: Enquiry = {
    name: str("name"),
    phone: str("phone"),
    email: str("email") || undefined,
    weddingDate: str("weddingDate"),
    city: str("city"),
    venue: str("venue") || undefined,
    events: list("events"),
    weddingType: str("weddingType") || undefined,
    services: list("services"),
    whatsapp: str("whatsapp") || undefined,
    instagram: str("instagram") || undefined,
    people: str("people") || undefined,
    message: str("message") || undefined,
  };

  if (!enquiry.name || !enquiry.phone || !enquiry.weddingDate || !enquiry.city) {
    return bad("Please complete every required field.");
  }
  if (enquiry.email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(enquiry.email)) {
    return bad("That email address doesn't look right.");
  }
  if (!phoneLooksReal(enquiry.phone)) {
    return bad("That phone number doesn't look right.");
  }
  if ((enquiry.message?.length ?? 0) > 4000) {
    return bad("That message is too long.");
  }

  const receivedAt = new Date().toISOString();

  // Server-side record. Visible in `vercel logs` regardless of the sinks below.
  console.info("[enquiry]", { ...enquiry, receivedAt });

  const [emailError, stored] = await Promise.all([
    sendEmail(enquiry, receivedAt),
    store(enquiry, receivedAt),
  ]);

  const delivered = emailError === null;

  /**
   * NOTHING GETS LOST QUIETLY.
   *
   * A delivery that failed is logged again, at error level, under its own
   * marker and with the whole enquiry attached. `[enquiry]` above is the
   * routine record; this one is the alarm, and it is the line to search for
   * when a bride says she wrote and nobody replied.
   */
  if (!delivered) {
    console.error("[enquiry:undelivered]", {
      reason: emailError,
      storedInKv: stored,
      enquiry,
      receivedAt,
    });
  }

  return NextResponse.json({
    ok: true,
    delivered,
    stored,
    note: delivered
      ? undefined
      : emailError === "not configured"
        ? "Recorded server-side; email delivery is not configured yet."
        : `Recorded server-side; email delivery failed (${emailError}).`,
  });
}

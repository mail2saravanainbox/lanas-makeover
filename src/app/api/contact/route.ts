import { NextResponse } from "next/server";

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
  email: string;
  weddingDate: string;
  city: string;
  weddingType?: string;
  services?: string[];
  people?: string;
  message?: string;
}

function bad(error: string, status = 400) {
  return NextResponse.json({ ok: false, error }, { status });
}

/** `enquiries@<site host>` — a sane default when CONTACT_FROM_EMAIL is unset. */
function defaultFrom(): string {
  const url = process.env.NEXT_PUBLIC_SITE_URL;
  try {
    if (url) return `enquiries@${new URL(url).hostname.replace(/^www\./, "")}`;
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
    ["Wedding date", enquiry.weddingDate],
    ["Wedding city", enquiry.city],
    ["Wedding type", enquiry.weddingType],
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
      replyTo: enquiry.email,
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

/** Appends the enquiry to a capped KV list. Never fails the request. */
async function store(enquiry: Enquiry, receivedAt: string): Promise<boolean> {
  if (!process.env.KV_REST_API_URL) return false;

  try {
    const { kv } = await import("@vercel/kv");
    await kv.lpush("enquiries", JSON.stringify({ ...enquiry, receivedAt }));
    await kv.ltrim("enquiries", 0, 999);
    return true;
  } catch (err) {
    console.error("[enquiry] kv write failed", err);
    return false;
  }
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

  const enquiry: Enquiry = {
    name: str("name"),
    phone: str("phone"),
    email: str("email"),
    weddingDate: str("weddingDate"),
    city: str("city"),
    weddingType: str("weddingType") || undefined,
    services: Array.isArray(payload.services)
      ? (payload.services as string[])
      : str("services")
        ? [str("services")]
        : undefined,
    people: str("people") || undefined,
    message: str("message") || undefined,
  };

  if (!enquiry.name || !enquiry.phone || !enquiry.email || !enquiry.weddingDate || !enquiry.city) {
    return bad("Please complete every required field.");
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(enquiry.email)) {
    return bad("That email address doesn't look right.");
  }
  if (enquiry.phone.replace(/\D/g, "").length < 8) {
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

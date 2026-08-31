import { NextResponse } from "next/server";

export const runtime = "nodejs";

/**
 * ENQUIRY ENDPOINT
 *
 * Validates and normalises a booking enquiry. It deliberately does NOT ship
 * with an email provider wired in — sending mail requires credentials that
 * belong to Lana, not to this repository.
 *
 * TODO(client): pick one and add it below. The client component never changes.
 *   · Resend      — CONTACT_TO_EMAIL + RESEND_API_KEY
 *   · Formspree / Getform — a single fetch to their endpoint
 *   · A CRM / Google Sheet webhook
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

export async function POST(request: Request) {
  let payload: Record<string, unknown>;

  try {
    payload = (await request.json()) as Record<string, unknown>;
  } catch {
    return bad("Malformed request.");
  }

  // Honeypot: silently accept so bots don't learn anything.
  if (typeof payload.company === "string" && payload.company.trim() !== "") {
    return NextResponse.json({ ok: true });
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

  // Server-side record. Visible in `vercel logs` until an inbox is wired up.
  console.info("[enquiry]", {
    ...enquiry,
    receivedAt: new Date().toISOString(),
  });

  const configured = Boolean(process.env.CONTACT_TO_EMAIL && process.env.RESEND_API_KEY);

  return NextResponse.json({
    ok: true,
    delivered: configured,
    // Honest about what happened: recorded, not necessarily emailed.
    note: configured ? undefined : "Recorded server-side; email delivery is not configured yet.",
  });
}

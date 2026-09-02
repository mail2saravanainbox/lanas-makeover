import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Admin",
  path: "/admin/login",
  noIndex: true,
});

export const dynamic = "force-dynamic";

/**
 * The /admin gate. A real form posting to a real endpoint, so it works with
 * JavaScript disabled and has no client bundle of its own.
 */
export default async function AdminLogin({
  searchParams,
}: {
  searchParams: Promise<{ e?: string }>;
}) {
  const { e } = await searchParams;

  return (
    <div className="shell flex min-h-dvh items-center justify-center py-[var(--s-16)]">
      <form
        method="POST"
        action="/api/admin/login"
        className="w-full max-w-sm"
        aria-labelledby="admin-login-title"
      >
        <p className="eyebrow mb-4">Restricted</p>
        <h1 id="admin-login-title" className="display-sm mb-8 text-ivory">
          Admin
        </h1>

        <label htmlFor="password" className="eyebrow mb-3 block">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          autoFocus
          className="w-full border-0 border-b border-ivory/20 bg-transparent px-0 py-3 text-ivory transition-colors duration-[var(--d-base)] focus:border-champagne focus:outline-none"
        />

        <p role="status" aria-live="polite" className="mt-5 text-sm text-rose">
          {e ? "That password is not correct." : " "}
        </p>

        <button type="submit" className="btn mt-6 w-full">
          Enter
        </button>
      </form>
    </div>
  );
}

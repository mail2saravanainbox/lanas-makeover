import Link from "next/link";
import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Page not found",
  path: "/404",
  noIndex: true,
});

export default function NotFound() {
  return (
    <section className="relative flex min-h-[100dvh] items-center justify-center overflow-hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(55% 45% at 50% 45%, rgba(160,122,78,0.18) 0%, rgba(10,8,6,0) 70%)",
        }}
      />

      <div className="shell relative text-center">
        <p className="eyebrow mb-8">404</p>
        <h1 className="display-lg mx-auto max-w-[16ch] text-balance text-ivory">
          This page didn’t make it
          <br />
          <span className="italic-serif text-champagne">to the ceremony.</span>
        </h1>
        <p className="body-lg mx-auto mt-9 max-w-md">
          The link may have changed, or the page may never have existed. Everything else is
          still here.
        </p>

        <div className="mt-12 flex flex-wrap justify-center gap-4">
          <Link href="/" className="btn">
            Back to the beginning
          </Link>
          <Link href="/portfolio" className="btn btn-ghost">
            See the work
          </Link>
        </div>
      </div>
    </section>
  );
}

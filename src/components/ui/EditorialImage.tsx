import Image from "next/image";
import type { ImageRef } from "@/lib/types";
import { siteSettings } from "@/content/site";
import PlaceholderPlate from "./PlaceholderPlate";

/**
 * The only image component in the app.
 *
 *  · `image.src` set  → next/image, responsive, lazy, AVIF/WebP
 *  · `image.src` unset → a marked PlaceholderPlate
 *
 * Swapping the entire site from placeholders to Lana's photography is
 * therefore a content-file edit, not a component rewrite.
 */
export interface EditorialImageProps {
  image: ImageRef;
  className?: string;
  /** Responsive `sizes`. Always pass a real value for above-the-fold imagery. */
  sizes?: string;
  priority?: boolean;
  /** Hides the placeholder badge for decorative/background usage. */
  decorative?: boolean;
  badgeLabel?: string;
}

export default function EditorialImage({
  image,
  className,
  sizes = "(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 40vw",
  priority = false,
  decorative = false,
  badgeLabel,
}: EditorialImageProps) {
  if (!image.src) {
    return (
      <PlaceholderPlate
        tone={image.tone}
        seed={image.seed ?? 1}
        className={className}
        badge={!decorative && siteSettings.showPlaceholderBadges}
        badgeLabel={badgeLabel}
      />
    );
  }

  const position = image.focus
    ? `${(image.focus.x * 100).toFixed(1)}% ${(image.focus.y * 100).toFixed(1)}%`
    : "center";

  return (
    <div className={`relative overflow-hidden ${className ?? ""}`}>
      <Image
        src={image.src}
        alt={decorative ? "" : image.alt}
        fill
        sizes={sizes}
        priority={priority}
        loading={priority ? undefined : "lazy"}
        // A blur-up generated from the photograph itself, when the import
        // pipeline produced one. Never a generic shimmer.
        {...(image.blurDataURL
          ? { placeholder: "blur" as const, blurDataURL: image.blurDataURL }
          : {})}
        className="object-cover"
        style={{ objectPosition: position }}
        aria-hidden={decorative || undefined}
      />
    </div>
  );
}

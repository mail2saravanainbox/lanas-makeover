import raw from "./rental.json";
import type { RentalItem } from "@/lib/types";

/**
 * The rental catalogue, read from the file scripts/import-rental.mjs writes.
 *
 * Unpublished items are filtered here, once, so no page has to remember to do
 * it — the same gate the portfolio provider applies.
 */
const all = (raw.items ?? []) as RentalItem[];

export const rentalItems = (): RentalItem[] =>
  all.filter((i) => i.published).sort((a, b) => a.sortOrder - b.sortOrder);

export const rentalItemsFor = (categoryKey: string): RentalItem[] =>
  rentalItems().filter((i) => i.category === categoryKey);

export const rentalCount = (categoryKey: string): number => rentalItemsFor(categoryKey).length;

import type { Metadata } from "next";
import CityRoute, { cityMetadata } from "@/app/_city/CityRoute";

/** See src/app/_city/CityRoute.tsx for why this is a folder and not a param. */
export const revalidate = 3600;

export const metadata: Metadata = cityMetadata("chennai");

export default function Page() {
  return <CityRoute slug="chennai" />;
}

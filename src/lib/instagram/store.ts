import "server-only";
import { promises as fs } from "node:fs";
import path from "node:path";
import os from "node:os";
import type { PortfolioItem } from "@/lib/types";

/**
 * Synced-media store.
 *
 * Deliberately small and swappable. Two layers:
 *   1. a module-level cache (survives warm serverless invocations)
 *   2. a JSON file in the OS temp dir (survives across invocations on one box)
 *
 * ⚠ PRODUCTION NOTE: serverless filesystems are ephemeral and not shared
 *   between instances. Before relying on Instagram as the live content source,
 *   swap `readDisk`/`writeDisk` for durable storage — Vercel KV / Postgres /
 *   Blob, or your CMS. That is the only change required; every caller and every
 *   component stays exactly as it is.
 */

interface StoreShape {
  items: PortfolioItem[];
  syncedAt: string | null;
}

const FILE = path.join(os.tmpdir(), "lanas-makeover-instagram-cache.json");
const EMPTY: StoreShape = { items: [], syncedAt: null };

let memory: StoreShape | null = null;

async function readDisk(): Promise<StoreShape> {
  try {
    const raw = await fs.readFile(FILE, "utf8");
    const parsed = JSON.parse(raw) as StoreShape;
    if (!Array.isArray(parsed.items)) return EMPTY;
    return parsed;
  } catch {
    return EMPTY;
  }
}

async function writeDisk(data: StoreShape): Promise<void> {
  try {
    await fs.writeFile(FILE, JSON.stringify(data), "utf8");
  } catch {
    // Read-only filesystem — the memory cache still serves this instance.
  }
}

export async function readStore(): Promise<StoreShape> {
  if (memory) return memory;
  memory = await readDisk();
  return memory;
}

export async function writeStore(items: PortfolioItem[], syncedAt: string): Promise<void> {
  memory = { items, syncedAt };
  await writeDisk(memory);
}

/** Used by tests and by the admin "reset" affordance. */
export function clearMemoryCache(): void {
  memory = null;
}

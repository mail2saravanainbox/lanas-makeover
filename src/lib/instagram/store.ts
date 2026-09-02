import "server-only";
import type { PortfolioItem } from "@/lib/types";

/**
 * Synced-media store.
 *
 * Three layers, in order of preference:
 *   1. a module-level cache (survives warm serverless invocations)
 *   2. Vercel KV, when configured — DURABLE and shared across every instance
 *   3. nothing: an empty store, honestly empty
 *
 * The OS temp file this used to write is gone. On serverless it was worse than
 * useless: each instance had its own filesystem, so a sync on one box was
 * invisible to every other, and the whole thing evaporated on redeploy. The
 * store looked persistent and was not.
 *
 * With no KV configured the store is memory-only, which is correct behaviour
 * for local development and honest behaviour in production — the admin page
 * reports the sync time it actually has.
 */

interface StoreShape {
  items: PortfolioItem[];
  syncedAt: string | null;
}

const KEY = "instagram:store";
const EMPTY: StoreShape = { items: [], syncedAt: null };

let memory: StoreShape | null = null;

function kvConfigured(): boolean {
  return Boolean(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);
}

async function readKv(): Promise<StoreShape> {
  if (!kvConfigured()) return EMPTY;
  try {
    const { kv } = await import("@vercel/kv");
    const stored = await kv.get<StoreShape>(KEY);
    if (!stored || !Array.isArray(stored.items)) return EMPTY;
    return stored;
  } catch (err) {
    console.error("[instagram] kv read failed", err);
    return EMPTY;
  }
}

async function writeKv(data: StoreShape): Promise<void> {
  if (!kvConfigured()) return;
  try {
    const { kv } = await import("@vercel/kv");
    await kv.set(KEY, data);
  } catch (err) {
    // The memory cache still serves this instance; the next sync retries.
    console.error("[instagram] kv write failed", err);
  }
}

export async function readStore(): Promise<StoreShape> {
  if (memory) return memory;
  memory = await readKv();
  return memory;
}

export async function writeStore(items: PortfolioItem[], syncedAt: string): Promise<void> {
  memory = { items, syncedAt };
  await writeKv(memory);
}

/** Used by tests and by the admin "reset" affordance. */
export function clearMemoryCache(): void {
  memory = null;
}

/** Whether synced media survives a redeploy. Surfaced on /admin. */
export function storeIsDurable(): boolean {
  return kvConfigured();
}

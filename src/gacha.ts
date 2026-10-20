import { type Kind } from "./data.ts";
import type { Progress, SaveStorage } from "./progressStore.ts";

export const RARITIES = [
  "ノーマル",
  "レア",
  "激レア",
  "超激レア",
  "伝説",
] as const;
export const GACHA_COST = 150;
export const TOTAL_WEIGHT = 10_000;
/** Integer tickets: Keito owns exactly one of 10,000 equally likely outcomes. */
export const GACHA_POOL: readonly {
  kind: Kind;
  rarity: number;
  weight: number;
  placeholder?: boolean;
}[] = [
  { kind: "novice", rarity: 0, weight: 6000 },
  { kind: "monk", rarity: 1, weight: 3000 },
  { kind: "mage", rarity: 2, weight: 900 },
  { kind: "bellkeeper", rarity: 3, weight: 99, placeholder: true },
  { kind: "keito", rarity: 4, weight: 1 },
];
export const characterEntry = (kind: Kind) =>
  GACHA_POOL.find((entry) => entry.kind === kind)!;
export type GachaTheme =
  "normal" | "red" | "gold" | "rainbow" | "777" | "revival" | "keito";
export interface GachaResult {
  kind: Kind;
  isNew: boolean;
  duplicate: number;
}
export interface GachaBatch {
  id: string;
  at: string;
  cost: number;
  results: GachaResult[];
  theme: GachaTheme;
}
export function secureTicket(): number {
  const values = new Uint32Array(1);
  const limit = Math.floor(2 ** 32 / TOTAL_WEIGHT) * TOTAL_WEIGHT;
  do {
    crypto.getRandomValues(values);
  } while (values[0] >= limit);
  return values[0] % TOTAL_WEIGHT;
}
export function drawCharacter(ticket: number): Kind {
  if (!Number.isInteger(ticket) || ticket < 0 || ticket >= TOTAL_WEIGHT)
    throw new RangeError("Invalid gacha ticket");
  let boundary = 0;
  for (const entry of GACHA_POOL) {
    boundary += entry.weight;
    if (ticket < boundary) return entry.kind;
  }
  throw new Error("Invalid gacha pool");
}
function themeFor(results: GachaResult[], id: string): GachaTheme {
  if (results.some((r) => r.kind === "keito")) return "keito";
  const rank = Math.max(...results.map((r) => characterEntry(r.kind).rarity));
  const variant = [...id].reduce((n, c) => n + c.charCodeAt(0), 0) % 3;
  if (rank === 3) return variant === 0 ? "777" : "rainbow";
  if (rank === 2) return variant === 0 ? "revival" : "gold";
  return rank === 1 ? "red" : "normal";
}
/** One immutable transaction; presentation never draws or grants anything. */
export function pullGacha(
  data: Progress,
  count: number,
  id: string,
  ticket = secureTicket,
  at = new Date().toISOString(),
): Progress {
  if (
    (count !== 1 && count !== 10) ||
    !id ||
    data.pendingGacha ||
    data.gachaHistory.some((b) => b.id === id) ||
    data.stones < GACHA_COST * count
  )
    return data;
  const owned = [...data.owned],
    origins = { ...data.origins },
    duplicates = { ...data.duplicates };
  const results = Array.from({ length: count }, () => {
    const kind = drawCharacter(ticket()),
      isNew = !owned.includes(kind);
    if (isNew) {
      owned.push(kind);
      origins[kind] = "gacha";
      duplicates[kind] = 0;
    } else duplicates[kind] = (duplicates[kind] ?? 0) + 1;
    return { kind, isNew, duplicate: duplicates[kind] ?? 0 };
  });
  const batch: GachaBatch = {
    id,
    at,
    results,
    cost: GACHA_COST * count,
    theme: themeFor(results, id),
  };
  return {
    ...data,
    stones: data.stones - batch.cost,
    owned,
    origins,
    duplicates,
    gachaHistory: [...data.gachaHistory, batch],
    pendingGacha: id,
  };
}
export function finishGacha(data: Progress, id: string): Progress {
  return data.pendingGacha === id ? { ...data, pendingGacha: null } : data;
}
/** The save succeeds before the caller can show the animation or acquired unit. */
export function durableChange(
  storage: SaveStorage,
  key: string,
  data: Progress,
  change: (data: Progress) => Progress,
): Progress {
  const next = change(data);
  if (next !== data) storage.setItem(key, JSON.stringify(next));
  return next;
}

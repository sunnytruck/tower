import { ALLIES, type Kind } from "./data.ts";
export const FORMATION_SIZE = 10;
export type Formation = (Kind | null)[];
export function normalizeFormation(input: readonly (Kind | null)[]): Formation {
  const seen = new Set<Kind>();
  return Array.from({ length: FORMATION_SIZE }, (_, i) => {
    const kind = input[i];
    if (!kind || !ALLIES.includes(kind) || seen.has(kind)) return null;
    seen.add(kind);
    return kind;
  });
}
export function initialFormation(): Formation {
  return normalizeFormation(ALLIES);
}
// Move an already selected character rather than allowing duplicate cooldown slots.
export function assignSlot(
  input: readonly (Kind | null)[],
  slot: number,
  kind: Kind | null,
): Formation {
  const next = normalizeFormation(input);
  if (
    !Number.isInteger(slot) ||
    slot < 0 ||
    slot >= FORMATION_SIZE ||
    (kind !== null && !ALLIES.includes(kind))
  )
    return next;
  if (kind) {
    const previous = next.indexOf(kind);
    if (previous >= 0) next[previous] = null;
  }
  next[slot] = kind;
  return next;
}

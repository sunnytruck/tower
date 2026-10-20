import { ALLIES, UNITS, type Kind, type Stats } from "./data.ts";
export const MAX_LEVEL = 20;
export type Levels = Partial<Record<Kind, number>>;
export function levelOf(levels: Levels, kind: Kind): number {
  const value = levels[kind];
  return typeof value === "number" && Number.isFinite(value)
    ? Math.max(1, Math.min(MAX_LEVEL, Math.floor(value)))
    : 1;
}
export function normalizeLevels(levels: Levels = {}): Levels {
  return Object.fromEntries(
    ALLIES.map((kind) => [kind, levelOf(levels, kind)]),
  );
}
export function levelUpCost(level: number): number | null {
  return level >= MAX_LEVEL
    ? null
    : 100 + 50 * (Math.max(1, Math.floor(level)) - 1);
}
/** One stat calculation for upgrades, formation, spawning, attacks and health bars. */
export function unitStats(kind: Kind, levels: Levels = {}): Stats {
  const base = UNITS[kind];
  const level = ALLIES.includes(kind) ? levelOf(levels, kind) : 1;
  const growth = 100 + 10 * (level - 1);
  return {
    ...base,
    hp: Math.round((base.hp * growth) / 100),
    damage: Math.round((base.damage * growth) / 100),
    ...(base.ability ? {ability: {...base.ability, value: base.ability.type === "heal"
      ? Math.round(base.ability.value * growth / 100) : base.ability.value}} : {}),
  };
}

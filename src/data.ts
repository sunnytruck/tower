import { ALLY_ROSTER } from "./allyRoster.ts";
export type AllyKind = (typeof ALLY_ROSTER)[number]["id"];
export type EnemyKind = "soldier" | "runner" | "heavy" | "sniper" | "bomber" | "gatekeeper" | "emperor" | "guardian";
export type Kind = AllyKind | EnemyKind;
export interface Ability {
  type: "heal" | "slow" | "stun" | "push" | "bossSlayer" | "armor";
  value: number;
  duration?: number;
  range?: number;
}
export interface Stats {
  name: string;
  knockback: number;
  ability?: Ability;
  role: string;
  hp: number;
  damage: number;
  range: number;
  interval: number;
  speed: number;
  cost: number;
  cooldown: number;
  area: boolean;
  color: string;
  size: number;
  symbol: string;
  portrait?: string;
  boss?: "gate" | "sun" | "dream";
  splash?: number;
  push?: number;
  pierce?: boolean;
  stun?: number;
}
const ENEMY_UNITS = {
  soldier: {
    name: "雑魚兵士",
    role: "近距離",
    hp: 170,
    damage: 25,
    range: 38,
    interval: 1.3,
    speed: 28,
    cost: 0,
    cooldown: 0,
    area: false,
    color: "#bc7b70",
    size: 1,
    symbol: "兵",
  },
  runner: {
    name: "突撃兵",
    role: "高速",
    hp: 100,
    damage: 22,
    range: 33,
    interval: 0.8,
    speed: 65,
    cost: 0,
    cooldown: 0,
    area: false,
    color: "#d88964",
    size: 0.85,
    symbol: "突",
  },
  heavy: {
    name: "重装兵",
    role: "高耐久",
    hp: 850,
    damage: 65,
    range: 55,
    interval: 2,
    speed: 17,
    cost: 0,
    cooldown: 0,
    area: false,
    color: "#888b9b",
    size: 1.4,
    symbol: "鎧",
  },
  sniper: {
    name: "狙撃兵",
    role: "遠距離・後方支援",
    hp: 200,
    damage: 100,
    range: 260,
    interval: 2.8,
    speed: 22,
    cost: 0,
    cooldown: 0,
    area: false,
    color: "#7e9fb9",
    size: 1,
    symbol: "狙",
  },
  bomber: {
    name: "破戒砲兵",
    role: "範囲・密集対策",
    hp: 360,
    damage: 95,
    range: 100,
    interval: 3,
    speed: 21,
    cost: 0,
    cooldown: 0,
    area: true,
    color: "#b486b3",
    size: 1.25,
    symbol: "砲",
  },
  gatekeeper: {
    name: "異端の門番",
    role: "重門の一撃・範囲ふっとばし",
    hp: 2500,
    damage: 85,
    range: 70,
    interval: 3.2,
    speed: 14,
    cost: 0,
    cooldown: 0,
    area: true,
    color: "#b37c58",
    size: 1.65,
    symbol: "門",
    boss: "gate",
    splash: 75,
    push: 30,
  },
  emperor: {
    name: "朝活皇帝",
    role: "暁の光槍・直線貫通",
    hp: 6500,
    damage: 115,
    range: 280,
    interval: 4.5,
    speed: 10,
    cost: 0,
    cooldown: 0,
    area: true,
    color: "#f3b646",
    size: 1.6,
    symbol: "暁",
    boss: "sun",
    pierce: true,
  },
  guardian: {
    name: "永眠の守護者",
    role: "まどろみの波・範囲停止",
    hp: 11000,
    damage: 150,
    range: 115,
    interval: 5,
    speed: 10,
    cost: 0,
    cooldown: 0,
    area: true,
    color: "#9cb7bf",
    size: 1.7,
    symbol: "眠",
    boss: "dream",
    splash: 95,
    stun: 1.1,
  },
};
export const UNITS = Object.fromEntries([
  ...ALLY_ROSTER.map(entry => [entry.id, entry.stats]),
  ...Object.entries(ENEMY_UNITS).map(([kind, stats]) => [kind, {...stats, knockback: 1}]),
]) as Record<Kind, Stats>;
export const INITIAL_ALLIES: Kind[] = ["novice", "monk", "mage"];
export const LEGACY_ALLIES: Kind[] = [...INITIAL_ALLIES, "keito"];
export const ALLIES: Kind[] = ALLY_ROSTER.map(entry => entry.id);
export { DEFAULT_STAGE as STAGE } from "./stages.ts";

export type Kind =
  "novice" | "monk" | "mage" | "keito" | "soldier" | "runner" | "heavy";
export interface Stats {
  name: string;
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
}
export const UNITS: Record<Kind, Stats> = {
  novice: {
    name: "見習い信者",
    role: "量産・壁役",
    hp: 240,
    damage: 18,
    range: 38,
    interval: 1.1,
    speed: 35,
    cost: 65,
    cooldown: 2,
    area: false,
    color: "#9db6a1",
    size: 1,
    symbol: "祈",
  },
  monk: {
    name: "岩の拳僧",
    role: "近距離・範囲",
    hp: 420,
    damage: 65,
    range: 55,
    interval: 1.6,
    speed: 27,
    cost: 180,
    cooldown: 5,
    area: true,
    color: "#d29c65",
    size: 1.14,
    symbol: "拳",
  },
  mage: {
    name: "ドラクエ信者",
    role: "遠距離・単体",
    hp: 140,
    damage: 95,
    range: 185,
    interval: 1.8,
    speed: 25,
    cost: 230,
    cooldown: 6,
    area: false,
    color: "#a59bc6",
    size: 1,
    symbol: "杖",
  },
  keito: {
    name: "岩尊けいと",
    role: "大型・範囲",
    hp: 1400,
    damage: 240,
    range: 100,
    interval: 2.7,
    speed: 19,
    cost: 650,
    cooldown: 18,
    area: true,
    color: "#e8c36a",
    size: 1.65,
    symbol: "岩",
  },
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
};
export const ALLIES: Kind[] = ["novice", "monk", "mage", "keito"];
export const STAGE = {
  name: "岩の聖地",
  subtitle: "第一章 / 静寂を破る者",
  width: 1400,
  baseHP: 3200,
  income: 32,
  startingMoney: 300,
  maxMoney: 1800,
  waves: [
    { at: 3, kind: "soldier" },
    { at: 9, kind: "runner" },
    { at: 16, kind: "soldier" },
    { at: 22, kind: "heavy" },
    { at: 27, kind: "runner" },
    { at: 33, kind: "soldier" },
    { at: 38, kind: "runner" },
    { at: 45, kind: "heavy" },
    { at: 48, kind: "soldier" },
    { at: 54, kind: "runner" },
    { at: 62, kind: "heavy" },
    { at: 66, kind: "runner" },
    { at: 70, kind: "soldier" },
    { at: 80, kind: "heavy" },
    { at: 85, kind: "runner" },
    { at: 90, kind: "heavy" },
  ] as { at: number; kind: Kind }[],
};

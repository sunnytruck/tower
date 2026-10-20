import type { Kind } from "./data.ts";

export const AREAS = [
  {
    name: "布教の始まり",
    subtitle: "祈りは、小さな一歩から。",
    color: "#518b70",
  },
  {
    name: "朝活帝国",
    subtitle: "夜明けを独り占めする帝国へ。",
    color: "#bf7e3d",
  },
  { name: "昼寝の森", subtitle: "眠れる森に、信仰の足音。", color: "#706d9c" },
] as const;
export interface Stage {
  id: string;
  number: number;
  area: number;
  name: string;
  subtitle: string;
  difficulty: string;
  recommendedLevel: number;
  background: {
    sky: [string, string];
    hills: [string, string, string];
    ground: string;
    accent: string;
    motif:
      | "sanctuary"
      | "river"
      | "cliffs"
      | "village"
      | "gate"
      | "towers"
      | "bridge"
      | "plaza"
      | "stairs"
      | "palace"
      | "woods"
      | "grove"
      | "lake"
      | "ruins"
      | "dream";
  };
  width: number;
  baseHP: number;
  enemyBaseHP: number;
  income: number;
  startingMoney: number;
  maxMoney: number;
  victoryXP: number;
  firstClearStones: number;
  repeatStones: number;
  bossBonus: number;
  boss: Kind | null;
  waves: { at: number; kind: Kind }[];
}
type Group = [at: number, kind: Kind, count?: number, gap?: number];
const waves = (...groups: Group[]): Stage["waves"] =>
  groups
    .flatMap(([at, kind, count = 1, gap = 1]) =>
      Array.from({ length: count }, (_, i) => ({ at: at + i * gap, kind })),
    )
    .sort((a, b) => a.at - b.at);
const palettes = [
  {
    sky: ["#a9d8d3", "#fff1bf"],
    hills: ["#bdccbd", "#a5b9aa", "#819e8e"],
    ground: "#c1b28c",
    accent: "#6a7b60",
  },
  {
    sky: ["#e5ad81", "#fff0bb"],
    hills: ["#e0bf9b", "#bd9c7e", "#9e8066"],
    ground: "#cbb692",
    accent: "#9f704e",
  },
  {
    sky: ["#6d87a7", "#d6d8c5"],
    hills: ["#758e8f", "#567675", "#3e6465"],
    ground: "#91a48f",
    accent: "#405e61",
  },
] as const;
function stage(
  number: number,
  name: string,
  motif: Stage["background"]["motif"],
  recommendedLevel: number,
  enemyBaseHP: number,
  victoryXP: number,
  subtitle: string,
  groups: Group[],
  boss: Kind | null = null,
): Stage {
  const area = Math.floor((number - 1) / 5),
    palette = palettes[area];
  return {
    id: `stage-${String(number).padStart(2, "0")}`,
    number,
    area,
    name,
    subtitle,
    difficulty:
      number <= 3
        ? "入門"
        : number <= 5
          ? "初級"
          : number <= 10
            ? "中級"
            : "上級",
    recommendedLevel,
    background: {
      ...palette,
      sky: [...palette.sky],
      hills: [...palette.hills],
      motif,
    },
    width: 1400,
    baseHP: 3200,
    enemyBaseHP,
    income: 30,
    startingMoney: 300,
    maxMoney: 1800,
    victoryXP,
    firstClearStones: 1500,
    repeatStones: 150,
    bossBonus: boss ? 1500 : 0,
    boss,
    waves: waves(...groups),
  };
}
export const STAGES: Stage[] = [
  stage(
    1,
    "岩の聖地",
    "sanctuary",
    1,
    3200,
    300,
    "壁役で後衛を守り、遠距離攻撃で突破しよう。",
    [
      [3, "soldier"],
      [8, "runner"],
      [14, "soldier"],
      [17, "sniper"],
      [23, "heavy"],
      [25, "runner"],
      [32, "bomber"],
      [34, "soldier"],
      [39, "runner"],
      [40, "runner"],
      [50, "heavy"],
      [52, "sniper"],
      [58, "soldier"],
      [59, "bomber"],
      [67, "runner"],
      [68, "runner"],
      [78, "heavy"],
      [80, "bomber"],
      [84, "sniper"],
      [88, "soldier"],
      [98, "heavy"],
      [100, "sniper"],
      [104, "runner"],
      [105, "bomber"],
      [116, "heavy"],
      [117, "heavy"],
      [120, "sniper"],
      [122, "bomber"],
    ],
  ),
  stage(
    2,
    "巡礼の小川",
    "river",
    1,
    3400,
    450,
    "突撃兵の連続接近。見習いを切らさず前線を支えよう。",
    [
      [3, "soldier", 2, 5],
      [10, "runner", 3, 3],
      [22, "soldier", 2, 4],
      [26, "sniper"],
      [36, "runner", 4, 2],
      [44, "heavy"],
      [53, "soldier", 3, 3],
      [60, "runner", 3, 2],
      [72, "sniper"],
      [78, "heavy"],
      [88, "runner", 4, 2],
      [105, "soldier", 4, 3],
    ],
  ),
  stage(
    3,
    "こだまの岩壁",
    "cliffs",
    1,
    3800,
    600,
    "重装兵の後ろに砲兵。壁と遠距離の組み合わせを覚えよう。",
    [
      [4, "soldier", 2, 4],
      [13, "heavy"],
      [19, "bomber"],
      [24, "runner", 2, 3],
      [34, "heavy"],
      [38, "sniper"],
      [47, "soldier", 3, 2],
      [53, "bomber"],
      [62, "heavy"],
      [70, "runner", 3, 2],
      [80, "heavy", 2, 5],
      [91, "sniper"],
      [104, "bomber", 2, 5],
    ],
  ),
  stage(
    4,
    "ざわめく門前町",
    "village",
    2,
    4200,
    750,
    "群れには拳僧。壁の補充資金を残し、波の合間に後衛を。",
    [
      [3, "runner", 3, 2],
      [12, "soldier", 4, 2],
      [18, "sniper", 2, 6],
      [27, "heavy"],
      [32, "bomber"],
      [40, "runner", 5, 1.4],
      [51, "soldier", 4, 2],
      [57, "heavy", 2, 5],
      [67, "bomber", 2, 5],
      [76, "runner", 5, 1.5],
      [91, "sniper", 2, 6],
      [105, "heavy", 2, 6],
    ],
  ),
  stage(
    5,
    "異端の大門",
    "gate",
    3,
    4800,
    1000,
    "門番の重撃は前衛を押し戻す。遠距離火力を守り続けよう。",
    [
      [4, "soldier", 3, 4],
      [15, "heavy"],
      [22, "runner", 3, 2],
      [28, "gatekeeper"],
      [35, "sniper"],
      [45, "soldier", 4, 2],
      [56, "bomber"],
      [63, "runner", 4, 2],
      [75, "heavy", 2, 6],
      [88, "sniper", 2, 6],
      [101, "soldier", 5, 2],
    ],
    "gatekeeper",
  ),
  stage(
    6,
    "夜明けの尖塔",
    "towers",
    4,
    5200,
    1100,
    "長射程の狙撃線。育てた壁で射撃を受け止めよう。",
    [
      [2, "soldier", 3, 3],
      [9, "sniper", 2, 5],
      [20, "heavy", 2, 5],
      [27, "runner", 4, 2],
      [38, "sniper", 3, 4],
      [45, "soldier", 4, 2],
      [54, "bomber", 2, 5],
      [62, "heavy", 3, 4],
      [75, "runner", 5, 1.5],
      [86, "sniper", 3, 4],
      [101, "heavy", 2, 5],
    ],
  ),
  stage(
    7,
    "早鐘の石橋",
    "bridge",
    5,
    5700,
    1250,
    "速い敵が短い間隔で突進。拳僧の範囲攻撃を前線に届けよう。",
    [
      [2, "runner", 5, 1.6],
      [6, "sniper", 3, 4],
      [12, "soldier", 5, 1.5],
      [20, "bomber"],
      [25, "runner", 6, 1.2],
      [38, "heavy", 2, 4],
      [44, "sniper", 2, 5],
      [51, "runner", 7, 1.3],
      [66, "soldier", 5, 1.5],
      [72, "bomber", 2, 4],
      [85, "runner", 8, 1.2],
      [104, "heavy", 3, 4],
    ],
  ),
  stage(
    8,
    "光槍の広場",
    "plaza",
    6,
    6200,
    1400,
    "狙撃と砲撃の交差。前衛に寄り過ぎない布陣を。",
    [
      [3, "heavy", 2, 4],
      [9, "sniper", 2, 5],
      [18, "bomber", 2, 5],
      [26, "soldier", 5, 2],
      [36, "runner", 5, 1.4],
      [47, "heavy", 3, 4],
      [53, "sniper", 3, 4],
      [64, "bomber", 3, 4],
      [77, "runner", 5, 1.5],
      [89, "heavy", 3, 4],
      [104, "sniper", 3, 4],
    ],
  ),
  stage(
    9,
    "朝礼の千段坂",
    "stairs",
    7,
    6800,
    1550,
    "重装列の後に高速ラッシュ。全額を後衛につぎ込まないで。",
    [
      [2, "heavy", 3, 4],
      [6, "sniper", 2, 4],
      [7, "soldier", 4, 2],
      [18, "sniper", 2, 4],
      [25, "runner", 7, 1.2],
      [35, "bomber", 2, 4],
      [46, "heavy", 4, 3],
      [59, "runner", 8, 1.2],
      [68, "sniper", 3, 4],
      [79, "bomber", 3, 3],
      [91, "heavy", 4, 3],
      [110, "runner", 7, 1.2],
    ],
  ),
  stage(
    10,
    "朝活皇帝の玉座",
    "palace",
    8,
    7500,
    2000,
    "皇帝の光槍は直線上を貫く。育成した前衛で接近し、射線を押し上げよう。",
    [
      [2, "soldier", 4, 2],
      [10, "heavy", 2, 4],
      [18, "sniper", 2, 4],
      [29, "emperor"],
      [33, "runner", 5, 1.5],
      [46, "bomber", 2, 4],
      [56, "heavy", 3, 4],
      [66, "runner", 7, 1.3],
      [80, "sniper", 3, 4],
      [94, "bomber", 3, 4],
      [111, "heavy", 3, 4],
    ],
    "emperor",
  ),
  stage(
    11,
    "うたた寝の木立",
    "woods",
    9,
    8000,
    1700,
    "木陰に狙撃隊。壁を厚くして、後衛が撃つ時間を作ろう。",
    [
      [2, "heavy", 3, 3],
      [5, "sniper", 3, 4],
      [17, "runner", 5, 1.4],
      [25, "bomber", 2, 4],
      [35, "heavy", 4, 3],
      [44, "sniper", 4, 3],
      [57, "soldier", 6, 1.5],
      [67, "bomber", 3, 3],
      [79, "runner", 7, 1.2],
      [93, "heavy", 4, 3],
      [106, "sniper", 4, 3],
    ],
  ),
  stage(
    12,
    "寝返り茸の群生地",
    "grove",
    10,
    8500,
    1900,
    "密集する突撃隊は範囲攻撃で一掃。拳僧と壁の出撃間隔を合わせよう。",
    [
      [2, "runner", 8, 1],
      [6, "sniper", 3, 4],
      [11, "soldier", 7, 1],
      [19, "bomber", 2, 4],
      [26, "runner", 10, 0.9],
      [37, "heavy", 3, 3],
      [46, "sniper", 3, 4],
      [54, "runner", 10, 1],
      [69, "soldier", 8, 1],
      [78, "bomber", 4, 3],
      [90, "runner", 12, 0.8],
      [109, "heavy", 4, 3],
    ],
  ),
  stage(
    13,
    "まどろみの湖畔",
    "lake",
    11,
    9000,
    2100,
    "砲兵の範囲攻撃に注意。前衛を補充しながら遠距離で砲兵を倒そう。",
    [
      [2, "heavy", 3, 3],
      [7, "bomber", 3, 3],
      [20, "sniper", 3, 3],
      [29, "runner", 6, 1.2],
      [38, "heavy", 4, 3],
      [47, "bomber", 4, 3],
      [61, "soldier", 7, 1],
      [70, "sniper", 4, 3],
      [83, "runner", 8, 1],
      [94, "bomber", 4, 3],
      [110, "heavy", 4, 3],
    ],
  ),
  stage(
    14,
    "夢喰いの旧神殿",
    "ruins",
    12,
    10000,
    2300,
    "重装・狙撃・砲撃の三層陣。ラッシュの直前に壁の資金を確保。",
    [
      [2, "heavy", 4, 3],
      [6, "sniper", 3, 3],
      [13, "bomber", 3, 3],
      [24, "runner", 8, 1],
      [36, "heavy", 4, 3],
      [44, "sniper", 4, 3],
      [53, "bomber", 4, 3],
      [66, "runner", 10, 1],
      [80, "heavy", 5, 3],
      [91, "sniper", 4, 3],
      [103, "bomber", 4, 3],
    ],
  ),
  stage(
    15,
    "永眠の森の最奥",
    "dream",
    14,
    11000,
    3000,
    "守護者の眠りは前衛の動きを止める。離れた後衛と交代の壁で守りを維持。",
    [
      [2, "heavy", 3, 3],
      [7, "sniper", 3, 3],
      [17, "runner", 6, 1.2],
      [28, "guardian"],
      [34, "bomber", 3, 3],
      [46, "heavy", 4, 3],
      [57, "runner", 10, 1],
      [71, "sniper", 4, 3],
      [83, "bomber", 4, 3],
      [96, "heavy", 5, 3],
      [111, "runner", 10, 1],
    ],
    "guardian",
  ),
];
export const DEFAULT_STAGE = STAGES[0];
export const stageById = (id: string) =>
  STAGES.find((stage) => stage.id === id);
export interface StageProgress {
  unlocked: boolean;
  clears: number;
  firstRewardClaimed: boolean;
}
export type Campaign = Record<string, StageProgress>;
export function initialCampaign(): Campaign {
  return Object.fromEntries(
    STAGES.map((stage) => [
      stage.id,
      { unlocked: stage.number === 1, clears: 0, firstRewardClaimed: false },
    ]),
  );
}

import { ALLIES, INITIAL_ALLIES, LEGACY_ALLIES, type Kind } from "./data.ts";
import {
  initialFormation,
  ownedFormation,
  type Formation,
} from "./formation.ts";
import {
  levelOf,
  levelUpCost,
  normalizeLevels,
  type Levels,
} from "./progression.ts";
export const SAVE_KEY = "jitto-war-save";
import { type GachaBatch, GACHA_POOL } from "./gacha.ts";
import {
  STAGES,
  DEFAULT_STAGE,
  initialCampaign,
  stageById,
  type Campaign,
} from "./stages.ts";
export const SAVE_VERSION = 5;
const LEGACY_KEYS = [
  "jitto-save",
  "jittoWarSave",
  "jitto-war-save-v1",
  "jitto-war-progress",
];
const MAX_XP = 1_000_000_000;
export interface Progress {
  [key: string]: unknown;
  version: number;
  xp: number;
  levels: Levels;
  formation: Formation;
  claimedVictories: string[];
  owned: Kind[];
  origins: Partial<Record<Kind, "initial" | "gacha" | "legacy">>;
  duplicates: Partial<Record<Kind, number>>;
  stones: number;
  gachaHistory: GachaBatch[];
  pendingGacha: string | null;
  stageClears: number;
  campaign: Campaign;
  highestStage: number;
  victoryRewards: Record<
    string,
    {
      xp: number;
      stones: number;
      firstClear: boolean;
      stageId?: string;
      bossBonus?: number;
    }
  >;
}
export interface SaveStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}
type RecordData = Record<string, unknown>;
const record = (value: unknown): RecordData =>
  value !== null && typeof value === "object" && !Array.isArray(value)
    ? (value as RecordData)
    : {};
const integer = (value: unknown, fallback: number) => {
  const parsed =
    typeof value === "string" && /^\d+$/.test(value) ? Number(value) : value;
  return typeof parsed === "number" && Number.isFinite(parsed)
    ? Math.max(0, Math.min(MAX_XP, Math.floor(parsed)))
    : fallback;
};
export function newProgress(): Progress {
  return {
    version: SAVE_VERSION,
    xp: 0,
    levels: normalizeLevels(),
    formation: initialFormation(),
    claimedVictories: [],
    owned: [...INITIAL_ALLIES],
    origins: Object.fromEntries(
      INITIAL_ALLIES.map((kind) => [kind, "initial"]),
    ),
    duplicates: Object.fromEntries(INITIAL_ALLIES.map((kind) => [kind, 0])),
    stones: 0,
    gachaHistory: [],
    pendingGacha: null,
    stageClears: 0,
    campaign: initialCampaign(),
    highestStage: 1,
    victoryRewards: {},
  };
}
/** Read known legacy fields while retaining unrelated data for later phases. */
export function migrateProgress(input: unknown): Progress {
  const data = record(input),
    levels = record(data.levels),
    oldLevels = record(data.characterLevels),
    characters = record(data.characters);
  const migrated: Levels = {};
  for (const kind of ALLIES) {
    const arrayEntry = Array.isArray(data.characters)
      ? data.characters.find(
          (v) => record(v).id === kind || record(v).kind === kind,
        )
      : undefined;
    const value =
      levels[kind] ??
      oldLevels[kind] ??
      record(characters[kind]).level ??
      record(arrayEntry).level;
    migrated[kind] = integer(value, 1);
  }
  const formation = data.formation ?? data.lineup;
  const priorOwned = data.owned ?? data.ownedCharacters;
  const legacy = integer(data.version, 0) < 3;
  const candidates = Array.isArray(priorOwned)
    ? priorOwned
    : priorOwned && typeof priorOwned === "object"
      ? Object.keys(record(priorOwned)).filter((k) => record(priorOwned)[k])
      : legacy
        ? LEGACY_ALLIES
        : INITIAL_ALLIES;
  const owned: Kind[] = [...new Set([...candidates.filter(
    (kind): kind is Kind => typeof kind === "string" && ALLIES.includes(kind as Kind),
  ), ...INITIAL_ALLIES])];
  const origins: Progress["origins"] = {};
  const duplicates: Progress["duplicates"] = {};
  for (const kind of owned) {
    const source = record(data.origins)[kind];
    origins[kind] =
      source === "gacha" || source === "legacy" || source === "initial"
        ? source
        : INITIAL_ALLIES.includes(kind)
          ? "initial"
          : "legacy";
    duplicates[kind] = integer(record(data.duplicates)[kind], 0);
  }
  const themes = [
    "normal",
    "red",
    "gold",
    "rainbow",
    "777",
    "revival",
    "keito",
  ];
  const history: GachaBatch[] = [];
  for (const value of Array.isArray(data.gachaHistory)
    ? data.gachaHistory
    : []) {
    const batch = record(value);
    if (
      typeof batch.id !== "string" ||
      history.some((b) => b.id === batch.id) ||
      !Array.isArray(batch.results) ||
      ![1, 10].includes(batch.results.length) ||
      !batch.results.every((r) =>
        GACHA_POOL.some((e) => e.kind === record(r).kind),
      )
    )
      continue;
    history.push({
      id: batch.id,
      at: typeof batch.at === "string" ? batch.at : "",
      cost: 150 * batch.results.length,
      theme: themes.includes(String(batch.theme))
        ? (batch.theme as GachaBatch["theme"])
        : "normal",
      results: batch.results.map((r) => ({
        kind: record(r).kind as Kind,
        isNew: record(r).isNew === true,
        duplicate: integer(record(r).duplicate, 0),
      })),
    });
  }
  const claimedVictories = Array.isArray(data.claimedVictories)
    ? [
        ...new Set(
          data.claimedVictories.filter(
            (v): v is string => typeof v === "string",
          ),
        ),
      ]
    : [];
  const campaign = initialCampaign();
  const previousCampaign = record(data.campaign);
  // The old game had one stage: retain its clear and first-reward status.
  if (integer(data.version, 0) < 4) {
    const clears = integer(data.stageClears, claimedVictories.length);
    campaign[DEFAULT_STAGE.id] = {
      unlocked: true,
      clears,
      firstRewardClaimed: clears > 0,
    };
  } else {
    for (const stage of STAGES) {
      const saved = record(previousCampaign[stage.id]),
        clears = integer(saved.clears, 0);
      campaign[stage.id] = {
        unlocked: saved.unlocked === true || clears > 0,
        clears,
        firstRewardClaimed: saved.firstRewardClaimed === true || clears > 0,
      };
    }
  }
  campaign[DEFAULT_STAGE.id].unlocked = true;
  for (let i = 1; i < STAGES.length; i++) {
    if (campaign[STAGES[i - 1].id].clears > 0)
      campaign[STAGES[i].id].unlocked = true;
  }
  const highestStage = Math.max(
    ...STAGES.filter((s) => campaign[s.id].unlocked).map((s) => s.number),
  );
  return {
    ...data,
    version: SAVE_VERSION,
    xp: integer(
      data.xp ??
        record(data.player).xp ??
        record(data.resources).xp ??
        record(data.wallet).xp,
      0,
    ),
    levels: { ...levels, ...normalizeLevels(migrated) },
    formation: Array.isArray(formation)
      ? ownedFormation(formation as Formation, owned)
      : initialFormation(),
    claimedVictories,
    owned,
    origins,
    duplicates,
    stones: integer(
      data.stones ?? data.faithStones ?? record(data.wallet).stones,
      0,
    ),
    gachaHistory: history,
    pendingGacha: history.some((b) => b.id === data.pendingGacha)
      ? (data.pendingGacha as string)
      : null,
    stageClears: integer(data.stageClears, claimedVictories.length),
    campaign,
    highestStage,
    victoryRewards: Object.fromEntries(
      Object.entries(record(data.victoryRewards)).map(([id, value]) => [
        id,
        {
          xp: integer(record(value).xp, 0),
          stones: integer(record(value).stones, 0),
          firstClear: record(value).firstClear === true,
          ...(typeof record(value).stageId === "string"
            ? { stageId: record(value).stageId as string }
            : {}),
          ...(typeof record(value).bossBonus === "number"
            ? { bossBonus: integer(record(value).bossBonus, 0) }
            : {}),
        },
      ]),
    ),
  };
}
function backup(storage: SaveStorage, key: string, raw: string) {
  const prefix = `${SAVE_KEY}.backup.${key}.${Date.now()}`;
  let target = prefix,
    index = 0;
  while (storage.getItem(target) !== null) {
    if (index >= 100) throw new Error("Could not reserve a backup key");
    target = `${prefix}.${++index}`;
  }
  storage.setItem(target, raw);
}
export function loadProgress(storage: SaveStorage | null): {
  data: Progress;
  canSave: boolean;
  warning: string;
} {
  if (!storage)
    return {
      data: newProgress(),
      canSave: false,
      warning:
        "保存領域を利用できません。このページを閉じると進行が失われます。",
    };
  let warning = "";
  for (const key of [SAVE_KEY, ...LEGACY_KEYS]) {
    let raw: string | null;
    try {
      raw = storage.getItem(key);
    } catch {
      return {
        data: newProgress(),
        canSave: false,
        warning: "セーブを読み込めません。現在の進行は保存されません。",
      };
    }
    if (raw === null) continue;
    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== "object" || Array.isArray(parsed))
        throw new Error("invalid save");
    } catch {
      if (key === SAVE_KEY) {
        try {
          backup(storage, "corrupt", raw);
          warning = "破損したセーブをバックアップしました。";
        } catch {
          return {
            data: newProgress(),
            canSave: false,
            warning:
              "破損したセーブを保護しています。保存領域への書き込みができません。",
          };
        }
      }
      continue;
    }
    const version = integer(record(parsed).version, 0);
    if (version > SAVE_VERSION)
      return {
        data: migrateProgress(parsed),
        canSave: false,
        warning:
          "新しい版のセーブを保護しています。この版での進行は保存されません。",
      };
    if (key === SAVE_KEY && version < SAVE_VERSION) {
      try {
        backup(storage, `v${version}`, raw);
      } catch {
        return {
          data: migrateProgress(parsed),
          canSave: false,
          warning:
            "旧セーブを保護しています。バックアップできないため上書きしません。",
        };
      }
    }
    return { data: migrateProgress(parsed), canSave: true, warning };
  }
  return { data: newProgress(), canSave: true, warning };
}
export function saveProgress(storage: SaveStorage, data: Progress) {
  storage.setItem(SAVE_KEY, JSON.stringify(data));
}
export function upgradeCharacter(data: Progress, kind: Kind): Progress {
  if (!ALLIES.includes(kind) || !data.owned.includes(kind)) return data;
  const level = levelOf(data.levels, kind),
    cost = levelUpCost(level);
  if (cost === null || data.xp < cost) return data;
  return {
    ...data,
    xp: data.xp - cost,
    levels: { ...data.levels, [kind]: level + 1 },
  };
}
/** A persisted battle token prevents awarding the same result twice. */
export function awardVictory(
  data: Progress,
  id: string,
  status: string,
  reward: number,
  stageId = DEFAULT_STAGE.id,
): Progress {
  const stage = stageById(stageId),
    state = data.campaign[stageId];
  if (
    status !== "win" ||
    !id ||
    data.claimedVictories.includes(id) ||
    !Number.isSafeInteger(reward) ||
    reward <= 0 ||
    !stage ||
    !state?.unlocked ||
    reward !== stage.victoryXP
  )
    return data;
  const firstClear = !state.firstRewardClaimed;
  const bossBonus = firstClear ? stage.bossBonus : 0;
  const stones = firstClear
    ? stage.firstClearStones + bossBonus
    : stage.repeatStones;
  const campaign = {
    ...data.campaign,
    [stageId]: { ...state, clears: state.clears + 1, firstRewardClaimed: true },
  };
  const next = STAGES[stage.number];
  if (next) campaign[next.id] = { ...campaign[next.id], unlocked: true };
  return {
    ...data,
    xp: Math.min(MAX_XP, data.xp + reward),
    stones: Math.min(MAX_XP, data.stones + stones),
    stageClears: data.stageClears + 1,
    campaign,
    highestStage: Math.max(data.highestStage, next?.number ?? stage.number),
    claimedVictories: [...data.claimedVictories, id],
    victoryRewards: {
      ...data.victoryRewards,
      [id]: { xp: reward, stones, firstClear, stageId, bossBonus },
    },
  };
}
export function awardStageVictory(
  data: Progress,
  id: string,
  status: string,
  stageId: string,
): Progress {
  const stage = stageById(stageId);
  return stage
    ? awardVictory(data, id, status, stage.victoryXP, stageId)
    : data;
}

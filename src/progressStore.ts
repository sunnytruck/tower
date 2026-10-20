import { ALLIES, type Kind } from "./data.ts";
import {
  initialFormation,
  normalizeFormation,
  type Formation,
} from "./formation.ts";
import {
  levelOf,
  levelUpCost,
  normalizeLevels,
  type Levels,
} from "./progression.ts";
export const SAVE_KEY = "jitto-war-save";
export const SAVE_VERSION = 2;
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
      ? normalizeFormation(formation as Formation)
      : initialFormation(),
    claimedVictories: Array.isArray(data.claimedVictories)
      ? [...new Set(data.claimedVictories.filter((v) => typeof v === "string"))]
      : [],
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
  if (!ALLIES.includes(kind)) return data;
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
): Progress {
  if (
    status !== "win" ||
    !id ||
    data.claimedVictories.includes(id) ||
    !Number.isSafeInteger(reward) ||
    reward <= 0
  )
    return data;
  return {
    ...data,
    xp: Math.min(MAX_XP, data.xp + reward),
    claimedVictories: [...data.claimedVictories, id],
  };
}

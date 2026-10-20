import { useState } from "react";
import { UNITS, type Kind } from "./data";
import { characterEntry, RARITIES } from "./gacha";
import { abilityDescription } from "./allyAbilities";
import "./roster.css";

const ROLES = [
  ["all", "すべての役割"],
  ["wall", "壁・耐久"],
  ["ranged", "遠距離"],
  ["area", "範囲攻撃"],
  ["support", "支援・妨害"],
  ["fast", "高速"],
  ["boss", "対ボス"],
] as const;
export function useRosterFilter(kinds: readonly Kind[]) {
  const [query, setQuery] = useState("");
  const [rarity, setRarity] = useState(-1);
  const [role, setRole] = useState("all");
  const visible = kinds.filter((kind) => {
    const data = UNITS[kind];
    const matchesRole =
      role === "all" ||
      (role === "wall" && /壁|盾|耐久|防御|守護|重装/.test(data.role)) ||
      (role === "ranged" &&
        (data.range >= 150 || /遠距離|長射程/.test(data.role))) ||
      (role === "area" && data.area) ||
      (role === "support" &&
        /支援|妨害|治癒|回復|鈍足|停止|ふっとばし|後退/.test(
          `${data.role} ${abilityDescription(kind)}`,
        )) ||
      (role === "fast" && data.speed >= 40) ||
      (role === "boss" && data.ability?.type === "bossSlayer");
    return (
      (rarity < 0 || characterEntry(kind).rarity === rarity) &&
      matchesRole &&
      `${data.name} ${data.role} ${abilityDescription(kind)}`
        .toLocaleLowerCase()
        .includes(query.trim().toLocaleLowerCase())
    );
  });
  return {
    visible,
    query,
    setQuery,
    rarity,
    setRarity,
    role,
    setRole,
    reset: () => {
      setQuery("");
      setRarity(-1);
      setRole("all");
    },
  };
}
export function RosterTools({
  filter,
  context,
  total,
}: {
  filter: ReturnType<typeof useRosterFilter>;
  context: string;
  total: number;
}) {
  return (
    <div
      className="roster-tools"
      role="search"
      aria-label={`${context}の絞り込み`}
    >
      <label>
        <span>仲間を探す</span>
        <input
          type="search"
          value={filter.query}
          onChange={(event) => filter.setQuery(event.target.value)}
          placeholder="名前・能力で検索"
          aria-label={`${context}のキャラを検索`}
        />
      </label>
      <label>
        <span>レアリティ</span>
        <select
          value={filter.rarity}
          onChange={(event) => filter.setRarity(Number(event.target.value))}
          aria-label={`${context}のレアリティ`}
        >
          <option value={-1}>すべて</option>
          {RARITIES.map((label, index) => (
            <option value={index} key={label}>
              {label}
            </option>
          ))}
        </select>
      </label>
      <label>
        <span>役割</span>
        <select
          value={filter.role}
          onChange={(event) => filter.setRole(event.target.value)}
          aria-label={`${context}の役割`}
        >
          {ROLES.map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </label>
      <div className="roster-tools-result">
        <span role="status">
          {filter.visible.length} / {total}体
        </span>
        <button className="text-button" onClick={filter.reset}>
          解除
        </button>
      </div>
    </div>
  );
}

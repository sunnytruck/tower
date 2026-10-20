import { useState } from "react";
import { ALLIES, UNITS } from "./data";
import type { Progress } from "./progressStore";
import { CharacterImage } from "./CharacterImage";
import { GACHA_POOL, RARITIES, characterEntry } from "./gacha";
import { levelOf, unitStats } from "./progression";
export function CollectionScreen({ progress }: { progress: Progress }) {
  const [filter, setFilter] = useState(-1);
  return (
    <section className="collection-screen">
      <div className="summon-heading">
        <div>
          <span className="eyebrow">ARCHIVE / THE STONE FOLLOWERS</span>
          <h1>信者の図鑑</h1>
        </div>
        <b>
          {progress.owned.length} / {ALLIES.length} 収集
        </b>
      </div>
      <nav className="rarity-filters" aria-label="レアリティ絞り込み">
        {["すべて", ...RARITIES].map((label, i) => (
          <button
            className="pause"
            aria-pressed={filter === i - 1}
            key={label}
            onClick={() => setFilter(i - 1)}
          >
            {label}
          </button>
        ))}
      </nav>
      <div className="collection-grid">
        {GACHA_POOL.filter((e) => filter < 0 || e.rarity === filter).map(
          ({ kind, rarity, placeholder }) => {
            const owned = progress.owned.includes(kind),
              stats = unitStats(kind, progress.levels);
            return (
              <article
                key={kind}
                className={`collection-card rarity-${rarity} ${owned ? "" : "unowned"}`}
              >
                <span className="rarity-label">{RARITIES[rarity]}</span>
                <div className={`collection-art ${owned ? "" : "silhouette"}`}>
                  <CharacterImage kind={kind} hero />
                  {!owned && <b>？</b>}
                </div>
                <h2>{UNITS[kind].name}</h2>
                <p>{UNITS[kind].role}</p>
                {owned ? (
                  <>
                    <strong>
                      Lv.{levelOf(progress.levels, kind)} / 重複{" "}
                      {progress.duplicates[kind] ?? 0}体
                    </strong>
                    <p>
                      HP {stats.hp} / 攻撃 {stats.damage}
                    </p>
                    <small>
                      {progress.origins[kind] === "gacha"
                        ? "ガチャ入手"
                        : progress.origins[kind] === "legacy"
                          ? "旧セーブから引継ぎ"
                          : "初期の仲間"}
                    </small>
                  </>
                ) : (
                  <p className="locked-caption">
                    未所持 / ガチャで入手 · {characterEntry(kind).weight / 100}%
                  </p>
                )}
                {placeholder && (
                  <small className="placeholder-label">専用SVGの仮素材</small>
                )}
              </article>
            );
          },
        )}
      </div>
    </section>
  );
}

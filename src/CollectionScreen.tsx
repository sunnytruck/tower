import { ALLIES, UNITS } from "./data";
import type { Progress } from "./progressStore";
import { CharacterImage } from "./CharacterImage";
import { CharacterMaterialNote, CharacterStats } from "./CharacterStats";
import { RARITIES, characterEntry } from "./gacha";
import { levelOf, unitStats } from "./progression";
import { RosterTools, useRosterFilter } from "./RosterTools";

export function CollectionScreen({ progress }: { progress: Progress }) {
  const filter = useRosterFilter(ALLIES);
  return (
    <section className="collection-screen">
      <div className="summon-heading">
        <div>
          <span className="eyebrow">ARCHIVE / THE STONE LEGION</span>
          <h1>岩石軍団の図鑑</h1>
        </div>
        <b>
          {progress.owned.length} / {ALLIES.length} 収集
        </b>
      </div>
      <RosterTools filter={filter} context="図鑑" total={ALLIES.length} />
      <div className="collection-grid">
        {filter.visible.map((kind) => {
          const owned = progress.owned.includes(kind),
            rarity = characterEntry(kind).rarity;
          const stats = unitStats(kind, owned ? progress.levels : {});
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
              <p className="collection-role">{UNITS[kind].role}</p>
              {owned ? (
                <>
                  <strong className="collection-level">
                    Lv.{levelOf(progress.levels, kind)} / 重複{" "}
                    {progress.duplicates[kind] ?? 0}体
                  </strong>
                  <p className="collection-base">
                    HP {stats.hp.toLocaleString()} / 攻撃{" "}
                    {stats.damage.toLocaleString()}
                  </p>
                  <small className="collection-provenance">
                    {progress.origins[kind] === "gacha"
                      ? "ガチャ入手"
                      : progress.origins[kind] === "legacy"
                        ? "旧セーブから引継ぎ"
                        : "初期の仲間"}
                  </small>
                </>
              ) : (
                <p className="locked-caption">
                  未所持 / ガチャで入手 ·{" "}
                  {(characterEntry(kind).weight / 100).toFixed(2)}%
                </p>
              )}
              <CharacterMaterialNote kind={kind} />
              <details className="character-detail">
                <summary>
                  {owned ? "現在の戦闘性能" : "Lv.1の参考性能"}を確認
                </summary>
                <CharacterStats kind={kind} stats={stats} />
              </details>
            </article>
          );
        })}
      </div>
      {!filter.visible.length && (
        <p className="roster-empty" role="status">
          条件に合うキャラはいません。絞り込みを解除して探してください。
        </p>
      )}
    </section>
  );
}

import {
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import type { Progress } from "./progressStore";
import {
  GACHA_POOL,
  GACHA_COST,
  RARITIES,
  characterEntry,
  pullGacha,
  finishGacha,
  type GachaBatch,
} from "./gacha";
import { UNITS } from "./data";
import { CharacterImage } from "./CharacterImage";
import { GameIcon } from "./GameIcon";
import { GachaReveal, StoneAltar } from "./GachaReveal";
import "./gacha.css";
const DevTools = import.meta.env.DEV
  ? lazy(() => import("./GachaDevTools"))
  : null;
export function GachaScreen({
  progress,
  transact,
  onNavigate,
}: {
  progress: Progress;
  transact: (change: (data: Progress) => Progress) => Promise<Progress | null>;
  onNavigate: (page: "formation" | "upgrade") => void;
}) {
  const [activeId, setActiveId] = useState<string | null>(
    progress.pendingGacha,
  );
  const [preview, setPreview] = useState<GachaBatch | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const submitting = useRef(false);
  const active =
    preview ?? progress.gachaHistory.find((b) => b.id === activeId);
  useEffect(() => {
    if (progress.pendingGacha && !activeId) {
      setActiveId(progress.pendingGacha);
      setShowResults(false);
    }
  }, [progress.pendingGacha, activeId]);
  const complete = useCallback(() => {
    setShowResults(true);
    if (!preview && activeId)
      void transact((data) => finishGacha(data, activeId));
  }, [activeId, preview, transact]);
  async function pull(count: 1 | 10) {
    if (submitting.current || progress.pendingGacha || preview) return;
    submitting.current = true;
    setBusy(true);
    setError("");
    try {
      const id = crypto.randomUUID();
      const next = await transact((data) => pullGacha(data, count, id));
      if (next) {
        setActiveId(next.pendingGacha);
        setShowResults(false);
      } else
        setError(
          "召喚できませんでした。信仰石・未確認の結果・保存状態をご確認ください。",
        );
    } finally {
      submitting.current = false;
      setBusy(false);
    }
  }
  return (
    <section className="gacha-screen" aria-label="信仰石ガチャ">
      <div className="summon-heading">
        <div>
          <span className="eyebrow">STONE SUMMON / 祈りの祭壇</span>
          <h1>信仰召喚</h1>
        </div>
        <div className="summon-wallet">
          <GameIcon name="gacha" />
          <span>
            所持信仰石<strong>{progress.stones.toLocaleString()}</strong>
          </span>
        </div>
      </div>
      <div className="summon-banner">
        <span>伝説の岩が、目を覚ます。</span>
        <b>
          岩尊けいと <i>0.01%</i>
        </b>
        <small>伝説はガチャ限定 / 旧セーブの所持は引き継がれます</small>
      </div>
      <div className="summon-machine">
        <div className="summon-character-tease">
          <CharacterImage kind="keito" hero />
          <span>伝説の気配</span>
        </div>
        <StoneAltar />
        <span className="summon-machine-label">祈りを捧げ、仲間と出会え。</span>
      </div>
      <div className="summon-actions">
        {([1, 10] as const).map((count) => (
          <button
            key={count}
            className={`summon-pull pull-${count}`}
            disabled={
              busy ||
              !!progress.pendingGacha ||
              !!preview ||
              progress.stones < GACHA_COST * count
            }
            onClick={() => void pull(count)}
          >
            <span>{count === 1 ? "1回召喚" : "10連召喚"}</span>
            <b>
              <GameIcon name="gacha" />
              {(count * GACHA_COST).toLocaleString()}個
            </b>
            <small>
              {busy
                ? "結果を保存中…"
                : progress.pendingGacha
                  ? "未確認の結果があります"
                  : progress.stones < count * GACHA_COST
                    ? `あと${(count * GACHA_COST - progress.stones).toLocaleString()}個`
                    : "祈りを捧げる ▶"}
            </small>
          </button>
        ))}
      </div>
      <p className="summon-note">
        各ステージ初回1,500個・ボス初回3,000個、周回は150個。10連も同じ確率で10回抽選・確定枠なし。重複は将来の＋値用に保存。
      </p>
      {error && (
        <p className="save-notice" role="alert">
          {error}
        </p>
      )}
      {progress.pendingGacha &&
        (activeId !== progress.pendingGacha || showResults) && (
          <button
            className="primary resume-reveal"
            onClick={() => {
              setPreview(null);
              setActiveId(progress.pendingGacha);
              setShowResults(false);
            }}
          >
            保存済みの召喚結果を確認
          </button>
        )}
      <div className="summon-details">
        <details className="gacha-rates">
          <summary>排出率の詳細 · 合計100%</summary>
          <table>
            <thead>
              <tr>
                <th>レアリティ / キャラクター</th>
                <th>個別確率</th>
              </tr>
            </thead>
            <tbody>
              {GACHA_POOL.map((entry) => (
                <tr key={entry.kind} className={`rarity-${entry.rarity}`}>
                  <td>
                    <small>{RARITIES[entry.rarity]}</small>
                    {UNITS[entry.kind].name}
                    {entry.placeholder && <em>仮素材</em>}
                  </td>
                  <td>{(entry.weight / 100).toFixed(2)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p>
            各回独立抽選。演出・スキップで確率や結果は変わりません。実際の金銭による購入はありません。
          </p>
        </details>
        <details className="gacha-history">
          <summary>
            召喚履歴 ·{" "}
            {progress.gachaHistory.reduce((n, b) => n + b.results.length, 0)}回
          </summary>
          {progress.gachaHistory.length ? (
            <ol>
              {[...progress.gachaHistory].reverse().map((batch) => (
                <li key={batch.id}>
                  <button
                    onClick={() => {
                      setPreview(null);
                      setActiveId(batch.id);
                      setShowResults(batch.id !== progress.pendingGacha);
                    }}
                  >
                    <time>{new Date(batch.at).toLocaleString("ja-JP")}</time>
                    <b>
                      {batch.results.length}回 · 信仰石{batch.cost}個
                    </b>
                    <span>
                      {batch.results.map((r) => UNITS[r.kind].name).join(" / ")}
                    </span>
                    <small>結果を見る →</small>
                  </button>
                </li>
              ))}
            </ol>
          ) : (
            <p>まだ召喚していません。戦闘で信仰石を集めよう。</p>
          )}
        </details>
      </div>
      {DevTools && (
        <Suspense fallback={null}>
          <DevTools
            onPreview={(batch) => {
              setPreview(batch);
              setShowResults(false);
            }}
          />
        </Suspense>
      )}
      {active && !showResults && (
        <GachaReveal
          key={active.id + active.theme}
          batch={active}
          preview={!!preview}
          onComplete={complete}
        />
      )}
      {active && showResults && (
        <div className="gacha-results-backdrop">
          <section
            className="gacha-results"
            role="dialog"
            aria-modal="true"
            aria-label="召喚結果"
          >
            <div className="result-heading">
              <span className="eyebrow">
                {preview ? "演出プレビュー / 入手なし" : "SUMMON COMPLETE"}
              </span>
              <h2>
                {active.results.some((r) => r.kind === "keito")
                  ? "伝説降臨 — 岩尊けいと"
                  : "祈りの先で、出会った仲間。"}
              </h2>
              <p>
                {preview
                  ? "開発用の表示確認です。所持データは変更していません。"
                  : `${active.results.length}回召喚 / 信仰石${active.cost.toLocaleString()}個消費 · 入手結果は保存済み`}
              </p>
            </div>
            <div
              className={`gacha-result-grid ${active.results.length === 1 ? "single-result" : ""}`}
            >
              {active.results.map((result, i) => {
                const entry = characterEntry(result.kind);
                return (
                  <article
                    key={i}
                    className={`gacha-result-card rarity-${entry.rarity}`}
                  >
                    <span className="rarity-label">
                      {RARITIES[entry.rarity]}
                    </span>
                    <div className="result-art">
                      <CharacterImage kind={result.kind} hero />
                    </div>
                    <h3>{UNITS[result.kind].name}</h3>
                    <b
                      className={
                        result.isNew ? "result-new" : "result-duplicate"
                      }
                    >
                      {preview
                        ? "PREVIEW"
                        : result.isNew
                          ? "NEW! 初入手"
                          : `重複 +1 / 保存数 ${result.duplicate}`}
                    </b>
                    {entry.placeholder && (
                      <small className="placeholder-label">
                        専用SVGの仮素材
                      </small>
                    )}
                  </article>
                );
              })}
            </div>
            <div className="gacha-result-actions">
              <button
                className="pause"
                autoFocus
                onClick={() => {
                  setPreview(null);
                  setActiveId(null);
                  setShowResults(false);
                }}
              >
                祭壇へ戻る
              </button>
              <button className="pause" onClick={() => onNavigate("formation")}>
                編成へ
              </button>
              <button className="primary" onClick={() => onNavigate("upgrade")}>
                強化へ →
              </button>
            </div>
            {!preview && progress.pendingGacha === active.id && (
              <button className="pause" onClick={complete}>
                結果の確認を保存
              </button>
            )}
          </section>
        </div>
      )}
    </section>
  );
}

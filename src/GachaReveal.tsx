import { useEffect, useState } from "react";
import { CharacterImage } from "./CharacterImage";
import { characterEntry, type GachaBatch } from "./gacha";
import { revealSequence } from "./gachaPresentation";

export function StoneAltar({ split = false }: { split?: boolean }) {
  return (
    <div
      className={`stone-altar ${split ? "split-open" : ""}`}
      aria-hidden="true"
    >
      <div className="altar-rays" />
      <div className="altar-halo" />
      <div className="altar-stone stone-left">
        <span>じ</span>
      </div>
      <div className="altar-stone stone-right">
        <span>と</span>
      </div>
      <div className="altar-plinth">
        <span>信仰召喚</span>
      </div>
      <div className="altar-sparks">
        ✦ <i>✧</i> ✦ <i>✧</i> ✦
      </div>
    </div>
  );
}
export function GachaReveal({
  batch,
  preview,
  onComplete,
}: {
  batch: GachaBatch;
  preview: boolean;
  onComplete: () => void;
}) {
  const [index, setIndex] = useState(0);
  const sequence = revealSequence(batch.theme),
    current = sequence[index];
  useEffect(() => {
    const timer = window.setTimeout(
      () => (index + 1 < sequence.length ? setIndex(index + 1) : onComplete()),
      current.duration,
    );
    return () => window.clearTimeout(timer);
  }, [index, batch.theme, current.duration, sequence.length, onComplete]);
  const best = batch.results.reduce((a, b) =>
    characterEntry(a.kind).rarity >= characterEntry(b.kind).rarity ? a : b,
  );
  const showCharacter =
    current.phase === "reveal" || current.phase === "legend";
  const reels = ["spin", "fullspin", "jackpot"].includes(current.phase);
  return (
    <div
      className={`gacha-reveal theme-${batch.theme} phase-${current.phase}`}
      role="dialog"
      aria-modal="true"
      aria-label="召喚演出"
    >
      <button className="pause reveal-skip" autoFocus onClick={onComplete}>
        演出をスキップ ≫
      </button>
      {preview && (
        <span className="preview-stamp">
          演出確認のみ · 通貨消費／キャラ入手なし
        </span>
      )}
      <div className="reveal-vignette" />
      <div className="reveal-orbit" />
      <div className="reveal-stage" key={current.phase}>
        {showCharacter ? (
          <div className="summoned-character">
            <CharacterImage kind={best.kind} hero />
          </div>
        ) : reels ? (
          <div
            className={`gacha-reels ${current.phase === "jackpot" ? "stopped" : "spinning"}`}
            aria-label={
              current.phase === "jackpot" ? "777 大当たり" : "数字回転中"
            }
          >
            {[0, 1, 2].map((n) => (
              <div className="reel-window" key={n}>
                <span>
                  {current.phase === "jackpot"
                    ? "7"
                    : current.phase === "fullspin"
                      ? "7\n7\n7\n7\n7"
                      : "1\n3\n7\n5\n7"}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <StoneAltar split={current.phase === "split"} />
        )}
        <div className="reveal-copy" aria-live="polite">
          <h2>{current.title}</h2>
          <p>{current.caption}</p>
        </div>
      </div>
      <div className="reveal-progress" aria-hidden="true">
        {sequence.map((_, i) => (
          <i key={i} className={i <= index ? "lit" : ""} />
        ))}
      </div>
    </div>
  );
}

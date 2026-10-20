import { useState } from "react";
import type { GachaBatch, GachaTheme } from "./gacha";
/** Dynamically imported only in Vite development; never calls a save or lottery. */
export default function GachaDevTools({
  onPreview,
}: {
  onPreview: (batch: GachaBatch) => void;
}) {
  const [theme, setTheme] = useState<GachaTheme>("keito");
  return (
    <details className="gacha-dev" data-testid="dev-gacha-tools">
      <summary>開発用：演出プレビュー（入手なし）</summary>
      <select
        aria-label="開発用の演出"
        value={theme}
        onChange={(e) => setTheme(e.target.value as GachaTheme)}
      >
        {(
          [
            ["normal", "通常"],
            ["red", "赤"],
            ["gold", "金"],
            ["rainbow", "虹"],
            ["777", "777"],
            ["revival", "復活"],
            ["keito", "岩尊けいと・全回転"],
          ] as const
        ).map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>
      <button
        className="pause"
        onClick={() => {
          const kind =
            theme === "keito"
              ? "keito"
              : theme === "rainbow" || theme === "777"
                ? "bellkeeper"
                : theme === "gold" || theme === "revival"
                  ? "mage"
                  : theme === "red"
                    ? "monk"
                    : "novice";
          onPreview({
            id: "DEV_REVEAL_PREVIEW_ONLY",
            at: "",
            cost: 0,
            results: [{ kind, isNew: false, duplicate: 0 }],
            theme,
          });
        }}
      >
        演出を確認
      </button>
      <small>
        信仰石・所持データ・履歴には影響しません。公開ビルドには含まれません。
      </small>
    </details>
  );
}

import { useState } from "react";
import { createRoot } from "react-dom/client";
import { BattleScreen } from "./BattleScreen";
import { Portrait } from "./Portrait";
import { ALLIES, UNITS, STAGE, type Kind } from "./data";
import { initialFormation, assignSlot, type Formation } from "./formation";
import "./style.css";

type Page = "home" | "formation" | "battle";
function App() {
  const [page, setPage] = useState<Page>("home");
  const [formation, setFormation] = useState<Formation>(initialFormation);
  const [selected, setSelected] = useState(0);
  const [battleLineup, setBattleLineup] = useState<Formation>(initialFormation);
  const [notice, setNotice] = useState("");
  const count = formation.filter(Boolean).length;
  function start() {
    if (!count) return;
    setBattleLineup([...formation]);
    setPage("battle");
  }
  function choose(kind: Kind | null) {
    setFormation((current) => assignSlot(current, selected, kind));
    setNotice(
      `枠${selected + 1}を${kind ? UNITS[kind].name : "未編成"}に変更しました`,
    );
  }
  if (page === "battle")
    return (
      <BattleScreen lineup={battleLineup} onHome={() => setPage("home")} />
    );
  return (
    <main className="hub">
      <header>
        <a
          className="brand"
          href="./"
          onClick={(e) => {
            e.preventDefault();
            setPage("home");
          }}
        >
          <span className="seal">岩</span>
          <div>
            じっと教大戦争<small>JITTO : THE STONE FRONT</small>
          </div>
        </a>
        <span className="edition">総本山 / PHASE 01</span>
        {page !== "home" && (
          <button className="pause" onClick={() => setPage("home")}>
            ホームへ
          </button>
        )}
      </header>
      {page === "home" ? (
        <>
          <section className="home-hero">
            <div>
              <span className="eyebrow">WELCOME TO THE SACRED GROUND</span>
              <h1>
                総本山<span>信者を集め、戦場へ。</span>
              </h1>
              <p>壁役と後衛を組み合わせ、自分の布陣で岩の聖地に挑もう。</p>
              <button className="primary" disabled={!count} onClick={start}>
                岩の聖地へ出陣 →
              </button>
              {!count && (
                <p role="status">先に編成で1体以上を選んでください。</p>
              )}
            </div>
            <div className="home-emblem" aria-hidden="true">
              岩<small>じっと教</small>
            </div>
          </section>
          <section className="home-lineup">
            <div className="deploy-title">
              <h2>
                現在の編成 <small>{count} / 10 枠</small>
              </h2>
              <button className="pause" onClick={() => setPage("formation")}>
                編成を変更 →
              </button>
            </div>
            <div className="lineup-summary">
              {formation.map((kind, i) => (
                <div key={i}>
                  <span>{String(i + 1).padStart(2, "0")}</span>
                  <b>{kind ? UNITS[kind].name : "未編成"}</b>
                </div>
              ))}
            </div>
            <p className="session-note">
              編成は画面の移動・リトライ中に保持されます。ページ更新後の保存はPhase
              3で対応予定です。
            </p>
          </section>
          <nav className="home-menu" aria-label="メインメニュー">
            <button onClick={start} disabled={!count}>
              <b>01 戦闘</b>
              <span>{STAGE.name} / 1ステージ</span>
            </button>
            <button onClick={() => setPage("formation")}>
              <b>02 編成</b>
              <span>10枠・既存の4種類を配置</span>
            </button>
            {[
              { name: "強化", phase: 2, desc: "XPで能力を伸ばす" },
              { name: "ガチャ", phase: 3, desc: "新たな信者と出会う" },
              { name: "図鑑", phase: 5, desc: "信者の姿と能力を知る" },
            ].map((item) => (
              <button key={item.name} disabled>
                <b>{item.name}</b>
                <span>
                  {item.desc} / Phase {item.phase}予定
                </span>
              </button>
            ))}
          </nav>
        </>
      ) : (
        <>
          <section className="formation-heading">
            <span className="eyebrow">FORMATION / TEN SLOTS</span>
            <h1>
              出陣の布陣<span>{count} / 10 枠</span>
            </h1>
            <p>
              枠を選んで、下の信者を配置。同じ信者を選ぶとその枠へ移動します。
            </p>
            <p className="session-note">
              現在は既存4種を使用します。空き枠があっても出陣可能です。重複編成はできません。
            </p>
          </section>
          <section className="formation-slots" aria-label="10枠の編成">
            {formation.map((kind, i) => (
              <button
                key={i}
                className={`formation-slot ${selected === i ? "selected" : ""}`}
                aria-pressed={selected === i}
                aria-label={`編成枠${i + 1} ${kind ? UNITS[kind].name : "未編成"}`}
                onClick={() => {
                  setSelected(i);
                  setNotice("");
                }}
              >
                <span>SLOT {String(i + 1).padStart(2, "0")}</span>
                {kind ? (
                  <>
                    <Portrait kind={kind} />
                    <b>{UNITS[kind].name}</b>
                    <small>
                      ¥ {UNITS[kind].cost} / {UNITS[kind].role}
                    </small>
                  </>
                ) : (
                  <>
                    <strong>＋</strong>
                    <b>未編成</b>
                    <small>信者を選んで配置</small>
                  </>
                )}
              </button>
            ))}
          </section>
          <section className="character-picker">
            <div className="deploy-title">
              <h2>枠{selected + 1}に配置する信者</h2>
              <button className="pause" onClick={() => choose(null)}>
                この枠を外す
              </button>
            </div>
            <div className="roster-grid">
              {ALLIES.map((kind) => {
                const d = UNITS[kind];
                const pos = formation.indexOf(kind);
                return (
                  <button
                    key={kind}
                    onClick={() => choose(kind)}
                    aria-label={`${d.name}を枠${selected + 1}に配置`}
                  >
                    <Portrait kind={kind} />
                    <div>
                      <h3>{d.name}</h3>
                      <span>
                        {d.role} / ¥ {d.cost}
                      </span>
                      <small>
                        HP {d.hp} / 攻撃 {d.damage}
                        <br />
                        射程 {d.range} / 攻撃間隔 {d.interval}秒
                      </small>
                      <b>
                        {pos >= 0
                          ? `枠${pos + 1}に編成中 → 移動`
                          : "この枠に配置"}
                      </b>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>
          <div className="formation-actions">
            <span role="status">
              {notice || "変更はすぐに現在の編成へ反映されます。"}
            </span>
            <button className="pause" onClick={() => setPage("home")}>
              ホームへ戻る
            </button>
            <button className="primary" onClick={start} disabled={!count}>
              この編成で出陣 →
            </button>
          </div>
        </>
      )}
      <footer>
        <span>PHASE 01 / ホーム・10枠編成・戦闘接続</span>
        <span className="placeholder">
          架空の仮キャラクター / オリジナル作品
        </span>
      </footer>
    </main>
  );
}
createRoot(document.getElementById("root")!).render(<App />);

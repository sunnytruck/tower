import { useEffect, useRef, useState } from "react";
import { UNITS, type Kind } from "./data";
import { figure } from "./render";
import { onArtLoaded } from "./characterArt";
import { CHARACTER_ASSETS, hasCharacterAsset } from "./characterAssets";
import {
  getCharacterImage,
  onCharacterImageChanged,
  warmCharacterImages,
} from "./characterImages";

export interface CharacterImageProps {
  kind: Kind;
  hero?: boolean;
}
/** Shared full-body character presentation. Upgrade and gacha screens can use this directly. */
export function CharacterImage({ kind, hero = false }: CharacterImageProps) {
  const [, refresh] = useState(0);
  const supported = hasCharacterAsset(kind);
  const state = supported ? getCharacterImage(kind) : null;
  useEffect(() => {
    if (supported) warmCharacterImages(kind);
  }, [kind, supported]);
  useEffect(() => onCharacterImageChanged(() => refresh((v) => v + 1)), []);
  const className = `portrait ${hero ? "hero-portrait" : ""}`;
  if (!supported || state?.status === "missing")
    return <Fallback kind={kind} hero={hero} />;
  return (
    <img
      className={`${className} character-image`}
      src={CHARACTER_ASSETS[kind].image}
      alt=""
      aria-hidden="true"
      decoding="async"
      draggable={false}
      data-asset-quality={CHARACTER_ASSETS[kind].quality ?? "production"}
      title={
        CHARACTER_ASSETS[kind].quality === "draft-background"
          ? "仮素材：背景・ラベルあり。透過版への差し替え予定。"
          : undefined
      }
      onLoad={() => refresh((v) => v + 1)}
      onError={() => refresh((v) => v + 1)}
    />
  );
}
function Fallback({ kind, hero }: { kind: Kind; hero: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = ref.current!.getContext("2d")!,
      canvas = c.canvas;
    const extent = kind === "mage" ? 146 : kind === "keito" ? 160 : 125;
    const scale = Math.min(
      (canvas.height - 35) / extent,
      (canvas.width - 35) / 130,
    );
    const paint = () => {
      c.clearRect(0, 0, canvas.width, canvas.height);
      figure(
        c,
        {
          id: 0,
          kind,
          side: 1,
          x: canvas.width / 2,
          hp: UNITS[kind].hp,
          maxHP: UNITS[kind].hp,
          attack: 0,
          pose: 0,
          flash: 0,
          dead: 0,
          recoil: 0,
        },
        0,
        canvas.height - 15,
        scale / UNITS[kind].size,
        false,
      );
    };
    paint();
    return onArtLoaded(paint);
  }, [kind, hero]);
  return (
    <canvas
      className={`portrait character-fallback ${hero ? "hero-portrait" : ""}`}
      ref={ref}
      width={hero ? 520 : 256}
      height={hero ? 600 : 280}
      aria-hidden="true"
    />
  );
}

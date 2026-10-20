import type { Kind } from "./data.ts";
export type SpriteKind = "novice" | "monk" | "mage" | "keito";
export interface CharacterAsset {
  /** A complete transparent PNG/WebP character, including costume and weapon. */
  image: string;
  width: number;
  height: number;
  animation: {
    step: number;
    bob: number;
    lean: number;
    lunge: number;
    deathSpin: number;
  };
}
/** Shared by battle, home, formation and future upgrade/gacha screens. */
export const CHARACTER_ASSETS: Record<SpriteKind, CharacterAsset> = {
  novice: {
    image: "./characters/novice.png",
    width: 90,
    height: 118,
    animation: { step: 12, bob: 2.4, lean: 0.055, lunge: 8, deathSpin: 1.5 },
  },
  monk: {
    image: "./characters/monk.png",
    width: 125,
    height: 125,
    animation: { step: 8, bob: 2, lean: 0.07, lunge: 21, deathSpin: 2 },
  },
  mage: {
    image: "./characters/mage.png",
    width: 115,
    height: 145,
    animation: { step: 5, bob: 3, lean: 0.025, lunge: 5, deathSpin: -1.8 },
  },
  keito: {
    image: "./characters/keito.png",
    width: 125,
    height: 150,
    animation: { step: 5, bob: 1.4, lean: 0.03, lunge: 11, deathSpin: 1 },
  },
};
export function hasCharacterAsset(kind: Kind): kind is SpriteKind {
  return kind in CHARACTER_ASSETS;
}
export interface ContainedSize {
  width: number;
  height: number;
}
/** Never stretches or crops the source. Both constraints include weapons/halo. */
export function containSize(
  width: number,
  height: number,
  maxWidth: number,
  maxHeight: number,
): ContainedSize {
  if (
    ![width, height, maxWidth, maxHeight].every(
      (v) => Number.isFinite(v) && v > 0,
    )
  )
    return { width: 0, height: 0 };
  const scale = Math.min(maxWidth / width, maxHeight / height);
  return { width: width * scale, height: height * scale };
}

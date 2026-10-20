import type { Kind } from "./data.ts";
export type SpriteKind = "novice" | "monk" | "mage" | "keito" | "bellkeeper";
export type CharacterAction = "idle" | "walk" | "attack" | "hit" | "death";
export interface CharacterClip {
  frames: readonly string[];
  fps: number;
  loop: boolean;
}
export interface CharacterAsset {
  /** Full standing art for non-battle screens; may still be draft artwork. */
  image: string;
  quality?: "draft-background" | "production" | "placeholder";
  clips?: Partial<Record<CharacterAction, CharacterClip>>;
  /** Shared source-pixel canvas: retain the same scale across differently sized frames. */
  frameCanvas?: { width: number; height: number };
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
  bellkeeper: {
    image: "./characters/bellkeeper.svg", quality: "placeholder", width: 130, height: 145,
    animation: {step: 6, bob: 2, lean: 0.08, lunge: 12, deathSpin: -2},
  },
  keito: {
    image: "./characters/iwason/portrait.png",
    quality: "draft-background",
    clips: {
      idle: {
        frames: [1, 2, 3, 4].map((n) => `./characters/iwason/idle_0${n}.png`),
        fps: 4,
        loop: true,
      },
      walk: {
        frames: [1, 2, 3, 4].map((n) => `./characters/iwason/walk_0${n}.png`),
        fps: 8,
        loop: true,
      },
      attack: {
        frames: [1, 2, 3].map((n) => `./characters/iwason/attack_0${n}.png`),
        fps: 10,
        loop: false,
      },
      hit: {
        frames: [1, 2].map((n) => `./characters/iwason/hit_0${n}.png`),
        fps: 12,
        loop: false,
      },
      death: { frames: ["./characters/iwason/death.png"], fps: 1, loop: false },
    },
    frameCanvas: { width: 310, height: 255 },
    width: 185,
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

/** Pure visual-state selection. Combat state is read, never modified. */
export function characterAction(
  unit: { hp: number; flash: number; pose: number },
  walking: boolean,
): CharacterAction {
  if (unit.hp <= 0) return "death";
  if (unit.flash > 0) return "hit";
  if (unit.pose > 0) return "attack";
  return walking ? "walk" : "idle";
}
export function characterFrame(
  asset: CharacterAsset,
  action: CharacterAction,
  elapsed: number,
): { source: string; isFrame: boolean } {
  const clip = asset.clips?.[action];
  if (!clip?.frames.length) return { source: asset.image, isFrame: false };
  const tick = Math.floor(
    Math.max(0, Number.isFinite(elapsed) ? elapsed : 0) * Math.max(0, clip.fps),
  );
  const index = clip.loop
    ? tick % clip.frames.length
    : Math.min(tick, clip.frames.length - 1);
  return { source: clip.frames[index], isFrame: true };
}

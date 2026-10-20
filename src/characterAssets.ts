import type { Kind, AllyKind } from "./data.ts";
export type SpriteKind = AllyKind;
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
  motion?: "walk" | "roll" | "hover" | "heavy";
  attackStyle?: "lunge" | "recoil" | "cast" | "spin" | "slam";
  animation: {
    step: number;
    bob: number;
    lean: number;
    lunge: number;
    deathSpin: number;
  };
}
/** Each image remains independent; the rig supplies shared motion, not reused artwork. */
const rockArt = (
  kind: Exclude<AllyKind, "keito">,
  width: number,
  height: number,
  motion: CharacterAsset["motion"] = "walk",
  attackStyle: CharacterAsset["attackStyle"] = "lunge",
): CharacterAsset => ({
  image: `./characters/rock-army/${kind}.svg`,
  quality: "placeholder",
  width,
  height,
  motion,
  attackStyle,
  animation: {
    step: motion === "heavy" ? 5 : motion === "hover" ? 3 : 10,
    bob: motion === "heavy" ? 1.5 : motion === "hover" ? 4 : 2.4,
    lean: motion === "heavy" ? 0.035 : 0.055,
    lunge:
      attackStyle === "slam"
        ? 16
        : attackStyle === "recoil"
          ? -6
          : attackStyle === "cast"
            ? 4
            : 10,
    deathSpin: motion === "heavy" ? 0.55 : motion === "hover" ? -1.4 : 1.4,
  },
});
/** Shared by battle, home, formation, upgrades, gacha and the archive. */
export const CHARACTER_ASSETS: Record<SpriteKind, CharacterAsset> = {
  novice: rockArt("novice", 100, 130),
  monk: rockArt("monk", 138, 140, "heavy", "slam"),
  mage: rockArt("mage", 125, 146, "hover", "cast"),
  bellkeeper: rockArt("bellkeeper", 136, 145, "heavy", "slam"),
  pebble: rockArt("pebble", 84, 105),
  granite: rockArt("granite", 130, 142, "heavy", "slam"),
  roller: rockArt("roller", 120, 132, "roll", "spin"),
  stonethrower: rockArt("stonethrower", 122, 135, "walk", "recoil"),
  miner: rockArt("miner", 124, 140, "walk", "slam"),
  fossil: rockArt("fossil", 120, 142, "walk", "cast"),
  pumice: rockArt("pumice", 120, 124, "hover", "cast"),
  crystalarcher: rockArt("crystalarcher", 130, 145, "walk", "recoil"),
  spearman: rockArt("spearman", 132, 145),
  stoneninja: rockArt("stoneninja", 134, 136, "walk", "spin"),
  oremonk: rockArt("oremonk", 126, 143, "walk", "cast"),
  sandstone: rockArt("sandstone", 137, 136, "walk", "recoil"),
  geode: rockArt("geode", 132, 143, "walk", "cast"),
  magnet: rockArt("magnet", 130, 142, "heavy", "cast"),
  lavafist: rockArt("lavafist", 145, 142, "heavy", "slam"),
  obsidianknight: rockArt("obsidianknight", 136, 147, "heavy", "lunge"),
  rockcannon: rockArt("rockcannon", 145, 135, "heavy", "recoil"),
  thundermage: rockArt("thundermage", 135, 148, "hover", "cast"),
  giantbreaker: rockArt("giantbreaker", 145, 146, "heavy", "slam"),
  jadedancer: rockArt("jadedancer", 142, 142, "walk", "spin"),
  titan: rockArt("titan", 160, 150, "heavy", "slam"),
  meteormage: rockArt("meteormage", 155, 153, "hover", "cast"),
  rockdragon: rockArt("rockdragon", 173, 145, "heavy", "lunge"),
  crystalpriest: rockArt("crystalpriest", 145, 154, "hover", "cast"),
  doomgolem: rockArt("doomgolem", 163, 154, "heavy", "slam"),
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

import type { Unit } from "./engine.ts";
import {
  CHARACTER_ASSETS,
  containSize,
  hasCharacterAsset,
  characterAction,
  characterFrame,
} from "./characterAssets.ts";
import { getCharacterImage, warmCharacterImages } from "./characterImages.ts";

/** Draw the whole image. False means a confirmed missing/broken asset, never a pending load. */
export function drawCharacterSprite(
  c: CanvasRenderingContext2D,
  u: Unit,
  time: number,
  walking: boolean,
  worldScale = 1,
  keepInStage = false,
): boolean {
  if (!hasCharacterAsset(u.kind)) return false;
  warmCharacterImages(u.kind);
  const definition = CHARACTER_ASSETS[u.kind],
    a = definition.animation;
  const action = characterAction(u, walking);
  const elapsed =
    action === "death"
      ? u.dead
      : action === "hit"
        ? Math.max(0, 0.18 - u.flash)
        : action === "attack"
          ? Math.max(0, 0.3 - u.pose)
          : time;
  const selected = characterFrame(definition, action, elapsed);
  let state = getCharacterImage(u.kind, selected.source);
  let isFrame = selected.isFrame;
  // Pending/absent action frames use standing art, not the procedural fallback.
  if (state.status !== "ready" && isFrame) {
    state = getCharacterImage(u.kind);
    isFrame = false;
  }
  if (state.status === "missing") return false;
  if (state.status === "loading") return true;
  const reference = isFrame ? definition.frameCanvas : undefined;
  const fit = containSize(
    reference?.width ?? state.image.naturalWidth,
    reference?.height ?? state.image.naturalHeight,
    definition.width,
    definition.height,
  );
  const ratio = fit.width / (reference?.width ?? state.image.naturalWidth);
  const frame = {
    width: state.image.naturalWidth * ratio,
    height: state.image.naturalHeight * ratio,
  };
  const strike = u.pose > 0 ? Math.sqrt(Math.min(1, u.pose / 0.3)) : 0;
  const step = walking ? Math.sin(time * a.step + u.id) : 0;
  const breath = Math.sin(time * 2.2 + u.id);
  const hover = definition.motion === "hover";
  const rolling = definition.motion === "roll";
  c.save();
  // Keep standing sprites inside the battlefield edges without altering combat positions.
  if (keepInStage && u.hp > 0) {
    const margin = (frame.width * worldScale) / 2 + 4;
    const center = Math.max(margin, Math.min(1400 - margin, u.x + u.recoil));
    c.translate((center - u.x - u.recoil) / worldScale, 0);
  }
  if (u.hp <= 0) {
    const p = Math.min(1, u.dead / 0.55);
    c.globalAlpha *= 1 - p;
    c.translate(-u.side * 75 * p, -Math.sin(p * Math.PI) * 55);
    c.rotate(p * Math.PI * (isFrame ? 0.12 : a.deathSpin) * u.side);
  } else {
    const cast = definition.attackStyle === "cast";
    const slam = definition.attackStyle === "slam";
    c.translate(
      u.side * strike * a.lunge * (isFrame ? 0.2 : 1),
      hover
        ? -5 + breath * a.bob - strike * 3
        : -Math.abs(step) * a.bob + breath * 0.65 - (slam ? strike * 4 : 0),
    );
    c.rotate(
      (rolling ? step * 0.35 : step * a.lean) +
        u.side *
          strike *
          (slam ? 0.14 : definition.attackStyle === "spin" ? 0.2 : -0.04) +
        (u.flash ? Math.sin(time * 90) * 0.08 : 0),
    );
    const pulse = 1 + breath * 0.005 + strike * (cast ? 0.025 : -0.015);
    c.scale(pulse, pulse);
  }
  c.scale(u.side, 1);
  if (u.flash) c.filter = "brightness(1.6) saturate(.55)";
  c.drawImage(
    state.image,
    -frame.width / 2,
    -frame.height,
    frame.width,
    frame.height,
  );
  c.restore();
  return true;
}

import type { Unit } from "./engine.ts";
import {
  CHARACTER_ASSETS,
  containSize,
  hasCharacterAsset,
} from "./characterAssets.ts";
import { getCharacterImage } from "./characterImages.ts";

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
  const state = getCharacterImage(u.kind);
  if (state.status === "missing") return false;
  if (state.status === "loading") return true;
  const definition = CHARACTER_ASSETS[u.kind],
    a = definition.animation;
  const frame = containSize(
    state.image.naturalWidth,
    state.image.naturalHeight,
    definition.width,
    definition.height,
  );
  const strike = u.pose > 0 ? Math.sqrt(Math.min(1, u.pose / 0.3)) : 0;
  const step = walking ? Math.sin(time * a.step + u.id) : 0;
  const breath = Math.sin(time * 2.2 + u.id);
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
    c.rotate(p * Math.PI * a.deathSpin * u.side);
  } else {
    c.translate(
      u.side * strike * a.lunge,
      -Math.abs(step) * a.bob + breath * 0.65,
    );
    c.rotate(
      step * a.lean +
        u.side * strike * (u.kind === "monk" ? 0.12 : -0.04) +
        (u.flash ? Math.sin(time * 90) * 0.08 : 0),
    );
    const pulse = 1 + breath * 0.005 - strike * 0.015;
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

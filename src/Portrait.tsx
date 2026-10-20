import { useEffect, useRef } from "react";
import { UNITS, type Kind } from "./data";
import { figure } from "./render";
import { CHARACTER_ART, isAlly, onArtLoaded } from "./characterArt";
export function Portrait({
  kind,
  hero = false,
  face = false,
}: {
  kind: Kind;
  hero?: boolean;
  face?: boolean;
}) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current!,
      c = canvas.getContext("2d")!;
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const extent =
      kind === "mage"
        ? 146
        : kind === "keito"
          ? 155
          : kind === "monk"
            ? 122
            : 115;
    const box = isAlly(kind) ? CHARACTER_ART[kind].box : null;
    const scale = face && box ? 240 / box[3] : (hero ? 525 : 248) / extent;
    const baseline =
      face && box ? 128 - (box[1] + box[3] / 2) * scale : hero ? 555 : 267;
    const paint = (time = 0) => {
      c.clearRect(0, 0, canvas.width, canvas.height);
      figure(
        c,
        {
          id: 0,
          kind,
          side: 1,
          x: hero ? 260 : 128,
          hp: UNITS[kind].hp,
          attack: 0,
          pose: 0,
          flash: 0,
          dead: 0,
          recoil: 0,
        },
        time,
        baseline,
        scale / UNITS[kind].size,
        false,
      );
    };
    paint();
    const unsubscribe = onArtLoaded(() => paint());
    let frame = 0,
      last = 0;
    if (hero) {
      const tick = (now: number) => {
        if (now - last > 33) {
          paint(motion.matches ? 0 : now / 1000);
          last = now;
        }
        frame = requestAnimationFrame(tick);
      };
      frame = requestAnimationFrame(tick);
    }
    return () => {
      unsubscribe();
      cancelAnimationFrame(frame);
    };
  }, [kind, hero, face]);
  return (
    <canvas
      className={`portrait ${hero ? "hero-portrait" : ""}`}
      ref={ref}
      width={hero ? 520 : 256}
      height={hero ? 600 : face ? 256 : 280}
      aria-hidden="true"
    />
  );
}

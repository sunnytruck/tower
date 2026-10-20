import { useEffect, useRef } from "react";
import { UNITS, type Kind } from "./data";
import { figure } from "./render";
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
    const paint = () => {
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
        0,
        hero ? 555 : face ? 320 : 267,
        (hero ? 4.7 : face ? 3.1 : 2.35) / UNITS[kind].size,
        false,
      );
    };
    paint();
    // Repaint when a user-supplied replacement portrait has loaded.
    const source = UNITS[kind].portrait;
    if (source) {
      const img = new Image();
      img.onload = paint;
      img.src = source;
      return () => {
        img.onload = null;
      };
    }
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

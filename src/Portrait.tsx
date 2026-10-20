import { useEffect, useRef } from "react";
import { ALLIES, UNITS } from "./data";
import { figure } from "./render";
export function Portrait({ kind }: { kind: (typeof ALLIES)[number] }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = ref.current!.getContext("2d")!;
    c.scale(1.3, 1.3);
    figure(
      c,
      {
        id: 0,
        kind,
        side: 1,
        x: 48,
        hp: UNITS[kind].hp,
        attack: 0,
        pose: 0,
        flash: 0,
        dead: 0,
        recoil: 0,
      },
      0,
      112,
    );
  }, [kind]);
  return <canvas ref={ref} width={126} height={150} aria-hidden="true" />;
}

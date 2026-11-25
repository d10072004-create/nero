import { useEffect, useRef, useState } from "react";
import { WALK_FRAMES } from "@/lib/nero/walk";
import { LOOK_ART, type LookId, type NeroPose, type NeroState } from "@/lib/nero/types";

const FRAME_MS = 1000 / 12;
const SPEED = 78;

export function NeroActor({
  look,
  state,
  roam,
  motion,
  scale,
  label,
  onDoubleClick,
}: {
  look: LookId;
  state: NeroState;
  roam: boolean;
  motion: "full" | "soft";
  scale: number;
  label: string;
  onDoubleClick: () => void;
}) {
  const cycle = WALK_FRAMES[look];
  const walking = roam && motion === "full" && state === "idle" && !!cycle?.length;
  const pose: NeroPose =
    state === "speaking" ? "speaking" : state === "listening" ? "listening" : state === "thinking" ? "thinking" : "idle";
  const still = LOOK_ART[look][pose];
  const [shown, setShown] = useState(still);
  const moverRef = useRef<HTMLSpanElement>(null);
  const xRef = useRef(0);
  const dirRef = useRef<1 | -1>(-1);

  useEffect(() => {
    if (!cycle) return;
    for (const url of cycle) {
      const img = new Image();
      img.src = url;
    }
  }, [cycle]);

  useEffect(() => {
    if (!walking) setShown(still);
  }, [walking, still]);

  useEffect(() => {
    const mover = moverRef.current;
    if (!mover) return;
    if (!walking || !cycle) {
      mover.style.transform = "";
      mover.style.setProperty("--nero-x", `${xRef.current}px`);
      return;
    }
    let raf = 0;
    let last = performance.now();
    let acc = 0;
    let frame = 0;
    setShown(cycle[0] ?? still);
    const tick = (now: number) => {
      const dt = Math.min(34, now - last);
      last = now;
      acc += dt;
      if (acc >= FRAME_MS) {
        const steps = Math.floor(acc / FRAME_MS);
        acc -= steps * FRAME_MS;
        frame = (frame + steps) % cycle.length;
        const next = cycle[frame];
        if (next) setShown(next);
      }
      const limit = Math.max(80, (mover.parentElement?.clientWidth ?? 640) * 0.32);
      let x = xRef.current + dirRef.current * SPEED * (dt / 1000);
      if (x > limit) {
        x = limit;
        dirRef.current = -1;
      } else if (x < -limit) {
        x = -limit;
        dirRef.current = 1;
      }
      xRef.current = x;
      const face = dirRef.current === 1 ? -1 : 1;
      mover.style.transform = `translate3d(${x}px, 0, 0) scaleX(${face})`;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [walking, cycle]);

  return (
    <button
      type="button"
      className="flex h-full max-w-full items-end"
      style={{ height: `${scale}%` }}
      onDoubleClick={onDoubleClick}
      aria-label={label}
    >
      <span
        ref={moverRef}
        className="nero-figure block h-full"
        data-state={state}
        data-walking={walking ? "true" : "false"}
        data-motion={motion}
      >
        <img src={shown} alt="" draggable={false} className="h-full w-auto max-w-none object-contain object-bottom" />
      </span>
    </button>
  );
}

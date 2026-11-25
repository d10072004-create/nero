import { useEffect, useRef, useState } from "react";
import { evaluate } from "@/lib/nero/brain";
import type { PcTier } from "@/lib/nero/hardware";
import type { Copy } from "@/lib/nero/i18n";
import type { PanelId } from "@/lib/nero/types";

export function StageTools({
  app,
  copy,
  tier,
  notes,
  onClose,
}: {
  app: PanelId;
  copy: Copy;
  tier: PcTier;
  notes: string[];
  onClose: () => void;
}) {
  if (app === "none") return null;
  const title = app === "calc" ? copy.calc : app === "timer" ? copy.timer : app === "game" ? copy.game : copy.notes;
  return (
    <div className="absolute inset-x-3 bottom-3 z-20 flex max-h-[72%] w-auto flex-col overflow-hidden rounded-lg border border-line bg-panel shadow-lg sm:inset-x-auto sm:right-4 sm:w-80">
      <div className="flex items-center gap-2 border-b border-line px-3 py-2">
        <h2 className="text-sm font-medium">{title}</h2>
        <button type="button" className="ml-auto h-9 rounded-md px-2 text-sm text-muted" onClick={onClose}>
          {copy.close}
        </button>
      </div>
      <div className="min-h-0 flex-1 overflow-auto p-3">
        {app === "calc" ? <Calc /> : null}
        {app === "timer" ? <Timer label={copy.timer} /> : null}
        {app === "game" ? <Rally you={copy.you} nero={copy.nero} scoreLabel={copy.score} hint={copy.gameHint} tier={tier} /> : null}
        {app === "notes" ? (
          notes.length === 0 ? (
            <p className="text-sm text-muted">{copy.noNotes}</p>
          ) : (
            <ul className="flex flex-col gap-1">
              {notes.map((note) => (
                <li key={note} className="rounded-sm border border-line bg-bg px-3 py-2 text-sm">
                  {note}
                </li>
              ))}
            </ul>
          )
        ) : null}
      </div>
    </div>
  );
}

function Calc() {
  const [expr, setExpr] = useState("");
  const press = (token: string) => {
    if (token === "C") {
      setExpr("");
      return;
    }
    if (token === "=") {
      const value = evaluate(expr);
      setExpr(value === null ? "" : String(value));
      return;
    }
    setExpr((prev) => (prev + token).slice(0, 32));
  };
  const keys = ["7", "8", "9", "/", "4", "5", "6", "*", "1", "2", "3", "-", "0", ".", "=", "+", "C"];
  return (
    <div className="flex flex-col gap-2">
      <p className="h-11 truncate rounded-md border border-line bg-bg px-3 py-2 text-right text-lg">{expr || "0"}</p>
      <div className="grid grid-cols-4 gap-2">
        {keys.map((key) => (
          <button key={key} type="button" className="h-11 rounded-md border border-line bg-elevated text-sm" onClick={() => press(key)}>
            {key}
          </button>
        ))}
      </div>
    </div>
  );
}

function Timer({ label }: { label: string }) {
  const [seconds, setSeconds] = useState(60);
  const [left, setLeft] = useState(0);
  useEffect(() => {
    if (left <= 0) return;
    const id = window.setTimeout(() => setLeft((value) => value - 1), 1000);
    return () => window.clearTimeout(id);
  }, [left]);
  const shown = left > 0 ? left : seconds;
  const m = Math.floor(shown / 60);
  const s = shown % 60;
  return (
    <div className="flex flex-col gap-3">
      <p className="text-center font-display text-4xl">{`${m}:${String(s).padStart(2, "0")}`}</p>
      <label className="flex flex-col gap-1 text-sm text-muted">
        {label}
        <input type="range" min={15} max={600} step={15} value={seconds} onChange={(event) => setSeconds(Number(event.target.value))} />
      </label>
      <button type="button" className="h-11 rounded-md bg-accent text-sm font-medium text-accent-fg" onClick={() => setLeft(left > 0 ? 0 : seconds)}>
        {left > 0 ? "Stop" : "Start"}
      </button>
    </div>
  );
}

function Rally({
  you,
  nero,
  scoreLabel,
  hint,
  tier,
}: {
  you: string;
  nero: string;
  scoreLabel: string;
  hint: string;
  tier: PcTier;
}) {
  const youY = useRef(40);
  const neroY = useRef(40);
  const ball = useRef({ x: 50, y: 50, vx: 0.42, vy: 0.28 });
  const [frame, setFrame] = useState({ x: 50, y: 50, you: 40, nero: 40, ys: 0, ns: 0 });
  const score = useRef({ you: 0, nero: 0 });

  useEffect(() => {
    let id = 0;
    let last = performance.now();
    const loop = (now: number) => {
      const dt = Math.min(32, now - last);
      last = now;
      const b = ball.current;
      b.x += b.vx * dt * 0.05;
      b.y += b.vy * dt * 0.05;
      if (b.y < 3 || b.y > 97) b.vy *= -1;
      const chase = tier === "light" ? 0.045 : tier === "mid" ? 0.09 : 0.16;
      neroY.current += (b.y - 9 - neroY.current) * chase;
      if (b.x < 10 && b.vx < 0 && b.y > youY.current && b.y < youY.current + 18) b.vx = Math.abs(b.vx) + 0.02;
      if (b.x > 90 && b.vx > 0 && b.y > neroY.current && b.y < neroY.current + 18) b.vx = -(Math.abs(b.vx) + 0.02);
      if (b.x < 0) {
        score.current.nero += 1;
        b.x = 50;
        b.y = 50;
        b.vx = 0.4;
      }
      if (b.x > 100) {
        score.current.you += 1;
        b.x = 50;
        b.y = 50;
        b.vx = -0.4;
      }
      setFrame({ x: b.x, y: b.y, you: youY.current, nero: neroY.current, ys: score.current.you, ns: score.current.nero });
      id = requestAnimationFrame(loop);
    };
    id = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(id);
  }, [tier]);

  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs text-subtle">{hint}</p>
      <p className="text-sm">
        {scoreLabel}: {you} {frame.ys} — {nero} {frame.ns}
      </p>
      <div
        className="relative h-52 overflow-hidden rounded-md border border-line bg-bg"
        onPointerMove={(event) => {
          const rect = event.currentTarget.getBoundingClientRect();
          const y = ((event.clientY - rect.top) / rect.height) * 100 - 9;
          youY.current = Math.min(82, Math.max(0, y));
        }}
      >
        <span className="absolute w-1.5 rounded-full bg-fg" style={{ left: "4%", top: `${frame.you}%`, height: "18%" }} />
        <span className="absolute w-1.5 rounded-full bg-accent" style={{ right: "4%", top: `${frame.nero}%`, height: "18%" }} />
        <span className="absolute size-3 rounded-full bg-live" style={{ left: `${frame.x}%`, top: `${frame.y}%`, transform: "translate(-50%, -50%)" }} />
      </div>
    </div>
  );
}

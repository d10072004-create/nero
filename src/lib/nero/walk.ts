import type { LookId } from "@/lib/nero/types";

function frames(name: string, count: number): string[] {
  return Array.from({ length: count }, (_, index) => `/nero/walk/${name}-${String(index + 1).padStart(2, "0")}.png`);
}

/** Side-view cycles, 12 drawings a second, feet already planted on one line. */
export const WALK_FRAMES: Partial<Record<LookId, string[]>> = {
  witch: frames("witch", 20),
  evening: frames("evening", 23),
};

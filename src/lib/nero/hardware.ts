import type { BrainModel } from "@/lib/nero/types";

export type PcTier = "light" | "mid" | "strong";

export function detectTier(): PcTier {
  if (typeof navigator === "undefined") return "mid";
  const cores = navigator.hardwareConcurrency || 4;
  const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 4;
  if (cores <= 4 || memory <= 4) return "light";
  if (cores >= 8 && memory >= 8) return "strong";
  return "mid";
}

export function modelForTier(tier: PcTier): BrainModel {
  if (tier === "light") return "local-light";
  return "local";
}

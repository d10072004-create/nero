export const LANGS = ["uk", "ru", "en", "pl", "de", "ja"] as const;
export type Lang = (typeof LANGS)[number];

export const LISTEN_MODES = ["push", "continuous", "wake"] as const;
export type ListenMode = (typeof LISTEN_MODES)[number];

export const HEAR_MODELS = ["browser", "grok-transcribe"] as const;
export type HearModel = (typeof HEAR_MODELS)[number];

export const BRAIN_MODELS = [
  "local-light",
  "local",
  "grok-4.3",
  "grok-4.5",
  "grok-4.7",
  "grok-4.20",
  "gpt-4.1-mini",
  "gpt-4.1",
  "claude-haiku-4-5",
  "claude-sonnet-4-5",
  "gemini-2.5-flash",
  "kimi-k2.6",
  "kimi-k3",
] as const;
export type BrainModel = (typeof BRAIN_MODELS)[number];

export type ModelProvider = "local" | "grok" | "openai" | "anthropic" | "google" | "moonshot";

export const MODEL_PROVIDER: Record<BrainModel, ModelProvider> = {
  "local-light": "local",
  local: "local",
  "grok-4.3": "grok",
  "grok-4.5": "grok",
  "grok-4.7": "grok",
  "grok-4.20": "grok",
  "gpt-4.1-mini": "openai",
  "gpt-4.1": "openai",
  "claude-haiku-4-5": "anthropic",
  "claude-sonnet-4-5": "anthropic",
  "gemini-2.5-flash": "google",
  "kimi-k2.6": "moonshot",
  "kimi-k3": "moonshot",
};

export const VOICE_MODELS = [
  "browser",
  "ara",
  "eve",
  "leo",
  "rex",
  "sal",
  "luna",
  "aurora",
  "liora",
  "orion",
  "iris",
  "celeste",
  "helios",
  "carina",
  "altair",
  "zagan",
  "helix",
] as const;
export type VoiceModel = (typeof VOICE_MODELS)[number];

export const CLOUD_VOICES = ["ara", "eve", "leo", "rex", "sal", "luna", "aurora", "liora", "orion", "iris", "celeste", "helios", "carina", "altair", "zagan", "helix"] as const;

export const LOOKS = ["witch", "moon", "street", "academy", "stars", "pixel", "evening"] as const;
export type LookId = (typeof LOOKS)[number];

export const SCENES = ["library", "rain", "morning", "observatory", "ink"] as const;
export type SceneId = (typeof SCENES)[number];

export type NeroState = "idle" | "listening" | "thinking" | "speaking";
export type NeroPose = NeroState | "walkA" | "walkB";

export type ChatMessage = {
  id: string;
  role: "user" | "nero" | "system";
  text: string;
};

export type PanelId = "none" | "calc" | "timer" | "game" | "notes";

export const LOCALE: Record<Lang, string> = {
  uk: "uk-UA",
  ru: "ru-RU",
  en: "en-US",
  pl: "pl-PL",
  de: "de-DE",
  ja: "ja-JP",
};

function fillLook(base: Partial<Record<NeroPose, string>> & { idle: string }): Record<NeroPose, string> {
  const idle = base.idle;
  return {
    idle,
    listening: base.listening ?? idle,
    thinking: base.thinking ?? base.listening ?? idle,
    speaking: base.speaking ?? idle,
    walkA: base.walkA ?? idle,
    walkB: base.walkB ?? base.walkA ?? idle,
  };
}

export const LOOK_ART: Record<LookId, Record<NeroPose, string>> = {
  witch: fillLook({
    idle: "/nero/witch-idle.png",
    listening: "/nero/witch-listen.png",
    speaking: "/nero/witch-speak.png",
    walkA: "/nero/witch-walk-a.png",
    walkB: "/nero/witch-walk-b.png",
  }),
  moon: fillLook({ idle: "/nero/moon-idle.png" }),
  street: fillLook({ idle: "/nero/street-idle.png" }),
  academy: fillLook({ idle: "/nero/academy-idle.png" }),
  stars: fillLook({ idle: "/nero/stars-idle.png" }),
  pixel: fillLook({
    idle: "/nero/pixel-idle.png",
    walkA: "/nero/pixel-walk.png",
    walkB: "/nero/pixel-idle.png",
  }),
  evening: fillLook({
    idle: "/nero/evening-idle.png",
    speaking: "/nero/evening-speak.png",
    walkA: "/nero/evening-walk-a.png",
    walkB: "/nero/evening-walk-b.png",
  }),
};

export const SCENE_ART: Record<Exclude<SceneId, "ink">, string> = {
  library: "/nero/bg-library.jpg",
  rain: "/nero/bg-rain.jpg",
  morning: "/nero/bg-morning.jpg",
  observatory: "/nero/bg-observatory.jpg",
};

export function sensitivityToRms(value: number): number {
  const clamped = Math.min(100, Math.max(0, value));
  return 0.004 + (clamped / 100) * 0.046;
}

export const WAKE_RE = /\b(неро|нэро|нєро|nero|нейро)\b[\s,.!?:-]*/i;

export function stripWake(text: string): { command: string; woke: boolean } {
  const match = WAKE_RE.exec(text);
  if (!match) return { command: text.trim(), woke: false };
  const command = (text.slice(0, match.index) + text.slice(match.index + match[0].length)).trim();
  return { command, woke: true };
}

export function keyForProvider(provider: ModelProvider, keys: { openai: string; anthropic: string; google: string; moonshot: string }): string {
  if (provider === "openai") return keys.openai;
  if (provider === "anthropic") return keys.anthropic;
  if (provider === "google") return keys.google;
  if (provider === "moonshot") return keys.moonshot;
  return "";
}

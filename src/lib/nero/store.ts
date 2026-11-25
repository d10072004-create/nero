import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { BrainModel, HearModel, Lang, ListenMode, LookId, SceneId, VoiceModel } from "@/lib/nero/types";

export type ApiKeys = {
  openai: string;
  anthropic: string;
  google: string;
  moonshot: string;
};

export type MotionLevel = "full" | "soft";

export type NeroSettings = {
  lang: Lang;
  listenMode: ListenMode;
  hearModel: HearModel;
  sensitivity: number;
  brain: BrainModel;
  autoBrain: boolean;
  brainPinned: boolean;
  voice: VoiceModel;
  systemVoice: string;
  rate: number;
  pitch: number;
  look: LookId;
  scene: SceneId;
  scale: number;
  roam: boolean;
  motion: MotionLevel;
  keys: ApiKeys;
  notes: string[];
};

type NeroStore = NeroSettings & {
  patch: (partial: Partial<NeroSettings>) => void;
};

const emptyKeys: ApiKeys = { openai: "", anthropic: "", google: "", moonshot: "" };

export const useNeroStore = create<NeroStore>()(
  persist(
    (set) => ({
      lang: "uk",
      listenMode: "push",
      hearModel: "browser",
      sensitivity: 12,
      brain: "local",
      autoBrain: true,
      brainPinned: false,
      voice: "browser",
      systemVoice: "",
      rate: 100,
      pitch: 100,
      look: "witch",
      scene: "library",
      scale: 100,
      roam: true,
      motion: "full",
      keys: emptyKeys,
      notes: [],
      patch: (partial) => set(partial),
    }),
    {
      name: "nero-studio",
      skipHydration: true,
      partialize: (state) => ({
        lang: state.lang,
        listenMode: state.listenMode,
        hearModel: state.hearModel,
        sensitivity: state.sensitivity,
        brain: state.brain,
        autoBrain: state.autoBrain,
        brainPinned: state.brainPinned,
        voice: state.voice,
        systemVoice: state.systemVoice,
        rate: state.rate,
        pitch: state.pitch,
        look: state.look,
        scene: state.scene,
        scale: state.scale,
        roam: state.roam,
        motion: state.motion,
        keys: state.keys,
        notes: state.notes,
      }),
    },
  ),
);

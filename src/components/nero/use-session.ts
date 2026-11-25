import { useCallback, useEffect, useRef, useState } from "react";
import { askNero, speakNero, transcribeNero } from "@/lib/nero/ai";
import { localAnswer } from "@/lib/nero/brain";
import { detectTier, modelForTier } from "@/lib/nero/hardware";
import { copyFor } from "@/lib/nero/i18n";
import { useNeroStore } from "@/lib/nero/store";
import {
  keyForProvider,
  LOCALE,
  MODEL_PROVIDER,
  sensitivityToRms,
  stripWake,
  type ChatMessage,
  type NeroState,
  type PanelId,
} from "@/lib/nero/types";

type Rec = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((ev: RecEvent) => void) | null;
  onerror: ((ev: { error: string }) => void) | null;
  onend: (() => void) | null;
};

type RecEvent = {
  resultIndex: number;
  results: ArrayLike<{ isFinal: boolean; 0: { transcript: string } }>;
};

function getRecognizer(): (new () => Rec) | null {
  if (typeof window === "undefined") return null;
  const w = window as Window & {
    SpeechRecognition?: new () => Rec;
    webkitSpeechRecognition?: new () => Rec;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

function downsample(input: Float32Array, inRate: number, outRate: number): Float32Array {
  if (inRate === outRate) return input;
  const ratio = inRate / outRate;
  const length = Math.floor(input.length / ratio);
  const out = new Float32Array(length);
  for (let i = 0; i < length; i += 1) {
    const start = Math.floor(i * ratio);
    const end = Math.max(start + 1, Math.floor((i + 1) * ratio));
    let sum = 0;
    for (let j = start; j < end && j < input.length; j += 1) sum += input[j] ?? 0;
    out[i] = sum / (end - start);
  }
  return out;
}

function encodeWav(samples: Float32Array, sampleRate: number): Blob {
  const buffer = new ArrayBuffer(44 + samples.length * 2);
  const view = new DataView(buffer);
  const write = (offset: number, text: string) => {
    for (let i = 0; i < text.length; i += 1) view.setUint8(offset + i, text.charCodeAt(i));
  };
  write(0, "RIFF");
  view.setUint32(4, 36 + samples.length * 2, true);
  write(8, "WAVE");
  write(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  write(36, "data");
  view.setUint32(40, samples.length * 2, true);
  let offset = 44;
  for (let i = 0; i < samples.length; i += 1) {
    const s = Math.max(-1, Math.min(1, samples[i] ?? 0));
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
    offset += 2;
  }
  return new Blob([buffer], { type: "audio/wav" });
}

async function blobToBase64(blob: Blob): Promise<string> {
  const bytes = new Uint8Array(await blob.arrayBuffer());
  let binary = "";
  const step = 8192;
  for (let i = 0; i < bytes.length; i += step) {
    binary += String.fromCharCode(...bytes.subarray(i, i + step));
  }
  return btoa(binary);
}

function rmsOf(samples: Float32Array): number {
  let sum = 0;
  for (let i = 0; i < samples.length; i += 1) sum += (samples[i] ?? 0) ** 2;
  return Math.sqrt(sum / (samples.length || 1));
}

function uid(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

export function useNeroSession() {
  const settings = useNeroStore();
  const copy = copyFor(settings.lang);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [neroState, setNeroState] = useState<NeroState>("idle");
  const [caption, setCaption] = useState("");
  const [level, setLevel] = useState(0);
  const [draft, setDraft] = useState("");
  const [testing, setTesting] = useState(false);
  const [app, setApp] = useState<PanelId>("none");
  const [desktopOn, setDesktopOn] = useState(false);
  const [systemVoices, setSystemVoices] = useState<{ uri: string; label: string }[]>([]);
  const tier = detectTier();

  const messagesRef = useRef(messages);
  messagesRef.current = messages;
  const recRef = useRef<Rec | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const rafRef = useRef(0);
  const turnRef = useRef(0);
  const armedRef = useRef(false);
  const keepRef = useRef(false);
  const stopRecRef = useRef(false);
  const busyRef = useRef(false);
  const voiceWarned = useRef(false);
  const aliveRef = useRef(true);
  const startRef = useRef<() => void>(() => {});

  const push = useCallback((role: ChatMessage["role"], text: string) => {
    setMessages((prev) => [...prev, { id: uid(), role, text }].slice(-40));
  }, []);

  const stopMeter = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setLevel(0);
  }, []);

  const stopSpeech = useCallback(() => {
    if (typeof window !== "undefined") window.speechSynthesis?.cancel();
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
  }, []);

  const stopListen = useCallback(() => {
    keepRef.current = false;
    stopRecRef.current = true;
    recRef.current?.abort();
    recRef.current = null;
    stopMeter();
  }, [stopMeter]);

  const startMeter = useCallback(async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: { echoCancellation: true, noiseSuppression: true },
    });
    streamRef.current = stream;
    const ctx = new AudioContext();
    const source = ctx.createMediaStreamSource(stream);
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 1024;
    source.connect(analyser);
    const data = new Float32Array(analyser.fftSize);
    const tick = () => {
      analyser.getFloatTimeDomainData(data);
      setLevel(rmsOf(data));
      rafRef.current = requestAnimationFrame(tick);
    };
    tick();
    return () => {
      cancelAnimationFrame(rafRef.current);
      source.disconnect();
      void ctx.close();
    };
  }, []);

  const speak = useCallback(
    async (text: string) => {
      const line = text.trim().slice(0, 500);
      if (!line || typeof window === "undefined") return;
      stopSpeech();
      setNeroState("speaking");
      setCaption(line);
      const { voice, lang, rate, pitch, systemVoice } = useNeroStore.getState();
      if (voice !== "browser") {
        try {
          const cloud = await speakNero({ data: { text: line, voiceId: voice, language: lang } });
          if (cloud.ok) {
            await new Promise<void>((resolve) => {
              const audio = new Audio(`data:${cloud.mime};base64,${cloud.audioBase64}`);
              audio.playbackRate = Math.min(1.4, Math.max(0.8, rate / 100));
              audioRef.current = audio;
              audio.onended = () => resolve();
              audio.onerror = () => resolve();
              void audio.play().catch(() => resolve());
            });
            return;
          }
        } catch {
          // fall through to the browser voice
        }
        if (!voiceWarned.current) {
          voiceWarned.current = true;
          push("system", copyFor(useNeroStore.getState().lang).voiceFallback);
        }
      }
      await new Promise<void>((resolve) => {
        const utterance = new SpeechSynthesisUtterance(line);
        utterance.lang = LOCALE[lang];
        utterance.rate = rate / 100;
        utterance.pitch = pitch / 100;
        const voices = window.speechSynthesis.getVoices();
        const picked =
          voices.find((item) => item.voiceURI === systemVoice) ??
          voices.find((item) => item.lang.toLowerCase().startsWith(lang));
        if (picked) utterance.voice = picked;
        utterance.onend = () => resolve();
        utterance.onerror = () => resolve();
        window.speechSynthesis.resume();
        window.speechSynthesis.speak(utterance);
      });
    },
    [push, stopSpeech],
  );

  const respond = useCallback(
    async (raw: string, forced: boolean) => {
      const text = raw.trim();
      if (!text) return;
      const my = ++turnRef.current;
      const state = useNeroStore.getState();
      const copyNow = copyFor(state.lang);
      const { command, woke } = stripWake(text);
      if (!forced && state.listenMode === "wake" && !woke && !armedRef.current) {
        setCaption(`${copyNow.heard}: ${text}`);
        return;
      }
      busyRef.current = true;
      recRef.current?.abort();
      recRef.current = null;
      stopMeter();
      armedRef.current = false;
      const prompt = (command || (woke ? "" : text)).trim();
      push("user", text);
      const finish = () => {
        busyRef.current = false;
        if (!aliveRef.current || turnRef.current !== my) return;
        if (keepRef.current) startRef.current();
        else {
          setNeroState("idle");
          setCaption("");
        }
      };
      if (!prompt) {
        armedRef.current = true;
        await speak(copyNow.ack);
        finish();
        return;
      }
      setNeroState("thinking");
      setCaption(copyNow.stateThinking);
      const local = localAnswer(prompt, state.lang, state.notes);
      if (local.notes) useNeroStore.getState().patch({ notes: local.notes });
      if (local.roam !== undefined) useNeroStore.getState().patch({ roam: local.roam });
      if (local.app === "desktop") setDesktopOn(true);
      else if (local.app) setApp(local.app);
      let reply = "";
      const localBrain = state.brain === "local" || state.brain === "local-light";
      if (local.intercept || localBrain) {
        reply = local.reply;
        if (state.brain === "local-light" && !local.intercept) {
          reply = reply.split(/(?<=[.!?。])\s/)[0] ?? reply;
        }
      } else {
        const history = messagesRef.current
          .filter((item) => item.role !== "system")
          .slice(-8)
          .map((item) => ({
            role: item.role === "nero" ? ("assistant" as const) : ("user" as const),
            content: item.text,
          }));
        const provider = MODEL_PROVIDER[state.brain];
        const apiKey = keyForProvider(provider, state.keys);
        try {
          const cloud = await askNero({
            data: { text: prompt, model: state.brain, language: state.lang, history, apiKey },
          });
          if (!cloud.ok) {
            const note =
              cloud.error === "missing key"
                ? copyNow.missingKey
                : cloud.code === "credits"
                  ? copyNow.cloudCredits
                  : copyNow.cloudFailed;
            push("system", note);
            reply = local.reply;
          } else {
            reply = cloud.text;
          }
        } catch {
          push("system", copyNow.cloudFailed);
          reply = local.reply;
        }
      }
      if (turnRef.current !== my) {
        busyRef.current = false;
        return;
      }
      push("nero", reply);
      await speak(reply);
      finish();
    },
    [push, speak],
  );

  const recordCloud = useCallback(async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: { echoCancellation: true, noiseSuppression: true },
    });
    streamRef.current = stream;
    const ctx = new AudioContext();
    const source = ctx.createMediaStreamSource(stream);
    const processor = ctx.createScriptProcessor(4096, 1, 1);
    const mute = ctx.createGain();
    mute.gain.value = 0;
    source.connect(processor);
    processor.connect(mute);
    mute.connect(ctx.destination);
    const threshold = sensitivityToRms(useNeroStore.getState().sensitivity);
    const chunks: Float32Array[] = [];
    const pre: Float32Array[] = [];
    let started = false;
    let silence = 0;
    let peak = 0;
    const captured = await new Promise<boolean>((resolve) => {
      const timer = window.setTimeout(() => resolve(started), 10000);
      processor.onaudioprocess = (event) => {
        const copy = new Float32Array(event.inputBuffer.getChannelData(0));
        const rms = rmsOf(copy);
        peak = Math.max(peak, rms);
        setLevel(rms);
        if (stopRecRef.current) {
          window.clearTimeout(timer);
          resolve(started);
          return;
        }
        if (!started) {
          pre.push(copy);
          if (pre.length > 3) pre.shift();
          if (rms >= threshold) {
            started = true;
            chunks.push(...pre);
          }
          return;
        }
        chunks.push(copy);
        silence = rms >= threshold * 0.8 ? 0 : silence + 1;
        if (silence > 8 || chunks.length > 160) {
          window.clearTimeout(timer);
          resolve(true);
        }
      };
    });
    processor.disconnect();
    source.disconnect();
    mute.disconnect();
    const inputRate = ctx.sampleRate;
    stream.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    await ctx.close();
    setLevel(0);
    if (!captured || chunks.length === 0) return { text: "", quiet: peak < threshold, failed: false };
    let length = 0;
    for (const chunk of chunks) length += chunk.length;
    const merged = new Float32Array(length);
    let offset = 0;
    for (const chunk of chunks) {
      merged.set(chunk, offset);
      offset += chunk.length;
    }
    const samples = downsample(merged, inputRate, 16000);
    const wav = encodeWav(samples, 16000);
    const audioBase64 = await blobToBase64(wav);
    const lang = useNeroStore.getState().lang;
    const heard = await transcribeNero({ data: { audioBase64, language: lang } });
    if (!heard.ok) {
      const copyNow = copyFor(lang);
      push("system", heard.code === "credits" ? copyNow.hearCredits : copyNow.cloudFailed);
      return { text: "", quiet: false, failed: true };
    }
    return { text: heard.text, quiet: false, failed: false };
  }, [push]);

  const beginBrowser = useCallback(() => {
    const Ctor = getRecognizer();
    const copyNow = copyFor(useNeroStore.getState().lang);
    if (!Ctor) {
      push("system", copyNow.noRecognizer);
      setNeroState("idle");
      return;
    }
    const rec = new Ctor();
    rec.lang = LOCALE[useNeroStore.getState().lang];
    rec.interimResults = true;
    rec.continuous = useNeroStore.getState().listenMode !== "push";
    rec.onresult = (event) => {
      let interim = "";
      let finalText = "";
      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        const row = event.results[i];
        const said = row?.[0]?.transcript ?? "";
        if (row?.isFinal) finalText += said;
        else interim += said;
      }
      if (interim) setCaption(interim.trim());
      const phrase = finalText.trim();
      if (phrase) {
        setCaption(phrase);
        if (useNeroStore.getState().listenMode === "push") keepRef.current = false;
        void respond(phrase, false);
      }
    };
    rec.onerror = (event) => {
      if (event.error === "not-allowed" || event.error === "service-not-allowed") {
        push("system", copyNow.micDenied);
        keepRef.current = false;
      } else if (event.error === "audio-capture") {
        push("system", copyNow.micDenied);
        keepRef.current = false;
      } else if (event.error !== "no-speech" && event.error !== "aborted") {
        push("system", copyNow.missed);
      }
    };
    rec.onend = () => {
      if (!aliveRef.current) return;
      if (keepRef.current && !busyRef.current && recRef.current === rec) {
        try {
          rec.start();
        } catch {
          keepRef.current = false;
          setNeroState("idle");
        }
        return;
      }
      setNeroState((current) => (current === "listening" ? "idle" : current));
    };
    recRef.current = rec;
    rec.start();
    void startMeter().catch(() => {
      // The recognizer can still hear if the meter stream was rejected.
    });
  }, [push, respond, startMeter]);

  const startListen = useCallback(() => {
    stopSpeech();
    stopListen();
    const mode = useNeroStore.getState().listenMode;
    keepRef.current = mode !== "push";
    stopRecRef.current = false;
    setNeroState("listening");
    setCaption(copyFor(useNeroStore.getState().lang).stateListening);
    if (useNeroStore.getState().hearModel === "browser") {
      beginBrowser();
      return;
    }
    void (async () => {
      try {
        const heard = await recordCloud();
        if (!aliveRef.current || stopRecRef.current) {
          setNeroState("idle");
          return;
        }
        if (!heard.text) {
          setNeroState("idle");
          if (heard.quiet) {
            const quiet = copyFor(useNeroStore.getState().lang).tooQuiet;
            setCaption(quiet);
            push("system", quiet);
          }
          if (keepRef.current && !heard.failed) startRef.current();
          return;
        }
        await respond(heard.text, false);
      } catch {
        setNeroState("idle");
        push("system", copyFor(useNeroStore.getState().lang).micDenied);
      }
    })();
  }, [beginBrowser, push, recordCloud, respond, stopListen, stopSpeech]);

  startRef.current = startListen;

  const toggleListen = useCallback(() => {
    if (neroState === "listening") {
      stopListen();
      setNeroState("idle");
      setCaption("");
      return;
    }
    if (neroState === "speaking" || neroState === "thinking") {
      turnRef.current += 1;
      stopSpeech();
      stopListen();
      setNeroState("idle");
      return;
    }
    startListen();
  }, [neroState, startListen, stopListen, stopSpeech]);

  const wake = useCallback(() => {
    armedRef.current = true;
    if (neroState !== "listening") startListen();
  }, [neroState, startListen]);

  const submit = useCallback(() => {
    const text = draft.trim();
    if (!text) return;
    setDraft("");
    keepRef.current = false;
    stopListen();
    turnRef.current += 1;
    stopSpeech();
    void respond(text, true);
  }, [draft, respond, stopListen, stopSpeech]);

  const testMic = useCallback(async () => {
    setTesting(true);
    setCaption(copyFor(useNeroStore.getState().lang).testLive);
    try {
      await startMeter();
      await new Promise((resolve) => window.setTimeout(resolve, 2500));
    } catch {
      push("system", copyFor(useNeroStore.getState().lang).micDenied);
    } finally {
      stopMeter();
      setTesting(false);
      setCaption("");
    }
  }, [push, startMeter, stopMeter]);

  useEffect(() => {
    aliveRef.current = true;
    const applyTier = () => {
      const state = useNeroStore.getState();
      let legacy = false;
      try {
        const saved = JSON.parse(localStorage.getItem("nero-studio") || "null") as { state?: object } | null;
        legacy = !!saved?.state && !("autoBrain" in saved.state);
      } catch {
        legacy = false;
      }
      if (legacy) {
        if (!state.brainPinned) state.patch({ brainPinned: true, autoBrain: false });
        return;
      }
      if (state.autoBrain && !state.brainPinned) {
        const next = modelForTier(detectTier());
        if (state.brain !== next) state.patch({ brain: next });
      }
    };
    const unsub = useNeroStore.persist.onFinishHydration(applyTier);
    void useNeroStore.persist.rehydrate();
    const synth = window.speechSynthesis;
    const warm = () => {
      const lang = useNeroStore.getState().lang;
      const all = synth.getVoices();
      const pref = all.filter((item) => item.lang.toLowerCase().startsWith(lang));
      const rest = all.filter((item) => !item.lang.toLowerCase().startsWith(lang));
      setSystemVoices(
        [...pref, ...rest].slice(0, 16).map((item) => ({ uri: item.voiceURI, label: `${item.name} · ${item.lang}` })),
      );
    };
    warm();
    synth.addEventListener("voiceschanged", warm);
    return () => {
      aliveRef.current = false;
      unsub();
      synth.removeEventListener("voiceschanged", warm);
      keepRef.current = false;
      stopRecRef.current = true;
      recRef.current?.abort();
      stopSpeech();
      stopMeter();
    };
  }, [stopMeter, stopSpeech]);

  return {
    copy,
    settings,
    messages,
    neroState,
    caption,
    level,
    draft,
    setDraft,
    testing,
    threshold: sensitivityToRms(settings.sensitivity),
    toggleListen,
    wake,
    submit,
    testMic,
    clearChat: () => setMessages([]),
    app,
    setApp,
    desktopOn,
    setDesktopOn,
    systemVoices,
    tier,
  };
}

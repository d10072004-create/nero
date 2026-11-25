import { createServerFn } from "@tanstack/react-start";
import { BRAIN_MODELS, CLOUD_VOICES, MODEL_PROVIDER, type BrainModel } from "@/lib/nero/types";

type AskResult =
  | { ok: true; text: string }
  | { ok: false; code: "credits" | "unavailable" | "failed"; error: string };

type SpeakResult =
  | { ok: true; audioBase64: string; mime: string }
  | { ok: false; code: "credits" | "unavailable" | "failed"; error: string };

type HearResult =
  | { ok: true; text: string }
  | { ok: false; code: "credits" | "unavailable" | "failed"; error: string };

const GROK_MODELS = BRAIN_MODELS.filter((model) => MODEL_PROVIDER[model] === "grok");

function isListedModel(value: unknown): value is Exclude<BrainModel, "local" | "local-light"> {
  return typeof value === "string" && (BRAIN_MODELS as readonly string[]).includes(value) && value !== "local" && value !== "local-light";
}

function isVoice(value: unknown): value is (typeof CLOUD_VOICES)[number] {
  return typeof value === "string" && (CLOUD_VOICES as readonly string[]).includes(value);
}

function clip(value: unknown, max: number): string {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function classify(status: number, body: string): "credits" | "unavailable" | "failed" {
  const low = body.toLowerCase();
  if (status === 402 || low.includes("spending-limit") || low.includes("credit")) return "credits";
  if (status === 401 || status === 403) return "unavailable";
  return "failed";
}

async function readError(res: Response): Promise<string> {
  const text = await res.text();
  return text.slice(0, 400);
}

export const askNero = createServerFn({ method: "POST" })
  .validator((input: unknown) => {
    const raw = (input ?? {}) as {
      text?: unknown;
      model?: unknown;
      language?: unknown;
      history?: unknown;
      apiKey?: unknown;
    };
    const text = clip(raw.text, 2000);
    if (!text) throw new Error("empty");
    const model = isListedModel(raw.model) ? raw.model : "grok-4.5";
    const language = clip(raw.language, 12) || "uk";
    const apiKey = clip(raw.apiKey, 300);
    const history = Array.isArray(raw.history)
      ? raw.history
          .slice(-8)
          .map((item) => {
            const row = item as { role?: unknown; content?: unknown };
            const role = row.role === "assistant" ? "assistant" : "user";
            const content = clip(row.content, 2000);
            return content ? { role, content } : null;
          })
          .filter((item): item is { role: "user" | "assistant"; content: string } => item !== null)
      : [];
    return { text, model, language, history, apiKey };
  })
  .handler(async ({ data }): Promise<AskResult> => {
    const system =
      `Ти — Неро, голосовий асистент. Відповідай коротко, 1–3 речення, мовою «${data.language}». ` +
      "Без markdown, списків і емодзі: відповідь озвучать. Ти спокійна і тепла. Не вигадуй, що відкрила програми операційної системи.";
    const provider = MODEL_PROVIDER[data.model];
    if (provider === "anthropic") {
      if (!data.apiKey) return { ok: false, code: "unavailable", error: "missing key" };
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": data.apiKey,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: data.model,
          max_tokens: 180,
          system,
          messages: [...data.history, { role: "user", content: data.text }],
        }),
      });
      if (!res.ok) return { ok: false, code: classify(res.status, await readError(res)), error: "anthropic" };
      const body = (await res.json()) as { content?: { text?: string }[] };
      const text = body.content?.map((part) => part.text ?? "").join("").trim() ?? "";
      if (!text) return { ok: false, code: "failed", error: "empty completion" };
      return { ok: true, text: text.slice(0, 800) };
    }
    if (provider === "google") {
      if (!data.apiKey) return { ok: false, code: "unavailable", error: "missing key" };
      const contents = [...data.history, { role: "user" as const, content: data.text }].map((item) => ({
        role: item.role === "assistant" ? "model" : "user",
        parts: [{ text: item.content }],
      }));
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${data.model}:generateContent`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json", "x-goog-api-key": data.apiKey },
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: system }] },
            contents,
            generationConfig: { maxOutputTokens: 180, temperature: 0.7 },
          }),
        },
      );
      if (!res.ok) return { ok: false, code: classify(res.status, await readError(res)), error: "google" };
      const body = (await res.json()) as { candidates?: { content?: { parts?: { text?: string }[] } }[] };
      const text = body.candidates?.[0]?.content?.parts?.map((part) => part.text ?? "").join("").trim() ?? "";
      if (!text) return { ok: false, code: "failed", error: "empty completion" };
      return { ok: true, text: text.slice(0, 800) };
    }
    const key = provider === "grok" ? process.env.XAI_API_KEY : data.apiKey;
    if (!key) return { ok: false, code: "unavailable", error: "missing key" };
    const url =
      provider === "openai"
        ? "https://api.openai.com/v1/chat/completions"
        : provider === "moonshot"
          ? "https://api.moonshot.ai/v1/chat/completions"
          : "https://api.x.ai/v1/chat/completions";
    const model = provider === "grok" && !(GROK_MODELS as readonly string[]).includes(data.model) ? "grok-4.5" : data.model;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
      body: JSON.stringify({
        model,
        max_tokens: 180,
        temperature: 0.7,
        messages: [{ role: "system", content: system }, ...data.history, { role: "user", content: data.text }],
      }),
    });
    if (!res.ok) {
      const error = await readError(res);
      return { ok: false, code: classify(res.status, error), error: provider };
    }
    const body = (await res.json()) as { choices?: { message?: { content?: string } }[] };
    const text = body.choices?.[0]?.message?.content?.trim() ?? "";
    if (!text) return { ok: false, code: "failed", error: "empty completion" };
    return { ok: true, text: text.slice(0, 800) };
  });

export const speakNero = createServerFn({ method: "POST" })
  .validator((input: unknown) => {
    const raw = (input ?? {}) as { text?: unknown; voiceId?: unknown; language?: unknown };
    const text = clip(raw.text, 500);
    if (!text) throw new Error("empty");
    const voiceId = isVoice(raw.voiceId) ? raw.voiceId : "ara";
    const language = clip(raw.language, 8) || "uk";
    return { text, voiceId, language };
  })
  .handler(async ({ data }): Promise<SpeakResult> => {
    const apiKey = process.env.XAI_API_KEY;
    if (!apiKey) return { ok: false, code: "unavailable", error: "missing key" };
    const res = await fetch("https://api.x.ai/v1/tts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        text: data.text,
        voice_id: data.voiceId,
        language: data.language,
      }),
    });
    if (!res.ok) {
      const error = await readError(res);
      return { ok: false, code: classify(res.status, error), error };
    }
    const bytes = new Uint8Array(await res.arrayBuffer());
    if (bytes.byteLength === 0) return { ok: false, code: "failed", error: "empty audio" };
    if (bytes.byteLength > 2_000_000) return { ok: false, code: "failed", error: "audio too large" };
    let binary = "";
    const step = 8192;
    for (let i = 0; i < bytes.length; i += step) {
      binary += String.fromCharCode(...bytes.subarray(i, i + step));
    }
    return {
      ok: true,
      audioBase64: btoa(binary),
      mime: res.headers.get("content-type") || "audio/mpeg",
    };
  });

export const transcribeNero = createServerFn({ method: "POST" })
  .validator((input: unknown) => {
    const raw = (input ?? {}) as { audioBase64?: unknown; language?: unknown };
    const audioBase64 = clip(raw.audioBase64, 1_800_000);
    if (audioBase64.length < 100) throw new Error("empty audio");
    const language = clip(raw.language, 8) || "uk";
    return { audioBase64, language };
  })
  .handler(async ({ data }): Promise<HearResult> => {
    const apiKey = process.env.XAI_API_KEY;
    if (!apiKey) return { ok: false, code: "unavailable", error: "missing key" };
    const binary = atob(data.audioBase64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
    const form = new FormData();
    form.append("model", "grok-voice-transcribe-2.0");
    form.append("language", data.language);
    form.append("file", new Blob([bytes], { type: "audio/wav" }), "nero.wav");
    const res = await fetch("https://api.x.ai/v1/stt", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}` },
      body: form,
    });
    if (!res.ok) {
      const error = await readError(res);
      return { ok: false, code: classify(res.status, error), error };
    }
    const body = (await res.json()) as { text?: string; transcript?: string };
    const text = (body.text || body.transcript || "").trim();
    if (!text) return { ok: false, code: "failed", error: "empty transcript" };
    return { ok: true, text: text.slice(0, 2000) };
  });

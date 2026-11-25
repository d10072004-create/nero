import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  AppWindow,
  AudioLines,
  Brain,
  Calculator,
  Image as ImageIcon,
  Languages,
  Mic,
  MonitorUp,
  Send,
  Shirt,
  Square,
  Timer,
  Trash2,
} from "lucide-react";
import { DesktopPet, canLeaveDesktop } from "@/components/nero/desktop-pet";
import { NeroActor } from "@/components/nero/figure";
import { neroDesktop } from "@/lib/nero/desktop";
import { StageTools } from "@/components/nero/tools";
import { useNeroSession } from "@/components/nero/use-session";
import { modelForTier } from "@/lib/nero/hardware";
import type { Copy } from "@/lib/nero/i18n";
import type { NeroSettings } from "@/lib/nero/store";
import { WALK_FRAMES } from "@/lib/nero/walk";
import {
  BRAIN_MODELS,
  HEAR_MODELS,
  LANGS,
  LISTEN_MODES,
  LOOK_ART,
  LOOKS,
  MODEL_PROVIDER,
  SCENE_ART,
  SCENES,
  VOICE_MODELS,
  type BrainModel,
  type HearModel,
  type Lang,
  type ListenMode,
  type LookId,
  type SceneId,
  type VoiceModel,
} from "@/lib/nero/types";

const STATE_DOT = {
  idle: "bg-subtle",
  listening: "bg-live",
  thinking: "bg-warn",
  speaking: "bg-accent",
} as const;

export function Studio() {
  const session = useNeroSession();
  const {
    copy,
    settings,
    messages,
    neroState,
    caption,
    level,
    draft,
    setDraft,
    testing,
    threshold,
    toggleListen,
    wake,
    submit,
    testMic,
    clearChat,
    app,
    setApp,
    desktopOn,
    setDesktopOn,
    systemVoices,
    tier,
  } = session;
  const [tab, setTab] = useState<"talk" | "settings">("talk");
  const [desktopNote, setDesktopNote] = useState("");
  const endRef = useRef<HTMLDivElement>(null);
  const walkFrames =
    settings.roam && settings.motion === "full" && neroState === "idle" ? WALK_FRAMES[settings.look] : undefined;
  const stateLabel = {
    idle: copy.stateIdle,
    listening: copy.stateListening,
    thinking: copy.stateThinking,
    speaking: copy.stateSpeaking,
  }[neroState];

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" });
  }, [messages, tab]);

  useEffect(() => {
    if (desktopOn && !canLeaveDesktop()) {
      setDesktopOn(false);
      setDesktopNote(copy.desktopUnsupported);
    }
  }, [desktopOn, copy.desktopUnsupported, setDesktopOn]);

  const openDesktop = () => {
    const desk = neroDesktop();
    if (desk) {
      setDesktopNote("");
      void desk.openPet();
      return;
    }
    if (!canLeaveDesktop()) {
      setDesktopNote(copy.desktopUnsupported);
      return;
    }
    setDesktopNote("");
    setDesktopOn(true);
  };

  const meter = Math.min(100, (level / 0.08) * 100);
  const gate = Math.min(100, (threshold / 0.08) * 100);

  return (
    <main className="flex h-dvh flex-col overflow-hidden bg-bg text-fg">
      <header className="flex h-14 shrink-0 items-center gap-3 border-b border-line px-4 sm:px-6">
        <div className="min-w-0">
          <p className="font-display text-xl leading-none font-medium tracking-tight">Nero</p>
          <p className="text-xs text-muted">{copy.kicker}</p>
        </div>
        <button
          type="button"
          className="ml-auto hidden h-11 items-center gap-2 rounded-md border border-line bg-elevated px-3 text-sm text-fg sm:flex"
          onClick={() => setTab("settings")}
        >
          <Brain className="size-4" aria-hidden />
          {copy.brains[settings.brain]}
        </button>
        <button
          type="button"
          className="flex h-11 items-center gap-2 rounded-md border border-line bg-elevated px-3 text-sm text-fg"
          onClick={openDesktop}
        >
          <MonitorUp className="size-4" aria-hidden />
          <span className="hidden sm:inline">{copy.openDesktop}</span>
        </button>
        <button
          type="button"
          className="flex h-11 items-center gap-2 rounded-md border border-line bg-elevated px-3 text-sm text-fg"
          onClick={() => setTab("settings")}
        >
          <Languages className="size-4" aria-hidden />
          {copy.langName[settings.lang]}
        </button>
      </header>

      <div className="grid min-h-0 flex-1 grid-rows-[minmax(0,1.3fr)_minmax(0,1fr)] lg:grid-cols-[minmax(0,1.35fr)_minmax(320px,420px)] lg:grid-rows-1">
        <section className="relative h-full min-h-0 overflow-hidden bg-bg" aria-label={copy.nero}>
          {settings.scene !== "ink" ? (
            <img
              src={SCENE_ART[settings.scene]}
              alt=""
              className="absolute inset-0 h-full w-full object-cover"
            />
          ) : null}
          <div className="absolute inset-x-0 top-0 flex flex-col gap-2 p-4 sm:p-6">
            <p className="flex w-fit items-center gap-2 rounded-md border border-line bg-panel px-3 py-2 text-sm">
              <span className={`size-2 rounded-full ${STATE_DOT[neroState]}`} aria-hidden />
              {stateLabel}
            </p>
            {caption ? (
              <p className="max-w-md rounded-lg border border-line bg-panel px-4 py-3 text-sm text-fg">{caption}</p>
            ) : null}
            {desktopNote ? <p className="max-w-md text-xs text-subtle">{desktopNote}</p> : null}
            <div className="flex flex-wrap gap-2">
              <Mini icon={<Calculator className="size-4" />} label={copy.calc} onClick={() => setApp("calc")} />
              <Mini icon={<Timer className="size-4" />} label={copy.timer} onClick={() => setApp("timer")} />
              <Mini icon={<AppWindow className="size-4" />} label={copy.game} onClick={() => setApp("game")} />
            </div>
          </div>
          <div className="absolute inset-0 flex items-end justify-center overflow-hidden px-3 pb-0">
            <NeroActor
              look={settings.look}
              state={neroState}
              roam={settings.roam}
              motion={settings.motion}
              scale={settings.scale}
              label={copy.listen}
              onDoubleClick={wake}
            />
          </div>
          <StageTools app={app} copy={copy} tier={tier} notes={settings.notes} onClose={() => setApp("none")} />
          <DesktopPet
            open={desktopOn}
            src={LOOK_ART[settings.look][neroState === "speaking" ? "speaking" : "idle"]}
            frames={walkFrames}
            onClose={() => setDesktopOn(false)}
          />
        </section>

        <aside className="flex min-h-0 flex-col border-t border-line bg-panel lg:border-t-0 lg:border-l">
          <div className="flex gap-1 p-2">
            <button
              type="button"
              className={`h-11 flex-1 rounded-sm text-sm font-medium ${tab === "talk" ? "bg-accent text-accent-fg" : "text-muted"}`}
              onClick={() => setTab("talk")}
            >
              {copy.talk}
            </button>
            <button
              type="button"
              className={`h-11 flex-1 rounded-sm text-sm font-medium ${tab === "settings" ? "bg-accent text-accent-fg" : "text-muted"}`}
              onClick={() => setTab("settings")}
            >
              {copy.settings}
            </button>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-4">
            {tab === "talk" ? (
              <div className="flex flex-col gap-3" aria-live="polite">
                {messages.length === 0 ? <p className="pt-2 text-sm text-muted">{copy.emptyHint}</p> : null}
                {messages.map((message) =>
                  message.role === "system" ? (
                    <p key={message.id} className="text-center text-xs text-subtle">
                      {message.text}
                    </p>
                  ) : (
                    <article
                      key={message.id}
                      className={`w-fit max-w-full rounded-lg border border-line px-3 py-2 ${
                        message.role === "user" ? "ml-auto bg-elevated" : "bg-bg"
                      }`}
                    >
                      <p className="text-xs text-muted">{message.role === "user" ? copy.you : copy.nero}</p>
                      <p className="text-sm">{message.text}</p>
                    </article>
                  ),
                )}
                <div ref={endRef} />
              </div>
            ) : (
              <SettingsPanel
                copy={copy}
                settings={settings}
                tier={tier}
                systemVoices={systemVoices}
                onTestMic={() => void testMic()}
                onClearChat={clearChat}
                onDesktop={openDesktop}
              />
            )}
          </div>

          <form
            className="border-t border-line p-3"
            onSubmit={(event) => {
              event.preventDefault();
              submit();
            }}
          >
            <div className="relative mb-3 h-2 overflow-hidden rounded-full bg-bg" aria-hidden>
              <div className="h-full bg-live" style={{ width: `${meter}%` }} />
              <div className="absolute top-0 h-full w-px bg-fg" style={{ left: `${gate}%` }} />
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="flex h-11 shrink-0 items-center gap-2 rounded-md bg-accent px-3 text-sm font-medium text-accent-fg"
                onClick={toggleListen}
              >
                {neroState === "listening" ? <Square className="size-4" aria-hidden /> : <Mic className="size-4" aria-hidden />}
                {neroState === "listening" ? copy.stop : copy.listen}
              </button>
              <input
                id="nero-draft"
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                placeholder={copy.placeholder}
                className="h-11 min-w-0 flex-1 rounded-md border border-line bg-bg px-3 text-sm text-fg placeholder:text-subtle"
                autoComplete="off"
              />
              <button
                id="nero-send"
                type="submit"
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md border border-line bg-elevated text-fg"
                aria-label={copy.send}
              >
                <Send className="size-4" aria-hidden />
              </button>
            </div>
            {testing ? <p className="pt-2 text-xs text-muted">{copy.testLive}</p> : null}
          </form>
        </aside>
      </div>
    </main>
  );
}

function SettingsPanel({
  copy,
  settings,
  tier,
  systemVoices,
  onTestMic,
  onClearChat,
  onDesktop,
}: {
  copy: Copy;
  settings: NeroSettings & { patch: (partial: Partial<NeroSettings>) => void };
  tier: "light" | "mid" | "strong";
  systemVoices: { uri: string; label: string }[];
  onTestMic: () => void;
  onClearChat: () => void;
  onDesktop: () => void;
}) {
  const patch = settings.patch;
  return (
      <div className="flex flex-col gap-6 pt-2">
        <section className="flex flex-col gap-2">
          <h2 className="flex items-center gap-2 text-sm font-medium">
            <Languages className="size-4" aria-hidden />
            {copy.language}
          </h2>
          <div className="grid grid-cols-2 gap-2">
            {LANGS.map((lang) => (
              <Choice key={lang} pressed={settings.lang === lang} onClick={() => patch({ lang: lang as Lang })}>
                {copy.langName[lang]}
              </Choice>
            ))}
          </div>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="flex items-center gap-2 text-sm font-medium">
            <Mic className="size-4" aria-hidden />
            {copy.hearing}
          </h2>
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-muted">{copy.sensitivity}</span>
            <input
              type="range"
              min={0}
              max={100}
              value={settings.sensitivity}
              onChange={(event) => patch({ sensitivity: Number(event.target.value) })}
            />
            <span className="text-xs text-subtle">{copy.sensitivityHint}</span>
          </label>
          <div className="grid grid-cols-3 gap-2">
            {LISTEN_MODES.map((mode) => (
              <Choice
                key={mode}
                pressed={settings.listenMode === mode}
                onClick={() => patch({ listenMode: mode as ListenMode })}
              >
                {mode === "push" ? copy.modePush : mode === "continuous" ? copy.modeContinuous : copy.modeWake}
              </Choice>
            ))}
          </div>
          <div className="grid grid-cols-1 gap-2">
            {HEAR_MODELS.map((model) => (
              <Choice
                key={model}
                pressed={settings.hearModel === model}
                onClick={() => patch({ hearModel: model as HearModel })}
                hint={model === "browser" ? copy.hearBrowserHint : copy.hearGrokHint}
              >
                {model === "browser" ? copy.hearBrowser : copy.hearGrok}
              </Choice>
            ))}
          </div>
          <button
            type="button"
            className="h-11 rounded-md border border-line bg-elevated text-sm"
            onClick={onTestMic}
          >
            {copy.testMic}
          </button>
        </section>

        <section id="nero-model" className="flex flex-col gap-2">
          <h2 className="flex items-center gap-2 text-sm font-medium">
            <Brain className="size-4" aria-hidden />
            {copy.model}
          </h2>
          <p className="text-xs text-subtle">
            {settings.brain === "local-light"
              ? copy.localLightHint
              : settings.brain === "local"
                ? copy.localHint
                : MODEL_PROVIDER[settings.brain] === "grok"
                  ? copy.grokHint
                  : copy.keyHint}
          </p>
          <Choice
            pressed={settings.autoBrain}
            onClick={() => {
              const next = !settings.autoBrain;
              settings.patch({
                autoBrain: next,
                brainPinned: !next,
                brain: next ? modelForTier(tier) : settings.brain,
              });
            }}
          >
            {copy.autoModel}
          </Choice>
          <p className="text-xs text-subtle">
            {copy.autoOn}{" "}
            {tier === "light" ? copy.tierLight : tier === "strong" ? copy.tierStrong : copy.tierMid}
          </p>
          <div className="grid grid-cols-1 gap-2">
            {BRAIN_MODELS.map((model) => (
              <Choice
                key={model}
                pressed={settings.brain === model}
                onClick={() => settings.patch({ brain: model as BrainModel, brainPinned: true, autoBrain: false })}
              >
                {copy.brains[model]}
              </Choice>
            ))}
          </div>
          <div className="flex flex-col gap-2">
            <h3 className="text-sm text-muted">{copy.keys}</h3>
            {(["openai", "anthropic", "google", "moonshot"] as const).map((id) => (
              <label key={id} className="flex flex-col gap-1 text-xs text-subtle">
                {id}
                <input
                  type="password"
                  autoComplete="off"
                  value={settings.keys[id]}
                  onChange={(event) => settings.patch({ keys: { ...settings.keys, [id]: event.target.value.trim() } })}
                  className="h-11 rounded-md border border-line bg-bg px-3 text-sm text-fg"
                />
              </label>
            ))}
          </div>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="flex items-center gap-2 text-sm font-medium">
            <AudioLines className="size-4" aria-hidden />
            {copy.voice}
          </h2>
          {settings.voice === "browser" ? (
            systemVoices.length > 0 ? (
              <label className="flex flex-col gap-1 text-sm text-muted">
                {copy.systemVoice}
                <select
                  className="h-11 rounded-md border border-line bg-bg px-2 text-sm text-fg"
                  value={settings.systemVoice}
                  onChange={(event) => patch({ systemVoice: event.target.value })}
                >
                  <option value="">{copy.voiceBrowser}</option>
                  {systemVoices.map((item) => (
                    <option key={item.uri} value={item.uri}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </label>
            ) : null
          ) : (
            <p className="text-xs text-subtle">{copy.moreVoices}</p>
          )}
          <div className="grid grid-cols-2 gap-2">
            {VOICE_MODELS.map((voice) => (
              <Choice
                key={voice}
                pressed={settings.voice === voice}
                onClick={() => patch({ voice: voice as VoiceModel })}
              >
                {voice === "browser" ? copy.voiceBrowser : copy.voices[voice]}
              </Choice>
            ))}
          </div>
          <label className="flex flex-col gap-1 text-sm text-muted">
            {copy.rate}
            <input
              type="range"
              min={80}
              max={130}
              value={settings.rate}
              onChange={(event) => patch({ rate: Number(event.target.value) })}
            />
          </label>
          <label className="flex flex-col gap-1 text-sm text-muted">
            {copy.pitch}
            <input
              type="range"
              min={80}
              max={130}
              value={settings.pitch}
              onChange={(event) => patch({ pitch: Number(event.target.value) })}
            />
          </label>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="flex items-center gap-2 text-sm font-medium">
            <Shirt className="size-4" aria-hidden />
            {copy.look}
          </h2>
          <div className="grid grid-cols-3 gap-2">
            {LOOKS.map((look) => (
              <button
                key={look}
                type="button"
                aria-pressed={settings.look === look}
                onClick={() => patch({ look: look as LookId })}
                className={`overflow-hidden rounded-md border p-1 text-left ${
                  settings.look === look ? "border-accent" : "border-line"
                }`}
              >
                <img src={LOOK_ART[look].idle} alt="" className="h-28 w-full rounded-sm bg-bg object-contain object-bottom" />
                <span className="block px-1 pt-1 text-sm">{copy.looks[look]}</span>
                <span className="block px-1 pb-1 text-xs text-subtle">{copy.lookHints[look]}</span>
              </button>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Choice pressed={settings.roam} onClick={() => patch({ roam: !settings.roam })}>
              {copy.roam}
            </Choice>
            <Choice
              pressed={settings.motion === "full"}
              onClick={() => patch({ motion: settings.motion === "full" ? "soft" : "full" })}
            >
              {`${copy.motion}: ${settings.motion === "full" ? copy.motionFull : copy.motionSoft}`}
            </Choice>
          </div>
          <label className="flex flex-col gap-1 text-sm text-muted">
            {copy.size}
            <input
              type="range"
              min={70}
              max={110}
              value={settings.scale}
              onChange={(event) => patch({ scale: Number(event.target.value) })}
            />
          </label>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="flex items-center gap-2 text-sm font-medium">
            <ImageIcon className="size-4" aria-hidden />
            {copy.scene}
          </h2>
          <div className="grid grid-cols-2 gap-2">
            {SCENES.map((scene) => (
              <button
                key={scene}
                type="button"
                aria-pressed={settings.scene === scene}
                onClick={() => patch({ scene: scene as SceneId })}
                className={`overflow-hidden rounded-md border p-1 text-left ${
                  settings.scene === scene ? "border-accent" : "border-line"
                }`}
              >
                {scene === "ink" ? (
                  <span className="block h-16 rounded-sm bg-bg" />
                ) : (
                  <img src={SCENE_ART[scene]} alt="" className="h-16 w-full rounded-sm object-cover" />
                )}
                <span className="block px-1 py-1 text-sm">{copy.scenes[scene]}</span>
              </button>
            ))}
          </div>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="flex items-center gap-2 text-sm font-medium">
            <MonitorUp className="size-4" aria-hidden />
            {copy.desktop}
          </h2>
          <p className="text-xs text-subtle">{copy.desktopHint}</p>
          <button type="button" className="h-11 rounded-md border border-line bg-elevated text-sm" onClick={onDesktop}>
            {copy.openDesktop}
          </button>
        </section>

        <section className="flex flex-col gap-2">
          {settings.notes.length === 0 ? <p className="text-xs text-subtle">{copy.noNotes}</p> : null}
          <ul className="flex flex-col gap-1">
            {settings.notes.map((note) => (
              <li key={note} className="rounded-sm border border-line bg-bg px-3 py-2 text-sm">
                {note}
              </li>
            ))}
          </ul>
          <div className="flex gap-2">
            <button type="button" className="h-11 flex-1 rounded-md border border-line text-sm" onClick={onClearChat}>
              {copy.clearChat}
            </button>
            <button
              type="button"
              className="flex h-11 flex-1 items-center justify-center gap-2 rounded-md border border-line text-sm"
              onClick={() => settings.patch({ notes: [] })}
            >
              <Trash2 className="size-4" aria-hidden />
              {copy.clearNotes}
            </button>
          </div>
        </section>
      </div>
    );
}

function Mini({ icon, label, onClick }: { icon: ReactNode; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      className="flex h-9 items-center gap-2 rounded-md border border-line bg-panel px-2 text-xs text-fg"
      onClick={onClick}
    >
      {icon}
      {label}
    </button>
  );
}

function Choice({
  pressed,
  onClick,
  children,
  hint,
}: {
  pressed: boolean;
  onClick: () => void;
  children: string;
  hint?: string;
}) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      onClick={onClick}
      className={`min-h-11 rounded-md border px-3 py-2 text-left text-sm ${
        pressed ? "border-accent bg-accent text-accent-fg" : "border-line bg-elevated text-fg"
      }`}
    >
      <span className="block">{children}</span>
      {hint ? <span className={`mt-1 block text-xs ${pressed ? "text-accent-fg" : "text-subtle"}`}>{hint}</span> : null}
    </button>
  );
}

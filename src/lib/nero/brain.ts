import type { Lang } from "@/lib/nero/types";
import { LOCALE } from "@/lib/nero/types";

export type NeroApp = "calc" | "timer" | "game" | "notes" | "desktop";

export type LocalResult = {
  reply: string;
  notes?: string[];
  app?: NeroApp;
  handled: boolean;
  intercept?: boolean;
  roam?: boolean;
};

export function evaluate(expr: string): number | null {
  const s = expr.replace(/\s+/g, "");
  if (!s || !/^[\d.+\-*/()]+$/.test(s)) return null;
  let i = 0;
  const parseExpr = (): number => {
    let v = parseTerm();
    while (s[i] === "+" || s[i] === "-") {
      const op = s[i++];
      const r = parseTerm();
      v = op === "+" ? v + r : v - r;
    }
    return v;
  };
  const parseTerm = (): number => {
    let v = parseFactor();
    while (s[i] === "*" || s[i] === "/") {
      const op = s[i++];
      const r = parseFactor();
      if (op === "*") v *= r;
      else v = r === 0 ? Number.NaN : v / r;
    }
    return v;
  };
  const parseFactor = (): number => {
    if (s[i] === "+") {
      i += 1;
      return parseFactor();
    }
    if (s[i] === "-") {
      i += 1;
      return -parseFactor();
    }
    if (s[i] === "(") {
      i += 1;
      const v = parseExpr();
      if (s[i] !== ")") return Number.NaN;
      i += 1;
      return v;
    }
    const start = i;
    while (i < s.length && /[\d.]/.test(s[i] ?? "")) i += 1;
    if (start === i) return Number.NaN;
    return Number(s.slice(start, i));
  };
  const value = parseExpr();
  if (i !== s.length || !Number.isFinite(value)) return null;
  return Math.round(value * 1000) / 1000;
}

function findMath(text: string): number | null {
  const cleaned = text.replace(/,/g, ".").replace(/[×xх]/gi, "*").replace(/[÷:]/g, "/");
  const match = /(-?\d+(?:\.\d+)?(?:\s*[-+*/]\s*-?\d+(?:\.\d+)?)+)/.exec(cleaned);
  if (!match?.[1]) return null;
  return evaluate(match[1]);
}

const REMEMBER: Record<Lang, RegExp> = {
  uk: /^(?:запам['’ʼ]?ятай|запамятай)\s+(.+)/i,
  ru: /^(?:запомни)\s+(.+)/i,
  en: /^(?:remember|note)\s+(.+)/i,
  pl: /^(?:zapamiętaj|zapamietaj)\s+(.+)/i,
  de: /^(?:merk dir|merke dir)\s+(.+)/i,
  ja: /^(?:覚えて|おぼえて)\s*(.+)/i,
};

const RECALL: Record<Lang, RegExp> = {
  uk: /нотатк|що ти пам|що пам'ятаєш|що запам/,
  ru: /заметк|что ты помниш|что помнишь/,
  en: /notes|what do you remember|what did you remember/,
  pl: /notatk|co pamiętasz|co pamietasz/,
  de: /notizen|woran erinnerst/,
  ja: /メモ|覚えてる/,
};

const FORGET: Record<Lang, RegExp> = {
  uk: /забудь|стерти нотат/,
  ru: /забудь|сотри замет/,
  en: /forget (the )?notes|erase notes/,
  pl: /zapomnij|usuń notat/,
  de: /vergiss die notizen|lösche die notizen/,
  ja: /忘れて|メモを消/,
};

function pack(lang: Lang, key: string): string {
  const lines: Record<string, Record<Lang, string>> = {
    time: {
      uk: "Зараз {t}.",
      ru: "Сейчас {t}.",
      en: "It's {t}.",
      pl: "Jest {t}.",
      de: "Es ist {t}.",
      ja: "今は {t}。",
    },
    date: {
      uk: "Сьогодні {d}.",
      ru: "Сегодня {d}.",
      en: "Today is {d}.",
      pl: "Dziś jest {d}.",
      de: "Heute ist {d}.",
      ja: "今日は {d}。",
    },
    hi: {
      uk: "Привіт. Я тут, кажи.",
      ru: "Привет. Я здесь, говори.",
      en: "Hello. I'm here.",
      pl: "Cześć. Jestem.",
      de: "Hallo. Ich bin da.",
      ja: "こんにちは。ここにいるよ。",
    },
    how: {
      uk: "Спокійно. Слухаю краще, коли поріг не завищений.",
      ru: "Спокойно. Слышу лучше, когда порог не завышен.",
      en: "Steady. I hear better when the gate isn't set too high.",
      pl: "Spokojnie. Lepiej słyszę, gdy próg nie jest za wysoki.",
      de: "Ruhig. Ich höre besser, wenn die Schwelle nicht zu hoch ist.",
      ja: "落ち着いてる。しきい値が高すぎなければよく聞こえる。",
    },
    who: {
      uk: "Я Неро, голосовий асистент. Стою тут у повний зріст і відповідаю тією мовою, яку ти обрав.",
      ru: "Я Неро, голосовой ассистент. Стою здесь в полный рост и отвечаю на выбранном языке.",
      en: "I'm Nero, a voice assistant. I stand here full length and answer in the language you chose.",
      pl: "Jestem Nero, asystentka głosowa. Stoję tu w pełnej postaci i odpowiadam w wybranym języku.",
      de: "Ich bin Nero, eine Sprachassistentin. Ich stehe hier in voller Größe und antworte in der gewählten Sprache.",
      ja: "ネロ、音声アシスタント。全身でここに立って、選んだ言語で答える。",
    },
    help: {
      uk: "Можу сказати час і дату, порахувати, запам'ятати коротку нотатку. Для вільної розмови увімкни Grok у мовних моделях.",
      ru: "Могу сказать время и дату, посчитать, запомнить короткую заметку. Для свободного разговора включи Grok в языковых моделях.",
      en: "I can tell the time and date, do arithmetic, and keep a short note. For an open conversation, switch the language model to Grok.",
      pl: "Powiem godzinę i datę, policzę i zapamiętam krótką notatkę. Do swobodnej rozmowy włącz Grok w modelach.",
      de: "Ich sage Uhrzeit und Datum, rechne und merke eine kurze Notiz. Für ein freies Gespräch schalte das Sprachmodell auf Grok.",
      ja: "時刻と日付、計算、短いメモができる。自由な会話は言語モデルを Grok にして。",
    },
    thanks: {
      uk: "Будь ласка.",
      ru: "Пожалуйста.",
      en: "You're welcome.",
      pl: "Proszę.",
      de: "Gern.",
      ja: "どういたしまして。",
    },
    joke: {
      uk: "Відьма зайшла в бібліотеку й попросила тишу. Полиці й так мовчали, тож вона лишилась перевіряти мікрофон.",
      ru: "Ведьма зашла в библиотеку и попросила тишины. Полки и так молчали, так что она осталась проверять микрофон.",
      en: "A witch walked into a library and asked for quiet. The shelves were already silent, so she stayed to test the microphone.",
      pl: "Wiedźma weszła do biblioteki i poprosiła o ciszę. Półki i tak milczały, więc została sprawdzić mikrofon.",
      de: "Eine Hexe betrat die Bibliothek und bat um Ruhe. Die Regale schwiegen schon, also blieb sie, um das Mikrofon zu prüfen.",
      ja: "魔女が書斎に入って静かにと言った。棚はもともと黙っていたので、マイクの点検を続けた。",
    },
    weather: {
      uk: "Погоди звідси не бачу. Локальна модель сидить у студії. Для такої відповіді потрібен Grok.",
      ru: "Погоды отсюда не вижу. Локальная модель сидит в студии. Для такого ответа нужен Grok.",
      en: "I can't see the weather from this studio. That kind of answer needs Grok.",
      pl: "Pogody stąd nie widzę. Taka odpowiedź potrzebuje Groka.",
      de: "Das Wetter sehe ich von hier nicht. Dafür brauchst du Grok.",
      ja: "ここから天気は見えない。そういう答えには Grok が要る。",
    },
    remembered: {
      uk: "Запам'ятала.",
      ru: "Запомнила.",
      en: "Remembered.",
      pl: "Zapamiętałam.",
      de: "Gemerkt.",
      ja: "覚えた。",
    },
    forgotten: {
      uk: "Нотатки стерла.",
      ru: "Заметки стёрла.",
      en: "Notes erased.",
      pl: "Notatki usunięte.",
      de: "Notizen gelöscht.",
      ja: "メモは消した。",
    },
    emptyNotes: {
      uk: "Поки нічого не тримаю.",
      ru: "Пока ничего не держу.",
      en: "I'm not holding anything yet.",
      pl: "Na razie nic nie trzymam.",
      de: "Ich halte noch nichts fest.",
      ja: "まだ何も持ってない。",
    },
    notesLead: {
      uk: "Ось що тримаю: {n}.",
      ru: "Вот что держу: {n}.",
      en: "Here's what I'm holding: {n}.",
      pl: "Trzymam to: {n}.",
      de: "Das halte ich fest: {n}.",
      ja: "持ってるのはこれ: {n}。",
    },
    math: {
      uk: "Виходить {n}.",
      ru: "Получается {n}.",
      en: "That comes to {n}.",
      pl: "Wychodzi {n}.",
      de: "Das ergibt {n}.",
      ja: "{n} になる。",
    },
    walk: {
      uk: "Йду.",
      ru: "Иду.",
      en: "Walking.",
      pl: "Idę.",
      de: "Ich gehe.",
      ja: "歩く。",
    },
    stand: {
      uk: "Стою.",
      ru: "Стою.",
      en: "Standing.",
      pl: "Stoję.",
      de: "Ich stehe.",
      ja: "立つ。",
    },
    fallback: {
      uk: "Чую. Локальна Неро тримає час, дату, рахунок і нотатки. Складніше — перемкни мовну модель на Grok.",
      ru: "Слышу. Локальная Неро держит время, дату, счёт и заметки. Сложнее — переключи языковую модель на Grok.",
      en: "I hear you. Local Nero keeps time, date, arithmetic, and notes. For anything wider, switch the language model to Grok.",
      pl: "Słyszę. Lokalna Nero ogarnia czas, datę, rachunek i notatki. Szerzej — przełącz model na Grok.",
      de: "Ich höre dich. Lokale Nero kann Uhrzeit, Datum, Rechnen und Notizen. Für mehr schalte das Sprachmodell auf Grok.",
      ja: "聞こえてる。ローカルのネロは時刻、日付、計算、メモまで。それ以上は言語モデルを Grok にして。",
    },
  };
  return lines[key]?.[lang] ?? lines[key]?.en ?? "";
}

function detectApp(text: string): NeroApp | null {
  const t = text.toLowerCase();
  const open = /відкри|откро|open|uruchom|öffne|起動|запуст/;
  if (/калькул|calculator|rechner|電卓/.test(t)) return "calc";
  if (/таймер|timer|minutnik|wecker|タイマー/.test(t) && (open.test(t) || /постав|постав|set|постав/.test(t) || t.split(/\s+/).length < 5)) return "timer";
  if (/гру|игру|game|gra|spiel|ゲーム/.test(t) && open.test(t)) return "game";
  if (/нотат|блокнот|заметк|notes|notepad|notatk|notiz|メモ/.test(t) && (open.test(t) || /покаж|show/.test(t))) return "notes";
  if (/робоч(ий|ій) стіл|рабочий стол|desktop|pulpit|schreibtisch|デスクトップ/.test(t)) return "desktop";
  return null;
}

function walking(text: string): boolean | null {
  const t = text.toLowerCase();
  if (/зупинись|не ходи|стій на місці|stop walking|don't walk|przestań chodzić|bleib stehen|歩くな|止まって/.test(t)) return false;
  if (/ходи|прогуляй|walk around|take a walk|spaceruj|geh herum|歩いて/.test(t)) return true;
  return null;
}

const APP_REPLY: Record<NeroApp, Record<Lang, string>> = {
  calc: {
    uk: "Відкриваю калькулятор.",
    ru: "Открываю калькулятор.",
    en: "Opening the calculator.",
    pl: "Otwieram kalkulator.",
    de: "Ich öffne den Rechner.",
    ja: "電卓を開く。",
  },
  timer: {
    uk: "Ставлю таймер.",
    ru: "Ставлю таймер.",
    en: "Starting a timer.",
    pl: "Włączam minutnik.",
    de: "Timer läuft.",
    ja: "タイマーを始める。",
  },
  game: {
    uk: "Заходжу в гру як другий гравець.",
    ru: "Захожу в игру вторым игроком.",
    en: "Joining the game as the second player.",
    pl: "Wchodzę do gry jako drugi gracz.",
    de: "Ich komme als zweite Spielerin ins Spiel.",
    ja: "二人目のプレイヤーとして入る。",
  },
  notes: {
    uk: "Відкриваю нотатки.",
    ru: "Открываю заметки.",
    en: "Opening notes.",
    pl: "Otwieram notatki.",
    de: "Ich öffne die Notizen.",
    ja: "メモを開く。",
  },
  desktop: {
    uk: "Виходжу на робочий стіл.",
    ru: "Выхожу на рабочий стол.",
    en: "Stepping out onto the desktop.",
    pl: "Wychodzę na pulpit.",
    de: "Ich gehe auf den Desktop.",
    ja: "デスクトップに出る。",
  },
};

export function localAnswer(text: string, lang: Lang, notes: string[]): LocalResult {
  const raw = text.trim();
  const t = raw.toLowerCase();
  const app = detectApp(raw);
  if (app) return { handled: true, intercept: true, reply: APP_REPLY[app][lang], app };
  const roam = walking(raw);
  if (roam !== null) return { handled: true, intercept: true, reply: pack(lang, roam ? "walk" : "stand"), roam };

  const remember = REMEMBER[lang].exec(raw);
  if (remember?.[1]) {
    const note = remember[1].trim().slice(0, 160);
    if (!note) return { handled: true, reply: pack(lang, "emptyNotes") };
    const next = [...notes, note].slice(-12);
    return { handled: true, intercept: true, reply: pack(lang, "remembered"), notes: next };
  }

  if (FORGET[lang].test(t)) return { handled: true, intercept: true, reply: pack(lang, "forgotten"), notes: [] };

  if (RECALL[lang].test(t)) {
    if (notes.length === 0) return { handled: true, intercept: true, reply: pack(lang, "emptyNotes") };
    return { handled: true, intercept: true, reply: pack(lang, "notesLead").replace("{n}", notes.join("; ")) };
  }

  if (/котра година|який час|который час|what time|która|ktora godzina|wieviel uhr|uhrzeit|何時|今何時/.test(t)) {
    const time = new Date().toLocaleTimeString(LOCALE[lang], { hour: "2-digit", minute: "2-digit" });
    return { handled: true, intercept: true, reply: pack(lang, "time").replace("{t}", time) };
  }

  if (/яке сьогодні|яка дата|какое число|какой день|what date|what's the date|data dzisiaj|welches datum|今日は何日|日付/.test(t)) {
    const date = new Date().toLocaleDateString(LOCALE[lang], { weekday: "long", day: "numeric", month: "long" });
    return { handled: true, intercept: true, reply: pack(lang, "date").replace("{d}", date) };
  }

  if (/^(привіт|привет|здрастуй|здравствуй|hello|hi|hey|cześć|czesc|hallo|guten tag|こんにちは|やあ)\b/.test(t)) {
    return { handled: true, reply: pack(lang, "hi") };
  }
  if (/як справи|как дела|how are you|jak się masz|jak sie masz|wie geht|元気/.test(t)) return { handled: true, reply: pack(lang, "how") };
  if (/хто ти|кто ты|who are you|kim jesteś|kim jestes|wer bist du|誰/.test(t)) return { handled: true, reply: pack(lang, "who") };
  if (/допоможи|що вмієш|что умеешь|help|what can you|co umiesz|hilfe|was kannst|助けて|何ができる/.test(t)) {
    return { handled: true, reply: pack(lang, "help") };
  }
  if (/дякую|спасибо|thanks|thank you|dziękuję|dziekuje|danke|ありがとう/.test(t)) return { handled: true, reply: pack(lang, "thanks") };
  if (/жарт|анекдот|шутк|joke|żart|zart|witz|冗談|ジョーク/.test(t)) return { handled: true, reply: pack(lang, "joke") };
  if (/погод|weather|pogod|wetter|天気/.test(t)) return { handled: true, reply: pack(lang, "weather") };

  const math = findMath(raw);
  if (math !== null && /[\d]/.test(raw) && /[-+*/×÷]|\d\s+\d|скільки|сколько|порахуй|посчитай|calculate|oblicz|rechne|計算/.test(t)) {
    return { handled: true, intercept: true, reply: pack(lang, "math").replace("{n}", String(math)) };
  }

  return { handled: false, reply: pack(lang, "fallback") };
}

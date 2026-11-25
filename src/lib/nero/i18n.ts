import type { BrainModel, Lang, LookId, SceneId, VoiceModel } from "@/lib/nero/types";

export type Copy = {
  kicker: string;
  talk: string;
  settings: string;
  listen: string;
  stop: string;
  send: string;
  placeholder: string;
  stateIdle: string;
  stateListening: string;
  stateThinking: string;
  stateSpeaking: string;
  language: string;
  hearing: string;
  model: string;
  voice: string;
  look: string;
  scene: string;
  sensitivity: string;
  sensitivityHint: string;
  mode: string;
  modePush: string;
  modeContinuous: string;
  modeWake: string;
  hearBrowser: string;
  hearGrok: string;
  hearBrowserHint: string;
  hearGrokHint: string;
  voiceBrowser: string;
  rate: string;
  pitch: string;
  testMic: string;
  clearChat: string;
  micDenied: string;
  noRecognizer: string;
  tooQuiet: string;
  missed: string;
  cloudCredits: string;
  cloudFailed: string;
  voiceFallback: string;
  hearCredits: string;
  localHint: string;
  grokHint: string;
  voiceCloudHint: string;
  ack: string;
  emptyHint: string;
  you: string;
  nero: string;
  size: string;
  heard: string;
  testLive: string;
  notes: string;
  clearNotes: string;
  noNotes: string;
  walk: string;
  roam: string;
  motion: string;
  motionFull: string;
  motionSoft: string;
  desktop: string;
  desktopHint: string;
  openDesktop: string;
  desktopUnsupported: string;
  apps: string;
  calc: string;
  timer: string;
  game: string;
  gameHint: string;
  close: string;
  pc: string;
  autoModel: string;
  autoOn: string;
  tierLight: string;
  tierMid: string;
  tierStrong: string;
  keys: string;
  keyHint: string;
  missingKey: string;
  localLightHint: string;
  systemVoice: string;
  moreVoices: string;
  score: string;
  langName: Record<Lang, string>;
  looks: Record<LookId, string>;
  lookHints: Record<LookId, string>;
  scenes: Record<SceneId, string>;
  brains: Record<BrainModel, string>;
  voices: Record<Exclude<VoiceModel, "browser">, string>;
};

const uk: Copy = {
  kicker: "Голосова студія",
  talk: "Розмова",
  settings: "Налаштування",
  listen: "Слухати",
  stop: "Стоп",
  send: "Надіслати",
  placeholder: "Напиши Неро…",
  stateIdle: "Поруч",
  stateListening: "Слухаю",
  stateThinking: "Думаю",
  stateSpeaking: "Говорю",
  language: "Мова",
  hearing: "Слух",
  model: "Мовна модель",
  voice: "Голос",
  look: "Образ Неро",
  scene: "Фон студії",
  sensitivity: "Чутливість мікрофона",
  sensitivityHint: "Нижче поріг — чує тихіший голос. Якщо ловить шум кімнати, підніми.",
  mode: "Коли відповідати",
  modePush: "По кнопці",
  modeContinuous: "Постійно",
  modeWake: "Після «Неро»",
  hearBrowser: "Браузер",
  hearGrok: "Grok Transcribe",
  hearBrowserHint: "Розпізнавання браузера. Мову візьме з налаштування вище.",
  hearGrokHint: "Запис фрази й хмарна модель grok-voice-transcribe-2.0. Потрібні кредити.",
  voiceBrowser: "Голос цього браузера",
  rate: "Темп",
  pitch: "Висота",
  testMic: "Перевірити мікрофон",
  clearChat: "Очистити розмову",
  micDenied: "Немає доступу до мікрофона. Дозволь його в браузері або напиши текстом.",
  noRecognizer: "Цей браузер не вміє розпізнавати мову. Напиши текстом або обери Grok Transcribe.",
  tooQuiet: "Занадто тихо для поточного порога. Говори ближче або знизь чутливість.",
  missed: "Не розібрала фразу. Спробуй ще раз.",
  cloudCredits: "Хмарна модель недоступна: закінчились кредити. Відповіла локальна Неро.",
  cloudFailed: "Хмарна модель не відповіла. Відповіла локальна Неро.",
  voiceFallback: "Хмарний голос недоступний, озвучую голосом браузера.",
  hearCredits: "Grok Transcribe недоступний: немає кредитів. Обери слух «Браузер».",
  localHint: "Миттєво і без кредитів: час, дата, рахунок, нотатки і коротка розмова.",
  grokHint: "Вільні відповіді. Кожен запит витрачає кредити xAI. Якщо їх немає — підхопить локальна Неро.",
  voiceCloudHint: "Усі ці голоси говорять обраною мовою. Якщо кредитів немає, лишиться голос браузера.",
  ack: "Слухаю.",
  emptyHint: "Напиши або натисни «Слухати». Подвійний дотик по Неро теж вмикає слух. Мову, модель, голос, образ і фон змінюй у налаштуваннях.",
  you: "Ти",
  nero: "Неро",
  size: "Зріст на сцені",
  heard: "Почула",
  testLive: "Говори — стовпчик має рухатись.",
  notes: "Нотатки",
  clearNotes: "Стерти нотатки",
  noNotes: "Порожньо. Скажи «запам'ятай …».",
  walk: "Ходьба",
  roam: "Ходить по сцені",
  motion: "Анімація",
  motionFull: "Повна",
  motionSoft: "Тихіша",
  desktop: "Робочий стіл",
  desktopHint: "Кнопка «Вийти на стіл» ставить Неро поверх вікон, без адреси в заголовку. Усередину чужої гри вона зайти не може.",
  openDesktop: "Вийти на стіл",
  desktopUnsupported: "На стіл вона виходить із програми Nero, не з браузера. Запусти npm run desktop.",
  apps: "Програми",
  calc: "Калькулятор",
  timer: "Таймер",
  game: "Гра вдвох",
  gameHint: "Неро — другий гравець справа. Свою ракетку води мишею або пальцем. Поверх інших ігор вона висить лише вікном у Chrome.",
  close: "Закрити",
  pc: "Цей комп'ютер",
  autoModel: "Модель під цей ПК",
  autoOn: "На слабшому ПК сама бере легшу локальну модель. Будь-яку іншу можна обрати нижче.",
  tierLight: "Слабший ПК: спочатку Nero Light.",
  tierMid: "Середній ПК: Nero Local.",
  tierStrong: "Потужний ПК: Nero Local. Хмарні моделі теж потягне, якщо ввімкнути їх вручну.",
  keys: "Ключі GPT, Claude, Gemini, Kimi",
  keyHint: "Ключ лишається в цьому браузері. Grok бере ключ сервера, його сюди не пиши.",
  missingKey: "Для цієї моделі потрібен ключ у налаштуваннях. Поки відповіла локальна Неро.",
  localLightHint: "Найлегша: короткі відповіді і майже без навантаження.",
  systemVoice: "Голоси цього комп'ютера",
  moreVoices: "Хмарні голоси говорять плавніше. Без кредитів лишиться голос браузера.",
  score: "Рахунок",
  langName: { uk: "Українська", ru: "Русский", en: "English", pl: "Polski", de: "Deutsch", ja: "日本語" },
  looks: {
    witch: "Відьма",
    moon: "Місяць",
    street: "Місто",
    academy: "Академія",
    stars: "Зорі",
    pixel: "Піксель",
    evening: "Вечір",
  },
  lookHints: {
    witch: "Капелюх і пальто, хода і рот",
    moon: "Без капелюха, срібна підкладка",
    street: "Довге чорне пальто",
    academy: "Форма академії",
    stars: "Ніч і зорі",
    pixel: "Піксельний повний зріст",
    evening: "Сукня, відкриті плечі",
  },
  scenes: {
    library: "Бібліотека",
    rain: "Дощ",
    morning: "Ранок",
    observatory: "Обсерваторія",
    ink: "Темрява",
  },
  brains: {
    "local-light": "Nero Light",
    local: "Nero Local",
    "grok-4.5": "Grok 4.5",
    "grok-4.3": "Grok 4.3",
    "grok-4.7": "Grok 4.7",
    "grok-4.20": "Grok 4.20",
    "gpt-4.1-mini": "GPT-4.1 mini",
    "gpt-4.1": "GPT-4.1",
    "claude-haiku-4-5": "Claude Haiku",
    "claude-sonnet-4-5": "Claude Sonnet",
    "gemini-2.5-flash": "Gemini Flash",
    "kimi-k2.6": "Kimi K2.6",
    "kimi-k3": "Kimi K3",
  },
  voices: {
    ara: "Ara",
    eve: "Eve",
    leo: "Leo",
    rex: "Rex",
    sal: "Sal",
    luna: "Luna",
    aurora: "Aurora",
    liora: "Liora",
    orion: "Orion",
    iris: "Iris",
    celeste: "Celeste",
    helios: "Helios",
    carina: "Carina",
    altair: "Altair",
    zagan: "Zagan",
    helix: "Helix",
  },
};

const ru: Copy = {
  ...uk,
  kicker: "Голосовая студия",
  talk: "Разговор",
  settings: "Настройки",
  listen: "Слушать",
  stop: "Стоп",
  send: "Отправить",
  placeholder: "Напиши Неро…",
  stateIdle: "Рядом",
  stateListening: "Слушаю",
  stateThinking: "Думаю",
  stateSpeaking: "Говорю",
  language: "Язык",
  hearing: "Слух",
  model: "Языковая модель",
  voice: "Голос",
  look: "Образ Неро",
  scene: "Фон студии",
  sensitivity: "Чувствительность микрофона",
  sensitivityHint: "Ниже порог — слышит тише. Если ловит шум комнаты, подними.",
  mode: "Когда отвечать",
  modePush: "По кнопке",
  modeContinuous: "Постоянно",
  modeWake: "После «Неро»",
  hearBrowserHint: "Распознавание браузера. Язык берётся из настройки выше.",
  hearGrokHint: "Запись фразы и облачная модель grok-voice-transcribe-2.0. Нужны кредиты.",
  voiceBrowser: "Голос этого браузера",
  rate: "Темп",
  pitch: "Высота",
  testMic: "Проверить микрофон",
  clearChat: "Очистить разговор",
  micDenied: "Нет доступа к микрофону. Разреши его в браузере или напиши текстом.",
  noRecognizer: "Этот браузер не умеет распознавать речь. Напиши текстом или выбери Grok Transcribe.",
  tooQuiet: "Слишком тихо для текущего порога. Говори ближе или снизь чувствительность.",
  missed: "Не разобрала фразу. Попробуй ещё раз.",
  cloudCredits: "Облачная модель недоступна: закончились кредиты. Ответила локальная Неро.",
  cloudFailed: "Облачная модель не ответила. Ответила локальная Неро.",
  voiceFallback: "Облачный голос недоступен, озвучиваю голосом браузера.",
  hearCredits: "Grok Transcribe недоступен: нет кредитов. Выбери слух «Браузер».",
  localHint: "Сразу и без кредитов: время, дата, счёт, заметки и короткий разговор.",
  grokHint: "Свободные ответы. Каждый запрос тратит кредиты xAI. Если их нет — подхватит локальная Неро.",
  voiceCloudHint: "Все эти голоса говорят на выбранном языке. Если кредитов нет, останется голос браузера.",
  ack: "Слушаю.",
  emptyHint: "Напиши или нажми «Слушать». Двойное нажатие по Неро тоже включает слух. Язык, модель, голос, образ и фон — в настройках.",
  you: "Ты",
  nero: "Неро",
  size: "Рост на сцене",
  heard: "Услышала",
  testLive: "Говори — столбик должен двигаться.",
  notes: "Заметки",
  clearNotes: "Стереть заметки",
  noNotes: "Пусто. Скажи «запомни …».",
  walk: "Ходьба",
  roam: "Ходит по сцене",
  motion: "Анимация",
  motionFull: "Полная",
  motionSoft: "Тише",
  desktop: "Рабочий стол",
  desktopHint: "В Chrome Неро выходит отдельным окном поверх других программ и игр. Внутрь чужой игры браузер зайти не может.",
  openDesktop: "Выйти на стол",
  desktopUnsupported: "Этот браузер не выносит окно на стол. Открой Неро в Chrome.",
  apps: "Программы",
  calc: "Калькулятор",
  timer: "Таймер",
  game: "Игра вдвоём",
  gameHint: "Неро — второй игрок справа. Свою ракетку води мышью или пальцем. Поверх других игр она висит только окном в Chrome.",
  close: "Закрыть",
  pc: "Этот компьютер",
  autoModel: "Модель под этот ПК",
  autoOn: "На слабом ПК сама берёт более лёгкую локальную модель. Любую другую можно выбрать ниже.",
  tierLight: "Слабый ПК: сначала Nero Light.",
  tierMid: "Средний ПК: Nero Local.",
  tierStrong: "Мощный ПК: Nero Local. Облачные модели тоже потянет, если включить их вручную.",
  keys: "Ключи GPT, Claude, Gemini, Kimi",
  keyHint: "Ключ остаётся в этом браузере. Grok берёт ключ сервера, его сюда не пиши.",
  missingKey: "Для этой модели нужен ключ в настройках. Пока ответила локальная Неро.",
  localLightHint: "Самая лёгкая: короткие ответы и почти без нагрузки.",
  systemVoice: "Голоса этого компьютера",
  moreVoices: "Облачные голоса говорят плавнее. Без кредитов останется голос браузера.",
  score: "Счёт",
  looks: { witch: "Ведьма", moon: "Луна", street: "Город", academy: "Академия", stars: "Звёзды", pixel: "Пиксель", evening: "Вечер" },
  lookHints: {
    witch: "Шляпа и пальто, ход и рот",
    moon: "Без шляпы, серебряная подкладка",
    street: "Длинное чёрное пальто",
    academy: "Форма академии",
    stars: "Ночь и звёзды",
    pixel: "Пиксельный полный рост",
    evening: "Платье, открытые плечи",
  },
  scenes: { library: "Библиотека", rain: "Дождь", morning: "Утро", observatory: "Обсерватория", ink: "Темнота" },
};

const en: Copy = {
  ...uk,
  kicker: "Voice studio",
  talk: "Talk",
  settings: "Settings",
  listen: "Listen",
  stop: "Stop",
  send: "Send",
  placeholder: "Write to Nero…",
  stateIdle: "Here",
  stateListening: "Listening",
  stateThinking: "Thinking",
  stateSpeaking: "Speaking",
  language: "Language",
  hearing: "Hearing",
  model: "Language model",
  voice: "Voice",
  look: "Nero's look",
  scene: "Studio background",
  sensitivity: "Microphone sensitivity",
  sensitivityHint: "A lower gate hears a quieter voice. Raise it if the room noise gets through.",
  mode: "When to answer",
  modePush: "On button",
  modeContinuous: "Always",
  modeWake: "After “Nero”",
  hearBrowser: "Browser",
  hearGrok: "Grok Transcribe",
  hearBrowserHint: "The browser's speech recognition, using the language above.",
  hearGrokHint: "Records a phrase and sends it to grok-voice-transcribe-2.0. Needs credits.",
  voiceBrowser: "This browser's voice",
  rate: "Rate",
  pitch: "Pitch",
  testMic: "Test microphone",
  clearChat: "Clear conversation",
  micDenied: "Microphone permission was denied. Allow it, or type instead.",
  noRecognizer: "This browser cannot recognize speech. Type, or switch hearing to Grok Transcribe.",
  tooQuiet: "Too quiet for the current gate. Move closer or lower the sensitivity.",
  missed: "I didn't catch that. Try again.",
  cloudCredits: "The cloud model is unavailable: credits are used up. Local Nero answered.",
  cloudFailed: "The cloud model did not answer. Local Nero answered.",
  voiceFallback: "The cloud voice is unavailable, so I'm using the browser voice.",
  hearCredits: "Grok Transcribe is unavailable: no credits. Switch hearing to Browser.",
  localHint: "Instant, no credits: time, date, arithmetic, notes, and a short chat.",
  grokHint: "Open answers. Each request spends xAI credits. If there are none, local Nero takes over.",
  voiceCloudHint: "These voices speak the language you picked. Without credits, the browser voice remains.",
  ack: "I'm listening.",
  emptyHint: "Type or press Listen. Double-tap Nero to make her listen too. Language, model, voice, look, and background live in Settings.",
  you: "You",
  nero: "Nero",
  size: "Height on stage",
  heard: "Heard",
  testLive: "Speak — the meter should move.",
  notes: "Notes",
  clearNotes: "Erase notes",
  noNotes: "Empty. Say “remember …”.",
  walk: "Walking",
  roam: "Walk the stage",
  motion: "Animation",
  motionFull: "Full",
  motionSoft: "Quieter",
  desktop: "Desktop",
  desktopHint: "In Chrome, Nero steps out into her own window above other apps and games. A browser cannot enter someone else's game.",
  openDesktop: "Step onto the desktop",
  desktopUnsupported: "This browser cannot pop a window onto the desktop. Open Nero in Chrome.",
  apps: "Programs",
  calc: "Calculator",
  timer: "Timer",
  game: "Two-player game",
  gameHint: "Nero is the second player on the right. Move your paddle with the mouse or a finger. Over other games she can only float as a Chrome window.",
  close: "Close",
  pc: "This computer",
  autoModel: "Model for this PC",
  autoOn: "On a weaker PC she starts on a lighter local model. You can pick any other model below.",
  tierLight: "Weaker PC: Nero Light first.",
  tierMid: "Mid PC: Nero Local.",
  tierStrong: "Strong PC: Nero Local. Cloud models will run too if you turn them on.",
  keys: "GPT, Claude, Gemini, Kimi keys",
  keyHint: "The key stays in this browser. Grok uses the server key — don't paste that here.",
  missingKey: "This model needs a key in Settings. Local Nero answered for now.",
  localLightHint: "Lightest: short answers, almost no load.",
  systemVoice: "Voices on this computer",
  moreVoices: "Cloud voices speak more smoothly. Without credits, the browser voice remains.",
  score: "Score",
  looks: { witch: "Witch", moon: "Moon", street: "City", academy: "Academy", stars: "Stars", pixel: "Pixel", evening: "Evening" },
  lookHints: {
    witch: "Hat and coat, with a walk and a mouth",
    moon: "No hat, silver lining",
    street: "Long black coat",
    academy: "Academy uniform",
    stars: "Night and stars",
    pixel: "Full-body pixel",
    evening: "Dress, bare shoulders",
  },
  scenes: { library: "Library", rain: "Rain", morning: "Morning", observatory: "Observatory", ink: "Dark" },
};

const pl: Copy = {
  ...en,
  kicker: "Studio głosu",
  talk: "Rozmowa",
  settings: "Ustawienia",
  listen: "Słuchaj",
  stop: "Stop",
  send: "Wyślij",
  placeholder: "Napisz do Nero…",
  stateIdle: "Jestem",
  stateListening: "Słucham",
  stateThinking: "Myślę",
  stateSpeaking: "Mówię",
  language: "Język",
  hearing: "Słuch",
  model: "Model językowy",
  voice: "Głos",
  look: "Wygląd Nero",
  scene: "Tło studia",
  sensitivity: "Czułość mikrofonu",
  sensitivityHint: "Niższy próg słyszy ciszej. Podnieś go, gdy łapie szum pokoju.",
  mode: "Kiedy odpowiadać",
  modePush: "Przyciskiem",
  modeContinuous: "Ciągle",
  modeWake: "Po „Nero”",
  hearBrowserHint: "Rozpoznawanie przeglądarki, w języku wybranym wyżej.",
  hearGrokHint: "Nagranie frazy i model grok-voice-transcribe-2.0. Wymaga kredytów.",
  voiceBrowser: "Głos tej przeglądarki",
  rate: "Tempo",
  pitch: "Wysokość",
  testMic: "Sprawdź mikrofon",
  clearChat: "Wyczyść rozmowę",
  micDenied: "Brak dostępu do mikrofonu. Zezwól albo napisz.",
  noRecognizer: "Ta przeglądarka nie rozpoznaje mowy. Napisz albo wybierz Grok Transcribe.",
  tooQuiet: "Za cicho przy tym progu. Mów bliżej albo obniż czułość.",
  missed: "Nie wyłapałam. Spróbuj jeszcze raz.",
  cloudCredits: "Model w chmurze niedostępny: brak kredytów. Odpowiedziała lokalna Nero.",
  cloudFailed: "Model w chmurze nie odpowiedział. Odpowiedziała lokalna Nero.",
  voiceFallback: "Głos w chmurze niedostępny, używam głosu przeglądarki.",
  hearCredits: "Grok Transcribe niedostępny: brak kredytów. Wybierz słuch «Przeglądarka».",
  localHint: "Od razu, bez kredytów: czas, data, rachunek, notatki i krótka rozmowa.",
  grokHint: "Swobodne odpowiedzi. Każde pytanie zużywa kredyty xAI.",
  voiceCloudHint: "Te głosy mówią wybranym językiem. Bez kredytów zostaje głos przeglądarki.",
  ack: "Słucham.",
  emptyHint: "Napisz albo naciśnij Słuchaj. Podwójne stuknięcie w Nero też włącza słuch.",
  you: "Ty",
  nero: "Nero",
  size: "Wzrost na scenie",
  heard: "Usłyszałam",
  testLive: "Mów — pasek powinien się ruszać.",
  notes: "Notatki",
  clearNotes: "Usuń notatki",
  noNotes: "Pusto. Powiedz „zapamiętaj …”.",
  looks: { witch: "Wiedźma", moon: "Księżyc", street: "Miasto", academy: "Akademia", stars: "Gwiazdy", pixel: "Piksel", evening: "Wieczór" },
  lookHints: { witch: "Kapelusz i płaszcz, chód i usta", moon: "Bez kapelusza, srebrna podszewka", street: "Długi czarny płaszcz", academy: "Mundur akademii", stars: "Noc i gwiazdy", pixel: "Pełny piksel", evening: "Suknia, odkryte ramiona" },
  scenes: { library: "Biblioteka", rain: "Deszcz", morning: "Ranek", observatory: "Obserwatorium", ink: "Ciemność" },
};

const de: Copy = {
  ...en,
  kicker: "Sprachstudio",
  talk: "Gespräch",
  settings: "Einstellungen",
  listen: "Hören",
  stop: "Stopp",
  send: "Senden",
  placeholder: "Schreib Nero…",
  stateIdle: "Da",
  stateListening: "Ich höre",
  stateThinking: "Ich denke",
  stateSpeaking: "Ich spreche",
  language: "Sprache",
  hearing: "Gehör",
  model: "Sprachmodell",
  voice: "Stimme",
  look: "Neros Aussehen",
  scene: "Studiohintergrund",
  sensitivity: "Mikrofonempfindlichkeit",
  sensitivityHint: "Eine niedrigere Schwelle hört leiser. Hebe sie an, wenn Raumgeräusche durchkommen.",
  mode: "Wann antworten",
  modePush: "Per Taste",
  modeContinuous: "Dauerhaft",
  modeWake: "Nach „Nero“",
  hearBrowserHint: "Spracherkennung des Browsers, in der Sprache oben.",
  hearGrokHint: "Nimmt einen Satz auf und sendet ihn an grok-voice-transcribe-2.0. Braucht Guthaben.",
  voiceBrowser: "Stimme dieses Browsers",
  rate: "Tempo",
  pitch: "Tonhöhe",
  testMic: "Mikrofon prüfen",
  clearChat: "Gespräch löschen",
  micDenied: "Kein Mikrofonzugriff. Erlaube ihn oder tippe.",
  noRecognizer: "Dieser Browser erkennt keine Sprache. Tippe oder wähle Grok Transcribe.",
  tooQuiet: "Zu leise für diese Schwelle. Näher sprechen oder Empfindlichkeit senken.",
  missed: "Das habe ich nicht verstanden. Noch einmal.",
  cloudCredits: "Das Cloud-Modell ist nicht verfügbar: kein Guthaben. Lokale Nero hat geantwortet.",
  cloudFailed: "Das Cloud-Modell hat nicht geantwortet. Lokale Nero hat geantwortet.",
  voiceFallback: "Die Cloud-Stimme ist nicht verfügbar, ich nutze die Browserstimme.",
  hearCredits: "Grok Transcribe ist nicht verfügbar: kein Guthaben. Stelle das Gehör auf Browser.",
  localHint: "Sofort, ohne Guthaben: Zeit, Datum, Rechnung, Notizen und ein kurzes Gespräch.",
  grokHint: "Freie Antworten. Jede Anfrage verbraucht xAI-Guthaben.",
  voiceCloudHint: "Diese Stimmen sprechen die gewählte Sprache. Ohne Guthaben bleibt die Browserstimme.",
  ack: "Ich höre.",
  emptyHint: "Schreib oder tippe auf Hören. Doppelt auf Nero tippen schaltet das Gehör ein.",
  you: "Du",
  nero: "Nero",
  size: "Größe auf der Bühne",
  heard: "Gehört",
  testLive: "Sprich — der Balken sollte sich bewegen.",
  notes: "Notizen",
  clearNotes: "Notizen löschen",
  noNotes: "Leer. Sag „merk dir …“.",
  looks: { witch: "Hexe", moon: "Mond", street: "Stadt", academy: "Akademie", stars: "Sterne", pixel: "Pixel", evening: "Abend" },
  lookHints: { witch: "Hut und Mantel, Gang und Mund", moon: "Ohne Hut, silbernes Futter", street: "Langer schwarzer Mantel", academy: "Akademieuniform", stars: "Nacht und Sterne", pixel: "Pixel, ganzkörper", evening: "Kleid, freie Schultern" },
  scenes: { library: "Bibliothek", rain: "Regen", morning: "Morgen", observatory: "Sternwarte", ink: "Dunkel" },
};

const ja: Copy = {
  ...en,
  kicker: "ボイススタジオ",
  talk: "会話",
  settings: "設定",
  listen: "聞く",
  stop: "停止",
  send: "送る",
  placeholder: "ネロに書く…",
  stateIdle: "待機",
  stateListening: "聞いてる",
  stateThinking: "考えてる",
  stateSpeaking: "話してる",
  language: "言語",
  hearing: "聞き取り",
  model: "言語モデル",
  voice: "声",
  look: "ネロの姿",
  scene: "背景",
  sensitivity: "マイク感度",
  sensitivityHint: "しきい値を下げると小さい声も拾う。部屋の雑音を拾うなら上げて。",
  mode: "答えるタイミング",
  modePush: "ボタン",
  modeContinuous: "常時",
  modeWake: "「ネロ」のあと",
  hearBrowserHint: "ブラウザの音声認識。上で選んだ言語を使う。",
  hearGrokHint: "一文を録音して grok-voice-transcribe-2.0 に送る。クレジットが必要。",
  voiceBrowser: "このブラウザの声",
  rate: "速さ",
  pitch: "高さ",
  testMic: "マイクを試す",
  clearChat: "会話を消す",
  micDenied: "マイクが使えない。許可するか、文字で書いて。",
  noRecognizer: "このブラウザは音声認識ができない。文字入力か Grok Transcribe を選んで。",
  tooQuiet: "今のしきい値には小さすぎる。近づくか、感度を下げて。",
  missed: "聞き取れなかった。もう一度。",
  cloudCredits: "クラウドのモデルはクレジット不足。ローカルのネロが答えた。",
  cloudFailed: "クラウドのモデルが答えなかった。ローカルのネロが答えた。",
  voiceFallback: "クラウドの声が使えないので、ブラウザの声で読む。",
  hearCredits: "Grok Transcribe はクレジット不足。聞き取りを「ブラウザ」にして。",
  localHint: "クレジットなしですぐに: 時刻、日付、計算、メモ、短い会話。",
  grokHint: "自由な返答。リクエストごとに xAI のクレジットを使う。",
  voiceCloudHint: "この声は選んだ言語で話す。クレジットがなければブラウザの声になる。",
  ack: "聞いてる。",
  emptyHint: "書くか「聞く」を押して。ネロをダブルタップしても聞き始める。言語、モデル、声、姿、背景は設定から。",
  you: "あなた",
  nero: "ネロ",
  size: "ステージ上の大きさ",
  heard: "聞こえた",
  testLive: "話して。メーターが動くはず。",
  notes: "メモ",
  clearNotes: "メモを消す",
  noNotes: "空。 「覚えて」と言って。",
  looks: { witch: "魔女", moon: "月", street: "街", academy: "学院", stars: "星", pixel: "ドット", evening: "夜" },
  lookHints: { witch: "帽子とコート、歩きと口", moon: "帽子なし、銀の裏地", street: "長い黒コート", academy: "学院の服", stars: "夜と星", pixel: "全身ドット", evening: "ドレス、肩出し" },
  scenes: { library: "書斎", rain: "雨", morning: "朝", observatory: "天文台", ink: "闇" },
};

const ALL: Record<Lang, Copy> = { uk, ru, en, pl, de, ja };

export function copyFor(lang: Lang): Copy {
  return ALL[lang];
}

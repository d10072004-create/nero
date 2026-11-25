const { app, BrowserWindow, ipcMain, screen } = require("electron");
const { execFile } = require("node:child_process");
const path = require("node:path");

const START = "http://127.0.0.1:8080/";
const PRELOAD = path.join(__dirname, "preload.cjs");

let mainWindow = null;
let petWindow = null;
let speaker = null;

function speakWindows(text, rate) {
  const b64 = Buffer.from(String(text).slice(0, 500), "utf8").toString("base64");
  const sapi = Math.max(-4, Math.min(4, Math.round((Number(rate) || 100) / 25 - 4)));
  const script = `
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Speech
$s = New-Object System.Speech.Synthesis.SpeechSynthesizer
$s.Rate = ${sapi}
$voices = @($s.GetInstalledVoices() | ForEach-Object { $_.VoiceInfo })
$pick = $voices | Where-Object { $_.Culture.Name -like 'uk*' } | Select-Object -First 1
if (-not $pick) { $pick = $voices | Where-Object { $_.Culture.Name -like 'ru*' } | Select-Object -First 1 }
if ($pick) { $s.SelectVoice($pick.Name) }
$s.Speak([Text.Encoding]::UTF8.GetString([Convert]::FromBase64String('${b64}')))
`;
  if (speaker) {
    speaker.kill();
    speaker = null;
  }
  return new Promise((resolve) => {
    speaker = execFile(
      "powershell.exe",
      ["-NoProfile", "-STA", "-Command", script],
      { windowsHide: true, timeout: 120000 },
      (error) => resolve(!error),
    );
  });
}

function createMain() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 960,
    minHeight: 640,
    title: "Nero",
    autoHideMenuBar: true,
    backgroundColor: "#0e0f12",
    webPreferences: {
      preload: PRELOAD,
      contextIsolation: true,
      nodeIntegration: false,
    },
  });
  mainWindow.setMenuBarVisibility(false);
  void mainWindow.loadURL(START);
}

function createPet() {
  if (petWindow && !petWindow.isDestroyed()) {
    petWindow.show();
    petWindow.focus();
    return;
  }
  const area = screen.getPrimaryDisplay().workArea;
  const width = Math.min(920, area.width);
  const height = Math.min(640, area.height);
  petWindow = new BrowserWindow({
    width,
    height,
    x: area.x + Math.round((area.width - width) / 2),
    y: area.y + area.height - height,
    title: "Nero",
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    resizable: true,
    hasShadow: false,
    backgroundColor: "#00000000",
    webPreferences: {
      preload: PRELOAD,
      contextIsolation: true,
      nodeIntegration: false,
    },
  });
  petWindow.setAlwaysOnTop(true, "screen-saver");
  void petWindow.loadURL(`${START}pet`);
  petWindow.on("closed", () => {
    petWindow = null;
  });
}

app.whenReady().then(() => {
  ipcMain.handle("nero:speak", (_event, payload) => {
    if (process.platform !== "win32") return false;
    return speakWindows(payload?.text ?? "", payload?.rate);
  });
  ipcMain.handle("nero:pet", (_event, open) => {
    if (open) createPet();
    else if (petWindow && !petWindow.isDestroyed()) petWindow.close();
  });
  createMain();
});

app.on("window-all-closed", () => {
  app.quit();
});

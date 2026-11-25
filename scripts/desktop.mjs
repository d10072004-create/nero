import { spawn } from "node:child_process";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { setTimeout as delay } from "node:timers/promises";

const require = createRequire(import.meta.url);
const root = fileURLToPath(new URL("..", import.meta.url));

async function serving() {
  try {
    const response = await fetch("http://127.0.0.1:8080/", { signal: AbortSignal.timeout(1500) });
    return response.status < 500;
  } catch {
    return false;
  }
}

let vite = null;
if (!(await serving())) {
  vite = spawn(
    process.execPath,
    ["scripts/with-app-env.mjs", "vite", "dev", "--host", "127.0.0.1", "--port", "8080"],
    { cwd: root, stdio: "inherit" },
  );
  for (let i = 0; i < 80 && !(await serving()); i += 1) await delay(500);
}

if (!(await serving())) {
  console.error("Nero не піднялась на http://127.0.0.1:8080");
  vite?.kill();
  process.exit(1);
}

const electron = require("electron");
const app = spawn(electron, ["."], { cwd: root, stdio: "inherit" });
app.on("exit", (code) => {
  vite?.kill();
  process.exit(code ?? 0);
});

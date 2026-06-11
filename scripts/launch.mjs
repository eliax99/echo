// Lanza backend (FastAPI) y frontend (Vite) a la vez, instalando lo que falte.
// Uso: npm run l  (desde la raíz del repo)

import { spawn, spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, readFileSync, writeFileSync, copyFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
const BACKEND = join(ROOT, "backend");
const FRONTEND = join(ROOT, "frontend");
const IS_WIN = process.platform === "win32";

const VENV_PY = IS_WIN
  ? join(BACKEND, "venv", "Scripts", "python.exe")
  : join(BACKEND, "venv", "bin", "python");

const color = (code, s) => `\x1b[${code}m${s}\x1b[0m`;
const log = (msg) => console.log(color(36, `[launch] ${msg}`));
const fail = (msg) => {
  console.error(color(31, `[launch] ERROR: ${msg}`));
  process.exit(1);
};

// En Windows hace falta shell (npm es npm.cmd), y Node exige pasar el comando
// como una sola cadena para evitar problemas de escapado de argumentos.
const quote = (s) => (/[\s"]/.test(s) ? `"${s}"` : s);
const toCommand = (cmd, args) => [cmd, ...args].map(quote).join(" ");

function run(cmd, args, cwd, label) {
  log(label);
  const r = IS_WIN
    ? spawnSync(toCommand(cmd, args), { cwd, stdio: "inherit", shell: true })
    : spawnSync(cmd, args, { cwd, stdio: "inherit" });
  if (r.status !== 0) fail(`falló: ${cmd} ${args.join(" ")}`);
}

// -------------------------
// .env (si faltan, se copian de los .example y se avisa)
// -------------------------
function ensureEnv(dir, name) {
  const env = join(dir, ".env");
  const example = join(dir, ".env.example");
  if (!existsSync(env) && existsSync(example)) {
    copyFileSync(example, env);
    console.warn(
      color(33, `[launch] AVISO: creado ${name}/.env desde .env.example — revisa que los valores estén rellenos.`)
    );
  }
}

ensureEnv(BACKEND, "backend");
ensureEnv(FRONTEND, "frontend");

// -------------------------
// Backend: venv + pip install (solo si requirements.txt cambió)
// -------------------------
if (!existsSync(VENV_PY)) {
  const probe = spawnSync("python", ["--version"], { shell: IS_WIN });
  if (probe.status !== 0) fail("no se encontró `python` en el PATH (se necesita Python 3.12).");
  run("python", ["-m", "venv", "venv"], BACKEND, "creando entorno virtual del backend…");
}

const reqFile = join(BACKEND, "requirements.txt");
const reqHash = createHash("sha256").update(readFileSync(reqFile)).digest("hex");
const hashFile = join(BACKEND, "venv", ".requirements.sha256");
const installed = existsSync(hashFile) && readFileSync(hashFile, "utf8") === reqHash;

if (!installed) {
  run(VENV_PY, ["-m", "pip", "install", "-r", "requirements.txt"], BACKEND, "instalando dependencias del backend (puede tardar)…");
  writeFileSync(hashFile, reqHash);
} else {
  log("dependencias del backend OK");
}

// -------------------------
// Frontend: npm install si falta node_modules
// -------------------------
if (!existsSync(join(FRONTEND, "node_modules"))) {
  run("npm", ["install", "--no-audit", "--no-fund"], FRONTEND, "instalando dependencias del frontend…");
} else {
  log("dependencias del frontend OK");
}

// -------------------------
// Lanzar ambos procesos con salida prefijada
// -------------------------
const children = [];

function launch(name, colorCode, cmd, args, cwd) {
  const child = IS_WIN
    ? spawn(toCommand(cmd, args), { cwd, shell: true })
    : spawn(cmd, args, { cwd });
  children.push(child);

  const pipe = (stream) => {
    let buf = "";
    stream.on("data", (chunk) => {
      buf += chunk.toString();
      const lines = buf.split(/\r?\n/);
      buf = lines.pop();
      for (const line of lines) console.log(`${color(colorCode, `[${name}]`)} ${line}`);
    });
  };

  pipe(child.stdout);
  pipe(child.stderr);

  child.on("exit", (code) => {
    console.log(color(colorCode, `[${name}] terminó con código ${code}`));
    shutdown();
  });

  return child;
}

let shuttingDown = false;
function shutdown() {
  if (shuttingDown) return;
  shuttingDown = true;
  for (const child of children) {
    if (child.exitCode !== null) continue;
    if (IS_WIN) {
      // child.kill() no mata el árbol de procesos en Windows
      spawnSync("taskkill", ["/pid", String(child.pid), "/T", "/F"], { stdio: "ignore" });
    } else {
      child.kill("SIGTERM");
    }
  }
  process.exit(0);
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

log("arrancando backend en http://localhost:8000 y frontend en http://localhost:8080 (Ctrl+C para parar los dos)");

launch("back ", 35, VENV_PY, ["-m", "uvicorn", "main:app", "--reload", "--port", "8000"], BACKEND);
launch("front", 32, "npm", ["run", "dev"], FRONTEND);

import http from "http";
import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function isOllamaRunning(callback) {
  const req = http.get("http://localhost:11434", (res) => {
    callback(res.statusCode === 200);
  });

  req.on("error", () => callback(false));
}

function startOllama() {
  console.log("🔄 Starting Ollama...");
  const ollama = spawn("ollama", ["serve"], {
    detached: true,
    stdio: "ignore", // No output in terminal
  });

  return ollama;
}

function startProcess(name, script) {
  const child = spawn("node", [path.join(__dirname, "..", script)], {
    stdio: "inherit",
  });

  child.on("close", (code) => {
    if (code !== 0) {
      console.error(`❌ ${name} exited with code ${code}`);
    }
  });

  return child;
}

function startBackgroundProcess(name, script) {
  const child = spawn("node", [path.join(__dirname, "..", script)], {
    detached: true,
    stdio: "inherit",
  });

  child.unref(); // Allow parent to exit independently
}

function startYak() {
  console.log("🚀 Starting Yak server and chat UI...\n");
  startBackgroundProcess("Yak Server", "server.js");
  setTimeout(() => {
    startProcess("Yak Chat", "chat.js");
  }, 1000);
}

isOllamaRunning((running) => {
  if (running) {
    console.log("✅ Ollama is already running.\n");
    startYak();
  } else {
    startOllama();
    setTimeout(() => {
      startYak();
    }, 2000);
  }
});

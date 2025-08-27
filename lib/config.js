// lib/config.js - Robust configuration management
import fs from "fs";
import path from "path";
import { listModels } from "./ollama.js";

const CONFIG_DIR = path.join(
  process.env.HOME || process.env.USERPROFILE,
  ".yak",
);
const CONFIG_FILE = path.join(CONFIG_DIR, "config.json");

const DEFAULT_CONFIG = {
  model: null, // Will be auto-detected
  currentChat: "default",
};

// Make sure config directory exists
function ensureConfigDir() {
  if (!fs.existsSync(CONFIG_DIR)) {
    fs.mkdirSync(CONFIG_DIR, { recursive: true });
  }
}

export function getConfig() {
  ensureConfigDir(); // Create ~/.yak/ if needed

  let config = { ...DEFAULT_CONFIG };

  // Try to load existing config
  if (fs.existsSync(CONFIG_FILE)) {
    try {
      const savedConfig = JSON.parse(fs.readFileSync(CONFIG_FILE, "utf-8"));
      config = { ...config, ...savedConfig };
    } catch (err) {
      console.log("⚠️  Config file corrupted, using defaults");
    }
  }

  return config;
}

// Separate function for when you actually need a working model
export async function ensureModel() {
  const config = getConfig();

  // If model already set, we're good
  if (config.model) {
    return config;
  }

  // Need to set up a model
  console.log("🔍 Setting up your first model...");
  config.model = await getDefaultModel();
  setConfig(config);

  return config;
}

// Get best available model or help user download one
async function getDefaultModel() {
  try {
    const models = await listModels();

    if (models.length === 0) {
      console.log("🤖 No models found! Let me help you get started.");
      console.log("📥 Downloading gemma3:1b (small, fast model)...");
      console.log("");

      // Auto-download recommended model
      const { spawn } = await import("child_process");
      const child = spawn("ollama", ["pull", "gemma3:1b"], {
        stdio: "inherit",
      });

      return new Promise((resolve) => {
        child.on("close", (code) => {
          if (code === 0) {
            console.log("✅ gemma3:1b downloaded successfully!");
            resolve("gemma3:1b");
          } else {
            console.log(
              "❌ Download failed. You can manually run: ollama pull gemma3:1b",
            );
            resolve("gemma3:1b"); // Still use it as default
          }
        });
      });
    }

    // Prefer fast models
    const preferred = ["gemma3:1b", "llama3:instruct"];
    for (const pref of preferred) {
      if (models.some((m) => m.name === pref)) {
        return pref;
      }
    }

    // Use whatever they have
    return models[0].name;
  } catch {
    return "gemma3:1b"; // Reasonable default
  }
}

export function setConfig(config) {
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
}

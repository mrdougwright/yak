// lib/storage.js - Chat storage and management (File Operations)
import fs from "fs";
import path from "path";
import { getConfig, setConfig } from "./config.js";
import { showStatus, showError, formatListItem } from "./ui.js";
import chalk from "chalk";

const CHATS_DIR = path.join(
  process.env.HOME || process.env.USERPROFILE,
  ".yak",
  "chats",
);

// Ensure chats directory exists
function ensureChatsDir() {
  if (!fs.existsSync(CHATS_DIR)) {
    fs.mkdirSync(CHATS_DIR, { recursive: true });
  }
}

function getChatPath(chatName) {
  return path.join(CHATS_DIR, `${chatName}.jsonl`);
}

export function getCurrentChatName() {
  return getConfig().currentChat || "default";
}

export function readHistory() {
  const chatName = getCurrentChatName();
  const chatPath = getChatPath(chatName);

  if (!fs.existsSync(chatPath)) return [];

  const content = fs.readFileSync(chatPath, "utf-8");
  const lines = content.split("\n").filter(Boolean);
  return lines.map((line) => JSON.parse(line));
}

export function appendMessage(message) {
  ensureChatsDir();
  const chatName = getCurrentChatName();
  const chatPath = getChatPath(chatName);

  fs.appendFileSync(chatPath, JSON.stringify(message) + "\n");
}

export async function listChats() {
  ensureChatsDir();

  const files = fs.readdirSync(CHATS_DIR);
  const chats = files
    .filter((f) => f.endsWith(".jsonl"))
    .map((f) => f.replace(".jsonl", ""));

  if (chats.length === 0) {
    console.log(chalk.yellow("📭 No chats found"));
    console.log(
      chalk.dim('💡 Run "yak start" to create your first chat session'),
    );
    return;
  }

  const current = getCurrentChatName();

  chats.forEach((chat) => {
    const indicator = chat === current ? chalk.green("👉") : chalk.dim("  ");
    const nameColor = chat === current ? "green" : "white";
    const status = chat === current ? chalk.dim(" (current)") : "";
    console.log(formatListItem(indicator, chat, status, nameColor));
  });
}

export async function createChat(chatName) {
  if (!chatName?.trim()) {
    showError("Chat name required: yak new <name>");
    return;
  }

  const sanitized = chatName.trim().replace(/[^a-zA-Z0-9-_]/g, "-");
  const chatPath = getChatPath(sanitized);

  if (fs.existsSync(chatPath)) {
    console.log(chalk.yellow(`💬 Chat "${sanitized}" already exists`));
    return;
  }

  ensureChatsDir();
  fs.writeFileSync(chatPath, "");

  const config = getConfig();
  config.currentChat = sanitized;
  setConfig(config);

  showStatus(`Created and switched to: ${sanitized}`, "success");
}

export async function switchChat(chatName) {
  if (!chatName?.trim()) {
    showError("Chat name required: yak switch <name>");
    return;
  }

  const chatPath = getChatPath(chatName);
  if (!fs.existsSync(chatPath)) {
    console.log(chalk.red(`❌ Chat "${chatName}" not found`));
    console.log(chalk.dim('💡 Use "yak list" to see available chats'));
    return;
  }

  const config = getConfig();
  config.currentChat = chatName;
  setConfig(config);

  showStatus(`Switched to: ${chatName}`, "success");
}

export async function deleteChat(chatName) {
  if (!chatName?.trim()) {
    showError("Chat name required: yak delete <name>");
    return;
  }

  if (chatName === getCurrentChatName()) {
    console.log(chalk.yellow("⚠️ Cannot delete current chat"));
    console.log(
      chalk.dim('💡 Switch to another chat first with "yak switch <name>"'),
    );
    return;
  }

  const chatPath = getChatPath(chatName);
  if (!fs.existsSync(chatPath)) {
    console.log(chalk.red(`❌ Chat "${chatName}" not found`));
    return;
  }

  fs.unlinkSync(chatPath);
  showStatus(`Deleted chat: ${chatName}`, "success");
}

export function resetCurrentChat() {
  const chatName = getCurrentChatName();
  const chatPath = getChatPath(chatName);
  fs.writeFileSync(chatPath, "");
}

export async function listAvailableModels() {
  const { listModels } = await import("./ollama.js");

  try {
    const models = await listModels();
    const config = getConfig();
    const currentModel = config.model;

    if (models.length === 0) {
      console.log(chalk.yellow("📥 No models found"));
      console.log(chalk.dim("💡 Download one with: ollama pull gemma2:2b"));
      return;
    }

    models.forEach((model) => {
      const indicator =
        model.name === currentModel ? chalk.green("👉") : chalk.dim("  ");
      const nameColor = model.name === currentModel ? "green" : "white";
      const size = chalk.dim(formatSize(model.size));
      const status = model.name === currentModel ? chalk.dim(" (current)") : "";
      const nameWithSize = model.name.padEnd(30) + " " + size;
      console.log(formatListItem(indicator, nameWithSize, status, nameColor));
    });

    console.log();
    console.log(
      chalk.dim(`Current model: ${chalk.cyan(currentModel || "None set")}`),
    );
  } catch (err) {
    showError("Failed to list models. Is Ollama running?");
  }
}

export async function switchModel(modelName) {
  if (!modelName?.trim()) {
    showError("Model name required: yak model <name>");
    return;
  }

  const { listModels } = await import("./ollama.js");

  try {
    const models = await listModels();
    const modelExists = models.some((m) => m.name === modelName);

    if (!modelExists) {
      console.log(chalk.red(`❌ Model "${modelName}" not found`));
      console.log(chalk.dim('💡 Use "yak models" to see available models'));
      return;
    }

    const config = getConfig();
    config.model = modelName;
    setConfig(config);

    showStatus(`Switched to model: ${modelName}`, "success");
  } catch (err) {
    showError("Failed to verify model. Is Ollama running?");
  }
}

function formatSize(bytes) {
  const gb = bytes / (1024 * 1024 * 1024);
  return gb >= 1
    ? `${gb.toFixed(1)} GB`
    : `${(bytes / (1024 * 1024)).toFixed(0)} MB`;
}

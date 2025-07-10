import fs from "fs";

const CONFIG = "config.json";
const FILE = "chatlog.jsonl";

export function getConfig() {
  const config = fs.readFileSync(CONFIG, "utf-8");
  return JSON.parse(config);
}

export function readChatHistory() {
  if (!fs.existsSync(FILE)) return [];
  const lines = fs.readFileSync(FILE, "utf-8").split("\n").filter(Boolean);
  return lines.map((line) => JSON.parse(line));
}

export function appendToLog(message) {
  fs.appendFileSync(FILE, JSON.stringify(message) + "\n");
}

// deprecated; may bring back log truncation...
export function truncateLog(maxLines = 40) {
  const lines = fs.readFileSync(FILE, "utf-8").split("\n").filter(Boolean);
  if (lines.length <= maxLines) return;
  const trimmed = lines.slice(-maxLines);
  fs.writeFileSync(FILE, trimmed.join("\n") + "\n");
}

export function resetLog() {
  fs.writeFileSync(FILE, "");
}

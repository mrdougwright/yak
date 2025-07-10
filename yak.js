#!/usr/bin/env node

import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

// Emulate __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const command = process.argv[2];

function run(script) {
  const child = spawn("node", [path.join(__dirname, script)], {
    stdio: "inherit",
  });

  child.on("close", (code) => {
    process.exit(code);
  });
}

switch (command) {
  case "start":
    import("./scripts/start.js");
    break;
  case "chat":
    run("chat.js");
    break;
  case "server":
    run("server.js");
    break;
  default:
    console.log(`❌ Unknown command: ${command}`);
    console.log("Usage: yak <start|chat|server>");
    process.exit(1);
}

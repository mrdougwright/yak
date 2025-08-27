#!/usr/bin/env node
// yak.js - Main entry point

import {
  listChats,
  createChat,
  switchChat,
  deleteChat,
  resetCurrentChat,
  listAvailableModels,
  switchModel,
} from "./lib/storage.js";
import { showHelp } from "./lib/help.js";
import { showConfig, showStatus, createLogo, colors } from "./lib/ui.js";
import gradient from "gradient-string";
import chalk from "chalk";

const args = process.argv.slice(2);
const command = args[0];

switch (command) {
  case "list":
    console.log(gradient(colors.primary)("📋 Chat Sessions"));
    console.log();
    await listChats();
    break;

  case "models":
    console.log(gradient(colors.primary)("🤖 Available Models"));
    console.log();
    await listAvailableModels();
    break;

  case "model":
    await switchModel(args[1]);
    break;

  case "new":
    await createChat(args[1]);
    break;

  case "switch":
    await switchChat(args[1]);
    break;

  case "delete":
    await deleteChat(args[1]);
    break;

  case "config":
    showConfig();
    break;

  case "--reset":
    await resetCurrentChat();
    showStatus("Chat history cleared successfully", "success");
    break;

  case "--version":
  case "version":
    console.log();
    console.log(createLogo());
    console.log();
    console.log(gradient(colors.primary)("YAK v1.1.0"));
    console.log(chalk.dim("Local LLM Development Assistant"));
    console.log();
    break;

  case "start":
    // Import and run the startup script
    const { default: startScript } = await import("./scripts/start.js");
    break;

  case "help":
  case "--help":
  case "-h":
  case undefined:
    showHelp();
    break;

  default:
    console.log(chalk.yellow(`Unknown command: ${command}`));
    console.log(chalk.dim('Run "yak help" for available commands'));
    break;
}

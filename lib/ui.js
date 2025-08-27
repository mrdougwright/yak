#!/usr/bin/env node

import chalk from "chalk";
import gradient from "gradient-string";
import figlet from "figlet";
import boxen from "boxen";

import { readFileSync, existsSync } from "fs";
import { getConfig } from "./config.js";

// Enhanced Gemini-inspired color palette
const colors = {
  primary: ["#4F46E5", "#06B6D4", "#10B981"],
  secondary: ["#8B5CF6", "#EC4899", "#F59E0B"],
  accent: ["#3B82F6", "#6366F1", "#8B5CF6"],
  muted: "#6B7280",
  success: "#10B981",
  warning: "#F59E0B",
  error: "#EF4444",
  info: "#3B82F6",
};

// Enhanced ASCII Art Logo with dynamic gradient
const createLogo = () => {
  const logo = figlet.textSync("YAK", {
    font: "ANSI Shadow",
    horizontalLayout: "fitted",
    verticalLayout: "default",
  });

  const gradientLogo = gradient(colors.primary)(logo);

  // Add subtle border effect
  const border = "═".repeat(60);
  const topBorder = gradient(colors.accent)(border);
  const bottomBorder = gradient(colors.secondary)(border);

  return `${topBorder}\n${gradientLogo}\n${bottomBorder}`;
};

// Enhanced welcome screen with better layout
const showWelcome = () => {
  console.clear();

  // Logo with breathing space
  console.log("\n");
  console.log(createLogo());
  console.log("\n");

  // Tagline with gradient
  const tagline = gradient(colors.secondary)(
    "✨ Your AI-Powered Development Assistant",
  );
  console.log(" ".repeat(15) + tagline);
  console.log("\n");

  // Enhanced tips section
  const tipsHeader = chalk.bold.cyan("💡 Quick Start Guide");
  console.log(tipsHeader);
  console.log(chalk.dim("─".repeat(50)));

  const tips = [
    { icon: "🤖", text: "Ask questions to your offline model", color: "cyan" },
    { icon: "🌎", text: "Provide URLs to crawl online content", color: "green" },
    { icon: "⚙️", text: "Edit your chats in `.yak/chats`", color: "yellow" },
    { icon: "❓", text: "Type /bye or /quit to exit", color: "blue" },
  ];

  tips.forEach((tip, index) => {
    const bullet = chalk[tip.color](`${tip.icon} `);
    const text = chalk.white(tip.text);
    const number = chalk.dim(`${index + 1}. `);
    console.log(`  ${number}${bullet}${text}`);
  });

  console.log("\n");

  // Status indicator
  showSystemStatus();

  console.log("\n");
};

// System status with enhanced styling
const showSystemStatus = () => {
  const config = getConfig();

  const statusItems = [
    { label: "System", value: "Ready", color: "green", icon: "●" },
    {
      label: "Model",
      value: config.model || "Not set",
      color: config.model ? "blue" : "yellow",
      icon: "🧠",
    },
    {
      label: "Chat",
      value: config.currentChat || "default",
      color: "cyan",
      icon: "💬",
    },
  ];

  const statusLine = statusItems
    .map((item) => {
      const icon = chalk[item.color](item.icon);
      const label = chalk.dim(item.label + ":");
      const value = chalk[item.color].bold(item.value);
      return `${icon} ${label} ${value}`;
    })
    .join(" ".repeat(3));

  const statusBox = boxen(statusLine, {
    padding: { top: 0, bottom: 0, left: 2, right: 2 },
    margin: { top: 0, bottom: 0, left: 4, right: 4 },
    borderStyle: "round",
    borderColor: "cyan",
  });

  console.log(statusBox);
};

// Enhanced prompt with better visual hierarchy
const createPrompt = (isUser = true) => {
  if (isUser) {
    const userIcon = gradient(colors.primary)("🦧");
    const promptSymbol = chalk.cyan.bold("❯");
    return `${userIcon} ${promptSymbol} `;
  } else {
    const aiIcon = gradient(colors.secondary)("🤖");
    const responseSymbol = chalk.magenta("│");
    return `${aiIcon} ${responseSymbol} `;
  }
};

// Enhanced status messages with clean styling
const showStatus = (message, type = "info") => {
  const icons = {
    info: "ℹ",
    success: "✓",
    warning: "⚠",
    error: "✗",
  };

  const colorMap = {
    info: "blue",
    success: "green",
    warning: "yellow",
    error: "red",
  };

  const icon = chalk[colorMap[type]](icons[type]);
  console.log(`${icon} ${chalk[colorMap[type]](message)}`);
};

// Enhanced error display
const showError = (error, context = {}) => {
  console.log("\n");

  const errorTitle = chalk.red.bold("⚠️  Error Encountered");
  const errorMessage = chalk.white(error.message || error);
  const troubleshooting = chalk.dim(
    "💡 Try: yak help for assistance or yak models to check available models",
  );

  const errorContent = `${errorTitle}\n\n${errorMessage}\n\n${troubleshooting}`;

  const errorBox = boxen(errorContent, {
    padding: 1,
    margin: 1,
    borderStyle: "double",
    borderColor: "red",
    title: "🚨 Error",
    titleAlignment: "center",
  });

  console.log(errorBox);
  console.log("\n");
};

// Enhanced configuration display
const showConfig = () => {
  try {
    const config = getConfig();

    const configItems = [
      {
        key: "Model",
        value: config.model || "Not configured",
        icon: "🧠",
        color: config.model ? "cyan" : "yellow",
      },
      {
        key: "Current Chat",
        value: config.currentChat || "default",
        icon: "💬",
        color: "green",
      },
      {
        key: "Config Path",
        value: "~/.yak/config.json",
        icon: "📁",
        color: "magenta",
      },
    ];

    const configContent = configItems
      .map((item) => {
        const icon = chalk[item.color](item.icon);
        const key = chalk.bold.white(item.key.padEnd(15));
        const value = chalk[item.color](item.value);
        return `${icon} ${key} ${value}`;
      })
      .join("\n");

    const header = gradient(colors.primary)("⚙️  Current Configuration");
    const fullContent = `${header}\n\n${configContent}`;

    const configBox = boxen(fullContent, {
      padding: 2,
      margin: 1,
      borderStyle: "round",
      borderColor: "cyan",
    });

    console.log(configBox);
  } catch (error) {
    showError("Could not read configuration file");
  }
};

// Enhanced typing indicator
const showTypingIndicator = () => {
  const frames = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];
  let i = 0;

  const interval = setInterval(() => {
    const frame = chalk.cyan(frames[i % frames.length]);
    const text = chalk.dim();
    process.stdout.write(`\r${createPrompt(false)}${frame} ${text}`);
    i++;
  }, 80);

  return () => {
    clearInterval(interval);
    process.stdout.write("\r" + " ".repeat(60) + "\r"); // Clear entire line
  };
};

// Enhanced message formatting
const formatMessage = (message, isUser = false) => {
  if (isUser) {
    return chalk.white(message);
  } else {
    // Format AI responses with better typography
    const lines = message.split("\n");
    return lines
      .map((line) => {
        if (line.startsWith("```")) {
          return chalk.dim(line);
        } else if (line.startsWith("#")) {
          return chalk.bold.cyan(line);
        } else if (line.startsWith("*") || line.startsWith("-")) {
          return chalk.yellow("•") + " " + chalk.gray(line.slice(1).trim());
        } else {
          return chalk.gray(line);
        }
      })
      .join("\n");
  }
};

// Enhanced help display - moved to help.js to avoid duplication

// Utility function for formatting list items consistently
const formatListItem = (indicator, name, extra = "", nameColor = "white") => {
  const coloredIndicator =
    typeof indicator === "string" ? indicator : indicator;
  const coloredName = chalk[nameColor](name);
  return `${coloredIndicator} ${coloredName}${extra}`;
};

// Progress bar utility
const createProgressBar = (current, total, width = 30) => {
  const percentage = Math.round((current / total) * 100);
  const filled = Math.round((width * current) / total);
  const empty = width - filled;

  const bar = chalk.green("█".repeat(filled)) + chalk.dim("░".repeat(empty));
  const percent = chalk.bold(`${percentage}%`);

  return `${bar} ${percent}`;
};

// Enhanced startup message
const showStartupMessage = () => {
  console.log(chalk.dim("🦧 Yak - Local LLM Chat Interface"));
  console.log(chalk.dim("═".repeat(40)));
};

export {
  createLogo,
  showWelcome,
  createPrompt,
  showStatus,
  showError,
  showConfig,
  formatMessage,
  showTypingIndicator,
  showSystemStatus,
  createProgressBar,
  showStartupMessage,
  formatListItem,
  colors,
};

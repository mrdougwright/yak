// lib/help.js - Enhanced help and usage information for the CLI
import chalk from "chalk";
import gradient from "gradient-string";
import figlet from "figlet";
import { colors } from "./ui.js";

export function showHelp() {
  console.clear();
  console.log(
    gradient(colors.primary)(figlet.textSync("YAK Help", { font: "Small" })),
  );
  console.log("\n");

  const sections = [
    {
      title: "🚀 Main Commands",
      items: [
        { cmd: "yak start", desc: "Start chat session with your model" },
        { cmd: "yak help", desc: "Show this help message" },
        { cmd: "yak list", desc: "List all chat sessions" },
        { cmd: "yak models", desc: "List available models" },
      ],
    },
    {
      title: "💬 Chat Management",
      items: [
        { cmd: "yak new <name>", desc: "Create new chat session" },
        { cmd: "yak switch <name>", desc: "Switch to chat session" },
        { cmd: "yak delete <name>", desc: "Delete chat session" },
        { cmd: "yak --reset", desc: "Clear current chat history" },
      ],
    },
    {
      title: "🤖 Model Management",
      items: [
        { cmd: "yak model <name>", desc: "Switch to different model" },
        { cmd: "yak models", desc: "List downloaded models" },
      ],
    },
    {
      title: "💬 In-Chat Commands",
      items: [
        { cmd: "/bye or /quit", desc: "Exit chat session" },
        {
          cmd: "http or www",
          desc: "Chat will detect given URLs and crawl them",
        },
      ],
    },
  ];

  sections.forEach((section) => {
    console.log(chalk.bold.cyan(section.title));
    console.log(chalk.dim("─".repeat(50)));

    section.items.forEach((item) => {
      const cmd = chalk.green.bold(item.cmd.padEnd(20));
      const desc = chalk.gray(item.desc);
      console.log(`  ${cmd} ${desc}`);
    });

    console.log("\n");
  });

  const footer = [
    chalk.dim("Examples:"),
    chalk.cyan("  yak new python-help") +
      chalk.dim("   Create chat for Python questions"),
    chalk.cyan("  yak model gemma2:2b") +
      chalk.dim("   Switch to faster model"),
    chalk.cyan("  yak start") + chalk.dim("             Begin chatting"),
    "",
    chalk.dim("For more info: ") +
      chalk.cyan("https://github.com/mrdougwright/yak"),
  ];

  footer.forEach((line) => console.log(line));
  console.log("\n");
}

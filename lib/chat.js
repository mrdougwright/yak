// lib/chat.js - Terminal chat interface
import readline from "readline";
import { streamChat } from "./ollama.js";
import { readHistory, appendMessage, getCurrentChatName } from "./storage.js";
import { ensureModel } from "./config.js";
import { maybeEnhancePromptWithWeb } from "./web.js";
import {
  createPrompt,
  showTypingIndicator,
  formatMessage,
  showChatHeader,
  showWelcome,
  showError,
} from "./ui.js";
import chalk from "chalk";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function ask(question) {
  return new Promise((resolve) => rl.question(question, resolve));
}

export async function chat() {
  const config = await ensureModel();
  const chatName = getCurrentChatName();

  // Show enhanced welcome screen
  showWelcome();

  // Show chat header with model and chat info
  showChatHeader(config.model, chatName);

  console.log(
    chalk.dim(
      "💡 In chat commands: /bye to exit, @url to include web content\n",
    ),
  );

  while (true) {
    const prompt = await ask(createPrompt(true));

    if (prompt.trim() === "") continue;
    if (prompt.trim() === "/bye") break;
    if (prompt.trim() === "/quit") break;

    const history = readHistory();
    const originalUserMessage = { role: "user", content: prompt };

    // Save original prompt to chat history (without web content)
    appendMessage(originalUserMessage);
    history.push(originalUserMessage);

    // Check if prompt contains URLs and enhance if needed
    const { enhanced: enhancedPrompt, hasWeb } =
      await maybeEnhancePromptWithWeb(prompt);

    // Create enhanced message for LLM (but don't save this to history)
    const enhancedHistory = [...history];
    if (hasWeb) {
      enhancedHistory[enhancedHistory.length - 1] = {
        role: "user",
        content: enhancedPrompt,
      };
    }

    let fullReply = "";

    // Show typing indicator
    const stopTyping = showTypingIndicator();

    try {
      await streamChat(config.model, enhancedHistory, (token) => {
        // Clear typing indicator on first token
        if (fullReply === "") {
          stopTyping();
          process.stdout.write("\r" + " ".repeat(50) + "\r"); // Clear line
          process.stdout.write(createPrompt(false));
        }
        fullReply += token;
        process.stdout.write(chalk.gray(token));
      });
    } catch (err) {
      stopTyping();
      process.stdout.write("\r" + " ".repeat(50) + "\r"); // Clear line
      showError("Failed to connect to Ollama. Is `ollama serve` running?");
      continue;
    }

    console.log(); // New line after response
    appendMessage({ role: "assistant", content: fullReply.trim() });
  }

  rl.close();
}

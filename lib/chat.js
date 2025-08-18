// lib/chat.js - Terminal chat interface
import readline from 'readline';
import { streamChat } from './ollama.js';
import { readHistory, appendMessage, getCurrentChatName } from './storage.js';
import { ensureModel } from './config.js';
import { maybeEnhancePromptWithWeb } from './web.js';


const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function ask(question) {
  return new Promise(resolve => rl.question(question, resolve));
}

export async function chat() {
  const config = await ensureModel();
  const chatName = getCurrentChatName();

  console.log(`🤖 Using ${config.model} (chat: ${chatName})\n`);

  while (true) {
    const prompt = await ask('🦧> ');

    if (prompt.trim() === '') continue;
    if (prompt.trim() === '/bye') break;
    if (prompt.trim() === '/quit') break;

    const history = readHistory();
    const originalUserMessage = { role: 'user', content: prompt };

    // Save original prompt to chat history (without web content)
    appendMessage(originalUserMessage);
    history.push(originalUserMessage);

    // Check if prompt contains URLs and enhance if needed
    const { enhanced: enhancedPrompt, hasWeb } = await maybeEnhancePromptWithWeb(prompt);

    // Create enhanced message for LLM (but don't save this to history)
    const enhancedHistory = [...history];
    if (hasWeb) {
      enhancedHistory[enhancedHistory.length - 1] = {
        role: 'user',
        content: enhancedPrompt
      };
    }

    let fullReply = '';
    process.stdout.write('🤖: ');

    try {
      await streamChat(config.model, enhancedHistory, (token) => {
        fullReply += token;
        process.stdout.write(token);
      });
    } catch (err) {
      console.error('\n❌ Failed to connect to Ollama');
      console.error('🔌 Is `ollama serve` running?');
      continue;
    }

    console.log(); // New line after response
    appendMessage({ role: 'assistant', content: fullReply.trim() });
  }


  rl.close();
}

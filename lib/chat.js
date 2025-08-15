// lib/chat.js - Terminal chat interface
import readline from 'readline';
import { streamChat } from './ollama.js';
import { readHistory, appendMessage, getCurrentChatName } from './storage.js';
import { getConfig } from './config.js';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function ask(question) {
  return new Promise(resolve => rl.question(question, resolve));
}

export async function chat() {
  const config = getConfig();
  const chatName = getCurrentChatName();

  console.log(`🤖 Using ${config.model} (chat: ${chatName})\n`);

  while (true) {
    const prompt = await ask('🦧> ');

    if (prompt.trim() === '') continue;
    if (prompt.trim() === '/quit') break;

    const history = readHistory();
    const userMsg = { role: 'user', content: prompt };

    appendMessage(userMsg);
    history.push(userMsg);

    let fullReply = '';
    process.stdout.write('🤖: ');

    try {
      await streamChat(config.model, history, (token) => {
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

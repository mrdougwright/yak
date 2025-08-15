#!/usr/bin/env node
// yak.js - Main entry point

import { listChats, createChat, switchChat, deleteChat, resetCurrentChat } from './lib/storage.js';

function showHelp() {
  console.log('🦧 Yak - Local LLM Chat Interface');
  console.log('');
  console.log('Usage:');
  console.log('  yak                  - Start chat (assumes Ollama running)');
  console.log('  yak start            - Auto-start Ollama and chat');
  console.log('');
  console.log('Chat Management:');
  console.log('  yak list             - List all chat sessions');
  console.log('  yak new <n>       - Create new chat session');
  console.log('  yak switch <n>    - Switch to chat session');
  console.log('  yak delete <n>    - Delete chat session');
  console.log('  yak --reset          - Clear current chat history');
  console.log('');
  console.log('Other:');
  console.log('  yak help             - Show this help');
  console.log('');
  console.log('Examples:');
  console.log('  yak new python-help  - Create chat for Python questions');
  console.log('  yak switch work      - Switch to work-related chat');
  console.log('  yak list             - See all your chats');
}

const args = process.argv.slice(2);
const command = args[0];

switch (command) {
  case 'list':
    await listChats();
    break;

  case 'new':
    await createChat(args[1]);
    break;

  case 'switch':
    await switchChat(args[1]);
    break;

  case 'delete':
    await deleteChat(args[1]);
    break;

  case '--reset':
    await resetCurrentChat();
    console.log('✨ Chat cleared');
    break;

  case 'help':
  case '--help':
  case '-h':
    showHelp();
    break;

  case 'start':
    // Import and run the startup script
    const { default: startScript } = await import('./scripts/start.js');
    break;

  case undefined:
    // Default behavior - just start chat (assumes Ollama running)
    const { chat } = await import('./lib/chat.js');
    await chat();
    break;
}

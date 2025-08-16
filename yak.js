#!/usr/bin/env node
// yak.js - Main entry point

import { listChats, createChat, switchChat, deleteChat, resetCurrentChat, listAvailableModels, switchModel } from './lib/storage.js';
import { showHelp } from './lib/help.js';

const args = process.argv.slice(2);
const command = args[0];

switch (command) {
  case 'list':
    await listChats();
    break;

  case 'models':
    await listAvailableModels();
    break;

  case 'model':
    await switchModel(args[1]);
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

  case 'start':
    // Import and run the startup script
    const { default: startScript } = await import('./scripts/start.js');
    break;

  case 'help':
  case '--help':
  case '-h':
  case undefined:
    showHelp();
    break;

}

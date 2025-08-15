// scripts/start.js - Auto-start Ollama and launch chat
import { spawn } from 'node:child_process';
import { checkConnection } from '../lib/ollama.js';
import { chat } from '../lib/chat.js';

function startOllama() {
  console.log('🔄 Starting Ollama...');
  const ollama = spawn('ollama', ['serve'], {
    detached: true,
    stdio: 'ignore',
  });

  ollama.unref(); // Allow parent to exit independently
  return ollama;
}

async function waitForOllama(maxAttempts = 10) {
  for (let i = 0; i < maxAttempts; i++) {
    if (await checkConnection()) {
      return true;
    }

    process.stdout.write('.');
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  return false;
}

async function main() {
  console.log('🦧 Yak - Starting up...\n');

  // Check if Ollama is already running
  if (await checkConnection()) {
    console.log('✅ Ollama is running\n');
    await chat();
    return;
  }

  // Start Ollama and wait for it
  startOllama();
  process.stdout.write('⏳ Waiting for Ollama to start');

  const connected = await waitForOllama();

  if (!connected) {
    console.log('\n❌ Failed to start Ollama');
    console.log('💡 Try running: ollama serve');
    process.exit(1);
  }

  console.log('\n✅ Ollama is ready\n');
  await chat();
}

main().catch(console.error);

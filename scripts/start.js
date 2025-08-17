// scripts/start.js - Robust startup with Ollama detection
import { spawn } from 'node:child_process';
import { checkConnection } from '../lib/ollama.js';
import { chat } from '../lib/chat.js';

// Check if ollama command exists
async function isOllamaInstalled() {
  return new Promise((resolve) => {
    const child = spawn('ollama', ['--version'], { stdio: 'ignore' });

    child.on('error', (err) => {
      if (err.code === 'ENOENT') {
        resolve(false); // ollama command not found
      } else {
        resolve(false); // other error
      }
    });

    child.on('close', (code) => {
      resolve(code === 0);
    });
  });
}

function startOllama() {
  console.log('🔄 Starting Ollama...');

  return new Promise((resolve, reject) => {
    const ollama = spawn('ollama', ['serve'], {
      detached: true,
      stdio: 'ignore',
    });

    ollama.on('error', (err) => {
      if (err.code === 'ENOENT') {
        reject(new Error('OLLAMA_NOT_FOUND'));
      } else {
        reject(err);
      }
    });

    ollama.on('spawn', () => {
      ollama.unref(); // Allow parent to exit independently
      resolve();
    });
  });
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

  // First, check if Ollama is installed
  if (!(await isOllamaInstalled())) {
    console.log('❌ Ollama not found!');
    console.log('');
    console.log('📥 Please install Ollama first:');
    console.log('   • Visit: https://ollama.com');
    console.log('   • Or: brew install ollama');
    console.log('');
    console.log('💡 Then run: yak start');
    process.exit(1);
  }

  // Check if Ollama is already running
  if (await checkConnection()) {
    console.log('✅ Ollama is running\n');
    await chat();
    return;
  }

  // Try to start Ollama
  try {
    await startOllama();
    process.stdout.write('⏳ Waiting for Ollama to start');

    const connected = await waitForOllama();

    if (!connected) {
      console.log('\n❌ Failed to start Ollama');
      console.log('💡 Try running manually: ollama serve');
      process.exit(1);
    }

    console.log('\n✅ Ollama is ready\n');
    await chat();

  } catch (err) {
    if (err.message === 'OLLAMA_NOT_FOUND') {
      console.log('❌ Ollama command not found!');
      console.log('📥 Please install from: https://ollama.com');
    } else {
      console.log('❌ Failed to start Ollama:', err.message);
    }
    process.exit(1);
  }
}

main().catch(console.error);

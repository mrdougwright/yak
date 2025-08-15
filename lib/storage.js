// lib/storage.js - Chat storage and management (File Operations)
import fs from 'fs';
import path from 'path';
import { getConfig, setConfig } from './config.js';

const CHATS_DIR = path.join(process.env.HOME || process.env.USERPROFILE, '.yak', 'chats');

// Ensure chats directory exists
function ensureChatsDir() {
  if (!fs.existsSync(CHATS_DIR)) {
    fs.mkdirSync(CHATS_DIR, { recursive: true });
  }
}

function getChatPath(chatName) {
  return path.join(CHATS_DIR, `${chatName}.jsonl`);
}

export function getCurrentChatName() {
  return getConfig().currentChat || 'default';
}

export function readHistory() {
  const chatName = getCurrentChatName();
  const chatPath = getChatPath(chatName);

  if (!fs.existsSync(chatPath)) return [];

  const content = fs.readFileSync(chatPath, 'utf-8');
  const lines = content.split('\n').filter(Boolean);
  return lines.map(line => JSON.parse(line));
}

export function appendMessage(message) {
  ensureChatsDir();
  const chatName = getCurrentChatName();
  const chatPath = getChatPath(chatName);

  fs.appendFileSync(chatPath, JSON.stringify(message) + '\n');
}

export async function listChats() {
  ensureChatsDir();

  const files = fs.readdirSync(CHATS_DIR);
  const chats = files
    .filter(f => f.endsWith('.jsonl'))
    .map(f => f.replace('.jsonl', ''));

  if (chats.length === 0) {
    console.log('No chats found. Start chatting to create your first one!');
    return;
  }

  const current = getCurrentChatName();

  console.log('Available chats:');
  chats.forEach(chat => {
    const indicator = chat === current ? '👉' : '  ';
    console.log(`${indicator} ${chat}`);
  });
}

export async function createChat(chatName) {
  if (!chatName?.trim()) {
    console.error('Chat name required: yak new <name>');
    return;
  }

  const sanitized = chatName.trim().replace(/[^a-zA-Z0-9-_]/g, '-');
  const chatPath = getChatPath(sanitized);

  if (fs.existsSync(chatPath)) {
    console.log(`Chat "${sanitized}" already exists`);
    return;
  }

  ensureChatsDir();
  fs.writeFileSync(chatPath, '');

  const config = getConfig();
  config.currentChat = sanitized;
  setConfig(config);

  console.log(`Created and switched to: ${sanitized}`);
}

export async function switchChat(chatName) {
  if (!chatName?.trim()) {
    console.error('Chat name required: yak switch <name>');
    return;
  }

  const chatPath = getChatPath(chatName);
  if (!fs.existsSync(chatPath)) {
    console.error(`Chat "${chatName}" not found. Use 'yak list' to see available chats.`);
    return;
  }

  const config = getConfig();
  config.currentChat = chatName;
  setConfig(config);

  console.log(`Switched to: ${chatName}`);
}

export async function deleteChat(chatName) {
  if (!chatName?.trim()) {
    console.error('Chat name required: yak delete <name>');
    return;
  }

  if (chatName === getCurrentChatName()) {
    console.error('Cannot delete current chat. Switch to another chat first.');
    return;
  }

  const chatPath = getChatPath(chatName);
  if (!fs.existsSync(chatPath)) {
    console.error(`Chat "${chatName}" not found.`);
    return;
  }

  fs.unlinkSync(chatPath);
  console.log(`Deleted chat: ${chatName}`);
}

export function resetCurrentChat() {
  const chatName = getCurrentChatName();
  const chatPath = getChatPath(chatName);
  fs.writeFileSync(chatPath, '');
}

// lib/config.js - Configuration management
import fs from 'fs';

const CONFIG_FILE = 'config.json';

const DEFAULT_CONFIG = {
  model: 'llama3:instruct',
  currentChat: 'default'
};

export function getConfig() {
  if (!fs.existsSync(CONFIG_FILE)) {
    setConfig(DEFAULT_CONFIG);
    return DEFAULT_CONFIG;
  }

  const content = fs.readFileSync(CONFIG_FILE, 'utf-8');
  return { ...DEFAULT_CONFIG, ...JSON.parse(content) };
}

export function setConfig(config) {
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
}

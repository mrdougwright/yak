// lib/help.js - Help and usage information for the CLI

export function showHelp() {
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
  console.log('Model Management:');
  console.log('  yak models           - List available models');
  console.log('  yak model <n>     - Switch to model');
  console.log('');
  console.log('Other:');
  console.log('  yak help             - Show this help');
  console.log('');
  console.log('Examples:');
  console.log('  yak new python-help  - Create chat for Python questions');
  console.log('  yak model gemma3:1b  - Switch to faster model');
  console.log('  yak models           - See all downloaded models');
}

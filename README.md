# Yak 🦙

A minimalist local LLM terminal chat interface using [Ollama](https://ollama.com), native streaming, and JSONL memory.

> Yak at your local model. Fully offline. Edit or delete your chat history.

---

## Features

- 🧠 Runs on any Ollama-compatible model (`llama3:instruct`, `mistral`, `phi3`, etc)
- 🧵 Offline, Real-time streaming replies in the terminal
- 📜 Memory stored in lightweight `<my-chatlog>.jsonl` files in `.yak` at root.

---

## Requirements

- Node.js 18+
- Ollama installed and running

---

### Start

```bash
yak start
```

Start chatting
```
🦧> What's a good name for a chat app?
🤖: How about "Yak"? It's short, and yaks are fluffy like llamas!
```

### Usage

```
yak                  # Start chat (assumes Ollama running)
yak start            # Auto-start Ollama and chat
yak list             # List all chat sessions
yak new <n>          # Create new chat session
yak switch <n>       # Switch to chat session
yak help             # Show help
```

### Models

Ensure Ollama server is running.
```bash
ollama list
```
Depending on what models you downloaded, you should see something like:
```bash
NAME               ID              SIZE      MODIFIED
llama3:instruct    365c0bd3c000    4.7 GB    25 hours ago
gemma3:1b          8648f39daa8f    815 MB    59 minutes ago
```

You can change the model in the `config.json` file.

```json
{
  "model": "gemma3:1b"
}
```

### History

Don't like the chat? All messages are logged to chatlog.jsonl

You can remove lines from file, or reset the entire log:
```bash
node chat.js --reset
```

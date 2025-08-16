# Yak 🦙

A minimalist local LLM terminal chat interface using [Ollama](https://ollama.com), native streaming, and JSONL memory.

> Yak at your local model. Fully offline. Edit or delete your chat history(s).

---

## Features

- 🧠 Runs on any Ollama-compatible model (`llama3:instruct`, `mistral`, `phi3`, etc)
- 🧵 Offline, Real-time streaming replies in the terminal
- 📜 Memory stored in lightweight `my-chat-log.jsonl` files on your machine

---

## Requirements

- Node.js 18+
- [Ollama](https://ollama.com) installed and running

---

## Installation
```bash
npm install -g yak-llm
```

## Start

```bash
yak start
```

Start chatting
```
🦧> What's a good name for a chat app?
🤖: How about "Yak"? It's short, and yaks are fluffy like llamas!
```

If you have Ollama downloaded and running, Yak will automatically download a model if none is found.
Yak will also create a new `default` chat session for your first session.

Stop chatting with command or ctrl+c
```
🦧> /bye
```

## Usage

```
yak start            # Start chat
yak help             # Show help
yak models           # List available models
yak model <n>        # Change model
yak list             # List all chat sessions
yak new <n>          # Create new chat session
yak switch <n>       # Switch to chat session
```

## Models

You can see your downloaded Ollama models by running:

```bash
yak models
```

You can change the model with the CLI command

```bash
yak model <model-name>
```
or  in the `config.json` file manually.
```json
// .yak/config.json
{
  "model": "gemma3:1b",
}
```

If you want more models, download them from [Ollama](https://ollama.com/search)! 🦙

## History

Don't like your chat? All messages are logged to `.yak/chats`.

You can remove lines from file, or delete the entire log:
```bash
yak delete <name-of-chat-file>
```

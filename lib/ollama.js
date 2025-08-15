// lib/ollama.js - Ollama API client
const OLLAMA_URL = 'http://localhost:11434';

export async function streamChat(model, messages, onToken) {
  const response = await fetch(`${OLLAMA_URL}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model,
      messages,
      stream: true
    })
  });

  if (!response.ok) {
    throw new Error(`Ollama API error: ${response.status} ${response.statusText}`);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value, { stream: true });
    buffer += chunk;

    const lines = buffer.split('\n');
    buffer = lines.pop(); // Keep incomplete line in buffer

    for (const line of lines) {
      if (line.trim() === '') continue;

      try {
        const data = JSON.parse(line);

        if (data.message?.content) {
          onToken(data.message.content);
        }

        if (data.done) {
          return;
        }
      } catch (err) {
        // Skip malformed JSON lines
        continue;
      }
    }
  }
}

export async function listModels() {
  const response = await fetch(`${OLLAMA_URL}/api/tags`);

  if (!response.ok) {
    throw new Error(`Failed to list models: ${response.status}`);
  }

  const data = await response.json();
  return data.models || [];
}

export async function checkConnection() {
  try {
    await fetch(`${OLLAMA_URL}/api/tags`);
    return true;
  } catch {
    return false;
  }
}

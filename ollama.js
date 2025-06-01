export async function streamChat(model, messages, onToken) {
  const res = await fetch('http://localhost:11434/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model, messages, stream: true })
  })

  if (!res.body || !res.body[Symbol.asyncIterator]) {
    throw new Error('Readable stream iteration not supported in this Node version.')
  }

  let full = ''
  const decoder = new TextDecoder()

  for await (const chunk of res.body) {
    const str = decoder.decode(chunk)
    const lines = str.split('\n').filter(Boolean)

    for (const line of lines) {
      try {
        const json = JSON.parse(line)
        const token = json.message?.content || json.response || ''
        full += token
        onToken(token)
      } catch {}
    }
  }

  return full
}
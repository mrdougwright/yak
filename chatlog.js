import fs from 'fs'

const FILE = 'chatlog.jsonl'

export function readChatHistory(limit = 40) {
  if (!fs.existsSync(FILE)) return []
  const lines = fs.readFileSync(FILE, 'utf-8').split('\n').filter(Boolean)
  const trimmed = lines.slice(-limit)
  return trimmed.map(line => JSON.parse(line))
}

export function appendToLog(message) {
  fs.appendFileSync(FILE, JSON.stringify(message) + '\n')
}

export function truncateLog(maxLines = 40) {
  const lines = fs.readFileSync(FILE, 'utf-8').split('\n').filter(Boolean)
  if (lines.length <= maxLines) return
  const trimmed = lines.slice(-maxLines)
  fs.writeFileSync(FILE, trimmed.join('\n') + '\n')
}

export function resetLog() {
  fs.writeFileSync(FILE, '')
}
import express from 'express'
import { readChatHistory, appendToLog, truncateLog } from './chatlog.js'
import { streamChat } from './ollama.js'

const app = express()
app.use(express.json())

app.post('/ask', async (req, res) => {
  const { prompt } = req.body
  const history = readChatHistory()
  const userMsg = { role: 'user', content: prompt }
  appendToLog(userMsg)
  history.push(userMsg)

  res.setHeader('Content-Type', 'application/jsonl; charset=utf-8')
  res.setHeader('Transfer-Encoding', 'chunked')

  let fullReply = ''
  await streamChat('llama3:instruct', history, token => {
    fullReply += token
    res.write(JSON.stringify({ response: token }) + '\n')
  })

  appendToLog({ role: 'assistant', content: fullReply.trim() })
  truncateLog()
  res.end()
})

app.listen(3000, () => console.log('Server running at http://localhost:3000'))
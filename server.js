import express from "express";
import { readChatHistory, appendToLog } from "./chatlog.js";
import { streamChat } from "./ollama.js";

const app = express();
app.use(express.json());

app.post("/ask", async (req, res) => {
  const { prompt } = req.body;
  const history = readChatHistory();
  const userMsg = { role: "user", content: prompt };
  appendToLog(userMsg);
  history.push(userMsg);

  res.setHeader("Content-Type", "application/jsonl; charset=utf-8");
  res.setHeader("Transfer-Encoding", "chunked");

  let fullReply = "";

  try {
    await streamChat("llama3:instruct", history, (token) => {
      fullReply += token;
      res.write(JSON.stringify({ response: token }) + "\n");
    });
  } catch (err) {
    console.error("❌ Failed to connect to Ollama at http://localhost:11434");
    console.error("🔌 Is `ollama serve` running?");

    res.status(500).write(
      JSON.stringify({
        error: "Ollama is not running. Please start it with: ollama serve",
      }) + "\n",
    );
    return res.end();
  }

  appendToLog({ role: "assistant", content: fullReply.trim() });
  res.end();
});

app.listen(3000, () => console.log("Server running at http://localhost:3000"));

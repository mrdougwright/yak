import express from "express";
import fetch from "node-fetch";
import cors from "cors";
import fs from "fs";

let chatHistory = [];
// read from chat memory file if exists
if (fs.existsSync("chatlog.jsonl")) {
  const lines = fs
    .readFileSync("chatlog.jsonl", "utf-8")
    .split("\n")
    .filter(Boolean);
  chatHistory = lines.map((line) => JSON.parse(line));
}

const app = express();
app.use(cors());
app.use(express.json());

function appendToLog(message) {
  fs.appendFileSync("chatlog.jsonl", JSON.stringify(message) + "\n");
}

app.post("/ask", async (req, res) => {
  const { prompt } = req.body;

  // Add user message
  chatHistory.push({ role: "user", content: prompt });
  appendToLog({ role: "user", content: prompt });

  const response = await fetch("http://localhost:11434/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "llama3:instruct",
      messages: chatHistory,
    }),
  });

  let reply = "";
  for await (const chunk of response.body) {
    const lines = chunk.toString().split("\n").filter(Boolean);
    for (const line of lines) {
      const json = JSON.parse(line);
      reply += json.message?.content || "";
    }
  }

  // Add assistant message to history
  chatHistory.push({ role: "assistant", content: reply.trim() });
  appendToLog({ role: "assistant", content: reply.trim() });

  res.json({ reply: reply.trim() });
});

app.listen(3000, () => {
  console.log("💬 Chat server listening at http://localhost:3000");
});

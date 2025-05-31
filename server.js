import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

app.post("/ask", async (req, res) => {
  const { prompt } = req.body;

  const ollamaRes = await fetch("http://localhost:11434/api/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model: "llama3.2", prompt }),
  });

  let output = "";
  for await (const chunk of ollamaRes.body) {
    const lines = chunk.toString().split("\n").filter(Boolean);
    for (const line of lines) {
      const json = JSON.parse(line);
      output += json.response || "";
    }
  }

  res.json({ reply: output });
});

app.listen(3000, () => {
  console.log("💬 Chat server listening at http://localhost:3000");
});

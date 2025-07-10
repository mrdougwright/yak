import readline from "readline";
import { resetLog } from "./chatlog.js";

if (process.argv.includes("--reset")) {
  resetLog();
  console.log("✨ New conversation started.\n");
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function ask(question) {
  return new Promise((resolve) => rl.question(question, resolve));
}

async function main() {
  while (true) {
    const prompt = await ask("🦧> ");

    try {
      const res = await fetch("http://localhost:3000/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      if (!res.ok) {
        console.error(`❌ Server error: ${res.status} ${res.statusText}`);
        continue;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      process.stdout.write("🤖: ");

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        buffer += chunk;

        const lines = buffer.split("\n");
        buffer = lines.pop();

        for (const line of lines) {
          try {
            const json = JSON.parse(line);
            const token = json.message?.content || json.response || "";
            process.stdout.write(token);
          } catch {}
        }
      }

      console.log("\n");
    } catch (err) {
      console.error("\n🚫 Cannot connect to server at http://localhost:3000");
      console.error(
        "💡 Is your Node server running? Start it with: node server.js\n",
      );
      process.exit(1);
    }
  }
}

main();

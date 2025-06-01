import readline from "readline";
import fetch from "node-fetch";

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

      const data = await res.json();
      console.log("🤖:", data.reply);
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

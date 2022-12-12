const { spawn } = require("node:child_process");
const child = spawn("python3", ["-m", "revChatGPT"], { detached: true });

const chatId = process.argv[2];

child.stdout.pipe(process.stdout);

child.stderr.on("data", (data) => {
  console.error(`stderr: ${data}`);
});

child.on("close", (code) => {
  console.log(`child process exited with code ${code}`);
});

child.unref();

child.stdout.on("data", (data) => {
  const string = data.toString();

  if (string.indexOf("ChatGPT - A command-line interface to OpenAI") > -1) {
    return;
  }

  const text = string.replace("Chatbot:", "").replace("You:", "");

  if (text) {
    process.send({ chatId, text });
  }
});

process.on("message", function (message) {
  child.stdin.write(`${message}\n\n`);
});

child.stdin.write(`${process.argv[3]}\n\n`);

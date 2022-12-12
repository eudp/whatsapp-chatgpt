const qrcode = require("qrcode-terminal");
const { Client } = require("whatsapp-web.js");
const { fork } = require("node:child_process");

const client = new Client();

client.initialize();

client.on("qr", (qr) => {
  qrcode.generate(qr, { small: true });
});

client.on("ready", () => {
  console.log("Client is ready!");
});

let chats = [];
client.on("message", (msg) => {
  const indexChat = chats.findIndex((chat) => chat.id === msg.from);
  if (indexChat > -1) {
    chats[indexChat].msg = msg;
    chats[indexChat].child.send(msg.body);
    return;
  }

  const child = fork("chatgpt.js", [msg.from, msg.body]);

  child.on("message", function (message) {
    const indexChat = chats.findIndex((chat) => chat.id === message.chatId);

    chats[indexChat].msg.reply(message.text);
  });

  chats.push({ id: msg.from, child, msg });
});

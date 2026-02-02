const axios = require("axios");

const API = "https://api.cyber-ninjas.top";

module.exports = {
  config: {
    name: "baby",
    aliases: ["bby", "bot"],
    version: "3.1.0",
    author: "HAMIM",
    role: 0,
    category: "chat",
    cooldown: 2,
    guide: "-baby <text>\n-baby teach q - a"
  },

  // ───────── MAIN COMMAND ─────────
  onStart: async function ({ api, event, args }) {
    const { threadID, messageID, senderID } = event;
    const text = args.join(" ").trim();

    if (!text) {
      return api.sendMessage("বলো জানু 😚", threadID, messageID);
    }

    // 🔧 Teach
    if (args[0] === "teach") {
      const data = text.replace("teach ", "").split(" - ");
      if (data.length < 2)
        return api.sendMessage(
          "Format:\n-baby teach question - answer",
          threadID,
          messageID
        );

      try {
        await axios.get(
          `${API}/teach?ask=${encodeURIComponent(data[0])}&ans=${encodeURIComponent(data[1])}`
        );
        return api.sendMessage("🧠 Baby শিখে ফেলছে 😘", threadID, messageID);
      } catch {
        return api.sendMessage("❌ Teach failed", threadID, messageID);
      }
    }

    // 🤖 Normal chat
    try {
      const res = await axios.get(
        `${API}/simsimi?text=${encodeURIComponent(text)}`
      );

      const reply = res.data.response || "হুম জান 😚";

      api.sendMessage(reply, threadID, (err, info) => {
        if (!err) {
          global.GoatBot.onReply.set(info.messageID, {
            commandName: "baby",
            author: senderID
          });
        }
      }, messageID);

    } catch (e) {
      api.sendMessage("Baby এখন busy 🥺", threadID, messageID);
    }
  },

  // ───────── REPLY CHAT ─────────
  onReply: async function ({ api, event }) {
    const { threadID, senderID, body } = event;
    if (!body) return;

    try {
      const res = await axios.get(
        `${API}/simsimi?text=${encodeURIComponent(body)}`
      );

      api.sendMessage(
        res.data.response || "হুম জান 😚",
        threadID,
        (err, info) => {
          if (!err) {
            global.GoatBot.onReply.set(info.messageID, {
              commandName: "baby",
              author: senderID
            });
          }
        }
      );
    } catch {
      api.sendMessage("😵 Baby confuse", threadID);
    }
  },

  // ───────── AUTO TRIGGER ─────────
  onChat: async function ({ api, event }) {
    const text = event.body?.toLowerCase().trim();
    if (!text) return;

    const triggers = ["baby", "bby", "বেবি", "oi baby"];
    if (!triggers.includes(text)) return;

    const replies = [
      "কি হয়েছে জান? 😚",
      "হ্যাঁ বলো 💕",
      "আমি শুনছি 🥰",
      "এতো ডাকছ কেন 🙈",
      "Baby এখানে 😌"
    ];

    api.sendMessage(
      replies[Math.floor(Math.random() * replies.length)],
      event.threadID
    );
  }
};

const axios = require("axios");

const API = "https://api.cyber-ninjas.top";

const typing = async (api, threadID, time = 2500) => {
  try {
    if (api.sendTypingIndicatorV2) {
      await api.sendTypingIndicatorV2(true, threadID);
      await new Promise(r => setTimeout(r, time));
      await api.sendTypingIndicatorV2(false, threadID);
    }
  } catch {}
};

module.exports = {
  config: {
    name: "baby",
    aliases: ["bby", "bot"],
    version: "3.0.0",
    author: "HAMIM x GPT",
    role: 0,
    category: "chat",
    cooldown: 2,
    guide: `
baby <text>
baby teach question - answer
baby on / off
`
  },

  onStart: async function ({ api, event, args, message, usersData }) {
    const { threadID, senderID } = event;
    const text = args.join(" ").trim();
    const name = await usersData.getName(senderID);

    if (!text) {
      await typing(api, threadID);
      return message.reply("বলো জানু 😚");
    }

    // 🔧 Teach mode
    if (args[0] === "teach") {
      const data = text.replace("teach ", "").split(" - ");
      if (data.length < 2)
        return message.reply("Format: baby teach question - answer");

      await axios.get(
        `${API}/teach?ask=${encodeURIComponent(data[0])}&ans=${encodeURIComponent(data[1])}&senderName=${name}`
      );

      return message.reply("🧠 Baby শিখে ফেলছে 😚");
    }

    // 🤖 Normal Chat
    await typing(api, threadID);

    try {
      const res = await axios.get(
        `${API}/simsimi?text=${encodeURIComponent(text)}&senderName=${name}`
      );

      const reply = res.data.response;
      if (!reply) {
        await axios.get(
          `${API}/teach?ask=${encodeURIComponent(text)}&ans=${encodeURIComponent("হুম জান 😚")}&senderName=${name}`
        );
        return message.reply("হুম জান 😚");
      }

      message.reply(reply, (err, info) => {
        if (!err) {
          global.GoatBot.onReply.set(info.messageID, {
            commandName: "baby",
            author: senderID
          });
        }
      });

    } catch (e) {
      message.reply("Baby এখন ঘুমাচ্ছে 💤");
    }
  },

  onReply: async function ({ api, event, message, usersData }) {
    const { threadID, senderID, body } = event;
    if (!body) return;

    const name = await usersData.getName(senderID);
    await typing(api, threadID);

    try {
      const res = await axios.get(
        `${API}/simsimi?text=${encodeURIComponent(body)}&senderName=${name}`
      );

      message.reply(res.data.response || "হুম জান 😚", (err, info) => {
        if (!err) {
          global.GoatBot.onReply.set(info.messageID, {
            commandName: "baby",
            author: senderID
          });
        }
      });
    } catch {
      message.reply("Baby confuse হয়ে গেছে 🥺");
    }
  },

  onChat: async function ({ api, event, message, usersData }) {
    const text = event.body?.toLowerCase();
    if (!text) return;

    const triggers = ["baby", "bby", "বেবি", "jan", "oi baby"];
    if (!triggers.includes(text)) return;

    await typing(api, event.threadID);

    const replies = [
      "কি হয়েছে জান? 😚",
      "হ্যাঁ বলো 💕",
      "আমি শুনছি 🥰",
      "এতো ডাকছ কেন 🙈",
      "Baby এখানে 😌"
    ];

    message.reply(replies[Math.floor(Math.random() * replies.length)]);
  }
};

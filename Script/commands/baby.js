const axios = require("axios");
const simsim = "https://api.cyber-ninjas.top";

module.exports.config = {
  name: "baby",
  version: "2.0.1",
  hasPermssion: 0,
  credits: "rX (mirai fixed)",
  description: "Cute AI Baby Chatbot (auto teach + typing)",
  commandCategory: "box chat",
  usages: "baby [text] | baby teach Q - A | baby list",
  cooldowns: 0
};

// ───────────── TYPING ─────────────
async function sendTyping(api, threadID) {
  if (typeof api.sendTypingIndicatorV2 === "function") {
    try {
      await api.sendTypingIndicatorV2(true, threadID);
      await new Promise(r => setTimeout(r, 2500));
      await api.sendTypingIndicatorV2(false, threadID);
    } catch {}
  }
}

// ───────────── MAIN COMMAND ─────────────
module.exports.run = async function ({ api, event, args, usersData }) {
  const { threadID, messageID, senderID } = event;
  const senderName = await usersData.getName(senderID);
  const query = args.join(" ").trim().toLowerCase();

  try {
    if (!query) {
      await sendTyping(api, threadID);
      const hi = ["Bolo baby 💖", "Hea baby 😚"];
      return api.sendMessage(
        hi[Math.floor(Math.random() * hi.length)],
        threadID,
        (e, info) => {
          if (!e) global.GoatBot.onReply.set(info.messageID, { commandName: "baby", author: senderID });
        },
        messageID
      );
    }

    // ─── TEACH ───
    if (args[0] === "teach") {
      const parts = query.replace("teach ", "").split(" - ");
      if (parts.length < 2)
        return api.sendMessage("Use: baby teach Question - Answer", threadID, messageID);

      const [ask, ans] = parts;
      const res = await axios.get(
        `${simsim}/teach?ask=${encodeURIComponent(ask)}&ans=${encodeURIComponent(ans)}&senderName=${encodeURIComponent(senderName)}`
      );
      return api.sendMessage(res.data.message || "Learned ✅", threadID, messageID);
    }

    // ─── LIST ───
    if (args[0] === "list") {
      const res = await axios.get(`${simsim}/list`);
      return api.sendMessage(
        `♾ Questions: ${res.data.totalQuestions}\n★ Replies: ${res.data.totalReplies}\n👑 Author: ${res.data.author}`,
        threadID,
        messageID
      );
    }

    // ─── NORMAL CHAT ───
    await sendTyping(api, threadID);
    const res = await axios.get(
      `${simsim}/simsimi?text=${encodeURIComponent(query)}&senderName=${encodeURIComponent(senderName)}`
    );

    const replies = Array.isArray(res.data.response)
      ? res.data.response
      : [res.data.response];

    if (!replies || !replies.length) {
      await axios.get(
        `${simsim}/teach?ask=${encodeURIComponent(query)}&ans=${encodeURIComponent("hmm baby 😚")}&senderName=${encodeURIComponent(senderName)}`
      );
      return api.sendMessage("hmm baby 😚", threadID, messageID);
    }

    for (const r of replies) {
      await new Promise(resolve => {
        api.sendMessage(r, threadID, (e, info) => {
          if (!e) global.GoatBot.onReply.set(info.messageID, { commandName: "baby", author: senderID });
          resolve();
        });
      });
    }

  } catch (err) {
    api.sendMessage("❌ Baby error!", threadID, messageID);
    console.error("BABY RUN ERROR:", err.message);
  }
};

// ───────────── REPLY HANDLE ─────────────
module.exports.onReply = async function ({ api, event, usersData }) {
  const { threadID, senderID, body } = event;
  if (!body) return;

  const senderName = await usersData.getName(senderID);
  await sendTyping(api, threadID);

  try {
    const res = await axios.get(
      `${simsim}/simsimi?text=${encodeURIComponent(body)}&senderName=${encodeURIComponent(senderName)}`
    );

    const replies = Array.isArray(res.data.response)
      ? res.data.response
      : [res.data.response];

    for (const r of replies) {
      api.sendMessage(r, threadID, (e, info) => {
        if (!e) global.GoatBot.onReply.set(info.messageID, { commandName: "baby", author: senderID });
      });
    }
  } catch (e) {
    console.error("BABY REPLY ERROR:", e.message);
  }
};

// ───────────── AUTO CHAT ─────────────
module.exports.onChat = async function ({ api, event, usersData }) {
  const raw = event.body?.toLowerCase().trim();
  if (!raw) return;

  const triggers = ["baby", "bot", "bby", "oi", "oii", "jan", "বেবি", "বট"];
  if (!triggers.includes(raw)) return;

  const replies = [
    "Assalamu Alaikum 💖",
    "Bolo jan 😚",
    "Hum..? 👉👈",
    "Besi dako na, lojja lage 🙈",
    "Bolo ki chai 😏"
  ];

  await sendTyping(api, event.threadID);
  api.sendMessage(
    replies[Math.floor(Math.random() * replies.length)],
    event.threadID
  );
};

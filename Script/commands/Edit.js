const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports.config = {
  name: "edit",
  version: "2.2.0",
  hasPermssion: 0,
  credits: "rX FIX",
  description: "AI Image Edit (Stable)",
  commandCategory: "AI",
  usages: "[reply image] <prompt>",
  cooldowns: 15
};

module.exports.run = async function ({ api, event, args }) {
  const prompt = args.join(" ");

  if (!prompt) {
    return api.sendMessage(
      "⚠️ Give a prompt first!",
      event.threadID,
      event.messageID
    );
  }

  const reply = event.messageReply;
  if (!reply || !reply.attachments || !reply.attachments[0]) {
    return api.sendMessage(
      "⚠️ Please reply to an image.",
      event.threadID,
      event.messageID
    );
  }

  const imgUrl = reply.attachments[0].url;

  api.setMessageReaction("⏳", event.messageID, () => {}, true);

  try {
    const apiUrl = `https://edit-api.vercel.app/nanobanana?prompt=${encodeURIComponent(prompt)}&imageUrl=${encodeURIComponent(imgUrl)}`;

    const res = await axios.get(apiUrl);

    console.log("API RESPONSE:", res.data); // 🔥 debug

    // ✅ FIXED FIELD CHECK (most important)
    let imageURL =
      res.data?.result?.[0] ||
      res.data?.data?.[0] ||
      res.data?.image ||
      res.data?.url ||
      res.data?.output ||
      null;

    if (!imageURL) {
      return api.sendMessage(
        "❌ API error: No image field found.\nCheck console log.",
        event.threadID,
        event.messageID
      );
    }

    const img = await axios.get(imageURL, {
      responseType: "arraybuffer"
    });

    const filePath = path.join(__dirname, "cache", `edit_${Date.now()}.jpg`);
    await fs.ensureDir(path.join(__dirname, "cache"));
    await fs.writeFile(filePath, img.data);

    api.setMessageReaction("✅", event.messageID, () => {}, true);

    api.sendMessage(
      {
        body: "✨ Done Edit",
        attachment: fs.createReadStream(filePath)
      },
      event.threadID,
      () => fs.unlinkSync(filePath),
      event.messageID
    );

  } catch (err) {
    console.log("ERROR:", err.response?.data || err.message);

    api.setMessageReaction("❌", event.messageID, () => {}, true);

    api.sendMessage(
      "❌ Failed!\nAPI not responding or wrong field.",
      event.threadID,
      event.messageID
    );
  }
};

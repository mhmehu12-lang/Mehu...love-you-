const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports.config = {
  name: "edit",
  version: "2.0.0",
  hasPermssion: 0,
  credits: "rX x Premium Edit",
  description: "AI Image Editor (NanoBanana API)",
  commandCategory: "AI",
  usages: "[reply image] <prompt>",
  cooldowns: 20
};

module.exports.run = async function ({ api, event, args }) {
  const prompt = args.join(" ");

  if (!prompt) {
    return api.sendMessage(
      "⚠️ Please provide a prompt.\nExample: reply image + edit sky blue",
      event.threadID,
      event.messageID
    );
  }

  if (
    !event.messageReply ||
    !event.messageReply.attachments ||
    !event.messageReply.attachments[0] ||
    event.messageReply.attachments[0].type !== "photo"
  ) {
    return api.sendMessage(
      "⚠️ Reply to a valid image only.",
      event.threadID,
      event.messageID
    );
  }

  api.setMessageReaction("⏳", event.messageID, () => {}, true);

  try {
    const imgUrl = event.messageReply.attachments[0].url;

    const apiUrl = `https://edit-api.vercel.app/nanobanana?prompt=${encodeURIComponent(
      prompt
    )}&imageUrl=${encodeURIComponent(imgUrl)}`;

    const res = await axios.get(apiUrl, { timeout: 30000 });

    if (!res.data || !res.data.success || !res.data.result?.length) {
      throw new Error("Invalid API response");
    }

    const finalImageURL = res.data.result[0];

    const imageRes = await axios.get(finalImageURL, {
      responseType: "arraybuffer",
      timeout: 30000
    });

    const cacheDir = path.join(__dirname, "cache");
    if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir);

    const fileName = `edit_${Date.now()}.png`;
    const filePath = path.join(cacheDir, fileName);

    fs.writeFileSync(filePath, Buffer.from(imageRes.data));

    api.setMessageReaction("✅", event.messageID, () => {}, true);

    api.sendMessage(
      {
        body:
          "✨ 𝗘𝗱𝗶𝘁 𝗖𝗼𝗺𝗽𝗹𝗲𝘁𝗲𝗱\n\n" +
          `📝 Prompt: ${prompt}\n` +
          "⚡ Powered by AI",
        attachment: fs.createReadStream(filePath)
      },
      event.threadID,
      () => {
        fs.unlink(filePath, () => {});
      }
    );
  } catch (err) {
    console.error("EDIT ERROR:", err.message);

    api.setMessageReaction("❌", event.messageID, () => {}, true);

    api.sendMessage(
      "❌ Failed to edit image.\nTry again later or change prompt.",
      event.threadID,
      event.messageID
    );
  }
};

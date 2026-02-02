const axios = require("axios");
const fs = require("fs");
const path = require("path");

// Renz API JSON
const NOOBCORE_JSON = "https://raw.githubusercontent.com/noobcore404/NC-STORE/main/NCApiUrl.json";

async function getRenzApi() {
  const res = await axios.get(NOOBCORE_JSON, { timeout: 10000 });
  if (!res.data || !res.data.renz) {
    throw new Error("Renz API URL not found");
  }
  return res.data.renz;
}

module.exports.config = {
  name: "edit",
  aliases: ["nanobanana", "gptimage"],
  version: "1.0.0",
  hasPermssion: 0,
  credits: "rX x AKASH",
  description: "Generate or edit images using text prompts",
  commandCategory: "image",
  usages: "edit <prompt> | reply image + prompt",
  cooldowns: 5
};

module.exports.run = async function ({ api, event, args }) {
  const { threadID, messageID, messageReply } = event;
  const prompt = args.join(" ").trim();

  if (!prompt) {
    return api.sendMessage(
      "❌ Prompt দাও\n\nউদাহরণ:\nedit cyberpunk city\n(edit command দিয়ে ছবিতে reply করেও ব্যবহার করা যাবে)",
      threadID,
      messageID
    );
  }

  const loading = await api.sendMessage("⏳ Image processing...", threadID);

  const cacheDir = path.join(__dirname, "cache");
  const imgPath = path.join(cacheDir, `${Date.now()}_edit.png`);

  try {
    const BASE_URL = await getRenzApi();

    let apiURL = `${BASE_URL}/api/gptimage?prompt=${encodeURIComponent(prompt)}`;

    // Reply image থাকলে
    if (messageReply && messageReply.attachments && messageReply.attachments[0]?.type === "photo") {
      const img = messageReply.attachments[0];
      apiURL += `&ref=${encodeURIComponent(img.url)}`;
      apiURL += `&width=${img.width || 512}&height=${img.height || 512}`;
    } else {
      apiURL += `&width=512&height=512`;
    }

    const res = await axios.get(apiURL, {
      responseType: "arraybuffer",
      timeout: 180000
    });

    fs.mkdirSync(cacheDir, { recursive: true });
    fs.writeFileSync(imgPath, res.data);

    await api.unsendMessage(loading.messageID);

    api.sendMessage(
      {
        body: `✅ Image ready\n📝 Prompt: ${prompt}`,
        attachment: fs.createReadStream(imgPath)
      },
      threadID,
      () => fs.unlinkSync(imgPath)
    );

  } catch (e) {
    console.error("EDIT CMD ERROR:", e.message);
    await api.unsendMessage(loading.messageID);
    api.sendMessage("❌ Image generate/edit করতে সমস্যা হয়েছে। পরে আবার চেষ্টা করো।", threadID);
  }
};

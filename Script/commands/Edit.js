const axios = require("axios");
const fs = require("fs");
const path = require("path");

const API_JSON = "https://raw.githubusercontent.com/noobcore404/NC-STORE/main/NCApiUrl.json";

let CACHED_API = null;

// API cache (bar bar fetch করবে না)
async function getApi() {
  if (CACHED_API) return CACHED_API;
  const res = await axios.get(API_JSON, { timeout: 5000 });
  if (!res.data?.renz) throw new Error("API not found");
  CACHED_API = res.data.renz;
  return CACHED_API;
}

module.exports.config = {
  name: "edit",
  aliases: ["nanobanana", "gptimage"],
  version: "1.1.0",
  hasPermssion: 0,
  credits: "rX x AKASH (optimized)",
  description: "Ultra fast image generate/edit",
  commandCategory: "image",
  usages: "edit <prompt> | reply image",
  cooldowns: 3
};

module.exports.run = async ({ api, event, args }) => {
  const { threadID, messageID, messageReply } = event;
  const prompt = args.join(" ");

  if (!prompt) {
    return api.sendMessage("❌ Prompt দাও", threadID, messageID);
  }

  const waitMsg = await api.sendMessage("⚡ Processing...", threadID);

  const cachePath = path.join(__dirname, "cache");
  const imgFile = path.join(cachePath, `${Date.now()}.png`);

  try {
    const BASE = await getApi();

    let url = `${BASE}/api/gptimage?prompt=${encodeURIComponent(prompt)}&width=384&height=384`;

    // reply image থাকলে
    if (messageReply?.attachments?.[0]?.type === "photo") {
      url += `&ref=${encodeURIComponent(messageReply.attachments[0].url)}`;
    }

    const res = await axios.get(url, {
      responseType: "arraybuffer",
      timeout: 12000 // ⚡ HARD LIMIT
    });

    fs.mkdirSync(cachePath, { recursive: true });
    fs.writeFileSync(imgFile, res.data);

    await api.unsendMessage(waitMsg.messageID);

    api.sendMessage(
      {
        body: "✅ Done (Fast Mode)",
        attachment: fs.createReadStream(imgFile)
      },
      threadID,
      () => fs.unlinkSync(imgFile)
    );

  } catch (err) {
    console.log("FAST EDIT ERROR:", err.message);
    await api.unsendMessage(waitMsg.messageID);
    api.sendMessage("❌ API slow / busy. আবার try করো।", threadID);
  }
};

const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

// API URL fetch korar function
const baseApiUrl = async () => {
  const base = await axios.get(
    `https://raw.githubusercontent.com/rummmmna21/rx-api/main/baseApiUrl.json`
  );
  return base.data.api;
};

module.exports.config = {
  name: "song",
  version: "2.3.0",
  hasPermssion: 0,
  credits: "𝐫𝐗 / Modified for Mirai",
  description: "YouTube theke mp3 download korar command",
  commandCategory: "media",
  usages: "[ganer nam ba YouTube link]",
  cooldowns: 5,
  dependencies: {
    "axios": "",
    "fs-extra": ""
  }
};

module.exports.run = async ({ api, args, event }) => {
  const { threadID, messageID } = event;
  const checkurl = /^(?:https?:\/\/)?(?:m\.|www\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))((\w|-){11})(?:\S+)?$/;

  if (!args[0]) return api.sendMessage("🎵 Please provide a song name or YouTube link.", threadID, messageID);

  const searchingMsg = await api.sendMessage("> 🎀\n 𝐒𝐞𝐚𝐫𝐜𝐡𝐢𝐧𝐠 𝐩𝐥𝐞𝐚𝐬𝐞 𝐰𝐚𝐢𝐭...", threadID);

  try {
    let videoID;
    const baseUrl = await baseApiUrl();
    const isUrl = checkurl.test(args[0]);
    let title, downloadLink, quality, channelName = "Unknown";

    // URL check logic
    if (isUrl) {
      const match = args[0].match(checkurl);
      videoID = match ? match[1] : null;
    } else {
      let keyWord = args.join(" ").replace("?feature=share", "");
      const searchRes = await axios.get(`${baseUrl}/ytFullSearch?songName=${encodeURIComponent(keyWord)}`);
      
      if (!searchRes.data || searchRes.data.length === 0) {
        api.unsendMessage(searchingMsg.messageID);
        return api.sendMessage("❌ No results found.", threadID, messageID);
      }
      videoID = searchRes.data[0].id;
      channelName = searchRes.data[0].channel.name;
    }

    // Download link fetch kora
    const dlRes = await axios.get(`${baseUrl}/ytDl3?link=${videoID}&format=mp3`);
    title = dlRes.data.title;
    downloadLink = dlRes.data.downloadLink;
    quality = dlRes.data.quality;

    // Cache folder create kora
    const cacheDir = path.join(__dirname, "cache");
    if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });
    
    const cachePath = path.join(cacheDir, `music_${Date.now()}.mp3`);

    // Audio file download kora
    const audioRes = await axios.get(downloadLink, { responseType: "arraybuffer" });
    fs.writeFileSync(cachePath, Buffer.from(audioRes.data));

    // Search message remove kora
    api.unsendMessage(searchingMsg.messageID);

    // Final message and file send
    return api.sendMessage({
      body: `🎧 𝐓𝐢𝐭𝐥𝐞: ${title}\n📺 𝐂𝐡𝐚𝐧𝐧𝐞𝐥: ${channelName}\n🎶 𝐐𝐮𝐚𝐥𝐢𝐭𝐲: ${quality}`,
      attachment: fs.createReadStream(cachePath)
    }, threadID, () => {
      // Send hoye gele cache file delete kora
      if (fs.existsSync(cachePath)) fs.unlinkSync(cachePath);
    }, messageID);

  } catch (err) {
    console.error(err);
    if (searchingMsg.messageID) api.unsendMessage(searchingMsg.messageID);
    return api.sendMessage("⚠️ API error or file too large for Messenger (Limit 25MB).", threadID, messageID);
  }
};

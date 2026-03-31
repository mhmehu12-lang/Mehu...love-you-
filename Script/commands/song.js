const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports.config = {
  name: "song",
  version: "2.5.0",
  hasPermssion: 0,
  credits: "𝐫𝐗 / Gemini",
  description: "Download audio from YouTube",
  commandCategory: "media",
  usages: "[song name or link]",
  cooldowns: 5,
  dependencies: {
    "axios": "",
    "fs-extra": ""
  }
};

module.exports.run = async ({ api, args, event }) => {
  const { threadID, messageID } = event;
  if (!args[0]) return api.sendMessage("🎵 Please provide a song name or YouTube link.", threadID, messageID);

  const searchingMsg = await api.sendMessage("> 🎀\n 𝐒𝐞𝐚𝐫𝐜𝐡𝐢𝐧𝐠 𝐩𝐥𝐞𝐚𝐬𝐞 𝐰𝐚𝐢𝐭...", threadID);

  try {
    const keyWord = args.join(" ");
    // Alternative fast API
    const res = await axios.get(`https://api.diptoit.com/yt/s?query=${encodeURIComponent(keyWord)}`);
    
    if (!res.data || !res.data.results || res.data.results.length === 0) {
      api.unsendMessage(searchingMsg.messageID);
      return api.sendMessage("❌ No results found.", threadID, messageID);
    }

    const videoData = res.data.results[0];
    const videoID = videoData.id;
    const title = videoData.title;

    // Download link fetch
    const dlRes = await axios.get(`https://api.diptoit.com/yt/audio?id=${videoID}`);
    const downloadLink = dlRes.data.download_url;

    const cachePath = path.join(__dirname, "cache", `music_${Date.now()}.mp3`);
    if (!fs.existsSync(path.join(__dirname, "cache"))) fs.mkdirSync(path.join(__dirname, "cache"));

    const audioRes = await axios.get(downloadLink, { responseType: "arraybuffer" });
    
    // Check file size (Messenger limit 25MB)
    if (audioRes.data.byteLength > 26214400) {
        api.unsendMessage(searchingMsg.messageID);
        return api.sendMessage("⚠️ File is too large (>25MB). Messenger cannot send this.", threadID, messageID);
    }

    fs.writeFileSync(cachePath, Buffer.from(audioRes.data));
    api.unsendMessage(searchingMsg.messageID);

    await api.sendMessage({
      body: `🎧 𝐓𝐢𝐭𝐥𝐞: ${title}\n✨ 𝐒𝐭𝐚𝐭𝐮𝐬: 𝐃𝐨𝐧𝐞`,
      attachment: fs.createReadStream(cachePath)
    }, threadID, () => {
      if (fs.existsSync(cachePath)) fs.unlinkSync(cachePath);
    }, messageID);

  } catch (err) {
    console.error(err);
    if (searchingMsg.messageID) api.unsendMessage(searchingMsg.messageID);
    return api.sendMessage("⚠️ Server error or song not found. Please try again later.", threadID, messageID);
  }
};

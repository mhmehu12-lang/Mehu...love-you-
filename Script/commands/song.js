const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

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
  credits: "𝐫𝐗",
  description: "Download audio from YouTube",
  commandCategory: "media",
  usages: "[song name or YouTube link]",
  cooldowns: 5,
  dependencies: {
    "axios": "",
    "fs-extra": ""
  }
};

module.exports.run = async ({ api, args, event }) => {
  const { threadID, messageID } = event;
  const checkurl = /^(?:https?:\/\/)?(?:m\.|www\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))((\w|-){11})(?:\S+)?$/;

  if (!args[0])
    return api.sendMessage("🎵 Please provide a song name or YouTube link.", threadID, messageID);

  const searchingMsg = await api.sendMessage("> 🎀\n 𝐒𝐞𝐚𝐫𝐜𝐡𝐢𝐧𝐠 𝐩𝐥𝐞𝐚𝐬𝐞 𝐰𝐚𝐢𝐭...", threadID);
  
  try {
    let videoID;
    const baseUrl = await baseApiUrl();
    const isUrl = checkurl.test(args[0]);

    let title, downloadLink, quality, channelName = "Unknown";

    if (isUrl) {
      const match = args[0].match(checkurl);
      videoID = match ? match[1] : null;
    } else {
      let keyWord = args.join(" ").replace("?feature=share", "");
      const searchRes = await axios.get(`${baseUrl}/ytFullSearch?songName=${encodeURIComponent(keyWord)}`);
      if (!searchRes.data || searchRes.data.length === 0) {
        return api.sendMessage("❌ No results found.", threadID, messageID);
      }
      videoID = searchRes.data[0].id;
      channelName = searchRes.data[0].channel.name;
    }

    // Fetch download link
    const dlRes = await axios.get(`${baseUrl}/ytDl3?link=${videoID}&format=mp3`);
    title = dlRes.data.title;
    downloadLink = dlRes.data.downloadLink;
    quality = dlRes.data.quality;

    const cachePath = path.join(__dirname, "cache", `music_${Date.now()}.mp3`);
    if (!fs.existsSync(path.join(__dirname, "cache"))) fs.mkdirSync(path.join(__dirname, "cache"));

    // Download file to cache
    const audioRes = await axios.get(downloadLink, { responseType: "arraybuffer" });
    fs.writeFileSync(cachePath, Buffer.from(audioRes.data));

    // Unsend searching message
    api.unsendMessage(searchingMsg.messageID);

    await api.sendMessage({
      body: `🎧 Title: ${title}\n📺 Channel: ${channelName}\n🎶 Quality: ${quality}`,
      attachment: fs.createReadStream(cachePath)
    }, threadID, () => {
      if (fs.existsSync(cachePath)) fs.unlinkSync(cachePath);
    }, messageID);

  } catch (err) {
    console.error(err);
    api.unsendMessage(searchingMsg.messageID);
    return api.sendMessage("⚠️ API error or file too large for Messenger.", threadID, messageID);
  }
};

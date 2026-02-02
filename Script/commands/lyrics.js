const axios = require('axios');

module.exports.config = {
  name: "lyrics",
  version: "6.0.0",
  hasPermssion: 0,
  credits: "Md Hamim",
  description: "Fixed Undefined Error - Lyrics Finder",
  commandCategory: "utility",
  usages: "[song name]",
  cooldowns: 5
};

module.exports.run = async ({ api, event, args }) => {
  const songName = args.join(" ");
  if (!songName) return api.sendMessage("❌ Hamim, gaaner nam likhun!", event.threadID, event.messageID);

  api.sendMessage(`🔍 Searching for "${songName}"...`, event.threadID, event.messageID);

  try {
    // Highly Stable API (Popcat) - Fixed Mapping
    const res = await axios.get(`https://api.popcat.xyz/lyrics?song=${encodeURIComponent(songName)}`);
    
    // Data check korchi jate undefined na hoy
    const title = res.data.title || "Unknown Title";
    const artist = res.data.artist || "Unknown Artist";
    const lyrics = res.data.lyrics || "No lyrics found in database.";

    if (res.data.error) {
       return api.sendMessage("❌ Hamim, ei ganer lyrics pawa jayni.", event.threadID, event.messageID);
    }

    const message = `🎵 Title: ${title}\n🎤 Artist: ${artist}\n\n━━━━━━━━━━━━━━\n${lyrics}\n━━━━━━━━━━━━━━\n✍️ Credit: Md Hamim`;
    
    return api.sendMessage(message, event.threadID, event.messageID);

  } catch (error) {
    console.error(error);
    return api.sendMessage("⚠️ API Server response korche na. Ektu por abar chesta korun.", event.threadID, event.messageID);
  }
};

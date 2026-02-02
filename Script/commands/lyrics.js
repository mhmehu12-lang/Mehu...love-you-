const axios = require('axios');

module.exports.config = {
  name: "lyrics",
  version: "1.0.0",
  hasPermssion: 0,
  credits: "Md Hamim",
  description: "Bengali, English shoho jekono gaaner lyrics khunje ber korbe",
  commandCategory: "utility",
  usages: "[ganer nam]",
  cooldowns: 5
};

module.exports.run = async ({ api, event, args }) => {
  const songName = args.join(" ");
  
  if (!songName) {
    return api.sendMessage("Please enter a song name! (Example: /lyrics Mon Majhi Re)", event.threadID, event.messageID);
  }

  api.sendMessage(`🔍 Searching lyrics for "${songName}"... Please wait.`, event.threadID, event.messageID);

  try {
    // API calling for lyrics
    const res = await axios.get(`https://lyrist.vercel.app/api/${encodeURIComponent(songName)}`);
    const { lyrics, title, artist } = res.data;

    if (!lyrics) {
      return api.sendMessage("❌ Sorry, lyrics not found! Try searching with artist name.", event.threadID, event.messageID);
    }

    const message = `🎵 Title: ${title}\n🎤 Artist: ${artist}\n\n━━━━━━━━━━━━━━\n📜 Lyrics:\n\n${lyrics}\n━━━━━━━━━━━━━━\n✍️ Credit: Md Hamim`;
    
    return api.sendMessage(message, event.threadID, event.messageID);

  } catch (error) {
    console.error(error);
    return api.sendMessage("⚠️ API server is busy. Please try again later.", event.threadID, event.messageID);
  }
};

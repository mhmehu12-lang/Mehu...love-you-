const axios = require('axios');

module.exports.config = {
  name: "lyrics",
  version: "1.0.2",
  hasPermssion: 0,
  credits: "Md Hamim",
  description: "Search lyrics for any song (Stable API)",
  commandCategory: "utility",
  usages: "[song name]",
  cooldowns: 5
};

module.exports.run = async ({ api, event, args }) => {
  const songName = args.join(" ");
  
  if (!songName) {
    return api.sendMessage("Doya kore ekta gaaner nam likhun! (Example: /lyrics Mon Majhi Re)", event.threadID, event.messageID);
  }

  api.sendMessage(`🔍 Searching for "${songName}"... Please wait.`, event.threadID, event.messageID);

  try {
    // New Stable API
    const res = await axios.get(`https://api.popcat.xyz/lyrics?song=${encodeURIComponent(songName)}`);
    
    // API jodi error dey ba gan na pay
    if (res.data.error) {
      return api.sendMessage("❌ Sorry, lyrics not found! Try another song.", event.threadID, event.messageID);
    }

    const { lyrics, title, artist, image } = res.data;

    // Check lyrics length (Facebook-er message limit thake)
    let lyricsText = lyrics;
    if (lyricsText.length > 3500) {
      lyricsText = lyricsText.substring(0, 3500) + "... (Too long)";
    }

    const message = `🎵 **Title:** ${title}\n🎤 **Artist:** ${artist}\n\n━━━━━━━━━━━━━━\n📜 **Lyrics:**\n\n${lyricsText}\n━━━━━━━━━━━━━━\n✍️ Credit: Md Hamim`;
    
    return api.sendMessage(message, event.threadID, event.messageID);

  } catch (error) {
    console.error(error);
    return api.sendMessage("⚠️ API Server-e problem hochhe. Doya kore 1-2 minute por abar chesta korun.", event.threadID, event.messageID);
  }
};

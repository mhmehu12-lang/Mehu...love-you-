const axios = require('axios');

module.exports.config = {
  name: "lyrics",
  version: "4.0.0",
  hasPermssion: 0,
  credits: "Md Hamim",
  description: "Advanced Lyrics Finder",
  commandCategory: "utility",
  usages: "[song name]",
  cooldowns: 2
};

module.exports.run = async ({ api, event, args }) => {
  const songName = args.join(" ");
  if (!songName) return api.sendMessage("❌ Hamim, gaaner nam din!", event.threadID, event.messageID);

  try {
    // Different Public Server (Genius Search Based)
    const res = await axios.get(`https://lyrics-api.vercel.app/search?q=${encodeURIComponent(songName)}`);
    
    // Check if results exist
    if (!res.data || res.data.length === 0) {
       return api.sendMessage("❌ Sorry Hamim, lyrics pawa jayni.", event.threadID, event.messageID);
    }

    // Get the first result's lyrics
    const { title, artist, lyrics } = res.data[0];

    const message = `🎵 Title: ${title}\n🎤 Artist: ${artist}\n\n━━━━━━━━━━━━━━\n${lyrics}\n━━━━━━━━━━━━━━\n✍️ Credit: Md Hamim`;
    
    return api.sendMessage(message, event.threadID, event.messageID);

  } catch (error) {
    // Last Hope: Try Popcat again if the first one fails
    try {
        const res2 = await axios.get(`https://api.popcat.xyz/lyrics?song=${encodeURIComponent(songName)}`);
        const message2 = `🎵 Title: ${res2.data.title}\n🎤 Artist: ${res2.data.artist}\n\n━━━━━━━━━━━━━━\n${res2.data.lyrics}\n━━━━━━━━━━━━━━\n✍️ Credit: Md Hamim`;
        return api.sendMessage(message2, event.threadID, event.messageID);
    } catch (e) {
        return api.sendMessage("⚠️ API Limit Shesh! Ektu por abar chesta korun.", event.threadID, event.messageID);
    }
  }
};

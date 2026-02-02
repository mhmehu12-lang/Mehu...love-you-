const axios = require('axios');

module.exports.config = {
  name: "lyrics",
  version: "3.0.0",
  hasPermssion: 0,
  credits: "Md Hamim",
  description: "Bangla & English lyrics searcher",
  commandCategory: "utility",
  usages: "[song name]",
  cooldowns: 2
};

module.exports.run = async ({ api, event, args }) => {
  const songName = args.join(" ");
  if (!songName) return api.sendMessage("❌ Doya kore gaaner nam likhun! (Example: /lyrics Mon Majhi Re)", event.threadID, event.messageID);

  try {
    api.sendMessage(`🔍 Hamim, ami "${songName}" khujchi...`, event.threadID, event.messageID);

    // Using a more reliable Public API link
    const res = await axios.get(`https://smf-lyrics.vercel.app/lyrics?search=${encodeURIComponent(songName)}`);
    
    if (!res.data || !res.data.lyrics) {
      // If 1st API fails, trying 2nd API
      const res2 = await axios.get(`https://api.popcat.xyz/lyrics?song=${encodeURIComponent(songName)}`);
      if (res2.data.error) throw new Error("Not Found");
      
      return sendResult(res2.data.title, res2.data.artist, res2.data.lyrics);
    }

    return sendResult(res.data.title, res.data.artist, res.data.lyrics);

  } catch (error) {
    console.error(error);
    return api.sendMessage(`❌ Sorry Hamim, ei gaaner lyrics pawa jayni ba API response korche na.`, event.threadID, event.messageID);
  }

  function sendResult(title, artist, lyrics) {
    const msg = `🎵 Title: ${title}\n🎤 Artist: ${artist}\n\n━━━━━━━━━━━━━━\n${lyrics}\n━━━━━━━━━━━━━━\n✍️ Credit: Md Hamim`;
    return api.sendMessage(msg, event.threadID, event.messageID);
  }
};

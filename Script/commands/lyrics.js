const axios = require('axios');

module.exports.config = {
  name: "lyrics",
  version: "7.0.0",
  hasPermssion: 0,
  credits: "Md Hamim",
  description: "Search lyrics for any song (Fixed & Enhanced)",
  commandCategory: "utility",
  usages: "[song name]",
  cooldowns: 5
};

module.exports.run = async ({ api, event, args }) => {
  const songName = args.join(" ");
  if (!songName) return api.sendMessage("❌ Hamim, gaaner nam likhun!", event.threadID, event.messageID);

  api.sendMessage(`🔍 Searching for "${songName}"...`, event.threadID, event.messageID);

  try {
    // 1st Priority API: Higher Success Rate for Bangla/Hindi
    const res = await axios.get(`https://lyrist.vercel.app/api/${encodeURIComponent(songName)}`);
    
    if (res.data && res.data.lyrics) {
      return sendResult(res.data.title, res.data.artist, res.data.lyrics);
    }

    // 2nd Priority API: If 1st fails (Popcat)
    const res2 = await axios.get(`https://api.popcat.xyz/lyrics?song=${encodeURIComponent(songName)}`);
    if (res2.data && res2.data.lyrics && !res2.data.error) {
      return sendResult(res2.data.title, res2.data.artist, res2.data.lyrics);
    }

    // 3rd Priority: Try searching without special characters
    const cleanName = songName.replace(/[^\w\s]/gi, ''); 
    const res3 = await axios.get(`https://api.popcat.xyz/lyrics?song=${encodeURIComponent(cleanName)}`);
    if (res3.data && res3.data.lyrics && !res3.data.error) {
      return sendResult(res3.data.title, res3.data.artist, res3.data.lyrics);
    }

    return api.sendMessage(`❌ Sorry Hamim, ei gaan-ti database-e pawa jayni. Gaaner nam ba singer-er nam ektu bodle try korun.`, event.threadID, event.messageID);

  } catch (error) {
    return api.sendMessage("⚠️ API Server busy! Ektu por abar chesta korun.", event.threadID, event.messageID);
  }

  function sendResult(title, artist, lyrics) {
    let msg = `🎵 **Title:** ${title}\n🎤 **Artist:** ${artist}\n\n━━━━━━━━━━━━━━\n${lyrics}\n━━━━━━━━━━━━━━\n✍️ Credit: Md Hamim`;
    if (msg.length > 4000) msg = msg.substring(0, 3900) + "... (Lyrics too long)";
    return api.sendMessage(msg, event.threadID, event.messageID);
  }
};

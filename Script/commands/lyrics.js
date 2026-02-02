const axios = require('axios');

module.exports.config = {
  name: "lyrics",
  version: "8.0.0",
  hasPermssion: 0,
  credits: "Md Hamim",
  description: "High-speed Lyrics Finder (Stable)",
  commandCategory: "utility",
  usages: "[song name]",
  cooldowns: 2
};

module.exports.run = async ({ api, event, args }) => {
  const songName = args.join(" ");
  if (!songName) return api.sendMessage("❌ Hamim, gaaner nam likhun!", event.threadID, event.messageID);

  api.sendMessage(`🔍 Finding "${songName}" for you...`, event.threadID, event.messageID);

  try {
    // Prothome amra ekta different server try korchi
    const response = await axios.get(`https://api.manhkhac.com/lyrics?q=${encodeURIComponent(songName)}`);
    
    // Data check
    if (response.data && response.data.lyrics) {
        const { title, artist, lyrics } = response.data;
        return sendResult(title, artist, lyrics);
    }

    // Secondary Search (Alternative Global Database)
    const res2 = await axios.get(`https://tools.mptool.fr.nf/lyrics?search=${encodeURIComponent(songName)}`);
    if (res2.data && res2.data.lyrics) {
        return sendResult(res2.data.title, res2.data.artist, res2.data.lyrics);
    }

    return api.sendMessage("❌ Sorry Hamim, ei ganer lyrics pawa jayni. Gaaner nam ektu thik kore likhun.", event.threadID, event.messageID);

  } catch (error) {
    console.error(error);
    return api.sendMessage("⚠️ API Server overloaded! 1 minute opekkha kore abar chesta korun.", event.threadID, event.messageID);
  }

  function sendResult(title, artist, lyrics) {
    let msg = `🎵 **Title:** ${title}\n🎤 **Artist:** ${artist}\n\n━━━━━━━━━━━━━━\n${lyrics}\n━━━━━━━━━━━━━━\n✍️ Credit: Md Hamim`;
    if (msg.length > 4000) msg = msg.substring(0, 3900) + "... (Too long)";
    return api.sendMessage(msg, event.threadID, event.messageID);
  }
};

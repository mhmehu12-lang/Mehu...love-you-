const axios = require("axios");
const fs = require("fs");
const path = require("path");

// ===== BASE API =====
const baseApiUrl = async () => {
  const res = await axios.get(
    "https://raw.githubusercontent.com/mahmudx7/HINATA/main/baseApiUrl.json",
    { timeout: 10000 }
  );
  return res.data.mahmud;
};

/**
 * @author MahMUD
 * @do not change author
 */

module.exports = {
  config: {
    name: "jail2",
    aliases: [],
    version: "1.7",
    author: "MahMUD",
    role: 0,
    category: "fun",
    cooldown: 10,
    guide: "jail2 [mention | reply | uid]"
  },

  onStart: async function ({ api, event, args }) {

    // ===== AUTHOR PROTECTION =====
    const obfuscatedAuthor = String.fromCharCode(77, 97, 104, 77, 85, 68);
    if (module.exports.config.author !== obfuscatedAuthor) {
      return api.sendMessage(
        "❌ You are not authorized to change the author name.",
        event.threadID,
        event.messageID
      );
    }

    const { threadID, messageID, messageReply, mentions } = event;
    let targetID;

    if (messageReply) {
      targetID = messageReply.senderID;
    } else if (Object.keys(mentions).length > 0) {
      targetID = Object.keys(mentions)[0];
    } else if (args[0]) {
      targetID = args[0];
    } else {
      return api.sendMessage(
        "❌ Baby, mention, reply, or provide UID of the target.",
        threadID,
        messageID
      );
    }

    try {
      // ===== CACHE PATH =====
      const cacheDir = path.join(__dirname, "cache");
      if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir);

      const imgPath = path.join(cacheDir, `jail_${targetID}.png`);

      // ===== API CALL =====
      const apiUrl = `${await baseApiUrl()}/api/dig?type=jail&user=${targetID}`;
      const response = await axios.get(apiUrl, {
        responseType: "arraybuffer",
        timeout: 20000
      });

      fs.writeFileSync(imgPath, response.data);

      // ===== SEND IMAGE =====
      api.sendMessage(
        {
          body: "🚓 𝐉𝐚𝐢𝐥 𝐄𝐟𝐟𝐞𝐜𝐭 𝐒𝐮𝐜𝐜𝐞𝐬𝐬𝐟𝐮𝐥!",
          attachment: fs.createReadStream(imgPath)
        },
        threadID,
        () => fs.unlinkSync(imgPath),
        messageID
      );

    } catch (err) {
      console.error("JAIL2 ERROR:", err.message);
      api.sendMessage(
        "🥹 Image generate korte problem hocche!\nPore abar try koro.",
        threadID,
        messageID
      );
    }
  }
};

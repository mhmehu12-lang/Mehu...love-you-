const axios = require("axios");
const fs = require("fs");
const path = require("path");

const baseApiUrl = async () => {
  const res = await axios.get(
    "https://raw.githubusercontent.com/mahmudx7/HINATA/main/baseApiUrl.json",
    { timeout: 5000 }
  );
  return res.data.mahmud;
};

module.exports = {
  config: {
    name: "arreste",
    aliases: ["arrest", "jail"],
    version: "2.1",
    author: "MahMUD",
    role: 0,
    category: "fun",
    cooldown: 5,
    guide: "-arreste @mention / reply / UID"
  },

  onStart: async function ({ api, event, args }) {
    // 🔐 Author protection
    const realAuthor = String.fromCharCode(77,97,104,77,85,68);
    if (module.exports.config.author !== realAuthor) {
      return api.sendMessage(
        "❌ Author name change is not allowed.",
        event.threadID,
        event.messageID
      );
    }

    const { threadID, messageID, messageReply, mentions } = event;
    let targetID;

    if (messageReply) targetID = messageReply.senderID;
    else if (Object.keys(mentions).length > 0) targetID = Object.keys(mentions)[0];
    else if (args[0]) targetID = args[0];
    else {
      return api.sendMessage(
        "⚠️ Mention, reply or give UID.",
        threadID,
        messageID
      );
    }

    const cacheDir = path.join(__dirname, "cache");
    if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir);

    const imgPath = path.join(cacheDir, `arreste_${targetID}.png`);

    try {
      const apiBase = await baseApiUrl();
      const url = `${apiBase}/api/dig?type=jail&user=${targetID}`;

      const img = await axios.get(url, {
        responseType: "arraybuffer",
        timeout: 15000
      });

      fs.writeFileSync(imgPath, img.data);

      api.sendMessage(
        {
          body: "🚓 𝐀𝐫𝐫𝐞𝐬𝐭𝐞 𝐬𝐮𝐜𝐜𝐞𝐬𝐬𝐟𝐮𝐥 😈",
          attachment: fs.createReadStream(imgPath)
        },
        threadID,
        () => fs.unlinkSync(imgPath),
        messageID
      );

    } catch (err) {
      console.error("ARRESTE ERROR:", err.message);
      api.sendMessage(
        "❌ Arrest failed. Try again later.",
        threadID,
        messageID
      );
    }
  }
};

const fs = require("fs");
const axios = require("axios");
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
    name: "mygirl",
    version: "1.7",
    role: 0,
    author: "MahMUD",
    category: "fun",
    cooldown: 5,
    guide: "-mygirl @mention / reply"
  },

  onStart: async function ({ api, event }) {
    // 🔐 Author protection
    const realAuthor = String.fromCharCode(77, 97, 104, 77, 85, 68);
    if (module.exports.config.author !== realAuthor) {
      return api.sendMessage(
        "❌ You are not authorized to change the author name.",
        event.threadID,
        event.messageID
      );
    }

    try {
      const { threadID, messageID, senderID, mentions, messageReply } = event;

      let targetID;
      if (Object.keys(mentions).length > 0) {
        targetID = Object.keys(mentions)[0];
      } else if (messageReply) {
        targetID = messageReply.senderID;
      } else {
        return api.sendMessage(
          "⚠️ Please mention or reply to one person.",
          threadID,
          messageID
        );
      }

      const cacheDir = path.join(__dirname, "cache");
      if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir);

      const imgPath = path.join(
        cacheDir,
        `mygirl_${senderID}_${targetID}.png`
      );

      const baseUrl = await baseApiUrl();
      const apiUrl = `${baseUrl}/api/myboy?user1=${senderID}&user2=${targetID}`;

      const res = await axios.get(apiUrl, {
        responseType: "arraybuffer",
        timeout: 15000
      });

      fs.writeFileSync(imgPath, res.data);

      api.sendMessage(
        {
          body: "𝐓𝐇𝐀𝐓'𝐒 𝐌𝐘 𝐆𝐈𝐑𝐋 🖤",
          attachment: fs.createReadStream(imgPath)
        },
        threadID,
        () => fs.unlinkSync(imgPath),
        messageID
      );

    } catch (err) {
      console.error("MYGIRL ERROR:", err.message);
      api.sendMessage(
        "🥹 Error occurred, try again later.",
        event.threadID,
        event.messageID
      );
    }
  }
};

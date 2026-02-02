const fs = require("fs-extra");
const axios = require("axios");
const path = require("path");

module.exports.config = {
  name: "mygirl",
  version: "1.8",
  hasPermssion: 0,
  credits: "MahMUD",
  description: "Tag someone to see the magic",
  commandCategory: "fun",
  usages: "[tag/reply]",
  cooldowns: 5
};

module.exports.run = async ({ event, api, args }) => {
  const { threadID, messageID, senderID, mentions, messageReply } = event;
  
  // Cache folder check and create
  const cachePath = path.join(__dirname, "cache");
  if (!fs.existsSync(cachePath)) fs.mkdirSync(cachePath, { recursive: true });

  // Get target ID
  const mention = Object.keys(mentions)[0] || (messageReply && messageReply.senderID);

  if (!mention) {
    return api.sendMessage("Please tag or reply to 1 person.", threadID, messageID);
  }

  try {
    // API URL fetching logic
    const baseResponse = await axios.get("https://raw.githubusercontent.com/mahmudx7/HINATA/main/baseApiUrl.json");
    const baseUrl = baseResponse.data.mahmud;
    
    const user1 = senderID;
    const user2 = mention;
    const apiUrl = `${baseUrl}/api/myboy?user1=${user1}&user2=${user2}`;
    const imgPath = path.join(cachePath, `mygirl_${user1}_${user2}.png`);

    api.sendMessage("Processing your image, please wait... ⏳", threadID, async (err, info) => {
      try {
        const response = await axios.get(apiUrl, { responseType: "arraybuffer" });
        fs.writeFileSync(imgPath, Buffer.from(response.data, "binary"));

        return api.sendMessage({
          body: `𝐓𝐇𝐀𝐓'𝐒 𝐌𝐀𝐇 𝐆𝐈𝐑𝐋 🖤`,
          attachment: fs.createReadStream(imgPath)
        }, threadID, () => {
          if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
        }, messageID);
      } catch (e) {
        console.error(e);
        return api.sendMessage("An error occurred while generating the image. 🥹", threadID, messageID);
      }
    }, messageID);

  } catch (error) {
    console.error(error);
    return api.sendMessage("Could not connect to the server. Contact MahMUD.", threadID, messageID);
  }
};

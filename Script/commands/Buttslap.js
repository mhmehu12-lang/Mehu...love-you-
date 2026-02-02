const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

const baseApiUrl = async () => {
  const base = await axios.get("https://raw.githubusercontent.com/mahmudx7/HINATA/main/baseApiUrl.json");
  return base.data.mahmud;
};

module.exports.config = {
  name: "buttslap",
  version: "1.7",
  hasPermssion: 0,
  credits: "MahMUD",
  description: "Slap someone's butt",
  commandCategory: "fun",
  usages: "[mention/reply/UID]",
  cooldowns: 8
};

module.exports.run = async function ({ api, event, args }) {
  const { threadID, messageID, messageReply, mentions, senderID } = event;
  
  // Author protection check
  const obfuscatedAuthor = String.fromCharCode(77, 97, 104, 77, 85, 68);
  if (this.config.credits !== obfuscatedAuthor) {
    return api.sendMessage("You are not authorized to change the author name.", threadID, messageID);
  }

  let id2;
  if (messageReply) {
    id2 = messageReply.senderID;
  } else if (Object.keys(mentions).length > 0) {
    id2 = Object.keys(mentions)[0];
  } else if (args[0]) {
    id2 = args[0];
  } else {
    return api.sendMessage("Please mention, reply, or provide UID of the target.", threadID, messageID);
  }

  try {
    const baseUrl = await baseApiUrl();
    const url = `${baseUrl}/api/dig?type=buttslap&user=${senderID}&user2=${id2}`;

    const cachePath = path.join(__dirname, "cache");
    if (!fs.existsSync(cachePath)) fs.mkdirSync(cachePath, { recursive: true });
    
    const filePath = path.join(cachePath, `slap_${id2}.png`);

    const response = await axios.get(url, { responseType: "arraybuffer" });
    fs.writeFileSync(filePath, Buffer.from(response.data, "binary"));

    return api.sendMessage({
      body: `Effect: buttslap successful 💥`,
      attachment: fs.createReadStream(filePath)
    }, threadID, () => {
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }, messageID);

  } catch (err) {
    console.error(err);
    return api.sendMessage(`🥹 Error, please contact MahMUD.`, threadID, messageID);
  }
};

const fs = require("fs");
const axios = require("axios");

const baseApiUrl = async () => {
  const base = await axios.get("https://raw.githubusercontent.com/mahmudx7/HINATA/main/baseApiUrl.json");
  return base.data.mahmud;
};

module.exports.config = {
  name: "mygirl",
  version: "1.7",
  role: 0,
  author: "MahMUD",
  category: "fun",
  cooldown: 5
};

module.exports.run = async ({ api, event, args }) => {
  try {
    const { threadID, messageID, senderID } = event;
    const mention = Object.keys(event.mentions)[0] || 
      (event.messageReply && event.messageReply.senderID);

    if (!mention)
      return api.sendMessage("Please tag or reply to 1 person", threadID, messageID);

    const baseUrl = await baseApiUrl();
    const apiUrl = `${baseUrl}/api/myboy?user1=${senderID}&user2=${mention}`;

    const response = await axios.get(apiUrl, { responseType: "arraybuffer" });

    const imgPath = __dirname + `/cache/mygirl_${senderID}_${mention}.png`;
    fs.writeFileSync(imgPath, Buffer.from(response.data));

    api.sendMessage({
      body: `𝐓𝐇𝐀𝐓'𝐒 𝐌𝐀𝐇 𝐆𝐈𝐑𝐋 🖤`,
      attachment: fs.createReadStream(imgPath)
    }, threadID, () => fs.unlinkSync(imgPath), messageID);

  } catch (err) {
    console.error(err);
    api.sendMessage("🥹 Error occurred.", event.threadID, event.messageID);
  }
};

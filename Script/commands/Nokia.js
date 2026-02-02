const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports.config = {
  name: "nokia",
  version: "1.0",
  hasPermssion: 0,
  credits: "Helal",
  description: "Apply Nokia screen effect to profile photo",
  commandCategory: "fun",
  usages: "[@mention or reply]",
  cooldowns: 10
};

module.exports.run = async function ({ api, event, args }) {
  const { senderID, mentions, type, messageReply, threadID, messageID } = event;

  // UID Nirnoy
  let uid;
  if (Object.keys(mentions).length > 0) {
    uid = Object.keys(mentions)[0];
  } else if (type === "message_reply") {
    uid = messageReply.senderID;
  } else {
    uid = senderID;
  }

  // Avatar URL (Using a more stable method)
  const avatarURL = `https://graph.facebook.com/${uid}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;

  try {
    const cachePath = path.join(__dirname, "cache");
    if (!fs.existsSync(cachePath)) fs.mkdirSync(cachePath, { recursive: true });
    
    const imagePath = path.join(cachePath, `nokia_${uid}.jpg`);

    // API Call to Popcat
    const res = await axios.get(`https://api.popcat.xyz/nokia?image=${encodeURIComponent(avatarURL)}`, {
      responseType: "arraybuffer"
    });

    fs.writeFileSync(imagePath, Buffer.from(res.data, "utf-8"));

    return api.sendMessage({
      body: `📱 | Here's your Nokia screen effect!`,
      attachment: fs.createReadStream(imagePath)
    }, threadID, () => {
      if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
    }, messageID);

  } catch (err) {
    console.error(err);
    return api.sendMessage("❌ | Failed to generate Nokia image. The API might be down.", threadID, messageID);
  }
};

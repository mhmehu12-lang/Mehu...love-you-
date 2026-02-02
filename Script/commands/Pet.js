const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports.config = {
  name: "pet",
  version: "1.0",
  hasPermssion: 0,
  credits: "nexo",
  description: "Pet a user",
  commandCategory: "fun",
  usages: "@mention",
  cooldowns: 5
};

module.exports.run = async function ({ api, event, args }) {
  const { threadID, messageID, mentions } = event;
  const mentionIDs = Object.keys(mentions);

  if (mentionIDs.length === 0) {
    return api.sendMessage("❌ Please tag a user to pet.", threadID, messageID);
  }

  const userid = mentionIDs[0];
  const apiUrl = `https://betadash-api-swordslush-production.up.railway.app/pet?userid=${userid}`;

  try {
    const res = await axios.get(apiUrl, { responseType: "arraybuffer" });
    
    // কনটেন্ট টাইপ চেক করে এক্সটেনশন বের করা
    const contentType = res.headers["content-type"] || "";
    let ext = "jpg";
    if (contentType.includes("gif")) ext = "gif";
    else if (contentType.includes("mp4")) ext = "mp4";

    const cacheDir = path.join(__dirname, "cache");
    if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });

    const filePath = path.join(cacheDir, `pet_${userid}_${Date.now()}.${ext}`);
    fs.writeFileSync(filePath, Buffer.from(res.data, "binary"));

    // মিরাই বটের স্টাইলে নাম নেওয়া
    const userInfo = await api.getUserInfo(userid);
    const name = userInfo[userid]?.name || "User";

    return api.sendMessage({
      body: `🐾 You petted ${name}!`,
      attachment: fs.createReadStream(filePath)
    }, threadID, () => {
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }, messageID);

  } catch (err) {
    console.error("❌ Pet command error:", err);
    return api.sendMessage("⚠️ Failed to generate pet image/video. API might be down.", threadID, messageID);
  }
};

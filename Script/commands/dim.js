const axios = require('axios');
const { createCanvas, loadImage } = require('canvas');
const fs = require('fs-extra');
const path = require('path');

module.exports.config = {
  name: 'dim',
  version: '2.5',
  hasPermssion: 0,
  credits: 'MJ Hamim', // Credit updated
  description: 'কাউকে ডিম (egg) বানিয়ে মজা করুন',
  commandCategory: 'fun',
  usages: '[mention/reply]',
  cooldowns: 5,
  dependencies: {
    "axios": "",
    "canvas": "",
    "fs-extra": "",
    "path": ""
  }
};

const fetchAvatar = async (uid) => {
  try {
    const avatarUrl = `https://graph.facebook.com/${uid}/picture?width=720&height=720&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;
    const finalUrl = `${avatarUrl}&t=${Date.now()}`;

    const response = await axios.get(finalUrl, {
      responseType: "arraybuffer",
      timeout: 15000,
      headers: { "User-Agent": "Mozilla/5.0" },
    });

    return Buffer.from(response.data);
  } catch (error) {
    throw new Error(`Failed to fetch avatar: ${error.message}`);
  }
};

module.exports.run = async function ({ event, api, args, Users }) {
  const { threadID, messageID, senderID, mentions, messageReply } = event;

  try {
    let targetID;
    if (Object.keys(mentions).length > 0) {
      targetID = Object.keys(mentions)[0];
    } else if (messageReply) {
      targetID = messageReply.senderID;
    } else {
      return api.sendMessage('🔹 কাউকে mention বা reply দাও!', threadID, messageID);
    }

    if (targetID === senderID) {
      return api.sendMessage('😂 নিজেকে dim বানানো নিষেধ!', threadID, messageID);
    }

    api.sendMessage('⏳ Dim বানানো হচ্ছে...', threadID, (err, info) => {
      setTimeout(() => api.unsendMessage(info.messageID), 3000);
    }, messageID);

    const avatarBuffer = await fetchAvatar(targetID);
    const avatar = await loadImage(avatarBuffer);

    // Background setup
    const cacheDir = path.join(__dirname, 'cache');
    if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });
    
    const bgPath = path.join(cacheDir, 'dim_bg.jpg');
    const bgUrl = 'https://i.postimg.cc/Wbt5GLY7/5674fba3a393f7578a73919569b5147f.jpg';

    let bg;
    if (!fs.existsSync(bgPath)) {
      const bgRes = await axios.get(bgUrl, { responseType: 'arraybuffer' });
      await fs.writeFile(bgPath, bgRes.data);
      bg = await loadImage(bgRes.data);
    } else {
      bg = await loadImage(fs.readFileSync(bgPath));
    }

    // Canvas Processing
    const canvas = createCanvas(bg.width, bg.height);
    const ctx = canvas.getContext('2d');
    ctx.drawImage(bg, 0, 0);

    const size = 150;
    const x = 100; 
    const y = 60;  

    ctx.save();
    ctx.beginPath();
    ctx.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(avatar, x, y, size, size);
    ctx.restore();

    // Border
    ctx.beginPath();
    ctx.arc(x + size / 2, y + size / 2, size / 2 + 3, 0, Math.PI * 2);
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 5;
    ctx.stroke();

    // Funny Text
    ctx.font = 'bold 30px Arial';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.shadowColor = "black";
    ctx.shadowBlur = 7;
    ctx.lineWidth = 5;
    ctx.strokeText('PURE DIM 😂', bg.width / 2, bg.height - 40);
    ctx.fillText('PURE DIM 😂', bg.width / 2, bg.height - 40);

    const outputPath = path.join(cacheDir, `dim_${targetID}.png`);
    fs.writeFileSync(outputPath, canvas.toBuffer());

    const name = await Users.getNameUser(targetID) || "User";

    return api.sendMessage({
      body: `🥚🤣 ${name} এখন একদম DIM LEVEL MAX!`,
      attachment: fs.createReadStream(outputPath)
    }, threadID, () => {
      if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
    }, messageID);

  } catch (e) {
    console.error(e);
    return api.sendMessage(`❌ Error: ${e.message}`, threadID, messageID);
  }
};

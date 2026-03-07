const axios = require('axios');
const { createCanvas, loadImage } = require('canvas');
const fs = require('fs-extra');
const path = require('path');

module.exports.config = {
  name: "pregnant",
  version: "4.0.0",
  hasPermssion: 0,
  credits: "MJ Hamim",
  description: "Advanced Stable Pregnant Meme",
  commandCategory: "fun",
  usages: "[mention/reply]",
  cooldowns: 2,
  dependencies: {
    "axios": "",
    "canvas": "",
    "fs-extra": ""
  }
};

// প্রোফাইল পিকচার পাওয়ার জন্য ৩টি বিকল্প মেথড
async function getAvatar(uid) {
  const apis = [
    `https://graph.facebook.com/${uid}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`,
    `https://p-f-p.vercel.app/api/pfp?uid=${uid}`,
    `https://graph.facebook.com/${uid}/picture?type=large`
  ];

  for (const url of apis) {
    try {
      const res = await axios.get(url, { 
        responseType: 'arraybuffer',
        timeout: 10000,
        headers: { 'User-Agent': 'Mozilla/5.0' }
      });
      if (res.data) return res.data;
    } catch (e) {
      continue; // একটা ফেইল হলে পরেরটা ট্রাই করবে
    }
  }
  throw new Error("সবগুলো এপিআই ব্যর্থ হয়েছে! ইউজারের প্রোফাইল লক থাকতে পারে।");
}

module.exports.run = async function ({ event, api, Users }) {
  const { threadID, messageID, senderID, mentions, messageReply } = event;

  try {
    let targetID;
    if (Object.keys(mentions).length > 0) {
      targetID = Object.keys(mentions)[0];
    } else if (messageReply) {
      targetID = messageReply.senderID;
    } else {
      return api.sendMessage('🔹 একজনকে mention বা reply করুন!', threadID, messageID);
    }

    const waitMsg = await api.sendMessage('⏳ একদম নিখুঁতভাবে তৈরি হচ্ছে, একটু ধৈর্য ধরুন...', threadID);

    // Background Image
    const bgUrl = 'https://i.ibb.co/sJvWp0jB/file-000000004034720b9de86b2f850cc1fd.png';
    
    // ডাউনলোড প্রসেস
    const [senderAvt, targetAvt, background] = await Promise.all([
      getAvatar(senderID),
      getAvatar(targetID),
      axios.get(bgUrl, { responseType: "arraybuffer" }).then(res => res.data)
    ]);

    const imgSender = await loadImage(senderAvt);
    const imgTarget = await loadImage(targetAvt);
    const imgBackground = await loadImage(background);

    const canvas = createCanvas(imgBackground.width, imgBackground.height);
    const ctx = canvas.getContext('2d');
    
    ctx.drawImage(imgBackground, 0, 0, canvas.width, canvas.height);

    // পজিশন (আপনার দেওয়া স্ক্রিনশট অনুযায়ী ফিক্সড)
    const sSize = 195; // ছেলে
    const sX = 550; 
    const sY = 60;

    const tSize = 210; // মেয়ে
    const tX = 340;
    const tY = 170;

    // মেয়েটির ফেস ড্রয়িং
    ctx.save();
    ctx.beginPath();
    ctx.arc(tX + tSize/2, tY + tSize/2, tSize/2, 0, Math.PI * 2);
    ctx.clip();
    ctx.drawImage(imgTarget, tX, tY, tSize, tSize);
    ctx.restore();

    // ছেলেটির ফেস ড্রয়িং
    ctx.save();    
    ctx.beginPath();
    ctx.arc(sX + sSize/2, sY + sSize/2, sSize/2, 0, Math.PI * 2);
    ctx.clip();
    ctx.drawImage(imgSender, sX, sY, sSize, sSize);
    ctx.restore();

    const cachePath = path.join(__dirname, 'cache', `preg_${Date.now()}.png`);
    if (!fs.existsSync(path.join(__dirname, 'cache'))) fs.mkdirSync(path.join(__dirname, 'cache'));
    fs.writeFileSync(cachePath, canvas.toBuffer());

    api.unsendMessage(waitMsg.messageID);

    const name = await Users.getNameUser(targetID);
    return api.sendMessage({
      body: `ঐ দেখ ${name}, তোমাদের কি অবস্থা! 🤰😂`,
      attachment: fs.createReadStream(cachePath)
    }, threadID, () => {
      if (fs.existsSync(cachePath)) fs.unlinkSync(cachePath);
    }, messageID);

  } catch (e) {
    console.error(e);
    return api.sendMessage(`❌ এরর: ছবি ফেচ করা যাচ্ছে না। দয়া করে আবার চেষ্টা করুন বা অন্য কাউকে মেনশন দিন।`, threadID, messageID);
  }
};

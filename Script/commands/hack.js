const fs = require("fs-extra");
const axios = require("axios");
const path = require("path");
const { loadImage, createCanvas } = require("canvas");

module.exports.config = {
  name: "hack",
  version: "1.0.0",
  hasPermssion: 0,
  credits: "NAZRUL (Converted by Akash)",
  description: "Fake FB hack generator 😅",
  commandCategory: "fun",
  usages: "[@mention/reply]",
  cooldowns: 5
};

// টেক্সট লাইন ভাঙার হেল্পার ফাংশন
async function wrapText(ctx, text, maxWidth) {
  if (ctx.measureText(text).width < maxWidth) return [text];
  const words = text.split(" ");
  const lines = [];
  let line = "";

  for (let i = 0; i < words.length; i++) {
    let testLine = line + words[i] + " ";
    let metrics = ctx.measureText(testLine);
    let testWidth = metrics.width;
    if (testWidth > maxWidth && i > 0) {
      lines.push(line.trim());
      line = words[i] + " ";
    } else {
      line = testLine;
    }
  }
  lines.push(line.trim());
  return lines;
}

module.exports.run = async function ({ api, event, args }) {
  const { threadID, messageID, senderID, mentions, messageReply } = event;

  try {
    // টার্গেট আইডি নির্ধারণ
    let mentionID = senderID;
    if (Object.keys(mentions).length > 0) mentionID = Object.keys(mentions)[0];
    else if (messageReply) mentionID = messageReply.senderID;

    // ইউজার নাম নেওয়া
    const userInfo = await api.getUserInfo(mentionID);
    const userName = userInfo[mentionID]?.name || "Facebook User";

    const bgLink = "https://drive.google.com/uc?id=1_S9eqbx8CxMMxUdOfATIDXwaKWMC-8ox&export=download";
    
    // ক্যাশ পাথ
    const cacheDir = path.join(__dirname, "cache");
    if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir);
    
    const bgPath = path.join(cacheDir, `hack_bg_${senderID}.png`);
    const avatarPath = path.join(cacheDir, `hack_avatar_${mentionID}.png`);

    // প্রোফাইল ছবি নামানো
    const avatarData = (await axios.get(`https://graph.facebook.com/${mentionID}/picture?width=720&height=720&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`, { responseType: "arraybuffer" })).data;
    fs.writeFileSync(avatarPath, Buffer.from(avatarData));

    // ব্যাকগ্রাউন্ড নামানো
    const bgData = (await axios.get(bgLink, { responseType: "arraybuffer" })).data;
    fs.writeFileSync(bgPath, Buffer.from(bgData));

    // ক্যানভাসে ড্রয়িং
    const background = await loadImage(bgPath);
    const avatar = await loadImage(avatarPath);
    const canvas = createCanvas(background.width, background.height);
    const ctx = canvas.getContext("2d");

    ctx.drawImage(background, 0, 0, canvas.width, canvas.height);
    ctx.font = "400 23px Arial";
    ctx.fillStyle = "#1878F3";
    ctx.textAlign = "start";

    const wrappedText = await wrapText(ctx, userName, 1160);
    ctx.fillText(wrappedText.join("\n"), 136, 335);

    ctx.beginPath();
    ctx.drawImage(avatar, 57, 290, 66, 68);

    const finalBuffer = canvas.toBuffer();
    fs.writeFileSync(bgPath, finalBuffer);

    await api.sendMessage({
      body: "😎 হ্যাক সম্পূর্ণ!",
      attachment: fs.createReadStream(bgPath)
    }, threadID, () => {
      if (fs.existsSync(bgPath)) fs.unlinkSync(bgPath);
      if (fs.existsSync(avatarPath)) fs.unlinkSync(avatarPath);
    }, messageID);

  } catch (err) {
    console.error(err);
    api.sendMessage("❌ কিছু ভুল হয়েছে!", threadID, messageID);
  }
};

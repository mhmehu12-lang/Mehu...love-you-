const fs = require("fs-extra");
const path = require("path");
const axios = require("axios"); // node-fetch এর বদলে axios বেশি স্ট্যাবল
const { createCanvas, loadImage } = require("canvas");

// DP loader using axios
async function loadUserDP(uid) {
  try {
    const url = `https://graph.facebook.com/${uid}/picture?height=1500&width=1500&access_token=6628568379|c1e620fa708a1d5696fb991c1bde5662`;
    const response = await axios.get(url, { responseType: "arraybuffer" });
    return await loadImage(Buffer.from(response.data));
  } catch (e) {
    return await loadImage("https://i.postimg.cc/kgjgP6QX/messenger-dp.png");
  }
}

// Bubble drawer logic (No change needed here)
function drawBubble(ctx, x, y, w, h, color, tailLeft = true) {
  const radius = 40;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + w - radius, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
  ctx.lineTo(x + w, y + h - radius);
  ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
  ctx.lineTo(x + radius, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.fill();

  if (tailLeft) {
    ctx.beginPath();
    ctx.moveTo(x, y + 60);
    ctx.lineTo(x - 38, y + 90);
    ctx.lineTo(x, y + 120);
    ctx.closePath();
    ctx.fill();
  } else {
    ctx.beginPath();
    ctx.moveTo(x + w, y + 60);
    ctx.lineTo(x + w + 38, y + 90);
    ctx.lineTo(x + w, y + 120);
    ctx.closePath();
    ctx.fill();
  }
}

module.exports.config = {
  name: "fakechat",
  version: "9.0",
  hasPermssion: 0,
  credits: "MOHAMMAD AKASH",
  description: "Messenger FakeChat Dark Mode",
  commandCategory: "fun",
  usages: "@mention - text1 - text2",
  cooldowns: 5
};

module.exports.run = async function ({ api, event, args }) {
  const { threadID, messageID, senderID, mentions } = event;

  if (args.length < 2)
    return api.sendMessage("ব্যবহার করার নিয়ম:\nfakechat @mention - হাই - হ্যালো", threadID, messageID);

  const input = args.join(" ").split("-").map(a => a.trim());
  let [target, text1, text2 = ""] = input;

  let uid;
  if (mentions && Object.keys(mentions).length > 0)
    uid = Object.keys(mentions)[0];
  else if (/^\d{6,}$/.test(target)) uid = target;
  else return api.sendMessage("❌ সঠিক আইডি বা মেনশন দিন!", threadID, messageID);

  try {
    let name = "User";
    const info = await api.getUserInfo(uid);
    name = info[uid]?.name || "User";

    // ব্যালেন্স চেক করার অংশটি বাদ দেওয়া হয়েছে (এখন ফ্রি)
    
    api.sendMessage("Processing your fakechat... ⏳", threadID, async (err, info_msg) => {
      const dp = await loadUserDP(uid);
      const width = 1080, height = 1500;
      const canvas = createCanvas(width, height);
      const ctx = canvas.getContext("2d");

      ctx.fillStyle = "#18191A";
      ctx.fillRect(0, 0, width, height);

      ctx.save();
      ctx.beginPath();
      ctx.arc(120, 180, 90, 0, Math.PI * 2);
      ctx.clip();
      ctx.drawImage(dp, 30, 90, 180, 180);
      ctx.restore();

      ctx.fillStyle = "#fff";
      ctx.font = "300 55px Sans-serif";
      ctx.fillText(name, 250, 160);
      ctx.fillStyle = "#aaa";
      ctx.font = "300 40px Sans-serif";
      ctx.fillText("Active now", 250, 210);

      drawBubble(ctx, 50, 280, 700, 150, "#242526", true);
      ctx.fillStyle = "#fff";
      ctx.font = "300 55px Sans-serif";
      ctx.fillText(text1, 90, 370);

      if (text2) {
        const bubbleX = width - 50 - 700;
        drawBubble(ctx, bubbleX, 480, 700, 150, "#0560FF", false);
        ctx.fillStyle = "#fff";
        ctx.font = "300 55px Sans-serif";
        ctx.fillText(text2, bubbleX + 40, 570);
      }

      const imgPath = path.join(__dirname, "cache", `fakechat_${senderID}.png`);
      fs.ensureDirSync(path.dirname(imgPath));
      fs.writeFileSync(imgPath, canvas.toBuffer());

      return api.sendMessage({
        attachment: fs.createReadStream(imgPath)
      }, threadID, () => {
        if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
      }, messageID);
    });

  } catch (error) {
    console.error(error);
    return api.sendMessage("Error: " + error.message, threadID, messageID);
  }
};

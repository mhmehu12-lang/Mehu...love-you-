const fs = require("fs-extra");
const path = require("path");
const axios = require("axios");
const { createCanvas, loadImage } = require("canvas");

module.exports.config = {
  name: "spy",
  version: "6.0.1",
  hasPermssion: 0,
  credits: "Saim / Direct Image Fix",
  commandCategory: "utility",
  cooldowns: 5
};

module.exports.run = async function ({ api, event, args, Currencies, Users }) {
  const { threadID, messageID, senderID, mentions, type, messageReply } = event;

  try {
    let targetID;
    if (Object.keys(mentions).length > 0) {
      targetID = Object.keys(mentions)[0];
    } else if (type === "message_reply") {
      targetID = messageReply.senderID;
    } else {
      targetID = senderID;
    }

    api.sendMessage("🚀 প্রোফাইল পিকচার ও ডাটা কানেক্ট করা হচ্ছে...", threadID, messageID);

    const info = await api.getUserInfo(targetID);
    const moneyData = await Currencies.getData(targetID);
    const money = moneyData.money || 0;

    const name = info[targetID].name || "Facebook User";
    const username = info[targetID].vanity || "No Username";
    const gender = info[targetID].gender == 2 ? "Male" : info[targetID].gender == 1 ? "Female" : "Unknown";

    /* ===== Canvas Setup ===== */
    const canvas = createCanvas(650, 850);
    const ctx = canvas.getContext("2d");

    const bg = ctx.createRadialGradient(325, 425, 100, 325, 425, 600);
    bg.addColorStop(0, "#0b0033");
    bg.addColorStop(1, "#020111");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = "#00ffff";
    ctx.lineWidth = 12;
    ctx.shadowColor = "#00ffff";
    ctx.shadowBlur = 30;
    ctx.strokeRect(30, 30, 590, 790);
    ctx.shadowBlur = 0;

    /* ===== AVATAR FIX ===== */
    // সহজ এবং কার্যকর প্রোফাইল পিকচার লিঙ্ক
    const avatarUrl = `https://graph.facebook.com/${targetID}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa059ef6e40a7d7d563931e233`;
    
    let avatar;
    try {
      const response = await axios.get(avatarUrl, { 
        responseType: "arraybuffer",
        headers: { 'User-Agent': 'Mozilla/5.0' } 
      });
      avatar = await loadImage(Buffer.from(response.data));
    } catch (e) {
      // যদি উপরেরটি কাজ না করে তবে বিকল্প লিঙ্ক
      try {
        const resBackup = await axios.get(`https://graph.facebook.com/${targetID}/picture?type=large`, { 
          responseType: "arraybuffer" 
        });
        avatar = await loadImage(Buffer.from(resBackup.data));
      } catch (err) {
        avatar = await loadImage("https://i.imgur.com/3ZUrjUP.png"); // ডিফল্ট ইমেজ
      }
    }

    function drawHexagon(x, y, size) {
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i - Math.PI / 2;
        ctx.lineTo(x + size * Math.cos(angle), y + size * Math.sin(angle));
      }
      ctx.closePath();
    }

    ctx.save();
    drawHexagon(325, 200, 120);
    ctx.clip();
    ctx.drawImage(avatar, 205, 80, 240, 240); 
    ctx.restore();

    ctx.strokeStyle = "#ff00ff";
    ctx.lineWidth = 8;
    ctx.shadowColor = "#ff00ff";
    ctx.shadowBlur = 20;
    drawHexagon(325, 200, 120);
    ctx.stroke();
    ctx.shadowBlur = 0;

    /* ===== Info Layout ===== */
    ctx.font = "bold 40px Arial";
    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "center";
    ctx.fillText(name, 325, 380);

    ctx.fillStyle = "rgba(255, 255, 255, 0.05)";
    ctx.fillRect(70, 430, 510, 340);
    ctx.strokeStyle = "rgba(0, 255, 255, 0.5)";
    ctx.strokeRect(70, 430, 510, 340);

    const fields = [
      ["ID", targetID],
      ["USER", username],
      ["SEX", gender],
      ["CASH", "$" + money.toLocaleString()],
      ["LINK", `fb.com/${targetID}`]
    ];

    let yPos = 490;
    fields.forEach(([label, value]) => {
      ctx.textAlign = "left";
      ctx.fillStyle = "#ff00ff";
      ctx.font = "bold 22px Arial";
      ctx.fillText(label + ":", 100, yPos);

      ctx.fillStyle = "#00ffff";
      ctx.font = "20px Arial";
      let text = String(value).length > 25 ? String(value).substring(0, 22) + "..." : value;
      ctx.fillText(text, 250, yPos);
      yPos += 60;
    });

    ctx.font = "italic 16px Arial";
    ctx.fillStyle = "#444";
    ctx.textAlign = "center";
    ctx.fillText("SYSTEM ENCRYPTED BY SAIMX69X", 325, 810);

    const cacheDir = path.join(__dirname, "cache");
    if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir);

    const imgPath = path.join(cacheDir, `spy_${targetID}.png`);
    fs.writeFileSync(imgPath, canvas.toBuffer());

    return api.sendMessage(
      { attachment: fs.createReadStream(imgPath) },
      threadID,
      () => { if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath) },
      messageID
    );

  } catch (err) {
    console.error(err);
    api.sendMessage("❌ সিস্টেম এরর: তথ্য সংগ্রহ করা সম্ভব হচ্ছে না।", threadID, messageID);
  }
};

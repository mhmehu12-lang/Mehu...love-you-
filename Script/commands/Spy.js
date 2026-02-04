const fs = require("fs-extra");
const path = require("path");
const axios = require("axios");
const { createCanvas, loadImage } = require("canvas");

module.exports.config = {
  name: "spy",
  version: "5.2.0",
  hasPermssion: 0,
  credits: "Full Hacker Spy Fix",
  commandCategory: "utility",
  cooldowns: 5
};

module.exports.run = async function ({ api, event, args, Currencies, Users }) {
  const { threadID, messageID, senderID, mentions, type, messageReply } = event;

  try {
    // মেনশন, রিপ্লাই অথবা নিজের আইডি নির্ধারণের লজিক
    let targetID;
    if (Object.keys(mentions).length > 0) {
      targetID = Object.keys(mentions)[0]; // মেনশন করা ইউজার
    } else if (type === "message_reply") {
      targetID = messageReply.senderID; // রিপ্লাই দেওয়া ইউজার
    } else {
      targetID = senderID; // শুধু কমান্ড দিলে নিজের প্রোফাইল
    }

    api.sendMessage("🕶️ সিস্টেম প্রসেসিং হচ্ছে...", threadID, messageID);

    const info = await api.getUserInfo(targetID);
    const moneyData = await Currencies.getData(targetID);
    const money = moneyData.money || 0;

    const name = info[targetID].name || "Unknown User";
    const username = info[targetID].vanity || "No Username";
    const gender = info[targetID].gender == 2 ? "Boy" : info[targetID].gender == 1 ? "Girl" : "Unknown";

    /* ===== Canvas Setup ===== */
    const canvas = createCanvas(650, 850);
    const ctx = canvas.getContext("2d");

    // ব্যাকগ্রাউন্ড ডিজাইন
    const bg = ctx.createLinearGradient(0, 0, 650, 850);
    bg.addColorStop(0, "#020111");
    bg.addColorStop(1, "#0b0033");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // নিওন বর্ডার
    ctx.strokeStyle = "#00ffff";
    ctx.lineWidth = 10;
    ctx.shadowColor = "#00ffff";
    ctx.shadowBlur = 20;
    ctx.strokeRect(25, 25, 600, 800);
    ctx.shadowBlur = 0;

    /* ===== AVATAR LOADING ===== */
    let avatar;
    const avatarUrl = `https://graph.facebook.com/${targetID}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa059ef6e40a7d7d563931e233`;
    
    try {
      const response = await axios.get(avatarUrl, { responseType: "arraybuffer" });
      avatar = await loadImage(Buffer.from(response.data));
    } catch {
      avatar = await loadImage("https://i.imgur.com/3ZUrjUP.png");
    }

    // হেক্সাগন ক্লিপিং
    function drawHexagon(x, y, size) {
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i - Math.PI / 2;
        ctx.lineTo(x + size * Math.cos(angle), y + size * Math.sin(angle));
      }
      ctx.closePath();
    }

    ctx.save();
    drawHexagon(325, 190, 110);
    ctx.clip();
    ctx.drawImage(avatar, 215, 80, 220, 220); // ছবি পজিশন ফিক্সড
    ctx.restore();

    // ছবির গ্লো বর্ডার
    ctx.strokeStyle = "#ff00ff";
    ctx.lineWidth = 6;
    ctx.shadowColor = "#ff00ff";
    ctx.shadowBlur = 15;
    drawHexagon(325, 190, 110);
    ctx.stroke();
    ctx.shadowBlur = 0;

    /* ===== User Info Box ===== */
    ctx.font = "bold 34px Arial";
    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "center";
    ctx.fillText(name, 325, 350);

    ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
    ctx.fillRect(60, 390, 530, 360);
    ctx.strokeStyle = "#00ffff";
    ctx.strokeRect(60, 390, 530, 360);

    const data = [
      ["🆔 UID", targetID],
      ["🌐 USERNAME", username],
      ["🚻 GENDER", gender],
      ["💰 BALANCE", "$" + money.toLocaleString()],
      ["🌍 PROFILE", `fb.com/${targetID}`]
    ];

    let yPos = 450;
    data.forEach(([label, value]) => {
      ctx.textAlign = "left";
      ctx.fillStyle = "#00ffff";
      ctx.font = "bold 20px Arial";
      ctx.fillText(label + ":", 90, yPos);

      ctx.fillStyle = "#ffffff";
      ctx.font = "20px Arial";
      // টেক্সট বক্সের ভেতরে রাখার জন্য লিমিট
      let valText = value.length > 25 ? value.substring(0, 22) + "..." : value;
      ctx.fillText(valText, 280, yPos);
      yPos += 60;
    });

    ctx.font = "italic 16px Arial";
    ctx.fillStyle = "#666";
    ctx.textAlign = "center";
    ctx.fillText("© SECURE SYSTEM v5.2", 325, 810);

    const imgPath = path.join(__dirname, "cache", `spy_${targetID}.png`);
    fs.writeFileSync(imgPath, canvas.toBuffer());

    return api.sendMessage(
      { attachment: fs.createReadStream(imgPath) },
      threadID,
      () => fs.unlinkSync(imgPath),
      messageID
    );

  } catch (err) {
    console.error(err);
    api.sendMessage("❌ এরর: তথ্য সংগ্রহ করা সম্ভব হয়নি।", threadID, messageID);
  }
};

const fs = require("fs-extra");
const path = require("path");
const axios = require("axios");
const { createCanvas, loadImage } = require("canvas");

module.exports.config = {
  name: "spy",
  version: "5.0.0",
  hasPermssion: 0,
  credits: "Full Hacker Spy Fix",
  commandCategory: "utility",
  cooldowns: 5
};

module.exports.run = async function ({ api, event, args, Currencies }) {
  const { threadID, messageID, senderID, mentions, type, messageReply } = event;

  try {
    let targetID;
    if (Object.keys(mentions).length > 0) targetID = Object.keys(mentions)[0];
    else if (type === "message_reply") targetID = messageReply.senderID;
    else targetID = args[0] || senderID;

    api.sendMessage("🕶️ Hacker Spy Card তৈরি হচ্ছে...", threadID, messageID);

    const info = await api.getUserInfo(targetID);
    const money = (await Currencies.getData(targetID)).money || 0;

    const name = info[targetID].name || "Unknown";
    const username = info[targetID].vanity || "Not Set";
    const gender =
      info[targetID].gender == 2 ? "Boy" :
      info[targetID].gender == 1 ? "Girl" : "Unknown";

    const profile = `facebook.com/${targetID}`;

    /* ===== Canvas ===== */
    const canvas = createCanvas(650, 820);
    const ctx = canvas.getContext("2d");

    /* ===== Background ===== */
    const bg = ctx.createLinearGradient(0, 0, 650, 820);
    bg.addColorStop(0, "#020111");
    bg.addColorStop(1, "#0b0033");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    /* ===== Outer Border ===== */
    ctx.strokeStyle = "#00ffff";
    ctx.lineWidth = 9;
    ctx.shadowColor = "#00ffff";
    ctx.shadowBlur = 35;
    ctx.strokeRect(20, 20, 610, 780);
    ctx.shadowBlur = 0;

    /* ===== FIXED AVATAR LOAD ===== */
    let avatar;
    try {
      const img = await axios.get(
        `https://graph.facebook.com/${targetID}/picture?type=large`,
        {
          responseType: "arraybuffer",
          headers: { "User-Agent": "Mozilla/5.0" }
        }
      );
      avatar = await loadImage(Buffer.from(img.data));
    } catch {
      avatar = await loadImage("https://i.imgur.com/3ZUrjUP.png");
    }

    /* ===== Hexagon Function ===== */
    function drawHexagon(x, y, size) {
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i - Math.PI / 2;
        ctx.lineTo(x + size * Math.cos(angle), y + size * Math.sin(angle));
      }
      ctx.closePath();
    }

    /* ===== Avatar Clip ===== */
    ctx.save();
    drawHexagon(325, 180, 115);
    ctx.clip();
    ctx.drawImage(avatar, 210, 65, 230, 230);
    ctx.restore();

    /* ===== Hexagon Neon ===== */
    ctx.strokeStyle = "#ff00ff";
    ctx.lineWidth = 8;
    ctx.shadowColor = "#ff00ff";
    ctx.shadowBlur = 30;
    drawHexagon(325, 180, 115);
    ctx.stroke();

    ctx.strokeStyle = "#00ffff";
    ctx.lineWidth = 3;
    ctx.shadowBlur = 0;
    drawHexagon(325, 180, 100);
    ctx.stroke();

    /* ===== Core Glow ===== */
    ctx.save();
    drawHexagon(325, 180, 85);
    ctx.fillStyle = "rgba(0,255,255,0.12)";
    ctx.shadowColor = "#00ffff";
    ctx.shadowBlur = 25;
    ctx.fill();
    ctx.restore();

    /* ===== Scan Ring ===== */
    ctx.beginPath();
    ctx.arc(325, 180, 135, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(255,0,255,0.35)";
    ctx.lineWidth = 2;
    ctx.setLineDash([8, 10]);
    ctx.stroke();
    ctx.setLineDash([]);

    /* ===== Name ===== */
    ctx.font = "bold 34px Arial";
    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "center";
    ctx.fillText(name, 325, 340);

    /* ===== Info Box ===== */
    ctx.fillStyle = "rgba(0,0,0,0.55)";
    ctx.fillRect(60, 380, 530, 340);

    ctx.strokeStyle = "#00ffff";
    ctx.lineWidth = 4;
    ctx.shadowColor = "#00ffff";
    ctx.shadowBlur = 20;
    ctx.strokeRect(60, 380, 530, 340);
    ctx.shadowBlur = 0;

    function fitText(text, x, y, maxWidth) {
      let size = 22;
      do {
        ctx.font = `bold ${size}px Arial`;
        size--;
      } while (ctx.measureText(text).width > maxWidth && size > 14);
      ctx.fillText(text, x, y);
    }

    const data = [
      ["UID", targetID],
      ["USERNAME", username],
      ["GENDER", gender],
      ["BALANCE", "$" + money.toLocaleString()],
      ["PROFILE", profile]
    ];

    let y = 440;
    for (const item of data) {
      ctx.fillStyle = "#00ffff";
      ctx.font = "bold 22px Arial";
      ctx.textAlign = "left";
      ctx.fillText(item[0], 100, y);

      ctx.fillStyle = "#ffffff";
      fitText(item[1], 280, y, 300);
      y += 60;
    }

    /* ===== Footer ===== */
    ctx.font = "italic 16px Arial";
    ctx.textAlign = "center";
    ctx.fillStyle = "#aaaaaa";
    ctx.fillText("⚡ Hacker Spy System ⚡", 325, 760);

    const imgPath = path.join(__dirname, "cache", `spy_${targetID}.png`);
    fs.writeFileSync(imgPath, canvas.toBuffer());

    return api.sendMessage(
      { attachment: fs.createReadStream(imgPath) },
      threadID,
      () => fs.unlinkSync(imgPath),
      messageID
    );

  } catch (err) {
    console.log(err);
    api.sendMessage("❌ Spy Card তৈরি করতে সমস্যা হয়েছে", threadID, messageID);
  }
};

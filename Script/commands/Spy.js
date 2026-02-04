const fs = require("fs-extra");
const path = require("path");
const { createCanvas, loadImage } = require("canvas");

module.exports.config = {
  name: "spy",
  version: "4.0.0",
  hasPermssion: 0,
  credits: "Spy Hacker Upgrade",
  description: "Hacker Style Spy Card",
  commandCategory: "utility",
  cooldowns: 5
};

module.exports.run = async function ({ api, event, args, Users, Currencies }) {

  const { threadID, messageID, senderID, mentions, type, messageReply } = event;

  try {

    let targetID;
    if (Object.keys(mentions).length > 0) targetID = Object.keys(mentions)[0];
    else if (type === "message_reply") targetID = messageReply.senderID;
    else targetID = args[0] && !isNaN(args[0]) ? args[0] : senderID;

    api.sendMessage("🕶 Hacker Spy Card তৈরি হচ্ছে...", threadID, messageID);

    const userInfo = await api.getUserInfo(targetID);
    const money = (await Currencies.getData(targetID)).money || 0;

    const name = userInfo[targetID].name;
    const gender =
      userInfo[targetID].gender == 2 ? "Boy 👦" :
      userInfo[targetID].gender == 1 ? "Girl 👧" :
      "Unknown";

    const username = userInfo[targetID].vanity || "Not Set";
    const fbUrl = `facebook.com/${targetID}`;

    /* ===== Canvas ===== */
    const canvas = createCanvas(650, 850);
    const ctx = canvas.getContext("2d");

    /* ===== BG ===== */
    const bg = ctx.createLinearGradient(0, 0, 650, 850);
    bg.addColorStop(0, "#030014");
    bg.addColorStop(1, "#000000");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    /* ===== Neon Border ===== */
    ctx.strokeStyle = "#00ffff";
    ctx.lineWidth = 6;
    ctx.shadowColor = "#00ffff";
    ctx.shadowBlur = 20;
    ctx.strokeRect(20, 20, 610, 810);
    ctx.shadowBlur = 0;

    /* ===== Avatar Load Fix ===== */
    let avatar;
    try {
      avatar = await loadImage(`https://graph.facebook.com/${targetID}/picture?width=512&height=512`);
    } catch {
      avatar = await loadImage("https://i.imgur.com/4M34hi2.png");
    }

    /* ===== Hexagon Hacker Frame ===== */
    const centerX = 325;
    const centerY = 180;
    const size = 100;

    ctx.save();
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const angle = Math.PI / 3 * i;
      const x = centerX + size * Math.cos(angle);
      const y = centerY + size * Math.sin(angle);
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.clip();

    ctx.drawImage(avatar, centerX - 100, centerY - 100, 200, 200);
    ctx.restore();

    /* ===== Hexagon Neon Border ===== */
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const angle = Math.PI / 3 * i;
      const x = centerX + size * Math.cos(angle);
      const y = centerY + size * Math.sin(angle);
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.closePath();

    ctx.strokeStyle = "#ff00ff";
    ctx.lineWidth = 4;
    ctx.shadowColor = "#ff00ff";
    ctx.shadowBlur = 25;
    ctx.stroke();
    ctx.shadowBlur = 0;

    /* ===== Name ===== */
    ctx.textAlign = "center";
    ctx.font = "bold 34px Arial";
    ctx.fillStyle = "#ffffff";
    ctx.fillText(name, 325, 330);

    ctx.font = "italic 18px Arial";
    ctx.fillStyle = "#bbbbbb";
    ctx.fillText("HACKER SPY PROFILE", 325, 360);

    /* ===== Info Box ===== */
    ctx.fillStyle = "rgba(255,255,255,0.06)";
    ctx.fillRect(70, 390, 510, 360);

    ctx.strokeStyle = "#00ffff";
    ctx.strokeRect(70, 390, 510, 360);

    ctx.textAlign = "left";
    ctx.font = "bold 22px Arial";

    /* ===== Auto Text Fit ===== */
    function drawText(label, value, y) {

      ctx.fillStyle = "#00ffff";
      ctx.fillText(label, 100, y);

      ctx.fillStyle = "#ffffff";

      let text = value.toString();
      let maxWidth = 250;

      while (ctx.measureText(text).width > maxWidth) {
        text = text.slice(0, -1);
      }

      ctx.fillText(text, 300, y);
    }

    drawText("🆔 UID", targetID, 450);
    drawText("👤 USERNAME", username, 510);
    drawText("🚻 GENDER", gender, 570);
    drawText("💰 BALANCE", `$${money.toLocaleString()}`, 630);
    drawText("🌐 PROFILE", fbUrl, 690);

    /* ===== Footer ===== */
    ctx.textAlign = "center";
    ctx.font = "italic 16px Arial";
    ctx.fillStyle = "#888";
    ctx.fillText("⚡ Hacker Spy AI ⚡", 325, 800);

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
    api.sendMessage("❌ Spy Card বানাতে সমস্যা হয়েছে", threadID, messageID);
  }
};

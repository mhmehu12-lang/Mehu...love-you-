const fs = require("fs-extra");
const path = require("path");
const { createCanvas, loadImage } = require("canvas");

module.exports.config = {
  name: "spy",
  version: "3.0.0",
  hasPermssion: 0,
  credits: "Saim × Neon Pro Upgrade",
  description: "Ultra Stylish Neon Spy Card",
  commandCategory: "utility",
  usages: "[mention/reply/uid]",
  cooldowns: 5
};

module.exports.run = async function ({ api, event, args, Users, Currencies }) {
  const { threadID, messageID, senderID, mentions, type, messageReply } = event;

  try {
    let targetID;
    if (Object.keys(mentions).length > 0) targetID = Object.keys(mentions)[0];
    else if (type === "message_reply") targetID = messageReply.senderID;
    else targetID = args[0] && !isNaN(args[0]) ? args[0] : senderID;

    api.sendMessage("⚡ Neon Spy Card বানানো হচ্ছে... 🔮", threadID, messageID);

    const userInfo = await api.getUserInfo(targetID);
    const money = (await Currencies.getData(targetID)).money || 0;

    const name = userInfo[targetID].name.toUpperCase();
    const gender =
      userInfo[targetID].gender == 2 ? "BOY 👦" :
      userInfo[targetID].gender == 1 ? "GIRL 👧" :
      "UNKNOWN 🤷";

    const username = userInfo[targetID].vanity || "NOT SET";
    const fbUrl = `facebook.com/${targetID}`;

    /* ===== Canvas ===== */
    const canvas = createCanvas(650, 850);
    const ctx = canvas.getContext("2d");

    /* ===== Cyber Gradient BG ===== */
    const bg = ctx.createLinearGradient(0, 0, 650, 850);
    bg.addColorStop(0, "#050014");
    bg.addColorStop(0.5, "#12002b");
    bg.addColorStop(1, "#000000");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    /* ===== Outer Neon Frame ===== */
    ctx.lineWidth = 6;
    ctx.strokeStyle = "#00ffff";
    ctx.shadowColor = "#00ffff";
    ctx.shadowBlur = 25;
    ctx.strokeRect(20, 20, 610, 810);
    ctx.shadowBlur = 0;

    /* ===== Avatar ===== */
    const avatarURL = `https://graph.facebook.com/${targetID}/picture?width=512&height=512`;
    const avatar = await loadImage(avatarURL);

    ctx.save();
    ctx.beginPath();
    ctx.arc(325, 185, 95, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(avatar, 230, 90, 190, 190);
    ctx.restore();

    /* ===== Avatar Neon Ring ===== */
    ctx.beginPath();
    ctx.arc(325, 185, 102, 0, Math.PI * 2);
    ctx.strokeStyle = "#ff00ff";
    ctx.lineWidth = 4;
    ctx.shadowColor = "#ff00ff";
    ctx.shadowBlur = 20;
    ctx.stroke();
    ctx.shadowBlur = 0;

    /* ===== Name (Stylish Font + Glow) ===== */
    ctx.textAlign = "center";
    ctx.font = "bold 36px Arial";
    ctx.fillStyle = "#ffffff";
    ctx.shadowColor = "#00ffff";
    ctx.shadowBlur = 20;
    ctx.fillText(name, 325, 330);
    ctx.shadowBlur = 0;

    /* ===== Subtitle ===== */
    ctx.font = "italic 18px Arial";
    ctx.fillStyle = "#bbbbbb";
    ctx.fillText("NEON SPY PROFILE", 325, 360);

    /* ===== Glass Info Box ===== */
    ctx.fillStyle = "rgba(255,255,255,0.08)";
    ctx.fillRect(70, 390, 510, 360);

    ctx.strokeStyle = "#00ffff";
    ctx.lineWidth = 2;
    ctx.strokeRect(70, 390, 510, 360);

    /* ===== Info Text ===== */
    ctx.textAlign = "left";
    ctx.font = "bold 22px Arial";

    const info = [
      ["🆔 UID", targetID],
      ["👤 USERNAME", username],
      ["🚻 GENDER", gender],
      ["💰 BALANCE", `$${money.toLocaleString()}`],
      ["🌐 PROFILE", fbUrl]
    ];

    let y = 450;
    for (const [label, value] of info) {
      ctx.fillStyle = "#00ffff";
      ctx.shadowColor = "#00ffff";
      ctx.shadowBlur = 10;
      ctx.fillText(label, 100, y);

      ctx.shadowBlur = 0;
      ctx.fillStyle = "#ffffff";
      ctx.fillText(value, 300, y);

      y += 60;
    }

    /* ===== Footer ===== */
    ctx.textAlign = "center";
    ctx.font = "italic 16px Arial";
    ctx.fillStyle = "#888888";
    ctx.fillText("⚡ Powered by Neon Spy AI ⚡", 325, 800);

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
    return api.sendMessage("❌ Neon Spy Card বানাতে সমস্যা হয়েছে!", threadID, messageID);
  }
};

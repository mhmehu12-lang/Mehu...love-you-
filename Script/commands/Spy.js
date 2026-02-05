const fs = require("fs-extra");
const path = require("path");
const axios = require("axios");
const { createCanvas, loadImage } = require("canvas");

module.exports.config = {
  name: "spy",
  version: "2.0.0",
  author: "HAMIM x AI",
  role: 0,
  shortDescription: "Stylish hacker profile card",
  longDescription: "Generate hacker style spy profile with neon logo",
  category: "image",
  guide: "{pn}"
};

module.exports.run = async function ({ api, event }) {
  try {
    const uid = event.senderID;
    const imgPath = path.join(__dirname, "cache", `spy_${uid}.png`);

    // profile pic load
    const avatarURL = `https://graph.facebook.com/${uid}/picture?width=512&height=512`;
    const avatar = await loadImage(
      (await axios.get(avatarURL, { responseType: "arraybuffer" })).data
    );

    const canvas = createCanvas(800, 450);
    const ctx = canvas.getContext("2d");

    // ==== Background ====
    const bg = ctx.createLinearGradient(0, 0, 800, 450);
    bg.addColorStop(0, "#050505");
    bg.addColorStop(1, "#0f2027");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, 800, 450);

    // ==== Neon light lines ====
    ctx.shadowBlur = 20;
    ctx.shadowColor = "#00ffe1";
    ctx.strokeStyle = "#00ffe1";
    ctx.lineWidth = 3;
    ctx.strokeRect(20, 20, 760, 410);

    // ==== Hacker logo circle ====
    const cx = 140;
    const cy = 225;
    const r = 90;

    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();

    ctx.drawImage(avatar, cx - r, cy - r, r * 2, r * 2);
    ctx.restore();

    // glow ring
    ctx.beginPath();
    ctx.arc(cx, cy, r + 5, 0, Math.PI * 2);
    ctx.strokeStyle = "#00ffcc";
    ctx.lineWidth = 6;
    ctx.shadowBlur = 25;
    ctx.shadowColor = "#00ffcc";
    ctx.stroke();

    // ==== Text box ====
    ctx.shadowBlur = 0;
    ctx.fillStyle = "rgba(0,0,0,0.6)";
    ctx.fillRect(260, 120, 470, 210);

    ctx.strokeStyle = "#00ffe1";
    ctx.strokeRect(260, 120, 470, 210);

    // ==== Text ====
    ctx.fillStyle = "#00ffe1";
    ctx.font = "bold 32px Arial";
    ctx.fillText("SPY PROFILE", 300, 170);

    ctx.font = "22px Arial";
    ctx.fillText(`USER ID : ${uid}`, 300, 215);
    ctx.fillText("STATUS : ACTIVE", 300, 255);
    ctx.fillText("LEVEL  : ELITE", 300, 295);

    // ==== Save image ====
    fs.ensureDirSync(path.join(__dirname, "cache"));
    fs.writeFileSync(imgPath, canvas.toBuffer("image/png"));

    api.sendMessage(
      {
        body: "🕶️ Hacker style spy profile ready!",
        attachment: fs.createReadStream(imgPath)
      },
      event.threadID,
      () => fs.unlinkSync(imgPath)
    );

  } catch (err) {
    api.sendMessage("❌ Profile generate korte problem hocche!", event.threadID);
    console.error(err);
  }
};

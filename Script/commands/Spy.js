-install spy.js const fs = require("fs");
const axios = require("axios");
const { createCanvas, loadImage } = require("canvas");
const path = require("path");

module.exports = {
  config: {
    name: "hackprofile",
    version: "2.0.0",
    author: "Upgraded by ChatGPT",
    role: 0,
    shortDescription: "Ultra Hacker Style Fake Profile",
    longDescription: "Generate neon hacker spy profile card",
    category: "fun",
    guide: "{pn} <facebook_uid>"
  },

  onStart: async function ({ api, event, args }) {
    const uid = args[0] || event.senderID;
    const canvas = createCanvas(1080, 1080);
    const ctx = canvas.getContext("2d");

    // Background
    ctx.fillStyle = "#05060a";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Neon Border
    ctx.strokeStyle = "#00fff0";
    ctx.lineWidth = 12;
    ctx.strokeRect(30, 30, 1020, 1020);

    // Title
    ctx.font = "bold 60px Arial";
    ctx.fillStyle = "#00fff0";
    ctx.textAlign = "center";
    ctx.fillText("HACKER SPY PROFILE", 540, 120);

    // Avatar Hexagon
    const avatarX = 540;
    const avatarY = 320;
    const r = 140;

    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 3) * i - Math.PI / 2;
      const x = avatarX + r * Math.cos(angle);
      const y = avatarY + r * Math.sin(angle);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.strokeStyle = "#ff00ff";
    ctx.lineWidth = 10;
    ctx.stroke();
    ctx.clip();

    // Load Facebook DP
    let avatar;
    try {
      avatar = await loadImage(`https://graph.facebook.com/${uid}/picture?width=512&height=512`);
    } catch {
      avatar = await loadImage("https://i.imgur.com/8Km9tLL.png");
    }

    ctx.drawImage(avatar, avatarX - r, avatarY - r, r * 2, r * 2);
    ctx.restore();

    // Info Box
    ctx.strokeStyle = "#00fff0";
    ctx.lineWidth = 6;
    ctx.strokeRect(180, 520, 720, 360);

    ctx.font = "36px Arial";
    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "left";

    const infoX = 220;
    let infoY = 600;

    ctx.fillText(`UID      : ${uid}`, infoX, infoY);
    infoY += 70;
    ctx.fillText(`USERNAME : Not Set`, infoX, infoY);
    infoY += 70;
    ctx.fillText(`GENDER   : Boy`, infoX, infoY);
    infoY += 70;
    ctx.fillText(`BALANCE  : $0`, infoX, infoY);
    infoY += 70;
    ctx.fillText(`PROFILE  : facebook.com/${uid}`, infoX, infoY);

    const imgPath = path.join(__dirname, "cache", `hack_${uid}.png`);
    fs.writeFileSync(imgPath, canvas.toBuffer());

    api.sendMessage(
      { body: "⚡ Hacker Profile Generated ⚡", attachment: fs.createReadStream(imgPath) },
      event.threadID,
      () => fs.unlinkSync(imgPath)
    );
  }
};

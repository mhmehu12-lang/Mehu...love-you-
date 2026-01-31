module.exports.config = {
  name: "love15",
  version: "1.0.4",
  hasPermssion: 0,
  credits: "🔰𝐑𝐀𝐇𝐀𝐓 𝐈𝐒𝐋𝐀𝐌🔰",
  description: "Match yourself with a tagged or replied user",
  commandCategory: "🩵love🩵",
  usages: "[@mention/reply/UID/link/name]",
  cooldowns: 5,
  dependencies: {
    "axios": "",
    "fs-extra": "",
    "jimp": "",
    "path": ""
  }
};

// ===== Helper: Full Name Mention Detection =====
async function getUIDByFullName(api, threadID, body) {
  if (!body.includes("@")) return null;

  const match = body.match(/@(.+)/);
  if (!match) return null;

  const targetName = match[1].trim().toLowerCase().replace(/\s+/g, " ");
  const threadInfo = await api.getThreadInfo(threadID);
  const users = threadInfo.userInfo || [];

  const user = users.find(u => {
    if (!u.name) return false;
    const fullName = u.name.trim().toLowerCase().replace(/\s+/g, " ");
    return fullName === targetName;
  });

  return user ? user.id : null;
}

module.exports.onLoad = async () => {
  const lockedCredit = Buffer.from("clggQWRkdWxsYWg=", "base64").toString("utf-8");
  if (module.exports.config.credits !== lockedCredit) {
    module.exports.config.credits = lockedCredit;
    global.creditChanged = true;
  }

  const { resolve } = global.nodemodule["path"];
  const { existsSync, mkdirSync } = global.nodemodule["fs-extra"];
  const { downloadFile } = global.utils;

  const dirMaterial = __dirname + `/cache/canvas/`;
  const pathImg = resolve(__dirname, 'cache/canvas', 'maria.png');

  if (!existsSync(dirMaterial)) mkdirSync(dirMaterial, { recursive: true });
  if (!existsSync(pathImg))
    await downloadFile("https://i.imgur.com/example.png", pathImg);
};

async function makeImage({ one, two }) {
  const fs = global.nodemodule["fs-extra"];
  const path = global.nodemodule["path"];
  const axios = global.nodemodule["axios"];
  const jimp = global.nodemodule["jimp"];

  const __root = path.resolve(__dirname, "cache", "canvas");
  const pairing_img = await jimp.read(__root + "/maria.png");

  const pathImg = __root + `/pairing_${one}_${two}.png`;
  const avatarOne = __root + `/avt_${one}.png`;
  const avatarTwo = __root + `/avt_${two}.png`;

  const avt1 = (await axios.get(
    `https://graph.facebook.com/${one}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`,
    { responseType: "arraybuffer" }
  )).data;

  const avt2 = (await axios.get(
    `https://graph.facebook.com/${two}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`,
    { responseType: "arraybuffer" }
  )).data;

  fs.writeFileSync(avatarOne, Buffer.from(avt1));
  fs.writeFileSync(avatarTwo, Buffer.from(avt2));

  const circleOne = await jimp.read(await circle(avatarOne));
  const circleTwo = await jimp.read(await circle(avatarTwo));

  pairing_img
    .composite(circleOne.resize(145, 145), 159, 167)
    .composite(circleTwo.resize(145, 145), 442, 172);

  const raw = await pairing_img.getBufferAsync("image/png");
  fs.writeFileSync(pathImg, raw);

  fs.unlinkSync(avatarOne);
  fs.unlinkSync(avatarTwo);

  return pathImg;
}

async function circle(image) {
  const jimp = require("jimp");
  const img = await jimp.read(image);
  img.circle();
  return img.getBufferAsync("image/png");
}

module.exports.run = async function ({ api, event, args }) {
  const fs = require("fs-extra");
  const { threadID, messageID, senderID } = event;

  if (global.creditChanged) {
    api.sendMessage("", threadID);
    global.creditChanged = false;
  }

  let partnerID;

  if (event.type === "message_reply") {
    partnerID = event.messageReply.senderID;
  } else if (args[0]) {
    if (args[0].includes(".com/")) {
      try {
        partnerID = await api.getUID(args[0]);
      } catch {
        partnerID = null;
      }
    } else if (args.join(" ").includes("@")) {
      partnerID = Object.keys(event.mentions || {})[0]
        || await getUIDByFullName(api, threadID, args.join(" "));
    } else {
      partnerID = args[0];
    }
  }

  if (!partnerID)
    return api.sendMessage("❌ কাউকে মেনশন বা রিপ্লাই করো নাই", threadID, messageID);

  if (partnerID === senderID)
    return api.sendMessage("🙄 নিজের সাথে লাভ হিসাব করা যাবে না", threadID, messageID);

  const userInfo = await api.getUserInfo([senderID, partnerID]);
  const senderName = userInfo[senderID]?.name || "You";
  const partnerName = userInfo[partnerID]?.name || "Partner";

  const rates = ['21%', '67%', '19%', '37%', '17%', '96%', '52%', '62%', '76%', '83%', '100%', '99%', '0%', '48%'];
  const matchRate = rates[Math.floor(Math.random() * rates.length)];

  const comments = {
    '100%': '💯 পারফেক্ট ম্যাচ!',
    '99%': '😍 প্রায় পারফেক্ট!',
    '96%': '❤️‍🔥 দারুণ মিল!',
    '83%': '💖 ভালো ম্যাচ!',
    '76%': '💕 সুন্দর সম্ভাবনা!',
    '67%': '😊 ভালো!',
    '62%': '🙂 মোটামুটি!',
    '52%': '😐 ৫০-৫০!',
    '48%': '🤔 একটু কঠিন!',
    '37%': '😅 কম!',
    '21%': '😬 খুব কম!',
    '19%': '😕 নেই বললেই চলে!',
    '17%': '😔 খারাপ!',
    '0%': '😭 কোন মিল নেই!'
  };

  return makeImage({ one: senderID, two: partnerID }).then(pathImg => {
    api.sendMessage({
      body:
        `💞 ${senderName} ❤️ ${partnerName}\n` +
        `📊 ম্যাচিং: ${matchRate}\n` +
        `💬 ${comments[matchRate]}`,
      mentions: [
        { id: senderID, tag: senderName },
        { id: partnerID, tag: partnerName }
      ],
      attachment: fs.createReadStream(pathImg)
    }, threadID, () => fs.unlinkSync(pathImg), messageID);
  }).catch(() => {
    api.sendMessage("❌ ছবি বানাতে সমস্যা হয়েছে!", threadID, messageID);
  });
};

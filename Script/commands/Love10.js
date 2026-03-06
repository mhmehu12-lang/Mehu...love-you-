const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports.config = {
  name: "love",
  version: "1.0.0",
  hasPermssion: 0,
  credits: "SHAHADAT SAHU",
  description: "Generate a couple banner image using sender and target Facebook UID via Avatar Canvas API",
  commandCategory: "banner",
  usePrefix: true,
  usages: "[@mention | reply]",
  cooldowns: 5
};

module.exports.run = async function ({ event, api }) {
  const { threadID, messageID, mentions, messageReply, senderID } = event;

  let targetID = null;
  if (mentions && Object.keys(mentions).length > 0) {
    targetID = Object.keys(mentions)[0];
  } else if (messageReply && messageReply.senderID) {
    targetID = messageReply.senderID;
  }

  if (!targetID) {
    return api.sendMessage("Please reply or mention someone......", threadID, messageID);
  }

  const captions = [
    "💖 ⎯͢⎯⃝🩷😽 তুমি আমার চোখেতে সরলতার উপমা ⎯͢⎯⃝🩷🐰🍒",
    "💖 🥺❤️ প্রিয়.....! 😊\nকখনো কাঁদাও, কখনো হাসাও,\nআবার কখনো এমন ভালোবাসা দাও,\nযেন পৃথিবীর সব সুখ তোমার মাঝে খুঁজে পাই...! 💔❤️",
    "বিচ্ছেদের পরেও যোগাযোগ রাখার নামই হচ্ছে মায়া ____💖 💗🌺",
    "মানুষ ছেড়ে যায়, কিন্তু স্মৃতি নয়!💖",
    "ইচ্ছে 'গুলো শব্দহীন...!! ভাবনা সে-তো প্রতি দিন..! 🌸💔",
    "ভালোবাসা মানে কেবল প্রেম নয়, বরং যার হাসিতে সকাল শুরু হয় 💖",
    "যে সম্পর্ক চোখে দেখা যায় না, মনে থাকে— সেটাই সত্যিকারের ভালোবাসা 💗",
    "তুমি হয়তো দূরে আছো, কিন্তু অনুভূতির ঠিকানা এখনো তুমি!💞",
    "চোখের ভাষা বোঝে যে, সেই প্রিয় ❤️",
    "তুমি মিষ্টি অভ্যাস— যাকে ছাড়াও থাকা যায় না 💖"
  ];

  const caption = captions[Math.floor(Math.random() * captions.length)];

  try {
    const apiList = await axios.get(
      "https://raw.githubusercontent.com/shahadat-sahu/SAHU-API/refs/heads/main/SAHU-API.json"
    );

    const AVATAR_CANVAS_API = apiList.data.AvatarCanvas;

    const res = await axios.post(
      `${AVATAR_CANVAS_API}/api`,
      {
        cmd: "love",
        senderID,
        targetID
      },
      { responseType: "arraybuffer", timeout: 20000 }
    );

    const imgPath = path.join(__dirname, "cache", `love_${senderID}_${targetID}.png`);
    fs.writeFileSync(imgPath, Buffer.from(res.data));

    return api.sendMessage(
      {
        body: caption,
        attachment: fs.createReadStream(imgPath)
      },
      threadID,
      () => fs.unlinkSync(imgPath),
      messageID
    );

  } catch {
    return api.sendMessage("API Error Call Boss SAHU", threadID, messageID);
  }
};

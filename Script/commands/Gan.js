const fs = require("fs");
const axios = require("axios");
const path = require("path");

let lastPlayed = -1;

module.exports.config = {
  name: "gan",
  version: "1.0.3",
  hasPermssion: 0,
  credits: "MOHAMMAD AKASH",
  description: "Play random song 🎶",
  commandCategory: "media",
  usages: "gan",
  cooldowns: 5
};

module.exports.run = async function ({ api, event }) {
  const { threadID, messageID } = event;

  const songLinks = [
    "https://files.catbox.moe/etsdn9.mp3",
    "https://files.catbox.moe/ayepdz.mp3",
    "https://files.catbox.moe/oaecnx.mp3",
    "https://files.catbox.moe/xtpf61.mp3",
    "https://files.catbox.moe/12grz0.mp3",
    "https://files.catbox.moe/aaqddo.mp3",
    "https://files.catbox.moe/k3acvx.mp3",
    "https://files.catbox.moe/nry1qv.mp3",
    "https://files.catbox.moe/23e8u1.mp3",
    "https://files.catbox.moe/y8dzik.mp3",
    "https://files.catbox.moe/z9d2e6.mp3",
    "https://files.catbox.moe/0xscc8.mp3",
    "https://files.catbox.moe/q4m2ad.mp3",
    "https://files.catbox.moe/y8bg4r.mp3",
    "https://files.catbox.moe/q61co1.mp3",
    "https://files.catbox.moe/euq7fo.mp3",
    "https://files.catbox.moe/x5f56o.mp3",
    "https://files.catbox.moe/avlqok.mp3",
    "https://files.catbox.moe/v0twt3.mp3",
    "https://files.catbox.moe/qmpvpt.mp3",

    // Google Drive direct links
    "https://drive.google.com/uc?export=download&id=1X_J00k_go_u3MKqKwvZOcypQ-dL6DMAm",
    "https://drive.google.com/uc?export=download&id=1nLq8wKxcxK6nb-8SmJ1nPxNHx9Fzabr8",
    "https://drive.google.com/uc?export=download&id=1w972wKW72haSYHhcIZ_CIpRRv0UAf5TS",
    "https://drive.google.com/uc?export=download&id=1KLAtG03-O7GObVSo7YhkUd84tSTXQOL7",
    "https://drive.google.com/uc?export=download&id=1a3qcxjTi6W6wL4vItVY-SZ7aRpJISpLC",
    "https://drive.google.com/uc?export=download&id=1R2thfTrK3Xk842axn1mPrJ8AdPh8xpLf",
    "https://drive.google.com/uc?export=download&id=1nde8BkUjfD7F5fAM6WvAj6usHGjra4Ln",
    "https://drive.google.com/uc?export=download&id=1JVrIeRhhLUg-qOkRzvZCtI-CGrdfrHvq",
    "https://drive.google.com/uc?export=download&id=1uObNiYcCBbpTNZejRYavBKZGlclD2k3v",
    "https://drive.google.com/uc?export=download&id=1FN1kr3jma9i8opILdeMpH67lHjeJ3NIT",
    "https://drive.google.com/uc?export=download&id=1V2wYr_sGIBckvVrwGmpQXoZ_bj1jR6DY",
    "https://drive.google.com/uc?export=download&id=1FsQbt14Jw7gpvaabkBSgJDCefMLU8Pxq",
    "https://drive.google.com/uc?export=download&id=1ylJsOdaJ53GDITZ6_X-ET5PdnFAW93g1",
    "https://drive.google.com/uc?export=download&id=1Gj7ls2QwDmM-3nN7AXUxPPcGV8hdm59w"
  ];

  if (!songLinks.length) {
    return api.sendMessage("❌ কোনো গান পাওয়া যায়নি!", threadID, messageID);
  }

  // 🎵 React
  api.setMessageReaction("🎶", messageID, () => {}, true);

  // 🎲 Random (no repeat)
  let index;
  do {
    index = Math.floor(Math.random() * songLinks.length);
  } while (index === lastPlayed && songLinks.length > 1);
  lastPlayed = index;

  const url = songLinks[index];
  const cacheDir = path.join(__dirname, "cache");
  const filePath = path.join(cacheDir, `gan_${Date.now()}.mp3`);

  try {
    fs.mkdirSync(cacheDir, { recursive: true });

    const res = await axios.get(url, {
      responseType: "stream",
      timeout: 20000
    });

    const writer = fs.createWriteStream(filePath);
    res.data.pipe(writer);

    writer.on("finish", () => {
      api.sendMessage(
        {
          body: "🎧 Enjoy your song 🎶",
          attachment: fs.createReadStream(filePath)
        },
        threadID,
        () => fs.unlinkSync(filePath),
        messageID
      );
    });

    writer.on("error", () => {
      api.sendMessage("❌ গান পাঠাতে সমস্যা হয়েছে!", threadID, messageID);
    });

  } catch (err) {
    console.error("GAN CMD ERROR:", err.message);
    api.sendMessage("⚠️ গান ডাউনলোড করা যায়নি!", threadID, messageID);
  }
};

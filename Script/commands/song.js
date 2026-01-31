const axios = require("axios");
const fs = require("fs");
const path = require("path");
const ytSearch = require("yt-search");
const https = require("https");

/* ================= AUTO DELETE FILE ================= */
function deleteAfterTimeout(filePath, timeout = 15000) {
  setTimeout(() => {
    if (fs.existsSync(filePath)) {
      fs.unlink(filePath, () => {});
    }
  }, timeout);
}

module.exports = {
  config: {
    name: "song",
    aliases: ["music"],
    version: "4.2.0",
    author: "MR᭄﹅ MAHABUB﹅ メꪜ (Edited for Mirai)",
    role: 0,
    shortDescription: "Download song from YouTube",
    longDescription: "Search YouTube and send MP3 audio",
    category: "media",
    guide: "{p}song <song name>"
  },

  onStart: async function ({ api, event, args }) {
    if (!args.length) {
      return api.sendMessage(
        "❌ গান নাম লিখবি না? 😾\nউদাহরণ: song Aadat",
        event.threadID,
        event.messageID
      );
    }

    const songName = args.join(" ");
    let searchingMsg;

    try {
      searchingMsg = await api.sendMessage(
        `🔍 খুঁজতেছি: ${songName}`,
        event.threadID
      );

      const search = await ytSearch(songName);
      if (!search.videos.length) throw new Error("কোন গান পাওয়া যায় নাই");

      const video = search.videos[0];

      // ⏱️ 10 মিনিটের বেশি হলে বাদ
      if (video.seconds > 600) {
        return api.editMessage(
          "❌ গানটা অনেক লম্বা (10 মিনিটের বেশি)",
          searchingMsg.messageID
        );
      }

      const ytUrl = `https://youtu.be/${video.videoId}`;
      const apiUrl = `https://mahabub-apis.fun/mahabub/ytmp3?url=${encodeURIComponent(
        ytUrl
      )}`;

      const res = await axios.get(apiUrl);
      if (res.data.status !== "success") {
        throw new Error("Audio generate করা যায় নাই");
      }

      const title = res.data.title || video.title;
      const audioUrl = res.data.audio;

      await api.editMessage(
        `⬇ ডাউনলোড হচ্ছে...\n🎵 ${title}`,
        searchingMsg.messageID
      );

      const cacheDir = path.join(__dirname, "cache");
      if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir);

      const safeName = title.replace(/[^a-zA-Z0-9]/g, "_").slice(0, 25);
      const filePath = path.join(cacheDir, `${safeName}.mp3`);

      const file = fs.createWriteStream(filePath);
      await new Promise((resolve, reject) => {
        https.get(audioUrl, res => {
          if (res.statusCode !== 200) return reject();
          res.pipe(file);
          file.on("finish", () => file.close(resolve));
        }).on("error", reject);
      });

      await api.sendMessage(
        {
          body: `🎶 ${title}\n✅ Enjoy bro 😌`,
          attachment: fs.createReadStream(filePath)
        },
        event.threadID,
        () => deleteAfterTimeout(filePath, 10000),
        event.messageID
      );

      await api.editMessage(`✅ পাঠানো হয়েছে: ${title}`, searchingMsg.messageID);

    } catch (err) {
      console.log(err);
      if (searchingMsg?.messageID) {
        api.editMessage(
          "❌ গান পাঠানো সম্ভব হলো না 😿",
          searchingMsg.messageID
        );
      } else {
        api.sendMessage(
          "❌ Error হয়েছে",
          event.threadID,
          event.messageID
        );
      }
    }
  }
};

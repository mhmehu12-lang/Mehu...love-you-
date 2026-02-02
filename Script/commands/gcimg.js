const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

const baseApiUrl = async () => {
  const base = await axios.get("https://raw.githubusercontent.com/Mostakim0978/D1PT0/refs/heads/main/baseApiUrl.json");
  return base.data.api;
};

async function getAvatarUrls(userIDs) {
  const avatarURLs = [];
  for (let userID of userIDs) {
    try {
      // Facebook Graph API for Avatars
      avatarURLs.push(`https://graph.facebook.com/${userID}/picture?height=500&width=500&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`);
    } catch (err) {
      avatarURLs.push("https://i.ibb.co/qk0bnY8/363492156-824459359287620-3125820102191295474-n-png-nc-cat-1-ccb-1-7-nc-sid-5f2048-nc-eui2-Ae-HIhi-I.png");
    }
  }
  return avatarURLs;
}

module.exports.config = {
  name: "gcimg",
  version: "1.1",
  hasPermssion: 0,
  credits: "nexo_here",
  description: "Generate a styled group image with profile pictures",
  commandCategory: "Ai-Image",
  usages: "[--color white] [--bgcolor black] etc.",
  cooldowns: 5
};

module.exports.run = async function ({ api, event, args }) {
  const { threadID, messageID } = event;

  try {
    let textColor = "white", bgColor = null, adminColor = "yellow", memberColor = "cyan", borderColor = "lime", glow = false;

    // Parsing arguments
    for (let i = 0; i < args.length; i++) {
      if (args[i] === "--color") textColor = args[++i];
      if (args[i] === "--bgcolor") bgColor = args[++i];
      if (args[i] === "--admincolor") adminColor = args[++i];
      if (args[i] === "--membercolor") memberColor = args[++i];
      if (args[i] === "--groupBorder") borderColor = args[++i];
      if (args[i] === "--glow") glow = args[++i]?.toLowerCase() === "true";
    }

    api.sendMessage("🛠️ | Generating group image, please wait...", threadID, messageID);

    const threadInfo = await api.getThreadInfo(threadID);
    const participantIDs = threadInfo.participantIDs;
    const adminIDs = threadInfo.adminIDs.map(admin => admin.id);

    const memberAvatars = await getAvatarUrls(participantIDs);
    const adminAvatars = await getAvatarUrls(adminIDs);

    const payload = {
      groupName: threadInfo.threadName || "Group Chat",
      groupPhotoURL: threadInfo.imageSrc || "https://i.ibb.co/qk0bnY8/default.png",
      memberURLs: memberAvatars,
      adminURLs: adminAvatars,
      color: textColor,
      bgcolor: bgColor,
      admincolor: adminColor,
      membercolor: memberColor,
      groupborderColor: borderColor,
      glow
    };

    const baseUrl = await baseApiUrl();
    const response = await axios.post(`${baseUrl}/gcimg`, payload, { responseType: "arraybuffer" });

    const cachePath = path.join(__dirname, "cache", `gcimg_${threadID}.png`);
    if (!fs.existsSync(path.join(__dirname, "cache"))) fs.mkdirSync(path.join(__dirname, "cache"));

    fs.writeFileSync(cachePath, Buffer.from(response.data, "binary"));

    return api.sendMessage({
      body: "✨ | Here's your group image:",
      attachment: fs.createReadStream(cachePath)
    }, threadID, () => {
      if (fs.existsSync(cachePath)) fs.unlinkSync(cachePath);
    }, messageID);

  } catch (err) {
    console.error(err);
    return api.sendMessage(`❌ | Error: ${err.message}`, threadID, messageID);
  }
};

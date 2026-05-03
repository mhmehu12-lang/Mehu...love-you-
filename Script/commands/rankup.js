module.exports.config = {
  name: "rankup",
  version: "5.0.0",
  hasPermssion: 1,
  credits: "Edited by GPT",
  description: "Smart emoji rankup",
  commandCategory: "System",
  dependencies: {},
  cooldowns: 2,
};

module.exports.handleEvent = async function ({ api, event, Currencies }) {
  var { threadID, senderID } = event;

  threadID = String(threadID);
  senderID = String(senderID);

  const thread = global.data.threadData.get(threadID) || {};

  let exp = (await Currencies.getData(senderID)).exp;
  exp = exp + 1;

  if (isNaN(exp)) return;

  if (typeof thread["rankup"] != "undefined" && thread["rankup"] == false) {
    await Currencies.setData(senderID, { exp });
    return;
  }

  const curLevel = Math.floor(Math.sqrt(1 + (4 * exp / 3) + 1) / 2);
  const level = Math.floor(Math.sqrt(1 + (4 * (exp + 1) / 3) + 1) / 2);

  if (level > curLevel && level != 1) {

    // 🔥 Emoji packs by level
    let emojiPack;

    if (level < 5) {
      emojiPack = ["✨", "🎉", "🔥", "💫"];
    } 
    else if (level < 10) {
      emojiPack = ["🚀", "🔥", "⚡", "🎯"];
    } 
    else if (level < 20) {
      emojiPack = ["👑", "💎", "🏆", "🔥"];
    } 
    else {
      emojiPack = ["👑🔥", "💀👑", "⚡👑", "🚀💎"];
    }

    // 🎲 Random emoji pick
    const msg = emojiPack[Math.floor(Math.random() * emojiPack.length)];

    api.sendMessage(msg, threadID);
  }

  await Currencies.setData(senderID, { exp });
  return;
};

module.exports.run = async function () {
  return;
};

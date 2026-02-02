module.exports.config = {
  name: "grouplock",
  version: "1.5.0",
  hasPermssion: 1, // Admin only
  credits: "Md Hamim",
  description: "Group name, icon, and Chat lock system",
  commandCategory: "admin",
  usages: "chat [on/off] / name [on/off]",
  cooldowns: 5
};

module.exports.run = async function({ api, event, args, Threads }) {
  const { threadID, messageID } = event;
  let data = (await Threads.getData(threadID)).data || {};

  if (!args[0]) return api.sendMessage("❌ Hamim, ki lock korben? (chat/name/icon)", threadID, messageID);
  
  const type = args[0].toLowerCase();
  const status = args[1]?.toLowerCase();

  if (type === "chat") {
    if (status === "on") {
      data.chatLock = true;
      await Threads.setData(threadID, { data });
      return api.sendMessage("🔒 **Group Locked!** Ekhon theke Md Hamim ba Admin chara keu message dite parbe na.", threadID, messageID);
    } else {
      data.chatLock = false;
      await Threads.setData(threadID, { data });
      return api.sendMessage("🔓 **Group Unlocked!** Ekhon shobai message dite parbe.", threadID, messageID);
    }
  }

  // Ager name/icon lock logic ekhane thakbe...
};

module.exports.handleEvent = async function({ api, event, Threads, Users }) {
  const { threadID, author, body, messageID } = event;
  const botID = api.getCurrentUserID();
  let data = (await Threads.getData(threadID)).data || {};

  // Chat Lock Logic
  if (data.chatLock && author !== botID) {
    // Check if the author is an Admin
    const threadInfo = await api.getThreadInfo(threadID);
    const isAdmin = threadInfo.adminIDs.some(item => item.id == author);

    if (!isAdmin) {
      // 1. Delete the message (Bot-ke Admin hote hobe)
      api.unsendMessage(messageID);

      // 2. Send Warning (Optional - bar bar na pathanor jonno cooldown deya bhalo)
      // api.sendMessage(`🚫 Sorry, ekhon shudhu Admin-ra message dite parbe.`, threadID);
    }
  }
};

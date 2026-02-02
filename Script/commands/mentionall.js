module.exports.config = {
  name: "mentionall",
  version: "1.2.0",
  hasPermssion: 1, 
  credits: "Md Hamim",
  description: "প্রতি ২ সেকেন্ড পর পর একজনকে আলাদা মেসেজে মেনশন দিবে",
  commandCategory: "group",
  usages: "[মেসেজ]",
  cooldowns: 30
};

module.exports.run = async function({ api, event, args }) {
  const { threadID, messageID, senderID } = event;

  try {
    const threadInfo = await api.getThreadInfo(threadID);
    const participantIDs = threadInfo.participantIDs;
    const userInfo = threadInfo.userInfo;

    let inputMessage = args.join(" ") || "আপনাকে মেনশন করা হয়েছে!";
    
    // বটের আইডি এবং যে কমান্ড দিচ্ছে তার আইডি বাদ দিয়ে লিস্ট করা
    const listIDs = participantIDs.filter(id => id !== api.getCurrentUserID() && id !== senderID);

    api.sendMessage(`🔔 মেনশন প্রসেস শুরু হয়েছে। মোট ${listIDs.length} জন মেম্বারকে মেনশন দেওয়া হবে।`, threadID);

    // লুপ চালিয়ে একজন একজন করে মেনশন দেওয়া
    for (let i = 0; i < listIDs.length; i++) {
      const id = listIDs[i];
      const user = userInfo.find(u => u.id == id);
      const name = user ? user.name : "Facebook User";

      const msg = {
        body: `👤 ${name} ${inputMessage}`,
        mentions: [{
          tag: name,
          id: id
        }]
      };

      // মেসেজ পাঠানো
      api.sendMessage(msg, threadID);

      // ২ সেকেন্ড ওয়েট করা (২০০০ মিলিসেকেন্ড)
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    return api.sendMessage("✅ সবাইকে মেনশন দেওয়া শেষ হয়েছে।", threadID);

  } catch (err) {
    console.error(err);
    return api.sendMessage("❌ মেনশন দিতে গিয়ে একটি সমস্যা হয়েছে।", threadID, messageID);
  }
};

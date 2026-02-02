module.exports.config = {
  name: "tagall",
  version: "1.0.5",
  hasPermssion: 1, // শুধু অ্যাডমিনরা পারবে
  credits: "Gemini AI",
  description: "গ্রুপের সবাইকে নাম ধরে রিয়েল মেনশন দিন",
  commandCategory: "group",
  usages: "[মেসেজ]",
  cooldowns: 10
};

module.exports.run = async function({ api, event, args }) {
  const { threadID, messageID } = event;

  try {
    // গ্রুপের মেম্বার লিস্ট এবং নাম নেওয়া
    const threadInfo = await api.getThreadInfo(threadID);
    const participantIDs = threadInfo.participantIDs;
    
    // ইউজারদের নাম নামানোর জন্য
    const storage = threadInfo.userInfo;

    let inputMessage = args.join(" ") || "সবাইকে মেনশন করা হয়েছে!";
    let body = `📣 ${inputMessage}\n\n`;
    let mentions = [];

    for (let id of participantIDs) {
      // বটের নিজের আইডি বাদ দেওয়া
      if (id == api.getCurrentUserID()) continue;

      // মেম্বারের নাম খুঁজে বের করা
      let name = storage.find(u => u.id == id)?.name || "Facebook User";
      
      // বডিতে নাম যোগ করা এবং মেনশন ডাটা তৈরি করা
      let start = body.length;
      body += `🔹 ${name}\n`;
      
      mentions.push({
        tag: name,
        id: id,
        fromIndex: start + 2 // '🔹 ' এর পরের অংশ থেকে নাম শুরু
      });
    }

    return api.sendMessage({
      body: body,
      mentions: mentions
    }, threadID, messageID);

  } catch (e) {
    console.error(e);
    return api.sendMessage("দুঃখিত, বড় গ্রুপ হওয়ার কারণে নাম লোড করা যাচ্ছে না।", threadID, messageID);
  }
};

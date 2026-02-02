module.exports.config = {
  name: "tagall",
  version: "1.1.0",
  hasPermssion: 1, // ০ দিলে সবাই পারবে, ১ দিলে শুধু অ্যাডমিন
  credits: "Md Hamim",
  description: "গ্রুপের সবাইকে নাম ধরে সিরিয়াল অনুযায়ী মেনশন দিন",
  commandCategory: "group",
  usages: "[মেসেজ]",
  cooldowns: 10
};

module.exports.run = async function({ api, event, args }) {
  const { threadID, messageID } = event;

  try {
    // গ্রুপের তথ্য এবং মেম্বার লিস্ট সংগ্রহ
    const threadInfo = await api.getThreadInfo(threadID);
    const participantIDs = threadInfo.participantIDs;
    const userInfo = threadInfo.userInfo;

    let inputMessage = args.join(" ") || "সবাইকে মেনশন করা হয়েছে!";
    let body = `📢 ${inputMessage}\n\n`;
    let mentions = [];

    // লুপের মাধ্যমে একটার পর একটা নাম সাজানো
    for (let id of participantIDs) {
      // বটের নিজের আইডি এবং যে কমান্ড দিচ্ছে তাকে মেনশন থেকে বাদ দিতে চাইলে এখানে লজিক দেওয়া যায়
      if (id == api.getCurrentUserID()) continue;

      // মেম্বারের নাম খুঁজে বের করা
      let user = userInfo.find(u => u.id == id);
      let name = user ? user.name : "Facebook User";
      
      let start = body.length;
      body += `👤 ${name}\n`; // একটার পর একটা নাম সিরিয়াল হচ্ছে
      
      mentions.push({
        tag: name,
        id: id,
        fromIndex: start + 2 // নামের আগে ইমোজি ও স্পেসের জন্য +২
      });
    }

    return api.sendMessage({
      body: body,
      mentions: mentions
    }, threadID, messageID);

  } catch (err) {
    console.error(err);
    return api.sendMessage("দুঃখিত, বড় গ্রুপ হওয়ার কারণে নামগুলো লোড করা সম্ভব হয়নি।", threadID, messageID);
  }
};

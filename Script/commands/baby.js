const axios = require("axios");

module.exports.config = {
    name: "baby",
    version: "1.1.0",
    hasPermssion: 0,
    credits: "Gemini",
    description: "AI chat with multiple triggers",
    commandCategory: "chat",
    usages: "[text]",
    cooldowns: 2,
    prefix: false
};

module.exports.run = async function ({ api, event, args, Users }) {
    const { threadID, messageID, senderID } = event;
    const query = args.join(" ");
    const name = await Users.getNameUser(senderID);

    if (!query) return api.sendMessage("হুম বলো জান, আমি শুনতেছি! 😘", threadID, messageID);

    try {
        // এখানে একটি পাবলিক ও সচল API ব্যবহার করা হয়েছে
        const res = await axios.get(`https://api.simsimi.net/v2/?text=${encodeURIComponent(query)}&lc=bn`);
        const reply = res.data.success;
        
        return api.sendMessage(reply, threadID, messageID);
    } catch (error) {
        return api.sendMessage("❌ আমার সার্ভারে একটু সমস্যা হচ্ছে সোনা, পরে ট্রাই করো।", threadID, messageID);
    }
};

module.exports.handleEvent = async function ({ api, event }) {
    const { threadID, messageID, body } = event;
    if (!body) return;

    const triggers = ["baby", "bby", "জান", "বাবু"];
    const text = body.toLowerCase();

    if (triggers.some(t => text === t)) {
        const replies = [
            "জি বলো জান! 😍",
            "আমাকে ডাকছো কেন? চুমু খাবা? 💋",
            "হুমম বলো লক্ষ্মীটি...",
            "জানু বলো কি করতে পারি?"
        ];
        const randomReply = replies[Math.floor(Math.random() * replies.length)];
        
        // টাইপিং ইফেক্ট
        api.sendTypingIndicator(threadID);
        setTimeout(() => {
            api.sendMessage(randomReply, threadID, messageID);
        }, 2000);
    }
};

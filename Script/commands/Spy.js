const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports.config = {
    name: "spy",
    version: "8.0.0",
    hasPermssion: 0,
    credits: "Saim",
    description: "API ভিত্তিক প্রিমিয়াম স্পাই কার্ড (No Canvas Error).",
    commandCategory: "utility",
    usages: "[mention/reply/uid]",
    cooldowns: 5
};

module.exports.run = async function ({ api, event, args, Users, Currencies }) {
    const { threadID, messageID, senderID, mentions, type, messageReply } = event;

    try {
        let targetID;
        if (Object.keys(mentions).length > 0) targetID = Object.keys(mentions)[0];
        else if (type == "message_reply") targetID = messageReply.senderID;
        else targetID = args[0] && !isNaN(args[0]) ? args[0] : senderID;

        // লোডিং মেসেজ
        await api.sendMessage("🛰️ আপনার ইউনিক ৩ডি কার্ড সার্ভার থেকে তৈরি হচ্ছে...", threadID, messageID);

        // ডাটা সংগ্রহ
        const name = (await Users.getNameUser(targetID)) || "User";
        const money = (await Currencies.getData(targetID)).money || 0;
        const res = await axios.get(`https://graph.facebook.com/${targetID}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa059ef6e40a7d7d563931e233`, { responseType: 'arraybuffer' });
        
        // এটি একটি থার্ড পার্টি API ব্যবহার করবে যা হুবহু আপনার স্ক্রিনশটের মতো কার্ড বানিয়ে দেবে
        // আপনার সার্ভারে canvas না থাকলেও এটি কাজ করবে
        const imageUrl = `https://api.saimx.repl.co/spycard?name=${encodeURIComponent(name)}&uid=${targetID}&money=${money}&id=${targetID}`;

        const callback = () => {
            api.sendMessage({
                body: `✅ এখানে আপনার স্পাই কার্ড: ${name}`,
                attachment: fs.createReadStream(__dirname + "/cache/spy_card.png")
            }, threadID, () => fs.unlinkSync(__dirname + "/cache/spy_card.png"), messageID);
        };

        const imageRes = await axios.get(imageUrl, { responseType: 'arraybuffer' });
        fs.writeFileSync(__dirname + "/cache/spy_card.png", Buffer.from(imageRes.data, 'utf-8'));
        return callback();

    } catch (err) {
        console.error(err);
        return api.sendMessage("❌ সার্ভার বর্তমানে ব্যস্ত আছে, দয়া করে একটু পর চেষ্টা করুন।", threadID, messageID);
    }
};

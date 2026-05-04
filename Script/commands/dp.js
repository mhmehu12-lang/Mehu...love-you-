const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports.config = {
    name: "dp",
    aliases: ["cdp", "coupledp"],
    version: "3.4", // ভার্সন আপডেট করা হলো
    hasPermssion: 0,
    credits: "Md Hamim",
    description: "Get random boy & girl matching couple DP",
    commandCategory: "love",
    usages: "[list]",
    cooldowns: 5
};

module.exports.run = async function ({ api, event, args }) {
    const { threadID, messageID } = event;

    try {
        api.setMessageReaction("⏳", messageID, () => {}, true);

        // API ফেচ করা
        const baseRes = await axios.get(
            "https://raw.githubusercontent.com/goatbotnx/Sexy-nx2.0Updated/refs/heads/main/nx-apis.json"
        );

        const cdpBase = baseRes.data.cdp;
        if (!cdpBase) {
            return api.setMessageReaction("❌", messageID, () => {}, true);
        }

        // লিস্ট চেক করা
        if (args[0] && args[0].toLowerCase() === "list") {
            const res = await axios.get(`${cdpBase}/cdp/list`);
            const { total_cdp } = res.data;

            api.setMessageReaction("✅", messageID, () => {}, true);
            return api.sendMessage(
                `📂 𝐂𝐨𝐮𝐩𝐥𝐞 𝐃𝐏 𝐋𝐢𝐛𝐫𝐚𝐫𝐲\n💑 𝐓𝐨𝐭𝐚𝐥 𝐏𝐚𝐢𝐫𝐬 : ${total_cdp}\n🌬️ 𝐑𝐞𝐚𝐝𝐲 𝐓𝐨 𝐔𝐬𝐞\n\n✨ 𝐓𝐲𝐩𝐞 : cdp`,
                threadID
            );
        }

        // কাপল ডিপি ফেচ করা
        const res = await axios.get(`${cdpBase}/cdp`);
        const pair = res.data.pair;

        if (!pair || !pair.boy || !pair.girl) {
            return api.setMessageReaction("❌", messageID, () => {}, true);
        }

        // ছবি সেভ করার জন্য পাথ তৈরি (ফাইলের লোকেশনে cache ফোল্ডার থাকতে হবে অথবা তৈরি হবে)
        const boyPath = path.join(__dirname, "cache", `boy_${messageID}.jpg`);
        const girlPath = path.join(__dirname, "cache", `girl_${messageID}.jpg`);

        // ছবি ডাউনলোড করার ফাংশন
        const downloadImage = async (url, destPath) => {
            const response = await axios({
                url: url,
                method: "GET",
                responseType: "stream",
                headers: {
                    "User-Agent": "Mozilla/5.0",
                    Referer: "https://imgur.com/"
                }
            });
            const writer = fs.createWriteStream(destPath);
            response.data.pipe(writer);
            return new Promise((resolve, reject) => {
                writer.on("finish", resolve);
                writer.on("error", reject);
            });
        };

        // দুটি ছবি ডাউনলোড হচ্ছে
        await downloadImage(pair.boy, boyPath);
        await downloadImage(pair.girl, girlPath);

        // ছবি পাঠানো হচ্ছে
        return api.sendMessage({
            body: `🎀 h̷e̷r̷e̷ i̷s̷ y̷o̷u̷r̷ c̷d̷p̷ 🌬️\n💞 𝐁𝐨𝐲 & 𝐆𝐢𝐫𝐥 𝐏𝐚𝐢𝐫`,
            attachment: [
                fs.createReadStream(boyPath),
                fs.createReadStream(girlPath)
            ]
        }, threadID, () => {
            // পাঠানো হয়ে গেলে স্টোরেজ বাঁচানোর জন্য ছবিগুলো ডিলিট করা
            fs.unlinkSync(boyPath);
            fs.unlinkSync(girlPath);
            api.setMessageReaction("✅", messageID, () => {}, true);
        });

    } catch (err) {
        console.error("DP Error:", err);
        api.sendMessage("❌ কোন একটি সমস্যা হয়েছে বা API অফলাইন আছে!", threadID);
        api.setMessageReaction("❌", messageID, () => {}, true);
    }
};
